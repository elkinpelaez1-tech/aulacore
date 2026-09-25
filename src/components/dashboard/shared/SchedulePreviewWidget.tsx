import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Layers } from 'lucide-react';
import Link from 'next/link';

interface Props {
  role: 'coordinator' | 'director';
  title?: string;
  courseName?: string;
}

export function SchedulePreviewWidget({ role, title = 'Planeación de Horarios por Materia', courseName }: Props) {
  return (
    <Card className="border-slate-200 shadow-sm bg-white rounded-xl h-full flex flex-col">
      <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          {title} {courseName && <span className="text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full text-[10px] ml-1">{courseName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        <div className="text-center flex flex-col items-center justify-center my-auto py-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-black text-slate-800 mb-1">
            No hay horarios institucionales registrados
          </h4>
          <p className="text-[11px] text-slate-500 max-w-xs font-medium">
            Los horarios y asignaciones académicas por docente se mostrarán aquí una vez parametrizados.
          </p>
        </div>
        
        <div className="pt-3 border-t border-slate-100 mt-auto">
          <Link href="/mallas">
            <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs h-8 flex items-center gap-2">
              <Layers className="w-3 h-3" />
              Ver Centro Académico Institucional
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

