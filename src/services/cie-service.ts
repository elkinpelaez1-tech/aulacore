'use client';

import { supabase } from '@/lib/supabase';

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
  weight: number;
  threshold: number;
  currentValue: number;
  severity: 'bajo' | 'medio' | 'alto' | 'critico';
  interpretation: string;
  recommendations: string[];
  relatedProtocols: string[];
  mioTriggerEvent?: string;
}

export interface CIEHistoryPoint {
  date: string;
  value: number;
}

export async function getCIEIndicators(): Promise<CIEIndicator[]> {
  try {
    const { data, error } = await supabase.from('cie_indicators').select('*');
    if (error || !data) return [];
    return data as CIEIndicator[];
  } catch (e) {
    return [];
  }
}

export async function updateCIEIndicator(code: string, updates: Partial<CIEIndicator>): Promise<CIEIndicator[]> {
  try {
    await supabase.from('cie_indicators').update(updates).eq('code', code);
    return await getCIEIndicators();
  } catch (e) {
    return [];
  }
}

export async function calculateGlobalRiskIndex(): Promise<{ value: number; label: string; color: string }> {
  try {
    const indicators = await getCIEIndicators();
    const predictivos = indicators.filter(i => i.type === 'predictivo');
    
    if (predictivos.length === 0) {
      return { value: 0, label: 'N/D', color: '#94a3b8' };
    }
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    predictivos.forEach(ind => {
      weightedSum += (ind.currentValue || 0) * ((ind.weight || 0) / 100);
      totalWeight += (ind.weight || 0) / 100;
    });
    
    const value = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    
    let label = 'Bajo';
    let color = '#10b981';
    
    if (value >= 75) {
      label = 'Crítico';
      color = '#ef4444';
    } else if (value >= 50) {
      label = 'Alto';
      color = '#f97316';
    } else if (value >= 30) {
      label = 'Moderado';
      color = '#eab308';
    } else if (value === 0) {
      label = 'N/D';
      color = '#94a3b8';
    }
    
    return { value, label, color };
  } catch (e) {
    return { value: 0, label: 'N/D', color: '#94a3b8' };
  }
}

export async function getCIEHistory(code: string): Promise<CIEHistoryPoint[]> {
  try {
    const { data, error } = await supabase
      .from('cie_history')
      .select('*')
      .eq('indicator_code', code)
      .order('date', { ascending: true });
      
    if (error || !data) return [];
    return data as CIEHistoryPoint[];
  } catch (e) {
    return [];
  }
}
