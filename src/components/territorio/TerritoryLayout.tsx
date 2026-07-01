'use client';

import React from 'react';
import { TerritorySidebar } from './TerritorySidebar';
import { TerritoryHeader } from './TerritoryHeader';
import { AulaHelpIA } from './AulaHelpIA';

interface TerritoryLayoutProps {
  children: React.ReactNode;
}

export function TerritoryLayout({ children }: TerritoryLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    const handleClose = () => setIsMobileOpen(false);

    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    window.addEventListener('close-mobile-sidebar', handleClose);
    
    return () => {
      window.removeEventListener('toggle-mobile-sidebar', handleToggle);
      window.removeEventListener('close-mobile-sidebar', handleClose);
    };
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Mobile Sidebar Overlay (Sliding Drawer) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer" 
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Sidebar Drawer container */}
          <div className="relative w-64 h-full flex flex-col bg-slate-900 shadow-2xl animate-slide-in">
            {/* Close button float */}
            <div className="absolute right-4 top-4 z-50">
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer border-none shadow-sm font-bold text-xs"
              >
                ✕
              </button>
            </div>
            {/* Render territory sidebar inside drawer */}
            <TerritorySidebar />
          </div>
        </div>
      )}

      {/* Desktop Sidebar (hidden on mobile, visible on lg+) */}
      <div className="hidden lg:flex shrink-0">
        <TerritorySidebar />
      </div>

      {/* Columna derecha de contenido */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Cabecera del portal territorial */}
        <TerritoryHeader />

        {/* Contenido principal scrollable */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {children}
        </main>
      </div>

      {/* Asistente Inteligente Global AulaHelp IA */}
      <AulaHelpIA />
    </div>
  );
}
