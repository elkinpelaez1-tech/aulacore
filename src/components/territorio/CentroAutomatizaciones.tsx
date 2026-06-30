'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Cpu, Play, CheckCircle2, AlertTriangle, RefreshCw, 
  Search, ShieldAlert, SlidersHorizontal, BookOpen, Clock, 
  Activity, ArrowRight, Check, X, HelpCircle, FileText, ChevronRight,
  HardDrive, Server, CloudLightning, Database, ShieldCheck, Settings,
  Users, UserCheck, AlertOctagon, HelpCircle as HelpIcon, Layers
} from 'lucide-react';
import { 
  getMIORecipes, 
  getMIOProtocols, 
  getMIORuns, 
  getMIOOptimizations,
  toggleMIORecipe, 
  toggleMIOProtocol,
  dispatchMIOEvent, 
  registerRunOutcome,
  applyMIOOptimization,
  MIORecipe, 
  MIOProtocol, 
  MIORun, 
  MIOOptimizationLog 
} from '@/services/mio-service';
import { hasTerritoryPermission } from '@/services/territory-rbac';

export function CentroAutomatizaciones() {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState('Secretario de Educación');
  
  // MIO Enabled state
  const [mioEnabled, setMioEnabled] = useState(true);
  
  // MIO Core state
  const [recipes, setRecipes] = useState<MIORecipe[]>([]);
  const [protocols, setProtocols] = useState<MIOProtocol[]>([]);
  const [runs, setRuns] = useState<MIORun[]>([]);
  const [optimizations, setOptimizations] = useState<MIOOptimizationLog[]>([]);
  
  // UI filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workflows' | 'protocols' | 'history' | 'improvements'>('dashboard');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<MIORecipe | null>(null);
  const [selectedRun, setSelectedRun] = useState<MIORun | null>(null);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);
  
  // Outcome feedback modal/form state
  const [feedbackRunId, setFeedbackRunId] = useState<string | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<'exitoso' | 'ineficaz'>('exitoso');
  const [feedbackText, setFeedbackText] = useState('');

  // Determine context/scope (Territorial vs Escolar)
  const isTerritorialScope = pathname?.includes('/territorio') || currentRole === 'Secretario de Educación';
  const targetScope = isTerritorialScope ? 'territorial' : 'escolar';

  // Cargar datos
  const loadData = () => {
    setRecipes(getMIORecipes().filter(r => r.scope === targetScope));
    setProtocols(getMIOProtocols().filter(p => p.scope === targetScope));
    setRuns(getMIORuns().filter(run => {
      const allRecipes = getMIORecipes();
      const rec = allRecipes.find(r => r.code === run.recipeCode);
      return rec ? rec.scope === targetScope : false;
    }));
    setOptimizations(getMIOOptimizations().filter(opt => {
      const allRecipes = getMIORecipes();
      const rec = allRecipes.find(r => r.code === opt.recipeCode);
      return rec ? rec.scope === targetScope : false;
    }));
  };

  useEffect(() => {
    loadData();

    // Cargar e inicializar estado MIO habilitado
    const savedMio = sessionStorage.getItem('aulacore_mio_enabled');
    if (savedMio !== null) {
      setMioEnabled(savedMio === 'true');
    } else {
      sessionStorage.setItem('aulacore_mio_enabled', 'true');
    }

    // Listeners para actualizaciones reactivas
    window.addEventListener('mio-recipes-changed', loadData);
    window.addEventListener('mio-protocols-changed', loadData);
    window.addEventListener('mio-runs-changed', loadData);
    window.addEventListener('mio-optimizations-changed', loadData);
    window.addEventListener('aulacore-alerts-changed', loadData);

    function updateRole() {
      const saved = sessionStorage.getItem('simulated_role');
      if (saved) setCurrentRole(saved);
    }
    updateRole();
    window.addEventListener('rbac-role-changed', updateRole);

    return () => {
      window.removeEventListener('mio-recipes-changed', loadData);
      window.removeEventListener('mio-protocols-changed', loadData);
      window.removeEventListener('mio-runs-changed', loadData);
      window.removeEventListener('mio-optimizations-changed', loadData);
      window.removeEventListener('aulacore-alerts-changed', loadData);
      window.removeEventListener('rbac-role-changed', updateRole);
    };
  }, [pathname, currentRole]);

  // Modificar estado global del MIO
  const handleToggleMio = () => {
    const nextVal = !mioEnabled;
    setMioEnabled(nextVal);
    sessionStorage.setItem('aulacore_mio_enabled', String(nextVal));
  };

  // Validar permisos RBAC
  const hasAccess = hasTerritoryPermission(currentRole, 'programar_visita');

  const handleToggleRecipe = (code: string, currentVal: boolean) => {
    if (!hasAccess) {
      alert('Error: Su rol actual no posee permisos para modificar recetas de automatización.');
      return;
    }
    toggleMIORecipe(code, !currentVal);
  };

  const handleToggleProtocol = (code: string, currentVal: boolean) => {
    if (!hasAccess) {
      alert('Error: Su rol actual no posee permisos para modificar protocolos oficiales.');
      return;
    }
    toggleMIOProtocol(code, !currentVal);
  };

  // Simulación de Disparo de Evento en el bus MIO con metadatos completos
  const handleSimulateEvent = async (type: string) => {
    if (!mioEnabled) {
      alert('Error: El Centro de Automatizaciones Inteligentes (MIO) se encuentra actualmente Inactivo. Habilítelo para procesar eventos.');
      return;
    }

    setSimulationStatus(`Despachando evento en el bus global: ${type}...`);
    let eventData = {};
    let originModule = 'RFID Sensor Engine';

    if (type === 'student.absence.detected') {
      eventData = {
        school_id: 'inst-1',
        school_name: 'I.E. Rural El Hatillo',
        student_name: 'Mateo Gómez',
        absences: 5,
        comment: 'Sensor RFID reporta 5 inasistencias consecutivas en comedor rural.'
      };
      originModule = 'RFID Attendance Module';
    } else if (type === 'student.low_performance') {
      eventData = {
        school_id: 'inst-2',
        school_name: 'I.E. Marco Fidel Suárez',
        student_name: 'Isabella Alzate',
        score: 2.7,
        comment: 'Promedio general en matemáticas Grado 11-B cae por debajo de 3.0.'
      };
      originModule = 'Portal Calidad Académica';
    } else if (type === 'infrastructure.reported') {
      eventData = {
        school_id: 'inst-1',
        school_name: 'I.E. Rural El Hatillo',
        impact: 120,
        comment: 'Ruptura de cadena de frío en entrega de lácteos del operador PAE.'
      };
      originModule = 'Reportes Cobertura PAE';
    } else if (type === 'rfid.offline') {
      eventData = {
        school_id: 'inst-3',
        school_name: 'I.E. Presbítero Antonio Bernal',
        offlineHours: 24,
        comment: 'Servidor local Offline de la sede principal no reporta pings hace 24 horas.'
      };
      originModule = 'Infraestructura Local Offline';
    }

    const newRuns = await dispatchMIOEvent({
      id: `evt-${Math.random().toString(36).substring(2, 7)}`,
      type,
      tenantId: 'tenant-antioquia',
      municipality: 'Barbosa',
      data: eventData,
      timestamp: new Date().toISOString(),
      userId: 'usr-admin-sed',
      userRole: currentRole,
      originModule,
      organizationName: isTerritorialScope ? 'Secretaría de Educación de Antioquia' : 'Institución Educativa Rural El Hatillo'
    });

    if (newRuns.length > 0) {
      setSimulationStatus(`¡Éxito! Evento procesado por la Black Box. Folio: #${newRuns[0].folio}.`);
      setTimeout(() => setSimulationStatus(null), 4000);
      setActiveTab('history');
      setSelectedRun(newRuns[0]);
    } else {
      setSimulationStatus('Evento omitido: no cumple condiciones de regla.');
      setTimeout(() => setSimulationStatus(null), 4000);
    }
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackRunId) return;

    registerRunOutcome(feedbackRunId, selectedOutcome, feedbackText);
    setFeedbackRunId(null);
    setFeedbackText('');
    setSelectedRun(null);
  };

  // Filtrado por categoría
  const getRecipeCategory = (recipeCode: string): string => {
    switch (recipeCode) {
      case 'R-001': return 'ausentismo';
      case 'R-002': return 'calidad';
      case 'R-003': return 'pae';
      case 'R-004': return 'infraestructura';
      case 'R-05':
      case 'R-005': return 'calidad';
      case 'R-006':
      case 'R-007': return 'convivencia';
      case 'R-008': return 'salud_mental';
      default: return 'all';
    }
  };

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || getRecipeCategory(r.code) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredRuns = runs.filter(run => 
    run.recipeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    run.recipeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    run.folio.toString().includes(searchQuery)
  );

  // Estadísticas Enterprise MIO
  const totalRuns = runs.length;
  const successfulRuns = runs.filter(r => r.status === 'Exitoso').length;
  const alertsGenerated = runs.filter(r => r.steps.some(s => s.actionType === 'create_cat_alert')).length;
  const avgResponseTime = totalRuns > 0 
    ? (runs.reduce((acc, r) => acc + (r.durationMs || 0), 0) / totalRuns).toFixed(0) 
    : '4';

  return (
    <div className="space-y-6">
      {/* Encabezado MIO con Interruptor Global */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-5.5 h-5.5 text-indigo-650 animate-pulse" /> Centro de Automatizaciones Inteligentes (MIO)
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Supervisa el motor de reglas de negocio, la Black Box de auditoría e inmutabilidad, y los flujos integrados del ecosistema.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
          <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Estado del Motor</span>
          <button 
            onClick={handleToggleMio}
            className={`text-xs font-extrabold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${mioEnabled ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm' : 'bg-rose-50 border-rose-300 text-rose-800'}`}
          >
            <span className={`w-2 h-2 rounded-full ${mioEnabled ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`}></span>
            {mioEnabled ? '🟢 MIO ACTIVO' : '🔴 MIO INACTIVO'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center justify-between flex-wrap gap-4 bg-white p-2 border rounded-2xl shadow-xs">
        <div className="flex gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedRecipe(null); setSelectedRun(null); }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all border-none cursor-pointer ${activeTab === 'dashboard' ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
          >
            Dashboard Ejecutivo
          </button>
          <button
            onClick={() => { setActiveTab('workflows'); setSelectedRecipe(null); setSelectedRun(null); }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all border-none cursor-pointer ${activeTab === 'workflows' ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
          >
            Biblioteca de Automatizaciones
          </button>
          <button
            onClick={() => { setActiveTab('protocols'); setSelectedRecipe(null); setSelectedRun(null); }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all border-none cursor-pointer ${activeTab === 'protocols' ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
          >
            Protocolos Oficiales
          </button>
          <button
            onClick={() => { setActiveTab('history'); setSelectedRecipe(null); setSelectedRun(null); }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all border-none cursor-pointer ${activeTab === 'history' ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
          >
            Monitor Black Box
          </button>
          <button
            onClick={() => { setActiveTab('improvements'); setSelectedRecipe(null); setSelectedRun(null); }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all border-none cursor-pointer ${activeTab === 'improvements' ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
          >
            Mejora Continua
          </button>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs font-semibold text-slate-700 pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 w-full"
          />
        </div>
      </div>

      {simulationStatus && (
        <div className="bg-indigo-950 border border-indigo-850 text-indigo-200 text-xs font-bold px-4 py-3 rounded-xl animate-pulse flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400 animate-spin" /> {simulationStatus}
        </div>
      )}

      {/* CONTENIDO DE TABS */}
      
      {/* TAB: DASHBOARD EJECUTIVO */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Fila 1: Tarjetas BI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Eventos Recibidos</span>
              <div className="text-2xl font-black text-slate-800 mt-1">{totalRuns}</div>
              <span className="text-[10px] text-emerald-650 font-bold block mt-1">▲ 100% integrados</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Automatizaciones Ejecutadas</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{successfulRuns}</div>
              <span className="text-[10px] text-slate-400 font-bold block mt-1">Fallas registradas: 0</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Alertas Generadas (CAT)</span>
              <div className="text-2xl font-black text-indigo-650 mt-1">{alertsGenerated}</div>
              <span className="text-[10px] text-slate-400 font-bold block mt-1">Por triage MIO</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tiempo de Respuesta</span>
              <div className="text-2xl font-black text-blue-650 mt-1">{avgResponseTime} ms</div>
              <span className="text-[10px] text-emerald-650 font-bold block mt-1">Latencia bus óptima</span>
            </div>
          </div>

          {/* Consola de Operación NOC en Caliente */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 text-white shadow-lg space-y-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" /> Consola de Operaciones del Ecosistema (MIO Bus)
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Dispare eventos simulados en Barbosa o Copacabana para visualizar la cascada lógica orquestada por el MIO en el monitor de abajo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900">
              {isTerritorialScope ? (
                <>
                  <button 
                    onClick={() => handleSimulateEvent('student.absence.detected')}
                    className="text-[10px] font-bold bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 px-4 py-2.5 rounded-xl text-slate-200 transition-colors cursor-pointer"
                  >
                    Simular student.absence.detected (5 Ausencias RFID)
                  </button>
                  <button 
                    onClick={() => handleSimulateEvent('infrastructure.reported')}
                    className="text-[10px] font-bold bg-slate-900 hover:bg-slate-855 border border-slate-800 hover:border-slate-700 px-4 py-2.5 rounded-xl text-slate-200 transition-colors cursor-pointer"
                  >
                    Simular infrastructure.reported (Falla PAE Veredal)
                  </button>
                  <button 
                    onClick={() => handleSimulateEvent('rfid.offline')}
                    className="text-[10px] font-bold bg-slate-900 hover:bg-slate-855 border border-slate-800 hover:border-slate-700 px-4 py-2.5 rounded-xl text-slate-200 transition-colors cursor-pointer"
                  >
                    Simular rfid.offline (Fallo de Servidor local)
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleSimulateEvent('student.low_performance')}
                    className="text-[10px] font-bold bg-slate-900 hover:bg-slate-855 border border-slate-800 hover:border-slate-700 px-4 py-2.5 rounded-xl text-slate-200 transition-colors cursor-pointer"
                  >
                    Simular student.low_performance (Promedio &lt; 3.0)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Fila 2: Monitor en Tiempo Real (Timeline en Cascada) & Salud */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monitor Timeline en Cascada */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4.5 h-4.5 text-indigo-650" /> Monitor en Tiempo Real (Línea de Tiempo Operativa)
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Muestra la propagación en cascada de eventos a través de los diferentes módulos del ecosistema de AulaCore.
                </p>
              </div>

              {runs.length > 0 ? (
                <div className="relative pl-5 border-l border-slate-200 ml-2 space-y-5 py-2">
                  {/* Corrida de Ausentismo */}
                  {runs[0].recipeCode === 'R-001' && (
                    <>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full absolute -left-[26px] top-1 border-2 border-white"></div>
                        <span className="text-[9px] font-black text-indigo-600 block">10:20 ➔ Sensor RFID (El Hatillo)</span>
                        <span className="text-xs font-bold text-slate-800 block">student.absence.detected despachado al bus</span>
                      </div>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full absolute -left-[26px] top-1 border-2 border-white"></div>
                        <span className="text-[9px] font-black text-indigo-500 block">10:20 ➔ MIO Core</span>
                        <span className="text-xs font-bold text-slate-800 block">Regla R-001 validada: Cumple con 5 ausencias consecutivas</span>
                      </div>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full absolute -left-[26px] top-1 border-2 border-white"></div>
                        <span className="text-[9px] font-black text-amber-500 block">10:20 ➔ Centro de Alertas (CAT)</span>
                        <span className="text-xs font-bold text-slate-800 block">Alerta de inasistencia ALT-MIO creada y priorizada</span>
                      </div>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute -left-[26px] top-1 border-2 border-white"></div>
                        <span className="text-[9px] font-black text-emerald-550 block">10:21 ➔ Agenda Territorial</span>
                        <span className="text-xs font-bold text-slate-800 block">Visita técnica agendada para Auditor de Cobertura</span>
                      </div>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full absolute -left-[26px] top-1 border-2 border-white"></div>
                        <span className="text-[9px] font-black text-blue-550 block">10:21 ➔ Comunicaciones</span>
                        <span className="text-xs font-bold text-slate-800 block">Circular oficial de requerimiento enviada al rector veredal</span>
                      </div>
                    </>
                  )}

                  {/* Corrida de PAE */}
                  {runs[0].recipeCode === 'R-003' && (
                    <>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full absolute -left-[26px] top-1 border-2 border-white"></div>
                        <span className="text-[9px] font-black text-indigo-600 block">11:30 ➔ Reporte PAE</span>
                        <span className="text-xs font-bold text-slate-800 block">Anomalía logística reportada en Barbosa</span>
                      </div>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full absolute -left-[26px] top-1 border-2 border-white"></div>
                        <span className="text-[9px] font-black text-indigo-500 block">11:30 ➔ MIO Core</span>
                        <span className="text-xs font-bold text-slate-800 block">Regla R-003 validada: Afectación de 120 raciones escolares</span>
                      </div>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-rose-500 rounded-full absolute -left-[26px] top-1 border-2 border-white"></div>
                        <span className="text-[9px] font-black text-rose-550 block">11:30 ➔ Centro de Alertas (CAT)</span>
                        <span className="text-xs font-bold text-slate-800 block">Alerta Crítica PAE creada en semáforo rojo</span>
                      </div>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full absolute -left-[26px] top-1 border-2 border-white"></div>
                        <span className="text-[9px] font-black text-blue-550 block">11:31 ➔ Comunicaciones</span>
                        <span className="text-xs font-bold text-slate-800 block">Circular de amonestación despachada al operador</span>
                      </div>
                    </>
                  )}

                  {/* Corrida de Servidores */}
                  {runs[0].recipeCode === 'R-004' && (
                    <>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full absolute -left-[26px] top-1 border-2 border-white"></div>
                        <span className="text-[9px] font-black text-indigo-600 block">08:00 ➔ Servidor Offline</span>
                        <span className="text-xs font-bold text-slate-800 block">rfid.offline recibido en el bus del MIO</span>
                      </div>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full absolute -left-[26px] top-1 border-2 border-white"></div>
                        <span className="text-[9px] font-black text-indigo-500 block">08:00 ➔ MIO Core</span>
                        <span className="text-xs font-bold text-slate-800 block">Regla R-004 validada: Sede rural incomunicada por 24 horas</span>
                      </div>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full absolute -left-[26px] top-1 border-2 border-white"></div>
                        <span className="text-[9px] font-black text-amber-550 block">08:01 ➔ Centro de Alertas (CAT)</span>
                        <span className="text-xs font-bold text-slate-800 block">Alerta de conectividad creada y priorizada</span>
                      </div>
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute -left-[26px] top-1 border-2 border-white"></div>
                        <span className="text-[9px] font-black text-emerald-550 block">08:02 ➔ Agenda Territorial</span>
                        <span className="text-xs font-bold text-slate-800 block">Visita técnica asignada a Ing. Ricardo Vélez</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 font-bold text-xs">
                  Dispara una simulación en caliente arriba para observar la cascada de transiciones del MIO en vivo.
                </div>
              )}
            </div>

            {/* Salud y Heartbeat del Ecosistema */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Server className="w-4.5 h-4.5 text-slate-600" /> Estado y Canales
              </h4>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-500">MIO Event Bus</span>
                  <span className="text-emerald-650 font-bold">🟢 Activo</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-500">Supabase Cloud</span>
                  <span className="text-emerald-650 font-bold">🟢 Conectado</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-500">Sede Barbosa</span>
                  <span className="text-emerald-650 font-bold">🟢 Online (4ms)</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-500">Sede Copacabana</span>
                  <span className="text-emerald-650 font-bold">🟢 Online (6ms)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Sede Girardota</span>
                  <span className="text-emerald-650 font-bold">🟢 Online (5ms)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: BIBLIOTECA DE AUTOMATIZACIONES */}
      {activeTab === 'workflows' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listado y Filtros Categorizados */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filtros de Categorías */}
            <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200 w-fit">
              <button 
                onClick={() => setCategoryFilter('all')}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border-none cursor-pointer ${categoryFilter === 'all' ? 'bg-white text-indigo-650 shadow-xs' : 'text-slate-550'}`}
              >
                Todas
              </button>
              <button 
                onClick={() => setCategoryFilter('ausentismo')}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border-none cursor-pointer ${categoryFilter === 'ausentismo' ? 'bg-white text-indigo-650 shadow-xs' : 'text-slate-550'}`}
              >
                Ausentismo
              </button>
              <button 
                onClick={() => setCategoryFilter('calidad')}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border-none cursor-pointer ${categoryFilter === 'calidad' ? 'bg-white text-indigo-650 shadow-xs' : 'text-slate-550'}`}
              >
                Calidad
              </button>
              <button 
                onClick={() => setCategoryFilter('convivencia')}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border-none cursor-pointer ${categoryFilter === 'convivencia' ? 'bg-white text-indigo-650 shadow-xs' : 'text-slate-550'}`}
              >
                Convivencia (Ley 1620)
              </button>
              <button 
                onClick={() => setCategoryFilter('pae')}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border-none cursor-pointer ${categoryFilter === 'pae' ? 'bg-white text-indigo-650 shadow-xs' : 'text-slate-550'}`}
              >
                PAE
              </button>
              <button 
                onClick={() => setCategoryFilter('infraestructura')}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border-none cursor-pointer ${categoryFilter === 'infraestructura' ? 'bg-white text-indigo-650 shadow-xs' : 'text-slate-550'}`}
              >
                Infraestructura
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecipes.map((recipe) => (
                <div 
                  key={recipe.code}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`border rounded-2xl p-4 transition-all cursor-pointer hover:border-slate-300 ${selectedRecipe?.code === recipe.code ? 'border-indigo-600 bg-indigo-50/5 shadow-xs' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {recipe.code}
                      </span>
                      <h4 className="text-sm font-black text-slate-800 mt-1.5">{recipe.name}</h4>
                      <p className="text-[11px] font-semibold text-slate-500 mt-1 line-clamp-2">{recipe.description}</p>
                    </div>
                    <label 
                      onClick={(e) => e.stopPropagation()}
                      className="relative inline-flex items-center cursor-pointer shrink-0"
                    >
                      <input 
                        type="checkbox" 
                        checked={recipe.isActive}
                        onChange={() => handleToggleRecipe(recipe.code, recipe.isActive)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Trigger: {recipe.triggerType}
                    </span>
                    <span className="text-[9px] font-black text-slate-550 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider block">
                      Acciones: {recipe.defaultActions.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ficha de Inspección Detallada de la Automatización */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-inner space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-4.5 h-4.5 text-slate-600" /> Ficha Técnica de la Receta
            </h4>

            {selectedRecipe ? (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2.5 text-xs">
                  <div>
                    <span className="text-[9px] font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{selectedRecipe.code}</span>
                    <h5 className="text-sm font-black text-slate-800 mt-2">{selectedRecipe.name}</h5>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">{selectedRecipe.description}</p>
                  
                  <div className="pt-3 border-t border-slate-150 space-y-2">
                    <div>
                      <strong className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Evento Disparador</strong>
                      <span className="font-mono text-slate-800 font-bold block mt-0.5">{selectedRecipe.triggerType}</span>
                    </div>
                    <div>
                      <strong className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Condiciones Lógicas</strong>
                      <span className="text-slate-800 font-bold block mt-0.5">
                        {JSON.stringify(selectedRecipe.defaultConditions)}
                      </span>
                    </div>
                    <div>
                      <strong className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Acciones Gatilladas</strong>
                      <div className="space-y-1.5 mt-1">
                        {selectedRecipe.defaultActions.map((a, idx) => (
                          <div key={idx} className="bg-slate-50 p-2 border border-slate-100 rounded-xl">
                            <span className="font-bold text-indigo-900 block">{a.type}</span>
                            {a.params && <span className="text-[10px] text-slate-450 block">{JSON.stringify(a.params)}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ultimas Ejecuciones de la Receta */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3">
                  <h6 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Historial Reciente</h6>
                  <div className="space-y-2 text-[10px] font-semibold">
                    {runs.filter(r => r.recipeCode === selectedRecipe.code).slice(0, 3).map(r => (
                      <div key={r.id} className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-mono text-slate-500">#{r.folio}</span>
                        <span className="text-slate-700">{new Date(r.createdAt).toLocaleTimeString()}</span>
                        <span className="text-blue-600 font-bold">{r.durationMs}ms</span>
                      </div>
                    ))}
                    {runs.filter(r => r.recipeCode === selectedRecipe.code).length === 0 && (
                      <div className="text-center py-4 text-slate-400 font-bold">No se registran corridas en la sesión</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 font-bold text-xs">
                Seleccione una receta de la grilla izquierda para inspeccionar sus parámetros lógicos de orquestación.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: PROTOCOLOS OFICIALES */}
      {activeTab === 'protocols' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {protocols.map((protocol) => (
            <div 
              key={protocol.code}
              className={`border rounded-2xl p-4 transition-all ${protocol.isActive ? 'border-slate-250 bg-slate-50/10' : 'border-slate-150 bg-slate-50/50 opacity-70'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {protocol.code}
                  </span>
                  <h4 className="text-sm font-black text-slate-800 mt-1.5">{protocol.name}</h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1">{protocol.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={protocol.isActive}
                    onChange={() => handleToggleProtocol(protocol.code, protocol.isActive)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  Normatividad: {protocol.regulationRef}
                </span>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider block">
                  Recetas MIO: {protocol.recipes.join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: MONITOR BLACK BOX */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                    <th className="py-2.5">Folio</th>
                    <th className="py-2.5">Módulo Origen</th>
                    <th className="py-2.5">Organización / Tenant</th>
                    <th className="py-2.5">Latencia</th>
                    <th className="py-2.5 text-center">Firma SHA-256</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRuns.map((run) => (
                    <tr 
                      key={run.id}
                      onClick={() => setSelectedRun(run)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedRun?.id === run.id ? 'bg-slate-50 font-bold' : ''}`}
                    >
                      <td className="py-3 font-mono text-[10px] text-slate-600">#{run.folio}</td>
                      <td className="py-3 font-semibold text-slate-850">{run.originModule}</td>
                      <td className="py-3 text-slate-500">{run.organizationName}</td>
                      <td className="py-3 text-blue-650 font-bold">{run.durationMs} ms</td>
                      <td className="py-3 text-center">
                        <span className="text-[9px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                          {run.executionHash.substring(0, 14)}...
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredRuns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                        Ningún folio en la Black Box. Dispara eventos de prueba.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ficha Black Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-inner space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-650" /> Caja Negra de Auditoría
            </h4>

            {selectedRun ? (
              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 text-[10px]">
                  <div><strong className="text-slate-400 uppercase">Actor ID:</strong> <span className="text-slate-800 font-bold">{selectedRun.userId} ({selectedRun.userRole})</span></div>
                  <div><strong className="text-slate-400 uppercase">Origen:</strong> <span className="text-slate-800 font-bold">{selectedRun.originModule}</span></div>
                  <div><strong className="text-slate-400 uppercase">Entidad:</strong> <span className="text-slate-800 font-bold">{selectedRun.organizationName}</span></div>
                  <div><strong className="text-slate-400 uppercase">Latencia:</strong> <span className="text-blue-600 font-bold">{selectedRun.durationMs} ms</span></div>
                  <div className="pt-2 border-t border-slate-100">
                    <strong className="text-slate-400 uppercase block mb-1">Firma Digital (SHA-256):</strong>
                    <span className="font-mono text-[9px] break-all bg-slate-50 p-2 rounded block border border-slate-150">
                      {selectedRun.executionHash}
                    </span>
                  </div>
                </div>

                <div className="relative pl-4 border-l border-slate-250 ml-1.5 space-y-3">
                  {selectedRun.steps.map((step, idx) => (
                    <div key={idx} className="relative text-[10px]">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full absolute -left-[20px] top-1 border border-white"></div>
                      <span className="font-bold text-slate-850 block">{step.actionType}</span>
                      <span className="text-slate-500 block">{step.details}</span>
                    </div>
                  ))}
                </div>

                {!selectedRun.outcome && (
                  <button 
                    onClick={() => setFeedbackRunId(selectedRun.id)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl transition-all border-none cursor-pointer text-[10px]"
                  >
                    Calificar Efectividad
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 font-bold text-xs">
                Seleccione un folio de la Black Box para inspeccionar firmas y metadatos multitenant.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: MEJORA CONTINUA */}
      {activeTab === 'improvements' && (
        <div className="space-y-4">
          <div className="bg-indigo-50/40 border border-indigo-150 p-4 rounded-2xl flex items-start gap-3">
            <HelpIcon className="w-5 h-5 text-indigo-650 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-955">
                Capa 7: Optimización y Mejora Continua
              </h4>
              <p className="text-[11px] text-slate-650 mt-1 font-semibold">
                El MIO audita las bitácoras Black Box de forma agregada. Si una circular o tipo de visita técnica arroja cierres calificados como "ineficaces", el motor sugiere reajustar los triggers y canales de despacho de forma automática.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {optimizations.map((opt) => (
              <div 
                key={opt.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap shadow-sm hover:border-slate-250 transition-all text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider block">
                      {opt.recipeCode}
                    </span>
                    <h4 className="text-xs font-black text-slate-800">{opt.recipeName}</h4>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Propuesta: <strong className="text-slate-800">"{opt.recommendation}"</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Índice de Éxito</span>
                    <span className="text-sm font-black text-slate-800">{opt.successRatio}%</span>
                  </div>
                  
                  {opt.applied ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Aplicado
                    </span>
                  ) : (
                    <button 
                      onClick={() => {
                        if (!hasAccess) {
                          alert('Error: Su rol actual no posee permisos para autorizar ajustes de mejora continua.');
                          return;
                        }
                        applyMIOOptimization(opt.id);
                        alert(`Optimización aplicada. El MIO ha reajustado los parámetros de la receta ${opt.recipeCode}.`);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-colors border-none cursor-pointer flex items-center gap-1"
                    >
                      Aplicar Ajuste <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {optimizations.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-bold text-xs">
                Ninguna propuesta de optimización sugerida. El motor requiere más trazas ineficaces calificados en la Black Box para generar conocimiento de mejora continua.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL FEEDBACK */}
      {feedbackRunId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleSubmitFeedback}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-655" /> Evaluar Efectividad
              </h4>
              <button 
                type="button"
                onClick={() => setFeedbackRunId(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Resultado de la Intervención</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOutcome('exitoso')}
                    className={`text-xs font-bold py-2 rounded-xl transition-all border cursor-pointer ${selectedOutcome === 'exitoso' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                  >
                    Exitoso
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOutcome('ineficaz')}
                    className={`text-xs font-bold py-2 rounded-xl transition-all border cursor-pointer ${selectedOutcome === 'ineficaz' ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                  >
                    Ineficaz
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Justificación</label>
                <textarea
                  required
                  placeholder="Por qué consideras que el flujo fue o no fue efectivo..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="text-xs font-semibold text-slate-700 p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 w-full h-24"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setFeedbackRunId(null)}
                className="text-xs font-bold bg-white hover:bg-slate-50 text-slate-650 border border-slate-200 px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white border-none px-4 py-2 rounded-xl cursor-pointer transition-colors"
              >
                Registrar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
