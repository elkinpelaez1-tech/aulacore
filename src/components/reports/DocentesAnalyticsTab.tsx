'use client';

import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ClipboardList,
  Calendar,
  Clock,
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

// Mock data tailored for the Teacher Analytics tab
const DEPARTMENT_COMPLIANCE_DATA = [
  { name: 'Matemáticas', rate: 96.2, color: '#fb923c' },   // orange-450
  { name: 'Ciencias', rate: 94.5, color: '#f97316' },      // orange-500
  { name: 'Lenguaje', rate: 98.0, color: '#ea580c' },      // orange-600
  { name: 'Sociales', rate: 90.5, color: '#c2410c' }       // orange-700
];

export function DocentesAnalyticsTab() {
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
        
        {/* KPI 1: Cumplimiento de Planeación */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-orange-600">
              <ClipboardList className="w-5 h-5 text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cumplimiento Planeación</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +2.1% vs P3
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">94.8%</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Avance Óptimo en Programadores</p>
          </div>
        </div>

        {/* KPI 2: Cobertura de Clases */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-655">
              <Users className="w-5 h-5 text-slate-450" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asistencia Docente</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              +0.2% vs P3
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-950 tracking-tight">99.2%</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Garantía de continuidad pedagógica</p>
          </div>
        </div>

        {/* KPI 3: Carga Horaria Promedio */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Carga Operativa Promedio</span>
            </div>
            <span className="text-[10px] font-extrabold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              Balanceado
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">38.5</span>
              <span className="text-xs font-semibold text-slate-400">horas / semana</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Distribución académica óptima</p>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 📊 SECCIÓN 2: GRÁFICO PRINCIPAL            */}
      {/* ========================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Cumplimiento de Planeación por Departamento</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Porcentaje de avance en el programador curricular institucional vs meta</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-1.5 bg-orange-500 rounded-sm"></div>
              <span className="text-slate-500">Avance %</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-0.5 border-t border-dashed border-orange-400/80"></div>
              <span className="text-slate-500">Estándar Requerido (90%)</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={DEPARTMENT_COMPLIANCE_DATA}
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
                formatter={(value: any) => [`${value}%`, 'Cumplimiento Planeación']}
                labelStyle={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}
              />
              <ReferenceLine 
                y={90.0} 
                stroke="#ea580c" 
                strokeDasharray="6 6" 
                strokeWidth={1}
                strokeOpacity={0.45}
              />
              <Bar 
                dataKey="rate" 
                radius={[8, 8, 0, 0]}
                fill="#ea580c"
              >
                {DEPARTMENT_COMPLIANCE_DATA.map((entry, index) => (
                  <Bar key={`cell-${index}`} dataKey="rate" fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🧠 SECCIÓN 3: INSIGHT EJECUTIVO (MÁXIMO 1) */}
      {/* ========================================== */}
      <div className="bg-gradient-to-br from-orange-500/[0.03] to-slate-500/[0.01] border border-orange-500/10 rounded-2xl p-6 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-orange-600" />
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-black text-slate-850 uppercase tracking-widest flex items-center gap-2">
                Insight Clave de Desempeño Operativo AI
              </h4>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Diagnóstico ejecutivo para la toma de decisiones Rectoral</p>
            </div>
            
            <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-4xl">
              El desempeño operativo docente registra un sobresaliente <strong className="text-orange-900 font-bold">94.8%</strong> en el cumplimiento global de planeaciones curriculares. El departamento de <strong className="text-slate-800 font-bold">Lenguaje</strong> lidera con un <strong className="text-orange-700 font-semibold">98.0%</strong> de avance, mientras que <strong className="text-orange-850 font-bold">Sociales</strong> presenta el menor índice relativo con un <strong className="text-orange-600 font-semibold">90.5%</strong> debido a la reciente reestructuración temática de competencias ciudadanas. Asimismo, la cobertura pedagógica de clases garantiza estabilidad absoluta al mantenerse en <strong className="text-emerald-600 font-semibold">99.2%</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button 
                onClick={() => setActiveModal('planeaciones')}
                className="px-4 py-2 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" /> Ver Planeaciones Pendientes
              </button>
              <button 
                onClick={() => setActiveModal('cobertura')}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-1"
              >
                Ver Métrica de Cobertura <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🔮 MODALES DE ALTA FIDELIDAD DE DOCENTES   */}
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
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                    {activeModal === 'planeaciones' ? 'Planeaciones Curriculares Pendientes' : 'Métrica de Cobertura Pedagógica'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {activeModal === 'planeaciones' 
                      ? 'Monitoreo de programadores docentes y retrasos en syllabus por área.' 
                      : 'Auditoría de asistencia docente y continuidad pedagógica escolar.'}
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
              {activeModal === 'planeaciones' ? (
                <div className="space-y-6">
                  <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl">
                    <p className="text-xs text-orange-950 font-medium leading-relaxed">
                      El avance curricular global se encuentra en un sobresaliente <strong>94.8%</strong>. No obstante, se han detectado <strong>3 docentes</strong> con planeaciones rezagadas en el área de <strong>Ciencias Sociales</strong>, acumulando un retraso promedio de 6 días lectivos.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Detalle de Planeaciones Retrasadas</h4>
                    <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 grid grid-cols-4 font-black uppercase text-slate-500 text-[9px] tracking-wider">
                        <span>Docente</span>
                        <span>Departamento</span>
                        <span>Módulo / Tema</span>
                        <span className="text-right">Demora</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        <div className="px-4 py-3 grid grid-cols-4 font-semibold text-slate-600 items-center">
                          <span className="text-slate-800 font-bold">Prof. Mateo S.</span>
                          <span>Sociales</span>
                          <span className="truncate">Cátedra de Paz (9º)</span>
                          <span className="text-right text-rose-650 font-bold">8 días</span>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-4 font-semibold text-slate-600 items-center">
                          <span className="text-slate-800 font-bold">Dra. Clara H.</span>
                          <span>Sociales</span>
                          <span className="truncate">Geografía Económica</span>
                          <span className="text-right text-rose-650 font-bold">5 días</span>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-4 font-semibold text-slate-600 items-center">
                          <span className="text-slate-800 font-bold">Prof. Jorge T.</span>
                          <span>Matemáticas</span>
                          <span className="truncate">Trigonometría (10º)</span>
                          <span className="text-right text-amber-600 font-bold">3 días</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <h5 className="text-xs font-bold text-slate-800 mb-1">Acción Directa Requerida</h5>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Se ha enviado una notificación automática a través del panel docente para solicitar la regularización del syllabus antes del viernes.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 animate-pulse"></div>
                    <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                      La tasa de cobertura pedagógica escolar se sitúa en un robusto <strong>99.2%</strong>. Esto garantiza la total continuidad y estabilidad de los periodos de clase de los estudiantes.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Clases Programadas</span>
                        <span className="text-2xl font-black text-slate-800 mt-1 block">420</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Esta semana</span>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Clases Cubiertas</span>
                        <span className="text-2xl font-black text-emerald-650 mt-1 block">417</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Efectivas</span>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Reemplazos Activos</span>
                        <span className="text-2xl font-black text-orange-650 mt-1 block">3</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Por incapacidades</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <h5 className="text-xs font-bold text-slate-800 mb-1">Mecanismo de Guardias</h5>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      El sistema AulaCore asigna automáticamente docentes libres de carga lectiva para cubrir ausencias menores justificadas, impidiendo horas libres sin supervisión y garantizando el cumplimiento temático.
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
                  if (activeModal === 'planeaciones') {
                    handleExecuteAction(
                      "¡Recordatorio Enviado!",
                      "Se notificó a los 3 docentes con syllabus rezagado a través de su panel AulaCore.",
                      () => {
                        const txtContent = `==================================================
CONFIRMACION DE NOTIFICACION DE SYLLABUS - AULACORE
==================================================
Fecha de Despacho: 2026-05-28
Modulo: Planeaciones de Clase y Syllabus
Accion: Alerta Informativa Manual de Rectoría

DOCENTES NOTIFICADOS Y ALERTADOS:
1. Lic. Carlos M. (Grado 9º - Matematicas)
2. Lic. Liliana G. (Grado 10º - Fisica)
3. Lic. Sandra P. (Grado 8º - Ciencias)

Mensaje Enviado: "Atencion docente: Recuerde que el plazo limite para la carga de planeaciones del Periodo 4 finaliza esta semana. Favor ingresar a su panel AulaCore."
==================================================
`;
                        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "notificacion_syllabus_docentes.txt");
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    );
                  } else {
                    handleExecuteAction(
                      "¡Bitácora Exportada!",
                      "La bitácora consolidada de guardias y reemplazos se descargó en Excel.",
                      () => {
                        const csvContent = "\uFEFF" + [
                          ["Docente Reemplazado", "Asignatura", "Docente de Reemplazo", "Fecha", "Modulo/Bloque", "Estado"],
                          ["Lic. Carlos M.", "Matematicas 9-B", "Lic. Sandra P.", "2026-05-28", "Bloque 2 (10:00 - 11:30)", "Completado"],
                          ["Lic. Liliana G.", "Fisica 10-A", "Lic. Juan K.", "2026-05-28", "Bloque 4 (14:00 - 15:30)", "Pendiente"],
                          ["Lic. Sandra P.", "Ciencias 8-B", "Lic. Carlos M.", "2026-05-28", "Bloque 1 (08:00 - 09:30)", "Completado"]
                        ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "bitacora_docentes_cobertura.csv");
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    );
                  }
                }}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-80"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {activeModal === 'planeaciones' 
                  ? (isProcessing ? 'Enviando...' : 'Enviar Recordatorio') 
                  : (isProcessing ? 'Exportando...' : 'Exportar Bitácora')}
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
