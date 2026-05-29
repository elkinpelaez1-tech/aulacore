'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Radio, Shield, Users, Search, Plus, X, 
  ChevronRight, RefreshCw, AlertTriangle, CheckCircle, 
  MapPin, Clock, Calendar, Check, Info, ShieldAlert,
  Smartphone, Eye, Power
} from 'lucide-react';
import { cn } from '@/lib/utils';

// TYPES & INTERFACES
interface AccessLog {
  timestamp: string;
  location: string;
  direction: 'Entrada' | 'Salida';
  status: 'Exitoso' | 'Denegado';
}

interface RFIDDevice {
  id: string;
  rfidCode: string;
  deviceType: 'Tarjeta' | 'Manilla' | 'Tag';
  status: 'Activo' | 'Suspendido' | 'Perdido' | 'Reposición';
  userName: string;
  role: 'Estudiante' | 'Docente' | 'Vigilancia' | 'Transporte' | 'Rector';
  avatar: string;
  course?: string;
  sede: string;
  jornada: string;
  lastAccessTime: string;
  lastAccessLocation: string;
  deliveryDate: string;
  deliveryBy: string;
  permissionLevel: 'Bajo' | 'Medio' | 'Crítico' | 'Elevado';
  observations: string;
  replacementsCount: number;
  accessLogs: AccessLog[];
}

// INITIAL HIGH FIDELITY SEED DATA
const SEED_RFID_DEVICES: RFIDDevice[] = [
  {
    id: 'rf-1',
    rfidCode: 'RF-8092-A',
    deviceType: 'Manilla',
    status: 'Activo',
    userName: 'Juan Pablo Montoya',
    role: 'Estudiante',
    avatar: '👦',
    course: '11-B',
    sede: 'Sede Campestre',
    jornada: 'Mañana',
    lastAccessTime: 'Hoy, 07:15 AM',
    lastAccessLocation: 'Portería Vehicular',
    deliveryDate: '12 Ene 2026',
    deliveryBy: 'Lic. Claudia Gómez',
    permissionLevel: 'Bajo',
    observations: 'Dispositivo nominal en manilla de silicona azul.',
    replacementsCount: 0,
    accessLogs: [
      { timestamp: 'Hoy, 07:15 AM', location: 'Portería Vehicular', direction: 'Entrada', status: 'Exitoso' },
      { timestamp: 'Ayer, 02:40 PM', location: 'Portería Peatonal', direction: 'Salida', status: 'Exitoso' },
      { timestamp: 'Ayer, 07:05 AM', location: 'Portería Vehicular', direction: 'Entrada', status: 'Exitoso' }
    ]
  },
  {
    id: 'rf-2',
    rfidCode: 'RF-1002-X',
    deviceType: 'Tarjeta',
    status: 'Activo',
    userName: 'Dr. Carlos Mario Hoyos',
    role: 'Rector',
    avatar: '👨‍💼',
    sede: 'Sede Principal',
    jornada: 'Completa',
    lastAccessTime: 'Ayer, 06:45 PM',
    lastAccessLocation: 'Acceso Administrativo',
    deliveryDate: '05 Ene 2026',
    deliveryBy: 'Soporte Técnico AulaCore',
    permissionLevel: 'Elevado',
    observations: 'Credencial corporativa con chip NTAG215 de alta seguridad.',
    replacementsCount: 1,
    accessLogs: [
      { timestamp: 'Ayer, 06:45 PM', location: 'Acceso Administrativo', direction: 'Salida', status: 'Exitoso' },
      { timestamp: 'Ayer, 07:30 AM', location: 'Portería Peatonal', direction: 'Entrada', status: 'Exitoso' }
    ]
  },
  {
    id: 'rf-3',
    rfidCode: 'RF-3391-B',
    deviceType: 'Tarjeta',
    status: 'Reposición',
    userName: 'Ing. Andrés Beltrán',
    role: 'Docente',
    avatar: '👨‍🏫',
    sede: 'Sede Principal',
    jornada: 'Mañana',
    lastAccessTime: 'Hace 2 días, 02:30 PM',
    lastAccessLocation: 'Acceso Primaria B',
    deliveryDate: '10 Ene 2026',
    deliveryBy: 'Rectoría',
    permissionLevel: 'Medio',
    observations: 'Reporta fallo intermitente en antena de biblioteca. Pendiente por cambio físico.',
    replacementsCount: 0,
    accessLogs: [
      { timestamp: 'Hace 2 días, 02:30 PM', location: 'Acceso Primaria B', direction: 'Salida', status: 'Exitoso' },
      { timestamp: 'Hace 2 días, 06:55 AM', location: 'Portería Peatonal', direction: 'Entrada', status: 'Exitoso' }
    ]
  },
  {
    id: 'rf-4',
    rfidCode: 'RF-9921-W',
    deviceType: 'Tag',
    status: 'Activo',
    userName: 'Don Ramón Valdés',
    role: 'Vigilancia',
    avatar: '👮',
    sede: 'Sede Campestre',
    jornada: 'Nocturna',
    lastAccessTime: 'Hoy, 05:40 AM',
    lastAccessLocation: 'Portería Peatonal',
    deliveryDate: '15 Ene 2026',
    deliveryBy: 'Coordinación',
    permissionLevel: 'Crítico',
    observations: 'Llavero RFID de alta resistencia para rondas perimetrales físicas.',
    replacementsCount: 2,
    accessLogs: [
      { timestamp: 'Hoy, 05:40 AM', location: 'Portería Peatonal', direction: 'Entrada', status: 'Exitoso' },
      { timestamp: 'Ayer, 06:10 AM', location: 'Portería Peatonal', direction: 'Salida', status: 'Exitoso' },
      { timestamp: 'Ayer, 05:55 PM', location: 'Portería Peatonal', direction: 'Entrada', status: 'Exitoso' }
    ]
  },
  {
    id: 'rf-5',
    rfidCode: 'RF-4882-C',
    deviceType: 'Manilla',
    status: 'Perdido',
    userName: 'Valentina Restrepo',
    role: 'Estudiante',
    avatar: '👧',
    course: '10-A',
    sede: 'Sede Principal',
    jornada: 'Tarde',
    lastAccessTime: 'Hace 3 días, 01:10 PM',
    lastAccessLocation: 'Portería Peatonal',
    deliveryDate: '20 Ene 2026',
    deliveryBy: 'Secretaría',
    permissionLevel: 'Bajo',
    observations: 'Reportado como extraviado por el acudiente en el patio escolar. Tarjeta anulada.',
    replacementsCount: 1,
    accessLogs: [
      { timestamp: 'Hace 3 días, 02:15 PM', location: 'Biblioteca Central', direction: 'Salida', status: 'Denegado' },
      { timestamp: 'Hace 3 días, 01:10 PM', location: 'Portería Peatonal', direction: 'Entrada', status: 'Exitoso' }
    ]
  },
  {
    id: 'rf-6',
    rfidCode: 'RF-7112-T',
    deviceType: 'Tag',
    status: 'Suspendido',
    userName: 'Carlos Andrés Gómez',
    role: 'Transporte',
    avatar: '👨‍🔧',
    sede: 'Sede Campestre',
    jornada: 'Completa',
    lastAccessTime: 'Hace 1 semana',
    lastAccessLocation: 'Acceso Parqueadero',
    deliveryDate: '18 Ene 2026',
    deliveryBy: 'Secretaría',
    permissionLevel: 'Bajo',
    observations: 'Tag vehicular suspendido temporalmente por retiro preventivo del bus.',
    replacementsCount: 0,
    accessLogs: [
      { timestamp: 'Hace 1 semana', location: 'Acceso Parqueadero', direction: 'Salida', status: 'Exitoso' }
    ]
  }
];

export default function RFIDDevicesManagerPage() {
  const [devices, setDevices] = useState<RFIDDevice[]>(SEED_RFID_DEVICES);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // New RFID modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [newRfid, setNewRfid] = useState('');
  const [newType, setNewType] = useState<RFIDDevice['deviceType']>('Tarjeta');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<RFIDDevice['role']>('Estudiante');
  const [newCourse, setNewCourse] = useState('');
  const [newSede, setNewSede] = useState('Sede Principal');
  const [newJornada, setNewJornada] = useState('Mañana');
  const [newPerm, setNewPerm] = useState<RFIDDevice['permissionLevel']>('Bajo');
  const [newObs, setNewObs] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResyncing, setIsResyncing] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load from local storage
  useEffect(() => {
    const raw = localStorage.getItem('aulacore-rfid-settings');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.length > 0) setDevices(parsed);
      } catch (e) {
        console.error('Error loading RFID settings', e);
      }
    }
  }, []);

  const saveDevices = (updatedList: RFIDDevice[]) => {
    setDevices(updatedList);
    localStorage.setItem('aulacore-rfid-settings', JSON.stringify(updatedList));
  };

  // Handle Quick State Change inside Drawer
  const handleChangeStatus = (id: string, nextStatus: RFIDDevice['status']) => {
    const updated = devices.map(d => {
      if (d.id === id) {
        let obs = d.observations;
        if (nextStatus === 'Perdido') obs = 'Anulado de forma reactiva por reporte de extravío.';
        if (nextStatus === 'Activo') obs = 'Re-activado y sincronizado exitosamente con la red de portería.';
        return {
          ...d,
          status: nextStatus,
          observations: obs
        };
      }
      return d;
    });
    saveDevices(updated);
    triggerToast(`✓ Credencial actualizada a estado: ${nextStatus}`);
  };

  // Wireless resync simulation
  const handleResyncDevice = (rfidCode: string) => {
    setIsResyncing(true);
    setTimeout(() => {
      setIsResyncing(false);
      triggerToast(`✓ Credencial ${rfidCode} re-sincronizada inalámbricamente con antenas RFID.`);
    }, 1200);
  };

  // Register new assigned RFID Device
  const handleAssignRFID = () => {
    if (!newRfid || !newName) {
      triggerToast('⚠️ Completa el código RFID y el nombre del portador.');
      return;
    }

    const avatars = {
      Estudiante: '👦',
      Docente: '👨‍🏫',
      Vigilancia: '👮',
      Transporte: '👨‍🔧',
      Rector: '👨‍💼'
    };

    const newD: RFIDDevice = {
      id: 'rf-' + Date.now(),
      rfidCode: newRfid.trim().toUpperCase(),
      deviceType: newType,
      status: 'Activo',
      userName: newName,
      role: newRole,
      avatar: avatars[newRole] || '👤',
      course: newRole === 'Estudiante' ? (newCourse || '10-A') : undefined,
      sede: newSede,
      jornada: newJornada,
      lastAccessTime: 'Sin accesos registrados',
      lastAccessLocation: 'Ninguna',
      deliveryDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      deliveryBy: 'Rectoría / Admisión',
      permissionLevel: newPerm,
      observations: newObs || 'Credencial inicial asignada correctamente.',
      replacementsCount: 0,
      accessLogs: []
    };

    const updated = [newD, ...devices];
    saveDevices(updated);
    
    // Clear form
    setNewRfid('');
    setNewName('');
    setNewCourse('');
    setNewObs('');
    setModalOpen(false);
    triggerToast(`✓ RFID ${newD.rfidCode} asignado con éxito a ${newD.userName}`);
  };

  // Selected device for side drawer
  const selectedDevice = devices.find(d => d.id === selectedDeviceId) || null;

  // Filter Logic
  const filteredDevices = devices.filter(d => {
    const matchesSearch = d.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.rfidCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'TODOS' || d.role.toUpperCase() === selectedRole;
    
    const matchesStatus = selectedStatus === 'TODOS' || d.status.toUpperCase() === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/20 py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      
      {/* Toast Notification Stack */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
          <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header (Clean & Minimalist, No Heavy KPIs) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" /> Control de Credenciales RFID
          </h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wider mt-1 uppercase">Centro Inteligente de Identidades, Tarjetas y Manillas Escolares</p>
        </div>

        <div>
          <button 
            onClick={() => setModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Asignar RFID
          </button>
        </div>
      </div>

      {/* Search & Filter Chips (Apple Assets style) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input 
            type="text" 
            placeholder="Buscar por portador o código RFID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-700"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Roles Filters */}
          <div className="flex flex-wrap gap-1 bg-slate-50 border border-slate-150 rounded-xl p-1">
            {['TODOS', 'ESTUDIANTE', 'DOCENTE', 'VIGILANCIA', 'TRANSPORTE'].map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  selectedRole === role 
                    ? "bg-white text-indigo-700 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {role === 'TODOS' ? 'Roles' : role}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-1 bg-slate-50 border border-slate-150 rounded-xl p-1">
            {['TODOS', 'ACTIVO', 'SUSPENDIDO', 'PERDIDO', 'REPOSICIÓN'].map(status => (
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

      {/* RFID GRID (Sleek cards layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map(device => {
          const isActive = device.status === 'Activo';
          const isSuspended = device.status === 'Suspendido' || device.status === 'Reposición';
          const isLost = device.status === 'Perdido';

          return (
            <div 
              key={device.id}
              onClick={() => {
                setSelectedDeviceId(device.id);
                setDrawerOpen(true);
              }}
              className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 cursor-pointer relative overflow-hidden group"
            >
              
              {/* Card Header: RFID Code & Status badge */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <Radio className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] font-semibold text-slate-800 font-mono tracking-tight">{device.rfidCode}</span>
                  <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded uppercase font-mono">{device.deviceType}</span>
                </div>

                {/* Soft Premium badge indicator */}
                <span className={cn(
                  "text-[8.5px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border flex items-center gap-1.5",
                  isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                  isSuspended ? 'bg-amber-50 border-amber-100 text-amber-700' :
                  'bg-rose-50 border-rose-100 text-rose-700'
                )}>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    isActive ? 'bg-emerald-500 animate-pulse' :
                    isSuspended ? 'bg-amber-500' :
                    'bg-rose-500'
                  )} />
                  {device.status}
                </span>
              </div>

              {/* Card Body: User profile info */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                  {device.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 tracking-tight group-hover:text-indigo-700 transition-colors">
                    {device.userName}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9.5px] font-bold uppercase tracking-wide text-slate-400">{device.role}</span>
                    {device.course && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span className="bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-[8.5px] font-bold px-1.5 py-0.2 rounded">{device.course}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Sede & Jornada Context */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{device.sede}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>Jornada: {device.jornada}</span>
                </div>
              </div>

              {/* Footer: Last Access telemetry */}
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] text-slate-400">
                <span className="flex items-center gap-1 truncate max-w-[190px]">
                  <Clock className="w-3 h-3 text-slate-350 shrink-0" /> 
                  <span className="truncate">Acceso: <span className="font-semibold text-slate-600">{device.lastAccessTime}</span></span>
                </span>
                
                <span className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 group-hover:translate-x-0.5 transition-all">
                  Ver 360 <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

            </div>
          );
        })}

        {filteredDevices.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <Radio className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-700">No se encontraron dispositivos</h3>
            <p className="text-xs text-slate-450 max-w-sm mx-auto font-medium">Ajusta los filtros o escribe otro término de búsqueda para localizar la credencial.</p>
          </div>
        )}
      </div>

      {/* RFID 360 Drawer ( sliding overlay ) */}
      {drawerOpen && selectedDevice && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Dark glass backdrop overlay */}
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
                          ID: {selectedDevice.rfidCode}
                        </span>
                        
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                          selectedDevice.status === 'Activo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          selectedDevice.status === 'Suspendido' || selectedDevice.status === 'Reposición' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        )}>
                          {selectedDevice.status}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold text-slate-100 tracking-tight leading-tight pt-1">
                        Control de Credencial 360
                      </h2>
                      <p className="text-xs text-slate-350 font-medium">
                        Dispositivo asociado a portador oficial AulaCore.
                      </p>
                    </div>

                    <button 
                      onClick={() => setDrawerOpen(false)}
                      className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Ficha de Identidad del Portador */}
                  <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-4xl shrink-0">
                      {selectedDevice.avatar}
                    </div>
                    
                    <div className="text-center sm:text-left space-y-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-slate-100">{selectedDevice.userName}</h3>
                        <span className="bg-indigo-500/15 text-indigo-300 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border border-indigo-500/10 self-center">
                          {selectedDevice.role}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-350 pt-2 border-t border-slate-800/60 mt-2">
                        <div>Sede: <span className="text-slate-200 font-semibold">{selectedDevice.sede}</span></div>
                        <div>Jornada: <span className="text-slate-200 font-semibold">{selectedDevice.jornada}</span></div>
                        {selectedDevice.course && (
                          <div className="col-span-2">Curso / Grado: <span className="text-indigo-400 font-semibold">{selectedDevice.course}</span></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalle de Entrega & Auditoría */}
                  <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 space-y-3.5 text-xs text-slate-300">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block border-b border-slate-800 pb-1.5">
                      Detalle del Dispositivo & Auditoría
                    </span>
                    
                    <div className="grid grid-cols-2 gap-4 text-[11px] font-medium">
                      <div className="space-y-1">
                        <p className="text-slate-450 text-[9px] uppercase tracking-wider font-bold">Fecha de Entrega</p>
                        <p className="text-slate-200 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {selectedDevice.deliveryDate}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-450 text-[9px] uppercase tracking-wider font-bold">Quién Entregó</p>
                        <p className="text-slate-200 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> {selectedDevice.deliveryBy}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-450 text-[9px] uppercase tracking-wider font-bold">Nivel de Permisos</p>
                        <p className={cn(
                          "font-bold uppercase tracking-wider text-[9px] flex items-center gap-1.5",
                          selectedDevice.permissionLevel === 'Elevado' || selectedDevice.permissionLevel === 'Crítico' ? 'text-rose-400' : 'text-slate-300'
                        )}><Shield className="w-3.5 h-3.5 text-slate-400" /> {selectedDevice.permissionLevel}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-450 text-[9px] uppercase tracking-wider font-bold">Reemplazos Anteriores</p>
                        <p className="text-slate-200">{selectedDevice.replacementsCount} reposiciones físicas</p>
                      </div>
                      <div className="col-span-2 space-y-1 border-t border-slate-800/60 pt-2">
                        <p className="text-slate-450 text-[9px] uppercase tracking-wider font-bold">Observaciones de Seguridad</p>
                        <p className="text-slate-300 bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[10px] leading-normal italic">{selectedDevice.observations}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Control de Estado */}
                  <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block border-b border-slate-800 pb-1.5">
                      Acciones de Control & Seguridad
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleChangeStatus(selectedDevice.id, 'Activo')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors border",
                          selectedDevice.status === 'Activo' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400'
                        )}
                      >
                        Activar Tag
                      </button>

                      <button
                        onClick={() => handleChangeStatus(selectedDevice.id, 'Suspendido')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors border",
                          selectedDevice.status === 'Suspendido' 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400'
                        )}
                      >
                        Suspender
                      </button>

                      <button
                        onClick={() => handleChangeStatus(selectedDevice.id, 'Perdido')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors border",
                          selectedDevice.status === 'Perdido' 
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400'
                        )}
                      >
                        Reportar Pérdida
                      </button>

                      <button
                        onClick={() => handleResyncDevice(selectedDevice.rfidCode)}
                        disabled={isResyncing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ml-auto disabled:opacity-50"
                      >
                        <RefreshCw className={cn("w-3.5 h-3.5", isResyncing && "animate-spin")} />
                        {isResyncing ? 'Sincronizando...' : 'Re-sincronizar'}
                      </button>
                    </div>
                  </div>

                  {/* Acceso Reciente Logs (Notion style timeline) */}
                  <div className="space-y-4 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block">Bitácora de Accesos Recientes</span>
                    
                    <div className="relative border-l-2 border-slate-800 pl-4 ml-2.5 space-y-4">
                      {selectedDevice.accessLogs.map((log, index) => (
                        <div key={index} className="relative">
                          {/* Timeline dot */}
                          <div className={cn(
                            "absolute w-2.5 h-2.5 rounded-full -left-[21.5px] top-1 border border-slate-900",
                            log.status === 'Exitoso' ? 'bg-indigo-500' : 'bg-rose-500'
                          )} />

                          <div className="flex justify-between items-start text-xs">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-200">{log.location}</p>
                              <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1"><Clock className="w-3 h-3" /> {log.timestamp}</p>
                            </div>
                            
                            <div className="text-right flex items-center gap-2">
                              <span className="bg-slate-850 border border-slate-800 text-slate-350 text-[8.5px] font-bold px-1.5 py-0.2 rounded uppercase font-mono">{log.direction}</span>
                              <span className={cn(
                                "text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                                log.status === 'Exitoso' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              )}>
                                {log.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {selectedDevice.accessLogs.length === 0 && (
                        <p className="text-xs text-slate-500 italic pl-1">No se registran marcas horarias de acceso recientes para este dispositivo.</p>
                      )}
                    </div>
                  </div>

                  {/* Telemetrías Futuras pre-arquitectura (Sleek dashed block) */}
                  <div className="bg-slate-850 border border-slate-800/80 border-dashed rounded-2xl p-4.5 space-y-3 text-xs text-slate-400">
                    <span className="text-[9.5px] font-bold uppercase tracking-widest text-indigo-400 block border-b border-slate-800 pb-1.5">
                      Módulos Conectados & Preparación de Telemetrías (IA/IoT)
                    </span>
                    <div className="flex flex-wrap gap-2 text-[8px] font-bold uppercase tracking-wider">
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Asistencia Auto [MEN]</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Portería & Aforo</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Rutas & GPS</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Comedor & Kiosko</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Biblioteca Control</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">IA Predictive Aforo</span>
                      <span className="bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.8 rounded">Portería Remota IoT</span>
                    </div>
                  </div>

                  {/* Drawer Footer controls */}
                  <div className="border-t border-slate-800 pt-5 mt-auto flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[9px] uppercase tracking-widest font-semibold leading-none">
                      AulaCore Identity engine 2026
                    </span>
                    
                    <button
                      onClick={() => {
                        const updated = devices.filter(d => d.id !== selectedDevice.id);
                        saveDevices(updated);
                        setDrawerOpen(false);
                        triggerToast(`✓ Credencial ${selectedDevice.rfidCode} desvinculada.`);
                      }}
                      className="text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Desvincular Dispositivo
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Notion-style new RFID modal creation overlay */}
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
                    <CreditCard className="w-5 h-5 text-indigo-600" /> Aprovisionar RFID Físico
                  </h3>
                  <button 
                    onClick={() => setModalOpen(false)}
                    className="text-slate-450 hover:text-slate-650 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Código RFID</label>
                      <input 
                        type="text" 
                        placeholder="Ej. RF-2234-Y"
                        value={newRfid}
                        onChange={(e) => setNewRfid(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono uppercase text-slate-750"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Tipo de Asset</label>
                      <select 
                        value={newType} 
                        onChange={(e) => setNewType(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-650 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        <option value="Tarjeta">💳 Tarjeta Física</option>
                        <option value="Manilla">⌚ Manilla Silicona</option>
                        <option value="Tag">🔑 Llavero Tag</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Nombre Completo del Portador</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Valentina Restrepo"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-750"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Rol Institucional</label>
                      <select 
                        value={newRole} 
                        onChange={(e) => setNewRole(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-650 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        <option value="Estudiante">Estudiante</option>
                        <option value="Docente">Docente</option>
                        <option value="Vigilancia">Vigilancia</option>
                        <option value="Transporte">Transporte / Conductor</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Grado / Curso</label>
                      <input 
                        type="text" 
                        placeholder="Ej. 10-A (Sólo Estudiantes)"
                        value={newCourse}
                        disabled={newRole !== 'Estudiante'}
                        onChange={(e) => setNewCourse(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all disabled:opacity-50 text-slate-750"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Sede Asignada</label>
                      <select 
                        value={newSede} 
                        onChange={(e) => setNewSede(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-650 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        <option value="Sede Principal">Sede Principal</option>
                        <option value="Sede Campestre">Sede Campestre</option>
                        <option value="Sede Virtual">Sede Virtual / Integrada</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Jornada</label>
                      <select 
                        value={newJornada} 
                        onChange={(e) => setNewJornada(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-650 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        <option value="Mañana">Mañana</option>
                        <option value="Tarde">Tarde</option>
                        <option value="Nocturna">Nocturna</option>
                        <option value="Completa">Completa</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Nivel de Privilegios / Acceso</label>
                      <select 
                        value={newPerm} 
                        onChange={(e) => setNewPerm(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-650 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        <option value="Bajo">Bajo (Acceso Peatonal Estándar)</option>
                        <option value="Medio">Medio (Sedes + Biblioteca)</option>
                        <option value="Crítico">Crítico (Zonas de Control / Porterías Especiales)</option>
                        <option value="Elevado">Elevado (Rectoría / Acceso Completo)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Observaciones Adicionales</label>
                    <textarea 
                      placeholder="Ej. Se le entrega manilla física azul de alta resistencia."
                      value={newObs}
                      onChange={(e) => setNewObs(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-700 min-h-[60px]"
                    />
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
                  onClick={handleAssignRFID}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Aprovisionar RFID
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
