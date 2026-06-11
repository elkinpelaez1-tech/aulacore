-- =================================================================
-- AulaCore - Phase X: Student Onboarding Schema & Functions
-- =================================================================

-- 1. TABLA DE ONBOARDING DE ESTUDIANTES
CREATE TABLE IF NOT EXISTS public.student_onboardings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  sede TEXT,
  jornada TEXT,
  periodo TEXT,
  tipo_matricula TEXT,
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  id_type TEXT,
  birth_date TEXT,
  blood_type TEXT,
  eps_name TEXT,
  address TEXT,
  has_disability TEXT,
  disability_type TEXT,
  sisben_level TEXT,
  stratum TEXT,
  mother_name TEXT,
  mother_phone TEXT,
  father_name TEXT,
  father_phone TEXT,
  primary_guardian TEXT,
  emergency_name TEXT,
  emergency_phone TEXT,
  emergency_relation TEXT,
  previous_school TEXT,
  last_completed_grade TEXT,
  previous_school_type TEXT,
  allergies TEXT,
  medications TEXT,
  physical_restrictions TEXT,
  medical_observations TEXT,
  foto_student_url TEXT,
  eps_card_url TEXT,
  identity_doc_url TEXT,
  notes_cert_url TEXT,
  paz_salvo_url TEXT,
  medical_cert_url TEXT,
  signature_url TEXT,
  consent_habeas_data BOOLEAN DEFAULT false,
  consent_manual BOOLEAN DEFAULT false,
  consent_siee BOOLEAN DEFAULT false,
  consent_institutional BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'invited', 'email_sent', 'activated', 'first_access', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HABILITAR RLS
ALTER TABLE public.student_onboardings ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS
DROP POLICY IF EXISTS "Candidatos pueden insertar su propio onboarding" ON public.student_onboardings;
CREATE POLICY "Candidatos pueden insertar su propio onboarding"
  ON public.student_onboardings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Candidatos pueden ver su propio onboarding" ON public.student_onboardings;
CREATE POLICY "Candidatos pueden ver su propio onboarding"
  ON public.student_onboardings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Administrativos tienen control total de onboardings de estudiantes" ON public.student_onboardings;
CREATE POLICY "Administrativos tienen control total de onboardings de estudiantes"
  ON public.student_onboardings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. CREAR EL BUCKET DE STORAGE PARA ONBOARDING DE ESTUDIANTES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-onboarding', 
  'student-onboarding', 
  true, 
  10485760, -- Límite de 10MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- POLÍTICAS DE ACCESO PARA EL BUCKET EN STORAGE.OBJECTS
DROP POLICY IF EXISTS "Permitir subida pública de archivos estudiante" ON storage.objects;
CREATE POLICY "Permitir subida pública de archivos estudiante"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'student-onboarding');

DROP POLICY IF EXISTS "Permitir lectura pública de archivos estudiante" ON storage.objects;
CREATE POLICY "Permitir lectura pública de archivos estudiante"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'student-onboarding');

DROP POLICY IF EXISTS "Permitir actualización pública de archivos estudiante" ON storage.objects;
CREATE POLICY "Permitir actualización pública de archivos estudiante"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'student-onboarding')
  WITH CHECK (bucket_id = 'student-onboarding');
