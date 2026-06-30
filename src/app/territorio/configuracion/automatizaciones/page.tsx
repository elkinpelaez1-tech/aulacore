'use client';

import React from 'react';
import { CentroAutomatizaciones } from '@/components/territorio/CentroAutomatizaciones';
import { ShieldAlert } from 'lucide-react';

export default function TerritoryAutomatizacionesPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-650" /> Centro de Automatizaciones (MIO)
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Administración de recetas del Motor de Inteligencia Operativa y protocolos institucionales del territorio.
          </p>
        </div>
      </div>

      {/* Consola administrativa MIO */}
      <CentroAutomatizaciones />
    </div>
  );
}
