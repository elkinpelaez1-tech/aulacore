'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { StudentMockData } from '@/lib/data/mock-students';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, User, GraduationCap, ShieldAlert, FileText, History, Activity, MapPin, X, CheckCircle2, Calendar, Clock, MessageSquare, Phone, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  student: StudentMockData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCourse?: (courseName: string) => void;
}

type TabType = 'resumen' | 'academico' | 'convivencia' | 'asistencia' | 'documentos' | 'historial';

export function Student360Drawer({ student, isOpen, onOpenChange, onSelectCourse }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('resumen');
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  // Declaring other state hooks unconditionally
  const [attendanceRate, setAttendanceRate] = useState<number>(100);
  const [rfidLogs, setRfidLogs] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [ocrScanning, setOcrScanning] = useState<boolean>(false);
  const [showJustifyForm, setShowJustifyForm] = useState<boolean>(false);
  const [justifyReason, setJustifyReason] = useState<string>('Médico');
  const [justifyNotes, setJustifyNotes] = useState<string>('');
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync state when student shifts
  React.useEffect(() => {
    if (student) {
      setAttendanceRate(student.attendanceRate);
      setJustifyNotes('');
      setShowJustifyForm(false);
      
      setRfidLogs([
        { time: '07:12:05', direction: 'Entrada', status: student.attendanceRate >= 90 ? 'A Tiempo' : 'Falta', date: 'Hoy', device: 'Torniquete Sede Principal' },
        { time: '16:02:15', direction: 'Salida', status: 'A Tiempo', date: 'Ayer', device: 'Torniquete Sede Principal' },
        { time: '07:15:30', direction: 'Entrada', status: student.attendanceRate >= 90 ? 'A Tiempo' : 'Falta', date: 'Ayer', device: 'Torniquete Sede Principal' },
        { time: '15:58:10', direction: 'Salida', status: 'A Tiempo', date: 'Hace 3 días', device: 'Torniquete Sede Principal' },
      ]);

      setDocuments([
        { doc: 'Ficha de Matrícula Digital 2026', status: 'Verificado', date: '02/02/2026' },
        { doc: 'Documento de Identidad Oficial', status: 'Verificado', date: '02/02/2026' },
        { doc: 'Póliza de Seguro Estudiantil', status: 'Verificado', date: '10/02/2026' },
        { doc: 'Acta de Aceptación de Manual P3', status: student.behaviorRisk === 'Alto' ? 'Pendiente Firma' : 'Verificado', date: student.behaviorRisk === 'Alto' ? 'Demorado' : '15/04/2026' },
      ]);
    }
  }, [student?.id]);

  if (!student) return null;

  let trafficLight = { color: 'bg-emerald-500', label: 'Excelente' };
  if (student.academicRisk === 'Alto' || student.behaviorRisk === 'Alto') {
    trafficLight = { color: 'bg-rose-500', label: 'Riesgo' };
  } else if (student.academicRisk === 'Medio' || student.behaviorRisk === 'Medio') {
    trafficLight = { color: 'bg-amber-500', label: 'Seguimiento' };
  }

  const menuItems = [
    { id: 'resumen', label: 'Resumen 360', icon: User },
    { id: 'academico', label: 'Académico', icon: GraduationCap },
    { id: 'convivencia', label: 'Convivencia', icon: ShieldAlert },
    { id: 'asistencia', label: 'Asistencia RFID', icon: Activity },
    { id: 'documentos', label: 'Documentos', icon: FileText },
    { id: 'historial', label: 'Historial', icon: History },
  ] as const;

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCopyDocument = () => {
    if (!student) return;
    navigator.clipboard.writeText(student.document);
    showToast(
      '📋 Documento Copiado', 
      `El documento de identidad CC/TI ${student.document} de ${student.name} ha sido copiado al portapapeles con éxito.`
    );
  };

  const handleCourseClick = () => {
    if (!student) return;
    showToast(
      `Curso ${student.group}`, 
      `Cerrando ficha de estudiante y abriendo el panel ejecutivo del grupo ${student.group}.`
    );
    // Close the drawer first
    onOpenChange(false);
    // Trigger course selection
    setTimeout(() => {
      onSelectCourse?.(student.group);
    }, 300);
  };

  const handleCampusClick = () => {
    if (!student) return;
    const campusDetails = student.campus === 'Sede Principal'
      ? 'Dirección: Calle 45 # 12-30 • Coordinación: Lic. Rodrigo Echeverri'
      : 'Dirección: Av. Libertadores # 4-80 • Coordinación: Lic. Clara Inés';
    const shiftHours = student.shift === 'Mañana' ? '06:30 AM - 12:30 PM' : student.shift === 'Tarde' ? '12:30 PM - 06:30 PM' : '07:00 AM - 03:00 PM';
    
    showToast(
      `${student.campus} (${student.shift})`,
      `${campusDetails} • Horario: ${shiftHours}`
    );
  };

  const handleStatusBadgeClick = () => {
    if (!student) return;
    showToast(
      `Estado: ${student.status}`,
      `El estudiante tiene matrícula activa. Cuenta con plenos accesos a aulas y biometría.`
    );
  };

  const handleRiskBadgeClick = () => {
    if (!student) return;
    const desc = student.academicRisk === 'Alto' || student.behaviorRisk === 'Alto'
      ? 'Requiere intervención inmediata por bajo GPA y ausentismo recurrente.'
      : student.academicRisk === 'Medio' || student.behaviorRisk === 'Medio'
      ? 'En seguimiento preventivo por alertas académicas o conductuales de severidad media.'
      : 'Rendimiento sobresaliente. Sin alertas activas de ausentismo o convivencia.';
    
    showToast(
      `Nivel de Alerta: ${trafficLight.label}`,
      desc
    );
  };

  const handleWhatsAppContact = () => {
    const phone = '573004567890'; // Mock/Standard Colombian phone
    const text = encodeURIComponent(`Hola ${student.guardianName}, le escribimos desde AulaCore sobre el seguimiento integral y alertas de su acudido(a) ${student.name}. Nos gustaría concretar una agenda preventiva para discutir su situación actual. Quedamos a su entera disposición.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    showToast('WhatsApp Abierto', `Se redirigió a un chat con ${student.guardianName} para concretar agenda preventiva.`);
  };

  const handleDownloadICS = () => {
    const startHour = '140000';
    const endHour = '150000';
    const dateStr = '20260603'; // Wednesday next week
    const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AulaCore//Student 360 Calendar//ES',
      'BEGIN:VEVENT',
      `UID:refuerzo-${student.id}-${Date.now()}@aulacore.com`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${dateStr}T${startHour}`,
      `DTEND:${dateStr}T${endHour}`,
      `SUMMARY:Refuerzo Academico - ${student.name}`,
      `DESCRIPTION:Sesion presencial de tutoria academica y nivelacion curricular individual para el alumno ${student.name}.`,
      `LOCATION:Aula de Apoyo Academico, Sede Principal AulaCore`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tutoria_refuerzo_${student.name.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(
      'Calendario Descargado', 
      `Se ha generado el archivo .ics para agendar el refuerzo académico de ${student.name}.`
    );
  };

  const handleDownloadCitation = () => {
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const content = `========================================================================
                   AULACORE - CITATORIO OFICIAL DE ACUDIENTE
========================================================================
Fecha de Generacion: ${today}
Estudiante: ${student.name}
Documento: ${student.document}
Grado/Curso: ${student.group} - ${student.level}
Acudiente Citado: ${student.guardianName}
Sede: ${student.campus} (${student.shift})

Estimado(a) ${student.guardianName},

Por medio de la presente, la Coordinacion de Convivencia y Orientacion Escolar
de AulaCore le cita de caracter extraordinario y obligatorio a una reunion
presencial con el fin de tratar asuntos relacionados con el proceso de 
acompanamiento integral, comportamiento y rendimiento academico de su acudido.

Detalles de la reunion:
------------------------------------------------------------------------
Fecha: Lunes de la proxima semana
Hora: 07:30 AM
Lugar: Oficina de Coordinacion - ${student.campus}
Asunto: Definicion de plan de apoyo y compromisos institucionales.

Agradecemos de antemano su asistencia puntual, la cual es de vital 
importancia para el desarrollo educativo y convivencial del alumno.

Atentamente,

____________________________________
Coordinacion de Apoyo Estudiantil
AulaCore Sistema de Alertas Tempranas
========================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `citacion_acudiente_${student.name.replace(/\s+/g, '_')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      'Citacion Descargada', 
      `Se genero y descargo la carta formal para citar a ${student.guardianName}.`
    );
  };

  const handleSaveJustification = () => {
    let found = false;
    const updatedLogs = rfidLogs.map(log => {
      if (!found && (log.status === 'Falta' || log.status === 'Tarde')) {
        found = true;
        return { ...log, status: 'Justificado' };
      }
      return log;
    });

    setRfidLogs(updatedLogs);
    const newRate = Math.min(100, attendanceRate + 8);
    setAttendanceRate(newRate);
    setShowJustifyForm(false);
    showToast(
      'Justificacion Registrada', 
      `Se ingreso la excusa por motivo ${justifyReason} al log de asistencia. La tasa subio al ${newRate}%.`
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrScanning(true);
    showToast('Procesando Documento', 'AulaCore AI esta escaneando el documento y validando firmas con OCR...');

    setTimeout(() => {
      setOcrScanning(false);
      
      const newDoc = {
        doc: file.name.replace(/\.[^/.]+$/, "") + ' - Indexado OCR',
        status: 'Verificado',
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
      };

      setDocuments(prev => [...prev, newDoc]);
      showToast('OCR Completado', `Se ha validado y verificado el documento "${file.name}".`);
    }, 1800);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadPendingNotification = () => {
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const content = `========================================================================
             AULACORE - RECORDATORIO DE FIRMAS Y DOCUMENTOS PENDIENTES
========================================================================
Fecha de Envio: ${today}
Destinatario: ${student.guardianName} (Acudiente)
Estudiante: ${student.name}
Documento del Estudiante: ${student.document}
Curso: ${student.group}

Estimado(a) ${student.guardianName},

Le escribimos para recordarle que a la fecha, el expediente digital del
estudiante ${student.name} presenta los siguientes documentos o firmas
pendientes de legalizacion:

- Acta de Aceptacion de Manual de Convivencia P3

Es de suma importancia que estos requisitos se completen a la brevedad para 
garantizar el estado de matricula activa sin restricciones del alumno.

Pasos para radicar el documento:
1. Imprima y firme el anexo correspondiente.
2. Ingrese a la plataforma de acudientes AulaCore.
3. Cargue la imagen o PDF escaneado con reconocimiento OCR, o entreguelo
   fisicamente en la oficina de Admisiones y Secretaria de la sede.

Quedamos a su disposicion para cualquier duda.

Atentamente,

____________________________________
Admisiones y Matriculas AulaCore
========================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `notificacion_pendientes_${student.name.replace(/\s+/g, '_')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      'Recordatorio Descargado', 
      `Se descargo la notificacion de firmas pendientes para ${student.guardianName}.`
    );
  };

  const handleDownloadFullHistory = () => {
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    const rows = [
      ['AulaCore - Reporte de Historial Integral Student 360'],
      [`Fecha de Reporte: ${today}`],
      [],
      ['INFORMACION GENERAL'],
      ['ID Estudiante', student.id],
      ['Nombre Completo', student.name],
      ['Documento de Identidad', student.document],
      ['Grado y Grupo', `${student.grade} - ${student.group}`],
      ['Nivel Educativo', student.level],
      ['Acudiente Legal', student.guardianName],
      ['Sede / Jornada', `${student.campus} / ${student.shift}`],
      ['Estado Matricula', student.status],
      [],
      ['INDICADORES CLAVE'],
      ['Promedio GPA General', student.gpa.toFixed(2)],
      ['Tasa Asistencia Acumulada (%)', `${attendanceRate}%`],
      ['Riesgo Academico', student.academicRisk],
      ['Riesgo Convivencial', student.behaviorRisk],
      [],
      ['CALIFICACIONES PERIODO 3 (GPA REAL)'],
      ['Asignatura', 'Nota', 'Estado'],
      ['Matemáticas', student.gpa < 3.2 ? '2.4' : '4.5', student.gpa < 3.2 ? 'Bajo' : 'Alto'],
      ['Lengua Castellana', student.gpa < 3.2 ? '3.5' : '4.2', student.gpa < 3.2 ? 'Básico' : 'Superior'],
      ['Inglés', student.gpa < 3.2 ? '3.0' : '4.7', student.gpa < 3.2 ? 'Básico' : 'Alto'],
      ['Ciencias Naturales y Educación Ambiental', student.gpa < 3.2 ? '2.6' : '4.1', student.gpa < 3.2 ? 'Bajo' : 'Alto'],
      ['Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia', student.gpa < 3.2 ? '3.2' : '3.8', student.gpa < 3.2 ? 'Básico' : 'Alto'],
      ['Educación Artística y Cultural', student.gpa < 3.2 ? '3.8' : '4.4', student.gpa < 3.2 ? 'Básico' : 'Alto'],
      ['Educación Ética y en Valores Humanos', student.gpa < 3.2 ? '4.0' : '4.6', student.gpa < 3.2 ? 'Básico' : 'Alto'],
      ['Educación Física, Recreación y Deportes', student.gpa < 3.2 ? '3.5' : '4.3', student.gpa < 3.2 ? 'Básico' : 'Alto'],
      ['Educación Religiosa', student.gpa < 3.2 ? '3.8' : '4.0', student.gpa < 3.2 ? 'Básico' : 'Alto'],
      ['Tecnología e Informática', student.gpa < 3.2 ? '3.1' : '4.8', student.gpa < 3.2 ? 'Básico' : 'Alto'],
      [],
      ['REGISTROS DE ASISTENCIA BIOMETRICA RFID'],
      ['Fecha', 'Hora', 'Direccion', 'Dispositivo', 'Estado'],
      ...rfidLogs.map(log => [log.date, log.time, log.direction, log.device, log.status]),
      [],
      ['BITACORA Y EXPEDIENTE DOCUMENTAL'],
      ['Nombre Documento', 'Estado', 'Fecha Indexacion'],
      ...documents.map(d => [d.doc, d.status, d.date]),
      [],
      ['NOTAS DEL OBSERVADOR Y ACUERDOS'],
      ['Fecha', 'Tipo', 'Emisor', 'Detalles'],
      ['Hoy', 'Tipo II', 'Coord. Convivencia', 'Reincidencia conductual: Acumula su tercera alerta grave del mes. Uso indebido de celular.'],
      ['Hace 1 semana', 'Tipo I', 'Lic. Sandra Milena', 'Desatencion persistente e interrupciones en clases de espanol.']
    ];

    const csvContent = rows
      .map(row => row.map(val => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_integral_360_${student.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      'Exportacion Exitosa', 
      `Se compilo y descargo el reporte CSV del historial completo de ${student.name}.`
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl md:max-w-4xl p-0 flex bg-white overflow-hidden border-l border-slate-200 shadow-2xl">
        
        {/* LEFT SIDEBAR */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col hidden sm:flex shrink-0 relative">
          <div className={cn("absolute top-0 left-0 w-full h-1.5", trafficLight.color)} />
          
          <div className="p-6 pb-2">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Student 360</h2>
          </div>
          
          <div className="flex-1 px-3 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 text-left",
                    isActive 
                      ? "bg-white text-indigo-700 shadow-sm border border-slate-200/60" 
                      : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-800"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
          
          {/* Mobile close button */}
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors sm:hidden"
          >
            <X className="w-4 h-4" />
          </button>

          {/* STICKY HEADER */}
          <div className="bg-white border-b border-slate-100 p-6 sm:px-8 z-10 shrink-0 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.08)]">
            <div className="flex items-start gap-5">
              <div 
                onClick={handleRiskBadgeClick}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 shrink-0 shadow-sm border border-slate-250/60 overflow-hidden flex items-center justify-center text-slate-450 font-bold text-3xl relative cursor-pointer hover:shadow-md transition-all duration-300 active:scale-95 group/avatar"
                title={`Ver reporte de riesgo de ${student.name}`}
              >
                {student.avatarUrl ? (
                  <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500" />
                ) : (
                  student.name.charAt(0)
                )}
                <div className={cn("absolute -bottom-1 -right-1 w-5 h-5 border-[3px] border-white rounded-full shadow-sm group-hover/avatar:scale-110 transition-transform", trafficLight.color)} />
              </div>
              
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <button 
                    onClick={handleStatusBadgeClick}
                    className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all duration-200 active:scale-95 cursor-pointer"
                    title="Ver estado de matrícula"
                  >
                    {student.status}
                  </button>
                  <button 
                    onClick={handleRiskBadgeClick}
                    className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white transition-all duration-200 active:scale-95 cursor-pointer hover:brightness-105", trafficLight.color)}
                    title="Ver desglose de riesgo y alertas"
                  >
                    {trafficLight.label}
                  </button>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight truncate mb-1" title={student.name}>
                  {student.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 mt-2">
                  <button 
                    onClick={handleCopyDocument}
                    className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-800 px-2.5 py-1.5 rounded border border-slate-200/80 hover:border-slate-350 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs select-none"
                    title="Copiar Documento al Portapapeles"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" /> CC/TI {student.document}
                  </button>
                  <button 
                    onClick={handleCourseClick}
                    className="flex items-center gap-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1.5 rounded border border-slate-200/80 hover:border-indigo-200 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs select-none group"
                    title={`Ver detalles del curso ${student.group}`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-650 transition-colors" /> {student.group} • {student.level}
                  </button>
                  <button 
                    onClick={handleCampusClick}
                    className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-800 px-2.5 py-1.5 rounded border border-slate-200/80 hover:border-slate-350 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs select-none"
                    title="Ver detalles de sede y jornada"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" /> {student.campus} ({student.shift})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SCROLLABLE CONTENT */}
          <ScrollArea className="flex-1 bg-slate-50/30">
            <div className="p-6 sm:p-8">
              
              {/* Tab: Resumen 360 */}
              {activeTab === 'resumen' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {student.alerts.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-sm">
                      <h4 className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Alertas Críticas Activas (Haz clic para resolver)
                      </h4>
                      <div className="space-y-2">
                        {student.alerts.map(alert => (
                          <button
                            key={alert.id}
                            onClick={() => {
                              const msg = alert.message.toLowerCase();
                              if (msg.includes('ausentismo') || msg.includes('asistencia') || msg.includes('inasistencia')) {
                                setActiveTab('asistencia');
                              } else if (msg.includes('materia') || msg.includes('gpa') || msg.includes('academic') || msg.includes('nota')) {
                                setActiveTab('academico');
                              } else {
                                setActiveTab('convivencia');
                              }
                              showToast('Redirigiendo...', `Navegando a la pestaña correspondiente para gestionar: "${alert.message}"`);
                            }}
                            className="w-full text-left bg-white hover:bg-rose-50/30 border border-rose-100 hover:border-rose-350 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm hover:shadow transition-all duration-200 group cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-pulse" />
                              <p className="text-sm font-semibold text-rose-900 group-hover:text-rose-950">{alert.message}</p>
                            </div>
                            <span className="text-[9px] font-bold text-rose-600 bg-rose-50 group-hover:bg-rose-100 px-2 py-0.5 rounded transition-colors shrink-0">
                              Resolver →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-center transition-shadow hover:shadow-md">
                      <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <GraduationCap className="w-4 h-4" />
                        <p className="text-[10px] font-bold uppercase tracking-wider">Promedio (GPA)</p>
                      </div>
                      <p className={cn("text-4xl font-black", student.gpa >= 4.0 ? 'text-emerald-600' : student.gpa >= 3.0 ? 'text-amber-600' : student.gpa > 0 ? 'text-rose-600' : 'text-slate-400')}>
                        {student.gpa > 0 ? student.gpa.toFixed(1) : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-center transition-shadow hover:shadow-md">
                      <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <Activity className="w-4 h-4" />
                        <p className="text-[10px] font-bold uppercase tracking-wider">Asistencia Acumulada</p>
                      </div>
                      <p className={cn("text-4xl font-black", attendanceRate >= 90 ? 'text-emerald-600' : 'text-rose-600')}>
                        {attendanceRate}%
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Información Familiar</h4>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Acudiente Principal</p>
                        <p className="text-sm font-bold text-slate-800">{student.guardianName}</p>
                      </div>
                      <button 
                        onClick={handleWhatsAppContact}
                        className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        Contactar
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab: Académico */}
              {activeTab === 'academico' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Promedio General</span>
                      <span className={cn("text-2xl font-black block mt-1", student.gpa >= 4.0 ? 'text-emerald-600' : student.gpa >= 3.0 ? 'text-amber-600' : 'text-rose-600')}>
                        {student.gpa.toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Materias con Alerta</span>
                      <span className={cn("text-2xl font-black block mt-1", student.gpa < 3.2 ? 'text-rose-600' : 'text-emerald-600')}>
                        {student.gpa < 3.0 ? '3' : student.gpa < 3.5 ? '1' : '0'}
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Rango Desempeño</span>
                      <span className="text-sm font-black text-slate-700 block mt-2">
                        {student.gpa >= 4.0 ? 'Superior' : student.gpa >= 3.5 ? 'Alto' : student.gpa >= 3.0 ? 'Básico' : 'Bajo'}
                      </span>
                    </div>
                  </div>

                  {/* Subject Details Table */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-500" /> Boleta de Notas P3 en Tiempo Real
                    </h4>

                    <div className="space-y-3">
                      {[
                        { name: 'Matemáticas', score: student.gpa < 3.2 ? 2.4 : 4.5, status: student.gpa < 3.2 ? 'Bajo' : 'Alto' },
                        { name: 'Lengua Castellana', score: student.gpa < 3.2 ? 3.5 : 4.2, status: student.gpa < 3.2 ? 'Básico' : 'Superior' },
                        { name: 'Inglés', score: student.gpa < 3.2 ? 3.0 : 4.7, status: student.gpa < 3.2 ? 'Básico' : 'Alto' },
                        { name: 'Ciencias Naturales y Educación Ambiental', score: student.gpa < 3.2 ? 2.6 : 4.1, status: student.gpa < 3.2 ? 'Bajo' : 'Alto' },
                        { name: 'Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia', score: student.gpa < 3.2 ? 3.2 : 3.8, status: student.gpa < 3.2 ? 'Básico' : 'Alto' },
                        { name: 'Educación Artística y Cultural', score: student.gpa < 3.2 ? 3.8 : 4.4, status: student.gpa < 3.2 ? 'Básico' : 'Alto' },
                        { name: 'Educación Ética y en Valores Humanos', score: student.gpa < 3.2 ? 4.0 : 4.6, status: student.gpa < 3.2 ? 'Básico' : 'Alto' },
                        { name: 'Educación Física, Recreación y Deportes', score: student.gpa < 3.2 ? 3.5 : 4.3, status: student.gpa < 3.2 ? 'Básico' : 'Alto' },
                        { name: 'Educación Religiosa', score: student.gpa < 3.2 ? 3.8 : 4.0, status: student.gpa < 3.2 ? 'Básico' : 'Alto' },
                        { name: 'Tecnología e Informática', score: student.gpa < 3.2 ? 3.1 : 4.8, status: student.gpa < 3.2 ? 'Básico' : 'Alto' },
                      ].map(sub => (
                        <div key={sub.name} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <div>
                            <span className="text-xs font-black text-slate-800">{sub.name}</span>
                            <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">Profesor titular asignado</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                              sub.status === 'Bajo' ? "bg-rose-50 text-rose-600" :
                              sub.status === 'Básico' ? "bg-amber-50 text-amber-600" :
                              "bg-emerald-50 text-emerald-600"
                            )}>
                              {sub.status}
                            </span>
                            <span className={cn(
                              "text-sm font-black",
                              sub.score < 3.0 ? "text-rose-600" : "text-slate-800"
                            )}>{sub.score.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex items-center justify-between text-white">
                    <div>
                      <h4 className="text-xs font-black text-white">Estrategia de Nivelación Sugerida</h4>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-sm font-semibold">
                        Agendar tutorías en Álgebra los miércoles y activar plan curricular individual.
                      </p>
                    </div>
                    <button 
                      onClick={handleDownloadICS}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold h-9 px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Agendar Refuerzo
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: Convivencia */}
              {activeTab === 'convivencia' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Índice Convivencial</span>
                      <span className={cn("text-2xl font-black block mt-1", student.behaviorRisk === 'Alto' ? 'text-rose-600' : student.behaviorRisk === 'Medio' ? 'text-amber-600' : 'text-emerald-600')}>
                        {student.behaviorRisk === 'Alto' ? 'Crítico (P1)' : student.behaviorRisk === 'Medio' ? 'Seguimiento' : 'Excelente'}
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Incidentes Observador</span>
                      <span className="text-2xl font-black text-slate-800 block mt-1">
                        {student.behaviorRisk === 'Alto' ? '3' : student.behaviorRisk === 'Medio' ? '1' : '0'}
                      </span>
                    </div>
                  </div>

                  {/* Observer logs list */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-500" /> Bitácora de Observador y Acuerdos
                    </h4>

                    <div className="space-y-3.5">
                      {student.behaviorRisk !== 'Bajo' || student.name === 'Andrés Gómez' ? (
                        [
                          { date: 'Hoy, Hace 2 horas', desc: 'Reincidencia conductual: Acumula su tercera alerta grave del mes. Uso inebido de celular.', type: 'Tipo II', author: 'Coord. Convivencia' },
                          { date: 'Hace 1 semana', desc: 'Desatención persistente e interrupciones en clases de español.', type: 'Tipo I', author: 'Lic. Sandra Milena' },
                        ].map((log, index) => (
                          <div key={index} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-slate-450 font-bold">{log.date} • {log.author}</span>
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-600">{log.type}</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-650 leading-relaxed">{log.desc}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-slate-400 font-semibold border border-dashed border-slate-200 rounded-xl">
                          No se registran llamados de atención ni incidentes conductuales para este alumno.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <span className="text-xs font-bold text-slate-500">¿Requiere citar a comité extraordinario de convivencia?</span>
                    <button 
                      onClick={handleDownloadCitation}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold h-9 px-4 rounded-xl shadow transition-all duration-250 active:scale-95 flex items-center gap-1.5 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> Citar Acudiente
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: Asistencia */}
              {activeTab === 'asistencia' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* RFID biometric stats */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-500 animate-pulse" /> Registro de Biometría RFID Reciente
                    </h4>

                    <div className="space-y-3">
                      {rfidLogs.map((log, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <div className="flex items-center gap-2.5">
                            <span className={cn(
                              "w-2.5 h-2.5 rounded-full shrink-0",
                              log.direction === 'Entrada' ? "bg-emerald-500" : "bg-blue-600"
                            )} />
                            <div>
                              <span className="text-xs font-black text-slate-800">{log.direction}</span>
                              <span className="text-[9px] text-slate-450 block font-bold mt-0.5">{log.date} • {log.time} • {log.device}</span>
                            </div>
                          </div>
                          <span className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                            log.status === 'A Tiempo' ? "bg-emerald-50 text-emerald-600" : 
                            log.status === 'Justificado' ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                            "bg-rose-50 text-rose-600"
                          )}>
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Justify warning / form */}
                  {showJustifyForm ? (
                    <div className="bg-white border-2 border-indigo-100 rounded-2xl p-5 shadow-lg space-y-4 animate-in slide-in-from-top-3 duration-250">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-indigo-600 animate-pulse" />
                          <h4 className="text-sm font-black text-slate-800">Radicar Excusa & Justificación RFID</h4>
                        </div>
                        <button 
                          onClick={() => setShowJustifyForm(false)}
                          className="text-slate-450 hover:text-slate-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Motivo de Inasistencia</label>
                          <select 
                            value={justifyReason}
                            onChange={(e) => setJustifyReason(e.target.value)}
                            className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-indigo-400 focus:bg-white transition-all cursor-pointer"
                          >
                            <option value="Médico">Excusa Médica Certificada</option>
                            <option value="Familiar">Asunto Familiar / Viaje</option>
                            <option value="Calamidad">Calamidad Doméstica</option>
                            <option value="Fuerza Mayor">Fuerza Mayor / Movilidad</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Soporte Documental</label>
                          <div className="w-full text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center justify-between">
                            <span>Soporte_Excusa.pdf</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Observación / Notas del Coordinador</label>
                        <textarea 
                          value={justifyNotes}
                          onChange={(e) => setJustifyNotes(e.target.value)}
                          placeholder="Escriba los detalles de la justificación recibida..."
                          className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 h-20 outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none"
                        />
                      </div>

                      <div className="flex gap-3 justify-end pt-2">
                        <button 
                          onClick={() => setShowJustifyForm(false)}
                          className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleSaveJustification}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                          Guardar Justificación
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                      <div>
                        <h4 className="text-xs font-black text-slate-800">Porcentaje General: {attendanceRate}%</h4>
                        <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Asistencias y retrasos registrados en sistema</p>
                      </div>
                      <button 
                        onClick={() => setShowJustifyForm(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold h-9 px-4 rounded-xl shadow transition-all duration-200 active:scale-95"
                      >
                        Justificar Inasistencia
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Documentos */}
              {activeTab === 'documentos' && (
                <div className="space-y-6 animate-in fade-in duration-300 relative">
                  
                  {/* Hidden Input File for Simulated OCR Scanner */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" 
                  />

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                    
                    {/* Premium Scanner Animated Overlay */}
                    {ocrScanning && (
                      <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-2xl animate-in fade-in duration-250">
                        <div className="flex flex-col items-center space-y-3.5 p-6 text-center max-w-xs">
                          <div className="relative w-12 h-12">
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse" />
                            <div className="absolute inset-0 rounded-full border-t-4 border-indigo-600 animate-spin" />
                            <div className="absolute inset-2.5 rounded-full bg-indigo-50 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-indigo-600 animate-bounce" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs font-black text-indigo-700 tracking-tight block">Escaneando OCR AI...</span>
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest animate-pulse block">Analizando Firmas</span>
                            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">AulaCore extrae los metadatos y valida firmas digitales...</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-500" /> Expediente Escolar y Ajustes Razonables
                    </h4>

                    <div className="space-y-3">
                      {documents.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors">
                          <div>
                            <span className="text-xs font-black text-slate-800">{item.doc}</span>
                            <span className="text-[9px] text-slate-400 block font-bold mt-0.5">Indexado: {item.date}</span>
                          </div>
                          <span className={cn(
                            "text-[8px] font-black uppercase px-2 py-0.5 rounded border transition-all",
                            item.status === 'Verificado' 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                              : "bg-rose-50 text-rose-600 border-rose-100 animate-pulse"
                          )}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 border text-[10px] font-bold h-9 px-4 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> Cargar Documento
                    </button>
                    <button 
                      onClick={handleDownloadPendingNotification}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold h-9 px-4 rounded-xl shadow transition-all duration-200 active:scale-95 flex items-center gap-1.5"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" /> Notificar Pendientes
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: Historial */}
              {activeTab === 'historial' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-indigo-500" /> Historial Integral de Hitos de Auditoría
                    </h4>

                    <div className="relative pl-6 space-y-5 border-l-2 border-slate-100 ml-3">
                      {[
                        { title: 'Citación Convivencial Programada', desc: 'Reunión acordada con acudiente tras registrarse reincidencia conductual.', date: 'Hoy, Hace 2 horas', iconBg: 'bg-amber-500' },
                        { title: 'Caída de Notas Detectada', desc: 'Alerta predictiva activa en matemáticas por promedio por debajo de 3.0.', date: '04/05/2026', iconBg: 'bg-rose-500' },
                        { title: 'Excusa Médica Cargada', desc: 'Ausencia del 18 de abril justificada y registrada en control de asistencia.', date: '12/04/2026', iconBg: 'bg-emerald-500' },
                        { title: 'Matrícula Completada', desc: 'Carga de todos los documentos obligatorios aprobada por secretaría.', date: '02/02/2026', iconBg: 'bg-slate-400' },
                      ].map((item, i) => (
                        <div key={i} className="relative">
                          <div className={cn("absolute -left-[31px] top-0 w-4 h-4 rounded-full border-4 border-white flex items-center justify-center shadow-sm", item.iconBg)} />
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block">{item.date}</span>
                            <h5 className="text-xs font-black text-slate-800 mt-0.5">{item.title}</h5>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={handleDownloadFullHistory}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold h-9 px-4 rounded-xl shadow transition-all duration-200 active:scale-95 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Descargar Historial Completo (CSV)
                    </button>
                  </div>
                </div>
              )}

            </div>
          </ScrollArea>
        </div>

      </SheetContent>

      {/* Floating toast notification inside drawer */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-800 tracking-tight">{toast.title}</h4>
            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}

    </Sheet>
  );
}
