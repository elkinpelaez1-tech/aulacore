'use client';

import React, { useState, useEffect } from 'react';
import { 
  Share2, Radio, Shield, Users, Search, Plus, X, 
  ChevronRight, RefreshCw, AlertTriangle, CheckCircle, 
  MapPin, Clock, Calendar, Check, Info, ShieldAlert,
  Smartphone, Eye, Power, Lock, KeyRound, Globe, Link2, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

// TYPES & INTERFACES
interface SyncLog {
  timestamp: string;
  message: string;
  type: 'success' | 'warning' | 'error';
}

interface B2BConnector {
  id: string;
  name: string;
  category: 'Académico' | 'Financiero' | 'Comunicación' | 'Infraestructura / IA';
  status: 'Conectado' | 'Pendiente' | 'Error' | 'Deshabilitado';
  logo: string;
  description: string;
  apiKeyMasked: string;
  lastSyncTime: string;
  permissions: string[];
  affectedModules: string[];
  recentLogs: SyncLog[];
}

// INITIAL HIGH FIDELITY SEED DATA
const SEED_B2B_CONNECTORS: B2BConnector[] = [
  {
    id: 'conn-1',
    name: 'Google Workspace for Education',
    category: 'Académico',
    status: 'Conectado',
    logo: '🌐',
    description: 'Sincroniza correos institucionales, Google Calendar, Classroom y almacenamiento compartido.',
    apiKeyMasked: 'oauth_client_id_••••••••8891.apps.googleusercontent.com',
    lastSyncTime: 'Hace 10 minutos',
    permissions: [
      'Lectura de perfiles de alumnos y docentes',
      'Acceso de escritura a calendarios académicos',
      'Gestión de Classroom & tareas integradas'
    ],
    affectedModules: ['Onboarding Docentes', 'Matrícula Digital', 'Roles & Permisos'],
    recentLogs: [
      { timestamp: 'Hoy, 04:30 PM', message: 'Sincronización de 45 cuentas docentes completada.', type: 'success' },
      { timestamp: 'Hoy, 08:15 AM', message: 'Calendario de periodos de evaluación publicado en Drive.', type: 'success' }
    ]
  },
  {
    id: 'conn-2',
    name: 'Stripe Gateway Payments',
    category: 'Financiero',
    status: 'Conectado',
    logo: '💳',
    description: 'Procesamiento de pagos electrónicos para pensiones escolares, matrículas ordinarias y comedor.',
    apiKeyMasked: 'sk_live_••••••••9084',
    lastSyncTime: 'Hace 5 minutos',
    permissions: [
      'Crear cargos y cobros directos de matrículas',
      'Acceso de lectura a reportes de transacciones',
      'Gestión de Webhooks de facturación recurrente'
    ],
    affectedModules: ['Matrícula Digital Wizard', 'Datos Institucionales'],
    recentLogs: [
      { timestamp: 'Hoy, 04:45 PM', message: 'Pago de matrícula ordinaria recibido para Est. Juan Pablo Montoya.', type: 'success' },
      { timestamp: 'Ayer, 11:30 PM', message: 'Depósito de fondos conciliado exitosamente.', type: 'success' }
    ]
  },
  {
    id: 'conn-3',
    name: 'SIMAT Nacional (MinEducación)',
    category: 'Académico',
    status: 'Pendiente',
    logo: '🇨🇴',
    description: 'Sincronización oficial de registros de matrículas de alumnos con el Ministerio de Educación Nacional.',
    apiKeyMasked: 'dane_gov_token_••••••••0423',
    lastSyncTime: 'Hace 3 días',
    permissions: [
      'Lectura de la base nacional de alumnos',
      'Escritura de novedades de retiro y traslado',
      'Validación de folios de matrícula oficial'
    ],
    affectedModules: ['Matrícula Digital Wizard', 'Campus Operations Center'],
    recentLogs: [
      { timestamp: 'Hace 3 días, 09:20 AM', message: 'Enlace manual iniciado. Esperando token de seguridad DANE.', type: 'warning' }
    ]
  },
  {
    id: 'conn-4',
    name: 'OpenAI GPT-4 Core API',
    category: 'Infraestructura / IA',
    status: 'Conectado',
    logo: '🤖',
    description: 'Motor neural para el optimizador inteligente de carga horaria docente y alertas tempranas de deserción.',
    apiKeyMasked: 'sk-proj-••••••••xY82',
    lastSyncTime: 'Hace 1 hora',
    permissions: [
      'Consumo de API de chat y embeddings de perfiles',
      'Análisis semántico en auditorías forenses',
      'Evaluador de consistencia horaria docente'
    ],
    affectedModules: ['Centro Predictivo Institucional', 'Onboarding Docentes'],
    recentLogs: [
      { timestamp: 'Hoy, 03:00 PM', message: 'Evaluación exitosa de 8 mallas curriculares. 0 conflictos detectados.', type: 'success' },
      { timestamp: 'Ayer, 04:15 PM', message: 'Análisis de deserción de estudiantes completado.', type: 'success' }
    ]
  },
  {
    id: 'conn-5',
    name: 'WhatsApp Business API',
    category: 'Comunicación',
    status: 'Error',
    logo: '💬',
    description: 'Envío de notificaciones inmediatas por inasistencia detectada en portería RFID, alertas e informativos.',
    apiKeyMasked: 'wa_biz_token_••••••••9023',
    lastSyncTime: 'Hace 2 horas',
    permissions: [
      'Envío de plantillas interactivas aprobadas por Meta',
      'Lectura de respuestas entrantes de acudientes',
      'Sincronización de logs de envíos'
    ],
    affectedModules: ['Datos Institucionales', 'Campus Operations Center'],
    recentLogs: [
      { timestamp: 'Hoy, 02:30 PM', message: 'Error de autenticación. Token de acceso expiró o fue revocado por Meta.', type: 'error' },
      { timestamp: 'Ayer, 07:15 AM', message: 'Suscripción de webhook devuelta con código 401.', type: 'error' }
    ]
  },
  {
    id: 'conn-6',
    name: 'Microsoft 365 / Teams Education',
    category: 'Académico',
    status: 'Deshabilitado',
    logo: '💻',
    description: 'Integración colaborativa con Outlook, Teams para aulas híbridas, OneDrive y Azure Active Directory.',
    apiKeyMasked: 'ms_tenant_id_••••••••2911',
    lastSyncTime: 'Hace 2 semanas',
    permissions: [
      'Lectura de identidades escolares Active Directory',
      'Creación automática de canales de Teams'
    ],
    affectedModules: ['Cursos Intelligence Center'],
    recentLogs: [
      { timestamp: 'Hace 2 semanas', message: 'Módulo deshabilitado manualmente por el Rector.', type: 'warning' }
    ]
  }
];

export default function B2BIntegrationsPage() {
  const [connectors, setConnectors] = useState<B2BConnector[]>(SEED_B2B_CONNECTORS);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);

  // New Connection modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<B2BConnector['category']>('Académico');
  const [newLogo, setNewLogo] = useState('🌐');
  const [newDesc, setNewDesc] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [newPerms, setNewPerms] = useState('');
  const [newModules, setNewModules] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load from local storage
  useEffect(() => {
    const raw = localStorage.getItem('aulacore-integraciones-settings');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.length > 0) setConnectors(parsed);
      } catch (e) {
        console.error('Error loading B2B settings', e);
      }
    }
  }, []);

  const saveConnectors = (updatedList: B2BConnector[]) => {
    setConnectors(updatedList);
    localStorage.setItem('aulacore-integraciones-settings', JSON.stringify(updatedList));
  };

  // Switch status inside Drawer
  const handleChangeStatus = (id: string, nextStatus: B2BConnector['status']) => {
    const updated = connectors.map(c => {
      if (c.id === id) {
        const logMsg = nextStatus === 'Deshabilitado' 
          ? 'Conector deshabilitado administrativamente por la Rectoría.'
          : 'Conexión re-establecida y canal de webhooks reactivado.';
        const newLog: SyncLog = {
          timestamp: 'Hace unos instantes',
          message: logMsg,
          type: nextStatus === 'Deshabilitado' ? 'warning' : 'success'
        };
        return {
          ...c,
          status: nextStatus,
          recentLogs: [newLog, ...c.recentLogs.slice(0, 3)]
        };
      }
      return c;
    });
    saveConnectors(updated);
    triggerToast(`✓ Conector actualizado a estado: ${nextStatus}`);
  };

  // Manual trigger sync with spinner
  const handleForceSync = (connectorId: string, name: string) => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const updated = connectors.map(c => {
        if (c.id === connectorId) {
          const newLog: SyncLog = {
            timestamp: 'Hoy, Hace unos instantes',
            message: 'Sincronización manual forzada. 0 anomalías de consistencia.',
            type: 'success'
          };
          return {
            ...c,
            lastSyncTime: 'Hace unos instantes',
            recentLogs: [newLog, ...c.recentLogs.slice(0, 3)]
          };
        }
        return c;
      });
      saveConnectors(updated);
      triggerToast(`✓ Sincronización con ${name} completada con éxito.`);
    }, 1200);
  };

  // Register a new integration connection
  const handleConnectIntegration = () => {
    if (!newName || !newApiKey) {
      triggerToast('⚠️ Completa el nombre del conector y el token de acceso API.');
      return;
    }

    const logos: Record<B2BConnector['category'], string> = {
      'Académico': '🏫',
      'Financiero': '💰',
      'Comunicación': '📲',
      'Infraestructura / IA': '🤖'
    };

    const permList = newPerms 
      ? newPerms.split('\n').filter(p => p.trim() !== '') 
      : ['Lectura y escritura básica de perfiles'];
    
    const modList = newModules 
      ? newModules.split(',').map(m => m.trim()).filter(m => m !== '') 
      : ['Datos Institucionales'];

    const masked = newApiKey.length > 8 
      ? `${newApiKey.substring(0, 8)}••••••••${newApiKey.substring(newApiKey.length - 4)}`
      : '••••••••';

    const newC: B2BConnector = {
      id: 'conn-' + Date.now(),
      name: newName,
      category: newCategory,
      status: 'Conectado',
      logo: logos[newCategory] || '🌐',
      description: newDesc || 'Conexión integrada a sistemas externos corporativos.',
      apiKeyMasked: masked,
      lastSyncTime: 'Hace unos instantes',
      permissions: permList,
      affectedModules: modList,
      recentLogs: [
        { timestamp: 'Hace unos instantes', message: 'Conexión registrada con éxito. Credenciales enlazadas.', type: 'success' }
      ]
    };

    const updated = [newC, ...connectors];
    saveConnectors(updated);

    // reset forms
    setNewName('');
    setNewDesc('');
    setNewApiKey('');
    setNewPerms('');
    setNewModules('');
    setModalOpen(false);
    triggerToast(`✓ Conector ${newC.name} enlazado al ecosistema de AulaCore.`);
  };

  // Selected details
  const selectedConnector = connectors.find(c => c.id === selectedConnectorId) || null;

  // Filter Logic
  const filteredConnectors = connectors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'TODOS' || c.category.toUpperCase() === selectedCategory;
    
    const matchesStatus = selectedStatus === 'TODOS' || c.status.toUpperCase() === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/20 py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      
      {/* Toast Notification Stack */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
          <Link2 className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header (Clean & No Heavy KPIs) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-600" /> Ecosistema de Integraciones & APIs
          </h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wider mt-1 uppercase">Centro Inteligente de Conexiones B2B, Gobierno y Plataformas Académicas</p>
        </div>

        <div>
          <button 
            onClick={() => setModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Conectar Integración
          </button>
        </div>
      </div>

      {/* Search & Filter Category Chips */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input 
            type="text" 
            placeholder="Buscar por conector o servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-700"
          />
        </div>

        {/* Filters chips group */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Categories chips */}
          <div className="flex flex-wrap gap-1 bg-slate-50 border border-slate-150 rounded-xl p-1">
            {['TODOS', 'ACADÉMICO', 'FINANCIERO', 'COMUNICACIÓN', 'INFRAESTRUCTURA / IA'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  selectedCategory === cat 
                    ? "bg-white text-indigo-700 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {cat === 'TODOS' ? 'Categorías' : cat.replace('INFRAESTRUCTURA / ', '')}
              </button>
            ))}
          </div>

          {/* Status chips */}
          <div className="flex flex-wrap gap-1 bg-slate-50 border border-slate-150 rounded-xl p-1">
            {['TODOS', 'CONECTADO', 'PENDIENTE', 'ERROR', 'DESHABILITADO'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  selectedStatus === status 
                    ? "bg-white text-indigo-700 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {status === 'TODOS' ? 'Estados' : status}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* INTEGRATIONS GRID (App Store layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConnectors.map(conn => {
          const isConnected = conn.status === 'Conectado';
          const isPending = conn.status === 'Pendiente';
          const isError = conn.status === 'Error';

          return (
            <div 
              key={conn.id}
              onClick={() => {
                setSelectedConnectorId(conn.id);
                setDrawerOpen(true);
              }}
              className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 cursor-pointer relative overflow-hidden group"
            >
              
              {/* Card Top: Logo, Name, Category */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                    {conn.logo}
                  </div>
                  
                  {/* Premium Status badge */}
                  <span className={cn(
                    "text-[8.5px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border flex items-center gap-1.5",
                    isConnected ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                    isPending ? 'bg-amber-50 border-amber-100 text-amber-700' :
                    isError ? 'bg-rose-50 border-rose-100 text-rose-700' :
                    'bg-slate-100 border-slate-200 text-slate-655'
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      isConnected ? 'bg-emerald-500 animate-pulse' :
                      isPending ? 'bg-amber-500' :
                      isError ? 'bg-rose-500 animate-bounce' :
                      'bg-slate-400'
                    )} />
                    {conn.status}
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400">{conn.category}</span>
                  <h3 className="text-sm font-semibold text-slate-800 tracking-tight leading-snug group-hover:text-indigo-700 transition-colors">
                    {conn.name}
                  </h3>
                  <p className="text-[11px] text-slate-450 font-medium leading-relaxed line-clamp-2">
                    {conn.description}
                  </p>
                </div>
              </div>

              {/* Card Bottom details */}
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-350" />
                  <span>Sincronizado: <span className="font-semibold text-slate-650">{conn.lastSyncTime}</span></span>
                </span>

                <span className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 group-hover:translate-x-0.5 transition-all">
                  Configurar <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

            </div>
          );
        })}

        {filteredConnectors.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <Share2 className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-700">No se encontraron conectores</h3>
            <p className="text-xs text-slate-450 max-w-sm mx-auto font-medium">Ajusta los filtros o realiza otra búsqueda para localizar la integración de tu interés.</p>
          </div>
        )}
      </div>

      {/* Integration 360 Drawer ( sliding overlay ) */}
      {drawerOpen && selectedConnector && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Backdrop overlay */}
            <div 
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            />

            {/* Sliding Panel */}
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-2xl transform bg-slate-900 text-white border-l border-slate-800 shadow-2xl transition-all duration-300">
                
                <div className="flex h-full flex-col overflow-y-scroll py-6 px-6 space-y-6">
                  
                  {/* Drawer Header */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded font-mono">
                          CONNECTOR API
                        </span>
                        
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                          selectedConnector.status === 'Conectado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          selectedConnector.status === 'Pendiente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          selectedConnector.status === 'Error' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        )}>
                          {selectedConnector.status}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold text-slate-100 tracking-tight leading-tight pt-1">
                        Ajustes del Conector B2B
                      </h2>
                      <p className="text-xs text-slate-350 font-medium">
                        Administración de API key, permisos y webhooks.
                      </p>
                    </div>

                    <button 
                      onClick={() => setDrawerOpen(false)}
                      className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Identity Box */}
                  <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl shrink-0">
                      {selectedConnector.logo}
                    </div>
                    <div className="space-y-1 w-full">
                      <h3 className="text-base font-semibold text-slate-100">{selectedConnector.name}</h3>
                      <p className="text-xs text-slate-350 font-medium leading-relaxed">{selectedConnector.description}</p>
                    </div>
                  </div>

                  {/* Credentials / API configuration */}
                  <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 space-y-3.5 text-xs text-slate-300">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block border-b border-slate-800 pb-1.5">
                      Configuración de Enlace & Llaves
                    </span>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-slate-450 text-[9px] uppercase tracking-wider font-bold flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Token / Credenciales Enmascaradas</p>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between font-mono text-[10px]">
                          <span className="text-slate-300 truncate max-w-sm">{selectedConnector.apiKeyMasked}</span>
                          <KeyRound className="w-4 h-4 text-slate-500 shrink-0" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[11px] font-medium pt-2 border-t border-slate-850">
                        <div>
                          <p className="text-slate-450 text-[9px] uppercase tracking-wider font-bold">Último Ciclo de Sincronización</p>
                          <p className="text-slate-200 mt-0.5 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {selectedConnector.lastSyncTime}</p>
                        </div>
                        <div>
                          <p className="text-slate-450 text-[9px] uppercase tracking-wider font-bold">Tipo de Protocolo</p>
                          <p className="text-slate-200 mt-0.5 flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-slate-400" /> REST API / HTTPS Webhook</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conceded Permissions (Notion connection style) */}
                  <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block border-b border-slate-800 pb-1.5">
                      Permisos Concedidos en la Conexión
                    </span>

                    <ul className="space-y-2.5 text-xs font-semibold text-slate-300">
                      {selectedConnector.permissions.map((perm, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{perm}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Affected modules badges */}
                    <div className="pt-3 border-t border-slate-800/60 mt-3 space-y-1.5">
                      <p className="text-slate-450 text-[9px] uppercase tracking-wider font-bold">Módulos de AulaCore Vinculados</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedConnector.affectedModules.map(mod => (
                          <span key={mod} className="bg-slate-900 text-slate-350 border border-slate-800 text-[8.5px] font-bold px-2 py-0.5 rounded font-mono uppercase">{mod}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Operations buttons */}
                  <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block border-b border-slate-800 pb-1.5">
                      Controles del Conector B2B
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleChangeStatus(selectedConnector.id, 'Conectado')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors border",
                          selectedConnector.status === 'Conectado' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-450'
                        )}
                      >
                        Habilitar
                      </button>

                      <button
                        onClick={() => handleChangeStatus(selectedConnector.id, 'Deshabilitado')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors border",
                          selectedConnector.status === 'Deshabilitado' 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-450'
                        )}
                      >
                        Deshabilitar
                      </button>

                      <button
                        onClick={() => handleForceSync(selectedConnector.id, selectedConnector.name)}
                        disabled={isSyncing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ml-auto disabled:opacity-50"
                      >
                        <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                      </button>
                    </div>
                  </div>

                  {/* Sync Logs */}
                  <div className="space-y-4 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block">Historial de Sincronizaciones Recientes</span>
                    
                    <div className="relative border-l-2 border-slate-800 pl-4 ml-2.5 space-y-4">
                      {selectedConnector.recentLogs.map((log, index) => (
                        <div key={index} className="relative">
                          {/* Timeline dot */}
                          <div className={cn(
                            "absolute w-2.5 h-2.5 rounded-full -left-[21.5px] top-1 border border-slate-900",
                            log.type === 'success' ? 'bg-indigo-500' :
                            log.type === 'warning' ? 'bg-amber-500' :
                            'bg-rose-500'
                          )} />

                          <div className="flex justify-between items-start text-xs">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-200">{log.message}</p>
                              <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1"><Clock className="w-3 h-3" /> {log.timestamp}</p>
                            </div>
                            
                            <div className="text-right">
                              <span className={cn(
                                "text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                                log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                                log.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-rose-500/10 text-rose-400'
                              )}>
                                {log.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {selectedConnector.recentLogs.length === 0 && (
                        <p className="text-xs text-slate-500 italic pl-1">No se registran logs históricos de sincronización en AulaCore.</p>
                      )}
                    </div>
                  </div>

                  {/* Pre-architecture connectors placeholder */}
                  <div className="bg-slate-850 border border-slate-800/80 border-dashed rounded-2xl p-4.5 space-y-3 text-xs text-slate-400">
                    <span className="text-[9.5px] font-bold uppercase tracking-widest text-indigo-400 block border-b border-slate-800 pb-1.5">
                      Arquitectura Preparada de Protocolos Externos
                    </span>
                    <div className="flex flex-wrap gap-2 text-[8px] font-bold uppercase tracking-wider">
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Webhooks de Eventos</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">DIAN Factura Electrónica</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">REST API OAuth 2.0</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Sincronización SIMAT</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Microsoft Graph API</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Google Classroom Sync</span>
                    </div>
                  </div>

                  {/* Drawer Footer */}
                  <div className="border-t border-slate-800 pt-5 mt-auto flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[9px] uppercase tracking-widest font-semibold leading-none">
                      AulaCore Integrations Hub 2026
                    </span>
                    
                    <button
                      onClick={() => {
                        const updated = connectors.filter(c => c.id !== selectedConnector.id);
                        saveConnectors(updated);
                        setDrawerOpen(false);
                        triggerToast(`✓ Conector ${selectedConnector.name} removido de AulaCore.`);
                      }}
                      className="text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Remover Conexión
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Notion-style new connection modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            
            {/* Backdrop shadow */}
            <div 
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            />

            {/* Trick center block */}
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            {/* Modal Box */}
            <div className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle">
              
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-indigo-600" /> Registrar Nuevo Conector
                  </h3>
                  <button 
                    onClick={() => setModalOpen(false)}
                    className="text-slate-450 hover:text-slate-655 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Nombre de la Integración</label>
                    <input 
                      type="text" 
                      placeholder="Ej. PayU Pagos Regionales"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-750"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Categoría Operativa</label>
                      <select 
                        value={newCategory} 
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-650 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        <option value="Académico">🎒 Académico / LMS</option>
                        <option value="Financiero">💳 Financiero / Cobros</option>
                        <option value="Comunicación">📲 Comunicación / Meta</option>
                        <option value="Infraestructura / IA">🤖 Infraestructura & IA</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">API Key / Token de Acceso</label>
                      <input 
                        type="text" 
                        placeholder="Ej. sk_live_2026..."
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono text-[10px] text-slate-750"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Descripción de la Integración</label>
                    <textarea 
                      placeholder="Ej. Enlaza los cobros de colegiaturas con la pasarela bancaria nacional."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-700 min-h-[50px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Permisos Concedidos (Uno por línea)</label>
                      <textarea 
                        placeholder="Ej. Lectura de matrículas&#10;Escritura de novedades"
                        value={newPerms}
                        onChange={(e) => setNewPerms(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-700 min-h-[60px]"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Módulos Afectados (Separados por coma)</label>
                      <textarea 
                        placeholder="Ej. Matrícula Digital, Datos Institucionales"
                        value={newModules}
                        onChange={(e) => setNewModules(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-700 min-h-[60px]"
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* Modal Actions */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConnectIntegration}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Conectar Canal
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
