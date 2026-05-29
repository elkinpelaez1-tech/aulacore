'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CourseMockData, getCourseTrafficLight } from '@/lib/data/mock-courses';
import { MapPin, Clock, Users, GraduationCap, Activity, ShieldAlert, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  course: CourseMockData;
  onClick: (course: CourseMockData) => void;
}

export function CourseCard({ course, onClick }: Props) {
  const trafficLight = getCourseTrafficLight(course);
  
  // Format GPA Color
  const gpaColor = course.metrics.averageGpa >= 4.0 ? 'text-emerald-600' : course.metrics.averageGpa >= 3.0 ? 'text-amber-600' : course.metrics.averageGpa > 0 ? 'text-rose-600' : 'text-slate-400';

  return (
    <Card 
      onClick={() => onClick(course)}
      className="border-slate-200 hover:border-indigo-300 shadow-sm overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col relative min-h-[220px]"
    >
      {/* Top Banner indicating traffic light color */}
      <div className={cn("absolute top-0 left-0 w-full h-1.5", trafficLight.color)} />
      
      {/* Traffic Light Label */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{trafficLight.label}</span>
        <div className={cn("w-2 h-2 rounded-full shadow-sm", trafficLight.color)} />
      </div>
      
      <CardContent className="p-5 pt-6 flex flex-col h-full">
        
        {/* Header: Course Name & Level */}
        <div className="mb-4 pr-20">
          <h3 className="font-black text-2xl text-slate-900 group-hover:text-indigo-700 transition-colors leading-none mb-1.5">
            {course.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
              {course.level}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
              <MapPin className="w-3 h-3" /> {course.campus}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
              <Clock className="w-3 h-3" /> {course.shift}
            </span>
          </div>
        </div>

        {/* Director Profile Section */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4 group-hover:bg-indigo-50/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-indigo-100 shrink-0 border border-indigo-200 overflow-hidden flex items-center justify-center text-indigo-700 font-bold">
            {course.director.avatarUrl ? (
              <img src={course.director.avatarUrl} alt={course.director.name} className="w-full h-full object-cover" />
            ) : (
              course.director.name.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Director de Grupo</p>
            <p className="text-sm font-bold text-slate-800 truncate">{course.director.name}</p>
          </div>
          <div className="p-1.5 bg-white rounded-lg shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Live Metrics */}
        <div className="mt-auto grid grid-cols-4 gap-2 border-t border-slate-100 pt-3">
          
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              <Users className="w-3 h-3" /> Alum.
            </span>
            <span className="text-sm font-black text-slate-700">{course.metrics.totalStudents}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              <GraduationCap className="w-3 h-3" /> GPA
            </span>
            <span className={cn("text-sm font-black", gpaColor)}>{course.metrics.averageGpa > 0 ? course.metrics.averageGpa.toFixed(1) : 'N/A'}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              <Activity className="w-3 h-3" /> Asist.
            </span>
            <span className={cn("text-sm font-black", course.metrics.averageAttendance >= 90 ? 'text-emerald-600' : 'text-rose-600')}>{course.metrics.averageAttendance}%</span>
          </div>

          <div className="flex flex-col items-end justify-center">
            {course.metrics.activeAlerts > 0 ? (
              <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-1 rounded text-[10px] font-bold border border-rose-200" title={`${course.metrics.activeAlerts} alertas activas`}>
                <ShieldAlert className="w-3 h-3" />
                {course.metrics.activeAlerts}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-slate-300 px-2 py-1 rounded text-[10px] font-bold">
                Sin alertas
              </div>
            )}
          </div>
          
        </div>

      </CardContent>
    </Card>
  );
}
