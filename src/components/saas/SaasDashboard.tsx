'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Building2, Users, DollarSign, Activity, TrendingUp, Cpu, Database,
  HardDrive, Server, ShieldCheck, Zap, AlertCircle, Clock, 
  MapPin, CheckCircle2, Sparkles, Landmark, Award, Info
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';

import { SaasMetrics } from '@/hooks/useSaasMetrics';

interface SaasDashboardProps {
  stats: SaasMetrics | null;
}

export function SaasDashboard({ stats }: SaasDashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6">
      
      {/* 🌟 BLOQUE 1: INDICADORES FINANCIEROS & DE CRECIMIENTO */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          1. Indicadores Financieros SaaS & Cuentas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">MRR (Recurrente Mensual)</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(stats?.mrrCop || 0)}</span>
              <span className="text-[10px] font-bold text-emerald-600 block flex items-center gap-1">
                Obtenido desde Supabase
              </span>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-indigo-800 uppercase tracking-wider">ARR (Proyección Anual)</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(stats?.arrCop || 0)}</span>
              <span className="text-[10px] font-bold text-indigo-600 block">
                Obtenido desde Supabase
              </span>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Tasa de Abandono (Churn)</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-2xl font-black text-slate-900 font-mono">{stats?.churnRate || 0}%</span>
              <span className="text-[10px] font-bold text-slate-400 block">
                Sin registros históricos
              </span>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Clientes Nuevos del Mes</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-2xl font-black text-slate-900 font-mono">{stats?.newClientsThisMonth || 0} Clientes</span>
              <span className="text-[10px] font-bold text-purple-600 block">
                Registrados en el mes actual
              </span>
            </div>
          </Card>
        </div>

        {/* Sub-tarjetas de estado de cuentas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-blue-700 uppercase block">En Prueba (Free Trial)</span>
              <span className="text-base font-black text-blue-950 mt-0.5 block">{stats?.trialingTenants || 0} Tenants</span>
            </div>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">Clientes Activos</span>
              <span className="text-base font-black text-emerald-950 mt-0.5 block">{stats?.activeTenants || 0} Tenants</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-amber-700 uppercase block">Por Vencer (&lt; 30d)</span>
              <span className="text-base font-black text-amber-950 mt-0.5 block">N/D</span>
            </div>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>

          <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-red-700 uppercase block">Suspendidos</span>
              <span className="text-base font-black text-red-950 mt-0.5 block">{stats?.suspendedTenants || 0} Tenants</span>
            </div>
            <Server className="w-5 h-5 text-red-500" />
          </div>
        </div>
      </div>

      {/* 🌟 BLOQUE 2: COBERTURA E IMPACTO PAÍS */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Landmark className="w-4 h-4 text-indigo-500" />
          2. Cobertura País e Impacto en el Ecosistema
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Estudiantes Administrados</span>
              <span className="text-2xl font-black text-slate-900 mt-0.5 block font-mono">{stats?.totalStudents || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Alumnos registrados</span>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Docentes y Directivos</span>
              <span className="text-2xl font-black text-slate-900 mt-0.5 block font-mono">{stats?.totalTeachers || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Educadores operando</span>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Secretarías de Educación</span>
              <span className="text-2xl font-black text-slate-900 mt-0.5 block font-mono">{stats?.totalSeds || 0} SEDs</span>
              <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Entidades gubernamentales</span>
            </div>
          </Card>
        </div>
      </div>

      {/* 🌟 BLOQUE 3: SALUD DE INFRAESTRUCTURA & CONSUMO IA */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-500" />
          3. Telemetría de Infraestructura, Almacenamiento & Inteligencia Artificial
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
              <span>Uptime Plataforma</span>
            </div>
            <span className="text-xl font-black text-slate-600 block font-mono">N/D</span>
            <span className="text-[10px] text-slate-400 block">Sin conexión a telemetría</span>
          </Card>

          <Card className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
              <span>Consumo Tokens IA</span>
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="text-xl font-black text-slate-600 block font-mono">N/D</span>
            <span className="text-[10px] text-slate-400 block">Sin registros en DB</span>
          </Card>

          <Card className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
              <span>Consumo Supabase DB</span>
              <Database className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="text-xl font-black text-slate-600 block font-mono">N/D</span>
            <span className="text-[10px] text-slate-400 block">Sin acceso a Supabase API</span>
          </Card>

          <Card className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
              <span>Almacenamiento S3</span>
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="text-xl font-black text-slate-600 block font-mono">N/D</span>
            <span className="text-[10px] text-slate-400 font-bold block">0%</span>
          </Card>
        </div>
      </div>

      {/* 🌟 BLOQUE 4: GRÁFICOS ESTRATÉGICOS SAAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <Card className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4 flex flex-col justify-center items-center text-center h-64">
            <Info className="w-10 h-10 text-slate-300 mb-2" />
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Crecimiento MRR / ARR</h4>
            <p className="text-xs text-slate-500 max-w-sm">No hay registros históricos suficientes en Supabase para construir este gráfico.</p>
        </Card>

        <Card className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4 flex flex-col justify-center items-center text-center h-64">
            <Info className="w-10 h-10 text-slate-300 mb-2" />
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Expansión de Tenants & Cuentas</h4>
            <p className="text-xs text-slate-500 max-w-sm">No hay registros históricos suficientes en Supabase para construir este gráfico.</p>
        </Card>
      </div>

    </div>
  );
}
