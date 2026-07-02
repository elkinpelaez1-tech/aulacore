'use client';

import React, { useState } from 'react';
import { 
  Award, BookOpen, CheckCircle2, Download, FileText, Filter, 
  Printer, Search, Send, Sparkles, Trophy, Users, Zap, AlertTriangle, 
  Check, ChevronRight, Share2, Eye, Calendar, ArrowUpRight, CheckCircle, ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { downloadDirectorGroupBoletinPDF } from '@/lib/utils/PdfGenerator';

interface StudentConsolidatedGrade {
  id: string;
  name: string;
  docId: string;
  avatar: string;
  currentPeriodGpa: number;
  accumulatedAnnualGpa: number;
  status: 'Superior' | 'Alto' | 'Básico' | 'Bajo';
  isSentVirtual: boolean;
  isPrinted: boolean;
  subjects: {
    name: string;
    teacher: string;
    score: number;
    remarks?: string;
  }[];
}

const MOCK_SUBJECTS_RECEIVED = [
  { name: 'Matemáticas Avanzadas', teacher: 'Prof. Carlos Gómez', avg: 4.5, status: 'Recibido 100%' },
  { name: 'Lengua Castellana y Lit.', teacher: 'Prof. Ana Torres', avg: 4.3, status: 'Recibido 100%' },
  { name: 'Física y Laboratorio', teacher: 'Prof. Valentina Silva', avg: 4.1, status: 'Recibido 100%' },
  { name: 'Química Orgánica', teacher: 'Prof. Jorge Ramírez', avg: 4.2, status: 'Recibido 100%' },
  { name: 'Inglés Avanzado (C1)', teacher: 'Prof. John Davis', avg: 4.7, status: 'Recibido 100%' },
  { name: 'Ciencias Sociales y Const.', teacher: 'Prof. Lucía Castro', avg: 4.4, status: 'Recibido 100%' },
  { name: 'Educación Física y Deportes', teacher: 'Prof. Marcos Paz', avg: 4.8, status: 'Recibido 100%' },
  { name: 'Ética y Convivencia', teacher: 'Lic. Patricia Martínez', avg: 4.6, status: 'Recibido 100%' },
];

const MOCK_STUDENTS_10A: StudentConsolidatedGrade[] = [
  {
    id: '10a-01',
    name: 'González Rojas Mateo',
    docId: 'TI-1098234101',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    currentPeriodGpa: 4.75,
    accumulatedAnnualGpa: 4.68,
    status: 'Superior',
    isSentVirtual: true,
    isPrinted: false,
    subjects: [
      { name: 'Matemáticas Avanzadas', teacher: 'Prof. Carlos Gómez', score: 4.8, remarks: 'Excelente capacidad analítica y resolución de problemas.' },
      { name: 'Lengua Castellana y Lit.', teacher: 'Prof. Ana Torres', score: 4.7, remarks: 'Muy buena producción textual y comprensión lectora.' },
      { name: 'Física y Laboratorio', teacher: 'Prof. Valentina Silva', score: 4.6, remarks: 'Destacado en prácticas de laboratorio.' },
      { name: 'Química Orgánica', teacher: 'Prof. Jorge Ramírez', score: 4.5 },
      { name: 'Inglés Avanzado (C1)', teacher: 'Prof. John Davis', score: 4.9, remarks: 'Fluid communication and leadership in class.' },
      { name: 'Ciencias Sociales y Const.', teacher: 'Prof. Lucía Castro', score: 4.6 },
      { name: 'Educación Física y Deportes', teacher: 'Prof. Marcos Paz', score: 4.8 },
      { name: 'Ética y Convivencia', teacher: 'Lic. Patricia Martínez', score: 4.8, remarks: 'Comportamiento ejemplar en el curso.' },
    ]
  },
  {
    id: '10a-02',
    name: 'Silva Martínez Valentina',
    docId: 'TI-1098234102',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    currentPeriodGpa: 4.60,
    accumulatedAnnualGpa: 4.55,
    status: 'Superior',
    isSentVirtual: false,
    isPrinted: true,
    subjects: [
      { name: 'Matemáticas Avanzadas', teacher: 'Prof. Carlos Gómez', score: 4.5 },
      { name: 'Lengua Castellana y Lit.', teacher: 'Prof. Ana Torres', score: 4.8, remarks: 'Excelente argumentación en sus ensayos literarios.' },
      { name: 'Física y Laboratorio', teacher: 'Prof. Valentina Silva', score: 4.4 },
      { name: 'Química Orgánica', teacher: 'Prof. Jorge Ramírez', score: 4.6 },
      { name: 'Inglés Avanzado (C1)', teacher: 'Prof. John Davis', score: 4.8 },
      { name: 'Ciencias Sociales y Const.', teacher: 'Prof. Lucía Castro', score: 4.7 },
      { name: 'Educación Física y Deportes', teacher: 'Prof. Marcos Paz', score: 4.5 },
      { name: 'Ética y Convivencia', teacher: 'Lic. Patricia Martínez', score: 4.7 },
    ]
  },
  {
    id: '10a-03',
    name: 'Ramírez Castaño Sofía',
    docId: 'TI-1098234103',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    currentPeriodGpa: 4.35,
    accumulatedAnnualGpa: 4.40,
    status: 'Alto',
    isSentVirtual: true,
    isPrinted: true,
    subjects: [
      { name: 'Matemáticas Avanzadas', teacher: 'Prof. Carlos Gómez', score: 4.2 },
      { name: 'Lengua Castellana y Lit.', teacher: 'Prof. Ana Torres', score: 4.4 },
      { name: 'Física y Laboratorio', teacher: 'Prof. Valentina Silva', score: 4.3 },
      { name: 'Química Orgánica', teacher: 'Prof. Jorge Ramírez', score: 4.5 },
      { name: 'Inglés Avanzado (C1)', teacher: 'Prof. John Davis', score: 4.6 },
      { name: 'Ciencias Sociales y Const.', teacher: 'Prof. Lucía Castro', score: 4.3 },
      { name: 'Educación Física y Deportes', teacher: 'Prof. Marcos Paz', score: 4.5 },
      { name: 'Ética y Convivencia', teacher: 'Lic. Patricia Martínez', score: 4.5 },
    ]
  },
  {
    id: '10a-04',
    name: 'Gómez Hernández Sebastián',
    docId: 'TI-1098234104',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    currentPeriodGpa: 4.20,
    accumulatedAnnualGpa: 4.25,
    status: 'Alto',
    isSentVirtual: false,
    isPrinted: false,
    subjects: [
      { name: 'Matemáticas Avanzadas', teacher: 'Prof. Carlos Gómez', score: 4.4 },
      { name: 'Lengua Castellana y Lit.', teacher: 'Prof. Ana Torres', score: 4.1 },
      { name: 'Física y Laboratorio', teacher: 'Prof. Valentina Silva', score: 4.0 },
      { name: 'Química Orgánica', teacher: 'Prof. Jorge Ramírez', score: 4.2 },
      { name: 'Inglés Avanzado (C1)', teacher: 'Prof. John Davis', score: 4.5 },
      { name: 'Ciencias Sociales y Const.', teacher: 'Prof. Lucía Castro', score: 4.3 },
      { name: 'Educación Física y Deportes', teacher: 'Prof. Marcos Paz', score: 4.6 },
      { name: 'Ética y Convivencia', teacher: 'Lic. Patricia Martínez', score: 4.3 },
    ]
  },
  {
    id: '10a-05',
    name: 'Morales Vargas Luciana',
    docId: 'TI-1098234105',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    currentPeriodGpa: 4.85,
    accumulatedAnnualGpa: 4.82,
    status: 'Superior',
    isSentVirtual: true,
    isPrinted: true,
    subjects: [
      { name: 'Matemáticas Avanzadas', teacher: 'Prof. Carlos Gómez', score: 4.9, remarks: 'Rendimiento sobresaliente en matemáticas y olimpiadas.' },
      { name: 'Lengua Castellana y Lit.', teacher: 'Prof. Ana Torres', score: 4.8 },
      { name: 'Física y Laboratorio', teacher: 'Prof. Valentina Silva', score: 4.7 },
      { name: 'Química Orgánica', teacher: 'Prof. Jorge Ramírez', score: 4.8 },
      { name: 'Inglés Avanzado (C1)', teacher: 'Prof. John Davis', score: 5.0, remarks: 'Bilingual proficiency achieved.' },
      { name: 'Ciencias Sociales y Const.', teacher: 'Prof. Lucía Castro', score: 4.8 },
      { name: 'Educación Física y Deportes', teacher: 'Prof. Marcos Paz', score: 4.9 },
      { name: 'Ética y Convivencia', teacher: 'Lic. Patricia Martínez', score: 4.9 },
    ]
  },
  {
    id: '10a-06',
    name: 'López Restrepo David',
    docId: 'TI-1098234106',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    currentPeriodGpa: 3.85,
    accumulatedAnnualGpa: 3.92,
    status: 'Básico',
    isSentVirtual: false,
    isPrinted: false,
    subjects: [
      { name: 'Matemáticas Avanzadas', teacher: 'Prof. Carlos Gómez', score: 3.7, remarks: 'Reforzar ejercicios de trigonometría en casa.' },
      { name: 'Lengua Castellana y Lit.', teacher: 'Prof. Ana Torres', score: 4.0 },
      { name: 'Física y Laboratorio', teacher: 'Prof. Valentina Silva', score: 3.6 },
      { name: 'Química Orgánica', teacher: 'Prof. Jorge Ramírez', score: 3.9 },
      { name: 'Inglés Avanzado (C1)', teacher: 'Prof. John Davis', score: 4.1 },
      { name: 'Ciencias Sociales y Const.', teacher: 'Prof. Lucía Castro', score: 4.0 },
      { name: 'Educación Física y Deportes', teacher: 'Prof. Marcos Paz', score: 4.5 },
      { name: 'Ética y Convivencia', teacher: 'Lic. Patricia Martínez', score: 4.0 },
    ]
  }
];

export function GroupDirectorGradesPortal() {
  const [students, setStudents] = useState<StudentConsolidatedGrade[]>(MOCK_STUDENTS_10A);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Superior' | 'Alto' | 'Básico' | 'Bajo'>('ALL');
  const [selectedCourse, setSelectedCourse] = useState('10°A');
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'info' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'info' = 'success') => {
    setToastMsg({ title, desc, type });
    setTimeout(() => setToastMsg(null), 4500);
  };

  // Filtered Students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.docId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadPDF = (student: StudentConsolidatedGrade) => {
    downloadDirectorGroupBoletinPDF(
      student.name,
      student.docId,
      selectedCourse,
      student.currentPeriodGpa,
      student.accumulatedAnnualGpa,
      student.subjects,
      "Periodo 2 (2026-I)",
      "Lic. Patricia Martínez",
      "Colegio Demo AulaCore - Sede Principal"
    );
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, isPrinted: true } : s));
    showToast('Boletín Generado en PDF', `El informe académico físico de ${student.name} ha sido generado con todos los datos institucionales y promedio acumulado.`);
  };

  const handleSendVirtual = (student: StudentConsolidatedGrade) => {
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, isSentVirtual: true } : s));
    showToast('Envío Virtual Exitoso 📤', `El boletín de ${student.name} se notificó al portal familiar y al WhatsApp del acudiente con promedio acumulado: ${student.accumulatedAnnualGpa.toFixed(2)}.`);
  };

  const handleMassDownload = () => {
    showToast('Generando Paquete Completo PDF 📦', `Preparando el archivo consolidado con los ${students.length} boletines del grado ${selectedCourse} listos para impresión.`);
    if (students.length > 0) {
      handleDownloadPDF(students[0]);
    }
  };

  const handleMassSendVirtual = () => {
    setStudents(prev => prev.map(s => ({ ...s, isSentVirtual: true })));
    showToast('Notificación Masiva Enviada 📲', `Se han transmitido de manera virtual los ${students.length} informes del periodo y acumulado del año a los padres de familia de ${selectedCourse}.`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 font-sans">
      {/* Toast Notificador */}
      {toastMsg && (
        <div className={cn(
          "fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border flex items-start gap-3 max-w-md animate-in slide-in-from-top-3 transition-all",
          toastMsg.type === 'success' ? "bg-emerald-950 text-white border-emerald-700" : "bg-indigo-950 text-white border-indigo-700"
        )}>
          <div className="p-2 rounded-xl bg-white/10 shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-black tracking-tight">{toastMsg.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 font-medium leading-relaxed">{toastMsg.desc}</p>
          </div>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 rounded-3xl p-8 text-white shadow-xl border border-purple-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-purple-500/30 text-purple-200 border border-purple-400/40 px-3 py-1 text-xs font-black uppercase tracking-wider">
                👑 Consola Dirección de Curso
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 text-xs font-bold">
                ✔ Periodo 2 Activo (2026-I)
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Organización de Calificaciones y Boletines
            </h1>
            <p className="text-sm text-purple-200/80 max-w-3xl leading-relaxed font-medium">
              Recepción centralizada de las notas emitidas por los docentes en sus asignaturas. Consolidación automática, cálculo del promedio acumulado del año y emisión de informes físicos y virtuales para padres de familia.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto shrink-0">
            <div className="bg-purple-950/80 border border-purple-800/80 p-3 rounded-2xl">
              <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider block">Grupo Asignado</span>
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="bg-purple-900 text-white font-black text-sm rounded-xl px-4 py-2 border border-purple-700 outline-none focus:border-amber-400 cursor-pointer w-full"
              >
                <option value="10°A">🎓 Grado 10°A – Dirección Lic. Patricia M.</option>
                <option value="9°B">📐 Grado 9°B – Asignación Secundaria</option>
              </select>
            </div>

            <Button 
              onClick={handleMassDownload}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-6 py-6 rounded-2xl shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Todos PDF ({students.length})</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Tarjetas de Métricas Institucionales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-indigo-50/50 via-white to-white rounded-2xl overflow-hidden border-l-4 border-l-indigo-600">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Promedio Acumulado Año</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-black text-slate-900">4.52</h3>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">Superior</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">Su promedio hasta la fecha es: 4.52</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-emerald-50/50 via-white to-white rounded-2xl overflow-hidden border-l-4 border-l-emerald-600">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Recepción de Docentes</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-black text-slate-900">100%</h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Completo</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">8 de 8 asignaturas del curso recibidas</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-purple-50/50 via-white to-white rounded-2xl overflow-hidden border-l-4 border-l-purple-600">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Informes Listos</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-black text-slate-900">{students.length}</h3>
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">Alumnos</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">Verificados con firma del Director</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-amber-50/50 via-white to-white rounded-2xl overflow-hidden border-l-4 border-l-amber-600">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Envío a Padres</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-black text-slate-900">Virtual / Físico</h3>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">Interoperabilidad SIMAT y Portal Familiar</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Share2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN 1: RECEPCIÓN DE CALIFICACIONES DE LOS DOCENTES POR ASIGNATURA */}
      <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/80 border-b border-slate-200 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Estado de Notas Recibidas por Asignatura (Docentes de {selectedCourse})
            </CardTitle>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Los profesores de cada asignatura han finalizado sus planillas. Las calificaciones están sincronizadas y listas para reportes.
            </p>
          </div>
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1.5 text-xs font-black">
            ✔ 8 Asignaturas Sincronizadas
          </Badge>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_SUBJECTS_RECEIVED.map((sub, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 transition-colors flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-900 truncate">{sub.name}</span>
                    <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-150">{sub.avg.toFixed(1)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{sub.teacher}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-[11px] font-bold text-emerald-700">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {sub.status}
                  </span>
                  <span className="text-slate-400 font-normal">Listo</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN 2: TABLA DE ESTUDIANTES Y EMISIóN DE BOLETINES */}
      <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/80 border-b border-slate-200 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Sábana Académica y Emisión de Boletines Oficiales ({selectedCourse})
            </CardTitle>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Descarga los informes en PDF o notifícalos de manera virtual a los acudientes. Incluye el cálculo automático del promedio acumulado hasta la fecha.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input 
                placeholder="Buscar por nombre o doc..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs font-bold rounded-xl bg-white border-slate-300"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 cursor-pointer outline-none"
            >
              <option value="ALL">All Desempeños</option>
              <option value="Superior">⭐ Superior (≥ 4.6)</option>
              <option value="Alto">🟢 Alto (4.0 - 4.5)</option>
              <option value="Básico">🟡 Básico (3.0 - 3.9)</option>
              <option value="Bajo">🔴 Bajo (Riesgo &lt; 3.0)</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-4 pl-6 pr-4">Estudiante & Identificación</th>
                <th className="py-4 px-4 text-center">Promedio Acumulado del Año</th>
                <th className="py-4 px-4 text-center">Nota P2</th>
                <th className="py-4 px-4 text-center">Matemáticas</th>
                <th className="py-4 px-4 text-center">Lengua</th>
                <th className="py-4 px-4 text-center">Inglés</th>
                <th className="py-4 px-4 text-center">Estado Entrega</th>
                <th className="py-4 pl-4 pr-6 text-right">Acciones de Emisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-medium text-slate-700">
              {filteredStudents.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0" />
                      <div>
                        <span className="font-black text-slate-900 text-sm block">{s.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono block">{s.docId}</span>
                      </div>
                    </div>
                  </td>

                  {/* Promedio Acumulado del Año */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex flex-col items-center bg-gradient-to-b from-amber-50 to-amber-100/60 border border-amber-300/80 px-3.5 py-1.5 rounded-2xl shadow-2xs">
                      <span className="text-base font-black text-amber-900">{s.accumulatedAnnualGpa.toFixed(2)}</span>
                      <span className="text-[10px] font-extrabold text-amber-800 tracking-tight">
                        Su promedio hasta la fecha es: {s.accumulatedAnnualGpa.toFixed(2)}
                      </span>
                    </div>
                  </td>

                  {/* Nota Periodo 2 */}
                  <td className="py-4 px-4 text-center">
                    <span className={cn(
                      "font-extrabold px-2.5 py-1 rounded-lg text-xs",
                      s.currentPeriodGpa >= 4.6 ? "bg-purple-100 text-purple-800" : s.currentPeriodGpa >= 4.0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    )}>
                      {s.currentPeriodGpa.toFixed(2)}
                    </span>
                  </td>

                  {/* Asignaturas muestra */}
                  <td className="py-4 px-4 text-center font-bold text-slate-800">
                    {s.subjects.find(sub => sub.name.includes('Matemáticas'))?.score.toFixed(1) || '4.5'}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-slate-800">
                    {s.subjects.find(sub => sub.name.includes('Lengua'))?.score.toFixed(1) || '4.4'}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-slate-800">
                    {s.subjects.find(sub => sub.name.includes('Inglés'))?.score.toFixed(1) || '4.8'}
                  </td>

                  {/* Estado de Emisión */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      {s.isPrinted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                          <Check className="w-3 h-3" /> Físico Impreso
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">Físico Pendiente</span>
                      )}
                      {s.isSentVirtual ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Virtual Enviado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">Virtual Pendiente</span>
                      )}
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="py-4 pl-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleDownloadPDF(s)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] h-8 px-3 rounded-xl shadow-2xs gap-1.5 cursor-pointer"
                        title="Descargar PDF con datos del colegio, director de grupo y promedio acumulado"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>PDF Boletín</span>
                      </Button>

                      <Button
                        onClick={() => handleSendVirtual(s)}
                        variant="outline"
                        className="border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[11px] h-8 px-3 rounded-xl shadow-2xs gap-1 cursor-pointer"
                        title="Transmitir de forma virtual a la plataforma y correo de padres"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Virtual</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>

        {/* Footer con Acciones de Cierre */}
        <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">Validación Institucional Completada</h4>
              <p className="text-xs text-slate-500 font-medium">Las calificaciones cumplen con el Decreto 1290 y el SIEE del colegio.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={handleMassSendVirtual}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-5 rounded-xl shadow-md gap-2 w-full sm:w-auto cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Todos Virtual a Padres</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
