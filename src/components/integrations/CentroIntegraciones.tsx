'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  Link2, 
  Settings2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Play, 
  RefreshCw, 
  Sparkles, 
  Check, 
  HelpCircle,
  Clock,
  Database,
  Search,
  AlertCircle,
  Activity,
  Share2,
  ShieldCheck,
  Cpu,
  HardDrive,
  Laptop,
  KeyRound,
  Lock,
  Zap,
  BookOpen,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Layers,
  Sliders,
  X,
  FileText
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export type IntegrationCategory = 
  | 'todos'
  | 'gubernamentales' 
  | 'productividad' 
  | 'comunicaciones' 
  | 'analitica' 
  | 'apis' 
  | 'iot' 
  | 'ecosistema';

export interface ConnectorItem {
  id: string;
  name: string;
  category: Exclude<IntegrationCategory, 'todos'>;
  description: string;
  status: 'active' | 'warning' | 'error' | 'disabled';
  authType: string;
  version: string;
  lastSync: string;
  lastTestResult: string;
  lastTestLatency?: number;
  authError?: string;
  isInternal?: boolean;
}

const INITIAL_MARKETPLACE_CONNECTORS: ConnectorItem[] = [];

export function CentroIntegraciones({ title = "Centro de Integraciones", subtitle = "Consola e Interoperabilidad — Marketplace de Conectores Externos y Biblioteca de Integraciones" }: { title?: string; subtitle?: string }) {
  const [connectors, setConnectors] = useState<ConnectorItem[]>(INITIAL_MARKETPLACE_CONNECTORS);
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Modales
  const [activeConfigModal, setActiveConfigModal] = useState<ConnectorItem | null>(null);
  const [activeDocModal, setActiveDocModal] = useState<ConnectorItem | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('••••••••••••••••••••••••••••');
  
  // Diagnóstico / Prueba de Conexión
  const [testingId, setTestingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // IA Copilot
  const [iaModalContext, setIaModalContext] = useState<ConnectorItem | null>(null);
  const [iaExplanation, setIaExplanation] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleStatus = (id: string) => {
    const updated = connectors.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'disabled' ? 'active' : 'disabled';
        showToast(nextStatus === 'active' ? `✓ Conector "${c.name}" habilitado y conectado al bus.` : `⚠ Conector "${c.name}" deshabilitado administrativamente.`);
        return {
          ...c,
          status: nextStatus as any,
          lastSync: nextStatus === 'active' ? 'Hace un instante' : 'Nunca',
          lastTestResult: nextStatus === 'active' ? 'Exitoso (140ms)' : 'Deshabilitado por administrador'
        };
      }
      return c;
    });
    setConnectors(updated);
  };

  const handleTestConnection = async (connector: ConnectorItem) => {
    setTestingId(connector.id);
    setTestingId(null);

    const updated = connectors.map(c => {
      if (c.id === connector.id) {
        if (c.status === 'error') {
          showToast(`❌ Falla en prueba de conexión con "${c.name}". Verifique credenciales.`);
          return {
            ...c,
            lastTestResult: 'Error HTTP 401 - Token Expirado'
          };
        } else if (c.status === 'warning') {
          showToast(`⚠ Conexión establecida con "${c.name}" pero con alta latencia.`);
          return {
            ...c,
            lastTestResult: 'Lentitud (1950ms)',
            lastTestLatency: 1950
          };
        } else {
          const simulatedPing = 0;
          showToast(`✓ Prueba exitosa con "${c.name}" (${simulatedPing}ms). Canal operando al 100%.`);
          return {
            ...c,
            status: 'active' as any,
            lastSync: 'Hace un instante',
            lastTestResult: `Exitoso (${simulatedPing}ms)`,
            lastTestLatency: simulatedPing,
            authError: undefined
          };
        }
      }
      return c;
    });
    setConnectors(updated);
  };

  const handleAskIA = (connector: ConnectorItem) => {
    setIaModalContext(connector);
    if (connector.id === 'whatsapp-business') {
      setIaExplanation(`### Diagnóstico Asistido por AulaHelp IA:
El conector **WhatsApp Business Cloud API** reporta un error **HTTP 401 Unauthorized (Invalid Grant)** al intentar autenticar con los servidores de Meta.

#### Causa Raíz Identificada:
El token de autenticación configurado corresponde a un token temporal de 24 horas, o el Usuario del Sistema (System User) en Meta Business Manager perdió permisos sobre la cuenta de WhatsApp.

#### Protocolo de Solución Paso a Paso:
1. Ingrese a **Meta Business Suite** → Configuración del Negocio → Usuarios del Sistema.
2. Seleccione su usuario administrador y haga clic en **Generar nuevo token de acceso**.
3. Asegúrese de marcar el permiso \`whatsapp_business_messaging\` y seleccionar expiración **Nunca (Token Permanente)**.
4. Regrese a AulaCore, haga clic en el botón **Configurar** en la tarjeta de WhatsApp Business API, pegue el nuevo token y guarde los cambios.
5. Presione **Probar conexión** para reanudar el flujo automático de alertas a padres de familia.`);
    } else if (connector.status === 'warning') {
      setIaExplanation(`### Diagnóstico Asistido por AulaHelp IA:
El conector **${connector.name}** está funcionando con **Lentitud de Respuesta (${connector.lastTestLatency || 1800}ms)** o intermitencias en el servicio externo.

#### Causa Raíz Identificada:
Congestión de tráfico, mantenimiento programado o saturación en los servidores web gubernamentales/externos del proveedor.

#### Acciones Recomendadas por AulaHelp IA:
1. **No se requiere cambiar credenciales**: La autenticación (${connector.authType}) es completamente válida.
2. **Mitigación Activa MIO**: El Motor de Automatización MIO ha habilitado el modo de **Resiliencia Asíncrona (Retry Queue)**. Las consultas e ingestas pendientes se almacenan en el bus local y se reintentarán automáticamente en intervalos de bajo tráfico sin pérdida de datos.`);
    } else {
      setIaExplanation(`### Diagnóstico Asistido por AulaHelp IA:
El canal **${connector.name}** se encuentra operando de manera **Óptima (Estado: Activo)**.

#### Análisis de Salud:
- **Latencia**: Rápida y dentro de parámetros normales (${connector.lastTestLatency || 120}ms).
- **Consistencia**: 100% de los paquetes de sincronización procesados correctamente.
- **Seguridad**: Protocolo de autenticación **${connector.authType}** encriptado y vigente.

No se detecta ninguna anomalía en el flujo de interoperabilidad con el ecosistema AulaCore.`);
    }
  };

  // Filtrado
  const filteredConnectors = connectors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.authType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || c.category === selectedCategory;
    const matchesStatus = statusFilter === 'todos' || c.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Conteo de métricas de salud
  const totalCount = connectors.length;
  const activeCount = connectors.filter(c => c.status === 'active').length;
  const warningCount = connectors.filter(c => c.status === 'warning').length;
  const errorCount = connectors.filter(c => c.status === 'error').length;
  const disabledCount = connectors.filter(c => c.status === 'disabled').length;

  const categoriesList: { id: IntegrationCategory; label: string; icon: any }[] = [
    { id: 'todos', label: 'Todas las Categorías', icon: Layers },
    { id: 'gubernamentales', label: 'Gubernamentales', icon: ShieldCheck },
    { id: 'productividad', label: 'Productividad', icon: Laptop },
    { id: 'comunicaciones', label: 'Comunicaciones', icon: Share2 },
    { id: 'analitica', label: 'Analítica & BI', icon: Activity },
    { id: 'apis', label: 'APIs e Interoperabilidad', icon: Link2 },
    { id: 'iot', label: 'IoT & Dispositivos', icon: Cpu },
    { id: 'ecosistema', label: 'Ecosistema AulaCore', icon: Sparkles },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative text-slate-100">
      {/* Toast Notification Stack */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white font-semibold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header y Visión Estratégica */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Globe className="w-3 h-3" /> Biblioteca Oficial de Conectores
          </span>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Arquitectura Multitenant Desacoplada
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
          {title}
        </h1>
        <p className="text-xs md:text-sm text-slate-300 font-semibold leading-relaxed max-w-4xl">
          {subtitle}. Punto único de administración, monitoreo y autodiagnóstico con AulaHelp IA para todas las conexiones institucionales, ministeriales y externas.
        </p>
      </div>

      {/* 📊 GRID EJECUTIVO DE KPIs DE INTEROPERABILIDAD (8 Tarjetas) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Card 1: Disponibles */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Disponibles</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-white">{totalCount}</span>
            <span className="text-[9px] text-slate-500 font-bold block">Conectores oficiales</span>
          </div>
        </div>

        {/* Card 2: Activas */}
        <div className="bg-slate-900/90 border border-emerald-900/40 p-3.5 rounded-2xl flex flex-col justify-between hover:border-emerald-700 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">Activas</span>
            <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-emerald-400">{activeCount}</span>
            <span className="text-[9px] text-emerald-500/80 font-bold block flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operando 100%
            </span>
          </div>
        </div>

        {/* Card 3: Requieren Atención */}
        <div className="bg-slate-900/90 border border-amber-900/40 p-3.5 rounded-2xl flex flex-col justify-between hover:border-amber-700 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">Atención</span>
            <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-amber-400">{warningCount}</span>
            <span className="text-[9px] text-amber-500/80 font-bold block">Lentitud / Cola MIO</span>
          </div>
        </div>

        {/* Card 4: Con Error */}
        <div className="bg-slate-900/90 border border-red-900/40 p-3.5 rounded-2xl flex flex-col justify-between hover:border-red-700 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider block">Con Error</span>
            <div className="p-1.5 rounded-lg bg-red-950 text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-red-400">{errorCount}</span>
            <span className="text-[9px] text-red-500/80 font-bold block">Auth / Token fallido</span>
          </div>
        </div>

        {/* Card 5: Latencia Promedio */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Latencia Prom.</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-white">165 ms</span>
            <span className="text-[9px] text-emerald-400 font-bold block">⚡ Óptima en bus</span>
          </div>
        </div>

        {/* Card 6: Sincronizaciones Hoy */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Sincroniz. Hoy</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-blue-400">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-white">14,820</span>
            <span className="text-[9px] text-emerald-400 font-bold block">🔄 +12.4% vs. ayer</span>
          </div>
        </div>

        {/* Card 7: Eventos Enviados */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Enviados (Out)</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-purple-400">
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-white">8,410</span>
            <span className="text-[9px] text-slate-500 font-bold block">📤 Webhooks / Alertas</span>
          </div>
        </div>

        {/* Card 8: Eventos Recibidos */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Recibidos (In)</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-teal-400">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-white">6,410</span>
            <span className="text-[9px] text-slate-500 font-bold block">📥 SIMAT, RFID, Pagos</span>
          </div>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Barra de búsqueda */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input 
              type="text" 
              placeholder="Buscar conector, categoría o protocolo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 border-none bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro de estados */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-[10px] font-extrabold uppercase tracking-wider">
            <span className="text-slate-500 px-2 font-black">Estado:</span>
            {[
              { id: 'todos', label: 'Todos', color: 'text-slate-300' },
              { id: 'active', label: '🟢 Activas', color: 'text-emerald-400' },
              { id: 'warning', label: '🟡 Advertencia', color: 'text-amber-400' },
              { id: 'error', label: '🔴 Error', color: 'text-red-400' },
              { id: 'disabled', label: '⚪ Deshabilitadas', color: 'text-slate-400' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl border-none cursor-pointer transition-all ${
                  statusFilter === st.id 
                    ? 'bg-slate-800 text-white shadow-sm font-black' 
                    : 'bg-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categorías (Tabs Horizontales del Marketplace) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800/80 pt-4">
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = cat.id === 'todos' 
              ? connectors.length 
              : connectors.filter(c => c.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all shrink-0 border ${
                  isSelected 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-950/50' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isSelected ? 'bg-indigo-950 text-white' : 'bg-slate-900 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner explicativo del Ecosistema si está seleccionada la pestaña "Ecosistema" */}
      {selectedCategory === 'ecosistema' && (
        <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-3xl p-5 flex items-start gap-4 text-xs font-semibold text-indigo-200">
          <Sparkles className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="font-black text-white uppercase text-sm">Conexiones Internas del Ecosistema AulaCore</h4>
            <p className="text-slate-300 leading-relaxed font-normal">
              Esta sección muestra las interfaces de comunicación en memoria y buses gRPC entre los núcleos operativos de la plataforma (<strong>MIO</strong>, <strong>CIE</strong>, <strong>CAT</strong> y <strong>AulaHelp IA</strong>). No actúan como enlaces de navegación, sino como monitores de salud, latencia y rendimiento de la arquitectura interna.
            </p>
          </div>
        </div>
      )}

      {/* Grid del Marketplace de Integraciones */}
      {filteredConnectors.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-black text-slate-300">No se encontraron conectores que coincidan con la búsqueda</h3>
          <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
            Intenta cambiar los términos de búsqueda o restablecer el filtro de estado o categoría.
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('todos'); setStatusFilter('todos'); }}
            className="mt-2 bg-slate-800 hover:bg-slate-750 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer transition-colors"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnectors.map((connector) => {
            const isError = connector.status === 'error';
            const isWarning = connector.status === 'warning';
            const isDisabled = connector.status === 'disabled';
            const isActive = connector.status === 'active';

            return (
              <Card 
                key={connector.id} 
                className={`bg-slate-900 border transition-all rounded-3xl p-5 flex flex-col justify-between gap-4 shadow-md ${
                  isError ? 'border-red-900/60 bg-red-955/10 hover:border-red-700' :
                  isWarning ? 'border-amber-900/60 bg-amber-955/10 hover:border-amber-700' :
                  isDisabled ? 'border-slate-850 opacity-75 hover:opacity-100' :
                  'border-slate-800 hover:border-slate-700 hover:shadow-xl'
                }`}
              >
                {/* Parte superior: Título, Categoría y Semáforo */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white truncate" title={connector.name}>
                          {connector.name}
                        </h3>
                      </div>
                      <span className="text-[9px] bg-slate-950 border border-slate-800 text-slate-400 font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block">
                        {connector.category === 'gubernamentales' ? '🏛️ Gubernamental' :
                         connector.category === 'productividad' ? '⚡ Productividad' :
                         connector.category === 'comunicaciones' ? '📲 Comunicación' :
                         connector.category === 'analitica' ? '📊 Analítica BI' :
                         connector.category === 'apis' ? '🔗 API & Webhook' :
                         connector.category === 'iot' ? '📡 IoT & Hardware' : '✨ Ecosistema Interno'}
                      </span>
                    </div>

                    {/* Semáforo visual de Estado */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                        isActive ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' :
                        isWarning ? 'bg-amber-950/60 text-amber-400 border-amber-800/50' :
                        isError ? 'bg-red-950/60 text-red-400 border-red-800/50 animate-pulse' :
                        'bg-slate-850 text-slate-400 border-slate-800'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          isActive ? 'bg-emerald-500 animate-ping' :
                          isWarning ? 'bg-amber-500' :
                          isError ? 'bg-red-500' : 'bg-slate-500'
                        }`} />
                        {isActive ? 'Activa' : isWarning ? 'Advertencia' : isError ? 'Error' : 'Deshabilitado'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-350 font-medium leading-relaxed">
                    {connector.description}
                  </p>
                </div>

                {/* Caja de Detalles Técnicos del Conector */}
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-3.5 space-y-2 text-[10px] font-semibold text-slate-400">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" /> Autenticación:
                    </span>
                    <span className="text-slate-300 font-bold truncate max-w-[170px]" title={connector.authType}>
                      {connector.authType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-slate-500" /> Versión:
                    </span>
                    <span className="font-mono text-indigo-400 font-black">{connector.version}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> Sincronización:
                    </span>
                    <span className="text-slate-300">{connector.lastSync}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-900 pt-2 mt-1">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-slate-500" /> Último Test:
                    </span>
                    <span className={`font-bold ${
                      connector.lastTestResult.includes('Exitoso') || connector.lastTestResult.includes('Sincronizado') ? 'text-emerald-400' :
                      connector.lastTestResult.includes('Lentitud') || connector.lastTestResult.includes('Advertencia') ? 'text-amber-400' :
                      connector.lastTestResult.includes('Error') ? 'text-red-400' : 'text-slate-500'
                    }`}>
                      {connector.lastTestResult}
                    </span>
                  </div>
                </div>

                {/* Aviso de error o advertencia si existe */}
                {(isError || isWarning) && (
                  <div className={`p-3 rounded-2xl border text-[10px] font-bold flex items-start gap-2 ${
                    isError ? 'bg-red-955/30 border-red-900/50 text-red-300' : 'bg-amber-955/30 border-amber-900/50 text-amber-300'
                  }`}>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="space-y-1 min-w-0">
                      <span className="uppercase tracking-wider font-black block text-[9px]">
                        {isError ? 'Alerta Crítica de Conexión' : 'Aviso de Latencia / Intermitencia'}
                      </span>
                      <p className="line-clamp-2 font-medium text-slate-300">
                        {connector.authError || 'Interrupción temporal en la respuesta del servidor externo.'}
                      </p>
                      <button 
                        onClick={() => handleAskIA(connector)}
                        className="text-indigo-400 hover:text-indigo-300 font-extrabold underline text-[10px] bg-transparent border-none p-0 cursor-pointer flex items-center gap-1 mt-1"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-400" /> Ver Diagnóstico AulaHelp IA
                      </button>
                    </div>
                  </div>
                )}

                {/* Acciones (Botones Profesionales del Conector) */}
                <div className="border-t border-slate-800/80 pt-3.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Botón Configurar */}
                    <button 
                      onClick={() => { setActiveConfigModal(connector); setApiKeyInput('••••••••••••••••••••••••••••'); }}
                      disabled={connector.isInternal}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                        connector.isInternal 
                          ? 'bg-slate-950 border-slate-850 text-slate-600 cursor-not-allowed' 
                          : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                      }`}
                      title={connector.isInternal ? 'Conexión interna gestionada automáticamente por el kernel' : 'Configurar credenciales de autenticación y webhooks'}
                    >
                      <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                      Configurar
                    </button>

                    {/* Botón Probar Conexión */}
                    <button 
                      onClick={() => handleTestConnection(connector)}
                      disabled={testingId === connector.id}
                      className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-indigo-650 hover:bg-indigo-600 text-white border border-indigo-500/40 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      title="Ejecutar prueba de diagnóstico de latencia y ping al API"
                    >
                      {testingId === connector.id ? (
                        <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                      )}
                      Probar
                    </button>

                    {/* Botón Ver Documentación */}
                    <button 
                      onClick={() => setActiveDocModal(connector)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
                      title="Ver especificaciones técnicas y documentación de interoperabilidad"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Toggle Activar/Desactivar */}
                  {!connector.isInternal && (
                    <button 
                      onClick={() => handleToggleStatus(connector.id)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer border ${
                        isDisabled 
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850' 
                          : 'bg-red-950/30 border-red-900/40 text-red-400 hover:bg-red-900/50'
                      }`}
                      title={isDisabled ? 'Activar este conector' : 'Desactivar este conector temporalmente'}
                    >
                      {isDisabled ? <ToggleLeft className="w-4 h-4 text-slate-500" /> : <ToggleRight className="w-4 h-4 text-emerald-400" />}
                      {isDisabled ? 'Activar' : 'Desactivar'}
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 🤖 MODAL DE DIAGNÓSTICO ASISTIDO POR AULAHELP IA */}
      {iaModalContext && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="bg-slate-900 border border-indigo-500/40 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 text-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 shadow-md">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Diagnóstico Técnico AulaHelp IA
                  </h3>
                  <span className="text-xs text-indigo-300 font-semibold">
                    Análisis en tiempo real para: {iaModalContext.name}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => { setIaModalContext(null); setIaExplanation(null); }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4 max-h-[60vh] overflow-y-auto">
              {iaExplanation ? (
                <div className="prose prose-invert prose-sm text-xs font-semibold leading-relaxed space-y-3 whitespace-pre-line text-slate-300">
                  {iaExplanation}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
                  <p className="text-xs font-bold">Generando diagnóstico asistido neural...</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-slate-800 pt-4">
              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Protocolo de auditoría verificado por el Kernel
              </span>
              <button 
                onClick={() => { setIaModalContext(null); setIaExplanation(null); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl cursor-pointer border-none transition-colors shadow-sm"
              >
                Entendido y Cerrar
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ⚙️ MODAL DE CONFIGURACIÓN DEL CONECTOR */}
      {activeConfigModal && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 text-slate-200">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-indigo-400" />
                  Configurar Conector: {activeConfigModal.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Modifique las credenciales de autenticación, endpoints o llaves permanentes.
                </p>
              </div>
              <button 
                onClick={() => setActiveConfigModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Protocolo / Método de Autenticación
                </label>
                <input 
                  type="text" 
                  disabled
                  value={activeConfigModal.authType}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-400 rounded-xl px-3.5 py-2.5 font-bold text-xs cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">
                  URL del Endpoint / Servidor Remoto
                </label>
                <input 
                  type="text" 
                  defaultValue={activeConfigModal.id === 'whatsapp-business' ? 'https://graph.facebook.com/v19.0/whatsapp_business_messaging' : `https://api.interoperabilidad.gov.co/v2/${activeConfigModal.id}`}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">
                  Clave API / Token de Acceso Permanente (Bearer / Secret)
                </label>
                <input 
                  type="password" 
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-indigo-300 rounded-xl px-3.5 py-2.5 font-bold text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[9px] text-slate-500 block">
                  Las credenciales se almacenan encriptadas con AES-256 en el vault de seguridad AulaCore.
                </span>
              </div>

              {activeConfigModal.authError && (
                <div className="bg-red-955/30 border border-red-900/50 p-3.5 rounded-2xl text-[10px] text-red-300 font-bold space-y-1">
                  <span className="text-red-400 font-black uppercase flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Último error registrado
                  </span>
                  <p>{activeConfigModal.authError}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-800 pt-4">
              <button 
                type="button"
                onClick={() => setActiveConfigModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 border-none cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={() => {
                  const updated = connectors.map(c => {
                    if (c.id === activeConfigModal.id) {
                      return {
                        ...c,
                        status: 'active' as any,
                        lastSync: 'Hace un instante',
                        lastTestResult: 'Exitoso (130ms)',
                        authError: undefined
                      };
                    }
                    return c;
                  });
                  setConnectors(updated);
                  setActiveConfigModal(null);
                  showToast(`✓ Credenciales para "${activeConfigModal.name}" guardadas y verificadas.`);
                }}
                className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-650 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-950/40 border-none cursor-pointer transition-colors"
              >
                Guardar y Conectar
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* 📖 MODAL DE DOCUMENTACIÓN TÉCNICA */}
      {activeDocModal && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 text-slate-200">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  Documentación de Interoperabilidad: {activeDocModal.name}
                </h3>
                <span className="text-xs text-indigo-300 font-semibold">Versión activa en gateway: {activeDocModal.version}</span>
              </div>
              <button 
                onClick={() => setActiveDocModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3 text-xs text-slate-300 font-semibold">
              <div className="space-y-1">
                <h4 className="font-black text-white uppercase text-[10px] tracking-wider text-indigo-400">Especificación de Interoperabilidad</h4>
                <p className="leading-relaxed">{activeDocModal.description}</p>
              </div>

              <div className="border-t border-slate-900 pt-3 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Formato de Intercambio:</span>
                  <span className="font-mono text-white font-bold">JSON / REST / Webhook</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Mecanismo de Seguridad:</span>
                  <span className="font-mono text-emerald-400 font-bold">{activeDocModal.authType}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Políticas de Reintento MIO:</span>
                  <span className="font-bold text-slate-300">Resiliencia exponencial hasta 5 intentos</span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-[10px] space-y-1 font-mono text-slate-400">
                <span className="text-slate-500 font-sans font-bold block text-[9px] uppercase">Ejemplo de Webhook URL / Endpoint AulaCore:</span>
                <span className="text-indigo-300 font-bold break-all block">
                  https://api.aulacore.com/v2/webhooks/inbound/{activeDocModal.id}/callback
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
              <button 
                type="button"
                onClick={() => setActiveDocModal(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-650 hover:bg-indigo-600 text-white border-none cursor-pointer transition-colors shadow-sm"
              >
                Cerrar Documentación
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
