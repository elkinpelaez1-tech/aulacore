'use client';

import { TerritorialAlert, TerritorialAlertLog, INITIAL_ALERTS } from './territory-mock';

// Local storage session key to persist changes in memory
const ALERTS_SESSION_KEY = 'aulacore_territorial_alerts';

function getStoredAlerts(): TerritorialAlert[] {
  if (typeof window === 'undefined') return INITIAL_ALERTS;
  const stored = sessionStorage.getItem(ALERTS_SESSION_KEY);
  if (!stored) {
    sessionStorage.setItem(ALERTS_SESSION_KEY, JSON.stringify(INITIAL_ALERTS));
    return INITIAL_ALERTS;
  }
  return JSON.parse(stored);
}

function saveStoredAlerts(alerts: TerritorialAlert[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ALERTS_SESSION_KEY, JSON.stringify(alerts));
  // Dispatch custom event to notify components in real time
  window.dispatchEvent(new Event('territory-alerts-updated'));
}

/**
 * Motor de Priorización Inteligente
 * Regla de negocio para calcular la prioridad en base a la severidad del tipo de alerta y la dimensión del impacto.
 */
export function calculatePriority(severity: string, impact: number): 'urgente' | 'alta' | 'media' | 'baja' {
  let severityScore = 1;
  if (severity === 'info') severityScore = 1;
  if (severity === 'bajo') severityScore = 2;
  if (severity === 'medio') severityScore = 3;
  if (severity === 'alto') severityScore = 5;
  if (severity === 'critico') severityScore = 8;

  const totalScore = severityScore * Math.log10(impact + 1);

  if (totalScore >= 12) return 'urgente';
  if (totalScore >= 6) return 'alta';
  if (totalScore >= 3) return 'media';
  return 'baja';
}

/**
 * Obtener alertas agrupadas por bandejas operativas
 */
export function getAlertsByQueue(queue: 'inmediata' | 'seguimiento' | 'tendencias' | 'resueltas'): TerritorialAlert[] {
  const alerts = getStoredAlerts();
  return alerts.filter(alert => {
    switch (queue) {
      case 'inmediata':
        // Críticas y Altas en estados iniciales
        return (alert.severity === 'critico' || alert.severity === 'alto') && 
               (alert.status === 'detectada' || alert.status === 'validada');
      case 'seguimiento':
        // Alertas activamente asignadas o intervenidas
        return alert.status === 'asignada' || alert.status === 'intervencion' || alert.status === 'seguimiento';
      case 'tendencias':
        // Alertas informativas, bajas o medias pendientes de atención
        return (alert.severity === 'medio' || alert.severity === 'bajo' || alert.severity === 'info') && 
               (alert.status === 'detectada' || alert.status === 'validada');
      case 'resueltas':
        // Histórico de resueltas y cerradas
        return alert.status === 'resuelta' || alert.status === 'cerrada';
      default:
        return true;
    }
  });
}

/**
 * Transicionar el estado de una alerta registrando un log inmutable y estructurado para entrenamiento de IA
 */
export function transitionAlertStatus(
  alertId: string,
  newStatus: TerritorialAlert['status'],
  comment: string,
  actionTaken: string,
  outcome: 'exitoso' | 'ineficaz' | 'neutral' | 'en_progreso',
  signedBy: string,
  evidenceUrl?: string
): boolean {
  const alerts = getStoredAlerts();
  const alertIndex = alerts.findIndex(a => a.id === alertId);
  if (alertIndex === -1) return false;

  const alert = alerts[alertIndex];
  
  // Calcular segundos de resolución desde el último hito
  const lastLog = alert.logs[alert.logs.length - 1];
  const lastTime = lastLog ? new Date(lastLog.created_at).getTime() : new Date(alert.created_at).getTime();
  const currentTime = Date.now();
  const resolutionTimeSeconds = Math.max(0, Math.floor((currentTime - lastTime) / 1000));

  // Generar firma digital/hash inmutable (simulada criptográficamente)
  const concatString = `${alertId}-${newStatus}-${actionTaken}-${outcome}-${signedBy}-${currentTime}`;
  let hash = 0;
  for (let i = 0; i < concatString.length; i++) {
    hash = (hash << 5) - hash + concatString.charCodeAt(i);
    hash |= 0;
  }
  const signatureHash = `hash-${Math.abs(hash).toString(16)}`;

  const newLog: TerritorialAlertLog = {
    id: `log-${Date.now()}`,
    alert_id: alertId,
    action_taken: actionTaken,
    comment,
    resolution_time_seconds: resolutionTimeSeconds,
    outcome,
    evidence_url: evidenceUrl,
    signed_by: signedBy,
    signature_hash: signatureHash,
    created_at: new Date().toISOString()
  };

  alert.status = newStatus;
  alert.logs.push(newLog);

  // Si la alerta pasa a resuelta o cerrada, actualizar metadatos finales
  if (newStatus === 'resuelta' || newStatus === 'cerrada') {
    // La reasistencia RFID o KPIs se simulan como solucionados
    if (alert.alert_code === 'PER-001') {
      alert.metadata.kpis['Ausentismo Promedio'] = '6.2% (Normal)';
    }
  }

  saveStoredAlerts(alerts);
  return true;
}

/**
 * Asignar responsable a una alerta
 */
export function assignAlertTo(alertId: string, officerName: string): boolean {
  const alerts = getStoredAlerts();
  const alert = alerts.find(a => a.id === alertId);
  if (!alert) return false;

  alert.assigned_to = officerName;
  alert.status = 'asignada';

  // Añadir registro de asignación al timeline
  const newLog: TerritorialAlertLog = {
    id: `log-${Date.now()}`,
    alert_id: alertId,
    action_taken: 'Asignación de Funcionario',
    comment: `Asignado oficialmente a ${officerName} para inicio de protocolo de campo.`,
    resolution_time_seconds: 0,
    outcome: 'en_progreso',
    signed_by: 'Secretario de Educación',
    signature_hash: `hash-assign-${Date.now().toString(16)}`,
    created_at: new Date().toISOString()
  };
  
  alert.logs.push(newLog);
  saveStoredAlerts(alerts);
  return true;
}
