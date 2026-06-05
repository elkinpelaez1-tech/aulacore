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
  beneficiariesCount: number;
  coveragePercentage: number;
  scheduledRations: number;
  deliveredRations: number;
  incidentsCount: number;
  activeOperator: string;
  localPurchasesPercentage: number;
  etaCount: number;
  nextCaeDate: string;
}

export function PaeDashboard({
  userRole,
  beneficiariesCount = 3,
  coveragePercentage = 87.5,
  scheduledRations = 500,
  deliveredRations = 492,
  incidentsCount = 1,
  activeOperator = 'Consorcio Alimentando Futuro 2026',
  localPurchasesPercentage = 20.0,
  etaCount = 0,
  nextCaeDate = '2026-07-15'
}: PaeDashboardProps) {

  // Semaforización lógica
  let semaforoState: 'green' | 'yellow' | 'red' = 'green';
  let semaforoMessage = 'Operación normal del programa';
  let semaforoColor = 'from-emerald-500 to-green-600';

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
  }

  const kpis = [
    {
      title: 'Beneficiarios Activos',
      value: beneficiariesCount,
      subtitle: 'Estudiantes inscritos',
      icon: Users,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      title: 'Cobertura PAE',
      value: `${coveragePercentage}%`,
      subtitle: 'Frente a matrícula total',
      icon: TrendingUp,
      color: 'text-indigo-500 bg-indigo-50',
    },
    {
      title: 'Raciones Programadas',
      value: scheduledRations,
      subtitle: 'Meta diaria contratada',
      icon: Utensils,
      color: 'text-violet-500 bg-violet-50',
    },
    {
      title: 'Raciones Entregadas',
      value: deliveredRations,
      subtitle: `Cumplimiento: ${Math.round((deliveredRations / Math.max(1, scheduledRations)) * 100)}%`,
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      title: 'Incidencias Abiertas',
      value: incidentsCount,
      subtitle: etaCount > 0 ? '⚠️ Alerta de brote ETA' : 'Casos en seguimiento',
      icon: AlertTriangle,
      color: incidentsCount > 0 ? 'text-rose-500 bg-rose-50 animate-pulse' : 'text-slate-500 bg-slate-100',
    },
    {
      title: 'Compras Locales',
      value: `${localPurchasesPercentage}%`,
      subtitle: 'Meta legal: Mínimo 20%',
      icon: Percent,
      color: localPurchasesPercentage >= 20.0 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-500 bg-amber-50',
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
            {/* Sede 1 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Sede Principal Campestre</span>
                <span>316 / 320 Raciones (98.7%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '98.7%' }} />
              </div>
            </div>

            {/* Sede 2 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Sede Anexa Primaria</span>
                <span>176 / 180 Raciones (97.7%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '97.7%' }} />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">TOTAL CONTRATADO</span>
                <span className="text-xl font-black text-slate-900">500 raciones / día</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">PROMEDIO ENTREGADO</span>
                <span className="text-xl font-black text-slate-900">492 raciones / día</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Módulo de Inteligencia Artificial (Preparado) */}
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden flex flex-col justify-between">
          <div>
            <CardHeader className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  Auditoría Predictiva IA
                </CardTitle>
                <p className="text-[10px] text-indigo-200 font-semibold mt-0.5">Modelado analítico y alertas del Ministerio</p>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 bg-indigo-50/50 border border-indigo-200/50 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold text-indigo-950 leading-relaxed">
                  <p className="font-black mb-1 text-[11px] text-indigo-900">Recomendación de Compra Local</p>
                  El porcentaje de compras locales se encuentra al límite legal (20.0%). El algoritmo predice riesgo de incumplimiento si el proveedor de lácteos reduce pedidos en Junio.
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold text-slate-700 leading-relaxed">
                  <p className="font-black mb-1 text-[11px] text-slate-900">Agenda CAE sugerida</p>
                  Faltan 10 días para la fecha bimestral sugerida de reunión del Comité CAE. Se recomienda lanzar convocatoria esta semana.
                </div>
              </div>
            </CardContent>
          </div>
          
          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer border-none flex items-center justify-center gap-1">
              Ejecutar Simulación de Alertas IA
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </Card>

      </div>
    </div>
  );
}
