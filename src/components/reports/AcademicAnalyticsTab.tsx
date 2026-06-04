import React, { useState } from 'react';
import {
  GraduationCap,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle,
  AlertTriangle,
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

// Mock data tailored for the Academic Analytics tab
const ACADEMIC_LEVELS_DATA = [
  { name: 'Preescolar', gpa: 4.5, approvedRate: 98.5, studentsCount: 240, color: '#818cf8' },
  { name: 'Primaria', gpa: 4.1, approvedRate: 94.2, studentsCount: 580, color: '#6366f1' },
  { name: 'Bachillerato', gpa: 3.6, approvedRate: 88.6, studentsCount: 420, color: '#4f46e5' },
  { name: 'Media Técnica', gpa: 4.2, approvedRate: 96.0, studentsCount: 160, color: '#4338ca' }
];

export function AcademicAnalyticsTab() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ========================================== */}
      {/* 🏛️ SECCIÓN 1: KPIs MÍNIMOS (MÁXIMO 3)       */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1: Promedio Institucional */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Promedio General</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +0.1 vs P3
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">3.9</span>
              <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Nivel Satisfactorio Alto</p>
          </div>
        </div>

        {/* KPI 2: Tasa de Aprobación */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tasa de Aprobación</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              +0.8% vs P3
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-emerald-600 tracking-tight">92.4%</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Basado en promedio &gt;= 3.3</p>
          </div>
        </div>

        {/* KPI 3: Estudiantes en Riesgo */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">En Riesgo Académico</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              -3 casos
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">12</span>
              <span className="text-xs font-semibold text-slate-400">/ 1,400 alumnos</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Bajo plan remedial de tutorías</p>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 📊 SECCIÓN 2: GRÁFICO PRINCIPAL            */}
      {/* ========================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Rendimiento por Nivel Escolar</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Comparación de Promedios Generales (GPA) contra la meta institucional</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-1.5 bg-indigo-500 rounded-sm"></div>
              <span className="text-slate-500">GPA Promedio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-0.5 border-t border-dashed border-rose-400"></div>
              <span className="text-slate-500">Umbral Aprobación (3.3)</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ACADEMIC_LEVELS_DATA}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
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
                formatter={(value: any) => [`${value} / 5.0`, 'Promedio General (GPA)']}
                labelStyle={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}
              />
              <ReferenceLine 
                y={3.3} 
                stroke="#f43f5e" 
                strokeDasharray="6 6" 
                strokeWidth={1}
                strokeOpacity={0.45}
              />
              <Bar 
                dataKey="gpa" 
                radius={[8, 8, 0, 0]}
                fill="#6366f1"
              >
                {ACADEMIC_LEVELS_DATA.map((entry, index) => (
                  <Bar key={`cell-${index}`} dataKey="gpa" fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🧠 SECCIÓN 3: INSIGHT EJECUTIVO (MÁXIMO 1) */}
      {/* ========================================== */}
      <div className="bg-gradient-to-br from-indigo-500/[0.03] to-slate-500/[0.01] border border-indigo-500/10 rounded-2xl p-6 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-black text-slate-850 uppercase tracking-widest flex items-center gap-2">
                Insight Clave de Inteligencia Académica AI
              </h4>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Diagnóstico ejecutivo para la toma de decisiones Rectoral</p>
            </div>
            
            <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-4xl">
              El rendimiento académico global se ha consolidado en <strong className="text-indigo-900 font-bold">3.9/5.0</strong> para el cierre de periodo. El nivel de <strong className="text-slate-800 font-bold">Bachillerato</strong> registra la mayor brecha de rendimiento en el área de Matemáticas, con <strong className="text-rose-600 font-semibold">9-B</strong> como curso de atención crítica debido a un promedio de 2.8. No obstante, las tutorías de nivelación activa ya muestran un <strong className="text-emerald-600 font-semibold">65% de efectividad</strong> en la recuperación progresiva de los estudiantes de décimo grado.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button 
                onClick={() => setActiveModal('mallas')}
                className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" /> Ver Mallas Críticas
              </button>
              <button 
                onClick={() => setActiveModal('planes')}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-1"
              >
                Ver Planes de Nivelación <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🔮 MODALES DE ALTA FIDELIDAD DE INTELECTO  */}
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
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                    {activeModal === 'mallas' ? 'Mallas Curriculares Críticas' : 'Planes de Nivelación Activos'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {activeModal === 'mallas' 
                      ? 'Monitoreo de brechas temáticas y adecuación curricular prioritaria.' 
                      : 'Estrategias de recuperación personalizada y acompañamiento pedagógico.'}
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
              {activeModal === 'mallas' ? (
                <div className="space-y-6">
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                    <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                      El sistema de Inteligencia Artificial AulaCore ha detectado una brecha acumulada de rendimiento del <strong>18%</strong> en el área de <strong>Matemáticas</strong> para el nivel de Bachillerato. El núcleo crítico se concentra en la asimilación de competencias sobre <strong>ecuaciones de segundo grado y sistemas algebraicos</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Temática Crítica</span>
                      <p className="text-sm font-bold text-slate-800 mt-1">Ecuaciones Cuadráticas & Álgebra</p>
                      <p className="text-xs text-slate-400 mt-0.5">Nivel sugerido de retroalimentación: Inmediato</p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cursos de Atención</span>
                      <p className="text-sm font-bold text-rose-650 mt-1">Grados 9-B y 8-A</p>
                      <p className="text-xs text-slate-400 mt-0.5">Grupos con GPA por debajo de 3.0</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Plan de Acción Recomendado (Rectoría)</h4>
                    <div className="space-y-2.5">
                      <div className="flex gap-3 items-start">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-650 shrink-0 mt-0.5">1</div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          <strong>Reestructuración Curricular:</strong> Extender por dos semanas el módulo temático en grado 9º, reajustando la agenda del Periodo 4.
                        </p>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-650 shrink-0 mt-0.5">2</div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          <strong>Soporte en AulaCore:</strong> Habilitar de forma obligatoria las guías de autoaprendizaje digital y simulaciones interactivas para todos los estudiantes rezagados.
                        </p>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-650 shrink-0 mt-0.5">3</div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          <strong>Evaluación Diagnóstica Extraordinaria:</strong> Programar una prueba corta de validación conceptual programada para la segunda semana de junio.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 animate-pulse"></div>
                    <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                      El plan de nivelación institucional presenta una efectividad promedio del <strong>65%</strong> en la recuperación de estudiantes en riesgo académico.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Monitoreo de Programas Académicos</h4>
                    <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 grid grid-cols-4 font-black uppercase text-slate-500 text-[9px] tracking-wider">
                        <span>Programa</span>
                        <span>Coordinador</span>
                        <span className="text-center">Progreso</span>
                        <span className="text-right">Efectividad</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        <div className="px-4 py-3 grid grid-cols-4 font-semibold text-slate-600 items-center">
                          <span className="text-slate-800 font-bold">Refuerzo Álgebra 9º</span>
                          <span>Lic. Sandra P.</span>
                          <span className="text-center text-indigo-650 font-bold">8 / 10 ses.</span>
                          <span className="text-right text-emerald-650 font-bold">68%</span>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-4 font-semibold text-slate-600 items-center">
                          <span className="text-slate-800 font-bold">Comprensión Lectora 7º</span>
                          <span>Lic. Carlos M.</span>
                          <span className="text-center text-emerald-650 font-bold">Completado</span>
                          <span className="text-right text-emerald-650 font-bold">72%</span>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-4 font-semibold text-slate-600 items-center">
                          <span className="text-slate-800 font-bold">Tecnología e Informática 10º</span>
                          <span>Lic. Liliana G.</span>
                          <span className="text-center text-amber-600 font-bold">3 / 10 ses.</span>
                          <span className="text-right text-indigo-600 font-bold">55%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Próximo Hito Institucional</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Carga de calificaciones de recuperación final</p>
                    </div>
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                      5 de Junio, 2026
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
                  if (activeModal === 'mallas') {
                    handleExecuteAction(
                      "¡Ajuste Curricular Aplicado!",
                      "Las mallas críticas de matemáticas se han reestructurado con éxito para el Periodo 4.",
                      () => {
                        const txtContent = `==================================================
COMPROBANTE DE REESTRUCTURACION CURRICULAR - AULACORE
==================================================
Fecha: 2026-05-28
Modulo Curricular: Matematicas (Bachillerato)
Nucleo del Ajuste: Grados 9-B y 8-A

DETALLE DE ACCIONES APLICADAS EN LA MALLA:
1. Reestructuracion del modulo curricular de algebra y ecuaciones de segundo grado por dos semanas adicionales.
2. Habilitacion obligatoria de guias de autoaprendizaje en la plataforma AulaCore.
3. Evaluacion conceptual diagnostica extraordinaria programada para mediados de junio.
==================================================
`;
                        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "comprobante_ajuste_curricular_matematicas.txt");
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    );
                  } else {
                    handleExecuteAction(
                      "¡Plan General Exportado!",
                      "El plan de nivelación institucional en formato PDF se ha descargado correctamente.",
                      () => {
                        const csvContent = "\uFEFF" + [
                          ["Programa", "Coordinador", "Progreso", "Efectividad"],
                          ["Refuerzo Algebra 9", "Lic. Sandra P.", "8 / 10 ses.", "68%"],
                          ["Comprension Lectora 7", "Lic. Carlos M.", "Completado", "72%"],
                          ["Tecnología e Informática 10", "Lic. Liliana G.", "3 / 10 ses.", "55%"]
                        ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "plan_nivelacion_academico_aulacore.csv");
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    );
                  }
                }}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-80"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {activeModal === 'mallas' 
                  ? (isProcessing ? 'Aplicando ajuste...' : 'Aplicar Ajuste Curricular') 
                  : (isProcessing ? 'Exportando plan...' : 'Exportar Plan General')}
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
