-- =========================================================================================
-- 🛡️ AULACORE ENTERPRISE - CONSULTA DE DIAGNÓSTICO Y VALIDACIÓN PRE-LIMPIEZA (100% READ-ONLY)
-- =========================================================================================
-- Descripción: Consulta SQL de solo lectura para auditar la base de datos real en vivo.
--              No realiza NINGÚN cambio, DELETE, ni TRUNCATE.
--              Ejecuta este archivo en el SQL Editor de Supabase para obtener:
--              1. El listado exacto de instituciones actuales que serán clasificadas para limpieza.
--              2. El conteo exacto de registros que se eliminarán por cada tabla relacionada.
-- =========================================================================================

-- -----------------------------------------------------------------------------------------
-- CONSULTA 1: LISTADO EXACTO DE INSTITUCIONES EN LA BASE DE DATOS REAL
-- -----------------------------------------------------------------------------------------
SELECT 
  id,
  name,
  slug,
  organization_type,
  created_at
FROM public.institutions
ORDER BY created_at ASC;

-- -----------------------------------------------------------------------------------------
-- CONSULTA 2: CONTEO EXACTO DE REGISTROS A ELIMINAR POR TABLA RELACIONADA
-- (Cálculo en vivo sin asumir nombres ni hardcodear IDs, excluyendo perfiles y super admins)
-- -----------------------------------------------------------------------------------------
WITH demo_inst AS (
  SELECT id FROM public.institutions
)
SELECT 'pae_financial_resources' AS tabla_relacionada, count(*)::integer AS registros_a_eliminar 
FROM public.pae_financial_resources WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_prioritization', count(*)::integer FROM public.pae_prioritization WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_infrastructure_diagnostic', count(*)::integer FROM public.pae_infrastructure_diagnostic WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_operators', count(*)::integer FROM public.pae_operators WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_team', count(*)::integer FROM public.pae_team WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_menu_cycles', count(*)::integer FROM public.pae_menu_cycles WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_beneficiaries', count(*)::integer FROM public.pae_beneficiaries WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_daily_deliveries', count(*)::integer FROM public.pae_daily_deliveries WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_daily_attendance', count(*)::integer FROM public.pae_daily_attendance WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_controls', count(*)::integer FROM public.pae_controls WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_local_purchases', count(*)::integer FROM public.pae_local_purchases WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_incidents', count(*)::integer FROM public.pae_incidents WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_spqr', count(*)::integer FROM public.pae_spqr WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_improvement_plans', count(*)::integer FROM public.pae_improvement_plans WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_committees', count(*)::integer FROM public.pae_committees WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pae_mesas_publicas', count(*)::integer FROM public.pae_mesas_publicas WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'teacher_onboardings', count(*)::integer FROM public.teacher_onboardings WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'student_onboardings', count(*)::integer FROM public.student_onboardings WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'institution_documents', count(*)::integer FROM public.institution_documents WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'migration_audit_logs', count(*)::integer FROM public.migration_audit_logs WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pei_identity', count(*)::integer FROM public.pei_identity WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pei_pedagogical_model', count(*)::integer FROM public.pei_pedagogical_model WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pei_school_government', count(*)::integer FROM public.pei_school_government WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pei_manual_versions', count(*)::integer FROM public.pei_manual_versions WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'pei_projects', count(*)::integer FROM public.pei_projects WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'curriculum_areas', count(*)::integer FROM public.curriculum_areas WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'students', count(*)::integer FROM public.students WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'courses', count(*)::integer FROM public.courses WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'academic_years', count(*)::integer FROM public.academic_years WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'institution_academic_settings', count(*)::integer FROM public.institution_academic_settings WHERE institution_id IN (SELECT id FROM demo_inst)
UNION ALL
SELECT 'user_roles (NO super_admin)', count(*)::integer FROM public.user_roles WHERE institution_id IN (SELECT id FROM demo_inst) AND role != 'super_admin'
UNION ALL
SELECT 'user_roles (SUPER ADMIN - INTOCABLE)', 0::integer
UNION ALL
SELECT 'profiles (INTOCABLE - SE CONSERVAN AL 100%)', 0::integer
ORDER BY tabla_relacionada ASC;
