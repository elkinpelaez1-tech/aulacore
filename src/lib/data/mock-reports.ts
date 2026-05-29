export interface TrendDataPoint {
  name: string; // e.g., 'Sem 1', 'Per 1'
  gpa: number;
  asistencia: number;
  convivencia?: number;
}

export interface DistributionDataPoint {
  name: string; // e.g., 'Preescolar', 'Primaria', 'Bachillerato'
  value: number;
  fill?: string;
}

export const ACADEMIC_TRENDS: TrendDataPoint[] = [
  { name: 'P1', gpa: 3.6, asistencia: 92, convivencia: 85 },
  { name: 'P2', gpa: 3.8, asistencia: 94, convivencia: 88 },
  { name: 'P3', gpa: 3.7, asistencia: 91, convivencia: 84 },
  { name: 'P4 (Actual)', gpa: 3.9, asistencia: 95, convivencia: 90 },
];

export const ATTENDANCE_WEEKLY_TRENDS: TrendDataPoint[] = [
  { name: 'Lun', gpa: 0, asistencia: 98 },
  { name: 'Mar', gpa: 0, asistencia: 96 },
  { name: 'Mié', gpa: 0, asistencia: 95 },
  { name: 'Jue', gpa: 0, asistencia: 92 },
  { name: 'Vie', gpa: 0, asistencia: 89 },
];

export const LEVEL_DISTRIBUTION: DistributionDataPoint[] = [
  { name: 'Preescolar', value: 240, fill: '#818cf8' }, // indigo-400
  { name: 'Primaria', value: 580, fill: '#6366f1' },   // indigo-500
  { name: 'Bachillerato', value: 420, fill: '#4f46e5' }, // indigo-600
  { name: 'Media Técnica', value: 160, fill: '#4338ca' }, // indigo-700
];

export const ALERT_DISTRIBUTION: DistributionDataPoint[] = [
  { name: 'Académicas', value: 45, fill: '#fbbf24' }, // amber-400
  { name: 'Convivencia', value: 30, fill: '#f43f5e' }, // rose-500
  { name: 'Asistencia', value: 25, fill: '#0ea5e9' }, // sky-500
];

export const TOP_COURSES = [
  { id: '1', name: '11-A', gpa: 4.5, level: 'Bachillerato', director: 'Ana Silva' },
  { id: '2', name: '5-B', gpa: 4.4, level: 'Primaria', director: 'Carlos Ruíz' },
  { id: '3', name: '10-C', gpa: 4.2, level: 'Bachillerato', director: 'Diana Paz' },
];

export const CRITICAL_COURSES = [
  { id: '4', name: '9-B', gpa: 2.8, level: 'Bachillerato', alerts: 12, risk: 'Alto' },
  { id: '5', name: '7-A', gpa: 3.1, level: 'Bachillerato', alerts: 8, risk: 'Medio' },
];

export const GLOBAL_KPI_MOCKS = {
  totalStudents: 1400,
  institutionalGpa: 3.8,
  institutionalAttendance: 93,
  criticalCoursesCount: 2,
  teachersWithAlerts: 4,
  rfidAbsencesToday: 42,
  dropoutRiskStudents: 15
};
