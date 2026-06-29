'use client';

import React, { useState } from 'react';
import { KpiCard } from '@/components/territorio/KpiCard';
import { ChartCard } from '@/components/territorio/ChartCard';
import { SummaryCard } from '@/components/territorio/SummaryCard';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Users2, Contact, Award, CheckCircle, Search, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MockTeacher {
  id: string;
  name: string;
  specialty: string;
  school: string;
  statute: 'Decreto 2277' | 'Decreto 1278';
  degree: 'Normalista' | 'Tecnólogo' | 'Profesional' | 'Especialista' | 'Magíster' | 'Doctor';
  experienceYears: number;
  status: 'Activo' | 'Licencia';
}

const MOCK_TEACHERS: MockTeacher[] = [
  { id: '1', name: 'Prof. Andrés Alzate', specialty: 'Matemáticas', school: 'I.E. Marco Fidel Suárez', statute: 'Decreto 1278', degree: 'Magíster', experienceYears: 12, status: 'Activo' },
  { id: '2', name: 'Prof. Claudia Patricia Restrepo', specialty: 'Lengua Castellana', school: 'Gimnasio Campestre AulaCore', statute: 'Decreto 2277', degree: 'Especialista', experienceYears: 15, status: 'Activo' },
  { id: '3', name: 'Prof. Juan Fernando Quintero', specialty: 'Ciencias Naturales', school: 'I.E. Presbítero Antonio José Bernal', statute: 'Decreto 1278', degree: 'Profesional', experienceYears: 6, status: 'Activo' },
  { id: '4', name: 'Prof. Sandra Milena Muñoz', specialty: 'Inglés', school: 'Colegio San Ignacio de Loyola', statute: 'Decreto 1278', degree: 'Magíster', experienceYears: 9, status: 'Activo' },
  { id: '5', name: 'Prof. Ricardo Antonio Vélez', specialty: 'Tecnología', school: 'I.E. Técnico Industrial Pascual Bravo', statute: 'Decreto 2277', degree: 'Doctor', experienceYears: 20, status: 'Activo' },
  { id: '6', name: 'Prof. Gloria Estella Tobón', specialty: 'Matemáticas', school: 'I.E. Rural El Hatillo', statute: 'Decreto 1278', degree: 'Normalista', experienceYears: 4, status: 'Licencia' },
];

const MOCK_VACANCIES = [
  { id: 'v1', subject: 'Física / Ciencias', school: 'I.E. Rural El Hatillo', priority: 'Alta', posted: 'Hace 3 días' },
  { id: 'v2', subject: 'Inglés Técnico', school: 'I.E. Técnico Industrial Pascual Bravo', priority: 'Media', posted: 'Hace 5 días' },
];

const FORMACION_DOCENTE = [
  { name: 'Normalistas', docentes: 120 },
  { name: 'Tecnólogos', docentes: 210 },
  { name: 'Profesionales', docentes: 720 },
  { name: 'Especialistas', docentes: 640 },
  { name: 'Magísteres', docentes: 410 },
  { name: 'Doctores', docentes: 70 },
];

const DISTRIBUCION_ESTATUTO = [
  { name: 'Decreto 1278 (Nuevo)', value: 1140, color: '#6366f1' },
  { name: 'Decreto 2277 (Antiguo)', value: 700, color: '#10b981' },
];

export default function TerritoryTalentoHumanoPage() {
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [statuteFilter, setStatuteFilter] = useState('all');
  const [degreeFilter, setDegreeFilter] = useState('all');

  const filteredTeachers = MOCK_TEACHERS.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.school.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'all' || t.specialty === specialtyFilter;
    const matchesStatute = statuteFilter === 'all' || t.statute === statuteFilter;
    const matchesDegree = degreeFilter === 'all' || t.degree === degreeFilter;
    return matchesSearch && matchesSpecialty && matchesStatute && matchesDegree;
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
          title="Decreto 1278"
          value="1,140"
          description="Estatuto docente nuevo"
          icon={BookOpen}
          iconColorClass="text-indigo-650"
          iconBgClass="bg-indigo-50"
        />
        <KpiCard
          title="Decreto 2277"
          value="700"
          description="Estatuto docente antiguo"
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
          title="Distribución por Nivel de Formación Académica"
          description="Formación oficial y posgrados de docentes registrados."
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

        {/* Gráfico de Distribución por Estatuto */}
        <ChartCard
          title="Distribución por Estatuto Laboral"
          description="Segmentación del magisterio colombiano."
        >
          <div className="h-72 flex flex-col justify-between">
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DISTRIBUCION_ESTATUTO}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {DISTRIBUCION_ESTATUTO.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-800">1,840</span>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">Docentes</span>
              </div>
            </div>
            
            <div className="space-y-1.5 text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-100">
              {DISTRIBUCION_ESTATUTO.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name}</span>
                  </div>
                  <span className="text-slate-700 font-extrabold">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Directorio Docente */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-855">
          Directorio Docente del Territorio
        </h4>

        {/* Filtros Avanzados */}
        <div className="bg-slate-50/20 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Buscador */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar docente por nombre o colegio..."
              className="w-full text-xs font-semibold text-slate-800 px-2 bg-transparent focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Filtro Especialidad */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Especialidad</span>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none w-full"
            >
              <option value="all">Todas las especialidades</option>
              <option value="Matemáticas">Matemáticas</option>
              <option value="Lengua Castellana">Lengua Castellana</option>
              <option value="Ciencias Naturales">Ciencias Naturales</option>
              <option value="Inglés">Inglés</option>
              <option value="Tecnología">Tecnología</option>
            </select>
          </div>

          {/* Filtro Estatuto */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Estatuto Docente</span>
            <select
              value={statuteFilter}
              onChange={(e) => setStatuteFilter(e.target.value)}
              className="text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none w-full"
            >
              <option value="all">Todos los estatutos</option>
              <option value="Decreto 1278">Decreto 1278 (Nuevo)</option>
              <option value="Decreto 2277">Decreto 2277 (Antiguo)</option>
            </select>
          </div>

          {/* Filtro Escalafón Formación */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Escalafón Formación</span>
            <select
              value={degreeFilter}
              onChange={(e) => setDegreeFilter(e.target.value)}
              className="text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none w-full"
            >
              <option value="all">Todos los niveles</option>
              <option value="Normalista">Normalista</option>
              <option value="Tecnólogo">Tecnólogo</option>
              <option value="Profesional">Profesional</option>
              <option value="Especialista">Especialista</option>
              <option value="Magíster">Magíster</option>
              <option value="Doctor">Doctor</option>
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
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Estatuto</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Nivel de Postgrado</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Institución Vinculada</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Antigüedad</TableHead>
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
                      <TableCell className="py-3.5 align-middle text-xs font-extrabold text-slate-600">
                        {t.statute}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-xs font-bold text-indigo-900 bg-indigo-50/10 px-2 py-0.5 rounded-md w-fit block mt-1.5">
                        {t.degree}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-xs font-semibold text-slate-655">
                        {t.school}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center text-xs font-bold text-slate-800">
                        {t.experienceYears} años
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
                      <TableCell colSpan={7} className="py-8 text-center text-xs text-slate-450 font-bold italic">
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
