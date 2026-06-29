'use client';

import React, { useState } from 'react';
import { ChartCard } from '@/components/territorio/ChartCard';
import { SummaryCard } from '@/components/territorio/SummaryCard';
import { Sparkles, SlidersHorizontal, ArrowRight, TrendingUp } from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Label 
} from 'recharts';

interface DataPoint {
  school: string;
  xVal: number;
  yVal: number;
}

// --- MOCK DATA PARA CORRELACIONES ---
const GENERATE_MOCK_DATA = (xVar: string, yVar: string): DataPoint[] => {
  // Simular dependencias de datos
  const basePoints = [
    { school: 'Gimnasio Campestre AulaCore', digital: 98, connectivity: 95, attendance: 97, math: 4.8, lang: 4.9, desercion: 0.1 },
    { school: 'Colegio San Ignacio', digital: 94, connectivity: 90, attendance: 96, math: 4.6, lang: 4.7, desercion: 0.2 },
    { school: 'I.E. Presbítero Antonio Bernal', digital: 88, connectivity: 85, attendance: 92, math: 4.2, lang: 4.5, desercion: 1.1 },
    { school: 'I.E. Marco Fidel Suárez', digital: 82, connectivity: 80, attendance: 90, math: 4.1, lang: 4.4, desercion: 1.5 },
    { school: 'I.E. Rural El Hatillo', digital: 68, connectivity: 30, attendance: 82, math: 3.3, lang: 3.6, desercion: 4.8 },
    { school: 'I.E. Pascual Bravo', digital: 85, connectivity: 80, attendance: 91, math: 4.0, lang: 4.1, desercion: 1.8 },
  ];

  return basePoints.map(p => {
    let xVal = p.digital;
    if (xVar === 'conectividad') xVal = p.connectivity;
    if (xVar === 'asistencia') xVal = p.attendance;

    let yVal = p.math;
    if (yVar === 'lenguaje') yVal = p.lang;
    if (yVar === 'desercion') yVal = p.desercion;

    return { school: p.school, xVal, yVal };
  });
};

const VARIABLES_X = [
  { value: 'madurez', label: 'Madurez Digital (% Health Score)' },
  { value: 'conectividad', label: 'Conectividad Sede Principal (% Banda Ancha)' },
  { value: 'asistencia', label: 'Tasa de Asistencia Media (%)' },
];

const VARIABLES_Y = [
  { value: 'matematicas', label: 'Promedio Académico Matemáticas' },
  { value: 'lenguaje', label: 'Promedio Académico Lenguaje' },
  { value: 'desercion', label: 'Tasa de Deserción Escolar (%)' },
];

export default function TerritoryAnaliticaPage() {
  const [xVar, setXVar] = useState('madurez');
  const [yVar, setYVar] = useState('matematicas');

  const plotData = GENERATE_MOCK_DATA(xVar, yVar);

  // Obtener etiquetas
  const labelX = VARIABLES_X.find(v => v.value === xVar)?.label || '';
  const labelY = VARIABLES_Y.find(v => v.value === yVar)?.label || '';

  // Simular Coeficiente R de Correlación
  let rVal = 0.78;
  if (xVar === 'conectividad' && yVar === 'desercion') rVal = -0.84;
  if (xVar === 'madurez' && yVar === 'lenguaje') rVal = 0.74;
  if (xVar === 'asistencia' && yVar === 'desercion') rVal = -0.91;

  const rStatus = Math.abs(rVal) >= 0.8 
    ? 'Fuerte' 
    : Math.abs(rVal) >= 0.6 ? 'Moderada' : 'Débil';

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
            Analítica Avanzada Territorial
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Cruce interactivo de variables y análisis correlacional para la toma de decisiones.
          </p>
        </div>
      </div>

      {/* Selector de Variables - Barra Consistente */}
      <div className="bg-slate-50/20 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-slate-700 shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-indigo-650" />
          <span className="text-xs font-black uppercase tracking-wider">Cruzar Indicadores</span>
        </div>

        {/* Eje X */}
        <div className="flex flex-col gap-1 flex-1 w-full">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Eje X (Variable Independiente)</span>
          <select
            value={xVar}
            onChange={(e) => setXVar(e.target.value)}
            className="text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 w-full"
          >
            {VARIABLES_X.map(v => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Eje Y */}
        <div className="flex flex-col gap-1 flex-1 w-full">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Eje Y (Variable Dependiente)</span>
          <select
            value={yVar}
            onChange={(e) => setYVar(e.target.value)}
            className="text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 w-full"
          >
            {VARIABLES_Y.map(v => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráfico de Dispersión */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Matriz de Dispersión y Tendencia"
          description={`Correlación de colegios entre ${labelX} y ${labelY}.`}
          className="lg:col-span-2"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="xVal" 
                  name={labelX} 
                  stroke="#94a3b8" 
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                >
                  <Label value={labelX} offset={-5} position="insideBottom" style={{ fontSize: '9px', fontWeight: 'bold', fill: '#94a3b8' }} />
                </XAxis>
                <YAxis 
                  type="number" 
                  dataKey="yVal" 
                  name={labelY} 
                  stroke="#94a3b8" 
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                >
                  <Label value={labelY} angle={-90} position="insideLeft" style={{ fontSize: '9px', fontWeight: 'bold', fill: '#94a3b8' }} />
                </YAxis>
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Colegios" data={plotData} fill="#6366f1" shape="circle" line={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Coeficiente e Insights IA */}
        <SummaryCard 
          title="Correlación Estimada e Insight IA"
          headerActions={
            <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              IA Activa
            </span>
          }
        >
          <div className="space-y-5">
            {/* KPI R de Pearson */}
            <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Coeficiente R de Pearson</span>
              <span className="text-3xl font-black text-indigo-700 tracking-tight block">
                {rVal.toFixed(2)}
              </span>
              <span className="text-[10px] font-black text-slate-450 uppercase block">
                Correlación {rStatus}
              </span>
            </div>

            {/* Análisis Narrativo IA */}
            <div className="bg-indigo-50/20 border border-indigo-150 p-4 rounded-xl flex gap-3 text-slate-800 items-start">
              <Sparkles className="w-5 h-5 shrink-0 text-indigo-600 mt-0.5 animate-pulse" />
              <div className="text-xs leading-relaxed">
                <span className="font-extrabold block">Análisis Curricular Progresivo</span>
                <p className="font-semibold text-slate-655 mt-1">
                  {Math.abs(rVal) >= 0.8 
                    ? `Se detecta una correlación estadística muy marcada entre las dos variables. Esto confirma que intervenir sobre ${labelX} mejorará directamente ${labelY} en las comunas evaluadas.`
                    : `Existe una tendencia clara en el territorio. Se sugiere focalizar esfuerzos y programar una auditoría de mallas para corregir la dispersión actual.`
                  }
                </p>
              </div>
            </div>
          </div>
        </SummaryCard>
      </div>
    </div>
  );
}
