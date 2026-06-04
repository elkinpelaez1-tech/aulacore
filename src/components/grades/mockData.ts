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
    currentGrade: 4.5,
    previousGrade: 4.3,
    attendanceScore: 100,
    status: 'excellent',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-500',
    activities: [
      { id: 'a1', name: 'Taller Funciones', percentage: 20, grade: 5.0, date: '12 May', feedback: 'Excelente dominio del tema.' },
      { id: 'a2', name: 'Quiz Derivadas', percentage: 20, grade: 4.5, date: '18 May' },
      { id: 'a3', name: 'Parcial Corte 1', percentage: 60, grade: 4.3, date: '25 May' },
    ]
  },
  {
    id: 'leng',
    name: 'Lengua Castellana',
    teacher: 'Ana Sofía Pérez',
    currentGrade: 4.2,
    previousGrade: 4.0,
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
    id: 'ing',
    name: 'Inglés',
    teacher: 'Mary Smith',
    currentGrade: 4.7,
    previousGrade: 4.5,
    attendanceScore: 100,
    status: 'excellent',
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-500',
    activities: [
      { id: 'i1', name: 'Speaking Test', percentage: 40, grade: 4.8, date: '11 May', feedback: 'Great pronunciation.' },
      { id: 'i2', name: 'Grammar Quiz', percentage: 30, grade: 4.2, date: '19 May' },
      { id: 'i3', name: 'Listening Exam', percentage: 30, grade: 5.0, date: '26 May' },
    ]
  },
  {
    id: 'cnat',
    name: 'Ciencias Naturales y Educación Ambiental',
    teacher: 'Lucía Fernández',
    currentGrade: 4.1,
    previousGrade: 4.0,
    attendanceScore: 92,
    status: 'good',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-500',
    activities: [
      { id: 'c1', name: 'Proyecto de Ecosistemas', percentage: 40, grade: 4.3, date: '05 May' },
      { id: 'c2', name: 'Prueba de Biología', percentage: 30, grade: 3.8, date: '12 May' },
      { id: 'c3', name: 'Informe Ambiental', percentage: 30, grade: 4.2, date: '19 May' },
    ]
  },
  {
    id: 'csoc',
    name: 'Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia',
    teacher: 'Luis Torres',
    currentGrade: 3.8,
    previousGrade: 3.9,
    attendanceScore: 90,
    status: 'warning',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-500',
    activities: [
      { id: 's1', name: 'Mapa Conceptual', percentage: 30, grade: 4.0, date: '05 May' },
      { id: 's2', name: 'Debate Democracia', percentage: 30, grade: 3.5, date: '16 May', feedback: 'Poca participación.' },
      { id: 's3', name: 'Prueba Escrita', percentage: 40, grade: 3.9, date: '23 May' },
    ]
  },
  {
    id: 'art',
    name: 'Educación Artística y Cultural',
    teacher: 'Diana Patricia Silva',
    currentGrade: 4.4,
    previousGrade: 4.2,
    attendanceScore: 98,
    status: 'good',
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-500',
    activities: [
      { id: 'ar1', name: 'Taller de Pintura', percentage: 50, grade: 4.5, date: '07 May' },
      { id: 'ar2', name: 'Composición Musical', percentage: 50, grade: 4.3, date: '21 May' },
    ]
  },
  {
    id: 'etic',
    name: 'Educación Ética y en Valores Humanos',
    teacher: 'Lic. Martha Restrepo',
    currentGrade: 4.6,
    previousGrade: 4.5,
    attendanceScore: 100,
    status: 'excellent',
    colorClass: 'text-teal-600',
    bgClass: 'bg-teal-500',
    activities: [
      { id: 'et1', name: 'Ensayo Dilema Moral', percentage: 50, grade: 4.8, date: '14 May' },
      { id: 'et2', name: 'Taller de Convivencia', percentage: 50, grade: 4.4, date: '22 May' },
    ]
  },
  {
    id: 'efis',
    name: 'Educación Física, Recreación y Deportes',
    teacher: 'Carlos Andrés Mejía',
    currentGrade: 4.3,
    previousGrade: 4.1,
    attendanceScore: 96,
    status: 'good',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-500',
    activities: [
      { id: 'ef1', name: 'Prueba Atletismo', percentage: 50, grade: 4.5, date: '10 May' },
      { id: 'ef2', name: 'Esquema de Gimnasia', percentage: 50, grade: 4.1, date: '24 May' },
    ]
  },
  {
    id: 'rel',
    name: 'Educación Religiosa',
    teacher: 'Diana Patricia Silva',
    currentGrade: 4.0,
    previousGrade: 4.0,
    attendanceScore: 90,
    status: 'good',
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-500',
    activities: [
      { id: 're1', name: 'Historia de Religiones', percentage: 50, grade: 4.2, date: '11 May' },
      { id: 're2', name: 'Proyecto Respeto de Culto', percentage: 50, grade: 3.8, date: '25 May' },
    ]
  },
  {
    id: 'tec',
    name: 'Tecnología e Informática',
    teacher: 'Santiago Arango',
    currentGrade: 4.8,
    previousGrade: 4.6,
    attendanceScore: 100,
    status: 'excellent',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-500',
    activities: [
      { id: 't1', name: 'Proyecto Programación', percentage: 40, grade: 5.0, date: '09 May', feedback: 'Lógica excepcional.' },
      { id: 't2', name: 'Quiz Algoritmos', percentage: 20, grade: 4.5, date: '16 May' },
      { id: 't3', name: 'Taller de Ofimática', percentage: 40, grade: 4.8, date: '23 May' },
    ]
  }
];

export const MOCK_TREND_DATA = [
  { period: 'P1', average: 3.8 },
  { period: 'P2', average: 4.0 },
  { period: 'P3', average: 4.2 },
  { period: 'P4 (Actual)', average: 4.1 },
];
