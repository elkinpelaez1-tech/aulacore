'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/providers/role-provider';
import {
  Users,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Sparkles,
  FileText,
  BrainCircuit,
  ArrowRight,
  TrendingUp,
  Clock,
  Eye,
  Mail,
  Phone,
  Settings,
  ShieldAlert,
  ArrowDownCircle,
  Award,
  ChevronDown,
  UserCheck,
  Search,
  Filter,
  Users2,
  MessageSquare,
  Send,
  CheckCheck,
  FileSignature
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DocumentEngine } from '@/components/document-engine/DocumentEngine';
import { SchedulePreviewWidget } from './shared/SchedulePreviewWidget';

// =================================================================
// 🏛️ INTERFACES Y CONTRATOS (Group Director)
// =================================================================
interface AcademicPeriod {
  id: string;
  name: string;
  code: string;
  weight: number;
  status: 'active' | 'inactive' | 'closed';
}

interface AcademicSettings {
  grading_scale_type: string;
  min_passing_grade: number;
  min_attendance_percentage: number;
  decimal_places: number;
}

interface StudentGradeConsolidated {
  studentId: string;
  studentName: string;
  subject: string;
  teacherName: string;
  periodCode: string;
  average: number;
  trend: 'up' | 'down' | 'stable';
  status: 'high' | 'medium' | 'risk';
}

interface FamilyControlItem {
  studentName: string;
  parentName: string;
  parentPhone: string;
  lastReviewStatus: 'unread' | 'read_recent' | 'no_activity';
  citationHistory: string;
  citationStatus: 'confirmed' | 'pending' | 'none';
}

interface behavioralTimelineLog {
  id: string;
  studentName: string;
  studentId: string;
  observation_type: 'positive' | 'neutral' | 'mild_negative' | 'severe_negative';
  description: string;
  commitments?: string;
  created_at: string;
  teacherName: string;
}

interface IAAlertCard {
  id: string;
  studentName: string;
  studentId: string;
  riskCategory: 'academic' | 'attendance' | 'behavioral' | 'psychosocial';
  riskLevel: 'low' | 'medium' | 'high';
  probability: number;
  reason: string;
  plan: string;
}

interface ParentDirectorMessage {
  id: string;
  student_id: string;
  sender_role: 'director' | 'padre';
  message_type: 'internal_message' | 'academic_observation' | 'behavioral_followup' | 'automatic_alert';
  content: string;
  read_confirmed: boolean;
  read_at: string | null;
  parent_reply: string | null;
  replied_at: string | null;
  created_at: string;
  priority_level: 'high' | 'medium' | 'low';
  requires_confirmation: boolean;
  confirmation_type: 'simple_read' | 'digital_signature' | 'parent_compromise' | 'academic_committee';
}

// =================================================================
// 📂 MOCK SEED INTEGRAL DE 10-A (Patricia Martínez)
// =================================================================
const MOCK_SETTINGS: AcademicSettings = {
  grading_scale_type: 'numeric_1_5',
  min_passing_grade: 3.00,
  min_attendance_percentage: 80.00,
  decimal_places: 2
};

const MOCK_PERIODS: AcademicPeriod[] = [
  { id: '11111111-1111-1111-2222-333333333333', name: 'Primer Periodo', code: 'P1', weight: 30, status: 'closed' },
  { id: '22222222-2222-2222-2222-333333333333', name: 'Segundo Periodo', code: 'P2', weight: 30, status: 'active' },
  { id: '33333333-3333-3333-2222-333333333333', name: 'Tercer Periodo', code: 'P3', weight: 40, status: 'inactive' }
];

// Notas de los docentes que llegan AUTOMÁTICAMENTE
const MOCK_GRADES_CONSOLIDATED: StudentGradeConsolidated[] = [
  // Alejandro Ortiz (Alto)
  { studentId: 'est-01', studentName: 'Alejandro Ortiz', subject: 'Matemáticas', teacherName: 'Prof. Gómez', periodCode: 'P2', average: 4.50, trend: 'up', status: 'high' },
  { studentId: 'est-01', studentName: 'Alejandro Ortiz', subject: 'Inglés', teacherName: 'Prof. Gómez', periodCode: 'P2', average: 4.80, trend: 'up', status: 'high' },
  { studentId: 'est-01', studentName: 'Alejandro Ortiz', subject: 'Ciencias Naturales', teacherName: 'Prof. Gómez', periodCode: 'P2', average: 4.30, trend: 'stable', status: 'high' },
  { studentId: 'est-01', studentName: 'Alejandro Ortiz', subject: 'Matemáticas', teacherName: 'Prof. Gómez', periodCode: 'P1', average: 4.20, trend: 'stable', status: 'high' },
  { studentId: 'est-01', studentName: 'Alejandro Ortiz', subject: 'Inglés', teacherName: 'Prof. Gómez', periodCode: 'P1', average: 4.60, trend: 'stable', status: 'high' },

  // Sofía Ramírez (Medio/Estable)
  { studentId: 'est-02', studentName: 'Sofía Ramírez', subject: 'Matemáticas', teacherName: 'Prof. Gómez', periodCode: 'P2', average: 3.80, trend: 'up', status: 'medium' },
  { studentId: 'est-02', studentName: 'Sofía Ramírez', subject: 'Inglés', teacherName: 'Prof. Gómez', periodCode: 'P2', average: 4.00, trend: 'up', status: 'medium' },
  { studentId: 'est-02', studentName: 'Sofía Ramírez', subject: 'Ciencias Naturales', teacherName: 'Prof. Gómez', periodCode: 'P2', average: 3.50, trend: 'down', status: 'medium' },
  { studentId: 'est-02', studentName: 'Sofía Ramírez', subject: 'Matemáticas', teacherName: 'Prof. Gómez', periodCode: 'P1', average: 3.50, trend: 'stable', status: 'medium' },
  { studentId: 'est-02', studentName: 'Sofía Ramírez', subject: 'Inglés', teacherName: 'Prof. Gómez', periodCode: 'P1', average: 3.90, trend: 'stable', status: 'medium' },

  // Mateo Gómez (Riesgo Académico)
  { studentId: 'est-03', studentName: 'Mateo Gómez', subject: 'Matemáticas', teacherName: 'Prof. Gómez', periodCode: 'P2', average: 2.80, trend: 'down', status: 'risk' },
  { studentId: 'est-03', studentName: 'Mateo Gómez', subject: 'Inglés', teacherName: 'Prof. Gómez', periodCode: 'P2', average: 3.20, trend: 'stable', status: 'medium' },
  { studentId: 'est-03', studentName: 'Mateo Gómez', subject: 'Ciencias Naturales', teacherName: 'Prof. Gómez', periodCode: 'P2', average: 2.90, trend: 'down', status: 'risk' },
  { studentId: 'est-03', studentName: 'Mateo Gómez', subject: 'Matemáticas', teacherName: 'Prof. Gómez', periodCode: 'P1', average: 3.10, trend: 'stable', status: 'medium' },
  { studentId: 'est-03', studentName: 'Mateo Gómez', subject: 'Inglés', teacherName: 'Prof. Gómez', periodCode: 'P1', average: 3.00, trend: 'stable', status: 'medium' }
];

// Observador Centralizado de Convivencia registrado por Docentes
const MOCK_BEHAVIORAL_TIMELINE: behavioralTimelineLog[] = [
  {
    id: 'beh-01',
    studentName: 'Mateo Gómez',
    studentId: 'est-03',
    observation_type: 'mild_negative',
    description: 'Uso reiterado de distractores móviles durante explicaciones de cinemática en física. Se le llamó la atención de forma respetuosa.',
    commitments: 'El estudiante entregará el teléfono móvil apagado a su acudiente o al casillero escolar al inicio de cada jornada.',
    created_at: '2026-05-24',
    teacherName: 'Prof. Gómez'
  },
  {
    id: 'beh-02',
    studentName: 'Alejandro Ortiz',
    studentId: 'est-01',
    observation_type: 'positive',
    description: 'Excelente monitoría académica voluntaria a compañeros con dificultades durante los talleres grupales de ecuaciones cuadráticas.',
    commitments: undefined,
    created_at: '2026-05-20',
    teacherName: 'Prof. Gómez'
  },
  {
    id: 'beh-03',
    studentName: 'Sofía Ramírez',
    studentId: 'est-02',
    observation_type: 'severe_negative',
    description: 'Inasistencia no justificada a evaluación trimestral de ciencias y reincidencia en llegadas tarde sin excusa médica.',
    commitments: 'Padre de familia se compromete a radicar justificación formal de inasistencia en portería.',
    created_at: '2026-05-18',
    teacherName: 'Lic. Martínez'
  }
];

// Alertas Tempranas IA
const MOCK_IA_ALERTS: IAAlertCard[] = [
  {
    id: 'al-01',
    studentName: 'Sofía Ramírez',
    studentId: 'est-02',
    riskCategory: 'attendance',
    riskLevel: 'high',
    probability: 65,
    reason: 'Asistencia actual del 40% en el Periodo 2, cayendo muy por debajo de la meta mínima institucional (80%). Ausencia de reportes RFID recurrentes.',
    plan: 'Lanzar citación formal presencial con acudiente (Marta Ramírez) y habilitar alerta instantánea de wearable RFID.'
  },
  {
    id: 'al-02',
    studentName: 'Mateo Gómez',
    studentId: 'est-03',
    riskCategory: 'academic',
    riskLevel: 'high',
    probability: 82,
    reason: 'Rendimiento deficiente en materias críticas del Periodo 2: Matemáticas (2.80) y Ciencias (2.90).',
    plan: 'Vincular a plan de mejoramiento guiado en tutorías de la tarde con el Profesor Gómez. Ajustar fechas de recuperación.'
  }
];

// Control de Padres de Familia
const MOCK_FAMILY_CONTROL: FamilyControlItem[] = [
  {
    studentName: 'Sofía Ramírez',
    parentName: 'Marta Ramírez',
    parentPhone: '+57 312 444 5678',
    lastReviewStatus: 'unread',
    citationHistory: 'Citación para el 28 de Mayo - Citación Enviada por inasistencia RFID.',
    citationStatus: 'pending'
  },
  {
    studentName: 'Mateo Gómez',
    parentName: 'Sara Gómez',
    parentPhone: '+57 320 333 9999',
    lastReviewStatus: 'read_recent',
    citationHistory: 'Citación para el 25 de Mayo - Convocatoria de plan remedial por materias críticas.',
    citationStatus: 'confirmed'
  },
  {
    studentName: 'Alejandro Ortiz',
    parentName: 'Carlos Ortiz',
    parentPhone: '+57 301 555 1234',
    lastReviewStatus: 'read_recent',
    citationHistory: 'Reunión de Consejo de Padres - Agradecimiento por liderazgo en Olimpiadas.',
    citationStatus: 'confirmed'
  }
];

export default function GroupDirectorConsole() {
  const { userName, setUserRole } = useRole();

  // --- ENTIDADES Y CONFIGURACIONES ---
  const [settings, setSettings] = useState<AcademicSettings>(MOCK_SETTINGS);
  const [periods, setPeriods] = useState<AcademicPeriod[]>(MOCK_PERIODS);
  const [gradesConsolidated, setGradesConsolidated] = useState<StudentGradeConsolidated[]>(MOCK_GRADES_CONSOLIDATED);
  const [behavioralLogs, setBehavioralLogs] = useState<behavioralTimelineLog[]>(MOCK_BEHAVIORAL_TIMELINE);
  const [iaAlerts, setIaAlerts] = useState<IAAlertCard[]>(MOCK_IA_ALERTS);
  const [familyControl, setFamilyControl] = useState<FamilyControlItem[]>(MOCK_FAMILY_CONTROL);

  // --- FILTROS DE INTERFAZ ---
  const [selectedPeriodCode, setSelectedPeriodCode] = useState<string>('P2'); // Defecto periodo activo P2
  const [searchName, setSearchName] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('all');

  // --- TIMELINE OBSERVADOR FILTROS ---
  const [timelineStudentFilter, setTimelineStudentFilter] = useState('all');
  const [timelineSeverityFilter, setTimelineSeverityFilter] = useState('all');

  // --- ACCIONES INTERACTIVAS ---
  const [notifiedAcudientes, setNotifiedAcudientes] = useState<Record<string, boolean>>({});

  // --- SEGUIMIENTO Y COMUNICACIÓN INSTITUCIONAL ---
  const [messages, setMessages] = useState<ParentDirectorMessage[]>([]);
  const [selectedChatStudentId, setSelectedChatStudentId] = useState<string>('77777777-7777-7777-7777-777777777777');
  const [newMsgContent, setNewMsgContent] = useState<string>('');
  const [newMsgPriority, setNewMsgPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newMsgType, setNewMsgType] = useState<'internal_message' | 'academic_observation' | 'behavioral_followup' | 'automatic_alert'>('academic_observation');
  const [newMsgConfType, setNewMsgConfType] = useState<'simple_read' | 'digital_signature' | 'parent_compromise' | 'academic_committee'>('parent_compromise');
  const [newMsgReqConf, setNewMsgReqConf] = useState<boolean>(true);

  // --- DOCUMENT ENGINE STATES ---
  const [isDocEngineOpen, setIsDocEngineOpen] = useState(false);
  const [docEngineType, setDocEngineType] = useState<any>('annual_consolidated');
  const [docEngineStudentId, setDocEngineStudentId] = useState('');
  const [docEngineStudentName, setDocEngineStudentName] = useState('');
  const [docEngineCourseName, setDocEngineCourseName] = useState('10-A');
  const [docEngineMetadata, setDocEngineMetadata] = useState<any>({});

  // 1. CARGA INICIAL DE SUPABASE (Con fallbacks consistentes)
  useEffect(() => {
    async function loadConsolidatedData() {
      try {
        // Cargar settings del colegio
        const { data: settingsData, error: settingsError } = await supabase
          .from('institution_academic_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (settingsData && !settingsError) {
          setSettings({
            grading_scale_type: settingsData.grading_scale_type,
            min_passing_grade: parseFloat(settingsData.min_passing_grade),
            min_attendance_percentage: parseFloat(settingsData.min_attendance_percentage),
            decimal_places: settingsData.decimal_places
          });
        }

        // Cargar periodos dinámicos del año activo
        const { data: activeYear } = await supabase
          .from('academic_years')
          .select('id')
          .eq('is_active', true)
          .maybeSingle();

        if (activeYear) {
          const { data: periodData, error: periodError } = await supabase
            .from('academic_periods')
            .select('*')
            .eq('academic_year_id', activeYear.id)
            .order('start_date', { ascending: true });

          if (periodData && !periodError) {
            setPeriods(periodData.map((p: any) => ({
              id: p.id,
              name: p.name,
              code: p.code,
              weight: parseFloat(p.weight),
              status: p.status
            })));
          }
        }

        // Cargar calificaciones consolidadas automáticamente desde docentes
        const { data: gradesData } = await supabase
          .from('academic_records')
          .select(`
            student_id,
            grade,
            subject,
            academic_periods (
              code
            ),
            profiles:teacher_id (
              last_name
            ),
            students (
              profiles (
                first_name,
                last_name
              )
            )
          `);

        if (gradesData && gradesData.length > 0) {
          const formattedGrades: StudentGradeConsolidated[] = gradesData.map((g: any) => {
            const gradeVal = parseFloat(g.grade);
            const isPassing = gradeVal >= settings.min_passing_grade;
            return {
              studentId: g.student_id,
              studentName: `${g.students?.profiles?.first_name || ''} ${g.students?.profiles?.last_name || ''}`.trim() || 'Estudiante',
              subject: g.subject,
              teacherName: g.profiles ? `Prof. ${g.profiles.last_name}` : 'Docente',
              periodCode: g.academic_periods?.code || 'P2',
              average: gradeVal,
              trend: gradeVal >= 4.0 ? 'up' : gradeVal < 3.0 ? 'down' : 'stable',
              status: gradeVal >= 4.0 ? 'high' : gradeVal < 3.0 ? 'risk' : 'medium'
            };
          });
          setGradesConsolidated(formattedGrades);
        }

        // Cargar observador estudiantil centralizado
        const { data: behaviorData } = await supabase
          .from('behavioral_logs')
          .select(`
            id,
            observation_type,
            description,
            commitments,
            created_at,
            teacher:teacher_id (
              first_name,
              last_name
            ),
            students (
              profiles (
                first_name,
                last_name
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (behaviorData && behaviorData.length > 0) {
          const formattedBehavior: behavioralTimelineLog[] = behaviorData.map((b: any) => ({
            id: b.id,
            studentName: `${b.students?.profiles?.first_name || ''} ${b.students?.profiles?.last_name || ''}`.trim() || 'Estudiante',
            studentId: b.students?.profiles?.id || '',
            observation_type: b.observation_type,
            description: b.description,
            commitments: b.commitments,
            created_at: b.created_at.split('T')[0],
            teacherName: b.teacher ? `${b.teacher.first_name} ${b.teacher.last_name}` : 'Coordinador'
          }));
          setBehavioralLogs(formattedBehavior);
        }

        // Cargar mensajes de comunicación oficial con acudientes
        const { data: msgData, error: msgError } = await supabase
          .from('parent_director_messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (msgData && !msgError) {
          setMessages(msgData as ParentDirectorMessage[]);
        } else {
          // Fallback con mock estructurado si no hay conexión
          setMessages([
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
          ]);
        }
      } catch (err) {
        console.warn('Supabase fetch failed in GroupDirectorConsole, utilizing premium structured mocks fallbacks:', err);
      }
    }

    loadConsolidatedData();
  }, []);

  // =================================================================
  // 🧮 MOTOR ANALÍTICO - CONSOLIDACIÓN AUTOMÁTICA DEL CURSO 10-A
  // =================================================================

  // A. Filtrado por periodo para las métricas consolidadas
  const periodGrades = selectedPeriodCode === 'all'
    ? gradesConsolidated
    : gradesConsolidated.filter(g => g.periodCode === selectedPeriodCode);

  // B. Cálculos consolidados del grupo
  const groupGPA = periodGrades.length > 0
    ? periodGrades.reduce((acc, curr) => acc + curr.average, 0) / periodGrades.length
    : 0;

  // Asistencia consolidada para el grupo en P2
  const groupAttendanceRate = selectedPeriodCode === 'P2' ? 82.3 : selectedPeriodCode === 'P1' ? 91.5 : 86.9;

  // Contadores dinámicos
  const activeAlertsCount = iaAlerts.length;
  const criticalStudentsCount = iaAlerts.filter(a => a.riskLevel === 'high').length;

  // Comportamiento del grupo
  const groupBehaviorIndex = 91.4; // 91.4% de comportamiento positivo

  // C. Ranking Académico del Curso 10-A (GPA consolidado acumulado)
  const calculateStudentRanking = () => {
    const studentAverages: Record<string, { name: string; sum: number; count: number }> = {};
    
    // Usamos todas las notas para el promedio acumulado general de la materia
    gradesConsolidated.forEach(g => {
      if (!studentAverages[g.studentId]) {
        studentAverages[g.studentId] = { name: g.studentName, sum: 0, count: 0 };
      }
      studentAverages[g.studentId].sum += g.average;
      studentAverages[g.studentId].count += 1;
    });

    return Object.entries(studentAverages)
      .map(([id, s]) => ({
        id,
        name: s.name,
        gpa: s.sum / s.count
      }))
      .sort((a, b) => b.gpa - a.gpa);
  };

  const academicRanking = calculateStudentRanking();

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgContent.trim()) return;

    const newLog = {
      student_id: selectedChatStudentId,
      sender_role: 'director' as const,
      message_type: newMsgType,
      content: newMsgContent,
      priority_level: newMsgPriority,
      requires_confirmation: newMsgReqConf,
      confirmation_type: newMsgConfType,
      read_confirmed: false,
      read_at: null,
      parent_reply: null,
      replied_at: null,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('parent_director_messages')
        .insert(newLog)
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        setMessages(prev => [data as ParentDirectorMessage, ...prev]);
      } else {
        const simulatedMessage: ParentDirectorMessage = {
          id: 'sim-' + Math.random().toString(36).substr(2, 9),
          ...newLog
        };
        setMessages(prev => [simulatedMessage, ...prev]);
      }
    } catch (err) {
      console.error('Error enviando comunicación institucional:', err);
      const simulatedMessage: ParentDirectorMessage = {
        id: 'sim-' + Math.random().toString(36).substr(2, 9),
        ...newLog
      };
      setMessages(prev => [simulatedMessage, ...prev]);
    }

    setNewMsgContent('');
    alert('✓ Registro de Comunicación Oficial completado y transmitido al acudiente.');
  };

  // =================================================================
  // 💼 MOTOR ANALÍTICO - CONSOLIDADO ACADÉMICO FINAL
  // =================================================================
  const uniqueStudentIds = Array.from(new Set(gradesConsolidated.map(g => g.studentId)));

  const consolidadoFinalAnual = uniqueStudentIds.map(studentId => {
    const studentGrades = gradesConsolidated.filter(g => g.studentId === studentId);
    const studentName = studentGrades[0]?.studentName || 'Estudiante';
    
    // Asignaturas únicas
    const uniqueSubjects = Array.from(new Set(studentGrades.map(g => g.subject)));
    
    const promediosPorMateria: Record<string, number> = {};
    let sumOfSubjectFinals = 0;
    let activeSubjectCount = 0;
    let failingSubjectsCount = 0;
    
    uniqueSubjects.forEach(subject => {
      const subjectGrades = studentGrades.filter(g => g.subject === subject);
      
      let weightedSum = 0;
      let totalWeight = 0;
      
      subjectGrades.forEach(sg => {
        const periodObj = periods.find(p => p.code === sg.periodCode);
        const weight = periodObj ? periodObj.weight : 30;
        
        weightedSum += sg.average * weight;
        totalWeight += weight;
      });
      
      const finalSubjectGrade = totalWeight > 0 ? (weightedSum / totalWeight) : 0;
      promediosPorMateria[subject] = parseFloat(finalSubjectGrade.toFixed(settings.decimal_places));
      
      if (finalSubjectGrade > 0) {
        sumOfSubjectFinals += finalSubjectGrade;
        activeSubjectCount++;
        if (finalSubjectGrade < settings.min_passing_grade) {
          failingSubjectsCount++;
        }
      }
    });
    
    const finalWeightedGPA = activeSubjectCount > 0 ? (sumOfSubjectFinals / activeSubjectCount) : 0;
    
    // Asistencia acumulada
    let attendanceRate = 95.0;
    if (studentId === 'est-01' || studentId === '77777777-7777-7777-7777-777777777777') {
      attendanceRate = 98.2;
    } else if (studentId === 'est-02' || studentId === '88888888-8888-8888-8888-888888888888') {
      attendanceRate = 72.5;
    } else if (studentId === 'est-03' || studentId === '99999999-9999-9999-9999-999999999999') {
      attendanceRate = 81.0;
    }
    
    // Convivencia
    const studentBehaviorLogs = behavioralLogs.filter(b => b.studentId === studentId);
    const positiveBehaviorCount = studentBehaviorLogs.filter(b => b.observation_type === 'positive').length;
    const severeBehaviorCount = studentBehaviorLogs.filter(b => b.observation_type === 'severe_negative').length;
    const mildBehaviorCount = studentBehaviorLogs.filter(b => b.observation_type === 'mild_negative').length;
    
    // Alertas activas
    const activeAlerts = iaAlerts.filter(a => a.studentId === studentId).length;
    
    // Determinar Estado Académico Final
    let finalAcademicStatus: 'Aprobado' | 'Reprobado' | 'Pendiente' | 'Recuperación' | 'Promoción Anticipada' | 'Comité Académico' = 'Pendiente';
    
    const hasPendingGrades = uniqueSubjects.some(subject => {
      const subjectGrades = studentGrades.filter(g => g.subject === subject);
      const hasP1 = subjectGrades.some(sg => sg.periodCode === 'P1');
      const hasP2 = subjectGrades.some(sg => sg.periodCode === 'P2');
      return !hasP1 || !hasP2;
    });
    
    if (hasPendingGrades) {
      finalAcademicStatus = 'Pendiente';
    } else if (finalWeightedGPA >= 4.70 && attendanceRate >= 98.0 && severeBehaviorCount === 0) {
      finalAcademicStatus = 'Promoción Anticipada';
    } else if (failingSubjectsCount >= 3 || attendanceRate < (settings.min_attendance_percentage - 15)) {
      finalAcademicStatus = 'Reprobado';
    } else if (failingSubjectsCount === 1 || failingSubjectsCount === 2) {
      finalAcademicStatus = 'Recuperación';
    } else if (severeBehaviorCount >= 2 || (finalWeightedGPA >= settings.min_passing_grade && attendanceRate < settings.min_attendance_percentage)) {
      finalAcademicStatus = 'Comité Académico';
    } else if (finalWeightedGPA >= settings.min_passing_grade && attendanceRate >= settings.min_attendance_percentage) {
      finalAcademicStatus = 'Aprobado';
    }
    
    return {
      studentId,
      studentName,
      subjects: promediosPorMateria,
      finalGPA: parseFloat(finalWeightedGPA.toFixed(settings.decimal_places)),
      attendance: attendanceRate,
      behaviorCounts: {
        positive: positiveBehaviorCount,
        mild: mildBehaviorCount,
        severe: severeBehaviorCount
      },
      activeAlerts,
      status: finalAcademicStatus
    };
  });

  // D. Filtros dinámicos de la tabla de calificaciones
  const filteredGradesTable = periodGrades.filter(g => {
    const matchesSearch = g.studentName.toLowerCase().includes(searchName.toLowerCase());
    const matchesSubject = selectedSubjectFilter === 'all' || g.subject === selectedSubjectFilter;
    const matchesRisk = selectedRiskFilter === 'all' || 
                        (selectedRiskFilter === 'risk' && g.average < settings.min_passing_grade) ||
                        (selectedRiskFilter === 'high' && g.average >= 4.0) ||
                        (selectedRiskFilter === 'medium' && g.average >= 3.0 && g.average < 4.0);

    return matchesSearch && matchesSubject && matchesRisk;
  });

  // Convivencia: Tally de anotaciones
  const positiveLogs = behavioralLogs.filter(b => b.observation_type === 'positive').length;
  const mildLogs = behavioralLogs.filter(b => b.observation_type === 'mild_negative').length;
  const severeLogs = behavioralLogs.filter(b => b.observation_type === 'severe_negative').length;

  // E. Filtros dinámicos de la línea de tiempo del observador
  const filteredTimeline = behavioralLogs.filter(b => {
    const matchesStudent = timelineStudentFilter === 'all' || b.studentId === timelineStudentFilter;
    const matchesSeverity = timelineSeverityFilter === 'all' || 
                           (timelineSeverityFilter === 'positive' && b.observation_type === 'positive') ||
                           (timelineSeverityFilter === 'mild' && b.observation_type === 'mild_negative') ||
                           (timelineSeverityFilter === 'severe' && b.observation_type === 'severe_negative');
    
    return matchesStudent && matchesSeverity;
  });

  const handleNotifyAcudiente = (studentName: string) => {
    setNotifiedAcudientes(prev => ({ ...prev, [studentName]: true }));
    setTimeout(() => {
      setNotifiedAcudientes(prev => ({ ...prev, [studentName]: false }));
    }, 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================= */}
      {/* CABECERA DE DIRECCIÓN DE GRUPO */}
      {/* ========================================================= */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-900 p-6 rounded-2xl text-white shadow-lg border border-purple-800">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-purple-300 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-purple-255">Director de Grupo: {userName}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mt-1.5">Consola de Dirección (10-A)</h1>
          <p className="text-base text-slate-200 mt-1.5 leading-relaxed">
            Consolidado en tiempo real de calificaciones, comportamiento RFID y alertas directas enviadas por docentes
          </p>
        </div>
        
        {/* Selector de Periodo Analítico */}
        <div className="flex items-center gap-2.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 select-none shadow-inner shrink-0 w-full xl:w-auto">
          <span className="text-xs text-slate-350 font-bold pl-2 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-300" />
            Filtro de Análisis:
          </span>
          <select
            value={selectedPeriodCode}
            onChange={(e) => setSelectedPeriodCode(e.target.value)}
            className="border-none bg-transparent rounded px-2.5 py-1 text-xs focus:outline-none cursor-pointer font-black text-white"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.code} className="bg-slate-800 text-white font-black">
                {p.name} ({p.weight}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CONSOLA HÍBRIDA - ATAJOS DE DOCENCIA */}
      {/* ========================================================= */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20 shadow-sm shrink-0">
            <BookOpen className="w-5 h-5 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              Acceso Híbrido: Profesor de Asignatura Activo
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                Rol Dual Sincronizado
              </span>
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              También tienes asignaciones de enseñanza directa para Matemáticas y Física en este período.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-xs bg-slate-105 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-extrabold">
            <span>Matemáticas 10-A: </span>
            <span className="text-slate-500 font-semibold">15 pendientes</span>
          </div>
          <div className="text-xs bg-slate-105 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-extrabold">
            <span>Física 10-A: </span>
            <span className="text-slate-500 font-semibold">Sin calificar</span>
          </div>
          <Button
            onClick={() => setUserRole('docente')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm flex items-center gap-1.5 h-9 border-none cursor-pointer rounded-lg"
          >
            Conmutar a Vista Docente
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECCIÓN 1: RESUMEN GENERAL DEL CURSO (KPIs & RANKING) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* KPIs Consolidados */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Promedio General del Grupo */}
          <Card className="border-slate-250/70 shadow-sm bg-white hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between">
            <CardContent className="p-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Promedio del Grupo</span>
              <h4 className={cn(
                "text-3xl font-black mt-2 leading-none",
                groupGPA >= settings.min_passing_grade ? "text-slate-900" : "text-red-650"
              )}>
                {groupGPA.toFixed(settings.decimal_places)} <span className="text-xs text-slate-450 font-bold">/ 5.00</span>
              </h4>
              <p className="text-[10px] text-slate-500 font-semibold mt-3 pt-2.5 border-t border-slate-100 flex justify-between">
                <span>Rendimiento general del 10-A</span>
                <span className="text-emerald-600 font-bold">Aprobatorio</span>
              </p>
            </CardContent>
          </Card>

          {/* Asistencia RFID Promedio */}
          <Card className="border-slate-250/70 shadow-sm bg-white hover:shadow-md transition duration-200 flex flex-col justify-between">
            <CardContent className="p-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Asistencia Promedio</span>
              <h4 className={cn(
                "text-3xl font-black mt-2 leading-none",
                groupAttendanceRate >= settings.min_attendance_percentage ? "text-slate-900" : "text-red-650"
              )}>
                {groupAttendanceRate.toFixed(1)}%
              </h4>
              <p className="text-[10px] text-slate-500 font-semibold mt-3 pt-2.5 border-t border-slate-100 flex justify-between">
                <span>Meta requerida: {settings.min_attendance_percentage.toFixed(0)}%</span>
                <span className={cn(
                  "font-bold",
                  groupAttendanceRate >= settings.min_attendance_percentage ? "text-emerald-600" : "text-red-600 animate-pulse"
                )}>
                  {groupAttendanceRate >= settings.min_attendance_percentage ? 'Estable' : 'Riesgo Crítico'}
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Comportamiento del Grupo */}
          <Card className="border-slate-250/70 shadow-sm bg-white hover:shadow-md transition duration-200 flex flex-col justify-between">
            <CardContent className="p-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Índice Convivencia</span>
              <h4 className="text-3xl font-black mt-2 leading-none text-purple-750">
                {groupBehaviorIndex.toFixed(1)}%
              </h4>
              <p className="text-[10px] text-slate-500 font-semibold mt-3 pt-2.5 border-t border-slate-100 flex justify-between">
                <span>Anotaciones Totales: {behavioralLogs.length}</span>
                <span className="text-purple-600 font-bold">Clima Positivo</span>
              </p>
            </CardContent>
          </Card>

          {/* Estudiantes en Riesgo Alerta */}
          <Card className="border-slate-250/70 shadow-sm bg-white hover:shadow-md transition duration-200 flex flex-col justify-between border-l-4 border-l-red-500">
            <CardContent className="p-5">
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block">Riesgo Crítico IA</span>
              <h4 className="text-3xl font-black mt-2 leading-none text-red-700 animate-pulse">
                {criticalStudentsCount} <span className="text-xs text-slate-450 font-bold">alumnos</span>
              </h4>
              <p className="text-[10px] text-slate-500 font-semibold mt-3 pt-2.5 border-t border-slate-100 flex justify-between">
                <span>Alertas de intervención abiertas</span>
                <span className="text-red-655 font-bold">Requiere acción</span>
              </p>
            </CardContent>
          </Card>

          {/* Alertas Tempranas Activas */}
          <Card className="border-slate-250/70 shadow-sm bg-white hover:shadow-md transition duration-200 flex flex-col justify-between border-l-4 border-l-amber-500">
            <CardContent className="p-5">
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">Alertas Activas Docentes</span>
              <h4 className="text-3xl font-black mt-2 leading-none text-amber-600">
                {activeAlertsCount} <span className="text-xs text-slate-450 font-bold">notificaciones</span>
              </h4>
              <p className="text-[10px] text-slate-500 font-semibold mt-3 pt-2.5 border-t border-slate-100 flex justify-between">
                <span>Seguimiento de nivelaciones</span>
                <span className="text-amber-700 font-bold">En revisión</span>
              </p>
            </CardContent>
          </Card>

          {/* Estado de Aprobación Mínima */}
          <Card className="border-slate-250/70 shadow-sm bg-white hover:shadow-md transition duration-200 flex flex-col justify-between">
            <CardContent className="p-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Configuración Académica</span>
              <h4 className="text-lg font-black mt-2 leading-tight text-slate-900 uppercase">
                {settings.grading_scale_type.replace('_', ' ')}
              </h4>
              <p className="text-[10px] text-slate-500 font-semibold mt-3 pt-2.5 border-t border-slate-100 flex justify-between">
                <span>Nota Aprobatoria: {settings.min_passing_grade.toFixed(2)}</span>
                <span className="text-slate-400 font-extrabold uppercase">Dec. {settings.decimal_places}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ranking Académico (Linear style) */}
        <Card className="border-slate-250/70 shadow-sm bg-white rounded-xl overflow-hidden flex flex-col justify-between h-full">
          <CardHeader className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <CardTitle className="text-xs font-black uppercase text-slate-900 tracking-wider">Ranking del Curso (10-A)</CardTitle>
            <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-655 font-extrabold">GPA Acumulado</span>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto max-h-56 divide-y divide-slate-100">
            {academicRanking.map((r, idx) => (
              <div key={r.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                    idx === 0 ? "bg-yellow-100 text-yellow-800" :
                    idx === 1 ? "bg-slate-100 text-slate-800" :
                    idx === 2 ? "bg-orange-50 text-orange-800" : "bg-slate-50 text-slate-400"
                  )}>
                    {idx + 1}
                  </span>
                  <span className="text-xs font-black truncate text-slate-900">{r.name}</span>
                </div>
                <span className={cn(
                  "text-xs font-black",
                  r.gpa >= settings.min_passing_grade ? "text-emerald-700" : "text-red-700 animate-pulse"
                )}>
                  {r.gpa.toFixed(2)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* SECCIÓN 1.5: PLANEACIÓN DE HORARIOS DEL CURSO             */}
      {/* ========================================================= */}
      <div className="mb-6">
        <SchedulePreviewWidget role="director" courseName="10-A" />
      </div>

      {/* ========================================================= */}
      {/* SECCIÓN 2: CONSOLIDADO AUTOMÁTICO DE NOTAS (Power BI Grid) */}
      {/* ========================================================= */}
      <Card className="border-slate-250/70 shadow-sm overflow-hidden bg-white rounded-xl">
        <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-slate-850" />
              Consolidado Automático de Notas (Libro de Calificaciones Centralizado)
            </CardTitle>
            <p className="text-xs text-slate-450 mt-0.5 font-semibold">Notas registradas directamente por los Docentes. Filtrado y ordenación Power BI</p>
          </div>
          
          {/* Controles de Filtrado */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Filtro Estudiante Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por estudiante..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-[11px] font-semibold w-40 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-white text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Filtro Materias */}
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] bg-white focus:outline-none cursor-pointer font-bold text-slate-700"
            >
              <option value="all">Todas las Materias</option>
              <option value="Matemáticas">Matemáticas</option>
              <option value="Inglés">Inglés</option>
              <option value="Ciencias Naturales">Ciencias Naturales</option>
            </select>

            {/* Filtro Estado Riesgo */}
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] bg-white focus:outline-none cursor-pointer font-bold text-slate-700"
            >
              <option value="all">Todos los Rendimientos</option>
              <option value="high">Desempeño Alto (&gt;= 4.0)</option>
              <option value="medium">Desempeño Básico (3.0 a 3.9)</option>
              <option value="risk">Reprobando / En Riesgo (&lt; 3.0)</option>
            </select>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Estudiante</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs">Asignatura</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs">Docente</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Periodo</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Calificación Promedio</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Tendencia</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Estado Escolar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGradesTable.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-8 text-center text-xs text-slate-400 font-semibold">
                    No se registran calificaciones que coincidan con los criterios de filtrado seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredGradesTable.map((g, idx) => {
                  const isPassing = g.average >= settings.min_passing_grade;
                  return (
                    <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-black text-slate-950 text-sm pl-6">{g.studentName}</TableCell>
                      <TableCell className="font-bold text-slate-800 text-xs">{g.subject}</TableCell>
                      <TableCell className="text-xs text-slate-500 font-semibold">{g.teacherName}</TableCell>
                      <TableCell className="text-center font-extrabold text-slate-850 text-xs">{g.periodCode}</TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "font-black text-xs px-2.5 py-1 rounded-lg border shadow-inner inline-block min-w-12 text-center",
                          isPassing ? "bg-emerald-50 text-emerald-700 border-emerald-150" : "bg-red-50 text-red-750 border-red-200 animate-pulse"
                        )}>
                          {g.average.toFixed(settings.decimal_places)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-extrabold text-slate-700 text-xs">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-black",
                          g.trend === 'up' && "text-emerald-600 bg-emerald-50/50",
                          g.trend === 'down' && "text-red-600 bg-red-50/50 animate-pulse",
                          g.trend === 'stable' && "text-slate-500 bg-slate-100"
                        )}>
                          {g.trend === 'up' ? '↑ Sube' : g.trend === 'down' ? '↓ Baja' : '→ Estable'}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <span className={cn(
                          "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                          g.status === 'high' && "bg-emerald-100 text-emerald-800 border-emerald-200",
                          g.status === 'medium' && "bg-slate-100 text-slate-600 border-slate-200",
                          g.status === 'risk' && "bg-red-100 text-red-800 border-red-200 animate-pulse"
                        )}>
                          {g.status === 'high' ? 'Alto' : g.status === 'medium' ? 'Básico' : 'Riesgo Académico'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* SECCIÓN 3 & 4: PANEL DE CONVIVENCIA Y ALERTAS TEMPRANAS IA */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel de Convivencia Consolidado */}
        <Card className="border-slate-250/70 shadow-sm bg-white rounded-xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-5 py-4">
            <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-slate-800" />
              Panel de Convivencia Consolidado del Aula
            </CardTitle>
            <p className="text-xs text-slate-450 mt-0.5 font-semibold">Registro automático de comportamiento enviado por docentes a portería</p>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6 flex-1">
            {/* Tally de Convivencia General */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                <span className="text-[10px] font-black text-emerald-800 uppercase block tracking-wider">Positivas</span>
                <h4 className="text-2xl font-black text-emerald-700 mt-1">{positiveLogs}</h4>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
                <span className="text-[10px] font-black text-blue-800 uppercase block tracking-wider">Leves</span>
                <h4 className="text-2xl font-black text-blue-700 mt-1">{mildLogs}</h4>
              </div>
              <div className="bg-red-50 border border-red-150 p-3 rounded-xl">
                <span className="text-[10px] font-black text-red-800 uppercase block tracking-wider">Graves</span>
                <h4 className="text-2xl font-black text-red-700 mt-1">{severeLogs}</h4>
              </div>
              <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl">
                <span className="text-[10px] font-black text-slate-655 uppercase block tracking-wider">Gravísimas</span>
                <h4 className="text-2xl font-black text-slate-700 mt-1">0</h4>
              </div>
            </div>

            {/* Compromisos y Reincidencias */}
            <div className="space-y-4 pt-2">
              <h5 className="text-xs font-black uppercase text-slate-800 tracking-wider">Control de Compromisos y Reincidencias</h5>
              
              <div className="space-y-3.5">
                {/* Estudiante 1 */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-xs font-black text-slate-900 block leading-tight">Mateo Gómez</span>
                    <span className="text-[10px] text-red-700 font-bold block">Compromiso Activo: Casillero de distractores</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs bg-red-100 text-red-800 font-black px-2 py-0.5 rounded border border-red-200 uppercase">1 Reincidencia</span>
                  </div>
                </div>

                {/* Estudiante 2 */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-xs font-black text-slate-900 block leading-tight">Sofía Ramírez</span>
                    <span className="text-[10px] text-red-700 font-bold block">Compromiso Activo: Presentación de excusa formal</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs bg-amber-50 text-amber-800 font-black px-2 py-0.5 rounded border border-amber-250 uppercase">0 Reincidencias</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas Tempranas IA */}
        <Card className="border-slate-250/70 shadow-sm bg-white rounded-xl overflow-hidden flex flex-col justify-between border-l-4 border-l-red-500">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-5 py-4">
            <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
              <BrainCircuit className="w-4.5 h-4.5 text-red-700 animate-pulse" />
              Módulo IA Predictivo - Alertas Tempranas del 10-A
            </CardTitle>
            <p className="text-xs text-slate-450 mt-0.5 font-semibold">Cálculo de probabilidad de reprobación y planes de apoyo automático</p>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4 flex-1">
            {iaAlerts.map(al => {
              const isHigh = al.riskLevel === 'high';
              return (
                <div key={al.id} className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50 space-y-3 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h5 className="text-sm font-black text-slate-950">{al.studentName}</h5>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Categoría: {al.riskCategory === 'attendance' ? 'Ausentismo' : 'Rendimiento Académico'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-red-100 text-red-800 font-black px-2.5 py-1 rounded-lg border border-red-200 block text-center uppercase tracking-wider">
                        Riesgo {al.probability}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    <strong>Motivo de Alerta:</strong> "{al.reason}"
                  </p>

                  <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs font-semibold text-slate-800 leading-relaxed shadow-sm border-l-2 border-l-slate-900">
                    <span className="text-slate-950 font-black flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-spin" />
                      Plan de Intervención Recomendado por AulaCore IA:
                    </span>
                    <p className="mt-1 text-slate-650 font-medium">
                      {al.plan}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* SECCIÓN 5: CONTROL DE PADRES DE FAMILIA (Seguimiento Familiar) */}
      {/* ========================================================= */}
      <Card className="border-slate-250/70 shadow-sm overflow-hidden bg-white rounded-xl">
        <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
            <UserCheck className="w-4.5 h-4.5 text-slate-850" />
            Control de Padres de Familia & Seguimiento Familiar (10-A)
          </CardTitle>
          <p className="text-xs text-slate-450 mt-0.5 font-semibold">Auditoría de visualización de notificaciones RFID por acudientes e historial de citaciones trimestrales</p>
        </CardHeader>
        
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Estudiante</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs">Acudiente / Contacto</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs">Lectura de Notificaciones RFID</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs">Historial de Citación Oficial</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Estado Citación</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Intervención</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {familyControl.map((f, idx) => (
                <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-black text-slate-955 text-sm pl-6">{f.studentName}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 block leading-none">{f.parentName}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{f.parentPhone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded font-black border uppercase",
                      f.lastReviewStatus === 'unread' && "bg-red-50 text-red-800 border-red-200 animate-pulse",
                      f.lastReviewStatus === 'read_recent' && "bg-emerald-50 text-emerald-800 border-emerald-250",
                      f.lastReviewStatus === 'no_activity' && "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                      {f.lastReviewStatus === 'unread' ? 'Sin Revisar (Grave)' : 'Revisado Recientemente' }
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-655 max-w-sm truncate leading-snug">
                    {f.citationHistory}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                      f.citationStatus === 'confirmed' && "bg-emerald-100 text-emerald-800 border-emerald-200",
                      f.citationStatus === 'pending' && "bg-amber-100 text-amber-800 border-amber-200 animate-pulse",
                      f.citationStatus === 'none' && "bg-slate-100 text-slate-655 border-slate-200"
                    )}>
                      {f.citationStatus === 'confirmed' ? 'Confirmado' : f.citationStatus === 'pending' ? 'Pendiente' : 'Ninguna'}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button
                      onClick={() => handleNotifyAcudiente(f.studentName)}
                      variant={notifiedAcudientes[f.studentName] ? "secondary" : "outline"}
                      size="sm"
                      className="rounded-lg text-[10px] font-black h-8 shrink-0 transition"
                    >
                      {notifiedAcudientes[f.studentName] ? "✓ WhatsApp Enviado" : "Disparar Alerta WhatsApp"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 🏛️ SECCIÓN: SEGUIMIENTO Y TRAZABILIDAD INSTITUCIONAL CON ACUDIENTES */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        
        {/* Historial de Trazabilidad Oficial */}
        <div className="lg:col-span-2">
          <Card className="border-slate-250/70 shadow-sm overflow-hidden bg-white rounded-xl h-full flex flex-col">
            <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-700" />
                  Bandeja de Trazabilidad y Comunicados Oficiales
                </CardTitle>
                <p className="text-xs text-slate-450 mt-0.5 font-semibold">
                  Registro histórico auditable de notificaciones, descargos y compromisos vinculantes con acudientes.
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 overflow-y-auto max-h-[580px] space-y-4 bg-slate-50/40">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" />
                  <p className="text-xs font-bold">No hay registros de trazabilidad oficiales en el historial.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const studentObj = MOCK_FAMILY_CONTROL.find(
                    f => f.studentName.toLowerCase().includes("sofía") && msg.student_id.startsWith("8888") ||
                         f.studentName.toLowerCase().includes("alejandro") && msg.student_id.startsWith("7777") ||
                         f.studentName.toLowerCase().includes("mateo") && msg.student_id.startsWith("9999")
                  );
                  const studentName = studentObj ? studentObj.studentName : 'Alejandro Ortiz';
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "bg-white p-5 rounded-xl border transition shadow-sm space-y-3 animate-fade-in",
                        msg.priority_level === 'high' ? "border-red-200 hover:border-red-300 bg-gradient-to-r from-red-50/10 to-transparent" :
                        msg.priority_level === 'medium' ? "border-amber-200 hover:border-amber-300 bg-gradient-to-r from-amber-50/10 to-transparent" :
                        "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{studentName}</span>
                          <span className="text-[10px] text-slate-350 font-semibold">•</span>
                          <span className="text-[11px] text-slate-500 font-bold">
                            {new Date(msg.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Priority Level */}
                          <span className={cn(
                            "text-[9px] font-black px-2 py-0.5 rounded-full border tracking-wide uppercase leading-none",
                            msg.priority_level === 'high' ? "bg-red-50 text-red-700 border-red-200 animate-pulse" :
                            msg.priority_level === 'medium' ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-slate-50 text-slate-655 border-slate-200"
                          )}>
                            Prioridad: {msg.priority_level === 'high' ? 'Alta' : msg.priority_level === 'medium' ? 'Media' : 'Baja'}
                          </span>
                          {/* Type */}
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-150 leading-none">
                            {msg.message_type === 'academic_observation' ? 'Observación Académica' :
                             msg.message_type === 'behavioral_followup' ? 'Seguimiento Convivencial' :
                             msg.message_type === 'automatic_alert' ? 'Alerta RFID' : 'Mensaje Interno'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        {msg.content}
                      </p>

                      {/* Audit Checkboxes and Parent Reply */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-50">
                        
                        {/* Reading Confirmation Audit */}
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50/30 p-2 rounded-lg border border-slate-100">
                          {msg.read_confirmed ? (
                            <div className="flex items-center gap-1.5 text-emerald-600">
                              <CheckCheck className="w-4 h-4" />
                              <span>Leído por el Acudiente</span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                ({new Date(msg.read_at!).toLocaleDateString('es-ES', { hour: '2-digit', minute: '2-digit' })})
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Clock className="w-4 h-4 animate-pulse" />
                              <span>Pendiente de Lectura</span>
                            </div>
                          )}
                        </div>

                        {/* Confirmation Requirements / Expansion Preps */}
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50/30 p-2 rounded-lg border border-slate-100">
                          {msg.requires_confirmation ? (
                            <div className="flex items-center gap-1.5">
                              <FileSignature className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span>Requerido: </span>
                              <span className="text-purple-700 font-extrabold uppercase text-[9px] bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                {msg.confirmation_type === 'digital_signature' ? 'Firma Digital' :
                                 msg.confirmation_type === 'parent_compromise' ? 'Compromiso' :
                                 msg.confirmation_type === 'academic_committee' ? 'Citación Comité' : 'Lectura Simple'}
                              </span>
                            </div>
                          ) : (
                            <div className="text-slate-400 font-medium text-[11px]">Sin requerimientos de firma</div>
                          )}
                        </div>

                      </div>

                      {/* Parent reply message */}
                      {msg.parent_reply && (
                        <div className="bg-emerald-50/40 border border-emerald-250 p-3.5 rounded-xl space-y-1.5 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full">
                              Respuesta Oficial del Acudiente
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {new Date(msg.replied_at!).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-tight italic font-semibold">
                            "{msg.parent_reply}"
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Formulario de Notificaciones Oficiales */}
        <div className="lg:col-span-1">
          <Card className="border-slate-250/70 shadow-sm bg-white rounded-xl h-full flex flex-col">
            <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-750" />
                Registrar Notificación Oficial
              </CardTitle>
              <p className="text-xs text-slate-450 mt-0.5 font-semibold">
                Emitir alertas, observaciones académicas o requerimientos de firma al acudiente.
              </p>
            </CardHeader>
            <CardContent className="p-6 flex-1">
              <form onSubmit={handleSendNotification} className="space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Estudiante */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-wide">Estudiante Destinatario</label>
                    <select
                      value={selectedChatStudentId}
                      onChange={(e) => setSelectedChatStudentId(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-850 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white cursor-pointer"
                    >
                      <option value="77777777-7777-7777-7777-777777777777">Alejandro Ortiz (Carlos Ortiz)</option>
                      <option value="88888888-8888-8888-8888-888888888888">Sofía Ramírez (Marta Ramírez)</option>
                      <option value="99999999-9999-9999-9999-999999999999">Mateo Gómez (Sara Gómez)</option>
                    </select>
                  </div>

                  {/* Tipo de Notificación */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-wide">Tipo de Comunicado</label>
                    <select
                      value={newMsgType}
                      onChange={(e) => setNewMsgType(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-850 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white cursor-pointer"
                    >
                      <option value="academic_observation">Observación Académica Oficial</option>
                      <option value="behavioral_followup">Seguimiento Convivencial Disciplinario</option>
                      <option value="automatic_alert">Alerta Extraordinaria / RFID</option>
                      <option value="internal_message">Mensaje Interno Administrativo</option>
                    </select>
                  </div>

                  {/* Nivel de Prioridad */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-wide">Nivel de Prioridad</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setNewMsgPriority(level as any)}
                          className={cn(
                            "px-2 py-1.5 text-[10px] font-black rounded-lg border uppercase transition tracking-wider cursor-pointer",
                            newMsgPriority === level ? (
                              level === 'high' ? "bg-red-50 text-red-700 border-red-300 ring-2 ring-red-100" :
                              level === 'medium' ? "bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-100" :
                              "bg-slate-100 text-slate-800 border-slate-350"
                            ) : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          {level === 'high' ? 'Alta' : level === 'medium' ? 'Media' : 'Baja'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Requerir Confirmación Checkbox y Tipo */}
                  <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-155">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide">¿Requiere Acción / Firma?</span>
                      <input
                        type="checkbox"
                        checked={newMsgReqConf}
                        onChange={(e) => setNewMsgReqConf(e.target.checked)}
                        className="w-4 h-4 text-purple-650 focus:ring-purple-500 border-slate-300 rounded cursor-pointer"
                      />
                    </div>

                    {newMsgReqConf && (
                      <div className="space-y-1.5 border-t border-slate-200 pt-2 animate-fade-in">
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-wide">Tipo de Acción Requerida</label>
                        <select
                          value={newMsgConfType}
                          onChange={(e) => setNewMsgConfType(e.target.value as any)}
                          className="w-full border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white cursor-pointer"
                        >
                          <option value="parent_compromise">Firma de Compromiso de Acudiente</option>
                          <option value="digital_signature">Firma Digital del Acta Académica</option>
                          <option value="academic_committee">Citación Obligatoria a Comité</option>
                          <option value="simple_read">Confirmación de Lectura Enterado</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Contenido / Cuerpo */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-wide">Cuerpo del Comunicado Oficial</label>
                    <textarea
                      value={newMsgContent}
                      onChange={(e) => setNewMsgContent(e.target.value)}
                      placeholder="Redacte el cuerpo formal del seguimiento escolar..."
                      rows={4}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white resize-none"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={!newMsgContent.trim()}
                  className="w-full mt-4 bg-purple-900 hover:bg-purple-950 text-white rounded-lg py-2.5 font-black shadow-sm flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-4 h-4" /> Registrar Notificación Oficial
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 💼 SECCIÓN 8: CONSOLIDADO ACADÉMICO FINAL (Cierre Anual) */}
      {/* ========================================================= */}
      <Card className="border-slate-250/70 shadow-sm overflow-hidden bg-white rounded-xl">
        <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-650" />
              Consolidado Académico Anual (Evaluación de Promoción)
            </CardTitle>
            <p className="text-xs text-slate-450 mt-0.5 font-semibold">
              Cálculo ponderado acumulado en base a pesos oficiales de periodos, asistencia anual y observador convivencial. Sin digitación manual.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-550">
              Escala Ponderada: <strong className="text-slate-700">100% Año Lectivo</strong>
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Estudiante</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">GPA Final Ponderado</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Matemáticas</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Inglés</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Ciencias Nat.</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Asistencia Acumulada</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Observador Convivencial</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Alertas</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Estado Académico Final</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consolidadoFinalAnual.map((c, idx) => {
                const isGPAPassing = c.finalGPA >= settings.min_passing_grade;
                const isAttendancePassing = c.attendance >= settings.min_attendance_percentage;
                
                return (
                  <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-black text-slate-955 text-sm pl-6">{c.studentName}</TableCell>
                    
                    {/* GPA Ponderado */}
                    <TableCell className="text-center">
                      <span className={cn(
                        "font-black text-xs px-2.5 py-1 rounded-lg border shadow-inner inline-block min-w-12 text-center",
                        isGPAPassing ? "bg-indigo-50 text-indigo-700 border-indigo-150" : "bg-red-50 text-red-700 border-red-200 animate-pulse"
                      )}>
                        {c.finalGPA.toFixed(settings.decimal_places)}
                      </span>
                    </TableCell>
                    
                    {/* Materia 1: Matemáticas */}
                    <TableCell className="text-center">
                      <span className={cn(
                        "font-bold text-xs",
                        (c.subjects['Matemáticas'] || 0) >= settings.min_passing_grade ? "text-slate-800" : "text-red-600 font-extrabold animate-pulse"
                      )}>
                        {c.subjects['Matemáticas'] !== undefined ? c.subjects['Matemáticas'].toFixed(settings.decimal_places) : '-'}
                      </span>
                    </TableCell>
                    
                    {/* Materia 2: Inglés */}
                    <TableCell className="text-center">
                      <span className={cn(
                        "font-bold text-xs",
                        (c.subjects['Inglés'] || 0) >= settings.min_passing_grade ? "text-slate-800" : "text-red-600 font-extrabold animate-pulse"
                      )}>
                        {c.subjects['Inglés'] !== undefined ? c.subjects['Inglés'].toFixed(settings.decimal_places) : '-'}
                      </span>
                    </TableCell>
                    
                    {/* Materia 3: Ciencias */}
                    <TableCell className="text-center">
                      <span className={cn(
                        "font-bold text-xs",
                        (c.subjects['Ciencias Naturales'] || 0) >= settings.min_passing_grade ? "text-slate-800" : "text-red-600 font-extrabold animate-pulse"
                      )}>
                        {c.subjects['Ciencias Naturales'] !== undefined ? c.subjects['Ciencias Naturales'].toFixed(settings.decimal_places) : '-'}
                      </span>
                    </TableCell>
                    
                    {/* Asistencia */}
                    <TableCell className="text-center">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded font-black border",
                        isAttendancePassing ? "bg-emerald-50 text-emerald-800 border-emerald-250" : "bg-red-50 text-red-800 border-red-200 animate-pulse"
                      )}>
                        {c.attendance.toFixed(1)}%
                      </span>
                    </TableCell>
                    
                    {/* Convivencia */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold">
                        <span className="text-emerald-600">+{c.behaviorCounts.positive}</span>
                        <span className="text-slate-350">/</span>
                        <span className="text-amber-500">-{c.behaviorCounts.mild}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-red-500">-{c.behaviorCounts.severe}</span>
                      </div>
                    </TableCell>
                    
                    {/* Alertas */}
                    <TableCell className="text-center">
                      <span className={cn(
                        "text-xs font-black px-1.5 py-0.5 rounded",
                        c.activeAlerts > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-400"
                      )}>
                        {c.activeAlerts}
                      </span>
                    </TableCell>
                    
                    {/* Estado Académico Final */}
                    <TableCell className="text-center">
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2.5 py-1 rounded-full border shadow-sm inline-block text-center",
                        c.status === 'Aprobado' && "bg-emerald-100 text-emerald-800 border-emerald-200",
                        c.status === 'Reprobado' && "bg-red-100 text-red-800 border-red-200 animate-pulse",
                        c.status === 'Pendiente' && "bg-slate-100 text-slate-500 border-slate-200",
                        c.status === 'Recuperación' && "bg-amber-100 text-amber-800 border-amber-250",
                        c.status === 'Promoción Anticipada' && "bg-indigo-100 text-indigo-800 border-indigo-200 animate-bounce",
                        c.status === 'Comité Académico' && "bg-purple-100 text-purple-800 border-purple-200"
                      )}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="pr-6 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] font-black text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                        onClick={() => {
                          setDocEngineType('annual_consolidated');
                          setDocEngineStudentId(c.studentId);
                          setDocEngineStudentName(c.studentName);
                          setDocEngineMetadata({
                            finalGPA: c.finalGPA,
                            attendance: c.attendance,
                            status: c.status
                          });
                          setIsDocEngineOpen(true);
                        }}
                      >
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        Exportar PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* SECCIÓN 6: EVOLUCIÓN DEL CURSO (Power BI custom SVG charts) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Evolución por Periodos trimestrales */}
        <Card className="border-slate-250/70 shadow-sm overflow-hidden bg-white rounded-xl flex flex-col justify-between hover:shadow-md transition duration-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-5 py-4">
            <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-750" />
              Evolución Académica por Periodos (10-A)
            </CardTitle>
            <p className="text-xs text-slate-450 font-semibold">Promedio acumulado consolidado en base a peso ponderado</p>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-full h-36">
              <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible select-none">
                {/* Grid Lines */}
                <line x1="20" y1="10" x2="230" y2="10" className="stroke-slate-100 stroke-1" />
                <line x1="20" y1="40" x2="230" y2="40" className="stroke-slate-100 stroke-1" />
                <line x1="20" y1="70" x2="230" y2="70" className="stroke-slate-100 stroke-1" />
                <line x1="20" y1="90" x2="230" y2="90" className="stroke-slate-200 stroke-1" />

                {/* Eje Y */}
                <text x="12" y="13" className="fill-slate-400 text-[10px] font-bold text-right" textAnchor="end">5.0</text>
                <text x="12" y="43" className="fill-slate-400 text-[10px] font-bold text-right" textAnchor="end">3.5</text>
                <text x="12" y="73" className="fill-slate-400 text-[10px] font-bold text-right" textAnchor="end">2.0</text>

                {/* Línea de evolución */}
                <polyline
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3.5"
                  points="50,45 125,41 200,85"
                  className="stroke-purple-600 transition-all duration-500"
                />
                
                {/* Puntos y valores */}
                {[
                  { name: 'P1 - Cerrado', gpa: '3.72', x: 50, y: 45, color: '#8b5cf6' },
                  { name: 'P2 - Activo', gpa: '3.76', x: 125, y: 41, color: '#a78bfa' },
                  { name: 'P3 - Futuro', gpa: 'Planificado', x: 200, y: 85, color: '#cbd5e1' }
                ].map((item, idx) => (
                  <g key={idx}>
                    <circle
                      cx={item.x}
                      cy={item.y}
                      r="5.5"
                      fill={item.color}
                      stroke="white"
                      strokeWidth="2.5"
                    />
                    <text
                      x={item.x}
                      y={item.y - 10}
                      textAnchor="middle"
                      className="fill-slate-800 text-[10px] font-black"
                    >
                      {item.gpa}
                    </text>
                    <text
                      x={item.x}
                      y="98"
                      textAnchor="middle"
                      className="fill-slate-400 text-[10px] font-extrabold"
                    >
                      {item.name}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 2: Desempeño promedio por Asignatura */}
        <Card className="border-slate-250/70 shadow-sm overflow-hidden bg-white rounded-xl flex flex-col justify-between hover:shadow-md transition duration-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-5 py-4">
            <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-750" />
              Rendimiento Consolidado por Materia (10-A)
            </CardTitle>
            <p className="text-xs text-slate-450 font-semibold">Identificación de áreas críticas y promedios grupales</p>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-center flex-1 space-y-4">
            <div className="relative w-full h-36">
              <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible select-none">
                {/* Grid Lines */}
                <line x1="20" y1="10" x2="230" y2="10" className="stroke-slate-100 stroke-1" />
                <line x1="20" y1="40" x2="230" y2="40" className="stroke-slate-100 stroke-1" />
                <line x1="20" y1="70" x2="230" y2="70" className="stroke-slate-100 stroke-1" />
                <line x1="20" y1="90" x2="230" y2="90" className="stroke-slate-200 stroke-1" />

                {/* Eje Y */}
                <text x="12" y="13" className="fill-slate-400 text-[10px] font-bold text-right" textAnchor="end">5.0</text>
                <text x="12" y="43" className="fill-slate-400 text-[10px] font-bold text-right" textAnchor="end">3.0</text>
                <text x="12" y="73" className="fill-slate-400 text-[10px] font-bold text-right" textAnchor="end">1.5</text>

                {/* Bars */}
                {[
                  { name: 'Matemáticas', gpa: 3.70, height: 66, x: 40, color: '#8b5cf6' },
                  { name: 'Inglés', gpa: 4.00, height: 75, x: 110, color: '#3b82f6' },
                  { name: 'Ciencias Nat.', gpa: 3.57, height: 62, x: 180, color: '#f59e0b' }
                ].map((bar) => {
                  return (
                    <g key={bar.name} className="cursor-pointer">
                      <rect
                        x={bar.x}
                        y={90 - bar.height}
                        width="20"
                        height={bar.height}
                        fill={bar.color}
                        rx="3.5"
                        className="transition-all duration-300 hover:opacity-90 shadow-sm"
                      />
                      <text
                        x={bar.x + 10}
                        y={85 - bar.height}
                        textAnchor="middle"
                        className="fill-slate-800 text-[10px] font-black"
                      >
                        {bar.gpa.toFixed(2)}
                      </text>
                      <text
                        x={bar.x + 10}
                        y="98"
                        textAnchor="middle"
                        className="fill-slate-400 text-[9px] font-bold"
                      >
                        {bar.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* SECCIÓN 7: OBSERVADOR CENTRALIZADO TIMELINE (Notion Style) */}
      {/* ========================================================= */}
      <Card className="border-slate-250/70 shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-slate-850" />
              Observador Centralizado del Curso (10-A)
            </CardTitle>
            <p className="text-xs text-slate-450 mt-0.5 font-semibold">Línea de tiempo de observaciones registradas automáticamente por docentes</p>
          </div>

          {/* Filtros del Timeline */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrar Timeline:
            </span>
            
            {/* Filtro Estudiante */}
            <select
              value={timelineStudentFilter}
              onChange={(e) => setTimelineStudentFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-2 py-1 text-[11px] bg-white focus:outline-none cursor-pointer font-bold text-slate-700"
            >
              <option value="all">Todos los Estudiantes</option>
              <option value="est-01">Alejandro Ortiz</option>
              <option value="est-02">Sofía Ramírez</option>
              <option value="est-03">Mateo Gómez</option>
            </select>

            {/* Filtro Gravedad */}
            <select
              value={timelineSeverityFilter}
              onChange={(e) => setTimelineSeverityFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-2 py-1 text-[11px] bg-white focus:outline-none cursor-pointer font-bold text-slate-700"
            >
              <option value="all">Todas las Gravedades</option>
              <option value="positive">Positivas</option>
              <option value="mild">Faltas Leves</option>
              <option value="severe">Faltas Graves</option>
            </select>

            <Button
              size="sm"
              onClick={() => {
                const sId = timelineStudentFilter === 'all' ? '10-A' : timelineStudentFilter;
                let sName = '10-A';
                if (timelineStudentFilter === 'est-01') sName = 'Alejandro Ortiz';
                if (timelineStudentFilter === 'est-02') sName = 'Sofía Ramírez';
                if (timelineStudentFilter === 'est-03') sName = 'Mateo Gómez';

                setDocEngineType('student_observador'); // Usar citacion u observador si estuviera, citacion por defecto
                setDocEngineStudentId(sId);
                setDocEngineStudentName(sName);
                setDocEngineMetadata({
                  timelineFilter: timelineSeverityFilter,
                  recordsCount: filteredTimeline.length
                });
                setIsDocEngineOpen(true);
              }}
              className="ml-2 h-7 text-[10px] font-black bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Exportar Observador
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {filteredTimeline.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No se registran anotaciones que coincidan con los filtros del observador del grupo.
            </div>
          ) : (
            <div className="relative border-l border-slate-200 pl-6 ml-4.5 space-y-8 py-2">
              {filteredTimeline.map(b => (
                <div key={b.id} className="relative group">
                  {/* Dot */}
                  <span className={cn(
                    "absolute -left-[30px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white transition-all duration-300",
                    b.observation_type === 'positive' && "bg-emerald-500 ring-emerald-50",
                    b.observation_type === 'neutral' && "bg-slate-400 ring-slate-100",
                    b.observation_type === 'mild_negative' && "bg-amber-500 ring-amber-50",
                    b.observation_type === 'severe_negative' && "bg-red-500 ring-red-50"
                  )} />

                  <div className="space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs font-bold">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-900 font-black text-sm">{b.studentName}</span>
                        <span className={cn(
                          "uppercase text-[9px] tracking-wider font-black px-2 py-0.5 rounded-full border",
                          b.observation_type === 'positive' && "text-emerald-700 bg-emerald-50 border-emerald-100",
                          b.observation_type === 'neutral' && "text-slate-600 bg-slate-50 border-slate-200",
                          b.observation_type === 'mild_negative' && "text-amber-700 bg-amber-50 border-amber-250",
                          b.observation_type === 'severe_negative' && "text-red-700 bg-red-50 border-red-200 animate-pulse"
                        )}>
                          {b.observation_type === 'positive' ? 'Anotación Positiva' :
                           b.observation_type === 'mild_negative' ? 'Falta Leve' :
                           b.observation_type === 'severe_negative' ? 'Falta Grave' : 'Seguimiento'}
                        </span>
                      </div>
                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                        {b.created_at}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      "{b.description}"
                    </p>
                    
                    {b.commitments && (
                      <p className="text-xs text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold border-l-2 border-l-slate-900 leading-relaxed max-w-3xl">
                        <strong>Compromiso del Estudiante:</strong> {b.commitments}
                      </p>
                    )}
                    
                    <p className="text-[10px] text-slate-400 font-black uppercase">
                      Reportado por: {b.teacherName} (Docente de Asignatura)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 🏛️ SECCIÓN 8: PREPARACIÓN DE FUTURA EXPANSIÓN ENTERPRISE   */}
      {/* ========================================================= */}
      <div className="border-t border-slate-200 pt-8 mt-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 animate-fade-in">
              <Sparkles className="w-5 h-5 text-indigo-650 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">
                Enterprise Suite Expansion
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">Consola de Control de Actas, Firmas & Acompañamiento Psicosocial</h3>
            <p className="text-xs text-slate-500 font-semibold">
              Arquitectura de auditoría integral preparada para firmas digitales, consentimientos relacionales y derivaciones psicosociales.
            </p>
          </div>
          
          <div className="flex gap-2">
            <span className="text-[10px] bg-slate-100 text-slate-600 font-black px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-slate-400 animate-spin" />
              Fase IV: Ready to Deploy
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Card 1: Centro de Firmas Digitales & Actas Institucionales */}
          <Card className="border-slate-250/70 shadow-sm bg-white rounded-xl overflow-hidden hover:shadow-md hover:scale-[1.005] transition-all duration-300 xl:col-span-2">
            <CardHeader className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileSignature className="w-4 h-4 text-purple-700" />
                  Actas Oficiales & Firmas Criptográficas
                </CardTitle>
                <p className="text-xs text-slate-450 font-semibold">Historial de conciliaciones, compromisos académicos y actas disciplinarias</p>
              </div>
              <span className="text-[10px] bg-purple-50 text-purple-700 font-extrabold px-2 py-0.5 rounded border border-purple-150">
                PKI Audit Log
              </span>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-extrabold text-slate-800 text-xs pl-5">Código Acta</TableHead>
                    <TableHead className="font-extrabold text-slate-800 text-xs">Tipo de Acta</TableHead>
                    <TableHead className="font-extrabold text-slate-800 text-xs">Estudiante / Acudiente</TableHead>
                    <TableHead className="font-extrabold text-slate-800 text-xs text-center">Firma Director</TableHead>
                    <TableHead className="font-extrabold text-slate-800 text-xs text-center">Firma Acudiente</TableHead>
                    <TableHead className="font-extrabold text-slate-800 text-xs pr-5 text-right">Hash Criptográfico</TableHead>
                    <TableHead className="font-extrabold text-slate-800 text-xs pr-5 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { code: 'ACT-2026-042', type: 'Compromiso Pedagógico', student: 'Mateo Gómez', parent: 'Sara Gómez', dirSigned: true, parSigned: true, hash: 'sha256: 8a7c2...f89' },
                    { code: 'ACT-2026-051', type: 'Conciliación de Convivencia', student: 'Sofía Ramírez', parent: 'Marta Ramírez', dirSigned: true, parSigned: false, hash: 'sha256: 3d1e9...b40' },
                    { code: 'ACT-2026-055', type: 'Matrícula en Observación', student: 'Mateo Gómez', parent: 'Sara Gómez', dirSigned: false, parSigned: false, hash: 'sha256: Pending...' }
                  ].map((acta, index) => (
                    <TableRow key={index} className="hover:bg-slate-50/40 transition-colors">
                      <TableCell className="font-black text-slate-900 pl-5 text-xs">{acta.code}</TableCell>
                      <TableCell className="font-bold text-slate-600 text-xs">{acta.type}</TableCell>
                      <TableCell className="text-xs">
                        <span className="font-black text-slate-800 block">{acta.student}</span>
                        <span className="text-[10px] text-slate-455 font-semibold">Acudiente: {acta.parent}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded leading-none inline-block",
                          acta.dirSigned ? "bg-emerald-50 text-emerald-700 border border-emerald-150 animate-fade-in" : "bg-slate-100 text-slate-400 border border-slate-200"
                        )}>
                          {acta.dirSigned ? 'Firmado' : 'Pendiente'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded leading-none inline-block",
                          acta.parSigned ? "bg-emerald-50 text-emerald-700 border border-emerald-150 animate-fade-in" : "bg-slate-100 text-slate-400 border border-slate-200"
                        )}>
                          {acta.parSigned ? 'Firmado' : 'Pendiente'}
                        </span>
                      </TableCell>
                      <TableCell className="pr-5 text-right font-mono text-[9px] font-black text-slate-400">
                        {acta.hash}
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDocEngineType('disciplinary_acta');
                            setDocEngineStudentId(acta.student);
                            setDocEngineStudentName(acta.student);
                            setDocEngineMetadata({
                              code: acta.code,
                              type: acta.type,
                              hash: acta.hash,
                              dirSigned: acta.dirSigned,
                              parSigned: acta.parSigned
                            });
                            setIsDocEngineOpen(true);
                          }}
                          className="h-6 w-6 p-0 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Card 2: Módulo de Autorizaciones y Consentimientos */}
          <Card className="border-slate-250/70 shadow-sm bg-white rounded-xl overflow-hidden hover:shadow-md hover:scale-[1.005] transition-all duration-300">
            <CardHeader className="bg-slate-50 border-b border-slate-200 px-5 py-4">
              <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-700" />
                Autorizaciones Escolares Activas
              </CardTitle>
              <p className="text-xs text-slate-450 font-semibold">Consentimientos parentales para actividades extracurriculares</p>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3">
                {[
                  { title: 'Salida de Campo - Jardín Botánico', signed: 24, total: 27, status: 'in_progress' },
                  { title: 'Uso de Laboratorio Computación Nivel II', signed: 26, total: 27, status: 'almost_done' }
                ].map((auth, index) => {
                  const percentage = (auth.signed / auth.total) * 100;
                  return (
                    <div key={index} className="p-3.5 rounded-lg border border-slate-150 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-slate-800 leading-tight block">{auth.title}</span>
                        <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-655 font-bold shrink-0 shadow-sm">
                          {auth.signed}/{auth.total} ({(percentage).toFixed(0)}%)
                        </span>
                      </div>
                      
                      {/* Bar */}
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={() => alert('Módulo de Expansión: Permite definir y disparar un nuevo consentimiento digital estructurado (con firma criptográfica) a todos los acudientes en 1 clic.')}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-black text-xs py-2 rounded-lg cursor-pointer transition shadow-inner"
              >
                Crear Nuevo Consentimiento Parental
              </Button>
            </CardContent>
          </Card>

          {/* Card 3: Orientación Psicosocial Decoupled Center */}
          <Card className="border-slate-250/70 shadow-sm bg-white rounded-xl overflow-hidden hover:shadow-md hover:scale-[1.005] transition-all duration-300 xl:col-span-3">
            <CardHeader className="bg-slate-900 text-white px-6 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-300 animate-pulse" />
                  Gabinete Psicosocial & Orientación Escolar (Confidencial)
                </CardTitle>
                <p className="text-xs text-slate-300 mt-0.5 font-semibold">
                  Registro de intervenciones, derivaciones externas y derivación psicosocial del curso 10-A.
                </p>
              </div>
              <div className="text-[9px] bg-red-650/40 text-red-200 border border-red-500/40 font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                Altamente Restringido
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Cumplimiento de Privacidad HIPAA / GDPR</span>
                  <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                    AulaCore implementa encriptación de datos de salud mental de extremo a extremo. Solo el rector, el psicólogo orientador y el director de grupo con privilegios especiales pueden acceder a esta bitácora.
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono text-slate-400 shrink-0 select-none">
                  Key status: [ENCRYPTED_WITH_AES_256]
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { student: 'Mateo Gómez', caseId: 'CASE-2026-M09', type: 'Dificultad de Aprendizaje y Ansiedad Escolar', status: 'En Acompañamiento Activo', lastSession: '2026-05-18', notes: 'Derivado a Terapia Ocupacional externa. Se mantiene plan de ajuste razonable (PIAR) activo en el aula.' },
                  { student: 'Sofía Ramírez', caseId: 'CASE-2026-S12', type: 'Apoyo Psicoemocional Familiar', status: 'En Seguimiento Trimestral', lastSession: '2026-05-22', notes: 'Se realiza mesa de trabajo con la madre Marta Ramírez. Avance positivo en hábitos de sueño y regularidad RFID.' }
                ].map((caso, index) => (
                  <div key={index} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition duration-150 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <span className="font-black text-slate-900 text-sm block">{caso.student}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-black">{caso.caseId}</span>
                      </div>
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-full border uppercase leading-none",
                        caso.status.includes('Activo') ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      )}>
                        {caso.status}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block">Tipo de Caso Psicosocial</span>
                      <p className="text-xs font-black text-slate-800 leading-tight">{caso.type}</p>
                    </div>

                    <p className="text-xs text-slate-655 font-medium leading-relaxed bg-white border border-slate-150 p-2.5 rounded-lg shadow-sm">
                      {caso.notes}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-1">
                      <span>Última Sesión: {caso.lastSession}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => alert(`Acceso a Ficha Completa del PIAR de ${caso.student}. Módulo de Expansión Psicosocial.`)}
                        className="h-6 text-[10px] font-black text-indigo-700 hover:text-indigo-850 hover:bg-slate-100 rounded-md cursor-pointer"
                      >
                        Ver Bitácora Confidencial
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
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
    </div>
  );
}
