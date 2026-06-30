'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/territorio/Modal';
import { TerritorialAlert, TerritorialAlertLog } from '@/services/territory-mock';
import { 
  getAlertsByQueue, 
  transitionAlertStatus, 
  assignAlertTo, 
  calculatePriority 
} from '@/services/territory-alerts';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, Clock, Sparkles, 
  TrendingUp, Users2, Calendar, FileText, Send, Paperclip, 
  Activity, ArrowRight, UserCheck, Shield, HelpCircle
} from 'lucide-react';

type QueueType = 'inmediata' | 'seguimiento' | 'tendencias' | 'resueltas';

export default function TerritoryAlertsPage() {
  const [activeQueue, setActiveQueue] = useState<QueueType>('inmediata');
  const [alerts, setAlerts] = useState<TerritorialAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<TerritorialAlert | null>(null);
  const [currentRole, setCurrentRole] = useState('Secretario de Educación');
  
  // Modal inner tab state
  const [modalTab, setModalTab] = useState<'diagnostico' | 'timeline' | 'recomendaciones' | 'acciones'>('diagnostico');
  
  // Actions form states
  const [newStatus, setNewStatus] = useState<TerritorialAlert['status']>('validada');
  const [actionComment, setActionComment] = useState('');
  const [actionType, setActionType] = useState('Llamada de Requerimiento');
  const [actionOutcome, setActionOutcome] = useState<'exitoso' | 'ineficaz' | 'neutral' | 'en_progreso'>('en_progreso');
  const [evidenceName, setEvidenceName] = useState('');
  
  const [assignedOfficer, setAssignedOfficer] = useState('Dra. Claudia Restrepo');
  const [successMsg, setSuccessMsg] = useState('');

  // Cargar rol y alertas del servicio
  const loadAlerts = () => {
    const data = getAlertsByQueue(activeQueue);
    setAlerts(data);
    
    // Si hay un modal abierto, actualizar su referencia local para pintar el timeline en vivo
    if (selectedAlert) {
      const allAlerts = getAlertsByQueue('inmediata')
        .concat(getAlertsByQueue('seguimiento'))
        .concat(getAlertsByQueue('tendencias'))
        .concat(getAlertsByQueue('resueltas'));
      const fresh = allAlerts.find(a => a.id === selectedAlert.id);
      if (fresh) setSelectedAlert(fresh);
    }
  };

  useEffect(() => {
    loadAlerts();

    function updateRole() {
      const saved = sessionStorage.getItem('simulated_role');
      if (saved) setCurrentRole(saved);
    }
    updateRole();

    window.addEventListener('rbac-role-changed', updateRole);
    window.addEventListener('territory-alerts-updated', loadAlerts);
    return () => {
      window.removeEventListener('rbac-role-changed', updateRole);
      window.removeEventListener('territory-alerts-updated', loadAlerts);
    };
  }, [activeQueue]);

  // Cuentas globales para el Dashboard Ejecutivo
  const [kpis, setKpis] = useState({
    activeCount: 3,
    criticasCount: 1,
    resolutionRate: '85.2%',
    tmi: '14.5 horas',
    riskRate: '24.1%'
  });

  const handleTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert || !actionComment) return;

    const success = transitionAlertStatus(
      selectedAlert.id,
      newStatus,
      actionComment,
      actionType,
      actionOutcome,
      currentRole,
      evidenceName || undefined
    );

    if (success) {
      setSuccessMsg('Estado transicionado y log inmutable registrado para el aprendizaje de IA.');
      setActionComment('');
      setEvidenceName('');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadAlerts();
    }
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;

    const success = assignAlertTo(selectedAlert.id, assignedOfficer);
    if (success) {
      setSuccessMsg(`Alerta asignada oficialmente a ${assignedOfficer}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      loadAlerts();
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critico': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'alto': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'bajo': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
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
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
          Centro de Alertas Tempranas (CAT)
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Consola ejecutiva del Motor de Inteligencia Educativa. Priorice incidencias y gestione bitácoras de aprendizaje territorial.
        </p>
      </div>

      {/* 📊 DASHBOARD EJECUTIVO SUPERIOR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Card className="border-slate-200 shadow-xs rounded-2xl bg-white p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Alertas Activas</span>
              <h3 className="text-2xl font-black text-slate-800">{kpis.activeCount}</h3>
              <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                {kpis.criticasCount} Crítica
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-450">
              <AlertTriangle className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Card>

        {/* KPI 2 */}
        <Card className="border-slate-200 shadow-xs rounded-2xl bg-white p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tasa de Resolución</span>
              <h3 className="text-2xl font-black text-emerald-700">{kpis.resolutionRate}</h3>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                +1.4% este mes
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-450">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </Card>

        {/* KPI 3 */}
        <Card className="border-slate-200 shadow-xs rounded-2xl bg-white p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tiempo de Intervención</span>
              <h3 className="text-2xl font-black text-slate-800">{kpis.tmi}</h3>
              <span className="text-[9px] font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-md">
                Promedio SED
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-450">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Card>

        {/* KPI 4 */}
        <Card className="border-slate-200 shadow-xs rounded-2xl bg-white p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Riesgo del Territorio</span>
              <h3 className="text-2xl font-black text-indigo-650">{kpis.riskRate}</h3>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                Índice de Vulnerabilidad
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-450">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* 🧭 NAVEGACIÓN POR BANDEJAS OPERATIVAS */}
      <div className="flex border-b border-slate-200 p-1 bg-slate-50/30 rounded-2xl gap-2 w-full overflow-x-auto">
        <button
          onClick={() => setActiveQueue('inmediata')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-none cursor-pointer transition-all duration-200 ${
            activeQueue === 'inmediata' 
              ? 'bg-rose-600 text-white shadow-sm' 
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Atención Inmediata
        </button>
        <button
          onClick={() => setActiveQueue('seguimiento')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-none cursor-pointer transition-all duration-200 ${
            activeQueue === 'seguimiento' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Seguimiento y Control
        </button>
        <button
          onClick={() => setActiveQueue('tendencias')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-none cursor-pointer transition-all duration-200 ${
            activeQueue === 'tendencias' 
              ? 'bg-amber-600 text-white shadow-sm' 
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Tendencias y Comportamiento
        </button>
        <button
          onClick={() => setActiveQueue('resueltas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-none cursor-pointer transition-all duration-200 ${
            activeQueue === 'resueltas' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Histórico de Resueltas
        </button>
      </div>

      {/* 📋 LISTADO DE ALERTAS CON SEMÁFOROS CROMÁTICOS */}
      <Card className="border-slate-200 shadow-xs rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/40">
                <TableRow>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11 w-12 text-center">Semáforo</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11">Código</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11">Institución Educativa</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11">Descripción / Incidente</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11 text-center">Impacto</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11">Prioridad Inteligente</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11">Responsable</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11 text-center">Estado</TableHead>
                  <TableHead className="font-bold text-xs text-slate-500 uppercase h-11 text-right pr-6">Ficha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-xs text-slate-450 font-bold italic">
                      No hay incidencias en esta bandeja de control. Todo fluye de acuerdo a los límites establecidos.
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow key={alert.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Semáforo visual */}
                      <TableCell className="align-middle text-center py-4">
                        <div className={`w-3.5 h-3.5 rounded-full mx-auto shadow-xs border ${
                          alert.severity === 'critico' ? 'bg-rose-500 border-rose-600 animate-pulse' :
                          alert.severity === 'alto' ? 'bg-amber-500 border-amber-600' :
                          alert.severity === 'medio' ? 'bg-yellow-405 border-yellow-500' :
                          alert.severity === 'bajo' ? 'bg-indigo-500 border-indigo-600' :
                          'bg-slate-400 border-slate-500'
                        }`} />
                      </TableCell>
                      <TableCell className="py-4 align-middle text-xs font-mono font-black text-slate-800">
                        {alert.id}
                      </TableCell>
                      <TableCell className="py-4 align-middle text-xs font-bold text-slate-800">
                        <div>
                          <span>{alert.institution_name}</span>
                          <span className="block text-[9px] text-slate-400 font-semibold">{alert.municipality}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 align-middle text-xs font-semibold text-slate-655 max-w-[280px] truncate" title={alert.description}>
                        {alert.description}
                      </TableCell>
                      <TableCell className="py-4 align-middle text-center text-xs font-bold text-indigo-700">
                        {alert.impact_estimate}
                      </TableCell>
                      <TableCell className="py-4 align-middle">
                        <span className={`text-[9px] font-black uppercase border px-2.5 py-0.5 rounded-md ${getPriorityBadge(alert.priority)}`}>
                          {alert.priority}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 align-middle text-xs text-slate-600 font-semibold">
                        {alert.assigned_to || <span className="text-slate-400 italic">Sin asignar</span>}
                      </TableCell>
                      <TableCell className="py-4 align-middle text-center">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${getStatusBadge(alert.status)}`}>
                          {alert.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 align-middle text-right pr-6">
                        <button
                          onClick={() => {
                            setSelectedAlert(alert);
                            setModalTab('diagnostico');
                          }}
                          className="px-3 py-1 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-xl cursor-pointer transition-all"
                        >
                          Gestionar
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 🏛️ FICHA EJECUTIVA DE LA ALERTA (MODAL MULTITAB) */}
      <Modal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title={selectedAlert ? `${selectedAlert.id} - ${selectedAlert.institution_name}` : ''}
        subtitle="Ficha de Gestión e Intervención Escolar"
        sizeClassName="max-w-4xl"
      >
        {selectedAlert && (
          <div className="space-y-6">
            {/* Cabecera del Modal con Metadata Crítica */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Código Catálogo</span>
                  <span className="text-xs font-black text-indigo-700 uppercase font-mono">{selectedAlert.alert_code}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ámbito (Scope)</span>
                  <span className="text-xs font-black text-slate-700 uppercase">{selectedAlert.scope}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Impacto Real Estimado</span>
                  <span className="text-xs font-black text-rose-700">{selectedAlert.impact_estimate} Afectados</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase border px-2.5 py-0.5 rounded-md ${getSeverityBadge(selectedAlert.severity)}`}>
                  Criticidad: {selectedAlert.severity}
                </span>
                <span className={`text-[9px] font-black uppercase border px-2.5 py-0.5 rounded-md ${getPriorityBadge(selectedAlert.priority)}`}>
                  Prioridad: {selectedAlert.priority}
                </span>
              </div>
            </div>

            {/* Pestañas de Navegación Interna de la Alerta */}
            <div className="flex border-b border-slate-100 bg-slate-50/20 px-2 py-1.5 gap-2 overflow-x-auto shrink-0 rounded-xl">
              <button
                onClick={() => setModalTab('diagnostico')}
                className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  modalTab === 'diagnostico' 
                    ? 'bg-indigo-650 border-indigo-700 text-white' 
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
              >
                Diagnóstico & KPIs
              </button>
              <button
                onClick={() => setModalTab('timeline')}
                className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  modalTab === 'timeline' 
                    ? 'bg-indigo-650 border-indigo-700 text-white' 
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
              >
                Timeline de Auditoría
              </button>
              <button
                onClick={() => setModalTab('recomendaciones')}
                className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  modalTab === 'recomendaciones' 
                    ? 'bg-indigo-650 border-indigo-700 text-white' 
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
              >
                Recomendaciones del Motor
              </button>
              <button
                onClick={() => setModalTab('acciones')}
                className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  modalTab === 'acciones' 
                    ? 'bg-indigo-650 border-indigo-700 text-white' 
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
              >
                Acciones de Control
              </button>
            </div>

            {/* Alerta de Respuesta */}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-250 p-3.5 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {successMsg}
              </div>
            )}

            {/* Contenedor de Pestaña Activa */}
            <div className="text-xs leading-normal">
              
              {/* PESTAÑA 1: DIAGNÓSTICO */}
              {modalTab === 'diagnostico' && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Hecho / Descripción del Incidente</span>
                    <p className="font-semibold text-slate-700 text-xs leading-relaxed">
                      {selectedAlert.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Causas probables */}
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Causas Probables Detectadas</span>
                      <ul className="list-disc pl-4 space-y-1.5 text-slate-655 font-semibold">
                        {selectedAlert.metadata.causes.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Indicadores relacionados */}
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Ficha de Indicadores Escolares (Cruce BI)</span>
                      <div className="space-y-2 text-xs font-semibold text-slate-700">
                        {Object.entries(selectedAlert.metadata.kpis).map(([k, v]) => (
                          <div key={k} className="flex justify-between border-b border-slate-100 pb-1.5 last:border-b-0 last:pb-0">
                            <span className="text-slate-455">{k}:</span>
                            <span className="font-extrabold text-indigo-705">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PESTAÑA 2: TIMELINE VISUAL (LÍNEA DE TIEMPO INTERACTIVA) */}
              {modalTab === 'timeline' && (
                <div className="space-y-6">
                  <div className="border-l-2 border-indigo-150 pl-6 space-y-6 relative ml-4">
                    {selectedAlert.logs.map((log, idx) => (
                      <div key={log.id} className="relative space-y-2">
                        {/* Nodo temporal de la línea */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center z-10">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        </div>

                        {/* Metadatos del log */}
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

                        {/* Comentario y evidencias */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl max-w-2xl font-semibold text-slate-700 space-y-2">
                          <p className="text-xs leading-relaxed">{log.comment}</p>
                          
                          {/* Metadatos para el aprendizaje del sistema (AI training metrics) */}
                          <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-x-6 gap-y-2 text-[9px] text-slate-455">
                            <span>🕒 Tiempo de Transición: <strong>{(log.resolution_time_seconds / 60).toFixed(1)} mins</strong></span>
                            <span>👤 Operador: <strong>{log.signed_by}</strong></span>
                            {log.evidence_url && (
                              <span className="text-indigo-650 flex items-center gap-0.5">
                                📎 Adjunto: <strong>{log.evidence_url}</strong>
                              </span>
                            )}
                            <span className="font-mono text-slate-400">🔒 SHA: {log.signature_hash}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PESTAÑA 3: RECOMENDACIONES MÚLTIPLES IA */}
              {modalTab === 'recomendaciones' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50/20 border border-indigo-150 p-4 rounded-2xl flex gap-3 text-slate-800 items-start">
                    <Sparkles className="w-5 h-5 shrink-0 text-indigo-600 mt-0.5 animate-pulse" />
                    <div className="text-xs leading-relaxed">
                      <span className="font-black text-indigo-900 block">Propuestas del Motor de Inteligencia</span>
                      <p className="font-semibold text-slate-600 mt-1">
                        El sistema procesó el caso y sugiere las siguientes alternativas operativas recomendadas en base a la criticidad y nivel de impacto:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Recomendación A */}
                    <div className="p-4 border border-slate-200 hover:border-slate-300 rounded-2xl bg-white space-y-1 transition-all">
                      <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block">Alternativa A (Mitigación Directa)</span>
                      <p className="font-semibold text-slate-755 leading-relaxed">{selectedAlert.ai_suggestions.option_a}</p>
                    </div>

                    {/* Recomendación B */}
                    <div className="p-4 border border-slate-200 hover:border-slate-300 rounded-2xl bg-white space-y-1 transition-all">
                      <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block">Alternativa B (Acción Administrativa)</span>
                      <p className="font-semibold text-slate-755 leading-relaxed">{selectedAlert.ai_suggestions.option_b}</p>
                    </div>

                    {/* Recomendación C */}
                    <div className="p-4 border border-slate-200 hover:border-slate-300 rounded-2xl bg-white space-y-1 transition-all">
                      <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block">Alternativa C (Acompañamiento)</span>
                      <p className="font-semibold text-slate-755 leading-relaxed">{selectedAlert.ai_suggestions.option_c}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* PESTAÑA 4: ACCIONES EN CALIENTE (OPERATIVAS Y RBAC) */}
              {modalTab === 'acciones' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Formulario de Transición de Estados (Log inmutable) */}
                  <Card className="border-slate-200 shadow-none rounded-2xl">
                    <CardHeader className="py-3.5 px-4 bg-slate-50/40 border-b border-slate-150">
                      <CardTitle className="text-xs font-black uppercase text-slate-805">Actualizar Ciclo de Vida</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <form onSubmit={handleTransition} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Nuevo Estado</label>
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value as any)}
                              className="w-full text-xs font-semibold text-slate-800 px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
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
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Acción Realizada</label>
                            <select
                              value={actionType}
                              onChange={(e) => setActionType(e.target.value)}
                              className="w-full text-xs font-semibold text-slate-800 px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                            >
                              <option value="Llamada de Requerimiento">Llamada de Requerimiento</option>
                              <option value="Visita Técnica Agendada">Visita Técnica Agendada</option>
                              <option value="Plan de Compromisos Curriculares">Plan de Compromisos</option>
                              <option value="Circular Explicativa Directa">Circular Explicativa</option>
                              <option value="Falsa Alarma Descartada">Falsa Alarma Descartada</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Resultado Esperado</label>
                            <select
                              value={actionOutcome}
                              onChange={(e) => setActionOutcome(e.target.value as any)}
                              className="w-full text-xs font-semibold text-slate-800 px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                            >
                              <option value="en_progreso">En Progreso / Pendiente</option>
                              <option value="exitoso">Exitoso / Mitigado</option>
                              <option value="neutral">Neutral / Requiere monitoreo</option>
                              <option value="ineficaz">Ineficaz / Escalar caso</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Soporte/Evidencia (Nombre Archivo)</label>
                            <input
                              type="text"
                              value={evidenceName}
                              onChange={(e) => setEvidenceName(e.target.value)}
                              placeholder="Ej: Acta_Compromiso_9A.pdf"
                              className="w-full text-xs font-semibold text-slate-800 px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Decisión Tomada / Comentario de Bitácora</label>
                          <textarea
                            required
                            rows={2}
                            value={actionComment}
                            onChange={(e) => setActionComment(e.target.value)}
                            placeholder="Describa brevemente la intervención realizada para alimentar el motor de aprendizaje de AulaCore..."
                            className="w-full text-xs font-semibold text-slate-800 p-2 bg-white border border-slate-200 rounded-lg focus:outline-none resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all border-none flex items-center justify-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Registrar en Timeline
                        </button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Asignación y Acciones del Sistema */}
                  <div className="space-y-4">
                    <Card className="border-slate-200 shadow-none rounded-2xl">
                      <CardHeader className="py-3.5 px-4 bg-slate-50/40 border-b border-slate-150">
                        <CardTitle className="text-xs font-black uppercase text-slate-805">Asignar Responsable</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <form onSubmit={handleAssign} className="flex gap-2 items-end">
                          <div className="flex-1 space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Funcionario de la SED</label>
                            <select
                              value={assignedOfficer}
                              onChange={(e) => setAssignedOfficer(e.target.value)}
                              className="w-full text-xs font-semibold text-slate-800 px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                            >
                              <option value="Dra. Claudia Restrepo">Dra. Claudia Restrepo (Director Calidad)</option>
                              <option value="Ing. Ricardo Vélez">Ing. Ricardo Vélez (Director TIC)</option>
                              <option value="Dr. Alejandro Gómez">Dr. Alejandro Gómez (Secretario de Educación)</option>
                              <option value="Téc. Fernando Ruiz">Téc. Fernando Ruiz (Supervisor Zona 2)</option>
                            </select>
                          </div>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer border-none flex items-center gap-1 shrink-0"
                          >
                            <UserCheck className="w-4 h-4" />
                            Asignar
                          </button>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Enlace rápido a Agenda Territorial */}
                    <div className="p-4 bg-indigo-50/20 border border-indigo-150 rounded-2xl flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">¿Requiere inspección física?</span>
                        <span className="text-[9px] text-slate-400 font-semibold block">Agende una auditoría en la Agenda Territorial oficial.</span>
                      </div>
                      <button
                        onClick={() => {
                          alert(`Pre-cargando alerta ${selectedAlert.id} en el creador de la Agenda Territorial...`);
                          window.location.href = '/territorio/agenda';
                        }}
                        className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-750 text-white text-[10px] font-black rounded-lg cursor-pointer border-none flex items-center gap-0.5"
                      >
                        Programar Visita
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
