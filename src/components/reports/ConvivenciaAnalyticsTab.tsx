'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2
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

// Mock data tailored for the Convivencia Analytics tab
const CLIMATE_LEVELS_DATA = [
  { name: 'Preescolar', index: 100.0, color: '#2dd4bf' },   // teal-400
  { name: 'Primaria', index: 97.5, color: '#14b8a6' },     // teal-500
  { name: 'Bachillerato', index: 93.8, color: '#0d9488' },   // teal-600
  { name: 'Media Técnica', index: 98.2, color: '#0f766e' }   // teal-700
];

export function ConvivenciaAnalyticsTab() {
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
        
        {/* KPI 1: Índice de Clima Escolar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-teal-650">
              <ShieldCheck className="w-5 h-5 text-teal-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Clima Institucional</span>
            </div>
            <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +0.4% vs P3
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">96.8%</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Nivel Óptimo de Convivencia</p>
          </div>
        </div>

        {/* KPI 2: Casos Activos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-655">
              <AlertCircle className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reportes Activos</span>
            </div>
            <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
              -2 casos vs P3
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-950 tracking-tight">4</span>
              <span className="text-xs font-semibold text-slate-400">casos menores</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Volumen de atención bajo</p>
          </div>
        </div>

        {/* KPI 3: Tasa de Mediación */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tasa de Mediación</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              100% efectividad
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-teal-650 tracking-tight">100%</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Acuerdos escolares restaurativos</p>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 📊 SECCIÓN 2: GRÁFICO PRINCIPAL            */}
      {/* ========================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Clima de Convivencia por Nivel</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Porcentaje de clima de sana convivencia contra la meta del estándar de oro</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-1.5 bg-teal-500 rounded-sm"></div>
              <span className="text-slate-500">Índice Convivencia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-0.5 border-t border-dashed border-teal-400/80"></div>
              <span className="text-slate-500">Estándar Institucional (95%)</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={CLIMATE_LEVELS_DATA}
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
                domain={[80, 100]} 
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
                formatter={(value: any) => [`${value}%`, 'Índice de Convivencia']}
                labelStyle={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}
              />
              <ReferenceLine 
                y={95.0} 
                stroke="#14b8a6" 
                strokeDasharray="6 6" 
                strokeWidth={1}
                strokeOpacity={0.45}
              />
              <Bar 
                dataKey="index" 
                radius={[8, 8, 0, 0]}
                fill="#14b8a6"
              >
                {CLIMATE_LEVELS_DATA.map((entry, index) => (
                  <Bar key={`cell-${index}`} dataKey="index" fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🧠 SECCIÓN 3: INSIGHT EJECUTIVO (MÁXIMO 1) */}
      {/* ========================================== */}
      <div className="bg-gradient-to-br from-teal-500/[0.03] to-slate-500/[0.01] border border-teal-500/10 rounded-2xl p-6 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-teal-500" />
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-black text-slate-850 uppercase tracking-widest flex items-center gap-2">
                Insight Clave de Convivencia Escolar AI
              </h4>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Diagnóstico ejecutivo para la toma de decisiones Rectoral</p>
            </div>
            
            <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-4xl">
              El índice de clima escolar se mantiene en un óptimo <strong className="text-teal-900 font-bold">96.8%</strong>. El nivel de <strong className="text-slate-800 font-bold">Bachillerato</strong> registra un leve descenso debido a conflictos interpersonales en grado noveno, logrando mitigar al 100% el escalamiento mediante las mesas de diálogo oportuno. La tasa de resolución alternativa de conflictos consolida <strong className="text-emerald-700 font-semibold">100% de acuerdos firmados</strong> y en seguimiento activo.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button 
                onClick={() => setActiveModal('acuerdos')}
                className="px-4 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-all flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Registro de Acuerdos
              </button>
              <button 
                onClick={() => setActiveModal('ruta')}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-1"
              >
                Ver Ruta Integral (RAI) <ArrowRight className="w-3.5 h-3.5" />
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
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                    {activeModal === 'acuerdos' ? 'Registro de Acuerdos de Mediación' : 'Ruta de Atención Integral (RAI) Activa'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {activeModal === 'acuerdos' 
                      ? 'Compilación de actas conciliatorias y compromisos de convivencia firmados.' 
                      : 'Flujo preventivo e interconectado de protocolos de soporte socioemocional.'}
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
              {activeModal === 'acuerdos' ? (
                <div className="space-y-6">
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl">
                    <p className="text-xs text-teal-950 font-medium leading-relaxed">
                      El Comité de Mediación Escolar ha registrado un <strong>100% de efectividad</strong> en las mesas de conciliación dialogada durante este periodo, firmando acuerdos de convivencia estables sin escalar incidentes a sanciones severas.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Últimos Acuerdos Firmados (Grado 9º)</h4>
                    <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 grid grid-cols-4 font-black uppercase text-slate-500 text-[9px] tracking-wider">
                        <span>Caso ID</span>
                        <span>Grado</span>
                        <span>Compromiso Principal</span>
                        <span className="text-right">Estado</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        <div className="px-4 py-3 grid grid-cols-4 font-semibold text-slate-600 items-center">
                          <span className="text-slate-800 font-bold">#2026-042</span>
                          <span>9-B</span>
                          <span className="truncate">Restauración en grupo ...</span>
                          <span className="text-right"><span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Firmado</span></span>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-4 font-semibold text-slate-600 items-center">
                          <span className="text-slate-800 font-bold">#2026-039</span>
                          <span>9-A</span>
                          <span className="truncate">Mentoría de pares en r...</span>
                          <span className="text-right"><span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Activo</span></span>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-4 font-semibold text-slate-600 items-center">
                          <span className="text-slate-800 font-bold">#2026-035</span>
                          <span>8-B</span>
                          <span className="truncate">Servicio social en bibli...</span>
                          <span className="text-right"><span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Firmado</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs font-bold text-slate-800">Mecanismo de Seguimiento</p>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Cada acuerdo incluye tres sesiones de seguimiento con el psicólogo orientador de cada sección para asegurar el cumplimiento de las metas restaurativas individuales.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-teal-500 rounded-full shrink-0 animate-pulse"></div>
                    <p className="text-xs text-teal-950 font-medium leading-relaxed">
                      El protocolo de la Ruta de Atención Integral AulaCore está diseñado para una intervención coordinada y oportuna ante cualquier tipología de reporte.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Flujo de Atención Pedagógica (Categorías)</h4>
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md mt-0.5">Tipo I</span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">Conflictos interpersonales menores no sistemáticos</p>
                          <p className="text-[11px] text-slate-400 font-semibold">Protocolo: Mediación dialogada de manera inmediata y firma de compromisos mutuos.</p>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3 border-t border-slate-100">
                        <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md mt-0.5">Tipo II</span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">Agresiones repetitivas o acoso escolar sistemático</p>
                          <p className="text-[11px] text-slate-400 font-semibold">Protocolo: Convocatoria del Comité de Convivencia, medidas pedagógicas y plan remedial.</p>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3 border-t border-slate-100">
                        <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md mt-0.5">Tipo III</span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">Situaciones constitutivas de presuntos delitos contra la integridad</p>
                          <p className="text-[11px] text-slate-400 font-semibold">Protocolo: Activación de red de apoyo externa, reporte a rectoría y entidades legales.</p>
                        </div>
                      </div>
                    </div>
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
                  if (activeModal === 'acuerdos') {
                    handleExecuteAction(
                      "¡Actas Descargadas!",
                      "La compilación de actas conciliatorias se ha descargado correctamente en formato CSV.",
                      () => {
                        const csvContent = "\uFEFF" + [
                          ["Caso ID", "Grado", "Compromiso Principal", "Estado"],
                          ["#2026-042", "9-B", "Restauracion en grupo - circulo restaurativo", "Firmado"],
                          ["#2026-039", "9-A", "Mentoria de pares en resolucion de conflictos", "Activo"],
                          ["#2026-035", "8-B", "Servicio social en biblioteca escolar", "Firmado"]
                        ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "actas_mediacion_aulacore.csv");
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    );
                  } else {
                    handleExecuteAction(
                      "¡Ruta de Atención Abierta!",
                      "Se ha cargado e interactuado con el protocolo RAI completo con éxito.",
                      () => {
                        const txtContent = `==================================================
PROTOCOLO RAI (RUTA DE ATENCION INTEGRAL) - AULACORE
==================================================
Categoria del Incidente: Situacion Tipo II / Tipo III
Nivel de Atencion: Institucional Prioritario

PASOS DEL PROTOCOLO DE CONVIVENCIA CONSOLIDADOS:
1. Recepcion y registro digital del caso en AulaCore.
2. Citacion obligatoria a mediacion dialogada.
3. Establecimiento y firma de acuerdos restaurativos grupales/individuales.
4. Notificacion oficial automatica a padres y acudientes.
5. Seguimiento psicopedagogico institucional (3 sesiones minimas por orientador).
6. Cierre con firma de conformidad o remision a entidades externas de apoyo.
`;
                        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "protocolo_rai_convivencia_aulacore.txt");
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    );
                  }
                }}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-80"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {activeModal === 'acuerdos' 
                  ? (isProcessing ? 'Descargando actas...' : 'Descargar Actas') 
                  : (isProcessing ? 'Cargando ruta...' : 'Ver Ruta Completa')}
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
