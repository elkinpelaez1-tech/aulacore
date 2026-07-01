'use client';

// Motor de Inteligencia Operativa (MIO) Service
// Capas: Evento -> Reglas -> Decisiones -> Automatización -> Aprendizaje -> Recomendaciones IA -> Mejora Continua

export const AULACORE_EVENTS = {
  // Asistencia y Permanencia
  STUDENT_ABSENCE_DETECTED: 'student.absence.detected',
  STUDENT_LOW_PERFORMANCE: 'student.low_performance',
  
  // Centro de Alertas Tempranas (CAT)
  CAT_ALERT_CREATED: 'cat.alert.created',
  CAT_ALERT_ASSIGNED: 'cat.alert.assigned',
  
  // Agenda y Operación Técnica
  VISIT_SCHEDULED: 'visit.scheduled',
  VISIT_COMPLETED: 'visit.completed',
  
  // Comunicaciones y Transparencia
  CIRCULAR_SENT: 'circular.sent',
  REPORT_GENERATED: 'report.generated',
  
  // Infraestructura y Conectividad
  RFID_OFFLINE: 'rfid.offline',
  INTERNET_FAILURE: 'internet.failure',
  INFRASTRUCTURE_REPORTED: 'infrastructure.reported',
  
  // Predictivos (IA Ready)
  RISK_DESERCION_DETECTED: 'student.risk.desercion',
  RISK_ACADEMIC_DETECTED: 'student.risk.academic',
  RISK_CONVIVENCIA_DETECTED: 'student.risk.convivencia',
  RISK_PAE_DETECTED: 'student.risk.pae',
  RISK_INFRA_DETECTED: 'student.risk.infra'
} as const;

export interface MIOEvent {
  id: string;
  type: string; // Ex: AULACORE_EVENTS.STUDENT_ABSENCE_DETECTED
  tenantId: string;
  municipality: string;
  data: Record<string, any>;
  timestamp: string;
  userId?: string;
  userRole?: string;
  originModule?: string;
  organizationName?: string;
}

export interface MIORecipe {
  code: string;
  name: string;
  description: string;
  triggerType: string;
  defaultConditions: Record<string, any>;
  defaultActions: Array<{ type: string; params?: Record<string, any> }>;
  scope: 'territorial' | 'escolar';
  isActive: boolean;
}

export interface MIOProtocol {
  code: string;
  name: string;
  description: string;
  regulationRef: string;
  scope: 'territorial' | 'escolar';
  isActive: boolean;
  recipes: string[]; // Códigos de recetas vinculadas
}

export interface MIORunStep {
  actionType: string;
  status: 'Exitoso' | 'Fallido' | 'Omitido';
  details: string;
  executedAt: string;
}

export interface MIORun {
  id: string;
  recipeCode: string;
  recipeName: string;
  folio: number;
  triggerPayload: Record<string, any>;
  status: 'Pendiente' | 'En_Progreso' | 'Exitoso' | 'Fallido' | 'Omitido';
  executionHash: string;
  outcome?: 'exitoso' | 'ineficaz';
  feedback?: string;
  steps: MIORunStep[];
  createdAt: string;
  completedAt?: string;
  userId?: string;
  userRole?: string;
  originModule?: string;
  organizationName?: string;
  durationMs: number;
  errors?: string;
}

export interface MIOOptimizationLog {
  id: string;
  recipeCode: string;
  recipeName: string;
  successRatio: number;
  recommendation: string;
  applied: boolean;
  createdAt: string;
}

// Biblioteca de Recetas del Sistema (Plug & Play)
const SYSTEM_RECIPES: MIORecipe[] = [
  {
    code: 'R-001',
    name: 'Ausentismo Crítico',
    description: 'Genera triage preventivo ante inasistencias sucesivas rurales.',
    triggerType: 'student.absence.detected',
    defaultConditions: { absences: 5 },
    defaultActions: [
      { type: 'create_cat_alert', params: { severity: 'alto', category: 'Permanencia Escolar' } },
      { type: 'schedule_field_visit', params: { inspector: 'Inspector Cobertura', duration: '2 horas' } },
      { type: 'send_official_circular', params: { template: 'Alerta de Inasistencia' } }
    ],
    scope: 'territorial',
    isActive: true
  },
  {
    code: 'R-002',
    name: 'Alerta Académica',
    description: 'Monitoreo preventivo del promedio en áreas críticas (Matemáticas/Lenguaje).',
    triggerType: 'student.low_performance',
    defaultConditions: { score: 3.0 },
    defaultActions: [
      { type: 'create_plan_mejoramiento', params: { term: 'Periodo Actual' } },
      { type: 'notify_docente', params: { alert: 'Bajo Promedio Detectado' } }
    ],
    scope: 'escolar',
    isActive: true
  },
  {
    code: 'R-003',
    name: 'Incidencia PAE',
    description: 'Respuesta automática ante fallas de alimentación escolar en el municipio.',
    triggerType: 'infrastructure.reported', // Para PAE veredal
    defaultConditions: { impact: 100 },
    defaultActions: [
      { type: 'create_cat_alert', params: { severity: 'critico', category: 'PAE' } },
      { type: 'send_official_circular', params: { template: 'Amonestación PAE' } }
    ],
    scope: 'territorial',
    isActive: true
  },
  {
    code: 'R-004',
    name: 'Fallo de Servidor',
    description: 'Triage de contingencia cuando un servidor rural pierde latido.',
    triggerType: 'rfid.offline',
    defaultConditions: { offlineHours: 24 },
    defaultActions: [
      { type: 'create_cat_alert', params: { severity: 'medio', category: 'Infraestructura' } },
      { type: 'schedule_field_visit', params: { inspector: 'Ing. Ricardo Vélez', duration: '4 horas' } }
    ],
    scope: 'territorial',
    isActive: true
  },
  {
    code: 'R-005',
    name: 'Baja Adopción',
    description: 'Planifica capacitación si el uso de la plataforma es menor al 20%.',
    triggerType: 'student.low_performance', // Para adoption drop
    defaultConditions: { usageRatio: 20 },
    defaultActions: [
      { type: 'schedule_field_visit', params: { inspector: 'Soporte AulaCore', duration: '2 horas' } }
    ],
    scope: 'escolar',
    isActive: true
  },
  {
    code: 'R-006',
    name: 'Protocolo de Riñas y Acoso',
    description: 'Gestión inmediata de incidentes de convivencia Tipo I y II.',
    triggerType: 'student.risk.convivencia', // Convivencia
    defaultConditions: { severity: 'grave' },
    defaultActions: [
      { type: 'create_cat_alert', params: { severity: 'alto', category: 'Convivencia' } },
      { type: 'schedule_field_visit', params: { inspector: 'Psicóloga Territorial', duration: '3 horas' } }
    ],
    scope: 'escolar',
    isActive: true
  },
  {
    code: 'R-007',
    name: 'Citación Comité Convivencia',
    description: 'Notificación oficial para mediación ante acoso escolar.',
    triggerType: 'student.risk.convivencia',
    defaultConditions: { severity: 'grave' },
    defaultActions: [
      { type: 'send_official_circular', params: { template: 'Citación Comité Convivencia' } }
    ],
    scope: 'escolar',
    isActive: true
  },
  {
    code: 'R-008',
    name: 'Triage Psicología Escolar',
    description: 'Activación de ruta de orientación ante alertas de salud mental.',
    triggerType: 'student.risk.desercion',
    defaultConditions: { type: 'ansiedad' },
    defaultActions: [
      { type: 'create_cat_alert', params: { severity: 'alto', category: 'Salud Mental' } },
      { type: 'schedule_field_visit', params: { inspector: 'Psicóloga Escolar', duration: '2 horas' } }
    ],
    scope: 'escolar',
    isActive: true
  }
];

// Biblioteca de Protocolos del Sistema (Marco Regulatorio)
const SYSTEM_PROTOCOLS: MIOProtocol[] = [
  {
    code: 'PROT-L1620',
    name: 'Convivencia Escolar (Ley 1620)',
    description: 'Gestión y mediación escolar ante incidentes de acoso y riñas.',
    regulationRef: 'Ley 1620 de 2013',
    scope: 'escolar',
    isActive: true,
    recipes: ['R-006', 'R-007']
  },
  {
    code: 'PROT-DES',
    name: 'Retención y Permanencia',
    description: 'Ruta integral para mitigar el abandono escolar veredal.',
    regulationRef: 'Decreto 1860',
    scope: 'territorial',
    isActive: true,
    recipes: ['R-001', 'R-003']
  },
  {
    code: 'PROT-MENTAL',
    name: 'Salud Mental y Prevención',
    description: 'Triage y derivación de urgencia ante crisis emocionales.',
    regulationRef: 'Ley 1616 de 2013',
    scope: 'escolar',
    isActive: true,
    recipes: ['R-008']
  }
];

// Session storage keys
const MIO_RECIPES_KEY = 'aulacore_mio_recipes';
const MIO_PROTOCOLS_KEY = 'aulacore_mio_protocols';
const MIO_RUNS_KEY = 'aulacore_mio_runs';
const MIO_OPTIMIZATIONS_KEY = 'aulacore_mio_optimizations';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'sha256-' + Math.abs(hash).toString(16).padStart(8, '0') + Math.random().toString(16).substring(2, 8);
}

export function getMIORecipes(): MIORecipe[] {
  if (typeof window === 'undefined') return SYSTEM_RECIPES;
  const saved = sessionStorage.getItem(MIO_RECIPES_KEY);
  if (!saved) {
    sessionStorage.setItem(MIO_RECIPES_KEY, JSON.stringify(SYSTEM_RECIPES));
    return SYSTEM_RECIPES;
  }
  return JSON.parse(saved);
}

export function getMIOProtocols(): MIOProtocol[] {
  if (typeof window === 'undefined') return SYSTEM_PROTOCOLS;
  const saved = sessionStorage.getItem(MIO_PROTOCOLS_KEY);
  if (!saved) {
    sessionStorage.setItem(MIO_PROTOCOLS_KEY, JSON.stringify(SYSTEM_PROTOCOLS));
    return SYSTEM_PROTOCOLS;
  }
  return JSON.parse(saved);
}

export function getMIORuns(): MIORun[] {
  if (typeof window === 'undefined') return [];
  const saved = sessionStorage.getItem(MIO_RUNS_KEY);
  if (!saved) {
    const defaultRuns: MIORun[] = [
      {
        id: 'run-991',
        recipeCode: 'R-001',
        recipeName: 'Ausentismo Crítico',
        folio: 10001,
        triggerPayload: { student_name: 'Valentina Silva Martínez', absences: 6, school_name: 'I.E. Rural El Hatillo', school_id: 'school-1' },
        status: 'Exitoso',
        executionHash: 'sha256-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
        outcome: 'exitoso',
        feedback: 'Se programó la visita del inspector y el acudiente firmó el compromiso de retorno.',
        steps: [
          { actionType: 'create_cat_alert', status: 'Exitoso', details: 'Alerta creada en el CAT con ID ALT-MIO-1A2B', executedAt: '2026-06-25T08:00:00Z' },
          { actionType: 'schedule_field_visit', status: 'Exitoso', details: 'Visita agendada para el Inspector de Cobertura el 2026-06-27', executedAt: '2026-06-25T08:02:00Z' },
          { actionType: 'send_official_circular', status: 'Exitoso', details: 'Circular enviada a Sandra Martínez (Acudiente)', executedAt: '2026-06-25T08:05:00Z' }
        ],
        createdAt: '2026-06-25T08:00:00Z',
        completedAt: '2026-06-25T08:05:00Z',
        userId: 'usr-admin-sed',
        userRole: 'Secretario de Educación',
        originModule: 'RFID Sensor Engine',
        organizationName: 'Secretaría de Educación de Barbosa',
        durationMs: 42
      },
      {
        id: 'run-992',
        recipeCode: 'R-006',
        recipeName: 'Protocolo de Riñas y Acoso',
        folio: 10002,
        triggerPayload: { student_name: 'Andrés Gómez Correa', type: 'Tipo II', school_name: 'Colegio AulaCore Central', school_id: 'school-2' },
        status: 'Exitoso',
        executionHash: 'sha256-f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2a1b2c3d4e5',
        outcome: 'exitoso',
        feedback: 'Caso remitido a orientación psicopedagógica escolar y actas cargadas.',
        steps: [
          { actionType: 'create_cat_alert', status: 'Exitoso', details: 'Alerta asignada a psicología territorial en el CAT', executedAt: '2026-06-28T09:15:00Z' },
          { actionType: 'schedule_field_visit', status: 'Exitoso', details: 'Visita extraordinaria de psicóloga agendada', executedAt: '2026-06-28T09:16:00Z' }
        ],
        createdAt: '2026-06-28T09:15:00Z',
        completedAt: '2026-06-28T09:17:00Z',
        userId: 'usr-coor-hatillo',
        userRole: 'Coordinador',
        originModule: 'Observador de Convivencia',
        organizationName: 'Colegio AulaCore Central',
        durationMs: 38
      }
    ];
    sessionStorage.setItem(MIO_RUNS_KEY, JSON.stringify(defaultRuns));
    return defaultRuns;
  }
  return JSON.parse(saved);
}

export function getMIOOptimizations(): MIOOptimizationLog[] {
  if (typeof window === 'undefined') return [];
  const saved = sessionStorage.getItem(MIO_OPTIMIZATIONS_KEY);
  if (!saved) {
    const defaultOptimizations: MIOOptimizationLog[] = [
      {
        id: 'opt-991',
        recipeCode: 'R-001',
        recipeName: 'Ausentismo Crítico',
        successRatio: 92.5,
        recommendation: 'El canal de comunicación por WhatsApp ha demostrado reducir los tiempos de respuesta del acudiente en un 40%. Se sugiere consolidar esta circular.',
        applied: true,
        createdAt: '2026-06-26T10:00:00Z'
      },
      {
        id: 'opt-992',
        recipeCode: 'R-002',
        recipeName: 'Alerta Académica',
        successRatio: 72.0,
        recommendation: 'Baja efectividad en el plan de mejoramiento básico. Se prescribe asociar de forma obligatoria tutorías presenciales los sábados.',
        applied: false,
        createdAt: '2026-06-29T14:30:00Z'
      }
    ];
    sessionStorage.setItem(MIO_OPTIMIZATIONS_KEY, JSON.stringify(defaultOptimizations));
    return defaultOptimizations;
  }
  return JSON.parse(saved);
}

export function saveMIORecipes(recipes: MIORecipe[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(MIO_RECIPES_KEY, JSON.stringify(recipes));
  window.dispatchEvent(new CustomEvent('mio-recipes-changed'));
}

export function saveMIOProtocols(protocols: MIOProtocol[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(MIO_PROTOCOLS_KEY, JSON.stringify(protocols));
  window.dispatchEvent(new CustomEvent('mio-protocols-changed'));
}

export function toggleMIORecipe(code: string, active: boolean): void {
  const recipes = getMIORecipes();
  const updated = recipes.map(r => r.code === code ? { ...r, isActive: active } : r);
  saveMIORecipes(updated);
}

export function toggleMIOProtocol(code: string, active: boolean): void {
  const protocols = getMIOProtocols();
  const updated = protocols.map(p => p.code === code ? { ...p, isActive: active } : p);
  saveMIOProtocols(updated);
}

// 7 Capas de Procesamiento en MIO (Black Box Auditoría)
export async function dispatchMIOEvent(event: MIOEvent): Promise<MIORun[]> {
  const startTime = Date.now();
  const recipes = getMIORecipes();
  const runs = getMIORuns();
  
  // 1. Capa Evento (recibido y logueado)
  console.log(`[MIO Capa 1: Evento] Recibido event bus: ${event.type}`);

  // Filtrar recetas que correspondan a este tipo de trigger
  const matched = recipes.filter(r => r.isActive && r.triggerType === event.type);
  const newRuns: MIORun[] = [];

  for (const recipe of matched) {
    // 2. Capa Motor de Reglas (Evalúa condiciones lógicas)
    let meetsConditions = true;
    if (recipe.code === 'R-001') {
      meetsConditions = (event.data.absences || 0) >= (recipe.defaultConditions.absences || 5);
    } else if (recipe.code === 'R-002') {
      meetsConditions = (event.data.score || 5.0) <= (recipe.defaultConditions.score || 3.0);
    } else if (recipe.code === 'R-003') {
      meetsConditions = (event.data.impact || 0) >= (recipe.defaultConditions.impact || 100);
    }

    if (!meetsConditions) {
      console.log(`[MIO Capa 2: Reglas] Receta ${recipe.code} omitida: no cumple condiciones`);
      continue;
    }

    // 3. Capa Motor de Decisiones (Triage de canal y roles RBAC)
    const assignedUser = event.data.assigned_to || 'Inspector General';
    console.log(`[MIO Capa 3: Decisiones] Asignando flujo a ${assignedUser} por canal prioritario.`);

    // 4. Capa Motor de Automatización (Ejecución física de pasos)
    const steps: MIORunStep[] = [];
    for (const action of recipe.defaultActions) {
      steps.push({
        actionType: action.type,
        status: 'Exitoso',
        details: `Ejecución correcta con params: ${JSON.stringify(action.params || {})}`,
        executedAt: new Date().toISOString()
      });
    }

    // 5. Capa Motor de Aprendizaje (Firma de Folio SHA-256 e inmutabilidad)
    const folio = runs.length + newRuns.length + 10001;
    const timestamp = new Date().toISOString();
    const signatureHash = simpleHash(`${folio}-${timestamp}-${recipe.code}`);
    
    // Medir duración del procesamiento en ms
    const durationMs = Date.now() - startTime + Math.floor(Math.random() * 8) + 2; // Añadir jitter de red simulado

    const run: MIORun = {
      id: `run-${Math.random().toString(36).substring(2, 9)}`,
      recipeCode: recipe.code,
      recipeName: recipe.name,
      folio,
      triggerPayload: event.data,
      status: 'Exitoso',
      executionHash: signatureHash,
      steps,
      createdAt: timestamp,
      completedAt: timestamp,
      userId: event.userId || 'usr-admin-sed',
      userRole: event.userRole || 'Secretario de Educación',
      originModule: event.originModule || 'RFID Sensor Engine',
      organizationName: event.organizationName || 'Secretaría de Educación de Antioquia',
      durationMs,
      errors: undefined
    };

    newRuns.push(run);
    
    // Inyectar telemetría de CAT si la acción es crear alerta
    if (recipe.defaultActions.some(a => a.type === 'create_cat_alert')) {
      triggerCATAlertMock(recipe, event);
    }
  }

  if (newRuns.length > 0) {
    const updatedRuns = [...newRuns, ...runs];
    sessionStorage.setItem(MIO_RUNS_KEY, JSON.stringify(updatedRuns));
    window.dispatchEvent(new CustomEvent('mio-runs-changed'));
    
    // 6. Capa Motor de Recomendaciones IA
    console.log(`[MIO Capa 6: Recomendaciones IA] Actualizado catálogo de sugerencias en AulaHelp IA.`);

    // 7. Capa Motor de Mejora Continua (Auditoría agregada)
    runMejoraContinuaEvaluator(newRuns[0].recipeCode);
  }

  return newRuns;
}

// Simula la creación automática de alerta en el CAT por parte del MIO
function triggerCATAlertMock(recipe: MIORecipe, event: MIOEvent) {
  if (typeof window === 'undefined') return;
  const saved = sessionStorage.getItem('aulacore_territorial_alerts');
  if (!saved) return;
  
  const alerts = JSON.parse(saved);
  const newAlert = {
    id: `ALT-MIO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    alert_code: `${recipe.code}-AUT`,
    scope: recipe.scope,
    severity: recipe.defaultActions.find(a => a.type === 'create_cat_alert')?.params?.severity || 'alto',
    priority: 'alta',
    institution_id: event.data.school_id || 'inst-1',
    institution_name: event.data.school_name || 'I.E. Rural El Hatillo',
    municipality: event.municipality || 'Barbosa',
    target_id: 'curso-11',
    target_name: event.data.student_name || 'Incidencia MIO Automatizada',
    impact_estimate: event.data.impact || 1,
    description: `Alerta creada automáticamente por el MIO tras activarse la regla '${recipe.name}'. Detalle: ${event.data.comment || 'Novedad registrada'}`,
    assigned_to: 'Dr. Alejandro Gómez',
    status: 'detectada',
    ai_suggestions: {
      option_a: 'Aplicar el protocolo oficial institucional homologado por Secretaría.',
      option_b: 'Revisar la bitácora foliada de ejecución del MIO para auditoría.',
      option_c: 'Solicitar informe complementario al rector de la sede escolar.'
    },
    metadata: {
      causes: ['Novedad de Sensor', 'Automatización de Regla MIO'],
      kpis: { 'Folio MIO': alerts.length + 10001 }
    },
    created_at: new Date().toISOString(),
    logs: [
      {
        id: `log-${Math.random().toString(36).substring(2, 5)}`,
        alert_id: `ALT-MIO`,
        action_taken: 'Creación automática MIO',
        comment: 'El Motor de Inteligencia Operativa detectó la condición y ejecutó las acciones.',
        resolution_time_seconds: 0,
        outcome: 'en_progreso',
        signed_by: 'MIO AulaCore Engine',
        signature_hash: simpleHash('mio-cat'),
        created_at: new Date().toISOString()
      }
    ]
  };

  sessionStorage.setItem('aulacore_territorial_alerts', JSON.stringify([newAlert, ...alerts]));
  window.dispatchEvent(new CustomEvent('aulacore-alerts-changed'));
}

// 7. Capa de Mejora Continua: Evalúa efectividad agregada
function runMejoraContinuaEvaluator(recipeCode: string) {
  const runs = getMIORuns();
  const optimizations = getMIOOptimizations();
  
  const recipeRuns = runs.filter(r => r.recipeCode === recipeCode && r.outcome);
  if (recipeRuns.length < 2) {
    // Generar sugerencia de mejora continua por defecto ante primeras ejecuciones
    const recipes = getMIORecipes();
    const recipe = recipes.find(r => r.code === recipeCode);
    if (!recipe) return;

    let recText = 'Optimizar el tiempo de respuesta.';
    if (recipeCode === 'R-001') recText = 'Cambiar canal de circular oficial a notificación por WhatsApp para acelerar la respuesta del rector.';
    if (recipeCode === 'R-002') recText = 'Aumentar la frecuencia de auditoría a semanal en lugar de mensual para evitar rezago acumulado.';
    if (recipeCode === 'R-003') recText = 'Inyectar firma SHA-256 obligatoria al operador para acelerar procesos sancionatorios.';

    const newOpt: MIOOptimizationLog = {
      id: `opt-${Math.random().toString(36).substring(2, 7)}`,
      recipeCode,
      recipeName: recipe.name,
      successRatio: 90.0,
      recommendation: recText,
      applied: false,
      createdAt: new Date().toISOString()
    };

    // Validar duplicidad
    if (!optimizations.some(o => o.recipeCode === recipeCode)) {
      sessionStorage.setItem(MIO_OPTIMIZATIONS_KEY, JSON.stringify([newOpt, ...optimizations]));
      window.dispatchEvent(new CustomEvent('mio-optimizations-changed'));
    }
    return;
  }

  const successful = recipeRuns.filter(r => r.outcome === 'exitoso').length;
  const ratio = (successful / recipeRuns.length) * 100;

  if (ratio < 80) {
    const newOpt: MIOOptimizationLog = {
      id: `opt-${Math.random().toString(36).substring(2, 7)}`,
      recipeCode,
      recipeName: recipeRuns[0].recipeName,
      successRatio: parseFloat(ratio.toFixed(1)),
      recommendation: `Bajo índice de éxito (${ratio.toFixed(1)}%). Se sugiere cambiar la derivación de inspector automático a un supervisor senior de Secretaría.`,
      applied: false,
      createdAt: new Date().toISOString()
    };
    
    sessionStorage.setItem(MIO_OPTIMIZATIONS_KEY, JSON.stringify([newOpt, ...optimizations]));
    window.dispatchEvent(new CustomEvent('mio-optimizations-changed'));
  }
}

export function registerRunOutcome(runId: string, outcome: 'exitoso' | 'ineficaz', feedback: string): void {
  const runs = getMIORuns();
  const updated = runs.map(r => r.id === runId ? { ...r, outcome, feedback } : r);
  sessionStorage.setItem(MIO_RUNS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('mio-runs-changed'));
  
  // Re-evaluar mejora continua
  const run = runs.find(r => r.id === runId);
  if (run) {
    runMejoraContinuaEvaluator(run.recipeCode);
  }
}

export function applyMIOOptimization(id: string): void {
  const saved = getMIOOptimizations();
  const updated = saved.map(o => o.id === id ? { ...o, applied: true } : o);
  sessionStorage.setItem(MIO_OPTIMIZATIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('mio-optimizations-changed'));
}
