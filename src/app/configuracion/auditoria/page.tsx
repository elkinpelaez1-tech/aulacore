'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  listOnboardingSubmissions, approveOnboarding, rejectOnboarding, resendInvitation 
} from '@/lib/services/teacher-onboarding';
import { 
  listStudentOnboardings, approveStudentOnboarding, rejectStudentOnboarding 
} from '@/lib/services/student-onboarding';
import { 
  ShieldAlert, RefreshCw, CheckCircle2, XCircle, Mail, AlertCircle 
} from 'lucide-react';

export default function OnboardingAuditoriaPage() {
  const { roles, activeRole, institutionId } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // States for data
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Access Control check
  const isSuperAdmin = activeRole === 'super_admin' || (roles as string[])?.includes('super_admin') || (typeof window !== 'undefined' && localStorage.getItem('aulacore-user-role') === 'super_admin') || false;

  useEffect(() => {
    if (isSuperAdmin) {
      loadData();
    }
  }, [isSuperAdmin]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const teacherList = await listOnboardingSubmissions();
      const studentList = await listStudentOnboardings();
      setTeachers(teacherList);
      setStudents(studentList);
    } catch (err: any) {
      console.error(err);
      setError('Error al conectar con la base de datos de Onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTeacher = async (id: string) => {
    setLoading(true);
    try {
      const activeInstId = institutionId || '11111111-1111-1111-1111-111111111111';
      const res = await approveOnboarding(id, activeInstId);
      if (res.success) {
        setSuccess('Docente aprobado. Enlace de activación generado e invitación enviada.');
        await loadData();
      } else {
        setError(res.error || 'Error al aprobar el docente.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error durante la aprobación.');
    } finally {
      setLoading(false);
      setTimeout(() => { setSuccess(null); setError(null); }, 4000);
    }
  };

  const handleRejectTeacher = async (id: string) => {
    setLoading(true);
    try {
      await rejectOnboarding(id);
      setSuccess('Docente rechazado.');
      await loadData();
    } catch (err: any) {
      console.error(err);
      setError('Error al rechazar el docente.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleResendTeacherInvitation = async (id: string) => {
    setLoading(true);
    try {
      const res = await resendInvitation(id);
      if (res.success) {
        setSuccess('Recordatorio de invitación enviado con éxito.');
      } else {
        setError(res.error || 'Error al reenviar invitación.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Error al reenviar.');
    } finally {
      setLoading(false);
      setTimeout(() => { setSuccess(null); setError(null); }, 4000);
    }
  };

  const handleApproveStudent = async (id: string) => {
    setLoading(true);
    try {
      const activeInstId = institutionId || '11111111-1111-1111-1111-111111111111';
      const res = await approveStudentOnboarding(id, activeInstId);
      if (res.success) {
        setSuccess('Estudiante aprobado y matriculado con éxito en AulaCore.');
        await loadData();
      } else {
        setError(res.error || 'Error al aprobar estudiante.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error durante la aprobación.');
    } finally {
      setLoading(false);
      setTimeout(() => { setSuccess(null); setError(null); }, 4000);
    }
  };

  const handleRejectStudent = async (id: string) => {
    setLoading(true);
    try {
      await rejectStudentOnboarding(id);
      setSuccess('Solicitud de estudiante rechazada.');
      await loadData();
    } catch (err: any) {
      console.error(err);
      setError('Error al rechazar.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <Card className="max-w-md mx-auto mt-12 border-red-200 bg-white p-6 text-center shadow-lg rounded-2xl">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Acceso Restringido</h3>
          <p className="text-sm text-slate-500 mt-2">
            Solo el rol de Super Administrador dispone de los privilegios inmutables para auditar onboardings y activaciones de cuentas globales.
          </p>
          <Button onClick={() => router.push('/dashboard')} className="mt-6 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 px-4 rounded-xl">
            Volver al Inicio
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-650" />
            Panel de Auditoría de Onboarding & Invitaciones
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Monitoree la cola de aprobaciones, links de invitación, primer acceso y estados de activación.
          </p>
        </div>
        <div>
          <Button 
            variant="outline"
            onClick={loadData}
            disabled={loading}
            className="text-slate-650 border-slate-200 hover:bg-slate-50 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar Datos
          </Button>
        </div>
      </div>

      {success && (
        <Card className="border-emerald-250 bg-emerald-50/40 p-4 rounded-2xl flex items-center gap-3 text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold">{success}</span>
        </Card>
      )}

      {error && (
        <Card className="border-red-250 bg-red-50/40 p-4 rounded-2xl flex items-center gap-3 text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold">{error}</span>
        </Card>
      )}

      {/* TABS OF TEACHERS AND STUDENTS ONBOARDING */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* COLA DE DOCENTES */}
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="py-4.5 border-b border-slate-100 bg-slate-50/30">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-800">
              Cola de Onboarding de Docentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/40">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-slate-500 h-11">Docente / Cédula</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 h-11">Correo / Teléfono</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 h-11">Área Académica</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 h-11">Estado</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 h-11">Link de Invitación</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 h-11 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-xs font-bold text-slate-400">
                        No hay solicitudes de docentes registradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    teachers.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="py-3">
                          <span className="text-xs font-bold text-slate-800 block">{t.full_name}</span>
                          <span className="text-[10px] font-mono text-slate-450 block">{t.document_id}</span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-xs font-semibold text-slate-700 block">{t.email}</span>
                          <span className="text-[10px] text-slate-450 block">{t.phone}</span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-xs font-semibold text-slate-655">{t.subject_area || 'Por asignar'}</span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            t.status === 'activated' || t.status === 'first_access' ? 'bg-emerald-100 text-emerald-850' :
                            t.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            t.status === 'invited' || t.status === 'email_sent' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-650'
                          }`}>
                            {t.status === 'activated' ? 'Activado' : 
                             t.status === 'first_access' ? 'Acceso Inicial' :
                             t.status === 'invited' || t.status === 'email_sent' ? 'Invitado' :
                             t.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 max-w-xs truncate">
                          {t.activation_link ? (
                            <a href={t.activation_link} target="_blank" rel="noreferrer" className="text-xs font-mono text-indigo-650 hover:underline">
                              {t.activation_link}
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold italic">No generado</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {t.status === 'pending_approval' && (
                              <>
                                <Button 
                                  onClick={() => handleApproveTeacher(t.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 h-7 rounded-lg border-none cursor-pointer flex items-center gap-0.5"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Aprobar
                                </Button>
                                <Button 
                                  onClick={() => handleRejectTeacher(t.id)}
                                  className="bg-red-650 hover:bg-red-700 text-white text-[10px] font-bold px-2 py-1 h-7 rounded-lg border-none cursor-pointer flex items-center"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                            {(t.status === 'invited' || t.status === 'email_sent' || t.status === 'activated') && (
                              <Button 
                                onClick={() => handleResendTeacherInvitation(t.id)}
                                className="bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 h-7 rounded-lg border-none cursor-pointer flex items-center gap-1"
                              >
                                <Mail className="w-3 h-3" />
                                Reenviar Correo
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* COLA DE ESTUDIANTES */}
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="py-4.5 border-b border-slate-100 bg-slate-50/30">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-800">
              Cola de Onboarding de Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/40">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-slate-500 h-11">Estudiante / Código</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 h-11">Sede / Jornada</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 h-11">Acudiente</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 h-11">Estado</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 h-11 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-xs font-bold text-slate-400">
                        No hay solicitudes de estudiantes registradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="py-3">
                          <span className="text-xs font-bold text-slate-800 block">{s.student_name}</span>
                          <span className="text-[10px] font-mono text-slate-450 block">{s.student_id}</span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-xs font-semibold text-slate-700 block">{s.sede || 'Principal'}</span>
                          <span className="text-[10px] text-slate-455 block">{s.jornada || 'Mañana'}</span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-xs font-semibold text-slate-700 block">{s.primary_guardian || 'No reportado'}</span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            s.status === 'activated' || s.status === 'first_access' ? 'bg-emerald-100 text-emerald-850' :
                            s.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            s.status === 'invited' || s.status === 'email_sent' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-650'
                          }`}>
                            {s.status === 'activated' ? 'Activado' : 
                             s.status === 'first_access' ? 'Acceso Inicial' :
                             s.status === 'invited' || s.status === 'email_sent' ? 'Invitado' :
                             s.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {s.status === 'pending_approval' && (
                              <>
                                <Button 
                                  onClick={() => handleApproveStudent(s.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 h-7 rounded-lg border-none cursor-pointer flex items-center gap-0.5"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Matricular
                                </Button>
                                <Button 
                                  onClick={() => handleRejectStudent(s.id)}
                                  className="bg-red-650 hover:bg-red-700 text-white text-[10px] font-bold px-2 py-1 h-7 rounded-lg border-none cursor-pointer flex items-center"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
