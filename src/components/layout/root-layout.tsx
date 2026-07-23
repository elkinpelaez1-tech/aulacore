'use client';

import { Sidebar } from './sidebar-updated';
import { Header } from './header-new';
import { useRole } from '@/providers/role-provider';
import { useAuth } from '@/providers/auth-provider';
import { UserRole } from '@/lib/navigation';

interface RootLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
  userName?: string;
}

export function RootLayout({ children, userRole: _propRole, userName: _propName }: RootLayoutProps) {
  const { userRole, userName, mounted, activeInstitution } = useRole();
  const { loading, isAuthenticated, signOut } = useAuth();

  console.log('[RootLayout] Rendering', { mounted, loading, isAuthenticated, userRole });

  if (!mounted || loading) {
    console.log('[RootLayout] Showing loading spinner');
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-500 font-medium text-sm">Cargando AulaCore...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && !userRole) {
    console.log('[RootLayout] User authenticated but no role. Showing Access Denied.');
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-6 bg-white shadow-xl border border-slate-200 rounded-2xl max-w-sm">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2 border border-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Acceso Denegado</h2>
          <p className="text-sm text-slate-500">
            Tu cuenta no tiene ningún rol asignado en el sistema. Contacta al administrador institucional.
          </p>
          <button 
            onClick={signOut} 
            className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition shadow-sm w-full"
          >
            Cerrar Sesión y Volver
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userRole) {
    return null;
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
