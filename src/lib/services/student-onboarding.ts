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
    // A. Obtener datos de la solicitud
    const { data: onboarding, error: fetchError } = await supabase
      .from('student_onboardings')
      .select('*')
      .eq('id', onboardingId)
      .single();

    if (fetchError || !onboarding) {
      throw new Error(fetchError?.message || 'Solicitud de onboarding no encontrada.');
    }

    // B. Crear usuario en Auth usando la función RPC
    const cleanName = onboarding.student_name.toLowerCase().replace(/\s+/g, '');
    const generatedEmail = `${cleanName || 'estudiante.' + onboarding.student_id}@aulacore.edu.co`;
    const tempPassword = 'AulaCore2026!';
    const names = onboarding.student_name.split(' ');
    const firstName = names[0] || 'Estudiante';
    const lastName = names.slice(1).join(' ') || 'AulaCore';

    const { data: userId, error: rpcError } = await supabase.rpc('create_teacher_auth_user', {
      p_email: generatedEmail,
      p_password: tempPassword,
      p_first_name: firstName,
      p_last_name: lastName
    });

    if (rpcError || !userId) {
      throw new Error(rpcError?.message || 'No se pudo crear el usuario estudiante en Auth.');
    }

    // C. Vincular el perfil al rol estudiante en public.user_roles
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('institution_id', institutionId);

    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        institution_id: institutionId,
        role: 'estudiante'
      });

    if (roleError) {
      throw new Error(roleError.message);
    }

    // D. Registrar el estudiante en public.students
    const enrollmentNumber = 'MAT-' + Date.now().toString().substring(6);
    
    // Verificar si ya existe en public.students
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!existingStudent) {
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          id: userId,
          enrollment_number: enrollmentNumber,
          status: 'activo',
          date_of_birth: onboarding.birth_date || null,
          medical_notes: onboarding.medical_observations || onboarding.allergies || null
        });

      if (studentError) {
        throw new Error(studentError.message);
      }
    }

    // E. Actualizar foto del perfil
    if (onboarding.foto_student_url) {
      await supabase
        .from('profiles')
        .update({ avatar_url: onboarding.foto_student_url })
        .eq('id', userId);
    }

    // F. Actualizar el estado del onboarding en la base de datos
    const { error: updateError } = await supabase
      .from('student_onboardings')
      .update({
        status: 'activated',
        updated_at: new Date().toISOString()
      })
      .eq('id', onboardingId);

    if (updateError) {
      throw new Error(updateError.message);
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
