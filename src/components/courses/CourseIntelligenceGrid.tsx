'use client';

import React, { useState } from 'react';
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

  // Derived filter options
  const campuses = Array.from(new Set(MOCK_COURSES.map(c => c.campus)));
  const levels = Array.from(new Set(MOCK_COURSES.map(c => c.level)));
  const shifts = Array.from(new Set(MOCK_COURSES.map(c => c.shift)));

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
  const filteredCourses = MOCK_COURSES.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.director.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampus = campusFilter === 'Todas' || c.campus === campusFilter;
    const matchesLevel = levelFilter === 'Todos' || c.level === levelFilter;
    const matchesShift = shiftFilter === 'Todas' || c.shift === shiftFilter;

    return matchesSearch && matchesCampus && matchesLevel && matchesShift;
  });

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
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all">
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

    </div>
  );
}
