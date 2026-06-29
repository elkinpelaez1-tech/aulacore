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
    interpretation: 'Va de -1.0 a +1.0. Un valor cercano a 1.5 es positivo fuerte (ambas suben juntas); cercano a -1.0 es negativo fuerte (al subir una, baja la otra). 0.0 indica ausencia de relación lineal.',
    decisions: 'Validar si la inversión tecnológica realizada (Eje X) está provocong un retorno efectivo en calidad o deserción (Eje Y).'
  }
};
