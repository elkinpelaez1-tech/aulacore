'use client';

import React, { useState, useEffect } from 'react';
import { OnboardingLinksPanel } from '@/components/settings/OnboardingLinksPanel';
import { PendingApprovalsQueue } from '@/components/settings/PendingApprovalsQueue';
import { 
  AUTOMATION_METRICS as INITIAL_METRICS, 
  MAGIC_LINKS as INITIAL_LINKS, 
  MagicLink, 
  PendingApproval,
  AttachedDocument
} from '@/lib/data/mock-settings';
import { 
  Wand2, Clock, CheckCircle2, UserPlus, ShieldAlert, 
  FileText, Copy, Mail, Calendar, Check, AlertCircle, RefreshCw, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  listOnboardingSubmissions, 
  approveOnboarding, 
  rejectOnboarding, 
  resendInvitation,
  TeacherOnboardingData 
} from '@/lib/services/teacher-onboarding';
import {
  listStudentOnboardings,
  approveStudentOnboarding,
  rejectStudentOnboarding,
  StudentOnboardingData
} from '@/lib/services/student-onboarding';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

type UnifiedOnboardingData = 
  | (TeacherOnboardingData & { onboardingType: 'Docente' })
  | (StudentOnboardingData & { onboardingType: 'Estudiante' });

export default function AutomatizacionPage() {
  const [magicLinks, setMagicLinks] = useState<MagicLink[]>(INITIAL_LINKS);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<UnifiedOnboardingData[]>([]);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLogsSubmission, setSelectedLogsSubmission] = useState<any | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

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

  const mapStudentToApproval = (s: StudentOnboardingData): PendingApproval => {
    const docs: AttachedDocument[] = [];
    if (s.foto_student_url) {
      docs.push({ id: 'fotoStudent', name: 'Foto_Estudiante.jpg', type: 'IMG', status: 'Pendiente', size: '1.2 MB', url: s.foto_student_url });
    }
    if (s.eps_card_url) {
      docs.push({ id: 'epsCard', name: 'Certificado_EPS.pdf', type: 'PDF', status: 'Pendiente', size: '2.4 MB', url: s.eps_card_url });
    }
    if (s.identity_doc_url) {
      docs.push({ id: 'identityDoc', name: 'Documento_Identidad.pdf', type: 'PDF', status: 'Pendiente', size: '1.8 MB', url: s.identity_doc_url });
    }
    if (s.notes_cert_url) {
      docs.push({ id: 'notesCert', name: 'Certificado_Notas.pdf', type: 'PDF', status: 'Pendiente', size: '3.1 MB', url: s.notes_cert_url });
    }
    if (s.paz_salvo_url) {
      docs.push({ id: 'pazSalvo', name: 'Paz_y_Salvo.pdf', type: 'PDF', status: 'Pendiente', size: '1.1 MB', url: s.paz_salvo_url });
    }
    if (s.medical_cert_url) {
      docs.push({ id: 'medicalCert', name: 'Certificado_Medico.pdf', type: 'PDF', status: 'Pendiente', size: '1.6 MB', url: s.medical_cert_url });
    }

    return {
      id: s.id!,
      name: s.student_name,
      email: `${s.student_name.toLowerCase().replace(/\s+/g, '') || 'estudiante'}@aulacore.edu.co`,
      type: 'Estudiante',
      submittedAt: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Reciente',
      status: 'pending_approval',
      documentStatus: docs.length > 0 ? 'Revisión Manual' : 'Faltante',
      documents: docs,
      riskScore: 5
    };
  };

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const teacherSubs = await listOnboardingSubmissions();
      const studentSubs = await listStudentOnboardings();

      const teachersWithType = teacherSubs.map(t => ({ ...t, onboardingType: 'Docente' as const }));
      const studentsWithType = studentSubs.map(s => ({ ...s, onboardingType: 'Estudiante' as const }));
      
      const combined = [...teachersWithType, ...studentsWithType].sort((a, b) => {
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });
      setAllSubmissions(combined);

      // Filter and map pending candidates for the queue
      const pendingTeachers = teacherSubs
        .filter(t => t.status === 'pending_approval')
        .map(mapOnboardingToApproval);

      const pendingStudents = studentSubs
        .filter(s => s.status === 'pending_approval')
        .map(mapStudentToApproval);

      const pendingCombined = [...pendingTeachers, ...pendingStudents];
      setPendingApprovals(pendingCombined);

      // Update KPIs dynamically
      const approvedTeachersCount = teacherSubs.filter(t => 
        ['invited', 'email_sent', 'activated', 'first_access'].includes(t.status || '')
      ).length;

      const approvedStudentsCount = studentSubs.filter(s => 
        ['invited', 'email_sent', 'activated', 'first_access'].includes(s.status || '')
      ).length;

      const totalApproved = approvedTeachersCount + approvedStudentsCount;
      const totalCount = teacherSubs.length + studentSubs.length;

      const totalActivated = teacherSubs.filter(t => t.status === 'activated' || t.status === 'first_access').length +
                             studentSubs.filter(s => s.status === 'activated' || s.status === 'first_access').length;

      setMetrics({
        profilesAutoGenerated: totalApproved,
        hoursSavedEstimated: totalApproved * 2,
        completionRate: totalCount > 0 
          ? Math.round((totalActivated / totalCount) * 100)
          : 0,
        pendingInterventions: pendingCombined.length
      });
    } catch (err: any) {
      console.error('Error fetching onboardings:', err);
      showToast('Error cargando solicitudes de Supabase', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleAddLink = (newLink: MagicLink) => {
    setMagicLinks(prev => [newLink, ...prev]);
    showToast(`Enlace "${newLink.name}" generado y copiado al portapapeles`, 'success');
  };

  const handleApprove = async (id: string, notes?: string) => {
    showToast('Aprobando candidato...', 'info');
    try {
      const institutionId = '11111111-1111-1111-1111-111111111111'; // Default active institution
      const approval = pendingApprovals.find(p => p.id === id);
      if (!approval) {
        showToast('Solicitud no encontrada en la cola', 'error');
        return;
      }

      if (approval.type === 'Docente') {
        const result = await approveOnboarding(id, institutionId);
        if (result.success) {
          showToast(`Docente aprobado con éxito. Cuenta Auth creada en Supabase.`, 'success');
          await loadSubmissions();
        } else {
          showToast(`Error al aprobar: ${result.error}`, 'error');
        }
      } else {
        const result = await approveStudentOnboarding(id, institutionId);
        if (result.success) {
          showToast(`Estudiante matriculado con éxito. Perfiles de acceso creados.`, 'success');
          await loadSubmissions();
        } else {
          showToast(`Error al matricular: ${result.error}`, 'error');
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Error: ${err.message || err}`, 'error');
    }
  };

  const handleReject = async (id: string, notes?: string) => {
    showToast('Rechazando candidato...', 'info');
    try {
      const approval = pendingApprovals.find(p => p.id === id);
      if (!approval) {
        showToast('Solicitud no encontrada', 'error');
        return;
      }

      if (approval.type === 'Docente') {
        const success = await rejectOnboarding(id);
        if (success) {
          showToast('Solicitud de onboarding de docente rechazada.', 'error');
          await loadSubmissions();
        }
      } else {
        const success = await rejectStudentOnboarding(id);
        if (success) {
          showToast('Solicitud de matrícula de estudiante rechazada.', 'error');
          await loadSubmissions();
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Error: ${err.message || err}`, 'error');
    }
  };

  const handleCorrectionNeeded = (id: string, notes?: string) => {
    showToast('Solicitud de corrección enviada al candidato.', 'info');
  };

  const handleUpdateDocumentStatus = (approvalId: string, docId: string, newStatus: 'Validado' | 'Pendiente' | 'Rechazado') => {
    setPendingApprovals(prev => prev.map(app => {
      if (app.id !== approvalId) return app;
      
      const updatedDocs = app.documents.map(d => {
        if (d.id !== docId) return d;
        return { ...d, status: newStatus };
      });
      
      // Determine overall document status
      let documentStatus: 'Validado' | 'Faltante' | 'Revisión Manual' = 'Revisión Manual';
      const allValid = updatedDocs.every(d => d.status === 'Validado');
      const anyRejected = updatedDocs.some(d => d.status === 'Rechazado');
      
      if (updatedDocs.length === 0) {
        documentStatus = 'Faltante';
      } else if (allValid) {
        documentStatus = 'Validado';
      }

      return {
        ...app,
        documents: updatedDocs,
        documentStatus
      };
    }));
    showToast(`Estado del documento actualizado a ${newStatus}.`, 'success');
  };

  const handleSaveObservations = (id: string, observations: string) => {
    setPendingApprovals(prev => prev.map(app => {
      if (app.id !== id) return app;
      return {
        ...app,
        observations
      };
    }));
    showToast(`Observación guardada para el registro.`, 'success');
  };

  const handleResend = async (id: string) => {
    showToast('Reenviando invitación...', 'info');
    try {
      const result = await resendInvitation(id);
      if (result.success) {
        showToast('Invitación reenviada con éxito por correo.', 'success');
        await loadSubmissions();
      } else {
        showToast(`Error: ${result.error}`, 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Error: ${err.message || err}`, 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Enlace de activación copiado al portapapeles', 'success');
  };

  return (
    <div className="py-6 space-y-6 max-w-6xl mx-auto animate-in fade-in relative">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Automatización & Aprobaciones</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Centro de administración de onboarding de docentes y enlaces de incorporación.
          </p>
        </div>
        <button 
          onClick={loadSubmissions}
          className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white shadow-sm cursor-pointer"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Refrescar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <UserPlus className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Perfiles Autogenerados</h3>
          </div>
          <p className="text-3xl font-black text-slate-800 transition-all duration-300">
            {loading ? '...' : metrics.profilesAutoGenerated}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Clock className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Horas Ahorradas</h3>
          </div>
          <p className="text-3xl font-black text-slate-800 transition-all duration-300">
            {loading ? '...' : `${metrics.hoursSavedEstimated}h`}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tasa de Completitud</h3>
          </div>
          <p className="text-3xl font-black text-slate-800">
            {loading ? '...' : `${metrics.completionRate}%`}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 shadow-sm text-white flex flex-col justify-center transition-all duration-300">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-100 mb-1">Requieren Aprobación</h3>
          <p className="text-4xl font-black leading-none">
            {loading ? '...' : pendingApprovals.length}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[600px]">
        <div className="h-full">
          <OnboardingLinksPanel 
            magicLinks={magicLinks} 
            onAddLink={handleAddLink} 
          />
        </div>
        <div className="h-full">
          <PendingApprovalsQueue 
            pendingApprovals={pendingApprovals} 
            onApprove={handleApprove}
            onReject={handleReject}
            onCorrectionNeeded={handleCorrectionNeeded}
            onUpdateDocumentStatus={handleUpdateDocumentStatus}
            onSaveObservations={handleSaveObservations}
          />
        </div>
      </div>

      {/* Onboarding Audit Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col mt-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              📂 Panel de Auditoría General de Onboardings
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Registro histórico completo del proceso de incorporación docente en Supabase.
            </p>
          </div>
          <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase">
            {allSubmissions.length} registros totales
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="p-4">Docente / Candidato</th>
                <th className="p-4">Asignación Propuesta</th>
                <th className="p-4">Fecha Registro</th>
                <th className="p-4">Estado Ciclo de Vida</th>
                <th className="p-4">Soportes</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-450 font-medium">
                    Cargando historial de Supabase...
                  </td>
                </tr>
              ) : allSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-450 font-medium">
                    No hay registros de docentes cargados en la base de datos de onboarding.
                  </td>
                </tr>
              ) : (
                allSubmissions.map((sub) => {
                  const isStudent = sub.onboardingType === 'Estudiante';
                  const teacherSub = !isStudent ? (sub as TeacherOnboardingData) : null;
                  const studentSub = isStudent ? (sub as StudentOnboardingData) : null;

                  const name = studentSub ? studentSub.student_name : (teacherSub?.full_name || '');
                  const email = studentSub 
                    ? `${studentSub.student_name.toLowerCase().replace(/\s+/g, '') || 'estudiante'}@aulacore.edu.co` 
                    : (teacherSub?.email || '');
                  const docId = studentSub ? studentSub.student_id : (teacherSub?.document_id || '');
                  const photoUrl = studentSub ? studentSub.foto_student_url : teacherSub?.foto_url;
                  
                  const assignment = studentSub 
                    ? `Matrícula: ${studentSub.tipo_matricula || 'Ordinaria'}` 
                    : (teacherSub?.subject_area || 'Por definir');
                  const assignmentDetails = `${sub.sede || 'Sede Principal'} • ${sub.jornada || 'N/A'}`;

                  const supports = studentSub 
                    ? [
                        { label: 'EPS', url: studentSub.eps_card_url, title: 'Carnet EPS' },
                        { label: 'Documento', url: studentSub.identity_doc_url, title: 'Documento de Identidad' },
                        { label: 'Notas', url: studentSub.notes_cert_url, title: 'Certificado de Notas' },
                        { label: 'Paz y Salvo', url: studentSub.paz_salvo_url, title: 'Paz y Salvo' },
                        { label: 'Médico', url: studentSub.medical_cert_url, title: 'Certificado Médico' }
                      ].filter(d => d.url)
                    : [
                        { label: 'HV', url: teacherSub?.cv_url, title: 'Ver Hoja de Vida' },
                        { label: 'Diploma', url: teacherSub?.diploma_url, title: 'Ver Diploma' },
                        { label: 'CC', url: teacherSub?.identity_doc_url, title: 'Ver Cédula' }
                      ].filter(d => d.url);

                  const emailLogs = teacherSub?.email_logs || [];
                  const hasEmailLogs = !isStudent && emailLogs.length > 0;
                  const hasActivationLink = !isStudent && !!teacherSub?.activation_link;
                  const canResend = !isStudent && ['invited', 'email_sent'].includes(sub.status || '');

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Candidate basic info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {photoUrl ? (
                            <img 
                              src={photoUrl} 
                              alt={name} 
                              className="w-8 h-8 rounded-full object-cover border border-indigo-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-black flex items-center justify-center border border-indigo-100 text-[10px] uppercase">
                              {name ? name.substring(0, 2) : 'ON'}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-extrabold text-slate-800 leading-tight">{name}</p>
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                                isStudent ? "bg-purple-100 text-purple-800 border border-purple-200" : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                              )}>
                                {sub.onboardingType}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{email} &bull; C.C. {docId}</p>
                          </div>
                        </div>
                      </td>

                      {/* proposed assignment */}
                      <td className="p-4">
                        <div>
                          <p className="text-slate-800 font-extrabold">{assignment}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{assignmentDetails}</p>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4 font-mono text-[10px] text-slate-500">
                        {sub.created_at ? new Date(sub.created_at).toLocaleString() : 'N/A'}
                      </td>

                      {/* Process state */}
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                          sub.status === 'pending_approval' && "bg-amber-100 text-amber-800 border border-amber-200",
                          sub.status === 'invited' && "bg-indigo-100 text-indigo-800 border border-indigo-250",
                          sub.status === 'email_sent' && "bg-blue-100 text-blue-800 border border-blue-250",
                          sub.status === 'activated' && "bg-emerald-100 text-emerald-800 border border-emerald-250",
                          sub.status === 'first_access' && "bg-emerald-500 text-white shadow-sm",
                          sub.status === 'rejected' && "bg-rose-100 text-rose-800 border border-rose-250"
                        )}>
                          {sub.status === 'pending_approval' ? 'Pendiente Aprobación' :
                           sub.status === 'invited' ? 'Invitado a Activar' :
                           sub.status === 'email_sent' ? 'Invitación Enviada' :
                           sub.status === 'activated' ? 'Cuenta Activada' :
                           sub.status === 'first_access' ? 'Primer Acceso Exitoso' : 
                           sub.status === 'rejected' ? 'Rechazado' : sub.status}
                        </span>
                      </td>

                      {/* Supports grid */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {supports.map((doc, idx) => (
                            <a 
                              key={idx} 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[9px] font-bold text-slate-600 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm transition-all" 
                              title={doc.title}
                            >
                              <FileText className="w-2.5 h-2.5" /> {doc.label}
                            </a>
                          ))}
                          {supports.length === 0 && (
                            <span className="text-[10px] text-slate-400 font-semibold italic">Sin soportes</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {hasActivationLink && (
                            <button 
                              onClick={() => copyToClipboard(teacherSub!.activation_link!)}
                              className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-650 transition-all cursor-pointer shadow-sm"
                              title="Copiar Link de Activación"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canResend && (
                            <button 
                              onClick={() => handleResend(sub.id!)}
                              className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-indigo-650 transition-all cursor-pointer shadow-sm"
                              title="Reenviar Correo de Activación"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {hasEmailLogs && (
                            <button 
                              onClick={() => setSelectedLogsSubmission(sub)}
                              className="p-1.5 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 rounded-lg text-slate-650 transition-all cursor-pointer shadow-sm text-[10px] font-bold flex items-center gap-1"
                              title="Ver bitácora de correos"
                            >
                              <span>📬 Logs</span> 
                              <span className="bg-indigo-100 text-indigo-800 rounded px-1 text-[9px] font-black">{emailLogs.length}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Logs Modal Dialog */}
      {selectedLogsSubmission && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
                  📬 Bitácora de Correos de Onboarding
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
                  Auditoría de correspondencia para {selectedLogsSubmission.full_name}
                </p>
              </div>
              <button 
                onClick={() => setSelectedLogsSubmission(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-450 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {Array.isArray(selectedLogsSubmission.email_logs) && selectedLogsSubmission.email_logs.map((log: any, idx: number) => (
                <div key={log.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="flex justify-between items-start border-b border-slate-200/50 pb-2">
                    <div>
                      <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                        ID: {log.id}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 mt-1.5 leading-snug">{log.subject}</h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {new Date(log.sentAt).toLocaleString()}
                    </span>
                  </div>
                  <pre className="text-[11px] font-medium text-slate-650 font-mono whitespace-pre-wrap leading-relaxed bg-white border border-slate-100 rounded-xl p-3 shadow-inner">
                    {log.body}
                  </pre>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg w-max shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Estado: {log.status}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4 text-right">
              <button 
                onClick={() => setSelectedLogsSubmission(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black uppercase text-slate-700 tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts container */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={cn(
              "px-4 py-3 rounded-xl shadow-lg border text-xs font-bold pointer-events-auto flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300 bg-white",
              toast.type === 'success' ? "border-emerald-200 text-emerald-800 bg-emerald-50/90 backdrop-blur-sm" :
              toast.type === 'error' ? "border-rose-200 text-rose-800 bg-rose-50/90 backdrop-blur-sm" :
              "border-slate-200 text-slate-800 bg-slate-50/90 backdrop-blur-sm"
            )}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {toast.type === 'error' && <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />}
            {toast.message}
          </div>
        ))}
      </div>

    </div>
  );
}
