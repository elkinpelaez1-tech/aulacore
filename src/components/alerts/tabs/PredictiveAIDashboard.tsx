'use client';

import React, { useState } from 'react';
import { BrainCircuit, TrendingDown, Sparkles, AlertCircle, RefreshCw, BarChart2, ShieldAlert, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MOCK_STUDENTS, StudentMockData } from '@/lib/data/mock-students';

interface PredictiveAIDashboardProps {
  onIntervene?: (studentName: string) => void;
}

export function PredictiveAIDashboard({ onIntervene }: PredictiveAIDashboardProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedReduction, setSimulatedReduction] = useState(0);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  const topAtRisk = MOCK_STUDENTS.filter(s => s.academicRisk === 'Alto' || s.behaviorRisk === 'Alto')
    .map(s => {
      // Map mock probability based on their specific risk levels
      let prob = 75;
      if (s.name === 'Mateo López') prob = 92;
      else if (s.name === 'Sofía Ramírez') prob = 85;
      else if (s.name === 'Laura Cortés') prob = 78;
      else if (s.name === 'Valentina Silva Martínez') prob = 88;
      else if (s.name === 'Andrés Gómez') prob = 82;

      return {
        ...s,
        probability: prob
      };
    })
    .sort((a, b) => b.probability - a.probability);

  const handleSimulate = (type: string, reduction: number) => {
    setIsSimulating(true);
    setActiveSimulation(type);
    
    setTimeout(() => {
      setIsSimulating(false);
      setSimulatedReduction(reduction);
    }, 850);
  };

  const resetSimulation = () => {
    setSimulatedReduction(0);
    setActiveSimulation(null);
  };

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
            Modelo entrenado con redes neuronales recurrentes para la detección de patrones tempranos de abandono escolar y vulnerabilidad académica.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Precisión</span>
            <span className="text-lg font-black text-indigo-400 leading-none mt-1">94.8%</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Último Run</span>
            <span className="text-lg font-black text-emerald-400 leading-none mt-1">Hace 2h</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alumnos Analizados</p>
          <p className="text-3xl font-black text-white mt-1">1,280</p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">100% de la matrícula activa</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Riesgo Alto {'>'}80%</p>
          <p className="text-3xl font-black text-rose-500 mt-1">15</p>
          <p className="text-[10px] text-rose-400/80 mt-1 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> +2 este periodo
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alertas Tempranas</p>
          <p className="text-3xl font-black text-amber-500 mt-1">48</p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Conducta, asistencia y notas</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Casos Intervenidos</p>
          <p className="text-3xl font-black text-indigo-400 mt-1">35</p>
          <p className="text-[10px] text-emerald-400/80 mt-1 font-semibold">72.9% de efectividad</p>
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
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-slate-200">Factores Socioeconómicos / Familiares</span>
                  <span className="text-indigo-400">45% de peso</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-slate-200">Frecuencia de Ausentismo (Inasistencias)</span>
                  <span className="text-rose-400">30% de peso</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-slate-200">Rendimiento y Caída de GPA</span>
                  <span className="text-amber-400">25% de peso</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Impact Simulator */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/40 border border-indigo-950/60 p-6 rounded-2xl relative overflow-hidden flex-1 flex flex-col justify-between mt-6 xl:mt-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
            
            <div>
              <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                <RefreshCw className={cn("w-4 h-4 text-indigo-400", isSimulating && "animate-spin")} /> Simulador Predictivo de Impacto de Intervención
              </h3>
              <p className="text-[11px] text-slate-400 mb-5 leading-normal max-w-lg">
                Proyecte la reducción del riesgo sistémico aplicando de forma simulada diferentes planes preventivos AulaCore.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <Button 
                onClick={() => handleSimulate('Tutoría Académica', 15)}
                disabled={isSimulating}
                className={cn(
                  "h-auto flex flex-col items-start gap-1 p-3 rounded-xl border transition-all text-left font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white",
                  activeSimulation === 'Tutoría Académica' ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20" : "border-slate-800"
                )}
              >
                <span className="text-slate-300">Plan Académico</span>
                <span className="text-xs font-black text-indigo-300 mt-1">Tutorías Intensivas</span>
                <span className="text-[9px] text-slate-500 font-semibold mt-1">Impacto: -15% Riesgo</span>
              </Button>
              
              <Button 
                onClick={() => handleSimulate('Apoyo Social / Familiar', 25)}
                disabled={isSimulating}
                className={cn(
                  "h-auto flex flex-col items-start gap-1 p-3 rounded-xl border transition-all text-left font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white",
                  activeSimulation === 'Apoyo Social / Familiar' ? "border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/20" : "border-slate-800"
                )}
              >
                <span className="text-slate-300">Plan Psicosocial</span>
                <span className="text-xs font-black text-rose-300 mt-1">Apoyo Social / Familiar</span>
                <span className="text-[9px] text-slate-500 font-semibold mt-1">Impacto: -25% Riesgo</span>
              </Button>

              <Button 
                onClick={() => handleSimulate('Monitoreo Asistencia RFID', 10)}
                disabled={isSimulating}
                className={cn(
                  "h-auto flex flex-col items-start gap-1 p-3 rounded-xl border transition-all text-left font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white",
                  activeSimulation === 'Monitoreo Asistencia RFID' ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20" : "border-slate-800"
                )}
              >
                <span className="text-slate-300">Plan Operativo</span>
                <span className="text-xs font-black text-amber-300 mt-1">RFID & Alerta Inmediata</span>
                <span className="text-[9px] text-slate-500 font-semibold mt-1">Impacto: -10% Riesgo</span>
              </Button>
            </div>

            <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl flex items-center justify-between min-h-[72px]">
              {isSimulating ? (
                <div className="flex items-center gap-3 text-xs font-bold text-indigo-400 mx-auto">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Calculando impacto en red neuronal predictiva...</span>
                </div>
              ) : simulatedReduction > 0 ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">Impacto Proyectado: {activeSimulation}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Reducción sistemática de casos críticos de deserción.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Casos Activos</span>
                      <span className="text-lg font-black text-rose-500 line-through mr-2">15</span>
                      <span className="text-lg font-black text-emerald-400">{Math.round(15 * (1 - simulatedReduction/100))}</span>
                    </div>
                    <button 
                      onClick={resetSimulation}
                      className="text-xs font-bold text-slate-400 hover:text-white underline transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-500 text-center w-full">
                  Seleccione una estrategia para calcular la reducción en tiempo real.
                </p>
              )}
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
            {topAtRisk.map(student => {
              const currentProb = simulatedReduction > 0 
                ? Math.round(student.probability * (1 - simulatedReduction / 100))
                : student.probability;

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
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
