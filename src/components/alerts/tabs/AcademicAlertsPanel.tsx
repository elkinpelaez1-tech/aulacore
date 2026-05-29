'use client';

import React, { useState } from 'react';
import { GraduationCap, Search, BookOpen, Clock, CheckCircle2, User, ChevronRight, AlertTriangle, Calendar } from 'lucide-react';
import { MOCK_STUDENTS, StudentMockData } from '@/lib/data/mock-students';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AcademicAlertsPanelProps {
  onIntervene?: (studentName: string) => void;
}

export function AcademicAlertsPanel({ onIntervene }: AcademicAlertsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Todas');
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const academicRiskStudents = MOCK_STUDENTS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = s.gpa < 3.5 || s.academicRisk === 'Alto' || s.academicRisk === 'Medio';
    return matchesSearch && matchesRisk;
  });

  const subjects = [
    { name: 'Matemáticas', failCount: 18, riskLevel: 'Alto', color: 'text-rose-600 bg-rose-50' },
    { name: 'Física', failCount: 12, riskLevel: 'Alto', color: 'text-rose-600 bg-rose-50' },
    { name: 'Química', failCount: 9, riskLevel: 'Medio', color: 'text-amber-600 bg-amber-50' },
    { name: 'Español', failCount: 4, riskLevel: 'Bajo', color: 'text-emerald-600 bg-emerald-50' },
  ];

  const handleAction = (studentId: string, actionType: 'tutor' | 'piar', name: string) => {
    setLoadingStudentId(studentId + '-' + actionType);
    
    setTimeout(() => {
      setLoadingStudentId(null);
      setToast({
        title: actionType === 'tutor' ? 'Tutoría Agendada' : 'Plan PIAR Creado',
        message: actionType === 'tutor'
          ? `Sesión de refuerzo de Matemáticas agendada con éxito para ${name}.`
          : `Plan individual de ajuste razonable (PIAR) iniciado para ${name}.`
      });
      
      setTimeout(() => setToast(null), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Subject Statistics Block */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {subjects.map(subj => (
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
        ))}
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
                        onClick={() => handleAction(student.id, 'tutor', student.name)}
                        disabled={loadingStudentId !== null}
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-[10px] font-bold h-8 rounded-lg"
                      >
                        {isTutorLoading ? (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 animate-spin" /> Agendando...</span>
                        ) : (
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-indigo-600" /> Agendar Tutoría</span>
                        )}
                      </Button>
                      
                      <Button 
                        size="sm"
                        onClick={() => handleAction(student.id, 'piar', student.name)}
                        disabled={loadingStudentId !== null}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold h-8 rounded-lg shadow-sm"
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
                <p>No se encontraron estudiantes que coincidan con la búsqueda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Academic Recommendations Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-indigo-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-xs font-black text-indigo-200 uppercase tracking-widest">Plan Curricular AulaCore AI</h3>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              El análisis predictivo arroja una correlación del 82% entre la baja nota en Matemáticas del curso 9-B y las ausencias no justificadas de los días martes.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="w-1.5 h-auto bg-indigo-500 rounded-full shrink-0"></div>
                <div>
                  <h5 className="text-xs font-black text-slate-200">Refuerzo Prioritario</h5>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                    Priorizar tutoría en Álgebra para los cursos 9-A y 9-B de forma sincrónica los días miércoles.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="w-1.5 h-auto bg-amber-500 rounded-full shrink-0"></div>
                <div>
                  <h5 className="text-xs font-black text-slate-200">Ajuste de Syllabus</h5>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                    Aplazar el examen parcial de Física de 10-A un periodo de 5 días para equilibrar cobertura curricular.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow-md transition-all">
            Ver recomendaciones completas
          </button>
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

    </div>
  );
}
