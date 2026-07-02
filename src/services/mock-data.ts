import { Student, Teacher, Course, AttendanceRecord, BehaviorRecord, Alert, GradeRecord } from '@/types';

// 1. Base de Estudiantes Premium (Foco en 10-A dirigido por Lic. Martínez)
export const MOCK_STUDENTS: Student[] = [
  {
    id: 'est-01',
    name: 'Sofía Ortiz',
    grade: '10-A',
    email: 'sofia.ortiz@aulacore.edu.co',
    status: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    attendanceRate: 98.4,
    gpa: 4.6,
    behaviorScore: 9.8,
    academicRisk: 'Bajo',
    dropoutRisk: 'Bajo',
    parentsName: 'Carlos Ortiz',
    parentsPhone: '+57 301 555 1234',
  },
  {
    id: 'est-02',
    name: 'Juan García',
    grade: '10-A',
    email: 'juan.garcia@aulacore.edu.co',
    status: 'En Observación',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    attendanceRate: 88.2,
    gpa: 3.1,
    behaviorScore: 7.2,
    academicRisk: 'Alto',
    dropoutRisk: 'Medio',
    warningReason: 'Rendimiento deficiente en Matemáticas y Tecnología e Informática; inasistencias injustificadas',
    parentsName: 'Mateo García',
    parentsPhone: '+57 312 444 5678',
  },
  {
    id: 'est-03',
    name: 'María López',
    grade: '10-A',
    email: 'maria.lopez@aulacore.edu.co',
    status: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    attendanceRate: 94.6,
    gpa: 4.2,
    behaviorScore: 9.0,
    academicRisk: 'Bajo',
    dropoutRisk: 'Bajo',
    parentsName: 'Lucía López',
    parentsPhone: '+57 320 333 9999',
  },
  {
    id: 'est-04',
    name: 'Carlos Pérez',
    grade: '10-A',
    email: 'carlos.perez@aulacore.edu.co',
    status: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    attendanceRate: 92.1,
    gpa: 3.9,
    behaviorScore: 8.5,
    academicRisk: 'Bajo',
    dropoutRisk: 'Bajo',
    parentsName: 'Andrés Pérez',
    parentsPhone: '+57 315 222 8888',
  },
  {
    id: 'est-05',
    name: 'Ana Torres',
    grade: '10-A',
    email: 'ana.torres@aulacore.edu.co',
    status: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    attendanceRate: 97.0,
    gpa: 4.5,
    behaviorScore: 9.5,
    academicRisk: 'Bajo',
    dropoutRisk: 'Bajo',
    parentsName: 'Sara Torres',
    parentsPhone: '+57 310 999 1111',
  },
  {
    id: 'est-06',
    name: 'Mateo Díaz',
    grade: '11-B',
    email: 'mateo.diaz@aulacore.edu.co',
    status: 'Retirado',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    attendanceRate: 45.0,
    gpa: 2.1,
    behaviorScore: 6.0,
    academicRisk: 'Alto',
    dropoutRisk: 'Alto',
    warningReason: 'Deserción por traslado familiar fuera del municipio',
    parentsName: 'Jorge Díaz',
    parentsPhone: '+57 300 777 4444',
  },
  {
    id: 'est-07',
    name: 'Valentina Restrepo',
    grade: '11-B',
    email: 'valentina.restrepo@aulacore.edu.co',
    status: 'Activo',
    attendanceRate: 95.8,
    gpa: 4.7,
    behaviorScore: 10.0,
    academicRisk: 'Bajo',
    dropoutRisk: 'Bajo',
    parentsName: 'Marta Restrepo',
    parentsPhone: '+57 304 888 2222',
  }
];

// 2. Base de Docentes
export const MOCK_TEACHERS: Teacher[] = [
  {
    id: 'prof-01',
    name: 'Lic. Martínez',
    email: 'martinez@aulacore.edu.co',
    subjects: ['Lengua Castellana'],
    assignedGroup: '10-A',
    status: 'Activo',
  },
  {
    id: 'prof-02',
    name: 'Prof. Gómez',
    email: 'gomez@aulacore.edu.co',
    subjects: ['Matemáticas', 'Ciencias Naturales y Educación Ambiental'],
    status: 'Activo',
  },
  {
    id: 'prof-03',
    name: 'Dra. Diana Reyes',
    email: 'reyes@aulacore.edu.co',
    subjects: ['Ciencias Naturales y Educación Ambiental'],
    status: 'Activo',
  },
  {
    id: 'prof-04',
    name: 'Ing. Carlos León',
    email: 'leon@aulacore.edu.co',
    subjects: ['Tecnología e Informática'],
    assignedGroup: '11-B',
    status: 'Activo',
  }
];

// 3. Cursos
export const MOCK_COURSES: Course[] = [
  { id: 'cur-01', name: 'Décimo A', code: '10-A', directorId: 'prof-01', directorName: 'Lic. Martínez', studentCount: 32 },
  { id: 'cur-02', name: 'Undécimo B', code: '11-B', directorId: 'prof-04', directorName: 'Ing. Carlos León', studentCount: 28 },
  { id: 'cur-03', name: 'Noveno C', code: '9-C', directorId: 'prof-03', directorName: 'Dra. Diana Reyes', studentCount: 30 }
];

// 4. Registro de Asistencias (Últimos días para 10-A)
export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-01', studentId: 'est-01', studentName: 'Sofía Ortiz', date: '2026-05-23', status: 'Asiste', registeredBy: 'Lic. Martínez' },
  { id: 'att-02', studentId: 'est-02', studentName: 'Juan García', date: '2026-05-23', status: 'Tarde', registeredBy: 'Lic. Martínez' },
  { id: 'att-03', studentId: 'est-03', studentName: 'María López', date: '2026-05-23', status: 'Asiste', registeredBy: 'Lic. Martínez' },
  { id: 'att-04', studentId: 'est-04', studentName: 'Carlos Pérez', date: '2026-05-23', status: 'Falta', registeredBy: 'Lic. Martínez' },
  { id: 'att-05', studentId: 'est-05', studentName: 'Ana Torres', date: '2026-05-23', status: 'Asiste', registeredBy: 'Lic. Martínez' },
  // Día Anterior
  { id: 'att-06', studentId: 'est-01', studentName: 'Sofía Ortiz', date: '2026-05-22', status: 'Asiste', registeredBy: 'Lic. Martínez' },
  { id: 'att-07', studentId: 'est-02', studentName: 'Juan García', date: '2026-05-22', status: 'Falta', registeredBy: 'Lic. Martínez' },
  { id: 'att-08', studentId: 'est-03', studentName: 'María López', date: '2026-05-22', status: 'Asiste', registeredBy: 'Lic. Martínez' },
  { id: 'att-09', studentId: 'est-04', studentName: 'Carlos Pérez', date: '2026-05-22', status: 'Asiste', registeredBy: 'Lic. Martínez' },
  { id: 'att-10', studentId: 'est-05', studentName: 'Ana Torres', date: '2026-05-22', status: 'Asiste', registeredBy: 'Lic. Martínez' },
];

// 5. Historial de Convivencia y Observador Estudiantil
export const MOCK_BEHAVIOR: BehaviorRecord[] = [
  {
    id: 'beh-01',
    studentId: 'est-02',
    studentName: 'Juan García',
    date: '2026-05-18',
    type: 'Leve',
    description: 'Uso de teléfono móvil durante la explicación de Tecnología e Informática de manera reiterada.',
    observerName: 'Prof. Gómez',
    status: 'Resuelto',
  },
  {
    id: 'beh-02',
    studentId: 'est-02',
    studentName: 'Juan García',
    date: '2026-05-21',
    type: 'Grave',
    description: 'Inasistencia sin justificar a evaluación acumulativa y vocabulario no apropiado al ser requerido.',
    observerName: 'Lic. Martínez',
    status: 'En Proceso',
  },
  {
    id: 'beh-03',
    studentId: 'est-01',
    studentName: 'Sofía Ortiz',
    date: '2026-05-15',
    type: 'Positiva',
    description: 'Lideró y organizó el foro institucional de debate sobre ciencia y tecnología escolar.',
    observerName: 'Dr. Ramírez',
    status: 'Registrado',
  }
];

// 6. Planilla de Notas de Evaluaciones (Ciencias Naturales y Matemáticas por Prof. Gómez)
export const MOCK_GRADES: GradeRecord[] = [
  {
    id: 'grd-01',
    studentId: 'est-01',
    studentName: 'Sofía Ortiz',
    subject: 'Matemáticas',
    period: '2026-I',
    notes: { exams: [9.5, 9.0], homeworks: [10.0, 9.8], participation: [9.5] },
    finalGrade: 9.6,
  },
  {
    id: 'grd-02',
    studentId: 'est-02',
    studentName: 'Juan García',
    subject: 'Matemáticas',
    period: '2026-I',
    notes: { exams: [4.0, 5.2], homeworks: [6.0, 5.0], participation: [6.5] },
    finalGrade: 5.3,
  },
  {
    id: 'grd-03',
    studentId: 'est-03',
    studentName: 'María López',
    subject: 'Matemáticas',
    period: '2026-I',
    notes: { exams: [8.0, 8.5], homeworks: [9.0, 8.0], participation: [8.5] },
    finalGrade: 8.3,
  },
  {
    id: 'grd-04',
    studentId: 'est-01',
    studentName: 'Sofía Ortiz',
    subject: 'Ciencias Naturales y Educación Ambiental',
    period: '2026-I',
    notes: { exams: [9.0, 9.2], homeworks: [9.5, 9.5], participation: [10.0] },
    finalGrade: 9.3,
  },
  {
    id: 'grd-05',
    studentId: 'est-02',
    studentName: 'Juan García',
    subject: 'Ciencias Naturales y Educación Ambiental',
    period: '2026-I',
    notes: { exams: [5.0, 4.5], homeworks: [6.0, 5.5], participation: [5.0] },
    finalGrade: 5.2,
  }
];

// 7. Alertas Tempranas del Sistema e IA Predictiva
export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alrt-01',
    type: 'academic',
    severity: 'critical',
    title: 'Riesgo Académico: Juan García',
    message: 'IA Predictiva AulaCore estima un 85% de probabilidad de reprobar Matemáticas debido a notas bajas y ausencias.',
    targetRole: ['rector', 'director_grupo', 'docente'],
    date: '2026-05-22',
    resolved: false,
  },
  {
    id: 'alrt-02',
    type: 'attendance',
    severity: 'warning',
    title: 'Alerta de Inasistencia: Carlos Pérez',
    message: 'Registró falta el día de hoy sin justificación. Notificación enviada al acudiente.',
    targetRole: ['rector', 'director_grupo'],
    date: '2026-05-23',
    resolved: false,
  },
  {
    id: 'alrt-03',
    type: 'behavioral',
    severity: 'info',
    title: 'Observación Positiva Registrada',
    message: 'Se ha registrado una felicitación en el observador a Sofía Ortiz por iniciativa comunitaria.',
    targetRole: ['rector', 'director_grupo', 'padre_familia'],
    date: '2026-05-15',
    resolved: true,
  },
  {
    id: 'alrt-04',
    type: 'system',
    severity: 'info',
    title: 'Cierre de Periodo Académico',
    message: 'Faltan 7 días para el cierre del Período 2026-I. Recuerde sincronizar planillas.',
    targetRole: ['rector', 'docente', 'secretaria'],
    date: '2026-05-23',
    resolved: false,
  }
];
