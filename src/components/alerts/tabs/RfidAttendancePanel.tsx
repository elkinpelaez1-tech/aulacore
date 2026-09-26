'use client';

import React, { useState } from 'react';
import { Activity, Search, RefreshCw, CheckCircle2, User, ChevronRight, MessageSquare, MapPin, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface RfidAttendancePanelProps {
  onIntervene?: (studentName: string) => void;
  presentesCount?: number;
  inasistentesCount?: number;
  tardiasCount?: number;
  dispositivosCount?: number;
}

interface RfidLog {
  id: string;
  studentName: string;
  group: string;
  time: string;
  direction: 'Entrada' | 'Salida';
  status: 'A Tiempo' | 'Tarde' | 'Salida Temprana';
  device: string;
}

export function RfidAttendancePanel({
  onIntervene,
  presentesCount = 0,
  inasistentesCount = 0,
  tardiasCount = 0,
  dispositivosCount = 0,
}: RfidAttendancePanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSwiping, setIsSwiping] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  // Live RFID reader logs
  const [logs, setLogs] = useState<RfidLog[]>([]);

  const [swipeName, setSwipeName] = useState('');
  const [swipeDirection, setSwipeDirection] = useState<'Entrada' | 'Salida'>('Salida');

  const filteredLogs = logs.filter(l => 
    l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const criticalAbsences: any[] = [];

  const handleSwipeSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swipeName) return;

    setIsSwiping(true);
    setIsSwiping(false);
    const studentName = swipeName;
    const group = '';

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newLog: RfidLog = {
      id: `l-${Date.now()}`,
      studentName,
      group,
      time: timeStr,
      direction: swipeDirection,
      status: 'A Tiempo',
      device: 'Lector Biométrico'
    };

    setLogs([newLog, ...logs]);
    setSwipeName('');

    setToast({
      title: 'Lectura RFID Registrada',
      message: `Lectura registrada para ${newLog.studentName}.`
    });
  };

  const handleSendNotification = (studentName: string) => {
    // Disabled in clean mode
  };

  return (
    <div className="space-y-6">
      
      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Presentes Hoy</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-slate-800">{presentesCount}</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">0.0%</span>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold mt-1">Ingresos registrados en RFID</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inasistentes Hoy</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-rose-500">{inasistentesCount}</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">0.0%</span>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold mt-1">Ausencias sin justificar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Llegadas Tardías</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-amber-500">{tardiasCount}</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">0.0%</span>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold mt-1">Después del timbre</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado Dispositivos</p>
            <p className="text-base font-black text-slate-600 mt-2">{dispositivosCount} Online</p>
            <p className="text-[9px] text-slate-400 font-semibold mt-1">Sin terminales RFID vinculadas</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* RFID Live Logs */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" /> Historial de Lector RFID en Vivo
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Eventos en tiempo real procesados por las puertas de acceso</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Buscar por nombre o curso..." 
                className="pl-9 text-xs font-semibold border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-hide">
            {filteredLogs.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-white">
                <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No hay lecturas de asistencia registradas para la fecha.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Los registros de torniquetes y lectores biométricos aparecerán aquí.</p>
              </div>
            ) : (
              filteredLogs.map(log => (
                <div
                  key={log.id}
                  className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-slate-200 transition-colors"
                >
                  <div
                    onClick={() => onIntervene?.(log.studentName)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0",
                      log.direction === 'Entrada' ? "bg-emerald-500" : "bg-blue-600"
                    )}>
                      {log.direction.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                        {log.studentName}
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-indigo-600" />
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                        <span>{log.group}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {log.time}</span>
                        <span>•</span>
                        <span>{log.device}</span>
                      </span>
                    </div>
                  </div>

                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0",
                    log.status === 'A Tiempo' ? "bg-emerald-50 text-emerald-700" :
                    log.status === 'Tarde' ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                  )}>
                    {log.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Swipe Simulator Form (Right Side top) & Critical Absences */}
        <div className="space-y-6 flex flex-col justify-between">
          
          {/* Simulation */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white">
            <form onSubmit={handleSwipeSimulation} className="space-y-4">
              <div className="flex items-center gap-2 mb-2 text-indigo-400">
                <RefreshCw className={cn("w-5 h-5", isSwiping && "animate-spin")} />
                <h3 className="text-xs font-black text-indigo-200 uppercase tracking-widest">Simular Pase de Tarjeta</h3>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estudiante (Escriba nombre)</label>
                <Input 
                  value={swipeName}
                  onChange={e => setSwipeName(e.target.value)}
                  placeholder="Nombre del estudiante..."
                  className="bg-slate-950 border-slate-800 text-xs font-semibold text-white placeholder:text-slate-600 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flujo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSwipeDirection('Entrada')}
                    className={cn(
                      "py-2 rounded-xl text-xs font-black border transition-all",
                      swipeDirection === 'Entrada' ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "border-slate-800 text-slate-400 hover:bg-slate-850"
                    )}
                  >
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setSwipeDirection('Salida')}
                    className={cn(
                      "py-2 rounded-xl text-xs font-black border transition-all",
                      swipeDirection === 'Salida' ? "bg-blue-600/10 border-blue-500 text-blue-400" : "border-slate-800 text-slate-400 hover:bg-slate-850"
                    )}
                  >
                    Salida
                  </button>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isSwiping}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {isSwiping ? 'Registrando pase...' : 'Registrar Entrada / Salida'}
              </Button>
            </form>
          </div>

          {/* Absenteeism Alerts */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-between mt-6 xl:mt-0">
            <div>
              <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5" /> Ausencias Prolongadas
              </h3>
              
              <div className="space-y-3 overflow-y-auto max-h-[180px] pr-1 scrollbar-hide">
                {criticalAbsences.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-100 rounded-xl">
                    <p className="text-xs font-bold text-slate-500">No hay alertas de ausencias prolongadas registradas.</p>
                  </div>
                ) : (
                  criticalAbsences.map(student => (
                  <div key={student.id} className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
                    <div 
                      onClick={() => onIntervene?.(student.name)}
                      className="min-w-0 cursor-pointer group"
                    >
                      <h4 className="text-xs font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{student.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{student.group} • Asistencia: {student.attendanceRate}%</p>
                    </div>
                    <button
                      onClick={() => handleSendNotification(student.name)}
                      className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 p-2 rounded-lg shrink-0 transition-colors"
                      title="Mandar WhatsApp Alerta Acudiente"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )))}
              </div>
            </div>
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

    </div>
  );
}
