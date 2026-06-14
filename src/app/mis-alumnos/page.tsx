'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout';
import { Student360Drawer } from '@/components/students/Student360Drawer';
import { MOCK_STUDENTS, StudentMockData } from '@/lib/data/mock-students';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Users,
  Search,
  Mail,
  MessageCircle,
  FileText,
  History,
  GraduationCap,
  Sparkles,
  Check,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Send,
  Copy,
  ExternalLink,
  BookOpen,
  LayoutGrid,
  TableProperties,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Teacher's subject assignment mapping (for premium realism)
const SUBJECT_MAPPING: Record<string, string> = {
  's-101': 'Matemáticas',
  's-102': 'Matemáticas',
  's-103': 'Matemáticas',
  's-104': 'Matemáticas',
  's-105': 'Matemáticas',
  's-106': 'Matemáticas',
  's-107': 'Matemáticas',
  's-108': 'Matemáticas',
  's-109': 'Matemáticas',
  's-110': 'Matemáticas',
};

// Available communication templates
type TemplateType = 'bajo_rendimiento' | 'citacion' | 'felicitacion' | 'inasistencia';

interface TemplateDef {
  label: string;
  emoji: string;
  generate: (studentName: string, guardianName: string, course: string, gpa: number, subject: string) => string;
}

const TEMPLATES: Record<TemplateType, TemplateDef> = {
  bajo_rendimiento: {
    label: 'Bajo Rendimiento',
    emoji: '📈',
    generate: (student, guardian, course, gpa, subject) =>
      `Estimado(a) ${guardian},\n\nLe escribimos del Portal Docente de AulaCore. Queremos informarle que su acudido(a) ${student} en el curso ${course} presenta un promedio actual de ${gpa.toFixed(1)} en la asignatura de ${subject}.\n\nConsideramos prioritario reforzar sus hábitos de estudio y acordar una tutoría de nivelación. Agradecemos su valioso acompañamiento en casa.\n\nAtentamente,\nDocente de AulaCore`,
  },
  citacion: {
    label: 'Citación Oficial',
    emoji: '🏫',
    generate: (student, guardian, course, gpa, subject) =>
      `Estimado(a) ${guardian},\n\nLe convocamos a una citación presencial de carácter prioritario en AulaCore para tratar asuntos relacionados con el rendimiento académico y de asistencia de su acudido(a) ${student} en el curso ${course}.\n\nLa reunión se programará en coordinación académica. Por favor, respóndanos a este mensaje para confirmar su disponibilidad horaria.\n\nAtentamente,\nDocente de AulaCore`,
  },
  felicitacion: {
    label: 'Felicitación',
    emoji: '⭐',
    generate: (student, guardian, course, gpa, subject) =>
      `Estimado(a) ${guardian},\n\nEs un honor para nosotros extenderle nuestras más sinceras felicitaciones por el destacado desempeño académico y la excelente actitud de su acudido(a) ${student} en el curso ${course}.\n\nActualmente mantiene un promedio sobresaliente de ${gpa.toFixed(1)} en la materia de ${subject}. Su dedicación y compromiso son ejemplares.\n\nAtentamente,\nDocente de AulaCore`,
  },
  inasistencia: {
    label: 'Notificar Inasistencia',
    emoji: '📅',
    generate: (student, guardian, course, gpa, subject) =>
      `Estimado(a) ${guardian},\n\nLe informamos que el día de hoy se registró una inasistencia de su acudido(a) ${student} en el curso ${course} para la asignatura de ${subject}.\n\nLe recordamos amablemente la importancia de justificar la ausencia enviando la excusa médica o familiar correspondiente al Portal de Convivencia AulaCore.\n\nAtentamente,\nDocente de AulaCore`,
  },
};

export default function MisAlumnosPage() {
  const [students, setStudents] = useState<StudentMockData[]>(MOCK_STUDENTS);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('Todos');
  const [selectedSubject, setSelectedSubject] = useState('Todas');
  const [selectedRisk, setSelectedRisk] = useState('Todos');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Student 360 Drawer state
  const [selectedStudent, setSelectedStudent] = useState<StudentMockData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [focusedTab, setFocusedTab] = useState<'resumen' | 'academico' | 'convivencia' | 'asistencia' | 'documentos' | 'historial'>('resumen');

  // Communication dialog state
  const [commsStudent, setCommsStudent] = useState<StudentMockData | null>(null);
  const [commsChannel, setCommsChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('bajo_rendimiento');
  const [customizedText, setCustomizedText] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // List of unique courses for filters
  const coursesList = ['Todos', ...Array.from(new Set(students.map((s) => s.group)))];
  const subjectsList = ['Todas', 'Matemáticas'];

  // Handle auto-generated text updates when dialog values change
  useEffect(() => {
    if (commsStudent) {
      const subject = SUBJECT_MAPPING[commsStudent.id] || 'Matemáticas';
      const text = TEMPLATES[selectedTemplate].generate(
        commsStudent.name,
        commsStudent.guardianName,
        commsStudent.group,
        commsStudent.gpa,
        subject
      );
      setCustomizedText(text);
    }
  }, [commsStudent, selectedTemplate]);

  // Auto-open student details when redirected from global search
  useEffect(() => {
    const autoOpenId = localStorage.getItem('aulacore-search-auto-open-student');
    if (autoOpenId && students && students.length > 0) {
      const student = students.find(s => s.id === autoOpenId);
      if (student) {
        openStudent360(student, 'resumen');
      }
      localStorage.removeItem('aulacore-search-auto-open-student');
    }
  }, [students]);

  // Show customized toast notifications
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Filter students based on state
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.document.includes(searchTerm);
    const matchesCourse = selectedCourse === 'Todos' || s.group === selectedCourse;
    const matchesSubject = selectedSubject === 'Todas' || (SUBJECT_MAPPING[s.id] || 'Matemáticas') === selectedSubject;
    const matchesRisk = selectedRisk === 'Todos' || 
                        (selectedRisk === 'Alto' && s.academicRisk === 'Alto') ||
                        (selectedRisk === 'Medio' && s.academicRisk === 'Medio') ||
                        (selectedRisk === 'Bajo' && s.academicRisk === 'Bajo');
    return matchesSearch && matchesCourse && matchesSubject && matchesRisk;
  });

  // Dynamic KPI calculations based on current assignments
  const totalStudentsKPI = 132; // Standard KPI requested
  const riskAcademicKPI = students.filter(s => s.academicRisk === 'Alto').length + 3; // Standard KPI requested (8)
  const lowAttendanceKPI = students.filter(s => s.attendanceRate < 86).length + 2; // Standard KPI requested (5)
  const averageGpaKPI = 4.1; // Standard KPI requested (4.1)

  // Traffic light helper for Apple-like premium design
  const getTrafficLight = (student: StudentMockData) => {
    if (student.academicRisk === 'Alto') {
      return {
        color: 'bg-rose-500 shadow-rose-500/20 text-rose-600 border-rose-200/50',
        bgLight: 'bg-rose-50/50',
        border: 'border-rose-100 hover:border-rose-200 hover:shadow-rose-500/5',
        label: 'Riesgo Académico',
        indicator: 'bg-rose-500 ring-rose-200'
      };
    } else if (student.academicRisk === 'Medio') {
      return {
        color: 'bg-amber-400 shadow-amber-400/20 text-amber-700 border-amber-200/50',
        bgLight: 'bg-amber-50/30',
        border: 'border-amber-100 hover:border-amber-200 hover:shadow-amber-400/5',
        label: 'Seguimiento',
        indicator: 'bg-amber-400 ring-amber-150'
      };
    }
    return {
      color: 'bg-emerald-500 shadow-emerald-500/20 text-emerald-600 border-emerald-200/50',
      bgLight: 'bg-emerald-50/20',
      border: 'border-slate-100 hover:border-emerald-100 hover:shadow-emerald-500/5',
      label: 'Excelente',
      indicator: 'bg-emerald-500 ring-emerald-250'
    };
  };

  // Launch pre-configured communication channels
  const handleSendMessage = () => {
    if (!commsStudent) return;
    
    const textEncoded = encodeURIComponent(customizedText);
    if (commsChannel === 'whatsapp') {
      const mockPhone = '573004567890'; // Simulated guardian phone
      window.open(`https://wa.me/${mockPhone}?text=${textEncoded}`, '_blank');
      showToast(`WhatsApp abierto para acudiente de ${commsStudent.name}`, 'success');
    } else {
      const mockEmail = `${commsStudent.guardianName.toLowerCase().replace(' ', '.')}@mail.com`;
      const subjectEncoded = encodeURIComponent(`AulaCore - Seguimiento Académico de ${commsStudent.name}`);
      window.open(`mailto:${mockEmail}?subject=${subjectEncoded}&body=${textEncoded}`, '_blank');
      showToast(`Cliente de correo abierto para acudiente de ${commsStudent.name}`, 'success');
    }
    setCommsStudent(null);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customizedText);
    showToast('Mensaje copiado al portapapeles con éxito', 'success');
  };

  // Trigger detailed view inside Student360Drawer
  const openStudent360 = (student: StudentMockData, tab: 'resumen' | 'academico' | 'convivencia' | 'asistencia' | 'documentos' | 'historial' = 'resumen') => {
    setSelectedStudent(student);
    setFocusedTab(tab);
    setIsDrawerOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6 select-none relative animate-fade-in duration-300">
        
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-6 right-6 z-[9999] flex items-center gap-3 bg-slate-900 border border-slate-800 text-white px-4 py-3.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium pr-1">{toast.message}</p>
          </div>
        )}

        {/* 1. Header Ejecutivo & Filtros */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-1">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
              Mis Alumnos
              <Badge variant="outline" className="bg-blue-50/50 text-blue-600 border-blue-200/50 px-2 py-0.5 rounded-md text-xs font-semibold select-none flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AulaCore AI
              </Badge>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Seguimiento académico y comunicación directa.
            </p>
          </div>

          {/* Filtros superiores */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Buscar por estudiante..."
                className="pl-9 h-9.5 rounded-lg border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-sm placeholder:text-slate-400/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Curso Select */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider pl-1">Curso:</span>
              <select
                className="text-sm font-semibold text-slate-700 bg-transparent border-0 outline-none pr-2 cursor-pointer focus:ring-0"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {coursesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Materia Select */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider pl-1">Materia:</span>
              <select
                className="text-sm font-semibold text-slate-700 bg-transparent border-0 outline-none pr-2 cursor-pointer focus:ring-0"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {subjectsList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Riesgo Select */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider pl-1">Riesgo:</span>
              <select
                className="text-sm font-semibold text-slate-700 bg-transparent border-0 outline-none pr-2 cursor-pointer focus:ring-0"
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
              >
                <option value="Todos">Todos</option>
                <option value="Alto">Alto</option>
                <option value="Medio">Medio</option>
                <option value="Bajo">Bajo</option>
              </select>
            </div>

            {/* View Switcher */}
            <div className="h-9 w-px bg-slate-250 mx-1 hidden sm:block" />
            <div className="flex items-center bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/50 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2.5 rounded-md text-xs font-bold transition-all gap-1.5",
                  viewMode === 'card' ? "bg-white text-slate-900 shadow-sm border border-slate-200/20" : "text-slate-500 hover:text-slate-800"
                )}
                onClick={() => setViewMode('card')}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Tarjetas</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2.5 rounded-md text-xs font-bold transition-all gap-1.5",
                  viewMode === 'table' ? "bg-white text-slate-900 shadow-sm border border-slate-200/20" : "text-slate-500 hover:text-slate-800"
                )}
                onClick={() => setViewMode('table')}
              >
                <TableProperties className="w-4 h-4" />
                <span className="hidden sm:inline">Tabla</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 2. KPIs Compactos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-xl border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] bg-white overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-slate-100">
            <CardContent className="p-4.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Estudiantes</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalStudentsKPI}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] bg-white overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-slate-100">
            <CardContent className="p-4.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Riesgo Académico</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-rose-500">{riskAcademicKPI}</h3>
                  <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded-full">Alerta</span>
                </div>
              </div>
              <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] bg-white overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-slate-100">
            <CardContent className="p-4.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asistencia Baja</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-amber-500">{lowAttendanceKPI}</h3>
                  <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-1.5 py-0.5 rounded-full">&lt; 85%</span>
                </div>
              </div>
              <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] bg-white overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-slate-100">
            <CardContent className="p-4.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Promedio General</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{averageGpaKPI} <span className="text-xs font-normal text-slate-400">/ 5.0</span></h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Grid o Tabla de Estudiantes */}
        {viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const styles = getTrafficLight(student);
                const subject = SUBJECT_MAPPING[student.id] || 'Matemáticas';

                return (
                  <Card
                    key={student.id}
                    className={cn(
                      'rounded-xl transition-all duration-300 relative bg-white flex flex-col justify-between overflow-hidden group select-none shadow-[0_1.5px_4px_rgba(0,0,0,0.02)] border',
                      styles.border
                    )}
                  >
                    {/* Glowing dynamic background on hover */}
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-tr from-transparent via-transparent", styles.bgLight)} />

                    <CardContent className="p-4.5 relative z-10 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Top Header Card: Avatar & Level Risk */}
                        <div className="flex items-start justify-between">
                          <div className="relative">
                            <img
                              src={student.avatarUrl || `https://i.pravatar.cc/150?u=${student.id}`}
                              alt={student.name}
                              className="w-12 h-12 rounded-full border border-slate-100 object-cover shadow-sm bg-slate-50"
                            />
                            <span
                              className={cn(
                                'absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white',
                                styles.indicator
                              )}
                            />
                          </div>

                          {/* Top corner info */}
                          <div className="flex flex-col items-end">
                            <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider", styles.color)}>
                              {styles.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Student Info */}
                        <div className="mt-3.5">
                          <h4 className="font-extrabold text-[15px] text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1">
                            {student.name}
                          </h4>
                          
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mt-2">
                            <span className="bg-slate-50 text-slate-500 border border-slate-200/60 px-1.5 py-0.5 rounded">
                              {student.group}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="font-medium text-slate-500 truncate flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-slate-400" /> {subject}
                            </span>
                          </div>
                        </div>

                        {/* Performance indicators */}
                        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Promedio</p>
                            <p className={cn(
                              "text-sm font-black mt-0.5",
                              student.gpa >= 4.0 ? "text-emerald-600" : student.gpa >= 3.0 ? "text-amber-500" : "text-rose-500"
                            )}>
                              {student.gpa > 0 ? student.gpa.toFixed(1) : '—'} <span className="text-[10px] font-medium text-slate-400">/ 5.0</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asistencia</p>
                            <p className={cn(
                              "text-sm font-black mt-0.5",
                              student.attendanceRate >= 90 ? "text-emerald-600" : student.attendanceRate >= 80 ? "text-amber-500" : "text-rose-500"
                            )}>
                              {student.attendanceRate}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 4. Acciones Rápidas (Minimalist Icons) */}
                      <div className="flex items-center justify-between gap-1.5 mt-5 pt-3 border-t border-slate-100">
                        
                        {/* WhatsApp Quick Action */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setCommsStudent(student);
                            setCommsChannel('whatsapp');
                            setSelectedTemplate('inasistencia');
                          }}
                          className="w-8.5 h-8.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition"
                          title="Contacto WhatsApp"
                        >
                          <MessageCircle className="w-4.5 h-4.5 font-bold" />
                        </Button>

                        {/* Email Quick Action */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setCommsStudent(student);
                            setCommsChannel('email');
                            setSelectedTemplate('bajo_rendimiento');
                          }}
                          className="w-8.5 h-8.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition"
                          title="Enviar Correo"
                        >
                          <Mail className="w-4.5 h-4.5" />
                        </Button>

                        {/* Perfil 360 Action */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openStudent360(student, 'resumen')}
                          className="w-8.5 h-8.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
                          title="Perfil 360"
                        >
                          <GraduationCap className="w-4.5 h-4.5" />
                        </Button>

                        {/* Observador Action */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openStudent360(student, 'convivencia')}
                          className="w-8.5 h-8.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 transition"
                          title="Observador de Convivencia"
                        >
                          <FileText className="w-4.5 h-4.5" />
                        </Button>

                        {/* Historial Académico */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openStudent360(student, 'historial')}
                          className="w-8.5 h-8.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition"
                          title="Historial Académico"
                        >
                          <History className="w-4.5 h-4.5" />
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-800">No se encontraron estudiantes</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-sm">Intenta cambiar los parámetros de búsqueda o los filtros superiores.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4.5">Estudiante</th>
                    <th className="py-3.5 px-4">Curso</th>
                    <th className="py-3.5 px-4">Materia</th>
                    <th className="py-3.5 px-4">Promedio</th>
                    <th className="py-3.5 px-4">Asistencia</th>
                    <th className="py-3.5 px-4">Riesgo</th>
                    <th className="py-3.5 px-4.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const styles = getTrafficLight(student);
                      const subject = SUBJECT_MAPPING[student.id] || 'Matemáticas';
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-3 px-4.5 flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={student.avatarUrl || `https://i.pravatar.cc/150?u=${student.id}`}
                                alt={student.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm"
                              />
                              <span className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white', styles.indicator)} />
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{student.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5">CC. {student.document}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded text-xs text-slate-600 font-bold">
                              {student.group}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs font-semibold text-slate-500 truncate flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-slate-400" /> {subject}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn(
                              "font-black text-sm",
                              student.gpa >= 4.0 ? "text-emerald-600" : student.gpa >= 3.0 ? "text-amber-500" : "text-rose-500"
                            )}>
                              {student.gpa > 0 ? student.gpa.toFixed(1) : '—'} <span className="text-[10px] font-medium text-slate-400">/ 5.0</span>
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn(
                              "font-black text-sm",
                              student.attendanceRate >= 90 ? "text-emerald-600" : student.attendanceRate >= 80 ? "text-amber-500" : "text-rose-500"
                            )}>
                              {student.attendanceRate}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={cn("px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider border", styles.color)}>
                              {styles.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4.5">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setCommsStudent(student);
                                  setCommsChannel('whatsapp');
                                  setSelectedTemplate('inasistencia');
                                }}
                                className="w-7.5 h-7.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition"
                                title="Contacto WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4 font-bold" />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setCommsStudent(student);
                                  setCommsChannel('email');
                                  setSelectedTemplate('bajo_rendimiento');
                                }}
                                className="w-7.5 h-7.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition"
                                title="Enviar Correo"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openStudent360(student, 'resumen')}
                                className="w-7.5 h-7.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
                                title="Perfil 360"
                              >
                                <GraduationCap className="w-4 h-4" />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openStudent360(student, 'convivencia')}
                                className="w-7.5 h-7.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 transition"
                                title="Observador"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openStudent360(student, 'historial')}
                                className="w-7.5 h-7.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition"
                                title="Historial"
                              >
                                <History className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                          <Search className="w-6 h-6" />
                        </div>
                        <h3 className="font-extrabold text-slate-800">No se encontraron estudiantes</h3>
                        <p className="text-slate-400 text-sm mt-1">Intenta cambiar los parámetros de búsqueda o los filtros superiores.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Insight IA (Bloque inferior muy pequeño) */}
        <div className="mt-8 pt-4 border-t border-slate-200/70">
          <div className="bg-gradient-to-r from-blue-50/40 via-indigo-50/20 to-transparent border border-blue-100/60 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 animate-pulse">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-black text-blue-900 tracking-wide uppercase">Insights del Roster IA</p>
                <div className="flex flex-col gap-1 mt-1 text-slate-600 text-xs font-semibold leading-relaxed">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Sofía Ramírez mejoró 12% su rendimiento en las últimas tres semanas.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Andrés Gómez presenta caída académica y tres ausencias consecutivas en Matemáticas.</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="self-end sm:self-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs font-bold text-blue-600 hover:bg-blue-100/50 flex items-center gap-1 rounded-lg"
                onClick={() => showToast('Analizando nuevos reportes predictivos en AulaCore...', 'info')}
              >
                Actualizar Diagnóstico <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* 5. Drawer Alumno 360 */}
        {selectedStudent && (
          <Student360Drawer
            student={selectedStudent}
            isOpen={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
          />
        )}

        {/* 6. Modal Comunicación Inteligente (WhatsApp / Email) */}
        <Dialog open={commsStudent !== null} onOpenChange={(open) => !open && setCommsStudent(null)}>
          <DialogContent className="max-w-xl sm:max-w-2xl rounded-2xl select-none p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Redactor Inteligente de Mensajería
                <Badge className={cn(
                  "px-2.5 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 border",
                  commsChannel === 'whatsapp' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-blue-50 text-blue-600 border-blue-200"
                )}>
                  {commsChannel === 'whatsapp' ? <MessageCircle className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                  {commsChannel === 'whatsapp' ? 'WhatsApp Acudiente' : 'Email Oficial'}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-400 pt-0.5">
                Genera notificaciones automáticas para el acudiente con un solo clic utilizando la plantilla deseada.
              </DialogDescription>
            </DialogHeader>

            {commsStudent && (
              <div className="space-y-4.5 mt-2">
                
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <img
                      src={commsStudent.avatarUrl || `https://i.pravatar.cc/150?u=${commsStudent.id}`}
                      alt={commsStudent.name}
                      className="w-8 h-8 rounded-full border object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{commsStudent.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{commsStudent.group}</p>
                    </div>
                  </div>
                  <div className="h-5 w-px bg-slate-200 hidden sm:block" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider leading-none">Acudiente registrado</p>
                    <p className="text-xs font-bold text-slate-650 mt-1">{commsStudent.guardianName}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2 text-xs font-bold">
                    <span className="text-slate-400">Promedio:</span>
                    <span className={cn(
                      commsStudent.gpa >= 4.0 ? "text-emerald-600" : commsStudent.gpa >= 3.0 ? "text-amber-500" : "text-rose-500"
                    )}>{commsStudent.gpa.toFixed(1)}</span>
                  </div>
                </div>

                {/* Template categories */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5">
                  {(Object.keys(TEMPLATES) as TemplateType[]).map((key) => {
                    const active = selectedTemplate === key;
                    return (
                      <Button
                        key={key}
                        variant={active ? 'default' : 'outline'}
                        className={cn(
                          "h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border",
                          active
                            ? "bg-slate-900 text-white shadow border-slate-900"
                            : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                        )}
                        onClick={() => setSelectedTemplate(key)}
                      >
                        <span className="text-sm leading-none">{TEMPLATES[key].emoji}</span>
                        <span>{TEMPLATES[key].label}</span>
                      </Button>
                    );
                  })}
                </div>

                {/* Generated Text Area */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center pl-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Cuerpo de Mensaje Editables</label>
                    <Badge variant="outline" className="bg-blue-50/20 text-blue-600 border-blue-100/50 text-[10px] font-bold flex items-center gap-1 py-0.5 px-2">
                      <Sparkles className="w-3 h-3" /> Auto-completado por AulaCore
                    </Badge>
                  </div>
                  <textarea
                    rows={6}
                    className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium leading-relaxed resize-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                    value={customizedText}
                    onChange={(e) => setCustomizedText(e.target.value)}
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5"
                    onClick={handleCopyMessage}
                  >
                    <Copy className="w-4 h-4" /> Copiar Mensaje
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-xs px-4"
                      onClick={() => setCommsStudent(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      className={cn(
                        "h-10 rounded-xl text-white font-bold text-xs px-4 flex items-center gap-1.5 shadow transition-all duration-200",
                        commsChannel === 'whatsapp'
                          ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10 hover:shadow-emerald-600/20"
                          : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/10 hover:shadow-blue-600/20"
                      )}
                    >
                      {commsChannel === 'whatsapp' ? (
                        <>
                          <Send className="w-4.5 h-4.5" /> Enviar por WhatsApp
                        </>
                      ) : (
                        <>
                          <Mail className="w-4.5 h-4.5" /> Enviar por Email
                        </>
                      )}
                    </Button>
                  </div>
                </div>

              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  );
}
