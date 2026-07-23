-- ==============================================================================
-- MIGRACIÓN P0-02: PROTECCIÓN DE PRIVACIDAD EN STORAGE (STUDENT & TEACHER ONBOARDING)
-- AISLAMIENTO MULTI-TENANT ESTRICTO POR INSTITUTION_ID EN STORAGE.OBJECTS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PARTE A: BUCKET 'student-onboarding' (MENORES DE EDAD)
-- ------------------------------------------------------------------------------
UPDATE storage.buckets
SET public = false
WHERE id = 'student-onboarding';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-onboarding',
  'student-onboarding',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Permitir subida pública de archivos estudiante" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura pública de archivos estudiante" ON storage.objects;
DROP POLICY IF EXISTS "Lectura privada de archivos de estudiante por directivos autorizados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización pública de archivos estudiante" ON storage.objects;
DROP POLICY IF EXISTS "Actualización privada de archivos estudiante por directivos" ON storage.objects;

CREATE POLICY "Permitir subida de archivos estudiante en onboarding"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'student-onboarding');

-- LECTURA PRIVADA ESTRICTAMENTE AISLADA POR INSTITUTION_ID (O SUPER_ADMIN)
CREATE POLICY "Lectura privada de archivos de estudiante por directivos autorizados"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'student-onboarding'
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1 FROM public.student_onboardings so
        WHERE so.institution_id IN (SELECT public.get_auth_user_institution_ids())
          AND (
            so.foto_student_url LIKE '%' || storage.objects.name || '%'
            OR so.eps_card_url LIKE '%' || storage.objects.name || '%'
            OR so.identity_doc_url LIKE '%' || storage.objects.name || '%'
            OR so.notes_cert_url LIKE '%' || storage.objects.name || '%'
            OR so.paz_salvo_url LIKE '%' || storage.objects.name || '%'
            OR so.medical_cert_url LIKE '%' || storage.objects.name || '%'
            OR so.signature_url LIKE '%' || storage.objects.name || '%'
          )
      )
      OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.institution_id IS NOT NULL
          AND storage.objects.name LIKE ur.institution_id::text || '/%'
      )
    )
  );

-- ACTUALIZACIÓN RESTRINGIDA POR INSTITUTION_ID O SUPER_ADMIN
CREATE POLICY "Actualización privada de archivos estudiante por directivos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'student-onboarding'
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1 FROM public.student_onboardings so
        WHERE so.institution_id IN (SELECT public.get_auth_user_institution_ids())
          AND (
            so.foto_student_url LIKE '%' || storage.objects.name || '%'
            OR so.eps_card_url LIKE '%' || storage.objects.name || '%'
            OR so.identity_doc_url LIKE '%' || storage.objects.name || '%'
          )
      )
    )
  )
  WITH CHECK (bucket_id = 'student-onboarding');

DROP POLICY IF EXISTS "Eliminación privada de archivos estudiante" ON storage.objects;
CREATE POLICY "Eliminación privada de archivos estudiante"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'student-onboarding'
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role = 'rector'
          AND ur.institution_id IS NOT NULL
          AND storage.objects.name LIKE ur.institution_id::text || '/%'
      )
    )
  );

-- ------------------------------------------------------------------------------
-- PARTE B: BUCKET 'teacher-onboarding' (DOCENTES)
-- ------------------------------------------------------------------------------
UPDATE storage.buckets
SET public = false
WHERE id = 'teacher-onboarding';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'teacher-onboarding',
  'teacher-onboarding',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Permitir subida pública de archivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura pública de archivos" ON storage.objects;
DROP POLICY IF EXISTS "Lectura privada de archivos de docente por directivos autorizados" ON storage.objects;

CREATE POLICY "Permitir subida de archivos docente"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'teacher-onboarding');

CREATE POLICY "Lectura privada de archivos de docente por directivos autorizados"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'teacher-onboarding'
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role IN ('rector', 'coordinador', 'secretaria')
          AND storage.objects.name LIKE ur.institution_id::text || '/%'
      )
    )
  );
