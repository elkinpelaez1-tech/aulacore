'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  PlusCircle,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  ChevronRight,
  ClipboardCheck,
  ShieldAlert,
  UserCheck,
  XCircle,
  Plus,
  RefreshCw,
  Eye,
  Check,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// ============================================================================
// DATA MODEL TYPES FOR THE ADMINISTRATIVE DASHBOARD
// ============================================================================
interface CRMItem {
  id: string;
  type: 'Certificado' | 'Documentos' | 'Traslado' | 'Datos' | 'Retiro';
  title: string;
  student: string;
  date: string;
  status: 'Pendiente' | 'En proceso' | 'Completado';
}

interface DocumentChecklist {
  studentId: string;
  studentName: string;
  registroCivil: 'Completo' | 'Pendiente' | 'Revisión';
  identidad: 'Completo' | 'Pendiente' | 'Revisión';
  eps: 'Completo' | 'Pendiente' | 'Revisión';
  foto: 'Completo' | 'Pendiente' | 'Revisión';
  certificados: 'Completo' | 'Pendiente' | 'Revisión';
}

interface SecretaryConsoleProps {
  enrolledStudents: any[];
  handleEnroll: (e: React.FormEvent) => void;
  newName: string;
  setNewName: (name: string) => void;
  newGrade: string;
  setNewGrade: (grade: string) => void;
  newEmail: string;
  setNewEmail: (email: string) => void;
  successMsg: string;
  handleGenerateCertificate: (studentName: string) => void;
  generatedCert: string;
}

export function SecretaryConsole({
  enrolledStudents,
  handleEnroll,
  newName,
  setNewName,
  newGrade,
  setNewGrade,
  newEmail,
  setNewEmail,
  successMsg,
  handleGenerateCertificate,
  generatedCert,
}: SecretaryConsoleProps) {
  
  // 1. Buscador Global Administrativo
  const [globalSearch, setGlobalSearch] = useState('');

  // Base de datos local e integrada de pre-registros (Aspirantes)
  const DEFAULT_PRE_REGISTRATIONS = [
    { fullName: 'Pedro Castro', nationalId: '10174125478', email: 'castrop@yahoo.es', gradeLevel: 'Bachillerato', registrationDate: '1 Jun 2026', status: 'Pre-matriculado' },
    { fullName: 'Andrés Felipe Gómez', nationalId: '1020485963', email: 'andres.gomez@gmail.com', gradeLevel: 'Media Técnica', registrationDate: '30 May 2026', status: 'Pre-matriculado' },
    { fullName: 'Laura Valentina Pérez', nationalId: '1018594032', email: 'laura.perez@outlook.com', gradeLevel: 'Primaria', registrationDate: '28 May 2026', status: 'Pre-matriculado' }
  ];

  const [preRegistrations, setPreRegistrations] = useState<any[]>([]);
  const [documentoId, setDocumentoId] = useState('');
  const [detectPreReg, setDetectPreReg] = useState(false);
  const [preRegAlert, setPreRegAlert] = useState('');

  useEffect(() => {
    let list = [...DEFAULT_PRE_REGISTRATIONS];
    const saved = localStorage.getItem('aulacore-pre-registrations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.forEach((item: any) => {
          if (!list.some(p => p.nationalId === item.nationalId)) {
            list.unshift(item);
          }
        });
      } catch (e) {}
    }
    setPreRegistrations(list);
  }, []);

  const handleLoadPreRegistration = (student: any) => {
    setNewName(student.fullName);
    setNewEmail(student.email);
    setDocumentoId(student.nationalId);
    
    let targetGrade = '10-A';
    if (student.gradeLevel === 'Bachillerato') targetGrade = '9-C';
    if (student.gradeLevel === 'Media Técnica') targetGrade = '10-A';
    if (student.gradeLevel === 'Preescolar' || student.gradeLevel === 'Primaria') targetGrade = '9-C';
    setNewGrade(targetGrade);
    
    setDetectPreReg(true);
    setPreRegAlert(`✨ Pre-registro detectado para ${student.fullName}. ¡Datos cargados en el formulario!`);
    setTimeout(() => setPreRegAlert(''), 4000);
  };

  const handleDocumentoChange = (val: string) => {
    setDocumentoId(val);
    const matched = preRegistrations.find(p => p.nationalId === val || p.fullName.toLowerCase() === val.toLowerCase());
    if (matched) {
      setNewName(matched.fullName);
      setNewEmail(matched.email);
      let targetGrade = '10-A';
      if (matched.gradeLevel === 'Bachillerato') targetGrade = '9-C';
      if (matched.gradeLevel === 'Media Técnica') targetGrade = '10-A';
      if (matched.gradeLevel === 'Preescolar' || matched.gradeLevel === 'Primaria') targetGrade = '9-C';
      setNewGrade(targetGrade);
      setDetectPreReg(true);
      setPreRegAlert(`✨ Pre-registro detectado para ${matched.fullName}. ¡Autocompletado listo!`);
      setTimeout(() => setPreRegAlert(''), 4000);
    } else {
      setDetectPreReg(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove matching student from the pending pre-registrations queue
    const matched = preRegistrations.find(p => p.nationalId === documentoId || p.fullName.toLowerCase() === newName.toLowerCase());
    if (matched) {
      const updated = preRegistrations.filter(p => p.nationalId !== matched.nationalId);
      setPreRegistrations(updated);
      localStorage.setItem('aulacore-pre-registrations', JSON.stringify(updated));
      
      const activeSession = localStorage.getItem('aulacore-onboarding-student');
      if (activeSession) {
        try {
          const parsed = JSON.parse(activeSession);
          if (parsed.nationalId === matched.nationalId) {
            localStorage.removeItem('aulacore-onboarding-student');
          }
        } catch (err) {}
      }
    }

    setDocumentoId('');
    setDetectPreReg(false);
    handleEnroll(e);
  };

  // 2. Estado de Trámites CRM de Trabajo
  const [crmFilter, setCrmFilter] = useState<'Todos' | 'Pendiente' | 'En proceso' | 'Completado'>('Todos');
  const [crmQueue, setCrmQueue] = useState<CRMItem[]>([
    { id: 'crm-1', type: 'Certificado', title: 'Certificado de Notas Oficial', student: 'Sofía Ortiz', date: '29 May', status: 'Pendiente' },
    { id: 'crm-2', type: 'Documentos', title: 'Falta Ficha de EPS Actualizada', student: 'Juan García', date: '28 May', status: 'En proceso' },
    { id: 'crm-3', type: 'Traslado', title: 'Solicitud de Traslado de Colegio', student: 'María López', date: '28 May', status: 'Pendiente' },
    { id: 'crm-4', type: 'Datos', title: 'Actualización de Dirección y Celular', student: 'Carlos Pérez', date: '27 May', status: 'Completado' },
    { id: 'crm-5', type: 'Retiro', title: 'Retiro Oficial por Traslado Familiar', student: 'Mateo Díaz', date: '26 May', status: 'Completado' },
    { id: 'crm-6', type: 'Certificado', title: 'Certificado de Matrícula Regular', student: 'Ana Torres', date: '25 May', status: 'Pendiente' }
  ]);

  // Cambiar estado in-situ en el CRM
  const cycleCrmStatus = (id: string) => {
    setCrmQueue(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus: Record<CRMItem['status'], CRMItem['status']> = {
          'Pendiente': 'En proceso',
          'En proceso': 'Completado',
          'Completado': 'Pendiente'
        };
        return { ...item, status: nextStatus[item.status] };
      }
      return item;
    }));
  };

  // 3. Gestión Documental Expediente Alumno Activo
  const [selectedStudentId, setSelectedStudentId] = useState('est-01'); // Sofía Ortiz por defecto
  const [documentDatabase, setDocumentDatabase] = useState<Record<string, DocumentChecklist>>({
    'est-01': { studentId: 'est-01', studentName: 'Sofía Ortiz', registroCivil: 'Completo', identidad: 'Completo', eps: 'Completo', foto: 'Completo', certificados: 'Revisión' },
    'est-02': { studentId: 'est-02', studentName: 'Juan García', registroCivil: 'Completo', identidad: 'Completo', eps: 'Pendiente', foto: 'Completo', certificados: 'Completo' },
    'est-03': { studentId: 'est-03', studentName: 'María López', registroCivil: 'Completo', identidad: 'Revisión', eps: 'Completo', foto: 'Completo', certificados: 'Completo' },
    'est-04': { studentId: 'est-04', studentName: 'Carlos Pérez', registroCivil: 'Completo', identidad: 'Completo', eps: 'Completo', foto: 'Completo', certificados: 'Completo' },
    'est-05': { studentId: 'est-05', studentName: 'Ana Torres', registroCivil: 'Pendiente', identidad: 'Completo', eps: 'Completo', foto: 'Revisión', certificados: 'Completo' }
  });

  // --- PERSISTENCE: LOCALSTORAGE Fallback ---
  useEffect(() => {
    const savedCrm = localStorage.getItem('aulacore_crm_queue');
    if (savedCrm) {
      try {
        setCrmQueue(JSON.parse(savedCrm));
      } catch (e) {
        console.warn('Error reading CRM from localStorage:', e);
      }
    }
    const savedDocDb = localStorage.getItem('aulacore_document_database');
    if (savedDocDb) {
      try {
        setDocumentDatabase(JSON.parse(savedDocDb));
      } catch (e) {
        console.warn('Error reading DocDb from localStorage:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aulacore_crm_queue', JSON.stringify(crmQueue));
  }, [crmQueue]);

  useEffect(() => {
    localStorage.setItem('aulacore_document_database', JSON.stringify(documentDatabase));
  }, [documentDatabase]);

  const activeDocChecklist = documentDatabase[selectedStudentId] || {
    studentId: selectedStudentId,
    studentName: 'Estudiante Seleccionado',
    registroCivil: 'Pendiente',
    identidad: 'Pendiente',
    eps: 'Pendiente',
    foto: 'Pendiente',
    certificados: 'Pendiente'
  };

  // Ciclar estado de documento
  const cycleDocStatus = (docKey: 'registroCivil' | 'identidad' | 'eps' | 'foto' | 'certificados') => {
    setDocumentDatabase(prev => {
      const studentData = prev[selectedStudentId] || {
        studentId: selectedStudentId,
        studentName: 'Estudiante Seleccionado',
        registroCivil: 'Pendiente',
        identidad: 'Pendiente',
        eps: 'Pendiente',
        foto: 'Pendiente',
        certificados: 'Pendiente'
      };
      
      const current = studentData[docKey];
      const nextStatus: Record<DocumentChecklist[typeof docKey], DocumentChecklist[typeof docKey]> = {
        'Completo': 'Revisión',
        'Revisión': 'Pendiente',
        'Pendiente': 'Completo'
      };
      
      return {
        ...prev,
        [selectedStudentId]: {
          ...studentData,
          [docKey]: nextStatus[current]
        }
      };
    });
  };

  // 4. Personal Docente Presente (Administrativo)
  const staffAttendance = {
    present: 18,
    absent: 2,
    excused: 1,
    medical: 1
  };

  const [staffLogs] = useState([
    { id: 'st-1', name: 'Lic. Carlos Martínez', role: 'Docente 10-A', status: 'Presente', time: '06:45 AM' },
    { id: 'st-2', name: 'Prof. Gómez', role: 'Docente Matemáticas', status: 'Presente', time: '06:50 AM' },
    { id: 'st-3', name: 'Dra. Diana Reyes', role: 'Docente Ciencias', status: 'Incapacidad', detail: 'Permiso Médico' },
    { id: 'st-4', name: 'Ing. Carlos León', role: 'Docente Tecnología', status: 'Presente', time: '06:55 AM' }
  ]);

  // 5. Agenda Escolar
  const [calendarEvents] = useState([
    { id: 'ev-1', date: 'Hoy • 02:00 PM', title: 'Cita con Acudiente Carlos Ortiz', type: 'Atención Padres' },
    { id: 'ev-2', date: 'Mañana • 08:30 AM', title: 'Reunión General de Personal Administrativo', type: 'Interno' },
    { id: 'ev-3', date: '05 Jun • 07:00 AM', title: 'Clausura de Boletines y Entrega P2', type: 'Académico' },
    { id: 'ev-4', date: '10 Jun • 09:00 AM', title: 'Auditoría Secretaría de Educación Sede Principal', type: 'Ministerio' }
  ]);

  // Filtros de búsqueda global
  const filteredCRM = crmQueue.filter(item => {
    const matchesSearch = item.student.toLowerCase().includes(globalSearch.toLowerCase()) ||
                          item.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
                          item.type.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesFilter = crmFilter === 'Todos' || item.status === crmFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredStudents = enrolledStudents.filter(student => {
    return student.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
           student.email.toLowerCase().includes(globalSearch.toLowerCase()) ||
           student.grade.toLowerCase().includes(globalSearch.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* =======================================================================
          1. CABECERA ORANGE ORIGINAL
          ======================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-700 via-orange-800 to-amber-700 p-6 rounded-2xl text-white shadow-lg border border-amber-600">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-200">Administración General</span>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Consola de Secretaría</h1>
          <p className="text-sm text-slate-300 mt-1">Control de admisiones, registro rápido de matrículas y expedición de certificados</p>
        </div>
      </div>

      {/* =======================================================================
          2. KPIs SUPERIORES COMPACTOS (4 TARJETAS)
          ======================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        
        {/* KPI: Matrículas Activas */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matrículas Activas</span>
            <Users className="w-4.5 h-4.5 text-orange-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800 tracking-tight">1,420</span>
            <p className="text-[9px] text-emerald-600 font-bold mt-1">↑ 2.4% este semestre</p>
          </div>
        </Card>

        {/* KPI: Solicitudes Pendientes */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Solicitudes Pendientes</span>
            <RefreshCw className="w-4.5 h-4.5 text-amber-500 animate-spin-slow" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800 tracking-tight">8</span>
            <p className="text-[9px] text-amber-600 font-bold mt-1">4 traslados • 4 retiros</p>
          </div>
        </Card>

        {/* KPI: Documentos por Validar */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documentos por Validar</span>
            <ClipboardCheck className="w-4.5 h-4.5 text-indigo-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800 tracking-tight">14</span>
            <p className="text-[9px] text-indigo-650 font-bold mt-1">Expedientes de matrícula en revisión</p>
          </div>
        </Card>

        {/* KPI: Certificados Emitidos */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certificados Emitidos</span>
            <FileText className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800 tracking-tight">5</span>
            <p className="text-[9px] text-emerald-600 font-bold mt-1">Emitidos hoy vía digital</p>
          </div>
        </Card>

      </div>

      {/* =======================================================================
          3. BUSCADOR GLOBAL ADMINISTRATIVO (CENTRO OPERATIVO)
          ======================================================================= */}
      <div className="relative group">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-orange-600 transition-all duration-200" />
        <Input
          placeholder="Buscar estudiante, acudiente, documento, certificado o matrícula..."
          className="pl-12 pr-4 h-12 bg-white hover:bg-white/80 border-slate-250 hover:border-slate-350 focus:border-orange-500 w-full rounded-2xl transition-all duration-300 shadow-xs hover:shadow-sm focus-visible:ring-2 focus-visible:ring-orange-500/20 text-xs sm:text-sm font-semibold placeholder:text-slate-400"
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
        />
      </div>

      {/* =======================================================================
          4. CORE GRID (2 COLUMNAS ADMINISTRATIVAS)
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA (CRM DE TRÁMITES Y MATRÍCULAS) - spans 2 */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* BANDEJA DE TRABAJO (CRM PENDIENTES) */}
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
            <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-orange-600" />
                  Bandeja de Trabajo (CRM de Trámites)
                </CardTitle>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">Control y estado de expedientes y solicitudes de familias.</p>
              </div>

              {/* Selector Filtros CRM */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                {['Todos', 'Pendiente', 'En proceso', 'Completado'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setCrmFilter(filter as any)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-md cursor-pointer transition border-none outline-none",
                      crmFilter === filter ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-850 bg-transparent"
                    )}
                  >
                    {filter === 'En proceso' ? 'En proceso' : filter}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto select-none">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-extrabold text-slate-700 text-xs pl-6">Trámite</TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-xs">Estudiante</TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-xs">Fecha</TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-xs">Estado</TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-xs pr-6 text-right">Acción Rápida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCRM.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-xs font-semibold text-slate-400">
                        No se encontraron trámites pendientes.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCRM.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-6 py-3.5">
                          <span className={cn(
                            "text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded border block w-fit",
                            item.type === 'Certificado' && "bg-blue-50 text-blue-700 border-blue-150",
                            item.type === 'Documentos' && "bg-indigo-50 text-indigo-700 border-indigo-150",
                            item.type === 'Traslado' && "bg-amber-50 text-amber-700 border-amber-150",
                            item.type === 'Datos' && "bg-purple-50 text-purple-700 border-purple-150",
                            item.type === 'Retiro' && "bg-rose-50 text-rose-700 border-rose-150"
                          )}>
                            {item.type}
                          </span>
                          <span className="font-bold text-slate-800 text-xs block mt-1">{item.title}</span>
                        </TableCell>
                        <TableCell className="font-bold text-slate-700 text-xs">{item.student}</TableCell>
                        <TableCell className="text-slate-450 font-bold text-xs">{item.date}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border inline-block",
                            item.status === 'Pendiente' && "bg-rose-50 text-rose-700 border-rose-150",
                            item.status === 'En proceso' && "bg-amber-50 text-amber-700 border-amber-150",
                            item.status === 'Completado' && "bg-emerald-50 text-emerald-700 border-emerald-150"
                          )}>
                            {item.status === 'En proceso' ? 'En Proceso' : item.status}
                          </span>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button
                            onClick={() => cycleCrmStatus(item.id)}
                            variant="outline"
                            size="sm"
                            className="rounded-lg h-7 font-extrabold text-[10px] border-slate-200 hover:bg-slate-50 text-slate-600 gap-1 ml-auto cursor-pointer"
                          >
                            Ciclar Estado <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* DIRECTORIO GENERAL DE MATRÍCULAS (HEREDADO) */}
          {generatedCert && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2 shadow-sm animate-bounce">
              <FileText className="w-5 h-5 text-blue-700 flex-shrink-0" />
              <span>{generatedCert}</span>
            </div>
          )}

          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
            <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Directorio General de Matrículas
                </CardTitle>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">Expedición de certificados oficiales inmediatos.</p>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30">
                    <TableHead className="font-extrabold text-slate-700 text-xs pl-6">Nombre</TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-xs">Grado</TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-xs">Correo Electrónico</TableHead>
                    <TableHead className="font-extrabold text-slate-700 text-xs pr-6 text-right">Trámites y Certificados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-xs font-semibold text-slate-400">
                        No se encontraron estudiantes registrados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => {
                      const isSelected = selectedStudentId === student.id;
                      return (
                        <TableRow 
                          key={student.id} 
                          className={cn(
                            "hover:bg-slate-50/50 transition-colors cursor-pointer",
                            isSelected && "bg-orange-50/30 hover:bg-orange-50/40"
                          )}
                          onClick={() => setSelectedStudentId(student.id)}
                        >
                          <TableCell className="font-bold text-slate-800 pl-6 text-xs sm:text-sm flex items-center gap-2">
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-orange-600 shrink-0" />}
                            {student.name}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-600">{student.grade}</TableCell>
                          <TableCell className="text-xs text-slate-500 font-medium">{student.email}</TableCell>
                          <TableCell className="pr-6 text-right">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateCertificate(student.name);
                              }}
                              variant="outline"
                              size="sm"
                              className="rounded-lg h-8 border-slate-200 hover:bg-slate-100 hover:text-orange-800 text-slate-750 font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                              Generar Certificado
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Grid de 2 columnas para Personal y Agenda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* CONTROL DE PERSONAL DOCENTE (SOLO ASISTENCIA ADMINISTRATIVA) */}
            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl select-none">
              <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5 text-orange-600" />
                  Control de Asistencia de Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                
                {/* Resumen numérico */}
                <div className="grid grid-cols-4 gap-2 bg-slate-50/50 border border-slate-150 rounded-xl p-2.5 text-center">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Presente</span>
                    <strong className="text-sm font-black text-emerald-600 mt-0.5 block">{staffAttendance.present}</strong>
                  </div>
                  <div className="border-l border-slate-150">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Ausente</span>
                    <strong className="text-sm font-black text-rose-600 mt-0.5 block">{staffAttendance.absent}</strong>
                  </div>
                  <div className="border-l border-slate-150">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Permiso</span>
                    <strong className="text-sm font-black text-purple-600 mt-0.5 block">{staffAttendance.excused}</strong>
                  </div>
                  <div className="border-l border-slate-150">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Incap.</span>
                    <strong className="text-sm font-black text-blue-600 mt-0.5 block">{staffAttendance.medical}</strong>
                  </div>
                </div>

                {/* Lista Personal */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {staffLogs.map((log) => (
                    <div key={log.id} className="p-2 border border-slate-100 rounded-xl bg-slate-50/30 flex items-center justify-between text-xs hover:border-slate-200 transition-colors">
                      <div>
                        <h5 className="font-extrabold text-slate-700 leading-tight">{log.name}</h5>
                        <span className="text-[9.5px] text-slate-450 font-bold block mt-0.5">{log.role}</span>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border inline-block shadow-3xs",
                          log.status === 'Presente' && "bg-emerald-50 text-emerald-700 border-emerald-250",
                          log.status === 'Incapacidad' && "bg-blue-50 text-blue-700 border-blue-250"
                        )}>
                          {log.status}
                        </span>
                        {log.time && <span className="text-[9.5px] text-slate-450 font-bold block mt-0.5">{log.time}</span>}
                      </div>
                    </div>
                  ))}
                </div>

              </CardContent>
            </Card>

            {/* AGENDA INSTITUCIONAL SIMPLE */}
            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl select-none">
              <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-orange-600" />
                  Agenda Institucional
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2.5">
                  {calendarEvents.map((ev) => (
                    <div key={ev.id} className="p-2.5 border border-slate-150 rounded-xl bg-slate-50/60 flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="overflow-hidden">
                        <span className="text-[8.5px] font-black text-indigo-650 uppercase tracking-wider block">{ev.date}</span>
                        <h5 className="font-bold text-slate-850 text-xs mt-0.5 leading-snug">{ev.title}</h5>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mt-1">{ev.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* COLUMNA DERECHA (MATRÍCULA RÁPIDA, GESTIÓN DOCUMENTAL, PERSONAL Y AGENDA) */}
        <div className="space-y-6">
          
          {/* COLA DE APROBACIÓN DE PRE-MATRÍCULAS */}
          <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50/20 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-650 animate-pulse" />
                Cola de Aprobación de Pre-Matrículas
              </h3>
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase">
                {preRegistrations.length} Pendientes
              </span>
            </div>
            
            <p className="text-[11px] text-slate-400 font-bold leading-normal">
              Aspirantes que completaron su pre-registro digital vía Enlace Mágico. Haz clic en "Cargar" para oficializar su matrícula.
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {preRegistrations.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  No hay pre-registros pendientes.
                </div>
              ) : (
                preRegistrations.map((student) => (
                  <div 
                    key={student.nationalId} 
                    className="p-3 border border-slate-150 rounded-xl bg-white hover:border-indigo-400 hover:shadow-xs transition duration-200 flex flex-col justify-between gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-850 text-xs leading-snug">{student.fullName}</h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">ID: {student.nationalId}</span>
                        <span className="text-[10px] text-slate-400 font-bold block">{student.email}</span>
                      </div>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border shadow-3xs shrink-0",
                        student.gradeLevel === 'Media Técnica' && "bg-amber-50 text-amber-700 border-amber-200",
                        student.gradeLevel === 'Bachillerato' && "bg-purple-50 text-purple-700 border-purple-200",
                        student.gradeLevel === 'Primaria' && "bg-blue-50 text-blue-700 border-blue-200",
                        student.gradeLevel === 'Preescolar' && "bg-pink-50 text-pink-700 border-pink-200",
                        student.gradeLevel === 'Otras' && "bg-slate-50 text-slate-700 border-slate-200"
                      )}>
                        {student.gradeLevel}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] font-bold">
                      <span className="text-slate-400">Registrado: {student.registrationDate}</span>
                      <button
                        type="button"
                        onClick={() => handleLoadPreRegistration(student)}
                        className="rounded-lg h-7 px-2.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-extrabold flex items-center gap-1 cursor-pointer transition text-[9.5px] outline-none"
                      >
                        Cargar Datos <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* MATRÍCULA RÁPIDA FORM (HEREDADO) */}
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-orange-600" />
                Admisión & Matrícula Rápida
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">Registra un nuevo alumno al sistema institucional.</p>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-bold p-3 rounded-lg animate-pulse">
                {successMsg}
              </div>
            )}

            {preRegAlert && (
              <div className="bg-indigo-50 border border-indigo-250 text-indigo-800 text-xs font-bold p-3 rounded-lg animate-pulse mb-3">
                {preRegAlert}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Documento de Identidad</label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    value={documentoId}
                    onChange={(e) => handleDocumentoChange(e.target.value)}
                    placeholder="Ej. 10174125478"
                    className="rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-semibold h-9.5 pr-20"
                  />
                  {detectPreReg && (
                    <span className="absolute right-2.5 top-2.5 bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-250 animate-pulse">
                      ✨ Pre-registro
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Nombre Completo</label>
                <Input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Mateo Vélez Castro"
                  className="rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-semibold h-9.5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Grado Académico</label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm bg-white font-semibold focus:ring-2 focus:ring-orange-200 focus:outline-none cursor-pointer"
                >
                  <option value="10-A">Décimo A (10-A)</option>
                  <option value="11-B">Undécimo B (11-B)</option>
                  <option value="9-C">Noveno C (9-C)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Correo Institucional</label>
                <Input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Ej. mateo.velez@aulacore.edu.co"
                  className="rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-semibold h-9.5"
                />
              </div>

              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl py-2.5 font-extrabold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition text-xs border-none outline-none">
                <Plus className="w-4 h-4" /> Completar Matrícula
              </Button>
            </form>
          </Card>

          {/* GESTIÓN DOCUMENTAL (CHECKLIST POR ESTUDIANTE SELECCIONADO) */}
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
                <ClipboardCheck className="w-4.5 h-4.5 text-orange-600" />
                Gestión Documental Matrícula
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 select-none">
              
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5">
                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">Expediente Alumno Activo</span>
                <span className="text-xs font-black text-slate-700 block mt-0.5 truncate">{activeDocChecklist.studentName}</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { key: 'registroCivil', label: 'Registro Civil' },
                  { key: 'identidad', label: 'Documento de Identidad' },
                  { key: 'eps', label: 'Certificado de EPS' },
                  { key: 'foto', label: 'Fotografía 3x4 Fondo Azul' },
                  { key: 'certificados', label: 'Certificados Académicos' }
                ].map((doc) => {
                  const status = activeDocChecklist[doc.key as keyof typeof activeDocChecklist];
                  return (
                    <div 
                      key={doc.key}
                      onClick={() => cycleDocStatus(doc.key as any)}
                      className="flex items-center justify-between p-2.5 border border-slate-100 hover:border-slate-200 bg-slate-50/30 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-750">{doc.label}</span>
                      <span className={cn(
                        "text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1",
                        status === 'Completo' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        status === 'Pendiente' && "bg-rose-50 text-rose-700 border-rose-200",
                        status === 'Revisión' && "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {status === 'Completo' ? <Check className="w-2.5 h-2.5" /> : status === 'Pendiente' ? <XCircle className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                        {status === 'Completo' ? 'Completo' : status === 'Pendiente' ? 'Pendiente' : 'Revisión'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[9px] text-slate-400 font-bold bg-slate-50 border border-slate-150 p-2.5 rounded-lg leading-tight">
                💡 Haz clic sobre el estado de cualquier documento en la lista para rotar su estado de validación.
              </p>

            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
