'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle, Clock, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ParentAlertsPanel() {
  return (
    <Card className="border-slate-200 shadow-sm col-span-1">
      <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            Alertas Importantes
          </CardTitle>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600">2</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          
          <div className="p-4 bg-rose-50/30 hover:bg-rose-50/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-1">
                <FileWarning className="w-4 h-4 text-rose-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-slate-800">Riesgo Académico</h4>
                  <span className="text-[10px] font-bold text-rose-500 uppercase">Alta Prioridad</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  Alejandro tiene promedio de 2.8 en Física. Se requiere atención inmediata antes del cierre de periodo.
                </p>
                <Button variant="link" className="p-0 h-auto text-xs font-bold text-rose-700 mt-2">
                  Agendar Tutoría
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-1">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-slate-800">Llegada Tarde</h4>
                  <span className="text-[10px] font-bold text-slate-400">Hace 2 días</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  Ingreso a la institución a las 7:15 AM (15 mins de retraso).
                </p>
                <Button variant="link" className="p-0 h-auto text-xs font-bold text-indigo-600 mt-2">
                  Enviar Justificación
                </Button>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
