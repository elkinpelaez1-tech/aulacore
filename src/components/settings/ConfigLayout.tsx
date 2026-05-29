'use client';

import React from 'react';
import { AppLayout } from '@/components/layout';
import { SettingsSidebar } from './SettingsSidebar';

export function ConfigLayout({ children }: { children: React.ReactNode }) {
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
