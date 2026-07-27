'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/layout';
import { ParentDashboard } from '@/components/dashboard/parent/ParentDashboard';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  BookOpen,
  BarChart3,
  CalendarCheck,
  CheckCircle,
  AlertTriangle,
  Award,
  FileText,
  QrCode,
  PlusCircle,
  Clock,
  UserPlus,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  MessageSquareWarning,
  Eye,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  MessageSquare,
  FileSignature,
  CheckCheck,
  ShieldAlert,
  AlertCircle,
  Search,
  FileCheck,
  Printer
} from 'lucide-react';
import { useRole } from '@/providers/role-provider';
import {
  MOCK_STUDENTS,
  MOCK_ALERTS,
  MOCK_BEHAVIOR,
  MOCK_GRADES,
  MOCK_TEACHERS,
  MOCK_COURSES,
} from '@/services/mock-data';

import { Student, Alert, BehaviorRecord, GradeRecord } from '@/types';
import { cn } from '@/lib/utils';
import Student360 from '@/components/dashboard/Student360';
import GroupDirectorConsole from '@/components/dashboard/GroupDirectorConsole';
import { CoordinatorConsole } from '@/components/dashboard/CoordinatorConsole';
import { CurriculumBuilder } from '@/components/dashboard/CurriculumBuilder';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { DocumentEngine, DocumentType } from '@/components/document-engine/DocumentEngine';
import { SecretaryConsole } from '@/components/dashboard/SecretaryConsole';
import { RectorExecutiveSummary } from '@/components/dashboard/RectorExecutiveSummary';

export default function DashboardPage() {
  const { userRole, userName } = useRole();

  // --- ESTADOS DE CONTROL DE PERIODO ACADÉMICO ---
  const [periodStatus, setPeriodStatus] = useState<'abierto' | 'en_revisión' | 'cerrado' | 'publicado'>('abierto');

  // --- ESTADOS RECTORES ADICIONALES (Power BI & ERP) ---
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-I');
  const [rectorTab, setRectorTab] = useState<'institutional' | 'student360' | 'audit_vault'>('institutional');

  // --- ESTADOS DE GENERACIÓN DOCUMENTAL (DocumentEngine Layer) ---
  const [isDocEngineOpen, setIsDocEngineOpen] = useState(false);
  const [docEngineType, setDocEngineType] = useState<DocumentType>('academic_report');
  const [docEngineStudentId, setDocEngineStudentId] = useState('77777777-7777-7777-7777-777777777777');
  const [docEngineStudentName, setDocEngineStudentName] = useState('Alejandro Ortiz');
  const [docEngineCourseName, setDocEngineCourseName] = useState('Grado Décimo A (10-A)');
  const [docEngineMetadata, setDocEngineMetadata] = useState<Record<string, any>>({});
  
  const [showCurriculumBuilder, setShowCurriculumBuilder] = useState(false);
  
  // Buscador de verificación rápida de Rector
  const [searchVerifyCode, setSearchVerifyCode] = useState('');

  // --- ESTADOS DE PRE-REGISTRO PARA RECTORÍA ---
  const [rectorSearchQuery, setRectorSearchQuery] = useState('');
  const [rectorPreRegistrations, setRectorPreRegistrations] = useState<any[]>([]);

  React.useEffect(() => {
    const loadPreRegs = () => {
      let list: any[] = [];
      const saved = localStorage.getItem('aulacore-pre-registrations');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            list = parsed;
          }
        } catch (e) {}
      }
      setRectorPreRegistrations(list);
    };

    loadPreRegs();

    // Sincronizar en caliente si cambia en otra pestaña o componente
    window.addEventListener('storage', loadPreRegs);
    
    // Sondeo de sincronización local
    const interval = setInterval(loadPreRegs, 2000);

    return () => {
      window.removeEventListener('storage', loadPreRegs);
      clearInterval(interval);
    };
  }, []);

  const filteredRectorPreRegs = rectorPreRegistrations.filter(p => {
    if (!rectorSearchQuery.trim()) return true;
    const query = rectorSearchQuery.toLowerCase();
    return p.fullName.toLowerCase().includes(query) ||
           p.nationalId.includes(query) ||
           p.email.toLowerCase().includes(query) ||
           (p.gradeLevel && p.gradeLevel.toLowerCase().includes(query));
  });

  // --- ESTADOS INTERACTIVOS PARA DEMO SaaS PREMIUM ---
  
  // 1. Asistencia en caliente (Director de Grupo)
  const [attendanceList, setAttendanceList] = useState<Record<string, 'Asiste' | 'Falta' | 'Tarde'>>({
    'est-01': 'Asiste',
    'est-02': 'Tarde',
    'est-03': 'Asiste',
    'est-04': 'Falta',
    'est-05': 'Asiste',
  });

  const toggleAttendance = (studentId: string, status: 'Asiste' | 'Falta' | 'Tarde') => {
    // Si el periodo está cerrado o en revisión, bloquear modificaciones de asistencia
    if (periodStatus !== 'abierto') {
      alert(`La asistencia está congelada. No se permiten modificaciones cuando el período está en estado: ${periodStatus.toUpperCase()}`);
      return;
    }
    setAttendanceList(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // 2. Observador Estudiantil (Director de Grupo)
  const [behaviorRecords, setBehaviorRecords] = useState<BehaviorRecord[]>([]);
  const [newObsStudentId, setNewObsStudentId] = useState('est-02');
  const [newObsType, setNewObsType] = useState<'Positiva' | 'Leve' | 'Grave' | 'Gravísima'>('Leve');
  const [newObsDesc, setNewObsDesc] = useState('');

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObsDesc.trim()) return;

    const MOCK_STUDENTS: any[] = [];
    const studentObj = MOCK_STUDENTS.find(s => s.id === newObsStudentId);
    const newRecord: BehaviorRecord = {
      id: `beh-${Date.now()}`,
      studentId: newObsStudentId,
      studentName: studentObj?.name,
      date: new Date().toISOString().split('T')[0],
      type: newObsType,
      description: newObsDesc,
      observerName: userName,
      status: 'Registrado',
    };

    setBehaviorRecords([newRecord, ...behaviorRecords]);
    setNewObsDesc('');
  };

  // 3. Planilla de Notas (Docente)
  const [gradesList, setGradesList] = useState<GradeRecord[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<'Matemáticas' | 'Ciencias Naturales y Educación Ambiental'>('Matemáticas');
  const [newGradeValue, setNewGradeValue] = useState<Record<string, string>>({});

  const handleUpdateGrade = (studentId: string, noteType: 'exams' | 'homeworks' | 'participation', index: number, value: string) => {
    if (periodStatus !== 'abierto') {
      alert(`Edición bloqueada. No se pueden modificar calificaciones porque el período actual se encuentra en estado: ${periodStatus.toUpperCase()}`);
      return;
    }

    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal < 1.0 || numVal > 10.0) return;

    // Obtener la nota anterior para auditoría
    const record = gradesList.find(g => g.studentId === studentId && g.subject === selectedSubject);
    const previousNotes = record ? record.notes[noteType] : [];
    const previousVal = previousNotes[index] || 0;

    setGradesList(prev => prev.map(grade => {
      if (grade.studentId === studentId && grade.subject === selectedSubject) {
        const updatedNotes = { ...grade.notes };
        updatedNotes[noteType] = [...updatedNotes[noteType]];
        updatedNotes[noteType][index] = numVal;

        // Calcular nuevo promedio ponderado
        const avgExams = updatedNotes.exams.reduce((a, b) => a + b, 0) / updatedNotes.exams.length;
        const avgHomeworks = updatedNotes.homeworks.reduce((a, b) => a + b, 0) / updatedNotes.homeworks.length;
        const avgPart = updatedNotes.participation.reduce((a, b) => a + b, 0) / updatedNotes.participation.length;
        const finalGrade = Math.round((avgExams * 0.3 + avgHomeworks * 0.4 + avgPart * 0.3) * 10) / 10;

        // Insertar log de auditoría real en Supabase para grade_audit_logs
        supabase.from('grade_audit_logs').insert({
          student_id: studentId === 'est-01' ? '77777777-7777-7777-7777-777777777777' :
                      studentId === 'est-02' ? '88888888-8888-8888-8888-888888888888' :
                      '99999999-9999-9999-9999-999999999999',
          subject: selectedSubject,
          academic_period_id: '22222222-2222-2222-2222-333333333333', // Periodo P2
          previous_grade: previousVal,
          new_grade: numVal,
          changed_by: '44444444-4444-4444-4444-444444444444', // Profesor Gómez
          change_reason: 'Actualización ordinaria de planilla docente'
        }).then(({ error }: any) => {
          if (error) console.error('Error escribiendo log de auditoría:', error);
          else console.log('Audit log registrado en Supabase.');
        });

        return {
          ...grade,
          notes: updatedNotes,
          finalGrade
        };
      }
      return grade;
    }));
  };

  // 4. Matrícula Rápida (Secretaría)
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('10-A');
  const [newEmail, setNewEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newStudent: Student = {
      id: `est-${Date.now()}`,
      name: newName,
      grade: newGrade,
      email: newEmail,
      status: 'Activo',
      attendanceRate: 100.0,
      gpa: 10.0,
      behaviorScore: 10.0,
      academicRisk: 'Bajo',
      dropoutRisk: 'Bajo',
      parentsName: 'Padre Acudiente',
      parentsPhone: '+57 300 000 0000',
    };

    setEnrolledStudents([...enrolledStudents, newStudent]);
    setNewName('');
    setNewEmail('');
    setSuccessMsg('¡Estudiante matriculado con éxito en el sistema!');
  };

  // --- ESTADOS DE COMUNICACIÓN BIDIRECCIONAL (Padre de Familia) ---
  const [parentMessages, setParentMessages] = useState<any[]>([]);
  const [parentReplyText, setParentReplyText] = useState<Record<string, string>>({});
  const [salidaSigned, setSalidaSigned] = useState(false);
  const [actaConciliacionSigned, setActaConciliacionSigned] = useState(false);

  // Carga reactiva de los mensajes de trazabilidad para el acudiente
  React.useEffect(() => {
    if (userRole !== 'padre_familia') return;

    // Determinar ID de estudiante basándose en el acudiente simulado
    let studentDbId = '77777777-7777-7777-7777-777777777777'; // Alejandro Ortiz
    if (userName.includes('Marta') || userName.includes('Ramírez')) {
      studentDbId = '88888888-8888-8888-8888-888888888888'; // Sofía Ramírez
    } else if (userName.includes('Sara') || userName.includes('Gómez')) {
      studentDbId = '99999999-9999-9999-9999-999999999999'; // Mateo Gómez
    }

    async function fetchParentMessages() {
      try {
        const { data, error } = await supabase
          .from('parent_director_messages')
          .select('*')
          .eq('student_id', studentDbId)
          .order('created_at', { ascending: false });

        if (data && !error) {
          setParentMessages(data);
        } else {
          // Fallback con mock de comunicaciones oficiales
          const fallbackData = [
            {
              id: 'msg-01',
              student_id: '77777777-7777-7777-7777-777777777777',
              sender_role: 'director',
              message_type: 'internal_message',
              content: 'Estimado Carlos, felicito a Alejandro por su liderazgo voluntario en la olimpiada de matemáticas. Su apoyo a sus compañeros ha sido invaluable.',
              read_confirmed: true,
              read_at: '2026-05-21T15:30:00-05',
              parent_reply: 'Muchas gracias Lic. Martínez, nos alegra mucho escuchar eso de Alejandro y siempre estamos apoyándolo desde casa.',
              replied_at: '2026-05-21T18:45:00-05',
              priority_level: 'low',
              requires_confirmation: false,
              confirmation_type: 'simple_read',
              created_at: '2026-05-21T15:00:00-05'
            },
            {
              id: 'msg-02',
              student_id: '88888888-8888-8888-8888-888888888888',
              sender_role: 'director',
              message_type: 'automatic_alert',
              content: 'Alerta de Inasistencia RFID: Sofía Ramírez no ha registrado su ingreso en la portería escolar hoy. Por favor, justifique su ausencia hoy mismo.',
              read_confirmed: true,
              read_at: '2026-05-24T08:15:00-05',
              parent_reply: 'Lic. Martínez, buenos días. Sofía se encuentra en una cita médica general programada. Adjuntaré la excusa física mañana en portería.',
              replied_at: '2026-05-24T08:30:00-05',
              priority_level: 'high',
              requires_confirmation: true,
              confirmation_type: 'parent_compromise',
              created_at: '2026-05-24T07:45:00-05'
            },
            {
              id: 'msg-03',
              student_id: '88888888-8888-8888-8888-888888888888',
              sender_role: 'director',
              message_type: 'behavioral_followup',
              content: 'Estimada Marta, hemos registrado una anotación de inasistencia no justificada y llegadas tarde reiteradas en el observador de Sofía. Necesitamos programar una tutoría presencial y firmar acta de compromiso.',
              read_confirmed: false,
              read_at: null,
              parent_reply: null,
              replied_at: null,
              priority_level: 'high',
              requires_confirmation: true,
              confirmation_type: 'digital_signature',
              created_at: '2026-05-24T10:00:00-05'
            },
            {
              id: 'msg-04',
              student_id: '99999999-9999-9999-9999-999999999999',
              sender_role: 'director',
              message_type: 'academic_observation',
              content: 'Estimada Sara, Mateo presenta dificultades acumuladas en Matemáticas y Ciencias en el período actual. Es imperativo revisar el plan remedial de acompañamiento en casa.',
              read_confirmed: true,
              read_at: '2026-05-23T10:00:00-05',
              parent_reply: 'Entendido, Lic. Martínez. Ya revisamos el plan de mejoramiento con el Prof. Gómez y estamos repasando todas las tardes con Mateo.',
              replied_at: '2026-05-23T14:20:00-05',
              priority_level: 'medium',
              requires_confirmation: true,
              confirmation_type: 'parent_compromise',
              created_at: '2026-05-23T09:00:00-05'
            }
          ];
          setParentMessages(fallbackData.filter(m => m.student_id === studentDbId));
        }
      } catch (err) {
        console.error('Error cargando bandeja familiar:', err);
      }
    }

    fetchParentMessages();
  }, [userRole, userName]);

  // Handler para confirmar lectura / firmar digitalmente
  const handleConfirmRead = async (messageId: string) => {
    const timestamp = new Date().toISOString();
    try {
      const { error } = await supabase
        .from('parent_director_messages')
        .update({
          read_confirmed: true,
          read_at: timestamp
        })
        .eq('id', messageId);

      if (error) throw error;
      setParentMessages(prev => prev.map(m => m.id === messageId ? { ...m, read_confirmed: true, read_at: timestamp } : m));
    } catch (err) {
      console.error('Error al registrar firma digital / confirmación:', err);
      setParentMessages(prev => prev.map(m => m.id === messageId ? { ...m, read_confirmed: true, read_at: timestamp } : m));
    }
    alert('✓ Acción firmada digitalmente y transmitida a Dirección de Curso con marca temporal.');
  };

  // Handler para responder comunicación oficial
  const handleSendParentReply = async (messageId: string) => {
    const text = parentReplyText[messageId];
    if (!text || !text.trim()) return;

    const timestamp = new Date().toISOString();
    try {
      const { error } = await supabase
        .from('parent_director_messages')
        .update({
          parent_reply: text,
          replied_at: timestamp
        })
        .eq('id', messageId);

      if (error) throw error;
      setParentMessages(prev => prev.map(m => m.id === messageId ? { ...m, parent_reply: text, replied_at: timestamp } : m));
      setParentReplyText(prev => ({ ...prev, [messageId]: '' }));
    } catch (err) {
      console.error('Error al enviar descargo familiar:', err);
      setParentMessages(prev => prev.map(m => m.id === messageId ? { ...m, parent_reply: text, replied_at: timestamp } : m));
      setParentReplyText(prev => ({ ...prev, [messageId]: '' }));
    }
    alert('✓ Respuesta formal registrada exitosamente en la bitácora escolar.');
  };

  // 5. Certificados (Secretaría)
  const [generatedCert, setGeneratedCert] = useState('');
  const handleGenerateCertificate = (studentName: string) => {
    setGeneratedCert(`Certificado de Matrícula Oficial generado para: ${studentName}. Listo para descarga.`);
  };

  // 6. IA Predictiva & Alertas Tempranas (Rector)
  const [iaProcessing, setIaProcessing] = useState(false);
  const [iaReport, setIaReport] = useState<string | null>(null);

  const runIaDiagnosis = () => {
    setIaProcessing(false);
    setIaReport('Análisis predictivo de IA finalizado. Diagnóstico: 1 estudiante con riesgo crítico de deserción escolar (Juan García - 10-A) debido a ausencias acumuladas (88.2% de asistencia) y notas reprobadas en Matemáticas. Recomendación: Iniciar plan de tutoría pedagógica y contactar a acudiente (Mateo García).');
  };

  // --- RENDERIZACIÓN DE DASHBOARDS ESPECÍFICOS POR ROL ---

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* ========================================================= */}
        {/* ROL: SUPER ADMIN (Redirección o Banner Ejecutivo SaaS) */}
        {/* ========================================================= */}
        {userRole === 'super_admin' && (
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-8 rounded-3xl text-white shadow-2xl border border-indigo-500/30 text-center space-y-4 my-8">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl mx-auto flex items-center justify-center border border-indigo-400/30">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-extrabold">Bienvenido al Centro de Control AulaCore (Super Admin SaaS)</h2>
            <p className="text-slate-300 max-w-xl mx-auto text-sm leading-relaxed">
              Estás conectado con el rol de fabricante y administración global. Tu panel de gobernanza con los 13 Módulos Enterprise (Ficha 360°, Telemetría, Modo Soporte, CRM y Licencias) se encuentra en la sección especializada.
            </p>
            <div className="pt-2">
              <a
                href="/configuracion/saas"
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                Ir al Panel Super Admin SaaS
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ROL: ESTUDIANTE (Panel Personal) */}
        {/* ========================================================= */}
        {userRole === 'estudiante' && <StudentDashboard />}

        {/* ROL: RECTOR (Visión General del Colegio & IA Predictiva) */}
        {/* ========================================================= */}
        {userRole === 'rector' && (
          <div className="space-y-6">
            {/* Cabecera */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-lg border border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
                  <span className="text-sm font-bold tracking-widest uppercase text-blue-255">Panel Estratégico</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight mt-1.5">Consola de Rectoría</h1>
                <p className="text-base text-slate-200 mt-1.5 leading-relaxed">Visión institucional consolidada, analíticas y alertas tempranas predictivas</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto shrink-0">
                {/* Selector Modular de Consolas (Power BI vs Student 360 vs Bóveda) */}
                <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 select-none shadow-inner shrink-0">
                  <button
                    onClick={() => setRectorTab('institutional')}
                    className={cn(
                      "text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer border-none outline-none",
                      rectorTab === 'institutional' 
                        ? "bg-white text-slate-900 shadow-sm font-black" 
                        : "text-slate-300 hover:bg-slate-850 hover:text-white bg-transparent"
                    )}
                  >
                    Consola Consolidada
                  </button>
                  <button
                    onClick={() => setRectorTab('student360')}
                    className={cn(
                      "text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer border-none outline-none",
                      rectorTab === 'student360' 
                        ? "bg-white text-slate-900 shadow-sm font-black" 
                        : "text-slate-300 hover:bg-slate-855 hover:text-white bg-transparent"
                    )}
                  >
                    Student 360° Explorer
                  </button>
                  <button
                    onClick={() => setRectorTab('audit_vault')}
                    className={cn(
                      "text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer border-none outline-none",
                      rectorTab === 'audit_vault' 
                        ? "bg-white text-slate-900 shadow-sm font-black" 
                        : "text-slate-300 hover:bg-slate-850 hover:text-white bg-transparent"
                    )}
                  >
                    Bóveda Documental & Auditoría
                  </button>
                </div>

                <Button 
                  onClick={runIaDiagnosis}
                  disabled={iaProcessing}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold rounded-xl px-5 py-2.5 shadow-md flex items-center gap-2 transition duration-200 cursor-pointer h-10 shrink-0 border-none outline-none"
                >
                  <BrainCircuit className="w-5 h-5 animate-pulse" />
                  {iaProcessing ? 'Analizando...' : 'Diagnóstico IA AulaCore'}
                </Button>
              </div>
            </div>

            {rectorTab === 'institutional' && (
              <>
                {/* 1. PRIMER PANTALLAZO RECTORÍA: RESUMEN INSTITUCIONAL & MÉTRICAS EJECUTIVAS */}
                <RectorExecutiveSummary />

            {/* Diagnóstico IA Reporte */}
            {iaReport && (
              <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50/50 to-orange-50/20 border-slate-200 shadow-md">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <BrainCircuit className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-slate-950 text-xl flex items-center gap-2">
                        Resultado de Analítica Predictiva AulaCore
                        <span className="text-xs bg-yellow-100 text-yellow-850 font-extrabold px-2 py-0.5 rounded-full">Early Warning</span>
                      </h4>
                      <p className="text-base text-slate-800 mt-2 leading-relaxed font-medium">{iaReport}</p>
                      <Button variant="link" className="p-0 text-sm text-blue-600 hover:text-blue-800 font-semibold mt-3" onClick={() => setIaReport(null)}>
                        Descartar diagnóstico
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Control y Búsqueda de Solicitudes de Cupo (Aspirantes) */}
            <Card className="border-slate-200 shadow-md bg-white rounded-2xl overflow-hidden animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                    <span className="text-[10px] font-black tracking-widest uppercase text-indigo-300">Gestión de Aspirantes</span>
                  </div>
                  <CardTitle className="text-xl font-extrabold text-white mt-0.5">Control de Admisiones y Solicitudes de Cupo</CardTitle>
                  <p className="text-xs text-slate-300 font-medium">Búsqueda general y supervisión en tiempo real de pre-registros por Magic Link</p>
                </div>
                <div className="relative w-full md:w-80 shrink-0">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={rectorSearchQuery}
                    onChange={(e) => setRectorSearchQuery(e.target.value)}
                    placeholder="Buscar aspirante por nombre o documento..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white border border-white/10 hover:border-white/20 focus:border-white rounded-xl text-xs font-semibold text-white focus:text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all duration-300 shadow-inner"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {filteredRectorPreRegs.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-sm font-extrabold text-slate-800">No se encontraron solicitudes</h4>
                    <p className="text-xs text-slate-450 font-semibold mt-1">Intente buscar con otro nombre o documento de identidad</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredRectorPreRegs.map((student: any) => (
                      <div 
                        key={student.nationalId}
                        className="p-4 border border-slate-150 rounded-2xl bg-slate-50/20 hover:bg-white hover:border-indigo-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-4"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 animate-ping" />
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 -ml-3.5" />
                              <h4 className="font-extrabold text-slate-900 text-sm leading-snug truncate max-w-[150px]" title={student.fullName}>
                                {student.fullName}
                              </h4>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold block">Documento: {student.nationalId}</span>
                            <span className="text-[10px] text-slate-400 font-bold block truncate max-w-[180px]" title={student.email}>
                              {student.email}
                            </span>
                          </div>
                          
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border shadow-3xs shrink-0",
                            student.gradeLevel === 'Media Técnica' && "bg-amber-50 text-amber-700 border-amber-250",
                            student.gradeLevel === 'Bachillerato' && "bg-purple-50 text-purple-700 border-purple-250",
                            student.gradeLevel === 'Primaria' && "bg-blue-50 text-blue-700 border-blue-250",
                            student.gradeLevel === 'Preescolar' && "bg-pink-50 text-pink-700 border-pink-250",
                            student.gradeLevel === 'Otras' && "bg-slate-50 text-slate-700 border-slate-200"
                          )}>
                            {student.gradeLevel || 'Bachillerato'}
                          </span>
                        </div>

                        {/* Semáforo/Checklist de Documentos de Admisión */}
                        <div className="bg-white border border-slate-100 p-2.5 rounded-xl space-y-1.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Requisitos de Ingreso</span>
                          <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-600">
                            <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">
                              <CheckCircle className="w-3 h-3 text-emerald-500" /> Reg. Civil
                            </div>
                            <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">
                              <CheckCircle className="w-3 h-3 text-emerald-500" /> ID Card
                            </div>
                            <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">
                              <CheckCircle className="w-3 h-3 text-emerald-500" /> Ficha EPS
                            </div>
                            <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">
                              <Clock className="w-3 h-3 text-amber-500 animate-pulse" /> Boletín
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-400 font-semibold">Pre-registro:</span>
                            <span className="text-slate-700">{student.registrationDate}</span>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-[9.5px] font-black text-amber-700 bg-amber-50 border border-amber-250 px-2 py-1 rounded-md uppercase tracking-wider animate-pulse flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                              Por Secretaría
                            </span>
                            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 select-none">
                              Cupo Solicitado
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* GRID PRINCIPAL DE RECTORÍA (2 Columnas: Analítica y Operativa) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COLUMNA ANALÍTICA IZQUIERDA (lg:col-span-2) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. GRÁFICO INTERACTIVO POWER BI DUAL */}
                <Card className="w-full border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl flex flex-col justify-between">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600 animate-pulse" />
                        Evolución de Rendimiento Académico y Asistencia RFID
                      </CardTitle>
                      <p className="text-sm text-slate-550 font-medium">Analítica comparativa de variables críticas en tiempo real</p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="border border-slate-250 rounded-lg px-2.5 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer font-semibold text-slate-700 shadow-sm"
                      >
                        <option value="2026-I">Período 2026-I</option>
                        <option value="2025-II">Período 2025-II</option>
                      </select>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-12 relative flex-1 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">Analítica Académica en Espera</h4>
                    <p className="text-sm text-slate-500 font-medium max-w-sm">
                      La analítica aparecerá cuando exista información académica.
                    </p>
                  </CardContent>
                </Card>

                {/* 2. TABLA ANALÍTICA INSTITUCIONAL AVANZADA */}
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-650" />
                        Consolidado Analítico de Desempeño por Curso
                      </CardTitle>
                      <p className="text-sm text-slate-550 font-medium">Métricas consolidadas de rendimiento académico, asistencia RFID y estado disciplinario de toda la institución</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 font-bold text-xs border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm">
                        <FileText className="w-3.5 h-3.5" />
                        Exportar Matriz
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/70">
                        <TableRow>
                          <TableHead className="font-extrabold text-slate-800 text-sm pl-6">Curso / Aula</TableHead>
                          <TableHead className="font-extrabold text-slate-800 text-sm">Director de Grupo</TableHead>
                          <TableHead className="font-extrabold text-slate-800 text-sm text-center">Matrícula</TableHead>
                          <TableHead className="font-extrabold text-slate-800 text-sm">Promedio General (GPA)</TableHead>
                          <TableHead className="font-extrabold text-slate-800 text-sm text-center">Asistencia RFID</TableHead>
                          <TableHead className="font-extrabold text-slate-800 text-sm text-center">Convivencia Activa</TableHead>
                          <TableHead className="font-extrabold text-slate-800 text-sm text-center">Mejoramiento Activo</TableHead>
                          <TableHead className="font-extrabold text-slate-800 text-sm text-center">Cierre Académico</TableHead>
                          <TableHead className="font-extrabold text-slate-800 text-sm pr-6 text-right">Análisis 360°</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12 text-slate-500 font-medium">
                            <div className="flex flex-col items-center gap-2">
                              <BookOpen className="w-8 h-8 text-slate-400" />
                              <p className="font-semibold text-slate-700">Comienza creando tus cursos.</p>
                              <p className="text-xs text-slate-400">La matriz de consolidado aparecerá cuando tengas cursos y asignaturas parametrizadas.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* 3. CONVIVENCIA Y DISCIPLINA INSTITUCIONAL */}
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Convivencia y Disciplina Institucional
                      </CardTitle>
                      <p className="text-sm text-slate-550 font-medium">Indicadores comportamentales generales y novedades disciplinarias</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 text-center space-y-2">
                    {behaviorRecords.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {behaviorRecords.map((rec) => (
                          <div key={rec.id} className="p-3.5 rounded-xl border space-y-1.5 text-left">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-black text-slate-950">{rec.studentName}</span>
                              <span className="text-xs font-black px-2 py-0.5 rounded-full uppercase bg-blue-100 text-blue-800">{rec.type}</span>
                            </div>
                            <p className="text-xs text-slate-700 font-medium leading-relaxed">{rec.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 flex flex-col items-center gap-2">
                        <Users className="w-8 h-8 text-slate-400" />
                        <p className="font-semibold text-slate-700">No hay indicadores disponibles.</p>
                        <p className="text-xs text-slate-400">Las novedades de convivencia aparecerán cuando los docentes o coordinadores registren anotaciones.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 4. PLANES DE MEJORAMIENTO ACTIVOS */}
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-extrabold text-slate-955 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        Planes de Mejoramiento Activos
                      </CardTitle>
                      <p className="text-sm text-slate-550 font-medium">Monitoreo de talleres de recuperación escolar y nivelación académica</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 text-center">
                    <div className="py-6 flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 text-slate-400" />
                      <p className="font-semibold text-slate-700">Aún no has registrado estudiantes.</p>
                      <p className="text-xs text-slate-400">Los planes de nivelación académica estarán disponibles al matricular estudiantes en los cursos.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Visualizaciones Finales de AulaCore - Power BI Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* A. Casos de Convivencia */}
                  <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl flex flex-col justify-between hover:shadow-md transition duration-200">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 px-5 py-4">
                      <CardTitle className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-650" />
                        Casos de Convivencia
                      </CardTitle>
                      <p className="text-xs text-slate-550 font-medium">Proporción general de reportes registrados</p>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-2">
                      <Users className="w-8 h-8 text-slate-400" />
                      <p className="font-semibold text-slate-700 text-sm">No hay indicadores disponibles.</p>
                      <p className="text-xs text-slate-400">Sin reportes registrados.</p>
                    </CardContent>
                  </Card>

                  {/* B. Rendimiento por Curso */}
                  <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl flex flex-col justify-between hover:shadow-md transition duration-200">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 px-5 py-4">
                      <CardTitle className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-650" />
                        Rendimiento por Curso
                      </CardTitle>
                      <p className="text-xs text-slate-550 font-medium">Promedio académico institucional (GPA)</p>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-2">
                      <BarChart3 className="w-8 h-8 text-slate-400" />
                      <p className="font-semibold text-slate-700 text-sm">No hay indicadores disponibles.</p>
                      <p className="text-xs text-slate-400">Sin calificaciones generadas.</p>
                    </CardContent>
                  </Card>
                </div>

              </div>

              {/* COLUMNA OPERATIVA DERECHA (lg:col-span-1) */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* 1. STUDENT 365 SPOTLIGHT */}
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl">
                  <CardHeader className="bg-slate-955/80 px-6 py-4 flex flex-row items-center gap-3 border-b border-slate-800/60">
                    <Award className="w-6 h-6 text-yellow-400 animate-bounce" />
                    <div>
                      <CardTitle className="text-base font-extrabold text-white">Student 360° Spotlight</CardTitle>
                      <p className="text-xs text-slate-400 font-medium">Perfil académico estrella de la semana</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="relative inline-block">
                      <img 
                        src={MOCK_STUDENTS[0].avatar} 
                        alt={MOCK_STUDENTS[0].name} 
                        className="w-20 h-20 rounded-full border-4 border-indigo-500/20 object-cover mx-auto"
                      />
                      <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">✓</span>
                    </div>

                    <div>
                      <h4 className="text-2xl font-extrabold text-white leading-snug">{MOCK_STUDENTS[0].name}</h4>
                      <p className="text-sm text-slate-350 mt-1 font-semibold">Grado {MOCK_STUDENTS[0].grade} | Promedio general {MOCK_STUDENTS[0].gpa}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80">
                      <div>
                        <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Asistencia</span>
                        <span className="text-base font-black text-slate-200">{MOCK_STUDENTS[0].attendanceRate}%</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Conducta</span>
                        <span className="text-base font-black text-slate-200">10/10</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Riesgo</span>
                        <span className="text-sm font-black text-emerald-400 block mt-0.5">Mínimo</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-200 leading-relaxed italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-medium">
                      "Excelente comportamiento y proactividad. Destacó como líder en el Foro Científico de AulaCore."
                    </p>
                  </CardContent>
                </Card>

                {/* 2. ALERTAS DE RIESGO ESCOLAR (ESTADIOS DE RIESGO IA) */}
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl flex flex-col justify-between">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-indigo-650" />
                        Alertas de Riesgo Escolar
                      </CardTitle>
                      <p className="text-sm text-slate-550 font-medium">Métricas predictivas de la institución</p>
                    </div>
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      IA Activa
                    </span>
                  </CardHeader>
                  <CardContent className="p-6 flex-1 flex flex-col justify-between gap-4">
                    {/* Tarjetas de Niveles de Riesgo */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-red-50/60 border border-red-100 p-3 rounded-xl text-center space-y-0.5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                        <span className="text-xs font-extrabold text-red-750 block uppercase tracking-widest">Crítico</span>
                        <h4 className="text-3xl font-black text-red-655">2</h4>
                        <span className="text-xs text-red-505 font-bold block leading-none">Intervenir ya</span>
                      </div>
                      <div className="bg-amber-50/60 border border-amber-100 p-3 rounded-xl text-center space-y-0.5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                        <span className="text-xs font-extrabold text-amber-700 block uppercase tracking-widest">Alto</span>
                        <h4 className="text-3xl font-black text-amber-600">4</h4>
                        <span className="text-xs text-amber-550 font-bold block leading-none">En Observación</span>
                      </div>
                      <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-xl text-center space-y-0.5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                        <span className="text-xs font-extrabold text-blue-700 block uppercase tracking-widest">Medio</span>
                        <h4 className="text-3xl font-black text-blue-600">12</h4>
                        <span className="text-xs text-blue-555 font-bold block leading-none">Seguimiento</span>
                      </div>
                      <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl text-center space-y-0.5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                        <span className="text-xs font-extrabold text-emerald-700 block uppercase tracking-widest">Bajo</span>
                        <h4 className="text-3xl font-black text-emerald-600">1,227</h4>
                        <span className="text-xs text-emerald-550 font-bold block leading-none">Estable</span>
                      </div>
                    </div>

                    {/* Detalle Alumnos de Riesgo Crítico */}
                    <div className="border border-slate-150 rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50/70">
                          <TableRow>
                            <TableHead className="font-extrabold text-slate-800 text-xs pl-3 py-2">Alumno</TableHead>
                            <TableHead className="font-extrabold text-slate-800 text-xs py-2 text-center">GPA</TableHead>
                            <TableHead className="font-extrabold text-slate-800 text-xs pr-3 py-2 text-right">Riesgo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="font-bold text-slate-955 text-sm pl-3 py-2 flex items-center gap-1.5">
                              <img src={MOCK_STUDENTS[6].avatar} className="w-5 h-5 rounded-full object-cover" />
                              {MOCK_STUDENTS[6].name}
                            </TableCell>
                            <TableCell className="text-sm font-extrabold text-red-700 text-center py-2">{MOCK_STUDENTS[6].gpa}</TableCell>
                            <TableCell className="pr-3 py-2 text-right">
                              <span className="text-xs bg-red-100 text-red-800 font-black px-1.5 py-0.5 rounded">Crítico</span>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="font-bold text-slate-955 text-sm pl-3 py-2 flex items-center gap-1.5">
                              <img src={MOCK_STUDENTS[1].avatar} className="w-5 h-5 rounded-full object-cover" />
                              {MOCK_STUDENTS[1].name}
                            </TableCell>
                            <TableCell className="text-sm font-extrabold text-red-700 text-center py-2">{MOCK_STUDENTS[1].gpa}</TableCell>
                            <TableCell className="pr-3 py-2 text-right">
                              <span className="text-xs bg-red-100 text-red-800 font-black px-1.5 py-0.5 rounded">Crítico</span>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. CONTROL DE AUSENTISMO CRÓNICO */}
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
                  <CardHeader className="bg-slate-50 border-b border-slate-200 px-5 py-3.5">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-600 animate-pulse" />
                      Control de Ausentismo Crónico
                    </CardTitle>
                    <p className="text-xs text-slate-500">Monitoreo de estudiantes con asistencia inferior al 90%</p>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-3 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-655 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-extrabold text-red-955 block leading-none">Riesgo General Escolar</span>
                        <span className="text-xs text-red-755 font-medium">3.4% de la matrícula escolar en nivel crítico</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Estudiante 1 */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-2 hover:shadow-sm transition bg-white animate-fade-in">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" className="w-7 h-7 rounded-full object-cover ring-2 ring-red-100" />
                            <div>
                              <span className="text-xs font-bold text-slate-900 block leading-tight">Juan García</span>
                              <span className="text-xs text-slate-500">Curso: 10-A | Acudiente: M. García</span>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">88.2%</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full text-xs h-7 font-bold border-slate-200 hover:bg-red-50 hover:text-red-700 transition cursor-pointer">
                          Notificar Acudiente
                        </Button>
                      </div>

                      {/* Estudiante 2 */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-2 hover:shadow-sm transition bg-white animate-fade-in">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold ring-2 ring-red-100">MD</div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 block leading-tight">Mateo Díaz</span>
                              <span className="text-xs text-slate-500">Curso: 11-B | Acudiente: J. Díaz</span>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">45.0%</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full text-xs h-7 font-bold border-slate-200 hover:bg-red-50 hover:text-red-700 transition cursor-pointer">
                          Notificar Acudiente
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 4. PRÓXIMAS REUNIONES Y COMITÉS */}
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
                  <CardHeader className="bg-slate-50 border-b border-slate-200 px-5 py-3.5">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Próximas Reuniones y Comités
                    </CardTitle>
                    <p className="text-xs text-slate-500">Calendario directivo y juntas escolares oficiales</p>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="relative border-l-2 border-slate-200 pl-4 space-y-5 py-1.5 ml-2">
                      {/* Evento 1 */}
                      <div className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-purple-650 ring-4 ring-white animate-pulse" />
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-purple-700 uppercase tracking-wider">Comité Convivencia</span>
                            <span className="text-slate-450 flex items-center gap-1 font-semibold"><Clock className="w-3 h-3" /> 02:00 PM (Hoy)</span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900">Caso Disciplinario: Juan García</h5>
                          <p className="text-xs text-slate-500 leading-snug">Revisión de inasistencias y anotaciones. Citación en Salón de Juntas Directivas.</p>
                          <div className="text-xs text-slate-400 font-bold">Asistentes: Rector, Lic. Martínez, Coordinación, Acudiente.</div>
                        </div>
                      </div>

                      {/* Evento 2 */}
                      <div className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-blue-700 uppercase tracking-wider">Consejo Directivo</span>
                            <span className="text-slate-455 flex items-center gap-1 font-semibold"><Clock className="w-3 h-3" /> 08:30 AM (Mañana)</span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900">Cierre Académico y Nivelaciones Periodo I</h5>
                          <p className="text-xs text-slate-500 leading-snug">Aprobación del consolidado general de notas, análisis de deserción escolar.</p>
                          <div className="text-xs text-slate-400 font-bold">Asistentes: Todos los Directores de Grupo, Rector, Secretaría.</div>
                        </div>
                      </div>

                      {/* Evento 3 */}
                      <div className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-white" />
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-amber-700 uppercase tracking-wider">Citación Acudiente</span>
                            <span className="text-slate-455 flex items-center gap-1 font-semibold"><Clock className="w-3 h-3" /> 10:00 AM (26 Mayo)</span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900">Seguimiento Asistencia: Carlos Pérez</h5>
                          <p className="text-xs text-slate-500 leading-snug">Revisión de alertas automatizadas del wearable RFID por fallas consecutivas.</p>
                          <div className="text-xs text-slate-400 font-bold">Asistentes: Director de Grupo, Acudiente.</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 5. DISTRIBUCIÓN POR RENDIMIENTO */}
                <Card className="border-slate-200 shadow-sm p-5 space-y-4 bg-white rounded-2xl">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Distribución de Calificaciones Académicas
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-655 mb-1">
                        <span>Desempeño Superior (Promedio &gt; 9.0)</span>
                        <span>42%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-655 mb-1">
                        <span>Desempeño Alto (7.0 - 8.9)</span>
                        <span>48%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: '48%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-655 mb-1">
                        <span>Desempeño Básico / Bajo (&lt; 7.0)</span>
                        <span>10%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </Card>

              </div>
              </div>
              </>
            )}

          {rectorTab === 'student360' && (
            <Student360 />
          )}

          {rectorTab === 'audit_vault' && (() => {
            const mockAuditTrail: any[] = [];
            const mockDocsList: any[] = [];

            const handleVerifyByCode = (verifyCode: string) => {
              let type: DocumentType = 'academic_report';
              let sName = 'Alejandro Ortiz';
              let cName = 'Grado Décimo A (10-A)';
              let payload = {};

              if (verifyCode.includes('999') || verifyCode.toLowerCase().includes('mateo')) {
                type = 'academic_compromise';
                sName = 'Mateo Gómez';
                payload = {
                  studentName: 'Mateo Gómez',
                  courseName: 'Grado Décimo A (10-A)',
                  academicYear: 2026,
                  remedialSubject: 'Matemáticas & Ciencias Naturales',
                  academicGpa: 6.5,
                  failuresCount: 3,
                  compromises: [
                    'Asistir diariamente a las monitorías académicas los días martes y jueves en jornada de la tarde.',
                    'Entregar bitácora de repaso firmada por el acudiente (Sara Gómez) en cada clase de Ciencias Naturales/Álgebra.',
                    'Desarrollar el taller remedial práctico asignado por el Prof. Gómez con fecha límite del 12 de junio.'
                  ],
                  parentName: 'Sara Gómez'
                };
              } else if (verifyCode.includes('888') || verifyCode.toLowerCase().includes('sofía')) {
                type = 'citations';
                sName = 'Sofía Ramírez';
                payload = {
                  studentName: 'Sofía Ramírez',
                  courseName: 'Grado Décimo A (10-A)',
                  citationType: 'Comité Convivencial Disciplinario',
                  dateTime: 'Bogotá D.C., 28 de Mayo de 2026, 09:30 AM',
                  location: 'Sala de Juntas de Rectoría / Rector Ramón Ramírez',
                  reason: 'Revisión conjunta de inasistencias RFID injustificadas acumuladas (Asistencia: 72.5%) y establecimiento del compromiso disciplinario.'
                };
              } else {
                type = 'academic_report';
                sName = 'Alejandro Ortiz';
                payload = {
                  studentName: 'Alejandro Ortiz',
                  courseName: 'Grado Décimo A (10-A)',
                  academicYear: 2026,
                  generalGpa: 9.4,
                  attendanceRate: 98.2,
                  grades: [
                    {subject: 'Matemáticas', exams: [4.2, 4.5], homeworks: [4.0, 4.6], participation: [5.0], finalGrade: 4.40},
                    {subject: 'Ciencias Naturales', exams: [3.8, 4.0], homeworks: [3.5, 3.8], participation: [4.5], finalGrade: 3.85},
                    {subject: 'Inglés', exams: [4.8, 5.0], homeworks: [4.8, 4.8], participation: [5.0], finalGrade: 4.86}
                  ]
                };
              }

              setDocEngineType(type);
              setDocEngineStudentName(sName);
              setDocEngineCourseName(cName);
              setDocEngineMetadata(payload);
              setIsDocEngineOpen(true);
            };

            return (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
                
                {/* Columna de búsqueda y KPIs (1 col) */}
                <div className="xl:col-span-1 space-y-6">
                  
                  {/* Búsqueda rápida */}
                  <Card className="border-slate-200 shadow-sm bg-white p-5 space-y-4 rounded-xl">
                    <h4 className="font-extrabold text-slate-900 text-sm border-b pb-2 flex items-center gap-1.5">
                      <Search className="w-4 h-4 text-indigo-650" />
                      Validación Criptográfica Rápida
                    </h4>
                    <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                      Ingrese el código verificador alfanumérico impreso en el pie de página de cualquier boletín o acta para comprobar su inmutabilidad.
                    </p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={searchVerifyCode}
                        onChange={(e) => setSearchVerifyCode(e.target.value)}
                        placeholder="Ej: AC-VERIFY-777A"
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-850 uppercase tracking-widest bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      />
                      <Button
                        onClick={() => handleVerifyByCode(searchVerifyCode || 'AC-VERIFY-777A')}
                        className="w-full bg-slate-900 hover:bg-slate-950 text-white font-black text-xs py-2 rounded-lg cursor-pointer transition shadow-inner"
                      >
                        Verificar Documento
                      </Button>
                    </div>
                  </Card>

                  {/* KPIs */}
                  <Card className="border-slate-200 shadow-sm bg-white p-5 space-y-3 rounded-xl">
                    <h4 className="font-extrabold text-slate-900 text-sm border-b pb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                      Estadísticas de la Bóveda
                    </h4>
                    <div className="space-y-3.5 pt-1.5">
                      {[
                        { label: 'Documentos Emitidos', val: `${mockDocsList.length}`, pct: '0%', color: 'text-slate-850' },
                        { label: 'Firmas Criptográficas Activas', val: '0', pct: '0%', color: 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150 shadow-xs' },
                        { label: 'Auditorías Registradas', val: `${mockAuditTrail.length}`, pct: '0%', color: 'text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150 shadow-xs' }
                      ].map((kpi, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-500">{kpi.label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={cn("font-black", kpi.color)}>{kpi.val}</span>
                            <span className="text-[10px] text-slate-400">({kpi.pct})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Columna de historial y auditoría (2 cols) */}
                <div className="xl:col-span-2 space-y-6">
                  
                  {/* Historial de Documentos Emitidos */}
                  <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-purple-750" />
                          Registro Documental Reciente (Colegio Central)
                        </CardTitle>
                        <p className="text-xs text-slate-450 font-semibold">Trazabilidad oficial de boletines y actas emitidos</p>
                      </div>
                      <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-extrabold px-2 py-0.5 rounded shadow-sm">
                        Multitenant Active
                      </span>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50/50">
                          <TableRow>
                            <TableHead className="font-extrabold text-slate-800 text-xs pl-5">Código</TableHead>
                            <TableHead className="font-extrabold text-slate-800 text-xs">Tipo de Documento</TableHead>
                            <TableHead className="font-extrabold text-slate-800 text-xs">Estudiante</TableHead>
                            <TableHead className="font-extrabold text-slate-800 text-xs text-center">Estado</TableHead>
                            <TableHead className="font-extrabold text-slate-800 text-xs text-center">Fecha</TableHead>
                            <TableHead className="font-extrabold text-slate-800 text-xs text-right pr-5">Acción</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockDocsList.map((doc, idx) => (
                            <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <TableCell className="font-mono font-black text-slate-900 pl-5 text-xs">{doc.code}</TableCell>
                              <TableCell className="font-bold text-slate-655 text-xs">{doc.name}</TableCell>
                              <TableCell className="text-xs">
                                <span className="font-black text-slate-850 block leading-tight">{doc.student}</span>
                                <span className="text-[10px] text-slate-450 font-bold">Curso: {doc.course}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={cn(
                                  "text-[9px] font-black px-2 py-0.5 rounded leading-none inline-block",
                                  doc.status === 'signed' ? "bg-emerald-50 text-emerald-700 border border-emerald-150 animate-fade-in" : "bg-indigo-50 text-indigo-700 border border-indigo-150 animate-pulse"
                                )}>
                                  {doc.status === 'signed' ? 'Firmado' : 'Notificado'}
                                </span>
                              </TableCell>
                              <TableCell className="text-center font-bold text-slate-450 text-[11px]">{doc.date}</TableCell>
                              <TableCell className="pr-5 text-right">
                                <Button
                                  onClick={() => handleVerifyByCode(doc.code)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-[10px] font-black text-indigo-700 hover:text-indigo-850 hover:bg-slate-100 rounded-md cursor-pointer"
                                >
                                  Ver / Exportar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Historial de Auditoría de Personal */}
                  <Card className="border-slate-200 shadow-sm bg-white rounded-xl p-5 space-y-4">
                    <h4 className="font-extrabold text-slate-900 text-sm border-b pb-2 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-purple-750" />
                      Bitácora de Trazabilidad y Auditoría Ministerial (Logs)
                    </h4>
                    <div className="space-y-4">
                      {mockAuditTrail.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 text-xs leading-relaxed">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full mt-1 shrink-0",
                            log.status === 'signed' ? "bg-emerald-500 animate-pulse" :
                            log.status === 'printed' ? "bg-indigo-500 animate-pulse" : "bg-amber-500"
                          )} />
                          <div className="flex-1">
                            <p className="font-semibold text-slate-700 leading-tight">
                              <strong className="text-slate-950 font-black">{log.actor}</strong> realizó la acción de{' '}
                              <span className="font-black text-indigo-700">{log.action}</span> sobre el documento{' '}
                              <span className="font-mono text-slate-950 font-bold">{log.doc}</span> ({log.type}).
                            </p>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{log.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                </div>
              </div>
            );
          })()}
        </div>
        )}

        {userRole === 'coordinador' && (
          <CoordinatorConsole />
        )}

        {userRole === 'director_grupo' && (
          <GroupDirectorConsole />
        )}
        {/* ROL: DOCENTE (Planilla de Notas Interactiva por Prof. Gómez) */}
        {/* ========================================================= */}
        {userRole === 'docente' && (
          showCurriculumBuilder ? (
            <CurriculumBuilder onBack={() => setShowCurriculumBuilder(false)} />
          ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Cabecera */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 via-teal-950 to-emerald-800 p-6 rounded-2xl text-white shadow-lg border border-emerald-700">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-emerald-200 flex items-center gap-2">
                  Portal del Docente
                  <span className="bg-emerald-600/30 text-emerald-100 px-2 py-0.5 rounded text-[9px]">2026-I</span>
                </span>
                <h1 className="text-3xl font-bold tracking-tight mt-1">Planilla y Control Académico</h1>
                <p className="text-sm text-emerald-100/70 mt-1">Gestión de notas, planeaciones y asistencia.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <Button 
                  onClick={() => setShowCurriculumBuilder(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 border border-emerald-500 shadow-sm gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Abrir CurriculumEngine
                </Button>
                
                {/* Control de Cierre de Periodo */}
                <div className="flex items-center gap-2.5 bg-emerald-950/80 p-1.5 rounded-lg border border-emerald-800/40 text-xs font-semibold">
                  <span className="text-emerald-300 text-[11px] font-bold">Estado Periodo P2:</span>
                  <select
                    value={periodStatus}
                    onChange={(e) => setPeriodStatus(e.target.value as 'abierto' | 'en_revisión' | 'cerrado' | 'publicado')}
                    className="bg-emerald-900 border-none rounded text-xs px-2.5 py-1 text-white font-black cursor-pointer focus:outline-none"
                  >
                    <option value="abierto">🟢 Abierto</option>
                    <option value="en_revisión">🟡 En Revisión</option>
                    <option value="cerrado">🔴 Cerrado</option>
                    <option value="publicado">🔵 Publicado</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-emerald-900/60 p-1 rounded-lg border border-emerald-800/50">
                  <button 
                    onClick={() => setSelectedSubject('Matemáticas')}
                    className={cn(
                      "text-xs font-bold px-3 py-1.5 rounded-md cursor-pointer transition border-none outline-none",
                      selectedSubject === 'Matemáticas' ? "bg-white text-slate-950 shadow-md font-black" : "text-white hover:bg-white/10 bg-transparent"
                    )}
                  >
                    Matemáticas
                  </button>
                  <button 
                    onClick={() => setSelectedSubject('Ciencias Naturales y Educación Ambiental')}
                    className={cn(
                      "text-xs font-bold px-3 py-1.5 rounded-md cursor-pointer transition border-none outline-none",
                      selectedSubject === 'Ciencias Naturales y Educación Ambiental' ? "bg-white text-slate-950 shadow-md font-black" : "text-white hover:bg-white/10 bg-transparent"
                    )}
                  >
                    Ciencias Naturales
                  </button>
                </div>
              </div>
            </div>

            {/* Banner de Bloqueo Académico */}
            {periodStatus !== 'abierto' && (
              <div className={cn(
                "p-4 rounded-xl border flex items-center gap-3 shadow-sm transition-all duration-300",
                periodStatus === 'en_revisión' && "bg-amber-50 border-amber-200 text-amber-900 border-l-4 border-l-amber-500",
                periodStatus === 'cerrado' && "bg-red-50 border-red-200 text-red-900 border-l-4 border-l-red-500",
                periodStatus === 'publicado' && "bg-blue-50 border-blue-200 text-blue-900 border-l-4 border-l-blue-500"
              )}>
                <AlertTriangle className={cn(
                  "w-5 h-5 shrink-0",
                  periodStatus === 'en_revisión' && "text-amber-600 animate-pulse",
                  periodStatus === 'cerrado' && "text-red-600 animate-bounce",
                  periodStatus === 'publicado' && "text-blue-600"
                )} />
                <div className="text-xs">
                  <span className="font-extrabold uppercase block tracking-wider text-[11px]">
                    {periodStatus === 'en_revisión' ? 'Periodo En Revisión' : 
                     periodStatus === 'cerrado' ? 'Periodo Cerrado Administrativamente' : 
                     'Periodo Publicado Oficialmente'}
                  </span>
                  <p className="font-medium mt-0.5 leading-relaxed text-slate-700">
                    {periodStatus === 'en_revisión' ? 'Las calificaciones se encuentran en auditoría. Las modificaciones están deshabilitadas temporalmente para los docentes.' :
                     periodStatus === 'cerrado' ? 'Las planillas han sido cerradas para este periodo escolar. Todas las notas, promedios y asistencias han sido congelados.' :
                     'El boletín del periodo actual ya está publicado y disponible para padres y acudientes. Edición bloqueada al 100%.'}
                  </p>
                </div>
              </div>
            )}

            {/* Grid de Cursos Asignados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4 border-slate-200 border-l-4 border-l-emerald-600 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Materia Activa</span>
                  <span className="text-base font-extrabold text-slate-900">{selectedSubject} (10-A)</span>
                </div>
                <BookOpen className="w-8 h-8 text-emerald-600" />
              </Card>

              <Card className="p-4 border-slate-200 border-l-4 border-l-teal-600 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Periodo</span>
                  <span className="text-base font-extrabold text-slate-900">Período 2026-I</span>
                </div>
                <Calendar className="w-8 h-8 text-teal-600" />
              </Card>

              <Card className="p-4 border-slate-200 border-l-4 border-l-blue-600 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Cierre de Periodo</span>
                  <span className="text-base font-extrabold text-red-600">Quedan 7 días</span>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </Card>
            </div>

            {/* Planilla de Notas Interactiva */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/70 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-950">Planilla Oficial de {selectedSubject} (10-A)</CardTitle>
                  <p className="text-xs text-slate-500">Ponderaciones: Exámenes (30%), Tareas (40%), Participación (30%). Edita notas en caliente.</p>
                </div>
                <div className={cn(
                  "text-xs font-bold px-3 py-1 rounded-full border shadow-sm",
                  periodStatus === 'abierto' && "bg-emerald-100 text-emerald-900 border-emerald-200",
                  periodStatus === 'en_revisión' && "bg-amber-100 text-amber-900 border-amber-250 animate-pulse",
                  (periodStatus === 'cerrado' || periodStatus === 'publicado') && "bg-red-100 text-red-900 border-red-200"
                )}>
                  {periodStatus === 'abierto' ? 'Modo Edición Habilitado' :
                   periodStatus === 'en_revisión' ? 'Modo Solo Lectura (Revisión)' :
                   'Calificaciones Congeladas (Bloqueado)'}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/30">
                      <TableHead className="font-semibold text-slate-700 pl-6">Estudiante</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Examen 1 (30%)</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Examen 2 (30%)</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Tarea 1 (40%)</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Tarea 2 (40%)</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Part. (30%)</TableHead>
                      <TableHead className="font-semibold text-slate-700 pr-6 text-right">Promedio Final</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradesList.filter(g => g.subject === selectedSubject).map((grade) => (
                      <TableRow key={grade.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-bold text-slate-950 pl-6 text-sm">{grade.studentName}</TableCell>
                        
                        {/* Examen 1 */}
                        <TableCell className="text-center">
                          <input 
                            type="number" 
                            step="0.1" 
                            min="1.0" 
                            max="10.0"
                            disabled={periodStatus !== 'abierto'}
                            defaultValue={grade.notes.exams[0]}
                            onBlur={(e) => handleUpdateGrade(grade.studentId, 'exams', 0, e.target.value)}
                            className="w-14 border border-slate-200 text-center p-1 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-200 text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                          />
                        </TableCell>
                        
                        {/* Examen 2 */}
                        <TableCell className="text-center">
                          <input 
                            type="number" 
                            step="0.1" 
                            min="1.0" 
                            max="10.0"
                            disabled={periodStatus !== 'abierto'}
                            defaultValue={grade.notes.exams[1]}
                            onBlur={(e) => handleUpdateGrade(grade.studentId, 'exams', 1, e.target.value)}
                            className="w-14 border border-slate-200 text-center p-1 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-200 text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                          />
                        </TableCell>
 
                        {/* Tarea 1 */}
                        <TableCell className="text-center">
                          <input 
                            type="number" 
                            step="0.1" 
                            min="1.0" 
                            max="10.0"
                            disabled={periodStatus !== 'abierto'}
                            defaultValue={grade.notes.homeworks[0]}
                            onBlur={(e) => handleUpdateGrade(grade.studentId, 'homeworks', 0, e.target.value)}
                            className="w-14 border border-slate-200 text-center p-1 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-200 text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                          />
                        </TableCell>
 
                        {/* Tarea 2 */}
                        <TableCell className="text-center">
                          <input 
                            type="number" 
                            step="0.1" 
                            min="1.0" 
                            max="10.0"
                            disabled={periodStatus !== 'abierto'}
                            defaultValue={grade.notes.homeworks[1]}
                            onBlur={(e) => handleUpdateGrade(grade.studentId, 'homeworks', 1, e.target.value)}
                            className="w-14 border border-slate-200 text-center p-1 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-200 text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                          />
                        </TableCell>
 
                        {/* Participación */}
                        <TableCell className="text-center">
                          <input 
                            type="number" 
                            step="0.1" 
                            min="1.0" 
                            max="10.0"
                            disabled={periodStatus !== 'abierto'}
                            defaultValue={grade.notes.participation[0]}
                            onBlur={(e) => handleUpdateGrade(grade.studentId, 'participation', 0, e.target.value)}
                            className="w-14 border border-slate-200 text-center p-1 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-200 text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                          />
                        </TableCell>
 
                        {/* Nota Final */}
                        <TableCell className="pr-6 text-right">
                          <span className={cn(
                            "font-extrabold px-3 py-1.5 rounded-lg text-sm shadow-inner inline-block min-w-12 text-center",
                            grade.finalGrade >= 7.0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                          )}>
                            {grade.finalGrade}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          )
        )}

        {/* ========================================================= */}
        {/* ROL: SECRETARÍA (Matrícula Rápida & Certificados Oficiales) */}
        {/* ========================================================= */}
        {userRole === 'secretaria' && (
          <SecretaryConsole
            enrolledStudents={enrolledStudents}
            handleEnroll={handleEnroll}
            newName={newName}
            setNewName={setNewName}
            newGrade={newGrade}
            setNewGrade={setNewGrade}
            newEmail={newEmail}
            setNewEmail={setNewEmail}
            successMsg={successMsg}
            handleGenerateCertificate={handleGenerateCertificate}
            generatedCert={generatedCert}
          />
        )}

        {userRole === 'padre_familia' && (
          <ParentDashboard userName={userName} />
        )}

      </div>

      <DocumentEngine
        isOpen={isDocEngineOpen}
        onClose={() => setIsDocEngineOpen(false)}
        documentType={docEngineType}
        studentId={docEngineStudentId}
        studentName={docEngineStudentName}
        courseName={docEngineCourseName}
        metadataPayload={docEngineMetadata}
      />
    </AppLayout>
  );
}
