'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/territorio/Modal';
import { INITIAL_VISITS, MockVisit } from '@/services/territory-mock';
import { hasTerritoryPermission, getRbacControlAttrs } from '@/services/territory-rbac';
import { Calendar, User, Clock, CheckCircle, PlusCircle, CheckCircle2, Shield, Plus, X, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function TerritoryAgendaPage() {
  const [visits, setVisits] = useState<MockVisit[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentRole, setCurrentRole] = useState('Secretario de Educación');
  
  // Dynamic Activity Types state
  const [activityTypes, setActivityTypes] = useState<string[]>([
    'Capacitación AulaCore',
    'Auditoría PAE',
    'Inspección Conectividad',
    'Reunión de Rectores'
  ]);
  const [activityModal, setActivityModal] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');

  // Form states
  const [school, setSchool] = useState('Gimnasio Campestre AulaCore');
  const [type, setType] = useState('Capacitación AulaCore');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('08:00');
  const [duration, setDuration] = useState('2 horas');
  const [inspector, setInspector] = useState('');
  const [priority, setPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  
  const [success, setSuccess] = useState(false);

  // Leer cargo del usuario y escuchar cambios en la simulación
  useEffect(() => {
    setVisits(INITIAL_VISITS);

    function updateRole() {
      const saved = sessionStorage.getItem('simulated_role');
      if (saved) setCurrentRole(saved);
    }
    updateRole();
    window.addEventListener('rbac-role-changed', updateRole);
    return () => window.removeEventListener('rbac-role-changed', updateRole);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !inspector) return;

    if (!hasTerritoryPermission(currentRole, 'programar_visita')) {
      alert('Error: Su rol actual no tiene privilegios para registrar visitas.');
      return;
    }

    const newVisit: MockVisit = {
      id: Date.now().toString(),
      institution: school,
      type,
      date,
      time,
      duration,
      inspector,
      priority,
      status: 'Programada',
    };

    setVisits(prev => [newVisit, ...prev]);
    setDate('');
    setInspector('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityName.trim()) return;
    
    setActivityTypes(prev => [...prev, newActivityName.trim()]);
    setType(newActivityName.trim());
    setNewActivityName('');
    setActivityModal(false);
  };

  const filteredVisits = visits.filter(v => statusFilter === 'all' || v.status === statusFilter);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Finalizada': return 'bg-emerald-100 text-emerald-800';
      case 'En ejecución': return 'bg-blue-100 text-blue-800 animate-pulse';
      case 'Confirmada': return 'bg-indigo-100 text-indigo-800';
      case 'Programada': return 'bg-slate-100 text-slate-705';
      case 'Cancelada': return 'bg-rose-100 text-rose-800';
      case 'Reprogramada': return 'bg-amber-100 text-amber-850';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const hasAccess = hasTerritoryPermission(currentRole, 'programar_visita');
  const rbacAttrs = getRbacControlAttrs(currentRole, 'programar_visita');

  return (
    <div className="p-6 space-y-6 relative h-full">
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

      {/* Alerta de Restricción RBAC */}
      {!hasAccess && (
        <div className="bg-amber-50 border border-amber-250 p-4 rounded-2xl flex gap-3 text-amber-900 text-xs font-semibold">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
          <div>
            <span className="font-extrabold block">Acción Restringida por Cargo</span>
            Tu rol actual ({currentRole}) no cuenta con autorización para programar visitas técnicas en la agenda territorial.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <Card className={`border-slate-200 shadow-sm rounded-2xl bg-white h-fit transition-opacity duration-200 ${!hasAccess ? 'opacity-65' : ''}`}>
          <CardHeader className="border-b border-slate-100 py-4 px-6 bg-slate-50/20">
            <CardTitle className="text-sm font-black text-slate-855 uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-indigo-655" />
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
                  disabled={!hasAccess}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 disabled:bg-slate-50"
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
                <div className="flex gap-2">
                  <select
                    value={type}
                    disabled={!hasAccess}
                    onChange={(e) => setType(e.target.value)}
                    className="flex-1 text-xs font-semibold text-slate-800 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none disabled:bg-slate-50"
                  >
                    {activityTypes.map(act => (
                      <option key={act} value={act}>{act}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!hasAccess}
                    onClick={() => setActivityModal(true)}
                    className="px-3 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Añadir tipo de actividad"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inspector */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Funcionario Asignado
                </label>
                <input
                  type="text"
                  required
                  disabled={!hasAccess}
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                  placeholder="Ej: Ing. Laura Benítez"
                  className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none placeholder-slate-400 focus:border-indigo-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Fecha</label>
                  <input
                    type="date"
                    required
                    disabled={!hasAccess}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none disabled:bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Hora</label>
                  <input
                    type="time"
                    required
                    disabled={!hasAccess}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Duración y Prioridad */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Duración</label>
                  <select
                    value={duration}
                    disabled={!hasAccess}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none disabled:bg-slate-50"
                  >
                    <option value="1 hora">1 hora</option>
                    <option value="2 horas">2 horas</option>
                    <option value="4 horas">4 horas</option>
                    <option value="Todo el día">Todo el día</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Prioridad</label>
                  <select
                    value={priority}
                    disabled={!hasAccess}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs font-semibold text-slate-800 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none disabled:bg-slate-50"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              {/* Botón */}
              <button
                type="submit"
                {...rbacAttrs}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
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
              <option value="Confirmada">Confirmadas</option>
              <option value="En ejecución">En ejecución</option>
              <option value="Finalizada">Finalizadas</option>
              <option value="Cancelada">Canceladas</option>
              <option value="Reprogramada">Reprogramadas</option>
            </select>
          </div>

          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/40">
                    <TableRow>
                      <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Institución Educativa</TableHead>
                      <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Actividad</TableHead>
                      <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Fecha y Hora</TableHead>
                      <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Prioridad</TableHead>
                      <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11">Inspector</TableHead>
                      <TableHead className="font-bold text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map((visit) => (
                      <TableRow key={visit.id} className="hover:bg-slate-50/50">
                        <TableCell className="py-3.5 align-middle text-xs font-bold text-slate-800">
                          {visit.institution}
                        </TableCell>
                        <TableCell className="py-3.5 align-middle text-xs font-semibold text-indigo-755">
                          {visit.type}
                        </TableCell>
                        <TableCell className="py-3.5 align-middle text-xs font-bold text-slate-700">
                          {visit.date} a las {visit.time} ({visit.duration})
                        </TableCell>
                        <TableCell className="py-3.5 align-middle">
                          <span className={`text-[9px] font-black uppercase border px-2 py-0.5 rounded-md ${
                            visit.priority === 'Alta' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                            visit.priority === 'Media' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-550'
                          }`}>
                            {visit.priority}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 align-middle">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {visit.inspector}
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 align-middle text-center">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${getStatusBadgeClass(visit.status)}`}>
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

      {/* ➕ MODAL DINÁMICO PARA CREAR TIPO DE ACTIVIDAD */}
      <Modal
        isOpen={activityModal}
        onClose={() => setActivityModal(false)}
        title="Añadir Tipo de Actividad"
        subtitle="Agenda Territorial"
        footer={
          <>
            <button
              onClick={() => setActivityModal(false)}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 font-bold rounded-xl text-xs cursor-pointer text-slate-700 bg-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddActivity}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer border-none"
            >
              Guardar Tipo
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nombre de la Actividad</label>
            <input
              type="text"
              required
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              placeholder="Ej: Auditoría de Matrículas"
              className="w-full text-xs font-semibold text-slate-800 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none placeholder-slate-400"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
