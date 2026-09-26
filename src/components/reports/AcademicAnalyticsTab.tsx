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
const ACADEMIC_LEVELS_DATA: any[] = [];

export function AcademicAnalyticsTab() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
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
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 tracking-tight">--</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Sin promedio consolidado</p>
          </div>
        </div>

        {/* KPI 2: Tasa de Aprobación */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tasa de Aprobación</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 tracking-tight">--</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">En espera de calificaciones</p>
          </div>
        </div>

        {/* KPI 3: Estudiantes en Riesgo */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">En Riesgo Académico</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 tracking-tight">0</span>
              <span className="text-xs font-semibold text-slate-400">alumnos</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Sin estudiantes en riesgo registrados</p>
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
                Insight de Inteligencia Académica
              </h4>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Diagnóstico ejecutivo para la toma de decisiones Rectoral</p>
            </div>
            
            <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-4xl">
              Sin diagnósticos disponibles. Los análisis predictivos y recomendaciones de nivelación se generarán automáticamente cuando se consoliden las calificaciones de los periodos académicos.
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
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {activeModal === 'mallas' ? (
                <div className="text-center py-10 space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Sin mallas críticas detectadas</p>
                  <p className="text-xs text-slate-400">No se registran brechas temáticas críticas en la institución.</p>
                </div>
              ) : (
                <div className="text-center py-10 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Sin planes de nivelación activos</p>
                  <p className="text-xs text-slate-400">No hay programas de recuperación pedagógica registrados para el periodo.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cerrar Ventana
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
