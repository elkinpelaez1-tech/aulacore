'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_STUDENTS, StudentMockData } from '@/lib/data/mock-students';
import { StudentMetricsPanel } from './StudentMetricsPanel';
import { StudentCard } from './StudentCard';
import { StudentTable } from './StudentTable';
import { Student360Drawer } from './Student360Drawer';
import { Search, Filter, LayoutGrid, List, Plus, Link as LinkIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function StudentIntelligenceGrid() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [campusFilter, setCampusFilter] = useState('Todas');
  const [levelFilter, setLevelFilter] = useState('Todos');
  const [gradeFilter, setGradeFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const [selectedStudent, setSelectedStudent] = useState<StudentMockData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Toast / Notificaciones
  const [toastMsg, setToastMsg] = useState('');

  const handleShareLink = () => {
    const magicLink = typeof window !== 'undefined' ? `${window.location.origin}/join/pre-registro-2026` : 'https://aulacore.edu.co/join/pre-registro-2026';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(magicLink).then(() => {
        setToastMsg('🔗 ¡Enlace Mágico de Pre-registro copiado! Compártelo con los acudientes.');
        setTimeout(() => setToastMsg(''), 4000);
      }).catch(() => {
        alert(`Copiar enlace: ${magicLink}`);
      });
    } else {
      alert(`Copiar enlace: ${magicLink}`);
    }
  };

  const handleNewEnrollment = () => {
    router.push('/configuracion/matricula');
  };

  // Derived filter options
  const campuses = Array.from(new Set(MOCK_STUDENTS.map(s => s.campus)));
  const levels = Array.from(new Set(MOCK_STUDENTS.map(s => s.level)));
  const grades = Array.from(new Set(MOCK_STUDENTS.map(s => s.grade)));
  const statuses = Array.from(new Set(MOCK_STUDENTS.map(s => s.status)));

  const handleStudentClick = (student: StudentMockData) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const clearFilter = (filterName: string) => {
    if (filterName === 'campus') setCampusFilter('Todas');
    if (filterName === 'level') setLevelFilter('Todos');
    if (filterName === 'grade') setGradeFilter('Todos');
    if (filterName === 'status') setStatusFilter('Todos');
    if (filterName === 'search') setSearchTerm('');
  };

  const hasActiveFilters = campusFilter !== 'Todas' || levelFilter !== 'Todos' || gradeFilter !== 'Todos' || statusFilter !== 'Todos' || searchTerm !== '';

  const clearAllFilters = () => {
    setCampusFilter('Todas');
    setLevelFilter('Todos');
    setGradeFilter('Todos');
    setStatusFilter('Todos');
    setSearchTerm('');
  };

  // Apply filters
  const filteredStudents = MOCK_STUDENTS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.document.includes(searchTerm) ||
                          s.group.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampus = campusFilter === 'Todas' || s.campus === campusFilter;
    const matchesLevel = levelFilter === 'Todos' || s.level === levelFilter;
    const matchesGrade = gradeFilter === 'Todos' || s.grade === gradeFilter;
    const matchesStatus = statusFilter === 'Todos' || s.status === statusFilter;

    return matchesSearch && matchesCampus && matchesLevel && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-8">
      
      <StudentMetricsPanel />

      {/* Main Toolbar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
        
        {/* Top Row: Search & Actions */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:max-w-md group">
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-all duration-200 group-focus-within:scale-105" />
            <Input 
              placeholder="Buscar por nombre, documento o curso..." 
              className="pl-11 pr-4 h-11 bg-white hover:bg-white/80 border-slate-200 hover:border-slate-350 focus:border-indigo-500 w-full rounded-xl transition-all duration-300 shadow-[0_3px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(99,102,241,0.06)] group-focus-within:shadow-[0_4px_16px_rgba(99,102,241,0.1)] focus-visible:ring-2 focus-visible:ring-indigo-500/20 text-sm font-medium placeholder:text-slate-400/90"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              onClick={handleShareLink}
              variant="outline" 
              className="text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Compartir Link
            </Button>
            <Button 
              onClick={handleNewEnrollment}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Matrícula
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
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
            >
              <option value="Todos">Grado: Todos</option>
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select 
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 transition-colors cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="Todos">Estado: Todos</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              Mostrando <span className="text-indigo-600">{filteredStudents.length}</span> estudiantes
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
            {gradeFilter !== 'Todos' && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md text-[10px] font-bold">
                Grado: {gradeFilter}
                <button onClick={() => clearFilter('grade')} className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            )}
            {statusFilter !== 'Todos' && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md text-[10px] font-bold">
                Estado: {statusFilter}
                <button onClick={() => clearFilter('status')} className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
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
        filteredStudents.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-semibold border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <p className="text-lg text-slate-800 mb-1">No se encontraron estudiantes</p>
            <p className="text-sm font-medium">Prueba ajustando los filtros o el término de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredStudents.map(student => (
              <StudentCard 
                key={student.id} 
                student={student} 
                onClick={handleStudentClick} 
              />
            ))}
          </div>
        )
      ) : (
        <div className="animate-in fade-in duration-300">
          <StudentTable 
            students={filteredStudents} 
            onClick={handleStudentClick} 
          />
        </div>
      )}

      {/* Detail Drawer */}
      <Student360Drawer 
        student={selectedStudent} 
        isOpen={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
      />

      {/* Premium Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white text-xs font-semibold px-4 py-3.5 rounded-xl shadow-xl z-[9999] flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">✓</div>
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
}
