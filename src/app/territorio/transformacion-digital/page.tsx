'use client';

import React, { useState } from 'react';
import { KpiCard } from '@/components/territorio/KpiCard';
import { ChartCard } from '@/components/territorio/ChartCard';
import { SummaryCard } from '@/components/territorio/SummaryCard';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Laptop, Cpu, HardDrive, CheckCircle2, Search, Sparkles, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SchoolDigitalState {
  id: string;
  name: string;
  type: 'Oficial' | 'Privado';
  horaria: boolean;
  matricula: boolean;
  rfid: boolean;
  mallas: boolean;
  health: number;
}

const MOCK_ADOPTION_DATA: SchoolDigitalState[] = [
  { id: '1', name: 'Gimnasio Campestre AulaCore', type: 'Privado', horaria: true, matricula: true, rfid: true, mallas: true, health: 98 },
  { id: '2', name: 'Institución Educativa Marco Fidel Suárez', type: 'Oficial', horaria: true, matricula: true, rfid: false, mallas: true, health: 82 },
  { id: '3', name: 'I.E. Presbítero Antonio José Bernal', type: 'Oficial', horaria: true, matricula: true, rfid: true, mallas: false, health: 88 },
  { id: '4', name: 'Colegio San Ignacio de Loyola', type: 'Privado', horaria: true, matricula: true, rfid: true, mallas: true, health: 94 },
  { id: '5', name: 'I.E. Rural El Hatillo', type: 'Oficial', horaria: false, matricula: true, rfid: false, mallas: false, health: 68 },
  { id: '6', name: 'I.E. Técnico Industrial Pascual Bravo', type: 'Oficial', horaria: true, matricula: true, rfid: true, mallas: true, health: 85 },
];

const ADOPCION_MODULOS = [
  { name: 'Mallas Curriculares', porcentaje: 82 },
  { name: 'Planeación Horaria', porcentaje: 78 },
  { name: 'Matrícula Digital', porcentaje: 94 },
  { name: 'Asistencia RFID', porcentaje: 40 },
];

export default function TerritoryTransformacionPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = MOCK_ADOPTION_DATA.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || school.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
          Módulo de Transformación Digital
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Monitoreo del nivel de madurez digital, adopción de AulaCore por módulos y auditoría de uso escolar.
        </p>
      </div>

      {/* Fila de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Uso de Planeación Horaria"
          value="82%"
          trend={{ value: 4.5, isPositive: true }}
          icon={Laptop}
          iconColorClass="text-indigo-650"
          iconBgClass="bg-indigo-50"
        />
        <KpiCard
          title="Uso de RFID"
          value="40%"
          trend={{ value: 12.3, isPositive: true }}
          icon={Cpu}
          iconColorClass="text-blue-650"
          iconBgClass="bg-blue-50"
        />
        <KpiCard
          title="Mallas Parametrizadas"
          value="78%"
          trend={{ value: 2.1, isPositive: true }}
          icon={HardDrive}
          iconColorClass="text-emerald-650"
          iconBgClass="bg-emerald-50"
        />
        <KpiCard
          title="Auditorías Digitales Ok"
          value="42 / 48"
          description="Sincronización activa"
          icon={CheckCircle2}
          iconColorClass="text-purple-650"
          iconBgClass="bg-purple-50"
        />
      </div>

      {/* Gráfico de adopción y sugerencia IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico */}
        <ChartCard
          title="Tasa de Adopción de AulaCore por Módulos"
          description="Porcentaje agregado de uso de herramientas tecnológicas en el territorio."
          className="lg:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ADOPCION_MODULOS} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip />
                <Bar dataKey="porcentaje" name="Porcentaje de Adopción" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Insight IA */}
        <SummaryCard 
          title="Análisis IA de Madurez Digital"
          headerActions={
            <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
              IA Insight
            </span>
          }
        >
          <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-xl space-y-3.5 text-xs leading-normal">
            <p className="font-semibold text-slate-655">
              <strong className="text-slate-800">Prioridad: Asistencia RFID.</strong> La adopción de RFID está en 40%, lo que frena el control de deserción escolar predictivo automático. Se recomienda capacitar a coordinadores académicos de la Zona Norte.
            </p>
          </div>
        </SummaryCard>
      </div>

      {/* Tabla detallada */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-855">
          Detalle de Madurez Tecnológica por Plantel
        </h4>

        {/* Barra de Filtros */}
        <div className="bg-slate-50/20 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 min-w-[200px] flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 w-full">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar institución..."
              className="w-full text-xs font-semibold text-slate-800 px-2 bg-transparent focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1 w-full sm:w-44">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sector</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
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
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Nombre de la Institución</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Planeación Horaria</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Matrícula Digital</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Asistencia RFID</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Mallas Curriculares</TableHead>
                    <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Madurez Digital</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-50/50">
                      <TableCell className="py-3.5 align-middle text-xs font-bold text-slate-800">
                        {s.name}
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center text-xs font-semibold">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          s.horaria ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {s.horaria ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center text-xs font-semibold">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          s.matricula ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {s.matricula ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center text-xs font-semibold">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          s.rfid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {s.rfid ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center text-xs font-semibold">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          s.mallas ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {s.mallas ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 align-middle text-center">
                        <span className="text-xs font-black text-indigo-750 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                          {s.health}%
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
