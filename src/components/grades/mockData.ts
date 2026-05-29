export type GradeActivity = {
  id: string;
  name: string;
  percentage: number;
  grade: number;
  date: string;
  feedback?: string;
};

export type SubjectPerformance = {
  id: string;
  name: string;
  teacher: string;
  currentGrade: number;
  previousGrade: number;
  attendanceScore: number;
  status: 'excellent' | 'good' | 'warning' | 'danger';
  colorClass: string;
  bgClass: string;
  activities: GradeActivity[];
};

export const MOCK_SUBJECTS: SubjectPerformance[] = [
  {
    id: 'mat',
    name: 'Matemáticas',
    teacher: 'Carlos Ruiz',
    currentGrade: 4.8,
    previousGrade: 4.5,
    attendanceScore: 100,
    status: 'excellent',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-500',
    activities: [
      { id: 'a1', name: 'Taller Funciones', percentage: 20, grade: 5.0, date: '12 May', feedback: 'Excelente dominio del tema.' },
      { id: 'a2', name: 'Quiz Derivadas', percentage: 20, grade: 4.5, date: '18 May' },
      { id: 'a3', name: 'Parcial Corte 1', percentage: 60, grade: 4.8, date: '25 May', feedback: 'Muy buen razonamiento lógico.' },
    ]
  },
  {
    id: 'leng',
    name: 'Lenguaje',
    teacher: 'Ana Sofía Pérez',
    currentGrade: 4.2,
    previousGrade: 4.3,
    attendanceScore: 95,
    status: 'good',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-500',
    activities: [
      { id: 'l1', name: 'Ensayo Literario', percentage: 30, grade: 4.0, date: '10 May', feedback: 'Buena redacción, faltan fuentes.' },
      { id: 'l2', name: 'Exposición Oral', percentage: 30, grade: 4.5, date: '15 May' },
      { id: 'l3', name: 'Examen de Comprensión', percentage: 40, grade: 4.1, date: '22 May' },
    ]
  },
  {
    id: 'fis',
    name: 'Física',
    teacher: 'Roberto Díaz',
    currentGrade: 2.8,
    previousGrade: 3.5,
    attendanceScore: 80,
    status: 'danger',
    colorClass: 'text-rose-600',
    bgClass: 'bg-rose-500',
    activities: [
      { id: 'f1', name: 'Laboratorio Cinemática', percentage: 30, grade: 3.0, date: '08 May', feedback: 'Entregado tarde, cálculos erróneos.' },
      { id: 'f2', name: 'Quiz Fuerzas', percentage: 20, grade: 2.0, date: '14 May' },
      { id: 'f3', name: 'Parcial Corte 1', percentage: 50, grade: 3.0, date: '24 May', feedback: 'Requiere tutoría urgente.' },
    ]
  },
  {
    id: 'ing',
    name: 'Inglés',
    teacher: 'Mary Smith',
    currentGrade: 4.5,
    previousGrade: 4.0,
    attendanceScore: 100,
    status: 'excellent',
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-500',
    activities: [
      { id: 'i1', name: 'Speaking Test', percentage: 40, grade: 4.8, date: '11 May', feedback: 'Great pronunciation.' },
      { id: 'i2', name: 'Grammar Quiz', percentage: 30, grade: 4.0, date: '19 May' },
      { id: 'i3', name: 'Listening Exam', percentage: 30, grade: 4.6, date: '26 May' },
    ]
  },
  {
    id: 'soc',
    name: 'Ciencias Sociales',
    teacher: 'Luis Torres',
    currentGrade: 3.8,
    previousGrade: 3.9,
    attendanceScore: 90,
    status: 'warning',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-500',
    activities: [
      { id: 's1', name: 'Mapa Conceptual', percentage: 30, grade: 4.0, date: '05 May' },
      { id: 's2', name: 'Debate', percentage: 30, grade: 3.5, date: '16 May', feedback: 'Poca participación.' },
      { id: 's3', name: 'Prueba Escrita', percentage: 40, grade: 3.9, date: '23 May' },
    ]
  }
];

export const MOCK_TREND_DATA = [
  { period: 'P1', average: 3.8 },
  { period: 'P2', average: 4.0 },
  { period: 'P3', average: 4.2 },
  { period: 'P4 (Actual)', average: 4.1 },
];
