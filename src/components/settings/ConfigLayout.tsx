'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { AppLayout } from '@/components/layout';
import { SettingsSidebar } from './SettingsSidebar';

export function ConfigLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { roles, activeRole } = useAuth();

  const isSuperAdmin = activeRole === 'super_admin' || (roles as string[])?.includes('super_admin');
  const isSaasRoute = pathname?.startsWith('/configuracion/saas') || pathname?.startsWith('/configuracion/nuevo-colegio') || pathname?.startsWith('/configuracion/auditoria');

  if (isSaasRoute || (isSuperAdmin && pathname === '/configuracion/saas')) {
    return (
      <AppLayout>
        <div className="w-full min-h-full">
          {children}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hidePadding>
      <div className="flex w-full h-full bg-slate-50/50">
        <SettingsSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AppLayout>
  );
}
