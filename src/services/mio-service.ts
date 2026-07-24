'use client';

import { supabase } from '@/lib/supabase';

export const AULACORE_EVENTS = {
  STUDENT_ABSENCE_DETECTED: 'student.absence.detected',
  STUDENT_LOW_PERFORMANCE: 'student.low_performance',
  CAT_ALERT_CREATED: 'cat.alert.created',
  CAT_ALERT_ASSIGNED: 'cat.alert.assigned',
  VISIT_SCHEDULED: 'visit.scheduled',
  VISIT_COMPLETED: 'visit.completed',
  CIRCULAR_SENT: 'circular.sent',
  REPORT_GENERATED: 'report.generated',
  RFID_OFFLINE: 'rfid.offline',
  INTERNET_FAILURE: 'internet.failure',
  INFRASTRUCTURE_REPORTED: 'infrastructure.reported',
  RISK_DESERCION_DETECTED: 'student.risk.desercion',
  RISK_ACADEMIC_DETECTED: 'student.risk.academic',
  RISK_CONVIVENCIA_DETECTED: 'student.risk.convivencia',
  RISK_PAE_DETECTED: 'student.risk.pae',
  RISK_INFRA_DETECTED: 'student.risk.infra'
} as const;

export interface MIOEvent {
  id: string;
  type: string;
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
  recipes: string[];
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

export async function getMIORecipes(): Promise<MIORecipe[]> {
  try {
    const { data, error } = await supabase.from('mio_recipes').select('*');
    if (error || !data) return [];
    return data as MIORecipe[];
  } catch (e) {
    return [];
  }
}

export async function getMIOProtocols(): Promise<MIOProtocol[]> {
  try {
    const { data, error } = await supabase.from('mio_protocols').select('*');
    if (error || !data) return [];
    return data as MIOProtocol[];
  } catch (e) {
    return [];
  }
}

export async function getMIORuns(): Promise<MIORun[]> {
  try {
    const { data, error } = await supabase.from('mio_runs').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as MIORun[];
  } catch (e) {
    return [];
  }
}

export async function getMIOOptimizations(): Promise<MIOOptimizationLog[]> {
  try {
    const { data, error } = await supabase.from('mio_optimizations').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as MIOOptimizationLog[];
  } catch (e) {
    return [];
  }
}

export async function toggleMIORecipe(code: string, active: boolean): Promise<void> {
  await supabase.from('mio_recipes').update({ isActive: active }).eq('code', code);
}

export async function toggleMIOProtocol(code: string, active: boolean): Promise<void> {
  await supabase.from('mio_protocols').update({ isActive: active }).eq('code', code);
}

export async function dispatchMIOEvent(event: MIOEvent): Promise<MIORun[]> {
  // En producción, el backend procesa los eventos. 
  // Esta llamada inserta el evento para ser procesado por edge functions.
  try {
    await supabase.from('mio_events_queue').insert([event]);
    return [];
  } catch (e) {
    console.error('Error dispatching MIO event', e);
    return [];
  }
}

export async function registerRunOutcome(runId: string, outcome: 'exitoso' | 'ineficaz', feedback: string): Promise<void> {
  await supabase.from('mio_runs').update({ outcome, feedback }).eq('id', runId);
}

export async function applyMIOOptimization(id: string): Promise<void> {
  await supabase.from('mio_optimizations').update({ applied: true }).eq('id', id);
}
