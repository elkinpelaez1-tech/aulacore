'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, BookOpen, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { TeacherMockData, TeacherStatus } from '@/lib/data/mock-teachers';
import { TeacherScheduleModal } from './TeacherScheduleModal';
import { cn } from '@/lib/utils';

interface Props {
  teacher: TeacherMockData;
}

const statusColors: Record<TeacherStatus, { bg: string, text: string, border: string }> = {
  'Activo': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'En clase': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Reunión': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Disponible': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Licencia': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
  'Sobrecarga académica': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
};

export function TeacherCard({ teacher }: Props) {
  const openWhatsApp = () => {
    const num = teacher.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${num}`, '_blank');
  };

  const statusStyle = statusColors[teacher.status];

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow group flex flex-col h-full relative">
      {/* Decorative top border based on status */}
      <div className={cn("absolute top-0 left-0 w-full h-1", statusStyle.bg.replace('50', '500').replace('100', '400'))} />
      
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-5 flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 shrink-0 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-500 font-bold text-xl relative">
            {teacher.avatarUrl ? (
              <img 
                src={teacher.avatarUrl} 
                alt={teacher.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              teacher.name.charAt(0)
            )}
            {/* Status dot */}
            <div className={cn("absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full", statusStyle.bg.replace('50', '500').replace('100', '400'))} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-slate-900 truncate" title={teacher.name}>{teacher.name}</h3>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">CC. {teacher.document}</p>
            
            <div className="mt-1">
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", statusStyle.bg, statusStyle.text, statusStyle.border)}>
                {teacher.status}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="px-5 pb-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{teacher.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{teacher.phone}</span>
          </div>
        </div>

        {/* Academic Details */}
        <div className="px-5 py-3 bg-slate-50 border-y border-slate-100 flex-1">
          <div className="mb-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Especialidad</p>
            <p className="text-sm font-black text-slate-800">{teacher.specialty}</p>
            <p className="text-xs font-semibold text-slate-500">{teacher.area}</p>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cursos</p>
                <p className="text-sm font-black text-slate-800">{teacher.assignedCourses.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-right">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Intensidad</p>
                <p className="text-sm font-black text-indigo-700">{teacher.weeklyHours}h <span className="text-[10px] text-slate-500 font-semibold">/sem</span></p>
              </div>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Alerts Section (if any) */}
        {teacher.alerts.length > 0 && (
          <div className="px-5 py-2.5 bg-rose-50/50 border-b border-rose-100">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                {teacher.alerts.map(alert => (
                  <p key={alert.id} className="text-xs font-semibold text-rose-700 leading-tight">
                    {alert.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex flex-col gap-2 bg-white">
          <div className="flex gap-2">
            <Button 
              onClick={openWhatsApp}
              variant="outline" 
              className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 font-bold text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              WhatsApp
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 font-bold text-xs"
            >
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              Mensaje
            </Button>
          </div>
          <TeacherScheduleModal teacherId={teacher.id} teacherName={teacher.name} />
        </div>

      </CardContent>
    </Card>
  );
}
