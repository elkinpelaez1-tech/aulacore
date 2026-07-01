export type StudentStatus = 'Activo' | 'Retirado' | 'Egresado' | 'Suspendido';
export type StudentEnrollmentType = 'Nuevo' | 'Continuidad' | 'Repitente';
export type Gender = 'Niño' | 'Niña' | 'Diverso';
export type AcademicRisk = 'Alto' | 'Medio' | 'Bajo';
export type BehaviorRisk = 'Alto' | 'Medio' | 'Bajo';
export type Shift = 'Mañana' | 'Tarde' | 'Única';

export interface StudentAlert {
  id: string;
  type: 'academico' | 'convivencia' | 'asistencia' | 'cartera';
  message: string;
}

export interface StudentMockData {
  id: string;
  name: string;
  document: string;
  gender: Gender;
  campus: string;
  level: string;
  grade: string;
  group: string;
  shift: Shift;
  status: StudentStatus;
  enrollmentType: StudentEnrollmentType;
  academicRisk: AcademicRisk;
  behaviorRisk: BehaviorRisk;
  gpa: number; // General Point Average
  attendanceRate: number;
  avatarUrl?: string;
  guardianName: string;
  alerts: StudentAlert[];
}

export const MOCK_STUDENTS: StudentMockData[] = [
  {
    id: 's-101',
    name: 'Mateo González Rojas',
    document: '1098765432',
    gender: 'Niño',
    campus: 'Sede Principal',
    level: 'Bachillerato',
    grade: '9',
    group: '9-A',
    shift: 'Mañana',
    status: 'Activo',
    enrollmentType: 'Continuidad',
    academicRisk: 'Bajo',
    behaviorRisk: 'Bajo',
    gpa: 4.5,
    attendanceRate: 98,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
    guardianName: 'Carlos González',
    alerts: []
  },
  {
    id: 's-102',
    name: 'Valentina Silva Martínez',
    document: '1098765433',
    gender: 'Niña',
    campus: 'Sede Principal',
    level: 'Bachillerato',
    grade: '9',
    group: '9-A',
    shift: 'Mañana',
    status: 'Activo',
    enrollmentType: 'Repitente',
    academicRisk: 'Alto',
    behaviorRisk: 'Medio',
    gpa: 2.8,
    attendanceRate: 85,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    guardianName: 'Sandra Martínez',
    alerts: [
      { id: 'a1', type: 'academico', message: 'Riesgo de pérdida en Matemáticas y Tecnología e Informática' }
    ]
  },
  {
    id: 's-103',
    name: 'Samuel Duque Pérez',
    document: '1098765434',
    gender: 'Niño',
    campus: 'Sede Principal',
    level: 'Primaria',
    grade: '5',
    group: '5-B',
    shift: 'Tarde',
    status: 'Activo',
    enrollmentType: 'Nuevo',
    academicRisk: 'Medio',
    behaviorRisk: 'Alto',
    gpa: 3.5,
    attendanceRate: 90,
    avatarUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=120',
    guardianName: 'Luis Duque',
    alerts: [
      { id: 'a2', type: 'convivencia', message: 'Reporte tipo II pendiente de firma' }
    ]
  },
  {
    id: 's-104',
    name: 'Laura Restrepo Gómez',
    document: '1098765435',
    gender: 'Niña',
    campus: 'Sede Norte',
    level: 'Preescolar',
    grade: 'Transición',
    group: 'Trans-A',
    shift: 'Mañana',
    status: 'Retirado',
    enrollmentType: 'Nuevo',
    academicRisk: 'Bajo',
    behaviorRisk: 'Bajo',
    gpa: 0,
    attendanceRate: 40,
    avatarUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=120',
    guardianName: 'Marta Gómez',
    alerts: [
      { id: 'a3', type: 'asistencia', message: 'Inasistencia consecutiva > 5 días' }
    ]
  },
  {
    id: 's-105',
    name: 'Alex Marín Restrepo',
    document: '1098765436',
    gender: 'Diverso',
    campus: 'Sede Principal',
    level: 'Media Técnica',
    grade: '11',
    group: '11-Tec',
    shift: 'Única',
    status: 'Activo',
    enrollmentType: 'Continuidad',
    academicRisk: 'Bajo',
    behaviorRisk: 'Bajo',
    gpa: 4.8,
    attendanceRate: 100,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    guardianName: 'Paola Restrepo',
    alerts: []
  },
  {
    id: 's-106',
    name: 'Isabella Gómez Calle',
    document: '1098765437',
    gender: 'Niña',
    campus: 'Sede Norte',
    level: 'Primaria',
    grade: '3',
    group: '3-A',
    shift: 'Tarde',
    status: 'Activo',
    enrollmentType: 'Repitente',
    academicRisk: 'Alto',
    behaviorRisk: 'Bajo',
    gpa: 3.0,
    attendanceRate: 95,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    guardianName: 'Claudia Calle',
    alerts: [
      { id: 'a4', type: 'academico', message: 'PIAR en seguimiento por TDAH' }
    ]
  },
  {
    id: 's-107',
    name: 'Sofía Ramírez Castaño',
    document: '1098765438',
    gender: 'Niña',
    campus: 'Sede Principal',
    level: 'Bachillerato',
    grade: '9',
    group: '9-B',
    shift: 'Mañana',
    status: 'Activo',
    enrollmentType: 'Continuidad',
    academicRisk: 'Alto',
    behaviorRisk: 'Medio',
    gpa: 2.8,
    attendanceRate: 75,
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=120',
    guardianName: 'Patricia Castaño',
    alerts: [
      { id: 'a5', type: 'asistencia', message: 'Ausentismo recurrente (>20%)' },
      { id: 'a6', type: 'academico', message: '3 materias perdidas en Periodo actual' }
    ]
  },
  {
    id: 's-108',
    name: 'Mateo López Vahos',
    document: '1098765439',
    gender: 'Niño',
    campus: 'Sede Principal',
    level: 'Bachillerato',
    grade: '10',
    group: '10-A',
    shift: 'Mañana',
    status: 'Activo',
    enrollmentType: 'Continuidad',
    academicRisk: 'Alto',
    behaviorRisk: 'Bajo',
    gpa: 3.4,
    attendanceRate: 82,
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
    guardianName: 'Felipe López',
    alerts: [
      { id: 'a7', type: 'academico', message: 'Caída de rendimiento del 25% en las últimas semanas' }
    ]
  },
  {
    id: 's-109',
    name: 'Laura Cortés Osorio',
    document: '1098765440',
    gender: 'Niña',
    campus: 'Sede Norte',
    level: 'Primaria',
    grade: '4',
    group: '4-B',
    shift: 'Tarde',
    status: 'Activo',
    enrollmentType: 'Nuevo',
    academicRisk: 'Medio',
    behaviorRisk: 'Alto',
    gpa: 3.6,
    attendanceRate: 89,
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120',
    guardianName: 'Martha Osorio',
    alerts: [
      { id: 'a8', type: 'convivencia', message: 'Patrón de intimidación (Bullying) bajo análisis' }
    ]
  },
  {
    id: 's-110',
    name: 'Andrés Gómez Correa',
    document: '1098765441',
    gender: 'Niño',
    campus: 'Sede Principal',
    level: 'Bachillerato',
    grade: '8',
    group: '8-A',
    shift: 'Mañana',
    status: 'Activo',
    enrollmentType: 'Continuidad',
    academicRisk: 'Medio',
    behaviorRisk: 'Alto',
    gpa: 3.2,
    attendanceRate: 88,
    avatarUrl: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=120',
    guardianName: 'Pedro Correa',
    alerts: [
      { id: 'a9', type: 'convivencia', message: 'Faltas reiteradas en comedor escolar (Reporte del PAE)' }
    ]
  }
];
