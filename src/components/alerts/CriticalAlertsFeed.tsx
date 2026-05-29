'use client';

import React from 'react';
import { LIVE_ALERTS, PREDICTIVE_ALERTS, LiveAlert } from '@/lib/data/mock-alerts';
import { BrainCircuit, AlertTriangle, ArrowRight, Clock, Activity, ShieldAlert, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CriticalAlertsFeedProps {
  onSelectAlert?: (alert: LiveAlert) => void;
  onViewHistory?: () => void;
}

export function CriticalAlertsFeed({ onSelectAlert, onViewHistory }: CriticalAlertsFeedProps) {
  const getIcon = (category: string) => {
    switch(category) {
      case 'Academica': return <GraduationIcon className="w-4 h-4" />;
      case 'Convivencia': return <ShieldAlert className="w-4 h-4" />;
      case 'Asistencia': return <Activity className="w-4 h-4" />;
      case 'Docente': return <Users className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div> Feed en Tiempo Real
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-1">Alertas operativas de la institución</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
        {LIVE_ALERTS.map(alert => (
          <div key={alert.id} className="group relative pl-4 pb-4 border-l-2 border-slate-100 last:border-l-0 last:pb-0">
            <div className={cn(
              "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white flex items-center justify-center transition-all group-hover:scale-110",
              alert.urgency === 'Alta' ? "bg-rose-500" : alert.urgency === 'Media' ? "bg-amber-400" : "bg-slate-300"
            )}></div>
            
            <div 
              onClick={() => onSelectAlert?.(alert)}
              className="bg-slate-50 rounded-xl p-4 border border-slate-100 group-hover:border-indigo-200 group-hover:bg-indigo-50/30 transition-all cursor-pointer hover:shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  {getIcon(alert.category)} {alert.category}
                </span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {alert.timeAgo}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1 leading-tight group-hover:text-indigo-700 transition-colors">{alert.title}</h4>
              <p className="text-xs font-medium text-slate-600 line-clamp-2">{alert.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={onViewHistory}
        className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 rounded-xl border border-slate-200 transition-all hover:border-slate-300"
      >
        Ver historial completo
      </button>
    </div>
  );
}

// Temporary simple icon since lucide-react GraduationCap was throwing an error if imported from wrong place earlier, though it usually works. Just reusing Activity for Academica if needed.
function GraduationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  );
}
