export type AcademicRiskLevel = 'Alto' | 'Medio' | 'Bajo';
export type BehaviorRiskLevel = 'Alto' | 'Medio' | 'Bajo';
export type TrafficLight = '🟢 Excelente' | '🟡 Seguimiento' | '🔴 Riesgo';

export interface CourseDirector {
  id: string;
  name: string;
  avatarUrl?: string;
  email: string;
  phone: string;
}

export interface StudentInCourse {
  id: string;
  name: string;
  avatarUrl?: string;
  status: 'Activo' | 'Retirado' | 'Suspendido';
  gpa: number;
  attendanceRate: number;
  academicRisk: AcademicRiskLevel;
  behaviorRisk: BehaviorRiskLevel;
  alertsCount: number;
}

export interface CourseMockData {
  id: string;
  name: string; // e.g. "10-A"
  level: 'Preescolar' | 'Primaria' | 'Bachillerato' | 'Media Técnica';
  shift: 'Mañana' | 'Tarde' | 'Única';
  campus: string;
  
  director: CourseDirector;
  
  metrics: {
    totalStudents: number;
    boys: number;
    girls: number;
    diverse: number;
    averageGpa: number;
    averageAttendance: number;
    activeAlerts: number;
    studentsAtRisk: number;
  };

  academicRisk: AcademicRiskLevel;
  behaviorRisk: BehaviorRiskLevel;
  
  students: StudentInCourse[]; // Sample list
}

// Helpers for mock generation
const generateMockStudents = (count: number): StudentInCourse[] => {
  return Array.from({ length: count }).map((_, i) => {
    const isAtRisk = Math.random() > 0.85;
    return {
      id: `stu-${Math.random().toString(36).substr(2, 9)}`,
      name: `Estudiante ${i + 1}`,
      avatarUrl: `https://i.pravatar.cc/150?u=student${i}`,
      status: Math.random() > 0.95 ? 'Retirado' : 'Activo',
      gpa: isAtRisk ? (Math.random() * 1.5 + 2.0) : (Math.random() * 1.5 + 3.5),
      attendanceRate: isAtRisk ? Math.floor(Math.random() * 20 + 70) : Math.floor(Math.random() * 10 + 90),
      academicRisk: isAtRisk ? 'Alto' : 'Bajo',
      behaviorRisk: Math.random() > 0.9 ? 'Alto' : 'Bajo',
      alertsCount: isAtRisk ? Math.floor(Math.random() * 3 + 1) : 0
    };
  });
};

export const MOCK_COURSES: CourseMockData[] = [
  {
    id: 'c-10-A',
    name: '10-A',
    level: 'Bachillerato',
    shift: 'Mañana',
    campus: 'Sede Principal',
    director: {
      id: 'd-1',
      name: 'Carlos Martínez',
      avatarUrl: 'https://i.pravatar.cc/150?u=cm',
      email: 'c.martinez@aulacore.edu',
      phone: '+573001234567'
    },
    metrics: {
      totalStudents: 38,
      boys: 18,
      girls: 20,
      diverse: 0,
      averageGpa: 3.9,
      averageAttendance: 95,
      activeAlerts: 2,
      studentsAtRisk: 3
    },
    academicRisk: 'Bajo',
    behaviorRisk: 'Bajo',
    students: generateMockStudents(38)
  },
  {
    id: 'c-10-B',
    name: '10-B',
    level: 'Bachillerato',
    shift: 'Mañana',
    campus: 'Sede Principal',
    director: {
      id: 'd-2',
      name: 'Lucía Gómez',
      avatarUrl: 'https://i.pravatar.cc/150?u=lg',
      email: 'l.gomez@aulacore.edu',
      phone: '+573001234568'
    },
    metrics: {
      totalStudents: 40,
      boys: 22,
      girls: 17,
      diverse: 1,
      averageGpa: 3.2,
      averageAttendance: 88,
      activeAlerts: 8,
      studentsAtRisk: 12
    },
    academicRisk: 'Alto',
    behaviorRisk: 'Medio',
    students: generateMockStudents(40)
  },
  {
    id: 'c-5-A',
    name: '5-A',
    level: 'Primaria',
    shift: 'Tarde',
    campus: 'Sede Norte',
    director: {
      id: 'd-3',
      name: 'Marta Pérez',
      avatarUrl: 'https://i.pravatar.cc/150?u=mp',
      email: 'm.perez@aulacore.edu',
      phone: '+573001234569'
    },
    metrics: {
      totalStudents: 32,
      boys: 15,
      girls: 17,
      diverse: 0,
      averageGpa: 4.3,
      averageAttendance: 98,
      activeAlerts: 0,
      studentsAtRisk: 1
    },
    academicRisk: 'Bajo',
    behaviorRisk: 'Bajo',
    students: generateMockStudents(32)
  },
  {
    id: 'c-11-TEC',
    name: '11-TEC',
    level: 'Media Técnica',
    shift: 'Única',
    campus: 'Sede Principal',
    director: {
      id: 'd-4',
      name: 'Jorge Ruiz',
      avatarUrl: 'https://i.pravatar.cc/150?u=jr',
      email: 'j.ruiz@aulacore.edu',
      phone: '+573001234570'
    },
    metrics: {
      totalStudents: 25,
      boys: 15,
      girls: 8,
      diverse: 2,
      averageGpa: 4.1,
      averageAttendance: 92,
      activeAlerts: 3,
      studentsAtRisk: 2
    },
    academicRisk: 'Medio',
    behaviorRisk: 'Bajo',
    students: generateMockStudents(25)
  },
  {
    id: 'c-TRANS-A',
    name: 'Trans-A',
    level: 'Preescolar',
    shift: 'Mañana',
    campus: 'Sede Norte',
    director: {
      id: 'd-5',
      name: 'Elena Díaz',
      avatarUrl: 'https://i.pravatar.cc/150?u=ed',
      email: 'e.diaz@aulacore.edu',
      phone: '+573001234571'
    },
    metrics: {
      totalStudents: 20,
      boys: 10,
      girls: 10,
      diverse: 0,
      averageGpa: 0, // Not graded like high school
      averageAttendance: 85,
      activeAlerts: 1,
      studentsAtRisk: 0
    },
    academicRisk: 'Bajo',
    behaviorRisk: 'Medio',
    students: generateMockStudents(20)
  }
];

export const getCourseTrafficLight = (course: CourseMockData): { color: string, label: string } => {
  if (course.academicRisk === 'Alto' || course.behaviorRisk === 'Alto') {
    return { color: 'bg-rose-500', label: 'Riesgo Crítico' };
  } else if (course.academicRisk === 'Medio' || course.behaviorRisk === 'Medio') {
    return { color: 'bg-amber-500', label: 'Seguimiento' };
  }
  return { color: 'bg-emerald-500', label: 'Excelente' };
};
