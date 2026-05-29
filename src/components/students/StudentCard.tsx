'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StudentMockData, StudentStatus } from '@/lib/data/mock-students';
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
  'Suspendido': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' }
};

export function StudentCard({ student, onClick }: Props) {
  const statusStyle = statusColors[student.status];
  const hasAlerts = student.alerts.length > 0;
  
  // Traffic Light Logic
  let trafficLight: { color: string, label: string } = { color: 'bg-emerald-500', label: 'Excelente' };
  if (student.academicRisk === 'Alto' || student.behaviorRisk === 'Alto') {
    trafficLight = { color: 'bg-rose-500', label: 'Riesgo' };
  } else if (student.academicRisk === 'Medio' || student.behaviorRisk === 'Medio') {
    trafficLight = { color: 'bg-amber-500', label: 'Seguimiento' };
  }
  
  // Format GPA
  const gpaColor = student.gpa >= 4.0 ? 'text-emerald-600' : student.gpa >= 3.0 ? 'text-amber-600' : student.gpa > 0 ? 'text-rose-600' : 'text-slate-400';

  return (
    <Card 
      onClick={() => onClick(student)}
      className="border-slate-200 hover:border-indigo-300 shadow-sm overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col relative min-h-[160px]"
    >
      <div className={cn("absolute top-0 left-0 w-1 h-full", statusStyle.dot)} />
      
      {/* Top micro-indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{trafficLight.label}</span>
        <div className={cn("w-2 h-2 rounded-full", trafficLight.color, "shadow-sm")} />
      </div>
      
      <CardContent className="p-5 flex flex-col h-full pl-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 shrink-0 shadow-sm overflow-hidden flex items-center justify-center text-slate-400 font-bold text-xl relative group-hover:shadow-md transition-shadow">
            {student.avatarUrl ? (
              <img 
                src={student.avatarUrl} 
                alt={student.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              student.name.charAt(0)
            )}
            <div className={cn("absolute -bottom-1 -right-1 w-4 h-4 border-[3px] border-white rounded-full", statusStyle.dot)} />
          </div>
          
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-bold text-[15px] leading-tight text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2" title={student.name}>
              {student.name}
            </h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{student.group} • {student.level}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-[11px] mb-4">
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
              <span className={cn("text-sm font-black", gpaColor)}>{student.gpa > 0 ? student.gpa.toFixed(1) : 'N/A'}</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Asist.</span>
              <span className={cn("text-sm font-black", student.attendanceRate >= 90 ? 'text-emerald-600' : 'text-rose-600')}>{student.attendanceRate}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasAlerts && (
              <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-1 rounded text-[10px] font-bold border border-rose-200">
                <ShieldAlert className="w-3 h-3" />
                {student.alerts.length}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
