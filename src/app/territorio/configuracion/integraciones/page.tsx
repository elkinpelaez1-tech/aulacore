'use client';

import React from 'react';
import { TerritoryHeader } from '@/components/territorio/TerritoryHeader';
import { TerritorySidebar } from '@/components/territorio/TerritorySidebar';
import { CentroIntegraciones } from '@/components/integrations/CentroIntegraciones';

export default function TerritorioIntegracionesPage() {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100">
      <TerritorySidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TerritoryHeader />
        
        {/* Contenedor Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <CentroIntegraciones 
            title="Centro de Integraciones e Interoperabilidad (Territorial)" 
            subtitle="Consola Regional de Conexiones Gubernamentales, EdTech y Servicios Aliados" 
          />
        </div>
      </div>
    </div>
  );
}
