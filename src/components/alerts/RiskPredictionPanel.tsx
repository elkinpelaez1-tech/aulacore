'use client';

import { BrainCircuit, TrendingDown, ArrowRight, ShieldCheck } from 'lucide-react';

interface RiskPredictionPanelProps {
  onIntervene?: (studentName: string) => void;
  onViewAIComplete?: () => void;
  alerts?: any[];
}

export function RiskPredictionPanel({ onIntervene, onViewAIComplete, alerts = [] }: RiskPredictionPanelProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 p-6 rounded-2xl border border-indigo-800 shadow-lg text-white flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-black text-indigo-200 uppercase tracking-widest flex items-center gap-2 mb-1">
            <BrainCircuit className="w-5 h-5 text-indigo-400" /> AI Risk Prediction
          </h3>
          <p className="text-xs font-medium text-indigo-300/80">
            Detección temprana de patrones críticos basada en el modelo AulaCore AI.
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {alerts.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-indigo-800/80 rounded-xl bg-indigo-950/40 px-4">
            <ShieldCheck className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-bold text-indigo-200">Sin predicciones de riesgo activas.</p>
            <p className="text-[11px] text-indigo-300/60 mt-1">El modelo predictivo generará alertas cuando se detecten patrones de riesgo.</p>
          </div>
        ) : (
          alerts.map(alert => (
          <div 
            key={alert.id} 
            onClick={() => onIntervene?.(alert.studentName)}
            className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 hover:bg-white/20 transition-colors cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-sm font-black text-white">{alert.studentName}</h4>
                <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider mt-0.5">
                  Curso: {alert.courseName}
                </div>
              </div>
              <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 px-2 py-1 rounded-lg flex flex-col items-center justify-center">
                <span className="text-[10px] font-black uppercase">Probabilidad</span>
                <span className="text-lg font-black leading-none">{alert.probability}%</span>
              </div>
            </div>
            
            <p className="text-xs font-medium text-indigo-100/90 leading-snug mb-3">
              <span className="font-bold text-white">Patrón detectado:</span> {alert.reason}
            </p>

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-[10px] font-bold text-indigo-300 bg-white/5 px-2 py-1 rounded">Riesgo: {alert.riskType}</span>
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1 group-hover:text-white transition-colors">
                Intervenir <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        )))}
      </div>

      <button 
        onClick={onViewAIComplete}
        className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow-md transition-colors"
      >
        Ver panel analítico IA completo
      </button>
    </div>
  );
}
