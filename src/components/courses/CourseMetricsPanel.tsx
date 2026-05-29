'use client';

import React from 'react';
import { MOCK_COURSES } from '@/lib/data/mock-courses';
import { BookOpen, TrendingUp, AlertTriangle, GraduationCap, Activity, ShieldAlert, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CourseMetricsPanel() {
  const totalCourses = MOCK_COURSES.length;
  
  const primaryCount = MOCK_COURSES.filter(c => c.level === 'Primaria').length;
  const secondaryCount = MOCK_COURSES.filter(c => c.level === 'Bachillerato').length;

  // Calcula promedios
  const gradableCourses = MOCK_COURSES.filter(c => c.metrics.averageGpa > 0);
  const instAvgGpa = gradableCourses.reduce((acc, c) => acc + c.metrics.averageGpa, 0) / (gradableCourses.length || 1);
  const instAvgAttendance = MOCK_COURSES.reduce((acc, c) => acc + c.metrics.averageAttendance, 0) / totalCourses;
  
  const totalStudents = MOCK_COURSES.reduce((acc, c) => acc + c.metrics.totalStudents, 0);
  const avgOccupancy = Math.round(totalStudents / totalCourses);

  const coursesAtRisk = MOCK_COURSES.filter(c => c.academicRisk === 'Alto' || c.behaviorRisk === 'Alto');
  
  // Encontrar el mejor curso y el más crítico
  const bestCourse = gradableCourses.reduce((prev, current) => (prev.metrics.averageGpa > current.metrics.averageGpa) ? prev : current);
  const mostAlertsCourse = MOCK_COURSES.reduce((prev, current) => (prev.metrics.activeAlerts > current.metrics.activeAlerts) ? prev : current);

  return (
    <div className="flex flex-col gap-4 mb-6">
      
      {/* ROW 1: Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        
        {/* Total Cursos */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
            <BookOpen className="w-32 h-32 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Total Cursos</p>
            <div className="flex justify-between items-start gap-4">
              <p className="text-4xl sm:text-5xl font-black text-white leading-none">{totalCourses}</p>
              
              <div className="flex gap-2">
                <div className="bg-white/10 backdrop-blur border border-white/10 rounded-lg p-2 flex flex-col items-center justify-center min-w-[3.5rem]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pri</span>
                  <span className="text-sm font-black text-white">{primaryCount}</span>
                </div>
                <div className="bg-white/10 backdrop-blur border border-white/10 rounded-lg p-2 flex flex-col items-center justify-center min-w-[3.5rem]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Bac</span>
                  <span className="text-sm font-black text-white">{secondaryCount}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-semibold">Ocupación Promedio: <span className="text-white font-bold">{avgOccupancy} al.</span></span>
          </div>
        </div>

        {/* Inst Avg GPA */}
        <div className="col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center items-center text-center">
          <div className="p-2 bg-indigo-50 rounded-full mb-3 text-indigo-500">
            <GraduationCap className="w-6 h-6" />
          </div>
          <p className="text-3xl font-black text-slate-800">{instAvgGpa.toFixed(1)}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Promedio Inst.</p>
        </div>

        {/* Inst Avg Attendance */}
        <div className="col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center items-center text-center">
          <div className="p-2 bg-emerald-50 rounded-full mb-3 text-emerald-500">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{instAvgAttendance.toFixed(1)}%</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Asistencia Inst.</p>
        </div>

        {/* Highlight: Best Course */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3 text-indigo-600">
            <TrendingUp className="w-4 h-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Mejor Curso del Periodo</p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-black text-slate-900">{bestCourse.name}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Dir: {bestCourse.director.name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-indigo-600">{bestCourse.metrics.averageGpa.toFixed(1)}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GPA</p>
            </div>
          </div>
        </div>

      </div>

      {/* ROW 2: Risk & Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Courses at Risk */}
        <div className={cn("bg-white border rounded-2xl p-4 shadow-sm flex flex-col justify-between", coursesAtRisk.length > 0 ? "border-rose-200" : "border-slate-200")}>
          <div className="flex items-center gap-2 mb-2 text-rose-500">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cursos Críticos</p>
          </div>
          <p className={cn("text-2xl font-black", coursesAtRisk.length > 0 ? "text-rose-600" : "text-slate-800")}>{coursesAtRisk.length}</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-1">Riesgo Alto (Acad/Conv)</p>
        </div>

        {/* Most Alerts Course */}
        <div className={cn("bg-white border rounded-2xl p-4 shadow-sm flex flex-col justify-between", mostAlertsCourse.metrics.activeAlerts > 5 ? "border-amber-200 bg-amber-50/30" : "border-slate-200")}>
          <div className="flex items-center gap-2 mb-2 text-amber-600">
            <ShieldAlert className="w-4 h-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mayor Alerta Conv.</p>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-black text-slate-800">{mostAlertsCourse.name}</p>
            <p className="text-lg font-bold text-amber-600">{mostAlertsCourse.metrics.activeAlerts} <span className="text-[10px] text-slate-400 font-normal uppercase">Alertas</span></p>
          </div>
        </div>

      </div>
    </div>
  );
}
