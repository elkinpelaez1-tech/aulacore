'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Building2, Users, DollarSign, Activity, TrendingUp, Cpu, Database,
  HardDrive, Server, ShieldCheck, Zap, AlertCircle, Clock, 
  MapPin, CheckCircle2, Sparkles, Landmark, Award
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';

interface SaasDashboardProps {
  stats: any;
}

const REVENUE_DATA = [
  { month: 'Ene', mrr: 62000, arr: 744000 },
  { month: 'Feb', mrr: 66000, arr: 792000 },
  { month: 'Mar', mrr: 71000, arr: 852000 },
  { month: 'Abr', mrr: 75000, arr: 900000 },
  { month: 'May', mrr: 79000, arr: 948000 },
  { month: 'Jun', mrr: 84500, arr: 1014000 },
];

const CLIENTS_GROWTH_DATA = [
  { month: 'Ene', colegios: 42, secretarias: 8, trial: 15 },
  { month: 'Feb', colegios: 48, secretarias: 9, trial: 18 },
  { month: 'Mar', colegios: 54, secretarias: 11, trial: 14 },
  { month: 'Abr', colegios: 59, secretarias: 12, trial: 16 },
  { month: 'May', colegios: 63, secretarias: 13, trial: 15 },
  { month: 'Jun', colegios: 68, secretarias: 14, trial: 12 },
];

export function SaasDashboard({ stats }: SaasDashboardProps) {
  return (
    <div className="space-y-6">
      
      {/* 🌟 BLOQUE 1: INDICADORES FINANCIEROS & DE CRECIMIENTO ENTERPRISE */}
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
              <span className="text-2xl font-black text-slate-900 font-mono">$84,500,000</span>
              <span className="text-[10px] font-bold text-emerald-600 block flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +12.4% vs mes anterior (COP)
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
              <span className="text-2xl font-black text-slate-900 font-mono">$1,014,000,000</span>
              <span className="text-[10px] font-bold text-indigo-600 block">
                🚀 Superando meta anual del Q2
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
              <span className="text-2xl font-black text-slate-900 font-mono">0.8%</span>
              <span className="text-[10px] font-bold text-emerald-600 block">
                ● Excelente retención (&lt; 2% meta)
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
              <span className="text-2xl font-black text-slate-900 font-mono">+6 Clientes</span>
              <span className="text-[10px] font-bold text-purple-600 block">
                4 Colegios y 2 Secretarías nuevas
              </span>
            </div>
          </Card>
        </div>

        {/* Sub-tarjetas de estado de cuentas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-blue-700 uppercase block">En Prueba (Free Trial)</span>
              <span className="text-base font-black text-blue-950 mt-0.5 block">12 Tenants</span>
            </div>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">Clientes Activos</span>
              <span className="text-base font-black text-emerald-950 mt-0.5 block">82 Tenants</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-amber-700 uppercase block">Por Vencer (&lt; 30d)</span>
              <span className="text-base font-black text-amber-950 mt-0.5 block">4 Tenants</span>
            </div>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>

          <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-red-700 uppercase block">Suspendidos</span>
              <span className="text-base font-black text-red-950 mt-0.5 block">2 Tenants</span>
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
              <span className="text-2xl font-black text-slate-900 mt-0.5 block font-mono">48,250</span>
              <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">● Alumnos en 14 departamentos</span>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Docentes y Directivos</span>
              <span className="text-2xl font-black text-slate-900 mt-0.5 block font-mono">3,120</span>
              <span className="text-[10px] font-bold text-purple-600 block mt-0.5">● Educadores operando en la nube</span>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Secretarías de Educación</span>
              <span className="text-2xl font-black text-slate-900 mt-0.5 block font-mono">14 SEDs</span>
              <span className="text-[10px] font-bold text-blue-600 block mt-0.5">● Conectadas a SIMAT y SISBEN IV</span>
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
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-xl font-black text-emerald-600 block font-mono">99.98%</span>
            <span className="text-[10px] text-slate-500 block">Vercel Edge + Supabase Global</span>
          </Card>

          <Card className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
              <span>Consumo Tokens IA</span>
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <span className="text-xl font-black text-purple-700 block font-mono">4.2M tokens</span>
            <span className="text-[10px] text-slate-500 block">$184 USD este mes (CIE/MIO)</span>
          </Card>

          <Card className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
              <span>Consumo Supabase DB</span>
              <Database className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-xl font-black text-blue-700 block font-mono">14.2% CPU</span>
            <span className="text-[10px] text-slate-500 block">48 conexiones activas</span>
          </Card>

          <Card className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
              <span>Almacenamiento S3</span>
              <HardDrive className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <span className="text-xl font-black text-slate-800 block font-mono">18.4 GB</span>
            <span className="text-[10px] text-emerald-600 font-bold block">1.8% de 1 TB contratado</span>
          </Card>
        </div>
      </div>

      {/* 🌟 BLOQUE 4: GRÁFICOS ESTRATÉGICOS SAAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <Card className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Crecimiento MRR / ARR (Miles de USD)</h4>
            <p className="text-xs text-slate-500">Evolución de ingresos recurrentes durante el primer semestre 2026</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700 }}
                  formatter={(val) => [`$${val} COP x 1,000`, 'Valor']}
                />
                <Area type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" name="MRR" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Expansión de Tenants & Cuentas en Prueba</h4>
            <p className="text-xs text-slate-500">Distribución entre Colegios K-12, Secretarías y Trials</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CLIENTS_GROWTH_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '8px' }} />
                <Bar dataKey="colegios" name="Colegios" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="secretarias" name="Secretarías (SED)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="trial" name="En Prueba (Demo/Trial)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

    </div>
  );
}
