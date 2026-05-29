'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { MOCK_TEACHERS, TeacherStatus, AcademicLevel, TeacherMockData } from '@/lib/data/mock-teachers';
import { CompactTeacherCard } from './CompactTeacherCard';
import { TeacherMetricsPanel } from './TeacherMetricsPanel';
import { TeacherDetailDrawer } from './TeacherDetailDrawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const LEVELS: AcademicLevel[] = ['Preescolar', 'Primaria', 'Bachillerato', 'Media Técnica', 'Coordinación Académica', 'Administrativos Docentes'];

export function TeacherIntelligenceGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TeacherStatus | 'Todos'>('Todos');
  const [campusFilter, setCampusFilter] = useState<string>('Todas');
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherMockData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const uniqueCampuses = Array.from(new Set(MOCK_TEACHERS.map(t => t.campus)));
  const uniqueStatuses = Array.from(new Set(MOCK_TEACHERS.map(t => t.status)));

  const handleCardClick = (teacher: TeacherMockData) => {
    setSelectedTeacher(teacher);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <TeacherMetricsPanel />

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
        
        <div className="flex w-full md:w-auto items-center gap-3">
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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
        <Tabs defaultValue="Primaria" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto bg-slate-100/50 p-1 rounded-lg">
            {LEVELS.map(level => {
              const count = MOCK_TEACHERS.filter(t => t.level === level).length;
              if (count === 0 && level !== 'Primaria') return null;
              return (
                <TabsTrigger key={level} value={level} className="flex-1 min-w-[120px] data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
                  {level} <span className="ml-2 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md text-[10px] font-bold">{count}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {LEVELS.map(level => {
            let levelTeachers = MOCK_TEACHERS.filter(t => t.level === level);
            
            // Apply global filters
            levelTeachers = levelTeachers.filter(t => {
              const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    t.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    t.assignedCourses.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
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

      <TeacherDetailDrawer 
        teacher={selectedTeacher} 
        isOpen={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
      />
    </div>
  );
}
