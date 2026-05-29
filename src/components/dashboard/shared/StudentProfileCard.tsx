'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, FileText, GraduationCap, CalendarDays, Mail, Phone, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentProfileCardProps {
  className?: string;
  studentName?: string;
  studentId?: string;
  grade?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  parentName?: string;
  avatarUrl?: string;
}

export function StudentProfileCard({
  className,
  studentName = "Alejandro Gómez",
  studentId = "TI. 1020304050",
  grade = "11° - B (Media Académica)",
  birthDate = "15 de Mayo de 2008 (18 años)",
  email = "alejandro.gomez@aulacore.edu.co",
  phone = "+57 300 123 4567",
  parentName = "María Fernanda Ruiz (Madre)",
  avatarUrl = "https://i.pravatar.cc/150?img=11"
}: StudentProfileCardProps) {
  return (
    <Card className={cn("border-slate-200 shadow-sm flex flex-col", className)}>
      <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" />
          Ficha del Estudiante
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col justify-center">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-stretch">
          
          {/* Columna Izquierda: Foto, Nombre, Documento */}
          <div className="flex flex-col items-center justify-center sm:border-r border-slate-100 sm:pr-6 shrink-0 w-full sm:w-[180px]">
            <div className="w-[110px] h-[146px] rounded-xl bg-slate-200 shadow-sm overflow-hidden flex items-center justify-center mb-4">
              <img src={avatarUrl} alt={studentName} className="w-full h-full object-cover" />
            </div>
            <div className="text-center w-full">
              <h4 className="font-semibold text-slate-800 text-[16px] leading-tight mb-1 truncate px-2">{studentName}</h4>
              <p className="text-[13px] text-slate-600 flex items-center justify-center gap-1.5">
                <FileText className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{studentId}</span>
              </p>
            </div>
          </div>

          {/* Columna Derecha: Información Académica y Contacto */}
          <div className="flex-1 space-y-4 w-full flex flex-col justify-center">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                <GraduationCap className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grado Actual</p>
                <p className="text-sm font-semibold text-slate-700 leading-tight truncate">{grade}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                <CalendarDays className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nacimiento</p>
                <p className="text-sm font-semibold text-slate-700 leading-tight truncate">{birthDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                <Mail className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correo Institucional</p>
                <p className="text-sm font-semibold text-slate-700 leading-tight truncate">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                <Phone className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teléfono / Celular</p>
                <p className="text-sm font-semibold text-slate-700 leading-tight truncate">{phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Acudiente Principal</p>
                <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{parentName}</p>
              </div>
            </div>

          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}
