'use client';

export interface HelpArticle {
  id: string;
  category: 'alertas' | 'matriculas' | 'agenda' | 'general' | 'calidad';
  title: string;
  whatIs: string;
  whyImportant: string;
  howCalculated?: string;
  decisions: string;
  bestPractices: string;
  caseStudy: string;
  regulation?: string;
  imageUrl?: string;
  videoUrl?: string;
  documentUrl?: string;
  relatedArticleIds: string[];
}

export const HELP_KNOWLEDGE_BASE: Record<string, HelpArticle> = {
  'como-registrar-visita': {
    id: 'como-registrar-visita',
    category: 'agenda',
    title: '¿Cómo programar una visita técnica en la Agenda?',
    whatIs: 'Guía paso a paso para agendar supervisores de campo, auditores del PAE o capacitadores AulaCore en los establecimientos de la jurisdicción.',
    whyImportant: 'Asegura la coordinación del personal en terreno y deja una bitácora inmutable de visitas técnicas en cada establecimiento.',
    decisions: 'El Secretario de Educación o Inspectores pueden asignar visitas de campo para corroborar alertas o recopilar actas físicas.',
    bestPractices: 'Verificar la disponibilidad en el calendario del supervisor y detallar el tipo de actividad (Auditoría PAE, Inspección de Redes) antes de guardar.',
    caseStudy: 'Al agendarse una visita de auditoría PAE en el Gimnasio Campestre, el supervisor llevó la planilla precargada y validó el cumplimiento del menú en menos de 2 horas.',
    videoUrl: 'https://docs.aulacore.org/videos/agenda-tutorial.mp4',
    imageUrl: 'https://docs.aulacore.org/images/agenda-visita-preview.png',
    documentUrl: 'https://docs.aulacore.org/docs/Manual_Agenda_Territorial.pdf',
    relatedArticleIds: ['cat-prioridad-inteligente', 'cat-acciones-pendientes']
  },
  'como-emitir-circular': {
    id: 'como-emitir-circular',
    category: 'general',
    title: '¿Cómo emitir una Circular Oficial?',
    whatIs: 'Guía operativa del módulo de Comunicaciones para redactar, firmar y despachar circulares institucionales.',
    whyImportant: 'Establece el canal de comunicación formal con los Rectores del territorio con validez legal por firma digital.',
    decisions: 'El Secretario de Educación despacha circulares para convocar a capacitaciones, requerir datos o notificar directivas ministeriales.',
    bestPractices: 'Adjuntar siempre el cronograma oficial en PDF y activar el check de firma digital del Secretario antes del envío.',
    caseStudy: 'Se despachó la circular 024 de auditoría PAE a 24 rectores oficiales, obteniendo una tasa de lectura del 83% en menos de 24 horas.',
    documentUrl: 'https://docs.aulacore.org/docs/Guia_Comunicaciones_Firmas.pdf',
    relatedArticleIds: ['como-registrar-visita']
  },
  'que-es-matricula-consolidada': {
    id: 'que-es-matricula-consolidada',
    category: 'matriculas',
    title: '¿Qué es la Matrícula Consolidada y cómo auditarla?',
    whatIs: 'El indicador maestro que cuantifica los alumnos registrados y activos en todas las sedes del municipio.',
    whyImportant: 'Determina los recursos que el Ministerio de Educación Nacional (SGP) asigna al municipio por capitación.',
    howCalculated: 'Suma de alumnos con estado de matrícula "Activa" en la base de datos de Supabase filtrado por vigencia.',
    decisions: 'Planificar ampliación de infraestructura escolar, contratación docente y cobertura del PAE en zonas con alta demanda.',
    bestPractices: 'Exigir a las I.E. privadas y oficiales sincronizar sus matrículas en lote antes de la fecha de corte nacional.',
    caseStudy: ' Barbosa rural identificó una sobreocupación del 12% en aulas de primaria, coordinando la apertura de 2 nuevos grupos escolares.',
    imageUrl: 'https://docs.aulacore.org/images/cobertura-matricula.png',
    relatedArticleIds: ['cat-ie-criticas', 'cat-vulnerabilidad']
  },
  'cat-prioridad-inteligente': {
    id: 'cat-prioridad-inteligente',
    category: 'alertas',
    title: '¿Cómo funciona la prioridad del Motor Inteligente?',
    whatIs: 'Explicación del cálculo automatizado de la urgencia de atención en el Centro de Alertas Tempranas (CAT).',
    whyImportant: 'Evita la saturación del equipo inspector priorizando los incidentes según el volumen de personas afectadas y la reincidencia escolar.',
    howCalculated: 'Gravedad del código de la alerta multiplicado por el logaritmo en base 10 del impacto estimado, sumado al coeficiente de reincidencia del colegio.',
    decisions: 'Asignar inspectores de forma descendente por prioridad inteligente (Urgente ➔ Alta ➔ Media ➔ Baja).',
    bestPractices: 'Monitorear diariamente las alertas rojas en el CAT para mantener la tasa de resolución del territorio por encima del 80%.',
    caseStudy: 'Una alerta de deserción individual PER-001 subió automáticamente a prioridad Alta al cruzarse con el historial de reprobación escolar de la comuna.',
    relatedArticleIds: ['como-registrar-visita', 'cat-acciones-pendientes']
  },
  'cat-acciones-pendientes': {
    id: 'cat-acciones-pendientes',
    category: 'alertas',
    title: '¿Cómo resolver y auditar una Alerta?',
    whatIs: 'Flujo del ciclo de vida de una incidencia desde su asignación a un inspector hasta el cierre definitivo con actas de evidencia.',
    whyImportant: 'Construye la bitácora estructurada de aprendizaje inmutable de AulaCore para optimizar las políticas de permanencia.',
    decisions: 'Transicionar estados (Validada ➔ Intervención ➔ Seguimiento ➔ Resuelta) cargando los soportes y actas correspondientes.',
    bestPractices: 'Registrar de forma descriptiva el hito, el resultado de la acción (exitoso/ineficaz) y el archivo firmado para auditoría.',
    caseStudy: 'El Director TIC cargó el acta de mantenimiento del router en la alerta ALT-2026-003, cerrándola con un resultado de intervención exitoso.',
    relatedArticleIds: ['cat-prioridad-inteligente', 'como-registrar-visita']
  },
  'cat-vulnerabilidad': {
    id: 'cat-vulnerabilidad',
    category: 'alertas',
    title: '¿Qué es el Índice de Vulnerabilidad Territorial (IRT)?',
    whatIs: 'Consolidado BI que califica el nivel de riesgo predictivo general de deserción y rendimiento del municipio.',
    whyImportant: 'Es el termómetro del Secretario de Educación para evaluar el éxito de los programas de retención escolar.',
    howCalculated: 'Promedio ponderado del ausentismo registrado vía RFID, tasas de deserción mensuales y deserción inter-periodo.',
    decisions: 'Reconfigurar umbrales de alerta preventiva de inasistencia en la pestaña Configuración de la Secretaría.',
    bestPractices: 'Monitorear la correlación de Pearson en la sección de Analítica Territorial para evaluar el impacto de las inversiones.',
    caseStudy: 'Al subir el IRT al 28%, la Secretaría activó una mesa de calidad asignando rutas de transporte escolar rurales adicionales.',
    relatedArticleIds: ['que-es-matricula-consolidada', 'cat-ie-criticas']
  }
};
