'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/territorio/Modal';
import { isModoDemoActive, setModoDemoActive } from '@/services/territory-mock';
import { hasTerritoryPermission, getRbacControlAttrs } from '@/services/territory-rbac';
import { dispatchMIOEvent } from '@/services/mio-service';
import { 
  FileText, Download, CheckCircle2, RefreshCw, Landmark, 
  ShieldCheck, Calendar, Sparkles, Building, AlertTriangle, Eye 
} from 'lucide-react';

interface MockReport {
  id: string;
  title: string;
  description: string;
  format: 'PDF' | 'XLSX';
  size: string;
  period: string;
  foliatedCode: string;
}

export default function TerritoryReportesPage() {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [downloadReadyId, setDownloadReadyId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState('Secretario de Educación');
  
  // React to demo mode changes locally
  const [demoActive, setDemoActive] = useState(false);

  useEffect(() => {
    setDemoActive(isModoDemoActive());

    function updateRole() {
      const saved = sessionStorage.getItem('simulated_role');
      if (saved) setCurrentRole(saved);
    }
    updateRole();

    const handleDemoChange = () => setDemoActive(isModoDemoActive());

    window.addEventListener('rbac-role-changed', updateRole);
    window.addEventListener('modo-demo-changed', handleDemoChange);
    return () => {
      window.removeEventListener('rbac-role-changed', updateRole);
      window.removeEventListener('modo-demo-changed', handleDemoChange);
    };
  }, []);

  const handleDemoToggle = () => {
    const nextState = !demoActive;
    setModoDemoActive(nextState);
    setDemoActive(nextState);

    if (nextState) {
      // Inyectar corridas históricas realistas de simulación para el MIO
      dispatchMIOEvent({
        id: 'evt-init-1',
        type: 'on_absence_threshold',
        tenantId: 'tenant-antioquia',
        municipality: 'Barbosa',
        data: { school_id: 'inst-1', school_name: 'I.E. Rural El Hatillo', student_name: 'Mateo Gómez', absences: 5, comment: 'Sincronización inicial del sensor RFID veredal' },
        timestamp: new Date(Date.now() - 3600000).toISOString()
      });
      dispatchMIOEvent({
        id: 'evt-init-2',
        type: 'on_pae_anomaly',
        tenantId: 'tenant-antioquia',
        municipality: 'Barbosa',
        data: { school_id: 'inst-1', school_name: 'I.E. Rural El Hatillo', impact: 120, comment: 'Ruptura logística de cadena de frío reportada' },
        timestamp: new Date(Date.now() - 1800000).toISOString()
      });
    } else {
      // Limpiar datos del MIO al apagar la simulación comercial
      sessionStorage.removeItem('aulacore_mio_runs');
      sessionStorage.removeItem('aulacore_mio_optimizations');
      window.dispatchEvent(new CustomEvent('mio-runs-changed'));
      window.dispatchEvent(new CustomEvent('mio-optimizations-changed'));
    }
  };

  const reportsList: MockReport[] = [
    {
      id: 'rep-1',
      title: 'Consolidado de Matrícula y Cobertura Veredal',
      description: 'Estadísticas de matrícula por corregimiento, comparación contra cupos contratados e índices de vulnerabilidad.',
      format: 'XLSX',
      size: '2.4 MB',
      period: 'Año Lectivo 2026',
      foliatedCode: 'SED-MCV-2026-042'
    },
    {
      id: 'rep-2',
      title: 'Informe Técnico del Programa de Alimentación Escolar (PAE)',
      description: 'Historial de entregas, actas de interventoría en comedor y auditorías de raciones de contingencia del Hatillo.',
      format: 'PDF',
      size: '4.8 MB',
      period: 'Junio 2026',
      foliatedCode: 'SED-PAE-2026-891'
    },
    {
      id: 'rep-3',
      title: 'Auditoría de Asistencia y Permanencia RFID',
      description: 'Estadística general de deserción acumulada por comuna y análisis de correlación con transporte escolar.',
      format: 'PDF',
      size: '1.2 MB',
      period: 'Primer Semestre 2026',
      foliatedCode: 'SED-RFID-2026-115'
    }
  ];

  const handleGenerate = (id: string) => {
    // Restringir el reporte 2 (PAE) si el rol no tiene permisos (simulación RBAC)
    if (id === 'rep-2' && !hasTerritoryPermission(currentRole, 'descargar_reportes_financieros')) {
      alert('Error de Seguridad: Su rol actual no tiene permisos para descargar auditorías PAE / Financieras.');
      return;
    }

    setGeneratingId(id);
    setDownloadReadyId(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGeneratingId(null);
          setDownloadReadyId(id);
          setPreviewOpen(true);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const activeReport = reportsList.find(r => r.id === downloadReadyId);

  return (
    <div className="p-6 space-y-6">
      
      {/* 🔮 CONTROL DE MODO DEMO COMERCIAL EN CABECERA */}
      <div className="flex flex-wrap justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            Reportes Consolidados Territoriales
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Generador de informes y planillas consolidadas oficiales de la Secretaría de Educación.
          </p>
        </div>
        
        {/* Interruptor del Modo Demo */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-150 p-2.5 rounded-xl">
          <Sparkles className={`w-4 h-4 ${demoActive ? 'text-indigo-600 animate-spin' : 'text-slate-400'}`} />
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">Modo Demo Comercial</span>
            <span className="text-[9px] font-semibold text-slate-405 block">
              {demoActive ? 'Cargando datos extendidos del Valle de Aburrá' : 'Cargando registros de base en tiempo real'}
            </span>
          </div>
          <button
            onClick={handleDemoToggle}
            className={`w-12 h-6.5 rounded-full p-1 cursor-pointer transition-colors border-none flex items-center ${
              demoActive ? 'bg-indigo-650 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-4.5 h-4.5 bg-white rounded-full shadow-md" />
          </button>
        </div>
      </div>

      {/* Grid de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportsList.map((report) => {
          const isGenerating = generatingId === report.id;
          const isRestricted = report.id === 'rep-2';
          const rbacAttrs = isRestricted ? getRbacControlAttrs(currentRole, 'descargar_reportes_financieros') : {};
          const hasAccess = isRestricted ? hasTerritoryPermission(currentRole, 'descargar_reportes_financieros') : true;

          return (
            <Card key={report.id} className={`border-slate-200 shadow-xs rounded-2xl bg-white p-5 flex flex-col justify-between transition-all hover:border-slate-300 ${!hasAccess ? 'opacity-65' : ''}`}>
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                    <h3 className="text-xs font-black text-slate-800 leading-snug">
                      {report.title}
                    </h3>
                  </div>
                  <span className={`text-[9px] font-black uppercase border px-2 py-0.5 rounded-md shrink-0 ${
                    report.format === 'PDF' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}>
                    {report.format}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed pl-7">
                  {report.description}
                </p>
                {isRestricted && !hasAccess && (
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-150 px-2 py-0.5 rounded-md block w-fit ml-7">
                    Restringido para: {currentRole}
                  </span>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between pl-7">
                <div className="text-[9px] text-slate-400 font-bold">
                  <span>Tamaño: {report.size}</span>
                  <span className="block font-mono mt-0.5">{report.foliatedCode}</span>
                </div>
                
                {isGenerating ? (
                  <div className="flex items-center gap-3 w-28 shrink-0">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
                    </div>
                    <RefreshCw className="w-4 h-4 text-indigo-605 animate-spin shrink-0" />
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerate(report.id)}
                    {...rbacAttrs}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-none"
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

      {/* 📄 MODAL VISTA PREVIA DEL DOCUMENTO OFICIAL GENERADO (APARIENCIA GUBERNAMENTAL PREMIUM) */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Documento Oficial Generado"
        subtitle="Consola de Auditoría Territorial"
        sizeClassName="max-w-2xl"
        footer={
          <>
            <button
              onClick={() => setPreviewOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer bg-white"
            >
              Cerrar Vista Previa
            </button>
            <button
              onClick={() => {
                alert(`Descargando reporte certificado oficial ${activeReport?.foliatedCode} en formato ${activeReport?.format}...`);
                setPreviewOpen(false);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 border-none"
            >
              <Download className="w-4 h-4" />
              Descargar Reporte Oficial
            </button>
          </>
        }
      >
        {activeReport && (
          <div className="bg-slate-100 p-6 rounded-2xl overflow-y-auto max-h-[500px]">
            <div className="bg-white border border-slate-250 p-8 shadow-sm rounded-xl space-y-6 max-w-xl mx-auto font-sans relative">
              
              {/* Membrete de la Gobernación / Secretaría de Educación */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 border border-slate-250 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 shrink-0">
                    <Landmark className="w-7 h-7 text-indigo-750" />
                  </div>
                  <div className="text-[9px] font-black text-slate-800 leading-tight uppercase">
                    <span>Secretaría de Educación</span>
                    <span className="block text-slate-500 font-bold">Gobernación de Antioquia</span>
                    <span className="block text-indigo-600 text-[8px] font-mono mt-0.5">SISTEMA INTEGRAL AULACORE</span>
                  </div>
                </div>
                
                <div className="text-[8px] font-bold text-slate-500 text-right leading-relaxed">
                  <span>RESOLUCIÓN MINISTERIAL 4120</span><br />
                  <span>Foliado: <strong>{activeReport.foliatedCode}</strong></span><br />
                  <span>Barbosa - Medellín - Copacabana</span>
                </div>
              </div>

              {/* Título Oficial */}
              <div className="text-center space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
                  {activeReport.title}
                </h4>
                <div className="flex justify-center gap-6 text-[8px] font-bold text-slate-400 uppercase pt-1">
                  <span>Periodo: <strong>{activeReport.period}</strong></span>
                  <span>Formato: <strong>{activeReport.format}</strong></span>
                  <span>Clasificación: <strong>Confidencial</strong></span>
                </div>
              </div>

              {/* DATOS CONSOLIDADOS DINÁMICOS SEGÚN MODO DEMO */}
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-[10px] font-semibold text-slate-655">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Establecimientos Educativos Auditados:</span>
                    <span className="text-slate-800 font-extrabold">
                      {demoActive ? '10 Colegios (Valle de Aburrá)' : '2 Instituciones Oficiales'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Matrícula Consolidada de Cobertura:</span>
                    <span className="text-slate-800 font-extrabold">
                      {demoActive ? '4.820 Alumnos Activos' : '2.450 Alumnos Activos'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Inspectores de Campo Asignados:</span>
                    <span className="text-slate-800 font-extrabold">
                      {demoActive ? '5 Supervisores (Restrepo/Alzate/Quintero/Muñoz/Vélez)' : '1 Supervisor'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Visitas de Supervisión Completadas:</span>
                    <span className="text-emerald-700 font-extrabold">
                      {demoActive ? '14 Visitas Registradas' : '3 Visitas'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Índice de Vulnerabilidad Territorial (IRT):</span>
                    <span className="text-indigo-650 font-extrabold">
                      {demoActive ? '28%' : '14%'}
                    </span>
                  </div>
                </div>

                {/* 📋 RESUMEN DE NOVEDADES DEL MODO DEMO */}
                {demoActive && (
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Novedades Reportadas en el Semestre (Modo Demo)</span>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-[9px] font-semibold">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="p-2 text-slate-500 font-bold uppercase">Código</th>
                            <th className="p-2 text-slate-500 font-bold uppercase">I.E. Sede</th>
                            <th className="p-2 text-slate-500 font-bold uppercase">Descripción</th>
                            <th className="p-2 text-slate-500 font-bold uppercase text-center">Severidad</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          <tr>
                            <td className="p-2 font-mono font-bold text-slate-800">ALT-2026-001</td>
                            <td className="p-2 font-bold">I.E. Rural El Hatillo</td>
                            <td className="p-2">Desabastecimiento PAE raciones</td>
                            <td className="p-2 text-center"><span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-black text-[8px] uppercase">Crítico</span></td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono font-bold text-slate-800">ALT-2026-002</td>
                            <td className="p-2 font-bold">I.E. Marco Fidel Suárez</td>
                            <td className="p-2">Ausentismo RFID 9-A</td>
                            <td className="p-2 text-center"><span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-black text-[8px] uppercase">Alto</span></td>
                          </tr>
                          <tr>
                            <td className="p-2 font-mono font-bold text-slate-800">ALT-2026-003</td>
                            <td className="p-2 font-bold">I.E. José Antonio Galán</td>
                            <td className="p-2">Riesgo Deserción Mateo O.</td>
                            <td className="p-2 text-center"><span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-black text-[8px] uppercase">Crítico</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Firmas Oficiales Criptográficas */}
              <div className="grid grid-cols-2 gap-6 pt-12 border-t border-slate-200 text-[8px] font-semibold text-slate-550">
                <div className="space-y-4">
                  <span className="block text-slate-400 uppercase tracking-widest">Firma Autorizada Interventor</span>
                  <div className="border-b border-slate-300 w-40 py-2">
                    <span className="font-black text-slate-800 block text-[9px]">Dr. Alejandro Gómez</span>
                    <span className="text-slate-400 block text-[8px]">Secretario de Educación Departamental</span>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <span className="block text-slate-400 uppercase tracking-widest text-left md:text-right">Firma Digital y Certificado</span>
                  <span>Fecha Emisión: {new Date().toLocaleDateString()}</span><br />
                  <span>Código de Verificación: <strong>{activeReport.foliatedCode}</strong></span><br />
                  <span>Hash Criptográfico: <strong>hash-cert-859a12e2026</strong></span><br />
                  <span className="text-[7px] text-emerald-600 font-extrabold flex items-center justify-end gap-0.5 mt-1">
                    <ShieldCheck className="w-3 h-3" />
                    CERTIFICADO VÁLIDO EN AULACORE GUBERNAMENTAL
                  </span>
                </div>
              </div>

              {/* Numeración y Pie de Página */}
              <div className="text-center text-[7px] font-bold text-slate-400 pt-4 border-t border-slate-100 uppercase tracking-wider">
                Página 1 de 1 - Reporte Oficial de la Secretaría de Educación de Antioquia
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
