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
    
    // Dominio Oficial de Producción (Eliminando completamente localhost)
    const officialDomain = 'https://app.aulacore.org';
    const requestOrigin = request.headers.get('origin');
    const baseUrl = (requestOrigin && !requestOrigin.includes('localhost')) ? requestOrigin : officialDomain;

    // 1. Validar autenticación de sesión
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'No autorizado. Debe iniciar sesión para invitar clientes.' },
        { status: 401 }
      );
    }

    const { email, name, phone, institutionId, institutionName } = await request.json();

    if (!email || !institutionId) {
      return NextResponse.json(
        { error: 'El correo electrónico y el ID de la institución son obligatorios.' },
        { status: 400 }
      );
    }

    console.log(`[Invite Client Service] Registrando e invitando a: ${email} para institución: ${institutionName} (${institutionId})`);

    let targetUser: any = null;
    let supabaseInviteResponse: any = null;
    let inviteLink: string | null = null;
    let authAction = 'invited';

    const activeClient = (supabaseUrl && serviceRoleKey)
      ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
      : supabase;

    // A. Actualizar rector_name en la institución
    if (name) {
      await activeClient
        .from('institutions')
        .update({ rector_name: name })
        .eq('id', institutionId);
    }

    // B. Buscar o invitar al usuario mediante Supabase Auth
    const targetRedirectUrl = `${baseUrl}/login?email=${encodeURIComponent(email)}&inst=${institutionId}`;

    if (supabaseUrl && serviceRoleKey) {
      const adminSupabase = activeClient;
      try {
        const inviteRes = await adminSupabase.auth.admin.inviteUserByEmail(email, {
          redirectTo: targetRedirectUrl,
          data: {
            name: name || 'Rector Institucional',
            role: 'rector',
            institution_id: institutionId
          }
        });

        supabaseInviteResponse = {
          data: inviteRes.data,
          error: inviteRes.error
        };

        if (inviteRes.error) {
          console.warn('[Invite Client Service] Supabase inviteUserByEmail aviso:', inviteRes.error.message);
          const { data: userList } = await adminSupabase.auth.admin.listUsers();
          const existing = userList?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
          if (existing) {
            targetUser = existing;
            authAction = 'existing_user_linked';
            
            const { data: genLinkData } = await adminSupabase.auth.admin.generateLink({
              type: 'invite',
              email: email,
              options: { redirectTo: targetRedirectUrl }
            });
            inviteLink = genLinkData?.properties?.action_link || null;
          }
        } else if (inviteRes.data?.user) {
          targetUser = inviteRes.data.user;
        }
      } catch (err: any) {
        console.error('[Invite Client Service] Excepción en admin.inviteUserByEmail:', err);
      }
    }

    // C. Garantizar existencia de perfil en public.profiles y rol en user_roles
    if (targetUser?.id) {
      const nameParts = (name || 'Rector Institucional').split(' ');
      const firstName = nameParts[0] || 'Rector';
      const lastName = nameParts.slice(1).join(' ') || 'Institucional';

      await activeClient
        .from('profiles')
        .upsert({
          id: targetUser.id,
          first_name: firstName,
          last_name: lastName
        }, { onConflict: 'id' });

      const { error: roleErr } = await activeClient
        .from('user_roles')
        .upsert({
          user_id: targetUser.id,
          institution_id: institutionId,
          role: 'rector'
        }, { onConflict: 'user_id,institution_id,role' });

      if (roleErr) {
        console.warn('[Invite Client Service] Error asignando rol rector en user_roles:', roleErr.message);
      } else {
        console.log(`[Invite Client Service] Rol rector asignado exitosamente para user_id: ${targetUser.id}`);
      }
    }

    // D. Despacho de Correo Electrónico Institucional Personalizado (Resend / Mail Provider)
    const resendApiKey = process.env.RESEND_API_KEY;
    const senderEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const finalInviteUrl = inviteLink || targetRedirectUrl;

    let resendStatus: any = {
      configured: false,
      reason: 'RESEND_API_KEY no configurado en servidor. Invitación procesada vía Supabase Auth.'
    };

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
            subject: `🚀 ¡Bienvenido a AulaCore! Invitación Oficial de Rectoría para ${institutionName || 'tu Colegio'}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
                
                <!-- Encabezado Corporativo AulaCore -->
                <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4f46e5 100%); padding: 36px 32px; text-align: center; color: #ffffff;">
                  <div style="display: inline-block; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 9999px; px-4 py-1; font-size: 10px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px; color: #a5b4fc; padding: 4px 14px;">
                    AULACORE ENTERPRISE SAAS
                  </div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff;">
                    Invitación Oficial de Rectoría
                  </h1>
                  <p style="margin: 8px 0 0 0; font-size: 13px; color: #c7d2fe; font-weight: 500;">
                    Plataforma de Gestión Académica & Gobierno Institucional
                  </p>
                </div>
                
                <!-- Cuerpo del Correo -->
                <div style="padding: 36px 32px; color: #334155; line-height: 1.6;">
                  <p style="margin-top: 0; font-size: 16px; font-weight: 700; color: #0f172a;">
                    Estimado(a) <strong>${name || 'Rector(a)'}</strong>,
                  </p>
                  
                  <p style="font-size: 14px; color: #475569;">
                    Nos complace darle la bienvenida oficial a <strong>AulaCore Enterprise</strong>. Tu institución educativa <strong>${institutionName || 'Tu Colegio'}</strong> ha sido aprovisionada y activada exitosamente en nuestro ecosistema en la nube.
                  </p>

                  <!-- Tarjeta de Credenciales -->
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 28px 0;">
                    <div style="font-size: 10px; font-weight: 800; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">
                      DATOS DE ACTIVACIÓN DE CUENTA RECTORÍA
                    </div>
                    <div style="font-size: 13px; margin-bottom: 6px; color: #1e293b;">
                      <strong>Institución:</strong> ${institutionName || 'Asignada'}
                    </div>
                    <div style="font-size: 13px; margin-bottom: 6px; color: #1e293b;">
                      <strong>Correo Oficial:</strong> <span style="color: #4f46e5; font-weight: 700;">${email}</span>
                    </div>
                    <div style="font-size: 13px; color: #1e293b;">
                      <strong>Rol Asignado:</strong> Rector / Administrador General
                    </div>
                  </div>

                  <!-- Botón de Acción Principal -->
                  <div style="text-align: center; margin: 36px 0;">
                    <a href="${finalInviteUrl}" target="_blank" style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; padding: 16px 36px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none; display: inline-block; box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4); letter-spacing: 0.02em;">
                      Activar mi cuenta e Ingresar al Colegio
                    </a>
                  </div>

                  <!-- Pasos a Seguir -->
                  <div style="border-top: 1px solid #f1f5f9; pt-6; margin-top: 28px; padding-top: 20px;">
                    <h4 style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
                      ¿Cómo completar su activación?
                    </h4>
                    <ol style="font-size: 13px; color: #64748b; padding-left: 20px; margin: 0;">
                      <li style="margin-bottom: 6px;">Haga clic en el botón <strong>"Activar mi cuenta"</strong> arriba.</li>
                      <li style="margin-bottom: 6px;">Establezca su contraseña de acceso confidencial.</li>
                      <li>Ingrese a su <strong>Portal Rector</strong> para gestionar docentes, alumnos y sedes.</li>
                    </ol>
                  </div>

                  <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
                    Si no solicitó esta cuenta o requiere soporte inmediato, comuníquese con mesa de ayuda en <a href="https://app.aulacore.org" style="color: #4f46e5; text-decoration: none;">app.aulacore.org</a>.
                  </div>
                </div>

                <!-- Pie de página -->
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; font-weight: 600;">
                  © ${new Date().getFullYear()} AulaCore Enterprise Solutions • Tecnología de Gestión Institucional 360°
                </div>
              </div>
            `
          })
        });

        const resendJson = await resendRes.json();
        resendStatus = {
          configured: true,
          httpStatus: resendRes.status,
          responseBody: resendJson,
          error: resendRes.ok ? null : resendJson
        };
      } catch (rErr: any) {
        resendStatus = {
          configured: true,
          error: rErr.message
        };
      }
    }

    return NextResponse.json({
      success: true,
      authAction,
      user: targetUser ? {
        id: targetUser.id,
        email: targetUser.email,
        email_confirmed_at: targetUser.email_confirmed_at || null,
        created_at: targetUser.created_at || null
      } : {
        id: 'AUTO-PROVISIONED-RECTOR',
        email,
        email_confirmed_at: null,
        created_at: new Date().toISOString()
      },
      officialDomain,
      inviteUrl: finalInviteUrl,
      supabaseInviteResponse,
      resendStatus,
      institutionId
    });

  } catch (error: any) {
    console.error('[Invite Client Service] Error interno:', error);
    return NextResponse.json(
      { error: error.message || 'Error procesando el registro e invitación del cliente.' },
      { status: 500 }
    );
  }
}
