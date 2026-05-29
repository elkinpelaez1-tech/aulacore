'use client';

import React from 'react';
import { MOCK_STUDENTS } from '@/lib/data/mock-students';
import { Users, TrendingDown, ShieldAlert, UserCheck, UserPlus, RefreshCcw, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StudentMetricsPanel() {
  const total = MOCK_STUDENTS.length;
  
  // Row 1 metrics
  const academicRisk = MOCK_STUDENTS.filter(s => s.academicRisk === 'Alto').length;
  const behaviorRisk = MOCK_STUDENTS.filter(s => s.behaviorRisk === 'Alto').length;
  
  // Row 2 metrics
  const active = MOCK_STUDENTS.filter(s => s.status === 'Activo').length;
  const newStudents = MOCK_STUDENTS.filter(s => s.enrollmentType === 'Nuevo').length;
  const repeaters = MOCK_STUDENTS.filter(s => s.enrollmentType === 'Repitente').length;
  const withdrawn = MOCK_STUDENTS.filter(s => s.status === 'Retirado').length;

  // Distributions
  const levels = ['Preescolar', 'Primaria', 'Bachillerato', 'Media Técnica'];
  const campusGroups = Array.from(new Set(MOCK_STUDENTS.map(s => s.campus)));
  const shifts = Array.from(new Set(MOCK_STUDENTS.map(s => s.shift)));

  const getPercent = (count: number) => total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 mb-6">
      
      {/* ROW 1: Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Total (Hero KPI) */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
            <Users className="w-32 h-32 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Total Estudiantes</p>
            <div className="flex justify-between items-start gap-4">
              <p className="text-4xl sm:text-5xl font-black text-white leading-none">{total}</p>
              
              <div className="flex gap-2">
                <div className="bg-white/10 backdrop-blur border border-white/10 rounded-lg p-2 flex flex-col items-center justify-center min-w-[3rem]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pre</span>
                  <span className="text-sm font-black text-white">{MOCK_STUDENTS.filter(s => s.level === 'Preescolar').length}</span>
                </div>
                <div className="bg-white/10 backdrop-blur border border-white/10 rounded-lg p-2 flex flex-col items-center justify-center min-w-[3rem]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pri</span>
                  <span className="text-sm font-black text-white">{MOCK_STUDENTS.filter(s => s.level === 'Primaria').length}</span>
                </div>
                <div className="bg-white/10 backdrop-blur border border-white/10 rounded-lg p-2 flex flex-col items-center justify-center min-w-[3rem]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Bac</span>
                  <span className="text-sm font-black text-white">{MOCK_STUDENTS.filter(s => s.level === 'Bachillerato').length}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Niños</span>
              <span className="text-sm text-slate-300 font-semibold">{MOCK_STUDENTS.filter(s => s.gender === 'Niño').length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Niñas</span>
              <span className="text-sm text-slate-300 font-semibold">{MOCK_STUDENTS.filter(s => s.gender === 'Niña').length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Diversos</span>
              <span className="text-sm text-slate-300 font-semibold">{MOCK_STUDENTS.filter(s => s.gender === 'Diverso').length}</span>
            </div>
          </div>
        </div>

        {/* Academic Risk */}
        <div className="col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 text-rose-500">
            <div className="p-1.5 bg-rose-50 rounded-lg"><TrendingDown className="w-4 h-4" /></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Riesgo Acad.</p>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-800">{academicRisk}</p>
            <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-wider">Nivel Alto</p>
          </div>
        </div>

        {/* Behavior Risk */}
        <div className="col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 text-amber-500">
            <div className="p-1.5 bg-amber-50 rounded-lg"><ShieldAlert className="w-4 h-4" /></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Riesgo Conv.</p>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-800">{behaviorRisk}</p>
            <p className="text-[10px] font-bold text-amber-500 mt-1 uppercase tracking-wider">Nivel Alto</p>
          </div>
        </div>

        {/* Level Distribution */}
        <div className="col-span-1 md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Nivel Educativo</p>
          <div className="space-y-3 w-full">
            {levels.map(level => {
              const count = MOCK_STUDENTS.filter(s => s.level === level).length;
              if (count === 0) return null;
              const pct = getPercent(count);
              return (
                <div key={level} className="w-full">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>{level}</span>
                    <span className="text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ROW 2: Status & Operational Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        
        {/* Status Blocks */}
        <div className="col-span-2 md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3 text-emerald-500">
              <UserCheck className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Activos</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{active}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3 text-blue-500">
              <UserPlus className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nuevos</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{newStudents}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3 text-amber-500">
              <RefreshCcw className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Repitentes</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{repeaters}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3 text-rose-500">
              <UserMinus className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Retirados</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{withdrawn}</p>
          </div>
        </div>

        {/* Campus Distribution */}
        <div className="col-span-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Sedes</p>
          <div className="space-y-2.5">
            {campusGroups.map(campus => {
              const count = MOCK_STUDENTS.filter(s => s.campus === campus).length;
              const pct = getPercent(count);
              return (
                <div key={campus} className="w-full">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                    <span className="truncate mr-2">{campus}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shift Distribution */}
        <div className="col-span-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Jornadas</p>
          <div className="space-y-2.5">
            {shifts.map(shift => {
              const count = MOCK_STUDENTS.filter(s => s.shift === shift).length;
              const pct = getPercent(count);
              return (
                <div key={shift} className="w-full">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                    <span className="truncate mr-2">{shift}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
