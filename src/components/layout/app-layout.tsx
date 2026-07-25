'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './sidebar-updated';
import { Header } from './header-new';
import { useRole } from '@/providers/role-provider';
import { useAuth } from '@/providers/auth-provider';
import { UserRole } from '@/lib/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
  userName?: string;
  hidePadding?: boolean;
}

export function AppLayout({ children, userRole: _propRole, userName: _propName, hidePadding }: AppLayoutProps) {
  const { userRole, userName, mounted, activeInstitution } = useRole();
  const { loading, isAuthenticated, signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  console.log('[AppLayout] Rendering State:', { mounted, loading, isAuthenticated, userRole });

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    const handleClose = () => setIsMobileOpen(false);

    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    window.addEventListener('close-mobile-sidebar', handleClose);
    
    return () => {
      window.removeEventListener('toggle-mobile-sidebar', handleToggle);
      window.removeEventListener('close-mobile-sidebar', handleClose);
    };
  }, []);

  // PROTECCIÓN P0: Si el estado de carga dura más de 5 segundos, se fuerza la desactivación del spinner
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!mounted || loading) {
      timer = setTimeout(() => {
        console.error('BLOQUEADO EN: AppLayout (el tiempo de carga superó los 5 segundos)');
        setHasTimedOut(true);
      }, 5000);
    } else {
      setHasTimedOut(false);
    }
    return () => clearTimeout(timer);
  }, [mounted, loading]);

  if ((!mounted || loading) && !hasTimedOut) {
    console.log('[AppLayout] Showing loading spinner');
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-500 font-medium text-sm">Cargando AulaCore...</div>
        </div>
      </div>
    );
  }

  if (hasTimedOut && (!mounted || loading)) {
    console.error('[AppLayout] Loading timeout exceeded (5s). Hiding spinner and rendering real error UI.');
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center p-6 text-center">
        <div className="bg-white border border-red-200 shadow-2xl rounded-3xl p-8 max-w-md space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black border border-red-100">
            ⚠️
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Error de Carga de Sesión</h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            BLOQUEADO EN: Carga de sesión de usuario (superó los 5 segundos máximos).
          </p>
          <div className="pt-2">
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              Reiniciar Inicio de Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && !userRole) {
    console.log('[AppLayout] User authenticated but no role. Showing Access Denied.');
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
    <div key={userRole} className="flex h-screen bg-white overflow-hidden">
      <style>{`
        :root {
          --primary: ${primaryColor};
        }
      `}</style>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer" 
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-60 h-full flex flex-col bg-slate-900 shadow-2xl animate-slide-in">
            <div className="absolute right-4 top-4 z-50">
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <Sidebar currentRole={userRole} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <Sidebar currentRole={userRole} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header userRole={userRole} userName={userName} />
        <main className={`flex-1 overflow-y-auto bg-slate-50/50 ${hidePadding ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
