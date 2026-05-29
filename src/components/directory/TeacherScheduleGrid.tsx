'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Loader2, BookOpen, MapPin, GraduationCap } from 'lucide-react';
import { getSchedulesByTeacher, EnrichedSchedule } from '@/lib/services/schedules';

interface Props {
  teacherId: string;
}

const DAYS = [
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' }
];

const formatTimeInput = (t: string) => t.substring(0, 5);

export function TeacherScheduleGrid({ teacherId }: Props) {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<EnrichedSchedule[]>([]);

  const demoPeriodId = '33333333-3333-3333-2222-333333333333';

  useEffect(() => {
    if (teacherId) {
      loadSchedules();
    }
  }, [teacherId]);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-semibold">Cargando horario...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {DAYS.map(day => {
        const daySchedules = schedules
          .filter(s => s.day_of_week === day.id)
          .sort((a,b) => a.start_time.localeCompare(b.start_time));
          
        return (
          <div key={day.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 py-2 px-4">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{day.name}</span>
            </div>
            <div className="p-3">
              {daySchedules.length === 0 ? (
                <div className="text-center py-2 opacity-50">
                  <span className="text-xs font-semibold italic text-slate-400">Libre</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {daySchedules.map(schedule => (
                    <div key={schedule.id} className="bg-white border border-indigo-100 rounded-lg p-3 shadow-sm hover:border-indigo-300 transition-colors relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                      
                      <div>
                        <div className="flex items-center gap-1.5 mb-1 text-indigo-600">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs font-black">{formatTimeInput(schedule.start_time)} - {formatTimeInput(schedule.end_time)}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 leading-tight flex items-start gap-1.5">
                          {schedule.curriculum_subjects?.name || 'Materia Desconocida'}
                        </h4>
                      </div>

                      <div className="flex flex-row sm:flex-col gap-2 sm:gap-1.5 items-start sm:items-end">
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          {schedule.courses ? `${schedule.courses.grade_level}-${schedule.courses.group_name}` : 'Curso ?'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {schedule.classroom || 'Sin aula'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
