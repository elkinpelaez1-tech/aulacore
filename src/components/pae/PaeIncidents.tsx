'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  AlertOctagon, AlertTriangle, ShieldAlert, 
  Plus, Eye, MessageSquare, Clipboard, 
  X, Check, Send 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Incident {
  id: string;
  incident_type: string;
  title: string;
  description: string;
  incident_date: string;
  status: string;
  affected_count?: number;
  symptoms?: string;
  medical_attention?: boolean;
}

interface Spqr {
  id: string;
  spqr_type: string;
  requester_name: string;
  description: string;
  spqr_date: string;
  status: string;
  response_text?: string;
  response_date?: string;
}

interface PlanMejoramiento {
  id: string;
  finding: string;
  corrective_action: string;
  responsible_name: string;
  due_date: string;
  status: string;
  completion_percentage: number;
}

interface PaeIncidentsProps {
  userRole: string;
  incidents: Incident[];
  onSaveIncidents: (data: Incident[]) => void;
  spqrs: Spqr[];
  onSaveSpqrs: (data: Spqr[]) => void;
  plans: PlanMejoramiento[];
  onSavePlans: (data: PlanMejoramiento[]) => void;
}

export function PaeIncidents({
  userRole,
  incidents = [],
  onSaveIncidents,
  spqrs = [],
  onSaveSpqrs,
  plans = [],
  onSavePlans
}: PaeIncidentsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'incidents' | 'spqr' | 'eta' | 'improvement_plans'>('incidents');

  // Incident form states
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incType, setIncType] = useState('Retraso');
  const [incTitle, setIncTitle] = useState('');
  const [incDesc, setIncDesc] = useState('');

  // SPQR response states
  const [respondingSpqrId, setRespondingSpqrId] = useState<string | null>(null);
  const [spqrResponseText, setSpqrResponseText] = useState('');

  // ETA form states
  const [isEtaModalOpen, setIsEtaModalOpen] = useState(false);
  const [etaSede, setEtaSede] = useState('Sede Principal Campestre');
  const [etaAfectados, setEtaAfectados] = useState(5);
  const [etaSintomas, setEtaSintomas] = useState('Dolor abdominal, náuseas, vómito');
  const [etaMedical, setEtaMedical] = useState(true);
  const [etaDesc, setEtaDesc] = useState('');

  // Plan form states
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planFinding, setPlanFinding] = useState('');
  const [planAction, setPlanAction] = useState('');
  const [planResp, setPlanResp] = useState('');
  const [planDueDate, setPlanDueDate] = useState('');

  const canEdit = userRole === 'rector' || userRole === 'secretaria' || userRole === 'coordinador';
  const isDocente = userRole === 'docente' || userRole === 'director_grupo';

  // Check if there are active ETA incidents
  const etaIncidents = incidents.filter(i => i.incident_type === 'ETA');
  const hasEtaEmergency = etaIncidents.some(i => i.status !== 'Cerrado');

  // --- INCIDENT HANDLERS ---
  const handleOpenAddIncident = () => {
    setIncType('Retraso');
    setIncTitle('');
    setIncDesc('');
    setIsIncidentModalOpen(true);
  };

  const handleSaveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incTitle.trim() || !incDesc.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const newInc: Incident = {
      id: 'inc-' + Date.now(),
      incident_type: incType,
      title: incTitle,
      description: incDesc,
      incident_date: new Date().toISOString().split('T')[0],
      status: 'Abierto'
    };

    const updated = [newInc, ...incidents];
    onSaveIncidents(updated);
    setIsIncidentModalOpen(false);
    alert('✓ Incidencia reportada y enrutada a supervisión.');
  };

  const handleUpdateIncidentStatus = (id: string, newStatus: string) => {
    if (!canEdit) return;
    const updated = incidents.map(i => 
      i.id === id ? { ...i, status: newStatus } : i
    );
    onSaveIncidents(updated);
    alert(`✓ Incidencia actualizada a estado: ${newStatus}`);
  };

  // --- SPQR HANDLERS ---
  const handleOpenResponse = (id: string) => {
    const s = spqrs.find(x => x.id === id);
    if (s) {
      setSpqrResponseText(s.response_text || '');
      setRespondingSpqrId(id);
    }
  };

  const handleSaveSpqrResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !respondingSpqrId) return;

    const updated = spqrs.map(s => 
      s.id === respondingSpqrId
        ? { 
            ...s, 
            status: 'Respondido', 
            response_text: spqrResponseText, 
            response_date: new Date().toISOString().split('T')[0] 
          }
        : s
    );

    onSaveSpqrs(updated);
    setRespondingSpqrId(null);
    alert('✓ Respuesta SPQR enviada formalmente al acudiente.');
  };

  // --- ETA EMERGENCY HANDLERS ---
  const handleSaveEta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!etaDesc.trim()) {
      alert('Por favor describa el evento.');
      return;
    }

    const newEta: Incident = {
      id: 'eta-' + Date.now(),
      incident_type: 'ETA',
      title: `Brote ETA en ${etaSede}`,
      description: `Brote alimentario detectado: ${etaDesc}. Síntomas: ${etaSintomas}. Afectados: ${etaAfectados} estudiantes.`,
      incident_date: new Date().toISOString().split('T')[0],
      status: 'Abierto',
      affected_count: etaAfectados,
      symptoms: etaSintomas,
      medical_attention: etaMedical
    };

    const updated = [newEta, ...incidents];
    onSaveIncidents(updated);
    setIsEtaModalOpen(false);

    alert('⚠️ ALERTA ROJA GENERADA: Se envió notificación oficial al Ministerio de Salud, Secretaría de Educación y Rectoría.');
  };

  // --- PLANS HANDLERS ---
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planFinding.trim() || !planAction.trim() || !planResp.trim() || !planDueDate) {
      alert('Por favor complete todos los campos.');
      return;
    }

    const newPlan: PlanMejoramiento = {
      id: 'plan-' + Date.now(),
      finding: planFinding,
      corrective_action: planAction,
      responsible_name: planResp,
      due_date: planDueDate,
      status: 'Abierto',
      completion_percentage: 0
    };

    const updated = [newPlan, ...plans];
    onSavePlans(updated);
    setIsPlanModalOpen(false);
    alert('✓ Plan de mejoramiento PAE registrado.');
  };

  const handleUpdatePlanProgress = (id: string, progress: number) => {
    if (!canEdit) return;
    const updated = plans.map(p => 
      p.id === id 
        ? { 
            ...p, 
            completion_percentage: progress,
            status: progress === 100 ? 'Cumplido' : p.status 
          }
        : p
    );
    onSavePlans(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Red Alert Banner in case of ETA Emergency */}
      {hasEtaEmergency && (
        <div className="bg-red-600 p-5 rounded-3xl text-white shadow-lg flex items-start gap-4 border border-red-700 animate-pulse">
          <ShieldAlert className="w-8 h-8 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight">¡ALERTA EPIDEMIOLÓGICA DE ETA ACTIVA!</h3>
            <p className="text-xs font-semibold text-red-100 max-w-2xl leading-relaxed">
              Se ha detectado un Evento Transmitido por Alimentos (ETA) activo en la institución. Se ha notificado a la Secretaría de Salud y se está realizando auditoría preventiva en bodega y cocina del operador.
            </p>
          </div>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveSubTab('incidents')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none whitespace-nowrap",
            activeSubTab === 'incidents' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Incidencias y Alertas
        </button>
        <button
          onClick={() => setActiveSubTab('spqr')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none whitespace-nowrap",
            activeSubTab === 'spqr' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Portal SPQR Ciudadano
        </button>
        <button
          onClick={() => setActiveSubTab('eta')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none whitespace-nowrap",
            activeSubTab === 'eta' ? "border-red-600 text-red-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          ⚠️ Reportes ETA Sanitario
        </button>
        <button
          onClick={() => setActiveSubTab('improvement_plans')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none whitespace-nowrap",
            activeSubTab === 'improvement_plans' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Planes de Mejoramiento
        </button>
      </div>

      {/* --- SUBTAB: INCIDENTS --- */}
      {activeSubTab === 'incidents' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-indigo-600" />
                Alertas e Incidencias en la Operación
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Control y reporte de anomalías en entregas, gramajes o calidad de alimentos.</p>
            </div>
            {(canEdit || isDocente) && (
              <Button onClick={handleOpenAddIncident} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer">
                <Plus className="w-4 h-4" /> Reportar Incidencia
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Fecha</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Tipo Incidencia</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Título / Descripción</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Estado</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Gestión de Alerta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.filter(i => i.incident_type !== 'ETA').map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-bold text-slate-950 text-xs pl-6">{inc.incident_date}</TableCell>
                    <TableCell className="font-black text-slate-800 text-xs">{inc.incident_type}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600 max-w-md">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{inc.title}</span>
                        <span className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{inc.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        inc.status === 'Abierto' && "bg-rose-50 text-rose-800 border-rose-200 animate-pulse",
                        inc.status === 'En proceso' && "bg-amber-50 text-amber-800 border-amber-250",
                        inc.status === 'Cerrado' && "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        {inc.status}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {canEdit && inc.status !== 'Cerrado' ? (
                        <div className="flex justify-end gap-1.5">
                          {inc.status === 'Abierto' && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-lg px-2" onClick={() => handleUpdateIncidentStatus(inc.id, 'En proceso')}>
                              Atender
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg px-2" onClick={() => handleUpdateIncidentStatus(inc.id, 'Cerrado')}>
                            Cerrar
                          </Button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Trazado</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* --- SUBTAB: SPQR --- */}
      {activeSubTab === 'spqr' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Buzón SPQR de Alimentación Escolar
            </CardTitle>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Control de peticiones, quejas y sugerencias cargadas por acudientes y comités.</p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Fecha / Solicitante</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Tipo SPQR</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Queja / Reclamo</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Estado</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Respuesta Oficial</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spqrs.map((s) => (
                  <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-semibold text-slate-900 text-xs pl-6">
                      <div className="flex flex-col">
                        <span>{s.requester_name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{s.spqr_date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-slate-800 text-xs">{s.spqr_type}</TableCell>
                    <TableCell className="text-xs font-medium text-slate-600 max-w-sm truncate" title={s.description}>
                      {s.description}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        s.status === 'Abierto' && "bg-rose-50 text-rose-800 border-rose-200 animate-pulse",
                        s.status === 'Respondido' && "bg-emerald-50 text-emerald-800 border-emerald-250"
                      )}>
                        {s.status}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {canEdit ? (
                        <Button variant="ghost" className="h-8 text-xs font-bold text-indigo-650 hover:bg-indigo-50 px-2" onClick={() => handleOpenResponse(s.id)}>
                          {s.status === 'Respondido' ? 'Ver Respuesta' : 'Responder'}
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Ver</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* --- SUBTAB: ETA EMERGENCY --- */}
      {activeSubTab === 'eta' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-600 animate-bounce" />
                Eventos Transmitidos por Alimentos (ETA)
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Alertas prioritarias de intoxicaciones o infecciones gastrointestinales masivas.</p>
            </div>
            {(canEdit || isDocente) && (
              <Button onClick={() => setIsEtaModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer">
                <AlertOctagon className="w-4 h-4" /> Reportar Caso ETA
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Fecha Alerta</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Título del Reporte</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Afectados</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Detalle de Síntomas</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Atención Médica</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {etaIncidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-8 text-center text-xs text-slate-400 font-semibold">
                      ✓ No se registran alertas epidemiológicas de ETA.
                    </TableCell>
                  </TableRow>
                ) : (
                  etaIncidents.map((eta) => (
                    <TableRow key={eta.id} className="bg-rose-50/30 hover:bg-rose-50/50 transition-colors">
                      <TableCell className="font-bold text-red-900 text-xs pl-6">{eta.incident_date}</TableCell>
                      <TableCell className="font-black text-slate-900 text-xs">{eta.title}</TableCell>
                      <TableCell className="text-center font-black text-red-700 text-xs">{eta.affected_count} estudiantes</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600 leading-snug">{eta.symptoms}</TableCell>
                      <TableCell className="text-center text-xs font-bold">
                        {eta.medical_attention ? (
                          <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">Requerida</span>
                        ) : (
                          <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Ninguna</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        {canEdit && eta.status !== 'Cerrado' ? (
                          <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg px-2" onClick={() => handleUpdateIncidentStatus(eta.id, 'Cerrado')}>
                            Marcar Cerrada
                          </Button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">{eta.status}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* --- SUBTAB: IMPROVEMENT PLANS --- */}
      {activeSubTab === 'improvement_plans' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-indigo-600" />
                Planes de Mejoramiento y Correctivos
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Seguimiento a hallazgos, compromisos del contratista y plazos de subsanación.</p>
            </div>
            {canEdit && (
              <Button onClick={() => setIsPlanModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer">
                <Plus className="w-4 h-4" /> Crear Plan Correctivo
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Hallazgo Auditado</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Acción Correctiva Comprometida</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Responsable</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Plazo Compromiso</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">% Avance</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Actualizar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-8 text-center text-xs text-slate-400 font-semibold">
                      No se registran planes de mejoramiento requeridos.
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-black text-slate-900 text-xs pl-6 max-w-xs leading-relaxed">{p.finding}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600 max-w-xs leading-relaxed">{p.corrective_action}</TableCell>
                      <TableCell className="font-bold text-slate-700 text-xs">{p.responsible_name}</TableCell>
                      <TableCell className="text-center font-bold text-slate-500 text-xs">{p.due_date}</TableCell>
                      <TableCell className="text-center font-bold text-xs">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px]",
                            p.completion_percentage === 100 ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-indigo-50 text-indigo-800 border border-indigo-200"
                          )}>
                            {p.completion_percentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        {canEdit && p.completion_percentage < 100 ? (
                          <Button variant="ghost" className="h-8 text-indigo-650 hover:bg-indigo-50 text-xs px-2" onClick={() => {
                            const newP = prompt('Ingrese el porcentaje de avance (0 a 100):', p.completion_percentage.toString());
                            if (newP !== null) handleUpdatePlanProgress(p.id, parseInt(newP));
                          }}>
                            Avanzar
                          </Button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Cerrado</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* --- MODAL ADD INCIDENT --- */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsIncidentModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSaveIncident}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-indigo-600" />
                    Reportar Incidencia Operativa
                  </h3>
                  <button type="button" onClick={() => setIsIncidentModalOpen(false)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Tipo de Incidencia</label>
                    <select
                      value={incType}
                      onChange={(e) => setIncType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                    >
                      <option value="Retraso">Retraso en Entrega</option>
                      <option value="Alimento Insuficiente">Alimento Insuficiente (Raciones Faltantes)</option>
                      <option value="Mala Calidad">Alimentos de Mala Calidad</option>
                      <option value="Falta de Operador">Falta de Operador / No llegó</option>
                      <option value="Incumplimiento contractual">Incumplimiento de Minuta</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Título del Reporte *</label>
                    <input
                      type="text"
                      placeholder="Ej. Fruta magullada en Sede Primaria"
                      value={incTitle}
                      onChange={(e) => setIncTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Detalle o Descripción del Suceso *</label>
                    <textarea
                      rows={3}
                      placeholder="Describa a detalle el lote, cantidad, hora o novedad..."
                      value={incDesc}
                      onChange={(e) => setIncDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" onClick={() => setIsIncidentModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                  Cancelar
                </Button>
                <Button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm cursor-pointer h-9 border-none">
                  Enviar Reporte
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* --- MODAL RESPOND SPQR --- */}
      {respondingSpqrId && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setRespondingSpqrId(null)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSaveSpqrResponse}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    Responder SPQR
                  </h3>
                  <button type="button" onClick={() => setRespondingSpqrId(null)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Queja/Reclamo:</span>
                    <p className="text-slate-700 leading-relaxed font-semibold">
                      {spqrs.find(x => x.id === respondingSpqrId)?.description}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Respuesta Formal *</label>
                    <textarea
                      rows={4}
                      placeholder="Escriba la respuesta oficial para enviar al acudiente..."
                      value={spqrResponseText}
                      onChange={(e) => setSpqrResponseText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" onClick={() => setRespondingSpqrId(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                  Cancelar
                </Button>
                <Button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm cursor-pointer h-9 border-none flex items-center gap-1">
                  <Send className="w-3.5 h-3.5" /> Enviar Respuesta
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* --- MODAL REPORT ETA EMERGENCY --- */}
      {isEtaModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsEtaModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSaveEta}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-red-100 pb-3">
                  <h3 className="text-base font-black text-red-650 tracking-tight flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-red-600" />
                    Generar Reporte de Brote ETA
                  </h3>
                  <button type="button" onClick={() => setIsEtaModalOpen(false)} className="text-slate-400 hover:text-slate-655 outline-none border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="bg-red-50 p-4 border border-red-200 rounded-2xl text-red-950 flex gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <span className="leading-snug text-[11px]">
                      Este formulario genera una <strong>ALERTA MÁXIMA</strong> y activa protocolos de emergencia con los comités de sanidad escolar.
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Sede del Suceso</label>
                    <select
                      value={etaSede}
                      onChange={(e) => setEtaSede(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                    >
                      <option value="Sede Principal Campestre">Sede Principal Campestre</option>
                      <option value="Sede Anexa Primaria">Sede Anexa Primaria</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">No. Estudiantes Afectados *</label>
                      <input
                        type="number"
                        min="1"
                        value={etaAfectados}
                        onChange={(e) => setEtaAfectados(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-red-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-2">Atención Médica</label>
                      <div className="flex gap-4 pt-1 font-bold">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="etaMed" checked={etaMedical} onChange={() => setEtaMedical(true)} className="w-4 h-4 cursor-pointer" />
                          Sí
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="etaMed" checked={!etaMedical} onChange={() => setEtaMedical(false)} className="w-4 h-4 cursor-pointer" />
                          No
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Síntomas Reportados *</label>
                    <input
                      type="text"
                      value={etaSintomas}
                      onChange={(e) => setEtaSintomas(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-red-500 transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Descripción de los hechos *</label>
                    <textarea
                      rows={3}
                      placeholder="Describa qué alimentos consumieron, hora del reporte..."
                      value={etaDesc}
                      onChange={(e) => setEtaDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-red-500 transition-all font-semibold resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" onClick={() => setIsEtaModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                  Cancelar
                </Button>
                <Button type="submit" className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm cursor-pointer h-9 border-none">
                  Reportar Emergencia
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* --- MODAL ADD PLAN DE MEJORAMIENTO --- */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsPlanModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSavePlan}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Clipboard className="w-5 h-5 text-indigo-600" />
                    Crear Plan de Mejoramiento
                  </h3>
                  <button type="button" onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Hallazgo / Incumplimiento Auditado *</label>
                    <textarea
                      rows={2}
                      placeholder="Describa el hallazgo detectado..."
                      value={planFinding}
                      onChange={(e) => setPlanFinding(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Acción Correctiva *</label>
                    <textarea
                      rows={2}
                      placeholder="Describa la acción correctiva comprometida..."
                      value={planAction}
                      onChange={(e) => setPlanAction(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Responsable de Ejecución *</label>
                      <input
                        type="text"
                        placeholder="Ej. Ing. Operador"
                        value={planResp}
                        onChange={(e) => setPlanResp(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Plazo Límite de Compromiso *</label>
                      <input
                        type="date"
                        value={planDueDate}
                        onChange={(e) => setPlanDueDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" onClick={() => setIsPlanModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                  Cancelar
                </Button>
                <Button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm cursor-pointer h-9 border-none">
                  Guardar Plan
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
