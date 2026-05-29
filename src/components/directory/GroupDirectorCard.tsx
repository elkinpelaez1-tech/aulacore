'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Phone, CalendarDays, Users, MessageSquare, ExternalLink } from 'lucide-react';

export interface DirectorData {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  groupAssigned: string;
  studentCount: number;
  avatarUrl?: string;
}

interface Props {
  director: DirectorData;
}

export function GroupDirectorCard({ director }: Props) {
  const openWhatsApp = () => {
    // Solo demo. Quitar cualquier caracter no numérico
    const num = director.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${num}`, '_blank');
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow group">
      <CardContent className="p-0">
        <div className="p-6 flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 shrink-0 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-indigo-500 font-bold text-xl">
            {director.avatarUrl ? (
              <img 
                src={director.avatarUrl} 
                alt={director.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              director.name.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 truncate">{director.name}</h3>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">CC. {director.document}</p>
            
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{director.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{director.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-y border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Grupo Asignado</p>
              <p className="text-sm font-black text-slate-800">{director.groupAssigned}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alumnos</p>
            <p className="text-sm font-black text-indigo-700">{director.studentCount}</p>
          </div>
        </div>

        <div className="p-4 flex gap-2">
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

        <div className="px-4 pb-4">
          <Dialog>
            <DialogTrigger className="flex w-full items-center justify-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md px-4 py-2 transition-colors">
              <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
              Ver Horarios de Clase <ExternalLink className="w-3 h-3 ml-1" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-indigo-600" />
                  Horario de Clases - {director.groupAssigned}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <div className="grid grid-cols-5 divide-x divide-slate-200 border-b border-slate-200 bg-white">
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-5 divide-x divide-slate-200 min-h-[300px]">
                  {/* Lunes */}
                  <div className="p-2 space-y-2">
                    <div className="bg-indigo-100/50 border border-indigo-200 p-2 rounded-md">
                      <p className="text-[10px] font-bold text-indigo-600">08:00 - 10:00</p>
                      <p className="text-xs font-bold text-slate-800">Matemáticas</p>
                      <p className="text-[10px] text-slate-500">Aula 301</p>
                    </div>
                    <div className="bg-emerald-100/50 border border-emerald-200 p-2 rounded-md">
                      <p className="text-[10px] font-bold text-emerald-600">10:30 - 12:30</p>
                      <p className="text-xs font-bold text-slate-800">Biología</p>
                      <p className="text-[10px] text-slate-500">Laboratorio</p>
                    </div>
                  </div>
                  {/* Martes */}
                  <div className="p-2 space-y-2">
                    <div className="bg-amber-100/50 border border-amber-200 p-2 rounded-md">
                      <p className="text-[10px] font-bold text-amber-600">08:00 - 10:00</p>
                      <p className="text-xs font-bold text-slate-800">Lenguaje</p>
                      <p className="text-[10px] text-slate-500">Aula 301</p>
                    </div>
                  </div>
                  {/* Miércoles */}
                  <div className="p-2 space-y-2">
                    <div className="bg-indigo-100/50 border border-indigo-200 p-2 rounded-md">
                      <p className="text-[10px] font-bold text-indigo-600">08:00 - 10:00</p>
                      <p className="text-xs font-bold text-slate-800">Matemáticas</p>
                      <p className="text-[10px] text-slate-500">Aula 301</p>
                    </div>
                    <div className="bg-rose-100/50 border border-rose-200 p-2 rounded-md">
                      <p className="text-[10px] font-bold text-rose-600">10:30 - 12:30</p>
                      <p className="text-xs font-bold text-slate-800">Educación Física</p>
                      <p className="text-[10px] text-slate-500">Cancha Principal</p>
                    </div>
                  </div>
                  {/* Jueves */}
                  <div className="p-2 space-y-2">
                    <div className="bg-amber-100/50 border border-amber-200 p-2 rounded-md">
                      <p className="text-[10px] font-bold text-amber-600">08:00 - 10:00</p>
                      <p className="text-xs font-bold text-slate-800">Lenguaje</p>
                      <p className="text-[10px] text-slate-500">Aula 301</p>
                    </div>
                  </div>
                  {/* Viernes */}
                  <div className="p-2 space-y-2">
                    <div className="bg-slate-100 border border-slate-200 p-2 rounded-md flex items-center justify-center h-full">
                      <p className="text-xs font-bold text-slate-400 italic">Día Deportivo</p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

      </CardContent>
    </Card>
  );
}
