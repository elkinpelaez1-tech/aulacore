'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { TerritoryHeader } from '@/components/territorio/TerritoryHeader';
import { TerritorySidebar } from '@/components/territorio/TerritorySidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Link2, 
  Settings2, 
  CheckCircle, 
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
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  User,
  Activity
} from 'lucide-react';

interface Connector {
  id: string;
  name: string;
  category: 'gubernamental' | 'productivity' | 'messaging' | 'data';
  description: string;
  cert: 'Oficial' | 'Certificada' | 'Beta' | 'Experimental';
  status: 'operating' | 'slow' | 'warning' | 'error' | 'disabled';
  installed: boolean;
  version: string;
  latency: number;
  availability: number;
  lastSync: string;
  authError?: string;
}

const INITIAL_CONNECTORS: Connector[] = [
  {
    id: 'simat',
    name: 'SIMAT (Matrícula Nacional)',
    category: 'gubernamental',
    description: 'Sincronización bidireccional oficial del censo de matrículas y alumnos colombianos.',
    cert: 'Oficial',
    status: 'operating',
    installed: true,
    version: 'v1.4.2',
    latency: 310,
    availability: 99.8,
    lastSync: 'Hace 12 min'
  },
  {
    id: 'due',
    name: 'DUE (Directorio de Sedes)',
    category: 'gubernamental',
    description: 'Actualización automática del Directorio Único de Establecimientos educativos.',
    cert: 'Oficial',
    status: 'operating',
    installed: true,
    version: 'v1.1.0',
    latency: 240,
    availability: 99.9,
    lastSync: 'Hace 1 hora'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business API',
    category: 'messaging',
    description: 'Envío de notificaciones críticas a acudientes (deserción, alimentación, alertas del CAT).',
    cert: 'Certificada',
    status: 'error',
    installed: true,
    version: 'v2.0.4',
    latency: 0,
    availability: 0,
    lastSync: 'Fallida hace 45 min',
    authError: 'HTTP 401 Unauthorized - Invalid Grant. El token de autenticación de Meta ha expirado o es inválido.'
  },
  {
    id: 'google',
    name: 'Google Workspace for Education',
    category: 'productivity',
    description: 'Creación automática de cuentas de estudiante, Classroom y almacenamiento Drive.',
    cert: 'Certificada',
    status: 'disabled',
    installed: false,
    version: 'v2.1.0',
    latency: 0,
    availability: 100,
    lastSync: 'Nunca'
  },
  {
    id: 'teams',
    name: 'Microsoft 365 / Teams',
    category: 'productivity',
    description: 'Aulas virtuales y colaboración en Office 365 para la planta docente del municipio.',
    cert: 'Certificada',
    status: 'disabled',
    installed: false,
    version: 'v1.8.0',
    latency: 0,
    availability: 100,
    lastSync: 'Nunca'
  },
  {
    id: 'sisben',
    name: 'SISBEN IV',
    category: 'gubernamental',
    description: 'Cruce del nivel de vulnerabilidad socioeconómica familiar para triage predictivo.',
    cert: 'Beta',
    status: 'slow',
    installed: true,
    version: 'v0.9.1',
    latency: 1850,
    availability: 92.4,
    lastSync: 'Hace 4 horas'
  },
  {
    id: 'icfes',
    name: 'ICFES Saber 11',
    category: 'gubernamental',
    description: 'Importación consolidada de resultados académicos de pruebas de Estado por plantel.',
    cert: 'Experimental',
    status: 'operating',
    installed: true,
    version: 'v0.5.2',
    latency: 420,
    availability: 98.6,
    lastSync: 'Ayer'
  },
  {
    id: 'powerbi',
    name: 'Power BI Embedded',
    category: 'data',
    description: 'Visualización de tableros de analítica de la Secretaría incrustados en AulaCore.',
    cert: 'Oficial',
    status: 'operating',
    installed: true,
    version: 'v2.1.2',
    latency: 190,
    availability: 99.9,
    lastSync: 'Hace 30 min'
  }
];

export default function IntegracionesPage() {
  const [connectors, setConnectors] = useState<Connector[]>(INITIAL_CONNECTORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Modals & Active config
  const [activeConfig, setActiveConfig] = useState<Connector | null>(null);
  const [selectedApiKey, setSelectedApiKey] = useState('••••••••••••••••••••••••••••');
  
  // Diagnósticos
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  
  // AulaHelp IA Panel
  const [iaResponse, setIaResponse] = useState<string | null>(null);
  const [iaContext, setIaContext] = useState<Connector | null>(null);

  // Bitácora de Logs
  const [logs, setLogs] = useState<any[]>([
    { id: 'LOG-01', connector: 'SIMAT', type: 'INCOMING', msg: 'Sincronizados 42 nuevos folios de matrícula.', status: 'success', time: '12 min' },
    { id: 'LOG-02', connector: 'WhatsApp', type: 'OUTGOING', msg: 'Envío de alerta por inasistencia al PAE.', status: 'failed', time: '45 min' },
    { id: 'LOG-03', connector: 'SISBEN', type: 'INCOMING', msg: 'Consulta de vulnerabilidad de acudientes veredales.', status: 'success', time: '4 horas' }
  ]);

  const handleToggleInstall = (id: string) => {
    const updated = connectors.map(c => {
      if (c.id === id) {
        const nextInstalled = !c.installed;
        return {
          ...c,
          installed: nextInstalled,
          status: nextInstalled ? 'operating' : 'disabled' as any,
          latency: nextInstalled ? 280 : 0,
          availability: nextInstalled ? 99.5 : 100
        };
      }
      return c;
    });
    setConnectors(updated);
  };

  const handleTestConnection = async (connector: Connector) => {
    setIsTesting(true);
    setTestResult(null);
    
    // Simular delay de respuesta de red externa (800ms)
    await new Promise(r => setTimeout(r, 800));

    setIsTesting(false);
    if (connector.status === 'error') {
      setTestResult({
        success: false,
        latency: 0,
        version: connector.version,
        httpCode: 401,
        diagnosis: 'Credenciales denegadas por el servidor de Meta. Verifique que la llave permanente no haya expirado.'
      });
    } else if (connector.status === 'slow') {
      setTestResult({
        success: true,
        latency: 1850,
        version: connector.version,
        httpCode: 200,
        diagnosis: 'Conexión establecida con el SISBEN, pero se detecta alta latencia en los servidores públicos gubernamentales.'
      });
    } else {
      setTestResult({
        success: true,
        latency: Math.floor(Math.random() * 100) + 120,
        version: connector.version,
        httpCode: 200,
        diagnosis: 'Conexión en línea y operando de forma óptima. Eventos entrantes procesados correctamente.'
      });
    }
  };

  const handleAskIA = (connector: Connector) => {
    setIaContext(connector);
    if (connector.id === 'whatsapp') {
      setIaResponse(`### Diagnóstico de AulaHelp IA:
El error **HTTP 401 Unauthorized** indica que el token de autenticación (Bearer Token) que Meta configuró en AulaCore ha expirado o fue revocado en su consola de desarrolladores.

**Acciones recomendadas:**
1. Ingrese a la consola de Meta Business Suite (https://developers.facebook.com).
2. Genere un **Token de Acceso Permanente** (System User Token) en lugar de un token temporal de 24 horas.
3. Copie la nueva clave e ingrésela haciendo clic en el botón **Configurar** de WhatsApp Business API en AulaCore.
4. Presione **Probar Conexión** para certificar el canal.`);
    } else if (connector.id === 'sisben') {
      setIaResponse(`### Diagnóstico de AulaHelp IA:
El conector del **SISBEN IV** está experimentando **Lentitud de Respuesta (1850ms)**. Esto se debe a congestión o mantenimiento técnico en los servidores públicos de la Dirección Nacional de Planeación (DNP) de Colombia.

**Acciones recomendadas:**
1. No requiere acción de credenciales, la autenticación es correcta.
2. El MIO ha activado automáticamente la **Cola de Espera Asíncrona (Sync Queue)**; los pings retrasados se procesarán en las horas de menor tráfico (10:00 PM).`);
    } else {
      setIaResponse(`### Diagnóstico de AulaHelp IA:
El canal **${connector.name}** está funcionando con total normalidad con una disponibilidad del ${connector.availability}% y latencia óptima. Todo evento externo se está canalizando correctamente al bus del MIO.`);
    }
  };

  const filteredConnectors = connectors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100">
      <TerritorySidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TerritoryHeader />
        
        {/* Contenedor Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cabecera Interna */}
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-white">Centro de Integraciones</h2>
            <p className="text-xs text-slate-405 font-bold mt-1">
              Marketplace de conectores modulares de AulaCore. Conecta SIMAT, Google, WhatsApp y APIs externas al bus del MIO.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
            {/* 🖥️ SECCIÓN IZQUIERDA: MARKETPLACE DE INTEGRACIONES */}
            <div className="xl:col-span-3 space-y-6">
              {/* Buscador y Filtros */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-sm">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    type="text" 
                    placeholder="Buscar integraciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-300 pl-9 pr-4 py-2 border border-slate-800 bg-slate-950 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Categorías */}
                <div className="flex flex-wrap gap-1.5 text-[9px] font-black uppercase tracking-wider">
                  <button 
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1.5 rounded-lg border-none cursor-pointer ${activeCategory === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-450 hover:bg-slate-750'}`}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setActiveCategory('gubernamental')}
                    className={`px-3 py-1.5 rounded-lg border-none cursor-pointer ${activeCategory === 'gubernamental' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-450 hover:bg-slate-750'}`}
                  >
                    Gubernamentales
                  </button>
                  <button 
                    onClick={() => setActiveCategory('productivity')}
                    className={`px-3 py-1.5 rounded-lg border-none cursor-pointer ${activeCategory === 'productivity' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-450 hover:bg-slate-750'}`}
                  >
                    Ofimática / Aulas
                  </button>
                  <button 
                    onClick={() => setActiveCategory('messaging')}
                    className={`px-3 py-1.5 rounded-lg border-none cursor-pointer ${activeCategory === 'messaging' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-450 hover:bg-slate-750'}`}
                  >
                    Mensajería
                  </button>
                </div>
              </div>

              {/* Grid de Conectores (Marketplace) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredConnectors.map((connector) => (
                  <Card key={connector.id} className="bg-slate-900 border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 shadow-sm text-slate-300 border">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-white">{connector.name}</h4>
                          <span className="text-[8px] bg-slate-850 text-slate-400 font-extrabold uppercase tracking-widest px-2 py-0.5 rounded leading-none block w-fit">
                            {connector.category}
                          </span>
                        </div>

                        {/* Insignias de Certificación */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] bg-indigo-950 text-indigo-400 border border-indigo-900 font-black px-1.5 py-0.5 rounded">
                            {connector.cert}
                          </span>
                          
                          {/* Semáforos de Salud */}
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
                            style={{
                              backgroundColor: connector.status === 'operating' ? '#10b981' : 
                                               connector.status === 'slow' ? '#eab308' : 
                                               connector.status === 'warning' ? '#f97316' : 
                                               connector.status === 'error' ? '#ef4444' : '#64748b'
                            }}
                            title={`Salud: ${connector.status}`}
                          />
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                        {connector.description}
                      </p>
                    </div>

                    {/* Módulo Estadístico si está instalado */}
                    {connector.installed && (
                      <div className="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-850 p-2 rounded-xl text-center text-[8px] font-black text-slate-400 uppercase tracking-wider">
                        <div>
                          <span className="text-slate-500 block text-[7px]">Latencia</span>
                          <span className="text-slate-350">{connector.latency > 0 ? `${connector.latency}ms` : '---'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[7px]">Uptime</span>
                          <span className="text-slate-350">{connector.installed ? `${connector.availability}%` : '---'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[7px]">Última Sinc</span>
                          <span className="text-slate-350 truncate block">{connector.lastSync}</span>
                        </div>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center justify-between gap-2 border-t border-slate-850 pt-3 flex-wrap">
                      <div className="flex gap-1.5">
                        {connector.installed ? (
                          <>
                            <button 
                              onClick={() => { setActiveConfig(connector); setTestResult(null); }}
                              className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-[9px] rounded-lg px-2.5 py-1.5 cursor-pointer border-none flex items-center gap-1 transition-colors"
                            >
                              <Settings2 className="w-3 h-3 text-slate-400" /> Configurar
                            </button>
                            <button 
                              onClick={() => handleTestConnection(connector)}
                              className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[9px] rounded-lg px-2.5 py-1.5 cursor-pointer border-none flex items-center gap-1 transition-colors"
                            >
                              <Play className="w-3 h-3 text-white" /> Probar
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold block py-1.5">No Instalado</span>
                        )}
                      </div>

                      {/* Switch de instalación */}
                      <button 
                        onClick={() => handleToggleInstall(connector.id)}
                        className={`text-[9px] font-black uppercase tracking-wider border-none px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${connector.installed ? 'bg-red-950 text-red-400 hover:bg-red-900/50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                      >
                        {connector.installed ? 'Desinstalar' : 'Instalar'}
                      </button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Bitácora de Logs de Sincronización */}
              <Card className="bg-slate-900 border-slate-850 rounded-3xl p-5 shadow-sm space-y-3.5 text-slate-300">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Logs de Operación en el API Gateway (Últimas 24 Horas)
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold block">Historial de Webhooks y pings procesados en el Centro de Integraciones</span>
                  </div>
                  
                  <button 
                    onClick={() => setLogs([
                      { id: `LOG-${Date.now()}`, connector: 'Google', type: 'OUTGOING', msg: 'Sincronizado directorio escolar.', status: 'success', time: 'Ahorita' },
                      ...logs
                    ])}
                    className="bg-slate-800 hover:bg-slate-755 text-slate-300 border-none font-bold text-[9px] rounded-lg px-2 py-1 flex items-center gap-0.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-400 animate-spin" /> Refrescar
                  </button>
                </div>

                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3 border border-slate-855 bg-slate-950/20 rounded-2xl flex justify-between items-center text-xs font-semibold text-slate-350 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded ${log.status === 'success' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400 animate-pulse'}`}>
                          {log.status === 'success' ? 'SUCCESS' : 'FAILED'}
                        </span>
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-300 block">{log.connector} ({log.type})</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{log.msg}</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-500 font-bold block">{log.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* ⚡ SECCIÓN DERECHA: COPILOTO DE AULAHELP IA Y DIAGNÓSTICO */}
            <div className="space-y-6">
              {/* Diagnóstico en Vivo */}
              {testResult !== null && (
                <Card className="bg-slate-900 border-slate-850 rounded-3xl p-5 shadow-sm space-y-3.5 text-xs font-semibold text-slate-300">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
                      <Database className="w-4 h-4 text-indigo-500" />
                      Resultado del Diagnóstico
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold block">Salida de red del test ping</span>
                  </div>

                  <div className="bg-slate-955 border border-slate-850 rounded-2xl p-3.5 space-y-2.5 font-bold">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">HTTP Status</span>
                      <span className={testResult.success ? 'text-emerald-500' : 'text-red-500'}>{testResult.httpCode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Latencia RTT</span>
                      <span className="text-slate-300">{testResult.latency > 0 ? `${testResult.latency}ms` : '---'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Versión remota API</span>
                      <span className="font-mono text-[9px] text-slate-400">{testResult.version}</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-2xl flex items-start gap-2 ${testResult.success ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30' : 'bg-red-950/20 text-red-400 border border-red-900/30'}`}>
                    {testResult.success ? <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-550" /> : <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500" />}
                    <p className="text-[10px] leading-relaxed">{testResult.diagnosis}</p>
                  </div>

                  {/* Botón Consultar IA si hay fallos */}
                  {!testResult.success && activeConfig && (
                    <button 
                      onClick={() => handleAskIA(activeConfig)}
                      className="w-full bg-slate-850 hover:bg-slate-800 text-indigo-400 border border-slate-800 text-[10px] font-bold py-2.5 rounded-xl cursor-pointer flex items-center gap-1 justify-center transition-colors border-solid"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Consultar Asesoría AulaHelp IA
                    </button>
                  )}
                </Card>
              )}

              {/* Copiloto de AulaHelp IA */}
              <Card className="bg-slate-900 border-slate-850 rounded-3xl p-5 shadow-sm space-y-4 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5 text-indigo-400 font-black uppercase tracking-wider text-[9px]">
                  <Sparkles className="w-4.5 h-4.5 animate-pulse text-indigo-400 shrink-0" />
                  Soporte Técnico de AulaHelp IA
                </div>

                {iaResponse ? (
                  <div className="space-y-3 bg-slate-955 p-4 rounded-2xl border border-slate-850 leading-relaxed text-slate-350">
                    <p className="text-[10px] font-black uppercase text-indigo-450">Analizando error de: {iaContext?.name}</p>
                    <div className="text-[10px] space-y-2 whitespace-pre-line font-bold">
                      {iaResponse}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 font-bold">
                    Haz clic en "Configurar" en cualquier canal y consulta con la IA si experimentas problemas de sincronización de tokens o llaves.
                  </div>
                )}
              </Card>

              {/* Botón rápido para simular consultas del listado */}
              <div className="space-y-2">
                <span className="text-[8px] font-black uppercase text-slate-500 block tracking-widest">Ejemplos de Consulta</span>
                <button 
                  onClick={() => handleAskIA(connectors.find(c => c.id === 'whatsapp')!)}
                  className="w-full text-left bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-300 p-3 rounded-2xl text-[10px] font-extrabold cursor-pointer transition-colors block"
                >
                  ¿Cómo soluciono la falla de WhatsApp Business API?
                </button>
                <button 
                  onClick={() => handleAskIA(connectors.find(c => c.id === 'sisben')!)}
                  className="w-full text-left bg-slate-900 border border-slate-855 hover:bg-slate-850 text-slate-300 p-3 rounded-2xl text-[10px] font-extrabold cursor-pointer transition-colors block"
                >
                  ¿Por qué sale en amarillo el SISBEN IV?
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ⚙️ MODAL DE CONFIGURACIÓN DE CONECTOR */}
        {activeConfig && (
          <div className="fixed inset-0 bg-slate-955/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <Card className="bg-slate-900 border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl text-slate-300">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Configurar Integración: {activeConfig.name}</h3>
              <p className="text-[10px] text-slate-450 mt-1">Configure las credenciales de autenticación del API y tokens autorizados.</p>
              
              <div className="py-4 space-y-4 text-xs font-semibold text-slate-655 font-bold">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">URL del Endpoint Servidor Remoto</label>
                  <input 
                    type="text" 
                    defaultValue={activeConfig.id === 'whatsapp' ? 'https://graph.facebook.com/v19.0/whatsapp_business' : 'https://api.colombia.gov.co/' + activeConfig.id}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Clave API / Token de Acceso Permanente</label>
                  <input 
                    type="password" 
                    value={selectedApiKey}
                    onChange={(e) => setSelectedApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {activeConfig.authError && (
                  <div className="text-[9px] text-red-400 bg-red-955/20 border border-red-900/30 p-3 rounded-2xl font-bold flex gap-1.5">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500" />
                    <div>
                      <strong className="block text-[8px] uppercase tracking-wider">Última falla de autenticación</strong>
                      {activeConfig.authError}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-850 pt-4">
                <button 
                  type="button" 
                  onClick={() => setActiveConfig(null)} 
                  className="text-[10px] font-bold text-slate-500 bg-transparent hover:bg-slate-800 border-none rounded-lg px-3 py-2 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    const updated = connectors.map(c => {
                      if (c.id === activeConfig.id) {
                        return { ...c, status: 'operating' as any, authError: undefined };
                      }
                      return c;
                    });
                    setConnectors(updated);
                    setActiveConfig(null);
                  }}
                  className="text-[10px] font-extrabold bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 cursor-pointer shadow-sm border-none transition-colors"
                >
                  Guardar Configuración
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
