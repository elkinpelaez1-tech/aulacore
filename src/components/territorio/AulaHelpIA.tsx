'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, X, Send, HelpCircle, BookOpen, GraduationCap, 
  Activity, Video, FileText, Image as ImageIcon, Search, 
  Trash2, Bell, AlertTriangle, ShieldCheck, ArrowRight
} from 'lucide-react';
import { 
  askAulaHelpIA, 
  getChatHistory, 
  saveChatHistory, 
  clearChatHistory, 
  ChatMessage, 
  getTelemetryStats 
} from '@/services/help-ai-service';
import { HELP_KNOWLEDGE_BASE, HelpArticle } from '@/services/help-knowledge-base';
import { HELP_GLOSSARY } from '@/services/help-glossary';
import { isModoDemoActive } from '@/services/territory-mock';
import { getMIORuns } from '@/services/mio-service';

export function AulaHelpIA() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'buscador' | 'aprender' | 'telemetria'>('chat');
  
  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Buscador States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  // Proactive Help States
  const [proactiveVisible, setProactiveVisible] = useState(false);
  const [proactiveMsg, setProactiveMsg] = useState('');
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  // Context simulation
  const [currentRole, setCurrentRole] = useState('Secretario de Educación');
  const [orgType, setOrgType] = useState('Secretaría de Educación');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar rol y chat al iniciar
  useEffect(() => {
    const savedRole = sessionStorage.getItem('simulated_role') || 'Secretario de Educación';
    setCurrentRole(savedRole);
    if (savedRole === 'Rector Principal') {
      setOrgType('Institución Educativa');
    } else {
      setOrgType('Secretaría de Educación');
    }

    const demoActive = isModoDemoActive();
    const history = getChatHistory();
    if (history.length === 0) {
      const welcome: ChatMessage = {
        sender: 'ia',
        text: demoActive
          ? `¡Bienvenido a la **Demostración Comercial de AulaCore**! 🎬\n\nSoy **AulaHelp IA**, tu asesor de ventas y gestión gubernamental.\n\nHe activado el **Modo Demo Comercial** en el territorio consolidado de **Antioquia** ( Barbosa, Copacabana, Girardota, Medellín) con datos realistas para 10 planteles.\n\nPara guiar su presentación, haga clic abajo en **"Guión de la Demo Comercial 🎬"** o pregúnteme sobre el valor estratégico de cualquier módulo para un Alcalde o Rector.`
          : `¡Hola! Soy **AulaHelp IA**, tu asesor experto en gestión educativa y AulaCore.\n\nEstoy aquí para guiarte en el uso de la plataforma según tu cargo (**${savedRole}**).\n\n¿En qué proceso o indicador del sistema tienes dudas hoy?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcome]);
      saveChatHistory([welcome]);
    } else {
      setMessages(history);
    }
  }, [isOpen]);

  // Desplazar chat al fondo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Escuchar cambio del modo demo para recargar mensajes
  useEffect(() => {
    const handleDemo = () => {
      const demoActive = isModoDemoActive();
      const savedRole = sessionStorage.getItem('simulated_role') || 'Secretario de Educación';
      const welcome: ChatMessage = {
        sender: 'ia',
        text: demoActive
          ? `¡Bienvenido a la **Demostración Comercial de AulaCore**! 🎬\n\nSoy **AulaHelp IA**, tu asesor de ventas y gestión gubernamental.\n\nHe activado el **Modo Demo Comercial** en el territorio consolidado de **Antioquia** ( Barbosa, Copacabana, Girardota, Medellín) con datos realistas para 10 planteles.\n\nPara guiar su presentación, haga clic abajo en **"Guión de la Demo Comercial 🎬"** o pregúnteme sobre el valor estratégico de cualquier módulo para un Alcalde o Rector.`
          : `¡Hola! Soy **AulaHelp IA**, tu asesor experto en gestión educativa y AulaCore.\n\nEstoy aquí para guiarte en el uso de la plataforma según tu cargo (**${savedRole}**).\n\n¿En qué proceso o indicador del sistema tienes dudas hoy?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcome]);
      saveChatHistory([welcome]);
    };
    window.addEventListener('modo-demo-changed', handleDemo);
    return () => window.removeEventListener('modo-demo-changed', handleDemo);
  }, []);

  // Ayuda Proactiva (temporizador de 60 segundos de inactividad)
  useEffect(() => {
    resetInactivityTimer();

    const handleInteraction = () => resetInactivityTimer();
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('click', handleInteraction);

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [pathname]);

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (isOpen) return; // Si ya está abierto, no disparar ayuda proactiva

    inactivityTimer.current = setTimeout(() => {
      triggerProactiveHelp();
    }, 60000); // 60 segundos
  };

  const triggerProactiveHelp = () => {
    let msg = 'Hola, soy AulaHelp IA. ¿Tienes dudas sobre el uso general de AulaCore? Haz clic aquí.';
    if (pathname.includes('/territorio/alertas')) {
      msg = 'Hola, veo que estás revisando el CAT. ¿Necesitas saber cómo calcular la Prioridad Inteligente o cómo validar una alerta?';
    } else if (pathname.includes('/territorio/agenda')) {
      msg = 'Hola, ¿tienes dudas sobre cómo registrar una visita técnica en el calendario o cómo reasignar un supervisor?';
    } else if (pathname.includes('/territorio/configuracion')) {
      msg = 'Hola, ¿necesitas ayuda para calibrar los umbrales de alerta del Motor IA o configurar la identidad oficial?';
    }
    setProactiveMsg(msg);
    setProactiveVisible(true);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    saveChatHistory(updated);
    setInputValue('');
    setIsThinking(true);
    setProactiveVisible(false);

    try {
      let responseText = '';
      let related: string[] = [];

      const queryLower = textToSend.toLowerCase();

      if (queryLower.includes('guión') || queryLower.includes('guion')) {
        responseText = `**Guión Oficial de Ventas - Demo Comercial Premium (10 Minutos)** 🎬\n\nSiga este recorrido en 3 actos para impresionar a un Secretario o Alcalde:\n\n` +
          `*   **Acto 1: Detección (2 mins)**:\n` +
          `    1. Inicie en la **Consola Territorial**. Resalte los KPIs. Muestre la matrícula consolidada real de **4.820 estudiantes** en Antioquia.\n` +
          `    2. Diríjase al **Centro de Alertas Tempranas (CAT)**. Explique el triage. Muestre el semáforo en Rojo en la **I.E. Rural El Hatillo (PAE-001)**.\n\n` +
          `*   **Acto 2: Diagnóstico e Inteligencia (4 mins)**:\n` +
          `    1. Abra el expediente de la alerta. Señale el **Impacto Estimado (240 raciones)**.\n` +
          `    2. Use **AulaHelp IA** para ver qué norma legal del PAE ampara este caso y cómo calcular el impacto.\n` +
          `    3. Muestre la pestaña **Recomendaciones** generadas automáticamente para actuar de inmediato.\n\n` +
          `*   **Acto 3: Resolución e Inmutabilidad (4 mins)**:\n` +
          `    1. Transicione el estado a "Intervención" y asigne a la inspectora **Claudia Restrepo**.\n` +
          `    2. Muestre el **Timeline Narrativo**. Explique cómo la inmutabilidad y la firma digital previenen la alteración de bitácoras.\n` +
          `    3. Diríjase a **Reportes** y descargue la planilla foliada con el sello oficial de la Gobernación de Antioquia.`;
        related = ['como-registrar-visita', 'cat-prioridad-inteligente'];
      } else if (queryLower.includes('valor comercial') || queryLower.includes('roi') || queryLower.includes('retorno')) {
        responseText = `**Retorno de Inversión (ROI) y Valor Comercial de AulaCore** 📈\n\nAulaCore se presenta a Alcaldías y Gobernaciones bajo tres pilares de valor monetario e institucional:\n\n` +
          `1.  **Reducción de la Deserción Escolar (ROI Social)**:\n` +
          `    *   *Métrica*: Al alertar inasistencias en 48 horas (vía RFID) en vez de al final de mes, se recuperan un promedio de 8.2% de alumnos en riesgo de abandono.\n` +
          `    *   *Impacto*: Mayor transferencia per cápita del Sistema General de Participaciones (SGP) al municipio.\n\n` +
          `2.  **Optimización y Control del PAE**:\n` +
          `    *   *Métrica*: Cruce en caliente entre raciones contratadas y asistencia real registrada.\n` +
          `    *   *Impacto*: Evita el pago de raciones no entregadas o duplicadas, ahorrando hasta un 14.5% del presupuesto alimentario.\n\n` +
          `3.  **Transparencia de Auditoría**:\n` +
          `    *   *Métrica*: Bitácora de incidencias firmada con hashes criptográficos inmutables.\n` +
          `    *   *Impacto*: Blindaje legal contra demandas de proveedores y cumplimiento estricto ante los entes de control fiscal.`;
        related = ['cat-vulnerabilidad', 'que-es-matricula-consolidada'];
      } else if (queryLower.includes('mio') || queryLower.includes('automatiz') || queryLower.includes('monitoreo') || queryLower.includes('black box') || queryLower.includes('caja negra') || queryLower.includes('eventos') || queryLower.includes('telemetr')) {
        const currentRuns = getMIORuns();
        const runSummary = currentRuns.length > 0 
          ? currentRuns.slice(0, 3).map(r => `*   **Folio #${r.folio}**: Receta \`${r.recipeName}\` ejecutada en **${r.durationMs}ms** por el módulo \`${r.originModule}\`. Estado: \`${r.status}\`. Firma: \`${r.executionHash.substring(0, 16)}...\`.`).join('\n')
          : '*   *No se registran eventos procesados en la Black Box en este periodo de sesión.*';

        responseText = `**Servicio de Telemetría y Monitoreo del Ecosistema MIO** ⚡\n\n` +
          `Como asesor de AulaCore, te presento el informe de auditoría inmutable de la **Black Box (Caja Negra)** en tiempo real:\n\n` +
          `**Métricas Operativas del MIO**:\n` +
          `*   **Eventos Totales**: ${currentRuns.length} procesados.\n` +
          `*   **Tiempo de Respuesta**: ${currentRuns.length > 0 ? (currentRuns.reduce((a, r) => a + r.durationMs, 0) / currentRuns.length).toFixed(0) : '0'} ms promedio.\n` +
          `*   **Canal**: Bus de Eventos Global Desacoplado.\n` +
          `*   **Salud del Bus**: 🟢 Activo y en espera de eventos.\n\n` +
          `**Últimos Folios Registrados (Auditoría SHA-256)**:\n${runSummary}\n\n` +
          `*Nota: Todos los folios y timelines son inmutables y están firmados criptográficamente para auditoría fiscal.*`;
        related = ['cat-prioridad-inteligente', 'cat-acciones-pendientes'];
      } else {
        // Buscar coincidencia semántica/texto en el glosario oficial
        const glossaryMatch = Object.values(HELP_GLOSSARY).find(item => 
          queryLower.includes(item.title.toLowerCase()) || 
          item.id.split('-').some(word => word.length > 2 && queryLower.includes(word))
        );

        if (glossaryMatch) {
          responseText = `**Glosario Oficial de AulaCore: ${glossaryMatch.title}** 📚\n\n` +
            `*   **¿Qué es?**: ${glossaryMatch.whatIs}\n` +
            `*   **¿Por qué es importante?**: ${glossaryMatch.whyImportant}\n` +
            (glossaryMatch.howCalculated ? `*   **¿Cómo se calcula?**: ${glossaryMatch.howCalculated}\n` : '') +
            `*   **Decisiones**: ${glossaryMatch.decisions}\n` +
            `*   **Buenas Prácticas**: ${glossaryMatch.bestPractices}\n` +
            `*   **Caso Práctico**: ${glossaryMatch.caseStudy}\n` +
            (glossaryMatch.regulation ? `*   **Normatividad aplicable**: *${glossaryMatch.regulation}*` : '');
          related = ['cat-vulnerabilidad', 'cat-prioridad-inteligente'];
        } else {
          const res = await askAulaHelpIA(textToSend, pathname, currentRole, orgType);
          responseText = res.text;
          related = res.relatedArticles || [];
        }
      }
      
      const iaMsg: ChatMessage = {
        sender: 'ia',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relatedArticles: related
      };
      
      const final = [...updated, iaMsg];
      setMessages(final);
      saveChatHistory(final);
    } catch (e) {
      // Error silencioso
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearChat = () => {
    clearChatHistory();
    const welcome: ChatMessage = {
      sender: 'ia',
      text: `Historial de conversación vaciado.\n\nSoy **AulaHelp IA**. ¿Qué proceso de AulaCore deseas que expliquemos hoy?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcome]);
    saveChatHistory([welcome]);
  };

  const getSuggestedQuestions = () => {
    const demoActive = isModoDemoActive();
    if (demoActive) {
      return [
        'Guión de la Demo Comercial 🎬',
        '¿Cuál es el valor comercial del CAT para un Secretario?',
        '¿Cómo justifica AulaCore su retorno de inversión (ROI)?'
      ];
    }
    if (pathname.includes('/territorio/alertas')) {
      return [
        '¿Cómo funciona la prioridad del Motor Inteligente?',
        '¿Cómo resolver y auditar una Alerta?',
        '¿Qué es el Índice de Vulnerabilidad Territorial (IRT)?'
      ];
    }
    if (pathname.includes('/territorio/agenda')) {
      return [
        '¿Cómo programar una visita técnica en la Agenda?',
        '¿Cómo funciona la prioridad del Motor Inteligente?'
      ];
    }
    return [
      '¿Qué es la Matrícula Consolidada y cómo auditarla?',
      '¿Cómo emitir una Circular Oficial?',
      '¿Cómo funciona la prioridad del Motor Inteligente?'
    ];
  };

  const filteredArticles = Object.values(HELP_KNOWLEDGE_BASE).filter(art => {
    return art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           art.whatIs.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const telemetryStats = getTelemetryStats();

  return (
    <>
      {/* 🔮 BOTÓN FLOTANTE GLOBAL + GLOBO PROACTIVO */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans pointer-events-none">
        
        {/* Globo Proactivo */}
        {proactiveVisible && (
          <div className="bg-slate-900 border border-slate-800 text-white text-[11px] font-semibold p-3.5 rounded-2xl shadow-2xl max-w-xs leading-normal animate-fade-in pointer-events-auto flex items-start gap-2 relative">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p>{proactiveMsg}</p>
              <button 
                onClick={() => {
                  setIsOpen(true);
                  setProactiveVisible(false);
                }}
                className="mt-2 text-indigo-400 hover:text-indigo-300 font-extrabold text-[10px] uppercase block tracking-wider bg-transparent border-none cursor-pointer p-0"
              >
                Abrir Copilot ➔
              </button>
            </div>
            <button 
              onClick={() => setProactiveVisible(false)}
              className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer p-0 shrink-0"
            >
              ✕
            </button>
            
            {/* Flechita derecha */}
            <div className="absolute top-1/2 -translate-y-1/2 left-full border-[6px] border-transparent border-l-slate-900" />
          </div>
        )}

        {/* Botón Principal */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setProactiveVisible(false);
          }}
          className="pointer-events-auto w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-105 transition-all duration-200 border-none group relative"
          title="Asistente AulaHelp IA"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
          
          {/* Badge sutil de IA */}
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase border border-white">
            IA
          </span>
        </button>
      </div>

      {/* 🤖 PANEL LATERAL (COPILOT STYLE SIDEBAR) */}
      {isOpen && (
        <div className="fixed top-0 right-0 w-96 h-screen bg-white z-40 shadow-2xl border-l border-slate-200 flex flex-col animate-slide-in font-sans">
          
          {/* Cabecera del Panel */}
          <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">AulaHelp IA</h3>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Asesor Inteligente Global</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de Pestañas */}
          <div className="flex border-b border-slate-150 p-1.5 bg-slate-50 gap-1">
            <button 
              onClick={() => { setActiveTab('chat'); setSelectedArticle(null); }}
              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border-none cursor-pointer transition-all ${
                activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Chat Copilot
            </button>
            <button 
              onClick={() => setActiveTab('buscador')}
              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border-none cursor-pointer transition-all ${
                activeTab === 'buscador' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Manuales
            </button>
            <button 
              onClick={() => { setActiveTab('aprender'); setSelectedArticle(null); }}
              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border-none cursor-pointer transition-all ${
                activeTab === 'aprender' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Aprender
            </button>
            <button 
              onClick={() => { setActiveTab('telemetria'); setSelectedArticle(null); }}
              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border-none cursor-pointer transition-all ${
                activeTab === 'telemetria' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              BI Telemetría
            </button>
          </div>

          {/* 🗣️ PESTAÑA CHAT COPILOT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30">
              
              {/* Cuerpo del Chat */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] p-3.5 rounded-2xl leading-normal font-semibold ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-650 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-200 text-slate-850 rounded-tl-none shadow-xs'
                    }`}>
                      {/* Formatear negritas básicas */}
                      <p className="whitespace-pre-wrap">
                        {msg.text.split('**').map((chunk, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold">{chunk}</strong> : chunk)}
                      </p>

                      {/* Artículos relacionados recomendados por el Motor */}
                      {msg.relatedArticles && msg.relatedArticles.length > 0 && (
                        <div className="mt-3.5 pt-2.5 border-t border-slate-100 space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Lecturas Sugeridas</span>
                          {msg.relatedArticles.map(artId => {
                            const art = HELP_KNOWLEDGE_BASE[artId];
                            if (!art) return null;
                            return (
                              <button
                                key={artId}
                                onClick={() => {
                                  setSelectedArticle(art);
                                  setActiveTab('buscador');
                                }}
                                className="block text-left text-[10px] text-indigo-600 hover:text-indigo-800 hover:underline bg-transparent border-none p-0 cursor-pointer font-bold"
                              >
                                📘 {art.title}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 px-1 font-bold">{msg.timestamp}</span>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-extrabold animate-pulse pl-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    AulaHelp IA está analizando los manuales...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Sugerencias Rápidas según contexto */}
              <div className="p-3 bg-white border-t border-slate-100 space-y-1.5 shrink-0">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Preguntas Sugeridas (Contexto)</span>
                <div className="flex flex-wrap gap-1.5">
                  {getSuggestedQuestions().map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q)}
                      className="text-[9px] font-bold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1.5 rounded-xl border border-slate-150 text-left transition-all max-w-full truncate cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulario de Envío */}
              <div className="p-4 bg-white border-t border-slate-150 shrink-0">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} 
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Pregunta a la IA sobre AulaCore..."
                    className="flex-1 text-xs font-semibold text-slate-800 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center shrink-0 border-none cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClearChat}
                    title="Vaciar chat"
                    className="w-10 h-10 bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* 📘 PESTAÑA MANUALES Y GLOSARIO */}
          {activeTab === 'buscador' && (
            <div className="flex-1 flex flex-col min-h-0 p-4 space-y-4">
              
              {!selectedArticle ? (
                <>
                  {/* Caja de Búsqueda */}
                  <div className="relative shrink-0">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar manuales de AulaCore..."
                      className="w-full text-xs font-semibold text-slate-800 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none placeholder-slate-400"
                    />
                  </div>

                  {/* Listado de Artículos */}
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredArticles.map(art => (
                      <button
                        key={art.id}
                        onClick={() => setSelectedArticle(art)}
                        className="w-full text-left p-3.5 bg-white hover:bg-indigo-50/20 border border-slate-200 rounded-2xl cursor-pointer transition-all flex justify-between items-center group"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800 block group-hover:text-indigo-700">{art.title}</span>
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">{art.category}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* Detalle Multimedia Completo del Artículo */
                <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-50 border-b border-slate-150 flex justify-between items-start shrink-0">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{selectedArticle.category}</span>
                      <h4 className="text-xs font-black text-slate-800 uppercase mt-0.5 leading-snug">{selectedArticle.title}</h4>
                    </div>
                    <button 
                      onClick={() => setSelectedArticle(null)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer bg-transparent border-none"
                    >
                      Volver
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-semibold text-slate-655 leading-relaxed">
                    
                    {/* Elemento de Video (Multimedia) */}
                    {selectedArticle.videoUrl && (
                      <div className="bg-slate-900 aspect-video rounded-xl flex flex-col items-center justify-center text-white relative group overflow-hidden border border-slate-800">
                        <Video className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-wider mt-1 text-slate-400">Ver Video Tutorial</span>
                        <span className="text-[8px] text-slate-500 font-mono mt-0.5">{selectedArticle.videoUrl}</span>
                      </div>
                    )}

                    {/* Elemento de Imagen (Multimedia) */}
                    {selectedArticle.imageUrl && (
                      <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center">
                        <div className="aspect-video bg-indigo-50 border border-indigo-100 rounded-lg flex flex-col items-center justify-center text-indigo-650">
                          <ImageIcon className="w-6 h-6 text-indigo-500" />
                          <span className="text-[9px] font-bold mt-1">Infografía BI</span>
                        </div>
                        <span className="text-[8px] text-slate-405 block mt-1.5 font-bold">Esquema: {selectedArticle.imageUrl}</span>
                      </div>
                    )}

                    <div>
                      <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block">¿Qué es?</span>
                      <p className="text-slate-700">{selectedArticle.whatIs}</p>
                    </div>

                    <div>
                      <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block">¿Por qué es importante?</span>
                      <p className="text-slate-700">{selectedArticle.whyImportant}</p>
                    </div>

                    {selectedArticle.howCalculated && (
                      <div>
                        <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block">¿Cómo se calcula?</span>
                        <p className="text-slate-700 font-mono bg-slate-50 p-2 border border-slate-200 rounded-lg">{selectedArticle.howCalculated}</p>
                      </div>
                    )}

                    <div>
                      <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block">¿Qué decisiones permite tomar?</span>
                      <p className="text-indigo-950 font-bold bg-indigo-50/30 p-2.5 rounded-lg border border-indigo-100">{selectedArticle.decisions}</p>
                    </div>

                    {/* Documento Descargable */}
                    {selectedArticle.documentUrl && (
                      <div className="p-3 border border-slate-200 bg-slate-50/50 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          <div>
                            <span className="text-[9px] font-bold text-slate-800 block">Manual Funcional Oficial</span>
                            <span className="text-[8px] text-slate-400 font-mono block">Descargar PDF</span>
                          </div>
                        </div>
                        <button
                          onClick={() => alert(`Descargando soporte manual: ${selectedArticle.documentUrl}`)}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-55 rounded-lg font-bold text-[9px] cursor-pointer"
                        >
                          Bajar PDF
                        </button>
                      </div>
                    )}

                    {/* Contenidos Relacionados */}
                    {selectedArticle.relatedArticleIds.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Artículos Relacionados</span>
                        {selectedArticle.relatedArticleIds.map(relId => {
                          const relArt = HELP_KNOWLEDGE_BASE[relId];
                          if (!relArt) return null;
                          return (
                            <button
                              key={relId}
                              onClick={() => setSelectedArticle(relArt)}
                              className="block text-left text-[10px] text-indigo-600 hover:text-indigo-800 hover:underline bg-transparent border-none p-0 cursor-pointer font-bold"
                            >
                              ➔ {relArt.title}
                            </button>
                          );
                        })}
                      </div>
                    )}

                  </div>
                </div>
              )}

            </div>
          )}

          {/* 🎓 PESTAÑA APRENDER AULACORE */}
          {activeTab === 'aprender' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-semibold">
              <div className="bg-indigo-50/20 border border-indigo-150 p-4 rounded-2xl flex gap-3 text-slate-800 items-start">
                <GraduationCap className="w-5 h-5 shrink-0 text-indigo-650 mt-0.5 animate-bounce" />
                <div>
                  <span className="font-black text-indigo-900 block">Rutas de Capacitación Guiada</span>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Deje de depender de capacitaciones presenciales. Aprenda de forma interactiva y autónoma las rutas de AulaCore.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {/* Ruta 1 */}
                <div className="p-4 border border-slate-200 bg-white rounded-2xl hover:border-slate-300 transition-all space-y-1">
                  <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block">Ruta 1 (Onboarding)</span>
                  <span className="text-xs font-bold text-slate-800 block">Inducción General para Funcionarios SED</span>
                  <p className="text-[10px] text-slate-400">Duración estimada: 30 mins — 5 hitos en la plataforma.</p>
                  <button 
                    disabled
                    className="mt-2 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-400 rounded-lg text-[9px] font-bold cursor-not-allowed"
                  >
                    Iniciar Ruta (Próximamente)
                  </button>
                </div>

                {/* Ruta 2 */}
                <div className="p-4 border border-slate-200 bg-white rounded-2xl hover:border-slate-300 transition-all space-y-1">
                  <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block">Ruta 2 (Comunicaciones)</span>
                  <span className="text-xs font-bold text-slate-805 block">Firma y Certificación de Comunicados Digitales</span>
                  <p className="text-[10px] text-slate-400">Duración estimada: 15 mins — Conexión de token digital.</p>
                  <button 
                    disabled
                    className="mt-2 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-400 rounded-lg text-[9px] font-bold cursor-not-allowed"
                  >
                    Iniciar Ruta (Próximamente)
                  </button>
                </div>

                {/* Ruta 3 */}
                <div className="p-4 border border-slate-200 bg-white rounded-2xl hover:border-slate-300 transition-all space-y-1">
                  <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block">Ruta 3 (CAT)</span>
                  <span className="text-xs font-bold text-slate-805 block">Triage de Decisiones y Operación del CAT</span>
                  <p className="text-[10px] text-slate-400">Duración estimada: 25 mins — Flujos de auditoría del timeline.</p>
                  <button 
                    disabled
                    className="mt-2 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-400 rounded-lg text-[9px] font-bold cursor-not-allowed"
                  >
                    Iniciar Ruta (Próximamente)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 📊 PESTAÑA BI TELEMETRÍA (SUPABASE READY) */}
          {activeTab === 'telemetria' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-semibold text-slate-655 leading-relaxed">
                <span className="font-black text-slate-800 block mb-1">Telemetría de Dudas Recurrentes</span>
                <p>Muestra las búsquedas libres formuladas por los operadores para focalizar planes de capacitación en la plataforma.</p>
              </div>

              {telemetryStats.length === 0 ? (
                <div className="text-center py-12 text-xs font-bold italic text-slate-400">
                  No hay telemetría registrada aún en esta sesión. Escribe dudas en el chat para registrar el flujo.
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Registros de Consulta Recientes</span>
                  <div className="space-y-1.5">
                    {telemetryStats.slice(-10).reverse().map((log) => (
                      <div key={log.id} className="p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-semibold text-slate-700 space-y-1">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="font-extrabold text-indigo-700 max-w-[200px] truncate" title={log.query}>
                            "{log.query}"
                          </span>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                            log.found ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {log.found ? 'Encontrada' : 'No Encontrada'}
                          </span>
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-400">
                          <span>Rol: <strong>{log.user_role}</strong></span>
                          <span>Org: <strong>{log.org_type}</strong></span>
                        </div>
                        <span className="block text-[7px] font-mono text-slate-400">Sesión: {log.session_id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </>
  );
}
