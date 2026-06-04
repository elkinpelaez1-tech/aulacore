'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  GraduationCap,
  User,
  CalendarDays,
  Mail,
  Phone,
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  MessageSquare,
  Send,
  FileText,
  QrCode,
  Calendar,
  Sparkles,
  Clock,
  ArrowRight,
  ChevronDown,
  Download,
  AlertCircle,
  PlusCircle,
  X,
  FileCheck,
  CheckCheck,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { downloadBoletinPDF, downloadCertificadoMatriculaPDF } from '@/lib/utils/PdfGenerator';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
} from 'recharts';

// ============================================================================
// ESTRUCTURA DE DATOS MULTI-HIJO PREMIUM
// ============================================================================
export interface ChildData {
  id: string;
  name: string;
  grade: string;
  avatar: string;
  director: string;
  directorPhone: string;
  directorEmail: string;
  gpa: number;
  attendanceRate: number;
  behaviorScore: number;
  alertCount: number;
  pendingActivities: number;
  dropoutRisk: 'Bajo' | 'Medio' | 'Alto';
  iaState: string;
  iaStateColor: 'success' | 'warning' | 'danger';
  iaStateDescription: string;
  iaRisks: string[];
  
  // Resumen Académico
  gpaEvolution: { period: string; gpa: number }[];
  highlightedSubjects: { name: string; score: number; type: 'destacada' | 'regular' | 'seguimiento' }[];
  
  // Asistencia
  attendanceDetail: {
    totalDays: number;
    attended: number;
    late: number;
    excused: number;
    unexcused: number;
  };
  rfidLogs: { id: string; date: string; time: string; type: 'entrada' | 'salida'; status: 'A tiempo' | 'Tarde' | 'Normal' }[];
  
  // Notas
  subjectsGrades: {
    subject: string;
    teacher: string;
    average: number;
    recentGrades: { name: string; score: number; date: string }[];
    comments: string;
  }[];
  
  // Evaluaciones
  evaluations: {
    id: string;
    subject: string;
    name: string;
    date: string;
    status: 'Pendiente' | 'Presentada';
    score?: number;
    comments?: string;
  }[];
  
  // Comunicaciones
  messages: {
    id: string;
    sender: string;
    role: string;
    avatar: string;
    message: string;
    time: string;
    date: string;
    isFromTeacher: boolean;
    replied?: boolean;
    replyText?: string;
  }[];
  circulars: { id: string; title: string; content: string; date: string; requiresSignature: boolean; signed: boolean }[];
  
  // Observador
  behaviorLogs: {
    id: string;
    type: 'Felicitación' | 'Llamado de Atención' | 'Compromiso';
    description: string;
    date: string;
    observer: string;
    status: string;
  }[];

  // Actividad Reciente (Cronológica)
  recentActivity: {
    id: string;
    type: 'nota' | 'evaluacion' | 'asistencia' | 'observacion' | 'comunicacion';
    title: string;
    description: string;
    date: string;
    time?: string;
    badgeText?: string;
    badgeStyle?: string;
  }[];
}

// MOCK DATA MULTI-HIJO DE ALTA FIDELIDAD
const MOCK_CHILDREN: ChildData[] = [
  {
    id: 'ch-01',
    name: 'Pedro Ramírez Ortiz',
    grade: '10-A',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    director: 'Lic. Carlos Martínez',
    directorPhone: '+573124445678',
    directorEmail: 'carlos.martinez@aulacore.edu.co',
    gpa: 4.2,
    attendanceRate: 96.0,
    behaviorScore: 8.2,
    alertCount: 2,
    pendingActivities: 4,
    dropoutRisk: 'Bajo',
    iaState: 'En Seguimiento Especial',
    iaStateColor: 'warning',
    iaStateDescription: 'Promedio académico saludable, pero registra una disminución progresiva en Matemáticas y 3 inasistencias en Educación Física.',
    iaRisks: [
      'Pedro registra tres ausencias consecutivas a clase de Educación Física.',
      'Andrea disminuyó 0.5 puntos en Matemáticas (su última calificación fue de 2.8).',
      'Se recomienda agendar una tutoría presencial con el docente de área.'
    ],
    gpaEvolution: [
      { period: 'Período 1', gpa: 3.8 },
      { period: 'Período 2', gpa: 4.0 },
      { period: 'Período 3 (Actual)', gpa: 4.2 },
    ],
    highlightedSubjects: [
      { name: 'Lengua Castellana', score: 4.8, type: 'destacada' },
      { name: 'Ciencias Naturales y Educación Ambiental', score: 3.8, type: 'regular' },
      { name: 'Matemáticas', score: 3.2, type: 'seguimiento' },
    ],
    attendanceDetail: {
      totalDays: 45,
      attended: 42,
      late: 2,
      excused: 1,
      unexcused: 0
    },
    rfidLogs: [
      { id: 'rfid-1', date: '2026-05-29', time: '06:55 AM', type: 'entrada', status: 'A tiempo' },
      { id: 'rfid-2', date: '2026-05-28', time: '02:15 PM', type: 'salida', status: 'Normal' },
      { id: 'rfid-3', date: '2026-05-28', time: '06:58 AM', type: 'entrada', status: 'A tiempo' },
      { id: 'rfid-4', date: '2026-05-27', time: '07:12 AM', type: 'entrada', status: 'Tarde' },
      { id: 'rfid-5', date: '2026-05-26', time: '06:50 AM', type: 'entrada', status: 'A tiempo' },
    ],
    subjectsGrades: [
      {
        subject: 'Matemáticas',
        teacher: 'Prof. Gómez',
        average: 3.2,
        recentGrades: [
          { name: 'Examen de Álgebra', score: 2.8, date: '22 May' },
          { name: 'Taller de Matrices', score: 3.5, date: '15 May' },
        ],
        comments: 'Pedro necesita reforzar las bases de trigonometría y álgebra lineal.'
      },
      {
        subject: 'Ciencias Naturales y Educación Ambiental',
        teacher: 'Prof. Gómez',
        average: 3.8,
        recentGrades: [
          { name: 'Práctica de Laboratorio', score: 3.5, date: '24 May' },
          { name: 'Evaluación de Ecosistemas', score: 4.0, date: '18 May' },
        ],
        comments: 'Buen desempeño, tiene gran interés en los ecosistemas y la preservación ambiental.'
      },
      {
        subject: 'Lengua Castellana',
        teacher: 'Lic. Carlos Martínez',
        average: 4.8,
        recentGrades: [
          { name: 'Ensayo Crítico', score: 4.8, date: '20 May' },
          { name: 'Oratoria', score: 4.9, date: '10 May' },
        ],
        comments: 'Excelente redacción y habilidades comunicativas excelentes.'
      }
    ],
    evaluations: [
      { id: 'ev-1', subject: 'Matemáticas', name: 'Evaluación Acumulativa de Trigonometría', date: '2026-06-01', status: 'Pendiente' },
      { id: 'ev-2', subject: 'Lengua Castellana', name: 'Exposición de Literatura Contemporánea', date: '2026-06-03', status: 'Pendiente' },
      { id: 'ev-3', subject: 'Ciencias Naturales y Educación Ambiental', name: 'Examen de Ecosistemas', date: '2026-05-25', status: 'Presentada', score: 4.0, comments: 'Excelente manejo conceptual.' },
      { id: 'ev-4', subject: 'Matemáticas', name: 'Quiz Rápido de Ecuaciones', date: '2026-05-22', status: 'Presentada', score: 3.0, comments: 'Revisar propiedades distributivas.' }
    ],
    messages: [
      {
        id: 'msg-1',
        sender: 'Lic. Carlos Martínez',
        role: 'Director de Grupo',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        message: 'Buenos días. Me gustaría conversar brevemente sobre el rendimiento de Pedro en Matemáticas y coordinar un plan de acompañamiento.',
        time: '08:30 AM',
        date: 'Hoy',
        isFromTeacher: true
      },
      {
        id: 'msg-2',
        sender: 'Tú',
        role: 'Acudiente',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        message: 'Entendido Lic. Martínez. Con gusto nos conectamos el jueves a las 4 PM.',
        time: '09:15 AM',
        date: 'Hoy',
        isFromTeacher: false,
        replied: true
      }
    ],
    circulars: [
      { id: 'circ-1', title: 'Salida de Campo Pedagógica a Observatorio Astronómico', content: 'Autorización formal y detalles logísticos para la salida de campo el día 5 de Junio.', date: '28 May', requiresSignature: true, signed: false },
      { id: 'circ-2', title: 'Convocatoria a Escuela de Padres de Familia P2', content: 'Charla magistral sobre pautas de crianza en la era digital y entrega parcial de notas.', date: '22 May', requiresSignature: false, signed: true }
    ],
    behaviorLogs: [
      { id: 'beh-1', type: 'Llamado de Atención', description: 'Uso inoportuno de dispositivo móvil durante la explicación de Ciencias Naturales.', date: '2026-05-27', observer: 'Prof. Gómez', status: 'Registrado' },
      { id: 'beh-2', type: 'Felicitación', description: 'Liderazgo destacado en la organización del foro de literatura escolar.', date: '2026-05-15', observer: 'Lic. Carlos Martínez', status: 'Registrado' },
      { id: 'beh-3', type: 'Compromiso', description: 'Acuerdo de mejora de asistencia y puntualidad firmado presencialmente.', date: '2026-05-10', observer: 'Coord. Convivencia', status: 'Activo' }
    ],
    recentActivity: [
      { id: 'act-1', type: 'nota', title: 'Calificación Registrada', description: 'Lengua Castellana: 4.8 en Ensayo Crítico.', date: 'Hoy', time: '10:30 AM', badgeText: 'Nota Alta', badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-250' },
      { id: 'act-2', type: 'comunicacion', title: 'Mensaje Recibido', description: 'Lic. Carlos Martínez solicited programar un plan de acompañamiento.', date: 'Hoy', time: '08:30 AM', badgeText: 'Mensaje', badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-250' },
      { id: 'act-3', type: 'asistencia', title: 'Registro RFID', description: 'Ingreso a portería registrado a las 06:55 AM.', date: 'Hoy', time: '06:55 AM', badgeText: 'A tiempo', badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-250' },
      { id: 'act-4', type: 'observacion', title: 'Llamado de Atención', description: 'Registrado por uso de móvil en clase de Ciencias Naturales.', date: 'Ayer', time: '11:15 AM', badgeText: 'Comportamiento', badgeStyle: 'bg-rose-50 text-rose-700 border-rose-250' },
      { id: 'act-5', type: 'asistencia', title: 'Registro de Retardo', description: 'Ingreso tardío registrado a las 07:12 AM.', date: 'Hace 2 días', time: '07:12 AM', badgeText: 'Retardo', badgeStyle: 'bg-amber-50 text-amber-700 border-amber-250' },
      { id: 'act-6', type: 'evaluacion', title: 'Evaluación Presentada', description: 'Ciencias Naturales y Educación Ambiental: Examen de Ecosistemas. Calificación: 4.0.', date: 'Hace 4 días', time: '02:00 PM', badgeText: 'Evaluado', badgeStyle: 'bg-blue-50 text-blue-700 border-blue-250' }
    ]
  },
  {
    id: 'ch-02',
    name: 'Andrea Ramírez Ortiz',
    grade: '5-B',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    director: 'Dra. Diana Reyes',
    directorPhone: '+573109991111',
    directorEmail: 'diana.reyes@aulacore.edu.co',
    gpa: 4.8,
    attendanceRate: 99.0,
    behaviorScore: 9.8,
    alertCount: 0,
    pendingActivities: 2,
    dropoutRisk: 'Bajo',
    iaState: 'Excelente Desempeño',
    iaStateColor: 'success',
    iaStateDescription: 'Andrea mantiene un estándar académico excepcional. Se resalta su regularidad y participación activa.',
    iaRisks: [
      'Andrea disminuyó 0.5 puntos en Ciencias Naturales (de 5.0 a 4.5), manteniéndose en nivel Excelente.',
      'Se destaca 99% de asistencia acumulada anual sin retardos registrados este mes.'
    ],
    gpaEvolution: [
      { period: 'Período 1', gpa: 4.6 },
      { period: 'Período 2', gpa: 4.7 },
      { period: 'Período 3 (Actual)', gpa: 4.8 },
    ],
    highlightedSubjects: [
      { name: 'Matemáticas', score: 4.9, type: 'destacada' },
      { name: 'Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia', score: 5.0, type: 'destacada' },
      { name: 'Ciencias Naturales y Educación Ambiental', score: 4.5, type: 'regular' },
    ],
    attendanceDetail: {
      totalDays: 45,
      attended: 44,
      late: 0,
      excused: 1,
      unexcused: 0
    },
    rfidLogs: [
      { id: 'rfid-1', date: '2026-05-29', time: '06:48 AM', type: 'entrada', status: 'A tiempo' },
      { id: 'rfid-2', date: '2026-05-28', time: '01:58 PM', type: 'salida', status: 'Normal' },
      { id: 'rfid-3', date: '2026-05-28', time: '06:50 AM', type: 'entrada', status: 'A tiempo' },
      { id: 'rfid-4', date: '2026-05-27', time: '06:45 AM', type: 'entrada', status: 'A tiempo' },
      { id: 'rfid-5', date: '2026-05-26', time: '06:47 AM', type: 'entrada', status: 'A tiempo' },
    ],
    subjectsGrades: [
      {
        subject: 'Matemáticas',
        teacher: 'Dra. Diana Reyes',
        average: 4.9,
        recentGrades: [
          { name: 'Taller de Fraccionarios', score: 5.0, date: '27 May' },
          { name: 'Examen de Geometría', score: 4.8, date: '18 May' },
        ],
        comments: 'Brillante lógica matemática y participación entusiasta en clases.'
      },
      {
        subject: 'Ciencias Naturales y Educación Ambiental',
        teacher: 'Dra. Diana Reyes',
        average: 4.5,
        recentGrades: [
          { name: 'Taller de Vertebrados', score: 4.5, date: '25 May' },
          { name: 'Dibujo de Célula', score: 4.5, date: '12 May' },
        ],
        comments: 'Muestra gran interés por los ecosistemas y la preservación ambiental.'
      },
      {
        subject: 'Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia',
        teacher: 'Lic. Carlos Martínez',
        average: 5.0,
        recentGrades: [
          { name: 'Historia de Colombia', score: 5.0, date: '20 May' },
          { name: 'Geografía Física', score: 5.0, date: '08 May' },
        ],
        comments: 'Excelente memoria e interpretación analítica de la historia patria.'
      }
    ],
    evaluations: [
      { id: 'ev-1', subject: 'Matemáticas', name: 'Taller Escrito de Geometría Plana', date: '2026-06-02', status: 'Pendiente' },
      { id: 'ev-2', subject: 'Ciencias Naturales y Educación Ambiental', name: 'Presentación de Maqueta de Ecosistema', date: '2026-06-04', status: 'Pendiente' },
      { id: 'ev-3', subject: 'Matemáticas', name: 'Evaluación de Operaciones Fraccionarias', date: '2026-05-20', status: 'Presentada', score: 5.0, comments: 'Resolución perfecta.' },
      { id: 'ev-4', subject: 'Ciencias Naturales y Educación Ambiental', name: 'Examen de Clasificación Taxonómica', date: '2026-05-15', status: 'Presentada', score: 4.5, comments: 'Dominio absoluto de la temática.' }
    ],
    messages: [
      {
        id: 'msg-1',
        sender: 'Dra. Diana Reyes',
        role: 'Directora de Grupo',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        message: 'Estimados padres. Quiero felicitarlos por el gran proyecto escolar ambiental que lideró Andrea esta semana. Es un ejemplo para el curso.',
        time: '04:15 PM',
        date: 'Hace 4 días',
        isFromTeacher: true
      }
    ],
    circulars: [
      { id: 'circ-1', title: 'Salida al Jardín Botánico Escolar', content: 'Práctica vivencial de Ciencias Naturales y Educación Ambiental sobre flora andina el 8 de Junio.', date: '29 May', requiresSignature: true, signed: false },
      { id: 'circ-2', title: 'Clausura Deportiva Semestral Primaria', content: 'Cronograma de encuentros deportivos y premiación de olimpiadas.', date: '25 May', requiresSignature: false, signed: true }
    ],
    behaviorLogs: [
      { id: 'beh-1', type: 'Felicitación', description: 'Excelente participación y comportamiento cívico ejemplar en el aula.', date: '2026-05-26', observer: 'Dra. Diana Reyes', status: 'Registrado' },
      { id: 'beh-2', type: 'Felicitación', description: 'Liderazgo destacado en la campaña de reciclaje y cuidado de plantas del salón.', date: '2026-05-18', observer: 'Dra. Diana Reyes', status: 'Registrado' }
    ],
    recentActivity: [
      { id: 'act-1', type: 'nota', title: 'Calificación Excelente', description: 'Ciencias Naturales y Educación Ambiental: 4.5 en Taller de Vertebrados.', date: 'Hoy', time: '11:15 AM', badgeText: 'Sobresaliente', badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-250' },
      { id: 'act-2', type: 'asistencia', title: 'Ingreso Escolar', description: 'Entrada registrada por RFID a las 06:48 AM.', date: 'Hoy', time: '06:48 AM', badgeText: 'A tiempo', badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-250' },
      { id: 'act-3', type: 'nota', title: 'Nota Perfecta', description: 'Matemáticas: 5.0 en Taller de Fraccionarios.', date: 'Ayer', time: '09:40 AM', badgeText: 'Excelente', badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-350' },
      { id: 'act-4', type: 'observacion', title: 'Felicitación Registrada', description: 'Excelente comportamiento cívico y orden ejemplar.', date: 'Hace 3 días', time: '03:10 PM', badgeText: 'Cívico', badgeStyle: 'bg-purple-50 text-purple-700 border-purple-250' },
      { id: 'act-5', type: 'comunicacion', title: 'Felicitación Docente', description: 'La Dra. Diana Reyes felicitó el liderazgo ecológico de Andrea.', date: 'Hace 4 días', time: '04:15 PM', badgeText: 'Felicidades', badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-250' }
    ]
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export interface ParentDashboardProps {
  userName: string;
}

type TabType = 'actividad' | 'resumen' | 'asistencia' | 'notas' | 'evaluaciones' | 'comunicaciones' | 'observador';

export function ParentDashboard({ userName }: ParentDashboardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Gestión de Hijos
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const activeChild = MOCK_CHILDREN[activeChildIndex];
  const [selectorOpen, setSelectorOpen] = useState(false);

  // Gestión de Pestañas
  const [activeTab, setActiveTab] = useState<TabType>('actividad');

  // Mensajería instantánea local
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Record<string, ChildData['messages']>>({
    'ch-01': [...MOCK_CHILDREN[0].messages],
    'ch-02': [...MOCK_CHILDREN[1].messages]
  });

  // Circular Firmas Locales
  const [signedCirculars, setSignedCirculars] = useState<Record<string, boolean>>({});

  // --- PERSISTENCE: LOCALSTORAGE Fallback ---
  useEffect(() => {
    const savedChat = localStorage.getItem('aulacore_parent_chat_history');
    if (savedChat) {
      try {
        setChatHistory(JSON.parse(savedChat));
      } catch (e) {
        console.warn('Error reading parent chat history:', e);
      }
    }
    const savedCirculars = localStorage.getItem('aulacore_parent_signed_circulars');
    if (savedCirculars) {
      try {
        setSignedCirculars(JSON.parse(savedCirculars));
      } catch (e) {
        console.warn('Error reading parent signed circulars:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aulacore_parent_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('aulacore_parent_signed_circulars', JSON.stringify(signedCirculars));
  }, [signedCirculars]);

  // Modal interactivo de cita
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentSubject, setAppointmentSubject] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  // Escuchar parámetro de consulta de URL (?tab=...)
  const searchParamsString = searchParams.toString();
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      if (['actividad', 'resumen', 'asistencia', 'notas', 'evaluaciones', 'comunicaciones', 'observador'].includes(tabParam)) {
        setActiveTab(tabParam as TabType);
      }
    } else {
      setActiveTab('actividad');
    }
  }, [searchParamsString]);

  // Manejar cambio de pestaña
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Actualizar URL sin recargar para soportar links directos
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    router.replace(url.pathname + url.search);
  };

  // Enviar mensaje en chat
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage = {
      id: `chat-${Date.now()}`,
      sender: 'Tú',
      role: 'Acudiente',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      message: chatInput.trim(),
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      date: 'Hoy',
      isFromTeacher: false
    };

    setChatHistory(prev => ({
      ...prev,
      [activeChild.id]: [...prev[activeChild.id], newMessage]
    }));
    setChatInput('');

    // Auto-respuesta simulada de IA o Docente en 2.5 seg
    setTimeout(() => {
      const responseMessage = {
        id: `chat-auto-${Date.now()}`,
        sender: activeChild.director,
        role: 'Director de Grupo',
        avatar: activeChild.id === 'ch-01' 
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        message: `Hola. He recibido su mensaje sobre ${activeChild.name}. Le responderé formalmente lo antes posible. ¡Gracias!`,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        date: 'Hoy',
        isFromTeacher: true
      };
      setChatHistory(prev => ({
        ...prev,
        [activeChild.id]: [...prev[activeChild.id], responseMessage]
      }));
    }, 2500);
  };

  // Firmar circular
  const handleSignCircular = (id: string) => {
    setSignedCirculars(prev => ({ ...prev, [id]: true }));
    alert('✓ Circular firmada digitalmente de forma exitosa y vinculada a tu ID de Acudiente.');
  };

  // Enviar Solicitud de Cita
  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentSubject || !appointmentDate || !appointmentTime) return;

    setAppointmentSuccess(true);
    setTimeout(() => {
      setAppointmentSuccess(false);
      setAppointmentModalOpen(false);
      setAppointmentSubject('');
      setAppointmentDate('');
      setAppointmentTime('');
      alert(`✓ Cita solicitada exitosamente con el ${activeChild.director} para el día ${appointmentDate} a las ${appointmentTime}.`);
    }, 1500);
  };

  // Descarga real de boletín / certificado
  const handleDownloadDoc = (type: 'boletin' | 'certificado') => {
    if (type === 'boletin') {
      downloadBoletinPDF(
        activeChild.name,
        activeChild.grade,
        activeChild.gpa,
        activeChild.subjectsGrades,
        'Periodo Escolar P3'
      );
    } else {
      const enrollmentNum = `2026-MAT-098${activeChild.id.slice(-2)}`;
      downloadCertificadoMatriculaPDF(
        activeChild.name,
        activeChild.grade,
        enrollmentNum
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in duration-300">
      
      {/* =======================================================================
          1. HEADER Y SELECTOR MULTI-HIJO PREMIUM
          ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-150 shadow-sm">
        <div>
          <h2 className="text-[11px] font-bold text-indigo-650 uppercase tracking-widest leading-none">Centro de Éxito Estudiantil</h2>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Student Success Center</h1>
          <p className="text-[13px] text-slate-500 mt-1">Bienvenido(a), {userName}. Monitoreo integral en tiempo real.</p>
        </div>
        
        {/* Dropdown Apple-Style Selector */}
        <div className="relative">
          <button
            onClick={() => setSelectorOpen(!selectorOpen)}
            className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-xl text-left shadow-sm select-none transition-all outline-none"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-inner">
              <img src={activeChild.avatar} alt={activeChild.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">Hijo Activo</p>
              <h4 className="text-sm font-extrabold text-slate-800 tracking-tight mt-1 flex items-center gap-1">
                {activeChild.name}
                <span className="text-indigo-600 text-xs font-bold">({activeChild.grade})</span>
              </h4>
            </div>
            <ChevronDown className="w-4.5 h-4.5 text-slate-450 ml-2" />
          </button>

          {selectorOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-150">
              <p className="px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Hijos asociados a la cuenta</p>
              {MOCK_CHILDREN.map((child, idx) => (
                <button
                  key={child.id}
                  onClick={() => {
                    setActiveChildIndex(idx);
                    setSelectorOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors border-none outline-none ${idx === activeChildIndex ? 'bg-indigo-50/40 text-indigo-950 font-bold' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-inner">
                    <img src={child.avatar} alt={child.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h5 className={`text-sm tracking-tight truncate ${idx === activeChildIndex ? 'font-black text-indigo-700' : 'font-semibold text-slate-700'}`}>{child.name}</h5>
                    <p className="text-xs text-slate-450 leading-none mt-0.5">{child.grade} • {child.director}</p>
                  </div>
                  {idx === activeChildIndex && (
                    <div className="w-2 h-2 rounded-full bg-indigo-650" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =======================================================================
          2. TARJETA SUPERIOR DEL ESTUDIANTE DE ALTA FIDELIDAD
          ======================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-center md:items-stretch gap-6">
        
        {/* Glow de Fondo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        {/* Foto y Nombre del Alumno */}
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 pb-5 md:pb-0 md:pr-6 w-full md:w-[220px] shrink-0 text-center relative z-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-indigo-400 bg-slate-850 shadow-md overflow-hidden relative group/avatar select-none">
            <img src={activeChild.avatar} alt={activeChild.name} className="w-full h-full object-cover transition duration-300 group-hover/avatar:scale-105" />
          </div>
          <h3 className="font-extrabold text-[18px] sm:text-[20px] tracking-tight mt-3 leading-tight">{activeChild.name}</h3>
          <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-2">
            Matriculado • Activo
          </span>
        </div>

        {/* Detalles e Indicadores Principales */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full relative z-10">
          
          {/* Ficha Académica Básica */}
          <div className="flex flex-col justify-center space-y-3">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Grado Escolar</span>
              <span className="font-extrabold text-base flex items-center gap-1.5 mt-0.5">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                {activeChild.grade} (Educación Básica)
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Director de Grupo</span>
              <span className="font-extrabold text-sm flex items-center gap-1.5 mt-0.5">
                <User className="w-4 h-4 text-indigo-400" />
                {activeChild.director}
              </span>
            </div>
          </div>

          {/* KPI Promedio General */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/8 transition-colors select-none">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Promedio General</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black tracking-tight">{activeChild.gpa}</span>
              <span className="text-slate-400 text-xs font-semibold"> / 5.0</span>
              <p className="text-[10px] text-emerald-400 font-bold mt-1">✓ Rendimiento Académico Óptimo</p>
            </div>
          </div>

          {/* KPI Asistencia RFID */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/8 transition-colors select-none">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Asistencia Mensual</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black tracking-tight">{activeChild.attendanceRate}%</span>
              <p className="text-[10px] text-slate-450 font-bold mt-1">Registros automáticos RFID en portería</p>
            </div>
          </div>

          {/* KPI Estado IA Alertas */}
          <div className={`border rounded-2xl p-4 flex flex-col justify-between hover:bg-opacity-20 transition-all select-none ${activeChild.iaStateColor === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' : activeChild.iaStateColor === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-350">Monitoreo Predictivo IA</span>
              <Sparkles className={`w-4 h-4 ${activeChild.iaStateColor === 'success' ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>
            <div className="mt-3">
              <span className={`text-base font-black tracking-tight block ${activeChild.iaStateColor === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {activeChild.iaState}
              </span>
              <p className="text-[9px] text-slate-350 font-medium leading-tight mt-1.5 line-clamp-2">
                {activeChild.iaStateDescription}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* =======================================================================
          3. NAVEGADOR DE PESTAÑAS (STRIPE/LINEAR STYLE)
          ======================================================================= */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 flex flex-wrap gap-1 select-none">
        {[
          { id: 'actividad', label: 'Actividad Reciente', icon: Clock },
          { id: 'resumen', label: 'Resumen Académico', icon: TrendingUp },
          { id: 'asistencia', label: 'Asistencia RFID', icon: QrCode },
          { id: 'notas', label: 'Notas por Materia', icon: FileText },
          { id: 'evaluaciones', label: 'Próximas Evaluaciones', icon: Calendar },
          { id: 'comunicaciones', label: 'Comunicaciones', icon: MessageSquare },
          { id: 'observador', label: 'Observador', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-none outline-none cursor-pointer ${isActive ? 'bg-white text-indigo-750 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 bg-transparent'}`}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-indigo-650' : 'text-slate-400'}`} />
              {tab.label}
              {tab.id === 'comunicaciones' && activeChild.alertCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* =======================================================================
          4. CUERPO DE DOS COLUMNAS DE ALTA FIDELIDAD
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* COLUMNA PRINCIPAL DE CONTENIDO (IZQUIERDA - 2 COLUMNAS) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden rounded-2xl">
            <CardContent className="p-6">
              
              {/* -------------------------------------------------------------
                  TAB: ACTIVIDAD RECIENTE (CRONOLÓGICA)
                  ------------------------------------------------------------- */}
              {activeTab === 'actividad' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Línea de Tiempo de Actividad</h3>
                    <p className="text-xs text-slate-500 mt-1">Bitácora de eventos académicos, disciplinarios e ingresos del estudiante.</p>
                  </div>

                  <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-6 py-2">
                    {activeChild.recentActivity.map((act) => {
                      return (
                        <div key={act.id} className="relative group/timeline animate-in fade-in duration-200">
                          {/* Nodo de Línea */}
                          <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white ring-4 ring-slate-50 flex items-center justify-center shrink-0 ${act.type === 'nota' ? 'bg-emerald-500' : act.type === 'evaluacion' ? 'bg-blue-500' : act.type === 'asistencia' ? 'bg-indigo-500' : act.type === 'observacion' ? 'bg-rose-500' : 'bg-purple-500'}`} />
                          
                          {/* Tarjeta de Evento */}
                          <div className="bg-slate-50/60 border border-slate-150 hover:border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${act.badgeStyle}`}>
                                  {act.badgeText}
                                </span>
                                <h4 className="font-extrabold text-slate-800 text-sm mt-2">{act.title}</h4>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-450 text-[11px] font-bold">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{act.date} {act.time && `• ${act.time}`}</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 font-semibold leading-relaxed mt-2.5">
                              {act.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB: RESUMEN ACADÉMICO
                  ------------------------------------------------------------- */}
              {activeTab === 'resumen' && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Análisis de Desempeño Académico</h3>
                    <p className="text-xs text-slate-500 mt-1">Evolución de promedio general y control de alertas escolares.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Gráfico de Evolución */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Evolución de Promedio Académico</h4>
                      <div className="h-48 w-full border border-slate-150 rounded-2xl p-4 bg-slate-50/50">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={activeChild.gpaEvolution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="parentGpaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="period" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                            <YAxis domain={[1.0, 5.0]} stroke="#94a3b8" fontSize={10} fontWeight="bold" ticks={[1, 2, 3, 4, 5]} />
                            <ChartTooltip />
                            <Area type="monotone" dataKey="gpa" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#parentGpaGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Semáforo de Asignaturas */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Semáforo de Materias Clave</h4>
                      <div className="space-y-4">
                        {activeChild.highlightedSubjects.map((sub) => {
                          const isHigh = sub.type === 'destacada';
                          const isLow = sub.type === 'seguimiento';
                          return (
                            <div key={sub.name} className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${isHigh ? 'bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50' : isLow ? 'bg-rose-50/40 border-rose-100 hover:bg-rose-50' : 'bg-blue-50/40 border-blue-100 hover:bg-blue-50'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${isHigh ? 'bg-emerald-100 text-emerald-700' : isLow ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {sub.name[0]}
                                </div>
                                <div>
                                  <h5 className="font-extrabold text-slate-800 text-xs sm:text-sm">{sub.name}</h5>
                                  <p className={`text-[10px] font-black uppercase tracking-wider ${isHigh ? 'text-emerald-600' : isLow ? 'text-rose-600' : 'text-blue-600'}`}>
                                    {isHigh ? 'Destacada' : isLow ? 'En Seguimiento' : 'Regular'}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-base font-black px-2.5 py-1 rounded-lg ${isHigh ? 'bg-emerald-100 text-emerald-800' : isLow ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
                                {sub.score}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB: ASISTENCIA RFID / QR
                  ------------------------------------------------------------- */}
              {activeTab === 'asistencia' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">Registro de Asistencia Biométrica RFID</h3>
                      <p className="text-xs text-slate-500 mt-1">Bitácora exacta de ingresos y egresos controlada por RFID institucional.</p>
                    </div>
                    
                    {/* Carnet Digital RFID Real QR Code */}
                    <div className="bg-gradient-to-br from-indigo-650 to-indigo-850 text-white rounded-2xl p-4 border border-indigo-600 shadow-sm shrink-0 w-full sm:w-60 select-none relative overflow-hidden flex items-center gap-3">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl -mr-5 -mt-5" />
                      <div className="w-12 h-12 bg-white rounded-lg p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://aulacore.edu.co/verify/student-${activeChild.id}`)}`} 
                          alt="Carnet QR" 
                          className="w-full h-full object-contain select-none"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest block">Credencial RFID Activa</span>
                        <h4 className="text-xs font-extrabold tracking-tight truncate mt-0.5">{activeChild.name}</h4>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded mt-1 inline-block">Sincronizado</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumen Métrico */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50 border border-slate-150 rounded-2xl p-4">
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Clases Totales</span>
                      <strong className="text-xl font-black text-slate-800 mt-1 block">{activeChild.attendanceDetail.totalDays}</strong>
                    </div>
                    <div className="text-center border-l border-slate-150">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Asistidas</span>
                      <strong className="text-xl font-black text-slate-800 mt-1 block text-emerald-600">{activeChild.attendanceDetail.attended}</strong>
                    </div>
                    <div className="text-center border-l border-slate-150">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Retardos</span>
                      <strong className="text-xl font-black text-slate-800 mt-1 block text-amber-600">{activeChild.attendanceDetail.late}</strong>
                    </div>
                    <div className="text-center border-l border-slate-150">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Inasistencias Just.</span>
                      <strong className="text-xl font-black text-slate-800 mt-1 block text-blue-600">{activeChild.attendanceDetail.excused}</strong>
                    </div>
                  </div>

                  {/* Log de Registros */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trazabilidad de Portería Escolar</h4>
                    <div className="border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-100">
                      {activeChild.rfidLogs.map((log) => {
                        const isLate = log.status === 'Tarde';
                        return (
                          <div key={log.id} className="p-3 sm:px-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isLate ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                <QrCode className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="font-extrabold text-slate-800 text-xs sm:text-sm capitalize">Registro de {log.type}</h5>
                                <p className="text-[11px] text-slate-400 font-bold">{log.date} • RFID Terminal Portería</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-700 font-extrabold text-xs sm:text-sm block">{log.time}</span>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 inline-block ${isLate ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                                {log.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB: NOTAS DETALLADAS
                  ------------------------------------------------------------- */}
              {activeTab === 'notas' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Centro de Calificaciones</h3>
                    <p className="text-xs text-slate-500 mt-1">Calificaciones detalladas del periodo académico actual y notas en firme.</p>
                  </div>

                  <div className="space-y-6">
                    {activeChild.subjectsGrades.map((sub) => {
                      return (
                        <div key={sub.subject} className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xs transition-shadow">
                          {/* Header de Materia */}
                          <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="font-black text-slate-800 text-base">{sub.subject}</h4>
                              <p className="text-[11px] text-slate-400 font-bold">Docente: {sub.teacher}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Promedio de Área:</span>
                              <span className={`text-base font-black px-2.5 py-1 rounded-xl shadow-2xs ${sub.average >= 4.0 ? 'bg-emerald-100 text-emerald-800' : sub.average >= 3.3 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}>
                                {sub.average}
                              </span>
                            </div>
                          </div>

                          {/* Notas Recientes */}
                          <div className="p-4 bg-white divide-y divide-slate-100">
                            <div className="pb-3.5 space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Evaluaciones Recientes del Período</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {sub.recentGrades.map((grade, idx) => (
                                  <div key={idx} className="p-3 border border-slate-150 bg-slate-50/30 rounded-xl flex items-center justify-between">
                                    <div className="overflow-hidden">
                                      <h5 className="font-bold text-slate-700 text-xs sm:text-sm truncate">{grade.name}</h5>
                                      <p className="text-[10px] text-slate-400 font-semibold">{grade.date}</p>
                                    </div>
                                    <span className={`font-black text-sm px-2 py-1 rounded-lg ${grade.score >= 4.0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : grade.score >= 3.0 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                      {grade.score}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Retroalimentación */}
                            <div className="pt-3">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Observaciones del Docente</span>
                              <p className="text-xs text-slate-600 font-semibold leading-relaxed italic mt-1.5 bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl">
                                "{sub.comments}"
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB: EVALUACIONES PROGRAMADAS
                  ------------------------------------------------------------- */}
              {activeTab === 'evaluaciones' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Cronograma de Evaluaciones</h3>
                    <p className="text-xs text-slate-500 mt-1">Calendario y resultados de quices, talleres evaluativos y bimestrales.</p>
                  </div>

                  {/* Próximas Evaluaciones */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pendientes por Presentar</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeChild.evaluations.filter(e => e.status === 'Pendiente').map((ev) => (
                        <div key={ev.id} className="bg-slate-50/60 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 hover:border-slate-350 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <span className="text-[10px] font-black text-indigo-650 uppercase tracking-wider block">{ev.subject}</span>
                            <h5 className="font-extrabold text-slate-800 text-xs sm:text-sm mt-1 truncate">{ev.name}</h5>
                            <div className="flex items-center gap-1.5 text-slate-450 text-[11px] font-bold mt-2">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Fecha Límite: {ev.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evaluaciones Realizadas */}
                  <div className="space-y-3 pt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Evaluaciones Realizadas y Retroalimentadas</h4>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                      {activeChild.evaluations.filter(e => e.status === 'Presentada').map((ev) => (
                        <div key={ev.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                          <div className="overflow-hidden">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{ev.subject}</span>
                            <h5 className="font-extrabold text-slate-800 text-xs sm:text-sm mt-1 truncate">{ev.name}</h5>
                            {ev.comments && (
                              <p className="text-xs text-slate-500 font-semibold italic mt-1 leading-relaxed">
                                Comentario: "{ev.comments}"
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-base font-black px-3 py-1 rounded-xl shadow-2xs inline-block min-w-10 text-center ${ev.score && ev.score >= 4.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {ev.score}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-1">Evaluado el {ev.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB: COMUNICACIONES DIRECTAS
                  ------------------------------------------------------------- */}
              {activeTab === 'comunicaciones' && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  
                  {/* Circulares Institucionales */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Comunicaciones & Circulares Oficiales</h3>
                    <p className="text-xs text-slate-500 mt-1">Documentos oficiales institucionales que requieren tu firma digital o confirmación de lectura.</p>
                    
                    <div className="space-y-4">
                      {activeChild.circulars.map((circ) => {
                        const isSigned = signedCirculars[circ.id] || circ.signed;
                        return (
                          <div key={circ.id} className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                                {circ.title}
                                {circ.requiresSignature && !isSigned && (
                                  <span className="bg-rose-100 text-rose-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-rose-200">Firma Obligatoria</span>
                                )}
                              </h4>
                              <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">
                                {circ.content}
                              </p>
                              <span className="text-[10px] text-slate-400 font-semibold block mt-2">Emitido el {circ.date}</span>
                            </div>
                            
                            <div className="shrink-0 flex items-center sm:items-end justify-start sm:justify-center">
                              {circ.requiresSignature ? (
                                isSigned ? (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs">
                                    <FileCheck className="w-4 h-4" />
                                    Firmado Digitalmente
                                  </span>
                                ) : (
                                  <Button 
                                    onClick={() => handleSignCircular(circ.id)}
                                    className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-4 py-2 shadow-2xs"
                                  >
                                    Firmar Circular
                                  </Button>
                                )
                              ) : (
                                <span className="bg-slate-200/50 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                                  <CheckCheck className="w-4 h-4 text-slate-400" /> Leído
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Canal de Mensajería Directa */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bandeja de Mensajes Directos</h4>
                      <p className="text-[11px] text-slate-400 font-bold mt-1">Canal seguro bidireccional con el Director de Grupo {activeChild.director}.</p>
                    </div>

                    <Card className="border-slate-200 shadow-sm flex flex-col h-[380px] rounded-2xl overflow-hidden bg-slate-50/30">
                      {/* Cabecera del Chat */}
                      <div className="bg-white p-3 border-b border-slate-200 flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                            <img src={activeChild.id === 'ch-01' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'} alt="Director" className="w-full h-full object-cover" />
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-tight">{activeChild.director}</h4>
                          <p className="text-[10px] text-slate-450 font-bold leading-none mt-0.5">Director de Curso • Activo</p>
                        </div>
                      </div>

                      {/* Historial del Chat */}
                      <ScrollArea className="flex-1 p-4 bg-white/70">
                        <div className="space-y-4">
                          {chatHistory[activeChild.id]?.map((msg) => {
                            const isMe = !msg.isFromTeacher;
                            return (
                              <div key={msg.id} className={`flex items-end gap-2 max-w-[85%] animate-in fade-in duration-200 ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                                {!isMe && (
                                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mb-1 border border-slate-100 shadow-inner">
                                    <img src={msg.avatar} alt={msg.sender} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div className={`px-4 py-2.5 rounded-2xl shadow-3xs text-xs sm:text-sm leading-relaxed ${isMe ? 'bg-indigo-650 text-white rounded-br-sm' : 'bg-slate-100 text-slate-700 rounded-bl-sm border border-slate-150'}`}>
                                  <p className="font-medium">{msg.message}</p>
                                  <div className={`flex items-center justify-end gap-1 mt-1.5 text-[9px] ${isMe ? 'text-indigo-200' : 'text-slate-400 font-bold'}`}>
                                    <span>{msg.time}</span>
                                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-indigo-300" />}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>

                      {/* Footer de Enviar Chat */}
                      <div className="p-3 bg-white border-t border-slate-200">
                        <form onSubmit={handleSendChat} className="flex w-full items-center gap-2">
                          <Input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Escribe un mensaje al director..."
                            className="flex-1 rounded-full border-slate-200 bg-slate-50 px-4 focus-visible:ring-indigo-500 text-xs sm:text-sm font-medium"
                          />
                          <Button type="submit" size="icon" className="rounded-full bg-indigo-650 hover:bg-indigo-700 shrink-0 cursor-pointer h-9 w-9 border-none outline-none">
                            <Send className="w-4 h-4 text-white" />
                          </Button>
                        </form>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  TAB: OBSERVADOR DIGITAL
                  ------------------------------------------------------------- */}
              {activeTab === 'observador' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Observador del Estudiante</h3>
                    <p className="text-xs text-slate-500 mt-1">Bitácora comportamental, anotaciones del docente y compromisos convivenciales firmados.</p>
                  </div>

                  <div className="space-y-4">
                    {activeChild.behaviorLogs.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl">
                        <span className="text-3xl">🎉</span>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-3">Sin observaciones negativas</h4>
                        <p className="text-xs text-slate-500 mt-1">Excelente comportamiento e impecable rendimiento disciplinario.</p>
                      </div>
                    ) : (
                      activeChild.behaviorLogs.map((log) => {
                        const isGood = log.type === 'Felicitación';
                        const isDanger = log.type === 'Llamado de Atención';
                        return (
                          <div key={log.id} className={`p-4 border rounded-2xl flex items-start gap-4 transition-all ${isGood ? 'bg-emerald-50/40 border-emerald-150 hover:bg-emerald-50/80' : isDanger ? 'bg-rose-50/40 border-rose-150 hover:bg-rose-50/80' : 'bg-amber-50/40 border-amber-150 hover:bg-amber-50/80'}`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isGood ? 'bg-emerald-100 text-emerald-700' : isDanger ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                              <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <h4 className={`font-black text-xs sm:text-sm ${isGood ? 'text-emerald-800' : isDanger ? 'text-rose-800' : 'text-amber-800'}`}>{log.type}</h4>
                                <span className="text-[10px] text-slate-400 font-bold">{log.date}</span>
                              </div>
                              <p className="text-xs text-slate-700 font-semibold leading-relaxed mt-2.5">{log.description}</p>
                              <div className="flex items-center justify-between border-t border-slate-150/40 pt-2 mt-3 text-[10px] text-slate-400 font-bold">
                                <span>Registrado por: {log.observer}</span>
                                <span className={`uppercase tracking-wider font-extrabold ${isGood ? 'text-emerald-600' : isDanger ? 'text-rose-600' : 'text-amber-600'}`}>{log.status}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* =======================================================================
            COLUMNA DERECHA - WIDGETS AUXILIARES (PANELES E IA)
            ======================================================================= */}
        <div className="space-y-6">
          
          {/* PANEL DE RIESGO IA DEDICADO Y FILTRADO */}
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl select-none">
            <CardHeader className="bg-gradient-to-r from-indigo-950 to-slate-900 text-white p-4 border-b border-indigo-900/20">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-yellow-400 fill-yellow-400 animate-pulse" />
                Diagnóstico de Riesgo IA AulaCore
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Semáforo de Deserción */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Riesgo de Deserción</span>
                  <span className="text-xs font-black text-emerald-600 block mt-0.5">Nivel Bajo (0.2%)</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-bounce" />
                </div>
              </div>

              {/* Insights Dinámicos de IA */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Alertas Predictivas</span>
                <div className="space-y-3">
                  {activeChild.iaRisks.map((risk, index) => (
                    <div key={index} className="flex gap-2.5 items-start bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      <AlertCircle className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-650 font-semibold leading-relaxed">
                        {risk}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[9px] text-slate-400 bg-slate-50 border border-slate-150 p-2 rounded-lg leading-tight font-medium">
                🔒 Toda la información analizada corresponde estrictamente a tu hijo. AulaCore protege los datos sensibles institucionales.
              </div>

            </CardContent>
          </Card>

          {/* ACCIONES RÁPIDAS (INTERACTIVAS) */}
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl select-none">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-black text-slate-800">
                Acciones Rápidas del Success Center
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              
              {/* WhatsApp Director de Grupo */}
              <a
                href={`https://wa.me/${activeChild.directorPhone}?text=Estimado%20${encodeURIComponent(activeChild.director)},%20le%20escribo%20como%20acudiente%20de%20${encodeURIComponent(activeChild.name)}%20para...`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs py-3.5 rounded-xl shadow-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircleIcon className="w-4.5 h-4.5" />
                WhatsApp Director de Grupo
              </a>

              {/* WhatsApp Docente de área en riesgo */}
              <a
                href={`https://wa.me/573001234567?text=Estimado%20Docente,%20le%20escribo%20como%20acudiente%20de%20${encodeURIComponent(activeChild.name)}%20para%20solicitar%20retroalimentación%20de...`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-900 hover:bg-black text-white font-extrabold text-xs py-3.5 rounded-xl shadow-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer border-none outline-none"
              >
                <MessageSquare className="w-4.5 h-4.5 text-indigo-300" />
                WhatsApp Docente de Área
              </a>

              {/* Correo al Director de Grupo */}
              <a
                href={`mailto:${activeChild.directorEmail}?subject=Consulta%20Acad%C3%A9mica%20-%20${encodeURIComponent(activeChild.name)}&body=Estimado%20${encodeURIComponent(activeChild.director)},%0D%0A%0D%0AEspero%20se%20encuentre%20muy%20bien.%20Me%20comunico%20para%20hacer%20seguimiento%20sobre...`}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs py-3.5 rounded-xl shadow-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Mail className="w-4.5 h-4.5 text-slate-500" />
                Contactar por Correo
              </a>

              {/* Solicitar Cita */}
              <Button
                onClick={() => setAppointmentModalOpen(true)}
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-extrabold text-xs py-3.5 h-auto rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer border-none outline-none"
              >
                <Calendar className="w-4.5 h-4.5 text-indigo-650" />
                Solicitar Cita Presencial
              </Button>

              {/* Descargas Oficiales */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleDownloadDoc('boletin')}
                  variant="outline"
                  className="rounded-xl border-slate-200 hover:bg-slate-50 hover:text-indigo-700 text-slate-700 font-extrabold text-[11px] py-3 h-auto gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar Boletín
                </Button>
                <Button
                  onClick={() => handleDownloadDoc('certificado')}
                  variant="outline"
                  className="rounded-xl border-slate-200 hover:bg-slate-50 hover:text-indigo-700 text-slate-700 font-extrabold text-[11px] py-3 h-auto gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Certificado
                </Button>
              </div>

            </CardContent>
          </Card>

        </div>
      </div>

      {/* =======================================================================
          MODAL INTERACTIVO DE SOLICITUD DE CITA
          ======================================================================= */}
      {appointmentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] animate-in fade-in duration-200 p-4 select-none">
          <Card className="w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-150 overflow-hidden">
            <div className="bg-slate-950 text-white p-5 border-b border-indigo-950/20 flex items-center justify-between">
              <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Solicitar Tutoría con {activeChild.director}
              </h3>
              <button 
                onClick={() => setAppointmentModalOpen(false)}
                className="text-slate-400 hover:text-white bg-transparent border-none outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <CardContent className="p-5">
              {appointmentSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8 animate-bounce" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-base">¡Solicitud Enviada!</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                    El director de curso validará la disponibilidad en su agenda AulaCore y te confirmará por el canal digital.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleScheduleAppointment} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Estudiante</label>
                    <Input
                      type="text"
                      disabled
                      value={activeChild.name}
                      className="bg-slate-50 text-slate-500 font-bold rounded-xl border-slate-200 text-xs sm:text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Motivo de la Cita</label>
                    <Input
                      type="text"
                      required
                      placeholder="Ej. Revisión de notas y retroalimentación de Matemáticas"
                      value={appointmentSubject}
                      onChange={(e) => setAppointmentSubject(e.target.value)}
                      className="rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Fecha Sugerida</label>
                      <Input
                        type="date"
                        required
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Hora Sugerida</label>
                      <Input
                        type="time"
                        required
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 h-auto rounded-xl shadow-xs transition duration-200 mt-2 flex items-center justify-center gap-1.5 cursor-pointer border-none outline-none">
                    Confirmar Envío <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}

// Icono personalizado de WhatsApp
function MessageCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.657-3.693c1.589.943 3.197 1.442 4.887 1.443 5.485 0 9.942-4.436 9.945-9.899.001-2.646-1.026-5.133-2.89-7.002C16.79 3.018 14.312 1.99 11.67 1.99c-5.489 0-9.947 4.437-9.95 9.9-.001 2.015.528 3.988 1.534 5.733l-.167.278L2.096 21.05l3.228-.846.29.172.001.002z" />
    </svg>
  );
}
