'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { MOCK_TEACHERS, TeacherStatus } from '@/lib/data/mock-teachers';
import { TeacherCard } from './TeacherCard';
import { TeacherMetricsPanel } from './TeacherMetricsPanel';

export function TeachersGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TeacherStatus | 'Todos'>('Todos');
  const [areaFilter, setAreaFilter] = useState<string>('Todas');

  const uniqueAreas = Array.from(new Set(MOCK_TEACHERS.map(t => t.area)));
  const uniqueStatuses = Array.from(new Set(MOCK_TEACHERS.map(t => t.status)));

  const filteredTeachers = MOCK_TEACHERS.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.assignedCourses.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'Todos' || t.status === statusFilter;
    const matchesArea = areaFilter === 'Todas' || t.area === areaFilter;

    return matchesSearch && matchesStatus && matchesArea;
  });

  return (
    <div className="space-y-6">
      {/* 1. Hero Metrics Panel */}
      <TeacherMetricsPanel 
        teachers={MOCK_TEACHERS} 
        activeFilter="Todos" 
        onFilterChange={() => {}} 
      />

      {/* 2. Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex-1 relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input 
            placeholder="Buscar por nombre, especialidad o curso..." 
            className="pl-9 bg-slate-50 border-slate-200 w-full"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 outline-none"
              value={areaFilter}
              onChange={e => setAreaFilter(e.target.value)}
            >
              <option value="Todas">Todas las Áreas</option>
              {uniqueAreas.map(area => (
                <option key={area} value={area}>{area}</option>
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
      </div>

      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-bold text-slate-800">
          Directorio Docente
        </h3>
        <span className="text-xs font-bold text-slate-500">
          Mostrando {filteredTeachers.length} docentes
        </span>
      </div>

      {/* 3. Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTeachers.map(teacher => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
        {filteredTeachers.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 font-semibold bg-white border border-slate-200 border-dashed rounded-xl">
            <p className="text-lg text-slate-700 mb-1">No se encontraron docentes</p>
            <p className="text-sm font-medium">Prueba ajustando los filtros de búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
