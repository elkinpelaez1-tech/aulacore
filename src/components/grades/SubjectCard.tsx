import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BookOpen, Clock } from 'lucide-react';
import { SubjectPerformance } from './mockData';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface SubjectCardProps {
  subject: SubjectPerformance;
  onClick: (subject: SubjectPerformance) => void;
}

export function SubjectCard({ subject, onClick }: SubjectCardProps) {
  const isUp = subject.currentGrade >= subject.previousGrade;
  const trendDiff = Math.abs(subject.currentGrade - subject.previousGrade).toFixed(1);

  // Convert 0-5 grade to percentage for progress bar
  const progressPercent = (subject.currentGrade / 5) * 100;

  return (
    <Card 
      onClick={() => onClick(subject)}
      className="border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all hover:border-indigo-200 group relative overflow-hidden"
    >
      <div className={cn("absolute top-0 left-0 w-1 h-full", subject.bgClass)} />
      <CardContent className="p-5 pl-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-6 h-6 rounded flex items-center justify-center bg-slate-50", subject.colorClass)}>
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg leading-none group-hover:text-indigo-600 transition-colors">
                {subject.name}
              </h4>
            </div>
            <p className="text-sm text-slate-500 font-medium pl-8">{subject.teacher}</p>
          </div>
          
          <div className="text-right">
            <h3 className={cn("text-3xl font-bold leading-none mb-1", subject.colorClass)}>
              {subject.currentGrade.toFixed(1)}
            </h3>
            <div className={cn(
              "flex items-center justify-end text-xs font-bold gap-0.5",
              isUp ? "text-emerald-600" : "text-rose-600"
            )}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trendDiff}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Logro de Competencias</span>
              <span className="text-slate-700">{progressPercent.toFixed(0)}%</span>
            </div>
            <Progress 
              value={progressPercent} 
              className={cn("h-1.5 bg-slate-100", `[&_[data-slot=progress-indicator]]:${subject.bgClass}`)} 
            />
          </div>

          <div className="flex items-center gap-4 pt-3 border-t border-slate-50">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Asistencia:</span>
              <span className={cn(
                "font-bold",
                subject.attendanceScore >= 90 ? "text-emerald-600" : subject.attendanceScore >= 80 ? "text-amber-600" : "text-rose-600"
              )}>
                {subject.attendanceScore}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
