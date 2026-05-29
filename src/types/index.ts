import { UserRole } from '@/lib/navigation';

export interface Student {
  id: string;
  name: string;
  grade: string;
  email: string;
  status: 'Activo' | 'Retirado' | 'En Observación';
  avatar?: string;
  attendanceRate: number; // Porcentaje, ej: 94.2
  gpa: number; // Promedio de 1.0 a 10.0, ej: 8.6
  behaviorScore: number; // Escala de 1 a 10 de comportamiento, ej: 9.0
  academicRisk: 'Bajo' | 'Medio' | 'Alto'; // IA predictiva
  dropoutRisk: 'Bajo' | 'Medio' | 'Alto'; // IA predictiva early warning
  warningReason?: string; // Causa del riesgo
  parentsName: string;
  parentsPhone: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  assignedGroup?: string; // Ej: 10-A si es Director de Grupo
  status: 'Activo' | 'Inactivo';
}

export interface Course {
  id: string;
  name: string; // Ej: Décimo A
  code: string; // Ej: 10-A
  directorId: string; // ID del Lic. Martínez, etc.
  directorName: string;
  studentCount: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'Asiste' | 'Falta' | 'Tarde' | 'Justificado';
  registeredBy: string; // Quien lo registró
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  period: string; // Ej: 2026-I
  notes: {
    exams: number[]; // notas de exámenes (30%)
    homeworks: number[]; // tareas (40%)
    participation: number[]; // participación (30%)
  };
  finalGrade: number;
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  type: 'Positiva' | 'Leve' | 'Grave' | 'Gravísima';
  description: string;
  observerName: string; // Quien lo reportó (Docente o Rector)
  status: 'Registrado' | 'En Proceso' | 'Resuelto';
}

export interface Alert {
  id: string;
  type: 'academic' | 'attendance' | 'behavioral' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  targetRole: UserRole[]; // Quién debe ver la alerta
  date: string;
  resolved: boolean;
}
