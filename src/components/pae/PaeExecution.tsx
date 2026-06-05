'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  ClipboardList, Utensils, QrCode, ShieldCheck, 
  MapPin, Clock, Camera, Plus, Check, X, AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  enrollment_number: string;
}

interface PaeBeneficiary {
  student_id: string;
  is_beneficiary: boolean;
  modality: string;
}

interface DailyDelivery {
  id: string;
  delivery_date: string;
  school_sede: string;
  school_shift: string;
  ration_type: string;
  scheduled_rations: number;
  delivered_rations: number;
  missing_rations: number;
  observaciones: string;
  photos: string[];
}

interface PaeExecutionProps {
  userRole: string;
  students: Student[];
  beneficiaries: PaeBeneficiary[];
  deliveries: DailyDelivery[];
  onSaveDeliveries: (data: DailyDelivery[]) => void;
  attendance: any[];
  onSaveAttendance: (data: any[]) => void;
  controls: any[];
  onSaveControls: (data: any[]) => void;
}

export function PaeExecution({
  userRole,
  students = [],
  beneficiaries = [],
  deliveries = [],
  onSaveDeliveries,
  attendance = [],
  onSaveAttendance,
  controls = [],
  onSaveControls
}: PaeExecutionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'deliveries' | 'attendance' | 'controls'>('deliveries');

  // Daily Delivery form states
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [delSede, setDelSede] = useState('Sede Principal Campestre');
  const [delShift, setDelShift] = useState('Única');
  const [delRation, setDelRation] = useState('Preparada en Sitio');
  const [delScheduled, setDelScheduled] = useState(320);
  const [delDelivered, setDelDelivered] = useState(320);
  const [delObs, setDelObs] = useState('');
  const [delPhotos, setDelPhotos] = useState<string[]>([]);
  const [newPhoto, setNewPhoto] = useState('');

  // Daily Attendance states
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attSede, setAttSede] = useState('Sede Principal Campestre');

  // Control checklists states
  const [isControlModalOpen, setIsControlModalOpen] = useState(false);
  const [controlType, setControlType] = useState('Control Gramaje');
  const [inspector, setInspector] = useState('');
  const [score, setScore] = useState(95);
  const [findings, setFindings] = useState('');
  const [plan, setPlan] = useState('');

  const canEdit = userRole === 'rector' || userRole === 'secretaria' || userRole === 'coordinador' || userRole === 'docente' || userRole === 'director_grupo';

  const sedes = ['Sede Principal Campestre', 'Sede Anexa Primaria'];
  const shifts = ['Mañana', 'Tarde', 'Única'];

  // --- DAILY DELIVERIES HANDLERS ---
  const handleOpenAddDelivery = () => {
    setDelSede('Sede Principal Campestre');
    setDelShift('Única');
    setDelRation('Preparada en Sitio');
    setDelScheduled(320);
    setDelDelivered(320);
    setDelObs('');
    setDelPhotos([]);
    setIsDeliveryModalOpen(true);
  };

  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const missing = Math.max(0, delScheduled - delDelivered);
    const newDel: DailyDelivery = {
      id: 'del-' + Date.now(),
      delivery_date: new Date().toISOString().split('T')[0],
      school_sede: delSede,
      school_shift: delShift,
      ration_type: delRation,
      scheduled_rations: delScheduled,
      delivered_rations: delDelivered,
      missing_rations: missing,
      observaciones: delObs,
      photos: delPhotos
    };

    const updated = [newDel, ...deliveries];
    onSaveDeliveries(updated);
    setIsDeliveryModalOpen(false);
    alert('✓ Entrega diaria registrada correctamente.');
  };

  const handleAddDelPhoto = () => {
    if (!newPhoto.trim()) return;
    setDelPhotos(prev => [...prev, newPhoto.trim()]);
    setNewPhoto('');
  };

  // --- DAILY ATTENDANCE HANDLERS ---
  // Only students that are active PAE beneficiaries
  const activePaeStudents = students.filter(s => {
    const b = beneficiaries.find(x => x.student_id === s.id);
    return b ? b.is_beneficiary : false;
  });

  const handleToggleAttendance = (studentId: string) => {
    if (!canEdit) return;
    const exists = attendance.some(a => a.student_id === studentId && a.attendance_date === attDate);
    
    let updated: any[];
    if (exists) {
      updated = attendance.map(a => 
        (a.student_id === studentId && a.attendance_date === attDate)
          ? { ...a, consumed: !a.consumed }
          : a
      );
    } else {
      const newAtt = {
        id: 'att-' + Date.now(),
        student_id: studentId,
        attendance_date: attDate,
        consumed: true
      };
      updated = [...attendance, newAtt];
    }
    onSaveAttendance(updated);
  };

  const isStudentAttended = (studentId: string) => {
    const record = attendance.find(a => a.student_id === studentId && a.attendance_date === attDate);
    // Defaults to false if no record, or returns consumed value
    return record ? record.consumed : false;
  };

  // --- CONTROLS CHECKLISTS HANDLERS ---
  const handleOpenAddControl = () => {
    setControlType('Control Gramaje');
    setInspector(userRole.toUpperCase());
    setScore(95);
    setFindings('');
    setPlan('');
    setIsControlModalOpen(true);
  };

  const handleSaveControl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const newControl = {
      id: 'ctrl-' + Date.now(),
      control_type: controlType,
      control_date: new Date().toISOString().split('T')[0],
      inspector_name: inspector,
      score_percentage: score,
      findings,
      action_plan: plan
    };

    const updated = [newControl, ...controls];
    onSaveControls(updated);
    setIsControlModalOpen(false);
    alert('✓ Auditoría/Planilla de control escolar registrada.');
  };

  return (
    <div className="space-y-6">
      
      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveSubTab('deliveries')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none whitespace-nowrap",
            activeSubTab === 'deliveries' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Entrega Diaria
        </button>
        <button
          onClick={() => setActiveSubTab('attendance')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none whitespace-nowrap",
            activeSubTab === 'attendance' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Planilla de Asistencia (Consumo)
        </button>
        <button
          onClick={() => setActiveSubTab('controls')}
          className={cn(
            "px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none whitespace-nowrap",
            activeSubTab === 'controls' ? "border-indigo-600 text-indigo-900 font-black" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Controles Sanitarios y Gramajes
        </button>
      </div>

      {/* --- SUBTAB: DELIVERIES --- */}
      {activeSubTab === 'deliveries' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-indigo-600" />
                Registros Diarios de Entrega de Raciones
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Control de cobertura del día y validación de raciones faltantes.</p>
            </div>
            {canEdit && (
              <Button onClick={handleOpenAddDelivery} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer">
                <Plus className="w-4 h-4" />
                Registrar Entrega Diaria
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Fecha</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Sede</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Jornada / Modalidad</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Raciones Programadas</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Entregadas</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Faltantes</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Observación / Fotos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="p-8 text-center text-xs text-slate-400 font-semibold">
                      No se registran entregas diarias en esta vigencia.
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveries.map((del) => (
                    <TableRow key={del.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold text-slate-950 text-xs pl-6">{del.delivery_date}</TableCell>
                      <TableCell className="font-black text-slate-800 text-xs">{del.school_sede}</TableCell>
                      <TableCell className="text-center text-xs font-semibold text-slate-600">
                        {del.school_shift} / {del.ration_type}
                      </TableCell>
                      <TableCell className="text-center font-bold text-slate-700 text-xs">{del.scheduled_rations}</TableCell>
                      <TableCell className="text-center font-extrabold text-emerald-600 text-xs">{del.delivered_rations}</TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold",
                          del.missing_rations > 0 ? "bg-rose-50 text-rose-800 border border-rose-200 animate-pulse" : "bg-slate-50 text-slate-500"
                        )}>
                          {del.missing_rations} raciones
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-right text-xs">
                        <div className="flex justify-end items-center gap-2">
                          <span className="text-slate-500 truncate max-w-xs font-medium" title={del.observaciones}>
                            {del.observaciones || 'Sin observaciones'}
                          </span>
                          {del.photos?.length > 0 && (
                            <button onClick={() => alert(`Evidencia de entrega: ${del.photos[0]}`)} className="text-indigo-600 hover:text-indigo-800 bg-transparent border-none cursor-pointer">
                              <Camera className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* --- SUBTAB: ATTENDANCE --- */}
      {activeSubTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Filtro de Asistencia */}
          <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden h-max">
            <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <CardTitle className="text-sm font-black text-slate-950 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Parámetros de Bitácora
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Fecha de Registro</label>
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Sede Educativa</label>
                <select
                  value={attSede}
                  onChange={(e) => setAttSede(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                >
                  {sedes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-200/50 p-4 rounded-2xl">
                <div className="flex gap-2">
                  <QrCode className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div className="leading-relaxed text-[11px] text-indigo-950">
                    <p className="font-black mb-1">Cruce Automatizado Asistencia QR/RFID</p>
                    Las raciones del día de hoy se asocian de forma automática con los registros IoT generados por los lectores RFID en portería.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listado de Beneficiarios para Marcar Consumo */}
          <Card className="lg:col-span-2 border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Control de Ración Servida ({attDate})
                </CardTitle>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Marque a continuación los estudiantes que recibieron y consumieron su ración PAE.</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Estudiante</TableHead>
                    <TableHead className="font-extrabold text-slate-800 text-xs">Matrícula</TableHead>
                    <TableHead className="font-extrabold text-slate-800 text-xs text-center pr-6 text-right">Ración Consumida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activePaeStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="p-8 text-center text-xs text-slate-400 font-semibold">
                        No hay beneficiarios PAE registrados en la sede seleccionada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activePaeStudents.map((s) => {
                      const attended = isStudentAttended(s.id);
                      return (
                        <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-black text-slate-950 text-sm pl-6">{s.first_name} {s.last_name}</TableCell>
                          <TableCell className="font-semibold text-slate-500 text-xs font-mono">{s.enrollment_number}</TableCell>
                          <TableCell className="pr-6 text-right">
                            <button
                              onClick={() => handleToggleAttendance(s.id)}
                              disabled={!canEdit}
                              className="bg-transparent border-none cursor-pointer outline-none"
                            >
                              {attended ? (
                                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-3 py-1 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider ml-auto w-max">
                                  <Check className="w-3.5 h-3.5" /> Entregado
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 bg-slate-50 text-slate-400 px-3 py-1 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-wider ml-auto w-max">
                                  <X className="w-3.5 h-3.5" /> Pendiente
                                </div>
                              )}
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- SUBTAB: CONTROLS --- */}
      {activeSubTab === 'controls' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                Registros de Gramajes y Verificación de Bodega
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Auditoría higiénica y de pesos promedio de raciones servidas.</p>
            </div>
            {canEdit && (
              <Button onClick={handleOpenAddControl} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer">
                <Plus className="w-4 h-4" />
                Nuevo Control / Lista Chequeo
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Fecha</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Tipo de Auditoría / Control</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Auditor / Inspector</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Resultado (% Cumplimiento)</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6">Hallazgos y Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {controls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-8 text-center text-xs text-slate-400 font-semibold">
                      No se registran auditorías de gramajes o bodega.
                    </TableCell>
                  </TableRow>
                ) : (
                  controls.map((ctrl) => (
                    <TableRow key={ctrl.id}>
                      <TableCell className="font-bold text-slate-950 text-xs pl-6">{ctrl.control_date}</TableCell>
                      <TableCell className="font-black text-slate-800 text-xs">{ctrl.control_type}</TableCell>
                      <TableCell className="font-semibold text-slate-600 text-xs">{ctrl.inspector_name}</TableCell>
                      <TableCell className="text-center font-bold text-xs">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full border text-[10px] font-black",
                          ctrl.score_percentage >= 90 ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"
                        )}>
                          {ctrl.score_percentage}%
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-xs font-medium text-slate-500 leading-relaxed max-w-sm truncate" title={ctrl.findings}>
                        {ctrl.findings || 'Cumplimiento óptimo. Sin hallazgos.'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* --- MODAL ADD CONTROL --- */}
      {isControlModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsControlModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSaveControl}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-indigo-600" />
                    Nuevo Control / Lista Chequeo
                  </h3>
                  <button type="button" onClick={() => setIsControlModalOpen(false)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Tipo de Auditoría / Lista</label>
                    <select
                      value={controlType}
                      onChange={(e) => setControlType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                    >
                      <option value="Control Gramaje">Control Gramaje (Porciones)</option>
                      <option value="Verificación Bodega">Verificación Bodega (Higiene)</option>
                      <option value="Lista Chequeo Comedor">Lista Chequeo Comedor (Orden)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Inspector / Auditor *</label>
                      <input
                        type="text"
                        value={inspector}
                        onChange={(e) => setInspector(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Resultado (% Cumplimiento) *</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) => setScore(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Hallazgos Detectados</label>
                    <textarea
                      rows={2}
                      placeholder="Escriba los problemas detectados en la auditoría..."
                      value={findings}
                      onChange={(e) => setFindings(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Plan de Acción / Compromisos</label>
                    <textarea
                      rows={2}
                      placeholder="Escriba las acciones correctivas..."
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" onClick={() => setIsControlModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                  Cancelar
                </Button>
                <Button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm cursor-pointer h-9 border-none">
                  Guardar Registro
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* --- MODAL ADD DELIVERY --- */}
      {isDeliveryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsDeliveryModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSaveDelivery}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-indigo-600" />
                    Registrar Entrega Diaria
                  </h3>
                  <button type="button" onClick={() => setIsDeliveryModalOpen(false)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Sede Educativa</label>
                      <select
                        value={delSede}
                        onChange={(e) => setDelSede(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        {sedes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Jornada</label>
                      <select
                        value={delShift}
                        onChange={(e) => setDelShift(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        {shifts.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Raciones Programadas *</label>
                      <input
                        type="number"
                        value={delScheduled}
                        onChange={(e) => setDelScheduled(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Raciones Entregadas *</label>
                      <input
                        type="number"
                        value={delDelivered}
                        onChange={(e) => setDelDelivered(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Modalidad / Tipo de Ración</label>
                    <select
                      value={delRation}
                      onChange={(e) => setDelRation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                    >
                      <option value="Preparada en Sitio">Preparada en Sitio (Caliente)</option>
                      <option value="Industrializada">Ración Industrializada</option>
                      <option value="Transportada">Ración Transportada</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Observaciones</label>
                    <textarea
                      rows={2}
                      placeholder="Reporte anomalías, faltantes, etc..."
                      value={delObs}
                      onChange={(e) => setDelObs(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none"
                    />
                  </div>

                  {/* Foto Evidencia */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Fotos de Evidencia (Lote / Acta)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ruta o nombre del archivo (Ej. foto_lote_012.jpg)..."
                        value={newPhoto}
                        onChange={(e) => setNewPhoto(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white text-xs h-9 font-semibold"
                      />
                      <Button type="button" onClick={handleAddDelPhoto} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-xl border-none cursor-pointer">
                        Adjuntar
                      </Button>
                    </div>
                    {delPhotos.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap pt-1">
                        {delPhotos.map((p, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1.5">
                            {p}
                            <button type="button" onClick={() => setDelPhotos(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" onClick={() => setIsDeliveryModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                  Cancelar
                </Button>
                <Button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm cursor-pointer h-9 border-none">
                  Registrar Entrega
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
