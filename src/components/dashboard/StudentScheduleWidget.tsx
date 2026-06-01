'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, User, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSchedulesByCourse, EnrichedSchedule } from '@/lib/services/schedules';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';

const DAYS_MAP = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes'
};

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  if (hour > 12) hour -= 12;
  return `${hour.toString().padStart(2, '0')}:${m} ${suffix}`;
}

export function StudentScheduleWidget() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<EnrichedSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcode for demo purposes, representing "today"
  const todayDayOfWeek = 1; 

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const mockCourseId = 'cccccccc-10aa-1111-2222-333333333333';
        const mockPeriodId = '33333333-3333-3333-2222-333333333333';
        
        const data = await getSchedulesByCourse(mockCourseId, mockPeriodId);
        // Filter classes for today
        const todays = data.filter(s => s.day_of_week === todayDayOfWeek);
        setSchedules(todays);
      } catch (err) {
        console.error('Error fetching today schedule', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <Card className="col-span-1 lg:col-span-2 border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-slate-800">Plan Académico Inmediato</CardTitle>
          <p className="text-sm text-slate-500 font-medium">Tus clases programadas para hoy ({DAYS_MAP[todayDayOfWeek]})</p>
        </div>
        <Link href="/plan-academico">
          <Button variant="ghost" size="sm" className="font-bold text-indigo-600">Ver Malla Completa</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 py-8">
            <Calendar className="w-10 h-10 mb-2 text-slate-300" />
            <p className="font-bold text-sm text-slate-500">No hay clases hoy</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((cls, i) => {
              const timeRange = `${formatTime(cls.start_time)} - ${formatTime(cls.end_time)}`;
              const teacherName = cls.profiles ? `${cls.profiles.first_name} ${cls.profiles.last_name}` : 'Sin asignar';
              const subjectName = cls.curriculum_subjects?.name || 'Materia Desconocida';

              return (
                <div key={cls.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-slate-100 rounded-xl bg-white hover:border-slate-300 transition-colors group gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {subjectName}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1"><User className="w-3 h-3"/> {teacherName}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        Aula: {cls.classroom}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <Badge variant="secondary" className="font-bold bg-slate-100 text-slate-600">
                      <Clock className="w-3 h-3 mr-1" /> {timeRange}
                    </Badge>
                    {/* Placeholder for pending tasks connected to this subject */}
                    <span className="text-[10px] uppercase font-black text-emerald-500 tracking-wider">
                      Sin Entregas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
