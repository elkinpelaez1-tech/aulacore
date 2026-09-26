'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldAlert, GraduationCap, Activity, BrainCircuit } from 'lucide-react';
export interface CourseHeatmapData {
  id: string;
  name: string;
  level: string;
  overallRisk: 'Alto' | 'Medio' | 'Saludable';
  aiRisk: 'Alto' | 'Medio' | 'Saludable';
  activeAlerts: number;
  gpa: number;
  attendance: number;
  behaviorScore: number;
}

interface InstitutionalHeatmapProps {
  activeFilter: { type: 'all' | 'level' | 'critical' | 'dropout'; value?: string } | null;
  onSelectCourse?: (courseName: string) => void;
  courses?: CourseHeatmapData[];
}

export function InstitutionalHeatmap({ activeFilter, onSelectCourse, courses = [] }: InstitutionalHeatmapProps) {
  const preescolar = courses.filter(c => c.level === 'Preescolar');
  const primaria = courses.filter(c => c.level === 'Primaria');
  const bachillerato = courses.filter(c => c.level === 'Bachillerato');

  const showPreescolar = !activeFilter || activeFilter.type !== 'level' || activeFilter.value === 'Preescolar';
  const showPrimaria = !activeFilter || activeFilter.type !== 'level' || activeFilter.value === 'Primaria';
  const showBachillerato = !activeFilter || activeFilter.type !== 'level' || activeFilter.value === 'Bachillerato';

  const renderLevelGroup = (title: string, courses: CourseHeatmapData[]) => (
    <div className="mb-8 last:mb-0">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-slate-300"></div> {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {courses.map(course => {
          const isCritical = course.overallRisk === 'Alto';
          const isWarning = course.overallRisk === 'Medio';
          const isHealthy = course.overallRisk === 'Saludable';

          // Risk filters match checking
          let isMatch = true;
          if (activeFilter?.type === 'critical') {
            isMatch = course.overallRisk === 'Alto';
          } else if (activeFilter?.type === 'dropout') {
            isMatch = course.aiRisk === 'Alto';
          }

          return (
            <div 
              key={course.id} 
              onClick={() => isMatch && onSelectCourse?.(course.name)}
              className={cn(
                "relative bg-white p-5 rounded-2xl border-2 transition-all group overflow-hidden select-none duration-300",
                isMatch ? "cursor-pointer hover:shadow-md hover:scale-[1.02]" : "opacity-25 scale-95 pointer-events-none",
                isCritical ? "border-rose-300 hover:border-rose-400" : 
                isWarning ? "border-amber-300 hover:border-amber-400" : 
                "border-emerald-200 hover:border-emerald-300"
              )}
            >
              {/* Top subtle glow for critical courses */}
              {isCritical && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-rose-600"></div>}
              {isWarning && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 to-amber-500"></div>}
              {isHealthy && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-300 to-emerald-500"></div>}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{course.name}</h4>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mt-1",
                    isCritical ? "bg-rose-100 text-rose-700" : 
                    isWarning ? "bg-amber-100 text-amber-700" : 
                    "bg-emerald-100 text-emerald-700"
                  )}>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                    )}></div>
                    {isCritical ? 'Crítico' : isWarning ? 'Seguimiento' : 'Saludable'}
                  </span>
                </div>
                {course.activeAlerts > 0 && (
                  <div className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <ShieldAlert className="w-3 h-3" /> {course.activeAlerts}
                  </div>
                )}
              </div>

              {/* Micro Indicators Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                    <GraduationCap className="w-3 h-3" /> Académico
                  </span>
                  <span className={cn(
                    "text-sm font-black",
                    course.gpa < 3.2 ? "text-rose-600" : "text-slate-700"
                  )}>{course.gpa.toFixed(1)}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                    <Activity className="w-3 h-3" /> Asistencia
                  </span>
                  <span className={cn(
                    "text-sm font-black",
                    course.attendance < 85 ? "text-rose-600" : "text-slate-700"
                  )}>{course.attendance}%</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                    <ShieldAlert className="w-3 h-3" /> Convivencia
                  </span>
                  <span className={cn(
                    "text-sm font-black",
                    course.behaviorScore < 80 ? "text-rose-600" : "text-slate-700"
                  )}>{course.behaviorScore < 80 ? 'Baja' : course.behaviorScore < 90 ? 'Media' : 'Alta'}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                    <BrainCircuit className="w-3 h-3 text-indigo-500" /> IA Riesgo
                  </span>
                  <span className={cn(
                    "text-sm font-black",
                    course.aiRisk === 'Alto' ? "text-rose-600" : 
                    course.aiRisk === 'Medio' ? "text-amber-600" : "text-emerald-600"
                  )}>{course.aiRisk}</span>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200 shadow-inner">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Mapa de Calor Institucional</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">Vista de bloques premium por sección académica</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-emerald-400"></div> Saludable</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-amber-400"></div> Seguimiento</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-rose-500"></div> Crítico</div>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-white">
          <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-600">Sin cursos o registros de seguimiento configurados para esta institución.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">El mapa de calor se actualizará automáticamente cuando existan cursos y estudiantes vinculados.</p>
        </div>
      ) : (
        <>
          {showBachillerato && renderLevelGroup('Bachillerato', bachillerato)}
          {showPrimaria && renderLevelGroup('Primaria', primaria)}
          {showPreescolar && renderLevelGroup('Preescolar', preescolar)}
        </>
      )}
    </div>
  );
}
