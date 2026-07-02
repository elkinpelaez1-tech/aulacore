'use client';

import React from 'react';
import { CentroIntegraciones } from '@/components/integrations/CentroIntegraciones';

export default function TerritorioIntegracionesPage() {
  return (
    <div className="p-6">
      <CentroIntegraciones 
        title="Centro de Integraciones e Interoperabilidad (Territorial)" 
        subtitle="Consola Regional de Conexiones Gubernamentales, EdTech y Servicios Aliados" 
      />
    </div>
  );
}
