'use client';

import React, { useState } from 'react';
import { Users, Search, AlertOctagon, CheckCircle2, MessageSquare, Mail, RefreshCw, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TeacherAlert {
  id: string;
  name: string;
  course: string;
  delayType: 'Cierre de Notas' | 'Planeación / Syllabus' | 'Reporte de Observador';
  timeAgo: string;
  severity: 'Alta' | 'Media';
  contactPhone: string;
}

export function DocenteAlertsPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const [alerts, setAlerts] = useState<TeacherAlert[]>([
    { id: 't1', name: 'Prof. Carlos Restrepo', course: '9-B (Matemáticas)', delayType: 'Cierre de Notas', timeAgo: 'Atrasado 3 días', severity: 'Alta', contactPhone: '+57 312 456 7890' },
    { id: 't2', name: 'Prof. Sandra Milena', course: '10-A (Tecnología e Informática)', delayType: 'Planeación / Syllabus', timeAgo: 'Atrasado 5 días', severity: 'Alta', contactPhone: '+57 315 789 1234' },
    { id: 't3', name: 'Prof. Diana Carolina', course: 'Primary 5 (Ciencias)', delayType: 'Cierre de Notas', timeAgo: 'Atrasado 1 día', severity: 'Media', contactPhone: '+57 300 456 1234' },
    { id: 't4', name: 'Prof. Jorge Humberto', course: '8-A (Español)', delayType: 'Reporte de Observador', timeAgo: 'Atrasado 2 días', severity: 'Media', contactPhone: '+57 320 123 4567' },
  ]);

  const filteredAlerts = alerts.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.delayType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReminder = (id: string, name: string, type: 'whatsapp' | 'email') => {
    setLoadingId(`${id}-${type}`);
    setTimeout(() => {
      setLoadingId(null);
      setToast({
        title: type === 'whatsapp' ? 'WhatsApp Enviado' : 'Correo Despachado',
        message: type === 'whatsapp'
          ? `Recordatorio automático enviado a la línea de ${name}.`
          : `Notificación institucional enviada a la bandeja de ${name}.`
      });
      setTimeout(() => setToast(null), 3000);
    }, 900);
  };

  const handleSendAll = () => {
    setLoadingId('all');
    setTimeout(() => {
      setLoadingId(null);
      setToast({
        title: 'Notificaciones Masivas Enviadas',
        message: 'Se han despachado recordatorios a todos los docentes con pendientes de entrega.'
      });
      setTimeout(() => setToast(null), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Docentes Evaluados</p>
          <p className="text-3xl font-black text-slate-800 mt-1">42</p>
          <p className="text-[9px] text-emerald-600 font-semibold mt-1">100% activos en AulaCore</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cierre de Notas Demorado</p>
          <p className="text-3xl font-black text-rose-500 mt-1">2</p>
          <p className="text-[9px] text-rose-400 font-semibold mt-1">Periodo 3 pendiente de carga</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Planeaciones Pendientes</p>
          <p className="text-3xl font-black text-amber-500 mt-1">2</p>
          <p className="text-[9px] text-slate-500 font-semibold mt-1">Syllabus no cargados en P4</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Soporte y Guardias</p>
            <p className="text-base font-black text-slate-700 mt-2">1 Reemplazo</p>
            <p className="text-[9px] text-slate-400 font-semibold mt-1">Activo en sección Bachillerato</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Compliance Alerts Table */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> Control de Cumplimiento Docente
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Monitoreo de carga académica, planeaciones semanales y cierres administrativos</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <Input 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  placeholder="Buscar docente o materia..." 
                  className="pl-9 text-xs font-semibold border-slate-200 rounded-xl w-full sm:w-56"
                />
              </div>

              <Button
                onClick={handleSendAll}
                disabled={loadingId !== null}
                className="bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold h-10 px-3 rounded-xl shadow-sm shrink-0 text-white"
              >
                {loadingId === 'all' ? (
                  <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Procesando...</span>
                ) : (
                  'Recordatorio Masivo'
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-hide">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map(alert => {
                const isWaLoading = loadingId === `${alert.id}-whatsapp`;
                const isEmailLoading = loadingId === `${alert.id}-email`;

                return (
                  <div 
                    key={alert.id} 
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-800">{alert.name}</h4>
                        <span className={cn(
                          "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                          alert.severity === 'Alta' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700 bg-amber-50"
                        )}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 mt-1">
                        Pediente: <span className="font-bold text-slate-800">{alert.delayType}</span> en {alert.course}
                      </p>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-350" /> {alert.timeAgo}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendReminder(alert.id, alert.name, 'whatsapp')}
                        disabled={loadingId !== null}
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-[10px] font-bold h-8 rounded-lg"
                      >
                        {isWaLoading ? (
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp</span>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendReminder(alert.id, alert.name, 'email')}
                        disabled={loadingId !== null}
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-[10px] font-bold h-8 rounded-lg"
                      >
                        {isEmailLoading ? (
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-indigo-600" /> Enviar Correo</span>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 text-slate-400 font-semibold border border-dashed border-slate-200 rounded-2xl">
                <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p>No se registran alertas docentes activas en esta sección.</p>
              </div>
            )}
          </div>
        </div>

        {/* Informative / Administrative Tips */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-indigo-400">
              <AlertOctagon className="w-5 h-5" />
              <h3 className="text-xs font-black text-indigo-200 uppercase tracking-widest">Torre de Control Docente</h3>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              El índice general de cumplimiento de entregas de syllabus se encuentra en <span className="text-emerald-400">92%</span> en este periodo.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="w-1.5 h-auto bg-rose-500 rounded-full shrink-0"></div>
                <div>
                  <h5 className="text-xs font-black text-slate-200">Reunión de Cierre</h5>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                    Citación sugerida de comité para docentes con mora mayor a 4 días en subida de notas.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="w-1.5 h-auto bg-indigo-500 rounded-full shrink-0"></div>
                <div>
                  <h5 className="text-xs font-black text-slate-200">Soporte Operativo</h5>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                    Asignación automática de tutor sustituto activa para cubrimiento en matemáticas de 9-B.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 py-2.5 bg-indigo-700 hover:bg-indigo-650 text-xs font-bold text-indigo-200 rounded-xl transition-all border border-indigo-600/30 flex items-center justify-center gap-1.5">
            Manual de Convivencia Docente <ExternalLink className="w-3.5 h-3.5" />
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
