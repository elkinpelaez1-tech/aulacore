'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { CourseMockData, getCourseTrafficLight } from '@/lib/data/mock-courses';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, GraduationCap, ShieldAlert, FileText, History, Activity, MapPin, X, Users, BookOpen, Search, ArrowUpRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Props {
  course: CourseMockData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = 'resumen' | 'estudiantes' | 'docentes' | 'horario' | 'rendimiento' | 'convivencia' | 'asistencia' | 'documentos' | 'historial';

export function Course360Drawer({ course, isOpen, onOpenChange }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('resumen');
  const [studentSearch, setStudentSearch] = useState('');

  if (!course) return null;

  const trafficLight = getCourseTrafficLight(course);

  const menuItems = [
    { id: 'resumen', label: 'Resumen del Curso', icon: BookOpen },
    { id: 'estudiantes', label: 'Estudiantes', icon: Users },
    { id: 'docentes', label: 'Docentes', icon: User },
    { id: 'horario', label: 'Horario', icon: Activity },
    { id: 'rendimiento', label: 'Rendimiento', icon: GraduationCap },
    { id: 'convivencia', label: 'Convivencia', icon: ShieldAlert },
    { id: 'asistencia', label: 'Asistencia RFID', icon: Activity },
    { id: 'documentos', label: 'Documentos', icon: FileText },
    { id: 'historial', label: 'Historial', icon: History },
  ] as const;

  const filteredStudents = course.students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()));

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl md:max-w-5xl p-0 flex bg-white overflow-hidden border-l border-slate-200 shadow-2xl">
        
        {/* LEFT SIDEBAR */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col hidden sm:flex shrink-0 relative">
          <div className={cn("absolute top-0 left-0 w-full h-1.5", trafficLight.color)} />
          
          <div className="p-6 pb-2">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Course 360</h2>
          </div>
          
          <div className="flex-1 px-3 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                    isActive 
                      ? "bg-white text-indigo-700 shadow-sm border border-slate-200/60" 
                      : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
          
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors sm:hidden"
          >
            <X className="w-4 h-4" />
          </button>

          {/* STICKY HEADER (NO BIG IMAGES) */}
          <div className="bg-white border-b border-slate-100 p-6 sm:px-8 z-10 shrink-0 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex items-start justify-between gap-5">
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white", trafficLight.color)}>
                    {trafficLight.label}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                    {course.level}
                  </span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-none truncate mb-3" title={course.name}>
                  Curso {course.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2 bg-indigo-50/50 text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-100">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-indigo-200 shrink-0">
                      {course.director.avatarUrl && <img src={course.director.avatarUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <span className="font-bold">Dir: {course.director.name}</span>
                  </div>
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {course.campus} ({course.shift})
                  </span>
                </div>
              </div>

              {/* Live KPIs in Header */}
              <div className="hidden sm:flex items-center gap-4 text-right">
                <div className="flex flex-col items-center justify-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ocupación</span>
                  <span className="text-2xl font-black text-slate-800 leading-none">{course.metrics.totalStudents}</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Promedio</span>
                  <span className={cn("text-2xl font-black leading-none", course.metrics.averageGpa >= 4.0 ? 'text-emerald-600' : 'text-slate-800')}>
                    {course.metrics.averageGpa > 0 ? course.metrics.averageGpa.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* SCROLLABLE CONTENT */}
          <ScrollArea className="flex-1 bg-slate-50/30">
            <div className="p-6 sm:p-8">
              
              {activeTab === 'resumen' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="font-black text-lg text-slate-800">Resumen Operativo</h3>
                  
                  {/* Micro Visualizations */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Distribución de Género</p>
                      <div className="flex items-end gap-2 h-20 mb-2">
                        <div className="flex-1 bg-blue-100 rounded-t-lg relative group" style={{ height: `${(course.metrics.boys/course.metrics.totalStudents)*100}%` }}>
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">{course.metrics.boys}</div>
                        </div>
                        <div className="flex-1 bg-pink-100 rounded-t-lg relative group" style={{ height: `${(course.metrics.girls/course.metrics.totalStudents)*100}%` }}>
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity">{course.metrics.girls}</div>
                        </div>
                        {course.metrics.diverse > 0 && (
                          <div className="flex-1 bg-purple-100 rounded-t-lg relative group" style={{ height: `${(course.metrics.diverse/course.metrics.totalStudents)*100}%` }}>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">{course.metrics.diverse}</div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Niños</span>
                        <span>Niñas</span>
                        {course.metrics.diverse > 0 && <span>Diversos</span>}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Riesgo Estudiantil</p>
                      <div className="flex items-center justify-center h-20">
                        <div className="text-center">
                          <p className={cn("text-5xl font-black", course.metrics.studentsAtRisk > 0 ? "text-rose-500" : "text-emerald-500")}>
                            {course.metrics.studentsAtRisk}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Estudiantes</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Asistencia Global</p>
                      <div className="flex items-center justify-center h-20">
                        <div className="text-center">
                          <p className={cn("text-5xl font-black", course.metrics.averageAttendance >= 90 ? "text-emerald-500" : "text-rose-500")}>
                            {course.metrics.averageAttendance}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ESTUDIANTES DIRECTORY (Apple Contacts / HubSpot style) */}
              {activeTab === 'estudiantes' && (
                <div className="animate-in fade-in duration-300 flex flex-col h-full min-h-[500px]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-lg text-slate-800">Directorio de Estudiantes</h3>
                    <div className="relative w-64">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <Input 
                        placeholder="Buscar estudiante..." 
                        className="pl-9 h-9 bg-white border-slate-200 text-sm"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1">
                    <div className="divide-y divide-slate-100">
                      {filteredStudents.map(student => {
                        const sTraffic = student.academicRisk === 'Alto' || student.behaviorRisk === 'Alto' ? 'bg-rose-500' : student.academicRisk === 'Medio' || student.behaviorRisk === 'Medio' ? 'bg-amber-500' : 'bg-emerald-500';
                        return (
                          <div key={student.id} className="flex items-center p-3 hover:bg-slate-50 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 relative mr-4">
                              {student.avatarUrl && <img src={student.avatarUrl} alt="" className="w-full h-full object-cover" />}
                              <div className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white", sTraffic)} />
                            </div>
                            
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-sm font-bold text-slate-900 truncate">{student.name}</p>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className={cn("text-[10px] font-bold uppercase tracking-wider", student.status === 'Activo' ? 'text-emerald-600' : 'text-rose-600')}>{student.status}</span>
                                <span className="text-[10px] font-semibold text-slate-500">GPA: <span className="font-bold text-slate-700">{student.gpa.toFixed(1)}</span></span>
                                <span className="text-[10px] font-semibold text-slate-500">Asist: <span className="font-bold text-slate-700">{student.attendanceRate}%</span></span>
                                {student.alertsCount > 0 && (
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 rounded">{student.alertsCount} Alertas</span>
                                )}
                              </div>
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                              <button className="text-[10px] font-bold bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 transition-colors">
                                Perfil 360 <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {filteredStudents.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-sm font-semibold">No se encontraron estudiantes.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Mocks for other tabs */}
              {activeTab === 'docentes' && (
                <div className="text-center py-20 text-slate-400 font-semibold border-2 border-dashed border-slate-200 rounded-2xl animate-in fade-in">
                  <User className="w-10 h-10 mx-auto mb-4 text-slate-300" />
                  <p>Módulo de carga académica docente en desarrollo</p>
                </div>
              )}
              {activeTab === 'horario' && (
                <div className="text-center py-20 text-slate-400 font-semibold border-2 border-dashed border-slate-200 rounded-2xl animate-in fade-in">
                  <Activity className="w-10 h-10 mx-auto mb-4 text-slate-300" />
                  <p>Módulo de horarios en desarrollo</p>
                </div>
              )}
              {activeTab === 'rendimiento' && (
                <div className="text-center py-20 text-slate-400 font-semibold border-2 border-dashed border-slate-200 rounded-2xl animate-in fade-in">
                  <GraduationCap className="w-10 h-10 mx-auto mb-4 text-slate-300" />
                  <p>Analíticas de rendimiento en desarrollo</p>
                </div>
              )}
              {activeTab === 'convivencia' && (
                <div className="text-center py-20 text-slate-400 font-semibold border-2 border-dashed border-slate-200 rounded-2xl animate-in fade-in">
                  <ShieldAlert className="w-10 h-10 mx-auto mb-4 text-slate-300" />
                  <p>Timeline de convivencia en desarrollo</p>
                </div>
              )}
              {['asistencia', 'documentos', 'historial'].includes(activeTab) && (
                <div className="text-center py-20 text-slate-400 font-semibold border-2 border-dashed border-slate-200 rounded-2xl animate-in fade-in">
                  <Activity className="w-10 h-10 mx-auto mb-4 text-slate-300" />
                  <p>Módulo en desarrollo</p>
                </div>
              )}

            </div>
          </ScrollArea>
        </div>

      </SheetContent>
    </Sheet>
  );
}
