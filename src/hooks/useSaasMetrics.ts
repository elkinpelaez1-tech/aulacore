import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface SaasMetrics {
  totalTenants: number;
  totalStudents: number;
  totalTeachers: number;
  totalSeds: number;
  activeTenants: number;
  trialingTenants: number;
  suspendedTenants: number;
  mrrCop: number;
  arrCop: number;
  churnRate: number;
  newClientsThisMonth: number;
  totalAlerts: number;
}

export function useSaasMetrics() {
  const [metrics, setMetrics] = useState<SaasMetrics>({
    totalTenants: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalSeds: 0,
    activeTenants: 0,
    trialingTenants: 0,
    suspendedTenants: 0,
    mrrCop: 0,
    arrCop: 0,
    churnRate: 0,
    newClientsThisMonth: 0,
    totalAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      const startTime = performance.now();
      console.log('[PERF AUDIT] [useSaasMetrics] fetchMetrics INICIA');
      try {
        setLoading(true);

        // 1. Conteo de instituciones
        const { count: totalTenants, error: instError } = await supabase
          .from('institutions')
          .select('*', { count: 'exact', head: true });
          
        const { count: totalSeds } = await supabase
          .from('institutions')
          .select('*', { count: 'exact', head: true })
          .eq('organization_type', 'SECRETARIA_EDUCACION');

        // 2. Conteo de estudiantes y docentes
        const { count: totalStudents } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        const { count: totalTeachers } = await supabase
          .from('teacher_onboardings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        // 3. Conteo de Alertas
        const { count: totalAlerts } = await supabase
          .from('saas_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'abierta');

        // 4. Métricas Financieras (Desde la vista materializada)
        const { data: viewData, error: viewError } = await supabase
          .from('saas_metrics_view')
          .select('*')
          .maybeSingle();

        // Fallbacks directos a la tabla institutions si la vista materializada está ausente o desactualizada
        const { count: activeCount } = await supabase.from('institutions').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active');
        const { count: trialingCount } = await supabase.from('institutions').select('*', { count: 'exact', head: true }).eq('subscription_status', 'free_trial');
        const { count: suspendedCount } = await supabase.from('institutions').select('*', { count: 'exact', head: true }).eq('subscription_status', 'suspended');

        const mrr = viewData?.mrr_cop || 0;
        const arr = viewData?.arr_cop || 0;
        const active = viewData?.active_tenants || activeCount || totalTenants || 0;
        const trialing = viewData?.trialing_tenants || trialingCount || 0;
        const suspended = viewData?.suspended_tenants || suspendedCount || 0;

        // Nuevos clientes este mes
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count: newClients } = await supabase
          .from('institutions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString());

        setMetrics({
          totalTenants: totalTenants || 0,
          totalSeds: totalSeds || 0,
          totalStudents: totalStudents || 0,
          totalTeachers: totalTeachers || 0,
          totalAlerts: totalAlerts || 0,
          activeTenants: active,
          trialingTenants: trialing,
          suspendedTenants: suspended,
          mrrCop: mrr,
          arrCop: arr,
          churnRate: 0,
          newClientsThisMonth: newClients || 0
        });

        const duration = (performance.now() - startTime).toFixed(2);
        console.log(`[PERF AUDIT] [useSaasMetrics] fetchMetrics TERMINA (${duration}ms)`, { totalTenants, active, trialing });
      } catch (err: any) {
        const duration = (performance.now() - startTime).toFixed(2);
        console.error(`[PERF AUDIT] [useSaasMetrics] fetchMetrics ERROR (${duration}ms):`, err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  const refetch = async () => {
    // Re-ejecutar conteo
    const { count: totalTenants } = await supabase.from('institutions').select('*', { count: 'exact', head: true });
    const { count: activeCount } = await supabase.from('institutions').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active');
    setMetrics(prev => ({
      ...prev,
      totalTenants: totalTenants || prev.totalTenants,
      activeTenants: activeCount || prev.activeTenants
    }));
  };

  return { metrics, loading, error, refetch };
}
