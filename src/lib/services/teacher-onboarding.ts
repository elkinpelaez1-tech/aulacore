import { supabase } from '@/lib/supabase';

export interface TeacherOnboardingData {
  id?: string;
  institution_id: string;
  full_name: string;
  document_id: string;
  email: string;
  phone: string;
  profession?: string;
  degree?: string;
  experience_years?: string;
  domain_areas?: string[];
  sede?: string;
  jornada?: string;
  academic_level?: string;
  subject_area?: string;
  selected_slots?: string[];
  selected_roles?: string[];
  foto_url?: string;
  cv_url?: string;
  diploma_url?: string;
  escalafon_url?: string;
  background_check_url?: string;
  certifications_url?: string;
  identity_doc_url?: string;
  signature_url?: string;
  status?: 'pending_approval' | 'invited' | 'email_sent' | 'activated' | 'first_access' | 'rejected';
  activation_link?: string;
  email_logs?: any[];
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// 1. SUBIR ARCHIVO A STORAGE
export async function uploadOnboardingFile(
  file: File,
  folder: string,
  documentId: string,
  fileName: string
): Promise<string> {
  const fileExt = (fileName.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanDocId = documentId.replace(/[^a-zA-Z0-9]/g, '');
  const path = `${folder}/${cleanDocId}_${Date.now()}.${fileExt}`;

  // Determinar el tipo MIME correcto (especialmente en Windows donde a veces viene vacío para PDFs)
  let mimeType = file.type;
  if (!mimeType || mimeType === 'application/octet-stream') {
    if (fileExt === 'pdf') mimeType = 'application/pdf';
    else if (fileExt === 'png') mimeType = 'image/png';
    else if (fileExt === 'jpg' || fileExt === 'jpeg') mimeType = 'image/jpeg';
  }

  // Crear un objeto File limpio con nombre ASCII y contenido aplanado (slice) para evitar problemas de streaming en navegadores
  const cleanFileName = `file_${Date.now()}.${fileExt}`;
  const cleanFile = new File([file.slice(0, file.size)], cleanFileName, { type: mimeType });

  const { data, error } = await supabase.storage
    .from('teacher-onboarding')
    .upload(path, cleanFile, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error in supabase.storage.upload:', error);
    throw error;
  }

  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('teacher-onboarding')
    .getPublicUrl(path);

  return publicUrl;
}


// 2. REGISTRAR ONBOARDING (INSERTAR EN DB)
export async function submitOnboarding(data: TeacherOnboardingData): Promise<TeacherOnboardingData> {
  const { data: insertedData, error } = await supabase
    .from('teacher_onboardings')
    .insert([data])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return insertedData;
}

// 3. OBTENER LISTADO COMPLETO (AUDITORÍA Y COLA DE APROBACIÓN)
export async function listOnboardingSubmissions(institutionId?: string): Promise<TeacherOnboardingData[]> {
  let query = supabase
    .from('teacher_onboardings')
    .select('*')
    .order('created_at', { ascending: false });

  if (institutionId) {
    query = query.eq('institution_id', institutionId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

// 4. APROBAR ONBOARDING (DELEGADO A ENDPOINT SEGURO CON SUPABASE GENERATELINK)
export async function approveOnboarding(
  onboardingId: string,
  institutionId: string
): Promise<{ success: boolean; activationLink: string; error?: string }> {
  try {
    const res = await fetch('/api/onboarding/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboardingId, institutionId })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Error al procesar la aprobación en el servidor.');
    }

    return { success: true, activationLink: data.activationLink || '' };
  } catch (err: any) {
    console.error('Error aprobando onboarding:', err);
    return { success: false, activationLink: '', error: err.message };
  }
}

// 5. RECHAZAR ONBOARDING
export async function rejectOnboarding(onboardingId: string): Promise<boolean> {
  const { error } = await supabase
    .from('teacher_onboardings')
    .update({
      status: 'rejected',
      updated_at: new Date().toISOString()
    })
    .eq('id', onboardingId);

  if (error) {
    throw error;
  }
  return true;
}

// 6. REENVIAR INVITACIÓN POR CORREO
export async function resendInvitation(
  onboardingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: onboarding, error: fetchError } = await supabase
      .from('teacher_onboardings')
      .select('*')
      .eq('id', onboardingId)
      .single();

    if (fetchError || !onboarding) {
      throw new Error('Solicitud no encontrada.');
    }

    const activationLink = onboarding.activation_link || `${window.location.origin}/join/act-${onboarding.id}`;
    const newEmailLog = {
      id: 'eml-' + crypto.randomUUID().split('-')[0].toUpperCase(),
      sentAt: new Date().toISOString(),
      subject: '✨ Recordatorio: Configura tu Acceso en AulaCore',
      body: `Hola ${onboarding.full_name},\n\nTe recordamos que tu invitación para unirte como docente está lista. Para ingresar por primera vez y configurar tus horarios, haz clic en el siguiente enlace:\n${activationLink}\n\nAtentamente,\nCoordinación Académica - AulaCore`,
      status: 'Enviado'
    };

    const existingLogs = Array.isArray(onboarding.email_logs) ? onboarding.email_logs : [];
    const updatedLogs = [newEmailLog, ...existingLogs];

    const { error: updateError } = await supabase
      .from('teacher_onboardings')
      .update({
        status: onboarding.status === 'pending_approval' ? 'invited' : onboarding.status,
        activation_link: activationLink,
        email_logs: updatedLogs,
        updated_at: new Date().toISOString()
      })
      .eq('id', onboardingId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Despacho real de recordatorio mediante Resend API
    try {
      const emailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: onboarding.email,
          subject: '✨ Recordatorio: Configura tu Acceso en AulaCore',
          message: newEmailLog.body,
          recipientName: onboarding.full_name,
          category: 'onboarding_approval',
          metadata: {
            onboardingId,
            fullName: onboarding.full_name,
            activationLink
          },
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #0f172a; margin-top: 0;">Recordatorio de Activación Docente</h2>
              <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hola <strong>${onboarding.full_name}</strong>,</p>
              <p style="color: #334155; font-size: 15px; line-height: 1.5;">Te recordamos que tu invitación para unirte al equipo docente está disponible. Para activar tu cuenta institucional, haz clic en el siguiente enlace:</p>
              
              <div style="text-align: center; margin: 28px 0;">
                <a href="${activationLink}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">Activar mi cuenta y configurar contraseña</a>
              </div>

              <p style="font-size: 12px; color: #64748b; line-height: 1.4; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br/>
                <a href="${activationLink}" style="color: #4f46e5; word-break: break-all;">${activationLink}</a>
              </p>
            </div>
          `
        })
      });

      if (!emailRes.ok) {
        const errorData = await emailRes.json().catch(() => ({}));
        console.error('Error al despachar recordatorio via Resend:', errorData);
      }
    } catch (emailErr) {
      console.error('Error al despachar recordatorio via Resend:', emailErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error reenviando invitación:', err);
    return { success: false, error: err.message };
  }
}
