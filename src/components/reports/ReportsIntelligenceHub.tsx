'use client';

import React, { useState } from 'react';
import { ReportsFilterBar } from './ReportsFilterBar';
import { ExecutiveKPIs } from './ExecutiveKPIs';
import { AcademicTrendChart } from './AcademicTrendChart';
import { AlertDistributionChart } from './AlertDistributionChart';
import { RiskAnalyticsPanel } from './RiskAnalyticsPanel';
import { AcademicAnalyticsTab } from './AcademicAnalyticsTab';
import { ConvivenciaAnalyticsTab } from './ConvivenciaAnalyticsTab';
import { AsistenciaAnalyticsTab } from './AsistenciaAnalyticsTab';
import { DocentesAnalyticsTab } from './DocentesAnalyticsTab';
import { CursosAnalyticsTab } from './CursosAnalyticsTab';
import { ExportacionesAnalyticsTab } from './ExportacionesAnalyticsTab';

import { Activity, BookOpen, GraduationCap, ShieldAlert, Users, DownloadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReportTab = 'ejecutivo' | 'academico' | 'convivencia' | 'rfid' | 'docentes' | 'cursos' | 'exportaciones';

export function ReportsIntelligenceHub() {
  const [activeTab, setActiveTab] = useState<ReportTab>('ejecutivo');
  const [cursosInitialModal, setCursosInitialModal] = useState<string | null>(null);

  const handleNavigateToCursos = (modal: string | null = null) => {
    setActiveTab('cursos');
    setCursosInitialModal(modal);
  };

  const tabs = [
    { id: 'ejecutivo', label: 'Resumen Ejecutivo', icon: Activity },
    { id: 'academico', label: 'Académico', icon: GraduationCap },
    { id: 'convivencia', label: 'Convivencia', icon: ShieldAlert },
    { id: 'rfid', label: 'Asistencia RFID', icon: Activity },
    { id: 'docentes', label: 'Docentes', icon: Users },
    { id: 'cursos', label: 'Cursos', icon: BookOpen },
    { id: 'exportaciones', label: 'Exportaciones', icon: DownloadCloud },
  ] as const;

  return (
    <div className="space-y-6">
      
      {/* Global Filters */}
      <ReportsFilterBar />

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200">
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ReportTab)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-bold transition-colors whitespace-nowrap border-b-2",
                  isActive 
                    ? "bg-white text-indigo-700 border-indigo-600 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]" 
                    : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Areas */}
      <div className="min-h-[600px] animate-in fade-in duration-300">
        
        {activeTab === 'ejecutivo' && (
          <div className="space-y-6">
            <ExecutiveKPIs onNavigateTab={(tab) => setActiveTab(tab)} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AcademicTrendChart />
              <AlertDistributionChart />
            </div>
            <RiskAnalyticsPanel onNavigate={handleNavigateToCursos} />
          </div>
        )}

        {activeTab === 'academico' && (
          <AcademicAnalyticsTab />
        )}

        {activeTab === 'convivencia' && (
          <ConvivenciaAnalyticsTab />
        )}

        {activeTab === 'rfid' && (
          <AsistenciaAnalyticsTab />
        )}

        {activeTab === 'docentes' && (
          <DocentesAnalyticsTab />
        )}

        {activeTab === 'cursos' && (
          <CursosAnalyticsTab 
            initialModal={cursosInitialModal} 
            onClearInitialModal={() => setCursosInitialModal(null)} 
          />
        )}

        {activeTab === 'exportaciones' && (
          <ExportacionesAnalyticsTab />
        )}

        {/* Placeholders for other tabs to show architecture scalability */}
        {activeTab !== 'ejecutivo' && activeTab !== 'academico' && activeTab !== 'convivencia' && activeTab !== 'rfid' && activeTab !== 'docentes' && activeTab !== 'cursos' && activeTab !== 'exportaciones' && (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 flex flex-col items-center justify-center text-center">
            <Activity className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-xl font-black text-slate-800 mb-2 capitalize">Módulo {(activeTab as string).replace('-', ' ')}</h2>
            <p className="text-slate-500 font-medium max-w-md">
              Área analítica en desarrollo. Próximamente incluirá visualizaciones detalladas conectadas en tiempo real para esta categoría.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
