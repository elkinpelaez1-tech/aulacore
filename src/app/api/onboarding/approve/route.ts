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

    // 1. Cliente con cookies para validar sesión del usuario aprobador (Coordinador / Rector)
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });

    // Validar autenticación de sesión del actor
    const { data: { user: actorUser }, error: actorAuthError } = await supabase.auth.getUser();
    if (actorAuthError || !actorUser) {
      return NextResponse.json(
        { error: 'No autorizado. Debe iniciar sesión.' },
        { status: 401 }
      );
    }

    const { onboardingId, institutionId } = await request.json();

    if (!onboardingId || !institutionId) {
      return NextResponse.json(
        { error: 'onboardingId e institutionId son obligatorios.' },
        { status: 400 }
      );
    }

    // 2. Cliente administrativo (service_role) para generateLink y consultas seguras
    const adminSupabase = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : null;

    // 3. Obtener la solicitud de onboarding y la institución
    const clientToQuery = adminSupabase || supabase;
    const { data: onboarding, error: fetchError } = await clientToQuery
      .from('teacher_onboardings')
      .select('*')
      .eq('id', onboardingId)
      .single();

    if (fetchError || !onboarding) {
      return NextResponse.json(
        { error: 'Solicitud de onboarding no encontrada.' },
        { status: 404 }
      );
    }

    // Validar que la solicitud pertenezca a la institución especificada
    if (onboarding.institution_id !== institutionId) {
      return NextResponse.json(
        { error: 'La solicitud de onboarding no pertenece a la institución especificada.' },
        { status: 403 }
      );
    }

    // Validar roles y permisos del usuario aprobador (Super Admin, Rector o Coordinador de la institución)
    const { data: actorRoles, error: rolesError } = await clientToQuery
      .from('user_roles')
      .select('role, institution_id')
      .eq('user_id', actorUser.id);

    if (rolesError || !actorRoles || actorRoles.length === 0) {
      return NextResponse.json(
        { error: 'Acceso denegado. No se pudieron verificar los roles del usuario aprobador.' },
        { status: 403 }
      );
    }

    const isSuperAdmin = actorRoles.some((r: any) => r.role === 'super_admin');
    const isAuthorizedDirectivo = actorRoles.some(
      (r: any) =>
        (r.role === 'coordinador' || r.role === 'rector') &&
        r.institution_id === onboarding.institution_id
    );

    if (!isSuperAdmin && !isAuthorizedDirectivo) {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo directivos (Coordinador o Rector) de esta institución o un Super Admin pueden aprobar solicitudes.' },
        { status: 403 }
      );
    }

    const { data: instData } = await clientToQuery
      .from('institutions')
      .select('id, name')
      .eq('id', institutionId)
      .maybeSingle();

    const institutionName = instData?.name || 'Instituto Profes';

    // 4. Determinar si el usuario ya existe en Supabase Auth (CASO 1 vs CASO 2)
    let isExistingUser = false;
    let existingUserId: string | null = null;

    if (adminSupabase) {
      try {
        const { data: userList } = await adminSupabase.auth.admin.listUsers();
        const found = userList?.users?.find(
          (u: any) => u.email?.toLowerCase() === onboarding.email.toLowerCase().trim()
        );
        if (found) {
          isExistingUser = true;
          existingUserId = found.id;
        }
      } catch (err) {
        console.warn('[Onboarding Approve] Error consultando listUsers:', err);
      }
    }

    // 5. Ejecutar el RPC de aprobación (approve_teacher_onboarding_rpc)
    // Usamos un token aleatorio no expuesto para cumplir con el parámetro p_temp_password del RPC sin usar claves genéricas
    const internalSecuritySecret = crypto.randomUUID() + '-AulacoreSecToken!' + Date.now();
    const { data: approvedUserId, error: rpcError } = await clientToQuery.rpc(
      'approve_teacher_onboarding_rpc',
      {
        p_onboarding_id: onboardingId,
        p_institution_id: institutionId,
        p_temp_password: internalSecuritySecret,
      }
    );

    if (rpcError || !approvedUserId) {
      console.error('[Onboarding Approve] Error en RPC approve_teacher_onboarding_rpc:', rpcError);
      return NextResponse.json(
        { error: rpcError?.message || 'Error al ejecutar RPC de aprobación en el servidor.' },
        { status: 500 }
      );
    }

    // 6. Generación de Enlace Seguro y Despacho según el caso de negocio
    let actionLink = `${baseUrl}/join/act-${onboardingId}`;
    let emailSubject = '';
    let emailMessage = '';
    let emailHtml = '';

    if (!isExistingUser) {
      // -------------------------------------------------------------
      // CASO 1: DOCENTE NUEVO
      // Generar enlace seguro mediante Supabase Admin generateLink()
      // Redirigir a /join/act-[id] que a su vez conecta con /auth/establecer-clave
      // -------------------------------------------------------------
      if (adminSupabase) {
        try {
          const targetRedirectUrl = `${baseUrl}/join/act-${onboardingId}`;
          const { data: genLinkData, error: linkErr } = await adminSupabase.auth.admin.generateLink({
            type: 'invite',
            email: onboarding.email.toLowerCase().trim(),
            options: { redirectTo: targetRedirectUrl },
          });

          if (genLinkData?.properties?.action_link) {
            actionLink = genLinkData.properties.action_link;
          } else if (linkErr) {
            console.warn('[Onboarding Approve] Fallback a recovery link:', linkErr.message);
            const { data: recoveryData } = await adminSupabase.auth.admin.generateLink({
              type: 'recovery',
              email: onboarding.email.toLowerCase().trim(),
              options: { redirectTo: targetRedirectUrl },
            });
            if (recoveryData?.properties?.action_link) {
              actionLink = recoveryData.properties.action_link;
            }
          }
        } catch (linkGenErr) {
          console.warn('[Onboarding Approve] Error generando action_link:', linkGenErr);
        }
      }

      emailSubject = '✨ Bienvenido a AulaCore - Configura tu Acceso Institucional';
      emailMessage = `Estimado(a) ${onboarding.full_name},\n\nTu vinculación docente ha sido aprobada por la Coordinación Académica. Activa tu cuenta institucional y configura tu contraseña personal mediante el siguiente enlace:\n${actionLink}\n\nAtentamente,\nCoordinación Académica - ${institutionName}`;
      emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">¡Bienvenido al equipo docente!</h2>
            <p style="color: #4f46e5; font-weight: bold; font-size: 14px; margin: 0;">${institutionName}</p>
          </div>
          
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Estimado(a) <strong>${onboarding.full_name}</strong>,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">
            Tu vinculación docente ha sido aprobada por la Coordinación Académica. Activa tu cuenta institucional y configura tu contraseña personal mediante el siguiente botón:
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${actionLink}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
              Activar mi cuenta y configurar contraseña
            </a>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.4; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br/>
            <a href="${actionLink}" style="color: #4f46e5; word-break: break-all;">${actionLink}</a>
          </p>
          <div style="margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center;">
            Mensaje institucional de seguridad enviado por AulaCore.
          </div>
        </div>
      `;
    } else {
      // -------------------------------------------------------------
      // CASO 2: CORREO YA EXISTENTE
      // NO modificar contraseña existente, NO enviar contraseñas temporales
      // Mantener credenciales habituales y rol docente asignado en user_roles
      // -------------------------------------------------------------
      const loginUrl = `${baseUrl}/login?email=${encodeURIComponent(onboarding.email)}`;
      actionLink = loginUrl;

      emailSubject = `✨ Vinculación Institucional Aprobada - ${institutionName}`;
      emailMessage = `Estimado(a) ${onboarding.full_name},\n\nTu cuenta institucional de AulaCore ha sido vinculada al equipo docente de ${institutionName}. Ya puedes acceder a tus funciones docentes ingresando con tus credenciales habituales:\n${loginUrl}\n\nAtentamente,\nCoordinación Académica - ${institutionName}`;
      emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Vinculación Institucional Aprobada</h2>
            <p style="color: #4f46e5; font-weight: bold; font-size: 14px; margin: 0;">${institutionName}</p>
          </div>
          
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Estimado(a) <strong>${onboarding.full_name}</strong>,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">
            Tu cuenta de AulaCore ha sido vinculada al equipo docente de <strong>${institutionName}</strong>. Ya puedes acceder a tus funciones docentes ingresando con tus credenciales habituales.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${loginUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
              Acceder a mi Consola Docente
            </a>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.4; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br/>
            <a href="${loginUrl}" style="color: #4f46e5; word-break: break-all;">${loginUrl}</a>
          </p>
          <div style="margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center;">
            Mensaje institucional de seguridad enviado por AulaCore.
          </div>
        </div>
      `;
    }

    // 7. Registro de log de correo y actualización de enlace en DB
    const newEmailLog = {
      id: 'eml-' + crypto.randomUUID().split('-')[0].toUpperCase(),
      sentAt: new Date().toISOString(),
      subject: emailSubject,
      body: emailMessage,
      status: 'Enviado',
    };

    const existingLogs = Array.isArray(onboarding.email_logs) ? onboarding.email_logs : [];
    const updatedLogs = [newEmailLog, ...existingLogs];

    await clientToQuery
      .from('teacher_onboardings')
      .update({
        activation_link: actionLink,
        email_logs: updatedLogs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', onboardingId);

    // 8. Despacho real de correo electrónico vía Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    if (resendApiKey && resendApiKey !== 're_xxxxxxxxx') {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `AulaCore <${resendFromEmail}>`,
            to: [onboarding.email],
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        if (!emailRes.ok) {
          const resendErr = await emailRes.text();
          console.error('[Onboarding Approve] Error despachando correo por Resend:', resendErr);
        }
      } catch (sendErr) {
        console.error('[Onboarding Approve] Excepción al enviar correo:', sendErr);
      }
    }

    return NextResponse.json({
      success: true,
      activationLink: actionLink,
      isNewUser: !isExistingUser,
    });
  } catch (error: any) {
    console.error('[Onboarding Approve] Error general en el servidor:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al aprobar onboarding.' },
      { status: 500 }
    );
  }
}
