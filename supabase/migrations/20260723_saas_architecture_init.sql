-- =========================================================================================
-- 🛡️ AULACORE ENTERPRISE - ARQUITECTURA SAAS MULTITENANT (AUDITADA v3 - pgcrypto)
-- =========================================================================================
-- Fecha: 2026-07-23
-- Descripción: Tablas core para Billing, Subscriptions, Licenses, Alerts y Telemetría.
-- =========================================================================================

BEGIN;

-- =========================================================================================
-- 1. SAAS_SUBSCRIPTIONS (Suscripciones Multitenant)
-- =========================================================================================
CREATE TABLE IF NOT EXISTS public.saas_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    plan_name text NOT NULL,
    status text NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'suspended', 'upgraded', 'downgraded')),
    mrr_cop numeric DEFAULT 0,
    trial_ends_at timestamptz,
    current_period_start timestamptz,
    current_period_end timestamptz,
    is_auto_renew boolean DEFAULT true,
    previous_plan_name text,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- =========================================================================================
-- 2. SAAS_LICENSES (Límites y Quotas por Institución)
-- =========================================================================================
CREATE TABLE IF NOT EXISTS public.saas_licenses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    subscription_id uuid REFERENCES public.saas_subscriptions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    max_students integer NOT NULL DEFAULT 0,
    max_teachers integer NOT NULL DEFAULT 0,
    max_storage_gb numeric NOT NULL DEFAULT 5.0,
    features jsonb DEFAULT '{}'::jsonb,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- =========================================================================================
-- 3. SAAS_INVOICES (Facturación)
-- =========================================================================================
CREATE TABLE IF NOT EXISTS public.saas_invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    subscription_id uuid REFERENCES public.saas_subscriptions(id) ON DELETE SET NULL ON UPDATE CASCADE,
    invoice_number text UNIQUE NOT NULL,
    amount_due numeric NOT NULL DEFAULT 0,
    amount_paid numeric NOT NULL DEFAULT 0,
    status text NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    due_date timestamptz NOT NULL,
    invoice_pdf_url text,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- =========================================================================================
-- 4. SAAS_PAYMENTS (Pagos con soporte multi-pasarela)
-- =========================================================================================
CREATE TABLE IF NOT EXISTS public.saas_payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    invoice_id uuid NOT NULL REFERENCES public.saas_invoices(id) ON DELETE CASCADE ON UPDATE CASCADE,
    amount numeric NOT NULL,
    payment_method text NOT NULL,
    payment_gateway text NOT NULL DEFAULT 'manual' CHECK (payment_gateway IN ('manual', 'stripe', 'wompi', 'payu', 'mercadopago')),
    gateway_transaction_id text,
    reference_code text,
    payment_date timestamptz DEFAULT now() NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- =========================================================================================
-- 5. SAAS_ALERTS (Centro de Alertas)
-- =========================================================================================
CREATE TABLE IF NOT EXISTS public.saas_alerts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    category text NOT NULL CHECK (category IN ('inactividad', 'licencia', 'ia_quota', 'simat_error', 'backup_status', 'seguridad')),
    priority text NOT NULL CHECK (priority IN ('critica', 'alta', 'media', 'baja')),
    title text NOT NULL,
    description text NOT NULL,
    suggested_action text,
    status text NOT NULL DEFAULT 'abierta' CHECK (status IN ('abierta', 'en_proceso', 'resuelta')),
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    resolved_at timestamptz,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- =========================================================================================
-- 6. SAAS_ACTIVITY_LOGS (Auditoría Super Admin)
-- =========================================================================================
CREATE TABLE IF NOT EXISTS public.saas_activity_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    action_type text NOT NULL,
    resource_type text NOT NULL,
    resource_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- =========================================================================================
-- 7. SAAS_METRICS_VIEW (Vista Materializada Virtual Idempotente)
-- =========================================================================================
CREATE OR REPLACE VIEW public.saas_metrics_view AS
SELECT 
    COUNT(DISTINCT i.id) as total_tenants,
    COUNT(DISTINCT CASE WHEN s.status = 'active' THEN i.id END) as active_tenants,
    COUNT(DISTINCT CASE WHEN s.status = 'trialing' THEN i.id END) as trialing_tenants,
    COUNT(DISTINCT CASE WHEN s.status = 'suspended' THEN i.id END) as suspended_tenants,
    COALESCE(SUM(CASE WHEN s.status = 'active' THEN s.mrr_cop ELSE 0 END), 0) as mrr_cop,
    COALESCE(SUM(CASE WHEN s.status = 'active' THEN s.mrr_cop * 12 ELSE 0 END), 0) as arr_cop
FROM public.institutions i
LEFT JOIN public.saas_subscriptions s ON i.id = s.institution_id;

-- =========================================================================================
-- ÍNDICES PARA RENDIMIENTO EN ESCALA (Idempotentes)
-- =========================================================================================
CREATE INDEX IF NOT EXISTS idx_saas_subs_inst ON public.saas_subscriptions(institution_id);
CREATE INDEX IF NOT EXISTS idx_saas_subs_status ON public.saas_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_saas_licenses_inst ON public.saas_licenses(institution_id);
CREATE INDEX IF NOT EXISTS idx_saas_invoices_inst ON public.saas_invoices(institution_id);
CREATE INDEX IF NOT EXISTS idx_saas_invoices_status ON public.saas_invoices(status);
CREATE INDEX IF NOT EXISTS idx_saas_payments_inst ON public.saas_payments(institution_id);
CREATE INDEX IF NOT EXISTS idx_saas_payments_inv ON public.saas_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_saas_alerts_inst ON public.saas_alerts(institution_id);
CREATE INDEX IF NOT EXISTS idx_saas_alerts_status ON public.saas_alerts(status);
CREATE INDEX IF NOT EXISTS idx_saas_alerts_prio ON public.saas_alerts(priority);
CREATE INDEX IF NOT EXISTS idx_saas_logs_inst ON public.saas_activity_logs(institution_id);

-- =========================================================================================
-- CONFIGURACIÓN DE SEGURIDAD (RLS) - SÓLO SUPER ADMINS
-- =========================================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.saas_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_activity_logs ENABLE ROW LEVEL SECURITY;

-- Crear o reemplazar función helper de super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    );
$$;

-- Eliminar políticas previas si existen (Idempotencia)
DROP POLICY IF EXISTS "Super admins can manage saas_subscriptions" ON public.saas_subscriptions;
DROP POLICY IF EXISTS "Super admins can manage saas_licenses" ON public.saas_licenses;
DROP POLICY IF EXISTS "Super admins can manage saas_invoices" ON public.saas_invoices;
DROP POLICY IF EXISTS "Super admins can manage saas_payments" ON public.saas_payments;
DROP POLICY IF EXISTS "Super admins can manage saas_alerts" ON public.saas_alerts;
DROP POLICY IF EXISTS "Super admins can manage saas_activity_logs" ON public.saas_activity_logs;

-- Crear políticas limpias
CREATE POLICY "Super admins can manage saas_subscriptions" ON public.saas_subscriptions FOR ALL USING (public.is_super_admin());
CREATE POLICY "Super admins can manage saas_licenses" ON public.saas_licenses FOR ALL USING (public.is_super_admin());
CREATE POLICY "Super admins can manage saas_invoices" ON public.saas_invoices FOR ALL USING (public.is_super_admin());
CREATE POLICY "Super admins can manage saas_payments" ON public.saas_payments FOR ALL USING (public.is_super_admin());
CREATE POLICY "Super admins can manage saas_alerts" ON public.saas_alerts FOR ALL USING (public.is_super_admin());
CREATE POLICY "Super admins can manage saas_activity_logs" ON public.saas_activity_logs FOR ALL USING (public.is_super_admin());

COMMIT;
