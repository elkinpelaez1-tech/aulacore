'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, Search, BookOpen, Clock, CheckCircle2, User, ChevronRight, AlertTriangle, Calendar, X, Sparkles } from 'lucide-react';
interface StudentAlertData {
  id: string;
  name: string;
  group?: string;
  alerts?: any[];
  academicRisk?: string;
  behaviorRisk?: string;
  avatarUrl?: string;
  gpa: number;
  attendanceRate: number;
}
const institutionalStudents: StudentAlertData[] = [];
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AcademicAlertsPanelProps {
  onIntervene?: (studentName: string) => void;
  institutionId?: string | null;
}

export function AcademicAlertsPanel({ onIntervene, institutionId }: AcademicAlertsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Todas');
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const tutoriasKey = institutionId ? `aulacore-scheduled-tutorias-${institutionId}` : 'aulacore-scheduled-tutorias';
  const piarsKey = institutionId ? `aulacore-student-piar-plans-${institutionId}` : 'aulacore-student-piar-plans';

  // Modal states
  const [activeStudent, setActiveStudent] = useState<StudentAlertData | null>(null);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [isPiarModalOpen, setIsPiarModalOpen] = useState(false);

  // Form states for Tutoría
  const [tutorSubject, setTutorSubject] = useState('');
  const [tutorTeacher, setTutorTeacher] = useState('');
  const [tutorDate, setTutorDate] = useState('');
  const [tutorTime, setTutorTime] = useState('14:00');
  const [tutorMode, setTutorMode] = useState('Presencial');
  const [tutorNotes, setTutorNotes] = useState('');

  // Form states for PIAR
  const [piarGoals, setPiarGoals] = useState('Ajuste de evaluaciones, tiempos extendidos y apoyo visual.');
  const [piarStrategies, setPiarStrategies] = useState('Uso de material concreto, simplificación de instrucciones escritas y tutorías semanales.');
  const [piarSupport, setPiarSupport] = useState('Psicoorientadora');
  const [piarFrequency, setPiarFrequency] = useState('Quincenal');
  const [piarStartDate, setPiarStartDate] = useState('');

  // Load scheduled items from localStorage on mount/update
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [scheduledTutorias, setScheduledTutorias] = useState<any[]>([]);
  const [activePiars, setActivePiars] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      if (typeof window !== 'undefined') {
        const tuts = localStorage.getItem(tutoriasKey);
        if (tuts) {
          try {
            setScheduledTutorias(JSON.parse(tuts));
          } catch (e) {}
        } else {
          setScheduledTutorias([]);
        }
        const piars = localStorage.getItem(piarsKey);
        if (piars) {
          try {
            setActivePiars(JSON.parse(piars));
          } catch (e) {}
        } else {
          setActivePiars([]);
        }
      }
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [refreshTrigger, tutoriasKey, piarsKey]);

  const academicRiskStudents = institutionalStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = s.gpa < 3.5 || s.academicRisk === 'Alto' || s.academicRisk === 'Medio';
    return matchesSearch && matchesRisk;
  });

  const subjects: any[] = [];

  const handleScheduleTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;

    setLoadingStudentId(activeStudent.id + '-tutor');
    setIsTutorModalOpen(false);

    setLoadingStudentId(null);

    const newTutoria = {
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        subject: tutorSubject,
        teacher: tutorTeacher,
        date: tutorDate || new Date().toLocaleDateString('es-ES'),
        time: tutorTime,
        mode: tutorMode,
        notes: tutorNotes
      };

      const existingTutoriasStr = localStorage.getItem(tutoriasKey);
      let tutoriasList = [];
      if (existingTutoriasStr) {
        try {
          tutoriasList = JSON.parse(existingTutoriasStr);
        } catch (err) {}
      }
      tutoriasList.push(newTutoria);
      localStorage.setItem(tutoriasKey, JSON.stringify(tutoriasList));
      setRefreshTrigger(prev => prev + 1);

      setToast({
        title: 'Tutoría Agendada',
        message: `Tutoría de ${tutorSubject} agendada para ${activeStudent.name}.`
      });

    setTutorNotes('');
    setToast(null);
  };

  const handleCreatePiar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;

    setLoadingStudentId(activeStudent.id + '-piar');
    setIsPiarModalOpen(false);

    setLoadingStudentId(null);

    const newPiar = {
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        goals: piarGoals,
        strategies: piarStrategies,
        support: piarSupport,
        frequency: piarFrequency,
        startDate: piarStartDate || new Date().toLocaleDateString('es-ES')
      };

      const existingPiarsStr = localStorage.getItem(piarsKey);
      let piarsList = [];
      if (existingPiarsStr) {
        try {
          piarsList = JSON.parse(existingPiarsStr);
        } catch (err) {}
      }
      piarsList.push(newPiar);
      localStorage.setItem(piarsKey, JSON.stringify(piarsList));
      setRefreshTrigger(prev => prev + 1);

    setToast({
      title: 'Plan PIAR Creado',
      message: `Plan individual de ajuste razonable (PIAR) iniciado para ${activeStudent.name}.`
    });

    setToast(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Subject Statistics Block */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {subjects.length === 0 ? (
          <div className="col-span-full p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-white shadow-sm">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">Sin materias con alertas de rendimiento.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Las asignaturas con reprobación o riesgo aparecerán consolidadas aquí.</p>
          </div>
        ) : (
          subjects.map(subj => (
            <div key={subj.name} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-md", subj.color)}>
                  Riesgo: {subj.riskLevel}
                </span>
                <h4 className="text-sm font-black text-slate-800 mt-2">{subj.name}</h4>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{subj.failCount} Alumnos con alertas</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* At-risk student list */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" /> Monitoreo de Rendimiento Crítico
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Estudiantes con alertas académicas activas o promedio menor a 3.5</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Buscar por nombre..." 
                className="pl-9 text-xs font-semibold placeholder:text-slate-400 border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 scrollbar-hide">
            {academicRiskStudents.length > 0 ? (
              academicRiskStudents.map(student => {
                const isTutorLoading = loadingStudentId === `${student.id}-tutor`;
                const isPiarLoading = loadingStudentId === `${student.id}-piar`;

                return (
                  <div 
                    key={student.id} 
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 hover:bg-slate-100/50 transition-colors"
                  >
                    <div 
                      onClick={() => onIntervene?.(student.name)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-150 flex items-center justify-center shrink-0 font-black text-indigo-700">
                        {student.avatarUrl ? (
                          <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                          {student.name}
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-indigo-600" />
                        </h4>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          Curso: {student.group} • Promedio: {student.gpa > 0 ? student.gpa.toFixed(1) : 'N/A'} • Nivel: {student.academicRisk}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveStudent(student);
                          setIsTutorModalOpen(true);
                        }}
                        disabled={loadingStudentId !== null}
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-[10px] font-bold h-8 rounded-lg cursor-pointer"
                      >
                        {isTutorLoading ? (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 animate-spin" /> Agendando...</span>
                        ) : (
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-indigo-600" /> Agendar Tutoría</span>
                        )}
                      </Button>
                      
                      <Button 
                        size="sm"
                        onClick={() => {
                          setActiveStudent(student);
                          setIsPiarModalOpen(true);
                        }}
                        disabled={loadingStudentId !== null}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold h-8 rounded-lg shadow-sm cursor-pointer"
                      >
                        {isPiarLoading ? (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 animate-spin" /> Creando...</span>
                        ) : (
                          <span className="flex items-center gap-1">Crear Plan PIAR</span>
                        )}
                      </Button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 text-slate-400 font-semibold border border-dashed border-slate-200 rounded-2xl">
                <GraduationCap className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p>No hay estudiantes con alertas académicas registradas.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column container */}
        <div className="space-y-6">
          {/* Academic Recommendations Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center gap-2 mb-4 text-indigo-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-xs font-black text-indigo-200 uppercase tracking-widest">Plan Curricular AulaCore AI</h3>
              </div>
              
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Análisis predictivo disponible una vez se consoliden calificaciones del periodo.
              </p>

              <div className="mt-6 p-6 rounded-xl bg-white/5 border border-white/5 text-center">
                <p className="text-xs font-semibold text-slate-400">Sin recomendaciones predictivas ficticias.</p>
                <p className="text-[10px] text-slate-500 mt-1">El motor curricular procesará los planes de refuerzo con base en datos reales.</p>
              </div>
            </div>

            <button disabled className="w-full mt-6 py-2.5 bg-slate-800 text-xs font-bold text-slate-500 rounded-xl cursor-not-allowed border border-slate-700/50">
              Recomendaciones curriculares (Próximamente)
            </button>
          </div>

          {/* Control de Citaciones y Planes */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Calendar className="w-4 h-4 text-indigo-600" /> Control de Citaciones y Planes
            </h4>

            {scheduledTutorias.length === 0 && activePiars.length === 0 ? (
              <p className="text-[11px] font-semibold text-slate-450 text-center py-6">
                No hay tutorías agendadas ni planes PIAR activos para el período actual.
              </p>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-hide">
                {scheduledTutorias.map((tut, idx) => (
                  <div key={`tut-${idx}`} className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1.5 shadow-sm hover:border-indigo-150 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        Tutoría: {tut.subject}
                      </span>
                      <span className="text-[10px] font-black text-slate-400">
                        {tut.date} • {tut.time}
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-800">{tut.studentName}</p>
                    <p className="text-[11px] font-semibold text-slate-600">
                      Docente: {tut.teacher} • <span className="italic">{tut.mode}</span>
                    </p>
                    {tut.notes && (
                      <p className="text-[11px] text-slate-500 border-t border-slate-105 pt-1.5 mt-1.5 font-semibold truncate" title={tut.notes}>
                        Nota: {tut.notes}
                      </p>
                    )}
                  </div>
                ))}

                {activePiars.map((piar, idx) => (
                  <div key={`piar-${idx}`} className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1.5 shadow-sm hover:border-emerald-150 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        Plan PIAR (Inclusión)
                      </span>
                      <span className="text-[10px] font-black text-slate-400">
                        Inicio: {piar.startDate}
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-800">{piar.studentName}</p>
                    <p className="text-[11px] font-semibold text-slate-600">
                      Apoyo: {piar.support} • Monitoreo: {piar.frequency}
                    </p>
                    <p className="text-[11px] text-slate-500 border-t border-slate-105 pt-1.5 mt-1.5 font-semibold truncate" title={piar.strategies}>
                      Estrategia: {piar.strategies}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Floating toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-800 tracking-tight">{toast.title}</h4>
            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Modal: Agendar Tutoría */}
      {isTutorModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsTutorModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" />
          <div className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle relative z-10 w-full animate-in zoom-in-95 duration-250">
            <form onSubmit={handleScheduleTutor}>
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600 animate-bounce" />
                    Agendar Tutoría de Refuerzo
                  </h3>
                  <p className="text-[11px] text-slate-550 font-semibold mt-0.5">Estudiante: <span className="text-indigo-650 font-bold">{activeStudent.name}</span> ({activeStudent.group})</p>
                </div>
                <button type="button" onClick={() => setIsTutorModalOpen(false)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4 text-xs font-semibold text-slate-705">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Materia de Refuerzo</label>
                    <Input
                      placeholder="Materia a reforzar..."
                      value={tutorSubject}
                      onChange={e => setTutorSubject(e.target.value)}
                      required
                      className="bg-slate-50 border-slate-200 h-10 font-bold text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Docente Asignado</label>
                    <Input
                      placeholder="Docente responsable..."
                      value={tutorTeacher}
                      onChange={e => setTutorTeacher(e.target.value)}
                      required
                      className="bg-slate-50 border-slate-200 h-10 font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Fecha de la Sesión</label>
                    <Input 
                      type="date"
                      required
                      value={tutorDate}
                      onChange={e => setTutorDate(e.target.value)}
                      className="bg-slate-50 border-slate-200 h-10 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Hora Programada</label>
                    <Input 
                      type="time"
                      required
                      value={tutorTime}
                      onChange={e => setTutorTime(e.target.value)}
                      className="bg-slate-50 border-slate-200 h-10 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Modalidad de Tutoría</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-[10px] font-black uppercase">
                    <button
                      type="button"
                      onClick={() => setTutorMode('Presencial')}
                      className={cn(
                        "py-2 rounded-lg cursor-pointer transition-all border-none outline-none",
                        tutorMode === 'Presencial' ? "bg-white text-indigo-750 font-extrabold shadow-sm" : "text-slate-500 hover:bg-slate-200/50"
                      )}
                    >
                      Presencial
                    </button>
                    <button
                      type="button"
                      onClick={() => setTutorMode('Virtual (Google Meet)')}
                      className={cn(
                        "py-2 rounded-lg cursor-pointer transition-all border-none outline-none",
                        tutorMode === 'Virtual (Google Meet)' ? "bg-white text-indigo-750 font-extrabold shadow-sm" : "text-slate-500 hover:bg-slate-200/50"
                      )}
                    >
                      Virtual (Meet)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Notas y Foco Académico</label>
                  <textarea
                    rows={3}
                    placeholder="Ej. Reforzar fracciones y operaciones aritméticas básicas para el examen bimestral..."
                    value={tutorNotes}
                    onChange={e => setTutorNotes(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsTutorModalOpen(false)} className="h-9 px-4 rounded-xl border-slate-250 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer">
                  Cancelar
                </Button>
                <Button type="submit" className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider border-none cursor-pointer">
                  Agendar Tutoría
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear Plan PIAR */}
      {isPiarModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsPiarModalOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" />
          <div className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle relative z-10 w-full animate-in zoom-in-95 duration-250">
            <form onSubmit={handleCreatePiar}>
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-655 animate-pulse" />
                    Crear Plan PIAR (Inclusión)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Estudiante: <span className="text-indigo-600 font-bold">{activeStudent.name}</span> ({activeStudent.group})</p>
                </div>
                <button type="button" onClick={() => setIsPiarModalOpen(false)} className="text-slate-400 hover:text-slate-650 outline-none border-none bg-transparent cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4 text-xs font-semibold text-slate-705">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Objetivos Curriculares Flexibles</label>
                  <textarea
                    rows={2}
                    required
                    value={piarGoals}
                    onChange={e => setPiarGoals(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Estrategias y Ajustes de Apoyo</label>
                  <textarea
                    rows={2}
                    required
                    value={piarStrategies}
                    onChange={e => setPiarStrategies(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Profesional de Apoyo</label>
                    <select
                      value={piarSupport}
                      onChange={e => setPiarSupport(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 transition-colors cursor-pointer h-10"
                    >
                      <option value="Psicoorientadora">Psicoorientadora</option>
                      <option value="Docente de Apoyo">Docente de Apoyo</option>
                      <option value="Terapista Ocupacional">Terapista Ocupacional</option>
                      <option value="Fonoaudióloga">Fonoaudióloga</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Frecuencia de Monitoreo</label>
                    <select
                      value={piarFrequency}
                      onChange={e => setPiarFrequency(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 outline-none hover:border-indigo-300 transition-colors cursor-pointer h-10"
                    >
                      <option value="Semanal">Semanal</option>
                      <option value="Quincenal">Quincenal</option>
                      <option value="Mensual">Mensual</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">Fecha de Inicio de Plan</label>
                  <Input 
                    type="date"
                    required
                    value={piarStartDate}
                    onChange={e => setPiarStartDate(e.target.value)}
                    className="bg-slate-50 border-slate-200 h-10 font-bold"
                  />
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsPiarModalOpen(false)} className="h-9 px-4 rounded-xl border-slate-250 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer">
                  Cancelar
                </Button>
                <Button type="submit" className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider border-none cursor-pointer">
                  Crear Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
