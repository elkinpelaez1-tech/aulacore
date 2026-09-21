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
  History,
  HardDrive,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useRole } from '@/providers/role-provider';
import {
  getCurriculumUnit,
  saveCurriculumUnit,
  submitCurriculumUnit,
  CurriculumDraft
} from '@/lib/services/curriculum-units';

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

// Re-exportar CurriculumDraft para mantener compatibilidad con imports existentes
export type { CurriculumDraft };

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
  const { user, profile } = useAuth();
  const { activeInstitution, institutionId: contextInstId } = useRole();

  // Identidad institucional
  const effectiveInstitutionId =
    institutionId ||
    activeInstitution?.id ||
    contextInstId ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('aulacore-institution-id') ||
        localStorage.getItem('institution_id') ||
        'institucion-default'
      : 'institucion-default');

  const currentUserId = user?.id || null;
  const currentUserName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user?.email || 'Docente'
    : user?.email || 'Docente';

  // Clave de almacenamiento local exactamente compatible con la versión anterior
  const sanitizeKeyPart = (val: string) => val.toLowerCase().replace(/[^a-z0-9]/gi, '_');

  const storageKey = `aulacore-curriculum-draft-${sanitizeKeyPart(effectiveInstitutionId)}-${sanitizeKeyPart(curriculumId)}-${sanitizeKeyPart(subject)}-${sanitizeKeyPart(grade)}-${sanitizeKeyPart(period)}`;

  // Estado del ciclo de vida curricular
  const [status, setStatus] = useState<'draft' | 'submitted' | 'revision' | 'approved'>(
    initialData?.status || 'draft'
  );

  // Campos pedagógicos controlados
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

  // Estados de control de persistencia y sincronización
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado de sincronización institucional ('local' | 'synced' | 'pending' | 'error')
  const [syncStatus, setSyncStatus] = useState<'local' | 'synced' | 'pending' | 'error'>('local');
  const [unsyncedLocalDraft, setUnsyncedLocalDraft] = useState<CurriculumDraft | null>(null);
  const [showLocalDraftBanner, setShowLocalDraftBanner] = useState(false);

  // Helper para asignar campos pedagógicos al estado de React
  const applyDraftToState = (
    draft: CurriculumDraft,
    overrideStatus?: 'draft' | 'submitted' | 'revision' | 'approved',
    overrideUpdatedAt?: string
  ) => {
    if (draft.objetivoGeneral !== undefined) setObjetivoGeneral(draft.objetivoGeneral);
    if (Array.isArray(draft.competencies) && draft.competencies.length > 0) setCompetencies(draft.competencies);
    if (Array.isArray(draft.contenidos) && draft.contenidos.length > 0) setContenidos(draft.contenidos);
    if (draft.metodologia !== undefined) setMetodologia(draft.metodologia);
    if (draft.recursos !== undefined) setRecursos(draft.recursos);
    if (Array.isArray(draft.evaluations) && draft.evaluations.length > 0) setEvaluations(draft.evaluations);
    if (overrideStatus || draft.status) setStatus(overrideStatus || draft.status);
    if (overrideUpdatedAt || draft.updatedAt) setLastSaved(overrideUpdatedAt || draft.updatedAt || null);
  };

  // Construir objeto serializable de borrador
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

  // ============================================================================
  // 1. CARGA INICIAL: Prioridad Supabase -> localStorage -> default
  // ============================================================================
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (typeof window === 'undefined') return;

      // Si se pasó initialData como prop, aplicarla como base inmediata
      if (initialData) {
        applyDraftToState(initialData, initialData.status, initialData.updatedAt);
      }

      try {
        let supabaseFound = false;

        // A. Consultar primero Supabase
        if (effectiveInstitutionId && effectiveInstitutionId !== 'institucion-default') {
          const { data: unitRecord, error: sbError } = await getCurriculumUnit({
            institutionId: effectiveInstitutionId,
            academicYear: '2026',
            subject,
            grade,
            period
          });

          if (!sbError && unitRecord && unitRecord.content) {
            supabaseFound = true;
            if (isMounted) {
              const formattedTime = unitRecord.updated_at
                ? `Hoy, ${new Date(unitRecord.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : undefined;
              applyDraftToState(unitRecord.content, unitRecord.status as any, formattedTime);
              setSyncStatus('synced');
              setIsDraftLoaded(true);
            }
          }
        }

        // B. Si NO existe en Supabase, verificar si hay un borrador en localStorage
        if (!supabaseFound && isMounted) {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            try {
              const parsed: CurriculumDraft = JSON.parse(stored);
              if (parsed) {
                // Alerta no destructiva para no sobrescribir sin autorización
                setUnsyncedLocalDraft(parsed);
                setShowLocalDraftBanner(true);
                setSyncStatus('pending');
              }
            } catch (err) {
              console.warn('Error leyendo borrador local:', err);
            }
          } else {
            // Ni Supabase ni localStorage: usar valores por defecto
            setSyncStatus('local');
          }
          setIsDraftLoaded(true);
        }
      } catch (err) {
        console.warn('Error en carga inicial curricular:', err);
        if (isMounted) {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            try {
              const parsed: CurriculumDraft = JSON.parse(stored);
              if (parsed) {
                setUnsyncedLocalDraft(parsed);
                setShowLocalDraftBanner(true);
              }
            } catch {}
          }
          setSyncStatus('error');
          setIsDraftLoaded(true);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [storageKey, effectiveInstitutionId, subject, grade, period]);

  // Cargar borrador local explícitamente a petición del usuario
  const handleLoadLocalDraft = () => {
    if (unsyncedLocalDraft) {
      applyDraftToState(unsyncedLocalDraft, unsyncedLocalDraft.status, unsyncedLocalDraft.updatedAt);
      setShowLocalDraftBanner(false);
      setSyncStatus('pending');
      setToastMessage('Borrador local cargado en el editor');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleDismissLocalBanner = () => {
    setShowLocalDraftBanner(false);
  };

  // ============================================================================
  // 2. AUTOSAVE LOCAL (debounce 1200ms) - NUNCA satura Supabase
  // ============================================================================
  useEffect(() => {
    if (!isDraftLoaded) return;
    if (status !== 'draft') return;

    setIsAutosaving(true);
    const timer = setTimeout(() => {
      if (status !== 'draft') {
        setIsAutosaving(false);
        return;
      }
      try {
        const draft = buildDraft();
        localStorage.setItem(storageKey, JSON.stringify(draft));
        setLastSaved(draft.updatedAt || 'Autoguardado');
        // Si estaba sincronizado, una edición local pasa el estado a pending
        setSyncStatus(prev => (prev === 'synced' ? 'pending' : prev));
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

  // ============================================================================
  // 3. GUARDAR BORRADOR: localStorage primero + Supabase
  // ============================================================================
  const handleSaveDraft = async () => {
    setIsSaving(true);
    const draft = buildDraft('draft');

    // 1. Guardado local inmediato como garantía contra pérdida de datos
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setLastSaved(draft.updatedAt || 'Guardado');
    } catch (err) {
      console.warn('Error guardando en localStorage:', err);
    }

    // 2. Persistir en Supabase
    try {
      if (effectiveInstitutionId && effectiveInstitutionId !== 'institucion-default') {
        const { error: sbError } = await saveCurriculumUnit({
          institutionId: effectiveInstitutionId,
          academicYear: '2026',
          area,
          subject,
          grade,
          period,
          content: draft,
          status: 'draft',
          userId: currentUserId,
          userName: currentUserName,
          recordAudit: true
        });

        if (sbError) {
          console.warn('Error guardando en Supabase:', sbError);
          setSyncStatus('error');
          setToastMessage('Guardado localmente. La sincronización institucional no pudo completarse.');
        } else {
          setSyncStatus('synced');
          setShowLocalDraftBanner(false);
          setToastMessage('Borrador guardado y sincronizado con la institución');
        }
      } else {
        setSyncStatus('local');
        setToastMessage('Borrador guardado localmente');
      }
    } catch (err) {
      console.warn('Excepción guardando en Supabase:', err);
      setSyncStatus('error');
      setToastMessage('Guardado localmente. La sincronización institucional no pudo completarse.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // ============================================================================
  // 4. ENVIAR A REVISIÓN: Guardado + submitCurriculumUnit + bloqueo de interfaz
  // ============================================================================
  const submitGrid = async () => {
    setIsSubmitting(true);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = `Hoy, ${timeFormatted}`;

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

    // 1. Respaldo local
    try {
      localStorage.setItem(storageKey, JSON.stringify(submittedDraft));
    } catch (err) {
      console.warn('Error respaldando en localStorage:', err);
    }

    // 2. Persistencia y transición formal en Supabase
    try {
      if (effectiveInstitutionId && effectiveInstitutionId !== 'institucion-default') {
        // Asegurar que la unidad esté guardada en Supabase
        const saveRes = await saveCurriculumUnit({
          institutionId: effectiveInstitutionId,
          academicYear: '2026',
          area,
          subject,
          grade,
          period,
          content: submittedDraft,
          status: 'draft',
          userId: currentUserId,
          userName: currentUserName,
          recordAudit: false
        });

        if (saveRes.error) {
          throw saveRes.error;
        }

        // Ejecutar submit formal
        const submitRes = await submitCurriculumUnit({
          institutionId: effectiveInstitutionId,
          academicYear: '2026',
          subject,
          grade,
          period,
          content: submittedDraft,
          userId: currentUserId,
          userName: currentUserName
        });

        if (submitRes.error) {
          throw submitRes.error;
        }

        // Transición confirmada en Supabase
        setLastSaved(formattedDate);
        setStatus('submitted');
        setSyncStatus('synced');
        setShowLocalDraftBanner(false);
        setToastMessage('Planeación enviada a revisión y bloqueada');
      } else {
        setLastSaved(formattedDate);
        setStatus('submitted');
        setSyncStatus('local');
        setToastMessage('Planeación enviada a revisión y bloqueada (modo local)');
      }
    } catch (err) {
      console.error('Error al enviar a revisión en Supabase:', err);
      // Falla en Supabase: NO mostrar éxito falso. Guardado local preservado.
      setSyncStatus('error');
      setToastMessage('No se pudo enviar a revisión en la nube. Guardado localmente, pendiente de sincronización.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToastMessage(null), 4000);
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
    setCompetencies(competencies.map(c => (c.id === id ? { ...c, description: value } : c)));
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
    setContenidos(contenidos.map(item => (item.id === id ? { ...item, [field]: value } : item)));
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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={cn(
                  'text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border flex items-center gap-1.5',
                  status === 'draft'
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : status === 'submitted'
                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : status === 'revision'
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                )}
              >
                {status === 'draft' && <Clock className="w-3.5 h-3.5" />}
                {status === 'submitted' && <Send className="w-3.5 h-3.5" />}
                {status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                Estado: {status.toUpperCase()}
              </span>

              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 flex items-center gap-1">
                <History className="w-3 h-3" /> {lastSaved ? `Guardado (${lastSaved})` : 'v1.0 (Borrador local)'}
              </span>

              {/* Indicador discreto de sincronización institucional */}
              {syncStatus === 'synced' && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sincronizado
                </span>
              )}
              {syncStatus === 'pending' && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" /> Sincronización pendiente
                </span>
              )}
              {syncStatus === 'local' && (
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-slate-500" /> Guardado local
                </span>
              )}
              {syncStatus === 'error' && (
                <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-red-500" /> Error de sincronización
                </span>
              )}

              {isAutosaving && (
                <span className="text-[9px] font-bold text-indigo-500 animate-pulse flex items-center gap-1">
                  Autoguardando...
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {subject} - {grade}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {period} • Eje temático: {axisTopic}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {status === 'draft' || status === 'revision' ? (
            <>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="h-9 gap-2 text-slate-600 font-bold text-xs hover:bg-slate-50 border-slate-300 shadow-sm"
                disabled={isSaving || isSubmitting || isAiSuggesting}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <Save className="w-4 h-4 text-slate-600" />
                )}
                {isSaving ? 'Guardando...' : 'Guardar Borrador'}
              </Button>
              <Button
                onClick={submitGrid}
                className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                disabled={isSaving || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isSubmitting ? 'Enviando...' : 'Enviar a Revisión'}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="h-9 gap-2 text-amber-700 bg-amber-50 border-amber-200 font-bold text-xs"
              disabled
            >
              Bloqueado (En Revisión)
            </Button>
          )}
        </div>
      </div>

      {/* ⚠️ AVISO DISCRETO: BORRADOR LOCAL NO SINCRONIZADO */}
      {showLocalDraftBanner && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Existe un borrador local no sincronizado</span>
              <span className="text-amber-700 ml-1">
                guardado en este navegador ({unsyncedLocalDraft?.updatedAt || 'Reciente'}).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleLoadLocalDraft}
              className="h-7 text-xs bg-white text-amber-800 border-amber-300 hover:bg-amber-100 hover:text-amber-900 font-bold shadow-xs cursor-pointer"
            >
              Cargar borrador local
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismissLocalBanner}
              className="h-7 text-xs text-amber-700 hover:bg-amber-100/60 cursor-pointer"
            >
              Descartar aviso
            </Button>
          </div>
        </div>
      )}

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
                onChange={e => setObjetivoGeneral(e.target.value)}
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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={simulateAiSuggestion}
                  className="h-7 text-xs font-bold text-indigo-600 hover:bg-indigo-50"
                  disabled={isAiSuggesting}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {isAiSuggesting ? 'Generando...' : 'Sugerir con IA'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {competencies.map((comp, index) => (
                  <div
                    key={comp.id}
                    className="p-4 flex items-start gap-3 group hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="mt-2 cursor-move text-slate-300 group-hover:text-slate-500">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <select
                          className="text-xs font-bold bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                          value={comp.type}
                          disabled={status !== 'draft'}
                          onChange={e => {
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
                        onChange={e => handleUpdateCompetency(comp.id, e.target.value)}
                        disabled={status !== 'draft'}
                        rows={2}
                      />
                    </div>
                    {status === 'draft' && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteCompetency(comp.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {status === 'draft' && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddCompetency}
                    className="w-full border-dashed border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400 font-bold text-xs"
                  >
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
                {contenidos.map(item => (
                  <div key={item.id} className="flex items-center gap-3 pt-2 first:pt-0 group">
                    <input
                      value={item.periodLabel}
                      onChange={e => handleUpdateContenido(item.id, 'periodLabel', e.target.value)}
                      disabled={status !== 'draft'}
                      className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1.5 rounded border-0 outline-none w-24 text-center disabled:opacity-80 disabled:cursor-not-allowed"
                      placeholder="Semana..."
                    />
                    <Input
                      placeholder="Ej. Límite de una función real, propiedades básicas"
                      className="text-sm h-9 border-slate-200 flex-1 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                      disabled={status !== 'draft'}
                      value={item.content}
                      onChange={e => handleUpdateContenido(item.id, 'content', e.target.value)}
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                  Estrategia Metodológica
                </label>
                <textarea
                  className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg p-3 min-h-[60px] focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-y disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                  placeholder="Ej. Aprendizaje Basado en Problemas, Aula Invertida..."
                  value={metodologia}
                  onChange={e => setMetodologia(e.target.value)}
                  disabled={status !== 'draft'}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                  Recursos (Físicos y Digitales)
                </label>
                <Input
                  placeholder="Ej. Laboratorio virtual, Geogebra, calculadoras..."
                  className="text-sm border-slate-200 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                  disabled={status !== 'draft'}
                  value={recursos}
                  onChange={e => setRecursos(e.target.value)}
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
                            onChange={e => {
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
                            onChange={e => {
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
                              onChange={e => {
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddEvaluation}
                    className="w-full border-dashed border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400 font-bold text-xs"
                  >
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
                Basado en tu asignatura, te sugiero incluir <strong>indicadores de desempeño</strong> asociados al
                Pensamiento Variacional.
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
                  &quot;Profesor, por favor incluir evidencias concretas de tipo &apos;Producto&apos; para las
                  competencias del Hacer. La redacción de la competencia cognitiva está muy bien.&quot;
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
