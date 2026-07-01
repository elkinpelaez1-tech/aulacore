'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  ArrowLeft, 
  Search, 
  Plus, 
  Award, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Users, 
  BookOpen, 
  FileCheck,
  Scale,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  grade: string;
  avatar: string;
  attendanceRate: number;
  gpa: number;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    points: number;
  }>;
  behaviorLogs: Array<{
    id: string;
    type: 'Tipo I' | 'Tipo II' | 'Tipo III';
    title: string;
    description: string;
    date: string;
    status: 'Bajo Seguimiento' | 'Resuelto' | 'Escalado SED';
    evidence?: string;
  }>;
}

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'STU-001',
    name: 'Sebastián Marín Alzate',
    grade: '11°A - Técnico Comercial',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100',
    attendanceRate: 84,
    gpa: 3.1,
    achievements: [
      { id: 'ACH-1', title: 'Liderazgo Estudiantil', description: 'Elegido representante de grado y mediador escolar del aula.', date: '2026-03-10', points: 40 },
      { id: 'ACH-2', title: 'Feria de Ciencias Municipal', description: 'Segundo lugar con el proyecto de compostaje veredal.', date: '2026-05-15', points: 50 }
    ],
    behaviorLogs: [
      { id: 'BEH-1', type: 'Tipo I', title: 'Discusión en clase', description: 'Conflicto de opinión con compañero durante el taller de matemáticas. Resuelto por mediación.', date: '2026-04-12', status: 'Resuelto' }
    ]
  },
  {
    id: 'STU-002',
    name: 'Valentina Castro Bedoya',
    grade: '10°B - Bachillerato Técnico',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    attendanceRate: 97,
    gpa: 4.6,
    achievements: [
      { id: 'ACH-3', title: 'Excelencia Académica', description: 'Primer puesto del grado con promedio de 4.7.', date: '2026-04-30', points: 100 },
      { id: 'ACH-4', title: 'Líder Ambiental', description: 'Coordinó la jornada escolar de reforestación de la quebrada El Hatillo.', date: '2026-06-05', points: 60 }
    ],
    behaviorLogs: []
  },
  {
    id: 'STU-003',
    name: 'Mateo Calle Osorio',
    grade: '9°A - Básica Secundaria',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    attendanceRate: 72,
    gpa: 2.8,
    achievements: [],
    behaviorLogs: [
      { id: 'BEH-2', type: 'Tipo II', title: 'Acoso verbal (Bullying) reiterado', description: 'Intimidación y apodos sistemáticos hacia un compañero en el comedor escolar del PAE.', date: '2026-06-20', status: 'Bajo Seguimiento', evidence: 'Testimonios escritos y reporte del docente del PAE' }
    ]
  }
];

export default function ObservacionesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Modals / Form States
  const [showLogroForm, setShowLogroForm] = useState(false);
  const [showFaltaForm, setShowFaltaForm] = useState(false);
  
  // Logro Form Inputs
  const [logroTitle, setLogroTitle] = useState('');
  const [logroDesc, setLogroDesc] = useState('');
  const [logroPoints, setLogroPoints] = useState(30);

  // Falta Form Inputs
  const [faltaType, setFaltaType] = useState<'Tipo I' | 'Tipo II' | 'Tipo III'>('Tipo I');
  const [faltaTitle, setFaltaTitle] = useState('');
  const [faltaDesc, setFaltaDesc] = useState('');
  const [faltaEvidence, setFaltaEvidence] = useState('');

  // Pestaña Activa
  const [activeView, setActiveView] = useState<'observador' | 'comite' | 'sync'>('observador');
  const [actas, setActas] = useState<any[]>([
    { id: 'ACT-2026-01', date: '2026-06-22', topic: 'Mediación por caso de intimidación I.E. El Hatillo', attendees: ['Rector', 'Personero', 'Psicólogo', 'Acudientes'], status: 'Firmada Digitalmente', decision: 'Compromiso de conducta restaurativa y acompañamiento por psicología de la SED.' }
  ]);
  const [showActaForm, setShowActaForm] = useState(false);
  const [actaTopic, setActaTopic] = useState('');
  const [actaDecision, setActaDecision] = useState('');

  // Estados del Centro de Sincronización
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [syncStats, setSyncStats] = useState<any>(null);
  const [simulatedOnline, setSimulatedOnline] = useState(true);
  const [syncProgressMsg, setSyncProgressMsg] = useState('');
  const [syncProgressVal, setSyncProgressVal] = useState(0);
  const [isSyncInProgress, setIsSyncInProgress] = useState(false);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);

  useEffect(() => {
    // Inicializar desde localStorage si existe, o usar datos mock
    const saved = localStorage.getItem('school_students');
    if (saved) {
      try {
        setStudents(JSON.parse(saved));
      } catch (e) {
        setStudents(INITIAL_STUDENTS);
      }
    } else {
      setStudents(INITIAL_STUDENTS);
      localStorage.setItem('school_students', JSON.stringify(INITIAL_STUDENTS));
    }

    // Comprobar si se solicitó la pestaña de sincronización
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'sync') {
        setActiveView('sync');
      }
    }
  }, []);

  // Suscribirse a cambios en la cola offline y el estado de red
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const { getSyncQueue, getSyncStats, isOnline } = require('@/services/offline-sync-engine');

    const refreshSyncData = async () => {
      const queue = await getSyncQueue();
      const stats = await getSyncStats();
      setOfflineQueue(queue);
      setSyncStats(stats);
      setSimulatedOnline(isOnline());
    };

    refreshSyncData();

    window.addEventListener('sync-queue-changed', refreshSyncData);
    window.addEventListener('connectivity-changed', refreshSyncData);

    return () => {
      window.removeEventListener('sync-queue-changed', refreshSyncData);
      window.removeEventListener('connectivity-changed', refreshSyncData);
    };
  }, [activeView]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowLogroForm(false);
    setShowFaltaForm(false);
  };

  const handleAddLogro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !logroTitle.trim() || !logroDesc.trim()) return;

    const { isOnline, addToSyncQueue } = require('@/services/offline-sync-engine');
    const online = isOnline();

    const payload = {
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      title: logroTitle,
      description: logroDesc,
      points: logroPoints
    };

    if (!online) {
      // Registrar en la cola IndexedDB local
      await addToSyncQueue('observador', 'CREATE_LOGRO', payload, 2);
      
      // Mostrar de forma optimista en la UI escolar
      const newLogro = {
        id: `ACH-TEMP-${Date.now()}`,
        title: `${logroTitle} (Pendiente Sincronizar)`,
        description: logroDesc,
        date: new Date().toISOString().split('T')[0],
        points: logroPoints
      };
      
      const updatedStudent = {
        ...selectedStudent,
        achievements: [newLogro, ...selectedStudent.achievements]
      };
      const updatedList = students.map(s => s.id === selectedStudent.id ? updatedStudent : s);
      setStudents(updatedList);
      setSelectedStudent(updatedStudent);
    } else {
      // Si está conectado, guardar directo en BD e interactuar con el CIE
      const newLogro = {
        id: `ACH-${Date.now()}`,
        title: logroTitle,
        description: logroDesc,
        date: new Date().toISOString().split('T')[0],
        points: logroPoints
      };

      const updatedStudent = {
        ...selectedStudent,
        achievements: [newLogro, ...selectedStudent.achievements]
      };

      const updatedList = students.map(s => s.id === selectedStudent.id ? updatedStudent : s);
      setStudents(updatedList);
      localStorage.setItem('school_students', JSON.stringify(updatedList));
      setSelectedStudent(updatedStudent);
      
      // CIE update
      try {
        const { updateCIEIndicator, getCIEIndicators } = require('@/services/cie-service');
        const currentCie = getCIEIndicators();
        const desercionRisk = currentCie.find((i: any) => i.code === 'CIE-PRED-001');
        if (desercionRisk) {
          const newVal = Math.max(10, desercionRisk.currentValue - 5);
          updateCIEIndicator('CIE-PRED-001', { currentValue: newVal });
        }
      } catch (err) {}
    }

    // Reset Form
    setLogroTitle('');
    setLogroDesc('');
    setLogroPoints(30);
    setShowLogroForm(false);
  };

  const handleAddFalta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !faltaTitle.trim() || !faltaDesc.trim()) return;

    const { isOnline, addToSyncQueue } = require('@/services/offline-sync-engine');
    const online = isOnline();

    const payload = {
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      type: faltaType,
      title: faltaTitle,
      description: faltaDesc,
      evidence: faltaEvidence || undefined
    };

    if (!online) {
      // Registrar en la cola IndexedDB local
      await addToSyncQueue('observador', 'CREATE_FALTA', payload, faltaType === 'Tipo III' ? 1 : 2);
      
      // Mostrar de forma optimista en la UI escolar
      const newFalta = {
        id: `BEH-TEMP-${Date.now()}`,
        type: faltaType,
        title: `${faltaTitle} (Pendiente Sincronizar)`,
        description: faltaDesc,
        date: new Date().toISOString().split('T')[0],
        status: 'Bajo Seguimiento' as any,
        evidence: faltaEvidence || undefined
      };
      
      const updatedStudent = {
        ...selectedStudent,
        behaviorLogs: [newFalta, ...selectedStudent.behaviorLogs]
      };
      const updatedList = students.map(s => s.id === selectedStudent.id ? updatedStudent : s);
      setStudents(updatedList);
      setSelectedStudent(updatedStudent);
    } else {
      // Guardar directamente en base de datos escolar
      const newFalta = {
        id: `BEH-${Date.now()}`,
        type: faltaType,
        title: faltaTitle,
        description: faltaDesc,
        date: new Date().toISOString().split('T')[0],
        status: faltaType === 'Tipo III' ? 'Escalado SED' : 'Bajo Seguimiento' as any,
        evidence: faltaEvidence || undefined
      };

      const updatedStudent = {
        ...selectedStudent,
        behaviorLogs: [newFalta, ...selectedStudent.behaviorLogs]
      };

      const updatedList = students.map(s => s.id === selectedStudent.id ? updatedStudent : s);
      setStudents(updatedList);
      localStorage.setItem('school_students', JSON.stringify(updatedList));
      setSelectedStudent(updatedStudent);

      // Notificar CIE
      if (faltaType === 'Tipo II' || faltaType === 'Tipo III') {
        try {
          const { updateCIEIndicator, getCIEIndicators } = require('@/services/cie-service');
          const currentCie = getCIEIndicators();
          const convRisk = currentCie.find((i: any) => i.code === 'CIE-PRED-004');
          if (convRisk) {
            const increment = faltaType === 'Tipo III' ? 25 : 15;
            const newVal = Math.min(100, convRisk.currentValue + increment);
            updateCIEIndicator('CIE-PRED-004', { currentValue: newVal });
          }
        } catch (err) {}
      }
    }

    // Reset Form
    setFaltaTitle('');
    setFaltaDesc('');
    setFaltaEvidence('');
    setShowFaltaForm(false);
  };

  const handleAddActa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actaTopic.trim() || !actaDecision.trim()) return;

    const newActa = {
      id: `ACT-${new Date().getFullYear()}-${Math.floor(Math.random()*90)+10}`,
      date: new Date().toISOString().split('T')[0],
      topic: actaTopic,
      attendees: ['Rector', 'Coordinador', 'Personero', 'Representante Padres'],
      status: 'Firmada Digitalmente',
      decision: actaDecision
    };

    setActas([newActa, ...actas]);
    setActaTopic('');
    setActaDecision('');
    setShowActaForm(false);
  };

  // Simulación: Cambiar conectividad
  const handleToggleOnline = (checked: boolean) => {
    const { setSimulatedOnlineState } = require('@/services/offline-sync-engine');
    setSimulatedOnlineState(checked);
    setSimulatedOnline(checked);
  };

  // Sincronizar cola manualmente
  const handleManualSync = async () => {
    const { syncQueueNow } = require('@/services/offline-sync-engine');
    setIsSyncInProgress(true);
    setSyncErrors([]);
    setSyncProgressMsg('Iniciando sincronización por prioridades...');
    setSyncProgressVal(5);

    const res = await syncQueueNow((msg: string, progress: number) => {
      setSyncProgressMsg(msg);
      setSyncProgressVal(progress);
    });

    setIsSyncInProgress(false);
    setSyncProgressVal(100);
    setSyncProgressMsg(res.success ? '¡Sincronización completada con éxito!' : 'Sincronización finalizada con algunos errores.');
    if (res.errors.length > 0) {
      setSyncErrors(res.errors);
    }
  };

  const handleClearQueue = async () => {
    const { clearSyncQueue } = require('@/services/offline-sync-engine');
    await clearSyncQueue();
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // IA Copilot advice
  const getIACopilotAdvice = () => {
    if (!showFaltaForm) return null;
    
    if (faltaType === 'Tipo I') {
      return {
        severity: 'bajo',
        norm: 'Decreto 1860 de 1994 y Manual de Convivencia Escolar.',
        advice: 'Conflictos cotidianos y faltas de asistencia puntuales. Procedimiento sugerido: Diálogo restaurativo voluntario en el aula, acuerdo escrito en el observador firmado por las partes y seguimiento del docente.',
        evidence: 'Evidencias sugeridas: Acta simple de mediación en el aula.'
      };
    } else if (faltaType === 'Tipo II') {
      return {
        severity: 'alto',
        norm: 'Ley 1620 de Convivencia Escolar (Acoso, Cyberbullying, agresiones sistemáticas).',
        advice: '¡Alerta Tipo II! Requiere de forma obligatoria la activación de la Ruta de Atención Integral. Reúna de inmediato evidencias testimoniales del comedor/compañeros y agende citación extraordinaria al Comité de Convivencia en un plazo máximo de 72 horas.',
        evidence: 'Evidencias obligatorias: Reporte escrito de docentes, actas de descargos con acudiente e informe del PAE si el hecho ocurrió en comedores.'
      };
    } else {
      return {
        severity: 'critico',
        norm: 'Ley 1620 y Código de Infancia y Adolescencia (Presuntos delitos penales).',
        advice: '¡Riesgo Crítico Tipo III! Obligación legal de notificar de inmediato a la Policía de Infancia y Adolescencia o Comisaría de Familia en menos de 24 horas. Suspenda temporalmente al estudiante del plantel y envíe el reporte foliado oficial a la Secretaría de Educación.',
        evidence: 'Evidencias requeridas: Actas formales firmadas digitalmente, copia de la notificación a las autoridades de familia, y reporte médico oficial si hubiere lesiones.'
      };
    }
  };

  const copilotAdvice = getIACopilotAdvice();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-lg hover:bg-slate-100 cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-slate-655" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-805 uppercase tracking-wider">
                Ecosistema de Inteligencia Institucional
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Seguimiento integral de vida escolar, actas del Comité y orquestación predictiva del territorio.
              </p>
            </div>
          </div>

          {/* Sub-pestañas: Observador vs Comité vs Sincronización */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner w-fit shrink-0">
            <button
              onClick={() => setActiveView('observador')}
              className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-lg border-none cursor-pointer flex items-center gap-1 transition-all ${activeView === 'observador' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-550'}`}
            >
              <Users className="w-3.5 h-3.5" />
              Observador de Vida Escolar
            </button>
            <button
              onClick={() => setActiveView('comite')}
              className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-lg border-none cursor-pointer flex items-center gap-1 transition-all ${activeView === 'comite' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-550'}`}
            >
              <Scale className="w-3.5 h-3.5" />
              Comité de Convivencia
            </button>
            <button
              onClick={() => setActiveView('sync')}
              className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-lg border-none cursor-pointer flex items-center gap-1 transition-all ${activeView === 'sync' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-550'}`}
            >
              <Activity className="w-3.5 h-3.5 animate-pulse text-indigo-650" />
              Centro de Sincronización
            </button>
          </div>
        </div>

        {/* 💻 VISTA 1: OBSERVADOR DE VIDA ESCOLAR */}
        {activeView === 'observador' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Buscador y listado de alumnos */}
            <div className="bg-white border border-slate-205 rounded-3xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Listado General de Alumnos
                </h3>
                <p className="text-[9px] text-slate-450 mt-0.5 font-bold">
                  Seleccione un alumno para visualizar su Expediente Único de Vida Escolar.
                </p>
              </div>

              {/* Input de búsqueda */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  placeholder="Buscar estudiante o grado..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Lista */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {filteredStudents.map((student) => (
                  <div 
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className={`flex items-center gap-3 p-3 border rounded-2xl cursor-pointer hover:bg-slate-50/50 transition-colors ${selectedStudent?.id === student.id ? 'border-indigo-600 bg-indigo-50/5 shadow-xs' : 'border-slate-100 bg-slate-50/20'}`}
                  >
                    <img 
                      src={student.avatar} 
                      alt={student.name} 
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-black text-slate-805 block truncate">{student.name}</span>
                      <span className="text-[10px] text-slate-450 block truncate">{student.grade}</span>
                    </div>
                  </div>
                ))}
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-slate-400 font-bold text-xs">No se encontraron estudiantes</div>
                )}
              </div>
            </div>

            {/* Expediente Único del Estudiante Seleccionado */}
            <div className="lg:col-span-2 space-y-6">
              {selectedStudent ? (
                <div className="space-y-6">
                  {/* Tarjeta Perfil Rápido */}
                  <div className="bg-white border border-slate-205 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={selectedStudent.avatar} 
                        alt={selectedStudent.name} 
                        className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-sm"
                      />
                      <div>
                        <span className="text-[9px] font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{selectedStudent.id}</span>
                        <h3 className="text-base font-black text-slate-805 mt-1">{selectedStudent.name}</h3>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">{selectedStudent.grade}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs font-bold text-slate-600">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase font-black">Asistencia (RFID)</span>
                        <span className={`text-sm font-black block mt-0.5 ${selectedStudent.attendanceRate < 85 ? 'text-red-500' : 'text-slate-800'}`}>
                          {selectedStudent.attendanceRate}%
                        </span>
                      </div>
                      <div className="w-px h-8 bg-slate-200"></div>
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase font-black">Promedio General</span>
                        <span className={`text-sm font-black block mt-0.5 ${selectedStudent.gpa < 3.0 ? 'text-red-500' : 'text-slate-800'}`}>
                          {selectedStudent.gpa.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fórmulas y Registros de Vida Escolar (Logros + Convivencia) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logros Académicos y Méritos (+ ) */}
                    <div className="bg-white border border-slate-205 rounded-3xl p-5 shadow-xs space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                            <Award className="w-4 h-4 text-indigo-600" />
                            Logros y Participación
                          </h4>
                          <span className="text-[9px] text-slate-400 font-bold block">Aspectos de Liderazgo y Reconocimiento</span>
                        </div>
                        <Button 
                          onClick={() => { setShowLogroForm(true); setShowFaltaForm(false); }}
                          size="sm" 
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-755 border border-indigo-100 font-bold text-[10px] rounded-lg px-2 py-1 flex items-center gap-0.5 cursor-pointer shadow-xs animate-fade-in"
                        >
                          <Plus className="w-3.5 h-3.5" /> Registrar Logro
                        </Button>
                      </div>

                      {/* Lista de Logros */}
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {selectedStudent.achievements.map((ach) => (
                          <div key={ach.id} className="p-3 border border-slate-100 bg-slate-50/30 rounded-2xl space-y-1">
                            <div className="flex justify-between items-start">
                              <span className="font-extrabold text-slate-800 text-xs block leading-tight">{ach.title}</span>
                              <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black">+{ach.points} pts</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-semibold">{ach.description}</p>
                            <span className="text-[8px] text-slate-400 font-bold block">{ach.date}</span>
                          </div>
                        ))}
                        {selectedStudent.achievements.length === 0 && (
                          <div className="text-center py-8 text-slate-400 font-bold text-xs">No registra reconocimientos en el ciclo</div>
                        )}
                      </div>
                    </div>

                    {/* Observador Disciplinario y Convivencia (- ) */}
                    <div className="bg-white border border-slate-205 rounded-3xl p-5 shadow-xs space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Bitácora de Convivencia
                          </h4>
                          <span className="text-[9px] text-slate-400 font-bold block">Faltas tipificadas según Ley 1620</span>
                        </div>
                        <Button 
                          onClick={() => { setShowFaltaForm(true); setShowLogroForm(false); }}
                          size="sm" 
                          className="bg-red-50 hover:bg-red-100 text-red-755 border border-red-100 font-bold text-[10px] rounded-lg px-2 py-1 flex items-center gap-0.5 cursor-pointer shadow-xs animate-fade-in"
                        >
                          <Plus className="w-3.5 h-3.5" /> Registrar Falta
                        </Button>
                      </div>

                      {/* Lista de Faltas */}
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {selectedStudent.behaviorLogs.map((beh) => (
                          <div key={beh.id} className="p-3 border border-slate-100 bg-slate-50/30 rounded-2xl space-y-1.5 animate-fade-in">
                            <div className="flex justify-between items-start">
                              <span className="font-extrabold text-slate-800 text-xs block leading-tight">{beh.title}</span>
                              <span 
                                className="text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0"
                                style={{
                                  backgroundColor: beh.type === 'Tipo III' ? '#fee2e2' : beh.type === 'Tipo II' ? '#ffedd5' : '#f1f5f9',
                                  color: beh.type === 'Tipo III' ? '#b91c1c' : beh.type === 'Tipo II' ? '#c2410c' : '#475569'
                                }}
                              >
                                {beh.type}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-semibold">{beh.description}</p>
                            {beh.evidence && (
                              <div className="text-[9px] text-slate-455 bg-slate-50 border border-slate-100 p-1.5 rounded-lg font-bold">
                                Evidencia: {beh.evidence}
                              </div>
                            )}
                            <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                              <span>Fecha: {beh.date}</span>
                              <span className={beh.status === 'Resuelto' ? 'text-emerald-600' : 'text-amber-600'}>{beh.status}</span>
                            </div>
                          </div>
                        ))}
                        {selectedStudent.behaviorLogs.length === 0 && (
                          <div className="text-center py-8 text-slate-400 font-bold text-xs">Felicidades, conducta limpia en el ciclo</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FORMULARIO: REGISTRAR LOGRO */}
                  {showLogroForm && (
                    <Card className="border-slate-200 rounded-3xl p-5 bg-slate-50/30 shadow-sm animate-fade-in">
                      <form onSubmit={handleAddLogro} className="space-y-4 text-xs font-semibold text-slate-655">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Registrar Reconocimiento Académico o Logro</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Título del Logro</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Ej. Personero de Grado / Proyecto Ciencia"
                              value={logroTitle}
                              onChange={(e) => setLogroTitle(e.target.value)}
                              className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Puntos de Mérito</label>
                            <select 
                              value={logroPoints}
                              onChange={(e) => setLogroPoints(parseInt(e.target.value))}
                              className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                            >
                              <option value="10">10 Puntos (Participación clase)</option>
                              <option value="30">30 Puntos (Actividad extraescolar)</option>
                              <option value="50">50 Puntos (Ganador concurso)</option>
                              <option value="100">100 Puntos (Excelente ciclo completo)</option>
                            </select>
                          </div>
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Descripción del Reconocimiento</label>
                            <textarea 
                              required
                              rows={3}
                              placeholder="Redacte detalladamente el logro obtenido y su contexto..."
                              value={logroDesc}
                              onChange={(e) => setLogroDesc(e.target.value)}
                              className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                          <button type="button" onClick={() => setShowLogroForm(false)} className="text-[10px] font-bold text-slate-500 bg-transparent hover:bg-slate-100 border-none rounded-lg px-3 py-1.5 cursor-pointer">Cancelar</button>
                          <button type="submit" className="text-[10px] font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 cursor-pointer shadow-sm border-none transition-colors">Guardar Mérito</button>
                        </div>
                      </form>
                    </Card>
                  )}

                  {/* FORMULARIO: REGISTRAR FALTA CON COPILOTO IA INTEGRADO */}
                  {showFaltaForm && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
                      <Card className="xl:col-span-2 border-slate-205 rounded-3xl p-5 bg-slate-50/30 shadow-sm">
                        <form onSubmit={handleAddFalta} className="space-y-4 text-xs font-semibold text-slate-655">
                          <h4 className="text-xs font-black text-slate-805 uppercase tracking-wider">Registrar Novedad Disciplinaria (Ley 1620)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Tipicidad de la Falta</label>
                              <select 
                                value={faltaType}
                                onChange={(e) => setFaltaType(e.target.value as any)}
                                className="w-full text-xs font-semibold text-slate-850 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                              >
                                <option value="Tipo I">Tipo I (Conflictos cotidianos)</option>
                                <option value="Tipo II">Tipo II (Acoso, Ciberacoso, Riñas)</option>
                                <option value="Tipo III">Tipo III (Presunto Delito Penal)</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Título del Incidente</label>
                              <input 
                                type="text" 
                                required
                                placeholder="Ej. Agresión verbal en pasillo"
                                value={faltaTitle}
                                onChange={(e) => setFaltaTitle(e.target.value)}
                                className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Evidencias físicas cargadas</label>
                              <input 
                                type="text" 
                                placeholder="Ej. Acta firmada por acudiente, capturas de chat"
                                value={faltaEvidence}
                                onChange={(e) => setFaltaEvidence(e.target.value)}
                                className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Detalle de la Observación</label>
                              <textarea 
                                required
                                rows={3}
                                placeholder="Describa el hecho de forma objetiva, indicando la hora, lugar y personas involucradas..."
                                value={faltaDesc}
                                onChange={(e) => setFaltaDesc(e.target.value)}
                                className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                            <button type="button" onClick={() => setShowFaltaForm(false)} className="text-[10px] font-bold text-slate-500 bg-transparent hover:bg-slate-100 border-none rounded-lg px-3 py-1.5 cursor-pointer">Cancelar</button>
                            <button type="submit" className="text-[10px] font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 cursor-pointer shadow-sm border-none transition-colors">Guardar Falta</button>
                          </div>
                        </form>
                      </Card>

                      {/* ⚡ COPILOTO OPERATIVO DE AULAHELP IA EN VIVO */}
                      {copilotAdvice && (
                        <div className="bg-slate-900 border border-slate-800 text-white p-4.5 rounded-3xl shadow-lg space-y-3.5 text-[11px] font-semibold animate-fade-in flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center gap-1.5 text-indigo-400 font-black uppercase tracking-widest text-[9px]">
                              <Sparkles className="w-4.5 h-4.5 animate-pulse text-indigo-400 shrink-0" />
                              Copiloto de AulaHelp IA
                            </div>
                            
                            <div className="space-y-1 bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-[8px] text-slate-400 block font-black uppercase tracking-widest">Norma aplicable</span>
                              <p className="text-slate-205 font-bold leading-normal">{copilotAdvice.norm}</p>
                            </div>

                            <p className="leading-relaxed text-slate-300">
                              <strong className="text-white block mb-0.5">Sugerencia Operativa:</strong>
                              {copilotAdvice.advice}
                            </p>

                            <p className="text-[10px] text-slate-350 leading-relaxed italic border-t border-slate-800 pt-2 bg-slate-950/20 p-2 rounded-xl">
                              <strong className="text-indigo-300 block not-italic font-black uppercase tracking-wider text-[8px] mb-0.5">Evidencias sugeridas:</strong>
                              {copilotAdvice.evidence}
                            </p>
                          </div>

                          <div className="text-[8px] text-slate-455 uppercase tracking-wider text-center mt-2">
                            Módulo de Asesoría Legal Integrado
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ) : (
                <Card className="p-8 border-slate-200 border-2 border-dashed bg-white text-center flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-650 rounded-full flex items-center justify-center shadow-inner">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="max-w-md">
                    <h4 className="text-base font-black text-slate-800 uppercase tracking-wider">Expediente de Vida Escolar</h4>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-semibold">
                      Seleccione un estudiante del menú de la izquierda para ver su historial consolidado de logros, faltas disciplinarias, asistencia y su conexión analítica con el CIE y el MIO.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* ⚖️ VISTA 2: COMITÉ DE CONVIVENCIA ESCOLAR */}
        {activeView === 'comite' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Listado de Actas Oficiales */}
            <div className="lg:col-span-2 bg-white border border-slate-205 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Actas de Sesiones y Resoluciones del Comité
                  </h3>
                  <p className="text-[9px] text-slate-450 mt-0.5 font-bold">
                    Registro de actas foliadas firmadas digitalmente por el Comité de Convivencia Escolar del plantel.
                  </p>
                </div>
                <Button 
                  onClick={() => setShowActaForm(true)}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-xl px-3 py-2 cursor-pointer border-none shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-0.5" /> Registrar Acta
                </Button>
              </div>

              {/* Formulario de Acta */}
              {showActaForm && (
                <Card className="p-4 border-slate-200 bg-slate-50/20 rounded-2xl space-y-3 text-xs font-semibold text-slate-655 animate-fade-in">
                  <form onSubmit={handleAddActa} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Tema o Caso de Discusión</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. Incidente de riña 9°A / Caso de acoso"
                        value={actaTopic}
                        onChange={(e) => setActaTopic(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Decisión / Acuerdo del Comité</label>
                      <textarea 
                        required
                        rows={3}
                        placeholder="Describa el acuerdo restaurativo pactado con acudientes, plazos y responsables..."
                        value={actaDecision}
                        onChange={(e) => setActaDecision(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button type="button" onClick={() => setShowActaForm(false)} className="text-[10px] font-bold text-slate-500 bg-transparent hover:bg-slate-100 border-none rounded-lg px-2.5 py-1.5 cursor-pointer">Cancelar</button>
                      <button type="submit" className="text-[10px] font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 cursor-pointer shadow-sm border-none transition-colors">Firmar y Registrar</button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Lista de Actas */}
              <div className="space-y-3.5">
                {actas.map((act) => (
                  <div key={act.id} className="p-4 border border-slate-100 bg-slate-50/30 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{act.id}</span>
                      <span className="text-[9px] text-slate-400 font-bold block">{act.date}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-black text-slate-805 block">{act.topic}</span>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                        <strong className="text-slate-700 block">Acuerdo / Decisión:</strong>
                        {act.decision}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center justify-between border-t border-slate-100 pt-2.5 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-[8px] text-slate-400 font-black">Firmado por:</span>
                        {act.attendees.map((att: string, i: number) => (
                          <span key={i} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{att}</span>
                        ))}
                      </div>

                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-0.5 font-bold">
                        <FileCheck className="w-3 h-3 text-emerald-600" /> {act.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel de Ayuda y Normativa */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-inner space-y-4 text-xs font-semibold text-slate-655">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <Scale className="w-4 h-4 text-slate-655" />
                Normativa de Convivencia Escolar
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                Guía metodológica para rectores y miembros del comité de convivencia según la **Ley 1620 de 2013** en Colombia:
              </p>

              <div className="space-y-3.5 border-t border-slate-150 pt-4 leading-relaxed">
                <div>
                  <strong className="text-slate-850 block font-black uppercase tracking-wider text-[9px]">Faltas Tipo I</strong>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Conflictos cotidianos que no afectan la integridad física o moral. Ej: discusiones verbales esporádicas.
                    *Ruta*: Mediación concertada y registro simple en el observador escolar.
                  </p>
                </div>
                <div>
                  <strong className="text-slate-850 block font-black uppercase tracking-wider text-[9px]">Faltas Tipo II</strong>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Acoso escolar (bullying), ciberacoso y peleas que no generan incapacidad médica. 
                    *Ruta*: Citación inmediata al Comité extraordinario, remisión al orientador, y plan de conducta restaurativa.
                  </p>
                </div>
                <div>
                  <strong className="text-slate-850 block font-black uppercase tracking-wider text-[9px]">Faltas Tipo III</strong>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Hechos que presuntamente constituyen delitos según el código penal. Ej: porte de sustancias o agresión física grave.
                    *Ruta*: Denuncia policial en menos de 24 horas y traslado a comisaría de familia.
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50/20 border border-indigo-150 p-3.5 rounded-2xl text-indigo-900 leading-normal font-semibold">
                <strong className="text-indigo-955 block mb-1">Dato de Impacto del CIE:</strong>
                Cada falta registrada de Tipo II o III se publica al bus del MIO. El motor se encarga de crear el expediente y alertar en semáforo rojo en la Secretaría de Educación de forma instantánea.
              </div>
            </div>
          </div>
        )}

        {/* 🔄 VISTA 3: CENTRO DE SINCRONIZACIÓN OFFLINE (CONSOLA INTERACTIVA) */}
        {activeView === 'sync' && (
          <div className="space-y-6 animate-fade-in">
            {/* Cabecera / Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Card Estado de Conectividad con Toggle */}
              <Card className="md:col-span-2 border-slate-205 rounded-3xl p-5 bg-white shadow-xs">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Canal de Red</span>
                    <h3 className="text-sm font-black text-slate-805 flex items-center gap-1.5">
                      {simulatedOnline ? (
                        <>
                          <Wifi className="w-5 h-5 text-emerald-500" />
                          Conexión Estable
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-5 h-5 text-red-500 animate-pulse" />
                          Modo Offline Activo
                        </>
                      )}
                    </h3>
                  </div>

                  {/* Switch interactivo de simulación */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Simular Red</span>
                    <input 
                      type="checkbox" 
                      checked={simulatedOnline} 
                      onChange={(e) => handleToggleOnline(e.target.checked)}
                      className="w-8 h-4 rounded-full bg-slate-300 appearance-none checked:bg-indigo-650 relative cursor-pointer outline-none transition-colors after:absolute after:top-0.5 after:left-0.5 after:w-3 after:after:h-3 after:h-3 after:rounded-full after:bg-white after:transition-transform checked:after:translate-x-4 shadow-inner"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-450 mt-3 font-semibold leading-relaxed">
                  Apaga el interruptor para desconectar AulaCore. Podrás registrar méritos o faltas en el observador escolar sin internet y verificar cómo IndexedDB los retiene localmente.
                </p>
              </Card>

              {/* Operaciones Pendientes */}
              <Card className="border-slate-205 rounded-3xl p-5 bg-white shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Folios en Cola</span>
                  <h3 className="text-2xl font-black text-slate-850 mt-1">{syncStats?.pendingCount || 0}</h3>
                </div>
                <span className="text-[9px] font-bold text-slate-450 block border-t border-slate-100 pt-2">
                  P1 Crítico: {syncStats?.criticalCount || 0} | P2 Operativo: {syncStats?.operationalCount || 0}
                </span>
              </Card>

              {/* Última Sincronización */}
              <Card className="border-slate-205 rounded-3xl p-5 bg-white shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Última Sincronización</span>
                  <h3 className="text-sm font-black text-slate-850 mt-2.5 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-500" />
                    {syncStats?.lastSyncTime || 'Ninguna en este ciclo'}
                  </h3>
                </div>
                <span className="text-[9px] font-bold text-slate-455 block border-t border-slate-100 pt-2 uppercase">
                  Receptor: Secretaría de Educación (SED)
                </span>
              </Card>
            </div>

            {/* Barra de progreso de Sincronización Manual */}
            {isSyncInProgress && (
              <Card className="border-indigo-150 rounded-3xl p-5 bg-indigo-50/5 shadow-xs space-y-3 animate-pulse">
                <div className="flex justify-between items-center text-xs font-bold text-indigo-950">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4.5 h-4.5 animate-spin text-indigo-600" />
                    {syncProgressMsg}
                  </span>
                  <span>{syncProgressVal}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-650 h-full transition-all duration-300"
                    style={{ width: `${syncProgressVal}%` }}
                  />
                </div>
              </Card>
            )}

            {/* Tabla de operaciones en cola IndexedDB */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Listado de Cola */}
              <Card className="lg:col-span-2 border-slate-205 rounded-3xl p-5 bg-white shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-4.5 h-4.5 text-slate-500" />
                      Folios de Sincronización Pendientes (IndexedDB)
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold block">Cola de transacciones locales pendientes de consolidación central</span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={handleClearQueue}
                      className="bg-red-50 hover:bg-red-100 text-red-755 border border-red-100 font-bold text-[10px] rounded-lg px-2.5 py-1.5 cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Limpiar Cola
                    </button>
                    <button 
                      onClick={handleManualSync}
                      disabled={!simulatedOnline || isSyncInProgress || offlineQueue.length === 0}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg px-3 py-1.5 cursor-pointer flex items-center gap-1 shadow-xs border-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Sincronizar Ahora
                    </button>
                  </div>
                </div>

                {/* Listado */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {offlineQueue.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-3.5 border rounded-2xl space-y-2 text-xs font-semibold text-slate-655 ${
                        item.status === 'failed' ? 'border-red-200 bg-red-50/10' : 'border-slate-100 bg-slate-50/20'
                      }`}
                    >
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-[8px] font-black font-mono text-slate-400">{item.id}</span>
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider"
                            style={{
                              backgroundColor: item.priority === 1 ? '#fee2e2' : item.priority === 2 ? '#ffedd5' : '#f1f5f9',
                              color: item.priority === 1 ? '#b91c1c' : item.priority === 2 ? '#c2410c' : '#475569'
                            }}
                          >
                            Prioridad {item.priority === 1 ? '1 (Crítico)' : item.priority === 2 ? '2 (Operativo)' : '3 (Pesado)'}
                          </span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                            item.status === 'failed' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-150 text-slate-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-black text-slate-805 block">Módulo: {item.module.toUpperCase()} | Acción: {item.action}</span>
                        <div className="text-[10px] text-slate-500 bg-white/70 border border-slate-100 p-2.5 rounded-xl space-y-1.5 font-bold shadow-2xs">
                          <div>
                            <span className="text-[8px] text-slate-400 block font-black uppercase">Estudiante</span>
                            <span className="text-slate-800">{item.payload.studentName || item.payload.studentId}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 block font-black uppercase">Título</span>
                            <span className="text-slate-800">{item.payload.title}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 block font-black uppercase">Detalle</span>
                            <span className="text-slate-800 font-semibold">{item.payload.description}</span>
                          </div>
                        </div>
                      </div>

                      {item.error && (
                        <div className="text-[10px] text-red-700 bg-red-50 border border-red-100 p-2 rounded-xl flex items-start gap-1.5 font-bold">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-650" />
                          <div>
                            <span className="font-black uppercase tracking-wider block text-[8px]">Error de Sincronización</span>
                            {item.error}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 border-t border-slate-50 pt-2">
                        <span>Creado: {new Date(item.timestamp).toLocaleString()}</span>
                        <span>Intentos de Envío: {item.attempts}</span>
                      </div>
                    </div>
                  ))}

                  {offlineQueue.length === 0 && (
                    <div className="text-center py-16 text-slate-400 font-bold text-xs flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                      <div>La cola de IndexedDB está limpia. Todos los datos están en la nube de la SED.</div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Telemetría y Simulación de Conflictos */}
              <div className="space-y-6">
                {/* Card de Simulación de Conflictos */}
                <Card className="border-slate-205 rounded-3xl p-5 bg-white shadow-xs space-y-4 font-semibold text-slate-655 text-xs">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-4.5 h-4.5 text-indigo-650" />
                      Políticas de Conflicto de Datos
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold block">Cómo resuelve AulaCore los choques de información</span>
                  </div>

                  <div className="space-y-3.5 leading-relaxed">
                    <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl">
                      <strong className="text-slate-850 block font-black uppercase text-[8px] tracking-wider mb-0.5">La última escritura gana (LWW)</strong>
                      <p className="text-[10px] text-slate-500">
                        Si dos docentes en diferentes tablets modifican la misma mallas de notas sin conexión, prevalece el cambio del dispositivo con la marca de tiempo (timestamp local) más reciente.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl">
                      <strong className="text-slate-850 block font-black uppercase text-[8px] tracking-wider mb-0.5">Fusión Heurística (Faltas Tipo II/III)</strong>
                      <p className="text-[10px] text-slate-500">
                        Los registros del Observador de Convivencia y actas del Comité nunca se sobreescriben. Se apilan como folios secuenciales cronológicos para preservar la cadena de custodia legal escolar.
                      </p>
                    </div>
                  </div>

                  {syncErrors.length > 0 && (
                    <div className="text-[10px] text-red-700 bg-red-50 border border-red-150 p-3.5 rounded-2xl space-y-1.5 font-bold">
                      <span className="font-black uppercase tracking-wider block text-[8px]">LOG DE ERRORES DEL ÚLTIMO BARRIDO</span>
                      <ul className="list-disc pl-4 space-y-1">
                        {syncErrors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>

                {/* Explicación Multiplataforma */}
                <Card className="border-indigo-150 rounded-3xl p-5 bg-indigo-50/5 shadow-xs space-y-3 text-xs font-semibold text-indigo-950">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-black uppercase tracking-wider text-[9px]">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Arquitectura Multiplataforma
                  </div>
                  <p className="text-[10px] text-indigo-900/80 leading-relaxed font-semibold">
                    El motor de sincronización (`OfflineSyncEngine.ts`) está construido en TypeScript puro desacoplado. Permite que la misma base lógica se use en:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-[8px] font-black uppercase tracking-wider pt-1.5">
                    <div className="bg-white border border-indigo-200 p-2 rounded-xl shadow-2xs">PWA Web</div>
                    <div className="bg-white border border-indigo-200 p-2 rounded-xl shadow-2xs">Capacitor</div>
                    <div className="bg-white border border-indigo-200 p-2 rounded-xl shadow-2xs">Mobile App</div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// Quick state helpers
function setActaTopic(val: string) {
  const el = document.querySelector('input[placeholder="Ej. Incidente de riña 9°A / Caso de acoso"]') as HTMLInputElement;
  if (el) el.value = val;
}
function setActaDecision(val: string) {
  const el = document.querySelector('textarea[placeholder="Describa el acuerdo restaurativo pactado con acudientes, plazos y responsables..."]') as HTMLTextAreaElement;
  if (el) el.value = val;
}
