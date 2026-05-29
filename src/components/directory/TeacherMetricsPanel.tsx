'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, GraduationCap, Building2, UserCog, AlertTriangle, AlertCircle, FileWarning } from 'lucide-react';
import { MOCK_TEACHERS } from '@/lib/data/mock-teachers';

export function TeacherMetricsPanel() {
  const totalTeachers = MOCK_TEACHERS.length;
  const totalPrimaria = MOCK_TEACHERS.filter(t => t.level === 'Primaria').length;
  const totalBachillerato = MOCK_TEACHERS.filter(t => t.level === 'Bachillerato').length;
  const totalCoordinators = MOCK_TEACHERS.filter(t => t.level === 'Coordinación Académica').length;
  
  const inClassNow = MOCK_TEACHERS.filter(t => t.status === 'En clase').length;
  const overloaded = MOCK_TEACHERS.filter(t => t.status === 'Sobrecarga académica').length;
  const pendingPlanning = MOCK_TEACHERS.filter(t => t.alerts.some(a => a.type === 'planeacion_atrasada')).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      
      {/* KPI 1 */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2 text-indigo-500">
          <Users className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Docentes</p>
        </div>
        <p className="text-2xl font-black text-slate-800">{totalTeachers}</p>
      </div>

      {/* KPI 2 */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2 text-blue-500">
          <Building2 className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Primaria</p>
        </div>
        <p className="text-2xl font-black text-slate-800">{totalPrimaria}</p>
      </div>

      {/* KPI 3 */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2 text-emerald-500">
          <GraduationCap className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bachillerato</p>
        </div>
        <p className="text-2xl font-black text-slate-800">{totalBachillerato}</p>
      </div>

      {/* KPI 4 */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2 text-amber-500">
          <UserCog className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Coordinadores</p>
        </div>
        <p className="text-2xl font-black text-slate-800">{totalCoordinators}</p>
      </div>

      {/* KPI 5 */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2 text-indigo-400">
          <AlertCircle className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">En Clase</p>
        </div>
        <p className="text-2xl font-black text-indigo-600">{inClassNow}</p>
      </div>

      {/* KPI 6 */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2 text-rose-500">
          <AlertTriangle className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Sobrecarga</p>
        </div>
        <p className="text-2xl font-black text-rose-700">{overloaded}</p>
      </div>

      {/* KPI 7 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2 text-amber-500">
          <FileWarning className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Plan. Pendientes</p>
        </div>
        <p className="text-2xl font-black text-amber-700">{pendingPlanning}</p>
      </div>

    </div>
  );
}
