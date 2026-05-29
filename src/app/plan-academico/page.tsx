'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookOpen, AlertCircle, CheckCircle2, User, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { getSchedulesByCourse, EnrichedSchedule } from '@/lib/services/schedules';

const DAYS_MAP = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes'
};

const COLOR_PALETTES = [
  { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
];

function formatTime(timeStr: string) {
  // Convierte "08:00:00" a "08:00 AM"
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  if (hour > 12) hour -= 12;
  return `${hour.toString().padStart(2, '0')}:${m} ${suffix}`;
}

export default function PlanAcademicoPage() {
  const { user } = useAuth();
  const [activeDay, setActiveDay] = useState<number>(1);
  const [schedules, setSchedules] = useState<EnrichedSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        // MOCK: Obtener el curso real del estudiante. Por ahora hardcodeamos el ID de prueba.
        const mockCourseId = 'cccccccc-10aa-1111-2222-333333333333';
        const mockPeriodId = '33333333-3333-3333-2222-333333333333';
        
        const data = await getSchedulesByCourse(mockCourseId, mockPeriodId);
        console.log('Fetched schedules:', data);
        setSchedules(data);
      } catch (err) {
        console.error('Error al cargar horarios:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const activeSchedules = schedules.filter(s => s.day_of_week === activeDay);

  const getDayLabel = (dayNum: number) => DAYS_MAP[dayNum as keyof typeof DAYS_MAP] || 'Día';

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-8 h-8 text-indigo-500" />
              Plan Académico y Horarios
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Tu cronograma de clases, asignaturas y trabajos pendientes organizados por día.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            {/* TABS HEADER */}
            <div className="flex flex-nowrap overflow-x-auto bg-slate-50 border-b border-slate-200 p-2 gap-2 scrollbar-hide">
              {[1, 2, 3, 4, 5].map((dayNum) => (
                <button
                  key={dayNum}
                  onClick={() => setActiveDay(dayNum)}
                  className={cn(
                    "px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap outline-none flex items-center gap-2",
                    activeDay === dayNum 
                      ? "bg-white text-indigo-700 shadow-sm border border-slate-200 ring-1 ring-indigo-100"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent"
                  )}
                >
                  {getDayLabel(dayNum)}
                  {activeDay === dayNum && schedules.some(s => s.day_of_week === dayNum) && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  )}
                </button>
              ))}
            </div>

            {/* SCHEDULE CONTENT */}
            <div className="p-4 md:p-8 bg-slate-50/50 min-h-[400px]">
              {activeSchedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                  <Calendar className="w-12 h-12 mb-4 text-slate-300" />
                  <p className="font-bold text-lg text-slate-500">No hay clases programadas</p>
                  <p className="text-sm">Disfruta tu tiempo libre en este día.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeSchedules.map((cls, idx) => {
                    const color = COLOR_PALETTES[idx % COLOR_PALETTES.length];
                    const timeRange = `${formatTime(cls.start_time)} - ${formatTime(cls.end_time)}`;
                    const teacherName = cls.profiles ? `${cls.profiles.first_name} ${cls.profiles.last_name}` : 'Sin asignar';
                    const subjectName = cls.curriculum_subjects?.name || 'Materia Desconocida';
                    
                    return (
                      <div key={cls.id} className="flex flex-col lg:flex-row gap-4 lg:gap-8 relative group">
                        
                        {/* Timeline Indicator */}
                        <div className="hidden lg:flex flex-col items-center shrink-0 w-24">
                          <div className="text-sm font-black text-slate-700 mb-2 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                            {formatTime(cls.start_time)}
                          </div>
                          <div className={cn("w-4 h-4 rounded-full border-4 border-white shadow-sm z-10", color.bg)} />
                          {idx !== activeSchedules.length - 1 && (
                            <div className="flex-1 w-0.5 bg-slate-200 my-2 group-hover:bg-indigo-200 transition-colors" />
                          )}
                        </div>

                        {/* Class Card */}
                        <div className={cn("flex-1 bg-white border rounded-2xl p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-200", color.border)}>
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            
                            <div className="space-y-4 flex-1">
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge variant="outline" className={cn("font-bold border-transparent px-3 py-1", color.light, color.text)}>
                                    <Clock className="w-3.5 h-3.5 mr-1.5" /> {timeRange}
                                  </Badge>
                                  <Badge variant="secondary" className="font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                                    {cls.classroom}
                                  </Badge>
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 mb-1.5">
                                  <BookOpen className={cn("w-6 h-6", color.text)} />
                                  {subjectName}
                                </h3>
                                <p className="text-slate-500 font-semibold text-sm flex items-center gap-1.5 bg-slate-50 w-max px-3 py-1.5 rounded-lg border border-slate-100">
                                  <User className="w-4 h-4 text-slate-400" /> {teacherName}
                                </p>
                              </div>
                            </div>

                            {/* Pending Tasks Section - Static for now until tasks table is built */}
                            <div className="md:w-[350px] shrink-0">
                              <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 h-full">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                  <FileText className="w-4 h-4 text-indigo-400" /> Trabajos Pendientes
                                </h4>
                                <div className="flex flex-col items-center justify-center py-6 text-center h-full min-h-[100px]">
                                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                  </div>
                                  <span className="text-sm font-bold text-slate-500">Todo al día</span>
                                  <span className="text-xs font-medium text-slate-400 mt-1">No hay entregas pendientes</span>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
