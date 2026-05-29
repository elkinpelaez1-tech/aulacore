'use client';

import React from 'react';
import { GLOBAL_KPI_MOCKS } from '@/lib/data/mock-reports';
import { Users, GraduationCap, Activity, AlertTriangle, ShieldAlert, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ExecutiveKPIs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Total Students */}
      <div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -top-4 -right-4 p-4 opacity-10 pointer-events-none transition-transform group-hover:scale-110">
          <Users className="w-40 h-40 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Población Estudiantil</p>
          <div className="flex items-baseline gap-3">
            <p className="text-5xl font-black text-white leading-none">{GLOBAL_KPI_MOCKS.totalStudents}</p>
            <p className="text-sm font-bold text-emerald-400">+12% vs año ant.</p>
          </div>
        </div>
      </div>

      {/* Institutional GPA */}
      <div className="col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-4 text-indigo-600">
          <GraduationCap className="w-5 h-5" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">GPA Institucional</p>
        </div>
        <p className="text-4xl font-black text-slate-800">{GLOBAL_KPI_MOCKS.institutionalGpa.toFixed(1)}</p>
        <p className="text-xs font-bold text-slate-400 mt-2">Promedio general</p>
      </div>

      {/* Institutional Attendance */}
      <div className="col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-4 text-emerald-500">
          <Activity className="w-5 h-5" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Asistencia Global</p>
        </div>
        <p className="text-4xl font-black text-emerald-600">{GLOBAL_KPI_MOCKS.institutionalAttendance}%</p>
        <p className="text-xs font-bold text-slate-400 mt-2">Lectura RFID</p>
      </div>

      {/* Risk Metrics Row */}
      <div className="col-span-1 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-rose-500 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cursos Críticos</p>
            </div>
            <p className="text-2xl font-black text-rose-600">{GLOBAL_KPI_MOCKS.criticalCoursesCount}</p>
          </div>
          <button className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors">Analizar</button>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-amber-500 mb-1">
              <UserMinus className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Riesgo Deserción</p>
            </div>
            <p className="text-2xl font-black text-amber-600">{GLOBAL_KPI_MOCKS.dropoutRiskStudents}</p>
          </div>
          <button className="text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors">Prevenir</button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <ShieldAlert className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Docentes con Alerta</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{GLOBAL_KPI_MOCKS.teachersWithAlerts}</p>
          </div>
          <button className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">Ver</button>
        </div>

      </div>
    </div>
  );
}
