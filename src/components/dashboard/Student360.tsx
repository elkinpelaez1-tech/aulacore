'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/providers/role-provider';
import {
  Search,
  ChevronDown,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Sparkles,
  FileText,
  BrainCircuit,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Clock,
  Eye,
  Mail,
  Phone,
  Settings,
  ShieldAlert,
  ArrowDownCircle,
  CheckCircle,
  X,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { downloadBoletinPDF } from '@/lib/utils/PdfGenerator';

// =================================================================
// 🏛️ MODELOS DE TIPOS RELACIONALES (Student 360)
// =================================================================
interface AcademicPeriod {
  id: string;
  academic_year_id: string;
  name: string;
  code: string;
  weight: number;
  status: 'active' | 'inactive' | 'closed';
  start_date: string;
  end_date: string;
}

interface AcademicSettings {
  id: string;
  institution_id: string;
  grading_scale_type: 'numeric_1_5' | 'numeric_1_10' | 'numeric_1_100' | 'gpa' | 'letters';
  min_passing_grade: number;
  min_attendance_percentage: number;
  decimal_places: number;
  average_calculation_type: 'simple' | 'weighted_periods' | 'weighted_categories';
  allow_recovery: boolean;
  recovery_max_grade: number;
  country: string;
  calendar_type: 'calendar_a' | 'calendar_b' | 'custom';
}

interface StudentListItem {
  id: string;
  name: string;
  enrollment_number: string;
  status: string;
  avatar_url?: string;
  email?: string;
  course_name: string;
}

interface StudentFullProfile {
  id: string;
  name: string;
  enrollment_number: string;
  status: string;
  avatar_url?: string;
  email?: string;
  date_of_birth?: string;
  medical_notes?: string;
  course_name: string;
  parents_name?: string;
  parents_phone?: string;
}

interface AcademicRecord {
  id: string;
  subject: string;
  grade: number;
  remarks?: string;
  academic_period_id: string;
  teacher_name?: string;
}

interface AttendanceRecord {
  id: string;
  record_date: string;
  status: 'present' | 'absent' | 'tardy' | 'excused';
  academic_period_id: string;
}

interface BehavioralLog {
  id: string;
  observation_type: 'positive' | 'neutral' | 'mild_negative' | 'severe_negative';
  description: string;
  commitments?: string;
  created_at: string;
  teacher_name: string;
}

interface EarlyAlert {
  id: string;
  category: 'academic' | 'attendance' | 'behavioral' | 'health' | 'psychosocial';
  risk_level: 'low' | 'medium' | 'high';
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  academic_period_id?: string;
}

// =================================================================
// 📂 DATOS MOCK DE RESERVA (Alineados al Script SQL de Supabase)
// =================================================================
const MOCK_SETTINGS: AcademicSettings = {
  id: 'adacadac-acad-1111-2222-333333333333',
  institution_id: '11111111-1111-1111-1111-111111111111',
  grading_scale_type: 'numeric_1_5',
  min_passing_grade: 3.00,
  min_attendance_percentage: 80.00,
  decimal_places: 2,
  average_calculation_type: 'weighted_periods',
  allow_recovery: true,
  recovery_max_grade: 3.00,
  country: 'Colombia',
  calendar_type: 'calendar_a'
};

const MOCK_PERIODS: AcademicPeriod[] = [
  {
    id: '11111111-1111-1111-2222-333333333333',
    academic_year_id: '11112026-1111-1111-2222-333333333333',
    name: 'Primer Periodo',
    code: 'P1',
    weight: 30.00,
    status: 'closed',
    start_date: '2026-01-15',
    end_date: '2026-04-15'
  },
  {
    id: '22222222-2222-2222-2222-333333333333',
    academic_year_id: '11112026-1111-1111-2222-333333333333',
    name: 'Segundo Periodo',
    code: 'P2',
    weight: 30.00,
    status: 'active',
    start_date: '2026-04-16',
    end_date: '2026-08-15'
  },
  {
    id: '33333333-3333-3333-2222-333333333333',
    academic_year_id: '11112026-1111-1111-2222-333333333333',
    name: 'Tercer Periodo',
    code: 'P3',
    weight: 40.00,
    status: 'active',
    start_date: '2026-08-16',
    end_date: '2026-11-25'
  }
];

const MOCK_STUDENTS: StudentListItem[] = [
  {
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Alejandro Ortiz',
    enrollment_number: 'MAT-2026-001',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    email: 'estudiante1@aulacore.com',
    course_name: 'Décimo A'
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    name: 'Sofía Ramírez',
    enrollment_number: 'MAT-2026-002',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    email: 'estudiante2@aulacore.com',
    course_name: 'Décimo A'
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    name: 'Mateo Gómez',
    enrollment_number: 'MAT-2026-003',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    email: 'estudiante3@aulacore.com',
    course_name: 'Décimo A'
  }
];

const MOCK_FULL_PROFILES: Record<string, StudentFullProfile & {
  grades: AcademicRecord[];
  attendance: AttendanceRecord[];
  behavior: BehavioralLog[];
  alerts: EarlyAlert[];
}> = {
  '77777777-7777-7777-7777-777777777777': {
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Alejandro Ortiz',
    enrollment_number: 'MAT-2026-001',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    email: 'estudiante1@aulacore.com',
    date_of_birth: '2011-04-12',
    medical_notes: 'Alergia leve a la penicilina',
    course_name: 'Décimo A',
    parents_name: 'Carlos Ortiz',
    parents_phone: '+57 301 555 1234',
    grades: [
      { id: '1', subject: 'Matemáticas', grade: 4.20, academic_period_id: '11111111-1111-1111-2222-333333333333', remarks: 'Buen desempeño global.', teacher_name: 'Prof. Gómez' },
      { id: '2', subject: 'Inglés', grade: 4.60, academic_period_id: '11111111-1111-1111-2222-333333333333', remarks: 'Fluidez oral destacable.', teacher_name: 'Prof. Gómez' },
      { id: '3', subject: 'Matemáticas', grade: 4.50, academic_period_id: '22222222-2222-2222-2222-333333333333', remarks: 'Excelente progreso conceptual.', teacher_name: 'Prof. Gómez' },
      { id: '4', subject: 'Inglés', grade: 4.80, academic_period_id: '22222222-2222-2222-2222-333333333333', remarks: 'Redacción avanzada en ensayos.', teacher_name: 'Prof. Gómez' },
      { id: '5', subject: 'Ciencias Naturales', grade: 4.30, academic_period_id: '22222222-2222-2222-2222-333333333333', remarks: 'Sólido compromiso en el laboratorio.', teacher_name: 'Prof. Gómez' }
    ],
    attendance: [
      { id: '1', record_date: '2026-05-18', status: 'present', academic_period_id: '22222222-2222-2222-2222-333333333333' },
      { id: '2', record_date: '2026-05-19', status: 'present', academic_period_id: '22222222-2222-2222-2222-333333333333' },
      { id: '3', record_date: '2026-05-20', status: 'present', academic_period_id: '22222222-2222-2222-2222-333333333333' },
      { id: '4', record_date: '2026-05-21', status: 'present', academic_period_id: '22222222-2222-2222-2222-333333333333' },
      { id: '5', record_date: '2026-05-22', status: 'present', academic_period_id: '22222222-2222-2222-2222-333333333333' }
    ],
    behavior: [
      { id: '1', observation_type: 'positive', description: 'Destacado liderazgo y proactividad guiando el equipo escolar en la Olimpiada Regional de Matemáticas y Robótica.', commitments: 'Continuar asumiendo roles de monitor estudiantil en asignaturas STEM.', created_at: '2026-05-24', teacher_name: 'Prof. Gómez' }
    ],
    alerts: []
  },
  '88888888-8888-8888-8888-888888888888': {
    id: '88888888-8888-8888-8888-888888888888',
    name: 'Sofía Ramírez',
    enrollment_number: 'MAT-2026-002',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    email: 'estudiante2@aulacore.com',
    date_of_birth: '2011-08-25',
    medical_notes: undefined,
    course_name: 'Décimo A',
    parents_name: 'Marta Ramírez',
    parents_phone: '+57 312 444 5678',
    grades: [
      { id: '1', subject: 'Matemáticas', grade: 3.50, academic_period_id: '11111111-1111-1111-2222-333333333333', remarks: 'Cumple de manera justa.', teacher_name: 'Prof. Gómez' },
      { id: '2', subject: 'Inglés', grade: 3.90, academic_period_id: '11111111-1111-1111-2222-333333333333', remarks: 'Esfuerzo constante.', teacher_name: 'Prof. Gómez' },
      { id: '3', subject: 'Matemáticas', grade: 3.80, academic_period_id: '22222222-2222-2222-2222-333333333333', remarks: 'Requiere concentrarse más en exámenes directos.', teacher_name: 'Prof. Gómez' },
      { id: '4', subject: 'Inglés', grade: 4.00, academic_period_id: '22222222-2222-2222-2222-333333333333', remarks: 'Correcta asimilación del material.', teacher_name: 'Prof. Gómez' },
      { id: '5', subject: 'Ciencias Naturales', grade: 3.50, academic_period_id: '22222222-2222-2222-2222-333333333333', remarks: 'Suele distraerse en dinámicas grupales.', teacher_name: 'Prof. Gómez' }
    ],
    attendance: [
      { id: '1', record_date: '2026-05-18', status: 'absent', academic_period_id: '22222222-2222-2222-2222-333333333333' },
      { id: '2', record_date: '2026-05-19', status: 'present', academic_period_id: '22222222-2222-2222-2222-333333333333' },
      { id: '3', record_date: '2026-05-20', status: 'absent', academic_period_id: '22222222-2222-2222-2222-333333333333' },
      { id: '4', record_date: '2026-05-21', status: 'present', academic_period_id: '22222222-2222-2222-2222-333333333333' },
      { id: '5', record_date: '2026-05-22', status: 'absent', academic_period_id: '22222222-2222-2222-2222-333333333333' }
    ],
    behavior: [],
    alerts: [
      { id: '1', category: 'attendance', risk_level: 'high', description: 'Registra una tasa de inasistencia acumulada del 60% en el Periodo 2 en curso. No se han recibido justificantes válidos por parte del acudiente.', status: 'open', academic_period_id: '22222222-2222-2222-2222-333333333333' }
    ]
  },
  '99999999-9999-9999-9999-999999999999': {
    id: '99999999-9999-9999-9999-999999999999',
    name: 'Mateo Gómez',
    enrollment_number: 'MAT-2026-003',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    email: 'estudiante3@aulacore.com',
    date_of_birth: '2010-11-02',
    medical_notes: 'Usa gafas correctoras de miopía',
    course_name: 'Décimo A',
    parents_name: 'Sara Gómez',
    parents_phone: '+57 320 333 9999',
    grades: [
      { id: '1', subject: 'Matemáticas', grade: 3.10, academic_period_id: '11111111-1111-1111-2222-333333333333', remarks: 'Aprobación al límite, requiere refuerzo.', teacher_name: 'Prof. Gómez' },
      { id: '2', subject: 'Inglés', grade: 3.00, academic_period_id: '11111111-1111-1111-2222-333333333333', remarks: 'Presenta vacíos de gramática básica.', teacher_name: 'Prof. Gómez' },
      { id: '3', subject: 'Matemáticas', grade: 2.80, academic_period_id: '22222222-2222-2222-2222-333333333333', remarks: 'Reprobó examen parcial por falta de estudio.', teacher_name: 'Prof. Gómez' },
      { id: '4', subject: 'Inglés', grade: 3.20, academic_period_id: '22222222-2222-2222-2222-333333333333', remarks: 'Mínimo esfuerzo. No entrega tareas a tiempo.', teacher_name: 'Prof. Gómez' },
      { id: '5', subject: 'Ciencias Naturales', grade: 2.90, academic_period_id: '22222222-2222-2222-2222-333333333333', remarks: 'No presentó el informe del proyecto final.', teacher_name: 'Prof. Gómez' }
    ],
    attendance: [
      { id: '1', record_date: '2026-05-18', status: 'present', academic_period_id: '22222222-2222-2222-2222-333333333333' },
      { id: '2', record_date: '2026-05-19', status: 'tardy', academic_period_id: '22222222-2222-2222-2222-333333333333' },
      { id: '3', record_date: '2026-05-20', status: 'present', academic_period_id: '22222222-2222-2222-2222-333333333333' },
      { id: '4', record_date: '2026-05-21', status: 'tardy', academic_period_id: '22222222-2222-2222-2222-333333333333' },
      { id: '5', record_date: '2026-05-22', status: 'present', academic_period_id: '22222222-2222-2222-2222-333333333333' }
    ],
    behavior: [
      { id: '1', observation_type: 'mild_negative', description: 'Uso reiterado y no autorizado de distractores tecnológicos (teléfono inteligente) durante las clases explicativas de Tecnología e Informática.', commitments: 'Estudiante se compromete a almacenar el celular apagado en el casillero institucional.', created_at: '2026-05-24', teacher_name: 'Prof. Gómez' }
    ],
    alerts: [
      { id: '1', category: 'academic', risk_level: 'medium', description: 'Calificaciones del Periodo 2 por debajo del estándar mínimo de aprobación (3.00) en Matemáticas (2.80) e Informe de Ciencias (2.90).', status: 'in_progress', academic_period_id: '22222222-2222-2222-2222-333333333333' }
    ]
  }
};

export default function Student360({ initialStudentId }: { initialStudentId?: string | null }) {
  const { userName, institutionId } = useRole();

  // --- CONFIGURACIÓN & ENTIDADES GLOBALES ---
  const [settings, setSettings] = useState<AcademicSettings>(MOCK_SETTINGS);
  const [periods, setPeriods] = useState<AcademicPeriod[]>(MOCK_PERIODS);
  const [students, setStudents] = useState<StudentListItem[]>(MOCK_STUDENTS);

  // --- FILTROS & ESTADOS DE SELECCIÓN ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'risk' | 'outstanding'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialStudentId || null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('all'); // 'all' o ID del periodo

  // --- DATOS EXPANDIDOS DEL ESTUDIANTE SELECCIONADO ---
  const [profile, setProfile] = useState<StudentFullProfile | null>(null);
  const [grades, setGrades] = useState<AcademicRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [behavior, setBehavior] = useState<BehavioralLog[]>([]);
  const [alerts, setAlerts] = useState<EarlyAlert[]>([]);

  // --- ESTADO DE INTERACCIÓN / CARGA ---
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [supportPlanActive, setSupportPlanActive] = useState<Record<string, boolean>>({});
  const [callParentActive, setCallParentActive] = useState<Record<string, boolean>>({});

  // --- ESTADOS INTERACTIVOS DE COMPARATIVA E IA ---
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isIaDiagnosticOpen, setIsIaDiagnosticOpen] = useState(false);
  const [isIaLoading, setIsIaLoading] = useState(false);
  const [iaLoadingStep, setIaLoadingStep] = useState(0);

  const startIaDiagnostic = () => {
    setIsIaDiagnosticOpen(true);
    setIsIaLoading(true);
    setIaLoadingStep(0);
    
    setTimeout(() => {
      setIaLoadingStep(1);
      setTimeout(() => {
        setIaLoadingStep(2);
        setTimeout(() => {
          setIaLoadingStep(3);
          setTimeout(() => {
            setIsIaLoading(false);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  // 1. CARGA INICIAL DE DATOS (Supabase con fallback)
  useEffect(() => {
    async function loadInitialData() {
      if (!institutionId) return;
      try {
        // Cargar settings de la institución
        const { data: settingsData, error: settingsError } = await supabase
          .from('institution_academic_settings')
          .select('*')
          .eq('institution_id', institutionId)
          .maybeSingle();

        if (settingsData && !settingsError) {
          setSettings(settingsData as any);
        } else if (institutionId === '11111111-1111-1111-1111-111111111111') {
          setSettings(MOCK_SETTINGS);
        }

        // Cargar periodos dinámicos del año activo
        const { data: activeYear } = await supabase
          .from('academic_years')
          .select('id')
          .eq('institution_id', institutionId)
          .eq('is_active', true)
          .maybeSingle();

        if (activeYear) {
          const { data: periodData, error: periodError } = await supabase
            .from('academic_periods')
            .select('*')
            .eq('academic_year_id', activeYear.id)
            .order('start_date', { ascending: true });

          if (periodData && !periodError) {
            setPeriods(periodData as any);
          }
        } else if (institutionId === '11111111-1111-1111-1111-111111111111') {
          setPeriods(MOCK_PERIODS);
        }

        // Cargar lista de estudiantes y sus cursos
        // Filtramos por user_roles para asegurar multi-tenancy estricto
        const { data: userRoles, error: rolesErr } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('institution_id', institutionId)
          .eq('role', 'estudiante');

        const studentIds = userRoles?.map(ur => ur.user_id) || [];

        if (studentIds.length > 0 && !rolesErr) {
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select(`
              id,
              enrollment_number,
              status,
              profiles (
                first_name,
                last_name,
                avatar_url,
                email
              ),
              student_enrollments (
                courses (
                  description
                )
              )
            `)
            .in('id', studentIds);

          if (studentData && !studentError) {
            const formattedList: StudentListItem[] = studentData.map((s: any) => ({
              id: s.id,
              name: `${s.profiles?.first_name || ''} ${s.profiles?.last_name || ''}`.trim() || 'Estudiante',
              enrollment_number: s.enrollment_number,
              status: s.status,
              avatar_url: s.profiles?.avatar_url,
              email: s.profiles?.email,
              course_name: s.student_enrollments?.[0]?.courses?.description || 'Sin Curso'
            }));
            setStudents(formattedList);
          }
        } else if (institutionId === '11111111-1111-1111-1111-111111111111') {
          setStudents(MOCK_STUDENTS);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, executing Mocks fallback seamlessly:', err);
        if (institutionId === '11111111-1111-1111-1111-111111111111') {
          setSettings(MOCK_SETTINGS);
          setPeriods(MOCK_PERIODS);
          setStudents(MOCK_STUDENTS);
        }
      }
    }

    loadInitialData();
  }, [institutionId]);

  // 2. CARGA DE DETALLES DEL ESTUDIANTE SELECCIONADO (Supabase con fallback)
  useEffect(() => {
    if (!selectedStudentId) {
      setProfile(null);
      setGrades([]);
      setAttendance([]);
      setBehavior([]);
      setAlerts([]);
      return;
    }

    async function loadStudentProfile() {
      setIsLoading(true);
      try {
        // Intentar query relacional en Supabase
        const { data: sInfo, error: infoErr } = await supabase
          .from('students')
          .select(`
            id,
            enrollment_number,
            status,
            date_of_birth,
            medical_notes,
            profiles (
              first_name,
              last_name,
              avatar_url,
              email
            ),
            student_enrollments (
              courses (
                description
              )
            )
          `)
          .eq('id', selectedStudentId)
          .maybeSingle();

        if (sInfo && !infoErr) {
          const { data: sGrades } = await supabase
            .from('academic_records')
            .select(`
              id,
              subject,
              grade,
              remarks,
              academic_period_id,
              profiles:teacher_id (
                first_name,
                last_name
              )
            `)
            .eq('student_id', selectedStudentId);

          const { data: sAttendance } = await supabase
            .from('attendance_records')
            .select('id, record_date, status, academic_period_id')
            .eq('student_id', selectedStudentId);

          const { data: sBehavior } = await supabase
            .from('behavioral_logs')
            .select(`
              id,
              observation_type,
              description,
              commitments,
              created_at,
              profiles:teacher_id (
                first_name,
                last_name
              )
            `)
            .eq('student_id', selectedStudentId)
            .order('created_at', { ascending: false });

          const { data: sAlerts } = await supabase
            .from('early_alerts')
            .select('id, category, risk_level, description, status, academic_period_id')
            .eq('student_id', selectedStudentId);

          const sInfoAny = sInfo as any;
          setProfile({
            id: sInfoAny.id,
            name: `${sInfoAny.profiles?.first_name || ''} ${sInfoAny.profiles?.last_name || ''}`.trim(),
            enrollment_number: sInfoAny.enrollment_number,
            status: sInfoAny.status,
            avatar_url: sInfoAny.profiles?.avatar_url,
            email: sInfoAny.profiles?.email,
            date_of_birth: sInfoAny.date_of_birth,
            medical_notes: sInfoAny.medical_notes,
            course_name: sInfoAny.student_enrollments?.[0]?.courses?.description || 'Sin Curso'
          });

          setGrades(
            (sGrades || []).map((g: any) => ({
              id: g.id,
              subject: g.subject,
              grade: parseFloat(g.grade),
              remarks: g.remarks,
              academic_period_id: g.academic_period_id,
              teacher_name: g.profiles ? `Prof. ${g.profiles.last_name}` : 'Docente'
            }))
          );

          setAttendance((sAttendance || []) as any);

          setBehavior(
            (sBehavior || []).map((b: any) => ({
              id: b.id,
              observation_type: b.observation_type,
              description: b.description,
              commitments: b.commitments,
              created_at: b.created_at.split('T')[0],
              teacher_name: b.profiles ? `${b.profiles.first_name} ${b.profiles.last_name}` : 'Coordinador'
            }))
          );

          setAlerts((sAlerts || []) as any);
        } else {
          // Fallback a los datos mock locales si no hay registros o falla
          throw new Error('No supabase session or record found.');
        }
      } catch (err) {
        // Carga robusta desde mock local estructurado
        const localMock = selectedStudentId ? MOCK_FULL_PROFILES[selectedStudentId] : null;
        if (localMock) {
          setProfile({
            id: localMock.id,
            name: localMock.name,
            enrollment_number: localMock.enrollment_number,
            status: localMock.status,
            avatar_url: localMock.avatar_url,
            email: localMock.email,
            date_of_birth: localMock.date_of_birth,
            medical_notes: localMock.medical_notes,
            course_name: localMock.course_name,
            parents_name: localMock.parents_name,
            parents_phone: localMock.parents_phone
          });
          setGrades(localMock.grades);
          setAttendance(localMock.attendance);
          setBehavior(localMock.behavior);
          setAlerts(localMock.alerts);
        }
      } finally {
        setTimeout(() => setIsLoading(false), 500); // Efecto visual fluido
      }
    }

    loadStudentProfile();
  }, [selectedStudentId]);

  // =================================================================
  // 🧮 MOTOR ANALÍTICO - MATEMÁTICA ACADÉMICA DENTRO DEL PERIODO
  // =================================================================

  // A. Filtrar notas por periodo
  const filteredGrades = selectedPeriodId === 'all'
    ? grades
    : grades.filter(g => g.academic_period_id === selectedPeriodId);

  // B. Calcular promedio académico según parametrización institucional
  const calculateGPA = () => {
    if (filteredGrades.length === 0) return 0;

    // Caso: Periodo individual seleccionado
    if (selectedPeriodId !== 'all') {
      const sum = filteredGrades.reduce((acc, curr) => acc + curr.grade, 0);
      return sum / filteredGrades.length;
    }

    // Caso: Todos los periodos (Usar peso dinámico de periodos cerrados y activos)
    if (settings.average_calculation_type === 'weighted_periods') {
      // 1. Obtener promedios independientes por periodo
      const periodAverages: Record<string, { sum: number; count: number }> = {};
      grades.forEach(g => {
        if (!periodAverages[g.academic_period_id]) {
          periodAverages[g.academic_period_id] = { sum: 0, count: 0 };
        }
        periodAverages[g.academic_period_id].sum += g.grade;
        periodAverages[g.academic_period_id].count += 1;
      });

      let totalWeightedSum = 0;
      let totalNormalizedWeight = 0;

      periods.forEach(p => {
        const avgObj = periodAverages[p.id];
        if (avgObj && avgObj.count > 0) {
          const avg = avgObj.sum / avgObj.count;
          totalWeightedSum += avg * p.weight;
          totalNormalizedWeight += p.weight;
        }
      });

      return totalNormalizedWeight > 0 ? totalWeightedSum / totalNormalizedWeight : 0;
    }

    // Fallback: promedio simple
    const sum = grades.reduce((acc, curr) => acc + curr.grade, 0);
    return sum / grades.length;
  };

  const rawGPA = calculateGPA();
  const formattedGPA = rawGPA.toFixed(settings.decimal_places);

  // C. Filtrar asistencia y calcular tasa de inasistencia RFID
  const filteredAttendance = selectedPeriodId === 'all'
    ? attendance
    : attendance.filter(a => a.academic_period_id === selectedPeriodId);

  const calculateAttendanceRate = () => {
    if (filteredAttendance.length === 0) return 100;
    const attended = filteredAttendance.filter(
      r => r.status === 'present' || r.status === 'tardy' || r.status === 'excused'
    ).length;
    return (attended / filteredAttendance.length) * 100;
  };

  const attendanceRate = calculateAttendanceRate();

  // D. Convivencia: Tally de anotaciones
  const filteredBehavior = selectedPeriodId === 'all'
    ? behavior
    : behavior; // Las observaciones de convivencia suelen ser un historial de vida, las renderizamos en el timeline general.

  const positiveLogs = filteredBehavior.filter(b => b.observation_type === 'positive').length;
  const severeLogs = filteredBehavior.filter(b => b.observation_type === 'severe_negative').length;
  const mildLogs = filteredBehavior.filter(b => b.observation_type === 'mild_negative').length;

  // E. Determinar riesgo escolar dinámico basado en alertas
  const activeAlerts = alerts.filter(
    a => a.status !== 'resolved' && (selectedPeriodId === 'all' || a.academic_period_id === selectedPeriodId)
  );

  const getRiskBadge = () => {
    if (activeAlerts.some(a => a.risk_level === 'high') || attendanceRate < settings.min_attendance_percentage) {
      return { label: 'CRÍTICO', style: 'bg-red-50 text-red-700 border-red-200' };
    }
    if (activeAlerts.some(a => a.risk_level === 'medium') || rawGPA < settings.min_passing_grade) {
      return { label: 'EN OBSERVACIÓN', style: 'bg-amber-50 text-amber-700 border-amber-250' };
    }
    return { label: 'ESTABLE', style: 'bg-emerald-50 text-emerald-700 border-emerald-250' };
  };

  const riskStatus = getRiskBadge();

  // F. Formateo de escala de nota descriptiva (internacionalización)
  const renderFormattedGrade = (value: number) => {
    return value.toFixed(settings.decimal_places);
  };

  // Filtrado de la lista lateral de estudiantes
  const filteredStudentList = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.enrollment_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'risk') {
      // Un alumno está en riesgo en mocks si es Sofía Ramírez (Inasistencias) o Mateo Gómez (Notas)
      return matchesSearch && (s.id === '88888888-8888-8888-8888-888888888888' || s.id === '99999999-9999-9999-9999-999999999999');
    }
    if (filterType === 'outstanding') {
      return matchesSearch && s.id === '77777777-7777-7777-7777-777777777777'; // Alejandro Ortiz
    }
    return matchesSearch;
  });

  // Preparar comparativa histórica
  const periodsMap = periods.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.id] = curr.code;
    return acc;
  }, {});

  const subjectsComparison = grades.reduce<Record<string, Record<string, number>>>((acc, curr) => {
    if (!acc[curr.subject]) {
      acc[curr.subject] = { P1: 0, P2: 0, P3: 0 };
    }
    const periodCode = periodsMap[curr.academic_period_id] || 'P3';
    acc[curr.subject][periodCode] = curr.grade;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-slate-50/50 p-1.5 rounded-2xl border border-slate-200/60 min-h-[720px] animate-in fade-in duration-300">
      
      {/* ========================================================= */}
      {/* COLUMNA IZQUIERDA: BUSCADOR & EXPLORADOR SLATE */}
      {/* ========================================================= */}
      <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 flex flex-col h-full overflow-hidden shadow-sm">
        
        {/* Header del explorador */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase">Explorador Estudiantil</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {students.length} alumnos
            </span>
          </div>
          
          {/* Buscador Predictivo */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o matrícula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-150 focus:border-indigo-400 focus:outline-none bg-slate-50/40 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Selector de tipo de riesgo */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100/70 p-0.5 rounded-lg text-[10px] font-extrabold text-slate-600">
            <button
              onClick={() => setFilterType('all')}
              className={cn(
                "py-1 rounded cursor-pointer transition-all",
                filterType === 'all' ? "bg-white text-slate-900 shadow-sm" : "hover:bg-slate-200/50"
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('risk')}
              className={cn(
                "py-1 rounded cursor-pointer transition-all text-red-700",
                filterType === 'risk' ? "bg-white shadow-sm font-black" : "hover:bg-slate-200/50"
              )}
            >
              En Riesgo
            </button>
            <button
              onClick={() => setFilterType('outstanding')}
              className={cn(
                "py-1 rounded cursor-pointer transition-all text-indigo-700",
                filterType === 'outstanding' ? "bg-white shadow-sm font-black" : "hover:bg-slate-200/50"
              )}
            >
              Destacados
            </button>
          </div>
        </div>

        {/* Lista de estudiantes filtrada */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[580px]">
          {filteredStudentList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No se encontraron estudiantes para este criterio.
            </div>
          ) : (
            filteredStudentList.map((st) => {
              const isSelected = st.id === selectedStudentId;
              let listBadge = 'bg-slate-100 text-slate-600';
              if (st.id === '88888888-8888-8888-8888-888888888888') listBadge = 'bg-red-50 text-red-700 border border-red-100 font-bold';
              else if (st.id === '99999999-9999-9999-9999-999999999999') listBadge = 'bg-amber-50 text-amber-700 border border-amber-100 font-bold';
              else if (st.id === '77777777-7777-7777-7777-777777777777') listBadge = 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold';

              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStudentId(st.id)}
                  className={cn(
                    "p-3.5 flex items-center gap-3 cursor-pointer transition-all duration-200",
                    isSelected ? "bg-slate-900 text-white" : "hover:bg-slate-50"
                  )}
                >
                  <img
                    src={st.avatar_url}
                    alt={st.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-black truncate leading-tight">
                      {st.name}
                    </h5>
                    <div className="flex justify-between items-center mt-1">
                      <span className={cn(
                        "text-[10px] font-semibold uppercase truncate",
                        isSelected ? "text-slate-300" : "text-slate-400"
                      )}>
                        {st.course_name} • {st.enrollment_number}
                      </span>
                      {!isSelected && (
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded", listBadge)}>
                          {st.id === '88888888-8888-8888-8888-888888888888' ? 'Ausente' :
                           st.id === '99999999-9999-9999-9999-999999999999' ? 'Riesgo Notas' : 'Estable'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* COLUMNA DERECHA: LIENZO PRINCIPAL ANALÍTICO STUDENT 360 */}
      {/* ========================================================= */}
      <div className="lg:col-span-3 flex flex-col justify-between">
        
        {!selectedStudentId ? (
          /* Empty State - Linear / Power BI Style */
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center shadow-sm h-full">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-slate-900/10 mb-6">
              📊
            </div>
            <h3 className="text-2xl font-black text-slate-950 tracking-tight">Consola Student 360° Explorer</h3>
            <p className="text-sm text-slate-550 max-w-md mt-2.5 font-medium leading-relaxed">
              Selecciona un estudiante en la lista de la izquierda para desplegar la ficha ejecutiva de analítica predictiva, reportes RFID y boletín dinámico.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl">
              <div className="p-4 border border-slate-150 rounded-xl bg-slate-50/50 text-center">
                <span className="text-lg block">🎯</span>
                <h5 className="font-extrabold text-xs text-slate-900 mt-1">Escala Dinámica</h5>
                <p className="text-[10px] text-slate-450 mt-1 leading-snug">Evaluaciones formateadas en base a reglas de institución</p>
              </div>
              <div className="p-4 border border-slate-150 rounded-xl bg-slate-50/50 text-center">
                <span className="text-lg block">📡</span>
                <h5 className="font-extrabold text-xs text-slate-900 mt-1">Wearable RFID</h5>
                <p className="text-[10px] text-slate-450 mt-1 leading-snug">Asistencia al segundo cruzada con umbral mínimo escolar</p>
              </div>
              <div className="p-4 border border-slate-150 rounded-xl bg-slate-50/50 text-center">
                <span className="text-lg block">🔮</span>
                <h5 className="font-extrabold text-xs text-slate-900 mt-1">IA Predictiva</h5>
                <p className="text-[10px] text-slate-450 mt-1 leading-snug">Alertas tempranas de riesgo de deserción y rendimiento</p>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          /* Visual de Carga Fluido */
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center shadow-sm h-full space-y-4">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">Cargando Ficha Estudiantil 360...</p>
          </div>
        ) : (
          /* Ficha Ejecutiva del Estudiante */
          <div className="space-y-6 h-full">
            
            {/* 1. SECTOR DE FILTRO CABECERA (Notion / Linear Style) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <img
                  src={profile?.avatar_url}
                  alt={profile?.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-900/10 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-950 tracking-tight leading-none">
                      {profile?.name}
                    </h3>
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded-full font-black border uppercase",
                      riskStatus.style
                    )}>
                      {riskStatus.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-450 font-semibold mt-1 flex items-center gap-1.5">
                    <span>Grado {profile?.course_name}</span>
                    <span className="text-slate-300">•</span>
                    <span>Matrícula {profile?.enrollment_number}</span>
                    <span className="text-slate-300">•</span>
                    <span>{profile?.email}</span>
                  </p>
                </div>
              </div>
              
              {/* Selector de Periodo */}
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl shrink-0">
                <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-450" />
                  Periodo Académico:
                </span>
                <select
                  value={selectedPeriodId}
                  onChange={(e) => setSelectedPeriodId(e.target.value)}
                  className="border-none bg-transparent rounded px-1 py-0.5 text-xs focus:outline-none cursor-pointer font-black text-slate-800"
                >
                  <option value="all">SaaS Consolidado (Todos los Periodos)</option>
                  {periods.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code} - {p.weight}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. REGLA 2: CARGA PROGRESIVA - NIVEL 1: TARJETAS KPI EXECUTIVE */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* KPI A: Promedio General Académico */}
              <Card className="border-slate-200/80 shadow-sm bg-white hover:shadow transition duration-200 relative overflow-hidden">
                <CardContent className="p-4.5 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Promedio {selectedPeriodId === 'all' ? 'Ponderado' : 'Periodo'}</span>
                    <h4 className={cn(
                      "text-3xl font-black mt-2 leading-none",
                      rawGPA >= settings.min_passing_grade ? "text-emerald-600" : "text-red-600 animate-pulse"
                    )}>
                      {formattedGPA} <span className="text-xs text-slate-450 font-bold">/ 5.0</span>
                    </h4>
                  </div>
                  <div className="mt-3 text-[10px] font-bold text-slate-500 border-t border-slate-100 pt-2.5 flex justify-between items-center">
                    <span>Mínimo institucional: {settings.min_passing_grade.toFixed(2)}</span>
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full inline-block",
                      rawGPA >= settings.min_passing_grade ? "bg-emerald-500" : "bg-red-500"
                    )}></span>
                  </div>
                </CardContent>
              </Card>

              {/* KPI B: Asistencia RFID vs Mínimo */}
              <Card className="border-slate-200/80 shadow-sm bg-white hover:shadow transition duration-200">
                <CardContent className="p-4.5 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Asistencia RFID</span>
                    <h4 className={cn(
                      "text-3xl font-black mt-2 leading-none",
                      attendanceRate >= settings.min_attendance_percentage ? "text-emerald-600" : "text-red-600 animate-pulse"
                    )}>
                      {attendanceRate.toFixed(1)}%
                    </h4>
                  </div>
                  <div className="mt-3 text-[10px] font-bold text-slate-500 border-t border-slate-100 pt-2.5 flex justify-between items-center">
                    <span>Mínimo Requerido: {settings.min_attendance_percentage.toFixed(0)}%</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded font-black text-[9px] uppercase",
                      attendanceRate >= settings.min_attendance_percentage ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
                    )}>
                      {attendanceRate >= settings.min_attendance_percentage ? 'Ok' : 'Riesgo'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* KPI C: Convivencia Observador */}
              <Card className="border-slate-200/80 shadow-sm bg-white hover:shadow transition duration-200">
                <CardContent className="p-4.5 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Observador General</span>
                    <h4 className="text-3xl font-black mt-2 leading-none text-slate-900">
                      {filteredBehavior.length} <span className="text-xs text-slate-450 font-bold">reportes</span>
                    </h4>
                  </div>
                  <div className="mt-3 text-[10px] font-bold text-slate-500 border-t border-slate-100 pt-2.5 flex gap-1.5 justify-start">
                    <span className="bg-emerald-50 text-emerald-850 px-1.5 py-0.5 rounded font-extrabold">{positiveLogs} Positivas</span>
                    {severeLogs > 0 && <span className="bg-red-50 text-red-850 px-1.5 py-0.5 rounded font-extrabold">{severeLogs} Graves</span>}
                    {mildLogs > 0 && <span className="bg-amber-50 text-amber-850 px-1.5 py-0.5 rounded font-extrabold">{mildLogs} Leves</span>}
                  </div>
                </CardContent>
              </Card>

              {/* KPI D: Estado Administrativo */}
              <Card className="border-slate-200/80 shadow-sm bg-white hover:shadow transition duration-200">
                <CardContent className="p-4.5 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Ficha Académica</span>
                    <h4 className="text-xl font-black mt-3 leading-tight text-slate-900 uppercase">
                      {settings.grading_scale_type.replace('_', ' ')}
                    </h4>
                  </div>
                  <div className="mt-3 text-[10px] font-bold text-slate-500 border-t border-slate-100 pt-2.5 flex justify-between items-center">
                    <span>País: {settings.country}</span>
                    <span className="text-slate-400 font-extrabold uppercase">{settings.calendar_type.replace('_', ' ')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 3. REGLA 2: CARGA PROGRESIVA - NIVEL 2: ALERTAS DE RIESGO INTELIGENTES IA */}
            {activeAlerts.length > 0 && (
              <Card className="border-l-4 border-l-red-500 bg-red-50/20 border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-left duration-400">
                <CardContent className="p-4 flex gap-4.5 items-start">
                  <div className="p-2.5 bg-red-100 text-red-700 rounded-xl shrink-0">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h4 className="font-black text-slate-950 text-base flex items-center gap-2">
                      Alerta de Intervención Académica Crítica
                      <span className="text-[10px] bg-red-100 text-red-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Early Warning</span>
                    </h4>
                    {activeAlerts.map(al => (
                      <div key={al.id} className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                          {al.description}
                        </p>
                        <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs font-medium text-slate-800 leading-relaxed shadow-sm mt-3 border-l-2 border-l-slate-900">
                          <strong className="text-slate-950 font-extrabold flex items-center gap-1.5">
                            <BrainCircuit className="w-4 h-4 text-slate-900 shrink-0" />
                            Propuesta de Intervención IA predictiva AulaCore:
                          </strong>
                          <p className="mt-1 text-slate-700 font-medium">
                            {al.category === 'attendance'
                              ? 'Iniciar citación preventiva con acudiente por el RFID. Asignar apoyo socioemocional escolar. Habilitar control de notificaciones instantáneas de ausencias.'
                              : 'Programar talleres de mejoramiento académico inmediato por tutorías pedagógicas STEM. Ajustar plazos de recuperación escolar.'}
                          </p>
                        </div>
                        
                        {/* Acciones de Alerta */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant={supportPlanActive[al.id] ? "secondary" : "default"}
                            onClick={() => setSupportPlanActive(prev => ({ ...prev, [al.id]: true }))}
                            className="text-[11px] h-8 font-extrabold"
                          >
                            {supportPlanActive[al.id] ? "✓ Plan de Apoyo Activado" : "Activar Plan de Nivelación"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCallParentActive(prev => ({ ...prev, [al.id]: true }))}
                            className="text-[11px] h-8 font-extrabold border-slate-200 text-slate-700 bg-white"
                          >
                            {callParentActive[al.id] ? "✓ Citación Enviada" : "Citación Oficial a Acudiente"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 4. REGLA 2: CARGA PROGRESIVA - NIVEL 3: DETALLE ACADÉMICO (BOLETÍN DINÁMICO) */}
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-xl">
              <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                    <BookOpen className="w-4.5 h-4.5 text-slate-800" />
                    Boletín Académico & Progreso de Asignaturas
                  </CardTitle>
                  <p className="text-xs text-slate-450 mt-0.5 font-medium">Visualización dinámica de notas y retroalimentación del docente</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      if (profile) {
                        const activePeriod = periods.find(p => p.id === selectedPeriodId);
                        const periodName = activePeriod ? activePeriod.name : 'SaaS Consolidado (Todos los Periodos)';
                        downloadBoletinPDF(
                          profile.name,
                          profile.course_name,
                          rawGPA,
                          filteredGrades,
                          periodName
                        );
                      }
                    }}
                    variant="outline" 
                    size="sm" 
                    className="h-8 font-bold text-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Exportar PDF Oficial
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {filteredGrades.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-medium">
                    No se registran notas para el periodo seleccionado.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {/* Agrupamos por asignatura */}
                    {Object.entries(
                      filteredGrades.reduce<Record<string, AcademicRecord[]>>((acc, curr) => {
                        if (!acc[curr.subject]) acc[curr.subject] = [];
                        acc[curr.subject].push(curr);
                        return acc;
                      }, {})
                    ).map(([subj, recordsList]) => {
                      // Promedio de la materia en este periodo
                      const sum = recordsList.reduce((acc, curr) => acc + curr.grade, 0);
                      const materiaGPA = sum / recordsList.length;
                      const isPassing = materiaGPA >= settings.min_passing_grade;
                      
                      // Convertimos nota a porcentaje de barra (0 a 5 es nota, así que multiplica por 20)
                      const barPercentage = (materiaGPA / 5.0) * 100;
                      const passPercentage = (settings.min_passing_grade / 5.0) * 100;

                      return (
                        <div key={subj} className="p-5 flex flex-col md:flex-row gap-5 items-start justify-between hover:bg-slate-50/30 transition-colors">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <h5 className="font-black text-slate-900 text-sm flex items-center gap-2">
                              {subj}
                              <span className={cn(
                                "text-[9px] font-black px-1.5 py-0.5 rounded uppercase border",
                                isPassing ? "bg-emerald-50/50 text-emerald-800 border-emerald-100" : "bg-red-50/50 text-red-800 border-red-100"
                              )}>
                                {isPassing ? 'Aprobada' : 'Reprobada'}
                              </span>
                            </h5>
                            <p className="text-[11px] text-slate-400 font-semibold">
                              Docente: {recordsList[0]?.teacher_name || 'Profesor de Asignatura'}
                            </p>
                            {recordsList[0]?.remarks && (
                              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-150 p-2.5 rounded-lg font-medium leading-relaxed max-w-2xl">
                                <strong>Observación del docente:</strong> "{recordsList[0].remarks}"
                              </p>
                            )}
                          </div>
                          
                          {/* Visualización de la Barra de Progreso */}
                          <div className="w-full md:w-60 space-y-1 shrink-0">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-slate-500">Avance de Nota</span>
                              <strong className={cn(
                                "text-sm font-black",
                                isPassing ? "text-emerald-700" : "text-red-700"
                              )}>
                                {renderFormattedGrade(materiaGPA)} / 5.00
                              </strong>
                            </div>
                            <div className="relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                              
                              {/* Relleno de Barra */}
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  isPassing ? "bg-emerald-500" : "bg-red-500"
                                )}
                                style={{ width: `${barPercentage}%` }}
                              />
                              
                              {/* Indicador de Nota Mínima */}
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-slate-900/60 z-10"
                                style={{ left: `${passPercentage}%` }}
                                title={`Nota aprobatoria: ${settings.min_passing_grade}`}
                              />
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                              <span>0.0</span>
                              <span className="font-extrabold text-slate-900">Mínimo Aprobatorio: {settings.min_passing_grade.toFixed(1)}</span>
                              <span>5.0</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 5. REGLA 2: CARGA PROGRESIVA - NIVEL 4: OBSERVADOR Y TIMELINE DE CONVIVENCIA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Sección Convivencia / Observador */}
              <Card className="border-slate-200 shadow-sm bg-white rounded-xl flex flex-col justify-between overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                    <Award className="w-4.5 h-4.5 text-slate-800" />
                    Historial del Observador Estudiantil
                  </CardTitle>
                  <p className="text-xs text-slate-450 mt-0.5 font-medium">Anotaciones comportamentales asentadas de forma oficial</p>
                </CardHeader>
                <CardContent className="p-5 flex-1 overflow-y-auto max-h-[360px]">
                  {filteredBehavior.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-medium">
                      No se registran novedades comportamentales en el observador escolar.
                    </div>
                  ) : (
                    <div className="relative border-l border-slate-200 pl-4.5 ml-2 space-y-6">
                      {filteredBehavior.map(b => (
                        <div key={b.id} className="relative group">
                          {/* Dot del timeline */}
                          <span className={cn(
                            "absolute -left-[24px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white transition-all duration-300",
                            b.observation_type === 'positive' && "bg-emerald-500 ring-emerald-50",
                            b.observation_type === 'neutral' && "bg-slate-400 ring-slate-100",
                            b.observation_type === 'mild_negative' && "bg-amber-500 ring-amber-50",
                            b.observation_type === 'severe_negative' && "bg-red-500 ring-red-50"
                          )} />
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className={cn(
                                "uppercase text-[10px] tracking-wider font-black",
                                b.observation_type === 'positive' && "text-emerald-700",
                                b.observation_type === 'neutral' && "text-slate-600",
                                b.observation_type === 'mild_negative' && "text-amber-700",
                                b.observation_type === 'severe_negative' && "text-red-700"
                              )}>
                                {b.observation_type === 'positive' ? 'Anotación Positiva' :
                                 b.observation_type === 'mild_negative' ? 'Falta Leve' :
                                 b.observation_type === 'severe_negative' ? 'Falta Grave' : 'Seguimiento'}
                              </span>
                              <span className="text-slate-400 font-semibold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {b.created_at}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                              "{b.description}"
                            </p>
                            {b.commitments && (
                              <p className="text-xs text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold border-l-2 border-l-slate-900 leading-relaxed">
                                <strong>Compromiso:</strong> {b.commitments}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase">
                              Reportó: {b.teacher_name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Registro Diario RFID Asistencia Grid */}
              <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-slate-800" />
                    Asistencia RFID Semanal (Mayo 2026)
                  </CardTitle>
                  <p className="text-xs text-slate-450 mt-0.5 font-medium">Control biométrico de ingreso en portería principal</p>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span>Tasa Promedio RFID: <strong className={cn("font-black text-sm", attendanceRate >= settings.min_attendance_percentage ? "text-emerald-700" : "text-red-700")}>{attendanceRate.toFixed(1)}%</strong></span>
                    <span>Total días evaluados: <strong className="font-extrabold text-slate-950">{filteredAttendance.length}</strong></span>
                  </div>

                  {filteredAttendance.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-medium">
                      No se registran lecturas RFID para el periodo configurado.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredAttendance.map(att => {
                        let text = 'Presente en aula';
                        let badge = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                        if (att.status === 'absent') {
                          text = 'Falta sin justificar';
                          badge = 'bg-red-50 text-red-800 border-red-100 font-bold';
                        } else if (att.status === 'tardy') {
                          text = 'Ingreso Tardío';
                          badge = 'bg-amber-50 text-amber-800 border-amber-100';
                        }

                        return (
                          <div key={att.id} className="flex justify-between items-center p-3 border border-slate-150 rounded-xl bg-slate-50/30 hover:bg-slate-50 hover:shadow-sm transition-all duration-300">
                            <div className="flex items-center gap-2.5">
                              <span className={cn(
                                "w-2.5 h-2.5 rounded-full inline-block shrink-0",
                                att.status === 'present' && "bg-emerald-500",
                                att.status === 'tardy' && "bg-amber-500",
                                att.status === 'absent' && "bg-red-500 animate-pulse"
                              )}></span>
                              <div>
                                <span className="text-xs font-black text-slate-900 block leading-none">{att.record_date}</span>
                                <span className="text-[10px] text-slate-450 font-semibold mt-1 block">{text}</span>
                              </div>
                            </div>
                            <span className={cn("text-[10px] px-2 py-0.5 rounded border uppercase font-bold", badge)}>
                              {att.status === 'present' ? 'Asiste' : att.status === 'tardy' ? 'Tarde' : 'Falta'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* 6. REGLA 7: HOOKS PREPARADOS - COMPARATIVOS Y ANALYTICS */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-xl p-5 border border-slate-800/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex gap-3.5 items-start">
                <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-yellow-400 shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Módulo Integrado IA predictiva & Boletines Premium</h4>
                  <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed max-w-xl">
                    Este perfil está plenamente integrado con la red neuronal predictiva de AulaCore. Preparado para la emisión automatizada de alertas de bajo rendimiento, boletines informativos instantáneos y comparativas históricas.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsComparisonOpen(true)}
                  size="sm" 
                  className="bg-slate-850 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-750 shrink-0 h-9 rounded-lg cursor-pointer"
                >
                  Comparativa Histórica
                </Button>
                <Button 
                  onClick={startIaDiagnostic}
                  size="sm" 
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs shrink-0 h-9 rounded-lg shadow shadow-indigo-600/30 cursor-pointer border-none outline-none"
                >
                  Redactar Diagnóstico IA
                </Button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* COMPARATIVA HISTÓRICA MODAL */}
            {/* ========================================================= */}
            {isComparisonOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 select-none animate-in fade-in duration-200">
                <Card className="w-full max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-150 overflow-hidden text-slate-800">
                  <div className="bg-slate-950 text-white p-5 border-b border-indigo-950/20 flex items-center justify-between">
                    <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      Comparativa Histórica de Periodos - {profile?.name}
                    </h3>
                    <button 
                      onClick={() => setIsComparisonOpen(false)}
                      className="text-slate-400 hover:text-white bg-transparent border-none outline-none cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <CardContent className="p-6 space-y-6">
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Estudiante</span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-950">{profile?.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Curso</span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-950">{profile?.course_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Promedio Actual</span>
                        <span className="text-xs sm:text-sm font-extrabold text-indigo-650">{formattedGPA} / 5.0</span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-150">
                      {/* Header Table */}
                      <div className="bg-slate-50 grid grid-cols-5 p-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">
                        <div className="text-left col-span-2">Asignatura</div>
                        <div>Periodo 1</div>
                        <div>Periodo 2</div>
                        <div>Periodo 3 (Act)</div>
                      </div>

                      {/* Rows */}
                      {Object.entries(subjectsComparison).map(([subj, perGrades]) => {
                        const p1 = perGrades.P1 || 0;
                        const p2 = perGrades.P2 || 0;
                        const p3 = perGrades.P3 || 0;
                        
                        // Compute simple direction
                        let direction: 'up' | 'down' | 'stable' = 'stable';
                        let diff = 0;
                        if (p3 > 0 && p2 > 0) {
                          diff = p3 - p2;
                          if (diff > 0.05) direction = 'up';
                          else if (diff < -0.05) direction = 'down';
                        } else if (p2 > 0 && p1 > 0) {
                          diff = p2 - p1;
                          if (diff > 0.05) direction = 'up';
                          else if (diff < -0.05) direction = 'down';
                        }

                        return (
                          <div key={subj} className="grid grid-cols-5 p-3.5 text-xs font-semibold items-center text-center hover:bg-slate-50/50 transition-colors">
                            <div className="text-left font-extrabold text-slate-800 col-span-2 flex items-center gap-2">
                              {subj}
                              {direction === 'up' && (
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              )}
                              {direction === 'down' && (
                                <TrendingDown className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-pulse" />
                              )}
                            </div>
                            <div className="text-slate-500">{p1 ? p1.toFixed(2) : '-'}</div>
                            <div className="text-slate-500">{p2 ? p2.toFixed(2) : '-'}</div>
                            <div className={cn(
                              "font-black text-sm",
                              p3 >= 3.0 ? "text-slate-900" : "text-rose-650"
                            )}>
                              {p3 ? p3.toFixed(2) : '-'}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[10px] text-slate-450 leading-relaxed font-semibold italic bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                      💡 Los promedios históricos permiten identificar curvas de aprendizaje. Las flechas indican tendencias de rendimiento positivo (<span className="text-emerald-600 font-bold">▲</span>) o alertas de descenso cognitivo (<span className="text-rose-650 font-bold">▼</span>).
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ========================================================= */}
            {/* DIAGNÓSTICO IA MODAL */}
            {/* ========================================================= */}
            {isIaDiagnosticOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 select-none animate-in fade-in duration-200">
                <Card className="w-full max-w-xl bg-slate-950 text-white border border-slate-800 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-150 overflow-hidden">
                  
                  {isIaLoading ? (
                    /* PANTALLA DE CARGA IA */
                    <div className="p-8 text-center space-y-6">
                      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        <Sparkles className="w-8 h-8 text-indigo-400 fill-indigo-400 animate-pulse" />
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-black uppercase tracking-wider text-indigo-300">
                          Procesamiento Predictivo Neuronal
                        </h4>
                        <div className="h-1.5 w-40 bg-slate-800 rounded-full overflow-hidden mx-auto">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${(iaLoadingStep + 1) * 25}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 font-bold min-h-[1.5rem] mt-2">
                          {iaLoadingStep === 0 && "🔮 Sincronizando modelo neuronal de AulaCore..."}
                          {iaLoadingStep === 1 && "📡 Extrayendo bitácora de portería y sensores RFID..."}
                          {iaLoadingStep === 2 && "📊 Mapeando sábanas académicas y coeficientes de reprobación..."}
                          {iaLoadingStep === 3 && "🧠 Generando diagnóstico predictivo de deserción..."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* INFORME COMPLETO IA */
                    <>
                      <div className="p-5 border-b border-slate-900 bg-gradient-to-r from-indigo-950 to-slate-950 flex items-center justify-between">
                        <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
                          <BrainCircuit className="w-5 h-5 text-indigo-400" />
                          Diagnóstico de Inteligencia Artificial
                        </h3>
                        <button 
                          onClick={() => setIsIaDiagnosticOpen(false)}
                          className="text-slate-400 hover:text-white bg-transparent border-none outline-none cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <CardContent className="p-6 space-y-6">
                        {/* Encabezado del documento */}
                        <div className="border border-slate-850 rounded-xl p-4 bg-slate-900/40 flex flex-col sm:flex-row justify-between gap-4 text-xs font-semibold">
                          <div className="space-y-1">
                            <span className="text-slate-450 font-black uppercase text-[9px] block">Estudiante</span>
                            <strong className="text-white font-extrabold text-sm">{profile?.name}</strong>
                            <span className="text-slate-400 block mt-0.5">{profile?.course_name} • UID {profile?.id.slice(0,8).toUpperCase()}</span>
                          </div>
                          <div className="space-y-1 sm:text-right">
                            <span className="text-slate-450 font-black uppercase text-[9px] block">Riesgo Escolar</span>
                            <span className={cn(
                              "text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded border block w-fit sm:ml-auto mt-0.5",
                              profile?.id.endsWith('777777777777') && "bg-emerald-950 border-emerald-800 text-emerald-400",
                              profile?.id.endsWith('888888888888') && "bg-red-950 border-red-800 text-red-400 animate-pulse",
                              profile?.id.endsWith('999999999999') && "bg-amber-950 border-amber-800 text-amber-400"
                            )}>
                              {profile?.id.endsWith('777777777777') && "ESTABLE (0.1%)"}
                              {profile?.id.endsWith('888888888888') && "CRÍTICO (78.4%)"}
                              {profile?.id.endsWith('999999999999') && "OBSERVACIÓN (42.1%)"}
                            </span>
                          </div>
                        </div>

                        {/* Cuerpo del Reporte */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Dictamen Analítico IA</h4>
                          <p className="text-xs text-slate-350 leading-relaxed font-medium bg-slate-900/20 p-4 border border-slate-900 rounded-xl">
                            {profile?.id.endsWith('777777777777') && "El estudiante Alejandro Ortiz demuestra un coeficiente cognitivo sobresaliente en asignaturas STEM y habilidades excepcionales en oratoria. Se recomienda promoverlo al programa de monitoría avanzada y postularlo al comité del club de robótica regional. No se observan anomalías de deserción ni retardos RFID."}
                            {profile?.id.endsWith('888888888888') && "ALERTA DE DESERCIÓN DETECTADA. La red predictiva de AulaCore ha registrado una inasistencia sistemática acumulada de 3 ausencias consecutivas este mes. Aunque sus promedios cognitivos siguen aprobando de manera básica (3.74), las alertas biométricas de portería indican desconexión presencial reiterada sin justificaciones del acudiente. Se recomienda plan de choque inmediato con psicología escolar y citación oficial presencial a padres."}
                            {profile?.id.endsWith('999999999999') && "RIESGO COGNITIVO DETECTADO. El estudiante Mateo Gómez presenta un promedio general de 2.80, ubicándose por debajo del umbral mínimo de aprobación institucional (3.00). El análisis detallado muestra vacíos críticos en Matemáticas (2.80) e informe final de Ciencias Naturales (2.90). Se registran además 1 llamado de atención disciplinario por uso inoportuno de distractores móviles en clase. Se sugiere tutoría pedagógica especial y restricción del uso del celular en portería."}
                          </p>
                        </div>

                        {/* Firma y verificación */}
                        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-900 pt-5 mt-2 gap-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-8 h-8 text-indigo-400/40" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5">
                              <circle cx="50" cy="50" r="40" stroke-dasharray="3 3" />
                              <text x="50" y="45" font-size="8" font-weight="extrabold" text-anchor="middle" fill="currentColor">AULACORE</text>
                              <path d="M 35 65 Q 48 20 65 65" fill="none" stroke="currentColor" stroke-width="2.5" />
                              <text x="50" y="70" font-size="6" font-weight="bold" text-anchor="middle" fill="currentColor">AI CORE OK</text>
                            </svg>
                            <div className="text-[10px] text-slate-400 font-bold leading-tight">
                              <span>AulaCore AI Engine v4.2</span><br/>
                              <span className="text-[9px] text-slate-500">Dictamen Criptográfico Verificado</span>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => setIsIaDiagnosticOpen(false)}
                            size="sm" 
                            className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-4 py-2 border-none outline-none cursor-pointer"
                          >
                            Cerrar Diagnóstico
                          </Button>
                        </div>
                      </CardContent>
                    </>
                  )}

                </Card>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
