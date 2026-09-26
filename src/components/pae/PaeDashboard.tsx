'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Users, Utensils, AlertTriangle, Building2, 
  TrendingUp, Percent, Sparkles, ShieldCheck, 
  Calendar, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaeDashboardProps {
  userRole: string;
  beneficiariesCount?: number;
  coveragePercentage?: number;
  scheduledRations?: number;
  deliveredRations?: number;
  incidentsCount?: number;
  activeOperator?: string;
  localPurchasesPercentage?: number;
  etaCount?: number;
  nextCaeDate?: string;
  sedes?: { name: string; scheduled: number; delivered: number }[];
}

export function PaeDashboard({
  userRole,
  beneficiariesCount = 0,
  coveragePercentage = 0,
  scheduledRations = 0,
  deliveredRations = 0,
  incidentsCount = 0,
  activeOperator = 'Sin operador asignado',
  localPurchasesPercentage = 0,
  etaCount = 0,
  nextCaeDate = '',
  sedes = []
}: PaeDashboardProps) {

  // Semaforización lógica
  let semaforoState: 'green' | 'yellow' | 'red' | 'neutral' = 'neutral';
  let semaforoMessage = 'Sin registros activos en el programa PAE';
  let semaforoColor = 'from-slate-700 to-slate-800';

  const hasData = beneficiariesCount > 0 || scheduledRations > 0 || deliveredRations > 0;

  if (hasData) {
    if (etaCount > 0 || incidentsCount >= 3) {
      semaforoState = 'red';
      semaforoMessage = etaCount > 0 ? 'ALERTA ROJA: Reporte de ETA activo' : 'ALERTA ROJA: Múltiples incidencias sin resolver';
      semaforoColor = 'from-rose-500 to-red-650';
    } else if (incidentsCount > 0 || localPurchasesPercentage < 20.0 || coveragePercentage < 70) {
      semaforoState = 'yellow';
      semaforoMessage = localPurchasesPercentage < 20.0 
        ? 'RIESGO: Compras locales por debajo del 20% legal' 
        : 'RIESGO: Incidencias abiertas o baja cobertura';
      semaforoColor = 'from-amber-400 to-orange-550';
    } else {
      semaforoState = 'green';
      semaforoMessage = 'Operación normal del programa';
      semaforoColor = 'from-emerald-500 to-green-600';
    }
  }

  const kpis = [
    {
      title: 'Beneficiarios Activos',
      value: beneficiariesCount,
      subtitle: beneficiariesCount > 0 ? 'Estudiantes inscritos' : 'Sin inscritos',
      icon: Users,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      title: 'Cobertura PAE',
      value: `${coveragePercentage}%`,
      subtitle: 'Frente a raciones programadas',
      icon: TrendingUp,
      color: 'text-indigo-500 bg-indigo-50',
    },
    {
      title: 'Raciones Programadas',
      value: scheduledRations,
      subtitle: scheduledRations > 0 ? 'Meta diaria contratada' : 'Sin raciones',
      icon: Utensils,
      color: 'text-violet-500 bg-violet-50',
    },
    {
      title: 'Raciones Entregadas',
      value: deliveredRations,
      subtitle: scheduledRations > 0 
        ? `Cumplimiento: ${Math.round((deliveredRations / Math.max(1, scheduledRations)) * 100)}%`
        : '0 entregadas',
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      title: 'Incidencias Abiertas',
      value: incidentsCount,
      subtitle: etaCount > 0 ? '⚠️ Alerta de brote ETA' : (incidentsCount > 0 ? 'Casos en seguimiento' : 'Sin incidencias'),
      icon: AlertTriangle,
      color: incidentsCount > 0 ? 'text-rose-500 bg-rose-50 animate-pulse' : 'text-slate-500 bg-slate-100',
    },
    {
      title: 'Compras Locales',
      value: `${localPurchasesPercentage}%`,
      subtitle: 'Meta legal: Mínimo 20%',
      icon: Percent,
      color: localPurchasesPercentage >= 20.0 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100',
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Banner Semáforo Dinámico */}
      <div className={cn(
        "bg-gradient-to-r p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-300",
        semaforoColor
      )}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white"></span>
            </span>
            <span className="text-xs font-black tracking-widest uppercase opacity-90">ESTADO DEL PROGRAMA</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">{semaforoMessage}</h2>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl shrink-0 flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">Operador Activo</span>
            <span className="text-xs font-black truncate max-w-[180px]">{activeOperator}</span>
          </div>
          <Building2 className="w-5 h-5 opacity-90 shrink-0" />
        </div>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="border-slate-200 shadow-sm hover:shadow-md transition-all rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className={cn("p-2.5 rounded-xl", kpi.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">{kpi.title}</span>
                  <span className="text-2xl font-black text-slate-950 block">{kpi.value}</span>
                  <span className="text-[10px] font-semibold text-slate-500 block leading-none">{kpi.subtitle}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico / Panel de Entregas por Sede */}
        <Card className="lg:col-span-2 border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <CardTitle className="text-sm font-black text-slate-950 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-indigo-600" />
              Entregas por Sede y Cobertura de Ración
            </CardTitle>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Visión detallada de raciones entregadas frente a cupos asignados.</p>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {sedes && sedes.length > 0 ? (
              sedes.map((s, idx) => {
                const pct = s.scheduled > 0 ? Math.round((s.delivered / s.scheduled) * 100) : 0;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{s.name}</span>
                      <span>{s.delivered} / {s.scheduled} Raciones ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Utensils className="w-8 h-8 text-slate-350 mx-auto mb-2 text-slate-400" />
                <p className="text-xs font-bold text-slate-600">Sin sedes PAE configuradas</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No hay raciones ni sedes registradas para la vigencia actual.</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">TOTAL CONTRATADO</span>
                <span className="text-xl font-black text-slate-900">{scheduledRations} raciones / día</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">PROMEDIO ENTREGADO</span>
                <span className="text-xl font-black text-slate-900">{deliveredRations} raciones / día</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Módulo de Inteligencia Artificial */}
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
          <div>
            <CardHeader className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Auditoría Predictiva IA
                </CardTitle>
                <p className="text-[10px] text-indigo-200 font-semibold mt-0.5">Modelado analítico y alertas del Ministerio</p>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold text-slate-700 leading-relaxed">
                  <p className="font-black mb-1 text-[11px] text-slate-900">Auditoría Predictiva</p>
                  El análisis predictivo estará disponible cuando se registren datos de raciones, beneficiarios y compras locales en el sistema.
                </div>
              </div>
            </CardContent>
          </div>
          
          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <button 
              disabled
              className="w-full bg-slate-200 text-slate-500 font-bold text-xs py-2.5 px-4 rounded-xl border-none flex items-center justify-center gap-1 cursor-not-allowed"
            >
              Auditoría IA disponible cuando existan datos PAE
            </button>
          </div>
        </Card>

      </div>
    </div>
  );
}
