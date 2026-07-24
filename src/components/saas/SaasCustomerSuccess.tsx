'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HeartPulse, TrendingUp, Users, Award, AlertCircle, Clock, 
  CheckCircle2, Smile, Calendar, BookOpen, ArrowUpRight, 
  RefreshCw, ShieldAlert, Sparkles, UserCheck
} from 'lucide-react';

interface CustomerHealth {
  id: string;
  name: string;
  healthScore: number; // 0 - 100
  status: 'saludable' | 'atencion' | 'critico' | 'n/d';
  lastLogin: string;
  activeUsersRatio: string;
  modulesUsed: number; // de 10
  churnRisk: 'Bajo' | 'Medio' | 'Alto' | 'N/D';
  lastTraining: string;
  nps: number;
  nextRenewal: string;
  csmName: string;
}

export function SaasCustomerSuccess({ institutions = [] }: { institutions?: any[] }) {
  console.log("RENDER CUSTOMER SUCCESS", { count: institutions.length, rawInstitutions: institutions });
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Map real institutions to CustomerHealth interface
  const data: CustomerHealth[] = institutions.map(inst => {
    const isSuspended = inst.subscription_status === 'suspended';
    const isTrial = inst.subscription_status === 'free_trial';
    
    // Default dynamic logic to show real or empty data
    let healthScore = 0;
    let status: 'saludable' | 'atencion' | 'critico' | 'n/d' = 'n/d';
    let churnRisk: 'Bajo' | 'Medio' | 'Alto' | 'N/D' = 'N/D';
    
    return {
      id: inst.id,
      name: inst.name || 'Institución sin nombre',
      healthScore,
      status,
      lastLogin: inst.last_login ? new Date(inst.last_login).toLocaleDateString() : 'Sin accesos recientes',
      activeUsersRatio: `${inst.active_users || 0} usuarios`,
      modulesUsed: inst.active_modules?.length || 0,
      churnRisk,
      lastTraining: 'N/D',
      nps: 0,
      nextRenewal: inst.subscription_end || 'N/D',
      csmName: inst.kam_name || 'Sin asignar'
    };
  });

  const filtered = data.filter(d => {
    if (filterStatus !== 'todos' && d.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (st: string, score: number) => {
    if (st === 'saludable') {
      return <Badge className="bg-emerald-500 text-white font-black text-[10px] uppercase">● Saludable ({score}/100)</Badge>;
    }
    if (st === 'atencion') {
      return <Badge className="bg-amber-500 text-white font-black text-[10px] uppercase">● Atención ({score}/100)</Badge>;
    }
    if (st === 'critico') {
      return <Badge className="bg-red-500 text-white font-black text-[10px] uppercase animate-pulse">● Crítico ({score}/100)</Badge>;
    }
    return <Badge className="bg-slate-500 text-white font-black text-[10px] uppercase">● N/D ({score}/100)</Badge>;
  };

  const getChurnBadge = (risk: string) => {
    if (risk === 'Bajo') return <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">Bajo</span>;
    if (risk === 'Medio') return <span className="text-amber-700 font-extrabold bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">Medio</span>;
    if (risk === 'Alto') return <span className="text-red-700 font-black bg-red-50 px-2.5 py-0.5 rounded border border-red-300 animate-pulse">ALTO RIESGO</span>;
    return <span className="text-slate-700 font-extrabold bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200">N/D</span>;
  };

  const healthyCount = data.filter(d => d.status === 'saludable').length;
  const attentionCount = data.filter(d => d.status === 'atencion').length;
  const criticalCount = data.filter(d => d.status === 'critico').length;
  const renewalCount = data.filter(d => d.nextRenewal !== 'N/D').length;

  return (
    <div className="space-y-6">
      
      {/* Cabecera Customer Success */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-6 rounded-3xl text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
            <HeartPulse className="w-6 h-6 animate-pulse text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400 block">Post-Venta & Retención SaaS</span>
            <h2 className="text-xl font-black text-white">Centro de Éxito del Cliente (Customer Success)</h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              Monitoreo semaforizado de adopción, riesgo de abandono (Churn), satisfacción NPS y plan de fidelización.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">NPS Promedio AulaCore</span>
            <span className="text-lg font-black text-emerald-400">0 / 100</span>
          </div>
          <Smile className="w-8 h-8 text-slate-600" />
        </div>
      </div>

      {/* Tarjetas resumen CS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Tenants Saludables</span>
            <span className="text-lg font-black text-slate-800">{healthyCount} Colegios</span>
            <span className="text-[10px] text-emerald-600 font-bold block">Health Score &gt; 80</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Requieren Atención</span>
            <span className="text-lg font-black text-slate-800">{attentionCount} Colegios</span>
            <span className="text-[10px] text-amber-600 font-bold block">Adopción Media (60-79)</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-red-200 bg-red-50/30 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Riesgo Crítico (Churn)</span>
            <span className="text-lg font-black text-red-700">{criticalCount} Colegios</span>
            <span className="text-[10px] text-red-600 font-bold block">Intervención Urgente</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Renovaciones Próx. 90d</span>
            <span className="text-lg font-black text-slate-800">{renewalCount} Contratos</span>
            <span className="text-[10px] text-indigo-600 font-bold block">$0 COP por renovar</span>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs font-extrabold text-slate-700 ml-2">Filtrar por Salud:</span>
        {[
          { id: 'todos', label: 'Todos los Clientes' },
          { id: 'saludable', label: 'Saludables (> 80)' },
          { id: 'atencion', label: 'En Atención (60-79)' },
          { id: 'critico', label: 'Riesgo Crítico (< 60)' },
        ].map(b => (
          <button
            key={b.id}
            onClick={() => setFilterStatus(b.id)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              filterStatus === b.id 
                ? 'bg-slate-900 text-white shadow-sm font-black' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Tabla de Customer Success */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Institución / Tenant</th>
                <th className="py-3.5 px-4">Salud (Health Score)</th>
                <th className="py-3.5 px-4">Adopción y Usuarios</th>
                <th className="py-3.5 px-4">Riesgo Churn</th>
                <th className="py-3.5 px-4">Última Capacitación</th>
                <th className="py-3.5 px-4">Próxima Renovación</th>
                <th className="py-3.5 px-4">CSM Asignado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-slate-200 mb-3" />
                      <span className="text-slate-500 font-bold block text-sm">Sin clientes registrados en este estado</span>
                      <span className="text-slate-400 mt-1 block">Los clientes se mostrarán aquí cuando se agreguen al sistema.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {row.name}
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Último login: {row.lastLogin}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(row.status, row.healthScore)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-800 block">{row.activeUsersRatio}</span>
                      <span className="text-[10px] text-indigo-600 font-bold block">{row.modulesUsed} de 10 módulos en uso</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {getChurnBadge(row.churnRisk)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{row.lastTraining}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-800">
                      {row.nextRenewal}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {row.csmName}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
