import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

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

    let userId: string | null = null;
    let authAction = 'invited';

    // 2. Si tenemos la llave de service_role, creamos o invitamos al usuario en auth.users y vinculamos user_roles
    if (supabaseUrl && serviceRoleKey) {
      const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      // A. Actualizar datos de contacto en la institución (email, rector_name, phone)
      await adminSupabase
        .from('institutions')
        .update({
          email: email,
          rector_name: name || null,
          phone: phone || null
        })
        .eq('id', institutionId);

      // B. Intentar invitar al usuario mediante Supabase Auth
      try {
        const { data: inviteData, error: inviteErr } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
          data: {
            name: name || 'Rector Institucional',
            role: 'rector',
            institution_id: institutionId
          }
        });

        if (inviteErr) {
          console.warn('[Invite Client Service] Advertencia al invitar por correo en Supabase Auth:', inviteErr.message);
          // Si el usuario ya existe, buscar su ID
          const { data: userList } = await adminSupabase.auth.admin.listUsers();
          const existing = userList?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
          if (existing) {
            userId = existing.id;
            authAction = 'existing_linked';
          }
        } else if (inviteData?.user) {
          userId = inviteData.user.id;
        }
      } catch (err: any) {
        console.warn('[Invite Client Service] Excepción en admin auth:', err.message);
      }

      // C. Si obtuvimos o identificamos el ID del usuario, vincular en public.user_roles
      if (userId) {
        const { error: roleErr } = await adminSupabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            institution_id: institutionId,
            role: 'rector'
          }, { onConflict: 'user_id,institution_id,role' });

        if (roleErr) {
          console.warn('[Invite Client Service] Error asignando rol rector en user_roles:', roleErr.message);
        } else {
          console.log(`[Invite Client Service] Rol rector asignado con éxito para user_id: ${userId}`);
        }
      }
    } else {
      // Si no hay service_role, actualizamos con el cliente de sesión si las políticas lo permiten
      await supabase
        .from('institutions')
        .update({
          email: email,
          rector_name: name || null,
          phone: phone || null
        })
        .eq('id', institutionId);
    }

    // 3. Despachar correo oficial de bienvenida institucional vía Resend (o simulado si no hay API key)
    const apiKey = process.env.RESEND_API_KEY || 're_xxxxxxxxx';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const originUrl = request.headers.get('origin') || 'https://aulacore.com';

    let emailSent = false;
    if (apiKey && apiKey !== 're_xxxxxxxxx') {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `AulaCore <${fromEmail}>`,
            to: [email],
            subject: `🚀 ¡Bienvenido a AulaCore! Acceso Oficial para ${institutionName || 'Tu Colegio'}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 28px; text-align: center; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.05em;">AULACORE ENTERPRISE</h1>
                  <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Plataforma Central de Gestión Académica & Operativa</p>
                </div>
                
                <div style="padding: 28px; color: #334155; line-height: 1.6;">
                  <p style="margin-top: 0; font-size: 16px;">Hola <strong>${name || 'Directivo Académico'}</strong>,</p>
                  
                  <p style="font-size: 14px; color: #475569;">
                    Te damos la más cordial bienvenida a <strong>AulaCore</strong>. Tu institución educativa <strong>${institutionName || 'Tu Colegio'}</strong> ha sido aprovisionada y configurada exitosamente en nuestra arquitectura en la nube.
                  </p>
                  
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 24px 0;">
                    <span style="font-size: 11px; font-weight: 800; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
                      DATOS DE ACCESO DIRECTIVO (RECTORÍA)
                    </span>
                    <div style="font-size: 13px; margin-bottom: 4px;"><strong>Institución:</strong> ${institutionName || 'Asignada'}</div>
                    <div style="font-size: 13px; margin-bottom: 4px;"><strong>Correo Registrado:</strong> ${email}</div>
                    <div style="font-size: 13px;"><strong>Rol Asignado:</strong> Rector / Administrador General</div>
                  </div>

                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${originUrl}/login?email=${encodeURIComponent(email)}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-weight: 800; font-size: 14px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);">
                      Ingresar a mi Colegio Ahora
                    </a>
                  </div>

                  <h3 style="font-size: 14px; font-weight: 800; color: #1e293b; margin-top: 28px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
                    ¿Qué sigue a continuación?
                  </h3>
                  <ol style="font-size: 13px; color: #475569; padding-left: 20px; space-y: 8px;">
                    <li style="margin-bottom: 8px;"><strong>Acceso Inicial:</strong> Ingresa a tu portal y establece o verifica tu contraseña de acceso seguro.</li>
                    <li style="margin-bottom: 8px;"><strong>Parametrización Guiada:</strong> Nuestro equipo de Soporte Técnico y Acompañamiento AulaCore estará en contacto para guiarte en la configuración de la escala de notas, calendarios y la carga de estudiantes y docentes.</li>
                    <li><strong>Puesta en Producción:</strong> Una vez validados tus parámetros, el colegio estará 100% listo para operar en el año lectivo actual.</li>
                  </ol>

                  <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                    Si necesitas asistencia técnica inmediata, responde a este correo o contacta a nuestro canal corporativo de atención AulaCore SaaS.
                  </div>
                </div>
                
                <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b;">
                  © ${new Date().getFullYear()} AulaCore Enterprise Solutions • Tecnología de Gestión Institucional 360°
                </div>
              </div>
            `,
          }),
        });

        if (response.ok) {
          emailSent = true;
        } else {
          console.warn('[Invite Client Service] Error al enviar email en Resend:', await response.text());
        }
      } catch (err: any) {
        console.warn('[Invite Client Service] Excepción en red al enviar email:', err.message);
      }
    } else {
      console.log('[Invite Client Service] Modo simulación (RESEND_API_KEY no configurado): Correo de bienvenida simulado para:', email);
      emailSent = true;
    }

    return NextResponse.json({
      success: true,
      userId: userId || 'AUTO-PROVISIONED',
      email,
      role: 'rector',
      authAction,
      emailSent
    });

  } catch (error: any) {
    console.error('[Invite Client Service] Error interno:', error);
    return NextResponse.json(
      { error: error.message || 'Error procesando el registro e invitación del cliente.' },
      { status: 500 }
    );
  }
}
