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
const COURSES_GPAS_DATA: any[] = [];

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
  };

  const followUpCourses: any[] = [];

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
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">--</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Sin consolidado por cursos</p>
          </div>
        </div>

        {/* KPI 2: Cursos en Alerta */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cursos Críticos</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-955 tracking-tight">0</span>
              <span className="text-xs font-semibold text-slate-400">grupos académicos</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Sin cursos en nivel crítico</p>
          </div>
        </div>

        {/* KPI 3: Asistencia por Curso */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asistencia Consolidada</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">--</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Sin datos de asistencia por grupo</p>
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
              Sin consolidado por cursos. Los indicadores comparativos de rendimiento grupal, ausentismo y dispersión académica se calcularán al registrar notas por periodos.
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
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Registro analítico de planes preventivos y soportes pedagógicos grupales.
                    </p>
                  </div>

                  <div className="py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <BookOpen className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Sin fichas de intervención activas</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      No se registran grupos con planes remediales o actas de intervención pedagógica activas.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Bitácora integral de comportamiento, GPA y métricas por salón.
                    </p>
                  </div>

                  <div className="py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Sin cursos registrados en el periodo</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      Los datos comparativos de salones se presentarán cuando se registren calificaciones y asistencias.
                    </p>
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
                      "¡Ficha Consultada!",
                      "No existen fichas de intervención grupal activas en este periodo.",
                      () => {
                        const txtContent = `==================================================
AULACORE - FICHA DE SOPORTE E INTERVENCION GRUPAL
==================================================
Fecha: ${new Date().toISOString().split('T')[0]}
Estado: Sin planes de intervencion activos en el periodo.
==================================================
`;
                        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "ficha_intervencion_grupal.txt");
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    );
                  } else {
                    handleExecuteAction(
                      "¡Listado de Cursos Exportado!",
                      "Se descargó exitosamente el resumen de salones en formato CSV.",
                      () => {
                        const csvContent = "\uFEFF" + [
                          ["Curso", "Director", "Promedio Academico", "Asistencia Promedio", "Nivel de Alerta"]
                        ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "resumen_salones.csv");
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
                  ? (isProcessing ? 'Consultando...' : 'Consultar Ficha') : (isProcessing ? 'Descargando...' : 'Descargar Listado')}
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
