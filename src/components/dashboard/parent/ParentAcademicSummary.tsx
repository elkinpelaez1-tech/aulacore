'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Medal } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const TREND_DATA = [
  { period: 'P1', nota: 3.8 },
  { period: 'P2', nota: 4.2 },
  { period: 'P3', nota: 4.5 },
];

export function ParentAcademicSummary() {
  return (
    <Card className="border-slate-200 shadow-sm col-span-1 md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-slate-800">
          Resumen Académico
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Promedio y Mini Gráfica */}
          <div className="flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Promedio General</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-800">4.5</span>
                  <span className="text-emerald-500 font-bold flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" /> +0.3
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                <Medal className="w-6 h-6 text-indigo-500" />
              </div>
            </div>

            <div className="h-20 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNotaMini" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="nota" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorNotaMini)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Destacadas vs Riesgo */}
          <div className="flex flex-col justify-center space-y-5">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-emerald-700">Matemáticas (Destacada)</span>
                <span className="text-emerald-700">4.8</span>
              </div>
              <Progress value={96} className="h-2 bg-emerald-100 [&_[data-slot=progress-indicator]]:bg-emerald-500" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-blue-700">Lenguaje</span>
                <span className="text-blue-700">4.2</span>
              </div>
              <Progress value={84} className="h-2 bg-blue-100 [&_[data-slot=progress-indicator]]:bg-blue-500" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-rose-700">Física (En Riesgo)</span>
                <span className="text-rose-700">2.8</span>
              </div>
              <Progress value={56} className="h-2 bg-rose-100 [&_[data-slot=progress-indicator]]:bg-rose-500" />
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
