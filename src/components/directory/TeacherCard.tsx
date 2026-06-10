'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Phone, BookOpen, Clock, MessageSquare, AlertCircle, Users, Send, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { TeacherMockData, TeacherStatus } from '@/lib/data/mock-teachers';
import { TeacherScheduleModal } from './TeacherScheduleModal';
import { cn } from '@/lib/utils';

interface Props {
  teacher: TeacherMockData;
}

const statusColors: Record<TeacherStatus, { bg: string, text: string, border: string }> = {
  'Activo': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'En clase': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Reunión': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Disponible': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Licencia': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
  'Sobrecarga académica': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
};

export function TeacherCard({ teacher }: Props) {
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailCategory, setEmailCategory] = useState<'general' | 'academico' | 'convivencial' | 'urgente'>('general');
  const [isSending, setIsSending] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);
  const [mockVerificationHash, setMockVerificationHash] = useState('');

  const openWhatsApp = () => {
    const num = teacher.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${num}`, '_blank');
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailMessage.trim()) return;

    setIsSending(true);
    
    // Simulate API request delay
    setTimeout(() => {
      setIsSending(false);
      setIsSentSuccess(true);
      // Generate a mock secure transaction ID
      const hash = 'AC-EML-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString().slice(-6);
      setMockVerificationHash(hash);
      
      // Sync with localStorage message log
      const localKey = 'aulacore-messages-log';
      const existingLogs = JSON.parse(localStorage.getItem(localKey) || '[]');
      const newLog = {
        id: hash,
        recipientName: teacher.name,
        recipientEmail: teacher.email,
        subject: emailSubject,
        message: emailMessage,
        category: emailCategory,
        sentAt: new Date().toISOString(),
        senderRole: 'Coordinador',
        senderName: 'Dr. Ramírez'
      };
      localStorage.setItem(localKey, JSON.stringify([newLog, ...existingLogs]));
    }, 1500);
  };

  const statusStyle = statusColors[teacher.status];

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow group flex flex-col h-full relative">
      {/* Decorative top border based on status */}
      <div className={cn("absolute top-0 left-0 w-full h-1", statusStyle.bg.replace('50', '500').replace('100', '400'))} />
      
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-5 flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 shrink-0 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-500 font-bold text-xl relative">
            {teacher.avatarUrl ? (
              <img 
                src={teacher.avatarUrl} 
                alt={teacher.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              teacher.name.charAt(0)
            )}
            {/* Status dot */}
            <div className={cn("absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full", statusStyle.bg.replace('50', '500').replace('100', '400'))} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-slate-900 truncate" title={teacher.name}>{teacher.name}</h3>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">CC. {teacher.document}</p>
            
            <div className="mt-1">
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", statusStyle.bg, statusStyle.text, statusStyle.border)}>
                {teacher.status}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="px-5 pb-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{teacher.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{teacher.phone}</span>
          </div>
        </div>

        {/* Academic Details */}
        <div className="px-5 py-3 bg-slate-50 border-y border-slate-100 flex-1">
          <div className="mb-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Especialidad</p>
            <p className="text-sm font-black text-slate-800">{teacher.specialty}</p>
            <p className="text-xs font-semibold text-slate-500">{teacher.area}</p>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cursos</p>
                <p className="text-sm font-black text-slate-800">{teacher.assignedCourses.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-right">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Intensidad</p>
                <p className="text-sm font-black text-indigo-700">{teacher.weeklyHours}h <span className="text-[10px] text-slate-500 font-semibold">/sem</span></p>
              </div>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Alerts Section (if any) */}
        {teacher.alerts.length > 0 && (
          <div className="px-5 py-2.5 bg-rose-50/50 border-b border-rose-100">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                {teacher.alerts.map(alert => (
                  <p key={alert.id} className="text-xs font-semibold text-rose-700 leading-tight">
                    {alert.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex flex-col gap-2 bg-white">
          <div className="flex gap-2">
            <Button 
              onClick={openWhatsApp}
              variant="outline" 
              className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 font-bold text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              WhatsApp
            </Button>
            
            <Dialog open={isEmailOpen} onOpenChange={(open) => {
              setIsEmailOpen(open);
              if (!open) {
                setIsSentSuccess(false);
                setEmailSubject('');
                setEmailMessage('');
                setEmailCategory('general');
                setIsSending(false);
              }
            }}>
              <DialogTrigger
                render={
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 font-bold text-xs cursor-pointer"
                  />
                }
              >
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Mensaje
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl p-6 overflow-hidden">
                {!isSentSuccess ? (
                  <form onSubmit={handleSendEmail} className="space-y-4">
                    <DialogHeader className="pb-2 border-b border-slate-100">
                      <DialogTitle className="flex items-center gap-2 text-slate-800 text-lg font-black">
                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 animate-pulse">
                          <Mail className="w-5 h-5" />
                        </div>
                        Redactar Correo Oficial
                      </DialogTitle>
                      <p className="text-xs text-slate-500 mt-1">
                        Envío de comunicación formal a docentes a través de AulaCore Mail.
                      </p>
                    </DialogHeader>

                    {/* Destinatario */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Destinatario</label>
                      <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          {teacher.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">{teacher.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{teacher.email}</p>
                        </div>
                        <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase truncate max-w-[120px]" title={teacher.specialty}>
                          {teacher.specialty}
                        </span>
                      </div>
                    </div>

                    {/* Categoría */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categoría / Tipo de Mensaje</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'general', label: 'General', icon: Sparkles, activeClass: 'bg-slate-900 border-slate-900 text-white', inactiveClass: 'hover:bg-slate-50 text-slate-600 border-slate-200' },
                          { id: 'academico', label: 'Académico', icon: BookOpen, activeClass: 'bg-blue-600 border-blue-600 text-white', inactiveClass: 'hover:bg-slate-50 text-blue-600 border-blue-200' },
                          { id: 'convivencial', label: 'Convivencia', icon: Users, activeClass: 'bg-amber-500 border-amber-500 text-white', inactiveClass: 'hover:bg-slate-50 text-amber-600 border-amber-200' },
                          { id: 'urgente', label: 'Urgente', icon: AlertCircle, activeClass: 'bg-rose-600 border-rose-600 text-white animate-pulse', inactiveClass: 'hover:bg-rose-50 text-rose-600 border-rose-200' }
                        ].map(cat => {
                          const Icon = cat.icon;
                          const isActive = emailCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setEmailCategory(cat.id as any)}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all cursor-pointer ${isActive ? cat.activeClass : cat.inactiveClass}`}
                            >
                              <Icon className="w-4 h-4 mb-1" />
                              <span className="text-[10px] font-bold">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Asunto */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Asunto</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Programación de reunión pedagógica..."
                        value={emailSubject}
                        onChange={e => setEmailSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-lg p-2.5 text-xs font-semibold focus:outline-none transition-all"
                      />
                    </div>

                    {/* Cuerpo del Mensaje */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mensaje</label>
                        <span className={`text-[9px] font-bold ${emailMessage.length > 500 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {emailMessage.length}/800
                        </span>
                      </div>
                      <textarea
                        required
                        maxLength={800}
                        placeholder="Escriba el contenido del correo oficial. Se enviará una copia automática al buzón institucional..."
                        value={emailMessage}
                        onChange={e => setEmailMessage(e.target.value)}
                        className="w-full min-h-[120px] bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-lg p-3 text-xs font-medium focus:outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEmailOpen(false)}
                        className="flex-1 font-bold text-xs cursor-pointer"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSending || !emailSubject.trim() || !emailMessage.trim()}
                        className={`flex-1 font-bold text-xs cursor-pointer text-white transition-all duration-200 ${
                          emailCategory === 'general' ? 'bg-slate-900 hover:bg-slate-800' :
                          emailCategory === 'academico' ? 'bg-blue-600 hover:bg-blue-700' :
                          emailCategory === 'convivencial' ? 'bg-amber-50 hover:bg-amber-600' :
                          'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            Enviar Correo
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 py-2">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner mb-3">
                        <CheckCircle2 className="w-8 h-8 animate-bounce" />
                      </div>
                      <DialogTitle className="text-slate-800 text-lg font-black">¡Mensaje Despachado!</DialogTitle>
                      <p className="text-xs text-slate-500 mt-1">
                        El correo se ha enviado exitosamente a la casilla de correo oficial del docente.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Destinatario</span>
                        <span className="text-slate-700 font-black truncate max-w-[200px]">{teacher.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Casilla</span>
                        <span className="text-slate-500 font-semibold truncate max-w-[200px]">{teacher.email}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Categoría</span>
                        <span className={`font-black text-[10px] px-2 py-0.5 rounded-full uppercase ${
                          emailCategory === 'general' ? 'bg-slate-100 text-slate-700' :
                          emailCategory === 'academico' ? 'bg-blue-50 text-blue-700' :
                          emailCategory === 'convivencial' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {emailCategory}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Asunto</span>
                        <span className="text-slate-700 font-black truncate max-w-[200px]">{emailSubject}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Firma Digital</span>
                        <code className="text-[10px] text-indigo-600 font-bold font-mono">{mockVerificationHash}</code>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Hora de Envío</span>
                        <span className="text-slate-500 font-semibold">{new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-blue-700 leading-relaxed font-semibold">
                        <strong>Registro de Auditoría:</strong> Esta comunicación se ha encriptado con TLS y archivado en la bitácora de control de la Coordinación Académica.
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        setIsSentSuccess(false);
                        setIsEmailOpen(false);
                        setEmailSubject('');
                        setEmailMessage('');
                        setEmailCategory('general');
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-lg cursor-pointer transition-all"
                    >
                      Entendido
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
          <TeacherScheduleModal teacherId={teacher.id} teacherName={teacher.name} />
        </div>

      </CardContent>
    </Card>
  );
}
