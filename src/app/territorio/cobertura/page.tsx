'use client';

import React, { useState } from 'react';
import { KpiCard } from '@/components/territorio/KpiCard';
import { ChartCard } from '@/components/territorio/ChartCard';
import { SummaryCard } from '@/components/territorio/SummaryCard';
import { Card } from '@/components/ui/card';
import { 
  Users, UserPlus, UserMinus, ShieldAlert, 
  Sparkles, Sliders, Calendar, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

const MATRICULA_NIVEL = [
  { name: 'Preescolar', oficial: 3400, privado: 1200 },
  { name: 'Primaria', oficial: 11200, privado: 3400 },
  { name: 'Secundaria', oficial: 9800, privado: 2900 },
  { name: 'Media', oficial: 4200, privado: 1550 },
];

export default function TerritoryCoberturaPage() {
  // Estados para el Simulador de Proyección 2027
  const [natalidad, setNatalidad] = useState(1.2); // en porcentaje
  const [desercion, setDesercion] = useState(1.84); // en porcentaje

  // Calcular la proyección simulada
  const baseMatricula2026 = 34250;
  const factorNatalidad = 1 + natalidad / 100;
  const factorDesercion = 1 - desercion / 100;
  const matriculaProyectada2027 = Math.round(baseMatricula2026 * factorNatalidad * factorDesercion);
  const cuposDisponiblesProyectados = Math.max(0, 36500 - matriculaProyectada2027);

  // Datos para el gráfico de proyección
  const datosProyeccion = [
    { name: '2025 (Real)', matricula: 33800 },
    { name: '2026 (Real)', matricula: 34250 },
    { name: '2027 (Proy.)', matricula: matriculaProyectada2027 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
            Módulo de Cobertura Educativa
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Tasas de matrícula, deserción escolar, asignación de cupos y simulador de proyecciones demográficas.
          </p>
        </div>
      </div>

      {/* Fila de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Matrícula Total Activa"
          value={baseMatricula2026.toLocaleString()}
          trend={{ value: 1.3, isPositive: true }}
          icon={Users}
          iconColorClass="text-blue-650"
          iconBgClass="bg-blue-50"
        />
        <KpiCard
          title="Nuevos Inscritos 2026"
          value="4,850"
          trend={{ value: 2.4, isPositive: true }}
          icon={UserPlus}
          iconColorClass="text-indigo-650"
          iconBgClass="bg-indigo-50"
        />
        <KpiCard
          title="Tasa de Deserción"
          value={`${desercion.toFixed(2)}%`}
          trend={{ value: 0.15, isPositive: false, label: 'reducción' }}
          icon={UserMinus}
          iconColorClass="text-emerald-650"
          iconBgClass="bg-emerald-50"
        />
        <KpiCard
          title="Cupos Disponibles"
          value="1,750"
          icon={ShieldAlert}
          iconColorClass="text-rose-650"
          iconBgClass="bg-rose-50"
        />
      </div>

      {/* Gráfico y Simulador */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de distribución de matrícula */}
        <ChartCard
          title="Matrícula por Nivel Educativo y Sector"
          description="Distribución de matrícula activa consolidada en colegios Oficiales vs. Privados."
          className="lg:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MATRICULA_NIVEL} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip />
                <Legend style={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="oficial" name="Sector Oficial (Público)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="privado" name="Sector Privado" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Simulador Interactivo */}
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 bg-slate-50/10 flex items-center justify-between">
            <span className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-650" />
              Simulador Demográfico 2027
            </span>
          </div>
          <div className="p-6 space-y-5 flex-1">
            {/* Sliders de control */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-655">
                <span>Tasa de Crecimiento Natalidad:</span>
                <span className="text-indigo-650 font-black">{natalidad.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={natalidad}
                onChange={(e) => setNatalidad(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[9px] text-slate-400 font-semibold block">Afecta el flujo de nuevos pre-registros.</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-655">
                <span>Tasa de Deserción Objetivo:</span>
                <span className="text-indigo-650 font-black">{desercion.toFixed(2)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.05"
                value={desercion}
                onChange={(e) => setDesercion(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[9px] text-slate-400 font-semibold block">Umbral de deserción anual proyectada.</span>
            </div>

            {/* Resultados de la Simulación */}
            <div className="pt-4 border-t border-slate-150 space-y-3.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Matrícula 2027 Proyectada:</span>
                <span className="text-slate-800 font-black text-sm bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  {matriculaProyectada2027.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Cupos Ofertados Remanentes:</span>
                <span className="text-slate-800 font-black text-sm bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  {cuposDisponiblesProyectados.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[10px] text-slate-450 font-semibold text-center rounded-b-2xl">
            Cálculo dinámico basado en modelo de regresión lineal simple.
          </div>
        </Card>
      </div>

      {/* Fila inferior: Histórico e Insights IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Histórico Simulado */}
        <ChartCard 
          title="Tendencia de Matrícula Proyectada" 
          description="Evolución de matrícula con base a simulación activa."
          className="lg:col-span-2"
        >
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosProyeccion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip />
                <Area type="monotone" dataKey="matricula" name="Matrícula" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Insights IA */}
        <SummaryCard 
          title="Insights IA de Asignación Territorial"
          headerActions={
            <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              IA Sugerencias
            </span>
          }
        >
          <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-xl space-y-3.5 text-xs leading-normal">
            <p className="font-semibold text-slate-655">
              <strong className="text-slate-800">Alerta de Capacidad:</strong> Basado en el simulador, si la natalidad supera el 1.5%, la Comuna 10 (Candelaria) presentará un déficit de 340 cupos para educación media técnica en 2027.
            </p>
            <div className="border-t border-slate-150 pt-2.5 flex items-center justify-between font-bold text-indigo-700">
              <span className="text-[10px] uppercase font-black tracking-wider">Ver Análisis Completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </SummaryCard>
      </div>
    </div>
  );
}
