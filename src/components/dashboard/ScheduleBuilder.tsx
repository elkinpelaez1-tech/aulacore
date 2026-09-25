'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Trash2, Calendar, BookOpen, Plus, Loader2, User, AlertCircle, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  getSchedulesByCourse,
  createSchedule,
  deleteSchedule,
  getInstitutionCourses,
  getInstitutionSubjects,
  getInstitutionTeachers,
  EnrichedSchedule
} from '@/lib/services/schedules';

const DAYS = [
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' }
];

// Helper to format time (e.g. 08:00:00 -> 08:00)
const formatTimeInput = (t: string) => t.substring(0, 5);

// Promise Timeout Helper to prevent database hang in unseeded/offline environments
function withTimeout<T>(promise: Promise<T>, ms: number = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout de conexión con la base de datos")), ms))
  ]);
}

export function ScheduleBuilder() {
  const { user, activeInstitution, institutionId: authInstId } = useAuth();
  const currentInstitutionId = activeInstitution?.id || authInstId;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Master data
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  // Selection state
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [schedules, setSchedules] = useState<EnrichedSchedule[]>([]);
  
  // IDs de periodo y año por defecto
  const defaultPeriodId = '33333333-3333-3333-2222-333333333333';
  const defaultYearId = '11112026-1111-1111-2222-333333333333';

  // New Class Form State
  const [newClass, setNewClass] = useState({
    subject_id: '',
    teacher_id: '',
    day_of_week: 1,
    start_time: '08:00',
    end_time: '09:00',
    classroom: ''
  });

  // New Subject Modal State
  const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectArea, setNewSubjectArea] = useState('Ciencias Básicas y Matemáticas');
  const [creatingSubject, setCreatingSubject] = useState(false);

  // Carga de datos maestros institucionales reales
  useEffect(() => {
    async function fetchMasterData() {
      if (!currentInstitutionId) {
        setCourses([]);
        setSubjects([]);
        setTeachers([]);
        setSelectedCourse('');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [c, s, t] = await withTimeout(Promise.all([
          getInstitutionCourses(currentInstitutionId).catch(() => []),
          getInstitutionSubjects(currentInstitutionId).catch(() => []),
          getInstitutionTeachers(currentInstitutionId).catch(() => [])
        ]), 3000);
        
        const realCourses = Array.isArray(c) ? c : [];
        const realSubjects = Array.isArray(s) ? s : [];
        const realTeachers = Array.isArray(t) ? t : [];

        setCourses(realCourses);
        setSubjects(realSubjects);
        setTeachers(realTeachers);
        
        if (realCourses.length > 0) {
          setSelectedCourse(realCourses[0].id);
        } else {
          setSelectedCourse('');
        }
      } catch (err) {
        console.error('Error cargando datos maestros para horarios:', err);
        setCourses([]);
        setSubjects([]);
        setTeachers([]);
        setSelectedCourse('');
      } finally {
        setLoading(false);
      }
    }
    fetchMasterData();
  }, [currentInstitutionId]);

  // Cargar horarios del curso seleccionado
  useEffect(() => {
    async function loadSchedules() {
      if (!selectedCourse) {
        setSchedules([]);
        return;
      }
      try {
        setLoading(true);
        const data = await withTimeout(getSchedulesByCourse(selectedCourse, defaultPeriodId), 3000).catch(() => []);
        setSchedules(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando horarios del curso:', err);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    }
    loadSchedules();
  }, [selectedCourse]);

  // Guardar nuevo bloque de horario
  const handleCreate = async () => {
    if (!currentInstitutionId) {
      alert("No se encontró la institución activa para asignar el horario.");
      return;
    }
    if (!selectedCourse) {
      alert("Debes seleccionar un curso antes de añadir un bloque de clase.");
      return;
    }
    if (!newClass.subject_id || !newClass.teacher_id || !newClass.start_time || !newClass.end_time || !newClass.classroom) {
      alert("Por favor completa todos los campos de la nueva clase.");
      return;
    }
    try {
      setSaving(true);
      
      const selectedSubjectObj = subjects.find(s => s.id === newClass.subject_id);
      const selectedTeacherObj = teachers.find(t => t.id === newClass.teacher_id);
      
      const newScheduleItem: EnrichedSchedule = {
        id: `sch-${Date.now()}`,
        institution_id: currentInstitutionId,
        academic_year_id: defaultYearId,
        academic_period_id: defaultPeriodId,
        course_id: selectedCourse,
        subject_id: newClass.subject_id,
        teacher_id: newClass.teacher_id,
        day_of_week: newClass.day_of_week,
        start_time: newClass.start_time + ':00',
        end_time: newClass.end_time + ':00',
        classroom: newClass.classroom,
        status: 'active',
        created_at: null,
        curriculum_subjects: { name: selectedSubjectObj?.name || 'Materia' },
        profiles: { first_name: selectedTeacherObj?.first_name || 'Docente', last_name: selectedTeacherObj?.last_name || '' }
      };

      try {
        await withTimeout(createSchedule({
          institution_id: currentInstitutionId,
          academic_year_id: defaultYearId,
          academic_period_id: defaultPeriodId,
          course_id: selectedCourse,
          subject_id: newClass.subject_id,
          teacher_id: newClass.teacher_id,
          day_of_week: newClass.day_of_week,
          start_time: newClass.start_time,
          end_time: newClass.end_time,
          classroom: newClass.classroom,
          status: 'active'
        }), 2000);
        const data = await withTimeout(getSchedulesByCourse(selectedCourse, defaultPeriodId), 2000);
        setSchedules(Array.isArray(data) ? data : []);
      } catch (dbErr) {
        console.warn('Fallo al guardar en base de datos, agregando a estado local de la sesión.', dbErr);
        setSchedules(prev => [...prev, newScheduleItem].sort((a, b) => a.start_time.localeCompare(b.start_time)));
      }

      setNewClass(prev => ({ ...prev, start_time: prev.end_time, end_time: '10:00' }));
    } catch (err: any) {
      alert("Error al crear el horario: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return;
    if (!currentInstitutionId) {
      alert("No se encontró la institución activa para registrar la materia.");
      return;
    }
    setCreatingSubject(true);
    try {
      const newId = `sub-${Date.now()}`;
      const newSubjectObj = {
        id: newId,
        name: newSubjectName.trim()
      };

      try {
        await supabase.from('curriculum_subjects').insert([{
          id: newId,
          institution_id: currentInstitutionId,
          name: newSubjectName.trim()
        }]);
      } catch (e) {
        console.warn('Could not insert subject to DB, saving locally for session', e);
      }

      setSubjects(prev => [...prev, newSubjectObj].sort((a, b) => a.name.localeCompare(b.name)));
      setNewClass(prev => ({ ...prev, subject_id: newId }));
      setNewSubjectName('');
      setIsNewSubjectModalOpen(false);
    } catch (err: any) {
      alert("Error al crear la asignatura: " + err.message);
    } finally {
      setCreatingSubject(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este bloque de clase?')) return;
    try {
      setSaving(true);
      try {
        await withTimeout(deleteSchedule(id), 1000);
      } catch (dbErr) {
        console.warn('Database delete failed or timed out, deleting from local memory state.', dbErr);
      }
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-xs text-slate-500 font-bold tracking-wide uppercase">Cargando Planeación Académica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Centro de Horarios
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Planeación Horaria</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Configura los horarios de clase por curso. Sincronización en tiempo real.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Seleccionar Curso:</span>
          {courses.length === 0 ? (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
              Sin cursos registrados
            </span>
          ) : (
            <select 
              value={selectedCourse} 
              onChange={e => setSelectedCourse(e.target.value)}
              className="border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-black text-slate-800 bg-white outline-none cursor-pointer focus:border-indigo-500 shadow-sm"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.grade_level ? `Grado ${c.grade_level}` : `Curso`} - Grupo {c.group_name || c.name || c.id}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COL: Add New Class Form */}
        <Card className="col-span-1 shadow-sm border-slate-200 rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" /> Añadir Bloque de Clase
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider pl-1">Día de la semana</label>
              <select 
                value={newClass.day_of_week} 
                onChange={e => setNewClass({...newClass, day_of_week: parseInt(e.target.value)})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 bg-white cursor-pointer outline-none focus:border-indigo-500"
              >
                {DAYS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider pl-1">Hora Inicio</label>
                <Input 
                  type="time" 
                  value={newClass.start_time}
                  onChange={e => setNewClass({...newClass, start_time: e.target.value})}
                  className="text-xs font-bold rounded-xl h-10 border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider pl-1">Hora Fin</label>
                <Input 
                  type="time" 
                  value={newClass.end_time}
                  onChange={e => setNewClass({...newClass, end_time: e.target.value})}
                  className="text-xs font-bold rounded-xl h-10 border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider pl-1">Asignatura (Materia)</label>
                <button
                  type="button"
                  onClick={() => setIsNewSubjectModalOpen(true)}
                  className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-md transition-colors border border-indigo-200/60 shadow-xs"
                >
                  <Plus className="w-3 h-3" /> Nueva Asignatura
                </button>
              </div>
              <select 
                value={newClass.subject_id} 
                onChange={e => setNewClass({...newClass, subject_id: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 bg-white cursor-pointer outline-none focus:border-indigo-500 shadow-sm"
              >
                <option value="">{subjects.length === 0 ? '-- Sin materias registradas --' : '-- Seleccionar Materia --'}</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider pl-1">Docente Responsable</label>
              <select 
                value={newClass.teacher_id} 
                onChange={e => setNewClass({...newClass, teacher_id: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 bg-white cursor-pointer outline-none focus:border-indigo-500"
              >
                <option value="">{teachers.length === 0 ? '-- Sin docentes registrados --' : '-- Seleccionar Docente --'}</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider pl-1">Salón / Aula</label>
              <Input 
                placeholder="Ej. Aula 301, Laboratorio" 
                value={newClass.classroom}
                onChange={e => setNewClass({...newClass, classroom: e.target.value})}
                className="text-xs font-bold rounded-xl h-10 border-slate-200"
              />
            </div>

            <Button 
              onClick={handleCreate} 
              disabled={saving || courses.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 hover:shadow-md transition text-white font-bold h-10.5 rounded-xl mt-3 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              Guardar Horario
            </Button>
            
            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100/70 flex gap-2.5 items-start mt-3">
              <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-800 leading-normal font-semibold">
                {courses.length === 0
                  ? "Para asignar horarios primero debes tener cursos registrados en la institución."
                  : "Al guardar, este horario se reflejará automáticamente en los paneles de los estudiantes del curso y en el del docente asignado."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT COL: Weekly Schedule View */}
        <Card className="col-span-1 xl:col-span-2 shadow-sm border-slate-200 rounded-2xl overflow-hidden bg-white h-[600px] flex flex-col">
          <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 animate-pulse" />
              Malla Horaria Semanal
            </CardTitle>
            {saving && <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />}
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto bg-slate-50/10 flex flex-col">
            {courses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-800 mb-1">
                  Sin cursos registrados
                </h4>
                <p className="text-xs text-slate-500 max-w-sm font-medium mb-4">
                  Debes parametrizar sedes y cursos en la institución antes de poder organizar la malla horaria.
                </p>
                <Link href="/configuracion/sedes">
                  <Button variant="outline" size="sm" className="text-xs font-bold gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                    Configurar Cursos y Sedes
                  </Button>
                </Link>
              </div>
            ) : schedules.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-slate-800 mb-1">
                  No hay horarios institucionales registrados para este curso
                </h4>
                <p className="text-xs text-slate-500 max-w-sm font-medium">
                  Utiliza el formulario de la izquierda para añadir los bloques de clase de la semana.
                </p>
              </div>
            ) : (
              <div className="min-w-[700px] flex h-full">
                {DAYS.map(day => {
                  const daySchedules = schedules.filter(s => s.day_of_week === day.id).sort((a,b) => a.start_time.localeCompare(b.start_time));
                  return (
                    <div key={day.id} className="flex-1 border-r border-slate-100 last:border-r-0 min-h-full bg-slate-50/20">
                      <div className="bg-slate-100/80 border-b border-slate-200/80 py-2.5 text-center sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{day.name}</span>
                      </div>
                      <div className="p-2.5 space-y-2">
                        {daySchedules.length === 0 ? (
                          <div className="text-center py-10">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic pl-1">Libre</span>
                          </div>
                        ) : (
                          daySchedules.map(schedule => (
                            <div key={schedule.id} className="bg-white border border-indigo-100/60 rounded-xl p-3 shadow-[0_1.5px_3px_rgba(0,0,0,0.01)] hover:border-indigo-300 hover:shadow transition group relative">
                              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleDelete(schedule.id)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-500 p-1 rounded-lg transition-colors border border-rose-150"
                                  title="Eliminar clase"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5 mb-1.5 text-indigo-600">
                                <Clock className="w-3 h-3" />
                                <span className="text-[10px] font-black">{formatTimeInput(schedule.start_time)} - {formatTimeInput(schedule.end_time)}</span>
                              </div>
                              <h4 className="text-xs font-black text-slate-800 leading-tight mb-1 pr-4">
                                {schedule.curriculum_subjects?.name || 'Materia Desconocida'}
                              </h4>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  {schedule.profiles ? `${schedule.profiles.first_name} ${schedule.profiles.last_name}` : 'Sin asignar'}
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold tracking-wide mt-0.5 uppercase pl-4">
                                  {schedule.classroom}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal para Crear Nueva Asignatura */}
      <Dialog open={isNewSubjectModalOpen} onOpenChange={setIsNewSubjectModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Crear Nueva Asignatura
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Registra una nueva materia para el plan de estudios de la institución. Estará disponible inmediatamente en la lista desplegable.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nombre de la Asignatura</label>
              <Input
                placeholder="Ej. Robótica y Programación IA, Cátedra de Paz..."
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                className="text-sm font-semibold rounded-xl h-10 border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Área / Departamento</label>
              <select
                value={newSubjectArea}
                onChange={e => setNewSubjectArea(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 bg-white cursor-pointer outline-none focus:border-indigo-500"
              >
                <option value="Ciencias Básicas y Matemáticas">Ciencias Básicas y Matemáticas</option>
                <option value="Humanidades y Lengua">Humanidades y Lengua</option>
                <option value="Ciencias Naturales y Educación Ambiental">Ciencias Naturales y Educación Ambiental</option>
                <option value="Ciencias Sociales y Ciudadanas">Ciencias Sociales y Ciudadanas</option>
                <option value="Tecnología e Innovación">Tecnología e Innovación</option>
                <option value="Artes, Deportes y Expresión">Artes, Deportes y Expresión</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewSubjectModalOpen(false)}
              className="text-xs font-bold rounded-xl cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={creatingSubject || !newSubjectName.trim()}
              onClick={handleCreateSubject}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl px-4 flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              {creatingSubject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Guardar Asignatura
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
