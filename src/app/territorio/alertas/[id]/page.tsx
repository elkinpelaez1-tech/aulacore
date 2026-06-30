'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AulaHelp } from '@/components/territorio/AulaHelp';
import { TerritorialAlert } from '@/services/territory-mock';
import { 
  transitionAlertStatus, 
  assignAlertTo, 
  getAlertsByQueue 
} from '@/services/territory-alerts';
import { 
  ArrowLeft, Sparkles, Clock, CheckCircle2, Send, 
  UserCheck, ShieldAlert, AlertTriangle, Landmark, 
  MapPin, HelpCircle, Activity, Paperclip, ArrowRight
} from 'lucide-react';

export default function TerritoryAlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [alertData, setAlertData] = useState<TerritorialAlert | null>(null);
  const [currentRole, setCurrentRole] = useState('Secretario de Educación');
  const [activeTab, setActiveTab] = useState<'diagnostico' | 'narrativa' | 'recomendaciones' | 'acciones'>('diagnostico');

  // Form states
  const [newStatus, setNewStatus] = useState<TerritorialAlert['status']>('validada');
  const [actionComment, setActionComment] = useState('');
  const [actionType, setActionType] = useState('Llamada de Requerimiento');
  const [actionOutcome, setActionOutcome] = useState<'exitoso' | 'ineficaz' | 'neutral' | 'en_progreso'>('en_progreso');
  const [evidenceName, setEvidenceName] = useState('');
  
  const [assignedOfficer, setAssignedOfficer] = useState('Dra. Claudia Restrepo');
  const [successMsg, setSuccessMsg] = useState('');

  const loadAlert = () => {
    // Buscar la alerta en todas las colas
    const allAlerts = getAlertsByQueue('inmediata')
      .concat(getAlertsByQueue('seguimiento'))
      .concat(getAlertsByQueue('tendencias'))
      .concat(getAlertsByQueue('resueltas'));
    
    const matched = allAlerts.find(a => a.id === id);
    if (matched) {
      setAlertData(matched);
      setNewStatus(matched.status);
    }
  };

  useEffect(() => {
    loadAlert();

    function updateRole() {
      const saved = sessionStorage.getItem('simulated_role');
      if (saved) setCurrentRole(saved);
    }
    updateRole();

    window.addEventListener('rbac-role-changed', updateRole);
    window.addEventListener('territory-alerts-updated', loadAlert);
    return () => {
      window.removeEventListener('rbac-role-changed', updateRole);
      window.removeEventListener('territory-alerts-updated', loadAlert);
    };
  }, [id]);

  const handleTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertData || !actionComment) return;

    const success = transitionAlertStatus(
      alertData.id,
      newStatus,
      actionComment,
      actionType,
      actionOutcome,
      currentRole,
      evidenceName || undefined
    );

    if (success) {
      setSuccessMsg('Intervención operativa registrada en la narrativa del caso.');
      setActionComment('');
      setEvidenceName('');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadAlert();
    }
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertData) return;

    const success = assignAlertTo(alertData.id, assignedOfficer);
    if (success) {
      setSuccessMsg(`Funcionario asignado con éxito a la alerta.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      loadAlert();
    }
  };

  if (!alertData) {
    return (
      <div className="p-12 text-center text-xs font-bold text-slate-500">
        Cargando expediente de la alerta territorial...
      </div>
    );
  }

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critico': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'alto': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'bajo': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-slate-100 text-slate-705 border-slate-200';
    }
  };

  const getPriorityBadge = (pri: string) => {
    switch (pri) {
      case 'urgente': return 'bg-rose-50 border-rose-150 text-rose-700';
      case 'alta': return 'bg-amber-50 border-amber-150 text-amber-700';
      case 'media': return 'bg-indigo-50 border-indigo-150 text-indigo-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-550';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'detectada': return 'bg-slate-100 text-slate-700';
      case 'validada': return 'bg-blue-100 text-blue-800';
      case 'asignada': return 'bg-indigo-100 text-indigo-800';
      case 'intervencion': return 'bg-purple-100 text-purple-800';
      case 'seguimiento': return 'bg-amber-100 text-amber-800';
      case 'resuelta': return 'bg-emerald-100 text-emerald-800';
      case 'cerrada': return 'bg-slate-200 text-slate-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Botón de Retorno */}
      <div className="flex items-center justify-between">
        <Link 
          href="/territorio/alertas"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Centro de Alertas
        </Link>
        <span className="text-[10px] text-slate-400 font-bold">Expediente ID: {alertData.id}</span>
      </div>

      {/* Header Ficha Ejecutiva */}
      <div className="bg-white border border-slate-250 p-6 rounded-2xl flex flex-wrap justify-between items-center gap-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 shrink-0">
            <Landmark className="w-5 h-5 text-indigo-650" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
              Incidencia Territorial
            </span>
            <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider mt-0.5">
              {alertData.institution_name}
            </h3>
            <span className="text-[10px] font-semibold text-slate-500 block">{alertData.municipality} — {alertData.target_name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-[10px] font-black uppercase border px-3 py-1 rounded-md ${getSeverityBadge(alertData.severity)}`}>
            Criticidad: {alertData.severity}
          </span>
          <span className={`text-[10px] font-black uppercase border px-3 py-1 rounded-md ${getPriorityBadge(alertData.priority)}`}>
            Prioridad: {alertData.priority}
          </span>
          <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${getStatusBadge(alertData.status)}`}>
            Estado: {alertData.status}
          </span>
        </div>
      </div>

      {/* Navegación Ficha */}
      <div className="flex border-b border-slate-200 p-1 bg-slate-50/20 rounded-2xl gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('diagnostico')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-none cursor-pointer transition-all duration-200 ${
            activeTab === 'diagnostico' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Diagnóstico y KPIs
        </button>
        <button
          onClick={() => setActiveTab('narrativa')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-none cursor-pointer transition-all duration-200 ${
            activeTab === 'narrativa' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Narrativa Operativa
        </button>
        <button
          onClick={() => setActiveTab('recomendaciones')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-none cursor-pointer transition-all duration-200 ${
            activeTab === 'recomendaciones' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Recomendaciones Inteligentes
        </button>
        <button
          onClick={() => setActiveTab('acciones')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-none cursor-pointer transition-all duration-200 ${
            activeTab === 'acciones' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Intervención en Caliente
        </button>
      </div>

      {/* Alerta de Respuesta */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-pulse">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Contenido Pestañas */}
      <div className="text-xs leading-relaxed">
        
        {/* PESTAÑA 1: DIAGNÓSTICO */}
        {activeTab === 'diagnostico' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-slate-200 bg-white rounded-2xl shadow-xs p-6 space-y-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Hecho Diagnóstico</span>
                <p className="text-slate-700 font-semibold text-xs mt-1.5 leading-relaxed">
                  {alertData.description}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase block">Causas Identificadas</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 font-semibold">
                  {alertData.metadata.causes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card className="border-slate-200 bg-white rounded-2xl shadow-xs p-6 space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Cruce de Variables BI</span>
              <div className="space-y-3 text-xs font-semibold">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-455 flex items-center">
                    Impacto Estimado
                    <AulaHelp helpId="cat-impacto-estimado" />
                  </span>
                  <span className="text-rose-700 font-extrabold">{alertData.impact_estimate} Personas</span>
                </div>
                {Object.entries(alertData.metadata.kpis).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
                    <span className="text-slate-455">{k}:</span>
                    <span className="text-slate-800 font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* PESTAÑA 2: NARRATIVA OPERATIVA */}
        {activeTab === 'narrativa' && (
          <Card className="border-slate-200 bg-white rounded-2xl shadow-xs p-6 space-y-6">
            <div className="border-l-2 border-indigo-150 pl-6 space-y-6 relative ml-2">
              {alertData.logs.map((log) => (
                <div key={log.id} className="relative space-y-2">
                  {/* Nodo */}
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-650 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  </div>

                  {/* Cabecera del Log */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wide">
                      {log.action_taken}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Resultado: {log.outcome.toUpperCase()}
                    </span>
                  </div>

                  {/* Narración Operativa en Lenguaje Natural */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl font-semibold text-slate-700 space-y-2">
                    <p className="text-xs leading-relaxed">{log.comment}</p>
                    
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-x-6 gap-y-2 text-[9px] text-slate-455">
                      <span>🕒 Tiempo de Transición: <strong>{(log.resolution_time_seconds / 60).toFixed(1)} minutos</strong></span>
                      <span>👤 Operador de SED: <strong>{log.signed_by}</strong></span>
                      {log.evidence_url && (
                        <span className="text-indigo-650 flex items-center gap-0.5">
                          📎 Acta Evidencia: <strong>{log.evidence_url}</strong>
                        </span>
                      )}
                      <span className="font-mono text-slate-400">🔒 Hash Criptográfico: {log.signature_hash}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* PESTAÑA 3: RECOMENDACIONES IA */}
        {activeTab === 'recomendaciones' && (
          <div className="space-y-4">
            <div className="bg-indigo-50/20 border border-indigo-150 p-4 rounded-2xl flex gap-3 text-slate-800 items-start">
              <Sparkles className="w-5 h-5 shrink-0 text-indigo-600 mt-0.5 animate-pulse" />
              <div className="text-xs">
                <span className="font-black text-indigo-900 block">Sugerencias del Motor de Priorización Inteligente</span>
                <p className="font-semibold text-slate-600 mt-1 leading-relaxed">
                  Para mitigar la reincidencia escolar en {alertData.institution_name}, el sistema recomienda las siguientes tres opciones operativas prioritarias:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 hover:border-slate-305 transition-all">
                <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block">Alternativa A (Mitigación Directa)</span>
                <p className="font-semibold text-slate-700 leading-relaxed">{alertData.ai_suggestions.option_a}</p>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 hover:border-slate-305 transition-all">
                <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block">Alternativa B (Medida Administrativa)</span>
                <p className="font-semibold text-slate-700 leading-relaxed">{alertData.ai_suggestions.option_b}</p>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 hover:border-slate-305 transition-all">
                <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block">Alternativa C (Onboarding Preventivo)</span>
                <p className="font-semibold text-slate-700 leading-relaxed">{alertData.ai_suggestions.option_c}</p>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: INTERVENCIÓN EN CALIENTE */}
        {activeTab === 'acciones' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario */}
            <Card className="lg:col-span-2 border-slate-200 bg-white rounded-2xl p-6">
              <CardTitle className="text-xs font-black uppercase text-slate-800 mb-4 tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-650" />
                Registrar Hito de Intervención en el CAT
              </CardTitle>
              <form onSubmit={handleTransition} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Nuevo Estado</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="validada">Validada</option>
                      <option value="asignada">Asignada</option>
                      <option value="intervencion">En Intervención</option>
                      <option value="seguimiento">En Seguimiento</option>
                      <option value="resuelta">Resuelta</option>
                      <option value="cerrada">Cerrada</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Acción Operativa</label>
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="Llamada de Requerimiento">Llamada de Requerimiento</option>
                      <option value="Visita Técnica Agendada">Visita Técnica Agendada</option>
                      <option value="Plan de Compromisos Curriculares">Plan de Compromisos</option>
                      <option value="Circular Explicativa Directa">Circular Explicativa</option>
                      <option value="Falsa Alarma Descartada">Falsa Alarma Descartada</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Resultado de Acción</label>
                    <select
                      value={actionOutcome}
                      onChange={(e) => setActionOutcome(e.target.value as any)}
                      className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="en_progreso">En Progreso / Monitoreo</option>
                      <option value="exitoso">Exitoso / Resuelto</option>
                      <option value="neutral">Neutral</option>
                      <option value="ineficaz">Ineficaz / Requiere ajuste</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Nombre Archivo Soporte (PDF/XLS)</label>
                    <input
                      type="text"
                      value={evidenceName}
                      onChange={(e) => setEvidenceName(e.target.value)}
                      placeholder="Ej: acta_compromiso_hatillo.pdf"
                      className="w-full text-xs font-semibold text-slate-805 px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Narración de la Intervención y Decisión Tomada</label>
                  <textarea
                    required
                    rows={3}
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    placeholder="Describa en lenguaje natural las llamadas, compromisos y decisiones de esta intervención. Esta bitácora constituirá la base de conocimiento para la optimización futura de AulaCore..."
                    className="w-full text-xs font-semibold text-slate-800 p-3 bg-white border border-slate-200 rounded-xl focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer border-none flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Registrar Hito de Aprendizaje
                </button>
              </form>
            </Card>

            {/* Asignación y Agenda */}
            <div className="space-y-6">
              <Card className="border-slate-200 bg-white rounded-2xl p-6">
                <CardTitle className="text-xs font-black uppercase text-slate-800 mb-4 tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-655" />
                  Reasignar Inspector
                </CardTitle>
                <form onSubmit={handleAssign} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Responsable SED</label>
                    <select
                      value={assignedOfficer}
                      onChange={(e) => setAssignedOfficer(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="Dra. Claudia Restrepo">Dra. Claudia Restrepo (Director Calidad)</option>
                      <option value="Ing. Ricardo Vélez">Ing. Ricardo Vélez (Director TIC)</option>
                      <option value="Dr. Alejandro Gómez">Dr. Alejandro Gómez (Secretario de Educación)</option>
                      <option value="Téc. Fernando Ruiz">Téc. Fernando Ruiz (Supervisor Zona 2)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer border-none"
                  >
                    Asignar
                  </button>
                </form>
              </Card>

              {/* Agenda territorial */}
              <div className="bg-indigo-50/20 border border-indigo-150 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-black text-slate-805 block">Agenda Territorial Directa</span>
                  <p className="text-[11px] text-slate-455 font-semibold">Agende de forma sincrónica una visita técnica del inspector para resolver este caso en campo.</p>
                </div>
                <button
                  onClick={() => {
                    alert(`Pre-cargando la incidencia del colegio ${alertData.institution_name} en la Agenda...`);
                    router.push('/territorio/agenda');
                  }}
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold rounded-xl cursor-pointer border-none flex items-center justify-center gap-1 transition-all"
                >
                  Agendar Inspección de Campo
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
