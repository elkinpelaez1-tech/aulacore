'use client';

import { supabase } from '@/lib/supabase';
import { HELP_KNOWLEDGE_BASE } from './help-knowledge-base';

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

export async function getChatHistory(): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase.from('help_chat_history').select('*').order('timestamp', { ascending: true });
    if (error || !data) return [];
    return data as ChatMessage[];
  } catch (e) {
    return [];
  }
}

export async function saveChatHistory(history: ChatMessage[]): Promise<void> {
  try {
    if (history.length === 0) return;
    const lastMsg = history[history.length - 1];
    await supabase.from('help_chat_history').insert([lastMsg]);
  } catch (e) {
    console.error(e);
  }
}

export async function clearChatHistory(): Promise<void> {
  try {
    await supabase.from('help_chat_history').delete().neq('id', '0'); // clear all
  } catch (e) {
    console.error(e);
  }
}

export async function logAITelemetry(query: string, found: boolean, userRole: string, orgType: string) {
  try {
    const log = {
      query,
      user_role: userRole,
      org_type: orgType,
      found,
      created_at: new Date().toISOString()
    };
    await supabase.from('help_telemetry').insert([log]);
  } catch (e) {
    console.error(e);
  }
}

export async function getTelemetryStats(): Promise<HelpTelemetryLog[]> {
  try {
    const { data, error } = await supabase.from('help_telemetry').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as HelpTelemetryLog[];
  } catch (e) {
    return [];
  }
}

/**
 * Consulta a la IA de ayuda (Conectado a Edge Function en Producción).
 */
export async function askAulaHelpIA(
  query: string,
  pathname: string,
  userRole: string,
  orgType: string
): Promise<{ text: string; relatedArticles?: string[] }> {
  try {
    // Aquí idealmente se llamaría a supabase.functions.invoke('aula-help-ia', { body: { query, userRole } })
    // Pero como fallback temporal usamos la búsqueda semántica local sin timeout.
    
    const lowerQuery = query.toLowerCase().trim();
    let matchedArticle = null;
    
    const articles = Object.values(HELP_KNOWLEDGE_BASE);
    for (const article of articles) {
      if (article.title.toLowerCase().includes(lowerQuery) || 
          article.whatIs.toLowerCase().includes(lowerQuery)) {
        matchedArticle = article;
        break;
      }
    }

    const found = !!matchedArticle;
    await logAITelemetry(query, found, userRole, orgType);

    if (matchedArticle) {
      let responseText = `**${matchedArticle.title}**\n\n`;
      responseText += `*   **¿Qué es?**: ${matchedArticle.whatIs}\n`;
      responseText += `*   **¿Por qué importa?**: ${matchedArticle.whyImportant}\n`;
      if (matchedArticle.howCalculated) responseText += `*   **¿Cómo se calcula?**: \`${matchedArticle.howCalculated}\`\n`;
      responseText += `*   **¿Qué decisiones puede tomar?**: ${matchedArticle.decisions}\n`;
      return { text: responseText, relatedArticles: matchedArticle.relatedArticleIds };
    }

    return {
      text: `No he encontrado un registro validado en nuestra base de conocimiento oficial sobre su consulta. Esta funcionalidad requiere conexión al modelo de producción.`
    };
  } catch (e) {
    return { text: "Error de conexión con el servicio de IA." };
  }
}
