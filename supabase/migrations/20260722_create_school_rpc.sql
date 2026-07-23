-- =========================================================================================
-- 🛡️ AULACORE ENTERPRISE - P0-05: ATOMIC SCHOOL PROVISIONING RPC & RLS HARDENING
-- =========================================================================================
-- Descripción: Función RPC transaccional atomizada (create_school) como PUNTO ÚNICO DE
--              ENTRADA para el aprovisionamiento de instituciones académicas.
--              Autorización basada EXCLUSIVAMENTE en public.user_roles (role = 'super_admin')
--              utilizando auth.uid(), alineado con la arquitectura de control de acceso de AulaCore.
-- =========================================================================================

-- -----------------------------------------------------------------------------------------
-- 1. POLÍTICAS RLS DE ESCRITURA (INSERT) EXCLUSIVAS PARA SUPER ADMINISTRADOR SaaS
-- -----------------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Superadmin puede insertar instituciones" ON public.institutions;
CREATE POLICY "Superadmin puede insertar instituciones"
  ON public.institutions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Superadmin puede insertar settings academicos" ON public.institution_academic_settings;
CREATE POLICY "Superadmin puede insertar settings academicos"
  ON public.institution_academic_settings FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Superadmin puede insertar años academicos" ON public.academic_years;
CREATE POLICY "Superadmin puede insertar años academicos"
  ON public.academic_years FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Superadmin puede insertar periodos academicos" ON public.academic_periods;
CREATE POLICY "Superadmin puede insertar periodos academicos"
  ON public.academic_periods FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- -----------------------------------------------------------------------------------------
-- 2. FUNCIÓN RPC TRANSACCIONAL ATÓMICA: create_school
-- -----------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_school(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_inst_id uuid;
  v_year_id uuid;
  v_org_type text;
  v_current_year integer;
BEGIN
  v_org_type := COALESCE(p_payload->>'organization_type', 'school');
  v_current_year := EXTRACT(YEAR FROM CURRENT_DATE);

  RAISE LOG '[create_school] Inicio. user=% slug=% tipo=%', auth.uid(), p_payload->>'slug', v_org_type;

  -- 1. Validación estricta de sesión activa y autorización EXCLUSIVA contra public.user_roles
  IF auth.uid() IS NULL THEN
    RAISE LOG '[create_school] ERROR: Intento de invocación sin sesión (auth.uid IS NULL).';
    RAISE EXCEPTION 'Usuario no autenticado. Debe iniciar sesión para aprovisionar organizaciones.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE LOG '[create_school] ERROR: Usuario % denegado. No posee el rol super_admin en public.user_roles.', auth.uid();
    RAISE EXCEPTION 'Acceso denegado. Solo el Super Administrador SaaS registrado en user_roles puede aprovisionar nuevas organizaciones.';
  END IF;

  -- 2. Validaciones obligatorias de negocio en el motor
  IF trim(coalesce(p_payload->>'name', '')) = '' THEN
    RAISE EXCEPTION 'El nombre de la institución es obligatorio.';
  END IF;

  IF trim(coalesce(p_payload->>'slug', '')) = '' THEN
    RAISE EXCEPTION 'El slug de la institución es obligatorio.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.institutions
    WHERE slug = trim(p_payload->>'slug')
  ) THEN
    RAISE EXCEPTION 'Ya existe una institución registrada con ese slug. Por favor elija un slug único.';
  END IF;

  -- 3. Insertar Organización Principal (institutions)
  RAISE LOG '[create_school] Insertando organización principal (tipo: %)...', v_org_type;
  INSERT INTO public.institutions (
    name,
    slug,
    slogan,
    nit,
    dane_code,
    resolution,
    legal_nature,
    rector_name,
    secretary_name,
    email,
    phone,
    primary_color,
    sidebar_color,
    plan_type,
    subscription_status,
    active_modules,
    logo_url,
    organization_type,
    department,
    municipality,
    territorial_type
  )
  VALUES (
    trim(p_payload->>'name'),
    trim(p_payload->>'slug'),
    p_payload->>'slogan',
    NULLIF(trim(p_payload->>'nit'), ''),
    NULLIF(trim(p_payload->>'dane_code'), ''),
    NULLIF(trim(p_payload->>'resolution'), ''),
    COALESCE(p_payload->>'legal_nature', 'Privada'),
    NULLIF(trim(p_payload->>'rector_name'), ''),
    NULLIF(trim(p_payload->>'secretary_name'), ''),
    NULLIF(trim(p_payload->>'email'), ''),
    NULLIF(trim(p_payload->>'phone'), ''),
    COALESCE(p_payload->>'primary_color', '#6366f1'),
    COALESCE(p_payload->>'sidebar_color', 'slate-900'),
    COALESCE(p_payload->>'plan_type', 'free_trial'),
    COALESCE(p_payload->>'subscription_status', 'active'),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_payload->'active_modules')), ARRAY['onboarding']),
    NULLIF(p_payload->>'logo_url', ''),
    v_org_type,
    NULLIF(trim(p_payload->>'department'), ''),
    NULLIF(trim(p_payload->>'municipality'), ''),
    NULLIF(trim(p_payload->>'territorial_type'), '')
  )
  RETURNING id INTO v_new_inst_id;

  RAISE LOG '[create_school] Institución insertada con ID: %', v_new_inst_id;

  -- 4. Si es institución educativa (colegio), generar estructura académica base atómicamente
  IF v_org_type = 'school' THEN
    RAISE LOG '[create_school] Generando estructura académica base (Settings, Año %, Periodos)...', v_current_year;
    
    -- A. Configuración académica por defecto
    INSERT INTO public.institution_academic_settings (
      institution_id,
      grading_scale_type,
      min_passing_grade,
      min_attendance_percentage,
      decimal_places,
      average_calculation_type,
      allow_recovery,
      recovery_max_grade,
      country,
      calendar_type
    )
    VALUES (
      v_new_inst_id,
      'numeric_1_5',
      3.00,
      80.00,
      2,
      'weighted_periods',
      true,
      3.00,
      'Colombia',
      'calendar_a'
    );

    -- B. Año académico activo
    INSERT INTO public.academic_years (
      institution_id,
      year,
      is_active
    )
    VALUES (
      v_new_inst_id,
      v_current_year,
      true
    )
    RETURNING id INTO v_year_id;

    -- C. Periodos académicos por defecto (P1, P2, P3)
    IF v_year_id IS NOT NULL THEN
      INSERT INTO public.academic_periods (
        academic_year_id,
        name,
        code,
        start_date,
        end_date,
        weight,
        status
      )
      VALUES 
        (v_year_id, 'Primer Periodo', 'P1', (v_current_year || '-01-15')::date, (v_current_year || '-04-15')::date, 30.00, 'closed'),
        (v_year_id, 'Segundo Periodo', 'P2', (v_current_year || '-04-16')::date, (v_current_year || '-08-15')::date, 30.00, 'active'),
        (v_year_id, 'Tercer Periodo', 'P3', (v_current_year || '-08-16')::date, (v_current_year || '-11-25')::date, 40.00, 'inactive');
    END IF;

    RAISE LOG '[create_school] Estructura académica creada con éxito. Año ID: %', v_year_id;
  END IF;

  RAISE LOG '[create_school] Aprovisionamiento atómico FINALIZADO y CONFIRMADO para Institución ID: %', v_new_inst_id;

  RETURN jsonb_build_object(
    'success', true,
    'institution_id', v_new_inst_id,
    'academic_year_id', v_year_id,
    'organization_type', v_org_type,
    'message', 'Institución creada y aprovisionada correctamente'
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_school] EXCEPCIÓN CRÍTICA - Ejecutando ROLLBACK total en Institución %: %', p_payload->>'slug', SQLERRM;
    RAISE EXCEPTION 'Error transaccional aprovisionando colegio (Rollback total ejecutado): %', SQLERRM;
END;
$$;

-- -----------------------------------------------------------------------------------------
-- 3. DOCUMENTACIÓN Y PERMISOS DE EJECUCIÓN (REVOKE / GRANT)
-- -----------------------------------------------------------------------------------------
COMMENT ON FUNCTION public.create_school(jsonb)
IS 'Único punto autorizado para aprovisionar instituciones en AulaCore. Valida estricta autenticación y rol super_admin en public.user_roles usando auth.uid().';

REVOKE ALL ON FUNCTION public.create_school(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_school(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_school(jsonb) TO service_role;
