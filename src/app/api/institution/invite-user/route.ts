import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lpfblcidibnepwempwzs.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

    const officialDomain = 'https://app.aulacore.org';
    const requestOrigin = request.headers.get('origin');
    const baseUrl = (requestOrigin && !requestOrigin.includes('localhost')) ? requestOrigin : (requestOrigin || officialDomain);

    // 1. Validar autenticación de sesión del actor
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });

    const { data: { user: actorUser }, error: actorAuthError } = await supabase.auth.getUser();
    if (actorAuthError || !actorUser) {
      return NextResponse.json(
        { error: 'No autorizado. Debe iniciar sesión para invitar miembros.' },
        { status: 401 }
      );
    }

    const { email, name, role, institutionId } = await request.json();

    if (!email || !institutionId || !role) {
      return NextResponse.json(
        { error: 'El correo electrónico, el rol y la institución son obligatorios.' },
        { status: 400 }
      );
    }

    // 2. Cliente administrativo para validaciones seguras y provisión de auth.users
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta (service_role no configurado).' },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 3. Validar existencia de la institución
    const { data: instData, error: instError } = await adminSupabase
      .from('institutions')
      .select('id, name')
      .eq('id', institutionId)
      .maybeSingle();

    if (instError || !instData) {
      return NextResponse.json(
        { error: 'La institución especificada no existe.' },
        { status: 404 }
      );
    }

    // 4. Validar permisos del actor (Super Admin o Rector de la institución)
    const { data: actorRoles, error: rolesError } = await adminSupabase
      .from('user_roles')
      .select('role, institution_id')
      .eq('user_id', actorUser.id);

    if (rolesError || !actorRoles) {
      return NextResponse.json(
        { error: 'Error al verificar roles del usuario solicitante.' },
        { status: 500 }
      );
    }

    const isSuperAdmin = actorRoles.some((r: any) => r.role === 'super_admin');
    const isRectorOfInst = actorRoles.some((r: any) => r.role === 'rector' && r.institution_id === institutionId);

    if (!isSuperAdmin && !isRectorOfInst) {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo el Rector de la institución o un Super Admin pueden invitar miembros a este colegio.' },
        { status: 403 }
      );
    }

    // 5. Restricciones estrictas sobre el rol a invitar
    if (!isSuperAdmin) {
      // Rector no puede invitar Super Admin ni otro Rector
      if (role === 'super_admin' || role === 'rector') {
        return NextResponse.json(
          { error: 'Un Rector no tiene autorización para asignar los roles de Rector o Super Administrador.' },
          { status: 403 }
        );
      }
    }

    const allowedRoles = ['rector', 'coordinador', 'director_grupo', 'docente', 'secretaria', 'padre_familia', 'estudiante'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: `El rol '${role}' no es un rol institucional permitido.` },
        { status: 400 }
      );
    }

    console.log(`[Invite User Service] Actor: ${actorUser.email} invitando a: ${email} con rol: ${role} en ${instData.name} (${institutionId})`);

    let targetUser: any = null;
    let authAction = 'invited';

    // 6. Buscar si el usuario ya existe en auth.users
    const { data: userList } = await adminSupabase.auth.admin.listUsers();
    const existingUser = userList?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase().trim());

    if (existingUser) {
      targetUser = existingUser;
      authAction = 'existing_user_linked';
    } else {
      // Crear nuevo usuario sin enviar correo genérico de Supabase
      const { data: newUserRes, error: createErr } = await adminSupabase.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        email_confirm: false,
        user_metadata: {
          name: name || 'Miembro Institucional',
          role: role,
          institution_id: institutionId,
        },
      });

      if (createErr || !newUserRes?.user) {
        console.error('[Invite User Service] Error creando usuario en Supabase Auth:', createErr);
        return NextResponse.json(
          { error: `Error creando cuenta de usuario: ${createErr?.message || 'Error desconocido'}` },
          { status: 500 }
        );
      }
      targetUser = newUserRes.user;
    }

    // 7. Asegurar registro en public.profiles
    const nameParts = (name || 'Miembro Institucional').trim().split(' ');
    const firstName = nameParts[0] || 'Miembro';
    const lastName = nameParts.slice(1).join(' ') || 'Institucional';

    await adminSupabase
      .from('profiles')
      .upsert({
        id: targetUser.id,
        first_name: firstName,
        last_name: lastName,
      }, { onConflict: 'id' });

    // 8. Asignar el rol institucional de manera segura mediante la RPC assign_institution_role
    // Se invoca con el cliente de sesión autenticado para que la auditoría en PostgreSQL capture al actor real
    const { data: rpcRes, error: rpcError } = await supabase.rpc('assign_institution_role', {
      p_user_id: targetUser.id,
      p_institution_id: institutionId,
      p_role: role,
    });

    if (rpcError) {
      console.error('[Invite User Service] Error al asignar rol mediante RPC:', rpcError);
      return NextResponse.json(
        { error: `Error al registrar rol institucional: ${rpcError.message}` },
        { status: 500 }
      );
    }

    // 9. Generar enlace seguro de activación de cuenta
    const targetRedirectUrl = `${baseUrl}/auth/establecer-clave?email=${encodeURIComponent(email)}&inst=${institutionId}`;
    let inviteLink: string | null = null;

    const { data: genLinkData, error: linkErr } = await adminSupabase.auth.admin.generateLink({
      type: 'invite',
      email: email.toLowerCase().trim(),
      options: { redirectTo: targetRedirectUrl },
    });

    if (genLinkData?.properties?.action_link) {
      inviteLink = genLinkData.properties.action_link;
    } else if (linkErr) {
      console.warn('[Invite User Service] Fallback a recovery link:', linkErr.message);
      const { data: recoveryData } = await adminSupabase.auth.admin.generateLink({
        type: 'recovery',
        email: email.toLowerCase().trim(),
        options: { redirectTo: targetRedirectUrl },
      });
      inviteLink = recoveryData?.properties?.action_link || null;
    }

    const finalInviteUrl = inviteLink || targetRedirectUrl;

    // 10. Despachar Correo HTML Corporativo vía Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const senderEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    let emailSent = false;
    let resendStatus: any = { configured: false };

    const ROLE_LABELS: Record<string, string> = {
      rector: 'Rector / Directivo Principal',
      coordinador: 'Coordinador Académico / Convivencial',
      director_grupo: 'Director de Grupo',
      docente: 'Docente de Aula',
      secretaria: 'Secretario Académico',
      padre_familia: 'Padre de Familia / Acudiente',
      estudiante: 'Estudiante',
    };

    const roleLabel = ROLE_LABELS[role] || role;

    if (resendApiKey && resendApiKey !== 're_xxxxxxxxx') {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `AulaCore <${senderEmail}>`,
            to: [email],
            subject: `Invitación a formar parte de ${instData.name} en AulaCore`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4f46e5 100%); padding: 36px 32px; text-align: center; color: #ffffff;">
                  <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #a5b4fc; margin-bottom: 8px;">
                    INVITACIÓN INSTITUCIONAL
                  </div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff;">
                    ${instData.name}
                  </h1>
                </div>

                <div style="padding: 32px; color: #334155; line-height: 1.6;">
                  <p style="font-size: 16px; font-weight: 700; color: #0f172a;">
                    Hola, ${name || 'Colega'} 👋
                  </p>
                  <p style="font-size: 14px; color: #475569;">
                    Has sido invitado a integrarte al equipo institucional de <strong>${instData.name}</strong> en la plataforma AulaCore con el rol de <strong>${roleLabel}</strong>.
                  </p>

                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin: 24px 0;">
                    <div style="font-size: 11px; font-weight: 800; color: #4f46e5; text-transform: uppercase; margin-bottom: 8px;">
                      DATOS DE ACCESO
                    </div>
                    <div style="font-size: 13px; color: #1e293b; margin-bottom: 4px;">
                      <strong>Institución:</strong> ${instData.name}
                    </div>
                    <div style="font-size: 13px; color: #1e293b; margin-bottom: 4px;">
                      <strong>Correo:</strong> ${email}
                    </div>
                    <div style="font-size: 13px; color: #1e293b;">
                      <strong>Rol Asignado:</strong> ${roleLabel}
                    </div>
                  </div>

                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${finalInviteUrl}" target="_blank" style="background: #4f46e5; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block;">
                      Activar mi cuenta y establecer contraseña
                    </a>
                  </div>

                  <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                    Este enlace es seguro y de uso personal.
                  </p>
                </div>
              </div>
            `,
          }),
        });

        const resendJson = await resendRes.json();
        emailSent = resendRes.ok;
        resendStatus = { configured: true, ok: resendRes.ok, detail: resendJson };
      } catch (rErr: any) {
        resendStatus = { configured: true, error: rErr.message };
      }
    }

    return NextResponse.json({
      success: true,
      authAction,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: `${firstName} ${lastName}`.trim(),
        role,
        institution_id: institutionId,
      },
      inviteUrl: finalInviteUrl,
      emailSent,
      resendStatus,
    });

  } catch (error: any) {
    console.error('[Invite User Service] Error no controlado:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno en el servidor.' },
      { status: 500 }
    );
  }
}
