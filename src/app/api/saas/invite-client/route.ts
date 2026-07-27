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
    
    // Dominio Oficial de Producción
    const officialDomain = 'https://app.aulacore.org';
    const requestOrigin = request.headers.get('origin');
    const baseUrl = (requestOrigin && !requestOrigin.includes('localhost')) ? requestOrigin : officialDomain;

    // 1. Validar autenticación de sesión de la petición
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

    console.log(`[Invite Client Service - Flow AulaCore] Aprovisionando cliente: ${email} | Colegio: ${institutionName} (${institutionId})`);

    let targetUser: any = null;
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

    // B. Crear o Vincular usuario en auth.users y generar enlace de invitación (SIN ENVIAR CORREO DE SUPABASE)
    const targetRedirectUrl = `${baseUrl}/auth/complete-invitation?email=${encodeURIComponent(email)}&inst=${institutionId}`;

    if (supabaseUrl && serviceRoleKey) {
      const adminSupabase = activeClient;
      try {
        // 1. Buscar si el usuario ya existe en auth.users
        const { data: userList } = await adminSupabase.auth.admin.listUsers();
        const existing = userList?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (existing) {
          targetUser = existing;
          authAction = 'existing_user_linked';
        } else {
          // Crear usuario directamente sin enviar correo nativo de Supabase Auth
          const { data: newUserRes, error: createErr } = await adminSupabase.auth.admin.createUser({
            email,
            email_confirm: false,
            user_metadata: {
              name: name || 'Rector Institucional',
              role: 'rector',
              institution_id: institutionId
            }
          });

          if (!createErr && newUserRes?.user) {
            targetUser = newUserRes.user;
          } else {
            console.warn('[Invite Client Service] Aviso creando usuario directo:', createErr?.message);
          }
        }

        // 2. Generar el enlace seguro de activación de Supabase Auth (Sin enviar correo nativo)
        const { data: genLinkData, error: linkErr } = await adminSupabase.auth.admin.generateLink({
          type: 'invite',
          email: email,
          options: { redirectTo: targetRedirectUrl }
        });

        if (genLinkData?.properties?.action_link) {
          inviteLink = genLinkData.properties.action_link;
        } else if (linkErr) {
          console.warn('[Invite Client Service] Error generando enlace de invitación:', linkErr.message);
          // Fallback a enlace de recuperación si ya existía
          const { data: recoveryData } = await adminSupabase.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: { redirectTo: targetRedirectUrl }
          });
          inviteLink = recoveryData?.properties?.action_link || null;
        }
      } catch (err: any) {
        console.error('[Invite Client Service] Excepción en gestión de usuarios Supabase Admin:', err);
      }
    }

    // C. Garantizar perfil en public.profiles y rol en public.user_roles (FK Safety)
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
        console.warn('[Invite Client Service] Error en user_roles:', roleErr.message);
      }
    }

    // D. Despacho EXCLUSIVO del Correo HTML Corporativo de AulaCore (Resend / Custom SMTP)
    const resendApiKey = process.env.RESEND_API_KEY;
    const senderEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const finalInviteUrl = inviteLink || targetRedirectUrl;

    let emailSent = false;
    let resendStatus: any = {
      configured: false,
      reason: 'RESEND_API_KEY no configurado en entorno.'
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
            subject: `Bienvenido a AulaCore | Activa tu cuenta institucional`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
                
                <!-- Encabezado Corporativo AulaCore -->
                <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4f46e5 100%); padding: 40px 32px; text-align: center; color: #ffffff;">
                  <div style="display: inline-block; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 9999px; font-size: 10px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #a5b4fc; padding: 5px 16px; margin-bottom: 14px;">
                    AULACORE ENTERPRISE
                  </div>
                  <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff;">
                    Bienvenido a AulaCore Enterprise
                  </h1>
                  <p style="margin: 8px 0 0 0; font-size: 14px; color: #c7d2fe; font-weight: 500;">
                    Su institución ya está lista para comenzar su transformación digital.
                  </p>
                </div>
                
                <!-- Cuerpo del Correo -->
                <div style="padding: 36px 32px; color: #334155; line-height: 1.6;">
                  <p style="margin-top: 0; font-size: 16px; font-weight: 700; color: #0f172a;">
                    Hola, ${name || 'Rector'} 👋
                  </p>
                  
                  <p style="font-size: 14px; color: #475569;">
                    Tu institución <strong>${institutionName}</strong> ha sido creada correctamente y ya puedes comenzar la configuración inicial en nuestra infraestructura en la nube.
                  </p>

                  <!-- Tarjeta de Ficha Institucional -->
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; margin: 28px 0;">
                    <div style="font-size: 10px; font-weight: 800; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 12px;">
                      DATOS DE TU CUENTA INSTITUCIONAL
                    </div>
                    <div style="font-size: 13px; margin-bottom: 8px; color: #1e293b;">
                      <strong>Institución Educativa:</strong> ${institutionName}
                    </div>
                    <div style="font-size: 13px; margin-bottom: 8px; color: #1e293b;">
                      <strong>Correo del Rector:</strong> <span style="color: #4f46e5; font-weight: 700;">${email}</span>
                    </div>
                    <div style="font-size: 13px; color: #1e293b;">
                      <strong>Rol Asignado:</strong> Rector / Administrador General
                    </div>
                  </div>

                  <!-- Beneficios de la Plataforma -->
                  <div style="margin: 28px 0; padding: 20px; background-color: #faf5ff; border: 1px solid #f3e8ff; border-radius: 16px;">
                    <div style="font-size: 11px; font-weight: 800; color: #7e22ce; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">
                      ✨ Beneficios de tu Plataforma AulaCore:
                    </div>
                    <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #581c87; line-height: 1.7;">
                      <li><strong>Consola 360° de Rectoría:</strong> Indicadores académicos y de convivencia en tiempo real.</li>
                      <li><strong>Gestión de Planta Docente:</strong> Asignación académica y planillas digitales.</li>
                      <li><strong>Matrícula & SIMAT:</strong> Registro y seguimiento escolar centralizado.</li>
                      <li><strong>Analítica Predictiva de IA:</strong> Alertas tempranas de deserción y rendimiento.</li>
                    </ul>
                  </div>

                  <!-- Botón de Acción Principal -->
                  <div style="text-align: center; margin: 36px 0;">
                    <a href="${finalInviteUrl}" target="_blank" style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; padding: 16px 36px; border-radius: 14px; font-weight: 800; font-size: 15px; text-decoration: none; display: inline-block; box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4); letter-spacing: 0.02em;">
                      Activar mi cuenta
                    </a>
                    <p style="font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 12px; margin-bottom: 0;">
                      🔒 Por seguridad, este enlace es personal y tiene una vigencia limitada.
                    </p>
                  </div>

                  <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">
                    Al hacer clic en <strong>"Activar mi cuenta"</strong> podrás establecer tu contraseña privada e ingresar directamente al Portal Rector de <strong>${institutionName}</strong>.
                  </p>
                </div>

                <!-- Pie de página corporativo -->
                <div style="background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 12px; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0;">
                  <div style="font-weight: 800; color: #0f172a; font-size: 13px; margin-bottom: 2px;">AulaCore Enterprise</div>
                  <div style="color: #64748b; font-size: 11px; margin-bottom: 12px;">Plataforma de Gestión Académica Inteligente</div>
                  <div style="margin-bottom: 8px;">
                    <a href="https://www.aulacore.org" style="color: #4f46e5; text-decoration: none; font-weight: 700; margin-right: 12px;">www.aulacore.org</a>
                    <a href="https://app.aulacore.org" style="color: #4f46e5; text-decoration: none; font-weight: 700;">app.aulacore.org</a>
                  </div>
                  <div style="color: #94a3b8; font-size: 11px; font-weight: 500;">© ${new Date().getFullYear()} AulaCore</div>
                </div>
              </div>
            `
          })
        });

        const resendJson = await resendRes.json();
        emailSent = resendRes.ok;
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
      emailSent,
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
