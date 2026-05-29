'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, CalendarDays, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ParentSemaforo() {
  return (
    <Card className="border-slate-200 shadow-sm flex flex-col h-full">
      <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-base font-bold text-slate-800">
          Semáforo Escolar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col justify-center gap-4">
        
        {/* Académico */}
        <div className="flex items-center gap-4 p-3 rounded-xl border border-emerald-100 bg-emerald-50/50">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Académico</h4>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xs font-semibold text-emerald-700 mt-0.5">Rendimiento óptimo (4.5 Promedio)</p>
          </div>
        </div>

        {/* Asistencia */}
        <div className="flex items-center gap-4 p-3 rounded-xl border border-emerald-100 bg-emerald-50/50">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Asistencia</h4>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xs font-semibold text-emerald-700 mt-0.5">Sin inasistencias este mes</p>
          </div>
        </div>

        {/* Convivencia */}
        <div className="flex items-center gap-4 p-3 rounded-xl border border-amber-200 bg-amber-50">
          <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Convivencia</h4>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xs font-semibold text-amber-800 mt-0.5">1 observación leve en descanso</p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
