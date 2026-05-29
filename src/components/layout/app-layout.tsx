'use client';

import { Sidebar } from './sidebar-updated';
import { Header } from './header-new';
import { useRole } from '@/providers/role-provider';
import { UserRole } from '@/lib/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
  userName?: string;
  hidePadding?: boolean;
}

export function AppLayout({ children, userRole: _propRole, userName: _propName, hidePadding }: AppLayoutProps) {
  const { userRole, userName, mounted } = useRole();

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

  return (
    <div key={userRole} className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar userRole={userRole} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header userName={userName} userRole={userRole} />

        {/* Page Content */}
        <main className={hidePadding ? "flex-1 overflow-y-auto" : "flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100 p-6"}>
          <div className={hidePadding ? "w-full h-full" : "mx-auto max-w-[1600px] w-full px-2 md:px-6"}>{children}</div>
        </main>
      </div>
    </div>
  );
}
