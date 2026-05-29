'use client';

import React, { useState } from 'react';
import { Activity, Search, RefreshCw, CheckCircle2, User, ChevronRight, MessageSquare, MapPin, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { MOCK_STUDENTS, StudentMockData } from '@/lib/data/mock-students';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface RfidAttendancePanelProps {
  onIntervene?: (studentName: string) => void;
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

export function RfidAttendancePanel({ onIntervene }: RfidAttendancePanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSwiping, setIsSwiping] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  // Live RFID reader logs
  const [logs, setLogs] = useState<RfidLog[]>([
    { id: 'l1', studentName: 'Mateo González Rojas', group: '9-A', time: '15:58:30', direction: 'Salida', status: 'A Tiempo', device: 'Torniquete Sede Principal' },
    { id: 'l2', studentName: 'Alex Marín', group: '11-Tec', time: '15:55:12', direction: 'Salida', status: 'A Tiempo', device: 'Torniquete Sede Principal' },
    { id: 'l3', studentName: 'Samuel Duque Pérez', group: '5-B', time: '12:45:00', direction: 'Entrada', status: 'A Tiempo', device: 'Lector Biométrico Primaria' },
    { id: 'l4', studentName: 'Valentina Silva Martínez', group: '9-A', time: '07:15:22', direction: 'Entrada', status: 'Tarde', device: 'Torniquete Sede Principal' },
  ]);

  const [swipeName, setSwipeName] = useState('');
  const [swipeDirection, setSwipeDirection] = useState<'Entrada' | 'Salida'>('Salida');

  const filteredLogs = logs.filter(l => 
    l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Students with high absenteeism
  const criticalAbsences = MOCK_STUDENTS.filter(s => s.attendanceRate < 90 || s.name === 'Laura Restrepo Gómez');

  const handleSwipeSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swipeName) return;

    setIsSwiping(true);
    setTimeout(() => {
      const student = MOCK_STUDENTS.find(s => s.name.toLowerCase().includes(swipeName.toLowerCase()));
      const studentName = student ? student.name : swipeName;
      const group = student ? student.group : '10-A';

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      const newLog: RfidLog = {
        id: `l-${Date.now()}`,
        studentName,
        group,
        time: timeStr,
        direction: swipeDirection,
        status: 'A Tiempo',
        device: 'Lector Demo Biométrico'
      };

      setLogs([newLog, ...logs]);
      setIsSwiping(false);
      setSwipeName('');

      setToast({
        title: 'Lectura RFID Registrada',
        message: `Tarjeta de ${newLog.studentName} leída correctamente [${newLog.direction} - ${newLog.time}].`
      });
      setTimeout(() => setToast(null), 3000);
    }, 1000);
  };

  const handleSendNotification = (studentName: string) => {
    setToast({
      title: 'Notificación Despachada',
      message: `Alerta de inasistencia enviada por WhatsApp al acudiente de ${studentName}.`
    });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Presentes Hoy</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-slate-800">1,215</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">94.9%</span>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold mt-1">Ingresos registrados en RFID</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inasistentes Hoy</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-rose-500">42</span>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">3.2%</span>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold mt-1">Ausencias sin justificar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Llegadas Tardías</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-amber-500">23</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">1.8%</span>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold mt-1">Después del timbre (07:05)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado Dispositivos</p>
            <p className="text-base font-black text-emerald-600 mt-2">4 Online</p>
            <p className="text-[9px] text-slate-400 font-semibold mt-1">Sede Principal & Norte</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
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
            {filteredLogs.map(log => (
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
            ))}
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
                  placeholder="Ej: Mateo, Sofía, Alex..."
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
                {isSwiping ? 'Simulando chip RFID...' : 'Simular Entrada / Salida'}
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
                {criticalAbsences.map(student => (
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
                ))}
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
