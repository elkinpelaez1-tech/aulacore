'use client';

import { HELP_KNOWLEDGE_BASE, HelpArticle } from './help-knowledge-base';

export interface ChatMessage {
  sender: 'user' | 'ia';
  text: string;
  timestamp: string;
  relatedArticles?: string[];
}

export interface HelpTelemetryLog {
  id: string;
  query: string;
  user_role: string;
  org_type: string;
  found: boolean;
  session_id: string;
  created_at: string;
}

// Persist chat memory in sessionStorage
const CHAT_SESSION_KEY = 'aulacore_help_chat_history';
const TELEMETRY_STORAGE_KEY = 'aulacore_help_telemetry_supabase_ready';
const HELP_SESSION_ID_KEY = 'aulacore_help_session_id';

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  let sid = sessionStorage.getItem(HELP_SESSION_ID_KEY);
  if (!sid) {
    sid = `sess-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(HELP_SESSION_ID_KEY, sid);
  }
  return sid;
}

export function getChatHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  const stored = sessionStorage.getItem(CHAT_SESSION_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveChatHistory(history: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(history));
}

export function clearChatHistory() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(CHAT_SESSION_KEY);
}

/**
 * Registrar telemetría de consulta estructurada compatible con Supabase
 */
export function logAITelemetry(query: string, found: boolean, userRole: string, orgType: string) {
  if (typeof window === 'undefined') return;
  try {
    const log: HelpTelemetryLog = {
      id: `tel-${Math.random().toString(36).substr(2, 9)}`,
      query,
      user_role: userRole,
      org_type: orgType,
      found,
      session_id: getSessionId(),
      created_at: new Date().toISOString()
    };

    const stored = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    const logs: HelpTelemetryLog[] = stored ? JSON.parse(stored) : [];
    logs.push(log);
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(logs));

    console.log('[AulaHelp IA Supabase Ready Telemetry]:', log);
  } catch (e) {
    // Silencioso
  }
}

export function getTelemetryStats(): HelpTelemetryLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Motor de Consulta Inteligente Contextualizada (Simulado)
 * Resuelve dudas en base a la base de conocimiento. Si no encuentra coincidencia, 
 * responde honestamente sin alucinaciones.
 */
export async function askAulaHelpIA(
  query: string,
  pathname: string,
  userRole: string,
  orgType: string
): Promise<{ text: string; relatedArticles?: string[] }> {
  // Simular latencia de red del LLM (1.2 segundos de delay)
  await new Promise(resolve => setTimeout(resolve, 1200));

  const lowerQuery = query.toLowerCase().trim();
  let matchedArticle: HelpArticle | null = null;
  
  // Buscar coincidencia en la base de conocimiento por palabras clave
  const articles = Object.values(HELP_KNOWLEDGE_BASE);
  for (const article of articles) {
    const titleMatch = article.title.toLowerCase().includes(lowerQuery);
    const keywordMatch = article.whatIs.toLowerCase().includes(lowerQuery) || 
                         article.decisions.toLowerCase().includes(lowerQuery);
    
    if (titleMatch || keywordMatch) {
      matchedArticle = article;
      break;
    }
  }

  // Si no se encuentra un artículo, buscar términos genéricos
  if (!matchedArticle) {
    if (lowerQuery.includes('matrícula') || lowerQuery.includes('cobertura')) {
      matchedArticle = HELP_KNOWLEDGE_BASE['que-es-matricula-consolidada'];
    } else if (lowerQuery.includes('visita') || lowerQuery.includes('agenda')) {
      matchedArticle = HELP_KNOWLEDGE_BASE['como-registrar-visita'];
    } else if (lowerQuery.includes('circular') || lowerQuery.includes('comunicar')) {
      matchedArticle = HELP_KNOWLEDGE_BASE['como-emitir-circular'];
    } else if (lowerQuery.includes('prioridad') || lowerQuery.includes('priorizar') || lowerQuery.includes('motor')) {
      matchedArticle = HELP_KNOWLEDGE_BASE['cat-prioridad-inteligente'];
    } else if (lowerQuery.includes('alerta') || lowerQuery.includes('resolver') || lowerQuery.includes('cerrar')) {
      matchedArticle = HELP_KNOWLEDGE_BASE['cat-acciones-pendientes'];
    } else if (lowerQuery.includes('vulnerabilidad') || lowerQuery.includes('irt')) {
      matchedArticle = HELP_KNOWLEDGE_BASE['cat-vulnerabilidad'];
    }
  }

  const found = !!matchedArticle;
  logAITelemetry(query, found, userRole, orgType);

  if (matchedArticle) {
    // Contextualizar respuesta según el Rol y la Organización
    let contextIntro = `Estimado ${userRole} de la ${orgType}:\n\n`;
    if (userRole === 'Rector Principal') {
      contextIntro = `Estimado Rector, le presento la información desde el ámbito institucional:\n\n`;
    }

    let responseText = `${contextIntro}**${matchedArticle.title}**\n\n`;
    responseText += `*   **¿Qué es?**: ${matchedArticle.whatIs}\n`;
    responseText += `*   **¿Por qué importa?**: ${matchedArticle.whyImportant}\n`;
    if (matchedArticle.howCalculated) {
      responseText += `*   **¿Cómo se calcula?**: \`${matchedArticle.howCalculated}\`\n`;
    }
    responseText += `*   **¿Qué decisiones puede tomar?**: ${matchedArticle.decisions}\n`;
    responseText += `*   **Buenas prácticas recomendadas**: ${matchedArticle.bestPractices}\n`;
    responseText += `*   **Caso Práctico**: *"${matchedArticle.caseStudy}"*\n`;
    if (matchedArticle.regulation) {
      responseText += `*   **Normatividad**: ${matchedArticle.regulation}\n`;
    }

    return {
      text: responseText,
      relatedArticles: matchedArticle.relatedArticleIds
    };
  }

  // Respuesta honesta en caso de no encontrarse coincidencia para evitar alucinaciones
  const noMatchText = `Estimado ${userRole}, como asesor experto en gestión educativa de AulaCore, le informo que **no he encontrado un registro validado** en nuestra base de conocimiento oficial sobre su consulta: *"${query}"*.\n\nPara garantizar la veracidad de la información, no tengo permitido formular respuestas no respaldadas por los manuales institucionales de la plataforma.\n\n¿Desea que formulemos un requerimiento formal al equipo de soporte de AulaCore o prefiere realizar otra consulta relacionada con Matrículas, Agenda Territorial o el Centro de Alertas (CAT)?`;

  return {
    text: noMatchText
  };
}
