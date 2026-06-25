'use client';

import { Sidebar } from './sidebar-updated';
import { Header } from './header-new';
import { useRole } from '@/providers/role-provider';
import { UserRole } from '@/lib/navigation';

interface RootLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
  userName?: string;
}

export function RootLayout({ children, userRole: _propRole, userName: _propName }: RootLayoutProps) {
  const { userRole, userName, mounted, activeInstitution } = useRole();

  if (!mounted) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-500 font-medium text-sm">Iniciando AulaCore...</div>
        </div>
      </div>
    );
  }

  const primaryColor = activeInstitution?.primary_color || '#6366f1';

  return (
    <div className="flex h-screen bg-white">
      <style>{`
        :root {
          --primary: ${primaryColor};
        }
      `}</style>
      {/* Sidebar */}
      <Sidebar userRole={userRole} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header userName={userName} userRole={userRole} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
