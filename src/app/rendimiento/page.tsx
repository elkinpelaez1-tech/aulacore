'use client';

import React from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, BarChart3, Target, CalendarDays, Zap, ShieldAlert 
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SKILLS_DATA = [
  { subject: 'Matemáticas', score: 95, avg: 75, fullMark: 100 },
  { subject: 'Ciencias', score: 85, avg: 70, fullMark: 100 },
  { subject: 'Lectura', score: 90, avg: 80, fullMark: 100 },
  { subject: 'Arte', score: 75, avg: 85, fullMark: 100 },
  { subject: 'Física', score: 55, avg: 65, fullMark: 100 },
  { subject: 'Deportes', score: 100, avg: 90, fullMark: 100 },
];

const COMPARATIVE_DATA = [
  { name: 'P1', Yo: 4.1, Curso: 3.8 },
  { name: 'P2', Yo: 4.3, Curso: 3.9 },
  { name: 'P3', Yo: 4.5, Curso: 4.0 },
];

export default function RendimientoPage() {
  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-indigo-500" />
              Mi Rendimiento Global
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Análisis avanzado de fortalezas y distribución de habilidades.
            </p>
          </div>
          <Link href="/notas-academicas">
            <Button variant="outline" className="font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              Ir a Notas Académicas
            </Button>
          </Link>
        </div>

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4 opacity-80">
                <Target className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-widest text-xs">Desempeño Promedio</h3>
              </div>
              <p className="text-4xl font-black mb-1">88%</p>
              <p className="text-indigo-200 text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> 5% superior al periodo pasado
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4 text-slate-500">
                <CalendarDays className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-widest text-xs">Asistencia Consolidada</h3>
              </div>
              <p className="text-4xl font-black text-slate-800 mb-1">94%</p>
              <p className="text-emerald-500 text-sm font-bold flex items-center gap-1">
                Excelente - 1 falta este mes
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4 text-slate-500">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold uppercase tracking-widest text-xs">Fortaleza Principal</h3>
              </div>
              <p className="text-2xl font-black text-slate-800 mb-1">Razonamiento</p>
              <p className="text-slate-500 text-sm font-medium leading-tight">
                Destacas sobre el 95% de tu grupo en Matemáticas y Lógica.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Radar Chart: Perfil de Habilidades */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold text-slate-800">Mapa de Inteligencias Múltiples</CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SKILLS_DATA}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip wrapperStyle={{ outline: 'none' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <Radar name="Mi Perfil" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                  <Radar name="Promedio del Curso" dataKey="avg" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart: Comparativa con Curso */}
          <Card className="border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-bold text-slate-800">Comparativa Global</CardTitle>
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="p-6 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COMPARATIVE_DATA} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                  <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                  <Bar dataKey="Yo" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Curso" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

      </div>
    </AppLayout>
  );
}
