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
const DEPARTMENT_COMPLIANCE_DATA: any[] = [];

export function DocentesAnalyticsTab() {
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
        
        {/* KPI 1: Cumplimiento de Planeación */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-orange-600">
              <ClipboardList className="w-5 h-5 text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cumplimiento Planeación</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">--</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Sin programadores curriculares cargados</p>
          </div>
        </div>

        {/* KPI 2: Cobertura de Clases */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-655">
              <Users className="w-5 h-5 text-slate-450" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asistencia Docente</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-950 tracking-tight">--</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Sin registros de asistencia docente</p>
          </div>
        </div>

        {/* KPI 3: Carga Horaria Promedio */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Carga Operativa Promedio</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">--</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Sin asignación académica parametrizada</p>
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
            
            <p className="text-sm text-slate-650 font-normal leading-relaxed max-w-4xl">
              Sin programadores curriculares cargados. El seguimiento de avance temático, coberturas de clase y planeaciones se habilitará al registrar la asignación académica docente.
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
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Monitoreo de programadores docentes y seguimiento del syllabus por área curricular.
                    </p>
                  </div>

                  <div className="py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <Calendar className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Sin planeaciones curriculares rezagadas</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      No se registran alertas de programadores o syllabus pendientes en el cuerpo docente.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Auditoría de asistencia docente y continuidad pedagógica de las clases programadas.
                    </p>
                  </div>

                  <div className="py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Sin novedades de cobertura pedagógica</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      Las métricas de continuidad y asignación de guardias se calcularán conforme se registren las sesiones de clase.
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
                      "¡Notificación Verificada!",
                      "No existen docentes con rezago de syllabus para notificar.",
                      () => {
                        const txtContent = `==================================================
CONFIRMACION DE NOTIFICACION DE SYLLABUS - AULACORE
==================================================
Fecha: ${new Date().toISOString().split('T')[0]}
Estado: Sin novedades de rezago registradas.
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
                      "La bitácora consolidada de guardias y reemplazos se descargó correctamente.",
                      () => {
                        const csvContent = "\uFEFF" + [
                          ["Docente Reemplazado", "Asignatura", "Docente de Reemplazo", "Fecha", "Modulo/Bloque", "Estado"]
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
                  ? (isProcessing ? 'Verificando...' : 'Verificar Estado') : (isProcessing ? 'Descargando...' : 'Descargar Bitácora')}
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
