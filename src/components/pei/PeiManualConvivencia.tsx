'use client';

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { FileText, Upload, Eye, Trash2, Calendar, FileBadge, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManualVersion {
  id: string;
  version: string;
  pdf_url: string;
  update_notes: string;
  is_active: boolean;
  created_at: string;
}

interface PeiManualConvivenciaProps {
  userRole: string;
  versions: ManualVersion[];
  onSave: (versions: ManualVersion[]) => void;
}

export function PeiManualConvivencia({ userRole, versions, onSave }: PeiManualConvivenciaProps) {
  const [localVersions, setLocalVersions] = useState<ManualVersion[]>(versions);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Form input states
  const [versionInput, setVersionInput] = useState('2.1.0');
  const [notesInput, setNotesInput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canEdit = userRole === 'rector' || userRole === 'secretaria';
  const canDelete = userRole === 'rector';

  const activeVersion = localVersions.find(v => v.is_active) || localVersions[0];

  const handleUploadClick = () => {
    if (!canEdit) return;
    fileInputRef.current?.click();
  };

  const processFileSimulate = (fileName: string) => {
    if (!canEdit) return;
    if (!versionInput.trim()) {
      alert('Por favor especifique la versión del documento.');
      return;
    }

    setUploading(true);
    setTimeout(() => {
      // Deactivate all previous versions
      const deactivated = localVersions.map(v => ({ ...v, is_active: false }));
      
      const newVersion: ManualVersion = {
        id: 'man-' + Date.now(),
        version: versionInput,
        pdf_url: `/files/${fileName}`,
        update_notes: notesInput.trim() || `Carga manual de documento oficial: ${fileName}.`,
        is_active: true,
        created_at: new Date().toISOString().split('T')[0]
      };

      const updated = [newVersion, ...deactivated];
      setLocalVersions(updated);
      onSave(updated);
      setUploading(false);
      setNotesInput('');
      
      // Calculate next patch version dynamically
      try {
        const parts = versionInput.split('.');
        const nextPatch = parseInt(parts[2] || '0', 10) + 1;
        setVersionInput(`${parts[0]}.${parts[1]}.${nextPatch}`);
      } catch (e) {}

      alert(`✓ Documento "${fileName}" subido con éxito y activado como Versión ${newVersion.version}.`);
    }, 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFileSimulate(files[0].name);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileSimulate(e.dataTransfer.files[0].name);
    }
  };

  const handleActivate = (id: string) => {
    if (!canEdit) return;
    const updated = localVersions.map(v => ({
      ...v,
      is_active: v.id === id
    }));
    setLocalVersions(updated);
    onSave(updated);
    alert('✓ Versión del Manual de Convivencia conmutada exitosamente.');
  };

  const handleDelete = (id: string, version: string) => {
    if (!canDelete) return;
    if (confirm(`¿Está seguro de eliminar de forma permanente la Versión ${version}?`)) {
      const updated = localVersions.filter(v => v.id !== id);
      
      // If we deleted the active one, activate the first one in the list
      if (updated.length > 0 && !updated.some(v => v.is_active)) {
        updated[0].is_active = true;
      }
      
      setLocalVersions(updated);
      onSave(updated);
    }
  };

  const handleViewPdf = (version: ManualVersion) => {
    alert(`Visualización de Documento PDF:\n\n• Nombre: Manual de Convivencia Escolar\n• Versión: ${version.version}\n• Notas de Cambio: "${version.update_notes}"\n• Ubicación: ${version.pdf_url}\n\n[El PDF se despliega en una pestaña de visualización segura AulaCore]`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Active Manual Card */}
      <div className="xl:col-span-1 space-y-6">
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden flex flex-col justify-between min-h-[480px]">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
              <FileBadge className="w-5 h-5 text-indigo-600 animate-pulse" />
              PEI Oficial
            </CardTitle>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Estado del documento regulatorio institucional.</p>
          </CardHeader>
          
          <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-center">
            {activeVersion ? (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-50 border border-indigo-150 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 shadow-inner">
                  <FileText className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900 leading-tight">Manual de Convivencia Escolar</h4>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-250 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mt-1">
                    <Check className="w-3.5 h-3.5" /> Versión {activeVersion.version}
                  </span>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs font-semibold text-slate-600 leading-relaxed max-w-sm mx-auto">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Notas de Actualización:</span>
                  <p className="line-clamp-4 italic">"{activeVersion.update_notes}"</p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    onClick={() => handleViewPdf(activeVersion)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer border-none"
                  >
                    <Eye className="w-4 h-4" />
                    Ver documento
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 font-semibold">
                <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p>No se registran documentos cargados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload & History Panels */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Upload Form */}
        {canEdit && (
          <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Cargar PDF
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Subir una nueva revisión oficial del manual y publicarla de forma automática.</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Versión</label>
                  <input
                    type="text"
                    value={versionInput}
                    onChange={(e) => setVersionInput(e.target.value)}
                    placeholder="Ej: 2.1.0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold text-xs"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Notas del Cambio / Justificación</label>
                  <input
                    type="text"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Ej: Ajustes de protocolo de bullying escolar y acoso en redes..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold text-xs"
                  />
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={handleUploadClick}
                className={cn(
                  "border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-slate-50/50 flex flex-col items-center justify-center space-y-2 select-none min-h-[140px]",
                  dragActive && "bg-indigo-50 border-indigo-400",
                  uploading && "pointer-events-none opacity-50"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                <Upload className={cn("w-8 h-8 text-slate-400", dragActive && "text-indigo-600 animate-bounce")} />
                {uploading ? (
                  <p className="text-xs text-indigo-600 font-extrabold animate-pulse">Guardando documento y firmando hash en la bóveda...</p>
                ) : (
                  <>
                    <p className="text-xs font-black text-slate-800">
                      Arrastra tu archivo PDF o <span className="text-indigo-600 hover:text-indigo-800">haz clic para explorar</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Solo archivos PDF oficiales de la institución</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Table */}
        <Card className="border-slate-200 shadow-md bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-955 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Historial de versiones
              </CardTitle>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Control de auditoría de documentos históricos aprobados.</p>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-800 text-xs pl-6">Versión</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Fecha Aprobación</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs">Cambios / Observaciones</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs text-center">Estado</TableHead>
                  <TableHead className="font-extrabold text-slate-800 text-xs pr-6 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localVersions.map((v) => (
                  <TableRow key={v.id} className={cn("hover:bg-slate-50/50 transition-colors", v.is_active && "bg-indigo-50/10")}>
                    <TableCell className="font-black text-slate-950 text-sm pl-6">{v.version}</TableCell>
                    <TableCell className="font-semibold text-slate-700 text-xs">{v.created_at}</TableCell>
                    <TableCell className="text-xs text-slate-500 font-medium max-w-sm truncate leading-snug" title={v.update_notes}>
                      {v.update_notes}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        v.is_active 
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        {v.is_active ? 'Activo' : 'Histórico'}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          onClick={() => handleViewPdf(v)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:bg-slate-100"
                          title="Ver PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {canEdit && !v.is_active && (
                          <Button
                            onClick={() => handleActivate(v.id)}
                            size="sm"
                            variant="ghost"
                            className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-2 py-1 h-8 rounded-lg"
                          >
                            Activar
                          </Button>
                        )}
                        {canDelete && !v.is_active && (
                          <Button
                            onClick={() => handleDelete(v.id, v.version)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
