export type TeacherStatus = 'Activo' | 'En clase' | 'Reunión' | 'Disponible' | 'Licencia' | 'Sobrecarga académica';
export type AcademicLevel = 'Preescolar' | 'Primaria' | 'Bachillerato' | 'Media Técnica' | 'Coordinación Académica' | 'Administrativos Docentes';

export interface TeacherAlert {
  id: string;
  type: 'sobrecarga' | 'cruce' | 'malla_pendiente' | 'planeacion_atrasada' | 'notas' | 'observador';
  message: string;
}

export interface TeacherMockData {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  specialty: string;
  area: string;
  level: AcademicLevel;
  campus: string;
  assignedCourses: string[];
  weeklyHours: number;
  status: TeacherStatus;
  avatarUrl?: string;
  alerts: TeacherAlert[];
}

export const MOCK_TEACHERS: TeacherMockData[] = [
  // PRIMARIA
  {
    id: 't-101',
    name: 'Ana María Betancur',
    document: '10203040',
    email: 'abetancur@aulacore.edu.co',
    phone: '+57 301 234 5678',
    specialty: 'Matemáticas Básicas',
    area: 'Matemáticas',
    level: 'Primaria',
    campus: 'Sede Principal',
    assignedCourses: ['1-A', '1-B', '2-A', '2-B'],
    weeklyHours: 24,
    status: 'Activo',
    avatarUrl: 'https://i.pravatar.cc/150?u=101',
    alerts: []
  },
  {
    id: 't-102',
    name: 'Carlos Rueda',
    document: '20304050',
    email: 'crueda@aulacore.edu.co',
    phone: '+57 302 345 6789',
    specialty: 'Lengua Castellana',
    area: 'Lengua Castellana',
    level: 'Primaria',
    campus: 'Sede Principal',
    assignedCourses: ['3-A', '3-B', '4-A'],
    weeklyHours: 28,
    status: 'En clase',
    avatarUrl: 'https://i.pravatar.cc/150?u=102',
    alerts: [
      { id: 'a1', type: 'planeacion_atrasada', message: 'Planeación de Lengua Castellana 3-B retrasada' }
    ]
  },
  {
    id: 't-103',
    name: 'Lucía Fernández',
    document: '99001122',
    email: 'lfernandez@aulacore.edu.co',
    phone: '+57 314 555 4433',
    specialty: 'Ciencias Naturales',
    area: 'Ciencias Naturales y Educación Ambiental',
    level: 'Primaria',
    campus: 'Sede Norte',
    assignedCourses: ['5-A', '5-B'],
    weeklyHours: 12,
    status: 'Licencia',
    avatarUrl: 'https://i.pravatar.cc/150?u=103',
    alerts: []
  },

  // BACHILLERATO
  {
    id: 't-201',
    name: 'Roberto Valdés Ramírez',
    document: '50607080',
    email: 'rvaldes@aulacore.edu.co',
    phone: '+57 301 999 8888',
    specialty: 'Ciencias Naturales',
    area: 'Ciencias Naturales y Educación Ambiental',
    level: 'Bachillerato',
    campus: 'Sede Principal',
    assignedCourses: ['8-A', '8-B', '9-A', '9-B'],
    weeklyHours: 32,
    status: 'Sobrecarga académica',
    avatarUrl: 'https://i.pravatar.cc/150?u=201',
    alerts: [
      { id: 'a2', type: 'sobrecarga', message: 'Supera el límite de 30h semanales' }
    ]
  },
  {
    id: 't-202',
    name: 'Marta Cecilia López',
    document: '40506070',
    email: 'mlopez@aulacore.edu.co',
    phone: '+57 315 987 6543',
    specialty: 'Inglés',
    area: 'Inglés',
    level: 'Bachillerato',
    campus: 'Sede Principal',
    assignedCourses: ['8-A', '8-B', '9-A', '9-C'],
    weeklyHours: 24,
    status: 'En clase',
    avatarUrl: 'https://i.pravatar.cc/150?u=202',
    alerts: []
  },
  {
    id: 't-203',
    name: 'Javier Domínguez',
    document: '80901020',
    email: 'jdominguez@aulacore.edu.co',
    phone: '+57 312 456 7890',
    specialty: 'Matemáticas',
    area: 'Matemáticas',
    level: 'Bachillerato',
    campus: 'Sede Principal',
    assignedCourses: ['10-A', '10-B', '11-A', '11-B'],
    weeklyHours: 16,
    status: 'Disponible',
    avatarUrl: 'https://i.pravatar.cc/150?u=203',
    alerts: [
      { id: 'a3', type: 'notas', message: 'Falta subir notas P2 de 11-A' },
      { id: 'a4', type: 'observador', message: 'Firma pendiente en observador de 10-A' }
    ]
  },
  {
    id: 't-204',
    name: 'Carlos Andrés Mejía',
    document: '55667788',
    email: 'cmejia@aulacore.edu.co',
    phone: '+57 300 999 8877',
    specialty: 'Educación Física',
    area: 'Educación Física, Recreación y Deportes',
    level: 'Bachillerato',
    campus: 'Sede Norte',
    assignedCourses: ['6-A', '6-B', '7-A', '8-A', '9-A'],
    weeklyHours: 28,
    status: 'Reunión',
    avatarUrl: 'https://i.pravatar.cc/150?u=204',
    alerts: [
      { id: 'a5', type: 'cruce', message: 'Cruce detectado los Lunes a las 10:00' }
    ]
  },
  
  // PREESCOLAR
  {
    id: 't-301',
    name: 'Juliana Restrepo',
    document: '77889900',
    email: 'jrestrepo@aulacore.edu.co',
    phone: '+57 310 111 2233',
    specialty: 'Educación Artística',
    area: 'Educación Artística y Cultural',
    level: 'Preescolar',
    campus: 'Sede Infantil',
    assignedCourses: ['Pre-Jardín', 'Jardín'],
    weeklyHours: 20,
    status: 'Activo',
    avatarUrl: 'https://i.pravatar.cc/150?u=301',
    alerts: []
  },
  {
    id: 't-302',
    name: 'Diana Patricia Silva',
    document: '66778899',
    email: 'dsilva@aulacore.edu.co',
    phone: '+57 311 222 3344',
    specialty: 'Educación Religiosa',
    area: 'Educación Religiosa',
    level: 'Preescolar',
    campus: 'Sede Infantil',
    assignedCourses: ['Transición A', 'Transición B'],
    weeklyHours: 15,
    status: 'Disponible',
    avatarUrl: 'https://i.pravatar.cc/150?u=302',
    alerts: []
  },

  // MEDIA TÉCNICA
  {
    id: 't-401',
    name: 'Santiago Arango',
    document: '11223344',
    email: 'sarango@aulacore.edu.co',
    phone: '+57 315 555 6677',
    specialty: 'Tecnología e Informática',
    area: 'Tecnología e Informática',
    level: 'Media Técnica',
    campus: 'Sede Principal',
    assignedCourses: ['10-Tec', '11-Tec'],
    weeklyHours: 20,
    status: 'Activo',
    avatarUrl: 'https://i.pravatar.cc/150?u=401',
    alerts: []
  }
];
