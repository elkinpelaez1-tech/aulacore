'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Sparkles, Check, Shield, Award, Calendar, Clock, 
  Settings2, Bell, AlertTriangle, Blocks, ShieldCheck, Activity, 
  Users, CreditCard, CloudUpload, Trash2, Edit2, Plus, 
  Smartphone, Mail, MessageSquare, Terminal, Eye, Lock, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

// TYPES & INTERFACES
interface Sede {
  id: string;
  name: string;
  address: string;
  jornadas: string[];
  levels: string[];
}

interface GradeScale {
  label: string;
  min: number;
  max: number;
  color: string;
  description: string;
}

interface AuditLog {
  id: string;
  user: string;
  action: string;
  ip: string;
  time: string;
}

interface ActiveSession {
  id: string;
  user: string;
  role: string;
  device: string;
  ip: string;
  location: string;
  activeTime: string;
}

interface InstitutionalSettings {
  // 1. Identidad
  name: string;
  slogan: string;
  daneCode: string;
  nit: string;
  resolution: string;
  legalNature: 'Oficial' | 'Privada' | 'Concesión';
  rectorName: string;
  secretaryName: string;
  logoPrincipal: string;
  logoSecundario: string;
  signatureUrl: string;

  // 2. Sedes & Estructura
  sedes: Sede[];

  // 3. Académico
  minPassGrade: number;
  periodsCount: number;
  scales: GradeScale[];
  bulletinShowPhoto: boolean;
  bulletinShowRanking: boolean;
  observadorAutosave: boolean;

  // 4. Identidad Visual
  primaryColor: string; // hex
  sidebarColor: 'slate-900' | 'indigo-950' | 'emerald-950' | 'slate-800';
  backgroundStyle: 'dots' | 'grid' | 'none';
  faviconUrl: string;

  // 5. RFID
  rfidTolerance: number; // minutes
  rfidAlertsEnabled: boolean;
  rfidZones: string[];
  rfidTerminals: { id: string; name: string; zone: string; status: 'online' | 'offline' }[];

  // 6. Comunicaciones
  whatsappEnabled: boolean;
  whatsappApiKey: string;
  smsGatewayEnabled: boolean;
  emailSmtpHost: string;
  pushNotificationsEnabled: boolean;

  // 7. IA & Automatizaciones
  academicRiskThreshold: number; // percentage
  desertionPredictionModel: 'Básico' | 'IA Predictiva AulaCore';
  onboardingAutoRules: boolean;
}

// INITIAL SEED DATA
const DEFAULT_SETTINGS: InstitutionalSettings = {
  name: 'Gimnasio Campestre AulaCore',
  slogan: 'Liderazgo, Ciencia y Convivencia para el Futuro',
  daneCode: '111001012345',
  nit: '900.123.456-7',
  resolution: 'Resolución 1234 del 12 de Octubre de 2022 - MinEducación',
  legalNature: 'Privada',
  rectorName: 'Dra. Mariana Restrepo Restrepo',
  secretaryName: 'Dr. Carlos Mario Hoyos',
  logoPrincipal: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=120',
  logoSecundario: '',
  signatureUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=80',
  sedes: [
    { 
      id: 's-1', 
      name: 'Sede Principal (Altos de la Colina)', 
      address: 'Calle 140 # 11 - 45, Bogotá',
      jornadas: ['Mañana', 'Única'],
      levels: ['Primaria', 'Bachillerato', 'Media']
    },
    { 
      id: 's-2', 
      name: 'Sede Campestre (Preescolar & Primaria)', 
      address: 'Km 12 Vía Las Palmas, Medellín',
      jornadas: ['Mañana'],
      levels: ['Preescolar', 'Primaria']
    }
  ],
  minPassGrade: 3.3,
  periodsCount: 4,
  scales: [
    { label: 'Desempeño Superior', min: 4.6, max: 5.0, color: 'emerald', description: 'Supera de forma excepcional todos los logros y compromisos académicos.' },
    { label: 'Desempeño Alto', min: 4.0, max: 4.5, color: 'indigo', description: 'Cumple satisfactoriamente con los logros con alto nivel intelectual.' },
    { label: 'Desempeño Básico', min: 3.3, max: 3.9, color: 'amber', description: 'Alcanza los objetivos mínimos requeridos con esfuerzo regular.' },
    { label: 'Desempeño Bajo', min: 1.0, max: 3.2, color: 'rose', description: 'No alcanza los objetivos curriculares mínimos. Requiere plan de apoyo.' }
  ],
  bulletinShowPhoto: true,
  bulletinShowRanking: true,
  observadorAutosave: true,
  primaryColor: '#6366f1', // default indigo
  sidebarColor: 'slate-900',
  backgroundStyle: 'dots',
  faviconUrl: '',
  rfidTolerance: 15,
  rfidAlertsEnabled: true,
  rfidZones: ['Portería Principal', 'Acceso Primaria', 'Biblioteca', 'Comedor'],
  rfidTerminals: [
    { id: 'rf-1', name: 'Lector Portería Principal A', zone: 'Portería Principal', status: 'online' },
    { id: 'rf-2', name: 'Lector Acceso Primaria B', zone: 'Acceso Primaria', status: 'online' },
    { id: 'rf-3', name: 'Lector Biblioteca Central', zone: 'Biblioteca', status: 'online' },
    { id: 'rf-4', name: 'Lector Zona Comedor', zone: 'Comedor', status: 'offline' }
  ],
  whatsappEnabled: true,
  whatsappApiKey: 'waba_live_prod_54930103958102',
  smsGatewayEnabled: true,
  emailSmtpHost: 'smtp.aulacore.edu.co',
  pushNotificationsEnabled: true,
  academicRiskThreshold: 75,
  desertionPredictionModel: 'IA Predictiva AulaCore',
  onboardingAutoRules: true
};

const SEED_LOGS: AuditLog[] = [
  { id: 'log-1', user: 'm.restrepo@aulacore.edu.co', action: 'Actualizó paleta de colores institucional', ip: '190.24.45.12', time: 'Hace 5 minutos' },
  { id: 'log-2', user: 'c.hoyos@aulacore.edu.co', action: 'Generó nuevo link de matrícula digital ordinario', ip: '190.24.45.13', time: 'Hace 23 minutos' },
  { id: 'log-3', user: 'admin.aulacore', action: 'Habilitó módulo de predicción de deserción AI', ip: '186.115.30.94', time: 'Hace 2 horas' },
  { id: 'log-4', user: 'c.hoyos@aulacore.edu.co', action: 'Aprobó expediente de matrícula de Andres Gómez CC-1098', ip: '190.24.45.13', time: 'Hace 3 horas' },
  { id: 'log-5', user: 'm.restrepo@aulacore.edu.co', action: 'Modificó tolerancia de llegadas tarde RFID a 15min', ip: '190.24.45.12', time: 'Ayer, 04:30 PM' }
];

const SEED_SESSIONS: ActiveSession[] = [
  { id: 'ses-1', user: 'Mariana Restrepo (Rectoría)', role: 'Rector(a)', device: 'Safari - macOS Sequoia', ip: '190.24.45.12', location: 'Bogotá, Colombia', activeTime: 'Activa ahora' },
  { id: 'ses-2', user: 'Carlos Mario Hoyos (Secretaría)', role: 'Secretario Académico', device: 'Chrome - Windows 11', ip: '190.24.45.13', location: 'Bogotá, Colombia', activeTime: 'Activa hace 12 min' },
  { id: 'ses-3', user: 'Soporte AulaCore AI', role: 'Administrador de Sistema', device: 'NodeJS API Client', ip: '34.200.43.111', location: 'Virginia, US', activeTime: 'Activa hace 1 h' }
];

export default function InstitucionSettingsPage() {
  const [settings, setSettings] = useState<InstitutionalSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'perfil' | 'sedes' | 'academico' | 'rfid' | 'comunicaciones' | 'ia' | 'seguridad'>('perfil');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Dynamic lists states
  const [sedesList, setSedesList] = useState<Sede[]>(DEFAULT_SETTINGS.sedes);
  const [sessions, setSessions] = useState<ActiveSession[]>(SEED_SESSIONS);
  const [logs, setLogs] = useState<AuditLog[]>(SEED_LOGS);
  
  // Temporary forms
  const [newSedeName, setNewSedeName] = useState('');
  const [newSedeAddress, setNewSedeAddress] = useState('');
  const [newSedeJornadas, setNewSedeJornadas] = useState<string[]>(['Mañana']);
  const [newSedeLevels, setNewSedeLevels] = useState<string[]>(['Primaria', 'Bachillerato']);

  // RFID virtual terminal form
  const [newRfidName, setNewRfidName] = useState('');
  const [newRfidZone, setNewRfidZone] = useState('Portería Principal');

  // Logo Upload ref & handler
  const logoInputRef = useRef<HTMLInputElement>(null);
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerToast('⚠️ El logotipo no debe superar los 2 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        handleUpdateSetting('logoPrincipal', base64);
        triggerToast('✓ Logotipo institucional actualizado con éxito.');
        
        // Log audit
        const newAudit: AuditLog = {
          id: 'log-' + Date.now(),
          user: 'm.restrepo@aulacore.edu.co',
          action: 'Actualizó el logotipo principal de la institución',
          ip: '190.24.45.12',
          time: 'Hace unos instantes'
        };
        setLogs(prev => [newAudit, ...prev]);
      };
      reader.onerror = () => {
        triggerToast('⚠️ Error al leer el archivo de imagen.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Load from local storage if exists
  useEffect(() => {
    const saved = localStorage.getItem('aulacore-institucion-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        if (parsed.sedes) setSedesList(parsed.sedes);
      } catch (e) {
        console.error('Error loading institutional settings', e);
      }
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleUpdateSetting = (field: keyof InstitutionalSettings, value: any) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    localStorage.setItem('aulacore-institucion-settings', JSON.stringify(updated));
  };

  // Add new Sede
  const handleAddSede = () => {
    if (!newSedeName || !newSedeAddress) {
      triggerToast('⚠️ Por favor escribe el nombre y la dirección de la sede.');
      return;
    }
    const newS: Sede = {
      id: 's-' + Date.now(),
      name: newSedeName,
      address: newSedeAddress,
      jornadas: newSedeJornadas,
      levels: newSedeLevels
    };
    const updatedList = [...sedesList, newS];
    setSedesList(updatedList);
    handleUpdateSetting('sedes', updatedList);
    
    // Log audit
    const newAudit: AuditLog = {
      id: 'log-' + Date.now(),
      user: 'm.restrepo@aulacore.edu.co',
      action: `Creó la nueva sede: ${newSedeName}`,
      ip: '190.24.45.12',
      time: 'Hace unos instantes'
    };
    setLogs([newAudit, ...logs]);

    // Reset Form
    setNewSedeName('');
    setNewSedeAddress('');
    triggerToast('✓ Sede registrada con éxito.');
  };

  // Delete Sede
  const handleDeleteSede = (id: string, name: string) => {
    const updatedList = sedesList.filter(s => s.id !== id);
    setSedesList(updatedList);
    handleUpdateSetting('sedes', updatedList);
    
    // Log audit
    const newAudit: AuditLog = {
      id: 'log-' + Date.now(),
      user: 'm.restrepo@aulacore.edu.co',
      action: `Eliminó la sede: ${name}`,
      ip: '190.24.45.12',
      time: 'Hace unos instantes'
    };
    setLogs([newAudit, ...logs]);
    triggerToast('✓ Sede eliminada del registro.');
  };

  // Revoke staff session
  const handleRevokeSession = (id: string, user: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    
    // Log audit
    const newAudit: AuditLog = {
      id: 'log-' + Date.now(),
      user: 'Mariana Restrepo (Super Admin)',
      action: `Revocó sesión activa IP de ${user}`,
      ip: '190.24.45.12',
      time: 'Hace unos instantes'
    };
    setLogs([newAudit, ...logs]);
    triggerToast(`🔒 Sesión de ${user} revocada de forma inmediata.`);
  };

  // Add RFID Reader
  const handleAddRfidReader = () => {
    if (!newRfidName) {
      triggerToast('⚠️ Por favor escribe el nombre de la terminal RFID.');
      return;
    }
    const newTerminal = {
      id: 'rf-' + Date.now(),
      name: newRfidName,
      zone: newRfidZone,
      status: 'online' as const
    };
    const updatedTerminals = [...settings.rfidTerminals, newTerminal];
    handleUpdateSetting('rfidTerminals', updatedTerminals);
    
    // Log audit
    const newAudit: AuditLog = {
      id: 'log-' + Date.now(),
      user: 'm.restrepo@aulacore.edu.co',
      action: `Agregó terminal RFID en portería: ${newRfidName}`,
      ip: '190.24.45.12',
      time: 'Hace unos instantes'
    };
    setLogs([newAudit, ...logs]);
    setNewRfidName('');
    triggerToast('✓ Terminal RFID de portería vinculada.');
  };

  // Toggle status of RFID reader
  const handleToggleTerminal = (id: string) => {
    const updatedTerminals = settings.rfidTerminals.map(term => {
      if (term.id === id) {
        return { ...term, status: term.status === 'online' ? 'offline' as const : 'online' as const };
      }
      return term;
    });
    handleUpdateSetting('rfidTerminals', updatedTerminals);
    triggerToast('✓ Estado de la terminal modificado.');
  };

  // Save all settings manually visual trigger
  const handleSaveAll = () => {
    localStorage.setItem('aulacore-institucion-settings', JSON.stringify(settings));
    triggerToast('🚀 Configuración guardada en la base de datos de AulaCore.');
  };

  const TABS_CONFIG = [
    { id: 'perfil' as const, label: 'Perfil & Branding', icon: Building2 },
    { id: 'sedes' as const, label: 'Sedes & Estructura', icon: Blocks },
    { id: 'academico' as const, label: 'Configuración Académica', icon: Award },
    { id: 'rfid' as const, label: 'RFID & Portería', icon: Activity },
    { id: 'comunicaciones' as const, label: 'Comunicaciones', icon: Smartphone },
    { id: 'ia' as const, label: 'IA & Reglas', icon: Sparkles },
    { id: 'seguridad' as const, label: 'Seguridad & Logs', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/20 flex flex-col py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      
      {/* Toast Notification Stack */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white font-bold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Settings Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-indigo-600 animate-spin-slow" /> Datos de la Institución
          </h1>
          <p className="text-xs text-slate-500 font-bold tracking-wide mt-1 uppercase">Centro operativo maestro y diseño de marca de AulaCore</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full select-none">
            ✓ Auto-save activo
          </span>
          <button 
            onClick={handleSaveAll}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer"
          >
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Tabs navigation list - enlarged font size and padding */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin border-b border-slate-200/65">
        {TABS_CONFIG.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 cursor-pointer border shadow-sm",
                isActive 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-800 shadow font-black ring-1 ring-indigo-500/5" 
                  : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
              )}
            >
              <tab.icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-indigo-600 animate-pulse" : "text-slate-400")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dual Column grid layout for premium Real-Time Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form & Panel contents (8 cols on large screens) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 min-h-[480px]">
          
          {/* TAB 1: PERFIL & BRANDING */}
          {activeTab === 'perfil' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-none flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-500" /> Identidad y Datos Legales
                </h2>
                <p className="text-sm text-slate-550 font-semibold mt-2">Modifica los datos maestros de tu colegio. Se verán reflejados en actas, boletines y reportes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="md:col-span-2">
                  <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Nombre de la Institución</label>
                  <input 
                    type="text"
                    value={settings.name}
                    onChange={(e) => handleUpdateSetting('name', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Eslogan o Lema Institucional</label>
                  <input 
                    type="text"
                    value={settings.slogan}
                    placeholder="Ej. 'Disciplina, Ciencia y Virtud'"
                    onChange={(e) => handleUpdateSetting('slogan', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm italic"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Código DANE Oficial</label>
                  <input 
                    type="text"
                    value={settings.daneCode}
                    onChange={(e) => handleUpdateSetting('daneCode', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">NIT Institucional</label>
                  <input 
                    type="text"
                    value={settings.nit}
                    onChange={(e) => handleUpdateSetting('nit', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Resolución de Funcionamiento</label>
                  <input 
                    type="text"
                    value={settings.resolution}
                    onChange={(e) => handleUpdateSetting('resolution', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Naturaleza Jurídica</label>
                  <select
                    value={settings.legalNature}
                    onChange={(e) => handleUpdateSetting('legalNature', e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                  >
                    <option value="Oficial">Pública (Oficial)</option>
                    <option value="Privada">Privada</option>
                    <option value="Concesión">Concesión</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Color Primario Institucional</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleUpdateSetting('primaryColor', e.target.value)}
                      className="w-12 h-11 border border-slate-200 rounded-xl cursor-pointer bg-transparent"
                    />
                    <input 
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => handleUpdateSetting('primaryColor', e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Rector(a) Asignado</label>
                  <input 
                    type="text"
                    value={settings.rectorName}
                    onChange={(e) => handleUpdateSetting('rectorName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Secretaría Académica</label>
                  <input 
                    type="text"
                    value={settings.secretaryName}
                    onChange={(e) => handleUpdateSetting('secretaryName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>

                {/* Active logo upload */}
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="md:col-span-2 border border-dashed border-indigo-250 bg-indigo-50/10 rounded-2xl p-6 hover:bg-indigo-50/20 hover:border-indigo-400 transition-all flex flex-col items-center justify-center text-center cursor-pointer group relative overflow-hidden"
                >
                  <input 
                    type="file" 
                    ref={logoInputRef} 
                    onChange={handleLogoUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  {settings.logoPrincipal && settings.logoPrincipal !== 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=120' && !settings.logoPrincipal.startsWith('https://images.unsplash.com') ? (
                    <div className="flex flex-col items-center justify-center relative">
                      <img 
                        src={settings.logoPrincipal} 
                        alt="Logotipo Principal" 
                        className="h-16 w-16 rounded-xl object-cover bg-white border border-slate-200 shadow-md mb-2 group-hover:scale-105 transition-transform"
                      />
                      <h4 className="text-xs font-black text-slate-800">Logotipo Institucional Personalizado</h4>
                      <p className="text-[9px] text-slate-400 font-semibold mt-1">Haz clic aquí para cambiar o actualizar el logotipo de tu plantel educativo.</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateSetting('logoPrincipal', '');
                          triggerToast('✓ Se restableció el logotipo por defecto.');
                        }}
                        className="absolute -top-2 -right-12 bg-rose-50 text-rose-500 hover:bg-rose-100 p-1.5 rounded-lg border border-rose-250 transition-colors shadow-sm"
                        title="Restablecer por defecto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <CloudUpload className="w-10 h-10 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                      <h4 className="text-xs font-bold text-slate-700">Logotipo Institucional Principal</h4>
                      <p className="text-[9px] text-slate-400 font-semibold mt-1">Sube el escudo o emblema oficial. Formatos PNG, SVG con fondo transparente preferible.</p>
                      <span className="text-[8px] bg-indigo-50 text-indigo-755 font-bold px-2 py-0.5 rounded uppercase mt-3">Logo Campestre indexado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEDES, JORNADAS & JURISDICCIONES */}
          {activeTab === 'sedes' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-none flex items-center gap-2">
                  <Blocks className="w-5 h-5 text-indigo-500" /> Planteles y Distribución Física
                </h2>
                <p className="text-sm text-slate-550 font-semibold mt-2">Crea, edita y administra las sedes de tu institución y define sus niveles académicos vinculados.</p>
              </div>

              {/* Registered Seats Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sedesList.map(sede => (
                  <div key={sede.id} className="border border-slate-200 rounded-2xl p-5 bg-white relative hover:shadow-md transition-all space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded mb-1.5 inline-block">
                          Sede Activa
                        </span>
                        <h4 className="text-sm font-black text-slate-800 tracking-tight leading-tight">{sede.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{sede.address}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteSede(sede.id, sede.name)}
                        className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar Sede"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-600">
                      <div>
                        <span className="font-bold text-slate-400">Jornadas:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sede.jornadas.map(j => (
                            <span key={j} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">{j}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400">Niveles Educativos:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sede.levels.map(l => (
                            <span key={l} className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded font-bold">{l}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Sede Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4 shadow-inner">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" /> Agregar Sede del Colegio
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-1 block">Nombre de la Sede</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Sede Norte Primaria"
                      value={newSedeName} 
                      onChange={(e) => setNewSedeName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-1 block">Dirección Física</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Avenida Norte #10-23"
                      value={newSedeAddress} 
                      onChange={(e) => setNewSedeAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Niveles Educativos Dictados</label>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                      {['Preescolar', 'Primaria', 'Bachillerato', 'Media'].map(lvl => {
                        const isChecked = newSedeLevels.includes(lvl);
                        return (
                          <label key={lvl} className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) setNewSedeLevels(newSedeLevels.filter(x => x !== lvl));
                                else setNewSedeLevels([...newSedeLevels, lvl]);
                              }}
                              className="rounded border-slate-300 text-indigo-600"
                            />
                            <span>{lvl}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleAddSede}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all"
                >
                  Registrar Sede
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CONFIGURACIÓN ACADÉMICA */}
          {activeTab === 'academico' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-none flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-500" /> Estándares Académicos y Boletines
                </h2>
                <p className="text-sm text-slate-550 font-semibold mt-2">Configura las reglas cuantitativas, escalas, boletines y el comportamiento del observador escolar.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Nota de aprobación / Periodos */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Reglas de Calificación</h3>
                  
                  <div>
                    <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Nota Mínima de Aprobación</label>
                    <input 
                      type="number"
                      step={0.1}
                      min={1}
                      max={5}
                      value={settings.minPassGrade}
                      onChange={(e) => handleUpdateSetting('minPassGrade', parseFloat(e.target.value))}
                      className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-indigo-700 outline-none text-center"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 font-semibold">Típicamente en Colombia se establece 3.0 o 3.3 sobre 5.0.</p>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Periodos Académicos Anuales</label>
                    <select
                      value={settings.periodsCount}
                      onChange={(e) => handleUpdateSetting('periodsCount', parseInt(e.target.value, 10))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm sm:text-base font-semibold text-slate-800 outline-none"
                    >
                      <option value={3}>3 Periodos (Trimestres)</option>
                      <option value={4}>4 Periodos (Bimestres - Por defecto)</option>
                      <option value={2}>2 Periodos (Semestral)</option>
                    </select>
                  </div>
                </div>

                {/* Configuración Boletín & Observador */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Boletines & Observador</h3>
                  
                  {[
                    { label: 'Mostrar Fotografía del Estudiante en boletín', field: 'bulletinShowPhoto' },
                    { label: 'Habilitar puesto de ranking del curso en reportes', field: 'bulletinShowRanking' },
                    { label: 'Auto-guardado reactivo en el observador escolar', field: 'observadorAutosave' },
                  ].map(toggle => (
                    <div key={toggle.field} className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold text-slate-700 leading-snug">{toggle.label}</span>
                      <button
                        onClick={() => handleUpdateSetting(toggle.field as keyof InstitutionalSettings, !settings[toggle.field as keyof InstitutionalSettings])}
                        className={cn(
                          "w-10 h-5 rounded-full relative transition-colors cursor-pointer shrink-0",
                          settings[toggle.field as keyof InstitutionalSettings] ? "bg-emerald-500" : "bg-slate-350"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                          settings[toggle.field as keyof InstitutionalSettings] ? "left-5" : "left-1"
                        )}></div>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Escala de notas detallada */}
                <div className="md:col-span-2 space-y-4">
                  <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider block">Escala Valorativa Nacional (Decreto 1290)</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {settings.scales.map((scale, index) => (
                      <div key={scale.label} className="border border-slate-200 rounded-2xl p-4 bg-white hover:shadow transition-all space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "w-3 h-3 rounded-full shrink-0",
                            scale.color === 'emerald' ? 'bg-emerald-500' :
                            scale.color === 'indigo' ? 'bg-indigo-500' :
                            scale.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                          )}></span>
                          <h4 className="text-xs font-black text-slate-800">{scale.label}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed leading-normal">{scale.description}</p>
                        
                        <div className="flex gap-2 items-center text-xs pt-1">
                          <span className="text-[10px] text-slate-400 font-black">Rango:</span>
                          <input 
                            type="number"
                            step={0.1}
                            value={scale.min}
                            onChange={(e) => {
                              const updatedScales = [...settings.scales];
                              updatedScales[index].min = parseFloat(e.target.value);
                              handleUpdateSetting('scales', updatedScales);
                            }}
                            className="w-12 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-bold text-center"
                          />
                          <span className="text-slate-450">-</span>
                          <input 
                            type="number"
                            step={0.1}
                            value={scale.max}
                            onChange={(e) => {
                              const updatedScales = [...settings.scales];
                              updatedScales[index].max = parseFloat(e.target.value);
                              handleUpdateSetting('scales', updatedScales);
                            }}
                            className="w-12 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-bold text-center"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: DISPOSITIVOS RFID & SEGURIDAD FÍSICA */}
          {activeTab === 'rfid' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-none flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500 animate-pulse" /> RFID, Portería y Accesos Biométricos
                </h2>
                <p className="text-sm text-slate-550 font-semibold mt-2">Conecta las terminales lectoras y ajusta las alertas automáticas de asistencia por control de accesos.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Reglas de Tolerancia RFID */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Reglas de Asistencia</h3>
                  
                  <div>
                    <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Tolerancia para Llegadas Tarde</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="number"
                        min={0}
                        max={60}
                        value={settings.rfidTolerance}
                        onChange={(e) => handleUpdateSetting('rfidTolerance', parseInt(e.target.value, 10))}
                        className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-indigo-700 outline-none text-center"
                      />
                      <span className="text-xs text-slate-700 font-bold">Minutos</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-semibold leading-normal">
                      Pasados estos minutos, se marcará inasistencia o retraso y se enviará una notificación al acudiente.
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs pt-2">
                    <span className="font-semibold text-slate-700 leading-snug">Disparar Alertas automáticas por RFID a Acudientes</span>
                    <button
                      onClick={() => handleUpdateSetting('rfidAlertsEnabled', !settings.rfidAlertsEnabled)}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-colors cursor-pointer shrink-0",
                        settings.rfidAlertsEnabled ? "bg-emerald-500" : "bg-slate-350"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                        settings.rfidAlertsEnabled ? "left-5" : "left-1"
                      )}></div>
                    </button>
                  </div>
                </div>

                {/* Zonas Monitoreadas */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Zonas Físicas Seguras</h3>
                  <div className="flex flex-wrap gap-2">
                    {settings.rfidZones.map(zone => (
                      <span key={zone} className="bg-white border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                        📍 {zone}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Las zonas geográficas delimitan el despliegue del mapa interno de seguridad de AulaCore para el control de aforos.
                  </p>
                </div>

                {/* Registered RFID hardware terminals list */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider block">Lectores de Portería RFID Vinculados</label>
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded">IoT Core Activo</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {settings.rfidTerminals.map(term => (
                      <div key={term.id} className="border border-slate-200 rounded-2xl p-4 bg-white hover:shadow transition-all flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm",
                            term.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                          )}>
                            📡
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 leading-none">{term.name}</h4>
                            <p className="text-[9px] text-slate-400 font-semibold mt-1">Zona: {term.zone}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleTerminal(term.id)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[9px] font-black uppercase transition-all tracking-wider cursor-pointer",
                            term.status === 'online' 
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          )}
                        >
                          {term.status}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New virtual RFID reader */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-1 block">Nombre de Lector IoT</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Terminal Acceso Comedor C"
                        value={newRfidName} 
                        onChange={(e) => setNewRfidName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div className="w-full sm:w-48">
                      <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-1 block">Zona Asignada</label>
                      <select 
                        value={newRfidZone} 
                        onChange={(e) => setNewRfidZone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none"
                      >
                        {settings.rfidZones.map(z => (
                          <option key={z} value={z}>{z}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleAddRfidReader}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer"
                    >
                      + Vincular Lector
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: COMUNICACIONES MULTICANAL */}
          {activeTab === 'comunicaciones' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-none flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-500" /> Canales de Comunicación Automatizados
                </h2>
                <p className="text-sm text-slate-550 font-semibold mt-2">Conecta la plataforma con los canales de salida para alertas, notas y reportes diarios a padres de familia.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* WhatsApp configuration */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                      <MessageSquare className="w-5 h-5 text-emerald-500 animate-pulse" /> WhatsApp Business API
                    </span>
                    <button
                      onClick={() => handleUpdateSetting('whatsappEnabled', !settings.whatsappEnabled)}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-colors cursor-pointer",
                        settings.whatsappEnabled ? "bg-emerald-500" : "bg-slate-350"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                        settings.whatsappEnabled ? "left-5" : "left-1"
                      )}></div>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                    Envío automático de notificaciones de retardo, circulares institucionales breves y alertas críticas de convivencia.
                  </p>
                  
                  {settings.whatsappEnabled && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Token API (Live)</label>
                      <input 
                        type="password"
                        value={settings.whatsappApiKey}
                        onChange={(e) => handleUpdateSetting('whatsappApiKey', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Email Server (SMTP) */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                      <Mail className="w-5 h-5 text-indigo-500 animate-pulse" /> SMTP Institucional
                    </span>
                    <span className="text-[8px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded uppercase">
                      Conectado
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                    Envío masivo de boletines oficiales trimestrales, fichas del observador firmadas jurídicamente y recibos de pago.
                  </p>
                  
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Servidor SMTP Principal</label>
                    <input 
                      type="text"
                      value={settings.emailSmtpHost}
                      onChange={(e) => handleUpdateSetting('emailSmtpHost', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 outline-none"
                    />
                  </div>
                </div>

                {/* SMS & Push Gateway alerts */}
                <div className="md:col-span-2 bg-slate-50/50 border border-slate-200 rounded-3xl p-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">SMS y Notificaciones en App</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">SMS Gateway Activo (Alertas sin Internet)</span>
                      <button
                        onClick={() => handleUpdateSetting('smsGatewayEnabled', !settings.smsGatewayEnabled)}
                        className={cn(
                          "w-10 h-5 rounded-full relative transition-colors cursor-pointer shrink-0",
                          settings.smsGatewayEnabled ? "bg-emerald-500" : "bg-slate-350"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                          settings.smsGatewayEnabled ? "left-5" : "left-1"
                        )}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Notificaciones Push (App Móvil AulaCore)</span>
                      <button
                        onClick={() => handleUpdateSetting('pushNotificationsEnabled', !settings.pushNotificationsEnabled)}
                        className={cn(
                          "w-10 h-5 rounded-full relative transition-colors cursor-pointer shrink-0",
                          settings.pushNotificationsEnabled ? "bg-emerald-500" : "bg-slate-350"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                          settings.pushNotificationsEnabled ? "left-5" : "left-1"
                        )}></div>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: IA Y AUTOMATIZACIÓN DE PROCESOS */}
          {activeTab === 'ia' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-none flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" /> Inteligencia Artificial e Inducciones Automatizadas
                </h2>
                <p className="text-sm text-slate-550 font-semibold mt-2">Configura las reglas lógicas que controlan los modelos predictivos de riesgo y el onboarding maestro.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Risk and Prediction Sliders */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Detección de Riesgo Curricular</h3>
                  
                  <div>
                    <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">
                      Sensibilidad Alertas de Deserción: {settings.academicRiskThreshold}%
                    </label>
                    <input 
                      type="range"
                      min={50}
                      max={95}
                      value={settings.academicRiskThreshold}
                      onChange={(e) => handleUpdateSetting('academicRiskThreshold', parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase mt-1 leading-none">
                      <span>Más Sensible (50%)</span>
                      <span>Estándar (75%)</span>
                      <span>Filtrado Alto (95%)</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2 block">Modelo de Inteligencia Artificial Activo</label>
                    <select
                      value={settings.desertionPredictionModel}
                      onChange={(e) => handleUpdateSetting('desertionPredictionModel', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm sm:text-base font-semibold text-slate-800 outline-none"
                    >
                      <option value="Básico">Análisis Estadístico Básico (Reglas tradicionales)</option>
                      <option value="IA Predictiva AulaCore">IA Predictiva AulaCore (Red neuronal de comportamiento de asistencia)</option>
                    </select>
                  </div>
                </div>

                {/* Auto-onboarding configurations */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Reglas de Aprovisionamiento</h3>
                    <p className="text-[10px] text-slate-450 leading-relaxed font-semibold mt-2">
                      Al aprobar matrículas u onboarding docentes en la cola, el sistema creará perfiles de forma 100% automatizada sin intervención de TI.
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs pt-4">
                    <span className="font-bold text-slate-750">Provisionamiento Automático de Cuentas</span>
                    <button
                      onClick={() => handleUpdateSetting('onboardingAutoRules', !settings.onboardingAutoRules)}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-colors cursor-pointer shrink-0",
                        settings.onboardingAutoRules ? "bg-emerald-500" : "bg-slate-350"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                        settings.onboardingAutoRules ? "left-5" : "left-1"
                      )}></div>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: SEGURIDAD, AUDITORÍA Y SESIONES ACTIVAS */}
          {activeTab === 'seguridad' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-none flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" /> Seguridad, Control de Sesiones y Auditoría
                </h2>
                <p className="text-sm text-slate-550 font-semibold mt-2">Inspecciona el personal administrativo conectado y mantén el registro forense de cambios de la institución.</p>
              </div>

              <div className="space-y-6 pt-2">
                
                {/* Active Sessions list */}
                <div className="space-y-3">
                  <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider block">Sesiones Activas de Directivos (Token Revocation)</label>
                  
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-700">
                      <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Usuario / Cargo</th>
                          <th className="px-4 py-3">Dispositivo / IP</th>
                          <th className="px-4 py-3">Ubicación</th>
                          <th className="px-4 py-3 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sessions.map(ses => (
                          <tr key={ses.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3.5">
                              <div>
                                <p className="font-bold text-slate-800">{ses.user}</p>
                                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">{ses.role}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div>
                                <p className="text-[11px] text-slate-650 font-medium">{ses.device}</p>
                                <p className="text-[9px] text-slate-400 font-mono">{ses.ip}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div>
                                <p className="text-[11px]">{ses.location}</p>
                                <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded uppercase mt-0.5">
                                  {ses.activeTime}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => handleRevokeSession(ses.id, ses.user)}
                                className="text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ml-auto font-black uppercase text-[9px] border border-rose-100"
                              >
                                <LogOut className="w-3 h-3" /> Revocar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Audit Logs table */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider block">Registro Forense Maestro (Audit Logs)</label>
                    <span className="text-[8px] font-black text-slate-400 bg-slate-100 border px-2 py-0.5 rounded">Solo Lectura</span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white max-h-[220px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-650">
                      <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider sticky top-0">
                        <tr>
                          <th className="px-4 py-3">Marca de Tiempo</th>
                          <th className="px-4 py-3">Operario</th>
                          <th className="px-4 py-3">Acción Registrada</th>
                          <th className="px-4 py-3 text-right">Dirección IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {logs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-mono text-[10px] text-slate-400 whitespace-nowrap">{log.time}</td>
                            <td className="px-4 py-3 font-bold text-slate-800">{log.user}</td>
                            <td className="px-4 py-3 font-medium text-slate-650 leading-snug">{log.action}</td>
                            <td className="px-4 py-3 text-right font-mono text-[9px] text-slate-400">{log.ip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Right Column: Dynamic Real-Time Preview (Restored to 4 columns for exact layout preservation) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-2xl space-y-5 sticky top-6">
            
            {/* Header branding widget preview */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded block">
                  Vista Previa en Vivo
                </span>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-1">Branding Corporativo</h4>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 opacity-80 animate-pulse"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 opacity-80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-80"></span>
              </div>
            </div>

            {/* MOCKUP CONTAINER - Reflects settings values in real-time - Optimized for 4-column space with clear readability */}
            <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden shadow-xl p-4 space-y-4">
              
              {/* Mockup Header bar */}
              <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 border-b border-slate-850/60 pb-2.5">
                <div className="flex items-center gap-2 max-w-[65%]">
                  {/* Mock school logo principal */}
                  <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center font-bold text-xs shrink-0" style={{ color: settings.primaryColor, boxShadow: `0 0 10px ${settings.primaryColor}15` }}>
                    {settings.name ? settings.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <span className="truncate font-semibold text-slate-100 text-[11px] tracking-tight">{settings.name || 'AulaCore School'}</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-350 text-[9px] font-mono max-w-[35%] shrink-0">
                  <span className="text-[7.5px] font-medium text-slate-500">DANE:</span>
                  <span className="text-slate-200 font-semibold truncate">{settings.daneCode || 'N/A'}</span>
                </div>
              </div>

              {/* Mockup Body area - h-44 is the ultimate sweet spot for 4-col laptop and desktop screens */}
              <div className="grid grid-cols-12 gap-3 h-44 items-stretch">
                
                {/* Mock sidebar (reflects selected primaryColor and layout theme) - Widen to col-span-5 and enhanced for maximum legibility */}
                <div className="col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between shadow-inner">
                  <div className="space-y-2">
                    <div className="w-full h-3 rounded bg-slate-850 flex items-center gap-1.5 px-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: settings.primaryColor }} />
                      <div className="w-6 h-1 rounded bg-slate-650" />
                    </div>
                    {[
                      { name: 'Cursos', icon: Blocks },
                      { name: 'Docentes', icon: Users },
                      { name: 'Calificaciones', icon: Award }
                    ].map((nav, i) => {
                      const Icon = nav.icon;
                      const isActive = i === 0;
                      return (
                        <div 
                          key={nav.name} 
                          className={cn(
                            "w-full py-1.5 px-2 rounded-lg flex items-center gap-2 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider transition-all select-none border border-transparent",
                            isActive ? "text-white font-semibold shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/40"
                          )}
                          style={isActive ? { 
                            borderLeft: `2.5px solid ${settings.primaryColor}`, 
                            color: settings.primaryColor, 
                            backgroundColor: `${settings.primaryColor}18` 
                          } : {}}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" style={isActive ? { color: settings.primaryColor } : { color: '#94a3b8' }} />
                          <span className="truncate">{nav.name}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-[7.5px] text-slate-500 font-mono tracking-widest text-center truncate pt-1.5 border-t border-slate-850/40 font-semibold">
                    AulaCore IA v2026
                  </div>
                </div>

                {/* Mock main card content */}
                <div className="col-span-7 space-y-2.5 h-full flex flex-col justify-between">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center space-y-1.5 flex-1 flex flex-col justify-center shadow-inner">
                    <p className="text-[8.5px] text-slate-500 uppercase tracking-widest font-medium leading-none">Lema Institucional</p>
                    <p className="text-[10px] sm:text-[11px] font-medium text-slate-200 tracking-tight leading-relaxed italic px-0.5 line-clamp-3">
                      "{settings.slogan || 'Liderazgo y Ciencia'}"
                    </p>
                  </div>

                  <div className="flex gap-2 items-center">
                    {/* Primary Button preview */}
                    <button 
                      type="button"
                      className="flex-1 h-7.5 rounded-lg text-[9px] text-white font-semibold uppercase tracking-wider text-center shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                      style={{ 
                        backgroundColor: settings.primaryColor,
                        boxShadow: `0 4px 10px ${settings.primaryColor}20`
                      }}
                    >
                      Botón Primario
                    </button>
                    {/* Secondary tag preview */}
                    <span 
                      className="w-7.5 h-7.5 rounded-lg flex items-center justify-center font-semibold text-xs shadow-inner border border-slate-800"
                      style={{ 
                        backgroundColor: `${settings.primaryColor}15`, 
                        color: settings.primaryColor,
                        borderColor: `${settings.primaryColor}30`
                      }}
                    >
                      ✓
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Visual preview specs card - Rebuilt to be incredibly modern, clean, and highly legible */}
            <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-4.5 space-y-3.5 text-xs text-slate-350 shadow-lg">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Especificaciones de Marca
              </h4>
              
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5 select-none">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" /> NIT:
                  </span>
                  <span className="text-slate-100 font-semibold font-mono">{settings.nit || 'Sin asignar'}</span>
                </div>
                
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5 select-none">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> Rector(a):
                  </span>
                  <span className="text-slate-100 font-semibold truncate max-w-[155px]">{settings.rectorName || 'Sin asignar'}</span>
                </div>
                
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5 select-none">
                    <Blocks className="w-3.5 h-3.5 text-slate-500" /> Sedes:
                  </span>
                  <span className="text-slate-100 font-semibold">{sedesList.length} sedes registradas</span>
                </div>
                
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5 select-none">
                    <Sparkles className="w-3.5 h-3.5 text-slate-500" /> Color de Marca:
                  </span>
                  <span className="font-semibold font-mono flex items-center gap-1.5" style={{ color: settings.primaryColor }}>
                    <span className="w-2.5 h-2.5 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: settings.primaryColor }} />
                    {settings.primaryColor}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
