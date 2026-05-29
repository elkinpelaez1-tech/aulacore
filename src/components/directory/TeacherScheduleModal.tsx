'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays, ExternalLink, Clock, Loader2, BookOpen, MapPin, GraduationCap } from 'lucide-react';
import { getSchedulesByTeacher, EnrichedSchedule } from '@/lib/services/schedules';
import { cn } from '@/lib/utils';

interface Props {
  teacherId: string;
  teacherName: string;
}

const DAYS = [
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' }
];

const formatTimeInput = (t: string) => t.substring(0, 5);

export function TeacherScheduleModal({ teacherId, teacherName }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<EnrichedSchedule[]>([]);

  // TODO: Use real current period ID from auth context or active config
  const demoPeriodId = '33333333-3333-3333-2222-333333333333';

  useEffect(() => {
    if (open) {
      loadSchedules();
    }
  }, [open, teacherId]);

  async function loadSchedules() {
    try {
      setLoading(true);
      const data = await getSchedulesByTeacher(teacherId, demoPeriodId);
      setSchedules(data || []);
    } catch (err) {
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex w-full items-center justify-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md px-4 py-2 transition-colors">
        <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
        Ver Horario <ExternalLink className="w-3 h-3 ml-1" />
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="pb-4 border-b border-slate-100 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <CalendarDays className="w-6 h-6 text-indigo-600" />
            Horario de {teacherName}
          </DialogTitle>
          <p className="text-sm text-slate-500 font-medium">
            Visualización extraída en tiempo real desde la Malla Académica Central (academic_schedules)
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-slate-50/50 p-4 -mx-6 -mb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-semibold">Cargando horario...</p>
            </div>
          ) : (
            <div className="min-w-[800px] flex h-full border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              {DAYS.map(day => {
                const daySchedules = schedules
                  .filter(s => s.day_of_week === day.id)
                  .sort((a,b) => a.start_time.localeCompare(b.start_time));
                  
                return (
                  <div key={day.id} className="flex-1 border-r border-slate-100 last:border-r-0 min-h-full">
                    <div className="bg-slate-50 border-b border-slate-200 py-3 text-center sticky top-0 z-10">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{day.name}</span>
                    </div>
                    <div className="p-3 space-y-3">
                      {daySchedules.length === 0 ? (
                        <div className="text-center py-8 opacity-50">
                          <span className="text-xs font-semibold italic text-slate-400">Libre</span>
                        </div>
                      ) : (
                        daySchedules.map(schedule => (
                          <div key={schedule.id} className="bg-white border border-indigo-100 rounded-lg p-3 shadow-sm hover:border-indigo-300 transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                            <div className="flex items-center gap-1.5 mb-2 text-indigo-600">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-xs font-black">{formatTimeInput(schedule.start_time)} - {formatTimeInput(schedule.end_time)}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 leading-tight mb-2 flex items-start gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                              {schedule.curriculum_subjects?.name || 'Materia Desconocida'}
                            </h4>
                            <div className="flex flex-col gap-1.5">
                              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                {schedule.courses ? `Grado ${schedule.courses.grade_level}-${schedule.courses.group_name}` : 'Curso Desconocido'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 px-2">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {schedule.classroom || 'Aula no asignada'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
