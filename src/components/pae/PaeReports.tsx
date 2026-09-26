'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, Download, CheckCircle2, 
  BarChart3, Calendar 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaeReportsProps {
  userRole: string;
}

export function PaeReports({ userRole }: PaeReportsProps) {

  const reports = [
    {
      id: 'rep-monthly',
      title: 'Informe Mensual de Entregas PAE',
      description: 'Consolidado de raciones programadas frente a raciones entregadas y cálculo de faltantes.',
      period: 'Mayo 2026',
      icon: FileText
    },
    {
      id: 'rep-purchases',
      title: 'Informe de Compras Locales Agrícolas',
      description: 'Relación de compras a productores del municipio y porcentaje frente a la meta legal del 20%.',
      period: 'Acumulado Vigencia',
      icon: BarChart3
    },
    {
      id: 'rep-cae',
      title: 'Actas y Gestión del Comité CAE',
      description: 'Compilado de actas de sesiones ordinarias del Comité de Alimentación Escolar y compromisos correctivos.',
      period: 'Bimestre I y II 2026',
      icon: Calendar
    },
    {
      id: 'rep-incidents',
      title: 'Reporte de Alertas e Incidencias Sanitarias',
      description: 'Historial de incidencias reportadas (calidad de insumos, demoras) y trazabilidad de atención de emergencias ETA.',
      period: 'Vigencia actual',
      icon: FileText
    }
  ];

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((r) => (
          <Card key={r.id} className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-650 shrink-0">
                  <r.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">{r.title}</h3>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-450 mt-0.5 block">{r.period}</span>
                </div>
              </div>
              <p className="text-xs text-slate-550 font-medium leading-relaxed">
                {r.description}
              </p>
            </CardContent>

            <div className="bg-slate-50 border-t border-slate-100 p-4">
              <Button
                variant="outline"
                disabled
                className="w-full bg-white border-slate-200 text-slate-400 font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Generación de reportes próximamente</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
    </div>
  );
}
