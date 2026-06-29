'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileText, Download, CheckCircle2, RefreshCw, BarChart } from 'lucide-react';

interface MockReport {
  id: string;
  title: string;
  description: string;
  format: 'PDF' | 'EXCEL';
  size: string;
}

const MOCK_REPORTS: MockReport[] = [
  { id: '1', title: 'Informe Anual de Cobertura y Matrículas 2026', description: 'Consolidado demográfico del territorio filtrado por niveles y comunas.', format: 'PDF', size: '2.4 MB' },
  { id: '2', title: 'Consolidado de Calidad y Rankings Educativos', description: 'Promedios históricos de las asignaturas fundamentales de la jurisdicción.', format: 'EXCEL', size: '1.8 MB' },
  { id: '3', title: 'Auditoría PAE - Segundo Trimestre', description: 'Reporte consolidado de minutas entregadas y cumplimiento de operadores.', format: 'PDF', size: '3.1 MB' },
  { id: '4', title: 'Reporte de Madurez Tecnológica y Onboarding', description: 'Porcentaje de adopción de AulaCore por institución educativa.', format: 'EXCEL', size: '850 KB' },
];

export default function TerritoryReportesPage() {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [downloadReadyId, setDownloadReadyId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleGenerate = (id: string) => {
    setGeneratingId(id);
    setDownloadReadyId(null);
    setProgress(0);

    // Simular barra de progreso de exportación
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGeneratingId(null);
          setDownloadReadyId(id);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const activeReportTitle = MOCK_REPORTS.find(r => r.id === downloadReadyId)?.title;

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
          Reportes Consolidados Territoriales
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Generador de informes y planillas consolidadas listas para descargar en lote.
        </p>
      </div>

      {/* Alerta de Descarga Lista */}
      {downloadReadyId && (
        <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
            <span>El reporte <strong>"{activeReportTitle}"</strong> ha sido generado con éxito.</span>
          </div>
          <button
            onClick={() => {
              alert('Descargando archivo simulado...');
              setDownloadReadyId(null);
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar
          </button>
        </div>
      )}

      {/* Grid de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_REPORTS.map((report) => {
          const isGenerating = generatingId === report.id;

          return (
            <Card key={report.id} className="border-slate-200 shadow-sm rounded-2xl bg-white p-5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-indigo-650 shrink-0" />
                    <h3 className="text-xs font-black text-slate-800 leading-snug">
                      {report.title}
                    </h3>
                  </div>
                  <span className={`text-[9px] font-black uppercase border px-2 py-0.5 rounded-md shrink-0 ${
                    report.format === 'PDF' 
                      ? 'bg-rose-50 border-rose-100 text-rose-700' 
                      : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}>
                    {report.format}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed pl-6.5">
                  {report.description}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between pl-6.5">
                <span className="text-[10px] text-slate-400 font-bold">Tamaño Aprox: {report.size}</span>
                
                {isGenerating ? (
                  <div className="flex items-center gap-3 w-32 shrink-0">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
                    </div>
                    <RefreshCw className="w-4 h-4 text-indigo-650 animate-spin shrink-0" />
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerate(report.id)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-all duration-200 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Generar
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
