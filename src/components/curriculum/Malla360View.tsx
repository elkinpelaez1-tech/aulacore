'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CurriculumDraft } from '@/components/dashboard/CurriculumBuilder';
import {
  Compass,
  Layers,
  BookOpen,
  GraduationCap,
  Calendar,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Lock,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Upload,
  Info,
  SlidersHorizontal,
  FolderUp,
  FileCheck2,
  ShieldCheck,
  Building2,
  UserCheck
} from 'lucide-react';

export interface SubjectItem {
  name: string;
  description?: string;
  suggestedGrades?: string[];
}

export interface AreaItem {
  id: string;
  name: string;
  code: string;
  subjects: SubjectItem[];
}

interface Malla360ViewProps {
  area: AreaItem;
  institutionId: string;
  institutionName?: string;
  rectorName?: string;
  offeredGrades: string[];
  periods: string[];
  onBack: () => void;
  onSelectPeriod: (subject: string, grade: string, period: string) => void;
  getDraftStatus: (subject: string, grade: string, period: string) => CurriculumDraft | null;
}

export function Malla360View({
  area,
  institutionId,
  institutionName,
  rectorName,
  offeredGrades,
  periods,
  onBack,
  onSelectPeriod,
  getDraftStatus
}: Malla360ViewProps) {
  // Asignatura activa dentro de la Malla 360 (puede ser 'todas' o una específica)
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>(
    area.subjects.length > 0 ? area.subjects[0].name : 'Todas'
  );

  // Modales
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<'full_area' | 'current_subject'>('full_area');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Asignaturas a evaluar en la matriz
  const activeSubjects = useMemo(() => {
    if (selectedSubjectFilter === 'Todas') {
      return area.subjects;
    }
    return area.subjects.filter(s => s.name === selectedSubjectFilter);
  }, [area.subjects, selectedSubjectFilter]);

  // Grados que realmente aplican a la asignatura/área en la institución
  const relevantGrades = useMemo(() => {
    if (selectedSubjectFilter === 'Todas') {
      return offeredGrades;
    }
    const currentSubject = area.subjects.find(s => s.name === selectedSubjectFilter);
    if (currentSubject?.suggestedGrades && currentSubject.suggestedGrades.length > 0) {
      // Filtrar los grados sugeridos que además estén ofertados por el colegio
      const matched = offeredGrades.filter(g => currentSubject.suggestedGrades?.includes(g));
      return matched.length > 0 ? matched : offeredGrades;
    }
    return offeredGrades;
  }, [offeredGrades, area.subjects, selectedSubjectFilter]);

  // Estadísticas globales de cobertura del área en tiempo real
  const areaCoverageStats = useMemo(() => {
    let totalCells = 0;
    let startedCount = 0;
    let approvedCount = 0;
    let submittedCount = 0;

    activeSubjects.forEach(sub => {
      relevantGrades.forEach(grd => {
        periods.forEach(per => {
          totalCells++;
          const draft = getDraftStatus(sub.name, grd, per);
          if (draft) {
            startedCount++;
            if (draft.status === 'approved') approvedCount++;
            if (draft.status === 'submitted') submittedCount++;
          }
        });
      });
    });

    const progressPercentage = totalCells > 0 ? Math.round((startedCount / totalCells) * 100) : 0;
    return {
      totalCells,
      startedCount,
      approvedCount,
      submittedCount,
      progressPercentage
    };
  }, [activeSubjects, relevantGrades, periods, getDraftStatus]);

  // Helper visual para badges de estado
  const renderStatusPill = (draft: CurriculumDraft | null) => {
    if (!draft) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
          <Sparkles className="w-3 h-3 text-slate-400" /> Sin Iniciar
        </span>
      );
    }
    switch (draft.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aprobada / Vigente
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Lock className="w-3 h-3 text-blue-600" /> En Revisión
          </span>
        );
      case 'revision':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-600" /> Devuelta
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" /> Borrador
          </span>
        );
    }
  };

  // MANEJADOR DE EXPORTACIÓN REAL (CSV estructurado con BOM para Excel)
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const rows: string[][] = [
        ['AREA', 'ASIGNATURA', 'GRADO', 'PERIODO', 'ESTADO', 'OBJETIVO_GENERAL', 'COMPETENCIAS_CANTIDAD', 'EVALUACIONES_CANTIDAD', 'ULTIMA_MODIFICACION']
      ];

      const targetSubjects = exportScope === 'current_subject' && selectedSubjectFilter !== 'Todas'
        ? area.subjects.filter(s => s.name === selectedSubjectFilter)
        : area.subjects;

      targetSubjects.forEach(sub => {
        relevantGrades.forEach(grd => {
          periods.forEach(per => {
            const draft = getDraftStatus(sub.name, grd, per);
            rows.push([
              `"${area.name}"`,
              `"${sub.name}"`,
              `"${grd}"`,
              `"${per}"`,
              `"${draft?.status || 'sin_iniciar'}"`,
              `"${(draft?.objetivoGeneral || 'Pendiente de formulación').replace(/"/g, '""')}"`,
              `"${draft?.competencies?.length || 0}"`,
              `"${draft?.evaluations?.length || 0}"`,
              `"${draft?.updatedAt || 'N/A'}"`
            ]);
          });
        });
      });

      const csvContent = '\uFEFF' + rows.map(r => r.join(';')).join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Malla_360_${area.name.replace(/[^a-zA-Z0-9]/g, '_')}_2026.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccessMessage('Archivo Excel (.CSV) descargado con éxito con la información real de la malla.');
      setTimeout(() => setExportSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error al exportar CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // MANEJADOR DE IMPRESIÓN OFICIAL (PDF)
  const handlePrintOfficial = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* BARRA SUPERIOR DE RETORNO Y METADATOS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs h-9 px-3 gap-2 self-start cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Explorador Curricular
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-bold py-1 px-3">
            Código Área: {area.code}
          </Badge>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold py-1 px-3">
            Año Lectivo: 2026
          </Badge>
        </div>
      </div>

      {/* CABECERA PRINCIPAL: MALLA 360 DEL ÁREA */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                Malla 360 Longitudinal
              </span>
              <span className="text-xs text-slate-400 font-medium border-l border-slate-700 pl-2">
                {institutionName || 'Institución Educativa Oficial'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <Compass className="w-9 h-9 text-indigo-400 shrink-0" />
              MALLA 360 — {area.name.toUpperCase()}
            </h1>

            <p className="text-sm text-slate-350 max-w-3xl leading-relaxed">
              Estructura curricular longitudinal completa del área desde la educación inicial hasta la educación media. Organiza el qué aprenden los estudiantes, la secuencia de competencias y los criterios de evaluación institucional SIEE.
            </p>
          </div>

          {/* ACCIONES DE DESCARGA E IMPORTACIÓN */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => setIsExportModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs h-11 px-5 rounded-xl shadow-lg shadow-indigo-600/25 gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              Descargar / Exportar Malla
            </Button>

            <Button
              onClick={() => setIsImportModalOpen(true)}
              variant="outline"
              className="border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs h-11 px-4 rounded-xl gap-2 cursor-pointer transition-all"
            >
              <FolderUp className="w-4 h-4 text-indigo-400" />
              Importar (Excel/CSV)
            </Button>
          </div>
        </div>

        {/* TELEMETRÍA Y COBERTURA EN TIEMPO REAL */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-850/60 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Progreso de Cobertura</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-black text-indigo-400">{areaCoverageStats.progressPercentage}%</span>
              <span className="text-xs text-slate-400">({areaCoverageStats.startedCount}/{areaCoverageStats.totalCells} celdas)</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${areaCoverageStats.progressPercentage}%` }} />
            </div>
          </div>

          <div className="bg-slate-850/60 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Asignaturas Integradas</span>
            <p className="text-xl font-black text-slate-200 mt-1">{area.subjects.length} Asignaturas</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">{relevantGrades.length} Grados ofertados</p>
          </div>

          <div className="bg-slate-850/60 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">En Revisión / Enviadas</span>
            <p className="text-xl font-black text-blue-400 mt-1">{areaCoverageStats.submittedCount} Períodos</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Bloqueadas para Coordinación</p>
          </div>

          <div className="bg-slate-850/60 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aprobadas / Vigentes</span>
            <p className="text-xl font-black text-emerald-400 mt-1">{areaCoverageStats.approvedCount} Períodos</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Oficializadas para el año escolar</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: REFERENTES CURRICULARES Y COMPONENTES INSTITUCIONALES */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-200 px-8 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Biblioteca de Referentes Nacionales e Institucionales Vinculados al Área
          </CardTitle>
          <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
            Marco Normativo MEN
          </span>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Estándares EBC
              </span>
              <span className="text-[9px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border">Guía 3 MEN</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Criterios públicos que definen lo que los estudiantes deben saber y saber hacer en {area.name}.
            </p>
            <div className="flex gap-1.5 text-[10px] font-bold pt-1">
              <span className="text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">Saber</span>
              <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">Hacer</span>
              <span className="text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">Ser / Convivir</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" /> Derechos Básicos (DBA)
              </span>
              <span className="text-[9px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border">V.2 Nacional</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Aprendizajes estructurantes que garantizan continuidad y equidad formativa grado a grado.
            </p>
            <p className="text-[11px] text-indigo-600 font-semibold pt-1">
              • Articulados periodo a periodo
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" /> PEI & SIEE Institucional
              </span>
              <span className="text-[9px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border">Decreto 1290</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Criterios de evaluación formativa y proyectos pedagógicos transversales (PRAE, Cátedra de Paz).
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold pt-1">
              • 70% Procedimental • 20% Cognitivo • 10% Actitudinal
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN 3: FILTRO DE ASIGNATURAS DEL ÁREA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 px-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Filtrar Asignatura en la Matriz:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {area.subjects.length > 1 && (
            <button
              onClick={() => setSelectedSubjectFilter('Todas')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border',
                selectedSubjectFilter === 'Todas'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              )}
            >
              Todas las Asignaturas ({area.subjects.length})
            </button>
          )}

          {area.subjects.map(sub => (
            <button
              key={sub.name}
              onClick={() => setSelectedSubjectFilter(sub.name)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                selectedSubjectFilter === sub.name
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              )}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN 4: MATRIZ LONGITUDINAL DEL ÁREA (GRADOS OFERTADOS x 4 PERÍODOS) */}
      <div className="space-y-6">
        {activeSubjects.map(subjectItem => (
          <Card key={subjectItem.name} className="border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-200 px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                  Trayectoria Longitudinal
                </span>
                <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  {subjectItem.name} — Matriz de Grados y Períodos
                </CardTitle>
                {subjectItem.description && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{subjectItem.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Grados configurados:</span>
                <span className="bg-slate-200 text-slate-800 text-xs font-black px-2.5 py-0.5 rounded-lg">
                  {relevantGrades.length} Grados
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                    <th className="py-4 px-6 w-36">Grado Ofertado</th>
                    {periods.map(p => (
                      <th key={p} className="py-4 px-4 text-center">
                        {p}
                      </th>
                    ))}
                    <th className="py-4 px-6 text-center w-36">Cobertura Anual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {relevantGrades.map(grade => {
                    // Contar avance del grado
                    let gradeCompletedCount = 0;
                    periods.forEach(per => {
                      const d = getDraftStatus(subjectItem.name, grade, per);
                      if (d) gradeCompletedCount++;
                    });
                    const gradeProgress = Math.round((gradeCompletedCount / periods.length) * 100);

                    return (
                      <tr key={grade} className="hover:bg-slate-50/70 transition-colors">
                        {/* 1. COLUMNA DE GRADO */}
                        <td className="py-4 px-6 font-black text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-900 flex items-center justify-center font-black text-xs">
                              {grade}
                            </span>
                            <span>Grado {grade}</span>
                          </div>
                        </td>

                        {/* 2. CELDAS DE CADA PERÍODO */}
                        {periods.map(periodName => {
                          const draft = getDraftStatus(subjectItem.name, grade, periodName);

                          return (
                            <td key={periodName} className="py-3 px-3">
                              <div
                                onClick={() => onSelectPeriod(subjectItem.name, grade, periodName)}
                                className={cn(
                                  'p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 hover:shadow-md group',
                                  draft
                                    ? draft.status === 'approved'
                                      ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-400'
                                      : draft.status === 'submitted'
                                      ? 'bg-blue-50/30 border-blue-200 hover:border-blue-400'
                                      : 'bg-amber-50/20 border-amber-200 hover:border-amber-400'
                                    : 'bg-slate-50/60 border-slate-200 hover:border-indigo-300 hover:bg-white'
                                )}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-black text-slate-500 uppercase">
                                      {periodName}
                                    </span>
                                    {renderStatusPill(draft)}
                                  </div>

                                  <p className="text-[11px] font-semibold text-slate-800 line-clamp-2 leading-tight">
                                    {draft?.objetivoGeneral || (
                                      <span className="text-slate-400 font-normal italic">
                                        Clic para iniciar construcción...
                                      </span>
                                    )}
                                  </p>
                                </div>

                                <div className="pt-1 flex items-center justify-between border-t border-slate-200/50 text-[10px] text-slate-500">
                                  <span>
                                    {draft?.competencies?.length || 0} comp.
                                  </span>
                                  <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                                    {draft ? 'Editar' : 'Comenzar'} <ChevronRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            </td>
                          );
                        })}

                        {/* 3. COBERTURA DEL GRADO */}
                        <td className="py-4 px-6 text-center">
                          <div className="space-y-1">
                            <span className="text-xs font-black text-slate-800">{gradeProgress}%</span>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  gradeProgress === 100
                                    ? 'bg-emerald-500'
                                    : gradeProgress > 0
                                    ? 'bg-indigo-600'
                                    : 'bg-slate-300'
                                )}
                                style={{ width: `${gradeProgress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {gradeCompletedCount} de 4 períodos
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL DE DESCARGA / EXPORTACIÓN */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                  Formatos Oficiales
                </span>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Download className="w-5 h-5 text-indigo-600" />
                  Descargar Malla Curricular
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {exportSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {exportSuccessMessage}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  1. Alcance de la Exportación:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportScope('full_area')}
                    className={cn(
                      'p-3 rounded-xl border text-xs font-bold text-left cursor-pointer transition',
                      exportScope === 'full_area'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <p className="font-black">Malla Completa del Área</p>
                    <p className="text-[10px] text-slate-500 font-normal">Todos los grados y asignaturas</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportScope('current_subject')}
                    className={cn(
                      'p-3 rounded-xl border text-xs font-bold text-left cursor-pointer transition',
                      exportScope === 'current_subject'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <p className="font-black">Asignatura Actual</p>
                    <p className="text-[10px] text-slate-500 font-normal">{selectedSubjectFilter}</p>
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  2. Selecciona el Formato de Salida:
                </label>

                {/* OPCIÓN 1: EXCEL / CSV REAL */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  className="w-full p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 flex items-center justify-between text-left transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-900">
                        Libro de Datos Excel (.CSV UTF-8)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Descarga inmediata de todos los períodos, competencias y objetivos reales.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* OPCIÓN 2: IMPRESIÓN OFICIAL PDF */}
                <button
                  type="button"
                  onClick={handlePrintOfficial}
                  className="w-full p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 flex items-center justify-between text-left transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Printer className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-900">
                        Vista Oficial de Impresión / Guardar como PDF
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Genera el informe formal para comités curriculares y auditoría MEN.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsExportModalOpen(false)}
                className="text-xs font-bold"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE IMPORTACIÓN (PREPARACIÓN PARA FASE 3) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                  Módulo de Ingesta
                </span>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FolderUp className="w-5 h-5 text-indigo-600" />
                  Importador de Mallas Curriculares
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 border border-indigo-200/70 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-black text-xs">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  Arquitectura de Importación Preparada
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Este módulo permitirá cargar planes de área preexistentes en formatos <strong>Excel (.xlsx)</strong>, <strong>CSV</strong> y <strong>Word (.docx)</strong> sin tener que digitar periodo por periodo.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <p className="font-bold text-slate-900">Flujo de ingesta estructurado:</p>
                <div className="space-y-1.5 text-[11px] font-medium text-slate-600">
                  <p>1. <strong>Carga</strong>: Archivo del colegio con mallas por grado.</p>
                  <p>2. <strong>Mapeo guiado</strong>: Detección inteligente de columnas de competencias, contenidos y porcentajes.</p>
                  <p>3. <strong>Previsualización</strong>: Validación de coherencia antes de aplicar cambios.</p>
                  <p>4. <strong>Conversión</strong>: Creación automática de unidades editables en AulaCore.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500 font-medium">
                La ingesta masiva se habilitará en la siguiente etapa del plan de evolución curricular.
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsImportModalOpen(false)}
                className="text-xs font-bold"
              >
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
