'use client';

import React from 'react';
import { BrainCircuit, TrendingDown, Sparkles, RefreshCw, BarChart2, ShieldAlert, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PredictiveAIDashboardProps {
  onIntervene?: (studentName: string) => void;
  studentsCount?: number;
  highRiskCount?: number;
  earlyAlertsCount?: number;
  intervenedCount?: number;
}

export function PredictiveAIDashboard({
  onIntervene,
  studentsCount = 0,
  highRiskCount = 0,
  earlyAlertsCount = 0,
  intervenedCount = 0,
}: PredictiveAIDashboardProps) {
  const topAtRisk: any[] = [];

  return (
    <div className="bg-[#0B1120] border border-slate-800 rounded-3xl p-6 text-white space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 border border-indigo-500/20 rounded-full">AulaCore Predictive Engine</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <BrainCircuit className="w-7 h-7 text-indigo-400" /> Analítica de Deserción y Riesgo IA
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium max-w-xl">
            Modelo de detección de patrones tempranos de abandono escolar y vulnerabilidad académica institucional.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Matrícula Analizada</span>
            <span className="text-xl font-black text-indigo-400">{studentsCount.toLocaleString()}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Precisión Modelo</span>
            <span className="text-xl font-black text-slate-500">--</span>
          </div>
        </div>
      </div>

      {/* Global Risk KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alto Riesgo Deserción</p>
          <p className="text-3xl font-black text-rose-500 mt-1">{highRiskCount}</p>
          <p className="text-[10px] text-rose-400/80 mt-1 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Sin casos críticos
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alertas Tempranas</p>
          <p className="text-3xl font-black text-amber-500 mt-1">{earlyAlertsCount}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Conducta, asistencia y notas</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Casos Intervenidos</p>
          <p className="text-3xl font-black text-indigo-400 mt-1">{intervenedCount}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">Sin intervenciones activas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Risk Factors & Simulator (Left Side) */}
        <div className="xl:col-span-2 space-y-6 flex flex-col justify-between">
          
          {/* Risk Factors Breakdown */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" /> Correlación de Factores de Riesgo
            </h3>
            
            <div className="py-8 text-center text-slate-500 text-xs font-semibold">
              No hay datos de factores de riesgo consolidados para la institución activa.
            </div>
          </div>

          {/* AI Impact Simulator */}
          <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl relative overflow-hidden flex-1 flex flex-col justify-between mt-6 xl:mt-0">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-slate-500" /> Simulador Predictivo de Impacto de Intervención
              </h3>
              <p className="text-[11px] text-slate-500 mb-4 leading-normal max-w-lg">
                Disponible cuando existan datos consolidados de matrícula, rendimiento y asistencia.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 text-center text-xs text-slate-500">
              Simulador deshabilitado en espera de datos institucionales.
            </div>
          </div>

        </div>

        {/* Priority Intervention List (Right Side) */}
        <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" /> Lista de Prioridad Crítica
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">Alumnos con mayor probabilidad de deserción actual</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] pr-1 scrollbar-hide">
            {topAtRisk.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40 p-4">
                <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-slate-400">No hay estudiantes en riesgo de deserción detectados.</p>
                <p className="text-[10px] text-slate-600 mt-1">El sistema priorizará automáticamente los casos que requieran atención.</p>
              </div>
            ) : (
              topAtRisk.map(student => {
                const currentProb = student.probability || 0;

                return (
                  <div
                    key={student.id}
                    onClick={() => onIntervene?.(student.name)}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-indigo-500 transition-colors cursor-pointer group flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors truncate">{student.name}</h4>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                        Curso: {student.group} • Promedio: {student.gpa.toFixed(1)}
                      </div>
                      <span className="inline-block mt-2 text-[9px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 border border-rose-500/20 rounded">
                        Riesgo {student.academicRisk === 'Alto' ? 'Académico' : 'Convivencial'}
                      </span>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end justify-center">
                      <span className="text-[8px] font-black uppercase text-slate-500">Probabilidad</span>
                      <span className={cn(
                        "text-sm font-black mt-0.5 leading-none transition-colors",
                        currentProb > 75 ? "text-rose-500" : currentProb > 50 ? "text-amber-500" : "text-emerald-400"
                      )}>
                        {currentProb}%
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all mt-2 shrink-0" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
