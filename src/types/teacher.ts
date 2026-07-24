export type TeacherStatus = 'Activo' | 'En clase' | 'Reunión' | 'Disponible' | 'Licencia' | 'Inactivo' | 'Sobrecarga académica';
export type AcademicLevel = 'Preescolar' | 'Primaria' | 'Bachillerato' | 'Media' | 'Media Técnica' | 'Coordinación Académica' | 'Administrativos Docentes';

export interface TeacherMockData {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  avatar?: string;
  avatarUrl?: string;
  document?: string;
  campus?: string;
  assignedCoursesCount?: number;
  status: TeacherStatus;
  workloadHours?: number;
  weeklyHours?: number;
  academicLevel?: AcademicLevel;
  level?: string | AcademicLevel;
  evaluationScore?: number;
  tags?: string[];
  specialty?: string;
  assignedCourses?: string[];
  alerts?: any[];
}
