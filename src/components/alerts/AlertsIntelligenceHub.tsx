'use client';

import React, { useState } from 'react';
import { AlertsFilterBar } from './AlertsFilterBar';
import { AlertsExecutivePanel } from './AlertsExecutivePanel';
import { InstitutionalHeatmap } from './InstitutionalHeatmap';
import { CriticalAlertsFeed } from './CriticalAlertsFeed';
import { RiskPredictionPanel } from './RiskPredictionPanel';
import { MOCK_STUDENTS, StudentMockData } from '@/lib/data/mock-students';
import { Student360Drawer } from '@/components/students/Student360Drawer';

// Premium Tab Component Imports
import { PredictiveAIDashboard } from './tabs/PredictiveAIDashboard';
import { AcademicAlertsPanel } from './tabs/AcademicAlertsPanel';
import { BehaviorAlertsPanel } from './tabs/BehaviorAlertsPanel';
import { RfidAttendancePanel } from './tabs/RfidAttendancePanel';
import { DocenteAlertsPanel } from './tabs/DocenteAlertsPanel';

// Radix Dialog Imports
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { ShieldAlert, Activity, BookOpen, Users, BrainCircuit, X, Clock, CheckCircle2, ChevronRight, AlertTriangle, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HEATMAP_DATA, LIVE_ALERTS, LiveAlert } from '@/lib/data/mock-alerts';

type AlertTab = 'institucional' | 'academica' | 'convivencia' | 'rfid' | 'docentes' | 'ia';

export function AlertsIntelligenceHub() {
  const [activeTab, setActiveTab] = useState<AlertTab>('institucional');
  const [selectedStudent, setSelectedStudent] = useState<StudentMockData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter States
  const [activeFilter, setActiveFilter] = useState<{ type: 'all' | 'level' | 'critical' | 'dropout'; value?: string } | null>(null);
  
  // Modals States
  const [selectedCourseName, setSelectedCourseName] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'Todos' | 'Academica' | 'Convivencia' | 'Asistencia' | 'Docente'>('Todos');
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const handleIntervene = (studentName: string) => {
    const student = MOCK_STUDENTS.find(s => s.name.toLowerCase() === studentName.toLowerCase());
    if (student) {
      setSelectedStudent(student);
      setIsDrawerOpen(true);
    }
  };

  const handleSelectAlert = (alert: LiveAlert) => {
    // Find student in Mock Students database matching first name / full name
    const student = MOCK_STUDENTS.find(s => 
      alert.title.toLowerCase().includes(s.name.toLowerCase()) || 
      alert.description.toLowerCase().includes(s.name.toLowerCase()) ||
      alert.description.toLowerCase().includes(s.name.split(' ')[0].toLowerCase())
    );

    if (student) {
      setSelectedStudent(student);
      setIsDrawerOpen(true);
      return;
    }

    // Otherwise, check if this alert matches a course heatmap block
    const course = HEATMAP_DATA.find(c => 
      alert.title.toLowerCase().includes(c.name.toLowerCase()) || 
      alert.description.toLowerCase().includes(c.name.toLowerCase())
    );

    if (course) {
      setSelectedCourseName(course.name);
    }
  };

  const selectedCourse = HEATMAP_DATA.find(c => c.name === selectedCourseName);
  const courseStudents = selectedCourseName 
    ? MOCK_STUDENTS.filter(s => s.group === selectedCourseName)
    : [];

  const tabs = [
    { id: 'institucional', label: 'Centro Institucional', icon: ShieldAlert },
    { id: 'ia', label: 'AI Prediction', icon: BrainCircuit },
    { id: 'academica', label: 'Académico', icon: BookOpen },
    { id: 'convivencia', label: 'Convivencia', icon: ShieldAlert },
    { id: 'rfid', label: 'Asistencia RFID', icon: Activity },
    { id: 'docentes', label: 'Docentes', icon: Users },
  ] as const;

  return (
    <div className="space-y-6">
      
      {/* Global Filters */}
      <AlertsFilterBar />

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200">
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAI = tab.id === 'ia';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AlertTab)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-bold transition-colors whitespace-nowrap border-b-2",
                  isActive 
                    ? isAI ? "bg-indigo-950 text-indigo-300 border-indigo-500 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]" : "bg-white text-indigo-700 border-indigo-600 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]" 
                    : isAI ? "text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 border-transparent" : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? (isAI ? "text-indigo-400" : "text-indigo-600") : "text-current")} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Areas */}
      <div className="min-h-[600px] animate-in fade-in duration-300">
        
        {activeTab === 'institucional' && (
          <div className="space-y-6">
            <AlertsExecutivePanel 
              activeFilter={activeFilter} 
              onFilterChange={setActiveFilter} 
            />
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <InstitutionalHeatmap 
                  activeFilter={activeFilter}
                  onSelectCourse={setSelectedCourseName}
                />
              </div>
              <div className="xl:col-span-1 flex flex-col gap-6">
                <div className="flex-1">
                  <RiskPredictionPanel 
                    onIntervene={handleIntervene}
                    onViewAIComplete={() => setActiveTab('ia')}
                  />
                </div>
                <div className="flex-1">
                  <CriticalAlertsFeed 
                    onSelectAlert={handleSelectAlert}
                    onViewHistory={() => setIsHistoryOpen(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Prediction Sub-dashboard */}
        {activeTab === 'ia' && (
          <PredictiveAIDashboard onIntervene={handleIntervene} />
        )}

        {/* Académico Sub-dashboard */}
        {activeTab === 'academica' && (
          <AcademicAlertsPanel onIntervene={handleIntervene} />
        )}

        {/* Convivencia Sub-dashboard */}
        {activeTab === 'convivencia' && (
          <BehaviorAlertsPanel onIntervene={handleIntervene} />
        )}

        {/* Asistencia RFID Sub-dashboard */}
        {activeTab === 'rfid' && (
          <RfidAttendancePanel onIntervene={handleIntervene} />
        )}

        {/* Docentes Sub-dashboard */}
        {activeTab === 'docentes' && (
          <DocenteAlertsPanel />
        )}

      </div>

      {/* Student 360 Drawer Overlay */}
      {selectedStudent && (
        <Student360Drawer 
          student={selectedStudent} 
          isOpen={isDrawerOpen} 
          onOpenChange={setIsDrawerOpen} 
          onSelectCourse={(courseName) => {
            setSelectedCourseName(courseName);
          }}
        />
      )}

      {/* Course Detail Radix Dialog Modal */}
      {selectedCourse && (
        <Dialog open={!!selectedCourseName} onOpenChange={(open) => !open && setSelectedCourseName(null)}>
          <DialogContent className="sm:max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <DialogHeader className="border-b border-slate-100 pb-4 shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    Curso {selectedCourse.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-semibold text-slate-500 mt-1">
                    Métricas detalladas y reporte de alumnos activos en AulaCore.
                  </DialogDescription>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0",
                  selectedCourse.overallRisk === 'Alto' ? "bg-rose-100 text-rose-700 border border-rose-200 animate-pulse" :
                  selectedCourse.overallRisk === 'Medio' ? "bg-amber-100 text-amber-700 border border-amber-200" :
                  "bg-emerald-100 text-emerald-700 border border-emerald-200"
                )}>
                  Riesgo: {selectedCourse.overallRisk}
                </span>
              </div>
            </DialogHeader>

            {/* Course KPIs Row */}
            <div className="grid grid-cols-4 gap-3 my-5 shrink-0">
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Promedio GPA</span>
                <span className={cn(
                  "text-lg font-black block mt-1",
                  selectedCourse.gpa < 3.2 ? "text-rose-600" : "text-slate-700"
                )}>{selectedCourse.gpa.toFixed(1)}</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Asistencia</span>
                <span className={cn(
                  "text-lg font-black block mt-1",
                  selectedCourse.attendance < 85 ? "text-rose-600" : "text-slate-700"
                )}>{selectedCourse.attendance}%</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Convivencia</span>
                <span className={cn(
                  "text-lg font-black block mt-1",
                  selectedCourse.behaviorScore < 80 ? "text-rose-600" : "text-slate-700"
                )}>{selectedCourse.behaviorScore < 80 ? 'Crítica' : selectedCourse.behaviorScore < 90 ? 'Seguimiento' : 'Saludable'}</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Alertas Activas</span>
                <span className="text-lg font-black text-rose-500 block mt-1">{selectedCourse.activeAlerts}</span>
              </div>
            </div>

            {/* Students List in Dialog */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-3 min-h-[220px]">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" /> Roster de Estudiantes con Alertas o Seguimiento
              </h4>

              {courseStudents.length > 0 ? (
                courseStudents.map(student => {
                  const hasAlerts = student.alerts.length > 0;
                  const isHighRisk = student.academicRisk === 'Alto' || student.behaviorRisk === 'Alto';

                  return (
                    <div 
                      key={student.id} 
                      className="bg-slate-50/55 border border-slate-100 hover:border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 font-black text-indigo-700 text-xs">
                          {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-800">{student.name}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">GPA: {student.gpa.toFixed(1)}</span>
                            <span className="text-[8px] font-bold text-slate-400">•</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Asistencia: {student.attendanceRate}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <div className="flex gap-1">
                          {student.academicRisk !== 'Bajo' && (
                            <span className={cn(
                              "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                              student.academicRisk === 'Alto' ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                            )}>
                              Acad. {student.academicRisk}
                            </span>
                          )}
                          {student.behaviorRisk !== 'Bajo' && (
                            <span className={cn(
                              "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                              student.behaviorRisk === 'Alto' ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                            )}>
                              Conv. {student.behaviorRisk}
                            </span>
                          )}
                          {!isHighRisk && (
                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                              Estable
                            </span>
                          )}
                        </div>

                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedCourseName(null);
                            setSelectedStudent(student);
                            setIsDrawerOpen(true);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold h-7 px-3 rounded-lg text-white shadow-sm"
                        >
                          Intervenir
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400 font-semibold border border-dashed border-slate-100 rounded-xl">
                  No hay estudiantes bajo seguimiento especial en este bloque.
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  setToast({
                    title: 'Actas Descargadas',
                    message: `Se han compilado y descargado todas las actas académicas del curso ${selectedCourse.name}.`
                  });
                  setTimeout(() => setToast(null), 3000);
                }}
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] font-bold h-9 rounded-xl"
              >
                Descargar Actas
              </Button>
              <Button
                onClick={() => setSelectedCourseName(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold h-9 px-4 rounded-xl shadow"
              >
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Alert History Radix Dialog Modal */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b border-slate-100 pb-4 shrink-0 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" /> Historial Completo de Alertas
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-500 mt-1">
                Bitácora global de incidencias académicas, conductuales y docentes.
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* History filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 shrink-0 border-b border-slate-100 mt-4">
            {(['Todos', 'Academica', 'Convivencia', 'Asistencia', 'Docente'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setHistoryFilter(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap",
                  historyFilter === cat 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                )}
              >
                {cat === 'Todos' ? 'Todas' : cat}
              </button>
            ))}
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-3.5 my-5">
            {LIVE_ALERTS
              .filter((a: LiveAlert) => historyFilter === 'Todos' || a.category === historyFilter)
              .map((alert: LiveAlert) => (
                <div 
                  key={alert.id}
                  className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                        alert.category === 'Academica' ? "bg-rose-50 text-rose-600" :
                        alert.category === 'Convivencia' ? "bg-amber-50 text-amber-600" :
                        alert.category === 'Asistencia' ? "bg-indigo-50 text-indigo-600" :
                        "bg-slate-105 text-slate-650"
                      )}>
                        {alert.category}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                        alert.urgency === 'Alta' ? "bg-rose-100 text-rose-700 animate-pulse" : "bg-amber-100 text-amber-700 bg-amber-50"
                      )}>
                        {alert.urgency}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{alert.timeAgo}</span>
                    </div>

                    <h5 className="text-xs font-black text-slate-800">{alert.title}</h5>
                    <p className="text-xs font-semibold text-slate-500 leading-normal">{alert.description}</p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      setIsHistoryOpen(false);
                      handleSelectAlert(alert);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold h-8 px-4.5 rounded-xl shrink-0 text-white shadow-sm"
                  >
                    Intervenir
                  </Button>
                </div>
              ))}
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-end shrink-0">
            <Button
              onClick={() => setIsHistoryOpen(false)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold h-9 px-4 rounded-xl shadow"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
