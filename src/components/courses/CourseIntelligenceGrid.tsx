'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_COURSES, CourseMockData } from '@/lib/data/mock-courses';
import { CourseMetricsPanel } from './CourseMetricsPanel';
import { CourseCard } from './CourseCard';
import { CourseTable } from './CourseTable';
import { Course360Drawer } from './Course360Drawer';
import { Search, Filter, LayoutGrid, List, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CourseIntelligenceGrid() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [campusFilter, setCampusFilter] = useState('Todas');
  const [levelFilter, setLevelFilter] = useState('Todos');
  const [shiftFilter, setShiftFilter] = useState('Todas');

  const [selectedCourse, setSelectedCourse] = useState<CourseMockData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Courses state with local cache persistence
  const [courses, setCourses] = useState<CourseMockData[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aulacore-courses-list');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return MOCK_COURSES;
  });

  useEffect(() => {
    localStorage.setItem('aulacore-courses-list', JSON.stringify(courses));
  }, [courses]);

  // Modal States for Nuevo Curso
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState<'Preescolar' | 'Primaria' | 'Bachillerato' | 'Media Técnica'>('Bachillerato');
  const [newCourseShift, setNewCourseShift] = useState<'Mañana' | 'Tarde' | 'Única'>('Mañana');
  const [newCourseCampus, setNewCourseCampus] = useState('Sede Principal');
  const [newDirectorName, setNewDirectorName] = useState('');
  const [newDirectorEmail, setNewDirectorEmail] = useState('');
  const [newDirectorPhone, setNewDirectorPhone] = useState('');
  const [newTotalStudents, setNewTotalStudents] = useState(30);

  // Derived filter options
  const campuses = Array.from(new Set(courses.map(c => c.campus)));
  const levels = Array.from(new Set(courses.map(c => c.level)));
  const shifts = Array.from(new Set(courses.map(c => c.shift)));

  const handleCourseClick = (course: CourseMockData) => {
    setSelectedCourse(course);
    setIsDrawerOpen(true);
  };

  const clearFilter = (filterName: string) => {
    if (filterName === 'campus') setCampusFilter('Todas');
    if (filterName === 'level') setLevelFilter('Todos');
    if (filterName === 'shift') setShiftFilter('Todas');
    if (filterName === 'search') setSearchTerm('');
  };

  const hasActiveFilters = campusFilter !== 'Todas' || levelFilter !== 'Todos' || shiftFilter !== 'Todas' || searchTerm !== '';

  const clearAllFilters = () => {
    setCampusFilter('Todas');
    setLevelFilter('Todos');
    setShiftFilter('Todas');
    setSearchTerm('');
  };

  // Apply filters
  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.director.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampus = campusFilter === 'Todas' || c.campus === campusFilter;
    const matchesLevel = levelFilter === 'Todos' || c.level === levelFilter;
    const matchesShift = shiftFilter === 'Todas' || c.shift === shiftFilter;

    return matchesSearch && matchesCampus && matchesLevel && matchesShift;
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim() || !newDirectorName.trim()) return;

    const total = Number(newTotalStudents) || 30;
    const boys = Math.floor(total / 2);
    const girls = total - boys;

    const newCourse: CourseMockData = {
      id: `c-${newCourseName.toLowerCase().replace(/ /g, '-')}-${Date.now()}`,
      name: newCourseName,
      level: newCourseLevel,
      shift: newCourseShift,
      campus: newCourseCampus,
      director: {
        id: `d-${Date.now()}`,
        name: newDirectorName,
        email: newDirectorEmail || `${newDirectorName.toLowerCase().replace(/ /g, '.')}@aulacore.edu`,
        phone: newDirectorPhone || '+573001234500'
      },
      metrics: {
        totalStudents: total,
        boys: boys,
        girls: girls,
        diverse: 0,
        averageGpa: 4.0,
        averageAttendance: 95,
        activeAlerts: 0,
        studentsAtRisk: 0
      },
      academicRisk: 'Bajo',
      behaviorRisk: 'Bajo',
      students: []
    };

    setCourses([...courses, newCourse]);
    setIsNewCourseModalOpen(false);

    // Reset fields
    setNewCourseName('');
    setNewCourseLevel('Bachillerato');
    setNewCourseShift('Mañana');
    setNewCourseCampus('Sede Principal');
    setNewDirectorName('');
    setNewDirectorEmail('');
    setNewDirectorPhone('');
    setNewTotalStudents(30);

    alert(`✓ Curso ${newCourseName} creado exitosamente.`);
  };

  return (
    <div className="space-y-8">
      
      <CourseMetricsPanel />

      {/* Main Toolbar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
        
        {/* Top Row: Search & Actions */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:max-w-md group">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input 
              placeholder="Buscar por curso o director de grupo..." 
              className="pl-9 bg-slate-50 border-slate-200 w-full focus-visible:ring-indigo-500 transition-shadow"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setIsNewCourseModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Curso
            </Button>
          </div>
        </div>

        {/* Bottom Row: Filters & View Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 transition-colors cursor-pointer"
                value={campusFilter}
                onChange={e => setCampusFilter(e.target.value)}
              >
                <option value="Todas">Sede: Todas</option>
                {campuses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <select 
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 transition-colors cursor-pointer"
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
            >
              <option value="Todos">Nivel: Todos</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select 
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 transition-colors cursor-pointer"
              value={shiftFilter}
              onChange={e => setShiftFilter(e.target.value)}
            >
              <option value="Todas">Jornada: Todas</option>
              {shifts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              Mostrando <span className="text-indigo-600">{filteredCourses.length}</span> cursos
            </div>

            <div className="flex items-center p-1 bg-slate-100 rounded-lg shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-md transition-all flex items-center justify-center",
                  viewMode === 'grid' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
                title="Vista de Tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-1.5 rounded-md transition-all flex items-center justify-center",
                  viewMode === 'table' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
                title="Vista de Tabla"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3 mt-1 border-t border-slate-50 animate-in fade-in slide-in-from-top-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Filtros Activos:</span>
            
            {searchTerm && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md text-[10px] font-bold">
                Búsqueda: {searchTerm}
                <button onClick={() => clearFilter('search')} className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            )}
            {campusFilter !== 'Todas' && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md text-[10px] font-bold">
                Sede: {campusFilter}
                <button onClick={() => clearFilter('campus')} className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            )}
            {levelFilter !== 'Todos' && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md text-[10px] font-bold">
                Nivel: {levelFilter}
                <button onClick={() => clearFilter('level')} className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            )}
            {shiftFilter !== 'Todas' && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md text-[10px] font-bold">
                Jornada: {shiftFilter}
                <button onClick={() => clearFilter('shift')} className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            )}
            
            <button 
              onClick={clearAllFilters}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline ml-1 transition-colors"
            >
              Limpiar todos
            </button>
          </div>
        )}

      </div>

      {/* Content Area */}
      {viewMode === 'grid' ? (
        filteredCourses.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-semibold border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <p className="text-lg text-slate-800 mb-1">No se encontraron cursos</p>
            <p className="text-sm font-medium">Prueba ajustando los filtros o el término de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCourses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onClick={handleCourseClick} 
              />
            ))}
          </div>
        )
      ) : (
        <div className="animate-in fade-in duration-300">
          <CourseTable 
            courses={filteredCourses} 
            onClick={handleCourseClick} 
          />
        </div>
      )}

      {/* Detail Drawer */}
      <Course360Drawer 
        course={selectedCourse} 
        isOpen={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
      />

      {/* Nuevo Curso Modal */}
      {isNewCourseModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsNewCourseModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <div className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle relative z-10 w-full animate-in zoom-in-95 duration-200">
            <form onSubmit={handleCreateCourse}>
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600 animate-bounce" />
                    Crear Nuevo Curso
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Registre un nuevo curso y asigne su director de grupo.</p>
                </div>
                <button type="button" onClick={() => setIsNewCourseModalOpen(false)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4 text-xs font-semibold text-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Nombre del Curso</label>
                    <Input 
                      required
                      placeholder="Ej. 10-C, 8-B"
                      value={newCourseName}
                      onChange={e => setNewCourseName(e.target.value)}
                      className="bg-slate-50 border-slate-200 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Nivel Académico</label>
                    <select
                      value={newCourseLevel}
                      onChange={e => setNewCourseLevel(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 transition-colors cursor-pointer h-10"
                    >
                      <option value="Preescolar">Preescolar</option>
                      <option value="Primaria">Primaria</option>
                      <option value="Bachillerato">Bachillerato</option>
                      <option value="Media Técnica">Media Técnica</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Sede Escolar</label>
                    <select
                      value={newCourseCampus}
                      onChange={e => setNewCourseCampus(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 transition-colors cursor-pointer h-10"
                    >
                      <option value="Sede Principal">Sede Principal</option>
                      <option value="Sede Campestre">Sede Campestre</option>
                      <option value="Sede Norte">Sede Norte</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Jornada</label>
                    <select
                      value={newCourseShift}
                      onChange={e => setNewCourseShift(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 transition-colors cursor-pointer h-10"
                    >
                      <option value="Mañana">Mañana</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Única">Única</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Información del Director de Grupo</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Nombre del Director</label>
                    <Input 
                      required
                      placeholder="Ej. Patricia Restrepo"
                      value={newDirectorName}
                      onChange={e => setNewDirectorName(e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Correo Electrónico</label>
                      <Input 
                        type="email"
                        placeholder="Ej. p.restrepo@aulacore.edu"
                        value={newDirectorEmail}
                        onChange={e => setNewDirectorEmail(e.target.value)}
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Teléfono de Contacto</label>
                      <Input 
                        placeholder="Ej. +57 300 999 8888"
                        value={newDirectorPhone}
                        onChange={e => setNewDirectorPhone(e.target.value)}
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Cantidad de Estudiantes</label>
                  <Input 
                    type="number"
                    min="1"
                    max="50"
                    value={newTotalStudents}
                    onChange={e => setNewTotalStudents(Number(e.target.value))}
                    className="bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsNewCourseModalOpen(false)} className="h-9 px-4 rounded-xl border-slate-250 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer">
                  Cancelar
                </Button>
                <Button type="submit" className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider border-none cursor-pointer">
                  Guardar Curso
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
