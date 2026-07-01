'use client';

export type CIEIndicatorType = 'descriptivo' | 'diagnostico' | 'predictivo' | 'prescriptivo';

export interface CIEIndicator {
  code: string;
  name: string;
  category: string;
  type: CIEIndicatorType;
  description: string;
  objective: string;
  variables: string[];
  formula: string;
  weight: number; // Porcentaje de peso en el IGR (0 a 100)
  threshold: number; // Umbral de alerta (0 a 100)
  currentValue: number; // Valor actual simulado (0 a 100)
  severity: 'bajo' | 'medio' | 'alto' | 'critico';
  interpretation: string;
  recommendations: string[];
  relatedProtocols: string[];
  mioTriggerEvent?: string; // Evento que publica al MIO
}

export interface CIEHistoryPoint {
  date: string;
  value: number;
}

const DEFAULT_INDICATORS: CIEIndicator[] = [
  // 1. PREDICTIVOS (Los 14 solicitados)
  {
    code: 'CIE-PRED-001',
    name: 'Riesgo de Deserción Escolar',
    category: 'Permanencia Escolar',
    type: 'predictivo',
    description: 'Predice la probabilidad de abandono definitivo basándose en inasistencias acumuladas y bajo rendimiento.',
    objective: 'Identificar alumnos con alta probabilidad de deserción antes del retiro oficial del SIMAT.',
    variables: ['Tasa de asistencia RFID < 85%', 'Promedio acumulado < 3.2', 'Falta de acudiente en entregas'],
    formula: 'IGR_Desercion = (0.6 * Inasistencia) + (0.4 * PromedioBajo)',
    weight: 12,
    threshold: 75,
    currentValue: 34,
    severity: 'alto',
    interpretation: 'Un valor > 75% indica alarma crítica. Requiere contacto con acudiente e intervención psicosocial.',
    recommendations: ['Visita domiciliaria del gestor de cobertura', 'Activación de tutoría académica focalizada'],
    relatedProtocols: ['PROT-DES (Retención y Permanencia)'],
    mioTriggerEvent: 'student.risk.desercion'
  },
  {
    code: 'CIE-PRED-002',
    name: 'Riesgo de Bajo Rendimiento Académico',
    category: 'Calidad Educativa',
    type: 'predictivo',
    description: 'Analiza la tendencia de notas en materias críticas (Matemáticas y Lenguaje) para predecir reprobación.',
    objective: 'Prevenir la pérdida de año escolar mediante tutorías preventivas.',
    variables: ['Calificaciones del periodo actual', 'Alertas de tareas pendientes', 'Histórico del año anterior'],
    formula: 'IGR_Rendimiento = (0.7 * MateriasCriticas) + (0.3 * TareasIncumplidas)',
    weight: 10,
    threshold: 80,
    currentValue: 45,
    severity: 'alto',
    interpretation: 'Valores superiores al 80% exigen un plan de mejoramiento curricular y citación al acudiente.',
    recommendations: ['Crear plan de mejoramiento personalizado', 'Notificación preventiva en el observador escolar'],
    relatedProtocols: ['PROT-CAL (Calidad y Nivelación)'],
    mioTriggerEvent: 'student.risk.academic'
  },
  {
    code: 'CIE-PRED-003',
    name: 'Riesgo de Ausentismo Sistemático',
    category: 'Permanencia Escolar',
    type: 'predictivo',
    description: 'Predice inasistencias sucesivas a partir de ausencias RFID justificadas e injustificadas.',
    objective: 'Focalizar controles de deserción en zonas veredales de difícil acceso.',
    variables: ['Inasistencia semanal', 'Factores climáticos', 'Distancia al plantel'],
    formula: 'IGR_Ausentismo = Tasa de ausencia consecutiva de 3 días',
    weight: 8,
    threshold: 70,
    currentValue: 28,
    severity: 'medio',
    interpretation: 'Superar el 70% dispara alerta inmediata de inasistencia RFID.',
    recommendations: ['Llamada telefónica automatizada al acudiente', 'Validación del transporte escolar rural'],
    relatedProtocols: ['PROT-DES (Retención y Permanencia)'],
    mioTriggerEvent: 'student.absence.detected'
  },
  {
    code: 'CIE-PRED-004',
    name: 'Riesgo de Convivencia Escolar',
    category: 'Convivencia y Bienestar',
    type: 'predictivo',
    description: 'Predice brotes de indisciplina o acoso según anotaciones del observador.',
    objective: 'Intervenir ante conflictos escolares antes de que escalen a agresiones físicas.',
    variables: ['Anotaciones disciplinarias', 'Conflictos reportados en aula', 'Suspensiones temporales'],
    formula: 'IGR_Convivencia = (0.8 * AnotacionesGraves) + (0.2 * LlamadosAtencion)',
    weight: 8,
    threshold: 75,
    currentValue: 18,
    severity: 'alto',
    interpretation: 'Valores > 75% requieren mediación del comité de convivencia escolar.',
    recommendations: ['Sesión de mediación con orientador escolar', 'Taller grupal de resolución pacífica de conflictos'],
    relatedProtocols: ['PROT-CON (Convivencia Escolar Ley 1620)'],
    mioTriggerEvent: 'student.risk.convivencia'
  },
  {
    code: 'CIE-PRED-005',
    name: 'Riesgo de Bullying e Intimidación',
    category: 'Convivencia y Bienestar',
    type: 'predictivo',
    description: 'Analiza denuncias anónimas y reportes del observador para detectar focos de acoso escolar.',
    objective: 'Garantizar entornos escolares seguros y libres de discriminación.',
    variables: ['Denuncias anónimas en AulaHelp', 'Historial del observador', 'Tasa de deserción en curso específico'],
    formula: 'IGR_Bullying = (0.9 * DenunciasValidadas) + (0.1 * ReportesRector)',
    weight: 7,
    threshold: 60,
    currentValue: 12,
    severity: 'critico',
    interpretation: 'Umbral bajo (60%) debido a la alta criticidad del impacto psicológico del acoso.',
    recommendations: ['Activación del protocolo Ley 1620', 'Intervención de psicología de la Secretaría'],
    relatedProtocols: ['PROT-CON (Convivencia Escolar Ley 1620)'],
    mioTriggerEvent: 'student.risk.convivencia'
  },
  {
    code: 'CIE-PRED-006',
    name: 'Riesgo de Salud Mental',
    category: 'Convivencia y Bienestar',
    type: 'predictivo',
    description: 'Monitorea variables psicosociales y reportes del orientador escolar para prevenir autolesiones y depresión.',
    objective: 'Brindar primeros auxilios psicológicos y atención temprana a alumnos vulnerables.',
    variables: ['Reportes del orientador', 'Cambio abrupto en promedio académico', 'Inasistencias atípicas'],
    formula: 'IGR_SaludMental = (0.7 * AlertasOrientador) + (0.3 * DescensoNotas)',
    weight: 8,
    threshold: 65,
    currentValue: 22,
    severity: 'critico',
    interpretation: 'Cualquier superación del 65% exige remisión a la EPS y acompañamiento familiar.',
    recommendations: ['Remisión prioritaria a psicología clínica', 'Seguimiento pedagógico flexible'],
    relatedProtocols: ['PROT-SALUD (Salud Escolar y Acompañamiento)'],
    mioTriggerEvent: 'student.risk.convivencia'
  },
  {
    code: 'CIE-PRED-007',
    name: 'Riesgo de Consumo de Sustancias Psicoactivas',
    category: 'Convivencia y Bienestar',
    type: 'predictivo',
    description: 'Predice focos de vulnerabilidad al consumo de sustancias a partir de reportes comunitarios y del observador.',
    objective: 'Prevenir la adicción y el microtráfico en entornos escolares.',
    variables: ['Reportes comunitarios validados', 'Suspensiones por consumo', 'Anotaciones de comportamiento'],
    formula: 'IGR_Sustancias = (0.8 * ReportesFisicos) + (0.2 * ComportamientoAtipico)',
    weight: 7,
    threshold: 70,
    currentValue: 9,
    severity: 'critico',
    interpretation: 'Superar el 70% activa alerta de seguridad escolar e inspección del entorno del plantel.',
    recommendations: ['Taller de prevención con la Policía de Infancia', 'Acompañamiento familiar obligatorio'],
    relatedProtocols: ['PROT-CON (Convivencia Escolar Ley 1620)'],
    mioTriggerEvent: 'student.risk.convivencia'
  },
  {
    code: 'CIE-PRED-008',
    name: 'Riesgo de Embarazo Adolescente',
    category: 'Convivencia y Bienestar',
    type: 'predictivo',
    description: 'Identifica estudiantes propensas a deserción por estado de gestación mediante variables demográficas.',
    objective: 'Garantizar el derecho a la educación de madres adolescentes mediante flexibilidad curricular.',
    variables: ['Inasistencias médicas recurrentes', 'Variables sociodemográficas', 'Petición de apoyo psicosocial'],
    formula: 'IGR_Embarazo = (0.8 * ReportesMedicos) + (0.2 * PeticionApoyo)',
    weight: 5,
    threshold: 60,
    currentValue: 15,
    severity: 'medio',
    interpretation: 'Superar el 60% dispara la asignación de un plan de educación flexible.',
    recommendations: ['Asignación de modalidad flexible / semipresencial', 'Garantía del PAE prioritario para gestantes'],
    relatedProtocols: ['PROT-SALUD (Salud Escolar y Acompañamiento)'],
    mioTriggerEvent: 'student.risk.convivencia'
  },
  {
    code: 'CIE-PRED-009',
    name: 'Riesgo de Trabajo Infantil',
    category: 'Permanencia Escolar',
    type: 'predictivo',
    description: 'Detecta ausentismo cíclico correlacionado con días de mercado o temporadas de cosecha agrícola.',
    objective: 'Erradicar la explotación y el trabajo infantil en el municipio.',
    variables: ['Ausentismo coincidente con días de plaza', 'Variables socioeconómicas del Sisbén', 'Encuestas de bienestar'],
    formula: 'IGR_TrabajoInfantil = (0.8 * CiclodeAusencias) + (0.2 * SisbenBajo)',
    weight: 6,
    threshold: 70,
    currentValue: 19,
    severity: 'alto',
    interpretation: 'Superar el 70% activa el reporte directo a Comisaría de Familia e inspección de cobertura.',
    recommendations: ['Remisión a la Comisaría de Familia', 'Inclusión del núcleo familiar en subsidios del PAE'],
    relatedProtocols: ['PROT-DES (Retención y Permanencia)'],
    mioTriggerEvent: 'student.risk.desercion'
  },
  {
    code: 'CIE-PRED-010',
    name: 'Riesgo de Infraestructura Física',
    category: 'Infraestructura y PAE',
    type: 'predictivo',
    description: 'Predice colapsos en servicios públicos, aulas o comedores escolares según antigüedad de daños reportados.',
    objective: 'Prevenir cierres de planteles por fallos estructurales o sanitarios.',
    variables: ['Reportes del rector en módulo de Infraestructura', 'Antigüedad del reporte sin atender', 'Riesgo de inundación veredal'],
    formula: 'IGR_Infraestructura = (0.5 * AntiguedadReporte) + (0.5 * CriticidadDano)',
    weight: 6,
    threshold: 75,
    currentValue: 58,
    severity: 'medio',
    interpretation: 'Valores > 75% gatillan una alerta técnica crítica e inspección del Ing. de Obras de la Secretaría.',
    recommendations: ['Inspección técnica de urgencia por ingenieros de la SED', 'Asignación de fondos de contingencia'],
    relatedProtocols: ['PROT-INFRA (Plan de Infraestructura y Servicios)'],
    mioTriggerEvent: 'student.risk.infra'
  },
  {
    code: 'CIE-PRED-011',
    name: 'Riesgo del Programa de Alimentación Escolar (PAE)',
    category: 'Infraestructura y PAE',
    type: 'predictivo',
    description: 'Detecta probabilidades de desabastecimiento o fallos sanitarios en el servicio del PAE.',
    objective: 'Garantizar el servicio diario de raciones calientes en las veredas.',
    variables: ['Reportes de alimentos no entregados', 'Alertas sanitarias', 'Retraso de la cadena de suministro'],
    formula: 'IGR_PAE = (0.6 * EntregasFallidas) + (0.4 * AlertasSanitarias)',
    weight: 7,
    threshold: 80,
    currentValue: 85,
    severity: 'critico',
    interpretation: 'Rojo Crítico. Exige envío de circular de sanción y amonestación inmediata al operador del PAE.',
    recommendations: ['Enviar circular oficial de amonestación al operador PAE', 'Inspección técnica al comedor escolar'],
    relatedProtocols: ['PROT-DES (Retención y Permanencia)'],
    mioTriggerEvent: 'student.risk.pae'
  },
  {
    code: 'CIE-PRED-012',
    name: 'Riesgo de Baja Adopción de AulaCore',
    category: 'Transformación Digital',
    type: 'predictivo',
    description: 'Predice el fracaso de la digitalización escolar debido a la baja actividad de docentes y directivos.',
    objective: 'Garantizar el retorno de inversión tecnológica y la madurez digital escolar.',
    variables: ['Registros de asistencia RFID omitidos', 'Cargas de mallas retrasadas', 'Uso de AulaHelp < 15%'],
    formula: 'IGR_Adopcion = 100 - (Porcentaje de uso promedio de módulos)',
    weight: 5,
    threshold: 75,
    currentValue: 35,
    severity: 'medio',
    interpretation: 'Superar el 75% indica abandono del software. Requiere talleres presenciales de capacitación.',
    recommendations: ['Programar capacitación presencial de AulaCore', 'Auditoría de mallas por el Director de Calidad'],
    relatedProtocols: ['PROT-DIG (Plan de Madurez Digital)'],
    mioTriggerEvent: 'student.risk.adoption'
  },
  {
    code: 'CIE-PRED-013',
    name: 'Riesgo Financiero Institucional',
    category: 'Operación y Finanzas',
    type: 'predictivo',
    description: 'Predice déficits financieros por cobro de matrículas tardías o retraso de transferencias nacionales.',
    objective: 'Asegurar la sostenibilidad operativa de las instituciones públicas.',
    variables: ['Legalización de matrículas SIMAT', 'Gastos operativos vs. presupuesto asignado', 'Recursos SGP recibidos'],
    formula: 'IGR_Financiero = (0.8 * DeficitPresupuestal) + (0.2 * RetrasoSIMAT)',
    weight: 4,
    threshold: 80,
    currentValue: 20,
    severity: 'medio',
    interpretation: 'Superar el 80% indica asfixia financiera. Requiere auditoría de fondos y transferencias.',
    recommendations: ['Auditoría contable y de fondos de servicios docentes', 'Comité financiero extraordinario con el Secretario'],
    relatedProtocols: ['PROT-FIN (Sostenibilidad y Auditoría Financiera)'],
    mioTriggerEvent: 'student.risk.financiero'
  },
  {
    code: 'CIE-PRED-014',
    name: 'Riesgo de Disminución de Matrícula',
    category: 'Operación y Finanzas',
    type: 'predictivo',
    description: 'Predice la pérdida de estudiantes matriculados para el próximo ciclo según abandonos e inasistencias.',
    objective: 'Garantizar la estabilidad de las plazas docentes y recursos del SGP.',
    variables: ['Inasistencias RFID', 'Traslados reportados', 'Tasa de reprobación anual'],
    formula: 'IGR_Matricula = (0.7 * TasaReprobacion) + (0.3 * InasistenciasAltas)',
    weight: 4,
    threshold: 75,
    currentValue: 41,
    severity: 'bajo',
    interpretation: 'Indica la tendencia del volumen escolar para el siguiente periodo.',
    recommendations: ['Focalización de matrículas puerta a puerta en veredas', 'Revisión de traslados institucionales'],
    relatedProtocols: ['PROT-DES (Retención y Permanencia)'],
    mioTriggerEvent: 'student.risk.matricula'
  },

  // 2. DESCRIPTIVOS
  {
    code: 'CIE-DESC-001',
    name: 'Matrícula Consolidada Municipal',
    category: 'Permanencia Escolar',
    type: 'descriptivo',
    description: 'Reporta el volumen exacto de alumnos matriculados y activos en el territorio.',
    objective: 'Consolidar la base de datos real del SIMAT del municipio.',
    variables: ['Alumnos registrados', 'Traslados validados'],
    formula: 'TotalMatriculados = Suma de alumnos activos',
    weight: 0,
    threshold: 100,
    currentValue: 92,
    severity: 'bajo',
    interpretation: 'Reporta la cobertura actual en comparación con las proyecciones demográficas.',
    recommendations: ['Mantener actualización semanal del SIMAT'],
    relatedProtocols: []
  },
  {
    code: 'CIE-DESC-002',
    name: 'Tasa de Asistencia RFID Consolidada',
    category: 'Permanencia Escolar',
    type: 'descriptivo',
    description: 'Muestra el porcentaje promedio diario de presencia en aula mediante registros biométricos/RFID.',
    objective: 'Supervisar el ausentismo diario a nivel municipal.',
    variables: ['Marcaciones RFID diarias', 'Matrícula activa'],
    formula: 'TasaAsistencia = (Marcaciones RFID / Alumnos Matriculados) * 100',
    weight: 0,
    threshold: 90,
    currentValue: 88,
    severity: 'bajo',
    interpretation: 'Porcentaje histórico de asistencia diaria.',
    recommendations: ['Revisar funcionamiento de terminales RFID en zonas rurales'],
    relatedProtocols: []
  },

  // 3. DIAGNÓSTICOS
  {
    code: 'CIE-DIAG-001',
    name: 'Brecha Digital de Conectividad',
    category: 'Transformación Digital',
    type: 'diagnostico',
    description: 'Identifica la causa del abandono de herramientas digitales comparando conectividad rural vs urbana.',
    objective: 'Diagnosticar fallos en proyectos de telecomunicaciones de la Secretaría.',
    variables: ['Ancho de banda en sedes principales', 'Reportes de caída de servidor'],
    formula: 'BrechaConectividad = PromedioUrbano - PromedioRural',
    weight: 0,
    threshold: 50,
    currentValue: 65,
    severity: 'alto',
    interpretation: 'Muestra por qué los docentes rurales no cargan notas digitales a tiempo.',
    recommendations: ['Despliegue de red satelital en escuelas de categoría veredal'],
    relatedProtocols: []
  },

  // 4. PRESCRIPTIVOS
  {
    code: 'CIE-PRES-001',
    name: 'Prescripción de Asignación de Recursos PAE',
    category: 'Infraestructura y PAE',
    type: 'prescriptivo',
    description: 'Recomienda la reasignación de raciones alimentarias del PAE según inasistencias registradas.',
    objective: 'Eliminar el desperdicio del PAE y optimizar las finanzas públicas.',
    variables: ['Inasistencias RFID', 'Raciones despachadas', 'Tasa de reprobación'],
    formula: 'AjusteRaciones = RacionesDespachadas - (InasistenciaPromedio * 0.9)',
    weight: 0,
    threshold: 85,
    currentValue: 88,
    severity: 'alto',
    interpretation: 'Recomienda reducir el despacho de alimentos en escuelas rurales y reasignarlas a comedores con sobrepoblación.',
    recommendations: ['Reasignar raciones de excedentes del comedor de vereda El Hatillo a Barbosa principal'],
    relatedProtocols: ['PROT-DES (Retención y Permanencia)'],
    mioTriggerEvent: 'student.risk.pae'
  }
];

export function getCIEIndicators(): CIEIndicator[] {
  if (typeof window === 'undefined') return DEFAULT_INDICATORS;
  
  const saved = sessionStorage.getItem('cie_indicators');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return DEFAULT_INDICATORS;
    }
  }
  
  sessionStorage.setItem('cie_indicators', JSON.stringify(DEFAULT_INDICATORS));
  return DEFAULT_INDICATORS;
}

export function updateCIEIndicator(code: string, updates: Partial<CIEIndicator>): CIEIndicator[] {
  const indicators = getCIEIndicators();
  const index = indicators.findIndex(i => i.code === code);
  
  if (index !== -1) {
    indicators[index] = { ...indicators[index], ...updates };
    
    if (
      updates.currentValue !== undefined && 
      indicators[index].mioTriggerEvent && 
      updates.currentValue >= (updates.threshold || indicators[index].threshold)
    ) {
      triggerMIOFromCIE(indicators[index]);
    }
    
    sessionStorage.setItem('cie_indicators', JSON.stringify(indicators));
  }
  
  return indicators;
}

export function calculateGlobalRiskIndex(): { value: number; label: string; color: string } {
  const indicators = getCIEIndicators().filter(i => i.type === 'predictivo');
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  indicators.forEach(ind => {
    weightedSum += ind.currentValue * (ind.weight / 100);
    totalWeight += ind.weight / 100;
  });
  
  const value = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  
  let label = 'Bajo';
  let color = '#10b981'; // emerald-500
  
  if (value >= 75) {
    label = 'Crítico';
    color = '#ef4444'; // red-500
  } else if (value >= 50) {
    label = 'Alto';
    color = '#f97316'; // orange-500
  } else if (value >= 30) {
    label = 'Moderado';
    color = '#eab308'; // yellow-500
  }
  
  return { value, label, color };
}

export function getCIEHistory(code: string): CIEHistoryPoint[] {
  const indicators = getCIEIndicators();
  const ind = indicators.find(i => i.code === code);
  const baseVal = ind ? ind.currentValue : 30;
  
  return [
    { date: 'Ene 2026', value: Math.max(0, Math.min(100, baseVal - 15)) },
    { date: 'Feb 2026', value: Math.max(0, Math.min(100, baseVal - 8)) },
    { date: 'Mar 2026', value: Math.max(0, Math.min(100, baseVal + 5)) },
    { date: 'Abr 2026', value: Math.max(0, Math.min(100, baseVal - 12)) },
    { date: 'May 2026', value: Math.max(0, Math.min(100, baseVal + 2)) },
    { date: 'Jun 2026', value: baseVal }
  ];
}

function triggerMIOFromCIE(indicator: CIEIndicator) {
  if (typeof window === 'undefined' || !indicator.mioTriggerEvent) return;
  
  const newFolio = Math.floor(Math.random() * 9000) + 1000;
  const newRun = {
    id: `run_${Date.now()}_${indicator.code}`,
    recipeCode: indicator.code.replace('CIE-PRED-', 'R-'),
    recipeName: indicator.name,
    folio: newFolio,
    triggerPayload: { impact: indicator.currentValue, indicatorCode: indicator.code },
    status: 'Exitoso',
    executionHash: 'sha256_' + Math.random().toString(36).substring(2, 10),
    steps: [
      {
        actionType: 'Evaluación CIE',
        status: 'Exitoso',
        details: `CIE detectó que ${indicator.name} alcanzó ${indicator.currentValue}% (Umbral: ${indicator.threshold}%)`,
        executedAt: new Date().toISOString()
      },
      {
        actionType: 'Disparo MIO',
        status: 'Exitoso',
        details: `Despachado evento predictivo ${indicator.mioTriggerEvent} al bus con éxito.`,
        executedAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    userId: '123',
    userRole: 'Secretario de Educación',
    originModule: 'Centro de Inteligencia Educativa (CIE)',
    organizationName: 'Secretaría de Educación de Antioquia',
    durationMs: 8
  };
  
  try {
    const existing = sessionStorage.getItem('mio_runs');
    const runs = existing ? JSON.parse(existing) : [];
    runs.unshift(newRun);
    sessionStorage.setItem('mio_runs', JSON.stringify(runs));
    
    const liveNotify = {
      id: `notify_${Date.now()}`,
      title: `CIE ➔ Evento despachado al MIO`,
      message: `${indicator.name} superó el umbral (${indicator.currentValue}%). Evento ${indicator.mioTriggerEvent} procesado.`,
      type: 'info',
      createdAt: new Date().toISOString()
    };
    
    const existingNotif = sessionStorage.getItem('mio_notifications');
    const notifs = existingNotif ? JSON.parse(existingNotif) : [];
    notifs.unshift(liveNotify);
    sessionStorage.setItem('mio_notifications', JSON.stringify(notifs));
  } catch (e) {
    // Ignorar fallos
  }
}
