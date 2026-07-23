-- =========================================================================================
-- 🛡️ AULACORE ENTERPRISE - SCRIPT DEFINITIVO DE LIMPIEZA PARA PRODUCCIÓN INICIAL
-- =========================================================================================
-- Descripción: Limpieza transaccional dinámica y segura de todo el ecosistema SaaS.
--              Implementa validación en information_schema.tables antes de cualquier DELETE.
--              Asume que TODOS los datos transaccionales y colegios actuales son de prueba.
--              CONSERVA ÚNICAMENTE:
--              - auth.users (Cuentas de autenticación globales)
--              - public.user_roles (SOLO roles de 'super_admin', ej. elkinpelaez1@gmail.com)
--              - public.profiles (SOLO los perfiles vinculados a los 'super_admin')
--              - Configuraciones globales, catálogos, funciones, RPCs, RLS, triggers.
-- =========================================================================================

BEGIN;

DO $$
DECLARE
  v_table text;
  -- Array estructurado con el orden correcto de eliminación jerárquica (desde tablas hoja hacia padres)
  v_tables text[] := ARRAY[
    -- FASE 1: HOJAS TRANSACCIONALES (PAE, CONVIVENCIA, DOCUMENTOS Y LOGS)
    'pae_financial_resources', 'pae_prioritization', 'pae_infrastructure_diagnostic',
    'pae_operators', 'pae_team', 'pae_menu_cycles', 'pae_beneficiaries',
    'pae_daily_deliveries', 'pae_daily_attendance', 'pae_controls',
    'pae_local_purchases', 'pae_incidents', 'pae_spqr', 'pae_improvement_plans',
    'pae_committees', 'pae_mesas_publicas',
    'attendance_records', 'academic_records', 'behavioral_logs', 'early_alerts',
    'student_gamification', 'student_badges', 'student_ai_insights',
    'teacher_onboardings', 'student_onboardings', 'institution_document_audit',
    'institution_documents', 'migration_audit_logs',
    -- FASE 2: CURRÍCULO, GOBIERNO ESCOLAR Y PEI
    'curriculum_evidences', 'curriculum_indicators', 'curriculum_competencies',
    'curriculum_evaluations', 'curriculum_resources', 'curriculum_methodologies',
    'curriculum_versions', 'curriculum_comments', 'curriculum_periods',
    'curriculum_grids', 'curriculum_subjects', 'curriculum_areas',
    'schedule_change_requests', 'academic_schedules',
    'pei_identity', 'pei_pedagogical_model', 'pei_school_government',
    'pei_manual_versions', 'pei_projects', 'pei_gov_convocatorias',
    'pei_gov_meetings', 'pei_gov_actas',
    -- FASE 3: ESTRUCTURA ACADÉMICA BASE (CURSOS, ESTUDIANTES Y PERIODOS)
    'student_enrollments', 'students', 'courses', 'academic_periods',
    'academic_years', 'institution_academic_settings'
  ];
BEGIN
  RAISE LOG '=== INICIANDO LIMPIEZA DINÁMICA TOTAL PARA PASE A PRODUCCIÓN ===';

  -- Bucle iterativo con validación en information_schema.tables
  FOREACH v_table IN ARRAY v_tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = v_table
    ) THEN
      RAISE LOG 'Limpiando tabla existente: %', v_table;
      EXECUTE format('DELETE FROM public.%I;', v_table);
    ELSE
      RAISE LOG 'Omitiendo tabla inexistente: % (No aplicable en esta instancia)', v_table;
    END IF;
  END LOOP;

  -- =======================================================================================
  -- FASE 4: LIMPIEZA DE IDENTIDAD Y TENANTS (PROTECCIÓN ABSOLUTA A SUPER ADMINS)
  -- =======================================================================================
  RAISE LOG 'Fase 4: Ejecutando limpieza selectiva de perfiles y tenants...';

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
    -- Eliminar TODAS las asignaciones de rol EXCEPTO los super administradores.
    DELETE FROM public.user_roles WHERE role != 'super_admin';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Eliminar TODOS los perfiles de usuario EXCEPTO los que pertenezcan a los super administradores.
    DELETE FROM public.profiles WHERE id NOT IN (
      SELECT user_id FROM public.user_roles WHERE role = 'super_admin'
    );
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'institutions') THEN
    -- Eliminar TODOS los tenants (colegios y secretarías), dejando la plataforma limpia para producción.
    DELETE FROM public.institutions;
  END IF;

  RAISE LOG '=== LIMPIEZA DINÁMICA FINALIZADA: AULACORE ESTÁ LISTO PARA PRODUCCIÓN ===';

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'EXCEPCIÓN CRÍTICA EN LIMPIEZA DE PRODUCCIÓN: % - EJECUTANDO ROLLBACK...', SQLERRM;
    RAISE EXCEPTION 'Abortando limpieza. Rollback automático ejecutado por error: %', SQLERRM;
END $$;

COMMIT;
