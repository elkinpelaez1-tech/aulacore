export type StudentStatus = 'Activo' | 'Retirado' | 'Egresado' | 'Suspendido' | 'Inactivo';

export interface StudentMockData {
  id: string;
  name: string;
  document?: string;
  gender?: string;
  grade?: string;
  group?: string;
  campus?: string;
  shift?: string;
  level?: string;
  status?: StudentStatus;
  academicRisk?: string;
  behaviorRisk?: string;
  attendanceRate?: number;
  averageGpa?: number;
  gpa?: number;
  alerts?: any[];
  avatarUrl?: string;
  guardianName?: string;
  guardianPhone?: string;
}
