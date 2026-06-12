'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, GraduationCap, Building2, UserCog, AlertTriangle, AlertCircle, FileWarning } from 'lucide-react';
import { TeacherMockData } from '@/lib/data/mock-teachers';
import { cn } from '@/lib/utils';

interface TeacherMetricsPanelProps {
  teachers: TeacherMockData[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function TeacherMetricsPanel({ teachers, activeFilter, onFilterChange }: TeacherMetricsPanelProps) {
  const totalTeachers = teachers.length;
  const totalPrimaria = teachers.filter(t => t.level === 'Primaria').length;
  const totalBachillerato = teachers.filter(t => t.level === 'Bachillerato').length;
  const totalCoordinators = teachers.filter(t => t.level === 'Coordinación Académica').length;
  
  const inClassNow = teachers.filter(t => t.status === 'En clase').length;
  const overloaded = teachers.filter(t => t.status === 'Sobrecarga académica').length;
  const pendingPlanning = teachers.filter(t => t.alerts.some(a => a.type === 'planeacion_atrasada')).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      
      {/* KPI 1 */}
      <div 
        onClick={() => onFilterChange('Todos')}
        className={cn(
          "bg-white border rounded-xl p-3 shadow-sm flex flex-col justify-between cursor-pointer hover:border-indigo-400 hover:shadow transition-all",
          activeFilter === 'Todos' ? "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/40" : "border-slate-200"
        )}
      >
        <div className="flex items-center gap-2 mb-2 text-indigo-500">
          <Users className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Docentes</p>
        </div>
        <p className="text-2xl font-black text-slate-800">{totalTeachers}</p>
      </div>

      {/* KPI 2 */}
      <div 
        onClick={() => onFilterChange('Primaria')}
        className={cn(
          "bg-white border rounded-xl p-3 shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-400 hover:shadow transition-all",
          activeFilter === 'Primaria' ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/40" : "border-slate-200"
        )}
      >
        <div className="flex items-center gap-2 mb-2 text-blue-500">
          <Building2 className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Primaria</p>
        </div>
        <p className="text-2xl font-black text-slate-800">{totalPrimaria}</p>
      </div>

      {/* KPI 3 */}
      <div 
        onClick={() => onFilterChange('Bachillerato')}
        className={cn(
          "bg-white border rounded-xl p-3 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-400 hover:shadow transition-all",
          activeFilter === 'Bachillerato' ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/40" : "border-slate-200"
        )}
      >
        <div className="flex items-center gap-2 mb-2 text-emerald-500">
          <GraduationCap className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bachillerato</p>
        </div>
        <p className="text-2xl font-black text-slate-800">{totalBachillerato}</p>
      </div>

      {/* KPI 4 */}
      <div 
        onClick={() => onFilterChange('Coordinadores')}
        className={cn(
          "bg-white border rounded-xl p-3 shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-400 hover:shadow transition-all",
          activeFilter === 'Coordinadores' ? "ring-2 ring-amber-500 border-amber-500 bg-amber-50/40" : "border-slate-200"
        )}
      >
        <div className="flex items-center gap-2 mb-2 text-amber-500">
          <UserCog className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Coordinadores</p>
        </div>
        <p className="text-2xl font-black text-slate-800">{totalCoordinators}</p>
      </div>

      {/* KPI 5 */}
      <div 
        onClick={() => onFilterChange('En Clase')}
        className={cn(
          "bg-white border rounded-xl p-3 shadow-sm flex flex-col justify-between cursor-pointer hover:border-indigo-400 hover:shadow transition-all",
          activeFilter === 'En Clase' ? "ring-2 ring-indigo-400 border-indigo-400 bg-indigo-50/30" : "border-slate-200"
        )}
      >
        <div className="flex items-center gap-2 mb-2 text-indigo-400">
          <AlertCircle className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">En Clase</p>
        </div>
        <p className="text-2xl font-black text-indigo-600">{inClassNow}</p>
      </div>

      {/* KPI 6 */}
      <div 
        onClick={() => onFilterChange('Sobrecarga')}
        className={cn(
          "bg-rose-50 border rounded-xl p-3 shadow-sm flex flex-col justify-between cursor-pointer hover:border-rose-400 hover:shadow transition-all",
          activeFilter === 'Sobrecarga' ? "ring-2 ring-rose-500 border-rose-500 bg-rose-50/80" : "border-rose-200"
        )}
      >
        <div className="flex items-center gap-2 mb-2 text-rose-500">
          <AlertTriangle className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Sobrecarga</p>
        </div>
        <p className="text-2xl font-black text-rose-700">{overloaded}</p>
      </div>

      {/* KPI 7 */}
      <div 
        onClick={() => onFilterChange('Plan. Pendientes')}
        className={cn(
          "bg-amber-50 border rounded-xl p-3 shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-400 hover:shadow transition-all",
          activeFilter === 'Plan. Pendientes' ? "ring-2 ring-amber-500 border-amber-500 bg-amber-50/80" : "border-amber-200"
        )}
      >
        <div className="flex items-center gap-2 mb-2 text-amber-500">
          <FileWarning className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Plan. Pendientes</p>
        </div>
        <p className="text-2xl font-black text-amber-700">{pendingPlanning}</p>
      </div>

    </div>
  );
}
