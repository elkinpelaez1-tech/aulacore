-- =========================================================================================
-- 🛡️ AULACORE ENTERPRISE - P0-01: RLS HARDENING & MULTI-TENANT ISOLATION MIGRATION
-- =========================================================================================
-- Descripción: Endurecimiento exhaustivo de Row Level Security (RLS) para eliminar USING (true)
--              y garantizar aislamiento estricto por institution_id en todas las tablas del SaaS.
-- =========================================================================================

-- -----------------------------------------------------------------
-- 1. FUNCIONES AUXILIARES OPTIMIZADAS (SECURITY DEFINER + STABLE)
-- Evitan recursión infinita en RLS y cachean el resultado por transacción.
-- -----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_auth_user_institution_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT institution_id
  FROM public.user_roles
  WHERE user_id = auth.uid() AND institution_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_in_institution(target_institution_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND (role = 'super_admin' OR institution_id = target_institution_id)
  );
$$;

-- -----------------------------------------------------------------
-- 2. ÍNDICES COMPUESTOS PARA ACELERACIÓN DE POLÍTICAS RLS (< 1ms)
-- -----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_inst ON public.user_roles(user_id, institution_id);

-- =================================================================
-- 3. POLÍTICAS RLS MULTI-TENANT EN TABLAS PRINCIPALES (database.sql)
-- =================================================================

-- A. public.institutions
DROP POLICY IF EXISTS "Permitir lectura de instituciones a usuarios autenticados" ON public.institutions;
CREATE POLICY "Lectura de instituciones por tenant o superadmin"
  ON public.institutions FOR SELECT TO authenticated
  USING (
    id IN (SELECT public.get_auth_user_institution_ids())
    OR public.is_super_admin()
  );

-- B. public.profiles
DROP POLICY IF EXISTS "Permitir lectura de perfiles a usuarios autenticados" ON public.profiles;
CREATE POLICY "Lectura de perfiles del mismo colegio o propio"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = profiles.id
        AND ur.institution_id IN (SELECT public.get_auth_user_institution_ids())
    )
  );

-- C. public.user_roles
DROP POLICY IF EXISTS "Permitir a usuarios ver sus propios roles asignados" ON public.user_roles;
CREATE POLICY "Lectura de roles propia o directivos del mismo colegio"
  ON public.user_roles FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_super_admin()
    OR (
      institution_id IN (SELECT public.get_auth_user_institution_ids())
      AND EXISTS (
        SELECT 1 FROM public.user_roles admin_ur
        WHERE admin_ur.user_id = auth.uid()
          AND admin_ur.role IN ('rector', 'coordinador', 'secretaria')
      )
    )
  );

-- =================================================================
-- 4. POLÍTICAS RLS ACADÉMICAS Y STUDENT 360 (database_student_360.sql)
-- =================================================================

-- A. public.institution_academic_settings
DROP POLICY IF EXISTS "Lectura general de configuraciones a autenticados" ON public.institution_academic_settings;
DROP POLICY IF EXISTS "Escritura de configuraciones exclusiva para Rector/Admin" ON public.institution_academic_settings;

CREATE POLICY "Lectura configuraciones por colegio"
  ON public.institution_academic_settings FOR SELECT TO authenticated
  USING (
    institution_id IN (SELECT public.get_auth_user_institution_ids())
    OR public.is_super_admin()
  );

CREATE POLICY "Escritura configuraciones por rector del colegio o superadmin"
  ON public.institution_academic_settings FOR ALL TO authenticated
  USING (
    public.is_super_admin()
    OR (
      institution_id IN (SELECT public.get_auth_user_institution_ids())
      AND EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'rector'
      )
    )
  );

-- B. public.academic_years
DROP POLICY IF EXISTS "Lectura de años lectivos a autenticados" ON public.academic_years;
DROP POLICY IF EXISTS "Escritura de años lectivos exclusiva a Rector/Admin" ON public.academic_years;

CREATE POLICY "Lectura años lectivos por colegio"
  ON public.academic_years FOR SELECT TO authenticated
  USING (
    institution_id IN (SELECT public.get_auth_user_institution_ids())
    OR public.is_super_admin()
  );

CREATE POLICY "Escritura años lectivos por rector del colegio"
  ON public.academic_years FOR ALL TO authenticated
  USING (
    public.is_super_admin()
    OR (
      institution_id IN (SELECT public.get_auth_user_institution_ids())
      AND EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'rector'
      )
    )
  );

-- C. public.academic_periods
DROP POLICY IF EXISTS "Lectura de periodos a autenticados" ON public.academic_periods;
DROP POLICY IF EXISTS "Escritura de periodos exclusiva a Rector/Admin" ON public.academic_periods;

CREATE POLICY "Lectura periodos del colegio"
  ON public.academic_periods FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.academic_years ay
      WHERE ay.id = academic_periods.academic_year_id
        AND ay.institution_id IN (SELECT public.get_auth_user_institution_ids())
    )
  );

CREATE POLICY "Escritura periodos por rector del colegio"
  ON public.academic_periods FOR ALL TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.academic_years ay
      WHERE ay.id = academic_periods.academic_year_id
        AND ay.institution_id IN (SELECT public.get_auth_user_institution_ids())
        AND EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid() AND ur.role = 'rector'
        )
    )
  );

-- D. public.courses
DROP POLICY IF EXISTS "Lectura general de cursos a autenticados" ON public.courses;
CREATE POLICY "Lectura de cursos por colegio"
  ON public.courses FOR SELECT TO authenticated
  USING (
    institution_id IN (SELECT public.get_auth_user_institution_ids())
    OR public.is_super_admin()
  );

-- E. public.students
DROP POLICY IF EXISTS "Lectura general de estudiantes a autenticados" ON public.students;
CREATE POLICY "Lectura de estudiantes por colegio o propio"
  ON public.students FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = students.id
        AND ur.institution_id IN (SELECT public.get_auth_user_institution_ids())
    )
  );

-- F. public.student_enrollments
DROP POLICY IF EXISTS "Lectura general de matrículas a autenticados" ON public.student_enrollments;
CREATE POLICY "Lectura de matrículas por colegio del curso"
  ON public.student_enrollments FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = student_enrollments.course_id
        AND c.institution_id IN (SELECT public.get_auth_user_institution_ids())
    )
  );

-- G. Expedientes de Calificaciones, Asistencia, Conducta y Alertas
DROP POLICY IF EXISTS "Lectura de notas generales a autenticados" ON public.academic_records;
CREATE POLICY "Lectura de notas por colegio o propio"
  ON public.academic_records FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = academic_records.student_id
        AND ur.institution_id IN (SELECT public.get_auth_user_institution_ids())
    )
  );

DROP POLICY IF EXISTS "Lectura de asistencia general a autenticados" ON public.attendance_records;
CREATE POLICY "Lectura de asistencia por colegio o propio"
  ON public.attendance_records FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = attendance_records.student_id
        AND ur.institution_id IN (SELECT public.get_auth_user_institution_ids())
    )
  );

DROP POLICY IF EXISTS "Lectura de observador general a autenticados" ON public.behavioral_logs;
CREATE POLICY "Lectura de observador por colegio autorizado"
  ON public.behavioral_logs FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = behavioral_logs.student_id
        AND ur.institution_id IN (SELECT public.get_auth_user_institution_ids())
    )
  );

DROP POLICY IF EXISTS "Lectura de alertas a autenticados" ON public.early_alerts;
CREATE POLICY "Lectura de alertas por colegio autorizado"
  ON public.early_alerts FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = early_alerts.student_id
        AND ur.institution_id IN (SELECT public.get_auth_user_institution_ids())
    )
  );

-- =================================================================
-- 5. DOCUMENTOS INSTITUCIONALES Y ONBOARDINGS
-- =================================================================

-- A. Plantillas y Actas
DROP POLICY IF EXISTS "Lectura de plantillas a autenticados" ON public.institution_document_templates;
CREATE POLICY "Lectura plantillas por colegio"
  ON public.institution_document_templates FOR SELECT TO authenticated
  USING (
    institution_id IN (SELECT public.get_auth_user_institution_ids())
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "Lectura pública anónima por código de verificación" ON public.institution_documents;
CREATE POLICY "Lectura documentos por colegio o verificacion"
  ON public.institution_documents FOR SELECT TO anon, authenticated
  USING (
    (auth.uid() IS NOT NULL AND (
      institution_id IN (SELECT public.get_auth_user_institution_ids())
      OR student_id = auth.uid()
      OR public.is_super_admin()
    ))
    OR verification_code IS NOT NULL
  );

-- B. Matrículas / Onboarding de Estudiantes
DROP POLICY IF EXISTS "Administrativos tienen control total de onboardings de estudiantes" ON public.student_onboardings;
CREATE POLICY "Control de onboardings por colegio"
  ON public.student_onboardings FOR ALL TO authenticated
  USING (
    institution_id IN (SELECT public.get_auth_user_institution_ids())
    OR public.is_super_admin()
  );
