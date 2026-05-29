'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/providers/role-provider';
import { AppLayout } from '@/components/layout';
import { AlertsIntelligenceHub } from '@/components/alerts/AlertsIntelligenceHub';

export default function AlertasPage() {
  const { userRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (userRole === 'padre_familia') {
      router.replace('/dashboard');
    }
  }, [userRole, router]);

  if (userRole === 'padre_familia') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-500 font-bold animate-pulse">Redirigiendo al Student Success Center...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Centro Predictivo Institucional</h1>
          <p className="text-sm text-slate-550 font-medium mt-1">Torre de control para detección de riesgos e IA predictiva.</p>
        </div>
        
        <AlertsIntelligenceHub />
      </div>
    </AppLayout>
  );
}
