'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Send,
  Plus,
  Trash2,
  GripVertical,
  BookOpen,
  Target,
  BrainCircuit,
  MessageSquareQuote,
  Activity,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface Competency {
  id: string;
  type: 'saber' | 'hacer' | 'ser' | 'convivir';
  description: string;
}

export interface ContenidoItem {
  id: string;
  periodLabel: string;
  content: string;
}

export interface EvaluationItem {
  id: string;
  component: string;
  activities: string;
  percentage: number;
}

export interface CurriculumDraft {
  objetivoGeneral: string;
  competencies: Competency[];
  contenidos: ContenidoItem[];
  metodologia: string;
  recursos: string;
  evaluations: EvaluationItem[];
  status: 'draft' | 'submitted' | 'revision' | 'approved';
  subject?: string;
  grade?: string;
  area?: string;
  period?: string;
  axisTopic?: string;
  updatedAt?: string;
}

export interface CurriculumBuilderProps {
  onBack: () => void;
  subject?: string;
  grade?: string;
  area?: string;
  period?: string;
  axisTopic?: string;
  curriculumId?: string;
  institutionId?: string;
  initialData?: CurriculumDraft;
}

const DEFAULT_OBJETIVO =
  'Desarrollar habilidades de pensamiento variacional para modelar situaciones de cambio continuo a través del concepto de límite.';

const DEFAULT_COMPETENCIES: Competency[] = [
  { id: '1', type: 'saber', description: 'Comprende el concepto de límite y continuidad en funciones reales.' }
];

const DEFAULT_CONTENIDOS: ContenidoItem[] = [
  { id: '1', periodLabel: 'Semana 1-2', content: 'Concepto intuitivo de límite, límites laterales' },
  { id: '2', periodLabel: 'Semana 3-4', content: 'Límites infinitos y al infinito, asíntotas' }
];

const DEFAULT_METODOLOGIA =
  'Aprendizaje Basado en Problemas (ABP): Los estudiantes modelarán situaciones de crecimiento poblacional y decaimiento radiactivo usando límites.';

const DEFAULT_RECURSOS = 'Plataforma GeoGebra para graficación en 2D, Guía taller en PDF.';

const DEFAULT_EVALUATIONS: EvaluationItem[] = [
  {
    id: '1',
    component: 'Seguimiento (conceptual y procedimental)',
    activities: '• Evaluaciones de cada tema escritas\n• Evaluaciones orales\n• Participación en clase\n• Sustentación de Talleres',
    percentage: 70
  },
  {
    id: '2',
    component: 'Evaluación Acumulativa',
    activities: 'Prueba escrita de selección múltiple',
    percentage: 20
  },
  {
    id: '3',
    component: 'Actitudinal (autoevaluación, evaluación y heteroevaluación)',
    activities: '• Comportamiento en clase\n• Responsabilidad\n• Puntualidad',
    percentage: 10
  }
];

export function CurriculumBuilder({
  onBack,
  subject = 'Cálculo Diferencial',
  grade = '11°',
  area = 'Matemáticas',
  period = 'Periodo 1',
  axisTopic = 'Funciones y Límites',
  curriculumId = 'malla-default',
  institutionId,
  initialData
}: CurriculumBuilderProps) {
  // Clave de almacenamiento aislada por institución y contexto curricular
  const effectiveInstitutionId =
    institutionId ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('aulacore-institution-id') ||
        localStorage.getItem('institution_id') ||
        'institucion-default'
      : 'institucion-default');

  const sanitizeKeyPart = (val: string) => val.toLowerCase().replace(/[^a-z0-9]/gi, '_');

  const storageKey = `aulacore-curriculum-draft-${sanitizeKeyPart(effectiveInstitutionId)}-${sanitizeKeyPart(curriculumId)}-${sanitizeKeyPart(subject)}-${sanitizeKeyPart(grade)}-${sanitizeKeyPart(period)}`;

  // Estado del flujo
  const [status, setStatus] = useState<'draft' | 'submitted' | 'revision' | 'approved'>(
    initialData?.status || 'draft'
  );

  // Campos controlados
  const [objetivoGeneral, setObjetivoGeneral] = useState<string>(
    initialData?.objetivoGeneral || DEFAULT_OBJETIVO
  );
  const [competencies, setCompetencies] = useState<Competency[]>(
    initialData?.competencies || DEFAULT_COMPETENCIES
  );
  const [contenidos, setContenidos] = useState<ContenidoItem[]>(
    initialData?.contenidos || DEFAULT_CONTENIDOS
  );
  const [metodologia, setMetodologia] = useState<string>(
    initialData?.metodologia || DEFAULT_METODOLOGIA
  );
  const [recursos, setRecursos] = useState<string>(
    initialData?.recursos || DEFAULT_RECURSOS
  );
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>(
    initialData?.evaluations || DEFAULT_EVALUATIONS
  );

  // Estados de control de persistencia e interfaz
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAutosaving, setIsAutosaving] = useState(false);

  // Construir objeto de borrador serializable
  const buildDraft = (overrideStatus?: 'draft' | 'submitted' | 'revision' | 'approved'): CurriculumDraft => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      objetivoGeneral,
      competencies,
      contenidos,
      metodologia,
      recursos,
      evaluations,
      status: overrideStatus || status,
      subject,
      grade,
      area,
      period,
      axisTopic,
      updatedAt: `Hoy, ${timeFormatted}`
    };
  };

  // 1. Cargar borrador al montar antes de activar el autosave
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (initialData) {
        if (initialData.objetivoGeneral !== undefined) setObjetivoGeneral(initialData.objetivoGeneral);
        if (Array.isArray(initialData.competencies) && initialData.competencies.length > 0) setCompetencies(initialData.competencies);
        if (Array.isArray(initialData.contenidos) && initialData.contenidos.length > 0) setContenidos(initialData.contenidos);
        if (initialData.metodologia !== undefined) setMetodologia(initialData.metodologia);
        if (initialData.recursos !== undefined) setRecursos(initialData.recursos);
        if (Array.isArray(initialData.evaluations) && initialData.evaluations.length > 0) setEvaluations(initialData.evaluations);
        if (initialData.status) setStatus(initialData.status);
        if (initialData.updatedAt) setLastSaved(initialData.updatedAt);
        setIsDraftLoaded(true);
        return;
      }

      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: CurriculumDraft = JSON.parse(stored);
        if (parsed) {
          if (parsed.objetivoGeneral !== undefined) setObjetivoGeneral(parsed.objetivoGeneral);
          if (Array.isArray(parsed.competencies) && parsed.competencies.length > 0) setCompetencies(parsed.competencies);
          if (Array.isArray(parsed.contenidos) && parsed.contenidos.length > 0) setContenidos(parsed.contenidos);
          if (parsed.metodologia !== undefined) setMetodologia(parsed.metodologia);
          if (parsed.recursos !== undefined) setRecursos(parsed.recursos);
          if (Array.isArray(parsed.evaluations) && parsed.evaluations.length > 0) setEvaluations(parsed.evaluations);
          if (parsed.status) setStatus(parsed.status);
          if (parsed.updatedAt) setLastSaved(parsed.updatedAt);
        }
      }
    } catch (err) {
      console.warn('Error reading curriculum draft from localStorage:', err);
    } finally {
      setIsDraftLoaded(true);
    }
  }, [storageKey]);

  // 2. Autosave local seguro (con debounce de 1200ms, solo después de cargar el borrador y mientras sea draft)
  useEffect(() => {
    if (!isDraftLoaded) return;
    if (status !== 'draft') return; // No sobreescribir si está bloqueado o en revisión

    setIsAutosaving(true);
    const timer = setTimeout(() => {
      // Verificar que el estado siga siendo draft antes de escribir
      if (status !== 'draft') {
        setIsAutosaving(false);
        return;
      }
      try {
        const draft = buildDraft();
        localStorage.setItem(storageKey, JSON.stringify(draft));
        setLastSaved(draft.updatedAt || 'Autoguardado');
      } catch (err) {
        console.warn('Autosave local error:', err);
      } finally {
        setIsAutosaving(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    isDraftLoaded,
    objetivoGeneral,
    competencies,
    contenidos,
    metodologia,
    recursos,
    evaluations,
    status
  ]);

  // Manejo del botón "Guardar Borrador"
  const handleSaveDraft = () => {
    try {
      const draft = buildDraft();
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setLastSaved(draft.updatedAt || 'Guardado');
      setToastMessage('Borrador guardado correctamente');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Error guardando borrador:', err);
    }
  };

  // Manejo de Competencias
  const handleAddCompetency = () => {
    setCompetencies([
      ...competencies,
      { id: Date.now().toString(), type: 'hacer', description: '' }
    ]);
  };

  const handleUpdateCompetency = (id: string, value: string) => {
    setCompetencies(competencies.map(c => c.id === id ? { ...c, description: value } : c));
  };

  const handleDeleteCompetency = (id: string) => {
    setCompetencies(competencies.filter(c => c.id !== id));
  };

  // Manejo de Contenidos Secuenciados
  const handleAddContenido = () => {
    const nextStart = contenidos.length * 2 + 1;
    setContenidos([
      ...contenidos,
      {
        id: Date.now().toString(),
        periodLabel: `Semana ${nextStart}-${nextStart + 1}`,
        content: ''
      }
    ]);
  };

  const handleUpdateContenido = (id: string, field: 'periodLabel' | 'content', value: string) => {
    setContenidos(contenidos.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleDeleteContenido = (id: string) => {
    setContenidos(contenidos.filter(item => item.id !== id));
  };

  // Manejo de Evaluación
  const handleAddEvaluation = () => {
    setEvaluations([
      ...evaluations,
      { id: Date.now().toString(), component: '', activities: '', percentage: 0 }
    ]);
  };

  // Enviar a Revisión: Construye, persiste inmediatamente en localStorage y bloquea la interfaz
  const submitGrid = () => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = `Hoy, ${timeFormatted}`;

    // 1. Construir el CurriculumDraft actual completo con status 'submitted' y nuevo updatedAt
    const submittedDraft: CurriculumDraft = {
      objetivoGeneral,
      competencies,
      contenidos,
      metodologia,
      recursos,
      evaluations,
      status: 'submitted',
      subject,
      grade,
      area,
      period,
      axisTopic,
      updatedAt: formattedDate
    };

    // 2. Persistir inmediatamente en localStorage usando exactamente la misma clave aislada existente
    try {
      localStorage.setItem(storageKey, JSON.stringify(submittedDraft));

      // 3. Tras persistir correctamente, actualizar updatedAt, cambiar estado a submitted y bloquear
      setLastSaved(formattedDate);
      setStatus('submitted');
      setToastMessage('Planeación enviada a revisión y bloqueada');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Error persistiendo planeación enviada en localStorage:', err);
      setToastMessage('Error al guardar planeación enviada');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Simulación IA existente preservada
  const simulateAiSuggestion = () => {
    setIsAiSuggesting(true);
    setTimeout(() => {
      setCompetencies([
        ...competencies,
        { id: Date.now().toString(), type: 'hacer', description: 'Resuelve problemas geométricos aplicando la derivada de una función.' },
        { id: (Date.now() + 1).toString(), type: 'ser', description: 'Valora la utilidad de los modelos matemáticos en situaciones del entorno real.' }
      ]);
      setIsAiSuggesting(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-6xl mx-auto">
      
      {/* 🚀 HEADER CONTEXTUAL */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border flex items-center gap-1.5",
                status === 'draft' ? "bg-slate-100 text-slate-600 border-slate-200" :
                status === 'submitted' ? "bg-amber-100 text-amber-700 border-amber-200" :
                status === 'revision' ? "bg-red-100 text-red-700 border-red-200" :
                "bg-emerald-100 text-emerald-700 border-emerald-200"
              )}>
                {status === 'draft' && <Clock className="w-3.5 h-3.5" />}
                {status === 'submitted' && <Send className="w-3.5 h-3.5" />}
                {status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                Estado: {status.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 flex items-center gap-1">
                <History className="w-3 h-3" /> {lastSaved ? `Guardado (${lastSaved})` : 'v1.0 (Borrador local)'}
              </span>
              {isAutosaving && (
                <span className="text-[9px] font-bold text-indigo-500 animate-pulse flex items-center gap-1">
                  Autoguardando...
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{subject} - {grade}</h2>
            <p className="text-xs text-slate-500 font-medium">{period} • Eje temático: {axisTopic}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {status === 'draft' || status === 'revision' ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                className="h-9 gap-2 text-slate-600 font-bold text-xs hover:bg-slate-50 border-slate-300 shadow-sm" 
                disabled={isAiSuggesting}
              >
                <Save className="w-4 h-4 text-slate-600" /> Guardar Borrador
              </Button>
              <Button 
                onClick={submitGrid}
                className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
              >
                <Send className="w-4 h-4" /> Enviar a Revisión
              </Button>
            </>
          ) : (
            <Button variant="outline" className="h-9 gap-2 text-amber-700 bg-amber-50 border-amber-200 font-bold text-xs" disabled>
              Bloqueado (En Revisión)
            </Button>
          )}
        </div>
      </div>

      {/* 🧩 SECCIÓN DE CONSTRUCCIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: ESTRUCTURA PRINCIPAL */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tarjeta de Metadatos */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 px-5 py-3">
              <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Objetivo General del Periodo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <textarea 
                className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg p-3 min-h-[80px] focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-y disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                placeholder="Describe el propósito principal de aprendizaje para este periodo..."
                value={objetivoGeneral}
                onChange={(e) => setObjetivoGeneral(e.target.value)}
                disabled={status === 'submitted' || status === 'approved'}
              />
            </CardContent>
          </Card>

          {/* Tarjeta de Competencias */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-emerald-600" />
                Matriz de Competencias
              </CardTitle>
              {status === 'draft' && (
                <Button size="sm" variant="ghost" onClick={simulateAiSuggestion} className="h-7 text-xs font-bold text-indigo-600 hover:bg-indigo-50" disabled={isAiSuggesting}>
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {isAiSuggesting ? 'Generando...' : 'Sugerir con IA'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {competencies.map((comp, index) => (
                  <div key={comp.id} className="p-4 flex items-start gap-3 group hover:bg-slate-50/50 transition-colors">
                    <div className="mt-2 cursor-move text-slate-300 group-hover:text-slate-500">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <select 
                          className="text-xs font-bold bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                          value={comp.type}
                          disabled={status !== 'draft'}
                          onChange={(e) => {
                            const newComps = [...competencies];
                            newComps[index].type = e.target.value as any;
                            setCompetencies(newComps);
                          }}
                        >
                          <option value="saber">Saber (Cognitivo)</option>
                          <option value="hacer">Hacer (Procedimental)</option>
                          <option value="ser">Ser (Actitudinal)</option>
                          <option value="convivir">Convivir (Social)</option>
                        </select>
                      </div>
                      <textarea 
                        className="w-full text-sm font-medium text-slate-700 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-0 p-0 resize-none transition-colors disabled:text-slate-600 disabled:cursor-not-allowed"
                        placeholder="Redacta la competencia..."
                        value={comp.description}
                        onChange={(e) => handleUpdateCompetency(comp.id, e.target.value)}
                        disabled={status !== 'draft'}
                        rows={2}
                      />
                    </div>
                    {status === 'draft' && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteCompetency(comp.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {status === 'draft' && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                  <Button variant="outline" size="sm" onClick={handleAddCompetency} className="w-full border-dashed border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400 font-bold text-xs">
                    <Plus className="w-4 h-4 mr-2" /> Agregar Competencia
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tarjeta de Contenidos Secuenciados */}
          <Card className="border-slate-200 shadow-sm overflow-hidden animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardHeader className="bg-slate-50 border-b border-slate-100 px-5 py-3">
              <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Contenidos Secuenciados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="divide-y divide-slate-100 space-y-3">
                {contenidos.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 pt-2 first:pt-0 group">
                    <input
                      value={item.periodLabel}
                      onChange={(e) => handleUpdateContenido(item.id, 'periodLabel', e.target.value)}
                      disabled={status !== 'draft'}
                      className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1.5 rounded border-0 outline-none w-24 text-center disabled:opacity-80 disabled:cursor-not-allowed"
                      placeholder="Semana..."
                    />
                    <Input 
                      placeholder="Ej. Límite de una función real, propiedades básicas" 
                      className="text-sm h-9 border-slate-200 flex-1 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed" 
                      disabled={status !== 'draft'} 
                      value={item.content}
                      onChange={(e) => handleUpdateContenido(item.id, 'content', e.target.value)}
                    />
                    {status === 'draft' && contenidos.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => handleDeleteContenido(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {status === 'draft' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleAddContenido}
                  className="w-full text-slate-500 font-bold text-xs mt-2 border border-dashed border-slate-200 hover:border-slate-400"
                >
                  <Plus className="w-4 h-4 mr-2" /> Agregar Contenido
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tarjeta de Metodología */}
          <Card className="border-slate-200 shadow-sm overflow-hidden animate-fade-in" style={{ animationDelay: '150ms' }}>
            <CardHeader className="bg-slate-50 border-b border-slate-100 px-5 py-3">
              <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-600" />
                Metodología y Recursos Didácticos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Estrategia Metodológica</label>
                <textarea 
                  className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg p-3 min-h-[60px] focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-y disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                  placeholder="Ej. Aprendizaje Basado en Problemas, Aula Invertida..."
                  value={metodologia}
                  onChange={(e) => setMetodologia(e.target.value)}
                  disabled={status !== 'draft'}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Recursos (Físicos y Digitales)</label>
                <Input 
                  placeholder="Ej. Laboratorio virtual, Geogebra, calculadoras..." 
                  className="text-sm border-slate-200 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed" 
                  disabled={status !== 'draft'} 
                  value={recursos}
                  onChange={(e) => setRecursos(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta de Evaluación */}
          <Card className="border-slate-200 shadow-sm overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
            <CardHeader className="bg-slate-50 border-b border-slate-100 px-5 py-3">
              <CardTitle className="text-sm font-black text-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Plan de Evaluación (Matriz)
                </div>
                <div className="text-xs font-bold px-2 py-1 bg-slate-200 rounded text-slate-700">
                  Total: {evaluations.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0)}%
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100/50 text-slate-600 text-xs uppercase font-black">
                    <tr>
                      <th className="px-4 py-3 w-1/4 border-b border-slate-200">Componente</th>
                      <th className="px-4 py-3 w-2/4 border-b border-slate-200">Descripción de Actividades</th>
                      <th className="px-4 py-3 w-1/4 border-b border-slate-200 text-center">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {evaluations.map((ev, index) => (
                      <tr key={ev.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 align-top">
                          <textarea
                            className="w-full text-xs font-bold text-slate-800 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-0 p-1 resize-none disabled:text-slate-600 disabled:cursor-not-allowed"
                            value={ev.component}
                            onChange={(e) => {
                              const newEvals = [...evaluations];
                              newEvals[index].component = e.target.value;
                              setEvaluations(newEvals);
                            }}
                            disabled={status !== 'draft'}
                            rows={3}
                            placeholder="Ej. Seguimiento..."
                          />
                        </td>
                        <td className="p-3 align-top border-l border-slate-100">
                          <textarea
                            className="w-full text-xs font-medium text-slate-700 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-0 p-1 resize-none disabled:text-slate-600 disabled:cursor-not-allowed"
                            value={ev.activities}
                            onChange={(e) => {
                              const newEvals = [...evaluations];
                              newEvals[index].activities = e.target.value;
                              setEvaluations(newEvals);
                            }}
                            disabled={status !== 'draft'}
                            rows={4}
                            placeholder="• Actividad 1..."
                          />
                        </td>
                        <td className="p-3 align-top border-l border-slate-100 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Input
                              type="number"
                              className="w-16 h-8 text-center text-xs font-black bg-slate-50 border-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed"
                              value={ev.percentage}
                              onChange={(e) => {
                                const newEvals = [...evaluations];
                                newEvals[index].percentage = parseInt(e.target.value) || 0;
                                setEvaluations(newEvals);
                              }}
                              disabled={status !== 'draft'}
                            />
                            <span className="font-bold text-slate-500">%</span>
                            {status === 'draft' && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 ml-2 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setEvaluations(evaluations.filter(e => e.id !== ev.id))}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {status === 'draft' && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                  <Button variant="outline" size="sm" onClick={handleAddEvaluation} className="w-full border-dashed border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400 font-bold text-xs">
                    <Plus className="w-4 h-4 mr-2" /> Agregar Nuevo Componente de Evaluación
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: METADATOS Y FEEDBACK */}
        <div className="space-y-6">
          <Card className="border-indigo-100 shadow-sm bg-indigo-50/50 overflow-hidden">
            <CardHeader className="border-b border-indigo-100 px-5 py-3 bg-white">
              <CardTitle className="text-sm font-black text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Asistente Pedagógico (IA)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm text-slate-700 font-medium">
              <p className="mb-3 text-xs leading-relaxed text-indigo-800/80">
                Basado en tu asignatura, te sugiero incluir <strong>indicadores de desempeño</strong> asociados al Pensamiento Variacional.
              </p>
              <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm text-xs space-y-2">
                <div className="flex gap-2 items-start">
                  <Plus className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0 cursor-pointer hover:scale-110" />
                  <span>Calcula límites al infinito usando propiedades algebraicas.</span>
                </div>
                <div className="flex gap-2 items-start">
                  <Plus className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0 cursor-pointer hover:scale-110" />
                  <span>Identifica discontinuidades en gráficas de funciones.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {status === 'revision' && (
            <Card className="border-red-200 shadow-sm bg-red-50 overflow-hidden animate-fade-in">
              <CardHeader className="border-b border-red-200 px-5 py-3 bg-white">
                <CardTitle className="text-sm font-black text-red-900 flex items-center gap-2">
                  <MessageSquareQuote className="w-4 h-4 text-red-600" />
                  Feedback del Coordinador
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-red-800 leading-relaxed italic">
                  &quot;Profesor, por favor incluir evidencias concretas de tipo &apos;Producto&apos; para las competencias del Hacer. La redacción de la competencia cognitiva está muy bien.&quot;
                </p>
                <div className="mt-3 flex justify-end">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Hoy, 09:30 AM</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-800 shadow-md bg-slate-900 overflow-hidden text-white">
            <CardHeader className="bg-slate-900 border-b border-slate-800 px-5 py-3">
              <CardTitle className="text-sm font-black text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                Integración Curricular
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-xs font-semibold text-slate-300 divide-y divide-slate-800">
              <div className="p-4 flex items-center justify-between">
                <span>Indicadores Evaluados</span>
                <span className="text-emerald-400 font-black">0 / 4</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span>Conexión a Boletín</span>
                <span className="text-amber-400 font-black">Pendiente Aprobación</span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* 🔔 NOTIFICACIÓN VISUAL TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200 border border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
