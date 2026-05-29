'use client';

import React from 'react';
import { CRITICAL_COURSES } from '@/lib/data/mock-reports';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskAnalyticsPanelProps {
  onNavigate?: (modal: string | null) => void;
}

export function RiskAnalyticsPanel({ onNavigate }: RiskAnalyticsPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      
      {/* Critical Courses List */}
      <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 shadow-sm flex flex-col">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-sm font-black text-rose-900 uppercase tracking-widest mb-1 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" /> Cursos de Atención Prioritaria
            </h3>
            <p className="text-xs font-semibold text-rose-600/70">Top cursos con mayor índice de riesgo integral</p>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {CRITICAL_COURSES.map((course) => (
            <div 
              key={course.id} 
              onClick={() => onNavigate?.('fichas')}
              className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-center justify-between group hover:border-rose-300 transition-colors cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-lg text-slate-900">{course.name}</span>
                  <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white", course.risk === 'Alto' ? 'bg-rose-500' : 'bg-amber-500')}>
                    Riesgo {course.risk}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500 flex gap-3">
                  <span>{course.level}</span>
                  <span className="text-rose-600 font-bold">{course.alerts} Alertas Activas</span>
                  <span>GPA: <strong className="text-slate-800">{course.gpa.toFixed(1)}</strong></span>
                </div>
              </div>
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => onNavigate?.('historial')}
          className="mt-4 w-full py-2.5 text-xs font-bold text-rose-700 bg-rose-100/50 hover:bg-rose-100 rounded-xl transition-colors"
        >
          Ver reporte detallado de riesgo
        </button>

      </div>

    </div>
  );
}
