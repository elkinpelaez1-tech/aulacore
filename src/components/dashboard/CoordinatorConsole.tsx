'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
  Clock,
  Eye,
  ShieldAlert,
  Search,
  Filter,
  Users2,
  FileSignature,
  Activity,
  Layers,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Award,
  UserPlus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { DocumentEngine } from '@/components/document-engine/DocumentEngine';
import { SchedulePreviewWidget } from './shared/SchedulePreviewWidget';
import { RectorExecutiveSummary } from './RectorExecutiveSummary';
import { useAuth } from '@/providers/auth-provider';
import { 
  listOnboardingSubmissions, 
  approveOnboarding, 
  rejectOnboarding, 
  TeacherOnboardingData 
} from '@/lib/services/teacher-onboarding';
import { PendingApprovalsQueue } from '@/components/settings/PendingApprovalsQueue';
import { PendingApproval, AttachedDocument } from '@/lib/data/mock-settings';

interface PlaneacionItem {
  id: string;
  teacher: string;
  area: string;
  week: string;
  topic: string;
  status: 'pending' | 'approved' | 'returned';
  grade: string;
  dateSubmitted: string;
  objectives: string[];
  methodology: string;
  activities: string[];
  evaluation: string;
  resources: string;
  feedback: string;
}

export function CoordinatorConsole() {
  const { activeInstitution, institutionId: authInstId } = useAuth();
  const currentInstitutionId = activeInstitution?.id || authInstId;

  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loadingOnboardings, setLoadingOnboardings] = useState(false);

  const [isDocEngineOpen, setIsDocEngineOpen] = useState(false);
  const [docEngineType, setDocEngineType] = useState<any>('rectoral_report');

  const mapOnboardingToApproval = (t: TeacherOnboardingData): PendingApproval => {
    const docs: AttachedDocument[] = [];
    if (t.cv_url) {
      docs.push({ id: 'cv', name: 'CV_Docente.pdf', type: 'PDF', status: 'Pendiente', size: '2.8 MB', url: t.cv_url });
    }
    if (t.diploma_url) {
      docs.push({ id: 'diploma', name: 'Diploma_Licenciatura.pdf', type: 'PDF', status: 'Pendiente', size: '1.9 MB', url: t.diploma_url });
    }
    if (t.escalafon_url) {
      docs.push({ id: 'escalafon', name: 'Escalafon_MinEdu.pdf', type: 'PDF', status: 'Pendiente', size: '1.4 MB', url: t.escalafon_url });
    }
    if (t.background_check_url) {
      docs.push({ id: 'backgroundCheck', name: 'Antecedentes.pdf', type: 'PDF', status: 'Pendiente', size: '1.2 MB', url: t.background_check_url });
    }
    if (t.certifications_url) {
      docs.push({ id: 'certifications', name: 'Certificaciones_Historico.pdf', type: 'PDF', status: 'Pendiente', size: '3.4 MB', url: t.certifications_url });
    }
    if (t.identity_doc_url) {
      docs.push({ id: 'identityDoc', name: 'Cedula_Identidad.pdf', type: 'PDF', status: 'Pendiente', size: '1.7 MB', url: t.identity_doc_url });
    }

    return {
      id: t.id!,
      name: t.full_name,
      email: t.email,
      type: 'Docente',
      submittedAt: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Reciente',
      status: 'pending_approval',
      documentStatus: docs.length > 0 ? 'Revisión Manual' : 'Faltante',
      documents: docs,
      riskScore: 3
    };
  };

  const loadPendingOnboardings = async () => {
    if (!currentInstitutionId) {
      setPendingApprovals([]);
      return;
    }
    setLoadingOnboardings(true);
    try {
      const subs = await listOnboardingSubmissions(currentInstitutionId);
      const pendingTeachers = subs
        .filter(t => t.status === 'pending_approval')
        .map(mapOnboardingToApproval);
      setPendingApprovals(pendingTeachers);
    } catch (err) {
      console.error('Error cargando solicitudes pendientes para el coordinador:', err);
    } finally {
      setLoadingOnboardings(false);
    }
  };

  useEffect(() => {
    loadPendingOnboardings();
  }, [currentInstitutionId]);

  const handleApproveOnboarding = async (id: string, notes?: string) => {
    if (!currentInstitutionId) return;
    try {
      const res = await approveOnboarding(id, currentInstitutionId);
      if (res.success) {
        await loadPendingOnboardings();
      } else {
        console.error('Error al aprobar docente:', res.error);
      }
    } catch (err) {
      console.error('Excepción al aprobar docente:', err);
    }
  };

  const handleRejectOnboarding = async (id: string, notes?: string) => {
    try {
      const success = await rejectOnboarding(id);
      if (success) {
        await loadPendingOnboardings();
      }
    } catch (err) {
      console.error('Error al rechazar docente:', err);
    }
  };

  const [planeaciones, setPlaneaciones] = useState<PlaneacionItem[]>([]);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'view' | 'feedback'>('view');
  const [feedbackText, setFeedbackText] = useState('');

  const handleOpenPlanModal = (planId: string, tab: 'view' | 'feedback' = 'view') => {
    const p = planeaciones.find(x => x.id === planId);
    if (!p) return;
    setSelectedPlanId(planId);
    setModalTab(tab);
    setFeedbackText(p.feedback || '');
    setIsPlanModalOpen(true);
  };

  const handleApprovePlan = (planId?: string) => {
    const targetId = planId || selectedPlanId;
    if (!targetId) return;
    setPlaneaciones(prev => prev.map(item => {
      if (item.id === targetId) {
        return {
          ...item,
          status: 'approved',
          feedback: feedbackText.trim() || '¡Planeación aprobada por Coordinación Académica con felicitación metodológica!'
        };
      }
      return item;
    }));
    if (isPlanModalOpen) {
      setIsPlanModalOpen(false);
    }
  };

  const handleReturnPlan = (planId?: string) => {
    const targetId = planId || selectedPlanId;
    if (!targetId) return;
    if (!feedbackText.trim() && isPlanModalOpen && modalTab !== 'feedback') {
      setModalTab('feedback');
      return;
    }
    setPlaneaciones(prev => prev.map(item => {
      if (item.id === targetId) {
        return {
          ...item,
          status: 'returned',
          feedback: feedbackText.trim() || 'Se requieren ajustes en la rúbrica de evaluación y adaptaciones de aula.'
        };
      }
      return item;
    }));
    if (isPlanModalOpen) {
      setIsPlanModalOpen(false);
    }
  };

  const activePlan = planeaciones.find(x => x.id === selectedPlanId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. PRIMER PANTALLAZO COORDINACIÓN: RESUMEN INSTITUCIONAL & MÉTRICAS EJECUTIVAS */}
      <RectorExecutiveSummary roleTitle="coordinador" />

      {/* ========================================================= */}
      {/* 🏛️ SECCIÓN 2: HEADER & KPI CARDS                          */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Supervisión Institucional
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Consola de Coordinación
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Gestión académica, mallas curriculares y seguimiento convivencial.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setDocEngineType('curriculum_grid');
              setIsDocEngineOpen(true);
            }}
            variant="outline"
            className="border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-2 shadow-sm transition-all hover:bg-indigo-100"
          >
            <BookOpen className="w-4 h-4" />
            Exportar Mallas (PDF)
          </Button>
          <Button
            onClick={() => {
              setDocEngineType('rectoral_report');
              setIsDocEngineOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-2 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            Consolidado Institucional
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <UserPlus className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Vinculación Docente</p>
              <h3 className="text-2xl font-black text-slate-900">{pendingApprovals.length}</h3>
              <p className="text-[10px] font-bold text-amber-600">
                {pendingApprovals.length === 1 ? '1 Solicitud Pendiente' : `${pendingApprovals.length} Pendientes`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mallas Curriculares</p>
              <h3 className="text-2xl font-black text-slate-900">0</h3>
              <p className="text-[10px] font-bold text-slate-500">Sin mallas curriculares cargadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Planeaciones Semanales</p>
              <h3 className="text-2xl font-black text-slate-900">{planeaciones.length}</h3>
              <p className="text-[10px] font-bold text-slate-500">
                {planeaciones.length === 0 ? 'No hay planeaciones docentes registradas' : `${planeaciones.length} Registradas`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Alertas Tempranas</p>
              <h3 className="text-2xl font-black text-slate-900">0</h3>
              <p className="text-[10px] font-bold text-slate-500">No se registran alertas tempranas activas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Users2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Observadores Listos</p>
              <h3 className="text-2xl font-black text-slate-900">0%</h3>
              <p className="text-[10px] font-bold text-slate-500">Sin estudiantes matriculados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* 👥 SECCIÓN: SOLICITUDES DE VINCULACIÓN DOCENTE             */}
      {/* ========================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <UserPlus className="w-4.5 h-4.5 text-indigo-600" />
              Solicitudes de Vinculación Docente
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Candidatos registrados a través del portal de auto-onboarding en espera de validación de credenciales.
            </p>
          </div>
          <span className={cn(
            "text-[10px] font-black uppercase px-2.5 py-1 rounded-full border",
            pendingApprovals.length > 0 
              ? "bg-amber-100 text-amber-800 border-amber-200 animate-pulse" 
              : "bg-slate-100 text-slate-600 border-slate-200"
          )}>
            {pendingApprovals.length} {pendingApprovals.length === 1 ? 'Solicitud Pendiente' : 'Solicitudes Pendientes'}
          </span>
        </div>

        <div className="h-[460px]">
          <PendingApprovalsQueue 
            pendingApprovals={pendingApprovals} 
            onApprove={handleApproveOnboarding}
            onReject={handleRejectOnboarding}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📚 SECCIÓN 2: CONTROL DE PLANEACIONES DOCENTES            */}
      {/* ========================================================= */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-indigo-700" />
              Auditoría de Planeaciones Docentes
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5 font-semibold">Validación semanal de contenido pedagógico por área.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar docente o área..."
                className="pl-8 pr-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 w-48"
              />
            </div>
            <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {planeaciones.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-800 mb-1">
                No hay planeaciones docentes registradas
              </h4>
              <p className="text-xs text-slate-500 max-w-sm font-medium">
                Cuando los docentes envíen sus preparaciones semanales para revisión pedagógica, aparecerán listadas aquí.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Docente / Área</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Semana Lectiva</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Unidad Temática</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Estado</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planeaciones.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/50">
                    <TableCell className="pl-6">
                      <span className="font-black text-slate-900 block text-xs">{p.teacher}</span>
                      <span className="text-[10px] font-semibold text-slate-500">{p.area}</span>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-600">{p.week}</TableCell>
                    <TableCell className="text-xs font-bold text-slate-700">{p.topic}</TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider inline-block",
                        p.status === 'pending' && "bg-amber-100 text-amber-700 border border-amber-200",
                        p.status === 'approved' && "bg-emerald-100 text-emerald-700 border border-emerald-200",
                        p.status === 'returned' && "bg-red-100 text-red-700 border border-red-200"
                      )}>
                        {p.status === 'pending' ? 'Por Revisar' : p.status === 'approved' ? 'Aprobada' : 'Devuelta'}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenPlanModal(p.id, 'view')}
                          title="Ver Ficha y Contenido Pedagógico (Modal Tarjeta)"
                          className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleApprovePlan(p.id)}
                          title="Aprobar Planeación Didáctica"
                          className={cn(
                            "h-7 w-7 cursor-pointer transition-colors",
                            p.status === 'approved' 
                              ? "text-emerald-600 bg-emerald-50 font-bold" 
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          )}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenPlanModal(p.id, 'feedback')}
                          title="Devolver / Hacer Observación Pedagógica (Modal Tarjeta)"
                          className={cn(
                            "h-7 w-7 cursor-pointer transition-colors",
                            p.status === 'returned' 
                              ? "text-red-600 bg-red-50 font-bold" 
                              : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                          )}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* ⚠️ SECCIÓN 3: RADAR DE ALERTAS Y NOVEDADES                */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-500" />
              Radar de Alertas Institucionales
            </CardTitle>
            <span className="text-[9px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              AL DÍA
            </span>
          </CardHeader>
          <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[220px]">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-slate-800 mb-1">
              No se registran alertas tempranas activas
            </h4>
            <p className="text-[11px] text-slate-500 max-w-xs font-medium">
              No se han reportado situaciones de inasistencia reiterada ni riesgo académico en la institución.
            </p>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* 📋 SECCIÓN 4: REPORTE DE MALLAS CURRICULARES              */}
        {/* ========================================================= */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-xl flex flex-col">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Validación de Mallas Curriculares
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex-1 flex flex-col justify-between">
            <div className="text-center flex flex-col items-center justify-center my-auto py-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-slate-800 mb-1">
                Sin mallas curriculares cargadas
              </h4>
              <p className="text-[11px] text-slate-500 max-w-xs font-medium">
                Configura los planes de estudio y mallas institucionales para supervisar su avance pedagógico.
              </p>
            </div>
            
            <div className="pt-4 border-t border-slate-100 mt-auto">
              <Link href="/mallas">
                <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs h-8 flex items-center justify-center gap-2">
                  Ver Directorio Completo de Mallas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* 🕒 SECCIÓN 5: PLANEACIÓN DE HORARIOS                      */}
        {/* ========================================================= */}
        <SchedulePreviewWidget role="coordinator" title="Horarios y Mallas Institucionales" />
      </div>

      <DocumentEngine
        isOpen={isDocEngineOpen}
        onClose={() => setIsDocEngineOpen(false)}
        documentType={docEngineType}
        studentName="N/A (Reporte Institucional)"
        courseName="Todos los Grados"
        metadataPayload={{ origin: 'coordinacion' }}
      />

      {/* Modal Tarjeta Centrada para Auditoría y Revisión de Planeaciones Docentes */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="w-[96vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-[85vh] max-h-[85vh] p-0 flex flex-col bg-slate-50 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200 gap-0">
          {activePlan && (
            <>
              {/* Top Status Decorator Bar */}
              <div className={cn(
                "w-full h-3 shrink-0",
                activePlan.status === 'approved' ? "bg-emerald-500" :
                activePlan.status === 'returned' ? "bg-red-500" : "bg-amber-500"
              )} />

              {/* Header Info & Tabs */}
              <div className="bg-white px-6 py-4 border-b border-slate-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {activePlan.area}
                    </span>
                    <span className="text-xs font-bold text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-600">{activePlan.grade}</span>
                    <span className="text-xs font-bold text-slate-400">•</span>
                    <span className="text-xs font-bold text-indigo-600">{activePlan.week}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {activePlan.topic}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Presentado por: <span className="text-slate-800 font-bold">{activePlan.teacher}</span> ({activePlan.dateSubmitted})
                  </p>
                </div>

                {/* Tabs & Status Badge */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 gap-1">
                    <button
                      type="button"
                      onClick={() => setModalTab('view')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer",
                        modalTab === 'view'
                          ? "bg-white text-indigo-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" /> Contenido Pedagógico
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalTab('feedback')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer relative",
                        modalTab === 'feedback'
                          ? "bg-white text-indigo-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Auditoría y Observaciones
                      {activePlan.feedback && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <ScrollArea className="flex-1 h-full">
                  <div className="p-6 pb-12 space-y-6">
                    {modalTab === 'view' ? (
                      <>
                        {/* Status Alert if feedback exists */}
                        {activePlan.feedback && (
                          <div className={cn(
                            "p-4 rounded-xl border flex items-start gap-3 shadow-sm",
                            activePlan.status === 'approved'
                              ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                              : "bg-red-50/80 border-red-200 text-red-950"
                          )}>
                            {activePlan.status === 'approved' ? (
                              <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider mb-1">
                                {activePlan.status === 'approved' ? 'Observación de Aprobación (Coordinación)' : 'Observación para Ajuste Curricular'}
                              </h4>
                              <p className="text-xs font-semibold leading-relaxed">
                                "{activePlan.feedback}"
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Objectives Section */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                          <h4 className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Objetivos de Aprendizaje y Competencias
                          </h4>
                          <div className="space-y-2">
                            {activePlan.objectives.map((obj, idx) => (
                              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                  {idx + 1}
                                </span>
                                <p className="text-xs font-bold text-slate-800 leading-relaxed">{obj}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Methodology Section */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-600" /> Estrategia Metodológica y Didáctica
                          </h4>
                          <p className="text-xs font-semibold text-slate-700 leading-relaxed bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/80">
                            {activePlan.methodology}
                          </p>
                        </div>

                        {/* Activities Section */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-600" /> Secuencia Didáctica de Aula
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {activePlan.activities.map((act, idx) => {
                              const title = idx === 0 ? 'Fase de Inicio' : idx === 1 ? 'Fase de Desarrollo' : 'Fase de Cierre';
                              const color = idx === 0 ? 'border-amber-200 bg-amber-50/30' : idx === 1 ? 'border-indigo-200 bg-indigo-50/30' : 'border-emerald-200 bg-emerald-50/30';
                              const badge = idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800';
                              return (
                                <div key={idx} className={cn("p-3.5 rounded-xl border flex flex-col gap-2", color)}>
                                  <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded self-start tracking-wider", badge)}>
                                    {title}
                                  </span>
                                  <p className="text-xs font-bold text-slate-800 leading-relaxed">{act}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Evaluation and Resources */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Evaluación y Rúbricas
                            </h4>
                            <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                              {activePlan.evaluation}
                            </p>
                          </div>
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                              <Layers className="w-4 h-4 text-indigo-600" /> Materiales y TIC
                            </h4>
                            <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                              {activePlan.resources}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* AUDITORÍA Y OBSERVACIONES TAB */
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4.5 h-4.5 text-indigo-600" />
                            Retroalimentación Pedagógica del Coordinador
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            Escribe las observaciones metodológicas, ajustes requeridos en rúbrica o felicitaciones para el docente.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            Observaciones para el docente ({activePlan.teacher}):
                          </label>
                          <textarea
                            value={feedbackText}
                            onChange={e => setFeedbackText(e.target.value)}
                            placeholder="Ej. Excelente secuencia didáctica, pero se recomienda especificar adaptaciones curriculares para estudiantes con DUA en la fase de desarrollo..."
                            className="w-full border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-slate-800 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 min-h-[140px] shadow-sm resize-none transition-all"
                          />
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-slate-500 block mb-2 uppercase tracking-wide">
                            Etiquetas Rápidas de Auditoría (Haz clic para insertar):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              'Excelente propuesta metodológica',
                              'Faltan adaptaciones DUA',
                              'Detallar rúbrica de evaluación',
                              'Ajustar tiempos de la sesión',
                              'Incluir materiales TIC interactivos'
                            ].map((tag, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setFeedbackText(prev => prev ? `${prev} • ${tag}.` : `${tag}.`)}
                                className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200/60 transition-colors cursor-pointer"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Bottom Actions Footer */}
              <div className="bg-white px-6 py-4 border-t border-slate-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Estado de Auditoría:</span>
                  <span className={cn(
                    "text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block",
                    activePlan.status === 'pending' && "bg-amber-100 text-amber-800 border border-amber-200",
                    activePlan.status === 'approved' && "bg-emerald-100 text-emerald-800 border border-emerald-200",
                    activePlan.status === 'returned' && "bg-red-100 text-red-800 border border-red-200"
                  )}>
                    {activePlan.status === 'pending' ? 'Por Revisar' : activePlan.status === 'approved' ? 'Aprobada por Coordinación' : 'Devuelta con Observaciones'}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPlanModalOpen(false)}
                    className="text-xs font-bold rounded-xl px-4 cursor-pointer"
                  >
                    Cerrar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleReturnPlan()}
                    className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-extrabold text-xs rounded-xl px-4 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Devolver con Observación
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleApprovePlan()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl px-5 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar Planeación
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
