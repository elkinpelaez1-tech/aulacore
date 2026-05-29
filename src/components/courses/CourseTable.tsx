'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CourseMockData, getCourseTrafficLight } from '@/lib/data/mock-courses';
import { ShieldAlert, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  courses: CourseMockData[];
  onClick: (course: CourseMockData) => void;
}

export function CourseTable({ courses, onClick }: Props) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 font-semibold border-2 border-dashed border-slate-200 rounded-xl bg-white">
        <p>No se encontraron cursos con los filtros actuales.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[180px]">Curso</TableHead>
            <TableHead>Director de Grupo</TableHead>
            <TableHead>Sede / Jornada</TableHead>
            <TableHead className="text-center">Alumnos</TableHead>
            <TableHead className="text-right">GPA</TableHead>
            <TableHead className="text-right">Asist.</TableHead>
            <TableHead className="text-center">Estado Institucional</TableHead>
            <TableHead className="text-right">Alertas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => {
            const trafficLight = getCourseTrafficLight(course);
            const gpaColor = course.metrics.averageGpa >= 4.0 ? 'text-emerald-600' : course.metrics.averageGpa >= 3.0 ? 'text-amber-600' : course.metrics.averageGpa > 0 ? 'text-rose-600' : 'text-slate-400';

            return (
              <TableRow 
                key={course.id} 
                className="cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => onClick(course)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", trafficLight.color)} />
                    <div>
                      <p className="text-sm font-black text-slate-900">{course.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{course.level}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px] overflow-hidden shrink-0">
                      {course.director.avatarUrl ? (
                        <img src={course.director.avatarUrl} alt={course.director.name} className="w-full h-full object-cover" />
                      ) : (
                        course.director.name.charAt(0)
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{course.director.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs font-semibold text-slate-700">{course.campus}</div>
                  <div className="text-[10px] text-slate-500">{course.shift}</div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-600">
                    <Users className="w-3 h-3 text-slate-400" />
                    {course.metrics.totalStudents}
                  </div>
                </TableCell>
                <TableCell className={cn("text-right font-black text-xs", gpaColor)}>
                  {course.metrics.averageGpa > 0 ? course.metrics.averageGpa.toFixed(1) : 'N/A'}
                </TableCell>
                <TableCell className="text-right font-black text-xs">
                  <span className={course.metrics.averageAttendance >= 90 ? 'text-emerald-600' : 'text-rose-600'}>
                    {course.metrics.averageAttendance}%
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white", trafficLight.color)}>
                    {trafficLight.label}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {course.metrics.activeAlerts > 0 ? (
                    <div className="flex justify-end">
                      <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-200">
                        <ShieldAlert className="w-3 h-3" />
                        {course.metrics.activeAlerts}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-300 font-bold text-xs">-</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  );
}
