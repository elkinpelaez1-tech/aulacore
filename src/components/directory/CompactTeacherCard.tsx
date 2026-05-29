'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TeacherMockData, TeacherStatus } from '@/lib/data/mock-teachers';
import { AlertCircle, Clock, MessageSquare, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  teacher: TeacherMockData;
  onClick: (teacher: TeacherMockData) => void;
}

const statusColors: Record<TeacherStatus, { bg: string, text: string, border: string, dot: string }> = {
  'Activo': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'En clase': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'Reunión': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Disponible': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  'Licencia': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', dot: 'bg-slate-400' },
  'Sobrecarga académica': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' }
};

export function CompactTeacherCard({ teacher, onClick }: Props) {
  const statusStyle = statusColors[teacher.status];
  const hasAlerts = teacher.alerts.length > 0;

  return (
    <Card 
      onClick={() => onClick(teacher)}
      className="border-slate-200 hover:border-indigo-300 shadow-sm overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col h-full relative"
    >
      <div className={cn("absolute top-0 left-0 w-1 h-full", statusStyle.dot)} />
      
      <CardContent className="p-4 flex flex-col h-full pl-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 shrink-0 shadow-sm overflow-hidden flex items-center justify-center text-slate-500 font-bold text-lg relative">
            {teacher.avatarUrl ? (
              <img 
                src={teacher.avatarUrl} 
                alt={teacher.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              teacher.name.charAt(0)
            )}
            <div className={cn("absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full", statusStyle.dot)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-indigo-700 transition-colors" title={teacher.name}>
              {teacher.name}
            </h3>
            <p className="text-xs font-semibold text-slate-500 truncate">{teacher.specialty}</p>
            
            <div className="flex items-center justify-between mt-2">
              <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border", statusStyle.bg, statusStyle.text, statusStyle.border)}>
                {teacher.status}
              </span>
              <div className="flex items-center gap-2">
                {hasAlerts && (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                )}
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                  <Clock className="w-3 h-3" />
                  {teacher.weeklyHours}h
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              const num = teacher.phone.replace(/\D/g, '');
              window.open(`https://wa.me/${num}`, '_blank');
            }}
            variant="outline" 
            size="sm"
            className="h-7 text-[10px] flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 font-bold"
          >
            <MessageSquare className="w-3 h-3 mr-1.5" />
            WhatsApp
          </Button>
          <Button 
            onClick={(e) => e.stopPropagation()}
            variant="outline" 
            size="sm"
            className="h-7 text-[10px] flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 font-bold"
          >
            <Mail className="w-3 h-3 mr-1.5" />
            Mensaje
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
