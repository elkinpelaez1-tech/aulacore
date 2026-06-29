'use client';

import React, { useState } from 'react';
import { ChartCard } from '@/components/territorio/ChartCard';
import { SummaryCard } from '@/components/territorio/SummaryCard';
import { Sparkles, SlidersHorizontal, ArrowRight, TrendingUp, HelpCircle, X } from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Label 
} from 'recharts';

interface DataPoint {
  school: string;
  xVal: number;
  yVal: number;
}

interface ExplainerInfo {
  title: string;
  definition: string;
  calculation: string;
  interpretation: string;
  decisions: string;
}

const EXPLAINERS: Record<string, ExplainerInfo> = {
  madurez: {
    title: 'Madurez Digital (Health Score)',
    definition: 'Evalúa de manera agregada la adopción de herramientas digitales y módulos de AulaCore en los colegios de la jurisdicción.',
    calculation: 'Ponderación porcentual según el estado activo de los módulos curriculares, administrativos y de asistencia (RFID, Mallas, PEI, Planeación Horaria).',
    interpretation: 'Puntajes mayores a 80% reflejan una excelente asimilación digital. Valores inferiores a 70% indican riesgo de rezago operativo y necesidad de capacitación.',
    decisions: 'Priorizar auditorías técnicas y asignar acompañamiento a directivos y secretarios de colegios rezagados.'
  },
  conectividad: {
    title: 'Conectividad (Banda Ancha)',
    definition: 'Mide la disponibilidad y calidad del enlace a internet de banda ancha contratado o entregado en la sede principal del plantel.',
    calculation: 'Porcentaje de sedes con conexión dedicada superior a 20 Mbps y estabilidad de canal en el mes.',
    interpretation: 'Permite segmentar colegios urbanos y rurales. Indispensable para habilitar servicios sincrónicos en AulaCore.',
    decisions: 'Tramitar proyectos de cofinanciación de infraestructura de redes ante el Ministerio de TIC en áreas rurales críticas.'
  },
  asistencia: {
    title: 'Tasa de Asistencia Media',
    definition: 'Promedio consolidado del cumplimiento de presencialidad de los alumnos en sus jornadas académicas.',
    calculation: 'Registros de entrada en portería cruzados por lectoras RFID y reportes de inasistencias en clase.',
    interpretation: 'Tasas inferiores a 90% representan un disparador de riesgo académico y posible deserción escolar posterior.',
    decisions: 'Activar el protocolo de retención escolar (visitas del Supervisor de Zona y apoyo alimentario PAE).'
  },
  pearson: {
    title: 'Coeficiente de Correlación R de Pearson',
    definition: 'Estadístico matemático que cuantifica el grado de asociación lineal entre las dos variables seleccionadas.',
    calculation: 'Fórmula de covarianza de las variables dividida por el producto de sus desviaciones estándar.',
    interpretation: 'Va de -1.0 a +1.0. Un valor cercano a 1.5 es positivo fuerte (ambas suben juntas); cercano a -1.0 es negativo fuerte (al subir una, baja la otra). 0.0 indica ausencia de relación lineal.',
    decisions: 'Validar si la inversión tecnológica realizada (Eje X) está provocando un retorno efectivo en calidad o deserción (Eje Y).'
  }
};

const GENERATE_MOCK_DATA = (xVar: string, yVar: string): DataPoint[] => {
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
  const [explainerId, setExplainerId] = useState<string | null>(null);

  const plotData = GENERATE_MOCK_DATA(xVar, yVar);

  const labelX = VARIABLES_X.find(v => v.value === xVar)?.label || '';
  const labelY = VARIABLES_Y.find(v => v.value === yVar)?.label || '';

  // Pearson logic simulation
  let rVal = 0.78;
  if (xVar === 'conectividad' && yVar === 'desercion') rVal = -0.84;
  if (xVar === 'madurez' && yVar === 'lenguaje') rVal = 0.74;
  if (xVar === 'asistencia' && yVar === 'desercion') rVal = -0.91;

  const rStatus = Math.abs(rVal) >= 0.8 
    ? 'Fuerte' 
    : Math.abs(rVal) >= 0.6 ? 'Moderada' : 'Débil';

  const explainerData = explainerId ? EXPLAINERS[explainerId] : null;

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
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
            Eje X (Variable Independiente)
            <button 
              onClick={() => setExplainerId(xVar)}
              className="text-slate-450 hover:text-indigo-600 transition-colors cursor-pointer border-none bg-transparent"
              title="Explicar indicador"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </span>
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
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
            Eje Y (Variable Dependiente)
          </span>
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
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setExplainerId('pearson')}
                className="text-slate-450 hover:text-indigo-600 cursor-pointer border-none bg-transparent"
                title="¿Cómo se calcula este coeficiente?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                IA Activa
              </span>
            </div>
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

      {/* ================================================================= */}
      {/* 🧭 MODAL EXPLICATIVO DEL INDICADOR SELECCIONADO (INFO MODAL)     */}
      {/* ================================================================= */}
      {explainerData && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-3xl flex flex-col border border-slate-200 overflow-hidden m-4 animate-scale-in">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-650" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Guía Metodológica del Indicador
                </h3>
              </div>
              <button 
                onClick={() => setExplainerId(null)}
                className="p-1 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4 text-xs leading-normal">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Indicador</span>
                <h4 className="text-sm font-black text-indigo-700 uppercase tracking-wide mt-0.5">{explainerData.title}</h4>
              </div>

              <div className="space-y-3.5 border-t border-slate-100 pt-4 font-semibold text-slate-655">
                <p>
                  <strong className="text-slate-800 block">¿Qué significa?</strong>
                  {explainerData.definition}
                </p>
                <p>
                  <strong className="text-slate-800 block">¿Cómo se calcula?</strong>
                  {explainerData.calculation}
                </p>
                <p>
                  <strong className="text-slate-800 block">¿Cómo debe interpretarse?</strong>
                  {explainerData.interpretation}
                </p>
                <p className="bg-indigo-50/20 border border-indigo-150 p-3.5 rounded-xl text-indigo-900">
                  <strong className="text-indigo-950 block mb-0.5">¿Qué decisiones permite tomar?</strong>
                  {explainerData.decisions}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/20 flex justify-end">
              <button
                onClick={() => setExplainerId(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer border-none"
              >
                Cerrar Guía
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
