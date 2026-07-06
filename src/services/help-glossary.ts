'use client';

export interface HelpItem {
  id: string;
  title: string;
  tooltip: string; // Hover corto (máx 120 caracteres)
  whatIs: string; // ¿Qué es?
  whyImportant: string; // ¿Por qué es importante?
  howCalculated?: string; // ¿Cómo se calcula? (opcional)
  decisions: string; // ¿Qué decisiones permite tomar?
  bestPractices: string; // Buenas prácticas
  caseStudy: string; // Caso práctico
  regulation?: string; // Normatividad aplicable (opcional)
}

export const HELP_GLOSSARY: Record<string, HelpItem> = {
  'cat-decisiones-urgentes': {
    id: 'cat-decisiones-urgentes',
    title: 'Decisiones Urgentes (Triage CAT)',
    tooltip: 'Total de incidencias críticas del territorio que no tienen un funcionario responsable asignado.',
    whatIs: 'Indica el número de alertas de máxima gravedad (Rojo) y alta prioridad (Naranja) que acaban de ingresar al sistema y requieren triage inmediato para asignar su atención en campo.',
    whyImportant: 'Previene el retraso en la mitigación de eventos graves que amenazan la continuidad de las clases, la salubridad alimentaria o la integridad de los estudiantes.',
    howCalculated: 'Suma de alertas activas donde el estado es "detectada" o "validada", la criticidad es "critico" o "alto" y el campo de responsable asignado está vacío.',
    decisions: 'El Secretario de Educación o Subsecretario debe asignar inmediatamente a un inspector o director de área para iniciar gestiones correctivas.',
    bestPractices: 'Mantener este indicador en cero al final de cada jornada de la mañana. Asignar responsables calificados según la naturaleza de la alerta.',
    caseStudy: 'Ante una alerta de desabastecimiento de PAE rural (ALT-2026-001), el Secretario derivó el caso al Director de Cobertura en menos de 15 minutos, coordinando raciones de contingencia con comedores veredales.',
    regulation: 'Decreto 1860 de 1994 (Organización del servicio educativo nacional) y directivas ministeriales sobre el derecho fundamental a la educación.'
  },
  'cat-ie-criticas': {
    id: 'cat-ie-criticas',
    title: 'I.E. con Semáforo Activo',
    tooltip: 'Total de establecimientos educativos únicos con al menos una alerta Crítica o Alta vigente.',
    whatIs: 'Un consolidado territorial que identifica cuántos colegios del municipio presentan situaciones de vulnerabilidad académica, digital, de convivencia o PAE en curso.',
    whyImportant: 'Permite dimensionar si el problema es generalizado en el territorio o si está concentrado en planteles específicos que requieran una auditoría integral.',
    howCalculated: 'Conteo único (DISTINCT) de IDs de instituciones educativas asociadas a alertas con criticidad "critico" o "alto" y estado diferente de "resuelta" o "cerrada".',
    decisions: 'Coordinar planes de mejoramiento integrales (múltiples áreas) para los colegios reincidentes o con alta acumulación de semáforos activos.',
    bestPractices: 'Cargar y actualizar mensualmente el historial de reincidencia escolar para ponderar las prioridades del Motor Inteligente.',
    caseStudy: 'La I.E. Rural El Hatillo acumuló alertas de conectividad y PAE. Calidad y Cobertura unificaron una auditoría conjunta programando visitas paralelas en la Agenda Territorial.',
    regulation: 'Ley 115 General de Educación de Colombia (Evaluación de la calidad del servicio público educativo).'
  },
  'cat-acciones-pendientes': {
    id: 'cat-acciones-pendientes',
    title: 'Acciones Asignadas',
    tooltip: 'Total de alertas a cargo del funcionario logueado en estados de intervención o seguimiento.',
    whatIs: 'Indica el volumen de trabajo activo del operador o inspector territorial. Representa los expedientes en los cuales se está ejecutando un protocolo de mitigación.',
    whyImportant: 'Permite balancear la carga operativa de los inspectores de la Secretaría y evaluar el cuello de botella en los flujos de resolución de campo.',
    howCalculated: 'Conteo de alertas donde el campo "assigned_to" coincide con el usuario activo y el estado se encuentra en "intervencion" o "seguimiento".',
    decisions: 'Despachar visitas de inspección, requerir firmas de actas de compromiso a los rectores o reasignar inspectores saturados.',
    bestPractices: 'Registrar hitos en la narrativa con comentarios detallados al menos cada 48 horas mientras el caso permanezca abierto.',
    caseStudy: 'El Director TIC resolvió 3 alertas pendientes de internet rural instruyendo a los colegios el uso del módulo Offline First de AulaCore mientras el operador reponía el cableado.',
    regulation: 'Manual de Funciones de la Secretaría de Educación y Código de Procedimiento Administrativo.'
  },
  'cat-prioridad-inteligente': {
    id: 'cat-prioridad-inteligente',
    title: 'Motor de Priorización Inteligente',
    tooltip: 'Prioridad calculada cruzando la severidad de la alerta, el impacto estimado y la reincidencia escolar.',
    whatIs: 'Un clasificador por reglas de negocio que re-evalúa el nivel de urgencia real de una incidencia para que no dependa solo del tipo de alerta, sino de las personas afectadas.',
    whyImportant: 'Garantiza que una alerta simple afectando a toda una institución tenga mayor prioridad de atención que una alerta teóricamente severa que afecte a un único usuario.',
    howCalculated: 'Multiplicación del factor de gravedad (1 a 8) por el logaritmo en base 10 del impacto estimado, sumado a la reincidencia histórica del plantel.',
    decisions: 'Ordenar el listado de alertas de forma descendente por prioridad para abordar los expedientes que alivien a la mayor cantidad de estudiantes.',
    bestPractices: 'Validar que las mallas curriculares y el RFID provean datos limpios de asistencia para evitar desviaciones en el cálculo del impacto.',
    caseStudy: 'Una inasistencia predictiva de deserción (PER-001) que inicialmente era de prioridad "media" fue elevada a "alta" automáticamente al detectar que afectaba a 12 alumnos de grado 9-A.',
    regulation: 'Políticas de Innovación Educativa y Transformación Digital del Ministerio de Educación Nacional.'
  },
  'cat-impacto-estimado': {
    id: 'cat-impacto-estimado',
    title: 'Impacto Real Estimado',
    tooltip: 'Número cuantificado de estudiantes, docentes o raciones comprometidas por la alerta.',
    whatIs: 'Es el volumen real de afectación del suceso. Pasa del concepto abstracto de la anomalía al dato numérico concreto del recurso comprometido.',
    whyImportant: 'Ayuda a planificar los recursos logísticos requeridos (ej: cuántas minutas de contingencia enviar ante un fallo PAE).',
    howCalculated: 'Lectura directa de las matrículas del grupo afectado (RFID) o raciones contratadas de la sede en la ficha institucional.',
    decisions: 'Coordinar con la subdirección financiera el alcance de la compensación y recursos requeridos para mitigar la emergencia.',
    bestPractices: 'Mantener al día la matrícula en lote en AulaCore para asegurar la veracidad de los cálculos de afectación del CAT.',
    caseStudy: 'Al registrarse la desconexión del Bloque B de la I.E. Presbítero Antonio Bernal, se identificó que impactaba a 820 estudiantes de bachillerato, disparando una visita TIC en menos de 24 horas.',
    regulation: 'Lineamientos Técnicos del Programa de Alimentación Escolar (PAE) y normas de infraestructura tecnológica.'
  },
  'cat-vulnerabilidad': {
    id: 'cat-vulnerabilidad',
    title: 'Índice de Vulnerabilidad Territorial (IRT)',
    tooltip: 'Porcentaje predictivo consolidado de riesgo del municipio en base a ausentismo y mallas.',
    whatIs: 'Un indicador general del territorio que evalúa la salud integral de la educación municipal cruzando deserción, conectividad y calidad.',
    whyImportant: 'Es el termómetro BI para el Secretario que evalúa si las políticas de permanencia y retención aplicadas en el año están funcionando a nivel municipal.',
    howCalculated: 'Promedio ponderado del ausentismo, reprobación académica y cobertura escolar en comparación con la media histórica.',
    decisions: 'Ajustar la sensibilidad de las alarmas en el panel de Configuración de la Secretaría para adaptarlo a la realidad veredal.',
    bestPractices: 'Comparar el IRT del municipio al finalizar cada semestre lectivo con las metas del plan de desarrollo territorial.',
    caseStudy: 'El IRT subió al 28% debido a lluvias prolongadas en veredas de Barbosa. Cobertura activó subsidio de transporte rural disminuyendo el ausentismo general.',
    regulation: 'Plan de Desarrollo Departamental y Directiva Ministerial contra la deserción escolar.'
  },
  'mio-engine': {
    id: 'mio-engine',
    title: 'MIO (Motor de Inteligencia Operativa)',
    tooltip: 'El cerebro operativo de AulaCore que ejecuta y audita flujos de automatización institucional.',
    whatIs: 'El núcleo de automatización inteligente encargado de recibir eventos del sistema, evaluar reglas y tomar decisiones automatizadas en cascada (como agendar visitas o crear alertas).',
    whyImportant: 'Desacopla la lógica de negocio y permite la orquestación en tiempo real de múltiples módulos de AulaCore sin dependencias directas.',
    howCalculated: 'Procesamiento en 7 capas: Evento ➔ Reglas ➔ Decisiones ➔ Automatización ➔ Aprendizaje (SHA-256) ➔ Recomendaciones IA ➔ Mejora Continua.',
    decisions: 'Habilitar o deshabilitar recetas institucionales homologadas y aprobar propuestas de mejora continua formuladas por la IA.',
    bestPractices: 'Monitorear la Black Box para detectar demoras en el procesamiento de flujos de intervención veredales.',
    caseStudy: 'El MIO interceptó la alerta PAE y despachó automáticamente la circular oficial al rector de El Hatillo y la orden de visita de campo en 150 milisegundos.',
    regulation: 'Arquitectura desacoplada basada en eventos (EDA) y estándares de inmutabilidad digital.'
  },
  'matriz-dispersion': {
    id: 'matriz-dispersion',
    title: 'Matriz de Dispersión Académica',
    tooltip: 'Gráfico bidimensional en Analítica que cruza el ausentismo escolar con el rendimiento promedio.',
    whatIs: 'Una visualización avanzada en el portal de analítica que posiciona cada institución educativa del territorio en base a su porcentaje de inasistencia (eje X) y su promedio de notas (eje Y).',
    whyImportant: 'Permite identificar inmediatamente a las escuelas en el cuadrante crítico (alto ausentismo y bajo promedio) para intervenciones prioritarias.',
    howCalculated: 'Cruce estadístico de asistencias diarias consolidadas y promedios aritméticos de notas por plantel.',
    decisions: 'Direccionar recursos de tutoría escolar y subsidios de alimentación/transporte a los planteles en el cuadrante rojo.',
    bestPractices: 'Validar que las I.E. no tengan descalces o retrasos en la carga de notas al final del periodo lectivo.',
    caseStudy: 'Al cruzar Barbosa rural, la I.E. El Hatillo apareció en el extremo superior izquierdo de la matriz, gatillando el envío de raciones PAE de contingencia.',
    regulation: 'Guía de Evaluación de Calidad Educativa del MEN.'
  },
  'cobertura-educativa': {
    id: 'cobertura-educativa',
    title: 'Cobertura Educativa',
    tooltip: 'Indicador de acceso y permanencia que mide la población matriculada sobre la proyectada.',
    whatIs: 'Módulo que analiza las tasas de matrícula del territorio veredal, comparando el total de cupos ocupados con el censo de población en edad escolar.',
    whyImportant: 'Garantiza el cumplimiento del derecho a la educación formal y fundamenta los giros del SGP.',
    howCalculated: 'Estudiantes matriculados activos divididos por la población proyectada del DANE multiplicada por 100.',
    decisions: 'Planificar la construcción de aulas y aperturas de nuevas plazas docentes en zonas rurales.',
    bestPractices: 'Auditar semanalmente el descalce entre estudiantes matriculados formalmente y asistentes reales registrados por RFID.',
    caseStudy: 'Al caer la cobertura en Barbosa al 84%, Cobertura Territorial activó la campaña escolar veredal "Aula Puerta a Puerta" recuperando 320 matriculados.',
    regulation: 'Decreto 1860 y Ley General de Educación de Colombia.'
  },
  'kpis-indicadores': {
    id: 'kpis-indicadores',
    title: 'KPIs (Indicadores Clave de Rendimiento)',
    tooltip: 'Métricas analíticas que cuantifican la salud y eficacia de la gestión escolar del territorio.',
    whatIs: 'Consolidado BI visible en los portales que mide las variables críticas de la educación (matrículas, alertas CAT resueltas, visitas realizadas y efectividad MIO).',
    whyImportant: 'Facilita la toma de decisiones basada en datos reales en lugar de suposiciones intuitivas.',
    howCalculated: 'Agregaciones estadísticas de la base de datos de Supabase en tiempo real.',
    decisions: 'Calibrar los presupuestos del municipio y reasignar personal a las comunas en riesgo.',
    bestPractices: 'Mantener las integraciones RFID y notas activas para alimentar los widgets analíticos sin retrasos.',
    caseStudy: 'La Gobernación de Antioquia redujo el tiempo de resolución del CAT de 12 días a 48 horas al visualizar semanalmente los KPIs de efectividad de los inspectores.',
    regulation: 'Métricas oficiales del Plan de Desarrollo Institucional.'
  },
  'ev-evaluadas-ia': {
    id: 'ev-evaluadas-ia',
    title: 'Ev. Evaluadas IA (Evaluaciones por Inteligencia Artificial)',
    tooltip: 'Total de exámenes, talleres y pruebas calificados automáticamente por el motor de IA de AulaCore en el territorio.',
    whatIs: 'Representa el número de actividades evaluativas y exámenes de estudiantes que han sido calificados, procesados y analizados en tiempo real por los algoritmos de Inteligencia Artificial de AulaCore en todas las instituciones de la jurisdicción.',
    whyImportant: 'Demuestra el ahorro masivo de carga operativa para los docentes (eliminando calificar cerros de papel manuales) y proporciona a la Secretaría una radiografía académica en vivo, alimentando el motor predictivo de alertas CAT para intervenir antes de terminar el año.',
    howCalculated: 'Suma consolidada de entregas de evaluaciones, talleres y pruebas estandarizadas procesadas por el módulo de evaluación curricular asistida por IA en las sedes activas.',
    decisions: 'Identificar al instante qué colegios, grados y competencias específicas (ej. matemáticas o lenguaje) presentan vacíos de aprendizaje para ordenar refuerzos o tutorías con la Agenda Territorial.',
    bestPractices: 'Fomentar en los colegios el uso de pruebas con calificación automática para obtener reportes psicométricos al momento de finalizar cada examen.',
    caseStudy: 'Al procesar 18,450 evaluaciones en el periodo actual (+12.3% de adopción), la Secretaría de Educación detectó una brecha en comprensión lectora en grado 9° y programó talleres de refuerzo antes del examen nacional.',
    regulation: 'Directivas de Innovación Curricular y Políticas de Evaluación Docente del MEN.'
  }
};

/**
 * Registrar de forma anónima una consulta de ayuda contextual para análisis de usabilidad
 */
export function logHelpQuery(helpId: string) {
  if (typeof window === 'undefined') return;
  try {
    const key = 'aulacore_help_queries_log';
    const stored = localStorage.getItem(key);
    const logs: Array<{ helpId: string; timestamp: string }> = stored ? JSON.parse(stored) : [];
    
    logs.push({
      helpId,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem(key, JSON.stringify(logs));
    
    // Simular envío de telemetría inofensiva al servidor
    console.log(`[AulaHelp Telemetry] Consulta de ayuda anónima registrada: ${helpId}`);
  } catch (e) {
    // Silencioso
  }
}

/**
 * Obtener estadísticas de uso de la ayuda para análisis de dudas recurrentes
 */
export function getHelpStats(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const key = 'aulacore_help_queries_log';
    const stored = localStorage.getItem(key);
    if (!stored) return {};
    const logs: Array<{ helpId: string }> = JSON.parse(stored);
    
    return logs.reduce((acc, log) => {
      acc[log.helpId] = (acc[log.helpId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  } catch (e) {
    return {};
  }
}
