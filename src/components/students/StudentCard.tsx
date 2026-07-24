'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StudentMockData, StudentStatus } from '@/types/student';
import { AlertCircle, GraduationCap, MapPin, Activity, User, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  student: StudentMockData;
  onClick: (student: StudentMockData) => void;
}

const statusColors: Record<StudentStatus, { bg: string, text: string, border: string, dot: string }> = {
  'Activo': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'Retirado': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  'Egresado': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'Suspendido': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Inactivo': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' }
};

export function StudentCard({ student, onClick }: Props) {
  const statusStyle = (student.status && statusColors[student.status]) || statusColors['Activo'];
  const hasAlerts = (student.alerts?.length || 0) > 0;
  
  // Traffic Light Logic
  let trafficLight: { color: string, label: string } = { color: 'bg-emerald-500', label: 'Excelente' };
  if (student.academicRisk === 'Alto' || student.behaviorRisk === 'Alto') {
    trafficLight = { color: 'bg-rose-500', label: 'Riesgo' };
  } else if (student.academicRisk === 'Medio' || student.behaviorRisk === 'Medio') {
    trafficLight = { color: 'bg-amber-500', label: 'Seguimiento' };
  }
  
  // Format GPA
  const gpaColor = (student.gpa || 0) >= 4.0 ? 'text-emerald-600' : (student.gpa || 0) >= 3.0 ? 'text-amber-600' : (student.gpa || 0) > 0 ? 'text-rose-600' : 'text-slate-400';

  return (
    <Card 
      onClick={() => onClick(student)}
      className="border-slate-200 hover:border-indigo-300 shadow-sm overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col relative min-h-[160px]"
    >
      <div className={cn("absolute top-0 left-0 w-1 h-full", statusStyle.dot)} />
      
      {/* Top micro-indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase border flex items-center gap-1", statusStyle.bg, statusStyle.text, statusStyle.border)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
          {student.status}
        </span>
      </div>

      <CardContent className="p-5 pt-6 flex-1 flex flex-col">
        {/* Header: Avatar + Student Basic Info */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl border border-slate-200 shrink-0 shadow-xs bg-indigo-50 text-indigo-700 font-bold text-sm flex items-center justify-center overflow-hidden">
            {student.avatarUrl ? (
              <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              student.name ? student.name.substring(0, 2).toUpperCase() : 'ST'
            )}
          </div>
          
          <div className="min-w-0 flex-1 pr-14">
            <h3 className="font-extrabold text-slate-900 text-sm leading-tight truncate group-hover:text-indigo-600 transition-colors">
              {student.name}
            </h3>
            <p className="text-[11px] font-bold text-indigo-600 mt-0.5">
              Doc. {student.document}
            </p>
            <p className="text-[11px] font-medium text-slate-500">
              {student.grade} • {student.group}
            </p>
          </div>
        </div>

        {/* Detailed Micro Info */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium">
          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{student.campus}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>{student.shift}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 col-span-2">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Acud. {student.guardianName}</span>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">GPA</span>
              <span className={cn("text-sm font-black", gpaColor)}>{(student.gpa || 0) > 0 ? (student.gpa || 0).toFixed(1) : 'N/A'}</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Asist.</span>
              <span className={cn("text-sm font-black", (student.attendanceRate || 100) >= 90 ? 'text-emerald-600' : 'text-rose-600')}>{student.attendanceRate ?? 100}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasAlerts && (
              <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-1 rounded text-[10px] font-bold border border-rose-200">
                <ShieldAlert className="w-3 h-3" />
                {student.alerts?.length || 0}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
