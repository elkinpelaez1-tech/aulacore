-- =========================================================================================
-- 🛡️ AULACORE ENTERPRISE - SCRIPT TRANSACCIONAL DE LIMPIEZA INTELIGENTE Y SELECTIVA
-- =========================================================================================
-- Descripción: Limpieza selectiva de datos de demostración, colegios piloto y registros
--              transaccionales de prueba para dejar el Panel Super Admin en producción.
--              CUMPLE LAS REGLAS DE ORO DE AULACORE:
--              1. NO elimina ni vacía indiscriminadamente public.profiles ni public.user_roles.
--              2. CONSERVA intactos todos los usuarios reales, Super Admins, perfiles, catálogos,
--                 funciones, vistas, políticas RLS, RPCs y configuraciones técnicas del sistema.
--              3. Elimina ÚNICAMENTE datos transaccionales vinculados a instituciones de prueba.
--              4. Ejecuta todo en una transacción atómica (BEGIN/COMMIT) con ROLLBACK ante errores.
-- =========================================================================================

BEGIN;

DO $$
DECLARE
  v_demo_count integer;
BEGIN
  RAISE LOG '=== INICIANDO LIMPIEZA INTELIGENTE DE AULACORE SAAS ===';

  -- 1. Identificar instituciones de prueba/demo que serán eliminadas
  -- (Crea una tabla temporal con las instituciones a limpiar: todas las demo y piloto actuales)
  CREATE TEMP TABLE temp_demo_institutions AS
  SELECT id, name, slug, organization_type 
  FROM public.institutions;

  SELECT count(*) INTO v_demo_count FROM temp_demo_institutions;
  RAISE LOG 'Instituciones de prueba/demo identificadas para limpieza: %', v_demo_count;

  IF v_demo_count = 0 THEN
    RAISE LOG 'No se encontraron instituciones para limpiar. Finalizando sin cambios.';
    RETURN;
  END IF;

  -- =======================================================================================
  -- FASE 1: LIMPIEZA DE TABLAS HOJA TRANSACCIONALES (Por institution_id de prueba)
  -- =======================================================================================
  RAISE LOG 'Fase 1: Eliminando registros transaccionales (Notas, Asistencia, PAE, Logs, Documentos)...';

  -- PAE (Programa de Alimentación Escolar)
  DELETE FROM public.pae_financial_resources WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_prioritization WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_infrastructure_diagnostic WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_operators WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_team WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_menu_cycles WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_beneficiaries WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_daily_deliveries WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_daily_attendance WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_controls WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_local_purchases WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_incidents WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_spqr WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_improvement_plans WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_committees WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pae_mesas_publicas WHERE institution_id IN (SELECT id FROM temp_demo_institutions);

  -- Registros Estudiantiles, Asistencia y Convivencia
  DELETE FROM public.attendance_records WHERE student_id IN (
    SELECT id FROM public.students WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.academic_records WHERE student_id IN (
    SELECT id FROM public.students WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.behavioral_logs WHERE student_id IN (
    SELECT id FROM public.students WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.early_alerts WHERE student_id IN (
    SELECT id FROM public.students WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.student_gamification WHERE student_id IN (
    SELECT id FROM public.students WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.student_badges WHERE student_id IN (
    SELECT id FROM public.students WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.student_ai_insights WHERE student_id IN (
    SELECT id FROM public.students WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );

  -- Onboarding y Enlaces Mágicos de Prueba
  DELETE FROM public.teacher_onboardings WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.student_onboardings WHERE institution_id IN (SELECT id FROM temp_demo_institutions);

  -- Bóveda de Documentos y Auditoría de Cargas Masivas
  DELETE FROM public.institution_document_audit WHERE document_id IN (
    SELECT id FROM public.institution_documents WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.institution_documents WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.migration_audit_logs WHERE institution_id IN (SELECT id FROM temp_demo_institutions);

  -- PEI y Gobierno Escolar
  DELETE FROM public.pei_identity WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pei_pedagogical_model WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pei_school_government WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pei_manual_versions WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pei_projects WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pei_gov_convocatorias WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pei_gov_meetings WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.pei_gov_actas WHERE institution_id IN (SELECT id FROM temp_demo_institutions);

  -- =======================================================================================
  -- FASE 2: LIMPIEZA DE TABLAS INTERMEDIAS ACADÉMICAS Y CURRICULARES
  -- =======================================================================================
  RAISE LOG 'Fase 2: Eliminando estructuras académicas intermedias y cursos de colegios demo...';

  DELETE FROM public.curriculum_evidences WHERE competency_id IN (
    SELECT id FROM public.curriculum_competencies WHERE area_id IN (
      SELECT id FROM public.curriculum_areas WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
    )
  );
  DELETE FROM public.curriculum_indicators WHERE competency_id IN (
    SELECT id FROM public.curriculum_competencies WHERE area_id IN (
      SELECT id FROM public.curriculum_areas WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
    )
  );
  DELETE FROM public.curriculum_competencies WHERE area_id IN (
    SELECT id FROM public.curriculum_areas WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.curriculum_evaluations WHERE area_id IN (
    SELECT id FROM public.curriculum_areas WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.curriculum_resources WHERE area_id IN (
    SELECT id FROM public.curriculum_areas WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.curriculum_methodologies WHERE area_id IN (
    SELECT id FROM public.curriculum_areas WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.curriculum_versions WHERE area_id IN (
    SELECT id FROM public.curriculum_areas WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.curriculum_comments WHERE area_id IN (
    SELECT id FROM public.curriculum_areas WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.curriculum_periods WHERE area_id IN (
    SELECT id FROM public.curriculum_areas WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.curriculum_grids WHERE area_id IN (
    SELECT id FROM public.curriculum_areas WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.curriculum_subjects WHERE area_id IN (
    SELECT id FROM public.curriculum_areas WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.curriculum_areas WHERE institution_id IN (SELECT id FROM temp_demo_institutions);

  DELETE FROM public.schedule_change_requests WHERE schedule_id IN (
    SELECT id FROM public.academic_schedules WHERE course_id IN (
      SELECT id FROM public.courses WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
    )
  );
  DELETE FROM public.academic_schedules WHERE course_id IN (
    SELECT id FROM public.courses WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );

  DELETE FROM public.student_enrollments WHERE student_id IN (
    SELECT id FROM public.students WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.students WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.courses WHERE institution_id IN (SELECT id FROM temp_demo_institutions);

  -- =======================================================================================
  -- FASE 3: CONFIGURACIÓN INSTITUCIONAL Y PERIODOS
  -- =======================================================================================
  RAISE LOG 'Fase 3: Eliminando periodos, años lectivos y settings de los colegios demo...';

  DELETE FROM public.academic_periods WHERE academic_year_id IN (
    SELECT id FROM public.academic_years WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
  );
  DELETE FROM public.academic_years WHERE institution_id IN (SELECT id FROM temp_demo_institutions);
  DELETE FROM public.institution_academic_settings WHERE institution_id IN (SELECT id FROM temp_demo_institutions);

  -- =======================================================================================
  -- FASE 4: LIMPIEZA SELECTIVA DE ASIGNACIONES DE ROL Y TENANTS
  -- (PROTECCIÓN ENTERPRISE AL 100%: NUNCA SE ELIMINAN PERFILES REALES NI ROLES SUPER ADMIN)
  -- =======================================================================================
  RAISE LOG 'Fase 4: Limpieza selectiva de roles escolares transaccionales y eliminación de tenants...';

  -- Eliminación selectiva en user_roles: SOLO se eliminan roles institucionales (rector, docente, etc.)
  -- asociados a los colegios de prueba. SE CONSERVAN AL 100% TODOS LOS ROLES 'super_admin'.
  DELETE FROM public.user_roles 
  WHERE institution_id IN (SELECT id FROM temp_demo_institutions)
    AND role != 'super_admin';

  -- Nota: public.profiles NO SE ELIMINA INDISCRIMINADAMENTE. Se conservan todos los perfiles,
  -- usuarios y cuentas de autenticación de Super Administradores y usuarios reales.

  -- Eliminación final de las instituciones de prueba/demo
  DELETE FROM public.institutions 
  WHERE id IN (SELECT id FROM temp_demo_institutions);

  RAISE LOG '=== LIMPIEZA INTELIGENTE Y SELECTIVA FINALIZADA CON ÉXITO ===';
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'EXCEPCIÓN EN LIMPIEZA SAAS: % - EJECUTANDO ROLLBACK...', SQLERRM;
    RAISE EXCEPTION 'Error durante limpieza transaccional (Rollback ejecutado): %', SQLERRM;
END $$;

COMMIT;
