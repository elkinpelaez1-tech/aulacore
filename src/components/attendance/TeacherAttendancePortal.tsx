'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, XCircle, AlertTriangle, Clock, Camera, RefreshCw, 
  Smartphone, Laptop, Sparkles, ShieldAlert, Activity, Database, Check, 
  X, ChevronRight, UserCheck, UserX, FileText, Share2, Upload, Wifi, 
  WifiOff, Play, Send, Award, Search, Filter, HelpCircle, Layers, 
  Sliders, Calendar, ArrowRight, Eye, CheckSquare, Square, User, Zap,
  ChevronLeft, Image as ImageIcon, Flashlight, RefreshCcw, Printer, Download
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
  const [showPrintModal, setShowPrintModal] = useState(false);
  
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
      <div className="relative overflow-hidden rounded-2xl select-none bg-slate-100 border border-slate-200/80 transition-all mb-2.5 shadow-2xs hover:shadow-sm">
        {/* Fondo revelado al deslizar */}
        <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none font-bold text-xs uppercase tracking-wider">
          <div className={cn("flex items-center gap-2 text-emerald-600 transition-opacity", translateX > 20 ? "opacity-100" : "opacity-0")}>
            <div className="p-1.5 rounded-full bg-emerald-500/20">
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <span>Deslizar derecha Asistió</span>
          </div>
          <div className={cn("flex items-center gap-2 text-red-600 transition-opacity ml-auto", translateX < -20 ? "opacity-100" : "opacity-0")}>
            <span>Deslizar izquierda No asistió</span>
            <div className="p-1.5 rounded-full bg-red-500/20">
              <UserX className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>

        {/* Fila principal del estudiante */}
        <div 
          className={cn(
            "relative z-10 flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-transform cursor-grab active:cursor-grabbing",
            isPresent && "bg-emerald-50/90 border-l-4 border-l-emerald-500 border border-emerald-200 shadow-sm",
            isAbsent && "bg-red-50/90 border-l-4 border-l-red-500 border border-red-200 shadow-sm",
            isLate && "bg-amber-50/90 border-l-4 border-l-amber-500 border border-amber-200 shadow-sm",
            !isPresent && !isAbsent && !isLate && "bg-white border border-slate-200/80 hover:border-slate-300"
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
                  isPresent ? "border-emerald-500" : isAbsent ? "border-red-500" : "border-slate-200"
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
                <span className="font-extrabold text-sm sm:text-base text-slate-900 truncate">{student.name}</span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded">{student.code}</span>
              </div>
              
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  "text-[10px] font-bold flex items-center gap-1",
                  student.attendanceRate < 80 ? "text-red-600" : "text-slate-500"
                )}>
                  <Activity className="w-3 h-3" /> Histórico: {student.attendanceRate}%
                </span>
                {student.lastNote && (
                  <span className="text-[9px] text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 hidden sm:inline-block">
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
                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 shadow-2xs"
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
                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-2xs"
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
                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 shadow-2xs"
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
      {/* 🖨️ MODAL FORMATO IMPRIMIBLE OFICIAL OCR */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200 print:p-0 print:bg-white print:static print:z-auto print:block">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col print:max-h-none print:border-none print:shadow-none print:rounded-none print:w-full">
            {/* Cabecera del Modal (Oculta al imprimir) */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between rounded-t-3xl sticky top-0 z-10 print:hidden flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl">
                  <Printer className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black">Vista Previa de Planilla OCR Imprimible</h3>
                  <p className="text-xs text-slate-300">Formato oficial calibrado con marcas fiduciales para lectura automática por IA</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Descargar PDF</span>
                </Button>
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CUERPO IMPRIMIBLE DEL FORMATO */}
            <div className="p-8 sm:p-12 space-y-6 text-slate-900 relative print:p-6 print:space-y-4">
              {/* Marcas Fiduciales Superiores */}
              <div className="flex justify-between items-center pb-4 border-b-2 border-slate-900">
                <div className="w-8 h-8 border-t-4 border-l-4 border-slate-900 sm:w-10 sm:h-10 shrink-0" />
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Ecosistema AulaCore – Interoperabilidad y SIMAT</span>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Planilla de Asistencia Docente para OCR</h1>
                  <p className="text-xs font-bold text-slate-700">Asignatura: <span className="underline decoration-indigo-600 font-black">{selectedCourse}</span> | Fecha: <span className="underline decoration-indigo-600">________________________</span></p>
                </div>
                <div className="w-8 h-8 border-t-4 border-r-4 border-slate-900 sm:w-10 sm:h-10 shrink-0" />
              </div>

              {/* Instrucciones de Llenado para el Docente */}
              <div className="bg-slate-100 border border-slate-300 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3 print:bg-slate-50">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-black">1</span>
                  <span>Use lapicero negro o azul oscuro.</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-black">2</span>
                  <span>Marque Asistió con chulo (✓) o cruz (X).</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-black">3</span>
                  <span>Tome la foto encuadrando las esquinas.</span>
                </div>
              </div>

              {/* Tabla Oficial de Estudiantes para Imprimir */}
              <div className="border-2 border-slate-900 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-xs uppercase font-black tracking-wider">
                      <th className="p-3 w-16 text-center border-r border-slate-700">No.</th>
                      <th className="p-3 w-28 border-r border-slate-700">Código</th>
                      <th className="p-3 border-r border-slate-700">Apellidos y Nombres del Estudiante</th>
                      <th className="p-3 w-28 text-center bg-emerald-950/80 border-r border-slate-700">Asistió (✓)</th>
                      <th className="p-3 w-28 text-center bg-red-950/80 border-r border-slate-700">Ausente (X)</th>
                      <th className="p-3 w-28 text-center bg-amber-950/80">Retardo (R)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-xs font-bold text-slate-900">
                    {students.map((st, idx) => (
                      <tr key={st.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                        <td className="p-3 text-center font-black border-r border-slate-300">{idx + 1}</td>
                        <td className="p-3 font-mono text-slate-600 border-r border-slate-300">{st.code}</td>
                        <td className="p-3 font-black text-slate-900 border-r border-slate-300 uppercase">{st.name}</td>
                        <td className="p-3 text-center border-r border-slate-300">
                          <div className="w-6 h-6 border-2 border-slate-400 rounded mx-auto" />
                        </td>
                        <td className="p-3 text-center border-r border-slate-300">
                          <div className="w-6 h-6 border-2 border-slate-400 rounded mx-auto" />
                        </td>
                        <td className="p-3 text-center">
                          <div className="w-6 h-6 border-2 border-slate-400 rounded mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Marcas Fiduciales Inferiores y Firmas */}
              <div className="pt-8 flex justify-between items-end">
                <div className="w-8 h-8 border-b-4 border-l-4 border-slate-900 sm:w-10 sm:h-10 shrink-0" />
                <div className="text-center space-y-1 pb-2">
                  <div className="w-64 border-b-2 border-slate-900 mx-auto" />
                  <span className="text-[11px] font-black uppercase text-slate-700 block">Firma y Cédula del Docente Responsable</span>
                  <span className="text-[9px] text-slate-500 font-mono block">Hash de Verificación OCR: AUC-{selectedCourse}-20250528-SIMAT</span>
                </div>
                <div className="w-8 h-8 border-b-4 border-r-4 border-slate-900 sm:w-10 sm:h-10 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      )}

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
      <div className="bg-gradient-to-r from-indigo-50/80 via-blue-50/40 to-slate-50 border border-indigo-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
              Arquitectura Offline-First (Resiliencia para Zonas Rurales y Urbanas)
              {offlineQueue > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {offlineQueue} pendientes en cola local
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Los tres métodos funcionan al 100% sin internet. Los datos se almacenan de inmediato en <strong className="text-indigo-700">IndexedDB local</strong> y se sincronizan con la secretaría al detectar red.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button 
            onClick={() => setIsOffline(!isOffline)}
            className={cn(
              "text-[10px] font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center shadow-2xs",
              isOffline ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
            )}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-700" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
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
      <div className="bg-slate-100/90 border border-slate-200/80 p-1.5 rounded-2xl flex flex-col sm:flex-row items-center gap-2 shadow-2xs">
        <button 
          onClick={() => setMethod('SWIPE')}
          className={cn(
            "flex-1 w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 border",
            method === 'SWIPE' 
              ? "bg-white text-indigo-700 border-slate-200/80 shadow-md font-black scale-[1.01]" 
              : "bg-transparent text-slate-600 border-transparent hover:bg-white/60 hover:text-slate-900"
          )}
        >
          <Smartphone className={cn("w-4 h-4", method === 'SWIPE' ? "text-indigo-600" : "text-slate-400")} />
          <span>1. Deslizamiento (Swipe Móvil)</span>
          <span className="bg-indigo-100 text-indigo-800 text-[9px] px-1.5 py-0.5 rounded font-black hidden lg:inline">RÁPIDO &lt; 1 MIN</span>
        </button>

        <button 
          onClick={() => setMethod('OCR')}
          className={cn(
            "flex-1 w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 border",
            method === 'OCR' 
              ? "bg-white text-emerald-700 border-slate-200/80 shadow-md font-black scale-[1.01]" 
              : "bg-transparent text-slate-600 border-transparent hover:bg-white/60 hover:text-slate-900"
          )}
        >
          <Camera className={cn("w-4 h-4", method === 'OCR' ? "text-emerald-600" : "text-slate-400")} />
          <span>2. Fotografía (IA + OCR)</span>
          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-black hidden lg:inline">COLEGIOS RURALES</span>
        </button>

        <button 
          onClick={() => setMethod('MANUAL')}
          className={cn(
            "flex-1 w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 border",
            method === 'MANUAL' 
              ? "bg-white text-amber-800 border-slate-200/80 shadow-md font-black scale-[1.01]" 
              : "bg-transparent text-slate-600 border-transparent hover:bg-white/60 hover:text-slate-900"
          )}
        >
          <CheckSquare className={cn("w-4 h-4", method === 'MANUAL' ? "text-amber-600" : "text-slate-400")} />
          <span>3. Manual Tradicional</span>
          <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-black hidden lg:inline">ESCRITORIO / MULTI</span>
        </button>
      </div>

      {/* BARRA DE ACCIONES Y BUSCADOR (COMÚN PARA MÉTODOS 1 Y 3) */}
      {method !== 'OCR' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nombre o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 font-semibold rounded-xl h-10 w-full focus:bg-white focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button 
              onClick={() => handleMarkAll('PRESENT')}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Marcar Todos Presentes (🟢)
            </button>

            <button 
              onClick={() => handleMarkAll('ABSENT')}
              className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200/80 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
            >
              <UserX className="w-3.5 h-3.5 text-red-600" />
              Restantes Ausentes
            </button>

            <button 
              onClick={handleReset}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-slate-500" />
              Reiniciar
            </button>
          </div>
        </div>
      )}

      {/* 🟢 MÉTODO 1: DESLIZAMIENTO MÓVIL (SWIPE) */}
      {method === 'SWIPE' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center px-2 flex-wrap gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Listado de Estudiantes ({filteredStudents.length})
            </span>
            <span className="text-xs text-white font-black bg-indigo-950 px-3.5 py-1.5 rounded-xl border border-indigo-700 shadow-md inline-block tracking-wide">
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
            <Card className="bg-white border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 text-center border">
              <div className="space-y-2">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Motor de Reconocimiento OCR AulaCore
                </span>
                <h3 className="text-xl font-black text-slate-900">Escaneo Inteligente de Listado en Papel</h3>
                <p className="text-xs text-slate-500 font-medium max-w-lg mx-auto">
                  Tome una foto del formato impreso donde marcó asistencia con chulos (✓), equis (X) o círculos. La IA asociará los nombres del curso automáticamente.
                </p>
              </div>

              {/* 📥 BOTÓN DESCARGAR FORMATO OFICIAL OCR */}
              <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-emerald-50/80 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-sm shrink-0">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 flex-wrap">
                      Formato Oficial Imprimible para OCR ({selectedCourse})
                      <Badge className="bg-emerald-600 text-white border-none text-[9px] font-black uppercase">Fiducial 4-Puntos</Badge>
                    </h4>
                    <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                      Descargue o imprima la planilla con el listado del curso. Diligencie las asistencias a mano (✓ o X) y tome la foto para cargarlo automáticamente.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowPrintModal(true)}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-6 rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  <span>Generar Formato PDF</span>
                </Button>
              </div>

              {/* Marco de visor simulado */}
              <div className="relative aspect-3/4 sm:aspect-video max-w-xl mx-auto bg-slate-50 border-2 border-dashed border-indigo-300 rounded-3xl overflow-hidden flex flex-col items-center justify-center p-6 shadow-inner group">
                <div className="absolute inset-4 border border-indigo-300/60 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-indigo-500" />
                    <span className="w-4 h-4 border-t-2 border-r-2 border-indigo-500" />
                  </div>
                  <div className="text-center">
                    <span className="bg-white/95 text-indigo-800 font-mono text-[10px] px-3 py-1 rounded-full border border-indigo-200 shadow-2xs font-bold">
                      🎯 Alinee las columnas de Nombres y Asistencia aquí
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-indigo-500" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-indigo-500" />
                  </div>
                </div>

                <Camera className="w-16 h-16 text-indigo-400 group-hover:scale-110 transition-transform mb-3" />
                <span className="text-sm font-black text-slate-800">Formato de Asistencia 9°A Matemáticas</span>
                <span className="text-xs text-slate-500 mt-1">Asegure buena luz y enfoque sin reflejos</span>
              </div>

              {/* Botones de disparo */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
                <Button 
                  onClick={() => setShowPrintModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm rounded-2xl h-14 px-6 shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-2 border-2 border-indigo-400/40 animate-pulse"
                >
                  <Printer className="w-5 h-5 shrink-0" />
                  <span>📥 Descargar Formato PDF (Llenar a Mano)</span>
                </Button>

                <Button 
                  variant="outline" 
                  onClick={handleStartOcrScan}
                  className="bg-slate-100 text-slate-700 border-slate-250 hover:bg-slate-200 font-bold rounded-2xl h-14 px-5 cursor-pointer shadow-2xs flex items-center gap-2"
                >
                  <ImageIcon className="w-5 h-5 text-indigo-600 shrink-0" /> 
                  <span>Subir Foto de Galería</span>
                </Button>

                <Button 
                  onClick={handleStartOcrScan}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl h-14 px-6 shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Camera className="w-5 h-5 shrink-0" /> 
                  <span>Tomar Fotografía e Identificar</span>
                </Button>
              </div>
            </Card>
          )}

          {/* PASO 2: PROCESANDO OCR */}
          {ocrStep === 'PROCESSING' && (
            <Card className="bg-white border-slate-200/80 rounded-3xl p-12 shadow-sm text-center space-y-6 border">
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                  <circle className="text-slate-100 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                  <circle 
                    className="text-indigo-600 stroke-current transition-all duration-300" 
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
                  <span className="text-2xl text-slate-900">{ocrProgress}%</span>
                  <span className="text-[9px] text-indigo-600 uppercase tracking-widest font-bold">OCR IA</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">Reconociendo texto e identificando marcas...</h3>
                <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                  La IA está correlacionando las firmas y casillas marcadas con el padrón oficial del SIMAT para 9°A.
                </p>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setOcrStep('CAMERA')}
                className="bg-slate-100 text-slate-700 border-slate-250 hover:bg-slate-200 font-bold rounded-xl px-6 cursor-pointer shadow-2xs"
              >
                Cancelar Escaneo
              </Button>
            </Card>
          )}

          {/* PASO 3: REVISIÓN DE OCR */}
          {ocrStep === 'REVIEW' && (
            <Card className="bg-white border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" /> Revisar Asistencia Detectada por IA
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Precisión general del reconocimiento: <strong className="text-emerald-700 font-bold">97.4%</strong>. Verifique y corrija si es necesario antes de guardar.
                  </p>
                </div>
                <Badge className="bg-indigo-50 text-indigo-800 border-indigo-200 font-bold px-3 py-1">
                  8 estudiantes procesados
                </Badge>
              </div>

              <div className="space-y-2.5">
                {ocrResults.map(res => (
                  <div key={res.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs",
                        res.status === 'PRESENT' ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-red-100 text-red-800 border border-red-300"
                      )}>
                        {res.status === 'PRESENT' ? '✓' : 'X'}
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 block">{res.name}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">Confianza IA: {res.confidence}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setOcrResults(prev => prev.map(r => r.id === res.id ? { ...r, status: r.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' } : r));
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs",
                          res.status === 'PRESENT' ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-red-50 hover:bg-red-100 text-red-800 border-red-300"
                        )}
                      >
                        {res.status === 'PRESENT' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-red-600" />}
                        <span>{res.status === 'PRESENT' ? 'Asistió' : 'No Asistió'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  onClick={() => setOcrStep('CAMERA')}
                  className="bg-slate-100 text-slate-700 border-slate-250 hover:bg-slate-200 font-bold rounded-xl cursor-pointer shadow-2xs"
                >
                  Volver a Tomar Foto
                </Button>

                <Button 
                  onClick={handleSaveOcrResults}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  Confirmar y Guardar Asistencia
                </Button>
              </div>
            </Card>
          )}

          {/* PASO 4: GUARDADO EXITOSO OCR */}
          {ocrStep === 'SAVED' && (
            <Card className="bg-white border-emerald-300 rounded-3xl p-8 shadow-sm text-center space-y-6 border">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">¡Asistencia Registrada Correctamente!</h3>
                <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                  El listado se ha vinculado al curso <strong className="text-indigo-600">9°A - Matemáticas</strong> y está en proceso de dispersión hacia el CAT y MIO.
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 max-w-sm mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="text-center px-4 border-r border-slate-200">
                  <span className="text-lg font-black text-emerald-700">6</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Asistieron</span>
                </div>
                <div className="text-center px-4">
                  <span className="text-lg font-black text-red-700">2</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">No Asistieron</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setMethod('SWIPE')}
                  className="bg-slate-100 text-slate-700 border-slate-250 hover:bg-slate-200 font-bold rounded-xl cursor-pointer shadow-2xs"
                >
                  Ver Listado en Vivo
                </Button>

                <Button 
                  onClick={() => { setOcrStep('CAMERA'); showToastMsg('Listo para Nuevo Curso', 'Seleccione otra asignatura arriba para continuar.'); }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 rounded-xl cursor-pointer shadow-md"
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
          <Card className="bg-white border-slate-200/80 rounded-3xl overflow-hidden shadow-sm border">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Tabla de Registro Manual (Escritorio / Múltiple)</span>
                <Badge className="bg-indigo-50 text-indigo-800 border-indigo-200 text-[10px] font-bold">
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
                  className="bg-white text-slate-700 border-slate-300 hover:bg-slate-100 text-xs font-bold h-8 cursor-pointer shadow-2xs"
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
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 cursor-pointer shadow-2xs"
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
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold h-8 cursor-pointer shadow-2xs"
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
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    <th className="p-3.5 w-12 text-center">Sel</th>
                    <th className="p-3.5">Estudiante</th>
                    <th className="p-3.5">Código</th>
                    <th className="p-3.5">Histórico</th>
                    <th className="p-3.5 text-center">Estado Actual</th>
                    <th className="p-3.5 text-right">Acción Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredStudents.map(student => {
                    const isSelected = selectedIds.includes(student.id);
                    return (
                      <tr key={student.id} className={cn("hover:bg-slate-50 transition-colors", isSelected && "bg-indigo-50/60")}>
                        <td className="p-3.5 text-center">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => {
                              setSelectedIds(prev => isSelected ? prev.filter(i => i !== student.id) : [...prev, student.id]);
                            }}
                            className="w-4 h-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs" />
                            <div>
                              <span className="font-extrabold text-slate-900 block">{student.name}</span>
                              {student.lastNote && <span className="text-[10px] text-amber-800 font-semibold">📌 {student.lastNote}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-slate-600 text-[11px]">{student.code}</td>
                        <td className="p-3.5">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold",
                            student.attendanceRate < 80 ? "bg-red-50 text-red-700 border border-red-200" : "bg-slate-100 text-slate-600 border border-slate-200/60"
                          )}>
                            {student.attendanceRate}%
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <Badge className={cn(
                            "text-[10px] font-black uppercase px-2.5 py-1",
                            student.status === 'PRESENT' && "bg-emerald-50 text-emerald-800 border-emerald-300",
                            student.status === 'ABSENT' && "bg-red-50 text-red-800 border-red-300",
                            student.status === 'LATE' && "bg-amber-50 text-amber-800 border-amber-300",
                            student.status === 'PENDING' && "bg-slate-100 text-slate-600 border-slate-200/80"
                          )}>
                            {student.status === 'PRESENT' ? '✓ Asistió' : student.status === 'ABSENT' ? 'X Ausente' : student.status === 'LATE' ? '⏳ Retardo' : '• Pendiente'}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button 
                              onClick={() => handleUpdateStatus(student.id, 'PRESENT')}
                              className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 cursor-pointer transition-colors shadow-2xs"
                            >
                              Presente
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(student.id, 'ABSENT')}
                              className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-800 text-[10px] font-bold border border-red-200 cursor-pointer transition-colors shadow-2xs"
                            >
                              Ausente
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(student.id, 'LATE')}
                              className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 cursor-pointer transition-colors shadow-2xs"
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
      <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-40 bg-white/95 border-t border-slate-200 p-4 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-center">
              <span className="text-xs sm:text-sm font-black text-red-600 block">{absentCount}</span>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">No asistieron</span>
            </div>

            <div className="text-center border-l border-slate-200 pl-4 sm:pl-6">
              <span className="text-xs sm:text-sm font-black text-amber-600 block">{pendingCount}</span>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Pendientes</span>
            </div>

            <div className="text-center border-l border-slate-200 pl-4 sm:pl-6">
              <span className="text-xs sm:text-sm font-black text-emerald-600 block">{presentCount}</span>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Asistieron</span>
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
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs sm:text-sm px-8 py-6 rounded-2xl shadow-md transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Finalizar y Guardar ({totalStudents - pendingCount}/{totalStudents})</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* PANEL INTEGRACIÓN ECOSISTEMA AULACORE */}
      <div className="mt-8 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 border border-slate-200/80 p-6 rounded-3xl space-y-5 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-3.5">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
            Ingesta e Interoperabilidad en el Ecosistema AulaCore (En Vivo)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs hover:shadow-md transition-shadow">
            <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">1. Observador</span>
            <span className="text-sm font-black text-emerald-700 flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0" /> Anotación Autom.
            </span>
            <span className="text-xs font-semibold text-slate-600 block leading-relaxed">Registra historial en hoja de vida</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs hover:shadow-md transition-shadow">
            <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">2. Bus MIO</span>
            <span className="text-sm font-black text-indigo-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 shrink-0" /> Sincronizado
            </span>
            <span className="text-xs font-semibold text-slate-600 block leading-relaxed">Cola asíncrona SIMAT activa</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs hover:shadow-md transition-shadow">
            <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">3. Alertas CAT</span>
            <span className="text-sm font-black text-amber-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" /> Umbral &gt; 20%
            </span>
            <span className="text-xs font-semibold text-slate-600 block leading-relaxed">Aviso a padres por WhatsApp/SMS</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs hover:shadow-md transition-shadow">
            <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">4. CIE Analítica</span>
            <span className="text-sm font-black text-blue-700 flex items-center gap-1.5">
              <Activity className="w-4 h-4 shrink-0" /> Mapa de Calor
            </span>
            <span className="text-xs font-semibold text-slate-600 block leading-relaxed">Actualiza ausentismo municipal</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs hover:shadow-md transition-shadow">
            <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">5. AulaHelp IA</span>
            <span className="text-sm font-black text-purple-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 shrink-0" /> Copiloto Activo
            </span>
            <span className="text-xs font-semibold text-slate-600 block leading-relaxed">Sugiere tutorías para rezagados</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs hover:shadow-md transition-shadow">
            <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">6. Modo Offline</span>
            <span className={cn("text-sm font-black flex items-center gap-1.5", isOffline ? "text-amber-700" : "text-emerald-700")}>
              {isOffline ? <WifiOff className="w-4 h-4 shrink-0" /> : <Wifi className="w-4 h-4 shrink-0" />}
              {isOffline ? "IndexedDB Guardando" : "Conexión 100%"}
            </span>
            <span className="text-xs font-semibold text-slate-600 block leading-relaxed">Resiliencia sin internet garantizada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
