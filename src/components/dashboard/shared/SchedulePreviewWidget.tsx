'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, BookOpen, User, Layers } from 'lucide-react';
import Link from 'next/link';

interface Props {
  role: 'coordinator' | 'director';
  title?: string;
  courseName?: string;
}

export function SchedulePreviewWidget({ role, title = 'Planeación de Horarios por Materia', courseName }: Props) {
  return (
    <Card className="border-slate-200 shadow-sm bg-white rounded-xl h-full flex flex-col">
      <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          {title} {courseName && <span className="text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full text-[10px] ml-1">{courseName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="space-y-4 mb-4 flex-1">
          {[
            { subject: 'Matemáticas', teacher: 'Prof. Gómez', time: 'Lunes, 08:00 AM', room: 'Aula 301' },
            { subject: 'Ciencias Naturales y Educación Ambiental', teacher: 'Prof. Gómez', time: 'Martes, 10:00 AM', room: 'Laboratorio' },
            { subject: 'Lengua Castellana', teacher: 'Lic. Martínez', time: 'Miércoles, 09:00 AM', room: 'Aula 302' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:border-slate-300 transition-colors bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-800">{item.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.teacher}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-indigo-600">{item.room}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-3 border-t border-slate-100 mt-auto">
          <Link href="/mallas">
            <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs h-8 flex items-center gap-2">
              <Layers className="w-3 h-3" />
              Ver Centro Académico Institucional
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
