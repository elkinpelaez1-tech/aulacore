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
