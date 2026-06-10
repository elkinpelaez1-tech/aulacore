-- =================================================================
-- AulaCore - Phase IX: Teacher Onboarding Schema & Functions
-- =================================================================

-- 1. MODIFICAR RESTRICCIÓN DE ROLES PARA COORDINADOR
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('rector', 'coordinador', 'director_grupo', 'docente', 'secretaria', 'padre_familia', 'estudiante'));

-- 2. TABLA DE ONBOARDING DE DOCENTES
CREATE TABLE IF NOT EXISTS public.teacher_onboardings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  document_id TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  profession TEXT,
  degree TEXT,
  experience_years TEXT,
  domain_areas TEXT[],
  sede TEXT,
  jornada TEXT,
  academic_level TEXT,
  subject_area TEXT,
  selected_slots TEXT[],
  selected_roles TEXT[],
  foto_url TEXT,
  cv_url TEXT,
  diploma_url TEXT,
  escalafon_url TEXT,
  background_check_url TEXT,
  certifications_url TEXT,
  identity_doc_url TEXT,
  signature_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'invited', 'email_sent', 'activated', 'first_access', 'rejected')),
  activation_link TEXT,
  email_logs JSONB DEFAULT '[]'::JSONB,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HABILITAR RLS
ALTER TABLE public.teacher_onboardings ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS
DROP POLICY IF EXISTS "Candidatos pueden insertar su propio onboarding" ON public.teacher_onboardings;
CREATE POLICY "Candidatos pueden insertar su propio onboarding"
  ON public.teacher_onboardings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Candidatos pueden ver su propio onboarding por email" ON public.teacher_onboardings;
CREATE POLICY "Candidatos pueden ver su propio onboarding por email"
  ON public.teacher_onboardings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Administrativos tienen control total de onboardings" ON public.teacher_onboardings;
CREATE POLICY "Administrativos tienen control total de onboardings"
  ON public.teacher_onboardings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. FUNCIÓN RPC PARA CREAR USUARIO EN AUTH DESDE EL SERVIDOR (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.create_teacher_auth_user(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT,
  p_last_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verificar si el usuario ya existe en auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NOT NULL THEN
    RETURN v_user_id;
  END IF;

  -- Generar UUID único
  v_user_id := gen_random_uuid();
  
  -- Insertar en auth.users directamente
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('first_name', p_first_name, 'last_name', p_last_name, 'avatar_url', ''),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );
  
  RETURN v_user_id;
END;
$$;

-- 4. CREAR EL BUCKET DE STORAGE PARA ONBOARDING DE DOCENTES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'teacher-onboarding', 
  'teacher-onboarding', 
  true, 
  10485760, -- Límite de 10MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- POLÍTICAS DE ACCESO PARA EL BUCKET EN STORAGE.OBJECTS
DROP POLICY IF EXISTS "Permitir subida pública de archivos" ON storage.objects;
CREATE POLICY "Permitir subida pública de archivos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'teacher-onboarding');

DROP POLICY IF EXISTS "Permitir lectura pública de archivos" ON storage.objects;
CREATE POLICY "Permitir lectura pública de archivos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'teacher-onboarding');
