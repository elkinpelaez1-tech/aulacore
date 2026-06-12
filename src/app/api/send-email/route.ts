import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { to, subject, message, category, recipientName } = await request.json();

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Destinatario, asunto y mensaje son obligatorios.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY || 're_xxxxxxxxx';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    console.log(`[Email Service] Despachando correo a: ${to}, Asunto: ${subject}, Categoría: ${category}`);

    // If apiKey is a placeholder or not set, log it and return mock success to avoid breaking dev workflow
    if (!apiKey || apiKey === 're_xxxxxxxxx') {
      console.warn('[Email Service] RESEND_API_KEY no configurado o es un valor ficticio. Simulando despacho exitoso.');
      return NextResponse.json({
        success: true,
        mocked: true,
        id: 'MOCK-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      });
    }

    // Call Resend REST API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `AulaCore <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; tracking-wide">AULACORE MAIL</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">Comunicación Oficial Institucional</p>
            </div>
            
            <div style="padding: 24px; color: #334155; line-height: 1.6;">
              <p style="margin-top: 0; font-size: 14px;">Estimado(a) <strong>${recipientName || 'Docente'}</strong>,</p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
                <span style="font-size: 10px; font-weight: 805; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">
                  Asunto
                </span>
                <strong style="font-size: 15px; color: #1e293b;">${subject}</strong>
              </div>

              <div style="font-size: 14px; color: #475569; white-space: pre-wrap; margin: 20px 0;">
${message}
              </div>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b;">
                <p style="margin: 0;">Categoría de comunicación: <strong style="text-transform: uppercase; color: #4f46e5;">${category || 'general'}</strong></p>
              </div>
            </div>

            <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px 0;">Este es un mensaje institucional automatizado enviado por AulaCore.</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} AulaCore. Todos los derechos reservados.</p>
            </div>
          </div>
        `,
      }),
    });

    const resData = await response.json();

    if (!response.ok) {
      console.error('[Email Service] Error de Resend API:', resData);
      return NextResponse.json(
        { error: resData.message || 'Error al despachar el correo electrónico por Resend.' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      id: resData.id,
    });
  } catch (error: any) {
    console.error('[Email Service] Excepción en servicio de correo:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
