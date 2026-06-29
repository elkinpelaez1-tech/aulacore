'use client';

import React, { useState } from 'react';
import { KpiCard } from '@/components/territorio/KpiCard';
import { ChartCard } from '@/components/territorio/ChartCard';
import { SummaryCard } from '@/components/territorio/SummaryCard';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Award, BookOpen, BrainCircuit, Landmark, Sparkles, Filter, Search, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- MOCK DATA ANUAL POR ÁREA ---
const HISTORICO_AREAS: Record<string, { year: string; oficial: number; privado: number }[]> = {
  todos: [
    { year: '2022', oficial: 3.48, privado: 4.12 },
    { year: '2023', oficial: 3.52, privado: 4.18 },
    { year: '2024', oficial: 3.61, privado: 4.25 },
    { year: '2025', oficial: 3.75, privado: 4.31 },
    { year: '2026', oficial: 3.84, privado: 4.38 },
  ],
  matematicas: [
    { year: '2022', oficial: 3.21, privado: 4.02 },
    { year: '2023', oficial: 3.30, privado: 4.08 },
    { year: '2024', oficial: 3.38, privado: 4.12 },
    { year: '2025', oficial: 3.42, privado: 4.15 },
    { year: '2026', oficial: 3.45, privado: 4.18 },
  ],
  lenguaje: [
    { year: '2022', oficial: 3.65, privado: 4.21 },
    { year: '2023', oficial: 3.70, privado: 4.25 },
    { year: '2024', oficial: 3.82, privado: 4.30 },
    { year: '2025', oficial: 3.88, privado: 4.32 },
    { year: '2026', oficial: 3.95, privado: 4.35 },
  ],
  ingles: [
    { year: '2022', oficial: 3.01, privado: 4.22 },
    { year: '2023', oficial: 3.10, privado: 4.28 },
    { year: '2024', oficial: 3.18, privado: 4.35 },
    { year: '2025', oficial: 3.20, privado: 4.41 },
    { year: '2026', oficial: 3.25, privado: 4.48 },
  ],
};

const MOCK_SCHOOLS = [
  { rank: 1, name: 'Gimnasio Campestre AulaCore', type: 'Privado', math: 4.82, lang: 4.90, eng: 4.95, average: 4.89 },
  { rank: 2, name: 'Colegio San Ignacio de Loyola', type: 'Privado', math: 4.65, lang: 4.75, eng: 4.80, average: 4.73 },
  { rank: 3, name: 'I.E. Presbítero Antonio José Bernal', type: 'Oficial', math: 4.20, lang: 4.52, eng: 4.10, average: 4.27 },
  { rank: 4, name: 'Institución Educativa Marco Fidel Suárez', type: 'Oficial', math: 4.12, lang: 4.40, eng: 4.02, average: 4.18 },
  { rank: 5, name: 'Colegio San Jose de la Salle', type: 'Privado', math: 4.05, lang: 4.32, eng: 4.55, average: 4.30 },
  { rank: 6, name: 'I.E. Rural El Hatillo', type: 'Oficial', math: 3.32, lang: 3.65, eng: 3.15, average: 3.37 },
];

export default function TerritoryCalidadPage() {
  const [selectedArea, setSelectedArea] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar el ranking
  const filteredSchools = MOCK_SCHOOLS.filter(s => {
    const matchesType = typeFilter === 'all' || s.type === typeFilter;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
            Módulo de Calidad Educativa
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Analítica de rendimiento académico, rankings interinstitucionales y recomendaciones del motor de IA curricular.
          </p>
        </div>
      </div>

      {/* Fila de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Promedio General"
          value="3.84 / 5.0"
          trend={{ value: 2.1, isPositive: true }}
          icon={Award}
          iconColorClass="text-emerald-650"
          iconBgClass="bg-emerald-50"
        />
        <KpiCard
          title="Ev. Evaluadas IA"
          value="18,450"
          trend={{ value: 12.3, isPositive: true }}
          icon={BrainCircuit}
          iconColorClass="text-indigo-650"
          iconBgClass="bg-indigo-50"
        />
        <KpiCard
          title="Área Destacada"
          value="Lenguaje"
          description="Promedio 4.10"
          icon={BookOpen}
          iconColorClass="text-blue-650"
          iconBgClass="bg-blue-50"
        />
        <KpiCard
          title="Pruebas Oficiales Est."
          value="Aprobado"
          description="Meta de Calidad Cumplida"
          icon={Landmark}
          iconColorClass="text-purple-650"
          iconBgClass="bg-purple-50"
        />
      </div>

      {/* Gráfico comparativo dinámico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Historial de Rendimiento Promedio"
          description="Evolución anual de promedios oficiales vs. privados en base a la materia activa."
          className="lg:col-span-2"
          headerActions={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">Materia:</span>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="todos">Todas las Áreas</option>
                <option value="matematicas">Matemáticas</option>
                <option value="lenguaje">Lenguaje</option>
                <option value="ingles">Inglés</option>
              </select>
            </div>
          }
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HISTORICO_AREAS[selectedArea] || HISTORICO_AREAS.todos} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis domain={[1.0, 5.0]} stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip />
                <Legend style={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="oficial" name="Sector Oficial (Público)" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="privado" name="Sector Privado" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Recomendaciones IA placeholders */}
        <SummaryCard 
          title="Recomendaciones de Intervención (IA)"
          headerActions={
            <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
              IA Sugerencias
            </span>
          }
        >
          <div className="space-y-4">
            <div className="bg-indigo-50/20 border border-indigo-150 p-4 rounded-xl flex gap-3 text-slate-800 items-start">
              <Sparkles className="w-5 h-5 shrink-0 text-indigo-600 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-extrabold block">Foco Crítico: Inglés Oficial</span>
                <p className="font-semibold text-slate-655 mt-1">
                  Se observa una brecha promedio de 1.23 puntos en inglés oficial frente a privado. Sugerencia: Programar capacitaciones curriculares en inglés a través de la Agenda Territorial.
                </p>
              </div>
            </div>

            <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-xl space-y-3 text-xs leading-normal">
              <span className="font-extrabold block text-slate-700">Meta Académica 2026:</span>
              <p className="font-semibold text-slate-500">
                La proyección del promedio general para finalizar el año es de 3.90, acercándose a la meta gubernamental de 4.0.
              </p>
            </div>
          </div>
        </SummaryCard>
      </div>

      {/* Ranking Interinstitucional */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-855">
          Ranking Académico Consolidado
        </h4>

        {/* Filtros locales */}
        <div className="bg-slate-50/20 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 min-w-[200px] flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 w-full">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar institución..."
              className="w-full text-xs font-semibold text-slate-800 px-2 bg-transparent focus:outline-none placeholder-slate-400"
            />
          </div>

          <div className="flex flex-col gap-1 w-full sm:w-44">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sector</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="all">Todos los sectores</option>
              <option value="Oficial">Oficial (Público)</option>
              <option value="Privado">Privado</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/40">
                  <TableRow>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center w-16">Puesto</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Nombre del Plantel</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Naturaleza</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Prom. Matemáticas</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Prom. Lenguaje</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Prom. Inglés</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Promedio General</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.map((s) => (
                    <TableRow key={s.rank} className="hover:bg-slate-50/50">
                      <TableCell className="py-3.5 align-middle text-center">
                        <span className="w-6 h-6 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center text-xs font-black mx-auto">
                          {s.rank}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-xs font-bold text-slate-800">
                        {s.name}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          s.type === 'Oficial' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {s.type}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center text-xs font-semibold text-slate-655">
                        {s.math.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center text-xs font-semibold text-slate-655">
                        {s.lang.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center text-xs font-semibold text-slate-655">
                        {s.eng.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center">
                        <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {s.average.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
