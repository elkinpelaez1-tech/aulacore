'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  QrCode, ArrowLeft, Activity, ShieldAlert, Users, BrainCircuit, ScanLine, 
  MapPin, Clock, CheckCircle2, AlertTriangle, Shield, Check, RefreshCw, Smartphone, Map, FileText
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  ATTENDANCE_STUDENTS, INITIAL_ATTENDANCE_LOGS, MOCK_GPS_GEOFENCES, 
  AttendanceRecord, AttendanceState, AttendanceSource, getDominantRecord, PRIORITY_MAP 
} from '@/lib/data/attendance-store';
import { MOCK_STUDENTS } from '@/lib/data/mock-students';
import { MOCK_COURSES } from '@/lib/data/mock-courses';
import { TeacherAttendancePortal } from '@/components/attendance/TeacherAttendancePortal';

export default function AsistenciaHibridaPage() {
  const [logs, setLogs] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_LOGS);
  const [toast, setToast] = useState<{ title: string; message: string; type?: 'success' | 'warning' } | null>(null);
  const [mainTab, setMainTab] = useState<'DOCENTE' | 'CONSOLE'>('DOCENTE');

  // Active Simulation states
  const [rfidStudent, setRfidStudent] = useState('s-107');
  const [rfidState, setRfidState] = useState<AttendanceState>('Presente');
  const [rfidPorteria, setRfidPorteria] = useState('Torniquete Principal A');
  const [isRfidLoading, setIsRfidLoading] = useState(false);

  // QR simulated scanner
  const [qrScanning, setQrScanning] = useState(false);
  const [qrCameraActive, setQrCameraActive] = useState(false);
  const [qrProgress, setQrProgress] = useState(0);

  // Cascading live metrics
  const [sofiaAttendanceRate, setSofiaAttendanceRate] = useState(75);
  const [activeAlertsSofia, setActiveAlertsSofia] = useState<string[]>(['Ausentismo recurrente (>20%)']);
  const [globalGpaAttendance9B, setGlobalGpaAttendance9B] = useState(75);
  const [academicRiskSofia, setAcademicRiskSofia] = useState('Alto');

  const showToast = (title: string, message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Helper to find dominant record for a specific student today
  const getStudentDominantLog = (studentId: string) => {
    const studentLogs = logs.filter(l => l.studentId === studentId);
    return getDominantRecord(studentLogs);
  };

  // Add an attendance log and trigger priority resolution
  const addAttendanceLog = (
    studentId: string, 
    source: AttendanceSource, 
    state: AttendanceState, 
    device: string, 
    location: string,
    operator: string
  ) => {
    const student = ATTENDANCE_STUDENTS.find(s => s.id === studentId);
    if (!student) return;

    const newLog: AttendanceRecord = {
      id: `log-${Date.now()}`,
      studentId,
      studentName: student.name,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source,
      state,
      device,
      location,
      operator,
      timestamp: Date.now(),
      history: [`[${new Date().toLocaleTimeString('es-ES')}] Registro de asistencia generado vía ${source}.`]
    };

    setLogs(prev => [newLog, ...prev]);

    // Check if the new log takes priority over existing ones
    const previousDominant = getStudentDominantLog(studentId);
    const newLogsList = [newLog, ...(logs.filter(l => l.studentId === studentId))];
    const resolvedDominant = getDominantRecord(newLogsList);

    if (resolvedDominant && resolvedDominant.id === newLog.id) {
      showToast(
        'Asistencia Registrada',
        `Marca dominante resuelta para ${student.name}: ${state} (Fuente: ${source})`
      );
    } else {
      showToast(
        'Marca Secundaria Registrada',
        `Se guardó la marca (${source}) pero prevalece la fuente principal (${resolvedDominant?.source}) por jerarquía.`,
        'warning'
      );
    }
  };

  // Trigger simulated RFID Swipe
  const handleRfidSwipe = () => {
    setIsRfidLoading(true);
    setTimeout(() => {
      setIsRfidLoading(false);
      addAttendanceLog(
        rfidStudent,
        'RFID',
        rfidState,
        rfidPorteria,
        'Portería Principal',
        'Sistema Automatizado RFID'
      );
    }, 800);
  };

  // Trigger simulated QR camera scanner
  const handleQrScan = () => {
    setQrScanning(true);
    setQrCameraActive(true);
    setQrProgress(0);

    const steps = [30, 60, 90, 100];
    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setQrProgress(steps[current]);
        current++;
      } else {
        clearInterval(interval);
        setQrScanning(false);
        setQrCameraActive(false);

        // Scan Sofía Ramírez QR code as default scan action
        addAttendanceLog(
          's-107',
          'QR',
          'Presente',
          'Tablet-Portero-01',
          'Portería Principal',
          'Portero General'
        );
      }
    }, 400);
  };

  // Cascading Live Sync: updates GPA, active alerts, risk status
  const handleCascadingAttendanceSync = () => {
    // Recalculate metrics
    setSofiaAttendanceRate(85); // Recalculates to healthy 85%
    setActiveAlertsSofia([]); // Clears alerts
    setGlobalGpaAttendance9B(82); // Heatmap 9-B average rises to 82%
    setAcademicRiskSofia('Medio'); // Risk drops from Alto to Medio!

    // Temporarily update MOCK_STUDENTS for local state consistency
    const sofia = MOCK_STUDENTS.find(s => s.id === 's-107');
    if (sofia) {
      sofia.attendanceRate = 85;
      sofia.alerts = []; // Active alert resolved!
      sofia.academicRisk = 'Medio';
    }

    // Recalculate 9-B Course mock details in MOCK_COURSES
    const course9B = MOCK_COURSES.find(c => c.name === '9-B') || MOCK_COURSES[1];
    if (course9B) {
      course9B.metrics.averageAttendance = 82;
      course9B.metrics.activeAlerts = 1; // Alerts down
      course9B.metrics.studentsAtRisk = 1; 
    }

    showToast(
      'Sincronización Cascading Completada',
      `Asistencia de Sofía Ramírez recalculada en 85%. Alerta crítica de ausentismo RESUELTA. Promedio del curso 9-B subió al 82% en mapa de calor de rectoría.`
    );
  };

  // Present/Absent counters based on current dominant records
  const getSummaryCounts = () => {
    let present = 0;
    let late = 0;
    let absent = 0;

    ATTENDANCE_STUDENTS.forEach(student => {
      const log = getStudentDominantLog(student.id);
      if (!log) {
        absent++;
      } else if (log.state === 'Presente') {
        present++;
      } else if (log.state === 'Retardo') {
        late++;
      } else if (log.state === 'Ausente' || log.state === 'Ausencia injustificada') {
        absent++;
      } else {
        present++; // justificada / salida
      }
    });

    return { present, late, absent };
  };

  const counts = getSummaryCounts();

  if (mainTab === 'DOCENTE') {
    return (
      <AppLayout>
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 p-1.5 rounded-2xl flex items-center gap-2 max-w-xl mx-auto shadow-md border border-slate-800">
            <button
              onClick={() => setMainTab('DOCENTE')}
              className="flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer bg-indigo-600 text-white shadow-lg scale-[1.01]"
            >
              <Smartphone className="w-4 h-4 text-indigo-300" />
              <span>👩‍🏫 Toma en Clase (Docentes)</span>
            </button>
            <button
              onClick={() => setMainTab('CONSOLE')}
              className="flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-slate-400 hover:text-white hover:bg-slate-800/60"
            >
              <Activity className="w-4 h-4 text-emerald-300" />
              <span>🏢 Consola RFID & MIO</span>
            </button>
          </div>
          <TeacherAttendancePortal />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-slate-900 p-1.5 rounded-2xl flex items-center gap-2 max-w-xl mx-auto shadow-md border border-slate-800">
          <button
            onClick={() => setMainTab('DOCENTE')}
            className="flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-slate-400 hover:text-white hover:bg-slate-800/60"
          >
            <Smartphone className="w-4 h-4 text-indigo-300" />
            <span>👩‍🏫 Toma en Clase (Docentes)</span>
          </button>
          <button
            onClick={() => setMainTab('CONSOLE')}
            className="flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer bg-indigo-600 text-white shadow-lg scale-[1.01]"
          >
            <Activity className="w-4 h-4 text-emerald-300" />
            <span>🏢 Consola RFID & MIO</span>
          </button>
        </div>
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-extrabold uppercase tracking-widest text-xs mb-1">
              <BrainCircuit className="w-5 h-5 text-indigo-500 animate-pulse" /> AulaCore Hybrid Attendance Motor
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Centro de Control de Asistencia</h1>
            <p className="text-xs text-slate-500 font-bold mt-1.5 uppercase tracking-wide">
              RFID & Biometría • QR Estudiantil • Registro Manual del Docente • Resiliencia Multicanal
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-200 text-slate-650 font-bold text-xs h-9 rounded-xl flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
              </Button>
            </Link>
            <Button 
              onClick={handleCascadingAttendanceSync}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-9 rounded-xl shadow-md active:scale-95 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sincronizar Cambios
            </Button>
          </div>
        </div>

        {/* KPI METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:shadow transition-shadow">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Asistencia Promedio 9-B</span>
              <span className="text-3xl font-black text-slate-800 mt-1 block">
                {globalGpaAttendance9B}%
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:shadow transition-shadow">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Estudiantes Presentes Hoy</span>
              <span className="text-3xl font-black text-emerald-600 mt-1 block">
                {counts.present} / {ATTENDANCE_STUDENTS.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:shadow transition-shadow">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Retardos en Portería</span>
              <span className="text-3xl font-black text-amber-500 mt-1 block">
                {counts.late} Faltas
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:shadow transition-shadow">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Alertas Activas (Ausencia)</span>
              <span className={cn(
                "text-3xl font-black mt-1 block",
                activeAlertsSofia.length > 0 ? "text-rose-500 animate-pulse" : "text-slate-400"
              )}>
                {activeAlertsSofia.length} Alertas
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* PRIORITY MAP EXPLANATORY ALERTS BANNER */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="w-4 h-4 animate-pulse" /> Algoritmo de Precedencia AulaCore IA
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed max-w-2xl">
                El motor híbrido resuelve conflictos de duplicados en caliente evaluando la jerarquía de las fuentes. 
                El método RFID (torniquetes) tiene prioridad absoluta sobre escaneos QR y pase de lista manual de los docentes.
              </p>
            </div>
            
            <div className="flex items-center gap-2.5 text-[9px] font-black uppercase text-indigo-200">
              <span className="px-2 py-1 bg-indigo-900/55 rounded border border-indigo-700/60 shadow-inner">RFID (Prio 1)</span>
              <span>►</span>
              <span className="px-2 py-1 bg-purple-900/55 rounded border border-purple-700/60 shadow-inner">QR (Prio 2)</span>
              <span>►</span>
              <span className="px-2 py-1 bg-amber-900/55 rounded border border-amber-700/60 shadow-inner">Docente (Prio 3)</span>
            </div>
          </div>
        </div>

        {/* 4 CONTROL CARDS GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* CARD 1: RFID & BIOMETRÍA */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
            
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Canal Principal - Prio 1</span>
                  <h3 className="text-sm font-black text-slate-800 mt-1">RFID & Biometría</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[8px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                  AUTOMÁTICO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                Control automático de portería institucional mediante tarjeta de proximidad o pulsera inteligente de silicona.
              </p>
              
              {/* Simulator Swipe box */}
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">Simular Alumno (Swipe)</label>
                  <select 
                    value={rfidStudent} 
                    onChange={e => setRfidStudent(e.target.value)}
                    className="w-full text-[10px] font-bold text-slate-705 bg-white border border-slate-200 rounded-lg p-2 cursor-pointer outline-none focus:border-indigo-400"
                  >
                    {ATTENDANCE_STUDENTS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">Estado Biométrico</label>
                    <select 
                      value={rfidState} 
                      onChange={e => setRfidState(e.target.value as AttendanceState)}
                      className="w-full text-[10px] font-bold text-slate-705 bg-white border border-slate-200 rounded-lg p-2 cursor-pointer outline-none"
                    >
                      <option value="Presente">Presente</option>
                      <option value="Retardo">Retardo</option>
                      <option value="Salida anticipada">Salida</option>
                      <option value="Ausente">Ausente</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">Torniquete</label>
                    <select 
                      value={rfidPorteria} 
                      onChange={e => setRfidPorteria(e.target.value)}
                      className="w-full text-[10px] font-bold text-slate-705 bg-white border border-slate-200 rounded-lg p-2 cursor-pointer outline-none"
                    >
                      <option value="Torniquete Principal A">Portería A</option>
                      <option value="Torniquete Principal B">Portería B</option>
                      <option value="Torniquete Vehicular">Vehicular</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleRfidSwipe}
              disabled={isRfidLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl shadow active:scale-95 mt-4"
            >
              {isRfidLoading ? 'Registrando RFID...' : 'Simular Swipe RFID'}
            </Button>
          </div>

          {/* CARD 2: QR INTELIGENTE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-500" />
            
            {/* Camera mock scanning loader overlay */}
            {qrScanning && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 rounded-3xl animate-in fade-in duration-200">
                <div className="relative w-16 h-16 mb-3">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-900/30 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-t-4 border-purple-500 animate-spin" />
                  <QrCode className="absolute inset-4.5 w-7 h-7 text-purple-400 animate-bounce" />
                </div>
                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest animate-pulse">Lector de Cámara</span>
                <span className="text-[9px] text-slate-400 mt-1 block">Calibrando marcas de sincronía OMR...</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Canal Alterno - Prio 2</span>
                  <h3 className="text-sm font-black text-slate-800 mt-1">QR Inteligente</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[8px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-100 shrink-0">
                  ÓPTICO QR
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                Escaneo móvil de credenciales mediante códigos QR generados por AulaCore. Excelente para colegios sin terminales físicas.
              </p>
              
              {/* Virtual Scanner camera container */}
              <div className="w-full h-32 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center relative overflow-hidden group-hover:border-purple-200 transition-colors shadow-inner">
                {qrCameraActive ? (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-purple-500 font-bold relative">
                    <ScanLine className="w-10 h-10 animate-bounce text-purple-500" />
                    <div className="absolute inset-2 border-2 border-dashed border-purple-500/50 rounded-lg" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <QrCode className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-[9px] font-bold uppercase tracking-wider mt-2">Cámara Lista</span>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleQrScan}
              disabled={qrScanning}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl shadow active:scale-95 mt-4"
            >
              Simular Lector QR Portería
            </Button>
          </div>

          {/* CARD 3: VERIFICACIÓN DOCENTE (LISTA MANUAL) */}
          <div className="xl:col-span-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
            
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Respaldo de Aula - Prio 3</span>
                  <h3 className="text-sm font-black text-slate-800 mt-1">Verificación Docente</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                  MANUAL
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                Pase de lista manual por el docente en salón de clases. Actúa como respaldo si fallan los terminales físicos o QR.
              </p>
              
              {/* Classroom check roster */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] font-black text-slate-800">
                  <span>Curso: 9-B</span>
                  <span>Hoy: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
                </div>
                
                <div className="space-y-2">
                  {ATTENDANCE_STUDENTS.map(student => {
                    const dominantLog = getStudentDominantLog(student.id);
                    
                    return (
                      <div key={student.id} className="p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3 hover:border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                            {student.name.charAt(0)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-850 truncate max-w-[70px]">{student.name.split(' ')[0]}</span>
                        </div>
                        
                        <div className="flex gap-1">
                          {[
                            { st: 'Presente' as const, c: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100', l: 'P' },
                            { st: 'Retardo' as const, c: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100', l: 'R' },
                            { st: 'Ausencia injustificada' as const, c: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100', l: 'A' },
                            { st: 'Ausencia justificada' as const, c: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100', l: 'J' }
                          ].map(badge => {
                            const isCurrentManualState = dominantLog?.source === 'Docente' && dominantLog?.state === badge.st;
                            
                            return (
                              <button
                                key={badge.st}
                                onClick={() => addAttendanceLog(
                                  student.id,
                                  'Docente',
                                  badge.st,
                                  'PC-Docente-Aula',
                                  'Salón 9-B',
                                  'Prof. Gómez (Docente)'
                                )}
                                className={cn(
                                  "w-5 h-5 rounded flex items-center justify-center text-[9px] font-black border transition-all active:scale-90 cursor-pointer shadow-xs select-none",
                                  isCurrentManualState ? badge.c : "bg-white text-slate-400 border-slate-150 hover:bg-slate-50"
                                )}
                                title={badge.st}
                              >
                                {badge.l}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4: ASISTENCIA GEOLOCALIZADA GPS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Future/Next integration esmerilado overlay */}
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1.5px] z-10 flex flex-col items-center justify-center p-4 rounded-3xl select-none">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg mb-3">
                <Map className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
              <span className="text-[10px] font-black bg-indigo-650 text-indigo-200 px-3 py-1 rounded-xl border border-indigo-500/35 tracking-widest shadow-md">
                PRÓXIMA INTEGRACIÓN IA
              </span>
              <p className="text-[9px] text-slate-450 text-center font-bold leading-relaxed max-w-[160px] mt-2">
                Asistencia Geolocalizada GPS por Geofencing para prácticas, salidas y campos de investigación.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">Próxima Fase - Prio 4</span>
                  <h3 className="text-sm font-black text-slate-155 mt-1">Geolocalización GPS</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[8px] font-black uppercase bg-indigo-900 text-indigo-300 border border-indigo-850 shrink-0">
                  GPS GEOFENCE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                Control satelital de asistencia. Permite registrar marcas válidas únicamente dentro del radio geográfico de salidas pedagógicas.
              </p>
              
              <div className="space-y-2 text-[9px] font-semibold text-slate-400">
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" /> Museo Nacional de Colombia</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /> Radio de Sincronización: 200m</div>
                <div className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-slate-500" /> Coordenadas: 4.60971, -74.08175</div>
              </div>
            </div>

            <Button disabled className="w-full bg-slate-800 text-slate-500 cursor-not-allowed font-bold text-xs py-2 rounded-xl border border-slate-700 mt-4 opacity-50">
              Configurar Geocerca GPS
            </Button>
          </div>

        </div>

        {/* 📋 TRAZABILIDAD DE AUDITORÍA (LOGS DE ASISTENCIA HISTÓRICOS) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-650 animate-pulse" /> Sábana de Trazabilidad y Auditoría de Marcas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Bitácora central de auditoría de marcas históricas del día procesadas por el motor</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Estudiante</th>
                  <th className="py-3 px-4">Hora Marca</th>
                  <th className="py-3 px-4">Fuente Registro</th>
                  <th className="py-3 px-4">Estado Reportado</th>
                  <th className="py-3 px-4">Dispositivo</th>
                  <th className="py-3 px-4">Ubicación</th>
                  <th className="py-3 px-4">Operador</th>
                  <th className="py-3 px-4 text-center">Dominancia Activa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                {logs.map((log, index) => {
                  const studentDominant = getStudentDominantLog(log.studentId);
                  const isDominant = studentDominant && studentDominant.id === log.id;

                  return (
                    <tr 
                      key={log.id} 
                      className={cn(
                        "transition-all duration-150 hover:bg-slate-50/50",
                        isDominant ? "bg-indigo-50/20 font-bold" : "text-slate-400 bg-white"
                      )}
                    >
                      <td className="py-3.5 px-4 text-slate-850 font-black">{log.studentName}</td>
                      <td className="py-3.5 px-4">{log.time}</td>
                      <td className="py-3.5 px-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded text-[8px] font-black uppercase border",
                          log.source === 'RFID' ? "bg-blue-50 text-blue-700 border-blue-100" :
                          log.source === 'QR' ? "bg-purple-50 text-purple-700 border-purple-100" :
                          "bg-amber-50 text-amber-700 border-amber-100"
                        )}>
                          {log.source} (Prio {PRIORITY_MAP[log.source]})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase",
                          log.state === 'Presente' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          log.state === 'Retardo' ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          log.state === 'Ausencia justificada' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                          "bg-rose-50 text-rose-600 border border-rose-100"
                        )}>
                          {log.state}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px]">{log.device}</td>
                      <td className="py-3.5 px-4">{log.location}</td>
                      <td className="py-3.5 px-4">{log.operator}</td>
                      <td className="py-3.5 px-4 text-center">
                        {isDominant ? (
                          <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-150 px-2 py-0.5 rounded text-[9px] font-black shadow-xs animate-pulse">
                            <Check className="w-3.5 h-3.5" /> DOMINANTE
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-400 px-2 py-0.5 rounded text-[9px] font-bold">
                            Ignorado
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Floating global notification toasts */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 z-[99999] bg-white border shadow-2xl rounded-2xl p-4 max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300",
          toast.type === 'warning' ? 'border-rose-200' : 'border-slate-200'
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-inner",
            toast.type === 'warning' ? 'bg-rose-50 border border-rose-100 text-rose-600' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'
          )}>
            {toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-4 h-4 animate-bounce" />
            )}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-800 tracking-tight leading-none">{toast.title}</h4>
            <p className="text-[10px] font-semibold text-slate-500 leading-relaxed mt-1">{toast.message}</p>
          </div>
        </div>
      )}

    </AppLayout>
  );
}
