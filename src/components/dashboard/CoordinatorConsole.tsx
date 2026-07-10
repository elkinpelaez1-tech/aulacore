'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
  Clock,
  Eye,
  ShieldAlert,
  Search,
  Filter,
  Users2,
  FileSignature,
  Activity,
  Layers,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { DocumentEngine } from '@/components/document-engine/DocumentEngine';
import { SchedulePreviewWidget } from './shared/SchedulePreviewWidget';
import { RectorExecutiveSummary } from './RectorExecutiveSummary';

export function CoordinatorConsole() {
  const [isDocEngineOpen, setIsDocEngineOpen] = useState(false);
  const [docEngineType, setDocEngineType] = useState<any>('rectoral_report');

  const [planeaciones, setPlaneaciones] = useState([
    {
      id: 'plan-1',
      teacher: 'Prof. Gómez',
      area: 'Ciencias Naturales',
      week: 'Semana 12 (Mayo)',
      topic: 'Fotosíntesis y Respiración Celular en Ecosistemas',
      status: 'pending' as const,
      grade: 'Grado 7° - Grupo A',
      dateSubmitted: '2 de Mayo, 2026',
      objectives: [
        'Comprender el proceso bioquímico de transformación de energía lumínica en energía química.',
        'Analizar el rol de la clorofila y los cloroplastos en células vegetales.',
        'Desarrollar un modelo experimental sencillo para evidenciar la producción de oxígeno en plantas acuáticas (Elodea).'
      ],
      methodology: 'Aprendizaje Basado en Indagación (ABI) con enfoque práctico en laboratorio virtual y microscopía básica.',
      activities: [
        'INICIO (15 min): Lluvia de ideas participativa con pregunta orientadora ¿Cómo se alimentan los árboles gigantes sin boca?',
        'DESARROLLO (45 min): Práctica de laboratorio con simulación interactiva PhET y montaje de campana con planta acuática.',
        'CIERRE (20 min): Elaboración de organizador gráfico (mapa conceptual cruzado) en parejas y puesta en común.'
      ],
      evaluation: 'Rúbrica formativa de 4 niveles valorando: participación en indagación, precisión en el modelo de cloroplastos y trabajo colaborativo.',
      resources: 'Simulador PhET, Microscopios ópticos, Muestras de Elodea, Guía de laboratorio impresa y Proyector audiovisual.',
      feedback: ''
    },
    {
      id: 'plan-2',
      teacher: 'Lic. Torres',
      area: 'Matemáticas (10-A)',
      week: 'Semana 12 (Mayo)',
      topic: 'Trigonometría Básica: Razones y Círculo Unitario',
      status: 'approved' as const,
      grade: 'Grado 10° - Grupo A',
      dateSubmitted: '1 de Mayo, 2026',
      objectives: [
        'Definir las razones trigonométricas fundamentales (seno, coseno, tangente) en triángulos rectángulos.',
        'Construir e interpretar las relaciones angulares en el círculo trigonométrico unitario.',
        'Resolver problemas contextualizados de cálculo de alturas y distancias inaccesibles usando trigonometría.'
      ],
      methodology: 'Aula Invertida (Flipped Classroom) combinado con Aprendizaje Basado en Problemas (ABP) de ingeniería básica.',
      activities: [
        'INICIO (10 min): Revisión de dudas del video pre-clase y quiz rápido gamificado en Kahoot.',
        'DESARROLLO (50 min): Taller de campo en el patio escolar midiendo alturas del edificio con teodolitos caseros (clinómetros).',
        'CIERRE (20 min): Socialización de cálculos en pizarra colaborativa y verificación de errores sistemáticos.'
      ],
      evaluation: 'Evaluación por portafolio de evidencias de campo (precisión de mediciones y claridad de justificación geométrica).',
      resources: 'Clinómetros caseros, Cintas métricas, Calculadoras científicas, Software GeoGebra móvil.',
      feedback: '¡Excelente propuesta metodológica al sacar la matemática al patio escolar! Aprobada felicitando el enfoque pedagógico.'
    },
    {
      id: 'plan-3',
      teacher: 'Esp. Ruiz',
      area: 'Sociales (8-B)',
      week: 'Semana 12 (Mayo)',
      topic: 'Revolución Industrial y Transformaciones Socioeconómicas',
      status: 'returned' as const,
      grade: 'Grado 8° - Grupo B',
      dateSubmitted: '30 de Abril, 2026',
      objectives: [
        'Identificar los factores económicos, geográficos y científicos que impulsaron la Primera Revolución Industrial en Inglaterra.',
        'Analizar el surgimiento del movimiento obrero y las condiciones laborales en las fábricas del siglo XIX.',
        'Debatir las similitudes entre la Revolución Industrial y la actual Revolución de la Inteligencia Artificial.'
      ],
      methodology: 'Seminario Socrático y Análisis Crítico de Fuentes Históricas Primarias.',
      activities: [
        'INICIO (15 min): Lectura dramatizada de testimonios reales de niños trabajadores en minas inglesas de 1832.',
        'DESARROLLO (45 min): Debate por equipos asignando roles: burguesía industrial, sindicatos obreros y parlamentarios.',
        'CIERRE (20 min): Redacción de ensayo corto comparativo con el impacto actual de la automatización tecnológica.'
      ],
      evaluation: 'Rúbrica de argumentación oral en el debate y coherencia argumentativa del ensayo individual.',
      resources: 'Dossier de fuentes primarias del siglo XIX, Extractos de "Tiempos Modernos" de Chaplin, Pizarra digital.',
      feedback: 'Falta especificar qué adaptaciones curriculares se aplicarán para los 2 estudiantes con dislexia del grupo 8-B en la lectura de fuentes primarias. Por favor ajustar.'
    }
  ]);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'view' | 'feedback'>('view');
  const [feedbackText, setFeedbackText] = useState('');

  const handleOpenPlanModal = (planId: string, tab: 'view' | 'feedback' = 'view') => {
    const p = planeaciones.find(x => x.id === planId);
    if (!p) return;
    setSelectedPlanId(planId);
    setModalTab(tab);
    setFeedbackText(p.feedback || '');
    setIsPlanModalOpen(true);
  };

  const handleApprovePlan = (planId?: string) => {
    const targetId = planId || selectedPlanId;
    if (!targetId) return;
    setPlaneaciones(prev => prev.map(item => {
      if (item.id === targetId) {
        return {
          ...item,
          status: 'approved',
          feedback: feedbackText.trim() || '¡Planeación aprobada por Coordinación Académica con felicitación metodológica!'
        };
      }
      return item;
    }));
    if (isPlanModalOpen) {
      setIsPlanModalOpen(false);
    }
  };

  const handleReturnPlan = (planId?: string) => {
    const targetId = planId || selectedPlanId;
    if (!targetId) return;
    if (!feedbackText.trim() && isPlanModalOpen && modalTab !== 'feedback') {
      setModalTab('feedback');
      return;
    }
    setPlaneaciones(prev => prev.map(item => {
      if (item.id === targetId) {
        return {
          ...item,
          status: 'returned',
          feedback: feedbackText.trim() || 'Se requieren ajustes en la rúbrica de evaluación y adaptaciones de aula.'
        };
      }
      return item;
    }));
    if (isPlanModalOpen) {
      setIsPlanModalOpen(false);
    }
  };

  const activePlan = planeaciones.find(x => x.id === selectedPlanId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. PRIMER PANTALLAZO COORDINACIÓN: RESUMEN INSTITUCIONAL & MÉTRICAS EJECUTIVAS */}
      <RectorExecutiveSummary roleTitle="coordinador" />

      {/* ========================================================= */}
      {/* 🏛️ SECCIÓN 2: HEADER & KPI CARDS                          */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Supervisión Institucional
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Consola de Coordinación
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Gestión académica, mallas curriculares y seguimiento convivencial.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setDocEngineType('curriculum_grid');
              setIsDocEngineOpen(true);
            }}
            variant="outline"
            className="border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-2 shadow-sm transition-all hover:bg-indigo-100"
          >
            <BookOpen className="w-4 h-4" />
            Exportar Mallas (PDF)
          </Button>
          <Button
            onClick={() => {
              setDocEngineType('rectoral_report');
              setIsDocEngineOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-2 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            Consolidado Institucional
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mallas Curriculares</p>
              <h3 className="text-2xl font-black text-slate-900">42/45</h3>
              <p className="text-[10px] font-bold text-emerald-600">93% Aprobadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Planeaciones Semanales</p>
              <h3 className="text-2xl font-black text-slate-900">12</h3>
              <p className="text-[10px] font-bold text-amber-600">Pendientes de Revisión</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Alertas Tempranas</p>
              <h3 className="text-2xl font-black text-slate-900">8</h3>
              <p className="text-[10px] font-bold text-red-600">Intervención Requerida</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Users2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Observadores Listos</p>
              <h3 className="text-2xl font-black text-slate-900">100%</h3>
              <p className="text-[10px] font-bold text-emerald-600">Actualización al día</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* 📚 SECCIÓN 2: CONTROL DE PLANEACIONES DOCENTES            */}
      {/* ========================================================= */}
      <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-indigo-700" />
              Auditoría de Planeaciones Docentes
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5 font-semibold">Validación semanal de contenido pedagógico por área.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar docente o área..."
                className="pl-8 pr-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 w-48"
              />
            </div>
            <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white">
              <TableRow>
                <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Docente / Área</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs">Semana Lectiva</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs">Unidad Temática</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs text-center">Estado</TableHead>
                <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planeaciones.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6">
                    <span className="font-black text-slate-900 block text-xs">{p.teacher}</span>
                    <span className="text-[10px] font-semibold text-slate-500">{p.area}</span>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-600">{p.week}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-700">{p.topic}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider inline-block",
                      p.status === 'pending' && "bg-amber-100 text-amber-700 border border-amber-200",
                      p.status === 'approved' && "bg-emerald-100 text-emerald-700 border border-emerald-200",
                      p.status === 'returned' && "bg-red-100 text-red-700 border border-red-200"
                    )}>
                      {p.status === 'pending' ? 'Por Revisar' : p.status === 'approved' ? 'Aprobada' : 'Devuelta'}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenPlanModal(p.id, 'view')}
                        title="Ver Ficha y Contenido Pedagógico (Modal Tarjeta)"
                        className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleApprovePlan(p.id)}
                        title="Aprobar Planeación Didáctica"
                        className={cn(
                          "h-7 w-7 cursor-pointer transition-colors",
                          p.status === 'approved' 
                            ? "text-emerald-600 bg-emerald-50 font-bold" 
                            : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        )}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenPlanModal(p.id, 'feedback')}
                        title="Devolver / Hacer Observación Pedagógica (Modal Tarjeta)"
                        className={cn(
                          "h-7 w-7 cursor-pointer transition-colors",
                          p.status === 'returned' 
                            ? "text-red-600 bg-red-50 font-bold" 
                            : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                        )}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* ⚠️ SECCIÓN 3: RADAR DE ALERTAS Y NOVEDADES                */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Radar de Alertas Institucionales
            </CardTitle>
            <span className="text-[9px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200">
              PRIORIDAD ALTA
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {[
                { date: 'Hoy, 08:30 AM', student: 'Mateo Gómez (10-A)', type: 'Inasistencia Reiterada', desc: 'Acumula 3 fallas sin justificación médica este periodo.', action: 'Llamado a Acudiente' },
                { date: 'Ayer, 14:15 PM', student: 'Sofía Ramírez (10-A)', type: 'Bajo Rendimiento', desc: 'Reporte preventivo en Matemáticas (Promedio: 3.20)', action: 'Citar Comité' }
              ].map((alert, i) => (
                <div key={i} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{alert.student}</h4>
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide">{alert.type}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{alert.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mb-3">{alert.desc}</p>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] font-bold text-slate-700">
                    {alert.action} <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* 📋 SECCIÓN 4: REPORTE DE MALLAS CURRICULARES              */}
        {/* ========================================================= */}
        <Card className="border-slate-200 shadow-sm bg-white rounded-xl">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Validación de Mallas Curriculares
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-3">
              {[
                { area: 'Matemáticas Avanzadas (10°-11°)', progress: 100, status: 'Aprobada' },
                { area: 'Ciencias y Biología (6°-9°)', progress: 85, status: 'En Revisión' },
                { area: 'Humanidades y Lenguaje', progress: 40, status: 'Devuelta' },
              ].map((mesh, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">{mesh.area}</span>
                    <span className={cn(
                      "text-[10px] uppercase",
                      mesh.status === 'Aprobada' ? "text-emerald-600" :
                      mesh.status === 'Devuelta' ? "text-red-600" : "text-amber-600"
                    )}>{mesh.status}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        mesh.status === 'Aprobada' ? "bg-emerald-500" :
                        mesh.status === 'Devuelta' ? "bg-red-500" : "bg-amber-500"
                      )} 
                      style={{ width: `${mesh.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs h-8">
                Ver Directorio Completo de Mallas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* 🕒 SECCIÓN 5: PLANEACIÓN DE HORARIOS                      */}
        {/* ========================================================= */}
        <SchedulePreviewWidget role="coordinator" title="Horarios y Mallas Institucionales" />
      </div>

      <DocumentEngine
        isOpen={isDocEngineOpen}
        onClose={() => setIsDocEngineOpen(false)}
        documentType={docEngineType}
        studentName="N/A (Reporte Institucional)"
        courseName="Todos los Grados"
        metadataPayload={{ origin: 'coordinacion' }}
      />

      {/* Modal Tarjeta Centrada para Auditoría y Revisión de Planeaciones Docentes */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="w-[96vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-[85vh] max-h-[85vh] p-0 flex flex-col bg-slate-50 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200 gap-0">
          {activePlan && (
            <>
              {/* Top Status Decorator Bar */}
              <div className={cn(
                "w-full h-3 shrink-0",
                activePlan.status === 'approved' ? "bg-emerald-500" :
                activePlan.status === 'returned' ? "bg-red-500" : "bg-amber-500"
              )} />

              {/* Header Info & Tabs */}
              <div className="bg-white px-6 py-4 border-b border-slate-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {activePlan.area}
                    </span>
                    <span className="text-xs font-bold text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-600">{activePlan.grade}</span>
                    <span className="text-xs font-bold text-slate-400">•</span>
                    <span className="text-xs font-bold text-indigo-600">{activePlan.week}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {activePlan.topic}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Presentado por: <span className="text-slate-800 font-bold">{activePlan.teacher}</span> ({activePlan.dateSubmitted})
                  </p>
                </div>

                {/* Tabs & Status Badge */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 gap-1">
                    <button
                      type="button"
                      onClick={() => setModalTab('view')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer",
                        modalTab === 'view'
                          ? "bg-white text-indigo-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" /> Contenido Pedagógico
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalTab('feedback')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer relative",
                        modalTab === 'feedback'
                          ? "bg-white text-indigo-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Auditoría y Observaciones
                      {activePlan.feedback && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <ScrollArea className="flex-1 h-full">
                  <div className="p-6 pb-12 space-y-6">
                    {modalTab === 'view' ? (
                      <>
                        {/* Status Alert if feedback exists */}
                        {activePlan.feedback && (
                          <div className={cn(
                            "p-4 rounded-xl border flex items-start gap-3 shadow-sm",
                            activePlan.status === 'approved'
                              ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                              : "bg-red-50/80 border-red-200 text-red-950"
                          )}>
                            {activePlan.status === 'approved' ? (
                              <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider mb-1">
                                {activePlan.status === 'approved' ? 'Observación de Aprobación (Coordinación)' : 'Observación para Ajuste Curricular'}
                              </h4>
                              <p className="text-xs font-semibold leading-relaxed">
                                "{activePlan.feedback}"
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Objectives Section */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                          <h4 className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Objetivos de Aprendizaje y Competencias
                          </h4>
                          <div className="space-y-2">
                            {activePlan.objectives.map((obj, idx) => (
                              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                  {idx + 1}
                                </span>
                                <p className="text-xs font-bold text-slate-800 leading-relaxed">{obj}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Methodology Section */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-600" /> Estrategia Metodológica y Didáctica
                          </h4>
                          <p className="text-xs font-semibold text-slate-700 leading-relaxed bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/80">
                            {activePlan.methodology}
                          </p>
                        </div>

                        {/* Activities Section */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-600" /> Secuencia Didáctica de Aula
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {activePlan.activities.map((act, idx) => {
                              const title = idx === 0 ? 'Fase de Inicio' : idx === 1 ? 'Fase de Desarrollo' : 'Fase de Cierre';
                              const color = idx === 0 ? 'border-amber-200 bg-amber-50/30' : idx === 1 ? 'border-indigo-200 bg-indigo-50/30' : 'border-emerald-200 bg-emerald-50/30';
                              const badge = idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800';
                              return (
                                <div key={idx} className={cn("p-3.5 rounded-xl border flex flex-col gap-2", color)}>
                                  <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded self-start tracking-wider", badge)}>
                                    {title}
                                  </span>
                                  <p className="text-xs font-bold text-slate-800 leading-relaxed">{act}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Evaluation and Resources */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Evaluación y Rúbricas
                            </h4>
                            <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                              {activePlan.evaluation}
                            </p>
                          </div>
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                              <Layers className="w-4 h-4 text-indigo-600" /> Materiales y TIC
                            </h4>
                            <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                              {activePlan.resources}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* AUDITORÍA Y OBSERVACIONES TAB */
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4.5 h-4.5 text-indigo-600" />
                            Retroalimentación Pedagógica del Coordinador
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            Escribe las observaciones metodológicas, ajustes requeridos en rúbrica o felicitaciones para el docente.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            Observaciones para el docente ({activePlan.teacher}):
                          </label>
                          <textarea
                            value={feedbackText}
                            onChange={e => setFeedbackText(e.target.value)}
                            placeholder="Ej. Excelente secuencia didáctica, pero se recomienda especificar adaptaciones curriculares para estudiantes con DUA en la fase de desarrollo..."
                            className="w-full border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-slate-800 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 min-h-[140px] shadow-sm resize-none transition-all"
                          />
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-slate-500 block mb-2 uppercase tracking-wide">
                            Etiquetas Rápidas de Auditoría (Haz clic para insertar):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              'Excelente propuesta metodológica',
                              'Faltan adaptaciones DUA',
                              'Detallar rúbrica de evaluación',
                              'Ajustar tiempos de la sesión',
                              'Incluir materiales TIC interactivos'
                            ].map((tag, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setFeedbackText(prev => prev ? `${prev} • ${tag}.` : `${tag}.`)}
                                className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200/60 transition-colors cursor-pointer"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Bottom Actions Footer */}
              <div className="bg-white px-6 py-4 border-t border-slate-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Estado de Auditoría:</span>
                  <span className={cn(
                    "text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block",
                    activePlan.status === 'pending' && "bg-amber-100 text-amber-800 border border-amber-200",
                    activePlan.status === 'approved' && "bg-emerald-100 text-emerald-800 border border-emerald-200",
                    activePlan.status === 'returned' && "bg-red-100 text-red-800 border border-red-200"
                  )}>
                    {activePlan.status === 'pending' ? 'Por Revisar' : activePlan.status === 'approved' ? 'Aprobada por Coordinación' : 'Devuelta con Observaciones'}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPlanModalOpen(false)}
                    className="text-xs font-bold rounded-xl px-4 cursor-pointer"
                  >
                    Cerrar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleReturnPlan()}
                    className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-extrabold text-xs rounded-xl px-4 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Devolver con Observación
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleApprovePlan()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl px-5 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar Planeación
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
