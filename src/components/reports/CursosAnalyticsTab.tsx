'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Award,
  AlertTriangle,
  User,
  Users,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { cn } from '@/lib/utils';

// Mock data tailored for the Courses Performance Analytics tab
const COURSES_GPAS_DATA = [
  { name: '5-A (Destacado)', gpa: 4.4, color: '#f472b6' },   // pink-400
  { name: '11-A (Destacado)', gpa: 4.3, color: '#ec4899' },  // pink-500
  { name: '7-A (Alerta)', gpa: 3.2, color: '#db2777' },      // pink-600
  { name: '9-B (Crítico)', gpa: 2.8, color: '#be185d' }      // pink-700
];

interface CursosAnalyticsTabProps {
  initialModal?: string | null;
  onClearInitialModal?: () => void;
}

export function CursosAnalyticsTab({ initialModal, onClearInitialModal }: CursosAnalyticsTabProps = {}) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    if (initialModal) {
      setActiveModal(initialModal);
      onClearInitialModal?.();
    }
  }, [initialModal, onClearInitialModal]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const handleExecuteAction = (successTitle: string, successMessage: string, onDownload?: () => void) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (onDownload) {
        try {
          onDownload();
        } catch (e) {
          console.error(e);
        }
      }
      setActiveModal(null);
      setToast({ title: successTitle, message: successMessage });
      setTimeout(() => {
        setToast(null);
      }, 3000);
    }, 1000);
  };

  const followUpCourses = [
    {
      grade: '9-B',
      gpa: 2.8,
      attendance: '88%',
      director: 'Sandra Patricia',
      status: 'critico',
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-100',
      dotColor: 'bg-rose-500'
    },
    {
      grade: '7-A',
      gpa: 3.2,
      attendance: '91%',
      director: 'Carlos Mendoza',
      status: 'alerta',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-100',
      dotColor: 'bg-amber-500'
    },
    {
      grade: '10-C',
      gpa: 3.4,
      attendance: '93%',
      director: 'Liliana Gómez',
      status: 'estable',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-100',
      dotColor: 'bg-emerald-500'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ========================================== */}
      {/* 🏛️ SECCIÓN 1: KPIs MÍNIMOS (MÁXIMO 3)       */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1: Mejor Promedio */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-pink-600">
              <Award className="w-5 h-5 text-pink-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mejor Desempeño</span>
            </div>
            <span className="text-[10px] font-extrabold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
              Grado 11-A / 5-A
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">4.4</span>
              <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Promedio Acumulado Sobresaliente</p>
          </div>
        </div>

        {/* KPI 2: Cursos en Alerta */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cursos Críticos</span>
            </div>
            <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
              Plan Remedial
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-955 tracking-tight">2</span>
              <span className="text-xs font-semibold text-slate-400">grupos académicos</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Bajo el umbral institucional (3.3)</p>
          </div>
        </div>

        {/* KPI 3: Asistencia por Curso */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asistencia Consolidada</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +0.5%
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">94.5%</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Promedio general de asistencia</p>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 📊 SECCIÓN 2: GRÁFICO & LISTA COMPACTA     */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Gráfico Principal */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Rendimiento: Destacados vs Críticos</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Comparativa de promedios generales (GPA) extremos del periodo escolar</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-1.5 bg-pink-500 rounded-sm"></div>
                  <span className="text-slate-500">GPA Promedio</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-0.5 border-t border-dashed border-pink-400/80"></div>
                  <span className="text-slate-500">Umbral Aprobación (3.3)</span>
                </div>
              </div>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={COURSES_GPAS_DATA}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  barSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 5.0]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', radius: 8 }}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)', 
                      fontWeight: 'bold',
                      padding: '12px 16px',
                      backgroundColor: '#ffffff'
                    }}
                    itemStyle={{ color: '#1e293b' }}
                    formatter={(value: any) => [`${value} / 5.0`, 'Promedio General']}
                    labelStyle={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}
                  />
                  <ReferenceLine 
                    y={3.3} 
                    stroke="#ec4899" 
                    strokeDasharray="6 6" 
                    strokeWidth={1}
                    strokeOpacity={0.45}
                  />
                  <Bar 
                    dataKey="gpa" 
                    radius={[8, 8, 0, 0]}
                    fill="#ec4899"
                  >
                    {COURSES_GPAS_DATA.map((entry, index) => (
                      <Bar key={`cell-${index}`} dataKey="gpa" fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Panel de Cursos en Seguimiento */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-pink-500" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Cursos en Seguimiento</h3>
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-6">Grupos con rezago acumulado que reciben soporte pedagógico prioritario.</p>

            <div className="space-y-4">
              {followUpCourses.map((course, i) => (
                <div key={i} className="flex items-start gap-3.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-all duration-300">
                  <div className="relative flex h-2.5 w-2.5 mt-1.5">
                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", course.status === 'critico' ? 'bg-rose-450' : 'bg-amber-400')}></span>
                    <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", course.status === 'critico' ? 'bg-rose-500' : course.status === 'alerta' ? 'bg-amber-500' : 'bg-emerald-500')}></span>
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-800">Grado {course.grade}</span>
                      <span className={cn("text-[9px] font-black uppercase border px-1.5 py-0.2 rounded-md", course.badgeColor)}>
                        {course.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                      <span>GPA: <strong className="text-slate-600 font-bold">{course.gpa}</strong></span>
                      <span>Asist: <strong className="text-slate-600 font-bold">{course.attendance}</strong></span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1 pt-0.5 border-t border-slate-200/55">
                      <User className="w-3 h-3 text-slate-400" /> Dir: {course.director}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 🧠 SECCIÓN 3: INSIGHT EJECUTIVO (MÁXIMO 1) */}
      {/* ========================================== */}
      <div className="bg-gradient-to-br from-pink-500/[0.03] to-slate-500/[0.01] border border-pink-500/10 rounded-2xl p-6 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-pink-600" />
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-black text-slate-850 uppercase tracking-widest flex items-center gap-2">
                Insight Clave de Comportamiento Grupal AI
              </h4>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Diagnóstico ejecutivo para la toma de decisiones Rectoral</p>
            </div>
            
            <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-4xl">
              El análisis institucional revela que <strong className="text-pink-900 font-bold">11-A</strong> y <strong className="text-slate-800 font-bold">5-A</strong> lideran el desempeño académico y convivencial con promedios sobresalientes superiores a <strong className="text-pink-700 font-semibold">4.3</strong>. En contraposición, <strong className="text-rose-700 font-semibold">9-B</strong> mantiene el promedio más bajo del periodo (<strong className="text-rose-900 font-bold">2.8</strong>) debido a un ausentismo del 12% asociado a vacíos conceptuales en Matemáticas. La desviación general de notas de la institución se sitúa en un estable <strong className="text-emerald-600 font-semibold">0.35</strong>, confirmando homogeneidad en los demás niveles.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
                <button 
                  onClick={() => setActiveModal('fichas')}
                  className="px-4 py-2 text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Ver Fichas de Intervención
                </button>
                <button 
                  onClick={() => setActiveModal('historial')}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-1"
                >
                  Ver Historial de Salones <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🔮 MODALES DE ALTA FIDELIDAD DE CURSOS     */}
      {/* ========================================== */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-pink-650" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                    {activeModal === 'fichas' ? 'Fichas de Intervención Grupal' : 'Historial de Salones y Desempeño Consolidado'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {activeModal === 'fichas' 
                      ? 'Registro analítico de planes preventivos y soportes pedagógicos grupales.' 
                      : 'Bitácora integral de comportamiento, GPA y métricas por salón.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {activeModal === 'fichas' ? (
                <div className="space-y-6">
                  <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-xl">
                    <p className="text-xs text-pink-950 font-medium leading-relaxed">
                      El grupo <strong>9-B</strong> registra el menor desempeño general con un GPA de <strong>2.8</strong>. Se ha activado la <strong>Ficha de Intervención Pedagógica Grupal #2026-F9</strong> coordinada por Orientación y Dirección de Grupo.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Plan de Soporte Activo - Grado 9-B</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                        <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md mt-0.5">Académico</span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">Tutorías dirigidas y división en subgrupos</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Foco: Competencias aritméticas básicas con el Prof. Carlos M.</p>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3 border-t border-slate-100">
                        <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md mt-0.5">Convivencia</span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">Talleres de integración escolar y cohesión</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Foco: Clima de aula positivo y mediación grupal liderada por Orientación.</p>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3 border-t border-slate-100">
                        <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md mt-0.5">Familiar</span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">Reunión extraordinaria con padres de familia</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Foco: Firmar compromisos de corresponsabilidad en el proceso remedial escolar.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-pink-50/20 border border-pink-100 rounded-xl">
                    <p className="text-[10px] text-pink-850 font-bold">
                      📈 Tendencia: Las últimas tres mini-evaluaciones muestran una mejora progresiva del 10% en el promedio grupal de matemáticas.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-650 font-medium leading-relaxed">
                      Resumen analítico comparativo de todos los grupos y salones monitoreados en la plataforma AulaCore:
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Historial de Salones (Periodo 4)</h4>
                    <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 grid grid-cols-5 font-black uppercase text-slate-500 text-[9px] tracking-wider">
                        <span>Grado</span>
                        <span>Director</span>
                        <span className="text-center">GPA</span>
                        <span className="text-center">Asistencia</span>
                        <span className="text-right">Riesgo</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        <div className="px-4 py-3 grid grid-cols-5 font-semibold text-slate-600 items-center">
                          <span className="text-slate-850 font-bold">5-A</span>
                          <span className="truncate">Sandra P.</span>
                          <span className="text-center text-pink-650 font-black">4.4 / 5.0</span>
                          <span className="text-center text-emerald-650 font-bold">98%</span>
                          <span className="text-right text-emerald-650 font-bold">Nulo</span>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-5 font-semibold text-slate-600 items-center">
                          <span className="text-slate-850 font-bold">7-A</span>
                          <span className="truncate">Carlos M.</span>
                          <span className="text-center text-amber-600 font-black">3.2 / 5.0</span>
                          <span className="text-center text-slate-700 font-bold">91%</span>
                          <span className="text-right text-amber-600 font-bold">Medio</span>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-5 font-semibold text-slate-600 items-center">
                          <span className="text-slate-850 font-bold">9-B</span>
                          <span className="truncate">Sandra P.</span>
                          <span className="text-center text-rose-600 font-black">2.8 / 5.0</span>
                          <span className="text-center text-rose-600 font-bold">88%</span>
                          <span className="text-right text-rose-650 font-black">Alto</span>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-5 font-semibold text-slate-600 items-center">
                          <span className="text-slate-850 font-bold">11-A</span>
                          <span className="truncate">Liliana G.</span>
                          <span className="text-center text-pink-650 font-black">4.3 / 5.0</span>
                          <span className="text-center text-emerald-650 font-bold">96%</span>
                          <span className="text-right text-emerald-650 font-bold">Nulo</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Total Grupos Auditados</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Monitoreo de 14 salones de la institución escolar.</p>
                    </div>
                    <span className="text-[10px] font-black text-pink-700 bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-lg">
                      100% Conectados
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button 
                onClick={() => setActiveModal(null)}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
              >
                Cerrar Ventana
              </button>
              <button 
                onClick={() => {
                  if (activeModal === 'fichas') {
                    handleExecuteAction(
                      "¡Ficha enviada a Impresión!",
                      "La ficha de soporte e intervención para el grado 9-B se está imprimiendo correctamente.",
                      () => {
                        const txtContent = `==================================================
AULACORE - FICHA DE SOPORTE E INTERVENCION INDIVIDUAL
==================================================
Identificacion del Curso: Grado 9-B
Director de Grupo: Sandra P.
Nivel Academico: Bachillerato
Estado de Alerta: Alto Riesgo Institucional
Fecha de Generacion: 2026-05-28

METRICAS DEL CURSO:
- Promedio Academico General: 2.8 / 5.0
- Asistencia Promedio: 88%
- Estudiantes en Alerta Critica: 3

ESTRATEGIAS DE INTERVENCION PROPUESTAS:
1. Tutoria y nivelacion obligatoria en Matematicas y Lenguaje.
2. Citacion a padres de familia para los 3 casos de inasistencia recurrente.
3. Acompanamiento psicopedagogico semanal con orientacion escolar.
4. Adaptacion curricular y flexibilizacion de entregas de actividades.
`;
                        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "ficha_intervencion_soporte_9B.txt");
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    );
                  } else {
                    handleExecuteAction(
                      "¡Listado de Cursos Exportado!",
                      "Se descargó exitosamente el resumen académico integral del Periodo 4 en formato CSV.",
                      () => {
                        const csvContent = "\uFEFF" + [
                          ["Curso", "Director", "Promedio Academico", "Asistencia Promedio", "Nivel de Alerta"],
                          ["7-A", "Carlos M.", "3.2 / 5.0", "91%", "Medio"],
                          ["9-B", "Sandra P.", "2.8 / 5.0", "88%", "Alto"],
                          ["11-A", "Liliana G.", "4.3 / 5.0", "96%", "Nulo"]
                        ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "resumen_salones_periodo4.csv");
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    );
                  }
                }}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-80"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {activeModal === 'fichas' 
                  ? (isProcessing ? 'Imprimiendo ficha...' : 'Imprimir Ficha') 
                  : (isProcessing ? 'Exportando listado...' : 'Exportar Listado')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glassmorphic Success Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-2xl p-4 max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-800 tracking-tight">{toast.title}</h4>
            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}

    </div>
  );
}
