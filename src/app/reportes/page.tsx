'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/providers/role-provider';
import { AppLayout } from '@/components/layout';
import { ReportsIntelligenceHub } from '@/components/reports/ReportsIntelligenceHub';

export default function ReportesPage() {
  const { userRole, mounted } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (mounted && userRole === 'secretaria') {
      router.replace('/dashboard');
    }
  }, [userRole, mounted, router]);

  if (userRole === 'secretaria') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-500 font-bold animate-pulse">Acceso denegado. Redirigiendo...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Centro de Inteligencia Institucional</h1>
          <p className="text-sm text-slate-550 font-medium mt-1">Dashboard analítico consolidado para toma de decisiones ejecutivas.</p>
        </div>
        
        <ReportsIntelligenceHub />
      </div>
    </AppLayout>
  );
}
