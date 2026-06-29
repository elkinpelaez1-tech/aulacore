'use client';

import React, { useState } from 'react';
import { KpiCard } from '@/components/territorio/KpiCard';
import { ChartCard } from '@/components/territorio/ChartCard';
import { SummaryCard } from '@/components/territorio/SummaryCard';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Users2, Contact, Award, CheckCircle, Search, Sparkles, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MockTeacher {
  id: string;
  name: string;
  specialty: string;
  school: string;
  degree: 'Licenciatura' | 'Especialización' | 'Maestría' | 'Doctorado';
  experienceYears: number;
  status: 'Activo' | 'Licencia';
}

const MOCK_TEACHERS: MockTeacher[] = [
  { id: '1', name: 'Prof. Andrés Alzate', specialty: 'Matemáticas', school: 'I.E. Marco Fidel Suárez', degree: 'Maestría', experienceYears: 12, status: 'Activo' },
  { id: '2', name: 'Prof. Claudia Patricia Restrepo', specialty: 'Lengua Castellana', school: 'Gimnasio Campestre AulaCore', degree: 'Especialización', experienceYears: 15, status: 'Activo' },
  { id: '3', name: 'Prof. Juan Fernando Quintero', specialty: 'Ciencias Naturales', school: 'I.E. Presbítero Antonio José Bernal', degree: 'Licenciatura', experienceYears: 6, status: 'Activo' },
  { id: '4', name: 'Prof. Sandra Milena Muñoz', specialty: 'Inglés', school: 'Colegio San Ignacio de Loyola', degree: 'Maestría', experienceYears: 9, status: 'Activo' },
  { id: '5', name: 'Prof. Ricardo Antonio Vélez', specialty: 'Tecnología', school: 'I.E. Técnico Industrial Pascual Bravo', degree: 'Doctorado', experienceYears: 20, status: 'Activo' },
  { id: '6', name: 'Prof. Gloria Estella Tobón', specialty: 'Matemáticas', school: 'I.E. Rural El Hatillo', degree: 'Licenciatura', experienceYears: 4, status: 'Licencia' },
];

const MOCK_VACANCIES = [
  { id: 'v1', subject: 'Física / Ciencias', school: 'I.E. Rural El Hatillo', priority: 'Alta', posted: 'Hace 3 días' },
  { id: 'v2', subject: 'Inglés Técnico', school: 'I.E. Técnico Industrial Pascual Bravo', priority: 'Media', posted: 'Hace 5 días' },
];

const FORMACION_DOCENTE = [
  { name: 'Licenciados', docentes: 720 },
  { name: 'Especialistas', docentes: 640 },
  { name: 'Magísteres', docentes: 410 },
  { name: 'Doctores', docentes: 70 },
];

export default function TerritoryTalentoHumanoPage() {
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  const filteredTeachers = MOCK_TEACHERS.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.school.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'all' || t.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
          Módulo de Talento Humano
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Registro consolidado de docentes, distribución por escalafón formativo y alertas de cobertura docente en planteles.
        </p>
      </div>

      {/* Fila de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Docentes"
          value="1,840"
          trend={{ value: 3.2, isPositive: true }}
          icon={Users2}
          iconColorClass="text-blue-650"
          iconBgClass="bg-blue-50"
        />
        <KpiCard
          title="Directivos Registrados"
          value="142"
          description="Rectores y Coordinadores"
          icon={Contact}
          iconColorClass="text-indigo-650"
          iconBgClass="bg-indigo-50"
        />
        <KpiCard
          title="Con Escalafón Docente"
          value="85%"
          description="Estatuto Docente validado"
          icon={Award}
          iconColorClass="text-emerald-650"
          iconBgClass="bg-emerald-50"
        />
        <KpiCard
          title="Personal Activo Hoy"
          value="98.6%"
          trend={{ value: 0.2, isPositive: true }}
          icon={CheckCircle}
          iconColorClass="text-purple-650"
          iconBgClass="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de distribución de formación */}
        <ChartCard
          title="Distribución por Nivel de Postgrado"
          description="Formación académica consolidada del personal del territorio."
          className="lg:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FORMACION_DOCENTE} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip />
                <Bar dataKey="docentes" name="Cantidad de Docentes" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Alertas de vacantes críticas */}
        <SummaryCard 
          title="Alertas de Cobertura de Vacantes"
          headerActions={
            <span className="text-[9px] font-black text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <AlertCircle className="w-3 h-3 text-rose-550 animate-pulse" />
              Crítico
            </span>
          }
        >
          <div className="space-y-4">
            {MOCK_VACANCIES.map(v => (
              <div key={v.id} className="p-4 border border-rose-150 rounded-xl bg-rose-50/10 space-y-2 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-rose-900">{v.subject}</span>
                  <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                    Prioridad {v.priority}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>Sede: {v.school}</span>
                  <span>Publicado: {v.posted}</span>
                </div>
              </div>
            ))}
          </div>
        </SummaryCard>
      </div>

      {/* Directorio Docente */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-855">
          Directorio Docente del Territorio
        </h4>

        {/* Filtros */}
        <div className="bg-slate-50/20 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 min-w-[200px] flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 w-full">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar docente por nombre o colegio..."
              className="w-full text-xs font-semibold text-slate-800 px-2 bg-transparent focus:outline-none placeholder-slate-400"
            />
          </div>

          <div className="flex flex-col gap-1 w-full sm:w-44">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Especialidad</span>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="all">Todas las especialidades</option>
              <option value="Matemáticas">Matemáticas</option>
              <option value="Lengua Castellana">Lengua Castellana</option>
              <option value="Ciencias Naturales">Ciencias Naturales</option>
              <option value="Inglés">Inglés</option>
              <option value="Tecnología">Tecnología</option>
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
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Nombre del Docente</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Especialidad / Área</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Institución Vinculada</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Nivel de Postgrado</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Antigüedad (Años)</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((t) => (
                    <TableRow key={t.id} className="hover:bg-slate-50/50">
                      <TableCell className="py-3.5 align-middle text-xs font-bold text-slate-800">
                        {t.name}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-xs font-semibold text-indigo-750">
                        {t.specialty}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-xs font-semibold text-slate-655">
                        {t.school}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center text-xs font-bold text-slate-700">
                        {t.degree}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center text-xs font-bold text-slate-800">
                        {t.experienceYears}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          t.status === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-850'
                        }`}>
                          {t.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTeachers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-xs text-slate-450 font-bold italic">
                        No se encontraron docentes registrados con ese criterio.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
