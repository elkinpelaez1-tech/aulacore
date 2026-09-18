'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Blocks, Award, BookOpen, Clock, 
  Plus, X, ChevronRight, ChevronDown, Check, AlertTriangle, 
  Terminal, ShieldCheck, Sparkles, Search, CheckCircle2, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/providers/role-provider';

// TYPES & INTERFACES
interface Subject {
  name: string;
  hoursWeekly: number;
  teacherSuggested: string;
  avatar: string;
  linkedCourses: string[];
  description: string;
}

interface AreaDetails {
  name: string;
  code: string;
  subjects: Subject[];
}

interface CurriculumDetails {
  id: string;
  name: string;
  levelName: 'Preescolar' | 'Primaria' | 'Bachillerato' | 'Media' | 'Especialidad';
  coordinator: string;
  jornada?: string;
  description?: string;
  subjectsCount: number;
  hoursWeeklyTotal: number;
  coursesCount: number;
  status: 'Aprobado' | 'En Revisión' | 'Borrador';
  lastUpdated: string;
  areas: AreaDetails[];
}

// CANONICAL DEFAULT MALLAS (Ley 115 Standard MEN Colombia)
const DEFAULT_MALLAS: CurriculumDetails[] = [
  {
    id: 'malla-bachillerato',
    name: 'Malla Curricular Bachillerato Académico',
    levelName: 'Bachillerato',
    coordinator: 'Coordinación Académica',
    jornada: 'Mañana',
    description: 'Plan de estudios de educación básica secundaria y media conforme a los estándares de competencias MEN (Ley 115).',
    subjectsCount: 9,
    hoursWeeklyTotal: 30,
    coursesCount: 5,
    status: 'Aprobado',
    lastUpdated: 'Vigente 2026',
    areas: [
      {
        name: 'Ciencias Naturales y Educación Ambiental',
        code: 'CIEN-BACH',
        subjects: [
          { name: 'Biología General', hoursWeekly: 4, teacherSuggested: 'Docente de Ciencias', avatar: '🔬', linkedCourses: ['6°', '7°', '8°', '9°'], description: 'Estudio de los ecosistemas, genética y biodiversidad.' },
          { name: 'Química Orgánica e Inorgánica', hoursWeekly: 3, teacherSuggested: 'Docente de Química', avatar: '🧪', linkedCourses: ['10°', '11°'], description: 'Estructura molecular, estequiometría y reacciones.' }
        ]
      },
      {
        name: 'Matemáticas y Razonamiento Lógico',
        code: 'MAT-BACH',
        subjects: [
          { name: 'Álgebra y Trigonometría', hoursWeekly: 5, teacherSuggested: 'Docente de Matemáticas', avatar: '📐', linkedCourses: ['8°', '9°', '10°'], description: 'Funciones, identidades y resolución de problemas.' }
        ]
      },
      {
        name: 'Humanidades y Lengua Castellana',
        code: 'HUM-BACH',
        subjects: [
          { name: 'Lengua Castellana y Literatura', hoursWeekly: 4, teacherSuggested: 'Docente de Humanidades', avatar: '📚', linkedCourses: ['6° a 11°'], description: 'Comprensión lectora, producción textual y análisis literario.' }
        ]
      }
    ]
  },
  {
    id: 'malla-primaria',
    name: 'Malla Curricular Básica Primaria',
    levelName: 'Primaria',
    coordinator: 'Coordinación Académica',
    jornada: 'Mañana',
    description: 'Desarrollo de habilidades fundamentales en lectoescritura, pensamiento matemático y convivencia.',
    subjectsCount: 7,
    hoursWeeklyTotal: 25,
    coursesCount: 5,
    status: 'Aprobado',
    lastUpdated: 'Vigente 2026',
    areas: [
      {
        name: 'Pensamiento Numérico y Geométrico',
        code: 'MAT-PRIM',
        subjects: [
          { name: 'Matemáticas Fundamentales', hoursWeekly: 5, teacherSuggested: 'Docente Primaria', avatar: '🔢', linkedCourses: ['1° a 5°'], description: 'Operaciones básicas, geometría y resolución de problemas cotidianos.' }
        ]
      },
      {
        name: 'Lenguaje y Comunicación',
        code: 'LENG-PRIM',
        subjects: [
          { name: 'Español y Comprensión Lectora', hoursWeekly: 5, teacherSuggested: 'Docente Primaria', avatar: '📖', linkedCourses: ['1° a 5°'], description: 'Lectura comprensiva, escritura y expresión oral.' }
        ]
      }
    ]
  },
  {
    id: 'malla-preescolar',
    name: 'Malla Curricular Integral Preescolar',
    levelName: 'Preescolar',
    coordinator: 'Coordinación Preescolar',
    jornada: 'Mañana',
    description: 'Dimensiones del desarrollo infantil: cognitiva, comunicativa, socioafectiva, corporal y estética.',
    subjectsCount: 5,
    hoursWeeklyTotal: 20,
    coursesCount: 3,
    status: 'Aprobado',
    lastUpdated: 'Vigente 2026',
    areas: [
      {
        name: 'Dimensiones del Desarrollo Infantil',
        code: 'DIM-PRE',
        subjects: [
          { name: 'Dimensión Cognitiva y Exploración', hoursWeekly: 5, teacherSuggested: 'Docente Transición', avatar: '🎨', linkedCourses: ['Transición'], description: 'Pensamiento lógico temprano y exploración del entorno.' },
          { name: 'Dimensión Comunicativa', hoursWeekly: 5, teacherSuggested: 'Docente Transición', avatar: '🗣️', linkedCourses: ['Transición'], description: 'Iniciación al lenguaje, narración y expresión artística.' }
        ]
      }
    ]
  }
];

export default function CurriculumOperationsHubPage() {
  const { activeInstitution, institutionId, mounted } = useRole();
  const currentInstId = activeInstitution?.id || institutionId;
  const storageKey = currentInstId
    ? `aulacore-mallas-settings-${currentInstId}`
    : 'aulacore-mallas-settings';

  // Fetch curriculums from Supabase
  const [curriculums, setCurriculums] = useState<CurriculumDetails[]>(DEFAULT_MALLAS);
  const [activeTab, setActiveTab] = useState<'mallas' | 'areas' | 'asignaturas' | 'intensidad'>('mallas');
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
  
  // Interactive accordions mapping
  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>({
    'CIEN-BACH': true,
    'HUM-TECN': false,
    'DIM-PRE': true,
    'ARE-PRIM': true
  });

  // Modal State for New Curriculum
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState<CurriculumDetails['levelName']>('Bachillerato');
  const [newJornada, setNewJornada] = useState('Mañana');
  const [newCoordinator, setNewCoordinator] = useState('');
  const [newHours, setNewHours] = useState(25);
  const [newDescription, setNewDescription] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load curriculums from institutional storage with Supabase & default seed fallbacks
  useEffect(() => {
    if (!mounted) return;

    const loadMallas = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCurriculums(parsed);
            return;
          }
        }
      } catch (err) {
        console.warn('Error reading mallas from storage:', err);
      }

      // Check Supabase if table exists, else keep defaults
      const fetchSupabase = async () => {
        try {
          const { data, error } = await supabase.from('curriculums').select('*');
          if (!error && data && data.length > 0) {
            setCurriculums(data as CurriculumDetails[]);
            localStorage.setItem(storageKey, JSON.stringify(data));
            return;
          }
        } catch {
          // Table doesn't exist or network error: use seed defaults
        }

        setCurriculums(DEFAULT_MALLAS);
        localStorage.setItem(storageKey, JSON.stringify(DEFAULT_MALLAS));
      };

      fetchSupabase();
    };

    loadMallas();

    const handleSync = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setCurriculums(JSON.parse(stored));
        }
      } catch (_) {}
    };

    window.addEventListener('aulacore-mallas-updated', handleSync);
    return () => {
      window.removeEventListener('aulacore-mallas-updated', handleSync);
    };
  }, [mounted, currentInstId, storageKey]);

  const saveCurriculums = (updatedList: CurriculumDetails[]) => {
    setCurriculums(updatedList);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('aulacore-mallas-updated'));
    } catch (e) {
      console.error('Error saving mallas:', e);
    }
  };

  const handleToggleAccordion = (code: string) => {
    setExpandedAreas(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  // Add a new academic curriculum
  const handleCreateCurriculum = () => {
    if (!newName.trim()) {
      triggerToast('⚠️ Por favor escribe el nombre de la malla.');
      return;
    }

    const assignedCoordinator = newCoordinator.trim() || activeInstitution?.rector_name || 'Coordinación Académica';

    const newC: CurriculumDetails = {
      id: 'c-' + Date.now(),
      name: newName.trim(),
      levelName: newLevel,
      coordinator: assignedCoordinator,
      jornada: newJornada,
      description: newDescription.trim() || `Malla curricular para ${newLevel} - Jornada ${newJornada}`,
      subjectsCount: 4,
      hoursWeeklyTotal: Number(newHours) || 25,
      coursesCount: 1,
      status: 'Borrador',
      lastUpdated: 'Hace unos instantes',
      areas: [
        {
          name: `Áreas Nucleares - ${newName.trim()}`,
          code: 'ARE-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          subjects: [
            { 
              name: 'Fundamentos Curriculares', 
              hoursWeekly: 5, 
              teacherSuggested: assignedCoordinator, 
              avatar: '📘', 
              linkedCourses: ['Curso Principal'], 
              description: 'Asignatura base del plan de estudios aprobado.' 
            },
            { 
              name: 'Taller de Profundización', 
              hoursWeekly: 4, 
              teacherSuggested: assignedCoordinator, 
              avatar: '🔬', 
              linkedCourses: ['Curso Principal'], 
              description: 'Módulo práctico y de competencias aplicadas.' 
            }
          ]
        }
      ]
    };

    const updatedList = [newC, ...curriculums];
    saveCurriculums(updatedList);
    
    setNewName('');
    setNewCoordinator('');
    setNewDescription('');
    setNewHours(25);
    setAddModalOpen(false);
    triggerToast(`✓ Malla "${newName.trim()}" creada con éxito.`);
  };

  // Delete curriculum
  const handleDeleteCurriculum = (id: string, name: string) => {
    const updatedList = curriculums.filter(c => c.id !== id);
    saveCurriculums(updatedList);
    triggerToast(`✓ Malla ${name} removida del registro.`);
    if (selectedCurriculumId === id) setDrawerOpen(false);
  };

  // Get active selected details for drawer
  const selectedCurriculum = curriculums.find(c => c.id === selectedCurriculumId) || null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/20 py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      
      {/* Toast Notification Stack */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
          <BookOpen className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mallas Operations header (Clean & Compact, NO KPIs) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" /> Mallas Curriculares
          </h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wider mt-1 uppercase">Centro Académico de Estándares, Áreas y Asignaturas MEN</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nueva Malla
          </button>
        </div>
      </div>

      {/* 2. CURRICULUM GRID VIEW (Clean compact visual cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {curriculums.map(curr => (
          <div 
            key={curr.id}
            onClick={() => {
              setSelectedCurriculumId(curr.id);
              setDrawerOpen(true);
            }}
            className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all duration-200 group flex flex-col justify-between space-y-4 cursor-pointer relative"
          >
            
            {/* Identity & Status */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[8.5px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border",
                  curr.levelName === 'Preescolar' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                  curr.levelName === 'Primaria' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                  'bg-amber-50 border-amber-100 text-amber-700'
                )}>
                  Nivel: {curr.levelName}
                </span>

                <span className="bg-slate-100 border border-slate-200/50 text-slate-600 text-[8.5px] font-semibold px-2 py-0.5 rounded uppercase">
                  {curr.status}
                </span>
              </div>

              <h3 className="text-base font-semibold text-slate-800 tracking-tight pt-2 leading-tight group-hover:text-indigo-700 transition-colors">
                {curr.name}
              </h3>
              
              {curr.description && (
                <p className="text-xs text-slate-500 line-clamp-2 pt-0.5">
                  {curr.description}
                </p>
              )}

              <div className="flex items-center justify-between text-slate-450 text-[10px] font-semibold pt-1">
                <div className="flex items-center gap-1">
                  <span>Coordinador:</span>
                  <span className="text-slate-650 font-bold">{curr.coordinator}</span>
                </div>
                {curr.jornada && (
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-medium">
                    {curr.jornada}
                  </span>
                )}
              </div>
            </div>

            {/* Academic indicators */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50/50 border border-slate-150/50 rounded-2xl p-3 text-center text-xs font-semibold text-slate-700">
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Materias</p>
                <p className="font-bold text-slate-800 leading-none">{curr.subjectsCount}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Horas Sem.</p>
                <p className="font-bold text-slate-800 leading-none">{curr.hoursWeeklyTotal}h</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Cursos</p>
                <p className="font-bold text-slate-800 leading-none">{curr.coursesCount}</p>
              </div>
            </div>

            {/* Visual bottom details */}
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium text-[9px] uppercase font-mono">
                Actualizado {curr.lastUpdated}
              </span>

              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-800 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1 group-hover:translate-x-0.5 transition-all cursor-pointer"
              >
                Ver Malla 360 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* 3. CURRICULUM DRAWERS 360 (Visual colapsibles and high-contrast texts) */}
      {drawerOpen && selectedCurriculum && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Dark glass backdrop overlay */}
            <div 
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            />

            {/* Sliding Panel wrapper */}
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 z-10">
              <div className="pointer-events-auto relative z-10 w-screen max-w-2xl transform bg-slate-900 text-white border-l border-slate-800 shadow-2xl transition-all duration-300">
                
                <div className="flex h-full flex-col overflow-y-scroll py-6 px-6 space-y-6">
                  
                  {/* Header Area */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded">
                          Malla: {selectedCurriculum.levelName}
                        </span>
                        {selectedCurriculum.jornada && (
                          <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-semibold px-2 py-0.5 rounded uppercase font-mono">
                            Jornada {selectedCurriculum.jornada}
                          </span>
                        )}
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-semibold px-2 py-0.5 rounded uppercase font-mono">
                          {selectedCurriculum.status}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold text-slate-100 tracking-tight leading-tight pt-1">
                        {selectedCurriculum.name}
                      </h2>
                      <p className="text-xs text-slate-350 font-medium">
                        Coordinación Académica a cargo: <span className="text-indigo-400 font-semibold">{selectedCurriculum.coordinator}</span>
                      </p>
                      {selectedCurriculum.description && (
                        <p className="text-xs text-slate-400 font-normal pt-1">
                          {selectedCurriculum.description}
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={() => setDrawerOpen(false)}
                      className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick local statistics inside drawer */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                        📖
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">Materias Vinculadas</p>
                        <p className="font-semibold text-slate-200 text-sm mt-1">{selectedCurriculum.subjectsCount} asignaturas activas</p>
                      </div>
                    </div>

                    <div className="bg-slate-850 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                        ⏱️
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">Intensidad Semanal</p>
                        <p className="font-semibold text-slate-200 text-sm mt-1">{selectedCurriculum.hoursWeeklyTotal} horas sugeridas</p>
                      </div>
                    </div>
                  </div>

                  {/* Areas & Subjects Collapsible Accordion (No tables, Notion style) */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450 block">Áreas y Asignaturas Configuradas</h3>

                    <div className="space-y-3">
                      {selectedCurriculum.areas.map(area => {
                        const isExpanded = expandedAreas[area.code] ?? false;

                        return (
                          <div 
                            key={area.code} 
                            className="bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-200"
                          >
                            
                            {/* Accordion header button */}
                            <button
                              onClick={() => handleToggleAccordion(area.code)}
                              className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
                            >
                              <div>
                                <span className="text-[8.5px] font-semibold bg-slate-900 border border-slate-800 text-indigo-400 px-2 py-0.5 rounded font-mono uppercase">
                                  Cod: {area.code}
                                </span>
                                <h4 className="text-xs font-semibold text-slate-100 pt-1">
                                  {area.name}
                                </h4>
                              </div>
                              
                              <div className="flex items-center gap-2 text-slate-400">
                                <span className="text-[10px] font-semibold">{area.subjects.length} materias</span>
                                {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-400 rotate-180 transition-transform" /> : <ChevronRight className="w-4 h-4" />}
                              </div>
                            </button>

                            {/* Accordion content items list */}
                            {isExpanded && (
                              <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-800/60 divide-y divide-slate-800/45 animate-in slide-in-from-top-2 duration-200">
                                {area.subjects.map((sub, idx) => (
                                  <div key={sub.name} className={cn("pt-3.5 space-y-2", idx === 0 && "pt-1")}>
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5">
                                      <div>
                                        <h5 className="text-sm font-medium text-slate-100 flex items-center gap-1.5">
                                          {sub.name}
                                        </h5>
                                        <p className="text-xs text-slate-350 font-normal leading-relaxed max-w-md mt-1">
                                          {sub.description}
                                        </p>
                                      </div>

                                      <div className="text-right shrink-0">
                                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9.5px] font-medium px-2 py-0.5 rounded uppercase font-mono">
                                          {sub.hoursWeekly} Horas/Sem
                                        </span>
                                      </div>
                                    </div>

                                    {/* Subject metadata chips row */}
                                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-normal text-slate-400 pt-1">
                                      <div className="flex items-center gap-1">
                                        <span className="text-lg leading-none">{sub.avatar}</span>
                                        <span>Docente sugerido: <span className="text-slate-200 font-medium">{sub.teacherSuggested}</span></span>
                                      </div>
                                      
                                      <span className="text-slate-700">|</span>

                                      <div className="flex items-center gap-1">
                                        <span className="text-slate-450">Cursos vinculados:</span>
                                        <div className="flex gap-1">
                                          {sub.linkedCourses.map(c => (
                                            <span key={c} className="bg-slate-900 text-slate-350 px-1.5 py-0.2 rounded font-mono text-[9px] font-normal">{c}</span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Future operations telemetry placeholders */}
                  <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 space-y-3 text-xs text-slate-300">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block border-b border-slate-800 pb-1.5">
                      Especificación de Carga & IA
                    </span>
                    <div className="grid grid-cols-2 gap-4 font-semibold text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[8.5px] flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> NORMATIVA MEN:</span>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8.5px] font-bold px-2 py-0.5 rounded uppercase">Certificado</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[8.5px] flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> OPTIMIZADOR IA:</span>
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[8.5px] font-bold px-2 py-0.5 rounded uppercase">Listo</span>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Footer controls */}
                  <div className="border-t border-slate-800 pt-5 mt-auto flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleDeleteCurriculum(selectedCurriculum.id, selectedCurriculum.name)}
                      className="text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 px-3.5 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      Remover Malla
                    </button>
                    
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-semibold leading-none">
                      AulaCore Curriculum engine 2026
                    </span>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. NOTION-STYLE NEW CURRICULUM CREATION MODAL OVERLAY */}
      {addModalOpen && (
        <div 
          className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 sm:p-6" 
          role="dialog" 
          aria-modal="true"
        >
          {/* Backdrop shadow (behind modal, never over modal) */}
          <div 
            onClick={() => setAddModalOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
            aria-hidden="true"
          />

          {/* Modal Box */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left shadow-2xl transition-all my-8 animate-in zoom-in-95 duration-200"
          >
            <div className="bg-white px-6 pt-6 pb-4 space-y-4">
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                      Nueva Malla Curricular
                    </h3>
                    <p className="text-[11px] text-slate-500">Defina el nivel, jornada y especificaciones del plan de estudio</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form fields */}
              <div className="space-y-4 text-xs font-semibold text-slate-700">
                
                {/* Nombre de la Malla */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                    Nombre de la Malla <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej. Especialidad en Programación y Software"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-900 placeholder:text-slate-400 text-xs font-medium"
                    autoFocus
                  />
                </div>

                {/* Nivel Educativo & Jornada Aplicable */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Nivel Educativo
                    </label>
                    <select 
                      value={newLevel} 
                      onChange={(e) => setNewLevel(e.target.value as CurriculumDetails['levelName'])}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Preescolar">Preescolar</option>
                      <option value="Primaria">Primaria</option>
                      <option value="Bachillerato">Bachillerato</option>
                      <option value="Media">Media Técnica</option>
                      <option value="Especialidad">Especialidad</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Jornada Aplicable
                    </label>
                    <select 
                      value={newJornada} 
                      onChange={(e) => setNewJornada(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Mañana">Jornada Mañana</option>
                      <option value="Tarde">Jornada Tarde</option>
                      <option value="Única">Jornada Única</option>
                      <option value="Nocturna">Jornada Nocturna</option>
                      <option value="Completa">Jornada Completa</option>
                    </select>
                  </div>
                </div>

                {/* Horas Semanales & Coordinador */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Intensidad Horaria Semanal (h)
                    </label>
                    <input 
                      type="number" 
                      min={1}
                      max={60}
                      value={newHours}
                      onChange={(e) => setNewHours(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-900 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Coordinador Líder
                    </label>
                    <input 
                      type="text" 
                      placeholder={activeInstitution?.rector_name || "Ej. Coordinador Académico"}
                      value={newCoordinator}
                      onChange={(e) => setNewCoordinator(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-900 placeholder:text-slate-400 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                    Descripción de la Malla
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="Enfoque pedagógico, competencias MEN y lineamientos generales de la malla..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-900 placeholder:text-slate-400 text-xs font-medium resize-none"
                  />
                </div>

              </div>

            </div>

            {/* Modal actions */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateCurriculum}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                CREAR MALLA CURRICULAR
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
