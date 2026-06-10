'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  Users, Calendar, FileText, Plus, 
  X, Check, Eye, HelpCircle, 
  Info, CalendarDays 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadPaeCommitteePDF, downloadPaeMesaPDF } from '@/lib/utils/PdfGenerator';

interface CommitteeMeeting {
  id: string;
  committee_type: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
  description: string;
  members: Array<{ name: string; role: string }>;
  decisions?: string;
  acta_pdf_url?: string;
  status: string;
}

interface PublicMesa {
  id: string;
  vigencia_year: string;
  mesa_number: number;
  meeting_date: string;
  attendees_count: number;
  compromisos?: string;
  acta_pdf_url?: string;
}

interface PaeCommitteesProps {
  userRole: string;
  meetings: CommitteeMeeting[];
  onSaveMeetings: (data: CommitteeMeeting[]) => void;
  mesas: PublicMesa[];
  onSaveMesas: (data: PublicMesa[]) => void;
}

export function PaeCommittees({
  userRole,
  meetings = [],
  onSaveMeetings,
  mesas = [],
  onSaveMesas
}: PaeCommitteesProps) {
  const [activeSubTab, setActiveSubTab] = useState<'committees' | 'mesas_publicas'>('committees');

  // Committee form states
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [comType, setComType] = useState('CAE');
  const [comDate, setComDate] = useState('2026-07-15');
  const [comTime, setComTime] = useState('09:00');
  const [comLoc, setComLoc] = useState('Sala de Juntas Rectoría');
  const [comDesc, setComDesc] = useState('');
  const [comDecisions, setComDecisions] = useState('');

  // Mesa Publica form states
  const [isMesaModalOpen, setIsMesaModalOpen] = useState(false);
  const [mesaYear, setMesaYear] = useState('2026');
  const [mesaNum, setMesaNum] = useState(1);
  const [mesaDate, setMesaDate] = useState('2026-08-20');
  const [mesaAttendees, setMesaAttendees] = useState(80);
  const [mesaCompromisos, setMesaCompromisos] = useState('');

  const canEdit = userRole === 'rector' || userRole === 'secretaria' || userRole === 'coordinador';

  const defaultCaeMembers = [
    { name: 'Dr. Ramón Ramírez', role: 'Rector / Presidente' },
    { name: 'Lic. Diana Carolina Reyes', role: 'Docente Responsable' },
    { name: 'Carlos Ortiz', role: 'Representante de Padres' },
    { name: 'Alejandro Ortiz', role: 'Representante de Estudiantes' }
  ];

  const defaultCopaeMembers = [
    { name: 'Dr. Ramón Ramírez', role: 'Rector' },
    { name: 'Dra. Claudia Marcela Pérez', role: 'Nutricionista Supervisor' },
    { name: 'Dra. Patricia Gómez Ruiz', role: 'Representante del Operador' }
  ];

  // --- MEETINGS HANDLERS ---
  const handleOpenAddMeeting = () => {
    setComType('CAE');
    setComDate('2026-07-15');
    setComTime('09:00');
    setComLoc('Sala de Juntas Rectoría');
    setComDesc('');
    setComDecisions('');
    setIsMeetingModalOpen(true);
  };

  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comLoc.trim() || !comDesc.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const targetMembers = comType === 'CAE' ? defaultCaeMembers : defaultCopaeMembers;
    
    const newMeet: CommitteeMeeting = {
      id: 'meet-' + Date.now(),
      committee_type: comType,
      meeting_date: comDate,
      meeting_time: comTime,
      location: comLoc,
      description: comDesc,
      members: targetMembers,
      decisions: comDecisions || undefined,
      status: comDecisions ? 'Realizado' : 'Planeado',
      acta_pdf_url: comDecisions ? `/actas/acta_${comType.toLowerCase()}_${Date.now()}.pdf` : undefined
    };

    const updated = [newMeet, ...meetings];
    onSaveMeetings(updated);
    setIsMeetingModalOpen(false);
    alert(`✓ Sesión de ${comType} registrada.`);
  };

  // --- MESAS PUBLICAS HANDLERS ---
  const handleSaveMesa = (e: React.FormEvent) => {
    e.preventDefault();
    if (mesaAttendees <= 0 || !mesaCompromisos.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const newMesa: PublicMesa = {
      id: 'mesa-' + Date.now(),
      vigencia_year: mesaYear,
      mesa_number: mesaNum,
      meeting_date: mesaDate,
      attendees_count: mesaAttendees,
      compromisos: mesaCompromisos,
      acta_pdf_url: `/actas/acta_mesa_publica_${mesaNum}_${mesaYear}.pdf`
    };

    const updated = [newMesa, ...mesas];
    onSaveMesas(updated);
    setIsMesaModalOpen(false);
    alert('✓ Mesa Pública PAE de Rendición de Cuentas registrada.');
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveSubTab('committees')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none",
            activeSubTab === 'committees' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Sesiones de Comités (CAE / COPAE)
        </button>
        <button
          onClick={() => setActiveSubTab('mesas_publicas')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none",
            activeSubTab === 'mesas_publicas' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Mesas Públicas Rendición Cuentas
        </button>
      </div>

      {/* --- SUBTAB: COMMITTEES --- */}
      {activeSubTab === 'committees' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Comité de Alimentación Escolar (CAE) y Comité Operativo
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Gestión de convocatorias, actas de acuerdos y seguimiento del programa (Periodicidad sugerida: cada 2 meses).</p>
            </div>
            {canEdit && (
              <Button onClick={handleOpenAddMeeting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer">
                <Plus className="w-4 h-4" /> Registrar Reunión Comité
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Tipo Comité</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Fecha y Hora</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Lugar / Sede</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Descripción / Agenda</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Estado</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Acta Digital</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.map((meet) => (
                  <TableRow key={meet.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-black text-slate-950 text-sm pl-6">{meet.committee_type}</TableCell>
                    <TableCell className="font-bold text-slate-700 text-xs">{meet.meeting_date} ({meet.meeting_time})</TableCell>
                    <TableCell className="font-semibold text-slate-600 text-xs">{meet.location}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-500 max-w-sm truncate" title={meet.description}>
                      {meet.description}
                    </TableCell>
                    <TableCell className="text-center font-bold text-xs">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded text-[10px] font-black border",
                        meet.status === 'Realizado' ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"
                      )}>
                        {meet.status}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {meet.acta_pdf_url ? (
                        <Button variant="ghost" className="h-8 text-xs font-bold text-indigo-650 hover:bg-indigo-50" onClick={() => downloadPaeCommitteePDF(meet)}>
                          Ver Acta
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Pendiente</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* --- SUBTAB: MESAS PUBLICAS --- */}
      {activeSubTab === 'mesas_publicas' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                Mesas Públicas de Control Social y Rendición de Cuentas
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Control de eventos de transparencia obligatorios (Mínimo dos por vigencia escolar).</p>
            </div>
            {canEdit && (
              <Button onClick={() => setIsMesaModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer">
                <Plus className="w-4 h-4" /> Registrar Mesa Pública
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Vigencia / Periodo</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Mesa No.</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Fecha del Evento</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Asistentes Totales</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Compromisos Claves</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Acta Mesa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mesas.map((mesa) => (
                  <TableRow key={mesa.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-black text-slate-955 text-sm pl-6">Vigencia {mesa.vigencia_year}</TableCell>
                    <TableCell className="text-center font-bold text-slate-700 text-xs">Mesa {mesa.mesa_number}</TableCell>
                    <TableCell className="font-bold text-slate-700 text-xs">{mesa.meeting_date}</TableCell>
                    <TableCell className="text-center font-extrabold text-slate-800 text-xs">{mesa.attendees_count} ciudadanos</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-500 max-w-sm truncate" title={mesa.compromisos}>
                      {mesa.compromisos}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {mesa.acta_pdf_url ? (
                        <Button variant="ghost" className="h-8 text-xs font-bold text-indigo-650 hover:bg-indigo-50" onClick={() => downloadPaeMesaPDF(mesa)}>
                          Ver Acta
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Pendiente</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* --- MODAL ADD COMMITTEE MEETING --- */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsMeetingModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSaveMeeting}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Registrar Sesión de Comité
                  </h3>
                  <button type="button" onClick={() => setIsMeetingModalOpen(false)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Tipo de Comité</label>
                      <select
                        value={comType}
                        onChange={(e) => setComType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        <option value="CAE">CAE (Alimentación Escolar)</option>
                        <option value="Comité Operativo">Comité Operativo PAE</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Lugar / Sede *</label>
                      <input
                        type="text"
                        value={comLoc}
                        onChange={(e) => setComLoc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Fecha Reunión</label>
                      <input
                        type="date"
                        value={comDate}
                        onChange={(e) => setComDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Hora Reunión</label>
                      <input
                        type="time"
                        value={comTime}
                        onChange={(e) => setComTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Orden del Día / Agenda *</label>
                    <textarea
                      rows={3}
                      placeholder="Describa los puntos a tratar en la agenda..."
                      value={comDesc}
                      onChange={(e) => setComDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Acuerdos y Decisiones (Opcional - Si ya se realizó)</label>
                    <textarea
                      rows={2}
                      placeholder="Escriba los compromisos pactados en la sesión..."
                      value={comDecisions}
                      onChange={(e) => setComDecisions(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" onClick={() => setIsMeetingModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                  Cancelar
                </Button>
                <Button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm cursor-pointer h-9 border-none">
                  Guardar Sesión
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* --- MODAL ADD MESA PUBLICA --- */}
      {isMesaModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsMesaModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSaveMesa}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-indigo-600" />
                    Registrar Mesa Pública PAE
                  </h3>
                  <button type="button" onClick={() => setIsMesaModalOpen(false)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Vigencia Anual</label>
                      <input
                        type="text"
                        value={mesaYear}
                        onChange={(e) => setMesaYear(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Mesa Número *</label>
                      <select
                        value={mesaNum}
                        onChange={(e) => setMesaNum(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        <option value={1}>Primera Mesa Pública</option>
                        <option value={2}>Segunda Mesa Pública</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Fecha del Evento *</label>
                      <input
                        type="date"
                        value={mesaDate}
                        onChange={(e) => setMesaDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Cantidad Asistentes *</label>
                      <input
                        type="number"
                        min="1"
                        value={mesaAttendees}
                        onChange={(e) => setMesaAttendees(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Compromisos Claves Acordados *</label>
                    <textarea
                      rows={3}
                      placeholder="Describa a detalle las peticiones ciudadanas y compromisos correctivos acordados..."
                      value={mesaCompromisos}
                      onChange={(e) => setMesaCompromisos(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" onClick={() => setIsMesaModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                  Cancelar
                </Button>
                <Button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm cursor-pointer h-9 border-none">
                  Guardar Mesa Pública
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
