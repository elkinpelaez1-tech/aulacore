'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ArrowLeft, 
  User, 
  Search,
  Lock,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRole } from '@/providers/role-provider';
import { cn } from '@/lib/utils';

interface ChatPartner {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen?: string;
  initialMessage: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'partner' | 'student';
  timestamp: string;
  status?: 'sent' | 'read';
}

const CHAT_PARTNERS: ChatPartner[] = [
  {
    id: 'c-1',
    name: 'Lic. Carlos Martínez',
    role: 'Director de Grupo (Grado 11-B)',
    avatar: 'https://i.pravatar.cc/150?img=68',
    status: 'online',
    initialMessage: 'Hola Tomas. Quería recordarte que debes entregar el acuerdo firmado para la salida pedagógica. ¿Tienes alguna duda?'
  },
  {
    id: 'c-2',
    name: 'Prof. Gómez',
    role: 'Docente de Matemáticas',
    avatar: 'https://i.pravatar.cc/150?img=11',
    status: 'offline',
    lastSeen: 'hace 2 horas',
    initialMessage: 'Tomás, revisé tu borrador del proyecto de cálculo y está excelente. Sigue así.'
  },
  {
    id: 'c-3',
    name: 'Prof. Ana Martínez',
    role: 'Docente de Filosofía',
    avatar: 'https://i.pravatar.cc/150?img=47',
    status: 'online',
    initialMessage: 'Buen día. Recuerden que mañana cerramos la nota del foro de Epistemología.'
  }
];

export default function MensajesPage() {
  const { userRole, userName, mounted } = useRole();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('c-1');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatsData, setChatsData] = useState<Record<string, Message[]>>({
    'c-1': [
      { id: 'm1-1', text: 'Hola Tomás. Quería recordarte que debes entregar el acuerdo firmado para la salida pedagógica. ¿Tienes alguna duda?', sender: 'partner', timestamp: '08:30 AM', status: 'read' },
      { id: 'm1-2', text: 'Hola Profesor Carlos. Sí, ya mi acudiente lo firmó anoche desde el portal de padres.', sender: 'student', timestamp: '09:15 AM', status: 'read' },
      { id: 'm1-3', text: 'Excelente Tomás, ya me aparece validado en el sistema por Secretaría. Nos vemos mañana en el laboratorio.', sender: 'partner', timestamp: '09:20 AM', status: 'read' }
    ],
    'c-2': [
      { id: 'm2-1', text: 'Tomás, revisé tu borrador del proyecto de cálculo y está excelente. Sigue así.', sender: 'partner', timestamp: 'Ayer, 04:10 PM', status: 'read' },
      { id: 'm2-2', text: 'Muchas gracias profesor. ¿Debo ajustar algo del gráfico de derivadas?', sender: 'student', timestamp: 'Ayer, 04:30 PM', status: 'read' },
      { id: 'm2-3', text: 'No, la escala está perfecta. Está listo para sustentar.', sender: 'partner', timestamp: 'Ayer, 05:00 PM', status: 'read' }
    ],
    'c-3': [
      { id: 'm3-1', text: 'Buen día. Recuerden que mañana cerramos la nota del foro de Epistemología.', sender: 'partner', timestamp: 'Hoy, 07:15 AM', status: 'read' }
    ]
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatsData, selectedPartnerId]);

  if (!mounted) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const selectedPartner = CHAT_PARTNERS.find(p => p.id === selectedPartnerId) || CHAT_PARTNERS[0];
  const messages = chatsData[selectedPartner.id] || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const timeString = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newMsg: Message = {
      id: `student-msg-${Date.now()}`,
      text: inputText.trim(),
      sender: 'student',
      timestamp: timeString,
      status: 'sent'
    };

    // Actualizar mensajes localmente
    const updatedMessages = [...messages, newMsg];
    setChatsData(prev => ({
      ...prev,
      [selectedPartner.id]: updatedMessages
    }));
    setInputText('');

    // Marcar como leído a los 1.5 seg
    setTimeout(() => {
      setChatsData(prev => {
        const currentMsgs = prev[selectedPartner.id] || [];
        return {
          ...prev,
          [selectedPartner.id]: currentMsgs.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m)
        };
      });
    }, 1500);

    // Auto-respuesta simulada del profesor a los 3 seg
    setTimeout(() => {
      const autoReplyText = `Entendido, Tomás. Estaré atento a tu desempeño y cualquier duda adicional me escribes por este medio. ¡Buen día!`;
      const replyTime = new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const autoReplyMsg: Message = {
        id: `partner-reply-${Date.now()}`,
        text: autoReplyText,
        sender: 'partner',
        timestamp: replyTime
      };
      
      setChatsData(prev => ({
        ...prev,
        [selectedPartner.id]: [...(prev[selectedPartner.id] || []), autoReplyMsg]
      }));
    }, 3000);
  };

  const filteredPartners = CHAT_PARTNERS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        
        {/* Cabecera de Página */}
        <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-150 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-lg hover:bg-slate-100 cursor-pointer border-none outline-none h-10 w-10">
                <ArrowLeft className="w-5 h-5 text-slate-650" />
              </Button>
            </Link>
            <div>
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest leading-none">Centro de Mensajería</span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Bandeja de Entrada</h1>
              <p className="text-[13px] text-slate-500 mt-1">Comunícate de forma segura y directa con tus docentes y director de grupo.</p>
            </div>
          </div>
        </div>

        {/* MÓDULO DE CHAT SPLIT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch animate-in fade-in duration-300 delay-100">
          
          {/* COLUMNA IZQUIERDA: LISTA DE CHATS (1/3) */}
          <Card className="lg:col-span-1 border-slate-200 shadow-sm bg-white rounded-2xl flex flex-col h-[600px]">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                Mis Profesores
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar docente o rol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs font-semibold rounded-lg bg-white border-slate-200 focus-visible:ring-blue-500 h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-2 flex-1 overflow-y-auto space-y-1">
              {filteredPartners.length > 0 ? (
                filteredPartners.map((partner) => {
                  const isActive = partner.id === selectedPartnerId;
                  const lastMsg = chatsData[partner.id]?.[chatsData[partner.id].length - 1];

                  return (
                    <button
                      key={partner.id}
                      onClick={() => setSelectedPartnerId(partner.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl flex items-center gap-3 transition cursor-pointer border border-transparent outline-none",
                        isActive ? "bg-blue-50 text-blue-950 border-blue-150/40" : "bg-white hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full border border-slate-100 overflow-hidden bg-slate-100">
                          <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
                        </div>
                        <span className={cn(
                          "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white",
                          partner.status === 'online' ? "bg-emerald-500" : "bg-slate-350"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs truncate leading-none text-slate-800">{partner.name}</span>
                          {lastMsg && (
                            <span className="text-[9px] font-bold text-slate-400">{lastMsg.timestamp.split(',').pop()?.trim()}</span>
                          )}
                        </div>
                        <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">{partner.role}</p>
                        {lastMsg && (
                          <p className="text-[11px] font-medium text-slate-400 truncate mt-1 leading-snug">
                            {lastMsg.sender === 'student' ? 'Tú: ' : ''}{lastMsg.text}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <span className="text-xs font-semibold">No se encontraron chats</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* COLUMNA DERECHA: CONVERSACIÓN ACTIVA (2/3) */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white rounded-2xl flex flex-col h-[600px]">
            
            {/* Header del Chat */}
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border border-slate-100 overflow-hidden bg-slate-100">
                    <img src={selectedPartner.avatar} alt={selectedPartner.name} className="w-full h-full object-cover" />
                  </div>
                  <span className={cn(
                    "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white",
                    selectedPartner.status === 'online' ? "bg-emerald-500" : "bg-slate-350"
                  )} />
                </div>
                <div>
                  <CardTitle className="text-sm font-black text-slate-800 leading-none">{selectedPartner.name}</CardTitle>
                  <p className="text-[10px] font-semibold text-slate-500 mt-1">{selectedPartner.role}</p>
                </div>
              </div>
              
              <div className="text-[10px] font-bold text-slate-450">
                {selectedPartner.status === 'online' ? (
                  <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activo ahora
                  </span>
                ) : (
                  <span>Última vez: {selectedPartner.lastSeen}</span>
                )}
              </div>
            </CardHeader>
            
            {/* Mensajes del Chat */}
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full w-full p-4 bg-slate-50/40">
                <div className="space-y-4 pb-4">
                  
                  {/* Cifrado de extremo a extremo */}
                  <div className="flex justify-center">
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100/80 px-2.5 py-1 rounded-md flex items-center gap-1 uppercase tracking-wider border border-slate-150">
                      <Lock className="w-3 h-3 text-slate-400" /> Conversación cifrada de extremo a extremo
                    </span>
                  </div>

                  {messages.map((msg, idx) => {
                    const isMe = msg.sender === 'student';
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-end gap-2 max-w-[80%]",
                          isMe ? "ml-auto flex-row-reverse" : ""
                        )}
                      >
                        {!isMe && (
                          <div className="w-6 h-6 rounded-full border border-slate-100 overflow-hidden bg-slate-100 shrink-0 mb-0.5">
                            <img src={selectedPartner.avatar} alt={selectedPartner.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl shadow-3xs leading-relaxed text-xs sm:text-sm font-medium",
                          isMe 
                            ? "bg-blue-650 text-white rounded-br-sm" 
                            : "bg-white border border-slate-200/80 text-slate-800 rounded-bl-sm"
                        )}>
                          <p>{msg.text}</p>
                          <div className="flex items-center justify-end gap-1 mt-1 leading-none">
                            <span className={cn("text-[9px] font-bold", isMe ? "text-blue-200" : "text-slate-450")}>
                              {msg.timestamp}
                            </span>
                            {isMe && (
                              <CheckCircle2 className={cn(
                                "w-3 h-3",
                                msg.status === 'read' ? "text-blue-300" : "text-blue-400"
                              )} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Input del Chat */}
            <CardFooter className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
              <form className="flex w-full items-center gap-2" onSubmit={handleSend}>
                <Input
                  placeholder={`Responder a ${selectedPartner.name.split(' ')[1]}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 rounded-full border-slate-200 bg-white px-4 focus-visible:ring-blue-500 h-10 text-xs sm:text-sm font-semibold"
                />
                <Button type="submit" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700 shrink-0 h-10 w-10 border-none outline-none">
                  <Send className="w-4.5 h-4.5 text-white" />
                </Button>
              </form>
            </CardFooter>

          </Card>

        </div>

      </div>
    </AppLayout>
  );
}
