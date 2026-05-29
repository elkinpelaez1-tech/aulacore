'use client';

import React, { useState } from 'react';
import { ShieldAlert, Search, PlusCircle, CheckCircle2, User, ChevronRight, FileText, AlertOctagon, HelpCircle } from 'lucide-react';
import { MOCK_STUDENTS, StudentMockData } from '@/lib/data/mock-students';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface BehaviorAlertsPanelProps {
  onIntervene?: (studentName: string) => void;
}

interface IncidentReport {
  id: string;
  studentName: string;
  group: string;
  type: 'Tipo I' | 'Tipo II' | 'Tipo III';
  description: string;
  status: 'Abierto' | 'En Proceso' | 'Firmado' | 'Resuelto';
  date: string;
}

export function BehaviorAlertsPanel({ onIntervene }: BehaviorAlertsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  
  // Custom mock behavioral incidents
  const [incidents, setIncidents] = useState<IncidentReport[]>([
    { id: 'i1', studentName: 'Samuel Duque Pérez', group: '5-B', type: 'Tipo II', description: 'Reporte de agresión física menor en el patio de recreo.', status: 'Abierto', date: 'Hoy, 10:15' },
    { id: 'i2', studentName: 'Andrés Gómez', group: '8-A', type: 'Tipo II', description: 'Reincidencia convivencial: Acumula su tercera alerta grave del mes.', status: 'En Proceso', date: 'Ayer' },
    { id: 'i3', studentName: 'Laura Cortés', group: '4-B', type: 'Tipo I', description: 'Patrón de comportamiento desafiante con docente de artística.', status: 'Resuelto', date: 'Hace 2 días' },
    { id: 'i4', studentName: 'Valentina Silva Martínez', group: '9-A', type: 'Tipo I', description: 'Uso no autorizado de celular en clases de español.', status: 'Firmado', date: 'Hace 4 días' },
  ]);

  const [newStudent, setNewStudent] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newType, setNewType] = useState<'Tipo I' | 'Tipo II' | 'Tipo III'>('Tipo I');
  const [newDesc, setNewDesc] = useState('');

  const filteredIncidents = incidents.filter(i => 
    i.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRegisterIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent || !newDesc || !newGroup) return;

    setIsRegistering(true);
    setTimeout(() => {
      const report: IncidentReport = {
        id: `i-${Date.now()}`,
        studentName: newStudent,
        group: newGroup,
        type: newType,
        description: newDesc,
        status: 'Abierto',
        date: 'Hoy, Hace unos instantes'
      };

      setIncidents([report, ...incidents]);
      setIsRegistering(false);
      
      // Reset form
      setNewStudent('');
      setNewGroup('');
      setNewDesc('');

      setToast({
        title: 'Incidente Registrado',
        message: `El reporte conductual para ${report.studentName} ha sido ingresado en la bitácora.`
      });
      setTimeout(() => setToast(null), 3000);
    }, 1200);
  };

  const handleAction = (id: string, actionType: 'firmar' | 'resolver', name: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          status: actionType === 'firmar' ? 'Firmado' : 'Resuelto'
        };
      }
      return inc;
    }));

    setToast({
      title: actionType === 'firmar' ? 'Acta Firmada' : 'Caso Resuelto',
      message: actionType === 'firmar' 
        ? `El acta de convivencia de ${name} ha sido enviada para la firma digital de los padres.`
        : `El caso de ${name} se ha catalogado como resuelto en el comité.`
    });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Incidentes Tipo I</p>
            <p className="text-2xl font-black text-slate-800">14</p>
            <p className="text-[10px] text-slate-500 font-semibold">Leves, manejados por docente</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Incidentes Tipo II</p>
            <p className="text-2xl font-black text-amber-600">3</p>
            <p className="text-[10px] text-amber-500 font-semibold">Moderados, requieren coordinación</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Incidentes Tipo III</p>
            <p className="text-2xl font-black text-rose-600">0</p>
            <p className="text-[10px] text-emerald-600 font-semibold">Graves, activan ruta nacional</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Incident List */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-600" /> Bitácora Convivencial
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Historial y seguimiento de compromisos del manual de convivencia</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Buscar por alumno o descripción..." 
                className="pl-9 text-xs font-semibold border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1 scrollbar-hide">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map(inc => (
                <div key={inc.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <div 
                      onClick={() => onIntervene?.(inc.studentName)}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                        {inc.studentName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                          {inc.studentName}
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-indigo-600" />
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{inc.group} • {inc.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                        inc.type === 'Tipo I' ? "bg-blue-155 text-blue-700 bg-blue-50" :
                        inc.type === 'Tipo II' ? "bg-amber-100 text-amber-700 bg-amber-50" : "bg-rose-100 text-rose-700 bg-rose-50"
                      )}>
                        {inc.type}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                        inc.status === 'Abierto' ? "bg-rose-100 text-rose-700" :
                        inc.status === 'En Proceso' ? "bg-amber-100 text-amber-750 bg-amber-50" :
                        inc.status === 'Firmado' ? "bg-blue-100 text-blue-700 bg-blue-50" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {inc.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-600 leading-relaxed pl-10">
                    {inc.description}
                  </p>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 pl-10 mt-1">
                    {inc.status === 'Abierto' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(inc.id, 'firmar', inc.studentName)}
                        className="text-[9px] font-bold h-7 px-2.5 rounded-lg border-slate-200 text-slate-700 bg-white"
                      >
                        Enviar a Firma
                      </Button>
                    )}
                    {(inc.status === 'Abierto' || inc.status === 'En Proceso' || inc.status === 'Firmado') && (
                      <Button
                        size="sm"
                        onClick={() => handleAction(inc.id, 'resolver', inc.studentName)}
                        className="text-[9px] font-bold h-7 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                      >
                        Marcar Resuelto
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-400 font-semibold border border-dashed border-slate-200 rounded-2xl">
                <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p>No se registran incidentes que coincidan con la búsqueda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Register incident form (Right Side) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex flex-col justify-between">
          <form onSubmit={handleRegisterIncident} className="space-y-4">
            <div className="flex items-center gap-2 mb-2 text-indigo-400">
              <PlusCircle className="w-5 h-5" />
              <h3 className="text-xs font-black text-indigo-200 uppercase tracking-widest">Reportar Incidente</h3>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estudiante</label>
              <Input 
                value={newStudent}
                onChange={e => setNewStudent(e.target.value)}
                placeholder="Nombre del alumno..."
                className="bg-slate-950 border-slate-800 text-xs font-semibold text-white placeholder:text-slate-600 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Curso</label>
                <Input 
                  value={newGroup}
                  onChange={e => setNewGroup(e.target.value)}
                  placeholder="Ej: 9-B"
                  className="bg-slate-950 border-slate-800 text-xs font-semibold text-white placeholder:text-slate-600 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gravedad</label>
                <select 
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-white rounded-xl h-10 px-3 outline-none"
                >
                  <option value="Tipo I">Tipo I (Leve)</option>
                  <option value="Tipo II">Tipo II (Medio)</option>
                  <option value="Tipo III">Tipo III (Grave)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descripción del Suceso</label>
              <textarea 
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Detalle breve de los hechos..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 text-xs font-semibold text-white placeholder:text-slate-650 rounded-xl p-3 outline-none focus:border-indigo-500 min-h-[80px]"
                required
              />
            </div>

            <Button 
              type="submit"
              disabled={isRegistering}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {isRegistering ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando reporte...
                </>
              ) : (
                'Registrar en Manual'
              )}
            </Button>
          </form>
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
