'use client';

import React from 'react';
import { CentroIntegraciones } from '@/components/integrations/CentroIntegraciones';

export default function InstitucionalIntegracionesPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 py-6 px-4 md:px-8 -m-6 rounded-3xl">
      <CentroIntegraciones 
        title="Centro de Integraciones e Interoperabilidad (CII)" 
        subtitle="Biblioteca Institucional de Conectores B2B, Gobierno, Ofimática y Dispositivos" 
      />
    </div>
  );
}
