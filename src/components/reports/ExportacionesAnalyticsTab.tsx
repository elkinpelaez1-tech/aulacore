'use client';

import React, { useState } from 'react';
import {
  DownloadCloud,
  FileText,
  Sheet,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { cn } from '@/lib/utils';

// Mock data tailored for the Export downloads distribution (lightweight donut chart)
const DOWNLOADS_USAGE_DATA: any[] = [];

export function ExportacionesAnalyticsTab() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState<number | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const handleExecuteModalAction = (successTitle: string, successMessage: string, onDownload?: () => void) => {
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

  const handleExecuteTemplateAction = (index: number, successTitle: string, successMessage: string, onDownload?: () => void) => {
    setLoadingTemplate(null);
    if (onDownload) {
      try {
        onDownload();
      } catch (e) {
        console.error(e);
      }
    }
    setToast({ title: successTitle, message: successMessage });
  };

  const exportTemplates: any[] = [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ========================================== */}
      {/* 🏛️ SECCIÓN 1: KPIs MÍNIMOS (MÁXIMO 3)       */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1: Plantillas Listas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <FileText className="w-5 h-5 text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Formatos Disponibles</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              24 Plantillas
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">24</span>
              <span className="text-sm font-semibold text-slate-400">reportes listos</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Cumplimiento MinEducación 100%</p>
          </div>
        </div>

        {/* KPI 2: Última Generación */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Última Exportación</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-950 tracking-tight">--</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">Sin exportaciones recientes</p>
          </div>
        </div>

        {/* KPI 3: Descargas del Mes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-600">
              <DownloadCloud className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Descargas Mensuales</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">0</span>
              <span className="text-xs font-semibold text-slate-400">archivos emitidos</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">0 descargas en el periodo</p>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 📊 SECCIÓN 2: MATRIZ NOTION & TORTA DONUT  */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Matriz de Exportación Notion-Style */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)]">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Matriz de Exportación Rápida</h3>
            <p className="text-xs font-semibold text-slate-500 mb-6">Genera y descarga informes institucionales estructurados en formatos universales con un solo clic.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exportTemplates.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:bg-slate-100/50 hover:shadow-sm transition-all duration-300">
                    <div className="space-y-3.5">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0", item.iconBg)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-black text-slate-800 tracking-tight">{item.title}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-200/50 px-1.5 py-0.2 rounded-md">
                            {item.format}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed min-h-[32px]">{item.desc}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/55">
                      <div className="text-[10px] font-semibold text-slate-400">
                        <span>Peso: {item.size}</span>
                        <span className="mx-1.5">•</span>
                        <span>{item.lastGenerated}</span>
                      </div>
                      <button 
                        onClick={() => {
                          if (i === 0) {
                            handleExecuteTemplateAction(
                              0, 
                              "¡Boletín Generado y Firmado!", 
                              "El consolidado de notas se ha descargado correctamente en formato CSV.",
                              () => {
                                const csvContent = "\uFEFF" + [
                                  ["Estudiante", "Curso", "Promedio Periodo", "Asistencia", "Estatus"]
                                ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.setAttribute("href", url);
                                link.setAttribute("download", "boletin_consolidado_institucional.csv");
                                link.style.visibility = 'hidden';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            );
                          } else if (i === 1) {
                            handleExecuteTemplateAction(
                              1, 
                              "¡Reporte RFID Emitido!", 
                              "Datos consolidados de inasistencia diaria exportados a CSV.",
                              () => {
                                const csvContent = "\uFEFF" + [
                                  ["Estudiante", "Grado", "Tarjeta RFID", "Ultimo Registro", "Estado Asistencia"]
                                ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.setAttribute("href", url);
                                link.setAttribute("download", "reporte_rfid_critico_ausentismo.csv");
                                link.style.visibility = 'hidden';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            );
                          } else if (i === 2) {
                            handleExecuteTemplateAction(
                              2, 
                              "¡Actas Consolidadas!", 
                              "La compilación del comité de convivencia se descargó correctamente en formato CSV.",
                              () => {
                                const csvContent = "\uFEFF" + [
                                  ["ID Acta", "Fecha", "Grado", "Caso Relacionado", "Estado Resolucion"]
                                ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.setAttribute("href", url);
                                link.setAttribute("download", "actas_comite_convivencia_consolidado.csv");
                                link.style.visibility = 'hidden';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            );
                          } else {
                            handleExecuteTemplateAction(
                              3, 
                              "¡Auditoría Docente Guardada!", 
                              "La cobertura pedagógica docente fue guardada correctamente en formato CSV.",
                              () => {
                                const csvContent = "\uFEFF" + [
                                  ["Docente", "Area", "Syllabus Completos", "Clases Dictadas", "Estado Cobertura"]
                                ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.setAttribute("href", url);
                                link.setAttribute("download", "auditoria_cobertura_docentes.csv");
                                link.style.visibility = 'hidden';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            );
                          }
                        }}
                        disabled={loadingTemplate !== null}
                        className="px-3 py-1.5 text-[10px] font-black text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200/80 rounded-lg hover:shadow-sm transition-all flex items-center gap-1 disabled:opacity-50"
                      >
                        {loadingTemplate === i && <Loader2 className="w-3 h-3 animate-spin" />}
                        {loadingTemplate === i ? 'Emitiendo...' : item.actionLabel}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Torta Donut de Uso de Reportes (Gráfico Redondo) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Uso de Reportes</h3>
            <p className="text-xs font-semibold text-slate-500 mb-6">Distribución mensual de descargas consolidadas por área.</p>

            <div className="h-[180px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)', 
                      fontWeight: 'bold',
                      padding: '8px 12px',
                      backgroundColor: '#ffffff'
                    }}
                    itemStyle={{ color: '#1e293b', fontSize: 11 }}
                    formatter={(value: any) => [`${value} descargas`, 'Volumen']}
                  />
                  <Pie
                    data={DOWNLOADS_USAGE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {DOWNLOADS_USAGE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Central text index */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 tracking-tight">0</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total</span>
              </div>
            </div>

            {/* Customized Legends */}
            <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-slate-100">
              {DOWNLOADS_USAGE_DATA.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="truncate">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 🧠 SECCIÓN 3: INSIGHT EJECUTIVO (MÁXIMO 1) */}
      {/* ========================================== */}
      <div className="bg-gradient-to-br from-slate-500/[0.03] to-slate-500/[0.01] border border-slate-500/10 rounded-2xl p-6 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                Insight Clave de Emisión AI
              </h4>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Recomendación preventiva y organizativa para Rectoría</p>
            </div>
            
            <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-4xl">
              Sin exportaciones registradas en el periodo. Puede generar y descargar plantillas institucionales o configurar envíos programados según los requerimientos de la secretaría académica.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button 
                onClick={() => setActiveModal('alertas')}
                className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all flex items-center gap-1.5"
              >
                Configurar Alertas Automáticas
              </button>
              <button 
                onClick={() => setActiveModal('historial')}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-1"
              >
                Ver Historial de Descargas <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🔮 MODALES DE ALTA FIDELIDAD DE EXPORTACIÓN */}
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
                    {activeModal === 'alertas' ? 'Programación de Reportes Automáticos' : 'Historial de Descargas y Auditoría'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {activeModal === 'alertas' 
                      ? 'Automatiza la generación y envío de informes clave por correo o WhatsApp.' 
                      : 'Registro de auditoría administrativa y descargas de datos institucionales.'}
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
              {activeModal === 'alertas' ? (
                <div className="space-y-6">
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                    <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                      Programa reportes periódicos para recibirlos directamente. El sistema de Inteligencia Artificial de AulaCore enviará la compilación consolidada según tus preferencias.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tipo de Reporte</label>
                        <select className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500">
                          <option>Registro de Inasistencia Escolar</option>
                          <option>Boletín Consolidado Académico (General)</option>
                          <option>Resumen de Convivencia y Acuerdos</option>
                          <option>Cumplimiento de Planeación Docente</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Frecuencia de Envío</label>
                        <select className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500">
                          <option>Cada Viernes, 4:00 PM</option>
                          <option>Diario, 7:15 AM</option>
                          <option>Mensual (Último día del mes)</option>
                          <option>Al concluir cada periodo lectivo</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Canales de Entrega</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-650 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" /> Correo Institucional
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-650 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" /> WhatsApp (Notificaciones)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[10px] text-slate-500 font-medium">
                      💡 <strong>Estrategia sugerida:</strong> Programe reportes periódicos para recibir resúmenes consolidados de forma automatizada.
                    </p>
                  </div>
                </div>
              ) : (<div className="space-y-6">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-650 font-medium leading-relaxed">
                      Historial de exportaciones y descargas procesadas por usuarios administrativos de AulaCore para auditorías de protección de datos:
                    </p>
                  </div>

                  <div className="py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <DownloadCloud className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Sin historial de exportaciones</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      Los registros de auditoría y descarga de archivos generados aparecerán en este log.
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
                  if (activeModal === 'alertas') {
                    handleExecuteModalAction(
                      "¡Programación Guardada!",
                      "Configuración de reporte automático guardada correctamente.",
                      () => {
                        const txtContent = `==================================================
AULACORE - PROGRAMACION AUTOMATICA DE REPORTES
==================================================
Estado de la Tarea: Activo
Frecuencia de Envio: Programada
Fecha de Creacion: ${new Date().toISOString().split('T')[0]}
==================================================
`;
                        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "programacion_automatica_alertas.txt");
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    );
                  } else {
                    handleExecuteModalAction(
                      "¡Audit Log Descargado!",
                      "Se descargó el historial de auditoría en formato CSV.",
                      () => {
                        const csvContent = "\uFEFF" + [
                          ["Fecha", "Usuario", "Accion", "Formato", "Tamanho"]
                        ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "log_exportaciones_aulacore.csv");
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
                {activeModal === 'alertas' 
                  ? (isProcessing ? 'Guardando...' : 'Guardar Programación') 
                  : (isProcessing ? 'Descargando...' : 'Descargar Log Completo')}
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
