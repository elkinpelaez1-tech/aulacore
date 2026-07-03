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
  status: 'saludable' | 'atencion' | 'critico';
  lastLogin: string;
  activeUsersRatio: string;
  modulesUsed: number; // de 10
  churnRisk: 'Bajo' | 'Medio' | 'Alto';
  lastTraining: string;
  nps: number;
  nextRenewal: string;
  csmName: string;
}

const MOCK_CSM_DATA: CustomerHealth[] = [
  {
    id: 'csm-01',
    name: 'Colegio San José de Flores',
    healthScore: 94,
    status: 'saludable',
    lastLogin: 'Hoy, 07:15 AM',
    activeUsersRatio: '92% (414/450)',
    modulesUsed: 9,
    churnRisk: 'Bajo',
    lastTraining: '28 de mayo, 2026 (Capacitación MIO)',
    nps: 90,
    nextRenewal: '15 de Diciembre, 2026',
    csmName: 'Lic. Clara Inés Mendoza'
  },
  {
    id: 'csm-02',
    name: 'Gimnasio del Norte K-12',
    healthScore: 88,
    status: 'saludable',
    lastLogin: 'Hoy, 08:00 AM',
    activeUsersRatio: '85% (510/600)',
    modulesUsed: 8,
    churnRisk: 'Bajo',
    lastTraining: '10 de junio, 2026 (Evaluaciones IA)',
    nps: 85,
    nextRenewal: '30 de Noviembre, 2026',
    csmName: 'Ing. Julián Gómez'
  },
  {
    id: 'csm-03',
    name: 'Liceo Moderno Campestre',
    healthScore: 62,
    status: 'atencion',
    lastLogin: 'Ayer, 04:30 PM',
    activeUsersRatio: '58% (230/400)',
    modulesUsed: 5,
    churnRisk: 'Medio',
    lastTraining: '15 de abril, 2026 (Inicial)',
    nps: 70,
    nextRenewal: '10 de Julio, 2026',
    csmName: 'Lic. Clara Inés Mendoza'
  },
  {
    id: 'csm-04',
    name: 'Secretaría de Educación de Boyacá',
    healthScore: 91,
    status: 'saludable',
    lastLogin: 'Hoy, 09:10 AM',
    activeUsersRatio: '95% (14 sedes conectadas)',
    modulesUsed: 10,
    churnRisk: 'Bajo',
    lastTraining: '02 de julio, 2026 (Tableros Territorial)',
    nps: 95,
    nextRenewal: '31 de Enero, 2027',
    csmName: 'Ing. Carlos Eduardo Ruiz (Director CS)'
  },
  {
    id: 'csm-05',
    name: 'Instituto Técnico Industrial San Jorge',
    healthScore: 38,
    status: 'critico',
    lastLogin: 'Hace 11 días',
    activeUsersRatio: '22% (65/300)',
    modulesUsed: 3,
    churnRisk: 'Alto',
    lastTraining: '12 de enero, 2026 (Sin asistir al último taller)',
    nps: 45,
    nextRenewal: '15 de Agosto, 2026',
    csmName: 'Ing. Julián Gómez'
  }
];

export function SaasCustomerSuccess({ institutions }: { institutions?: any[] } = {}) {
  const [data, setData] = useState<CustomerHealth[]>(MOCK_CSM_DATA);
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const filtered = data.filter(d => {
    if (filterStatus !== 'todos' && d.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (st: string, score: number) => {
    if (st === 'saludable') {
      return <Badge className="bg-emerald-500 text-white font-black text-[10px] uppercase">● Salud Excelente ({score}/100)</Badge>;
    }
    if (st === 'atencion') {
      return <Badge className="bg-amber-500 text-white font-black text-[10px] uppercase">● Requiere Atención ({score}/100)</Badge>;
    }
    return <Badge className="bg-red-500 text-white font-black text-[10px] uppercase animate-pulse">● Riesgo Crítico ({score}/100)</Badge>;
  };

  const getChurnBadge = (risk: string) => {
    if (risk === 'Bajo') return <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">Bajo</span>;
    if (risk === 'Medio') return <span className="text-amber-700 font-extrabold bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">Medio</span>;
    return <span className="text-red-700 font-black bg-red-50 px-2.5 py-0.5 rounded border border-red-300 animate-pulse">ALTO RIESGO</span>;
  };

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
            <span className="text-lg font-black text-emerald-400">86 / 100</span>
          </div>
          <Smile className="w-8 h-8 text-emerald-400" />
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
            <span className="text-lg font-black text-slate-800">72 Colegios</span>
            <span className="text-[10px] text-emerald-600 font-bold block">Health Score &gt; 80</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Requieren Atención</span>
            <span className="text-lg font-black text-slate-800">8 Colegios</span>
            <span className="text-[10px] text-amber-600 font-bold block">Adopción Media (60-79)</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-red-200 bg-red-50/30 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Riesgo Crítico (Churn)</span>
            <span className="text-lg font-black text-red-700">2 Colegios</span>
            <span className="text-[10px] text-red-600 font-bold block">Intervención Urgente</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Renovaciones Próx. 90d</span>
            <span className="text-lg font-black text-slate-800">14 Contratos</span>
            <span className="text-[10px] text-indigo-600 font-bold block">$240M COP por renovar</span>
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
              {filtered.map(row => (
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
