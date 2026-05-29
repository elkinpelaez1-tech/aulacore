export type RiskLevel = 'Alto' | 'Medio' | 'Saludable';

export interface CourseHeatmapData {
  id: string;
  name: string;
  level: string; // 'Preescolar' | 'Primaria' | 'Bachillerato'
  gpa: number;
  attendance: number;
  behaviorScore: number;
  aiRisk: RiskLevel;
  activeAlerts: number;
  overallRisk: RiskLevel;
}

export interface PredictiveAlert {
  id: string;
  studentName: string;
  courseName: string;
  riskType: 'Deserción' | 'Académico' | 'Convivencia';
  probability: number;
  reason: string;
  date: string;
}

export interface LiveAlert {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  category: 'Academica' | 'Convivencia' | 'Asistencia' | 'Docente' | 'Institucional';
  urgency: 'Alta' | 'Media' | 'Baja';
}

export const HEATMAP_DATA: CourseHeatmapData[] = [
  // Preescolar
  { id: 'c1', name: 'Transición A', level: 'Preescolar', gpa: 4.5, attendance: 95, behaviorScore: 98, aiRisk: 'Saludable', activeAlerts: 0, overallRisk: 'Saludable' },
  { id: 'c2', name: 'Jardín B', level: 'Preescolar', gpa: 4.2, attendance: 88, behaviorScore: 90, aiRisk: 'Medio', activeAlerts: 2, overallRisk: 'Medio' },
  { id: 'c3', name: 'Párvulos', level: 'Preescolar', gpa: 4.6, attendance: 96, behaviorScore: 99, aiRisk: 'Saludable', activeAlerts: 0, overallRisk: 'Saludable' },
  
  // Primaria
  { id: 'c4', name: '3-A', level: 'Primaria', gpa: 4.3, attendance: 94, behaviorScore: 92, aiRisk: 'Saludable', activeAlerts: 1, overallRisk: 'Saludable' },
  { id: 'c5', name: '4-B', level: 'Primaria', gpa: 3.1, attendance: 82, behaviorScore: 75, aiRisk: 'Alto', activeAlerts: 8, overallRisk: 'Alto' },
  { id: 'c6', name: '5-A', level: 'Primaria', gpa: 3.6, attendance: 89, behaviorScore: 85, aiRisk: 'Medio', activeAlerts: 4, overallRisk: 'Medio' },
  { id: 'c7', name: '5-B', level: 'Primaria', gpa: 4.1, attendance: 92, behaviorScore: 90, aiRisk: 'Saludable', activeAlerts: 1, overallRisk: 'Saludable' },

  // Bachillerato
  { id: 'c8', name: '8-A', level: 'Bachillerato', gpa: 3.5, attendance: 87, behaviorScore: 82, aiRisk: 'Medio', activeAlerts: 5, overallRisk: 'Medio' },
  { id: 'c9', name: '9-B', level: 'Bachillerato', gpa: 2.8, attendance: 75, behaviorScore: 68, aiRisk: 'Alto', activeAlerts: 12, overallRisk: 'Alto' },
  { id: 'c10', name: '10-A', level: 'Bachillerato', gpa: 3.4, attendance: 82, behaviorScore: 78, aiRisk: 'Alto', activeAlerts: 9, overallRisk: 'Alto' },
  { id: 'c11', name: '11-B', level: 'Bachillerato', gpa: 4.4, attendance: 94, behaviorScore: 95, aiRisk: 'Saludable', activeAlerts: 2, overallRisk: 'Saludable' },
];

export const PREDICTIVE_ALERTS: PredictiveAlert[] = [
  { id: 'pa1', studentName: 'Sofía Ramírez', courseName: '9-B', riskType: 'Deserción', probability: 85, reason: 'Ausentismo recurrente (>20%) y 3 materias perdidas.', date: 'Hoy' },
  { id: 'pa2', studentName: 'Mateo López', courseName: '10-A', riskType: 'Académico', probability: 92, reason: 'Caída de GPA del 25% en las últimas 4 semanas.', date: 'Hoy' },
  { id: 'pa3', studentName: 'Laura Cortés', courseName: '4-B', riskType: 'Convivencia', probability: 78, reason: 'Patrón escalado de observaciones disciplinarias.', date: 'Ayer' },
];

export const LIVE_ALERTS: LiveAlert[] = [
  { id: 'la1', title: 'Caída de asistencia general', description: 'El curso 10-A registra un 18% de evasión en la primera franja.', timeAgo: 'Hace 10 min', category: 'Asistencia', urgency: 'Alta' },
  { id: 'la2', title: 'Cierre de notas atrasado', description: '3 docentes no han subido calificaciones del P3 en Primaria.', timeAgo: 'Hace 45 min', category: 'Docente', urgency: 'Media' },
  { id: 'la3', title: 'Reincidencia convivencial', description: 'Andrés Gómez (8-A) acumula su tercera alerta grave del mes.', timeAgo: 'Hace 2 hrs', category: 'Convivencia', urgency: 'Alta' },
  { id: 'la4', title: 'Bajo promedio institucional', description: 'Matemáticas en 9-B promedia 2.8 (umbral de crisis: 3.0).', timeAgo: 'Hace 5 hrs', category: 'Academica', urgency: 'Media' },
];

export const ALERT_KPIS = {
  openAlerts: 48,
  highRiskCases: 12,
  activeInterventions: 35,
  potentialDropouts: 15,
  breakdown: {
    preescolar: 3,
    primaria: 18,
    bachillerato: 27
  }
};
