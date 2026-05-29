'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Star, AlertTriangle, FileCheck, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'recognition' | 'warning' | 'observation' | 'commitment';
  title: string;
  description: string;
  author: string;
}

const EVENT_STYLES = {
  recognition: {
    icon: Star,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-rose-500',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-200',
    dotColor: 'bg-rose-500'
  },
  observation: {
    icon: MessageSquare,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500'
  },
  commitment: {
    icon: FileCheck,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500'
  }
};

const MOCK_EVENTS: TimelineEvent[] = [
  {
    id: '1',
    date: 'Hoy, 10:30 AM',
    type: 'recognition',
    title: 'Participación Destacada',
    description: 'Excelente aporte en el debate sobre Filosofía Moderna. Demostró pensamiento crítico.',
    author: 'Prof. Ana Martínez'
  },
  {
    id: '2',
    date: 'Ayer, 08:15 AM',
    type: 'observation',
    title: 'Llegada Tarde',
    description: 'Ingresó a clase con 15 minutos de retraso por congestión vehicular.',
    author: 'Coordinador'
  },
  {
    id: '3',
    date: 'Hace 3 días',
    type: 'commitment',
    title: 'Acuerdo Académico',
    description: 'Se compromete a entregar los talleres de Matemáticas pendientes este viernes.',
    author: 'Prof. Carlos Ruiz'
  }
];

export function StudentTimeline() {
  return (
    <Card className="border-slate-200 shadow-sm col-span-1 md:col-span-2 lg:col-span-1 flex flex-col h-full">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Observador Personal
          </CardTitle>
          <Badge variant="outline" className="bg-white">Reciente</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-[400px] w-full p-6">
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
            {MOCK_EVENTS.map((event) => {
              const styles = EVENT_STYLES[event.type];
              const Icon = styles.icon;

              return (
                <div key={event.id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className={cn(
                    "absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white",
                    styles.dotColor
                  )} />
                  
                  {/* Content Box */}
                  <div className={cn(
                    "bg-white border rounded-xl p-4 shadow-sm transition-all hover:shadow-md",
                    styles.borderColor
                  )}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-md", styles.bgColor)}>
                          <Icon className={cn("w-4 h-4", styles.color)} />
                        </div>
                        <h4 className="font-bold text-sm text-slate-800">{event.title}</h4>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">{event.date}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {event.type}
                      </span>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        Por: <span className="font-bold text-slate-700">{event.author}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
