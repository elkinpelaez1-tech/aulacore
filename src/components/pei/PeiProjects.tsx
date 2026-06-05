'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderGit2, Save, Plus, FileText, CheckCircle2, AlertCircle, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectData {
  id: string;
  project_type: string; // 'PRAE', 'Democracia', 'Educación Sexual', 'Derechos Humanos', 'Competencias Ciudadanas', 'Proyecto Personalizado', 'Orientador Escolar'
  objective: string;
  responsible: string;
  schedule: string;
  evidences: string[];
  status: string;
  indicators: string;
}

interface PeiProjectsProps {
  userRole: string;
  projects: ProjectData[];
  onSave: (projects: ProjectData[]) => void;
}

export function PeiProjects({ userRole, projects, onSave }: PeiProjectsProps) {
  const [localProjects, setLocalProjects] = useState<ProjectData[]>(projects);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [savingId, setSavingId] = useState<string | null>(null);

  // Evidence upload simulation state
  const [newEvidenceName, setNewEvidenceName] = useState('');

  const canEdit = userRole === 'rector' || userRole === 'secretaria' || userRole === 'coordinador';
  const canDelete = userRole === 'rector';

  const activeProject = localProjects.find(p => p.id === selectedProjectId) || localProjects[0];

  const handleFieldChange = (projectId: string, field: keyof ProjectData, value: any) => {
    if (!canEdit) return;
    setLocalProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, [field]: value } : p
    ));
  };

  const handleSaveProject = (projectId: string) => {
    if (!canEdit) return;
    setSavingId(projectId);
    setTimeout(() => {
      onSave(localProjects);
      setSavingId(null);
      alert('✓ Proyecto institucional guardado y sincronizado con éxito.');
    }, 700);
  };

  const handleAddEvidence = (projectId: string) => {
    if (!canEdit || !newEvidenceName.trim()) return;
    
    const project = localProjects.find(p => p.id === projectId);
    if (!project) return;

    const updatedEvidences = [...(project.evidences || []), `/evidencias/${newEvidenceName}`];
    handleFieldChange(projectId, 'evidences', updatedEvidences);
    setNewEvidenceName('');
    
    // Automatically save
    setTimeout(() => {
      onSave(localProjects.map(p => 
        p.id === projectId ? { ...p, evidences: updatedEvidences } : p
      ));
    }, 100);
  };

  const handleRemoveEvidence = (projectId: string, index: number) => {
    if (!canEdit) return;
    const project = localProjects.find(p => p.id === projectId);
    if (!project) return;

    const updatedEvidences = project.evidences.filter((_, i) => i !== index);
    handleFieldChange(projectId, 'evidences', updatedEvidences);

    // Automatically save
    setTimeout(() => {
      onSave(localProjects.map(p => 
        p.id === projectId ? { ...p, evidences: updatedEvidences } : p
      ));
    }, 100);
  };

  const projectTypesList = [
    { value: 'PRAE', label: 'PRAE (Ambiente)' },
    { value: 'Democracia', label: 'Democracia y Civismo' },
    { value: 'Educación Sexual', label: 'Educación Sexual (PESCC)' },
    { value: 'Derechos Humanos', label: 'Derechos Humanos' },
    { value: 'Competencias Ciudadanas', label: 'Competencias Ciudadanas' },
    { value: 'Orientador Escolar', label: 'Orientación Psicosocial' },
    { value: 'Proyecto Personalizado', label: 'Proyecto Personalizado' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Sidebar List */}
      <div className="lg:col-span-1 space-y-3">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">
          Proyectos Transversales
        </label>
        <div className="space-y-1.5">
          {localProjects.map((p) => {
            const isSelected = p.id === selectedProjectId;
            const projectMeta = projectTypesList.find(pt => pt.value === p.project_type);
            
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProjectId(p.id)}
                className={cn(
                  "w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col gap-1.5 select-none outline-none cursor-pointer",
                  isSelected
                    ? "bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/20 text-slate-700"
                )}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-black truncate">{projectMeta?.label || p.project_type}</span>
                  <span className={cn(
                    "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0",
                    p.status === 'Activo' && "bg-emerald-50 text-emerald-800 border-emerald-250",
                    p.status === 'Completado' && "bg-blue-50 text-blue-800 border-blue-250",
                    p.status === 'Planeado' && "bg-slate-100 text-slate-655 border-slate-200",
                    p.status === 'Suspendido' && "bg-red-50 text-red-800 border-red-250"
                  )}>
                    {p.status}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate w-full font-bold">
                  Responsable: {p.responsible || 'Sin asignar'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Detail Card */}
      <div className="lg:col-span-3">
        {activeProject ? (
          <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden min-h-[480px] flex flex-col justify-between">
            <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black text-slate-950 flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-600 animate-pulse" />
                  Proyecto: {projectTypesList.find(pt => pt.value === activeProject.project_type)?.label || activeProject.project_type}
                </CardTitle>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Control de objetivos, cronograma, evidencias e indicadores del proyecto.</p>
              </div>
              {canEdit && (
                <Button
                  onClick={() => handleSaveProject(activeProject.id)}
                  disabled={savingId === activeProject.id}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer border-none"
                >
                  <Save className="w-4 h-4" />
                  {savingId === activeProject.id ? 'Guardando...' : 'Guardar Proyecto'}
                </Button>
              )}
            </CardHeader>
            
            <CardContent className="p-6 space-y-6 flex-1">
              {!canEdit && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-600 font-semibold mb-2">
                  ⚠️ Tienes acceso de solo lectura. Solo Rectores, Coordinadores y Secretarias pueden actualizar proyectos institucionales.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold text-slate-700">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Objetivo del Proyecto</label>
                  <textarea
                    value={activeProject.objective || ''}
                    onChange={(e) => handleFieldChange(activeProject.id, 'objective', e.target.value)}
                    disabled={!canEdit}
                    rows={3}
                    placeholder="Describa el objetivo general del proyecto..."
                    className="w-full text-xs font-semibold placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 disabled:bg-slate-100/60 disabled:text-slate-500 disabled:border-slate-150 transition-all font-medium leading-relaxed resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Docente Responsable / Líder</label>
                  <input
                    type="text"
                    value={activeProject.responsible || ''}
                    onChange={(e) => handleFieldChange(activeProject.id, 'responsible', e.target.value)}
                    disabled={!canEdit}
                    placeholder="Ej: Lic. Diana Reyes"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 disabled:bg-slate-100/60 disabled:text-slate-500 disabled:border-slate-150 transition-all font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Estado Operativo</label>
                    <select
                      value={activeProject.status}
                      onChange={(e) => handleFieldChange(activeProject.id, 'status', e.target.value)}
                      disabled={!canEdit}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-750 outline-none hover:bg-slate-100 disabled:bg-slate-100/60 disabled:text-slate-500 disabled:border-slate-150 cursor-pointer"
                    >
                      <option value="Planeado">Planeado</option>
                      <option value="Activo">Activo</option>
                      <option value="Completado">Completado</option>
                      <option value="Suspendido">Suspendido</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Cronograma Sintético</label>
                    <input
                      type="text"
                      value={activeProject.schedule || ''}
                      onChange={(e) => handleFieldChange(activeProject.id, 'schedule', e.target.value)}
                      disabled={!canEdit}
                      placeholder="Ej: Febrero a Noviembre..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 disabled:bg-slate-100/60 disabled:text-slate-500 disabled:border-slate-150 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Indicadores de Cumplimiento</label>
                  <input
                    type="text"
                    value={activeProject.indicators || ''}
                    onChange={(e) => handleFieldChange(activeProject.id, 'indicators', e.target.value)}
                    disabled={!canEdit}
                    placeholder="Ej: 90% de participación; 450 kg recolectados..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 disabled:bg-slate-100/60 disabled:text-slate-500 disabled:border-slate-150 transition-all font-semibold"
                  />
                </div>

                {/* Evidences Section */}
                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                    Evidencias Registradas
                  </label>
                  
                  {/* Evidence Input */}
                  {canEdit && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nombre de archivo de evidencia (Ej: acta-posesion.pdf)..."
                        value={newEvidenceName}
                        onChange={(e) => setNewEvidenceName(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold text-xs h-9"
                      />
                      <Button
                        onClick={() => handleAddEvidence(activeProject.id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1 border-none cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Agregar
                      </Button>
                    </div>
                  )}

                  {/* Evidence List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {(activeProject.evidences || []).length === 0 ? (
                      <div className="sm:col-span-2 text-center py-4 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl font-semibold">
                        No se registran archivos de evidencias para este proyecto.
                      </div>
                    ) : (
                      activeProject.evidences.map((ev, idx) => {
                        const filename = ev.split('/').pop() || ev;
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-350 transition-colors"
                          >
                            <span className="flex items-center gap-2 font-bold text-xs text-slate-700 truncate max-w-[80%]">
                              <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                              <span className="truncate" title={filename}>{filename}</span>
                            </span>
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => handleRemoveEvidence(activeProject.id, idx)}
                                className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer outline-none p-1 rounded hover:bg-red-50"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-20 text-slate-400 bg-white border border-slate-200 rounded-3xl font-semibold">
            Selecciona un proyecto de la lista.
          </div>
        )}
      </div>

    </div>
  );
}
