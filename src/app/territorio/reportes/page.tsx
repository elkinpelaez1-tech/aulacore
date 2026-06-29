'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileText, Download, CheckCircle2, RefreshCw, Landmark, ShieldCheck, UserCheck, Calendar } from 'lucide-react';

interface MockReport {
  id: string;
  title: string;
  description: string;
  format: 'PDF' | 'EXCEL';
  size: string;
  period: string;
}

const MOCK_REPORTS: MockReport[] = [
  { id: '1', title: 'Informe Anual de Cobertura y Matrículas 2026', description: 'Consolidado demográfico del territorio filtrado por niveles y comunas.', format: 'PDF', size: '2.4 MB', period: 'Año Lectivo 2026' },
  { id: '2', title: 'Consolidado de Calidad y Rankings Educativos', description: 'Promedios históricos de las asignaturas fundamentales de la jurisdicción.', format: 'EXCEL', size: '1.8 MB', period: 'Primer Semestre 2026' },
  { id: '3', title: 'Auditoría PAE - Segundo Trimestre', description: 'Reporte consolidado de minutas entregadas y cumplimiento de operadores.', format: 'PDF', size: '3.1 MB', period: 'Abril - Junio 2026' },
  { id: '4', title: 'Reporte de Madurez Tecnológica y Onboarding', description: 'Porcentaje de adopción de AulaCore por institución educativa.', format: 'EXCEL', size: '850 KB', period: 'Corte Junio 2026' },
];

export default function TerritoryReportesPage() {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [downloadReadyId, setDownloadReadyId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

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
          setPreviewOpen(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const activeReport = MOCK_REPORTS.find(r => r.id === downloadReadyId);

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

      {/* ================================================================= */}
      {/* 📄 MODAL VISTA PREVIA DEL DOCUMENTO OFICIAL GENERADO             */}
      {/* ================================================================= */}
      {previewOpen && activeReport && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-3xl flex flex-col max-h-[90vh] border border-slate-200 overflow-hidden m-4 animate-scale-in">
            
            {/* Header del Modal */}
            <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex justify-between items-center shrink-0">
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-0.5 animate-pulse">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Documento Oficial Generado
              </span>
              <button 
                onClick={() => setPreviewOpen(false)}
                className="p-1 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Hoja Virtual con Apariencia de Documento Oficial */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
              <div className="bg-white border border-slate-250 p-8 shadow-xs rounded-xl space-y-6 max-w-xl mx-auto font-sans relative">
                
                {/* Membrete de la Secretaría (Escudo y Logotipo) */}
                <div className="flex justify-between items-start border-b border-slate-300 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 border border-slate-250 rounded-lg flex items-center justify-center text-slate-600">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div className="text-[9px] font-black text-slate-800 leading-tight uppercase">
                      <span>Secretaría de Educación</span>
                      <span className="block text-slate-500">De Antioquia</span>
                    </div>
                  </div>
                  
                  <div className="text-[8px] font-semibold text-slate-500 text-right leading-normal">
                    <span>NIT: 890.900.286-0</span><br />
                    <span>Calle 42B #52-106, Medellín</span><br />
                    <span>secretaria.antioquia@sed.gov.co</span>
                  </div>
                </div>

                {/* Título y Periodo del Reporte */}
                <div className="text-center space-y-1 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-850">{activeReport.title}</h4>
                  <span className="text-[9px] font-bold text-slate-450 uppercase block">Periodo: {activeReport.period}</span>
                </div>

                {/* Datos Consolidados Simulados */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2 text-[10px] font-semibold text-slate-655">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Establecimientos evaluados:</span>
                    <span className="text-slate-800 font-extrabold">48 I.E. Oficiales</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Total Estudiantes Registrados:</span>
                    <span className="text-slate-800 font-extrabold">34.250 Estudiantes</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Tasa de Asistencia Media:</span>
                    <span className="text-emerald-700 font-extrabold">92.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Madurez Tecnológica (Health Score):</span>
                    <span className="text-indigo-650 font-extrabold">84.2% (Óptimo)</span>
                  </div>
                </div>

                {/* Firmas y Metadatos de Auditoría */}
                <div className="grid grid-cols-2 gap-4 pt-12 border-t border-slate-200 text-[8px] font-semibold text-slate-550">
                  <div className="space-y-4">
                    <span className="block text-slate-400 uppercase tracking-widest">Firma Autorizada</span>
                    <div className="border-b border-slate-300 w-36 py-2">
                      <span className="font-black text-slate-800 block text-[9px]">Dr. Alejandro Gómez</span>
                      <span className="text-slate-400 block text-[8px]">Secretario de Educación</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="block text-slate-400 uppercase tracking-widest text-left md:text-right">Detalles de Emisión</span>
                    <span>Generado: {new Date().toLocaleDateString()}</span><br />
                    <span>Usuario: admin_territorial</span><br />
                    <span>Firma digital: SEC-AUT-85926B</span>
                  </div>
                </div>

                {/* Numeración de Página Oficial */}
                <div className="text-center text-[7px] font-bold text-slate-400 pt-4 border-t border-slate-100">
                  Página 1 de 1 - AulaCore Inteligencia Territorial
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer bg-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert('Descargando documento oficial compilado con membretes...');
                  setPreviewOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 border-none"
              >
                <Download className="w-4 h-4" />
                Descargar Documento Oficial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
