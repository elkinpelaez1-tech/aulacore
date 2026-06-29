'use client';

import React from 'react';
import { TerritorySidebar } from './TerritorySidebar';
import { TerritoryHeader } from './TerritoryHeader';

interface TerritoryLayoutProps {
  children: React.ReactNode;
}

export function TerritoryLayout({ children }: TerritoryLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar de navegación territorial */}
      <TerritorySidebar />

      {/* Columna derecha de contenido */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Cabecera del portal territorial */}
        <TerritoryHeader />

        {/* Contenido principal scrollable */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
