'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TeacherMockData, TeacherStatus } from '@/lib/data/mock-teachers';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Phone, BookOpen, Clock, AlertCircle, MapPin, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TeacherScheduleGrid } from './TeacherScheduleGrid';

interface Props {
  teacher: TeacherMockData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<TeacherStatus, { bg: string, text: string, border: string, dot: string }> = {
  'Activo': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'En clase': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'Reunión': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Disponible': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  'Licencia': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', dot: 'bg-slate-400' },
  'Sobrecarga académica': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' }
};

export function TeacherDetailDrawer({ teacher, isOpen, onOpenChange }: Props) {
  if (!teacher) return null;

  const statusStyle = statusColors[teacher.status];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={true} className="w-[96vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-[85vh] max-h-[85vh] p-0 flex flex-col bg-slate-50 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200 gap-0">
        
        {/* Header Decorator */}
        <div className={cn("w-full h-3 shrink-0", statusStyle.dot)} />

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <ScrollArea className="flex-1 h-full">
            <div className="p-6 pb-12">
            
            {/* Identity Header */}
            <div className="flex items-start gap-4 mb-8">
              <div className="w-20 h-20 rounded-xl bg-white shrink-0 shadow-sm border border-slate-200 overflow-hidden flex items-center justify-center text-slate-500 font-black text-2xl relative">
                {teacher.avatarUrl ? (
                  <img 
                    src={teacher.avatarUrl} 
                    alt={teacher.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  teacher.name.charAt(0)
                )}
                <div className={cn("absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full", statusStyle.dot)} />
              </div>
              <div className="pt-1">
                <DialogTitle className="text-xl font-black text-slate-900 leading-tight">
                  {teacher.name}
                </DialogTitle>
                <DialogDescription className="text-sm font-semibold text-slate-500 mb-2">
                  CC. {teacher.document}
                </DialogDescription>
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border whitespace-nowrap w-fit shrink-0", statusStyle.bg, statusStyle.text, statusStyle.border)}>
                  {teacher.status}
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Información de Contacto</h4>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <span className="truncate">{teacher.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <span>{teacher.phone}</span>
              </div>
            </div>

            {/* Academic Load Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 mb-1 text-indigo-500">
                  <BookOpen className="w-4 h-4" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">Cursos</p>
                </div>
                <p className="text-2xl font-black text-indigo-700">{teacher.assignedCourses.length}</p>
                <p className="text-xs text-indigo-600/70 font-medium truncate mt-0.5">{teacher.assignedCourses.join(', ')}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 mb-1 text-blue-500">
                  <Clock className="w-4 h-4" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">Intensidad</p>
                </div>
                <p className="text-2xl font-black text-blue-700">{teacher.weeklyHours} <span className="text-sm font-bold text-blue-600/60">h/sem</span></p>
                <p className="text-xs text-blue-600/70 font-medium truncate mt-0.5">Carga laboral</p>
              </div>
            </div>

            {/* Alerts */}
            {teacher.alerts.length > 0 && (
              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Alertas Críticas
                </h4>
                <div className="space-y-2">
                  {teacher.alerts.map(alert => (
                    <div key={alert.id} className="bg-rose-50/80 border border-rose-200 rounded-lg p-3 shadow-sm">
                      <p className="text-sm font-semibold text-rose-800 leading-tight">
                        {alert.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Placement / Area */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Asignación Institucional</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="text-xs font-semibold text-slate-500">Sede</span>
                  <span className="text-sm font-bold text-slate-900">{teacher.campus}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="text-xs font-semibold text-slate-500">Sección Académica</span>
                  <span className="text-sm font-bold text-slate-900">{teacher.level}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="text-xs font-semibold text-slate-500">Área</span>
                  <span className="text-sm font-bold text-slate-900">{teacher.area}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Especialidad</span>
                  <span className="text-sm font-bold text-slate-900">{teacher.specialty}</span>
                </div>
              </div>
            </div>

            {/* Realtime Schedule Grid */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Horario Académico (academic_schedules)</h4>
              <TeacherScheduleGrid teacherId={teacher.id} />
            </div>

          </div>
        </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
