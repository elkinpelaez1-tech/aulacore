'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  Plus, Trash2, Edit2, Users, Save, X, Eye, 
  Mail, Phone, FileText, Calendar, Clock, MapPin, 
  Send, Check, AlertCircle, Info, ClipboardList, 
  CheckSquare2, Paperclip, FileSpreadsheet, Image, 
  CalendarPlus, ShieldAlert, KeyRound, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GovernmentMember {
  id: string;
  body_type: string;
  member_name: string;
  role_title: string;
  period: string;
  document_number?: string;
  email?: string;
  phone?: string;
}

interface Convocatoria {
  id: string;
  title: string;
  body_type: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
  description: string;
  attachments: string[];
  status: string;
  recipients: Array<{ name: string; email: string; phone: string; status: string }>;
  sent_at?: string;
  calendar_event_id?: string;
}

interface Meeting {
  id: string;
  convocatoria_id?: string;
  title: string;
  body_type: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
  description: string;
  attendance: Array<{ member_id: string; name: string; role_title: string; attended: boolean }>;
  status: string;
  decisions: string;
  evidences: string[];
  calendar_event_id?: string;
}

interface Acta {
  id: string;
  meeting_id?: string;
  acta_number: string;
  content: string;
  pdf_url?: string;
  evidences: string[];
  signers: Array<{ name: string; role_title: string; signed: boolean; signed_at?: string }>;
  status: string;
}

interface PeiSchoolGovernmentProps {
  userRole: string;
  members: GovernmentMember[];
  onSave: (members: GovernmentMember[]) => void;
  convocatorias: Convocatoria[];
  onSaveConvocatorias: (convocatorias: Convocatoria[]) => void;
  meetings: Meeting[];
  onSaveMeetings: (meetings: Meeting[]) => void;
  actas: Acta[];
  onSaveActas: (actas: Acta[]) => void;
}

export function PeiSchoolGovernment({
  userRole,
  members,
  onSave,
  convocatorias,
  onSaveConvocatorias,
  meetings,
  onSaveMeetings,
  actas,
  onSaveActas
}: PeiSchoolGovernmentProps) {
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'convocatorias' | 'meetings' | 'actas'>('members');
  
  // Members states
  const [localMembers, setLocalMembers] = useState<GovernmentMember[]>(members);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<GovernmentMember | null>(null);
  const [editingMember, setEditingMember] = useState<GovernmentMember | null>(null);
  const [memberName, setMemberName] = useState('');
  const [bodyType, setBodyType] = useState('Consejo Directivo');
  const [roleTitle, setRoleTitle] = useState('');
  const [period, setPeriod] = useState('2026');
  const [docNumber, setDocNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Convocatorias states
  const [localConvs, setLocalConvs] = useState<Convocatoria[]>(convocatorias);
  const [isConvModalOpen, setIsConvModalOpen] = useState(false);
  const [convTitle, setConvTitle] = useState('');
  const [convBodyType, setConvBodyType] = useState('Consejo Directivo');
  const [convDate, setConvDate] = useState('2026-06-15');
  const [convTime, setConvTime] = useState('10:00');
  const [convLocation, setConvLocation] = useState('Sala de Juntas Rectoría');
  const [convDesc, setConvDesc] = useState('');
  const [convAttachments, setConvAttachments] = useState<string[]>([]);
  const [newAttachment, setNewAttachment] = useState('');
  const [createCalendarEvent, setCreateCalendarEvent] = useState(true);

  // Reuniones states
  const [localMeetings, setLocalMeetings] = useState<Meeting[]>(meetings);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [meetTitle, setMeetTitle] = useState('');
  const [meetBodyType, setMeetBodyType] = useState('Consejo Directivo');
  const [meetDate, setMeetDate] = useState('2026-06-15');
  const [meetTime, setMeetTime] = useState('10:00');
  const [meetLocation, setMeetLocation] = useState('Sala de Juntas Rectoría');
  const [meetDesc, setMeetDesc] = useState('');
  const [meetDecisions, setMeetDecisions] = useState('');
  const [meetAttendance, setMeetAttendance] = useState<Meeting['attendance']>([]);
  const [meetEvidences, setMeetEvidences] = useState<string[]>([]);
  const [newMeetEvidence, setNewMeetEvidence] = useState('');

  // Actas states
  const [localActas, setLocalActas] = useState<Acta[]>(actas);
  const [isActaModalOpen, setIsActaModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [actaNumber, setActaNumber] = useState('');
  const [actaContent, setActaContent] = useState('');
  const [actaSigners, setActaSigners] = useState<Acta['signers']>([]);
  const [actaEvidences, setActaEvidences] = useState<string[]>([]);
  const [newActaEvidence, setNewActaEvidence] = useState('');

  const canEdit = userRole === 'rector' || userRole === 'secretaria' || userRole === 'coordinador';
  const canDelete = userRole === 'rector';

  const bodyTypes = [
    'Rector',
    'Consejo Directivo',
    'Consejo Académico',
    'Consejo Estudiantil',
    'Personero',
    'Contralor Escolar',
    'Consejo de Padres'
  ];

  // Sincronizar estados locales cuando cambian las props
  useEffect(() => { setLocalMembers(members); }, [members]);
  useEffect(() => { setLocalConvs(convocatorias); }, [convocatorias]);
  useEffect(() => { setLocalMeetings(meetings); }, [meetings]);
  useEffect(() => { setLocalActas(actas); }, [actas]);

  // --- MEMBERS HANDLERS ---
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setBodyType('Consejo Directivo');
    setMemberName('');
    setRoleTitle('');
    setPeriod('2026');
    setDocNumber('');
    setEmail('');
    setPhone('');
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (member: GovernmentMember) => {
    setEditingMember(member);
    setBodyType(member.body_type);
    setMemberName(member.member_name);
    setRoleTitle(member.role_title);
    setPeriod(member.period);
    setDocNumber(member.document_number || '');
    setEmail(member.email || '');
    setPhone(member.phone || '');
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!memberName.trim() || !roleTitle.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    let updated: GovernmentMember[];
    if (editingMember) {
      updated = localMembers.map(m => 
        m.id === editingMember.id 
          ? { 
              ...m, 
              body_type: bodyType, 
              member_name: memberName, 
              role_title: roleTitle, 
              period, 
              document_number: docNumber, 
              email, 
              phone 
            } 
          : m
      );
    } else {
      const newMember: GovernmentMember = {
        id: 'gov-' + Date.now(),
        body_type: bodyType,
        member_name: memberName,
        role_title: roleTitle,
        period,
        document_number: docNumber,
        email,
        phone
      };
      updated = [...localMembers, newMember];
    }

    setLocalMembers(updated);
    onSave(updated);
    setIsMemberModalOpen(false);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (!canDelete) return;
    if (confirm(`¿Está seguro de remover a ${name} del Gobierno Escolar?`)) {
      const updated = localMembers.filter(m => m.id !== id);
      setLocalMembers(updated);
      onSave(updated);
    }
  };

  // --- CONVOCATORIAS HANDLERS ---
  const filteredConvsRecipients = localMembers.filter(m => m.body_type === convBodyType);

  const handleOpenAddConv = () => {
    setConvTitle('');
    setConvBodyType('Consejo Directivo');
    setConvDate('2026-06-15');
    setConvTime('10:00');
    setConvLocation('Sala de Juntas Rectoría');
    setConvDesc('');
    setConvAttachments([]);
    setCreateCalendarEvent(true);
    setIsConvModalOpen(true);
  };

  const handleAddConvAttachment = () => {
    if (!newAttachment.trim()) return;
    setConvAttachments(prev => [...prev, newAttachment.trim()]);
    setNewAttachment('');
  };

  const handleRemoveConvAttachment = (idx: number) => {
    setConvAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveConv = (status: 'Planeada' | 'Enviada') => {
    if (!convTitle.trim() || !convLocation.trim()) {
      alert('Por favor complete los campos obligatorios de la convocatoria.');
      return;
    }

    // Identificar destinatarios automáticamente
    const targetRecipients = localMembers
      .filter(m => m.body_type === convBodyType)
      .map(m => ({
        name: m.member_name,
        email: m.email || 'correo@sinregistro.com',
        phone: m.phone || 'N/A',
        status: status === 'Enviada' ? 'Enviado' : 'Pendiente'
      }));

    const newConv: Convocatoria = {
      id: 'conv-' + Date.now(),
      title: convTitle,
      body_type: convBodyType,
      meeting_date: convDate,
      meeting_time: convTime,
      location: convLocation,
      description: convDesc,
      attachments: convAttachments,
      status,
      recipients: targetRecipients,
      sent_at: status === 'Enviada' ? new Date().toISOString() : undefined,
      calendar_event_id: createCalendarEvent ? 'cal-' + Date.now() : undefined
    };

    const updated = [newConv, ...localConvs];
    setLocalConvs(updated);
    onSaveConvocatorias(updated);
    setIsConvModalOpen(false);

    let alertMsg = `✓ Convocatoria guardada en estado ${status}.`;
    if (status === 'Enviada') {
      alertMsg += `\n📧 Simulación: 5 correos salientes en cola hacia ${convBodyType}.`;
      alertMsg += `\n💬 Simulación: Envío a WhatsApp Business preparado para API webhook.`;
    }
    if (createCalendarEvent) {
      alertMsg += `\n📅 Calendario: Evento institucional creado en Calendario Escolar de AulaCore.`;
    }
    alert(alertMsg);
  };

  // --- REUNIONES HANDLERS ---
  const handleOpenAddMeeting = () => {
    setSelectedConvId('');
    setMeetTitle('');
    setMeetBodyType('Consejo Directivo');
    setMeetDate('2026-06-15');
    setMeetTime('10:00');
    setMeetLocation('Sala de Juntas Rectoría');
    setMeetDesc('');
    setMeetDecisions('');
    setMeetEvidences([]);
    
    // Asignar lista de asistencia por defecto
    const defaultAttendance = localMembers
      .filter(m => m.body_type === 'Consejo Directivo')
      .map(m => ({ member_id: m.id, name: m.member_name, role_title: m.role_title, attended: true }));
    setMeetAttendance(defaultAttendance);

    setIsMeetingModalOpen(true);
  };

  const handleConvSelectForMeeting = (convId: string) => {
    setSelectedConvId(convId);
    if (!convId) return;

    const conv = localConvs.find(c => c.id === convId);
    if (conv) {
      setMeetTitle(conv.title);
      setMeetBodyType(conv.body_type);
      setMeetDate(conv.meeting_date);
      setMeetTime(conv.meeting_time);
      setMeetLocation(conv.location);
      setMeetDesc(conv.description);

      // Cargar lista de integrantes vinculados
      const groupMembers = localMembers
        .filter(m => m.body_type === conv.body_type)
        .map(m => ({ member_id: m.id, name: m.member_name, role_title: m.role_title, attended: true }));
      setMeetAttendance(groupMembers);
    }
  };

  const handleToggleAttendance = (memberId: string) => {
    setMeetAttendance(prev => prev.map(a => 
      a.member_id === memberId ? { ...a, attended: !a.attended } : a
    ));
  };

  const handleAddMeetEvidence = () => {
    if (!newMeetEvidence.trim()) return;
    setMeetEvidences(prev => [...prev, newMeetEvidence.trim()]);
    setNewMeetEvidence('');
  };

  const handleRemoveMeetEvidence = (idx: number) => {
    setMeetEvidences(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetTitle.trim()) {
      alert('Por favor especifique el título de la reunión.');
      return;
    }

    const newMeeting: Meeting = {
      id: 'meet-' + Date.now(),
      convocatoria_id: selectedConvId || undefined,
      title: meetTitle,
      body_type: meetBodyType,
      meeting_date: meetDate,
      meeting_time: meetTime,
      location: meetLocation,
      description: meetDesc,
      attendance: meetAttendance,
      status: 'Realizada',
      decisions: meetDecisions,
      evidences: meetEvidences
    };

    // Si seleccionamos una convocatoria, la marcamos como "Realizada" en el historial
    if (selectedConvId) {
      const updatedConvs = localConvs.map(c => 
        c.id === selectedConvId ? { ...c, status: 'Realizada' } : c
      );
      setLocalConvs(updatedConvs);
      onSaveConvocatorias(updatedConvs);
    }

    const updatedMeetings = [newMeeting, ...localMeetings];
    setLocalMeetings(updatedMeetings);
    onSaveMeetings(updatedMeetings);
    setIsMeetingModalOpen(false);
    alert('✓ Reunión formalizada. Asistencia y evidencias guardadas.');
  };

  // --- ACTAS HANDLERS ---
  const handleOpenAddActa = () => {
    setSelectedMeetingId('');
    setActaNumber(`Acta No. CD-00${localActas.length + 1}-2026`);
    setActaContent('');
    setActaEvidences([]);
    
    // Obtener firmantes de prueba
    setActaSigners([]);
    setIsActaModalOpen(true);
  };

  const handleMeetingSelectForActa = (meetId: string) => {
    setSelectedMeetingId(meetId);
    if (!meetId) return;

    const meet = localMeetings.find(m => m.id === meetId);
    if (meet) {
      // Los firmantes son los integrantes que asistieron a la reunión
      const signersList = meet.attendance
        .filter(a => a.attended)
        .map(a => ({ name: a.name, role_title: a.role_title, signed: false }));
      setActaSigners(signersList);
    }
  };

  const handleToggleSignActa = (idx: number) => {
    setActaSigners(prev => prev.map((s, i) => 
      i === idx ? { ...s, signed: !s.signed, signed_at: !s.signed ? new Date().toISOString() : undefined } : s
    ));
  };

  const handleAddActaEvidence = () => {
    if (!newActaEvidence.trim()) return;
    setActaEvidences(prev => [...prev, newActaEvidence.trim()]);
    setNewActaEvidence('');
  };

  const handleRemoveActaEvidence = (idx: number) => {
    setActaEvidences(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveActa = (status: 'Borrador' | 'Firmada' | 'Publicada') => {
    if (!actaNumber.trim() || !selectedMeetingId) {
      alert('Por favor seleccione la reunión y complete el número de acta.');
      return;
    }

    const newActa: Acta = {
      id: 'acta-' + Date.now(),
      meeting_id: selectedMeetingId,
      acta_number: actaNumber,
      content: actaContent,
      pdf_url: `/actas/${actaNumber.toLowerCase().replace(/ /g, '_')}.pdf`,
      evidences: actaEvidences,
      signers: actaSigners,
      status
    };

    const updated = [newActa, ...localActas];
    setLocalActas(updated);
    onSaveActas(updated);
    setIsActaModalOpen(false);
    alert(`✓ Acta guardada en estado: ${status}.`);
  };

  // Helper para renderizar iconos de archivos
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return <Image className="w-4 h-4 text-orange-500" />;
    if (ext === 'pdf') return <FileText className="w-4 h-4 text-red-500" />;
    return <Paperclip className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation (Premium Stripe Control) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveSubTab('members')}
          className={cn(
            "px-5 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none",
            activeSubTab === 'members'
              ? "border-indigo-600 text-indigo-900 font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Integrantes
        </button>
        <button
          onClick={() => setActiveSubTab('convocatorias')}
          className={cn(
            "px-5 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none",
            activeSubTab === 'convocatorias'
              ? "border-indigo-600 text-indigo-900 font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Convocatorias
        </button>
        <button
          onClick={() => setActiveSubTab('meetings')}
          className={cn(
            "px-5 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none",
            activeSubTab === 'meetings'
              ? "border-indigo-600 text-indigo-900 font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Reuniones
        </button>
        <button
          onClick={() => setActiveSubTab('actas')}
          className={cn(
            "px-5 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer outline-none",
            activeSubTab === 'actas'
              ? "border-indigo-600 text-indigo-900 font-black"
              : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Actas de Reunión
        </button>
      </div>

      {/* --- SUBTAB: MEMBERS (INTEGRANTES) --- */}
      {activeSubTab === 'members' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Integrantes del Gobierno Escolar
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Organigrama y miembros activos de los consejos y comités de gobierno escolar.
              </p>
            </div>
            {canEdit && (
              <Button
                onClick={handleOpenAddMember}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Registrar Integrante
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {!canEdit && (
              <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-650 font-semibold">
                ⚠️ Tienes acceso de solo lectura. Solo los roles directivos pueden registrar o modificar integrantes.
              </div>
            )}
            {canEdit && !canDelete && (
              <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-amber-700 font-semibold">
                ℹ️ Rol Secretaría / Coordinador: Tienes permisos para crear y editar, pero el Rector retiene los privilegios exclusivos para eliminar registros.
              </div>
            )}

            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Estamento / Órgano</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Integrante</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Cargo Asignado</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Periodo Lectivo</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-8 text-center text-xs text-slate-400 font-semibold">
                      No se registran integrantes en el Gobierno Escolar de este año lectivo.
                    </TableCell>
                  </TableRow>
                ) : (
                  localMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-black text-slate-950 text-sm pl-6">{member.body_type}</TableCell>
                      <TableCell className="font-semibold text-slate-700 text-xs">{member.member_name}</TableCell>
                      <TableCell className="text-xs text-slate-500 font-medium">{member.role_title}</TableCell>
                      <TableCell className="text-center font-extrabold text-slate-800 text-xs">{member.period}</TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => setViewingMember(member)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-lg text-indigo-600 hover:bg-indigo-50"
                            title="Ver Ficha de Detalle"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {canEdit && (
                            <Button
                              onClick={() => handleOpenEditMember(member)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:bg-slate-100"
                              title="Editar Integrante"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              onClick={() => handleDeleteMember(member.id, member.member_name)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-50"
                              title="Eliminar Integrante"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
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

      {/* --- SUBTAB: CONVOCATORIAS --- */}
      {activeSubTab === 'convocatorias' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Convocatorias Oficiales
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Citaciones institucionales emitidas y control de trazabilidad de entrega.
              </p>
            </div>
            {canEdit && (
              <Button
                onClick={handleOpenAddConv}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Crear Convocatoria
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Asunto / Título</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Órgano Convocado</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Fecha Reunión</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Destinatarios</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Estado</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Adjuntos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localConvs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-8 text-center text-xs text-slate-400 font-semibold">
                      No se registran convocatorias emitidas.
                    </TableCell>
                  </TableRow>
                ) : (
                  localConvs.map((conv) => (
                    <TableRow key={conv.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-black text-slate-950 text-sm pl-6">
                        <div className="flex flex-col">
                          <span>{conv.title}</span>
                          {conv.sent_at && (
                            <span className="text-[9px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                              <Send className="w-2.5 h-2.5" /> Convocado el {new Date(conv.sent_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700 text-xs">{conv.body_type}</TableCell>
                      <TableCell className="font-semibold text-slate-700 text-xs">
                        <div className="flex flex-col">
                          <span>{conv.meeting_date}</span>
                          <span className="text-[9px] text-slate-400 font-semibold mt-0.5">{conv.meeting_time} ({conv.location})</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-slate-700 text-xs">
                        {conv.recipients?.length || 0} miembros
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                          conv.status === 'Enviada' && "bg-blue-50 text-blue-800 border-blue-200",
                          conv.status === 'Realizada' && "bg-emerald-50 text-emerald-800 border-emerald-200",
                          conv.status === 'Planeada' && "bg-slate-100 text-slate-500 border-slate-200"
                        )}>
                          {conv.status}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {conv.attachments?.map((att, idx) => (
                            <div key={idx} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer" title={att.split('/').pop()}>
                              {getFileIcon(att)}
                            </div>
                          ))}
                          {conv.attachments?.length === 0 && <span className="text-slate-400 text-[10px] italic">Ninguno</span>}
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

      {/* --- SUBTAB: REUNIONES --- */}
      {activeSubTab === 'meetings' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                Historial de Reuniones y Asistencia
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Seguimiento de sesiones presenciales, quorum de asistencia y evidencias de decisiones.
              </p>
            </div>
            {canEdit && (
              <Button
                onClick={handleOpenAddMeeting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Formalizar Reunión
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Sesión / Órgano</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Fecha y Lugar</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Asistencia (Quorum)</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Principales Decisiones</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Evidencias Adjuntas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localMeetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-8 text-center text-xs text-slate-400 font-semibold">
                      No se registran reuniones culminadas.
                    </TableCell>
                  </TableRow>
                ) : (
                  localMeetings.map((meet) => {
                    const attendedCount = meet.attendance?.filter(a => a.attended).length || 0;
                    const totalCount = meet.attendance?.length || 0;
                    return (
                      <TableRow key={meet.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-black text-slate-950 text-sm pl-6">
                          <div className="flex flex-col">
                            <span>{meet.title}</span>
                            <span className="text-[9px] text-slate-400 font-semibold mt-0.5 bg-slate-100 text-slate-600 px-2 py-0.5 rounded w-max">
                              {meet.body_type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700 text-xs">
                          <div className="flex flex-col">
                            <span>{meet.meeting_date} - {meet.meeting_time}</span>
                            <span className="text-[9px] text-slate-400 font-semibold mt-0.5">{meet.location}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-xs">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px]",
                            attendedCount / totalCount >= 0.5 ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
                          )}>
                            {attendedCount} / {totalCount} ({totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0}%)
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-medium max-w-sm truncate leading-snug" title={meet.decisions}>
                          {meet.decisions}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {meet.evidences?.map((ev, idx) => (
                              <div key={idx} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer" title={ev.split('/').pop()}>
                                {getFileIcon(ev)}
                              </div>
                            ))}
                            {meet.evidences?.length === 0 && <span className="text-slate-400 text-[10px] italic">Ninguna</span>}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* --- SUBTAB: ACTAS --- */}
      {activeSubTab === 'actas' && (
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Actas Oficiales y Firmas
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Registro inmutable de actas, formalización y firmas del Consejo.
              </p>
            </div>
            {canEdit && (
              <Button
                onClick={handleOpenAddActa}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md border-none cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Registrar Acta
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Número Acta</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Reunión Asociada</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Firmas Completadas</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Estado</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Anexos / Evidencias</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localActas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-8 text-center text-xs text-slate-400 font-semibold">
                      No se registran actas archivadas.
                    </TableCell>
                  </TableRow>
                ) : (
                  localActas.map((acta) => {
                    const signedCount = acta.signers?.filter(s => s.signed).length || 0;
                    const totalSigners = acta.signers?.length || 0;
                    const meet = localMeetings.find(m => m.id === acta.meeting_id);
                    return (
                      <TableRow key={acta.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-black text-slate-950 text-sm pl-6">{acta.acta_number}</TableCell>
                        <TableCell className="font-semibold text-slate-700 text-xs">
                          {meet ? meet.title : 'Reunión Externa'}
                        </TableCell>
                        <TableCell className="font-bold text-xs">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px]",
                            signedCount === totalSigners ? "bg-emerald-50 text-emerald-800 border border-emerald-250" : "bg-slate-50 text-slate-700 border border-slate-200"
                          )}>
                            {signedCount} de {totalSigners} firmas ({totalSigners > 0 ? Math.round((signedCount / totalSigners) * 100) : 0}%)
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                            acta.status === 'Firmada' && "bg-emerald-50 text-emerald-800 border-emerald-200",
                            acta.status === 'Publicada' && "bg-blue-50 text-blue-800 border-blue-200",
                            acta.status === 'Borrador' && "bg-slate-100 text-slate-500 border-slate-200"
                          )}>
                            {acta.status}
                          </span>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {acta.evidences?.map((ev, idx) => (
                              <div key={idx} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer" title={ev.split('/').pop()}>
                                {getFileIcon(ev)}
                              </div>
                            ))}
                            {acta.pdf_url && (
                              <div 
                                className="p-1.5 hover:bg-indigo-50 rounded-lg cursor-pointer text-indigo-600" 
                                title="Ver PDF de Acta Firmada"
                                onClick={() => alert(`✓ Simulación: Abriendo visualizador seguro para PDF de acta: ${acta.pdf_url}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* --- MODAL: VIEW MEMBER CARD (FASE 1) --- */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setViewingMember(null)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle relative z-10 w-full">
            <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Ficha de Integrante
              </CardTitle>
              <button onClick={() => setViewingMember(null)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs font-semibold text-slate-600">
              <div className="text-center py-4 border-b border-slate-100">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-xl font-black shadow-inner mb-3">
                  {viewingMember.member_name.charAt(0)}
                </div>
                <h4 className="text-sm font-black text-slate-900 leading-tight">{viewingMember.member_name}</h4>
                <p className="text-[10px] text-slate-450 uppercase mt-1 tracking-widest">{viewingMember.role_title}</p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Órgano / Estamento:</span>
                  <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{viewingMember.body_type}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Número de Documento:</span>
                  <span className="font-extrabold text-slate-900 font-mono">{viewingMember.document_number || 'No registrado'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Correo Electrónico:</span>
                  <span className="font-extrabold text-slate-900 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" /> {viewingMember.email || 'No registrado'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Teléfono / WhatsApp:</span>
                  <span className="font-extrabold text-slate-900 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" /> {viewingMember.phone || 'No registrado'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Periodo Lectivo:</span>
                  <span className="font-bold text-slate-950">{viewingMember.period}</span>
                </div>
              </div>
            </CardContent>
            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
              <Button onClick={() => setViewingMember(null)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm border-none cursor-pointer h-9">
                Cerrar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT MEMBER (FASE 1) --- */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsMemberModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSaveMember}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    {editingMember ? 'Editar Integrante' : 'Registrar Integrante'}
                  </h3>
                  <button type="button" onClick={() => setIsMemberModalOpen(false)} className="text-slate-400 hover:text-slate-600 outline-none border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Estamento / Órgano</label>
                    <select
                      value={bodyType}
                      onChange={(e) => setBodyType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                    >
                      {bodyTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Nombre Integrante *</label>
                    <input
                      type="text"
                      placeholder="Ej. Carlos Ortiz"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Número de Documento</label>
                    <input
                      type="text"
                      placeholder="Ej. 10203040"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Correo Electrónico</label>
                      <input
                        type="email"
                        placeholder="Ej. carlos@aulacore.edu.co"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Teléfono / WhatsApp</label>
                      <input
                        type="text"
                        placeholder="Ej. +573001234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Cargo Interno *</label>
                      <input
                        type="text"
                        placeholder="Ej. Representante, Vocal..."
                        value={roleTitle}
                        onChange={(e) => setRoleTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Periodo Lectivo *</label>
                      <input
                        type="text"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" onClick={() => setIsMemberModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                  Cancelar
                </Button>
                <Button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm cursor-pointer h-9 border-none">
                  {editingMember ? 'Actualizar' : 'Registrar'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* --- MODAL: CREATE CONVOCATORIA (FASE 2) --- */}
      {isConvModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsConvModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle relative z-10 w-full">
            <div className="bg-white px-6 pt-6 pb-4 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Crear Convocatoria Oficial
                </h3>
                <button type="button" onClick={() => setIsConvModalOpen(false)} className="text-slate-400 hover:text-slate-600 outline-none border-none bg-transparent cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Título del Asunto / Reunión *</label>
                  <input
                    type="text"
                    placeholder="Ej. Revisión Planilla del Segundo Periodo"
                    value={convTitle}
                    onChange={(e) => setConvTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Órgano a Convocar</label>
                    <select
                      value={convBodyType}
                      onChange={(e) => setConvBodyType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                    >
                      {bodyTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Lugar de Reunión *</label>
                    <input
                      type="text"
                      placeholder="Ej. Sala de Juntas"
                      value={convLocation}
                      onChange={(e) => setConvLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Fecha Reunión</label>
                    <input
                      type="date"
                      value={convDate}
                      onChange={(e) => setConvDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Hora Reunión</label>
                    <input
                      type="time"
                      value={convTime}
                      onChange={(e) => setConvTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Descripción u Orden del Día</label>
                  <textarea
                    rows={3}
                    placeholder="Escriba los puntos a tratar..."
                    value={convDesc}
                    onChange={(e) => setConvDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none"
                  />
                </div>

                {/* Destinatarios Detectados */}
                <div className="bg-indigo-50 border border-indigo-200/50 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5 mb-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Destinatarios Detectados automáticamente ({filteredConvsRecipients.length})
                  </span>
                  {filteredConvsRecipients.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic">No hay integrantes registrados en este estamento para convocar.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {filteredConvsRecipients.map(m => (
                        <span key={m.id} className="bg-white border border-indigo-150 text-indigo-950 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                          {m.member_name} ({m.role_title})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Adjuntos / Evidencias Convocatoria */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Documentos Adjuntos (PDF, Word, Excel, Imágenes)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nombre del archivo (Ej. orden_del_dia.pdf, presupuesto.xlsx)..."
                      value={newAttachment}
                      onChange={(e) => setNewAttachment(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold text-xs h-9"
                    />
                    <Button type="button" onClick={handleAddConvAttachment} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-xl border-none cursor-pointer">
                      Adjuntar
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {convAttachments.map((att, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-250 rounded-xl">
                        <span className="flex items-center gap-2 font-bold text-[11px] text-slate-700 truncate max-w-[80%]">
                          {getFileIcon(att)} <span className="truncate">{att}</span>
                        </span>
                        <button type="button" onClick={() => handleRemoveConvAttachment(idx)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendario Checkbox */}
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="chkCalendar"
                    checked={createCalendarEvent}
                    onChange={(e) => setCreateCalendarEvent(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="chkCalendar" className="text-xs font-black text-slate-750 flex items-center gap-1.5 cursor-pointer select-none">
                    <CalendarPlus className="w-4.5 h-4.5 text-indigo-600" />
                    Generar evento institucional en el Calendario
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-between gap-2 border-t border-slate-100">
              <Button type="button" onClick={() => setIsConvModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                Cancelar
              </Button>
              <div className="flex gap-2">
                <Button type="button" onClick={() => handleSaveConv('Planeada')} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-300 cursor-pointer h-9 border-none">
                  Guardar Borrador
                </Button>
                <Button type="button" onClick={() => handleSaveConv('Enviada')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm cursor-pointer h-9 border-none flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Enviar Convocatoria
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* --- MODAL: FORMALIZAR REUNIÓN (FASE 2) --- */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsMeetingModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle relative z-10 w-full">
            <form onSubmit={handleSaveMeeting}>
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-indigo-600" />
                    Formalizar Sesión / Reunión
                  </h3>
                  <button type="button" onClick={() => setIsMeetingModalOpen(false)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Vincular a Convocatoria Existente (Opcional)</label>
                    <select
                      value={selectedConvId}
                      onChange={(e) => handleConvSelectForMeeting(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                    >
                      <option value="">-- Crear Reunión Independiente --</option>
                      {localConvs.filter(c => c.status !== 'Realizada').map(c => (
                        <option key={c.id} value={c.id}>{c.title} ({c.body_type} - {c.meeting_date})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Título de la Sesión *</label>
                    <input
                      type="text"
                      placeholder="Ej. Sesión Ordinaria CD"
                      value={meetTitle}
                      onChange={(e) => setMeetTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Órgano / Consejo</label>
                      <select
                        value={meetBodyType}
                        onChange={(e) => {
                          setMeetBodyType(e.target.value);
                          // Recargar asistencia predeterminada
                          const groupMembers = localMembers
                            .filter(m => m.body_type === e.target.value)
                            .map(m => ({ member_id: m.id, name: m.member_name, role_title: m.role_title, attended: true }));
                          setMeetAttendance(groupMembers);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        {bodyTypes.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Lugar de Reunión</label>
                      <input
                        type="text"
                        value={meetLocation}
                        onChange={(e) => setMeetLocation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Fecha</label>
                      <input
                        type="date"
                        value={meetDate}
                        onChange={(e) => setMeetDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Hora</label>
                      <input
                        type="time"
                        value={meetTime}
                        onChange={(e) => setMeetTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Asistencia Checkbox list */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Registro de Asistencia (Quorum)</label>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[140px] overflow-y-auto bg-slate-50/50 p-2 space-y-1">
                      {meetAttendance.length === 0 ? (
                        <p className="text-[10px] text-slate-450 italic p-2 text-center">No hay integrantes inscritos en este órgano.</p>
                      ) : (
                        meetAttendance.map(a => (
                          <div 
                            key={a.member_id} 
                            onClick={() => handleToggleAttendance(a.member_id)}
                            className="flex items-center gap-2 p-2 hover:bg-white rounded-xl cursor-pointer select-none transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={a.attended}
                              readOnly
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="flex flex-col leading-tight">
                              <span className="font-extrabold text-[11px] text-slate-900">{a.name}</span>
                              <span className="text-[9px] text-slate-450 font-bold uppercase">{a.role_title}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Acuerdos y Decisiones Claves</label>
                    <textarea
                      rows={3}
                      placeholder="Escriba el resumen de decisiones tomadas..."
                      value={meetDecisions}
                      onChange={(e) => setMeetDecisions(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold resize-none"
                    />
                  </div>

                  {/* Evidencias de Reunión */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Evidencias Adjuntas (PDF, Word, Excel, Fotos)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nombre de archivo (Ej. bitacora.pdf, presentacion.pdf)..."
                        value={newMeetEvidence}
                        onChange={(e) => setNewMeetEvidence(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold text-xs h-9"
                      />
                      <Button type="button" onClick={handleAddMeetEvidence} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-xl border-none cursor-pointer">
                        Adjuntar
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {meetEvidences.map((ev, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-250 rounded-xl">
                          <span className="flex items-center gap-2 font-bold text-[11px] text-slate-700 truncate max-w-[80%]">
                            {getFileIcon(ev)} <span className="truncate">{ev}</span>
                          </span>
                          <button type="button" onClick={() => handleRemoveMeetEvidence(idx)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <Button type="button" onClick={() => setIsMeetingModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                  Cancelar
                </Button>
                <Button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm cursor-pointer h-9 border-none">
                  Finalizar Sesión
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* --- MODAL: REGISTRAR ACTA DE REUNIÓN (FASE 2) --- */}
      {isActaModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsActaModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" />
          <Card className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle relative z-10 w-full">
            <div className="bg-white px-6 pt-6 pb-4 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Registrar Acta Oficial
                </h3>
                <button type="button" onClick={() => setIsActaModalOpen(false)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Seleccionar Reunión Realizada *</label>
                    <select
                      value={selectedMeetingId}
                      onChange={(e) => handleMeetingSelectForActa(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                    >
                      <option value="">-- Seleccione una Sesión --</option>
                      {localMeetings.map(m => (
                        <option key={m.id} value={m.id}>{m.title} ({m.meeting_date})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Número de Acta *</label>
                    <input
                      type="text"
                      placeholder="Ej. Acta No. CD-002-2026"
                      value={actaNumber}
                      onChange={(e) => setActaNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Transcripción / Contenido del Acta</label>
                  <textarea
                    rows={4}
                    placeholder="En la ciudad de Bogotá D.C., siendo las... se reunió el Consejo..."
                    value={actaContent}
                    onChange={(e) => setActaContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold font-mono leading-relaxed"
                  />
                </div>

                {/* Control de Firmas */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Firmas Digitales (Miembros Asistentes)</label>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 p-3 space-y-2">
                    {actaSigners.length === 0 ? (
                      <p className="text-[10px] text-slate-450 italic text-center">Seleccione una reunión con integrantes que hayan asistido para habilitar firmas.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {actaSigners.map((s, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => handleToggleSignActa(idx)}
                            className={cn(
                              "p-2.5 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between select-none min-h-[64px]",
                              s.signed 
                                ? "bg-emerald-50/40 border-emerald-500 text-emerald-950" 
                                : "bg-white border-slate-200 hover:border-slate-350"
                            )}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-extrabold text-[11px] leading-tight truncate">{s.name}</span>
                              {s.signed && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            </div>
                            <span className="text-[8px] text-slate-450 uppercase mt-0.5 tracking-wider block font-bold">
                              {s.signed ? `FIRMADO: ${new Date(s.signed_at!).toLocaleDateString()}` : `HACER FIRMA: ${s.role_title}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Evidencias de Acta */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Anexos y Evidencias de Acta</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nombre de archivo (Ej. anexo_presupuesto.xlsx, firmas.jpg)..."
                      value={newActaEvidence}
                      onChange={(e) => setNewActaEvidence(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold text-xs h-9"
                    />
                    <Button type="button" onClick={handleAddActaEvidence} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-xl border-none cursor-pointer">
                      Adjuntar
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {actaEvidences.map((ev, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-250 rounded-xl">
                        <span className="flex items-center gap-2 font-bold text-[11px] text-slate-700 truncate max-w-[80%]">
                          {getFileIcon(ev)} <span className="truncate">{ev}</span>
                        </span>
                        <button type="button" onClick={() => handleRemoveActaEvidence(idx)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-between gap-2 border-t border-slate-100">
              <Button type="button" onClick={() => setIsActaModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer h-9">
                Cancelar
              </Button>
              <div className="flex gap-2">
                <Button type="button" onClick={() => handleSaveActa('Borrador')} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-300 cursor-pointer h-9 border-none">
                  Guardar Borrador
                </Button>
                <Button type="button" onClick={() => handleSaveActa('Firmada')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm cursor-pointer h-9 border-none">
                  Publicar Acta
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
