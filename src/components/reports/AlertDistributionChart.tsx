'use client';

import React from 'react';
import { ALERT_DISTRIBUTION } from '@/lib/data/mock-reports';
import { cn } from '@/lib/utils';

// Color maps for the 3D bars
const colorMap: Record<string, { front: string, top: string, right: string }> = {
  'Académicas': { front: 'bg-amber-400', top: 'bg-amber-300', right: 'bg-amber-500' },
  'Convivencia': { front: 'bg-rose-500', top: 'bg-rose-400', right: 'bg-rose-600' },
  'Asistencia': { front: 'bg-sky-500', top: 'bg-sky-400', right: 'bg-sky-600' },
};

export function AlertDistributionChart() {
  const maxVal = Math.max(...ALERT_DISTRIBUTION.map(d => d.value)) * 1.2; // Add some headroom

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Distribución de Alertas Activas</h3>
        <p className="text-xs font-semibold text-slate-500 mb-8">Volumen de reportes por tipología</p>
      </div>

      <div className="flex-1 flex items-end justify-around pb-8 pt-6 px-4">
        {ALERT_DISTRIBUTION.map((item) => {
          const percent = (item.value / maxVal) * 100;
          const colors = colorMap[item.name] || { front: 'bg-slate-400', top: 'bg-slate-300', right: 'bg-slate-500' };
          
          return (
            <div key={item.name} className="flex flex-col items-center gap-6">
              
              {/* 3D Bar Container */}
              <div className="relative w-14 h-48 md:h-56">
                
                {/* Background Glass Bar (100%) */}
                <div className="absolute bottom-0 w-full h-full bg-slate-100/40 border border-slate-200/60 backdrop-blur-sm z-0">
                  {/* Top face */}
                  <div className="absolute top-0 left-0 w-full h-5 -translate-y-full skew-x-[-45deg] origin-bottom-left bg-slate-100/60 border border-slate-200/60 border-b-0" />
                  {/* Right face */}
                  <div className="absolute top-0 right-0 w-5 h-full translate-x-full skew-y-[-45deg] origin-top-left bg-slate-100/50 border border-slate-200/60 border-l-0" />
                </div>

                {/* Foreground Solid Bar */}
                <div 
                  className={cn("absolute bottom-0 w-full border border-black/5 z-10 transition-all duration-700 ease-out", colors.front)} 
                  style={{ height: `${percent}%` }}
                >
                  {/* Top face */}
                  <div className={cn("absolute top-0 left-0 w-full h-5 -translate-y-full skew-x-[-45deg] origin-bottom-left border border-black/5 border-b-0", colors.top)} />
                  {/* Right face */}
                  <div className={cn("absolute top-0 right-0 w-5 h-full translate-x-full skew-y-[-45deg] origin-top-left border border-black/5 border-l-0", colors.right)} />
                  
                  {/* Label on the bar */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black text-white drop-shadow-md">{item.value}</span>
                  </div>
                </div>

              </div>

              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
