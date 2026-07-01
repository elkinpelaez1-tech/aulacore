'use client';

import React, { useState, useEffect } from 'react';
import { ChartCard } from '@/components/territorio/ChartCard';
import { SummaryCard } from '@/components/territorio/SummaryCard';
import { Modal } from '@/components/territorio/Modal';
import { 
  getCIEIndicators, 
  updateCIEIndicator, 
  calculateGlobalRiskIndex, 
  getCIEHistory, 
  CIEIndicator,
  CIEIndicatorType
} from '@/services/cie-service';
import { 
  Sparkles, 
  SlidersHorizontal, 
  ArrowRight, 
  TrendingUp, 
  HelpCircle, 
  AlertTriangle, 
  Activity, 
  ShieldAlert, 
  Info, 
  CheckCircle,
  Database,
  BarChart3,
  BrainCircuit,
  Sliders,
  Settings
} from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Label, AreaChart, Area
} from 'recharts';

interface DataPoint {
  school: string;
  xVal: number;
  yVal: number;
}

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

const MOCK_SCHOOL_RISKS = [
  { name: 'I.E. Rural El Hatillo', index: 82, status: 'Crítico', pupils: 340, zone: 'Veredal' },
  { name: 'I.E. Presbítero Antonio Bernal', index: 54, status: 'Alto', pupils: 780, zone: 'Comuna 4' },
  { name: 'I.E. Marco Fidel Suárez', index: 48, status: 'Moderado', pupils: 1250, zone: 'Comuna 1' },
  { name: 'I.E. Pascual Bravo', index: 39, status: 'Moderado', pupils: 920, zone: 'Urbana' },
  { name: 'Colegio San Ignacio', index: 12, status: 'Bajo', pupils: 1450, zone: 'Urbana' }
];

export default function TerritoryCIEPage() {
  const [activeMainTab, setActiveMainTab] = useState<'prediction' | 'analytics'>('prediction');
  const [indicatorFilter, setIndicatorFilter] = useState<'all' | CIEIndicatorType>('all');
  const [indicators, setIndicators] = useState<CIEIndicator[]>([]);
  const [selectedInd, setSelectedInd] = useState<CIEIndicator | null>(null);
  const [calibrationInd, setCalibrationInd] = useState<CIEIndicator | null>(null);
  
  // Analytics sub-states
  const [xVar, setXVar] = useState('madurez');
  const [yVar, setYVar] = useState('matematicas');
  const [explainerId, setExplainerId] = useState<string | null>(null);

  // MIO simulated recent runs
  const [recentRuns, setRecentRuns] = useState<any[]>([]);

  useEffect(() => {
    setIndicators(getCIEIndicators());
    
    // Cargar corridas recientes simuladas
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('mio_runs');
      if (stored) {
        try {
          setRecentRuns(JSON.parse(stored).slice(0, 5));
        } catch (e) {}
      }
    }
  }, []);

  const handleRefreshData = () => {
    setIndicators(getCIEIndicators());
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('mio_runs');
      if (stored) {
        try {
          setRecentRuns(JSON.parse(stored).slice(0, 5));
        } catch (e) {}
      }
    }
  };

  const handleUpdateIndicatorValue = (code: string, val: number) => {
    const updated = updateCIEIndicator(code, { currentValue: val });
    setIndicators(updated);
    handleRefreshData();
  };

  const handleCalibrateIndicator = (code: string, weight: number, threshold: number) => {
    const updated = updateCIEIndicator(code, { weight, threshold });
    setIndicators(updated);
    setCalibrationInd(null);
    handleRefreshData();
  };

  // Pearson logic simulation
  const plotData = GENERATE_MOCK_DATA(xVar, yVar);
  const labelX = VARIABLES_X.find(v => v.value === xVar)?.label || '';
  const labelY = VARIABLES_Y.find(v => v.value === yVar)?.label || '';

  let rVal = 0.78;
  if (xVar === 'conectividad' && yVar === 'desercion') rVal = -0.84;
  if (xVar === 'madurez' && yVar === 'lenguaje') rVal = 0.74;
  if (xVar === 'asistencia' && yVar === 'desercion') rVal = -0.91;

  const rStatus = Math.abs(rVal) >= 0.8 
    ? 'Fuerte' 
    : Math.abs(rVal) >= 0.6 ? 'Moderada' : 'Débil';

  const globalRisk = calculateGlobalRiskIndex();
  
  const filteredIndicators = indicators.filter(ind => {
    if (indicatorFilter === 'all') return true;
    return ind.type === indicatorFilter;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
            NOC Analítico de AulaCore
          </span>
          <h2 className="text-xl font-black text-slate-805 uppercase tracking-wider mt-1.5">
            Centro de Inteligencia Educativa (CIE)
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Cerebro global del territorio para la detección temprana de riesgos y análisis de correlación cruzada.
          </p>
        </div>

        {/* Pestañas de Nivel Superior (CIE-Pred vs CIE-Analítica) */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner w-fit shrink-0">
          <button
            onClick={() => setActiveMainTab('prediction')}
            className={`text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border-none cursor-pointer flex items-center gap-1.5 transition-all ${activeMainTab === 'prediction' ? 'bg-white text-indigo-700 shadow-md scale-100' : 'text-slate-550'}`}
          >
            <BrainCircuit className="w-4 h-4" />
            Predicción de Riesgos
          </button>
          <button
            onClick={() => setActiveMainTab('analytics')}
            className={`text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border-none cursor-pointer flex items-center gap-1.5 transition-all ${activeMainTab === 'analytics' ? 'bg-white text-indigo-700 shadow-md scale-100' : 'text-slate-550'}`}
          >
            <BarChart3 className="w-4 h-4" />
            Analítica de Tendencias
          </button>
        </div>
      </div>

      {/* 🚀 CAPACIDAD 1: PREDICCIÓN DE RIESGOS */}
      {activeMainTab === 'prediction' && (
        <div className="space-y-6">
          {/* Fila superior: IGR + Resumen BI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Widget del Índice Global de Riesgo */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4.5 h-4.5 text-indigo-600" />
                  Índice Global de Riesgo (IGR)
                </h3>
                <p className="text-[10px] text-slate-450 mt-1 font-semibold">
                  Calificación ejecutiva ponderada en tiempo real de toda la jurisdicción.
                </p>
              </div>

              <div className="flex items-center justify-center py-2 relative">
                <div className="w-32 h-32 rounded-full border-[10px] border-slate-100 flex flex-col items-center justify-center" style={{ borderColor: `${globalRisk.color}20` }}>
                  <span className="text-3xl font-black text-slate-800 tracking-tight" style={{ color: globalRisk.color }}>
                    {globalRisk.value}%
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                    Riesgo {globalRisk.label}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-[10px] font-semibold text-slate-600 leading-relaxed">
                <span className="font-extrabold text-slate-700 block">Diagnóstico de Alarma:</span>
                {globalRisk.value >= 50 
                  ? '⚠️ La Secretaría registra vulnerabilidades severas en el Programa PAE y deserción escolar veredal. Se aconseja despachar brigadas móviles.'
                  : '✅ El territorio opera dentro de los umbrales normales de cobertura y rendimiento.'
                }
              </div>
            </div>

            {/* Mapa de Calor / Top Organizaciones */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 lg:col-span-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Semáforo de Organizaciones bajo Mayor Vulnerabilidad
                  </h3>
                  <p className="text-[10px] text-slate-450 mt-0.5 font-semibold">
                    Colegios del municipio que reportan el mayor Índice Global de Riesgo individual.
                  </p>
                </div>
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">
                  Filtro SIMAT Activo
                </span>
              </div>

              <div className="space-y-2.5 pt-2">
                {MOCK_SCHOOL_RISKS.map((school, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl bg-slate-50/40 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" 
                        style={{ 
                          backgroundColor: school.index >= 75 ? '#ef4444' : school.index >= 45 ? '#f97316' : '#10b981' 
                        }}
                      ></div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{school.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{school.zone} ➔ {school.pupils} matriculados</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black block" style={{ color: school.index >= 75 ? '#ef4444' : school.index >= 45 ? '#f97316' : '#10b981' }}>
                        {school.index}% IGR
                      </span>
                      <span className="text-[9px] font-bold text-slate-450 uppercase block">Riesgo {school.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grilla Central de los Indicadores Predictivos/Descriptivos */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Biblioteca Global de Indicadores Analíticos y Predictivos
                </h3>
                <p className="text-[10px] text-slate-450 mt-0.5 font-semibold">
                  Haga clic en el botón de ayuda ⓘ para ver la Ficha Técnica, evolución histórica y recomendaciones de cada indicador.
                </p>
              </div>

              {/* Filtro por tipo de indicador */}
              <div className="flex gap-1 bg-slate-50 p-1 border border-slate-200 rounded-xl w-fit">
                <button
                  onClick={() => setIndicatorFilter('all')}
                  className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg border-none cursor-pointer ${indicatorFilter === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-450'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setIndicatorFilter('predictivo')}
                  className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg border-none cursor-pointer ${indicatorFilter === 'predictivo' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-455'}`}
                >
                  Predictivo
                </button>
                <button
                  onClick={() => setIndicatorFilter('descriptivo')}
                  className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg border-none cursor-pointer ${indicatorFilter === 'descriptivo' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-455'}`}
                >
                  Descriptivo
                </button>
                <button
                  onClick={() => setIndicatorFilter('diagnostico')}
                  className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg border-none cursor-pointer ${indicatorFilter === 'diagnostico' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-455'}`}
                >
                  Diagnóstico
                </button>
                <button
                  onClick={() => setIndicatorFilter('prescriptivo')}
                  className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg border-none cursor-pointer ${indicatorFilter === 'prescriptivo' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-455'}`}
                >
                  Prescriptivo
                </button>
              </div>
            </div>

            {/* Grilla de Tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredIndicators.map((ind) => {
                const isOverThreshold = ind.currentValue >= ind.threshold;
                return (
                  <div 
                    key={ind.code}
                    className={`bg-white border rounded-3xl p-4.5 shadow-xs flex flex-col justify-between gap-3.5 transition-all hover:border-slate-300 relative ${isOverThreshold && ind.type === 'predictivo' ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-205'}`}
                  >
                    {/* Badge e Info */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[8px] font-black text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {ind.code}
                          </span>
                          <span className="text-[8px] font-black text-slate-450 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {ind.type}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mt-2">
                          {ind.name}
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {ind.description}
                        </p>
                      </div>

                      {/* Botón Ficha Técnica */}
                      <button 
                        onClick={() => setSelectedInd(ind)}
                        className="text-slate-400 hover:text-indigo-650 transition-colors border-none bg-transparent cursor-pointer"
                        title="Ver Ficha Técnica"
                      >
                        <Info className="w-5 h-5 shrink-0" />
                      </button>
                    </div>

                    {/* Barra de progreso interactiva (Valor Actual) */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-450">Vulnerabilidad actual:</span>
                        <span className="text-slate-800">{ind.currentValue}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full relative overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${ind.currentValue}%`,
                            backgroundColor: isOverThreshold && ind.type === 'predictivo' 
                              ? '#ef4444' 
                              : ind.currentValue >= 50 ? '#f97316' : '#10b981'
                          }}
                        ></div>
                        {/* Indicador visual del umbral */}
                        <div 
                          className="w-0.5 h-full bg-slate-400 absolute top-0"
                          style={{ left: `${ind.threshold}%` }}
                          title={`Umbral: ${ind.threshold}%`}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold">
                        <span>Min: 0%</span>
                        <span>Umbral Alerta: {ind.threshold}%</span>
                        <span>Max: 100%</span>
                      </div>
                    </div>

                    {/* Controles de Simulación Rápida */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {/* Slider para cambiar valor actual */}
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">Simular valor:</span>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={ind.currentValue}
                          onChange={(e) => handleUpdateIndicatorValue(ind.code, parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                        />
                      </div>

                      {/* Botón calibración */}
                      <button 
                        onClick={() => setCalibrationInd(ind)}
                        className="text-[8px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2 py-1 rounded-md cursor-pointer flex items-center gap-1"
                        title="Calibrar pesos y umbrales"
                      >
                        <Settings className="w-2.5 h-2.5" />
                        Calibrar
                      </button>
                    </div>

                    {/* Alerta de umbral superado */}
                    {isOverThreshold && ind.type === 'predictivo' && (
                      <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md" title="¡Umbral superado! Alerta predictiva activa en el MIO">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fila Inferior: Bitácora de Integración CIE-MIO */}
          <div className="bg-slate-950 border border-slate-850 text-white rounded-3xl p-5 shadow-lg space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase text-indigo-400 tracking-widest flex items-center gap-1.5">
                <Database className="w-4.5 h-4.5 text-indigo-400" />
                Logs del Bus del MIO: Eventos Recibidos desde el CIE
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                Bitácora en caliente de los eventos lógicos y predictivos despachados por el CIE al motor de automatizaciones MIO.
              </p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pt-2 border-t border-slate-900 font-mono text-[10px]">
              {recentRuns.map((run, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4 p-2 bg-slate-900/60 border border-slate-800 rounded-xl hover:bg-slate-900 transition-colors">
                  <div className="flex gap-2">
                    <span className="text-indigo-400 font-bold shrink-0">[{new Date(run.createdAt).toLocaleTimeString()}]</span>
                    <span className="text-slate-400 shrink-0">CIE ➔ MIO:</span>
                    <span className="text-slate-205 font-semibold leading-relaxed">
                      {run.recipeName} superó el umbral. Evento predictivo emitido con éxito. Folio de auditoría criptográfica: <span className="text-emerald-400 font-bold">#{run.folio}</span>
                    </span>
                  </div>
                  <span className="text-[8px] font-black text-indigo-300 bg-indigo-950 border border-indigo-900 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                    Procesado (8ms)
                  </span>
                </div>
              ))}
              {recentRuns.length === 0 && (
                <div className="text-center py-6 text-slate-500 font-bold">
                  Aún no se han gatillado eventos. Arrastre los sliders de simulación de valor actual de algún indicador predictivo por encima de su umbral.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📊 CAPACIDAD 2: ANALÍTICA DE TENDENCIAS (Pearson multivariable original) */}
      {activeMainTab === 'analytics' && (
        <div className="space-y-6">
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
                  className="text-slate-450 hover:text-indigo-655 transition-colors cursor-pointer border-none bg-transparent"
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
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                Eje Y (Variable Dependiente)
                <button 
                  onClick={() => setExplainerId(yVar)}
                  className="text-slate-455 hover:text-indigo-655 transition-colors cursor-pointer border-none bg-transparent"
                  title="Explicar indicador"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
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
              className="lg:col-span-2 animate-fade-in"
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
                    className="text-slate-455 hover:text-indigo-600 cursor-pointer border-none bg-transparent"
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
                        ? `Se detecta una correlación estadística muy marcada entre las dos variables. Esto confirma que intervenir sobre ${labelX} mejorará directamente ${labelY} en las comunas del municipio.`
                        : `Existe una tendencia clara en el territorio. Se sugiere focalizar esfuerzos y programar una auditoría de mallas por calidad para corregir la dispersión actual.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </SummaryCard>
          </div>
        </div>
      )}

      {/* 🧭 MODAL 1: FICHA TÉCNICA COMPLETA DEL INDICADOR (ⓘ) */}
      <Modal
        isOpen={!!selectedInd}
        onClose={() => setSelectedInd(null)}
        title="Ficha Metodológica del Indicador"
        subtitle="Centro de Inteligencia Educativa (CIE)"
        footer={
          <button
            onClick={() => setSelectedInd(null)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer border-none"
          >
            Cerrar Ficha
          </button>
        }
      >
        {selectedInd && (
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 text-xs font-semibold text-slate-655">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                {selectedInd.code} ➔ Categoría: {selectedInd.category}
              </span>
              <h4 className="text-sm font-black text-indigo-755 uppercase tracking-wide mt-0.5">{selectedInd.name}</h4>
              <span className="text-[9px] font-bold text-slate-450 bg-slate-100 px-2 py-0.5 rounded uppercase mt-1 inline-block">
                Tipo Analítico: {selectedInd.type}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-3">
                <p>
                  <strong className="text-slate-800 block">Objetivo:</strong>
                  {selectedInd.objective}
                </p>
                <p>
                  <strong className="text-slate-800 block">Descripción Técnica:</strong>
                  {selectedInd.description}
                </p>
                <p>
                  <strong className="text-slate-800 block">Variables de Entrada:</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    {selectedInd.variables.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </p>
                <p className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <strong className="text-slate-800 block font-bold font-mono">Fórmula Analítica:</strong>
                  <span className="font-mono text-slate-700 block mt-0.5">{selectedInd.formula}</span>
                </p>
              </div>

              <div className="space-y-3">
                <p>
                  <strong className="text-slate-800 block">Guía de Interpretación:</strong>
                  {selectedInd.interpretation}
                </p>
                <p className="bg-indigo-50/20 border border-indigo-150 p-3.5 rounded-xl text-indigo-900">
                  <strong className="text-indigo-955 block mb-1">Acciones Recomendadas por AulaCore:</strong>
                  <ul className="list-decimal pl-4 space-y-1.5">
                    {selectedInd.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </p>
                {selectedInd.mioTriggerEvent && (
                  <p className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-900">
                    <strong className="text-amber-955 block mb-1">Automatizaciones MIO / Protocolos:</strong>
                    Vulnerable ante evento: <span className="font-mono font-bold block">{selectedInd.mioTriggerEvent}</span>
                    Protocolos asociados: <span className="font-bold block mt-1">{selectedInd.relatedProtocols.join(', ') || 'Ninguno'}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Evolución Histórica de la Métrica */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <strong className="text-slate-800 block text-xs">Evolución Histórica (Tendencia 6 Meses)</strong>
              <div className="h-40 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getCIEHistory(selectedInd.code)} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '9px', fontWeight: 'bold' }} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" style={{ fontSize: '9px', fontWeight: 'bold' }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 🔧 MODAL 2: CALIBRACIÓN DE PESOS Y UMBRALES DEL CIE */}
      <Modal
        isOpen={!!calibrationInd}
        onClose={() => setCalibrationInd(null)}
        title="Calibrador de Algoritmo Analítico"
        subtitle="Parámetros de Cálculo del CIE"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <button
              onClick={() => setCalibrationInd(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer border-none"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (calibrationInd) {
                  handleCalibrateIndicator(calibrationInd.code, calibrationInd.weight, calibrationInd.threshold);
                }
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer border-none"
            >
              Guardar Configuración
            </button>
          </div>
        }
      >
        {calibrationInd && (
          <div className="space-y-4 text-xs font-semibold text-slate-655">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Calibrando: {calibrationInd.code}</span>
              <h4 className="text-sm font-black text-slate-800 mt-0.5">{calibrationInd.name}</h4>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              {/* Peso en el IGR */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-700">Peso en el Índice Global de Riesgo (IGR):</span>
                  <span className="text-indigo-650 font-black">{calibrationInd.weight}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={calibrationInd.weight}
                  onChange={(e) => setCalibrationInd({ ...calibrationInd, weight: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                />
                <span className="text-[8px] text-slate-400 block leading-normal">
                  Define el peso relativo de este indicador predictivo en el promedio ponderado del Índice Global de Riesgo municipal.
                </span>
              </div>

              {/* Umbral de Alerta */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-700">Umbral Crítico de Disparo de Alerta:</span>
                  <span className="text-red-500 font-black">{calibrationInd.threshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="95" 
                  value={calibrationInd.threshold}
                  onChange={(e) => setCalibrationInd({ ...calibrationInd, threshold: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <span className="text-[8px] text-slate-400 block leading-normal">
                  Cuando la vulnerabilidad calculada supere este valor, se emitirá automáticamente el evento predictivo hacia el bus de automatizaciones MIO.
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 🧭 MODAL 3: EXPLICADORES ANALÍTICOS (Pearson variables de entrada) */}
      <Modal
        isOpen={!!explainerId}
        onClose={() => setExplainerId(null)}
        title="Guía Metodológica del Indicador"
        subtitle="Analítica Territorial"
        footer={
          <button
            onClick={() => setExplainerId(null)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer border-none"
          >
            Cerrar Guía
          </button>
        }
      >
        {explainerId === 'pearson' ? (
          <div className="space-y-4 text-xs font-semibold text-slate-655">
            <div>
              <span className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Método Estadístico</span>
              <h4 className="text-sm font-black text-indigo-755 uppercase tracking-wide mt-0.5">Coeficiente de Correlación R de Pearson</h4>
            </div>

            <div className="space-y-3.5 border-t border-slate-100 pt-4">
              <p>
                <strong className="text-slate-800 block">¿Qué significa?</strong>
                Es una medida estadística que cuantifica la fuerza y la dirección de la relación lineal entre dos variables del territorio. Su valor oscila entre -1.0 y 1.0.
              </p>
              <p>
                <strong className="text-slate-800 block">¿Cómo debe interpretarse?</strong>
                * **R = 1.0**: Relación lineal positiva perfecta.
                * **R = -1.0**: Relación lineal negativa perfecta (inversa).
                * **R = 0**: Sin correlación lineal.
              </p>
              <p className="bg-indigo-50/20 border border-indigo-150 p-3.5 rounded-xl text-indigo-900">
                <strong className="text-indigo-955 block mb-0.5">¿Qué decisiones permite tomar?</strong>
                Si el coeficiente es muy negativo o positivo, demuestra científicamente que intervenir una variable (ej. Madurez Digital) impactará significativamente la otra (ej. Deserción).
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs font-semibold text-slate-655">
            <div>
              <span className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Variable Territorial</span>
              <h4 className="text-sm font-black text-indigo-755 uppercase tracking-wide mt-0.5">{explainerId === 'madurez' ? 'Madurez Digital (% Health Score)' : explainerId === 'conectividad' ? 'Conectividad Sede Principal (% Banda Ancha)' : 'Tasa de Asistencia Media (%)'}</h4>
            </div>

            <div className="space-y-3.5 border-t border-slate-100 pt-4">
              <p>
                <strong className="text-slate-800 block">¿Qué significa?</strong>
                {explainerId === 'madurez' 
                  ? 'Representa el nivel de penetración de las plataformas de AulaCore en el colegio.' 
                  : explainerId === 'conectividad' ? 'Porcentaje de aulas que cuentan con acceso regular a banda ancha superior a 50Mbps.' : 'Asistencia promedio reportada por los lectores de tarjetas RFID escolares.'
                }
              </p>
              <p>
                <strong className="text-slate-800 block">Fórmula de cálculo:</strong>
                {explainerId === 'madurez' 
                  ? 'HealthScore = (AsistenciaCargada * 0.4) + (NotasSubidas * 0.4) + (UsoAulaHelp * 0.2)' 
                  : explainerId === 'conectividad' ? 'TasaBandaAncha = (AulasConectadas / TotalAulas) * 100' : 'TasaAsistencia = (Marcaciones / Matrícula) * 100'
                }
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
