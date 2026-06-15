'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, LayoutGrid, TableProperties, MessageSquare, GraduationCap, Eye, Mail } from 'lucide-react';
import { MOCK_TEACHERS, TeacherStatus, AcademicLevel, TeacherMockData } from '@/lib/data/mock-teachers';
import { CompactTeacherCard } from './CompactTeacherCard';
import { TeacherCard } from './TeacherCard';
import { TeacherMetricsPanel } from './TeacherMetricsPanel';
import { TeacherDetailDrawer } from './TeacherDetailDrawer';
import { TeacherScheduleModal } from './TeacherScheduleModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const statusColors: Record<TeacherStatus, { bg: string, text: string, border: string, dot: string }> = {
  'Activo': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'En clase': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'Reunión': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Disponible': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  'Licencia': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', dot: 'bg-slate-400' },
  'Sobrecarga académica': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' }
};

const LEVELS: AcademicLevel[] = ['Preescolar', 'Primaria', 'Bachillerato', 'Media Técnica', 'Coordinación Académica', 'Administrativos Docentes'];

export function TeacherIntelligenceGrid() {
  const [teachers, setTeachers] = useState<TeacherMockData[]>(MOCK_TEACHERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TeacherStatus | 'Todos'>('Todos');
  const [campusFilter, setCampusFilter] = useState<string>('Todas');
  const [activeMetricFilter, setActiveMetricFilter] = useState<string>('Todos');
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherMockData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grouped' | 'cards' | 'table'>('grouped');

  const normalizeStr = (str: string) => 
    str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';

  useEffect(() => {
    async function loadRealTeachers() {
      try {
        // 1. Obtener aprobados de teacher_onboardings
        const { data: onboardings, error: onboardingError } = await supabase
          .from('teacher_onboardings')
          .select('*')
          .in('status', ['invited', 'email_sent', 'activated', 'first_access']);

        if (onboardingError) {
          console.error("Error loading approved teachers:", onboardingError);
        }

        // 2. Obtener docentes registrados en la base de datos (con rol de docente)
        const { data: dbRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            profiles:user_id ( id, first_name, last_name, avatar_url )
          `)
          .eq('institution_id', '11111111-1111-1111-1111-111111111111')
          .eq('role', 'docente');

        if (rolesError) {
          console.error("Error loading official teachers from roles:", rolesError);
        }

        const mappedRealTeachers: TeacherMockData[] = [];

        // Mapear onboardings
        if (onboardings && onboardings.length > 0) {
          onboardings.forEach((t: any) => {
            let level: AcademicLevel = 'Primaria';
            if (t.academic_level) {
              if (t.academic_level.includes('Preescolar')) level = 'Preescolar';
              else if (t.academic_level.includes('Primaria')) level = 'Primaria';
              else if (t.academic_level.includes('Bachillerato')) level = 'Bachillerato';
              else if (t.academic_level.includes('Media')) level = 'Media Técnica';
              else if (t.academic_level.includes('Coordinación')) level = 'Coordinación Académica';
              else if (t.academic_level.includes('Administrativo')) level = 'Administrativos Docentes';
            }

            let status: TeacherStatus = 'Activo';
            if (t.status === 'invited') status = 'Disponible';
            else if (t.status === 'activated') status = 'Activo';

            mappedRealTeachers.push({
              id: t.user_id || t.id, // Mapeamos a user_id como ID principal si existe
              name: t.full_name,
              document: t.document_id,
              email: t.email,
              phone: t.phone,
              specialty: t.profession || t.subject_area || 'Docente',
              area: t.subject_area || 'General',
              level: level,
              campus: t.sede || 'Sede Principal',
              assignedCourses: t.domain_areas || [],
              weeklyHours: t.selected_slots ? t.selected_slots.length : 20,
              status: status,
              avatarUrl: t.foto_url,
              alerts: []
            });
          });
        }

        // Mapear oficiales (los que no tengan onboarding)
        if (dbRoles && dbRoles.length > 0) {
          dbRoles
            .filter((r: any) => r.profiles)
            .forEach((r: any) => {
              const p = r.profiles;
              // Verificar si ya fue agregado por el onboarding
              const alreadyAdded = mappedRealTeachers.some(m => m.id === p.id);
              if (!alreadyAdded) {
                mappedRealTeachers.push({
                  id: p.id, // user_id
                  name: `${p.first_name} ${p.last_name}`,
                  document: 'N/A',
                  email: `${p.first_name.toLowerCase().replace(/\s/g, '')}@aulacore.edu.co`,
                  phone: '+57 300 000 0000',
                  specialty: 'Docente Oficial',
                  area: 'General',
                  level: 'Primaria',
                  campus: 'Sede Principal',
                  assignedCourses: [],
                  weeklyHours: 20,
                  status: 'Activo',
                  avatarUrl: p.avatar_url,
                  alerts: []
                });
              }
            });
        }

        // Combinar MOCK_TEACHERS con los docentes reales mapeados
        setTeachers(prev => {
          const combined = [...MOCK_TEACHERS];
          mappedRealTeachers.forEach((real: TeacherMockData) => {
            const exists = combined.some(m => m.id === real.id || (real.email && m.email.toLowerCase() === real.email.toLowerCase()));
            if (!exists) {
              combined.push(real);
            }
          });

          // Check if "Docentes" was imported in migration logs
          if (typeof window !== 'undefined') {
            const logsStr = localStorage.getItem('aulacore-migration-logs');
            if (logsStr) {
              try {
                const logs = JSON.parse(logsStr);
                const hasDocentes = logs.some((l: any) => 
                  l.module_type?.toLowerCase().includes('docente') || 
                  l.module_type?.toLowerCase() === 'docentes'
                );
                if (hasDocentes) {
                  const carlosExists = combined.some(m => m.id === 't-79820300' || m.document === '79820300');
                  if (!carlosExists) {
                    combined.push({
                      id: 't-79820300',
                      name: 'Carlos Martínez Gómez',
                      document: '79820300',
                      email: 'carlos.martinez@aulacore.edu.co',
                      phone: '+57 310 456 7890',
                      specialty: 'Lengua Castellana (Lenguaje)',
                      area: 'Lengua Castellana',
                      level: 'Bachillerato',
                      campus: 'Sede Principal',
                      assignedCourses: ['10-A', '11-B'],
                      weeklyHours: 22,
                      status: 'Activo',
                      avatarUrl: 'https://i.pravatar.cc/150?u=79820300',
                      alerts: []
                    });
                  }
                }
              } catch (e) {
                console.warn('Error reading logs in TeacherIntelligenceGrid', e);
              }
            }
          }

          return combined;
        });

      } catch (err) {
        console.error("Error loading teachers from database:", err);
      }
    }

    loadRealTeachers();
  }, []);

  // Auto-open teacher details when redirected from global search
  useEffect(() => {
    const autoOpenId = localStorage.getItem('aulacore-search-auto-open-teacher');
    if (autoOpenId && teachers && teachers.length > 0) {
      const teacher = teachers.find(t => t.id === autoOpenId);
      if (teacher) {
        handleCardClick(teacher);
      }
      localStorage.removeItem('aulacore-search-auto-open-teacher');
    }
  }, [teachers]);

  const uniqueCampuses = Array.from(new Set(teachers.map(t => t.campus)));
  const uniqueStatuses = Array.from(new Set(teachers.map(t => t.status)));

  const handleCardClick = (teacher: TeacherMockData) => {
    setSelectedTeacher(teacher);
    setIsDrawerOpen(true);
  };

  // Helper to filter teachers array based on all filters (search, status, campus, AND metric)
  const getFilteredTeachersList = () => {
    const query = normalizeStr(searchTerm);
    return teachers.filter(t => {
      // 1. Metric filter
      if (activeMetricFilter === 'Primaria' && t.level !== 'Primaria') return false;
      if (activeMetricFilter === 'Bachillerato' && t.level !== 'Bachillerato') return false;
      if (activeMetricFilter === 'Coordinadores' && t.level !== 'Coordinación Académica') return false;
      if (activeMetricFilter === 'En Clase' && t.status !== 'En clase') return false;
      if (activeMetricFilter === 'Sobrecarga' && t.status !== 'Sobrecarga académica') return false;
      if (activeMetricFilter === 'Plan. Pendientes' && !t.alerts.some(a => a.type === 'planeacion_atrasada')) return false;

      // 2. Dropdown & search filters
      const matchesSearch = normalizeStr(t.name).includes(query) || 
                            normalizeStr(t.specialty).includes(query) ||
                            (t.area && normalizeStr(t.area).includes(query)) ||
                            (t.document && normalizeStr(t.document).includes(query)) ||
                            (t.assignedCourses && t.assignedCourses.some(c => normalizeStr(c).includes(query)));
      const matchesStatus = statusFilter === 'Todos' || t.status === statusFilter;
      const matchesCampus = campusFilter === 'Todas' || t.campus === campusFilter;

      return matchesSearch && matchesStatus && matchesCampus;
    });
  };

  const filteredTeachersList = getFilteredTeachersList();

  return (
    <div className="space-y-6">
      <TeacherMetricsPanel 
        teachers={teachers} 
        activeFilter={activeMetricFilter} 
        onFilterChange={setActiveMetricFilter} 
      />

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex-1 relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input 
            placeholder="Buscar docente, especialidad o curso..." 
            className="pl-9 bg-slate-50 border-slate-200 w-full"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap w-full md:w-auto items-center gap-3 justify-between md:justify-end">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 outline-none"
                value={campusFilter}
                onChange={e => setCampusFilter(e.target.value)}
              >
                <option value="Todas">Todas las Sedes</option>
                {uniqueCampuses.map(campus => (
                  <option key={campus} value={campus}>{campus}</option>
                ))}
              </select>
            </div>
            
            <select 
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 outline-none"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
            >
              <option value="Todos">Todos los Estados</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <span className="w-px h-6 bg-slate-200 hidden md:block" />

          {/* Visual Mode Selector */}
          <div className="h-9 bg-slate-100 p-0.5 rounded-lg flex items-center gap-0.5 border border-slate-200/50">
            <button
              onClick={() => setViewMode('grouped')}
              className={cn(
                "px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer",
                viewMode === 'grouped'
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-850 hover:bg-slate-50/50"
              )}
              title="Vista Agrupada por Niveles"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agrupado</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={cn(
                "px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer",
                viewMode === 'cards'
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-850 hover:bg-slate-50/50"
              )}
              title="Vista Tarjetas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer",
                viewMode === 'table'
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-850 hover:bg-slate-50/50"
              )}
              title="Vista Tabla"
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lista / Tabla</span>
            </button>
          </div>
        </div>
      </div>

      {/* RENDER MODE: GROUPED */}
      {viewMode === 'grouped' && (
        <>
          {activeMetricFilter !== 'Todos' ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    Filtrado por: {activeMetricFilter}
                  </h3>
                  <span className="ml-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                    {filteredTeachersList.length} docentes
                  </span>
                </div>
                <button 
                  onClick={() => setActiveMetricFilter('Todos')}
                  className="text-xs font-black text-indigo-600 hover:text-indigo-800 cursor-pointer uppercase tracking-wider hover:underline"
                >
                  Limpiar filtro (Ver todos)
                </button>
              </div>
              {filteredTeachersList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-semibold border-2 border-dashed border-slate-200 rounded-xl">
                  <p>No se encontraron docentes con los criterios del filtro de métricas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredTeachersList.map(teacher => (
                    <CompactTeacherCard 
                      key={teacher.id} 
                      teacher={teacher} 
                      onClick={handleCardClick} 
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
              <Tabs defaultValue="Primaria" className="w-full">
                <TabsList className="w-full flex flex-wrap h-auto bg-slate-100/50 p-1 rounded-lg">
                  {LEVELS.map(level => {
                    const count = teachers.filter(t => t.level === level).length;
                    if (count === 0 && level !== 'Primaria') return null;
                    return (
                      <TabsTrigger key={level} value={level} className="flex-1 min-w-[120px] data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
                        {level} <span className="ml-2 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md text-[10px] font-bold">{count}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {LEVELS.map(level => {
                  let levelTeachers = teachers.filter(t => t.level === level);
                  
                  // Apply filters using normalized strings
                  levelTeachers = levelTeachers.filter(t => {
                    const query = normalizeStr(searchTerm);
                    const matchesSearch = normalizeStr(t.name).includes(query) || 
                                          normalizeStr(t.specialty).includes(query) ||
                                          (t.area && normalizeStr(t.area).includes(query)) ||
                                          (t.document && normalizeStr(t.document).includes(query)) ||
                                          (t.assignedCourses && t.assignedCourses.some(c => normalizeStr(c).includes(query)));
                    const matchesStatus = statusFilter === 'Todos' || t.status === statusFilter;
                    const matchesCampus = campusFilter === 'Todas' || t.campus === campusFilter;
                    return matchesSearch && matchesStatus && matchesCampus;
                  });

                  if (levelTeachers.length === 0 && level !== 'Primaria') return null;

                  // Group by Area
                  const areas = Array.from(new Set(levelTeachers.map(t => t.area))).sort();

                  return (
                    <TabsContent key={level} value={level} className="p-4 pt-6 outline-none">
                      {levelTeachers.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 font-semibold border-2 border-dashed border-slate-200 rounded-xl">
                          <p>No se encontraron docentes en {level} con los filtros actuales.</p>
                        </div>
                      ) : (
                        <Accordion defaultValue={areas} className="w-full space-y-4">
                          {areas.map(area => {
                            const areaTeachers = levelTeachers.filter(t => t.area === area);
                            return (
                              <AccordionItem key={area} value={area} className="border border-slate-200 rounded-xl px-4 bg-slate-50/50">
                                <AccordionTrigger className="hover:no-underline py-4">
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-bold text-slate-800">{area}</h3>
                                    <span className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                                      {areaTeachers.length} docentes
                                    </span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
                                    {areaTeachers.map(teacher => (
                                      <CompactTeacherCard 
                                        key={teacher.id} 
                                        teacher={teacher} 
                                        onClick={handleCardClick} 
                                      />
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )
                          })}
                        </Accordion>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          )}
        </>
      )}

      {/* RENDER MODE: CARDS */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {activeMetricFilter !== 'Todos' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  Filtrado por: {activeMetricFilter}
                </h3>
                <span className="ml-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                  {filteredTeachersList.length} docentes
                </span>
              </div>
              <button 
                onClick={() => setActiveMetricFilter('Todos')}
                className="text-xs font-black text-indigo-600 hover:text-indigo-800 cursor-pointer uppercase tracking-wider hover:underline"
              >
                Limpiar filtro (Ver todos)
              </button>
            </div>
          )}

          {filteredTeachersList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-semibold border-2 border-dashed border-slate-200 rounded-xl bg-white">
              <p>No se encontraron docentes con los criterios de búsqueda o filtros seleccionados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTeachersList.map(teacher => (
                <TeacherCard 
                  key={teacher.id} 
                  teacher={teacher} 
                  onClick={handleCardClick} 
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER MODE: TABLE */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          {activeMetricFilter !== 'Todos' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  Filtrado por: {activeMetricFilter}
                </h3>
                <span className="ml-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                  {filteredTeachersList.length} docentes
                </span>
              </div>
              <button 
                onClick={() => setActiveMetricFilter('Todos')}
                className="text-xs font-black text-indigo-600 hover:text-indigo-800 cursor-pointer uppercase tracking-wider hover:underline"
              >
                Limpiar filtro (Ver todos)
              </button>
            </div>
          )}

          {filteredTeachersList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-semibold border-2 border-dashed border-slate-200 rounded-xl bg-white">
              <p>No se encontraron docentes con los criterios de búsqueda o filtros seleccionados.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-450 uppercase tracking-widest">
                      <th className="p-4 pl-6">Docente</th>
                      <th className="p-4">Especialidad y Área</th>
                      <th className="p-4">Sede y Nivel</th>
                      <th className="p-4">Carga Académica</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 pr-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredTeachersList.map(teacher => (
                      <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-sm relative border border-slate-200">
                              {teacher.avatarUrl ? (
                                <img src={teacher.avatarUrl} alt={teacher.name} className="w-full h-full object-cover" />
                              ) : (
                                teacher.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <p 
                                className="text-xs font-black text-slate-900 cursor-pointer hover:text-indigo-650 transition-colors truncate max-w-[180px]"
                                onClick={() => handleCardClick(teacher)}
                                title={teacher.name}
                              >
                                {teacher.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold">CC. {teacher.document}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-xs font-extrabold text-slate-800 truncate max-w-[200px]" title={teacher.specialty}>{teacher.specialty}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">{teacher.area}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs font-bold text-slate-700">{teacher.campus}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{teacher.level}</p>
                        </td>
                        <td className="p-4">
                          <div className="text-xs font-black text-indigo-700">
                            {teacher.weeklyHours}h <span className="text-[10px] text-slate-400 font-normal">/ sem</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold">{teacher.assignedCourses.length} cursos</div>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border shadow-sm",
                            statusColors[teacher.status].bg,
                            statusColors[teacher.status].text,
                            statusColors[teacher.status].border
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", statusColors[teacher.status].dot)}></span>
                            {teacher.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                const num = teacher.phone.replace(/\D/g, '');
                                window.open(`https://wa.me/${num}`, '_blank');
                              }}
                              className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 cursor-pointer transition-colors"
                              title="Enviar WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleCardClick(teacher)}
                              className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer transition-colors"
                              title="Ver Ficha 360"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <div className="w-32 shrink-0">
                              <TeacherScheduleModal teacherId={teacher.id} teacherName={teacher.name} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <TeacherDetailDrawer 
        teacher={selectedTeacher} 
        isOpen={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
      />
    </div>
  );
}
