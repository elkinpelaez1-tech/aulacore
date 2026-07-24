'use client';

import { supabase } from '@/lib/supabase';
export interface TerritorialAlert {
  id: string;
  alert_code: string;
  scope: 'territorial' | 'escolar';
  severity: 'info' | 'bajo' | 'medio' | 'alto' | 'critico';
  priority: 'urgente' | 'alta' | 'media' | 'baja';
  institution_id: string;
  institution_name: string;
  municipality: string;
  target_id: string;
  target_name: string;
  impact_estimate: number;
  description: string;
  assigned_to: string;
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

export interface TerritorialAlertLog {
  id: string;
  alert_id: string;
  action_taken: string;
  comment: string;
  resolution_time_seconds: number;
  outcome: 'exitoso' | 'ineficaz' | 'neutral' | 'en_progreso';
  evidence_url?: string;
  signed_by: string;
  signature_hash?: string;
  created_at: string;
}

export async function getStoredAlerts(): Promise<TerritorialAlert[]> {
  try {
    const { data, error } = await supabase.from('territorial_alerts').select('*, logs:territorial_alert_logs(*)').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as TerritorialAlert[];
  } catch (e) {
    return [];
  }
}

export function calculatePriority(severity: string, impact: number): 'urgente' | 'alta' | 'media' | 'baja' {
  let severityScore = 1;
  if (severity === 'info') severityScore = 1;
  if (severity === 'bajo') severityScore = 2;
  if (severity === 'medio') severityScore = 3;
  if (severity === 'alto') severityScore = 5;
  if (severity === 'critico') severityScore = 8;

  const totalScore = severityScore * Math.log10((impact || 0) + 1);

  if (totalScore >= 12) return 'urgente';
  if (totalScore >= 6) return 'alta';
  if (totalScore >= 3) return 'media';
  return 'baja';
}

export async function getAlertsByQueue(queue: 'inmediata' | 'seguimiento' | 'tendencias' | 'resueltas'): Promise<TerritorialAlert[]> {
  const alerts = await getStoredAlerts();
  return alerts.filter(alert => {
    switch (queue) {
      case 'inmediata':
        return (alert.severity === 'critico' || alert.severity === 'alto') && 
               (alert.status === 'detectada' || alert.status === 'validada');
      case 'seguimiento':
        return alert.status === 'asignada' || alert.status === 'intervencion' || alert.status === 'seguimiento';
      case 'tendencias':
        return (alert.severity === 'medio' || alert.severity === 'bajo' || alert.severity === 'info') && 
               (alert.status === 'detectada' || alert.status === 'validada');
      case 'resueltas':
        return alert.status === 'resuelta' || alert.status === 'cerrada';
      default:
        return true;
    }
  });
}

export async function transitionAlertStatus(
  alertId: string,
  newStatus: TerritorialAlert['status'],
  comment: string,
  actionTaken: string,
  outcome: 'exitoso' | 'ineficaz' | 'neutral' | 'en_progreso',
  signedBy: string,
  evidenceUrl?: string
): Promise<boolean> {
  try {
    const { error: updateError } = await supabase
      .from('territorial_alerts')
      .update({ status: newStatus })
      .eq('id', alertId);

    if (updateError) return false;

    const log = {
      alert_id: alertId,
      action_taken: actionTaken,
      comment,
      resolution_time_seconds: 0,
      outcome,
      evidence_url: evidenceUrl,
      signed_by: signedBy,
      created_at: new Date().toISOString()
    };

    await supabase.from('territorial_alert_logs').insert([log]);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('territory-alerts-updated'));
    }
    return true;
  } catch (e) {
    return false;
  }
}

export async function assignAlertTo(alertId: string, officerName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('territorial_alerts')
      .update({ assigned_to: officerName, status: 'asignada' })
      .eq('id', alertId);

    if (error) return false;

    const log = {
      alert_id: alertId,
      action_taken: 'Asignación de Funcionario',
      comment: `Asignado a ${officerName}`,
      outcome: 'en_progreso',
      signed_by: 'Sistema',
      created_at: new Date().toISOString()
    };
    await supabase.from('territorial_alert_logs').insert([log]);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('territory-alerts-updated'));
    }
    return true;
  } catch (e) {
    return false;
  }
}
