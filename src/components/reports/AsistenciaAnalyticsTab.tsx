'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Radio,
  Bell,
  Cpu,
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

// Mock data tailored for the RFID Attendance Analytics tab
const ATTENDANCE_LEVELS_DATA: any[] = [];

export function AsistenciaAnalyticsTab() {
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

  const systemAntennas: any[] = [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ========================================== */}
      {/* 🏛️ SECCIÓN 1: KPIs MÍNIMOS (MÁXIMO 3)       */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1: Asistencia General */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-violet-650">
              <UserCheck className="w-5 h-5 text-violet-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asistencia Diaria</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">--</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Sin registros de asistencia</p>
          </div>
        </div>

        {/* KPI 2: Lecturas RFID Procesadas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-655">
              <Radio className="w-5 h-5 text-slate-450" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lecturas Exitosas</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-950 tracking-tight">0</span>
              <span className="text-xs font-semibold text-slate-400">lecturas</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Sin telemetría RFID activa</p>
          </div>
        </div>

        {/* KPI 3: Alertas Despachadas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-amber-600">
              <Bell className="w-5 h-5 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notificaciones SMS/WA</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">0</span>
              <span className="text-xs font-semibold text-slate-400">alertas de ausencia</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Sin alertas de inasistencia despachadas</p>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 📊 SECCIÓN 2: GRÁFICO & ESTADO OPERATIVO   */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Gráfico Principal */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Asistencia por Nivel Escolar</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Porcentaje de asistencia diaria consolidada por niveles</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-1.5 bg-violet-500 rounded-sm"></div>
                  <span className="text-slate-500">Asistencia %</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-0.5 border-t border-dashed border-violet-400/80"></div>
                  <span className="text-slate-500">Meta Mínima (92%)</span>
                </div>
              </div>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ATTENDANCE_LEVELS_DATA}
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
                    domain={[85, 100]} 
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
                    formatter={(value: any) => [`${value}%`, 'Porcentaje Asistencia']}
                    labelStyle={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}
                  />
                  <ReferenceLine 
                    y={92.0} 
                    stroke="#8b5cf6" 
                    strokeDasharray="6 6" 
                    strokeWidth={1}
                    strokeOpacity={0.45}
                  />
                  <Bar 
                    dataKey="rate" 
                    radius={[8, 8, 0, 0]}
                    fill="#8b5cf6"
                  >
                    {ATTENDANCE_LEVELS_DATA.map((entry, index) => (
                      <Bar key={`cell-${index}`} dataKey="rate" fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Panel Operativo Minimal de Antenas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Estado del Sistema RFID</h3>
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-6">Estado operacional en tiempo real de receptores de telemetría escolar.</p>

            {systemAntennas.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Cpu className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">Sin antenas o dispositivos vinculados</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Configure receptores RFID en el módulo de infraestructura.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {systemAntennas.map((antenna, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-all duration-300">
                    <div className="relative flex h-2.5 w-2.5 mt-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{antenna.name}</span>
                        <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded-md">
                          {antenna.status}
                        </span>
                      </div>
                      <p className="text-[10px] font-semibold text-slate-400">{antenna.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 🧠 SECCIÓN 3: INSIGHT EJECUTIVO (MÁXIMO 1) */}
      {/* ========================================== */}
      <div className="bg-gradient-to-br from-violet-500/[0.03] to-slate-500/[0.01] border border-violet-500/10 rounded-2xl p-6 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-violet-600" />
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-black text-slate-850 uppercase tracking-widest flex items-center gap-2">
                Insight Clave de Flujo Asistencia AI
              </h4>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Diagnóstico ejecutivo para la toma de decisiones Rectoral</p>
            </div>
            
            <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-4xl">
              Sin telemetría RFID activa. Los análisis de puntualidad y flujo de asistencia se generarán automáticamente conforme se registren accesos en porterías.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button 
                onClick={() => setActiveModal('horas')}
                className="px-4 py-2 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" /> Analizar Horas Pico
              </button>
              <button 
                onClick={() => setActiveModal('alertas')}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-1"
              >
                Ver Historial de Alertas WA <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🔮 MODALES DE ALTA FIDELIDAD DE ASISTENCIA */}
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
                <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                    {activeModal === 'horas' ? 'Análisis de Horas Pico RFID' : 'Historial de Notificaciones de Inasistencia'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {activeModal === 'horas' 
                      ? 'Telemetría de ingreso en porterías institucionales y flujo peatonal.' 
                      : 'Bitácora automatizada de alertas enviadas a acudientes por inasistencia o retraso.'}
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
              {activeModal === 'horas' ? (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Telemetría de ingreso en porterías institucionales y flujo peatonal por intervalos de tiempo.
                    </p>
                  </div>

                  <div className="py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <Clock className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Sin lecturas de ingreso registradas</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      Los intervalos de tráfico y horas pico se calcularán automáticamente cuando los dispositivos RFID transmitan lecturas en portería.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Bitácora automatizada de alertas enviadas a acudientes por inasistencia o retraso escolar.
                    </p>
                  </div>

                  <div className="py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <Bell className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Sin notificaciones despachadas</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      No se registran alertas de inasistencia emitidas en la jornada actual.
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
                  if (activeModal === 'horas') {
                    handleExecuteAction(
                      "¡Log Descargado!",
                      "El registro de telemetría de porterías se ha descargado correctamente.",
                      () => {
                        const txtContent = `==================================================
LOG DE TELEMETRIA RFID EN PUERTAS - AULACORE
==================================================
Fecha: ${new Date().toISOString().split('T')[0]}
Estado: Sin registros de telemetría disponibles en el periodo consultado.
==================================================
`;
                        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "registro_telemetria_rfid.txt");
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    );
                  } else {
                    handleExecuteAction(
                      "¡Auditoría Descargada!",
                      "Reporte de notificaciones emitidas descargado correctamente.",
                      () => {
                        const csvContent = "\uFEFF" + [
                          ["Fecha", "Estudiante", "Grado", "Tipo Notificacion", "Canal", "Estado"]
                        ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "auditoria_notificaciones_rfid.csv");
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    );
                  }
                }}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-80"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {activeModal === 'horas' 
                  ? (isProcessing ? 'Descargando...' : 'Descargar Log') : (isProcessing ? 'Descargando...' : 'Descargar Auditoría')}
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
