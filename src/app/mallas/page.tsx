'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { CurriculumBuilder, CurriculumDraft } from '@/components/dashboard/CurriculumBuilder';
import { Malla360View } from '@/components/curriculum/Malla360View';
import { useRole } from '@/providers/role-provider';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import {
  CurriculumUnitRecord,
  approveCurriculumUnit,
  returnCurriculumUnit,
  getCurriculumUnit
} from '@/lib/services/curriculum-units';
import {
  BookOpen,
  Layers,
  GraduationCap,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Lock,
  Compass,
  FileCheck2,
  LayoutGrid,
  RotateCcw,
  Loader2,
  ShieldCheck
} from 'lucide-react';

// Estructura de áreas y asignaturas estándar en Colombia (Ley 115 de 1994)
interface AreaCatalogItem {
  id: string;
  name: string;
  code: string;
  subjects: {
    name: string;
    description?: string;
    suggestedGrades?: string[];
  }[];
}

const CANONICAL_AREAS: AreaCatalogItem[] = [
  {
    id: 'matematicas',
    name: 'Matemáticas',
    code: 'MAT',
    subjects: [
      { name: 'Matemáticas', description: 'Pensamiento numérico, variacional y geométrico', suggestedGrades: ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'] },
      { name: 'Álgebra y Trigonometría', description: 'Funciones, ecuaciones e identidades', suggestedGrades: ['8°', '9°', '10°'] },
      { name: 'Cálculo Diferencial', description: 'Límites, derivadas y modelado de cambio continuo', suggestedGrades: ['11°'] },
      { name: 'Estadística y Probabilidad', description: 'Pensamiento aleatorio y sistemas de datos', suggestedGrades: ['6°', '7°', '8°', '9°', '10°', '11°'] }
    ]
  },
  {
    id: 'ciencias-naturales',
    name: 'Ciencias Naturales y Educación Ambiental',
    code: 'CNAT',
    subjects: [
      { name: 'Ciencias Naturales', description: 'Procesos biológicos, físicos y químicos básicos', suggestedGrades: ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°'] },
      { name: 'Biología General', description: 'Ecosistemas, genética, biodiversidad y evolución', suggestedGrades: ['6°', '7°', '8°', '9°'] },
      { name: 'Química Orgánica e Inorgánica', description: 'Estructura atómica, enlaces y estequiometría', suggestedGrades: ['10°', '11°'] },
      { name: 'Física', description: 'Mecánica clásica, ondas, termodinámica y electromagnetismo', suggestedGrades: ['10°', '11°'] }
    ]
  },
  {
    id: 'humanidades',
    name: 'Humanidades y Lengua Castellana',
    code: 'HUM',
    subjects: [
      { name: 'Lengua Castellana y Literatura', description: 'Comprensión lectora, producción textual y análisis literario', suggestedGrades: ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'] },
      { name: 'Idioma Extranjero (Inglés)', description: 'Competencias comunicativas según marco MCER', suggestedGrades: ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'] }
    ]
  },
  {
    id: 'ciencias-sociales',
    name: 'Ciencias Sociales, Historia y Democracia',
    code: 'SOC',
    subjects: [
      { name: 'Ciencias Sociales', description: 'Relaciones con la historia, cultura y espacio geográfico', suggestedGrades: ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°'] },
      { name: 'Filosofía', description: 'Epistemología, ontología y pensamiento crítico', suggestedGrades: ['10°', '11°'] },
      { name: 'Ciencias Políticas y Económicas', description: 'Estructura del Estado, democracia y desarrollo socioeconómico', suggestedGrades: ['10°', '11°'] }
    ]
  },
  {
    id: 'tecnologia',
    name: 'Tecnología e Informática',
    code: 'TEC',
    subjects: [
      { name: 'Tecnología e Informática', description: 'Alfabetización digital, pensamiento computacional y diseño', suggestedGrades: ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'] }
    ]
  },
  {
    id: 'educacion-artistica',
    name: 'Educación Artística y Cultural',
    code: 'ART',
    subjects: [
      { name: 'Educación Artística', description: 'Sensibilidad estética, apreciación y expresión plástica/visual', suggestedGrades: ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'] }
    ]
  },
  {
    id: 'educacion-fisica',
    name: 'Educación Física, Recreación y Deportes',
    code: 'EDF',
    subjects: [
      { name: 'Educación Física', description: 'Desarrollo motriz, hábitos saludables y trabajo en equipo', suggestedGrades: ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'] }
    ]
  },
  {
    id: 'etica-valores',
    name: 'Educación Ética y en Valores Humanos',
    code: 'ETI',
    subjects: [
      { name: 'Ética y Cátedra de Paz', description: 'Convivencia democrática, dilemas morales y resolución pacífica de conflictos', suggestedGrades: ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'] }
    ]
  },
  {
    id: 'preescolar',
    name: 'Dimensiones del Desarrollo Infantil',
    code: 'DIM-PRE',
    subjects: [
      { name: 'Dimensión Cognitiva y Exploración', description: 'Curiosidad, razonamiento lógico temprano y medio ambiente', suggestedGrades: ['Transición'] },
      { name: 'Dimensión Comunicativa', description: 'Lenguaje oral, iniciación a la lectoescritura y expresión gráfica', suggestedGrades: ['Transición'] },
      { name: 'Dimensión Socioafectiva y Corporal', description: 'Motricidad gruesa/fina, autonomía y socialización', suggestedGrades: ['Transición'] }
    ]
  }
];

const STANDARD_GRADES = [
  'Transición',
  '1°', '2°', '3°', '4°', '5°',
  '6°', '7°', '8°', '9°',
  '10°', '11°'
];

const STANDARD_PERIODS = [
  'Periodo 1',
  'Periodo 2',
  'Periodo 3',
  'Periodo 4'
];

export default function MallasPage() {
  const router = useRouter();
  const { activeInstitution, institutionId, userRole } = useRole();
  const { user: _user } = useAuth();

  const canApproveCurriculum =
    userRole === 'coordinador' ||
    userRole === 'super_admin';

  const effectiveInstitutionId =
    activeInstitution?.id ||
    institutionId ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('aulacore-institution-id') ||
        localStorage.getItem('institution_id') ||
        'institucion-default'
      : 'institucion-default');

  // Helper idéntico a CurriculumBuilder para construir storageKey
  const sanitizeKeyPart = (val: string) => val.toLowerCase().replace(/[^a-z0-9]/gi, '_');

  const buildDraftKey = useCallback(
    (subj: string, grd: string, per: string, currId = 'malla-default') => {
      return `aulacore-curriculum-draft-${sanitizeKeyPart(effectiveInstitutionId)}-${sanitizeKeyPart(currId)}-${sanitizeKeyPart(subj)}-${sanitizeKeyPart(grd)}-${sanitizeKeyPart(per)}`;
    },
    [effectiveInstitutionId]
  );

  // Cargar áreas institucionales configuradas en /configuracion/mallas (si existen en localStorage)
  const [areasCatalog, setAreasCatalog] = useState<AreaCatalogItem[]>(CANONICAL_AREAS);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storageKey = effectiveInstitutionId
        ? `aulacore-mallas-settings-${effectiveInstitutionId}`
        : 'aulacore-mallas-settings';
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Extraer áreas únicas de las mallas institucionales configuradas
          const extractedAreasMap = new Map<string, AreaCatalogItem>();
          parsed.forEach((malla: any) => {
            if (Array.isArray(malla.areas)) {
              malla.areas.forEach((area: any) => {
                const existing: AreaCatalogItem = extractedAreasMap.get(area.name) || {
                  id: sanitizeKeyPart(area.name),
                  name: area.name,
                  code: area.code || 'INST',
                  subjects: []
                };
                if (Array.isArray(area.subjects)) {
                  area.subjects.forEach((sub: any) => {
                    if (!existing.subjects.some(s => s.name === sub.name)) {
                      existing.subjects.push({
                        name: sub.name,
                        description: sub.description,
                        suggestedGrades: sub.linkedCourses
                      });
                    }
                  });
                }
                extractedAreasMap.set(area.name, existing);
              });
            }
          });

          if (extractedAreasMap.size > 0) {
            // Combinar con canonical para no perder cobertura de áreas nacionales
            const customList = Array.from(extractedAreasMap.values());
            const merged = [...customList];
            CANONICAL_AREAS.forEach(canon => {
              if (!merged.some(m => m.name.toLowerCase() === canon.name.toLowerCase())) {
                merged.push(canon);
              }
            });
            setAreasCatalog(merged);
          }
        }
      }
    } catch (e) {
      console.warn('Error reading institutional areas catalog:', e);
    }
  }, [effectiveInstitutionId]);

  // Selección contextual del usuario
  const [selectedAreaName, setSelectedAreaName] = useState<string>('Matemáticas');
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>('Matemáticas');
  const [selectedGrade, setSelectedGrade] = useState<string>('5°');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Periodo 1');

  // Estado del flujo de navegación ('explorer' | 'malla360' | 'builder')
  const [viewMode, setViewMode] = useState<'explorer' | 'malla360' | 'builder'>('explorer');
  const [previousView, setPreviousView] = useState<'explorer' | 'malla360'>('explorer');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Grados ofertados por la institución (detectados dinámicamente de cursos o mallas institucionales)
  const offeredGrades = useMemo(() => {
    if (typeof window === 'undefined') return STANDARD_GRADES;
    try {
      const rawCourses = localStorage.getItem('aulacore-courses-list');
      if (rawCourses) {
        const parsed = JSON.parse(rawCourses);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const gradesFound = new Set<string>();
          parsed.forEach((c: any) => {
            if (c.grade) gradesFound.add(String(c.grade).trim());
          });
          if (gradesFound.size > 0) {
            const sorted = STANDARD_GRADES.filter(g => gradesFound.has(g));
            gradesFound.forEach(g => {
              if (!sorted.includes(g)) sorted.push(g);
            });
            if (sorted.length > 0) return sorted;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading institutional offered grades:', e);
    }
    return STANDARD_GRADES;
  }, []);

  // Área activa seleccionada
  const activeArea = useMemo(() => {
    return (
      areasCatalog.find(a => a.name === selectedAreaName) ||
      areasCatalog[0] ||
      CANONICAL_AREAS[0]
    );
  }, [areasCatalog, selectedAreaName]);

  // Lista de asignaturas del área activa
  const availableSubjects = useMemo(() => {
    return activeArea.subjects || [];
  }, [activeArea]);

  // Sincronizar asignatura cuando cambia el área
  const handleAreaChange = (newAreaName: string) => {
    setSelectedAreaName(newAreaName);
    const targetArea = areasCatalog.find(a => a.name === newAreaName) || areasCatalog[0];
    if (targetArea && targetArea.subjects.length > 0) {
      const match = targetArea.subjects.find(s => s.name === selectedSubjectName);
      if (!match) {
        setSelectedSubjectName(targetArea.subjects[0].name);
      }
    }
  };

  // Carga de unidades institucionales persistidas en Supabase (Prioridad 1)
  const [supabaseUnitsMap, setSupabaseUnitsMap] = useState<Map<string, CurriculumUnitRecord>>(new Map());

  const fetchInstitutionalUnits = useCallback(async () => {
    if (!effectiveInstitutionId || effectiveInstitutionId === 'institucion-default') {
      return;
    }
    try {
      const { data, error } = await supabase
        .from('curriculum_units')
        .select('*')
        .eq('institution_id', effectiveInstitutionId)
        .eq('academic_year', '2026');

      if (!error && Array.isArray(data)) {
        const newMap = new Map<string, CurriculumUnitRecord>();
        data.forEach(unit => {
          const key = `${unit.subject_name.toLowerCase()}_${unit.grade.toLowerCase()}_${unit.period.toLowerCase()}`;
          newMap.set(key, unit as CurriculumUnitRecord);
        });
        setSupabaseUnitsMap(newMap);
      }
    } catch (err) {
      console.warn('Error fetching curriculum units from Supabase:', err);
    }
  }, [effectiveInstitutionId]);

  useEffect(() => {
    fetchInstitutionalUnits();
  }, [fetchInstitutionalUnits, refreshKey]);

  // Función de lectura segura del estado de una unidad:
  // 1. Supabase (oficial) -> 2. localStorage (fallback) -> 3. null
  const getDraftForCombination = useCallback(
    (subj: string, grd: string, per: string): CurriculumDraft | null => {
      // 1. Prioridad: Supabase
      const dbKey = `${subj.toLowerCase()}_${grd.toLowerCase()}_${per.toLowerCase()}`;
      const dbUnit = supabaseUnitsMap.get(dbKey);
      if (dbUnit && dbUnit.content) {
        return {
          ...dbUnit.content,
          status: dbUnit.status as any,
          subject: dbUnit.subject_name,
          grade: dbUnit.grade,
          period: dbUnit.period,
          area: dbUnit.area_name,
          updatedAt: dbUnit.updated_at
            ? `Hoy, ${new Date(dbUnit.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : undefined
        };
      }

      // 2. Fallback: localStorage
      if (typeof window === 'undefined') return null;
      try {
        const key = buildDraftKey(subj, grd, per);
        const raw = localStorage.getItem(key);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (err) {
        console.warn('Error reading draft for period:', err);
      }
      return null;
    },
    [buildDraftKey, supabaseUnitsMap]
  );

  // Borrador actual para la combinación seleccionada en los desplegables
  const currentDraft = useMemo(() => {
    return getDraftForCombination(selectedSubjectName, selectedGrade, selectedPeriod);
  }, [getDraftForCombination, selectedSubjectName, selectedGrade, selectedPeriod, refreshKey]);

  // Registro de la unidad actual en Supabase (si existe)
  const currentUnitKey = `${selectedSubjectName.toLowerCase()}_${selectedGrade.toLowerCase()}_${selectedPeriod.toLowerCase()}`;
  const currentDbUnit = supabaseUnitsMap.get(currentUnitKey);

  // Estados para modales de aprobación y devolución directa en /mallas
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approveFeedback, setApproveFeedback] = useState('');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnFeedback, setReturnFeedback] = useState('');
  const [isProcessingReview, setIsProcessingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manejo de Aprobación Directa desde /mallas
  const handleConfirmApprove = async () => {
    let targetUnitId = currentDbUnit?.id;

    if (!targetUnitId && effectiveInstitutionId) {
      setIsProcessingReview(true);
      const { data: refreshed } = await getCurriculumUnit({
        institutionId: effectiveInstitutionId,
        academicYear: '2026',
        subject: selectedSubjectName,
        grade: selectedGrade,
        period: selectedPeriod
      });
      if (refreshed?.id) {
        targetUnitId = refreshed.id;
      }
    }

    if (!targetUnitId) {
      setReviewError('No se encontró el identificador institucional de la unidad curricular en Supabase.');
      return;
    }

    setIsProcessingReview(true);
    setReviewError(null);

    try {
      const { error: rpcError } = await approveCurriculumUnit({
        unitId: targetUnitId,
        feedback: approveFeedback.trim() || null
      });

      if (rpcError) {
        setReviewError(rpcError.message || 'Error al aprobar la malla curricular.');
        return;
      }

      await fetchInstitutionalUnits();
      setRefreshKey(prev => prev + 1);
      setIsApproveModalOpen(false);
      setApproveFeedback('');
      setToastMessage('Malla curricular aprobada correctamente.');
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Error inesperado al conectar con el servicio.');
    } finally {
      setIsProcessingReview(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Manejo de Devolución Directa desde /mallas
  const handleConfirmReturn = async () => {
    if (!returnFeedback || !returnFeedback.trim()) {
      setReviewError('La retroalimentación pedagógica es obligatoria para devolver la unidad.');
      return;
    }

    let targetUnitId = currentDbUnit?.id;

    if (!targetUnitId && effectiveInstitutionId) {
      setIsProcessingReview(true);
      const { data: refreshed } = await getCurriculumUnit({
        institutionId: effectiveInstitutionId,
        academicYear: '2026',
        subject: selectedSubjectName,
        grade: selectedGrade,
        period: selectedPeriod
      });
      if (refreshed?.id) {
        targetUnitId = refreshed.id;
      }
    }

    if (!targetUnitId) {
      setReviewError('No se encontró el identificador institucional de la unidad curricular en Supabase.');
      return;
    }

    setIsProcessingReview(true);
    setReviewError(null);

    try {
      const { error: rpcError } = await returnCurriculumUnit({
        unitId: targetUnitId,
        feedback: returnFeedback.trim()
      });

      if (rpcError) {
        setReviewError(rpcError.message || 'Error al devolver la malla curricular.');
        return;
      }

      await fetchInstitutionalUnits();
      setRefreshKey(prev => prev + 1);
      setIsReturnModalOpen(false);
      setReturnFeedback('');
      setToastMessage('Malla devuelta al docente para ajustes.');
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Error inesperado al conectar con el servicio.');
    } finally {
      setIsProcessingReview(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Historial unificado: Unidades en Supabase + Borradores locales complementarios
  const institutionalDrafts = useMemo(() => {
    const results: {
      key: string;
      subject: string;
      grade: string;
      area: string;
      period: string;
      status: string;
      updatedAt: string;
      source?: 'supabase' | 'local';
    }[] = [];

    const seenKeys = new Set<string>();

    // A. Unidades oficiales desde Supabase (Prioridad institucional)
    supabaseUnitsMap.forEach(unit => {
      const comboKey = `${unit.subject_name.toLowerCase()}_${unit.grade.toLowerCase()}_${unit.period.toLowerCase()}`;
      seenKeys.add(comboKey);
      results.push({
        key: unit.id,
        subject: unit.subject_name,
        grade: unit.grade,
        area: unit.area_name,
        period: unit.period,
        status: unit.status,
        updatedAt: unit.updated_at
          ? `Hoy, ${new Date(unit.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'Reciente',
        source: 'supabase'
      });
    });

    // B. Borradores en localStorage que no estén en Supabase (Fallback)
    if (typeof window !== 'undefined') {
      try {
        const prefix = `aulacore-curriculum-draft-${sanitizeKeyPart(effectiveInstitutionId)}`;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(prefix)) {
            const raw = localStorage.getItem(k);
            if (raw) {
              try {
                const d = JSON.parse(raw);
                if (d && (d.subject || d.grade || d.period)) {
                  const comboKey = `${(d.subject || '').toLowerCase()}_${(d.grade || '').toLowerCase()}_${(d.period || '').toLowerCase()}`;
                  if (!seenKeys.has(comboKey)) {
                    seenKeys.add(comboKey);
                    results.push({
                      key: k,
                      subject: d.subject || 'Sin Asignatura',
                      grade: d.grade || '11°',
                      area: d.area || 'Matemáticas',
                      period: d.period || 'Periodo 1',
                      status: d.status || 'draft',
                      updatedAt: d.updatedAt || 'Reciente',
                      source: 'local'
                    });
                  }
                }
              } catch (_) {}
            }
          }
        }
      } catch (e) {
        console.warn('Error scanning institutional drafts:', e);
      }
    }

    return results;
  }, [effectiveInstitutionId, supabaseUnitsMap]);

  // 1. Si está en modo construcción, renderizar el CurriculumBuilder conectado
  if (viewMode === 'builder') {
    return (
      <AppLayout>
        <div className="space-y-6">
          <CurriculumBuilder
            area={selectedAreaName}
            subject={selectedSubjectName}
            grade={selectedGrade}
            period={selectedPeriod}
            institutionId={effectiveInstitutionId}
            curriculumId="malla-default"
            onBack={() => {
              setViewMode(previousView);
              setRefreshKey(prev => prev + 1);
            }}
          />
        </div>
      </AppLayout>
    );
  }

  // 2. Si está en modo Malla 360, renderizar la matriz longitudinal completa del Área
  if (viewMode === 'malla360') {
    return (
      <AppLayout>
        <Malla360View
          area={activeArea}
          institutionId={effectiveInstitutionId}
          institutionName={activeInstitution?.name}
          rectorName={(activeInstitution as any)?.rectorName}
          offeredGrades={offeredGrades}
          periods={STANDARD_PERIODS}
          onBack={() => setViewMode('explorer')}
          onSelectPeriod={(subj, grd, per) => {
            setSelectedSubjectName(subj);
            setSelectedGrade(grd);
            setSelectedPeriod(per);
            setPreviousView('malla360');
            setViewMode('builder');
          }}
          getDraftStatus={(subj, grd, per) => getDraftForCombination(subj, grd, per)}
        />
      </AppLayout>
    );
  }

  // Helper visual para badges de estado
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aprobada
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Lock className="w-3.5 h-3.5 text-blue-600" /> En Revisión (Bloqueada)
          </span>
        );
      case 'revision':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Requiere Ajustes
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> Borrador en Curso
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Sin Iniciar
          </span>
        );
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-12">
        {/* CABECERA PRINCIPAL */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                Plan de Estudios Institucional
              </span>
              {activeInstitution?.name && (
                <span className="text-xs text-slate-400 font-medium border-l border-slate-700 pl-2">
                  {activeInstitution.name}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Compass className="w-8 h-8 text-indigo-400" />
              Explorador Curricular y Planes de Área
            </h1>
            <p className="text-sm text-slate-350 max-w-2xl leading-relaxed">
              Selecciona el Área, Asignatura, Grado y Período para construir, editar o auditar la malla curricular conforme a los Estándares Básicos de Competencias (EBC), DBA y el SIEE institucional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setViewMode('malla360')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs h-11 px-5 rounded-xl shadow-lg shadow-indigo-600/25 gap-2 cursor-pointer transition-all"
            >
              <LayoutGrid className="w-4 h-4" />
              Ver Malla 360 del Área
            </Button>

            <Button
              onClick={() => router.push('/configuracion/mallas')}
              variant="outline"
              className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs h-11 px-4 rounded-xl gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              Configurar Plan de Estudios
            </Button>
          </div>
        </div>

        {/* NAVEGACIÓN ENTRE VISTA EXPLORADOR Y VISTA MALLA 360 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 border bg-indigo-600 text-white border-indigo-600 shadow-xs"
            >
              <Compass className="w-4 h-4" />
              Explorador por Período
            </button>

            <button
              type="button"
              onClick={() => setViewMode('malla360')}
              className="px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
            >
              <LayoutGrid className="w-4 h-4 text-indigo-600" />
              Malla 360 Longitudinal ({selectedAreaName})
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Institución: <strong className="text-slate-800">{activeInstitution?.name || 'Sede Principal'}</strong>
          </span>
        </div>

        {/* PANEL INTERACTIVO DE SELECCIÓN CONTEXTUAL (4 NIVELES) */}
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b border-slate-200/80 px-8 py-5">
            <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                1
              </span>
              Filtro Contextual de Construcción Curricular
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* 1. SELECCIÓN DE ÁREA */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  1. Área Curricular
                </label>
                <select
                  value={selectedAreaName}
                  onChange={e => handleAreaChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition cursor-pointer"
                >
                  {areasCatalog.map(area => (
                    <option key={area.id} value={area.name}>
                      {area.name} ({area.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. SELECCIÓN DE ASIGNATURA */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  2. Asignatura
                </label>
                <select
                  value={selectedSubjectName}
                  onChange={e => setSelectedSubjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition cursor-pointer"
                >
                  {availableSubjects.map(sub => (
                    <option key={sub.name} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. SELECCIÓN DE GRADO */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  3. Grado Escolar
                </label>
                <select
                  value={selectedGrade}
                  onChange={e => setSelectedGrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition cursor-pointer"
                >
                  {offeredGrades.map(grd => (
                    <option key={grd} value={grd}>
                      Grado {grd}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. SELECCIÓN DE PERÍODO */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  4. Período Académico
                </label>
                <select
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition cursor-pointer"
                >
                  {STANDARD_PERIODS.map(per => (
                    <option key={per} value={per}>
                      {per}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TARJETA DE RESUMEN Y ACCIÓN DE ENTRADA AL BUILDER */}
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Unidad Curricular Seleccionada:
                  </span>
                  {renderStatusBadge(currentDraft?.status)}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-lg font-black text-slate-900">
                  <span className="text-indigo-600 font-extrabold">{selectedAreaName}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span>{selectedSubjectName}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-lg text-sm font-black">
                    Grado {selectedGrade}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-lg text-sm font-black">
                    {selectedPeriod}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  {currentDraft ? (
                    <>
                      Última modificación:{' '}
                      <span className="font-bold text-slate-700">{currentDraft.updatedAt || 'Hoy'}</span> •{' '}
                      {currentDraft.competencies?.length || 0} competencias •{' '}
                      {currentDraft.contenidos?.length || 0} bloques temáticos
                    </>
                  ) : (
                    'No existe un borrador guardado para esta combinación. Al ingresar se iniciará una nueva malla.'
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full md:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setViewMode('malla360')}
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold text-sm h-12 px-5 rounded-xl shadow-xs transition-all gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <LayoutGrid className="w-5 h-5 text-indigo-600" />
                  Ver Malla 360 del Área
                </Button>

                <Button
                  onClick={() => {
                    setPreviousView('explorer');
                    setViewMode('builder');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm h-12 px-8 rounded-xl shadow-lg shadow-indigo-600/25 transition-all gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <BookOpen className="w-5 h-5" />
                  {currentDraft ? 'Construir / Editar Malla' : 'Iniciar Nueva Malla'}
                </Button>

                {currentDraft?.status === 'submitted' && canApproveCurriculum && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setReturnFeedback('');
                        setReviewError(null);
                        setIsReturnModalOpen(true);
                      }}
                      className="border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-900 font-bold text-sm h-12 px-5 rounded-xl shadow-xs transition-all gap-2 cursor-pointer w-full sm:w-auto"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-600" />
                      Devolver para ajustes
                    </Button>

                    <Button
                      type="button"
                      onClick={() => {
                        setApproveFeedback('');
                        setReviewError(null);
                        setIsApproveModalOpen(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm h-12 px-6 rounded-xl shadow-lg shadow-emerald-600/25 transition-all gap-2 cursor-pointer w-full sm:w-auto"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Aprobar malla
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MATRIZ DE LOS 4 PERÍODOS PARA EL GRADO Y ASIGNATURA SELECCIONADA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Matriz de Períodos: {selectedSubjectName} (Grado {selectedGrade})
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Progreso y estado de los 4 períodos académicos del año lectivo para este curso.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STANDARD_PERIODS.map(periodName => {
              const draft = getDraftForCombination(selectedSubjectName, selectedGrade, periodName);
              const isSelected = selectedPeriod === periodName;

              return (
                <div
                  key={periodName}
                  className={cn(
                    'bg-white border rounded-2xl p-5 space-y-4 transition-all duration-200 flex flex-col justify-between shadow-xs',
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md bg-indigo-50/20'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 uppercase font-mono">
                        {periodName}
                      </span>
                      {renderStatusBadge(draft?.status)}
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 line-clamp-2">
                      {draft?.objetivoGeneral || 'Sin objetivo general configurado todavía.'}
                    </h4>

                    {draft && (
                      <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                        <p>
                          • <span className="font-semibold">{draft.competencies?.length || 0}</span> competencias registradas
                        </p>
                        <p>
                          • <span className="font-semibold">{draft.evaluations?.length || 0}</span> criterios SIEE
                        </p>
                        <p className="text-[10px] text-slate-400 italic">
                          Guardado: {draft.updatedAt || 'Reciente'}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedPeriod(periodName);
                      setPreviousView('explorer');
                      setViewMode('builder');
                    }}
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                      'w-full text-xs font-bold h-9 rounded-lg gap-1.5 cursor-pointer',
                      isSelected
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {draft ? `Editar ${periodName}` : `Comenzar ${periodName}`}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* HISTORIAL INSTITUCIONAL DE BORRADORES ACTIVOS */}
        {institutionalDrafts.length > 0 && (
          <Card className="border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-200 px-8 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-indigo-600" />
                  Mallas y Borradores Registrados en la Institución ({institutionalDrafts.length})
                </CardTitle>
                <p className="text-[11px] text-slate-500 font-medium">
                  Listado de unidades curriculares con borrador persistido localmente.
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {institutionalDrafts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{item.subject}</span>
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded">
                          Grado {item.grade}
                        </span>
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded">
                          {item.period}
                        </span>
                        <span className="text-xs text-slate-400">({item.area})</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Última modificación: <span className="text-slate-600 font-semibold">{item.updatedAt}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {renderStatusBadge(item.status)}
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedAreaName(item.area);
                          setSelectedSubjectName(item.subject);
                          setSelectedGrade(item.grade);
                          setSelectedPeriod(item.period);
                          setPreviousView('explorer');
                          setViewMode('builder');
                        }}
                        className="h-8 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 rounded-lg cursor-pointer"
                      >
                        Abrir Malla
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 🔔 NOTIFICACIÓN TOAST */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 📝 MODAL: APROBAR MALLA CURRICULAR */}
        {isApproveModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-start gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    ¿Aprobar esta malla curricular?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Al aprobar, la planeación se marcará como vigente para la institución y quedará protegida contra modificaciones.
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Área:</span>
                    <span className="font-bold text-slate-800">{selectedAreaName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Asignatura:</span>
                    <span className="font-bold text-slate-800">{selectedSubjectName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Grado:</span>
                    <span className="font-bold text-slate-800">{selectedGrade}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Período:</span>
                    <span className="font-bold text-slate-800">{selectedPeriod}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/60 pt-2">
                    <span className="text-slate-400 font-bold block">Docente:</span>
                    <span className="font-bold text-slate-800">
                      {currentDbUnit?.created_by_name || 'Docente titular'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Observaciones de aprobación (opcional):
                  </label>
                  <textarea
                    className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-3 min-h-[70px] focus:ring-2 focus:ring-emerald-100 focus:outline-none resize-none"
                    placeholder="Comentarios institucionales de felicitación o recomendaciones..."
                    value={approveFeedback}
                    onChange={e => setApproveFeedback(e.target.value)}
                    disabled={isProcessingReview}
                  />
                </div>

                {reviewError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsApproveModalOpen(false);
                    setReviewError(null);
                  }}
                  disabled={isProcessingReview}
                  className="text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmApprove}
                  disabled={isProcessingReview}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2 cursor-pointer"
                >
                  {isProcessingReview ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Procesando aprobación...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirmar aprobación
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 🔄 MODAL: DEVOLVER MALLA PARA AJUSTES */}
        {isReturnModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-start gap-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Devolver malla para ajustes
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Indique las observaciones pedagógicas para que el docente pueda realizar los ajustes requeridos.
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Área:</span>
                    <span className="font-bold text-slate-800">{selectedAreaName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Asignatura:</span>
                    <span className="font-bold text-slate-800">{selectedSubjectName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Grado:</span>
                    <span className="font-bold text-slate-800">{selectedGrade}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Período:</span>
                    <span className="font-bold text-slate-800">{selectedPeriod}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/60 pt-2">
                    <span className="text-slate-400 font-bold block">Docente:</span>
                    <span className="font-bold text-slate-800">
                      {currentDbUnit?.created_by_name || 'Docente titular'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Observaciones pedagógicas <span className="text-red-500 font-bold">*</span>:
                  </label>
                  <textarea
                    className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-amber-200 focus:outline-none resize-none"
                    placeholder="Indique los aspectos que el docente debe revisar o ajustar..."
                    value={returnFeedback}
                    onChange={e => setReturnFeedback(e.target.value)}
                    disabled={isProcessingReview}
                  />
                  {!returnFeedback.trim() && (
                    <p className="text-[10px] text-amber-600 font-bold mt-1">
                      * La retroalimentación es obligatoria para devolver la malla.
                    </p>
                  )}
                </div>

                {reviewError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsReturnModalOpen(false);
                    setReviewError(null);
                  }}
                  disabled={isProcessingReview}
                  className="text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmReturn}
                  disabled={isProcessingReview || !returnFeedback.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-2 cursor-pointer"
                >
                  {isProcessingReview ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Devolviendo...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      Confirmar devolución
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
