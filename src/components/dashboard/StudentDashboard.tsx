'use client';

import React from 'react';
import { useRole } from '@/providers/role-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StudentTimeline } from './StudentTimeline';
import { StudentProfileCard } from './shared/StudentProfileCard';
import { StudentScheduleWidget } from './StudentScheduleWidget';
import { 
  TrendingUp, 
  Flame, 
  Award, 
  BookOpen, 
  AlertCircle, 
  ChevronRight,
  Target,
  BrainCircuit,
  Zap,
  Clock,
  User,
  Phone,
  Mail,
  CalendarDays,
  GraduationCap,
  FileText,
  Users
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';

const ACADEMIC_TREND = [
  { period: 'P1', nota: 3.8 },
  { period: 'P2', nota: 4.2 },
  { period: 'P3', nota: 4.5 },
  { period: 'Actual', nota: 4.7 },
];

const SUBJECT_PERFORMANCE = [
  { subject: 'Matemáticas', score: 4.8, fill: '#10b981' },
  { subject: 'Lenguaje', score: 4.2, fill: '#3b82f6' },
  { subject: 'Ciencias', score: 3.5, fill: '#f59e0b' },
  { subject: 'Física', score: 2.8, fill: '#ef4444' }, // En riesgo
];

export function StudentDashboard() {
  const { userName } = useRole();
  const firstName = userName ? userName.split(' ')[0] : 'Alejandro';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. HERO RESUMEN & GAMIFICACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ficha del Estudiante */}
        <StudentProfileCard 
          className="h-full" 
          studentName={userName || undefined}
          email={userName ? `${userName.toLowerCase().replace(/\s+/g, '.')}@aulacore.edu.co` : undefined}
          studentId={userName ? `TI. 102${userName.length}4050` : undefined}
        />

        {/* GPA & Progress Card */}
        <Card className="col-span-1 border-slate-200 shadow-sm bg-gradient-to-br from-indigo-900 to-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <BrainCircuit className="w-48 h-48" />
          </div>
          <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-none hover:bg-emerald-500/30">
                  Sobresaliente
                </Badge>
                <Badge className="bg-white/10 text-slate-300 border-none">
                  Grado 11°
                </Badge>
              </div>
              <h2 className="text-3xl font-black mb-1">¡Hola, {firstName}!</h2>
              <p className="text-indigo-200 font-medium">Estás a un 85% de lograr tu meta del periodo.</p>
            </div>
            
            <div className="mt-8 flex items-end gap-10">
              <div>
                <p className="text-sm text-indigo-300 font-bold uppercase tracking-wider mb-1">Promedio General</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">4.5</span>
                  <span className="text-emerald-400 font-bold flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" /> +0.3
                  </span>
                </div>
              </div>
              
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-xs font-bold text-indigo-200 mb-2">
                  <span>Progreso de Meta (4.8)</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2.5 bg-indigo-950/50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. RENDIMIENTO ACADÉMICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart */}
        <Card className="col-span-1 lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Evolución Académica</CardTitle>
                <p className="text-sm text-slate-500 font-medium">Histórico de promedio por periodo</p>
              </div>
              <Button variant="outline" size="sm" className="font-bold">Ver Detalles</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ACADEMIC_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNota" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                  <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#4f46e5' }}
                  />
                  <Area type="monotone" dataKey="nota" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorNota)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subjects Breakdown */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Desempeño por Materia</CardTitle>
            <p className="text-sm text-slate-500 font-medium">Periodo Actual</p>
          </CardHeader>
          <CardContent>
             <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SUBJECT_PERFORMANCE} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 5]} hide />
                  <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                    {
                      SUBJECT_PERFORMANCE.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Risk Alert */}
            <div className="mt-4 bg-rose-50 border border-rose-100 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-800 mb-1">Riesgo en Física</h4>
                <p className="text-xs text-rose-600 font-medium leading-tight">
                  Tu promedio actual es 2.8. El Tutor IA sugiere repasar "Cinemática" antes de la evaluación final.
                </p>
                <Button variant="link" className="p-0 h-auto text-xs font-bold text-rose-700 mt-2">
                  Ver Plan de Recuperación <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. OBSERVADOR Y ACTIVIDADES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline */}
        <div className="col-span-1 lg:col-span-1">
          <StudentTimeline />
        </div>

        {/* Próximas Entregas (Mini Curriculum View) */}
        <StudentScheduleWidget />
      </div>

    </div>
  );
}
