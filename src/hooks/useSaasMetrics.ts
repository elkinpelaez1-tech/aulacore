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

        const mrr = viewData?.mrr_cop || 0;
        const arr = viewData?.arr_cop || 0;
        const active = viewData?.active_tenants || 0;
        const trialing = viewData?.trialing_tenants || 0;
        const suspended = viewData?.suspended_tenants || 0;

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

      } catch (err: any) {
        console.error('Error fetching SaaS metrics:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
}
