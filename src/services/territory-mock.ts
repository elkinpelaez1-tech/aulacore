'use client';

// =================================================================
// 🏛️ SERVICIO CENTRAL DE SIMULACIÓN Y MOCK DATA (PORTAL TERRITORIAL)
// =================================================================

// Interruptor global del Modo Demo
export function isModoDemoActive(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('aulacore_modo_demo_comercial') === 'active';
}

export function setModoDemoActive(active: boolean) {
  if (typeof window === 'undefined') return;
  if (active) {
    sessionStorage.setItem('aulacore_modo_demo_comercial', 'active');
  } else {
    sessionStorage.removeItem('aulacore_modo_demo_comercial');
  }
  // Notificar al sistema
  window.dispatchEvent(new Event('modo-demo-changed'));
  window.dispatchEvent(new Event('territory-alerts-updated'));
}

// --- 1. DASHBOARD PRINCIPAL ---
export interface MockNovedad {
  id: number;
  title: string;
  desc: string;
  type: 'alert' | 'info' | 'success';
}

export const MOCK_NOVEDADES: MockNovedad[] = [
  { id: 1, title: 'Alerta de Infraestructura', desc: 'Sede Principal de I.E. Rural El Hatillo reporta caída del servidor local AulaCore.', type: 'alert' },
  { id: 2, title: 'Bajo Rendimiento Matemáticas', desc: 'Promedio general del grado 11 en I.E. Marco Fidel Suárez descendió por debajo de 3.5.', type: 'info' },
];

export const MOCK_COMUNAS = ['Medellín Centro', 'Barbosa rural', 'Copacabana veredas', 'Girardota cabecera'];
export const MOCK_TYPES = ['Oficial Urbano', 'Oficial Rural', 'Privado', 'Cobertura contratada'];
export const MOCK_JORNADAS = ['Mañana', 'Tarde', 'Única', 'Completa'];

export const COBERTURA_HISTORICA = [
  { name: '2021', matricula: 28400, cupos: 32000 },
  { name: '2022', matricula: 29900, cupos: 33000 },
  { name: '2023', matricula: 31200, cupos: 34500 },
  { name: '2024', matricula: 32500, cupos: 35000 },
  { name: '2025', matricula: 33800, cupos: 36000 },
  { name: '2026', matricula: 34250, cupos: 36500 },
];

// --- 2. TALENTO HUMANO ---
export interface MockTeacher {
  id: string;
  name: string;
  specialty: string;
  school: string;
  statute: 'Decreto 2277' | 'Decreto 1278';
  degree: 'Normalista' | 'Tecnólogo' | 'Profesional' | 'Especialista' | 'Magíster' | 'Doctor';
  experienceYears: number;
  status: 'Activo' | 'Licencia';
}

export const MOCK_TEACHERS: MockTeacher[] = [
  { id: '1', name: 'Prof. Andrés Alzate', specialty: 'Matemáticas', school: 'I.E. Marco Fidel Suárez', statute: 'Decreto 1278', degree: 'Magíster', experienceYears: 12, status: 'Activo' },
  { id: '2', name: 'Prof. Claudia Patricia Restrepo', specialty: 'Lengua Castellana', school: 'I.E. Rural El Hatillo', statute: 'Decreto 2277', degree: 'Especialista', experienceYears: 15, status: 'Activo' },
  { id: '3', name: 'Prof. Juan Fernando Quintero', specialty: 'Ciencias Naturales', school: 'I.E. Presbítero Antonio José Bernal', statute: 'Decreto 1278', degree: 'Profesional', experienceYears: 6, status: 'Activo' },
  { id: '4', name: 'Prof. Sandra Milena Muñoz', specialty: 'Inglés', school: 'I.E. José Antonio Galán', statute: 'Decreto 1278', degree: 'Magíster', experienceYears: 9, status: 'Activo' },
  { id: '5', name: 'Prof. Ricardo Antonio Vélez', specialty: 'Tecnología', school: 'I.E. Técnico Industrial Pascual Bravo', statute: 'Decreto 2277', degree: 'Doctor', experienceYears: 20, status: 'Activo' },
];

export const MOCK_VACANCIES = [
  { id: 'v1', subject: 'Física / Ciencias', school: 'I.E. Rural El Hatillo', priority: 'Alta', posted: 'Hace 3 días' },
  { id: 'v2', subject: 'Inglés Técnico', school: 'I.E. Técnico Industrial Pascual Bravo', priority: 'Media', posted: 'Hace 5 días' },
];

export const FORMACION_DOCENTE = [
  { name: 'Normalistas', docentes: 120 },
  { name: 'Tecnólogos', docentes: 85 },
  { name: 'Profesionales', docentes: 410 },
  { name: 'Especialistas', docentes: 220 },
  { name: 'Magísteres', docentes: 145 },
  { name: 'Doctores', docentes: 28 },
];

// --- 3. INFRAESTRUCTURA ---
export interface MockSchoolInfra {
  id: string;
  name: string;
  municipality: string;
  status: 'excelente' | 'bueno' | 'regular' | 'critico';
  classroomsCount: number;
  hasInternet: boolean;
  serverOfflineStatus: 'online' | 'offline';
  paeStatus: 'correcto' | 'novedad';
}

export const MOCK_INFRA: MockSchoolInfra[] = [
  { id: 'inst-1', name: 'I.E. Rural El Hatillo', municipality: 'Barbosa', status: 'critico', classroomsCount: 14, hasInternet: false, serverOfflineStatus: 'offline', paeStatus: 'novedad' },
  { id: 'inst-2', name: 'I.E. Marco Fidel Suárez', municipality: 'Copacabana', status: 'bueno', classroomsCount: 22, hasInternet: true, serverOfflineStatus: 'online', paeStatus: 'correcto' },
  { id: 'inst-3', name: 'I.E. Presbítero Antonio José Bernal', municipality: 'Barbosa', status: 'regular', classroomsCount: 18, hasInternet: false, serverOfflineStatus: 'offline', paeStatus: 'correcto' },
  { id: 'inst-4', name: 'I.E. José Antonio Galán', municipality: 'Girardota', status: 'bueno', classroomsCount: 15, hasInternet: true, serverOfflineStatus: 'online', paeStatus: 'correcto' },
  { id: 'inst-5', name: 'I.E. Técnico Industrial Pascual Bravo', municipality: 'Medellín', status: 'excelente', classroomsCount: 45, hasInternet: true, serverOfflineStatus: 'online', paeStatus: 'correcto' },
];

// --- 4. CALIDAD EDUCATIVA ---
export const MOCK_PRUEBAS_SABER = [
  { name: 'Barbosa', lectura: 64, matematicas: 58, ingles: 52 },
  { name: 'Copacabana', lectura: 68, matematicas: 61, ingles: 57 },
  { name: 'Girardota', lectura: 66, matematicas: 60, ingles: 55 },
  { name: 'Medellín', lectura: 72, matematicas: 67, ingles: 64 },
];

export const MOCK_PLANES_MEJORAMIENTO = [
  { id: 'pm1', title: 'Plan de Lectura Crítica', school: 'I.E. Rural El Hatillo', progress: 42, status: 'En Ejecución' },
  { id: 'pm2', title: 'Refuerzo Álgebra 11°', school: 'I.E. Marco Fidel Suárez', progress: 90, status: 'Finalizado' },
  { id: 'pm3', title: 'Inglés Comunicativo 9°', school: 'I.E. José Antonio Galán', progress: 15, status: 'Planificado' },
];

// --- 5. COMUNICACIONES OFICIALES ---
export interface MockCircular {
  id: string;
  code?: string;
  title: string;
  body?: string;
  scope?: string;
  sender?: string;
  date: string;
  readsCount?: number;
  totalReceivers?: number;
  status: 'Publicado' | 'Borrador' | 'Certificado' | 'Pendiente' | 'Enviado';
  readRatio?: string;
  digitallySigned?: boolean;
  attachments: string[];
  scheduledFor?: string;
}

export const MOCK_CIRCULARES: MockCircular[] = [
  { id: 'c1', code: 'CIR-2026-001', title: 'Directiva de Acompañamiento del PAE Escolar', sender: 'Secretario de Educación', date: '2026-06-15', readsCount: 38, totalReceivers: 45, status: 'Certificado', attachments: [] },
  { id: 'c2', code: 'CIR-2026-002', title: 'Protocolo de Sincronización del RFID Escolar', sender: 'Director TIC Territorial', date: '2026-06-20', readsCount: 32, totalReceivers: 45, status: 'Publicado', attachments: [] },
];

// --- 6. AGENDA Y ACTUACIONES (VISITAS DE CAMPO) ---
export interface MockVisita {
  id: string;
  institution: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  inspector: string;
  priority: 'Alta' | 'Media' | 'Baja';
  status: 'Finalizada' | 'En ejecución' | 'Confirmada' | 'Programada' | 'Cancelada' | 'Reprogramada';
}

export const MOCK_VISITAS: MockVisita[] = [
  { id: 'v1', institution: 'I.E. Rural El Hatillo', type: 'Auditoría PAE', date: '2026-06-30', time: '08:00', duration: '2 horas', inspector: 'Dra. Claudia Restrepo', priority: 'Alta', status: 'En ejecución' },
  { id: 'v2', institution: 'I.E. Marco Fidel Suárez', type: 'Inspección Conectividad', date: '2026-07-02', time: '10:00', duration: '3 horas', inspector: 'Dr. Alejandro Gómez', priority: 'Media', status: 'Programada' },
  { id: 'v3', institution: 'I.E. Presbítero Antonio José Bernal', type: 'Capacitación AulaCore', date: '2026-06-28', time: '14:00', duration: '4 horas', inspector: 'Ing. Ricardo Vélez', priority: 'Baja', status: 'Finalizada' },
];

export type Circular = MockCircular;
export const INITIAL_CIRCULARES: Circular[] = MOCK_CIRCULARES;
export const INITIAL_BORRADORES: Circular[] = [];
export const INITIAL_PROGRAMADOS: Circular[] = [];

export type MockVisit = MockVisita;
export const INITIAL_VISITS: MockVisit[] = MOCK_VISITAS;

// --- 7. CENTRO DE ALERTAS TEMPRANAS (CAT) ---
export interface TerritorialAlertLog {
  id: string;
  alert_id: string;
  action_taken: string;
  comment: string;
  resolution_time_seconds: number;
  outcome: 'exitoso' | 'ineficaz' | 'en_progreso' | 'neutral';
  signed_by: string;
  signature_hash: string;
  created_at: string;
  evidence_url?: string;
}

export interface TerritorialAlert {
  id: string;
  alert_code: string;
  scope: 'territorial' | 'escolar';
  severity: 'critico' | 'alto' | 'medio' | 'bajo' | 'info';
  priority: 'urgente' | 'alta' | 'media' | 'baja';
  institution_id: string;
  institution_name: string;
  municipality: string;
  target_id: string;
  target_name: string;
  impact_estimate: number;
  description: string;
  assigned_to?: string;
  status: 'detectada' | 'validada' | 'asignada' | 'intervencion' | 'seguimiento' | 'resuelta' | 'cerrada';
  ai_suggestions: {
    option_a: string;
    option_b: string;
    option_c: string;
  };
  metadata: {
    causes: string[];
    kpis: Record<string, string | number>;
  };
  created_at: string;
  logs: TerritorialAlertLog[];
}

// 🏛️ BASE DE DATOS DE ALERTAS DE DEMOSTRACIÓN (11 CASOS ASOCIADOS A LOS 11 ESCENARIOS EN ANTIOQUIA)
export const DEMO_ALERTAS_COMERCIALES: TerritorialAlert[] = [
  {
    id: 'ALT-2026-001',
    alert_code: 'PAE-001',
    scope: 'territorial',
    severity: 'critico',
    priority: 'urgente',
    institution_id: 'inst-1',
    institution_name: 'I.E. Rural El Hatillo',
    municipality: 'Barbosa',
    target_id: 'pae-restaurante-hatillo',
    target_name: 'Restaurante Escolar Sede Central',
    impact_estimate: 240,
    description: 'El proveedor del PAE no entregó las minutas calientes de raciones alimentarias de la jornada mañana por problemas logísticos en Barbosa.',
    assigned_to: 'Dr. Alejandro Gómez',
    status: 'intervencion',
    ai_suggestions: {
      option_a: 'Activar el plan de raciones industrializadas de contingencia mediante el operador regional.',
      option_b: 'Emitir amonestación oficial al contratista del PAE requiriendo descargos en menos de 24 horas.',
      option_c: 'Despachar inspección técnica inmediata de la interventoría de Cobertura para firmar acta de incumplimiento.'
    },
    metadata: {
      causes: ['Fallo en cadena de frío de carnes', 'Cierre de vía Barbosa-Hatillo por deslizamiento'],
      kpis: { 'Raciones Faltantes': 240, 'Alumnos en Comedor': 234, 'Reincidencia del Operador': '3 veces en el mes' }
    },
    created_at: '2026-06-30T07:15:00Z',
    logs: [
      {
        id: 'log-101',
        alert_id: 'ALT-2026-001',
        action_taken: 'Reporte del Rector en el Portal',
        comment: 'Rector reporta desabastecimiento de insumos cárnicos al iniciar jornada de comedor.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'Rector Claudia Restrepo',
        signature_hash: 'hash-859261a8f9c001',
        created_at: '2026-06-30T07:20:00Z'
      },
      {
        id: 'log-102',
        alert_id: 'ALT-2026-001',
        action_taken: 'Activación de Protocolo de Emergencia Cobertura',
        comment: 'El Secretario de Educación autorizó la entrega de 240 raciones frías de contingencia.',
        resolution_time_seconds: 1800,
        outcome: 'en_progreso',
        signed_by: 'Dr. Alejandro Gómez',
        signature_hash: 'hash-bc902fa8120e001',
        created_at: '2026-06-30T07:50:00Z'
      }
    ]
  },
  {
    id: 'ALT-2026-002',
    alert_code: 'AUS-002',
    scope: 'territorial',
    severity: 'alto',
    priority: 'alta',
    institution_id: 'inst-2',
    institution_name: 'I.E. Marco Fidel Suárez',
    municipality: 'Copacabana',
    target_id: 'group-9a',
    target_name: 'Grado 9-A (Matutino)',
    impact_estimate: 12,
    description: 'El sensor RFID de control de asistencia reporta que 12 alumnos de grado 9-A han superado el 15.5% de inasistencias acumuladas sin justificar.',
    assigned_to: 'Dra. Claudia Restrepo',
    status: 'seguimiento',
    ai_suggestions: {
      option_a: 'Enviar citación oficial automatizada por SMS/WhatsApp a los acudientes.',
      option_b: 'Agendar visita psicopedagógica domiciliaria al hogar de los 3 estudiantes más comprometidos.',
      option_c: 'Generar reporte de ausentismo cruzado con el PAE para verificar si coincide con fallas de alimentación.'
    },
    metadata: {
      causes: ['Ausencia de transporte veredal por lluvias', 'Riesgo de deserción por acompañamiento en trabajo agrícola'],
      kpis: { 'Ausentismo Promedio': '19.2%', 'Estudiantes Alertados': 12, 'Reincidencia Escolar': 'Alta' }
    },
    created_at: '2026-06-29T08:00:00Z',
    logs: [
      {
        id: 'log-103',
        alert_id: 'ALT-2026-002',
        action_taken: 'Alerta RFID Automatizada',
        comment: 'El sistema AulaCore RFID detectó la anomalía de ausencias reiteradas.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'AulaCore RFID Sync',
        signature_hash: 'hash-abc825b741002',
        created_at: '2026-06-29T08:00:00Z'
      }
    ]
  },
  {
    id: 'ALT-2026-003',
    alert_code: 'DES-003',
    scope: 'territorial',
    severity: 'critico',
    priority: 'urgente',
    institution_id: 'inst-4',
    institution_name: 'I.E. José Antonio Galán',
    municipality: 'Girardota',
    target_id: 'student-3849',
    target_name: 'Mateo Osorio (Grado 10-B)',
    impact_estimate: 1,
    description: 'Riesgo crítico e inminente de deserción escolar del estudiante Mateo Osorio, detectado por la IA al no registrar ingresos ni notas en 3 semanas.',
    assigned_to: 'Dra. Claudia Restrepo',
    status: 'intervencion',
    ai_suggestions: {
      option_a: 'Disparar citación inmediata de la Inspección de Calidad al núcleo familiar.',
      option_b: 'Coordinar con la Secretaría de Salud un acompañamiento psicosocial preventivo.',
      option_c: 'Revisar la ficha del estudiante en el programa de transporte escolar veredal.'
    },
    metadata: {
      causes: ['Cambio de residencia a zona veredal lejana', 'Desmotivación académica y reprobación acumulada'],
      kpis: { 'Inasistencia Semanal': '100%', 'Promedio': 1.8, 'Soporte PIAR': 'No tiene' }
    },
    created_at: '2026-06-28T09:30:00Z',
    logs: [
      {
        id: 'log-104',
        alert_id: 'ALT-2026-003',
        action_taken: 'Escalamiento de la IA de AulaCore',
        comment: 'Cruce del ausentismo prolongado y libro de calificaciones vacío.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'Motor Priorización IA',
        signature_hash: 'hash-859a12c8591003',
        created_at: '2026-06-28T09:30:00Z'
      }
    ]
  },
  {
    id: 'ALT-2026-004',
    alert_code: 'REND-004',
    scope: 'territorial',
    severity: 'medio',
    priority: 'media',
    institution_id: 'inst-5',
    institution_name: 'I.E. Técnico Industrial Pascual Bravo',
    municipality: 'Medellín',
    target_id: 'grade-11-industrial',
    target_name: 'Grado 11 - Especialidad Mecánica',
    impact_estimate: 45,
    description: 'Promedio general del área de Diseño Técnico descendió a 3.0. Se detectó falta de alineación pedagógica en las mallas de grado 11.',
    assigned_to: 'Prof. Andrés Alzate',
    status: 'seguimiento',
    ai_suggestions: {
      option_a: 'Asignar un plan de capacitación curricular de AulaCore al docente responsable.',
      option_b: 'Sugerir talleres interactivos obligatorios en la plataforma para nivelación del grado.',
      option_c: 'Programar una visita de calidad pedagógica en la Agenda Territorial.'
    },
    metadata: {
      causes: ['Falta de software de diseño cad en computadoras', 'Cambio docente de la especialidad'],
      kpis: { 'Promedio del Grupo': 3.0, 'Estudiantes Reprobando': 18, 'Reincidencia': 'Ninguna' }
    },
    created_at: '2026-06-27T14:00:00Z',
    logs: [
      {
        id: 'log-105',
        alert_id: 'ALT-2026-004',
        action_taken: 'Análisis Académico',
        comment: 'Calificaciones mensuales por debajo del estándar del PEI.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'Coordinador Pascual Bravo',
        signature_hash: 'hash-fc2019ab3b1004',
        created_at: '2026-06-27T14:05:00Z'
      }
    ]
  },
  {
    id: 'ALT-2026-005',
    alert_code: 'INF-005',
    scope: 'territorial',
    severity: 'critico',
    priority: 'alta',
    institution_id: 'inst-3',
    institution_name: 'I.E. Presbítero Antonio José Bernal',
    municipality: 'Barbosa',
    target_id: 'classroom-preescolar',
    target_name: 'Aulas de Preescolar Bloque A',
    impact_estimate: 60,
    description: 'Filtraciones severas de techos por lluvias ponen en riesgo la seguridad física de 60 niños de preescolar en Barbosa.',
    assigned_to: 'Ing. Ricardo Vélez',
    status: 'intervencion',
    ai_suggestions: {
      option_a: 'Reasignar las clases de preescolar a la biblioteca del Bloque B de forma temporal.',
      option_b: 'Declarar estado de emergencia locativa y contratar reparación de cubiertas por urgencia manifiesta.',
      option_c: 'Despachar ingenieros de la Secretaría de Educación para emitir dictamen de habitabilidad.'
    },
    metadata: {
      causes: ['Falta de mantenimiento de canaletas de lluvia', 'Tejas de asbesto deterioradas'],
      kpis: { 'Aulas Afectadas': 2, 'Niños Reubicados': 60, 'Presupuesto Estimado': '15,000,000 COP' }
    },
    created_at: '2026-06-29T10:30:00Z',
    logs: [
      {
        id: 'log-106',
        alert_id: 'ALT-2026-005',
        action_taken: 'Inspección de Infraestructura',
        comment: 'Rector reporta humedad en muros y goteos sobre pupitres escolares.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'Inspector Ricardo Vélez',
        signature_hash: 'hash-859a12c8591005',
        created_at: '2026-06-29T11:00:00Z'
      }
    ]
  },
  {
    id: 'ALT-2026-006',
    alert_code: 'CONV-006',
    scope: 'territorial',
    severity: 'alto',
    priority: 'alta',
    institution_id: 'inst-5',
    institution_name: 'I.E. Técnico Industrial Pascual Bravo',
    municipality: 'Medellín',
    target_id: 'group-8c',
    target_name: 'Grado 8-C',
    impact_estimate: 22,
    description: 'El Observador Digital detectó un patrón de bullying y agresiones físicas reiteradas de 3 estudiantes contra alumnos del grado 8-C.',
    assigned_to: 'Dr. Alejandro Gómez',
    status: 'intervencion',
    ai_suggestions: {
      option_a: 'Convocar de forma inmediata al Comité Escolar de Convivencia (Ruta de Atención Integral).',
      option_b: 'Agendar un taller grupal presencial sobre ciberacoso y sana convivencia a cargo de Bienestar.',
      option_c: 'Suspender preventivamente de forma presencial a los implicados asignándoles talleres offline.'
    },
    metadata: {
      causes: ['Uso inadecuado de redes sociales', 'Falta de protocolos de mediación escolar'],
      kpis: { 'Incidentes Reportados': 4, 'Alumnos Citados': 3, 'Acompañamiento Psicosocial': 'Sí' }
    },
    created_at: '2026-06-28T08:00:00Z',
    logs: [
      {
        id: 'log-107',
        alert_id: 'ALT-2026-006',
        action_taken: 'Alerta del Comité Escolar',
        comment: 'Se registran los incidentes físicos en el Observador de AulaCore.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'Coordinador Juan Quintero',
        signature_hash: 'hash-859a12c8591006',
        created_at: '2026-06-28T09:00:00Z'
      }
    ]
  },
  {
    id: 'ALT-2026-007',
    alert_code: 'SM-007',
    scope: 'territorial',
    severity: 'alto',
    priority: 'alta',
    institution_id: 'inst-1',
    institution_name: 'I.E. Rural El Hatillo',
    municipality: 'Barbosa',
    target_id: 'student-7492',
    target_name: 'Gabriela Restrepo (Grado 11-A)',
    impact_estimate: 1,
    description: 'Docente reporta indicios críticos de ansiedad severa, autolesión y aislamiento escolar en el Observador Digital de Gabriela Restrepo.',
    assigned_to: 'Dra. Claudia Restrepo',
    status: 'seguimiento',
    ai_suggestions: {
      option_a: 'Activar de inmediato el protocolo de emergencia de salud mental departamental.',
      option_b: 'Citar con carácter urgente a los padres para autorizar remisión a EPS.',
      option_c: 'Asignar tutoría pedagógica especial a distancia para no presionar su retorno inmediato.'
    },
    metadata: {
      causes: ['Crisis emocional familiar severa', 'Presión por pruebas de estado saber 11'],
      kpis: { 'Aislamiento Registrado': '15 días', 'Nivel de Riesgo': 'Severo', 'Derivado a Orientador': 'Sí' }
    },
    created_at: '2026-06-29T13:00:00Z',
    logs: [
      {
        id: 'log-108',
        alert_id: 'ALT-2026-007',
        action_taken: 'Remisión a Orientadora',
        comment: 'Se abre ficha confidencial de acompañamiento psicosocial.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'Orientador Sandra Muñoz',
        signature_hash: 'hash-859a12c8591007',
        created_at: '2026-06-29T14:30:00Z'
      }
    ]
  },
  {
    id: 'ALT-2026-008',
    alert_code: 'TRANS-008',
    scope: 'territorial',
    severity: 'medio',
    priority: 'media',
    institution_id: 'inst-2',
    institution_name: 'I.E. Marco Fidel Suárez',
    municipality: 'Copacabana',
    target_id: 'route-vereda-popal',
    target_name: 'Ruta Rural Vereda El Popal',
    impact_estimate: 35,
    description: 'Suspensión del servicio del bus de transporte escolar rural vereda El Popal debido a retrasos en los pagos del contratista de Copacabana.',
    assigned_to: 'Dr. Alejandro Gómez',
    status: 'intervencion',
    ai_suggestions: {
      option_a: 'Reunirse con el transportador para negociar prórroga del servicio de 15 días.',
      option_b: 'Habilitar microbuses auxiliares provisionales para el traslado veredal de los alumnos.',
      option_c: 'Justificar de oficio las inasistencias en el sistema RFID de los alumnos de El Popal.'
    },
    metadata: {
      causes: ['Retraso en desembolso presupuestal de la alcaldía', 'Falta de pólizas del bus al día'],
      kpis: { 'Alumnos Afectados': 35, 'Días de Suspensión': 2, 'Reincidencia': 'Ninguna' }
    },
    created_at: '2026-06-29T06:00:00Z',
    logs: [
      {
        id: 'log-109',
        alert_id: 'ALT-2026-008',
        action_taken: 'Reclamo Masivo de Acudientes',
        comment: '35 acudientes reportan que el bus veredal no recogió a los estudiantes.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'Coordinador Copacabana',
        signature_hash: 'hash-859a12c8591008',
        created_at: '2026-06-29T07:00:00Z'
      }
    ]
  },
  {
    id: 'ALT-2026-009',
    alert_code: 'CON-009',
    scope: 'territorial',
    severity: 'medio',
    priority: 'media',
    institution_id: 'inst-3',
    institution_name: 'I.E. Presbítero Antonio José Bernal',
    municipality: 'Barbosa',
    target_id: 'switch-bernal-01',
    target_name: 'Servidor Local y Red Principal',
    impact_estimate: 420,
    description: 'El servidor local offline de AulaCore reporta desconexión prolongada de internet por más de 48 horas en Barbosa.',
    assigned_to: 'Ing. Ricardo Vélez',
    status: 'resuelta',
    ai_suggestions: {
      option_a: 'Instruir al personal del colegio a operar bajo el protocolo offline de AulaCore.',
      option_b: 'Programar visita técnica de soporte de redes en la Agenda Territorial.',
      option_c: 'Solicitar reporte de cortes de fibra óptica al operador del departamento.'
    },
    metadata: {
      causes: ['Fallo eléctrico local en switch principal', 'Corte de tendido de fibra óptica aéreo'],
      kpis: { 'Estudiantes Afectados': 420, 'Horas Caídas': 52, 'Reincidencia': 'Media' }
    },
    created_at: '2026-06-28T10:00:00Z',
    logs: [
      {
        id: 'log-110',
        alert_id: 'ALT-2026-009',
        action_taken: 'Detección por Latidos (Heartbeats)',
        comment: 'Servidor desconectado. Último latido el 2026-06-28 10:00:00.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'AulaCore Heartbeat Engine',
        signature_hash: 'hash-ef826ba8901c009',
        created_at: '2026-06-28T10:00:00Z'
      },
      {
        id: 'log-111',
        alert_id: 'ALT-2026-009',
        action_taken: 'Inspección Física Finalizada',
        comment: 'El Ingeniero reconectó los terminales de fibra aérea. Red restablecida.',
        resolution_time_seconds: 86400,
        outcome: 'exitoso',
        signed_by: 'Ing. Ricardo Vélez',
        signature_hash: 'hash-fc2019ab3b1009',
        created_at: '2026-06-29T10:00:00Z'
      }
    ]
  },
  {
    id: 'ALT-2026-010',
    alert_code: 'PIAR-010',
    scope: 'territorial',
    severity: 'medio',
    priority: 'media',
    institution_id: 'inst-4',
    institution_name: 'I.E. José Antonio Galán',
    municipality: 'Girardota',
    target_id: 'piar-grade-6',
    target_name: 'Estudiantes del Plan Individual (PIAR)',
    impact_estimate: 8,
    description: 'La Secretaría de Educación detecta atraso en la carga y firmas de las mallas y actas de los Planes Individuales de Ajuste Razonable (PIAR) para 8 alumnos.',
    assigned_to: 'Prof. Sandra Milena Muñoz',
    status: 'seguimiento',
    ai_suggestions: {
      option_a: 'Cargar la plantilla oficial del PIAR del Ministerio de Educación en el sistema.',
      option_b: 'Agendar una sesión de capacitación virtual para los docentes del grado 6° sobre adaptaciones curriculares.',
      option_c: 'Solicitar al Rector de la institución un informe de tutorías de los 8 alumnos.'
    },
    metadata: {
      causes: ['Falta de personal de apoyo psicopedagógico especializado', 'Desconocimiento de los formatos oficiales'],
      kpis: { 'Alumnos Afectados': 8, 'PIAR Firmados': 0, 'Soporte Psicosocial': 'Sí' }
    },
    created_at: '2026-06-28T11:00:00Z',
    logs: [
      {
        id: 'log-112',
        alert_id: 'ALT-2026-010',
        action_taken: 'Control de Archivos del Portal',
        comment: 'Detección automática de campos PIAR vacíos al finalizar primer periodo.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'Inspector Calidad SED',
        signature_hash: 'hash-859a12c8591010',
        created_at: '2026-06-28T11:30:00Z'
      }
    ]
  },
  {
    id: 'ALT-2026-011',
    alert_code: 'RISK-011',
    scope: 'territorial',
    severity: 'critico',
    priority: 'urgente',
    institution_id: 'inst-5',
    institution_name: 'I.E. Técnico Industrial Pascual Bravo',
    municipality: 'Medellín',
    target_id: 'licensing-status',
    target_name: 'Habilitación de Licencias Industriales',
    impact_estimate: 410,
    description: 'Vencimiento inminente del seguro y habilitación de talleres de soldadura y mecánica pesada del colegio, afectando a 410 estudiantes técnicos.',
    assigned_to: 'Dr. Alejandro Gómez',
    status: 'intervencion',
    ai_suggestions: {
      option_a: 'Despachar fondos de contingencia para la renovación de pólizas de seguridad locativa.',
      option_b: 'Clausurar preventivamente los talleres redirigiendo las clases a simuladores de AulaCore.',
      option_c: 'Citar de urgencia al Consejo Directivo escolar para justificar descuidos administrativos.'
    },
    metadata: {
      causes: ['Omitir fechas límites de licencias en el cronograma directivo', 'Falta de interventor de seguridad en talleres'],
      kpis: { 'Estudiantes Afectados': 410, 'Talleres Afectados': 3, 'Seguros Vigentes': 'Vencidos' }
    },
    created_at: '2026-06-29T10:00:00Z',
    logs: [
      {
        id: 'log-113',
        alert_id: 'ALT-2026-011',
        action_taken: 'Alerta Administrativa SaaS',
        comment: 'Vencimiento de documentos contractuales obligatorios detectado en el portal.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'Super Admin AulaCore',
        signature_hash: 'hash-859a12c8591011',
        created_at: '2026-06-29T10:15:00Z'
      }
    ]
  }
];

// Alertas base reales (para cuando el modo demo está apagado)
export const REAL_ALERTAS_MOCK: TerritorialAlert[] = [
  {
    id: 'ALT-2026-001',
    alert_code: 'PAE-001',
    scope: 'territorial',
    severity: 'critico',
    priority: 'urgente',
    institution_id: 'inst-1',
    institution_name: 'I.E. Rural El Hatillo',
    municipality: 'Barbosa',
    target_id: 'pae-restaurante-hatillo',
    target_name: 'Restaurante Escolar Sede Central',
    impact_estimate: 240,
    description: 'El proveedor del PAE no entregó las minutas calientes de raciones alimentarias de la jornada mañana por problemas logísticos en Barbosa.',
    assigned_to: 'Dr. Alejandro Gómez',
    status: 'intervencion',
    ai_suggestions: {
      option_a: 'Activar el plan de raciones industrializadas de contingencia mediante el operador regional.',
      option_b: 'Emitir amonestación oficial al contratista del PAE requiriendo descargos en menos de 24 horas.',
      option_c: 'Despachar inspección técnica inmediata de la interventoría de Cobertura para firmar acta de incumplimiento.'
    },
    metadata: {
      causes: ['Fallo en cadena de frío de carnes', 'Cierre de vía Barbosa-Hatillo por deslizamiento'],
      kpis: { 'Raciones Faltantes': 240, 'Alumnos en Comedor': 234, 'Reincidencia del Operador': '3 veces en el mes' }
    },
    created_at: '2026-06-30T07:15:00Z',
    logs: [
      {
        id: 'log-101',
        alert_id: 'ALT-2026-001',
        action_taken: 'Reporte del Rector en el Portal',
        comment: 'Rector reporta desabastecimiento de insumos cárnicos al iniciar jornada de comedor.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'Rector Claudia Restrepo',
        signature_hash: 'hash-859261a8f9c001',
        created_at: '2026-06-30T07:20:00Z'
      }
    ]
  }
];

export function getAlertsMock(): TerritorialAlert[] {
  return isModoDemoActive() ? DEMO_ALERTAS_COMERCIALES : REAL_ALERTAS_MOCK;
}

export const EXPLAINERS: Record<string, { title: string; tooltip: string; definition: string; interpretation: string; calculation: string; importance: string; decisions: string; bestPractices: string; caseStudy: string; regulation?: string }> = {
  madurez: {
    title: 'Madurez Digital (Health Score)',
    tooltip: 'Porcentaje de adopción digital y latido de los servidores escolares.',
    definition: 'Nivel general de salud de infraestructura y software de los servidores escolares.',
    interpretation: 'Evalúa la continuidad operativa de los servidores offline instalados en las sedes.',
    calculation: 'Promedio de horas online reportadas por los servidores locales sobre el total de la jornada escolar.',
    importance: 'Permite asegurar que los colegios rurales puedan operar de forma Offline First sin perder datos.',
    decisions: 'Despachar soporte de conectividad o renovar el hardware local.',
    bestPractices: 'Mantener el servidor encendido durante toda la jornada escolar.',
    caseStudy: 'Barbosa resolvió cortes de datos reconectando switches veredales.'
  },
  conectividad: {
    title: 'Conectividad Sede Principal',
    tooltip: 'Porcentaje de ancho de banda y estabilidad de la red.',
    definition: 'Porcentaje de cobertura de banda ancha e internet dedicado en las instituciones.',
    interpretation: 'Porcentaje de ancho de banda contratado activo en las sedes principales.',
    calculation: 'Medición de velocidad local versus el mínimo contratado.',
    importance: 'Garantiza la subida fluida de la asistencia y notas a Supabase.',
    decisions: 'Reportar fallas al proveedor de telecomunicaciones departamental.',
    bestPractices: 'Monitorear picos de consumo de datos durante descansos.',
    caseStudy: 'Barbosa restableció la conectividad del Bloque B reconectando la fibra aérea.'
  },
  asistencia: {
    title: 'Tasa de Asistencia Media',
    tooltip: 'Porcentaje promedio de alumnos que ingresan a clase.',
    definition: 'Proporción de estudiantes presentes sobre el total matriculado en el territorio.',
    interpretation: 'El porcentaje promedio diario de alumnos presentes.',
    calculation: 'Asistencia registrada por RFID sobre la matrícula activa.',
    importance: 'Indicador directo de alerta preventiva de abandono escolar.',
    decisions: 'Activar rutas de transporte escolar rural en zonas con lluvias severas.',
    bestPractices: 'Pasar asistencia en las primeras 2 horas de clase.',
    caseStudy: 'Barbosa rural aumentó su asistencia con rutas complementarias.'
  },
  matematicas: {
    title: 'Promedio de Matemáticas',
    tooltip: 'Calificación acumulada en el área de ciencias matemáticas.',
    definition: 'Media de calificaciones obtenidas por los estudiantes en matemáticas.',
    interpretation: 'El promedio de notas registrado en la malla de matemáticas.',
    calculation: 'Promedio general del área de Matemáticas registrado en Supabase.',
    importance: 'Permite identificar rezagos de aprendizaje de cara a Pruebas Saber.',
    decisions: 'Programar talleres interactivos de nivelación en la plataforma.',
    bestPractices: 'Realizar evaluaciones semanales de diagnóstico.',
    caseStudy: 'Grado 11-B niveló su promedio tras 2 talleres curriculares en AulaCore.'
  },
  lenguaje: {
    title: 'Promedio de Lenguaje',
    tooltip: 'Calificación acumulada en el área de castellano y comprensión lectora.',
    definition: 'Media de calificaciones obtenidas por los estudiantes en competencias lingüísticas.',
    interpretation: 'El promedio de notas registrado en la malla de lenguaje.',
    calculation: 'Promedio general del área de Lengua Castellana registrado en Supabase.',
    importance: 'Mide la capacidad de comprensión lectora crítica del estudiantado.',
    decisions: 'Asignar planes de lectura obligatorios digitales.',
    bestPractices: 'Fomentar la lectura de textos cortos al iniciar la mañana.',
    caseStudy: 'Barbosa rural implementó plan de lectura y subió el rendimiento.'
  },
  desercion: {
    title: 'Tasa de Deserción Escolar',
    tooltip: 'Porcentaje de alumnos matriculados que abandonan el sistema.',
    definition: 'Porcentaje acumulado de alumnos retirados sin completar el año lectivo.',
    interpretation: 'Porcentaje acumulado de estudiantes que se retiran del ciclo escolar.',
    calculation: 'Alumnos inactivos por deserción sobre la matrícula inicial.',
    importance: 'Métrica de impacto social clave para el SGP.',
    decisions: 'Diseñar planes de retención y subsidios de alimentación PAE.',
    bestPractices: 'Visitar los hogares de alumnos con más de 10 ausencias.',
    caseStudy: 'Barbosa redujo la deserción al 0.1% con el comedor rural.'
  }
};
