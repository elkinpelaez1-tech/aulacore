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
    avatarUrl: 'https://i.pravatar.cc/150?u=s101',
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
    avatarUrl: 'https://i.pravatar.cc/150?u=s102',
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
    avatarUrl: 'https://i.pravatar.cc/150?u=s103',
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
    avatarUrl: 'https://i.pravatar.cc/150?u=s104',
    guardianName: 'Marta Gómez',
    alerts: [
      { id: 'a3', type: 'asistencia', message: 'Inasistencia consecutiva > 5 días' }
    ]
  },
  {
    id: 's-105',
    name: 'Alex Marín',
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
    avatarUrl: 'https://i.pravatar.cc/150?u=s105',
    guardianName: 'Paola Marín',
    alerts: []
  },
  {
    id: 's-106',
    name: 'Isabella Gómez',
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
    avatarUrl: 'https://i.pravatar.cc/150?u=s106',
    guardianName: 'Claudia Pérez',
    alerts: [
      { id: 'a4', type: 'academico', message: 'PIAR en seguimiento' }
    ]
  },
  {
    id: 's-107',
    name: 'Sofía Ramírez',
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
    avatarUrl: 'https://i.pravatar.cc/150?u=sofia_ramirez',
    guardianName: 'Patricia Ramírez',
    alerts: [
      { id: 'a5', type: 'asistencia', message: 'Ausentismo recurrente (>20%)' },
      { id: 'a6', type: 'academico', message: '3 materias perdidas en Periodo 4' }
    ]
  },
  {
    id: 's-108',
    name: 'Mateo López',
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
    avatarUrl: 'https://i.pravatar.cc/150?u=mateo_lopez',
    guardianName: 'Felipe López',
    alerts: [
      { id: 'a7', type: 'academico', message: 'Caída de GPA del 25% en las últimas 4 semanas' }
    ]
  },
  {
    id: 's-109',
    name: 'Laura Cortés',
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
    avatarUrl: 'https://i.pravatar.cc/150?u=laura_cortes',
    guardianName: 'Martha Cortés',
    alerts: [
      { id: 'a8', type: 'convivencia', message: 'Patrón escalado de observaciones disciplinarias' }
    ]
  },
  {
    id: 's-110',
    name: 'Andrés Gómez',
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
    avatarUrl: 'https://i.pravatar.cc/150?u=andres_gomez',
    guardianName: 'Pedro Gómez',
    alerts: [
      { id: 'a9', type: 'convivencia', message: 'Reincidencia convivencial: Acumula su tercera alerta grave del mes.' },
      { id: 'a10', type: 'convivencia', message: 'Reporte tipo II pendiente de citación con acudiente.' }
    ]
  }
];
