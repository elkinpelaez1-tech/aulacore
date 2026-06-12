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
export async function listOnboardingSubmissions(): Promise<TeacherOnboardingData[]> {
  const { data, error } = await supabase
    .from('teacher_onboardings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

// 4. APROBAR ONBOARDING (RPC AUTH USER + USER ROLES + INVITACIÓN)
export async function approveOnboarding(
  onboardingId: string,
  institutionId: string
): Promise<{ success: boolean; activationLink: string; error?: string }> {
  try {
    const tempPassword = 'AulaCore2026!'; // Contraseña temporal por defecto

    // Ejecutar el proceso atómico de aprobación mediante el RPC de base de datos
    const { data: userId, error: rpcError } = await supabase.rpc('approve_teacher_onboarding_rpc', {
      p_onboarding_id: onboardingId,
      p_institution_id: institutionId,
      p_temp_password: tempPassword
    });

    if (rpcError || !userId) {
      throw new Error(rpcError?.message || 'Error al ejecutar RPC de aprobación en el servidor.');
    }

    // Obtener los datos actuales del onboarding para generar enlace y logs de correo
    const { data: onboarding, error: fetchError } = await supabase
      .from('teacher_onboardings')
      .select('*')
      .eq('id', onboardingId)
      .single();

    if (fetchError || !onboarding) {
      throw new Error(fetchError?.message || 'Onboarding no encontrado tras la aprobación.');
    }

    // E. Generar enlace de activación e historial de correo
    const activationLink = `${window.location.origin}/join/act-${onboardingId}`;
    const newEmailLog = {
      id: 'eml-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      sentAt: new Date().toISOString(),
      subject: '✨ Bienvenido a AulaCore - Configura tu Acceso Institucional',
      body: `Estimado(a) ${onboarding.full_name},\n\nNos complace darte la bienvenida al equipo docente. Tu proceso de onboarding ha sido aprobado por la Coordinación Académica.\n\nPara activar tu cuenta y configurar tu acceso a las consolas y registros RFID, haz clic en el siguiente enlace:\n${activationLink}\n\nDetalles de la cuenta:\n- Correo: ${onboarding.email}\n- Contraseña temporal: ${tempPassword}\n\nAtentamente,\nCoordinación Académica - AulaCore`,
      status: 'Enviado'
    };

    const existingLogs = Array.isArray(onboarding.email_logs) ? onboarding.email_logs : [];
    const updatedLogs = [newEmailLog, ...existingLogs];

    // Actualizar campos de correo en el cliente
    const { error: updateError } = await supabase
      .from('teacher_onboardings')
      .update({
        activation_link: activationLink,
        email_logs: updatedLogs,
        updated_at: new Date().toISOString()
      })
      .eq('id', onboardingId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return { success: true, activationLink };
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
      id: 'eml-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
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

    return { success: true };
  } catch (err: any) {
    console.error('Error reenviando invitación:', err);
    return { success: false, error: err.message };
  }
}
