'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, XCircle, AlertTriangle, Clock, Camera, RefreshCw, 
  Smartphone, Laptop, Sparkles, ShieldAlert, Activity, Database, Check, 
  X, ChevronRight, UserCheck, UserX, FileText, Share2, Upload, Wifi, 
  WifiOff, Play, Send, Award, Search, Filter, HelpCircle, Layers, 
  Sliders, Calendar, ArrowRight, Eye, CheckSquare, Square, User, Zap,
  ChevronLeft, Image as ImageIcon, Flashlight, RefreshCcw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type AttendanceStatus = 'PENDING' | 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type CaptureMethod = 'SWIPE' | 'OCR' | 'MANUAL';

export interface StudentAttendanceItem {
  id: string;
  name: string;
  code: string;
  avatar: string;
  status: AttendanceStatus;
  attendanceRate: number; // Porcentaje histórico para CAT
  lastNote?: string;
  isRisk?: boolean;
}

const INITIAL_CLASS_STUDENTS: StudentAttendanceItem[] = [
  { id: 'st-1', name: 'María González', code: '9A-01', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'PENDING', attendanceRate: 96 },
  { id: 'st-2', name: 'Juan Pérez', code: '9A-02', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', status: 'PENDING', attendanceRate: 78, isRisk: true, lastNote: 'Ausentismo recurrente los lunes' },
  { id: 'st-3', name: 'Laura Ramírez', code: '9A-03', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', status: 'PENDING', attendanceRate: 92 },
  { id: 'st-4', name: 'Sebastián López', code: '9A-04', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', status: 'PENDING', attendanceRate: 88 },
  { id: 'st-5', name: 'Valentina Morales', code: '9A-05', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', status: 'PENDING', attendanceRate: 98 },
  { id: 'st-6', name: 'David Quintero', code: '9A-06', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', status: 'PENDING', attendanceRate: 81, isRisk: true },
  { id: 'st-7', name: 'Sofía Medina', code: '9A-07', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', status: 'PENDING', attendanceRate: 95 },
  { id: 'st-8', name: 'Tomás Cardona', code: '9A-08', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', status: 'PENDING', attendanceRate: 90 },
  { id: 'st-9', name: 'Camila Restrepo', code: '9A-09', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', status: 'PENDING', attendanceRate: 94 },
  { id: 'st-10', name: 'Mateo Álvarez', code: '9A-10', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', status: 'PENDING', attendanceRate: 85 },
  { id: 'st-11', name: 'Daniela Salazar', code: '9A-11', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', status: 'PENDING', attendanceRate: 97 },
  { id: 'st-12', name: 'Alejandro Gómez', code: '9A-12', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&auto=format&fit=crop&q=80', status: 'PENDING', attendanceRate: 89 },
];

export function TeacherAttendancePortal() {
  const [method, setMethod] = useState<CaptureMethod>('SWIPE');
  const [selectedCourse, setSelectedCourse] = useState('9A-MATH');
  const [students, setStudents] = useState<StudentAttendanceItem[]>(INITIAL_CLASS_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // OCR Flow States
  const [ocrStep, setOcrStep] = useState<'CAMERA' | 'PROCESSING' | 'REVIEW' | 'SAVED'>('CAMERA');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResults, setOcrResults] = useState<{ id: string; name: string; status: AttendanceStatus; confidence: number }[]>([]);

  // Manual Table states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // System Notification Toast
  const [toast, setToast] = useState<{ title: string; desc: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToastMsg = (title: string, desc: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToast({ title, desc, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Simular detección offline
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync Offline Queue
  const handleSyncOfflineQueue = () => {
    if (offlineQueue === 0) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const syncedCount = offlineQueue;
      setOfflineQueue(0);
      showToastMsg(
        'Sincronización Exitosa (MIO & IndexedDB)',
        `Se enviaron ${syncedCount} registros offline al bus central, actualizando Observador y CAT en tiempo real.`,
        'success'
      );
    }, 1200);
  };

  // Update status for a student
  const handleUpdateStatus = (id: string, newStatus: AttendanceStatus) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        // Disparar alerta CAT si es ausente y está en riesgo o baja asistencia
        if (newStatus === 'ABSENT' && (s.attendanceRate < 80 || s.isRisk)) {
          showToastMsg(
            '🚨 Alerta Automática CAT Disparada',
            `Inasistencia registrada para ${s.name} (Tasa: ${s.attendanceRate}%). Se notificó al acudiente vía WhatsApp y se activó el protocolo en el Observador.`,
            'alert'
          );
        }
        return { ...s, status: newStatus };
      }
      return s;
    }));

    if (isOffline) {
      setOfflineQueue(prev => prev + 1);
    }
  };

  // Mark all remaining
  const handleMarkAll = (targetStatus: AttendanceStatus) => {
    setStudents(prev => prev.map(s => s.status === 'PENDING' ? { ...s, status: targetStatus } : s));
    showToastMsg(
      'Actualización Rápida',
      `Estudiantes pendientes marcados como ${targetStatus === 'PRESENT' ? 'Presente' : 'Ausente'}.`,
      'info'
    );
  };

  // Reset all
  const handleReset = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'PENDING' })));
    setOcrStep('CAMERA');
    setSelectedIds([]);
    showToastMsg('Asistencia Reiniciada', 'Todos los estudiantes están nuevamente pendientes de registro.', 'info');
  };

  // Swipe Action Handler Component
  const SwipeStudentRow = ({ student }: { student: StudentAttendanceItem }) => {
    const [translateX, setTranslateX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef(0);

    const handleStart = (clientX: number) => {
      setIsDragging(true);
      startXRef.current = clientX;
    };

    const handleMove = (clientX: number) => {
      if (!isDragging) return;
      const delta = clientX - startXRef.current;
      // Limitar arrastre a +/- 140px
      if (delta > -140 && delta < 140) {
        setTranslateX(delta);
      }
    };

    const handleEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (translateX > 75) {
        handleUpdateStatus(student.id, 'PRESENT');
      } else if (translateX < -75) {
        handleUpdateStatus(student.id, 'ABSENT');
      }
      setTranslateX(0);
    };

    const isPresent = student.status === 'PRESENT';
    const isAbsent = student.status === 'ABSENT';
    const isLate = student.status === 'LATE';

    return (
      <div className="relative overflow-hidden rounded-2xl select-none bg-slate-900/60 border border-slate-800 transition-all mb-2.5">
        {/* Fondo revelado al deslizar */}
        <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none font-bold text-xs uppercase tracking-wider">
          <div className={cn("flex items-center gap-2 text-emerald-400 transition-opacity", translateX > 20 ? "opacity-100" : "opacity-0")}>
            <div className="p-1.5 rounded-full bg-emerald-500/20">
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span>Deslizar derecha Asistió</span>
          </div>
          <div className={cn("flex items-center gap-2 text-red-400 transition-opacity ml-auto", translateX < -20 ? "opacity-100" : "opacity-0")}>
            <span>Deslizar izquierda No asistió</span>
            <div className="p-1.5 rounded-full bg-red-500/20">
              <UserX className="w-4 h-4 text-red-400" />
            </div>
          </div>
        </div>

        {/* Fila principal del estudiante */}
        <div 
          className={cn(
            "relative z-10 flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-transform cursor-grab active:cursor-grabbing",
            isPresent && "bg-emerald-950/40 border-l-4 border-l-emerald-500",
            isAbsent && "bg-red-950/40 border-l-4 border-l-red-500",
            isLate && "bg-amber-950/40 border-l-4 border-l-amber-500",
            !isPresent && !isAbsent && !isLate && "bg-slate-900"
          )}
          style={{ transform: `translateX(${translateX}px)` }}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
          onTouchEnd={handleEnd}
          onMouseDown={(e) => handleStart(e.clientX)}
          onMouseMove={(e) => isDragging && handleMove(e.clientX)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <img 
                src={student.avatar} 
                alt={student.name} 
                className={cn(
                  "w-11 h-11 rounded-full object-cover border-2 shadow-sm",
                  isPresent ? "border-emerald-500" : isAbsent ? "border-red-500" : "border-slate-700"
                )}
              />
              {student.isRisk && (
                <span className="absolute -bottom-1 -right-1 bg-red-600 text-white p-0.5 rounded-full shadow" title="Alerta CAT: Riesgo de deserción por ausentismo">
                  <AlertTriangle className="w-3 h-3" />
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base text-white truncate">{student.name}</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">{student.code}</span>
              </div>
              
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  "text-[10px] font-bold flex items-center gap-1",
                  student.attendanceRate < 80 ? "text-red-400" : "text-slate-400"
                )}>
                  <Activity className="w-3 h-3" /> Histórico: {student.attendanceRate}%
                </span>
                {student.lastNote && (
                  <span className="text-[9px] text-amber-400/90 font-medium bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-900/40 hidden sm:inline-block">
                    📌 {student.lastNote}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botones rápidos de toque (Para usuarios de escritorio o toque rápido en móvil) */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button 
              onClick={() => handleUpdateStatus(student.id, 'PRESENT')}
              className={cn(
                "p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border",
                isPresent 
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-md scale-105" 
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-emerald-950/60 hover:text-emerald-400 hover:border-emerald-800"
              )}
              title="Marcar Asistió (Deslizar derecha)"
            >
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Asistió</span>
            </button>

            <button 
              onClick={() => handleUpdateStatus(student.id, 'ABSENT')}
              className={cn(
                "p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border",
                isAbsent 
                  ? "bg-red-600 text-white border-red-500 shadow-md scale-105" 
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-red-950/60 hover:text-red-400 hover:border-red-800"
              )}
              title="Marcar No Asistió (Deslizar izquierda)"
            >
              <UserX className="w-4 h-4" />
              <span className="hidden sm:inline">Ausente</span>
            </button>

            <button 
              onClick={() => handleUpdateStatus(student.id, 'LATE')}
              className={cn(
                "p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                isLate 
                  ? "bg-amber-600 text-white border-amber-500 shadow-md" 
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-amber-950/60 hover:text-amber-400 hover:border-amber-800"
              )}
              title="Marcar Retardo / Excusa"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Trigger OCR Simulation
  const handleStartOcrScan = () => {
    setOcrStep('PROCESSING');
    setOcrProgress(0);

    const interval = setInterval(() => {
      setOcrProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setOcrStep('REVIEW');
          // Simular resultados reconocidos del papel
          setOcrResults([
            { id: 'st-1', name: 'María González', status: 'PRESENT', confidence: 99 },
            { id: 'st-2', name: 'Juan Pérez', status: 'ABSENT', confidence: 96 },
            { id: 'st-3', name: 'Laura Ramírez', status: 'PRESENT', confidence: 98 },
            { id: 'st-4', name: 'Sebastián López', status: 'PRESENT', confidence: 97 },
            { id: 'st-5', name: 'Valentina Morales', status: 'PRESENT', confidence: 99 },
            { id: 'st-6', name: 'David Quintero', status: 'ABSENT', confidence: 92 },
            { id: 'st-7', name: 'Sofía Medina', status: 'PRESENT', confidence: 98 },
            { id: 'st-8', name: 'Tomás Cardona', status: 'PRESENT', confidence: 99 },
          ]);
          return 100;
        }
        return prev + 25;
      });
    }, 450);
  };

  // Apply OCR results to students
  const handleSaveOcrResults = () => {
    setStudents(prev => prev.map(s => {
      const recognized = ocrResults.find(r => r.id === s.id);
      return recognized ? { ...s, status: recognized.status } : s;
    }));
    setOcrStep('SAVED');
    showToastMsg(
      '✅ Asistencia por OCR Registrada',
      'La IA identificó nombres y marcas de asistencia (✓ y X) con una precisión promedio del 97.2%. Datos cargados en el Observador.',
      'success'
    );
  };

  // Contadores
  const presentCount = students.filter(s => s.status === 'PRESENT' || s.status === 'LATE').length;
  const absentCount = students.filter(s => s.status === 'ABSENT').length;
  const pendingCount = students.filter(s => s.status === 'PENDING').length;
  const totalStudents = students.length;

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Toast Notificador */}
      {toast && (
        <div className={cn(
          "fixed bottom-28 right-6 z-50 max-w-md p-4 rounded-2xl shadow-2xl border flex items-start gap-3.5 animate-bounce-in",
          toast.type === 'alert' ? "bg-red-950/95 border-red-600 text-white" :
          toast.type === 'info' ? "bg-blue-950/95 border-blue-600 text-white" : "bg-emerald-950/95 border-emerald-600 text-white"
        )}>
          {toast.type === 'alert' ? <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" /> : 
           toast.type === 'info' ? <Sparkles className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" /> : 
           <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />}
          <div>
            <h4 className="font-black text-sm">{toast.title}</h4>
            <p className="text-xs font-medium text-slate-200 mt-1 leading-relaxed">{toast.desc}</p>
          </div>
        </div>
      )}

      {/* HEADER PRINCIPAL MÓVIL / ESCRITORIO */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> Portal Docente Móvil & Offline
            </span>
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] font-extrabold uppercase px-2 py-0.5 flex items-center gap-1",
                isOffline ? "bg-amber-950/60 text-amber-400 border-amber-800" : "bg-emerald-950/60 text-emerald-400 border-emerald-800"
              )}
            >
              {isOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              {isOffline ? "Modo Offline Activo (IndexedDB)" : "Conectado al bus MIO en tiempo real"}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            Asistencia en Clase – Docentes
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-3xl leading-relaxed">
            Toma de asistencia rápida, intuitiva y sin conexión desde su dispositivo móvil o escritorio. El registro alimenta automáticamente el Observador, CAT, CIE y el motor AulaHelp IA.
          </p>
        </div>

        {/* SELECTOR DE CURSO Y FECHA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-2xl shrink-0">
          <div className="space-y-1">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Asignatura / Curso</label>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-slate-900 text-white font-bold text-xs rounded-xl px-3 py-2 border border-slate-700 outline-none focus:border-indigo-500 cursor-pointer w-full sm:w-auto"
            >
              <option value="9A-MATH">📐 9°A – Matemáticas (07:00 - 08:30)</option>
              <option value="10B-PHYS">⚡ 10°B – Física Avanzada (08:30 - 10:00)</option>
              <option value="11A-CALC">📈 11°A – Cálculo y Geometría (10:30 - 12:00)</option>
              <option value="8C-STAT">📊 8°C – Estadística (12:00 - 01:30)</option>
            </select>
          </div>

          <div className="sm:border-l sm:border-slate-800 sm:pl-3 space-y-1">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Fecha de Registro</label>
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mié, 28 de mayo de 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* BANNER DE COMPATIBILIDAD OFFLINE E INDEXEDDB */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              Arquitectura Offline-First (Resiliencia para Zonas Rurales y Urbanas)
              {offlineQueue > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {offlineQueue} pendientes en cola local
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Los tres métodos funcionan al 100% sin internet. Los datos se almacenan de inmediato en <strong className="text-indigo-300">IndexedDB local</strong> y se sincronizan con la secretaría al detectar red.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button 
            onClick={() => setIsOffline(!isOffline)}
            className={cn(
              "text-[10px] font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center",
              isOffline ? "bg-amber-950 text-amber-300 border-amber-800" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
            )}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            {isOffline ? "Simular Conectar Internet" : "Simular Corte (Modo Offline)"}
          </button>

          {offlineQueue > 0 && (
            <button 
              onClick={handleSyncOfflineQueue}
              disabled={isSyncing || isOffline}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shrink-0"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
              Sincronizar Cola ({offlineQueue})
            </button>
          )}
        </div>
      </div>

      {/* PESTAÑAS DE LOS 3 MÉTODOS DE CAPTURA */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-col sm:flex-row items-center gap-2 shadow-sm">
        <button 
          onClick={() => setMethod('SWIPE')}
          className={cn(
            "flex-1 w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 border",
            method === 'SWIPE' 
              ? "bg-indigo-600 text-white border-indigo-500 shadow-lg scale-[1.01]" 
              : "bg-slate-800/60 text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200"
          )}
        >
          <Smartphone className="w-4 h-4 text-indigo-300" />
          <span>1. Deslizamiento (Swipe Móvil)</span>
          <span className="bg-indigo-950 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded font-black hidden lg:inline">RÁPIDO &lt; 1 MIN</span>
        </button>

        <button 
          onClick={() => setMethod('OCR')}
          className={cn(
            "flex-1 w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 border",
            method === 'OCR' 
              ? "bg-indigo-600 text-white border-indigo-500 shadow-lg scale-[1.01]" 
              : "bg-slate-800/60 text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200"
          )}
        >
          <Camera className="w-4 h-4 text-emerald-300" />
          <span>2. Fotografía (IA + OCR)</span>
          <span className="bg-emerald-950 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-black hidden lg:inline">COLEGIOS RURALES</span>
        </button>

        <button 
          onClick={() => setMethod('MANUAL')}
          className={cn(
            "flex-1 w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 border",
            method === 'MANUAL' 
              ? "bg-indigo-600 text-white border-indigo-500 shadow-lg scale-[1.01]" 
              : "bg-slate-800/60 text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200"
          )}
        >
          <CheckSquare className="w-4 h-4 text-amber-300" />
          <span>3. Manual Tradicional</span>
          <span className="bg-amber-950 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-black hidden lg:inline">ESCRITORIO / MULTI</span>
        </button>
      </div>

      {/* BARRA DE ACCIONES Y BUSCADOR (COMÚN PARA MÉTODOS 1 Y 3) */}
      {method !== 'OCR' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Buscar por nombre o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-950 border-slate-800 text-white text-xs font-semibold rounded-xl h-10 w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button 
              onClick={() => handleMarkAll('PRESENT')}
              className="bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Marcar Todos Presentes (🟢)
            </button>

            <button 
              onClick={() => handleMarkAll('ABSENT')}
              className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <UserX className="w-3.5 h-3.5" />
              Restantes Ausentes
            </button>

            <button 
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Reiniciar
            </button>
          </div>
        </div>
      )}

      {/* 🟢 MÉTODO 1: DESLIZAMIENTO MÓVIL (SWIPE) */}
      {method === 'SWIPE' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Listado de Estudiantes ({filteredStudents.length})
            </span>
            <span className="text-[11px] text-indigo-400 font-bold bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-900/40 hidden sm:inline-block">
              💡 Tip: Deslice la tarjeta a la derecha (Presente) o izquierda (Ausente)
            </span>
          </div>

          <div className="space-y-2">
            {filteredStudents.map(student => (
              <SwipeStudentRow key={student.id} student={student} />
            ))}
          </div>
        </div>
      )}

      {/* 📸 MÉTODO 2: ASISTENCIA POR FOTOGRAFÍA (IA + OCR) */}
      {method === 'OCR' && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
          
          {/* PASO 1: VISOR DE CÁMARA */}
          {ocrStep === 'CAMERA' && (
            <Card className="bg-slate-900 border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-center border">
              <div className="space-y-2">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Motor de Reconocimiento OCR AulaCore
                </span>
                <h3 className="text-xl font-black text-white">Escaneo Inteligente de Listado en Papel</h3>
                <p className="text-xs text-slate-400 font-medium max-w-lg mx-auto">
                  Tome una foto del formato impreso donde marcó asistencia con chulos (✓), equis (X) o círculos. La IA asociará los nombres del curso automáticamente.
                </p>
              </div>

              {/* Marco de visor simulado */}
              <div className="relative aspect-3/4 sm:aspect-video max-w-xl mx-auto bg-slate-950 border-2 border-dashed border-indigo-500/50 rounded-3xl overflow-hidden flex flex-col items-center justify-center p-6 shadow-inner group">
                <div className="absolute inset-4 border border-indigo-500/30 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                    <span className="w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
                  </div>
                  <div className="text-center">
                    <span className="bg-slate-900/90 text-indigo-300 font-mono text-[10px] px-3 py-1 rounded-full border border-indigo-500/30 shadow">
                      🎯 Alinee las columnas de Nombres y Asistencia aquí
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
                  </div>
                </div>

                <Camera className="w-16 h-16 text-indigo-500/40 group-hover:scale-110 transition-transform mb-3" />
                <span className="text-sm font-black text-slate-300">Formato de Asistencia 9°A Matemáticas</span>
                <span className="text-xs text-slate-500 mt-1">Asegure buena luz y enfoque sin reflejos</span>
              </div>

              {/* Botones de disparo */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <Button 
                  variant="outline" 
                  onClick={handleStartOcrScan}
                  className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 font-bold rounded-2xl h-12 px-5 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 mr-2 text-indigo-400" /> Subir Foto de Galería
                </Button>

                <Button 
                  onClick={handleStartOcrScan}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl h-14 px-8 shadow-xl hover:scale-105 transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5 mr-2" /> Tomar Fotografía e Identificar
                </Button>
              </div>
            </Card>
          )}

          {/* PASO 2: PROCESANDO OCR */}
          {ocrStep === 'PROCESSING' && (
            <Card className="bg-slate-900 border-slate-800 rounded-3xl p-12 shadow-xl text-center space-y-6 border">
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                  <circle className="text-slate-800 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                  <circle 
                    className="text-indigo-500 stroke-current transition-all duration-300" 
                    strokeWidth="8" 
                    strokeDasharray={251.2} 
                    strokeDashoffset={251.2 - (251.2 * ocrProgress) / 100} 
                    strokeLinecap="round" 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-black">
                  <span className="text-2xl text-white">{ocrProgress}%</span>
                  <span className="text-[9px] text-indigo-400 uppercase tracking-widest">OCR IA</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-white">Reconociendo texto e identificando marcas...</h3>
                <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
                  La IA está correlacionando las firmas y casillas marcadas con el padrón oficial del SIMAT para 9°A.
                </p>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setOcrStep('CAMERA')}
                className="bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750 font-bold rounded-xl px-6 cursor-pointer"
              >
                Cancelar Escaneo
              </Button>
            </Card>
          )}

          {/* PASO 3: REVISIÓN DE OCR */}
          {ocrStep === 'REVIEW' && (
            <Card className="bg-slate-900 border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" /> Revisar Asistencia Detectada por IA
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Precisión general del reconocimiento: <strong className="text-emerald-400 font-bold">97.4%</strong>. Verifique y corrija si es necesario antes de guardar.
                  </p>
                </div>
                <Badge className="bg-indigo-950 text-indigo-300 border-indigo-800 font-bold px-3 py-1">
                  8 estudiantes procesados
                </Badge>
              </div>

              <div className="space-y-2.5">
                {ocrResults.map(res => (
                  <div key={res.id} className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs",
                        res.status === 'PRESENT' ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"
                      )}>
                        {res.status === 'PRESENT' ? '✓' : 'X'}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-white block">{res.name}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">Confianza IA: {res.confidence}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setOcrResults(prev => prev.map(r => r.id === res.id ? { ...r, status: r.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' } : r));
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1",
                          res.status === 'PRESENT' ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-red-950 text-red-400 border-red-800"
                        )}
                      >
                        {res.status === 'PRESENT' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        <span>{res.status === 'PRESENT' ? 'Asistió' : 'No Asistió'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button 
                  variant="outline" 
                  onClick={() => setOcrStep('CAMERA')}
                  className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 font-bold rounded-xl cursor-pointer"
                >
                  Volver a Tomar Foto
                </Button>

                <Button 
                  onClick={handleSaveOcrResults}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-lg"
                >
                  Confirmar y Guardar Asistencia
                </Button>
              </div>
            </Card>
          )}

          {/* PASO 4: GUARDADO EXITOSO OCR */}
          {ocrStep === 'SAVED' && (
            <Card className="bg-slate-900 border-emerald-800/50 rounded-3xl p-8 shadow-xl text-center space-y-6 border">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">¡Asistencia Registrada Correctamente!</h3>
                <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
                  El listado se ha vinculado al curso <strong className="text-indigo-300">9°A - Matemáticas</strong> y está en proceso de dispersión hacia el CAT y MIO.
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 max-w-sm mx-auto bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-center px-4 border-r border-slate-800">
                  <span className="text-lg font-black text-emerald-400">6</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Asistieron</span>
                </div>
                <div className="text-center px-4">
                  <span className="text-lg font-black text-red-400">2</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">No Asistieron</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setMethod('SWIPE')}
                  className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 font-bold rounded-xl cursor-pointer"
                >
                  Ver Listado en Vivo
                </Button>

                <Button 
                  onClick={() => { setOcrStep('CAMERA'); showToastMsg('Listo para Nuevo Curso', 'Seleccione otra asignatura arriba para continuar.'); }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 rounded-xl cursor-pointer"
                >
                  Escanear Otro Listado
                </Button>
              </div>
            </Card>
          )}

        </div>
      )}

      {/* 📋 MÉTODO 3: REGISTRO MANUAL TRADICIONAL */}
      {method === 'MANUAL' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl border">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">Tabla de Registro Manual (Escritorio / Múltiple)</span>
                <Badge className="bg-indigo-950 text-indigo-300 border-indigo-800 text-[10px] font-bold">
                  {selectedIds.length} seleccionados
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    if (selectedIds.length === filteredStudents.length) setSelectedIds([]);
                    else setSelectedIds(filteredStudents.map(s => s.id));
                  }}
                  className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 text-xs font-bold h-8 cursor-pointer"
                >
                  {selectedIds.length === filteredStudents.length ? "Desmarcar Todos" : "Seleccionar Todos"}
                </Button>

                {selectedIds.length > 0 && (
                  <>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setStudents(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, status: 'PRESENT' } : s));
                        setSelectedIds([]);
                        showToastMsg('Acción Masiva', `Se marcaron ${selectedIds.length} estudiantes como Presente.`, 'success');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 cursor-pointer"
                    >
                      ✓ Marcar Presentes
                    </Button>

                    <Button 
                      size="sm"
                      onClick={() => {
                        setStudents(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, status: 'ABSENT' } : s));
                        setSelectedIds([]);
                        showToastMsg('Acción Masiva', `Se marcaron ${selectedIds.length} estudiantes como Ausente.`, 'alert');
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold h-8 cursor-pointer"
                    >
                      X Marcar Ausentes
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    <th className="p-3.5 w-12 text-center">Sel</th>
                    <th className="p-3.5">Estudiante</th>
                    <th className="p-3.5">Código</th>
                    <th className="p-3.5">Histórico</th>
                    <th className="p-3.5 text-center">Estado Actual</th>
                    <th className="p-3.5 text-right">Acción Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-semibold text-slate-300">
                  {filteredStudents.map(student => {
                    const isSelected = selectedIds.includes(student.id);
                    return (
                      <tr key={student.id} className={cn("hover:bg-slate-800/40 transition-colors", isSelected && "bg-indigo-950/20")}>
                        <td className="p-3.5 text-center">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => {
                              setSelectedIds(prev => isSelected ? prev.filter(i => i !== student.id) : [...prev, student.id]);
                            }}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                            <div>
                              <span className="font-bold text-white block">{student.name}</span>
                              {student.lastNote && <span className="text-[10px] text-amber-400 font-normal">📌 {student.lastNote}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400 text-[11px]">{student.code}</td>
                        <td className="p-3.5">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold",
                            student.attendanceRate < 80 ? "bg-red-950 text-red-400 border border-red-900" : "bg-slate-800 text-slate-400"
                          )}>
                            {student.attendanceRate}%
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <Badge className={cn(
                            "text-[10px] font-black uppercase px-2.5 py-1",
                            student.status === 'PRESENT' && "bg-emerald-950 text-emerald-400 border-emerald-800",
                            student.status === 'ABSENT' && "bg-red-950 text-red-400 border-red-800",
                            student.status === 'LATE' && "bg-amber-950 text-amber-400 border-amber-800",
                            student.status === 'PENDING' && "bg-slate-800 text-slate-400 border-slate-700"
                          )}>
                            {student.status === 'PRESENT' ? '✓ Asistió' : student.status === 'ABSENT' ? 'X Ausente' : student.status === 'LATE' ? '⏳ Retardo' : '• Pendiente'}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button 
                              onClick={() => handleUpdateStatus(student.id, 'PRESENT')}
                              className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 text-[10px] font-bold border border-emerald-800/60 cursor-pointer transition-colors"
                            >
                              Presente
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(student.id, 'ABSENT')}
                              className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900 text-red-400 text-[10px] font-bold border border-red-800/60 cursor-pointer transition-colors"
                            >
                              Ausente
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(student.id, 'LATE')}
                              className="px-2 py-1 rounded bg-amber-950/60 hover:bg-amber-900 text-amber-400 text-[10px] font-bold border border-amber-800/60 cursor-pointer transition-colors"
                            >
                              Retardo
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* FOOTER EJECUTIVO FIJO ESTILO MÓVIL (RESUMEN EN VIVO) */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-40 bg-slate-950/95 border-t border-slate-800 p-4 backdrop-blur-md shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-center">
              <span className="text-xs sm:text-sm font-black text-red-400 block">{absentCount}</span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">No asistieron</span>
            </div>

            <div className="text-center border-l border-slate-800 pl-4 sm:pl-6">
              <span className="text-xs sm:text-sm font-black text-amber-400 block">{pendingCount}</span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Pendientes</span>
            </div>

            <div className="text-center border-l border-slate-800 pl-4 sm:pl-6">
              <span className="text-xs sm:text-sm font-black text-emerald-400 block">{presentCount}</span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Asistieron</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button 
              onClick={() => {
                showToastMsg(
                  '🎉 ¡Asistencia Finalizada y Guardada!',
                  `Se registró la asistencia de ${totalStudents - pendingCount} de ${totalStudents} estudiantes en el curso ${selectedCourse}. Datos integrados al MIO, Observador y CAT.`,
                  'success'
                );
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs sm:text-sm px-8 py-6 rounded-2xl shadow-xl transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Finalizar y Guardar ({totalStudents - pendingCount}/{totalStudents})</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* PANEL INTEGRACIÓN ECOSISTEMA AULACORE */}
      <div className="mt-8 bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            Ingesta e Interoperabilidad en el Ecosistema AulaCore (En Vivo)
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase">1. Observador</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Anotación Autom.
            </span>
            <span className="text-[9px] text-slate-500 block">Registra historial en hoja de vida</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase">2. Bus MIO</span>
            <span className="font-bold text-indigo-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Sincronizado
            </span>
            <span className="text-[9px] text-slate-500 block">Cola asíncrona SIMAT activa</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase">3. Alertas CAT</span>
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Umbral &gt; 20%
            </span>
            <span className="text-[9px] text-slate-500 block">Aviso a padres por WhatsApp/SMS</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase">4. CIE Analítica</span>
            <span className="font-bold text-blue-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Mapa de Calor
            </span>
            <span className="text-[9px] text-slate-500 block">Actualiza ausentismo municipal</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase">5. AulaHelp IA</span>
            <span className="font-bold text-purple-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Copiloto Activo
            </span>
            <span className="text-[9px] text-slate-500 block">Sugiere tutorías para rezagados</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase">6. Modo Offline</span>
            <span className={cn("font-bold flex items-center gap-1", isOffline ? "text-amber-400" : "text-emerald-400")}>
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              {isOffline ? "IndexedDB Guardando" : "Conexión 100%"}
            </span>
            <span className="text-[9px] text-slate-500 block">Resiliencia sin internet garantizada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
