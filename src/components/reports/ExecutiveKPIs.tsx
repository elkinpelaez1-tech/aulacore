'use client';

import React, { useState } from 'react';
import { GLOBAL_KPI_MOCKS } from '@/lib/data/mock-reports';
import {
  Users,
  GraduationCap,
  Activity,
  AlertTriangle,
  ShieldAlert,
  UserMinus,
  CheckCircle2,
  Bell,
  Mail,
  ArrowRight,
  Clock,
  BookOpen,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExecutiveKPIsProps {
  onNavigateTab?: (tab: 'ejecutivo' | 'academico' | 'convivencia' | 'rfid' | 'docentes' | 'cursos' | 'exportaciones') => void;
}

const DOCENTES_ALERTAS_LIST = [
  {
    id: 'doc-1',
    name: 'Prof. Mateo Sánchez',
    department: 'Ciencias Sociales',
    alertType: 'Rezago Crítico en Planeación Curricular (8 días)',
    module: 'Cátedra de Paz - Grado 9º',
    riskLevel: 'Alto',
    timeAgo: 'Hace 2 horas',
  },
  {
    id: 'doc-2',
    name: 'Dra. Clara Hernández',
    department: 'Ciencias Sociales',
    alertType: 'Retraso en Syllabus Pedagógico (5 días)',
    module: 'Geografía Económica - Grado 10º',
    riskLevel: 'Medio',
    timeAgo: 'Hace 4 horas',
  },
  {
    id: 'doc-3',
    name: 'Prof. Jorge Torres',
    department: 'Matemáticas',
    alertType: 'Pendiente de Cargue de Planillas P2 (3 días)',
    module: 'Trigonometría - Grado 10º-A',
    riskLevel: 'Medio',
    timeAgo: 'Ayer',
  },
  {
    id: 'doc-4',
    name: 'Prof. Andrés Ramírez',
    department: 'Ciencias Naturales (Química)',
    alertType: 'Inconsistencia en Registro RFID Laboratorio',
    module: 'Laboratorio de Química - Grado 11º-B',
    riskLevel: 'Bajo',
    timeAgo: 'Ayer',
  },
];

export function ExecutiveKPIs({ onNavigateTab }: ExecutiveKPIsProps) {
  const [activeModal, setActiveModal] = useState<'docentes' | 'cursos' | 'desercion' | null>(null);
  const [notifiedDocentes, setNotifiedDocentes] = useState<Record<string, boolean>>({});
  const [notifiedAll, setNotifiedAll] = useState(false);

  const handleNotifyDocente = (id: string) => {
    setNotifiedDocentes((prev) => ({ ...prev, [id]: true }));
  };

  const handleNotifyAll = () => {
    const updated: Record<string, boolean> = {};
    DOCENTES_ALERTAS_LIST.forEach((d) => {
      updated[d.id] = true;
    });
    setNotifiedDocentes(updated);
    setNotifiedAll(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Total Students */}
      <div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -top-4 -right-4 p-4 opacity-10 pointer-events-none transition-transform group-hover:scale-110">
          <Users className="w-40 h-40 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Población Estudiantil</p>
          <div className="flex items-baseline gap-3">
            <p className="text-5xl font-black text-white leading-none">{GLOBAL_KPI_MOCKS.totalStudents}</p>
            <p className="text-sm font-bold text-emerald-400">+12% vs año ant.</p>
          </div>
        </div>
      </div>

      {/* Institutional GPA */}
      <div className="col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-4 text-indigo-600">
          <GraduationCap className="w-5 h-5" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">GPA Institucional</p>
        </div>
        <p className="text-4xl font-black text-slate-800">{GLOBAL_KPI_MOCKS.institutionalGpa.toFixed(1)}</p>
        <p className="text-xs font-bold text-slate-400 mt-2">Promedio general</p>
      </div>

      {/* Institutional Attendance */}
      <div className="col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-4 text-emerald-500">
          <Activity className="w-5 h-5" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Asistencia Global</p>
        </div>
        <p className="text-4xl font-black text-emerald-600">{GLOBAL_KPI_MOCKS.institutionalAttendance}%</p>
        <p className="text-xs font-bold text-slate-400 mt-2">Lectura RFID</p>
      </div>

      {/* Risk Metrics Row */}
      <div className="col-span-1 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Tarjeta 1: Cursos Críticos */}
        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-rose-500 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cursos Críticos</p>
            </div>
            <p className="text-2xl font-black text-rose-600">{GLOBAL_KPI_MOCKS.criticalCoursesCount}</p>
          </div>
          <button
            onClick={() => onNavigateTab ? onNavigateTab('cursos') : setActiveModal('cursos')}
            className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Analizar
          </button>
        </div>

        {/* Tarjeta 2: Riesgo Deserción */}
        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-amber-500 mb-1">
              <UserMinus className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Riesgo Deserción</p>
            </div>
            <p className="text-2xl font-black text-amber-600">{GLOBAL_KPI_MOCKS.dropoutRiskStudents}</p>
          </div>
          <button
            onClick={() => onNavigateTab ? onNavigateTab('convivencia') : setActiveModal('desercion')}
            className="text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Prevenir
          </button>
        </div>

        {/* Tarjeta 3: Docentes con Alerta (BOTÓN VER HABILITADO) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors">
          <div>
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Docentes con Alerta</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{GLOBAL_KPI_MOCKS.teachersWithAlerts}</p>
          </div>
          <button
            onClick={() => setActiveModal('docentes')}
            className="text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-sm transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
          >
            <span>Ver</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* MODAL INTERACTIVO DE DOCENTES CON ALERTA                  */}
      {/* ========================================================= */}
      {activeModal === 'docentes' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between">
              <div className="flex gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-400/30 px-2 py-0.5 rounded-full">
                      Auditoría Curricular
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-1">
                    Docentes con Alerta Activa ({DOCENTES_ALERTAS_LIST.length})
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 font-medium">
                    Monitoreo en tiempo real de planeaciones rezagadas, novedades de syllabus e incidencias operativas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Lista de Docentes con Alerta */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Detalle de Incidencia por Docente
                </span>
                <button
                  onClick={handleNotifyAll}
                  disabled={notifiedAll}
                  className={cn(
                    "text-xs font-extrabold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer",
                    notifiedAll
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                  )}
                >
                  {notifiedAll ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Todas las alertas notificadas</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>Notificar a todos los docentes (4)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {DOCENTES_ALERTAS_LIST.map((doc) => {
                  const isNotified = notifiedDocentes[doc.id];

                  return (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-base">
                            {doc.name}
                          </span>
                          <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                            {doc.department}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border",
                              doc.riskLevel === 'Alto' &&
                                "bg-rose-50 text-rose-700 border-rose-200",
                              doc.riskLevel === 'Medio' &&
                                "bg-amber-50 text-amber-700 border-amber-200",
                              doc.riskLevel === 'Bajo' &&
                                "bg-blue-50 text-blue-700 border-blue-200"
                            )}
                          >
                            Riesgo {doc.riskLevel}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{doc.alertType}</span>
                        </p>

                        <p className="text-xs text-slate-500 font-medium flex items-center gap-3">
                          <span>
                            <strong>Módulo:</strong> {doc.module}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            {doc.timeAgo}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleNotifyDocente(doc.id)}
                          disabled={isNotified}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                            isNotified
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default"
                              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs"
                          )}
                        >
                          {isNotified ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Notificado</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              <span>Enviar Recordatorio</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500">
                Al enviar recordatorio, AulaCore emite notificación en la app del docente y correo electrónico.
              </span>
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    if (onNavigateTab) onNavigateTab('docentes');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Ir al Módulo Analítico de Docentes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
