'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Calendar, User, Clock, CheckCircle, PlusCircle, CheckCircle2, Shield } from 'lucide-react';

interface MockVisit {
  id: string;
  institution: string;
  type: 'Capacitación AulaCore' | 'Auditoría PAE' | 'Inspección Conectividad' | 'Reunión de Rectores';
  date: string;
  inspector: string;
  status: 'Programada' | 'En Progreso' | 'Realizada';
}

const INITIAL_VISITS: MockVisit[] = [
  { id: '1', institution: 'Institución Educativa Marco Fidel Suárez', type: 'Capacitación AulaCore', date: 'Julio 2, 2026', inspector: 'Ing. Laura Benítez', status: 'Programada' },
  { id: '2', institution: 'I.E. Rural El Hatillo', type: 'Inspección Conectividad', date: 'Julio 5, 2026', inspector: 'Téc. Fernando Ruiz', status: 'Programada' },
  { id: '3', institution: 'I.E. Presbítero Antonio José Bernal', type: 'Auditoría PAE', date: 'Hoy 9:00 AM', inspector: 'Dr. Daniel Rendón', status: 'En Progreso' },
  { id: '4', institution: 'Gimnasio Campestre AulaCore', type: 'Reunión de Rectores', date: 'Junio 25, 2026', inspector: 'Dr. Alejandro Gómez', status: 'Realizada' },
];

export default function TerritoryAgendaPage() {
  const [visits, setVisits] = useState<MockVisit[]>(INITIAL_VISITS);
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states
  const [school, setSchool] = useState('Gimnasio Campestre AulaCore');
  const [type, setType] = useState<any>('Capacitación AulaCore');
  const [date, setDate] = useState('');
  const [inspector, setInspector] = useState('');
  
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !inspector) return;

    const newVisit: MockVisit = {
      id: Date.now().toString(),
      institution: school,
      type,
      date,
      inspector,
      status: 'Programada',
    };

    setVisits(prev => [newVisit, ...prev]);
    setDate('');
    setInspector('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  const filteredVisits = visits.filter(v => statusFilter === 'all' || v.status === statusFilter);

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">
          Agenda Territorial
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Planificación y seguimiento de visitas técnicas, auditorías PAE y onboarding institucional del territorio.
        </p>
      </div>

      {/* Alerta de éxito */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-pulse">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          Nueva visita técnica programada con éxito en la agenda.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white h-fit">
          <CardHeader className="border-b border-slate-100 py-4 px-6 bg-slate-50/20">
            <CardTitle className="text-sm font-black text-slate-850 uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-indigo-650" />
              Programar Visita
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-455 mt-1">
              Asigne un técnico o auditor a una sede.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Institución */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Institución Educativa
                </label>
                <select
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="Gimnasio Campestre AulaCore">Gimnasio Campestre AulaCore</option>
                  <option value="I.E. Marco Fidel Suárez">I.E. Marco Fidel Suárez</option>
                  <option value="I.E. Presbítero Antonio Bernal">I.E. Presbítero Antonio Bernal</option>
                  <option value="I.E. Rural El Hatillo">I.E. Rural El Hatillo</option>
                  <option value="I.E. Técnico Industrial Pascual Bravo">I.E. Técnico Industrial Pascual Bravo</option>
                </select>
              </div>

              {/* Tipo Actividad */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Tipo de Actividad
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full text-xs font-semibold text-slate-800 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="Capacitación AulaCore">Capacitación AulaCore</option>
                  <option value="Auditoría PAE">Auditoría PAE</option>
                  <option value="Inspección Conectividad">Inspección Conectividad</option>
                  <option value="Reunión de Rectores">Reunión de Rectores</option>
                </select>
              </div>

              {/* Inspector */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Funcionario Asignado
                </label>
                <input
                  type="text"
                  required
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                  placeholder="Ej: Ing. Laura Benítez"
                  className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none placeholder-slate-400"
                />
              </div>

              {/* Fecha */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Fecha Programada
                </label>
                <input
                  type="text"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Ej: Julio 12, 2026"
                  className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none placeholder-slate-400"
                />
              </div>

              {/* Botón */}
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-none"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Registrar en Agenda
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Tabla de Visitas */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtros */}
          <div className="bg-slate-50/20 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">Filtrar visitas por estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold text-slate-800 px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="all">Todas las visitas</option>
              <option value="Programada">Programadas</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Realizada">Realizadas</option>
            </select>
          </div>

          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/40">
                    <TableRow>
                      <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Institución Educativa</TableHead>
                      <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Tipo de Actividad</TableHead>
                      <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Fecha y Hora</TableHead>
                      <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Inspector Asignado</TableHead>
                      <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map((visit) => (
                      <TableRow key={visit.id} className="hover:bg-slate-50/50">
                        <TableCell className="py-3.5 align-middle text-xs font-bold text-slate-800">
                          {visit.institution}
                        </TableCell>
                        <TableCell className="py-3.5 align-middle text-xs font-semibold text-indigo-750">
                          {visit.type}
                        </TableCell>
                        <TableCell className="py-3.5 align-middle text-xs font-bold text-slate-700">
                          {visit.date}
                        </TableCell>
                        <TableCell className="py-3.5 align-middle">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {visit.inspector}
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 align-middle text-center">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            visit.status === 'Realizada' ? 'bg-emerald-100 text-emerald-800' :
                            visit.status === 'En Progreso' ? 'bg-amber-100 text-amber-850 animate-pulse' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {visit.status}
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
    </div>
  );
}
