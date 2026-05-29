'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  FileText,
  ArrowLeft,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Paperclip,
  Trash2,
  Mail,
  Megaphone,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useRole } from '@/providers/role-provider';
import { cn } from '@/lib/utils';

// ============================================================================
// ESTRUCTURA DE DATOS PARA LA PÁGINA DE DOCUMENTOS
// ============================================================================
interface DocumentItem {
  id: string;
  type: 'Boletín' | 'Circular' | 'Certificado' | 'Informe';
  title: string;
  recipients: string;
  date: string;
  status: 'Enviado' | 'Concluido';
}

interface MeetingItem {
  id: string;
  title: string;
  participants: string;
  date: string;
  time: string;
  mode: 'Presencial' | 'Virtual';
  status: 'Programada' | 'Concluida';
}

export default function DocumentosPage() {
  const { userRole, mounted } = useRole();

  // 1. Estados Locales de Documentos & Informes
  const [documentsList, setDocumentsList] = useState<DocumentItem[]>([
    { id: 'doc-1', type: 'Boletín', title: 'Boletines Académicos Período 2 - Grado 10-A', recipients: 'Padres de 10-A', date: '29 May', status: 'Concluido' },
    { id: 'doc-2', type: 'Circular', title: 'Circular Salida de Campo Pedagógica a Observatorio', recipients: 'Padres de 10-A, 11-B', date: '28 May', status: 'Enviado' },
    { id: 'doc-3', type: 'Certificado', title: 'Certificado de Matrícula Oficial - Pedro Ramírez', recipients: 'Acudiente Carlos Ortiz', date: '28 May', status: 'Concluido' },
    { id: 'doc-4', type: 'Informe', title: 'Informe de Asistencia RFID Consolidado P2', recipients: 'Rectoría / Coordinación', date: '25 May', status: 'Concluido' },
    { id: 'doc-5', type: 'Circular', title: 'Convocatoria a Escuela de Padres de Primaria', recipients: 'Padres de Primaria', date: '22 May', status: 'Concluido' }
  ]);

  // 2. Estados Locales de Reuniones
  const [meetingsList, setMeetingsList] = useState<MeetingItem[]>([
    { id: 'meet-1', title: 'Cita con Acudiente Carlos Ortiz', participants: 'Lic. Carlos Martínez • Acudiente', date: '2026-05-29', time: '02:00 PM', mode: 'Presencial', status: 'Programada' },
    { id: 'meet-2', title: 'Reunión General de Personal Administrativo', participants: 'Toda la Secretaría', date: '2026-05-30', time: '08:30 AM', mode: 'Presencial', status: 'Programada' },
    { id: 'meet-3', title: 'Comité de Convivencia Extraordinario Grado 9°', participants: 'Coord. Convivencia • Docentes', date: '2026-05-26', time: '11:00 AM', mode: 'Virtual', status: 'Concluida' },
    { id: 'meet-4', title: 'Inducción de Plataforma AulaCore a Docentes', participants: 'Todos los Docentes', date: '2026-05-15', time: '02:00 PM', mode: 'Virtual', status: 'Concluida' }
  ]);

  // 3. Pestaña Activa en Formulario Elaborar Comunicado
  const [formTab, setFormTab] = useState<'circular' | 'cita'>('circular');

  // Formulario Circular
  const [circularTitle, setCircularTitle] = useState('');
  const [circularRecipients, setCircularRecipients] = useState('Todos');
  const [circularContent, setCircularContent] = useState('');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  // Formulario Citación Cita
  const [meetTitle, setMeetTitle] = useState('');
  const [meetParticipants, setMeetParticipants] = useState('Padre Carlos Ortiz');
  const [meetMode, setMeetMode] = useState<'Presencial' | 'Virtual'>('Presencial');
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');

  // Soportes de subida mock de adjunto
  const handleAttachMockFile = () => {
    setAttachedFile('autorizacion_salida_campo_firmada.pdf');
  };

  const handleRemoveAttachedFile = () => {
    setAttachedFile(null);
  };

  // Enviar Nueva Circular
  const handlePublishCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!circularTitle.trim() || !circularContent.trim()) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      type: 'Circular',
      title: circularTitle.trim(),
      recipients: circularRecipients === 'Todos' ? 'Toda la Comunidad' : circularRecipients === 'Padres' ? 'Todos los Padres' : 'Todos los Docentes',
      date: 'Hoy',
      status: 'Enviado'
    };

    setDocumentsList([newDoc, ...documentsList]);
    setCircularTitle('');
    setCircularContent('');
    setAttachedFile(null);
    alert('✓ Circular publicada, enviada a los correos correspondientes y cargada en la base de datos.');
  };

  // Enviar Nueva Citación
  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetTitle.trim() || !meetDate || !meetTime) return;

    const newMeet: MeetingItem = {
      id: `meet-${Date.now()}`,
      title: meetTitle.trim(),
      participants: meetParticipants,
      date: meetDate,
      time: meetTime,
      mode: meetMode,
      status: 'Programada'
    };

    setMeetingsList([newMeet, ...meetingsList]);
    setMeetTitle('');
    setMeetDate('');
    setMeetTime('');
    alert(`✓ Citación oficial enviada exitosamente a los participantes para el día ${meetDate} a las ${meetTime}.`);
  };

  // Ciclar Estado de Documento
  const cycleDocStatus = (id: string) => {
    setDocumentsList(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, status: d.status === 'Enviado' ? 'Concluido' : 'Enviado' };
      }
      return d;
    }));
  };

  // Ciclar Estado de Cita
  const cycleMeetStatus = (id: string) => {
    setMeetingsList(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, status: m.status === 'Programada' ? 'Concluida' : 'Programada' };
      }
      return m;
    }));
  };

  if (!mounted) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // SI NO ES SECRETARIA, RENDERIZA PÁGINA ANTERIOR ESTÁNDAR
  if (userRole !== 'secretaria') {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-lg hover:bg-slate-100 cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Documentos & Certificados</h1>
              <p className="text-sm text-slate-500">Módulo Administrativo de Gestión de Expedición de Documentos</p>
            </div>
          </div>

          <Card className="p-8 border-slate-200 border-2 border-dashed bg-white">
            <div className="flex items-center gap-4 text-center w-full justify-center flex-col py-8">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h2 className="text-xl font-bold text-slate-900">Centro de Trámites y Certificados</h2>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Este módulo está totalmente integrado en la base de datos de AulaCore. Para experimentar las acciones interactivas de generación y descarga en caliente de certificados oficiales de matrícula, por favor dirígete al <span className="font-semibold text-amber-600">Dashboard Principal</span> en el menú lateral.
                </p>
                <Link href="/dashboard">
                  <Button className="mt-6 bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-5 py-2 cursor-pointer font-semibold shadow-sm transition">
                    Ir al Dashboard Principal
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // SI ES SECRETARIA, RENDERIZA EL INCREÍBLE GESTOR ADMINISTRATIVO DE COMUNICACIÓN
  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        
        {/* Cabecera de Página */}
        <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-150 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-lg hover:bg-slate-100 cursor-pointer border-none outline-none h-10 w-10">
                <ArrowLeft className="w-5 h-5 text-slate-650" />
              </Button>
            </Link>
            <div>
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest leading-none">Centro de Comunicaciones</span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Gestión Documental & Comunicados</h1>
              <p className="text-[13px] text-slate-500 mt-1">Elabora circulares oficiales, agenda citaciones y realiza trazabilidad de informes enviados.</p>
            </div>
          </div>
        </div>

        {/* KPIs DE TRAZABILIDAD COMPACTOS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
          <Card className="border-slate-200 shadow-sm bg-white rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Circulares Enviadas</span>
              <Megaphone className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-slate-800 tracking-tight">24</span>
              <p className="text-[9px] text-slate-400 font-bold mt-1">Enviados a padres y docentes</p>
            </div>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Citaciones Activas</span>
              <Calendar className="w-4.5 h-4.5 text-indigo-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-slate-800 tracking-tight">6</span>
              <p className="text-[9px] text-indigo-600 font-bold mt-1">Programadas para esta semana</p>
            </div>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informes Concluidos</span>
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-slate-800 tracking-tight">12</span>
              <p className="text-[9px] text-emerald-600 font-bold mt-1">Sincronizados en la base de datos</p>
            </div>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plantillas Guardadas</span>
              <FileText className="w-4.5 h-4.5 text-slate-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-slate-800 tracking-tight">5</span>
              <p className="text-[9px] text-slate-400 font-bold mt-1">Formatos de circular cargados</p>
            </div>
          </Card>
        </div>

        {/* CORE GRID DE DOS COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO "ELABORAR COMUNICADO" */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
              <CardHeader className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                    <Send className="w-4.5 h-4.5 text-amber-600" />
                    Elaborar Comunicado
                  </CardTitle>
                </div>

                {/* Alternador de formulario */}
                <div className="flex bg-slate-200 p-0.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider">
                  <button
                    onClick={() => setFormTab('circular')}
                    className={cn(
                      "px-2 py-1 rounded-md cursor-pointer transition border-none outline-none",
                      formTab === 'circular' ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-800 bg-transparent"
                    )}
                  >
                    Circular
                  </button>
                  <button
                    onClick={() => setFormTab('cita')}
                    className={cn(
                      "px-2 py-1 rounded-md cursor-pointer transition border-none outline-none",
                      formTab === 'cita' ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-800 bg-transparent"
                    )}
                  >
                    Citación Cita
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                
                {/* FORMULARIO 1: CREAR CIRCULAR */}
                {formTab === 'circular' && (
                  <form onSubmit={handlePublishCircular} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Título de la Circular</label>
                      <Input
                        type="text"
                        required
                        value={circularTitle}
                        onChange={(e) => setCircularTitle(e.target.value)}
                        placeholder="Ej. Convocatoria Salida Astronómica Grado Décimo"
                        className="rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-semibold h-9.5"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Destinatarios</label>
                      <select
                        value={circularRecipients}
                        onChange={(e) => setCircularRecipients(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm bg-white font-semibold focus:ring-2 focus:ring-amber-200 focus:outline-none cursor-pointer"
                      >
                        <option value="Todos">Toda la Comunidad (Padres y Docentes)</option>
                        <option value="Padres">Únicamente Padres y Acudientes</option>
                        <option value="Docentes">Únicamente Personal Docente</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Contenido del Comunicado</label>
                      <textarea
                        required
                        rows={4}
                        value={circularContent}
                        onChange={(e) => setCircularContent(e.target.value)}
                        placeholder="Escribe el cuerpo oficial de la circular informativa aquí..."
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white text-slate-700"
                      />
                    </div>

                    {/* Adjunto Mock */}
                    <div className="pt-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Archivo Adjunto</label>
                      {attachedFile ? (
                        <div className="bg-amber-50/60 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold text-amber-850">
                          <span className="flex items-center gap-1.5 truncate">
                            <Paperclip className="w-4 h-4 text-amber-600 shrink-0" />
                            {attachedFile}
                          </span>
                          <button 
                            type="button"
                            onClick={handleRemoveAttachedFile}
                            className="text-slate-400 hover:text-rose-600 bg-transparent border-none outline-none cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleAttachMockFile}
                          variant="outline"
                          className="w-full border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl py-2 h-auto text-xs font-bold gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          Adjuntar Documento Oficial (PDF)
                        </Button>
                      )}
                    </div>

                    <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-2.5 font-extrabold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition text-xs border-none outline-none mt-2">
                      <Megaphone className="w-4 h-4" /> Enviar Circular Oficial
                    </Button>
                  </form>
                )}

                {/* FORMULARIO 2: AGENDAR CITACIÓN CITA */}
                {formTab === 'cita' && (
                  <form onSubmit={handleScheduleMeeting} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Asunto de la Citación</label>
                      <Input
                        type="text"
                        required
                        value={meetTitle}
                        onChange={(e) => setMeetTitle(e.target.value)}
                        placeholder="Ej. Citación por Entrega de Documento de Identidad"
                        className="rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-semibold h-9.5"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Participante / Destinatario</label>
                      <select
                        value={meetParticipants}
                        onChange={(e) => setMeetParticipants(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm bg-white font-semibold focus:ring-2 focus:ring-amber-200 focus:outline-none cursor-pointer"
                      >
                        <option value="Acudiente Carlos Ortiz">Acudiente: Carlos Ortiz (Padre de Pedro)</option>
                        <option value="Acudiente Marta Restrepo">Acudiente: Marta Restrepo (Madre de Valentina)</option>
                        <option value="Docente Lic. Carlos Martínez">Docente: Lic. Carlos Martínez (Director 10-A)</option>
                        <option value="Todo el Equipo Docente">Todo el Equipo Docente</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Modalidad</label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setMeetMode('Presencial')}
                          className={cn(
                            "py-1.5 rounded-md cursor-pointer transition border-none outline-none",
                            meetMode === 'Presencial' ? "bg-white text-slate-800 shadow-3xs" : "text-slate-500 hover:text-slate-800 bg-transparent"
                          )}
                        >
                          Presencial
                        </button>
                        <button
                          type="button"
                          onClick={() => setMeetMode('Virtual')}
                          className={cn(
                            "py-1.5 rounded-md cursor-pointer transition border-none outline-none",
                            meetMode === 'Virtual' ? "bg-white text-slate-800 shadow-3xs" : "text-slate-500 hover:text-slate-800 bg-transparent"
                          )}
                        >
                          Virtual (Google Meet)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Fecha</label>
                        <Input
                          type="date"
                          required
                          value={meetDate}
                          onChange={(e) => setMeetDate(e.target.value)}
                          className="rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-semibold h-9.5"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Hora</label>
                        <Input
                          type="time"
                          required
                          value={meetTime}
                          onChange={(e) => setMeetTime(e.target.value)}
                          className="rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-semibold h-9.5"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-2.5 font-extrabold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition text-xs border-none outline-none mt-2">
                      <UserPlus className="w-4 h-4" /> Enviar Citación Oficial
                    </Button>
                  </form>
                )}

              </CardContent>
            </Card>
          </div>

          {/* COLUMNA DERECHA: TABLAS DE TRAZABILIDAD (spans 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TRAZABILIDAD DE DOCUMENTOS & INFORMES */}
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
              <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  Documentos & Informes (Enviados y Concluidos)
                </CardTitle>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">Control de boletines enviados, circulares y certificados sincronizados.</p>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto select-none">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-extrabold text-slate-700 text-xs pl-6">Documento</TableHead>
                      <TableHead className="font-extrabold text-slate-700 text-xs">Destinatarios</TableHead>
                      <TableHead className="font-extrabold text-slate-700 text-xs">Fecha</TableHead>
                      <TableHead className="font-extrabold text-slate-700 text-xs">Estado</TableHead>
                      <TableHead className="font-extrabold text-slate-700 text-xs pr-6 text-right">Acción Rápida</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentsList.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-6 py-3.5">
                          <span className={cn(
                            "text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded border block w-fit",
                            doc.type === 'Boletín' && "bg-blue-50 text-blue-700 border-blue-150",
                            doc.type === 'Circular' && "bg-purple-50 text-purple-700 border-purple-150",
                            doc.type === 'Certificado' && "bg-indigo-50 text-indigo-700 border-indigo-150",
                            doc.type === 'Informe' && "bg-emerald-50 text-emerald-700 border-emerald-150"
                          )}>
                            {doc.type}
                          </span>
                          <span className="font-bold text-slate-850 text-xs block mt-1.5 leading-snug">{doc.title}</span>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-750 text-xs">{doc.recipients}</TableCell>
                        <TableCell className="text-slate-400 font-bold text-xs">{doc.date}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border inline-block",
                            doc.status === 'Enviado' && "bg-blue-50 text-blue-750 border-blue-200 animate-pulse",
                            doc.status === 'Concluido' && "bg-emerald-50 text-emerald-750 border-emerald-200"
                          )}>
                            {doc.status}
                          </span>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button
                            onClick={() => cycleDocStatus(doc.id)}
                            variant="outline"
                            size="sm"
                            className="rounded-lg h-7 font-extrabold text-[10px] border-slate-200 hover:bg-slate-50 text-slate-650 gap-1 ml-auto cursor-pointer"
                          >
                            Ciclar Estado <RefreshCw className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* TRAZABILIDAD DE CITACIONES & REUNIONES */}
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
              <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  Próximas Reuniones & Citas
                </CardTitle>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">Control de citaciones de padres y reuniones institucionales programadas y concluidas.</p>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto select-none">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-extrabold text-slate-700 text-xs pl-6">Asunto / Cita</TableHead>
                      <TableHead className="font-extrabold text-slate-700 text-xs">Participantes</TableHead>
                      <TableHead className="font-extrabold text-slate-700 text-xs">Fecha / Hora</TableHead>
                      <TableHead className="font-extrabold text-slate-700 text-xs">Modalidad</TableHead>
                      <TableHead className="font-extrabold text-slate-700 text-xs">Estado</TableHead>
                      <TableHead className="font-extrabold text-slate-700 text-xs pr-6 text-right">Acción Rápida</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetingsList.map((meet) => (
                      <TableRow key={meet.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-6 py-3.5">
                          <span className="font-bold text-slate-800 text-xs block leading-snug">{meet.title}</span>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-650 text-xs">{meet.participants}</TableCell>
                        <TableCell className="py-3">
                          <span className="text-slate-850 font-bold text-xs block">{meet.date}</span>
                          <span className="text-slate-400 font-semibold text-[10px] block mt-0.5">{meet.time}</span>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border inline-block",
                            meet.mode === 'Presencial' ? "bg-slate-50 text-slate-650 border-slate-200" : "bg-blue-50 text-blue-750 border-blue-200"
                          )}>
                            {meet.mode}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border inline-block",
                            meet.status === 'Programada' && "bg-indigo-50 text-indigo-750 border-indigo-200 animate-pulse",
                            meet.status === 'Concluida' && "bg-slate-200/60 text-slate-600 border-slate-250"
                          )}>
                            {meet.status}
                          </span>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button
                            onClick={() => cycleMeetStatus(meet.id)}
                            variant="outline"
                            size="sm"
                            className="rounded-lg h-7 font-extrabold text-[10px] border-slate-200 hover:bg-slate-50 text-slate-650 gap-1 ml-auto cursor-pointer"
                          >
                            Ciclar Estado <RefreshCw className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    </AppLayout>
  );
}
