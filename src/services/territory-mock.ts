'use client';

// =================================================================
// 🏛️ SERVICIO CENTRAL DE SIMULACIÓN Y MOCK DATA (PORTAL TERRITORIAL)
// =================================================================

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

export const MOCK_COMUNAS = ['Comuna 1', 'Comuna 2', 'Comuna 3', 'Corregimiento San Cristóbal', 'Barbosa rural'];
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
  { id: '2', name: 'Prof. Claudia Patricia Restrepo', specialty: 'Lengua Castellana', school: 'Gimnasio Campestre AulaCore', statute: 'Decreto 2277', degree: 'Especialista', experienceYears: 15, status: 'Activo' },
  { id: '3', name: 'Prof. Juan Fernando Quintero', specialty: 'Ciencias Naturales', school: 'I.E. Presbítero Antonio José Bernal', statute: 'Decreto 1278', degree: 'Profesional', experienceYears: 6, status: 'Activo' },
  { id: '4', name: 'Prof. Sandra Milena Muñoz', specialty: 'Inglés', school: 'Colegio San Ignacio de Loyola', statute: 'Decreto 1278', degree: 'Magíster', experienceYears: 9, status: 'Activo' },
  { id: '5', name: 'Prof. Ricardo Antonio Vélez', specialty: 'Tecnología', school: 'I.E. Técnico Industrial Pascual Bravo', statute: 'Decreto 2277', degree: 'Doctor', experienceYears: 20, status: 'Activo' },
  { id: '6', name: 'Prof. Gloria Estella Tobón', specialty: 'Matemáticas', school: 'I.E. Rural El Hatillo', statute: 'Decreto 1278', degree: 'Normalista', experienceYears: 4, status: 'Licencia' },
];

export const MOCK_VACANCIES = [
  { id: 'v1', subject: 'Física / Ciencias', school: 'I.E. Rural El Hatillo', priority: 'Alta', posted: 'Hace 3 días' },
  { id: 'v2', subject: 'Inglés Técnico', school: 'I.E. Técnico Industrial Pascual Bravo', priority: 'Media', posted: 'Hace 5 días' },
];

export const FORMACION_DOCENTE = [
  { name: 'Normalistas', docentes: 120 },
  { name: 'Tecnólogos', docentes: 210 },
  { name: 'Profesionales', docentes: 720 },
  { name: 'Especialistas', docentes: 640 },
  { name: 'Magísteres', docentes: 410 },
  { name: 'Doctores', docentes: 70 },
];

export const DISTRIBUCION_ESTATUTO = [
  { name: 'Decreto 1278 (Nuevo)', value: 1140, color: '#6366f1' },
  { name: 'Decreto 2277 (Antiguo)', value: 700, color: '#10b981' },
];

// --- 3. AGENDA TERRITORIAL ---
export interface MockVisit {
  id: string;
  institution: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  inspector: string;
  priority: 'Alta' | 'Media' | 'Baja';
  status: 'Programada' | 'Confirmada' | 'En ejecución' | 'Finalizada' | 'Cancelada' | 'Reprogramada';
}

export const INITIAL_VISITS: MockVisit[] = [
  { id: '1', institution: 'Institución Educativa Marco Fidel Suárez', type: 'Capacitación AulaCore', date: '2026-07-02', time: '09:00', duration: '2 horas', inspector: 'Ing. Laura Benítez', priority: 'Alta', status: 'Programada' },
  { id: '2', institution: 'I.E. Rural El Hatillo', type: 'Inspección Conectividad', date: '2026-07-05', time: '14:00', duration: '4 horas', inspector: 'Téc. Fernando Ruiz', priority: 'Alta', status: 'Confirmada' },
  { id: '3', institution: 'I.E. Presbítero Antonio José Bernal', type: 'Auditoría PAE', date: '2026-06-29', time: '10:00', duration: '2 horas', inspector: 'Dr. Daniel Rendón', priority: 'Media', status: 'En ejecución' },
  { id: '4', institution: 'Gimnasio Campestre AulaCore', type: 'Reunión de Rectores', date: '2026-06-25', time: '08:00', duration: '4 horas', inspector: 'Dr. Alejandro Gómez', priority: 'Baja', status: 'Finalizada' },
];

// --- 4. REPORTES ---
export interface MockReport {
  id: string;
  title: string;
  description: string;
  format: 'PDF' | 'EXCEL';
  size: string;
  period: string;
}

export const MOCK_REPORTS: MockReport[] = [
  { id: '1', title: 'Informe Anual de Cobertura y Matrículas 2026', description: 'Consolidado demográfico del territorio filtrado por niveles y comunas.', format: 'PDF', size: '2.4 MB', period: 'Año Lectivo 2026' },
  { id: '2', title: 'Consolidado de Calidad y Rankings Educativos', description: 'Promedios históricos de las asignaturas fundamentales de la jurisdicción.', format: 'EXCEL', size: '1.8 MB', period: 'Primer Semestre 2026' },
  { id: '3', title: 'Auditoría PAE - Segundo Trimestre', description: 'Reporte consolidado de minutas entregadas y cumplimiento de operadores.', format: 'PDF', size: '3.1 MB', period: 'Abril - Junio 2026' },
  { id: '4', title: 'Reporte de Madurez Tecnológica y Onboarding', description: 'Porcentaje de adopción de AulaCore por institución educativa.', format: 'EXCEL', size: '850 KB', period: 'Corte Junio 2026' },
];

// --- 5. COMUNICACIONES ---
export interface Circular {
  id: string;
  title: string;
  body: string;
  scope: string;
  targetDetails?: string;
  date: string;
  status: 'Pendiente' | 'Enviado' | 'Entregado' | 'Leído';
  readRatio: string;
  attachments: string[];
  digitallySigned: boolean;
  scheduledFor?: string;
}

export const INITIAL_CIRCULARES: Circular[] = [
  { 
    id: '1', 
    title: 'Circular 024: Auditorías del Programa de Alimentación Escolar (PAE)', 
    body: 'Se convoca a todos los rectores oficiales a revisar el cronograma de visitas de auditoría del segundo trimestre para garantizar la sanidad alimentaria.', 
    scope: 'Instituciones Oficiales', 
    date: 'Hoy 10:24 AM', 
    status: 'Leído', 
    readRatio: '20/24 (83%)', 
    attachments: ['Cronograma_Auditorias_PAE.pdf'], 
    digitallySigned: true 
  },
  { 
    id: '2', 
    title: 'Circular 023: Actualización Obligatoria de Matrículas en Lote', 
    body: 'Plazo extendido hasta el 15 de julio para registrar las novedades académicas en la plataforma AulaCore.', 
    scope: 'Todas las Instituciones', 
    date: 'Hace 3 días', 
    status: 'Entregado', 
    readRatio: '32/48 (66%)', 
    attachments: ['Manual_Matricula_AulaCore_2026.docx', 'Plantilla_Carga.xlsx'], 
    digitallySigned: true 
  },
];

export const INITIAL_BORRADORES = [
  { id: 'b1', title: 'Borrador: Conectividad Rural Banda Ancha', body: 'Solicitud de informe de factibilidad de tendido de fibra en veredas...', scope: 'Por Municipio (Barbosa)', date: 'Modificado ayer' }
];

export const INITIAL_PROGRAMADOS = [
  { id: 'p1', title: 'Circular 025: Capacitación Docente Plan PEI 2027', body: 'Taller virtual de alineamiento pedagógico del Proyecto Educativo Institucional...', scope: 'Todas las Instituciones', scheduledFor: '2026-07-01 a las 08:00 AM' }
];

// --- 6. ANALÍTICA / GUÍAS ---
export interface ExplainerInfo {
  title: string;
  definition: string;
  calculation: string;
  interpretation: string;
  decisions: string;
}

export const EXPLAINERS: Record<string, ExplainerInfo> = {
  madurez: {
    title: 'Madurez Digital (Health Score)',
    definition: 'Evalúa de manera agregada la adopción de herramientas digitales y módulos de AulaCore en los colegios de la jurisdicción.',
    calculation: 'Ponderación porcentual según el estado activo de los módulos curriculares, administrativos y de asistencia (RFID, Mallas, PEI, Planeación Horaria).',
    interpretation: 'Puntajes mayores a 80% reflejan una excelente asimilación digital. Valores inferiores a 70% indican riesgo de rezago operativo y necesidad de capacitación.',
    decisions: 'Priorizar auditorías técnicas y asignar acompañamiento a directivos y secretarios de colegios rezagados.'
  },
  conectividad: {
    title: 'Conectividad (Banda Ancha)',
    definition: 'Mide la disponibilidad y calidad del enlace a internet de banda ancha contratado o entregado en la sede principal del plantel.',
    calculation: 'Porcentaje de sedes con conexión dedicada superior a 20 Mbps y estabilidad de canal en el mes.',
    interpretation: 'Permite segmentar colegios urbanos y rurales. Indispensable para habilitar servicios sincrónicos en AulaCore.',
    decisions: 'Tramitar proyectos de cofinanciación de infraestructura de redes ante el Ministerio de TIC en áreas rurales críticas.'
  },
  asistencia: {
    title: 'Tasa de Asistencia Media',
    definition: 'Promedio consolidado del cumplimiento de presencialidad de los alumnos en sus jornadas académicas.',
    calculation: 'Registros de entrada en portería cruzados por lectoras RFID y reportes de inasistencias en clase.',
    interpretation: 'Tasas inferiores a 90% representan un disparador de riesgo académico y posible deserción escolar posterior.',
    decisions: 'Activar el protocolo de retención escolar (visitas del Supervisor de Zona y apoyo alimentario PAE).'
  },
  pearson: {
    title: 'Coeficiente de Correlación R de Pearson',
    definition: 'Estadístico matemático que cuantifica el grado de asociación lineal entre las dos variables seleccionadas.',
    calculation: 'Fórmula de covarianza de las variables dividida por el producto de sus desviaciones estándar.',
    interpretation: 'Va de -1.0 a +1.0. Un valor cercano a 1.0 es positivo fuerte (ambas suben juntas); cercano a -1.0 es negativo fuerte (al subir una, baja la otra). 0.0 indica ausencia de relación lineal.',
    decisions: 'Validar si la inversión tecnológica realizada (Eje X) está provocando un retorno efectivo en calidad o deserción (Eje Y).'
  }
};

// --- 7. CENTRO DE ALERTAS TEMPRANAS (CAT) ---
export interface TerritorialAlertLog {
  id: string;
  alert_id: string;
  action_taken: string;
  comment: string;
  resolution_time_seconds: number;
  outcome: 'exitoso' | 'ineficaz' | 'neutral' | 'en_progreso';
  evidence_url?: string;
  signed_by: string;
  signature_hash: string;
  created_at: string;
}

export interface TerritorialAlert {
  id: string;
  alert_code: string;
  scope: string; // 'territorial' | 'institucional' | 'aula'
  severity: 'critico' | 'alto' | 'medio' | 'bajo' | 'info';
  priority: 'urgente' | 'alta' | 'media' | 'baja';
  institution_id: string;
  institution_name: string;
  municipality: string;
  target_id: string; // ID Estudiante / Sede / Módulo
  target_name: string; // ej: "Grado 9-A" o "Bloque Principal"
  impact_estimate: number; // cantidad de personas o recursos
  description: string;
  assigned_to?: string; // Funcionario SED
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

export const INITIAL_ALERTS: TerritorialAlert[] = [
  {
    id: 'ALT-2026-001',
    alert_code: 'PAE-001',
    scope: 'territorial',
    severity: 'critico',
    priority: 'urgente',
    institution_id: 'inst-1',
    institution_name: 'I.E. Rural El Hatillo',
    municipality: 'Barbosa',
    target_id: 'pae-oper-1',
    target_name: 'Restaurante Central',
    impact_estimate: 450,
    description: 'El restaurante central reporta que el operador de alimentos PAE entregó las raciones del día con cadena de frío rota y frutas en mal estado.',
    assigned_to: 'Dra. Claudia Restrepo',
    status: 'validada',
    ai_suggestions: {
      option_a: 'Notificar de inmediato al consorcio operador para la sustitución de insumos en un plazo menor a 4 horas.',
      option_b: 'Suspender provisionalmente el servicio de este operador y activar plan de contingencia con comedores locales.',
      option_c: 'Iniciar investigación de control sanitario con la Secretaría de Salud departamental.'
    },
    metadata: {
      causes: ['Fallo en el transporte de carga refrigerada', 'Deficiencia de control de calidad del operador'],
      kpis: { 'Raciones Afectadas': 450, 'Grado Afectado': 'Primaria Completa', 'Reincidencia': 'Primera vez en el mes' }
    },
    created_at: '2026-06-30T07:15:00Z',
    logs: [
      {
        id: 'log-1',
        alert_id: 'ALT-2026-001',
        action_taken: 'Detección Automática',
        comment: 'Alerta generada por reporte del interventor escolar a través de AulaCore Escolar.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'Sistema AulaCore PAE',
        signature_hash: 'hash-58296a827bc',
        created_at: '2026-06-30T07:15:00Z'
      },
      {
        id: 'log-2',
        alert_id: 'ALT-2026-001',
        action_taken: 'Validación por Analista',
        comment: 'Llamada telefónica al Rector para corroborar el estado físico de los alimentos. Se confirma fruta descompuesta.',
        resolution_time_seconds: 1200,
        outcome: 'en_progreso',
        signed_by: 'Inspector Técnico SED',
        signature_hash: 'hash-859aef9021b',
        created_at: '2026-06-30T07:35:00Z'
      }
    ]
  },
  {
    id: 'ALT-2026-002',
    alert_code: 'PER-001',
    scope: 'territorial',
    severity: 'alto',
    priority: 'alta',
    institution_id: 'inst-2',
    institution_name: 'I.E. Marco Fidel Suárez',
    municipality: 'Barbosa',
    target_id: 'group-9a',
    target_name: 'Grado 9-A (Matutino)',
    impact_estimate: 12,
    description: 'El lector RFID de portería detecta que 12 alumnos de grado 9-A han superado el umbral mensual permitido de ausentismo preventivo (15.5%).',
    assigned_to: 'Dr. Alejandro Gómez',
    status: 'intervencion',
    ai_suggestions: {
      option_a: 'Enviar citación oficial digital a los acudientes a través del módulo de Comunicaciones.',
      option_b: 'Agendar una visita técnica presencial del psicopedagogo escolar al hogar de los 3 estudiantes más ausentes.',
      option_c: 'Solicitar un informe detallado de seguimiento de tutoría escolar al Rector del plantel.'
    },
    metadata: {
      causes: ['Problemas de transporte escolar rural', 'Deserción por vinculación laboral informal'],
      kpis: { 'Ausentismo Promedio': '18.4%', 'Estudiantes Afectados': 12, 'Reincidencia': 'Alta en la comuna 2' }
    },
    created_at: '2026-06-29T08:00:00Z',
    logs: [
      {
        id: 'log-3',
        alert_id: 'ALT-2026-002',
        action_taken: 'Detección de Asistencia RFID',
        comment: 'Cruce semanal automático de registros de entrada. 12 estudiantes en semáforo rojo.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'Servicio RFID Sync',
        signature_hash: 'hash-859261a8f9c',
        created_at: '2026-06-29T08:00:00Z'
      },
      {
        id: 'log-4',
        alert_id: 'ALT-2026-002',
        action_taken: 'Plan de Intervención Iniciado',
        comment: 'Se despachó la citación por correo y se solicitó acompañamiento de Bienestar Familiar.',
        resolution_time_seconds: 86400,
        outcome: 'en_progreso',
        signed_by: 'Dra. Claudia Restrepo',
        signature_hash: 'hash-bc902fa8120e',
        created_at: '2026-06-30T08:00:00Z'
      }
    ]
  },
  {
    id: 'ALT-2026-003',
    alert_code: 'INF-002',
    scope: 'territorial',
    severity: 'medio',
    priority: 'media',
    institution_id: 'inst-3',
    institution_name: 'I.E. Presbítero Antonio José Bernal',
    municipality: 'Barbosa',
    target_id: 'network-switch-1',
    target_name: 'Bloque Académico B',
    impact_estimate: 820,
    description: 'El servidor local de AulaCore reporta desconexión prolongada de internet por más de 48 horas en el Bloque Académico B.',
    assigned_to: 'Ing. Ricardo Vélez',
    status: 'asignada',
    ai_suggestions: {
      option_a: 'Revisar de forma remota el estado del router/switch si se restablece el latido básico.',
      option_b: 'Programar visita del soporte de redes del operador del departamento en la Agenda Territorial.',
      option_c: 'Instruir al personal del colegio a operar bajo el protocolo offline de AulaCore para evitar pérdida de asistencia.'
    },
    metadata: {
      causes: ['Fallo eléctrico local en switch principal', 'Corte de tendido de fibra óptica aéreo'],
      kpis: { 'Estudiantes Afectados': 820, 'Horas Caídas': 52, 'Reincidencia': 'Media' }
    },
    created_at: '2026-06-28T10:00:00Z',
    logs: [
      {
        id: 'log-5',
        alert_id: 'ALT-2026-003',
        action_taken: 'Detección por Latidos (Heartbeats)',
        comment: 'Servidor desconectado. Último latido el 2026-06-28 10:00:00.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'AulaCore Heartbeat Engine',
        signature_hash: 'hash-ef826ba8901c',
        created_at: '2026-06-28T10:00:00Z'
      }
    ]
  },
  {
    id: 'ALT-2026-004',
    alert_code: 'CAL-001',
    scope: 'territorial',
    severity: 'bajo',
    priority: 'baja',
    institution_id: 'inst-4',
    institution_name: 'Gimnasio Campestre AulaCore',
    municipality: 'Barbosa',
    target_id: 'course-11b',
    target_name: 'Grado 11-B',
    impact_estimate: 32,
    description: 'El promedio final del área de Matemáticas de grado 11-B descendió a 3.1, ubicándose por debajo del límite sugerido (3.5).',
    status: 'resuelta',
    ai_suggestions: {
      option_a: 'Sugerir la asignación de un taller de refuerzo curricular interactivo de Álgebra en AulaCore.',
      option_b: 'Programar una reunión virtual con el docente de matemáticas del curso para evaluar la malla pedagógica.',
      option_c: 'Monitorear la evolución de las notas de las evaluaciones del próximo corte.'
    },
    metadata: {
      causes: ['Falta de nivelación en el módulo curricular', 'Mallas pedagógicas no alineadas al PEI'],
      kpis: { 'Promedio Académico': 3.1, 'Alumnos Evaluados': 32, 'Reincidencia': 'Ninguna' }
    },
    created_at: '2026-06-25T11:00:00Z',
    logs: [
      {
        id: 'log-6',
        alert_id: 'ALT-2026-004',
        action_taken: 'Cruce de Calificaciones de Supabase',
        comment: 'Calificación acumulada por debajo de los límites ministeriales.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'AulaCore Académico Sync',
        signature_hash: 'hash-859a12bc8592',
        created_at: '2026-06-25T11:00:00Z'
      },
      {
        id: 'log-7',
        alert_id: 'ALT-2026-004',
        action_taken: 'Resolución de Alerta',
        comment: 'El Rector certifica que el docente asignó 2 talleres de refuerzo y el promedio general del grupo subió a 3.7.',
        resolution_time_seconds: 172800,
        outcome: 'exitoso',
        signed_by: 'Dr. Alejandro Gómez',
        signature_hash: 'hash-fc2019ab3b2',
        created_at: '2026-06-27T11:00:00Z'
      }
    ]
  }
];

