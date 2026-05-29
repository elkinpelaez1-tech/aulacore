import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { SubjectPerformance } from './mockData';
import { BookOpen, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface SubjectDetailModalProps {
  subject: SubjectPerformance | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SubjectDetailModal({ subject, isOpen, onClose }: SubjectDetailModalProps) {
  if (!subject) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto bg-slate-50">
        <div className={cn("h-32 px-6 pt-10 pb-6 text-white relative", subject.bgClass)}>
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold leading-tight">{subject.name}</h2>
              <p className="text-white/80 font-medium text-sm">{subject.teacher}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Promedio Actual</p>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-4xl font-bold", subject.colorClass)}>{subject.currentGrade.toFixed(1)}</span>
                <span className="text-sm font-medium text-slate-500">/ 5.0</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Progreso</p>
              <div className="w-24">
                <Progress 
                  value={(subject.currentGrade / 5) * 100} 
                  className={cn("h-2 bg-slate-100", `[&_[data-slot=progress-indicator]]:${subject.bgClass}`)} 
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              Desglose de Calificaciones
            </h3>
            
            <div className="space-y-3">
              {subject.activities.map((activity) => (
                <div key={activity.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">{activity.name}</h4>
                    <div className={cn(
                      "px-2 py-0.5 rounded text-xs font-bold",
                      activity.grade >= 4.0 ? "bg-emerald-50 text-emerald-600" :
                      activity.grade >= 3.0 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {activity.grade.toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {activity.date}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-bold">{activity.percentage}% valor</span>
                  </div>

                  {activity.feedback && (
                    <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2 border border-slate-100">
                      {activity.grade >= 4.0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <p className="leading-relaxed">"{activity.feedback}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
