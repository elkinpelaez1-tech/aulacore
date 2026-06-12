import { supabase } from '@/lib/supabase';

export interface StudentOnboardingData {
  id?: string;
  institution_id: string;
  sede?: string;
  jornada?: string;
  periodo?: string;
  tipo_matricula?: string;
  student_name: string;
  student_id: string;
  id_type?: string;
  birth_date?: string;
  blood_type?: string;
  eps_name?: string;
  address?: string;
  has_disability?: string;
  disability_type?: string;
  sisben_level?: string;
  stratum?: string;
  mother_name?: string;
  mother_phone?: string;
  father_name?: string;
  father_phone?: string;
  primary_guardian?: string;
  emergency_name?: string;
  emergency_phone?: string;
  emergency_relation?: string;
  previous_school?: string;
  last_completed_grade?: string;
  previous_school_type?: string;
  allergies?: string;
  medications?: string;
  physical_restrictions?: string;
  medical_observations?: string;
  foto_student_url?: string;
  eps_card_url?: string;
  identity_doc_url?: string;
  notes_cert_url?: string;
  paz_salvo_url?: string;
  medical_cert_url?: string;
  signature_url?: string;
  consent_habeas_data?: boolean;
  consent_manual?: boolean;
  consent_siee?: boolean;
  consent_institutional?: boolean;
  status?: 'pending_approval' | 'invited' | 'email_sent' | 'activated' | 'first_access' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

// 1. SUBIR ARCHIVO A STORAGE (Usando bucket student-onboarding)
export async function uploadStudentFile(
  file: File,
  folder: string,
  studentId: string,
  fileName: string
): Promise<string> {
  const fileExt = (fileName.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanStudentId = studentId.replace(/[^a-zA-Z0-9]/g, '');
  const path = `${folder}/${cleanStudentId}_${Date.now()}.${fileExt}`;

  // Determinar el tipo MIME correcto (especialmente en Windows donde a veces viene vacío para PDFs)
  let mimeType = file.type;
  if (!mimeType || mimeType === 'application/octet-stream') {
    if (fileExt === 'pdf') mimeType = 'application/pdf';
    else if (fileExt === 'png') mimeType = 'image/png';
    else if (fileExt === 'jpg' || fileExt === 'jpeg') mimeType = 'image/jpeg';
  }

  // Crear un objeto File limpio con nombre ASCII y contenido aplanado (slice)
  const cleanFileName = `file_${Date.now()}.${fileExt}`;
  const cleanFile = new File([file.slice(0, file.size)], cleanFileName, { type: mimeType });

  const { data, error } = await supabase.storage
    .from('student-onboarding')
    .upload(path, cleanFile, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error in supabase.storage.upload (student):', error);
    throw error;
  }

  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('student-onboarding')
    .getPublicUrl(path);

  return publicUrl;
}

// 2. REGISTRAR ONBOARDING (INSERTAR EN DB)
export async function submitStudentOnboarding(data: StudentOnboardingData): Promise<StudentOnboardingData> {
  const { data: insertedData, error } = await supabase
    .from('student_onboardings')
    .insert([data])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return insertedData;
}

// 3. OBTENER LISTADO COMPLETO (AUDITORÍA Y COLA DE APROBACIÓN)
export async function listStudentOnboardings(): Promise<StudentOnboardingData[]> {
  const { data, error } = await supabase
    .from('student_onboardings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

// 4. APROBAR ONBOARDING (CREAR PERFIL DE ESTUDIANTE)
export async function approveStudentOnboarding(
  onboardingId: string,
  institutionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tempPassword = 'AulaCore2026!';

    // Ejecutar el proceso atómico de aprobación mediante el RPC de base de datos
    const { data: userId, error: rpcError } = await supabase.rpc('approve_student_onboarding_rpc', {
      p_onboarding_id: onboardingId,
      p_institution_id: institutionId,
      p_temp_password: tempPassword
    });

    if (rpcError || !userId) {
      throw new Error(rpcError?.message || 'Error al ejecutar RPC de aprobación de estudiante.');
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error aprobando onboarding de estudiante:', err);
    return { success: false, error: err.message };
  }
}

// 5. RECHAZAR ONBOARDING
export async function rejectStudentOnboarding(onboardingId: string): Promise<boolean> {
  const { error } = await supabase
    .from('student_onboardings')
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
