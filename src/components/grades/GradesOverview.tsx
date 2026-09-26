import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, AlertTriangle, Medal, BarChart3 } from 'lucide-react';

interface GradesOverviewProps {
  gpa?: number | null;
  ranking?: string | null;
  riskCount?: number;
  trendData?: any[];
}

export function GradesOverview({
  gpa = null,
  ranking = null,
  riskCount = 0,
  trendData = [],
}: GradesOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* KPIs Col */}
      <div className="space-y-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Promedio General</p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-bold text-slate-800 leading-none">
                  {gpa !== null ? gpa.toFixed(1) : '--'}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold text-slate-700">Ranking en Curso</span>
              </div>
              <span className="text-lg font-bold text-slate-900">
                {ranking ?? '--'}
              </span>
            </div>
            <div className="h-px w-full bg-slate-100 my-1" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span className="text-sm font-bold text-slate-700">En Riesgo</span>
              </div>
              <span className="text-sm font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                {riskCount} {riskCount === 1 ? 'Materia' : 'Materias'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Col */}
      <Card className="lg:col-span-2 border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800">Evolución Académica</h3>
            <p className="text-xs text-slate-500">Tendencia del promedio general por periodos</p>
          </div>
        </div>
        <div className="p-5 flex-1 min-h-[200px] flex items-center justify-center">
          {trendData && trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="period"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                  formatter={(value: any) => [`${value}`, 'Promedio']}
                />
                <Area
                  type="monotone"
                  dataKey="average"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAverage)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs font-medium flex flex-col items-center justify-center">
              <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
              <p>Sin registros históricos de calificaciones para este año lectivo.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
