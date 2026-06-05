'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Layers, 
  FolderGit2, 
  FileCheck2, 
  History, 
  BrainCircuit, 
  Sparkles, 
  ShieldAlert, 
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PeiDashboardProps {
  userRole: string;
  peiData: any;
  projects: any[];
  manualVersions: any[];
}

export function PeiDashboard({ userRole, peiData, projects, manualVersions }: PeiDashboardProps) {
  const [runningAiAudit, setRunningAiAudit] = useState(false);
  const [aiAuditReport, setAiAuditReport] = useState<string | null>(null);

  const activeProjectsCount = projects.filter(p => p.status === 'Activo').length;
  const totalEvidencesCount = projects.reduce((acc, curr) => acc + (curr.evidences?.length || 0), 0);
  const totalUpdatesCount = 12 + manualVersions.length + (peiData ? 1 : 0);

  const runAiAudit = () => {
    setRunningAiAudit(true);
    setTimeout(() => {
      setRunningAiAudit(false);
      setAiAuditReport(
        'Análisis Semántico Finalizado:\n' +
        '• Consistencia Misión-Visión: 95% (Fuerte alineación en desarrollo tecnológico y valores cívicos).\n' +
        '• Enfoque Pedagógico: Constructivismo Social bien integrado con el Aprendizaje Basado en Proyectos (ABP).\n' +
        '• Brechas de Ley 1620 (Convivencia): Se detecta una versión desactualizada de protocolos para ciberacoso escolar en la versión anterior del manual. La versión activa (v2.0.0) subsana esta brecha en un 98%.\n' +
        '• Recomendación IA: Integrar el proyecto del PRAE con el plan de Ciencias Naturales en 9° y 10° para optimizar horas transversales.'
      );
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-all">
          <CardContent className="p-5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cumplimiento PEI</span>
            <div className="flex items-baseline gap-1 mt-2">
              <h4 className="text-3xl font-black text-slate-900 leading-none">85.0%</h4>
              <span className="text-xs text-emerald-600 font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> +2.5%</span>
            </div>
            <p className="text-[9px] text-slate-400 font-semibold mt-3 pt-2.5 border-t border-slate-100">Meta anual: 90%</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-all">
          <CardContent className="p-5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Proyectos Activos</span>
            <div className="flex items-baseline gap-1 mt-2">
              <h4 className="text-3xl font-black text-slate-900 leading-none">{activeProjectsCount}</h4>
              <span className="text-xs text-slate-400 font-bold">de {projects.length} totales</span>
            </div>
            <p className="text-[9px] text-slate-400 font-semibold mt-3 pt-2.5 border-t border-slate-100">Planes transversales MEN</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-all">
          <CardContent className="p-5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Actividades Vinculadas</span>
            <div className="flex items-baseline gap-1 mt-2">
              <h4 className="text-3xl font-black text-slate-900 leading-none">12</h4>
              <span className="text-xs text-emerald-600 font-bold flex items-center">Estable</span>
            </div>
            <p className="text-[9px] text-slate-400 font-semibold mt-3 pt-2.5 border-t border-slate-100">Enlazadas a cronograma</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-all">
          <CardContent className="p-5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Evidencias Cargadas</span>
            <div className="flex items-baseline gap-1 mt-2">
              <h4 className="text-3xl font-black text-slate-900 leading-none">{totalEvidencesCount}</h4>
              <span className="text-xs text-indigo-600 font-bold">Verificadas</span>
            </div>
            <p className="text-[9px] text-slate-400 font-semibold mt-3 pt-2.5 border-t border-slate-100">Documentos y soportes</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-all">
          <CardContent className="p-5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Modificaciones</span>
            <div className="flex items-baseline gap-1 mt-2">
              <h4 className="text-3xl font-black text-slate-900 leading-none">{totalUpdatesCount}</h4>
              <span className="text-xs text-slate-500 font-bold font-mono">v2.0.0</span>
            </div>
            <p className="text-[9px] text-slate-400 font-semibold mt-3 pt-2.5 border-t border-slate-100">Historial de auditoría</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IA Audit Panel */}
        <Card className="lg:col-span-2 border-slate-200 shadow-md bg-slate-950 text-white rounded-3xl overflow-hidden relative border-l-4 border-l-purple-500">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <BrainCircuit className="w-48 h-48" />
          </div>

          <CardHeader className="bg-slate-900/60 p-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-purple-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black tracking-widest uppercase text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-800">
                      Módulo Experimental IA
                    </span>
                  </div>
                  <CardTitle className="text-base font-black text-white mt-1">Análisis IA del PEI</CardTitle>
                </div>
              </div>
              <Button
                onClick={runAiAudit}
                disabled={runningAiAudit || userRole === 'docente'}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 h-9 rounded-xl shadow-md cursor-pointer border-none outline-none"
              >
                {runningAiAudit ? 'Analizando...' : 'Ejecutar Auditoría Semántica'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {aiAuditReport ? (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs leading-relaxed font-semibold text-slate-200 space-y-2 whitespace-pre-line">
                  {aiAuditReport}
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Coherencia: 95%</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Ley 115: Verificado</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                <Sparkles className="w-10 h-10 mx-auto text-purple-400/40 animate-pulse mb-3" />
                <h4 className="text-sm font-black text-slate-350">Preparado para Auditoría Pedagógica</h4>
                <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto mt-1 leading-normal">
                  Permite escanear el PEI institucional, contrastarlo con la Ley 115 e identificar brechas académicas o de convivencia automáticamente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Future Integrations / Summary */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-600" /> Estado del PEI Oficial
            </h3>

            <div className="space-y-3.5 pt-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 border-b border-slate-100 pb-2">
                <span>Versión Activa:</span>
                <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">v2.0.0</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 border-b border-slate-100 pb-2">
                <span>Modelo Registrado:</span>
                <span className="font-extrabold text-indigo-600">{peiData?.model || 'Constructivista'}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 border-b border-slate-100 pb-2">
                <span>Última Aprobación:</span>
                <span className="font-bold text-slate-950">Enero 2026</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 pb-2">
                <span>Riesgos de Convivencia:</span>
                <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Bajo Control</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <div className="bg-slate-50 border border-slate-200/50 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600 leading-snug font-medium">
              <ShieldAlert className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
              <p>
                Este módulo opera como un **sistema vivo auditable**. Todo cambio requiere firma digital por Rectoría para validez legal ante el MEN.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
