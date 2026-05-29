'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Medal, BookOpen, AlertCircle, 
  ChevronDown, ChevronUp, Star, Lightbulb, CheckCircle2, Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ACADEMIC_EVOLUTION = [
  { period: 'P1', score: 4.1 },
  { period: 'P2', score: 4.3 },
  { period: 'P3', score: 4.5 },
];

const SUBJECTS_DATA = [
  {
    id: 'math',
    name: 'Matemáticas',
    score: 4.8,
    trend: 'up',
    status: 'excelente',
    attendance: 98,
    competencies: [
      { name: 'Resolución Algebraica', status: 'achieved' },
      { name: 'Pensamiento Lógico', status: 'achieved' },
    ],
    teacherFeedback: 'Excelente progreso, mantienes un nivel sobresaliente en resolución de problemas complejos.',
    activities: [
      { name: 'Taller Funciones', type: 'Evaluación Formativa', weight: 20, score: 5.0, date: '12 May' },
      { name: 'Quiz Límites', type: 'Evaluación Sumativa', weight: 30, score: 4.5, date: '20 May' },
      { name: 'Proyecto Final', type: 'Evidencia Práctica', weight: 50, score: 4.8, date: 'Pendiente' },
    ]
  },
  {
    id: 'science',
    name: 'Ciencias Naturales',
    score: 4.2,
    trend: 'up',
    status: 'bueno',
    attendance: 95,
    competencies: [
      { name: 'Método Científico', status: 'achieved' },
      { name: 'Análisis de Datos', status: 'in_progress' },
    ],
    teacherFeedback: 'Buen trabajo en laboratorios. Te sugiero repasar la teoría de genética molecular.',
    activities: [
      { name: 'Lab. Microscopía', type: 'Evidencia Práctica', weight: 30, score: 4.5, date: '05 May' },
      { name: 'Examen Célula', type: 'Evaluación Sumativa', weight: 70, score: 4.0, date: '18 May' },
    ]
  },
  {
    id: 'physics',
    name: 'Física',
    score: 2.8,
    trend: 'down',
    status: 'riesgo',
    attendance: 85,
    competencies: [
      { name: 'Vectores y Cinemática', status: 'risk' },
      { name: 'Interpretación Gráfica', status: 'in_progress' },
    ],
    teacherFeedback: 'Es vital que asistas a tutorías. Hay vacíos en la interpretación gráfica de velocidad vs tiempo.',
    activities: [
      { name: 'Taller Vectores', type: 'Evaluación Formativa', weight: 40, score: 3.0, date: '10 May' },
      { name: 'Parcial Cinemática', type: 'Evaluación Sumativa', weight: 60, score: 2.5, date: '24 May' },
    ]
  }
];

export default function NotasAcademicasPage() {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const toggleSubject = (id: string) => {
    setExpandedSubject(prev => prev === id ? null : id);
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-12">
        
        {/* =====================================================================
            NIVEL 1: RESUMEN GENERAL (Dashboard HUB)
        ====================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Promedio y Ranking */}
          <Card className="col-span-1 md:col-span-2 border-slate-200 shadow-sm bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Medal className="w-32 h-32" />
            </div>
            <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full">
              <div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-none mb-3">Rendimiento Destacado</Badge>
                <h2 className="text-4xl font-black mb-1">4.5 <span className="text-xl text-indigo-300 font-medium">/ 5.0</span></h2>
                <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest">Promedio Ponderado General</p>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div>
                  <p className="text-xs text-indigo-300 font-bold uppercase mb-1">Ranking Curso</p>
                  <p className="text-2xl font-bold text-white">#4 <span className="text-sm text-indigo-300 font-medium">de 32</span></p>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <p className="text-xs text-indigo-300 font-bold uppercase mb-1">Mejor Materia</p>
                  <p className="text-lg font-bold text-emerald-400">Matemáticas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evolución Chart */}
          <Card className="col-span-1 md:col-span-2 border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest">Evolución Histórica</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 px-2 pb-4">
              <div className="h-full w-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ACADEMIC_EVOLUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                    <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* =====================================================================
            NIVEL 2 & 3: TARJETAS POR MATERIA + DETALLE (Acordeón)
        ====================================================================== */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Desglose Analítico por Materias
          </h3>

          <div className="space-y-4">
            {SUBJECTS_DATA.map((subject) => {
              const isExpanded = expandedSubject === subject.id;
              
              // Estilos dinámicos según el estado
              const statusStyles = {
                excelente: { bg: 'bg-emerald-500', text: 'text-emerald-700', lightBg: 'bg-emerald-50', border: 'border-emerald-200' },
                bueno: { bg: 'bg-blue-500', text: 'text-blue-700', lightBg: 'bg-blue-50', border: 'border-blue-200' },
                riesgo: { bg: 'bg-rose-500', text: 'text-rose-700', lightBg: 'bg-rose-50', border: 'border-rose-200' }
              }[subject.status] || { bg: 'bg-slate-500', text: 'text-slate-700', lightBg: 'bg-slate-50', border: 'border-slate-200' };

              return (
                <div key={subject.id} className={cn(
                  "bg-white border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm",
                  isExpanded ? "border-slate-300 shadow-md ring-4 ring-indigo-50" : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                )}>
                  
                  {/* CABECERA (NIVEL 2) */}
                  <div 
                    onClick={() => toggleSubject(subject.id)}
                    className="p-6 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-6 flex-1">
                      {/* Indicador de Nota Principal */}
                      <div className="flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                        <span className={cn("text-3xl font-black", statusStyles.text)}>{subject.score.toFixed(1)}</span>
                        <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-400 uppercase">
                          {subject.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-rose-500" />}
                          Tendencia
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-1">
                          {subject.name}
                          {subject.status === 'riesgo' && <Badge variant="destructive" className="ml-2">En Riesgo</Badge>}
                        </h4>
                        
                        {/* Competencias Rápidas */}
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Competencias Logradas:</span>
                          {subject.competencies.map((comp, idx) => (
                            <span key={idx} className={cn(
                              "text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 border",
                              comp.status === 'achieved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              comp.status === 'risk' ? "bg-rose-50 text-rose-700 border-rose-200" :
                              "bg-amber-50 text-amber-700 border-amber-200"
                            )}>
                              {comp.status === 'achieved' ? <CheckCircle2 className="w-3 h-3" /> : 
                               comp.status === 'risk' ? <AlertCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                              {comp.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-8 shrink-0">
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Asistencia</p>
                        <p className="text-lg font-bold text-slate-700">{subject.attendance}%</p>
                      </div>
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* DETALLE INTERNO (NIVEL 3) */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-6 lg:p-8 animate-in slide-in-from-top-2">
                      
                      {/* Observación Pedagógica IA / Docente */}
                      <div className={cn("p-4 rounded-xl border mb-8 flex gap-4", statusStyles.lightBg, statusStyles.border)}>
                        <div className={cn("p-2 rounded-lg bg-white shadow-sm shrink-0 h-min")}>
                          <Lightbulb className={cn("w-5 h-5", statusStyles.text)} />
                        </div>
                        <div>
                          <h5 className={cn("text-sm font-bold mb-1", statusStyles.text)}>Observación Pedagógica</h5>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed">{subject.teacherFeedback}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Tabla de Actividades Ponderadas */}
                        <div className="col-span-1 lg:col-span-2">
                          <h5 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Estructura de Calificación (Actividades)</h5>
                          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                                <tr>
                                  <th className="px-4 py-3">Actividad</th>
                                  <th className="px-4 py-3">Tipo</th>
                                  <th className="px-4 py-3 text-center">Peso</th>
                                  <th className="px-4 py-3 text-center">Nota</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium">
                                {subject.activities.map((act, i) => (
                                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                      <span className="text-slate-800 font-semibold block">{act.name}</span>
                                      <span className="text-[10px] text-slate-400">{act.date}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 text-xs">{act.type}</td>
                                    <td className="px-4 py-3 text-center">
                                      <Badge variant="outline" className="bg-slate-50 font-bold">{act.weight}%</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {act.score ? (
                                        <span className={cn(
                                          "font-black text-sm",
                                          act.score >= 4.0 ? "text-emerald-600" : act.score >= 3.0 ? "text-blue-600" : "text-rose-600"
                                        )}>{act.score.toFixed(1)}</span>
                                      ) : (
                                        <span className="text-slate-300 text-xs">-</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Estado y Progreso de la Materia */}
                        <div className="col-span-1">
                          <h5 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Progreso del Periodo</h5>
                          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
                            
                            <div>
                              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                <span>Rendimiento Logrado</span>
                                <span className={statusStyles.text}>{subject.score.toFixed(1)} / 5.0</span>
                              </div>
                              <Progress value={(subject.score / 5) * 100} className="h-2" />
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Recomendación IA</p>
                              {subject.status === 'riesgo' ? (
                                <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm">
                                  Ver Plan de Recuperación
                                </Button>
                              ) : (
                                <Button variant="outline" className="w-full font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
                                  Ver Material de Refuerzo
                                </Button>
                              )}
                            </div>

                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
