'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';

export function ParentCalendarWidget() {
  return (
    <Card className="border-slate-200 shadow-sm col-span-1">
      <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-500" />
          Calendario
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          
          <div className="p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 rounded-lg w-12 h-12 shrink-0">
              <span className="text-[10px] font-bold uppercase leading-none">May</span>
              <span className="text-xl font-black leading-tight">28</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Entrega de Boletines P2</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Auditorio Principal • 07:00 AM</p>
            </div>
          </div>

          <div className="p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer opacity-70">
            <div className="flex flex-col items-center justify-center bg-slate-100 text-slate-600 rounded-lg w-12 h-12 shrink-0">
              <span className="text-[10px] font-bold uppercase leading-none">Jun</span>
              <span className="text-xl font-black leading-tight">05</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Escuela de Padres</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Virtual (Teams) • 06:30 PM</p>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
