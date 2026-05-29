'use client';

import React from 'react';
import { ALERT_KPIS } from '@/lib/data/mock-alerts';
import { ShieldAlert, AlertTriangle, ActivitySquare, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertsExecutivePanelProps {
  activeFilter: { type: 'all' | 'level' | 'critical' | 'dropout'; value?: string } | null;
  onFilterChange: (filter: { type: 'all' | 'level' | 'critical' | 'dropout'; value?: string } | null) => void;
}

export function AlertsExecutivePanel({ activeFilter, onFilterChange }: AlertsExecutivePanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Alertas Abiertas */}
      <div 
        onClick={() => onFilterChange(activeFilter?.type === 'all' ? null : { type: 'all' })}
        className={cn(
          "col-span-1 lg:col-span-2 border rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all select-none duration-300",
          activeFilter?.type === 'all' 
            ? "bg-[#0B1120] border-blue-500 ring-2 ring-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
            : "bg-[#0B1120] border-slate-800 hover:border-slate-700 hover:shadow-xl"
        )}
      >
        <div className="absolute -top-4 -right-4 p-4 opacity-10 pointer-events-none transition-transform group-hover:scale-110">
          <ShieldAlert className="w-40 h-40 text-blue-400" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
            <span>Alertas Activas Generales</span>
            {activeFilter?.type === 'all' && <span className="text-[9px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full animate-pulse">Filtro Activo</span>}
          </p>
          <div className="flex items-center gap-8">
            <p className="text-6xl font-black text-white leading-none">{ALERT_KPIS.openAlerts}</p>
            
            <div className="flex items-center gap-6">
              {/* Preescolar */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterChange(activeFilter?.value === 'Preescolar' ? null : { type: 'level', value: 'Preescolar' });
                }}
                className={cn(
                  "flex flex-col items-center p-2 rounded-xl border transition-all hover:bg-slate-800/40 cursor-pointer",
                  activeFilter?.value === 'Preescolar' ? "border-blue-500 bg-blue-500/10 shadow-inner scale-105" : "border-transparent"
                )}
              >
                <span className={cn("text-xl font-black leading-none mb-1.5", activeFilter?.value === 'Preescolar' ? "text-blue-300" : "text-blue-400")}>{ALERT_KPIS.breakdown.preescolar}</span>
                <div className="w-full min-w-[32px] h-0.5 bg-blue-500/30 mb-1.5 rounded-full"></div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Preescolar</span>
              </div>
              
              {/* Primaria */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterChange(activeFilter?.value === 'Primaria' ? null : { type: 'level', value: 'Primaria' });
                }}
                className={cn(
                  "flex flex-col items-center p-2 rounded-xl border transition-all hover:bg-slate-800/40 cursor-pointer",
                  activeFilter?.value === 'Primaria' ? "border-blue-500 bg-blue-500/10 shadow-inner scale-105" : "border-transparent"
                )}
              >
                <span className={cn("text-xl font-black leading-none mb-1.5", activeFilter?.value === 'Primaria' ? "text-blue-300" : "text-blue-400")}>{ALERT_KPIS.breakdown.primaria}</span>
                <div className="w-full min-w-[32px] h-0.5 bg-blue-500/30 mb-1.5 rounded-full"></div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Primaria</span>
              </div>
              
              {/* Bachillerato */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterChange(activeFilter?.value === 'Bachillerato' ? null : { type: 'level', value: 'Bachillerato' });
                }}
                className={cn(
                  "flex flex-col items-center p-2 rounded-xl border transition-all hover:bg-slate-800/40 cursor-pointer",
                  activeFilter?.value === 'Bachillerato' ? "border-blue-500 bg-blue-500/10 shadow-inner scale-105" : "border-transparent"
                )}
              >
                <span className={cn("text-xl font-black leading-none mb-1.5", activeFilter?.value === 'Bachillerato' ? "text-blue-300" : "text-blue-400")}>{ALERT_KPIS.breakdown.bachillerato}</span>
                <div className="w-full min-w-[32px] h-0.5 bg-blue-500/30 mb-1.5 rounded-full"></div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Bachillerato</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Riesgo Alto */}
      <div 
        onClick={() => onFilterChange(activeFilter?.type === 'critical' ? null : { type: 'critical' })}
        className={cn(
          "col-span-1 border rounded-2xl p-6 shadow-sm flex flex-col justify-center cursor-pointer transition-all select-none duration-300",
          activeFilter?.type === 'critical'
            ? "bg-rose-50/80 border-rose-400 ring-2 ring-rose-400/20 shadow-[0_0_15px_rgba(244,63,94,0.1)] scale-[1.02]"
            : "bg-white border-rose-200 hover:border-rose-300 hover:shadow-md"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Casos Críticos (P1)</p>
          </div>
          {activeFilter?.type === 'critical' && <span className="text-[8px] bg-rose-500 text-white font-black uppercase px-2 py-0.5 rounded">Filtro</span>}
        </div>
        <p className="text-4xl font-black text-rose-600">{ALERT_KPIS.highRiskCases}</p>
        <p className="text-xs font-bold text-rose-400 mt-2">Requieren intervención hoy</p>
      </div>

      {/* Deserción Potencial (IA) */}
      <div 
        onClick={() => onFilterChange(activeFilter?.type === 'dropout' ? null : { type: 'dropout' })}
        className={cn(
          "col-span-1 border rounded-2xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden cursor-pointer transition-all select-none duration-300",
          activeFilter?.type === 'dropout'
            ? "bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] scale-[1.02]"
            : "bg-white border-amber-200 hover:border-amber-300 hover:shadow-md"
        )}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-amber-600">
            <UserMinus className="w-5 h-5" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Deserción Potencial</p>
          </div>
          <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">IA Activa</span>
        </div>
        <p className="text-4xl font-black text-amber-600">{ALERT_KPIS.potentialDropouts}</p>
        <p className="text-xs font-bold text-amber-500 mt-2">Predicción de abandono {'>'} 80%</p>
      </div>

    </div>
  );
}
