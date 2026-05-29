'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, ShieldAlert, Key, Terminal, Smartphone, 
  MapPin, Clock, Activity, Search, SlidersHorizontal, Plus, 
  X, Check, AlertTriangle, RefreshCw, Eye, Settings2, 
  Lock, ArrowRight, UserPlus, Info, CheckCircle2, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// TYPES & INTERFACES
interface RolePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  approve: boolean;
}

interface RoleDetails {
  id: string;
  name: string;
  description: string;
  hierarchy: 'Alta' | 'Media' | 'Baja' | 'Externa';
  usersCount: number;
  securityStatus: 'secure' | 'warning' | 'restricted';
  mfaActive: 'Biométrico' | 'Llave + RFID' | 'RFID Tag' | 'Clave simple' | 'Doble Factor' | 'Ninguno';
  rfidScope: 'Total' | 'Administrativo' | 'Salón' | 'Portería Total' | 'Acceso Vehículos' | 'Acceso Enfermería' | 'Acceso Autorizado' | 'Zona Académica' | 'Ninguno';
  hoursRestriction: 'Ilimitado' | '06:00 - 20:00' | '07:00 - 18:00' | '06:00 - 18:00' | '07:00 - 17:00' | '05:00 - 19:00' | '07:00 - 16:00' | 'Solo en citación' | '06:30 - 15:30';
  campusScope: 'Multi-Campus' | 'Sede Principal' | 'Sede Asignada' | 'All Campuses' | 'Sede Rural/Principal' | 'Sede del Estudiante';
  status: 'active' | 'inactive';
  permissions: Record<string, RolePermission>;
}

interface AssignedUser {
  name: string;
  email: string;
  avatar: string;
  lastActive: string;
  activeNow: boolean;
  device: string;
}

interface SecurityLog {
  time: string;
  action: string;
  user: string;
  ip: string;
  level: 'info' | 'warning' | 'danger';
}

// INITIAL HIGH FIDELITY SEED DATA
const MODULES_LIST = [
  { id: 'dashboard', label: 'Dashboard Rectoral' },
  { id: 'estudiantes', label: 'Estudiantes360' },
  { id: 'cursos', label: 'Cursos & Horarios' },
  { id: 'reportes', label: 'Reportes & Boletines' },
  { id: 'alertas', label: 'Alertas Predictivas' },
  { id: 'rfid', label: 'IoT RFID & Portería' },
  { id: 'configuracion', label: 'Configuración de Marca' },
  { id: 'matriculas', label: 'Matrículas & Onboarding' },
  { id: 'pagos', label: 'Facturación & Pagos' },
  { id: 'ia', label: 'IA & Reglas' }
];

const SEED_ROLES: RoleDetails[] = [
  {
    id: 'r-1',
    name: 'Rector',
    description: 'Control operacional maestro y representación legal de toda la red de campus de AulaCore.',
    hierarchy: 'Alta',
    usersCount: 1,
    securityStatus: 'secure',
    mfaActive: 'Biométrico',
    rfidScope: 'Total',
    hoursRestriction: 'Ilimitado',
    campusScope: 'Multi-Campus',
    status: 'active',
    permissions: {
      dashboard: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      estudiantes: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      cursos: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      reportes: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      alertas: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      rfid: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      configuracion: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      matriculas: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      pagos: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      ia: { view: true, create: true, edit: true, delete: true, export: true, approve: true }
    }
  },
  {
    id: 'r-2',
    name: 'Coordinador',
    description: 'Gestor de disciplina, control de asistencia curricular y organización horaria académica.',
    hierarchy: 'Alta',
    usersCount: 2,
    securityStatus: 'secure',
    mfaActive: 'Llave + RFID',
    rfidScope: 'Total',
    hoursRestriction: '06:00 - 20:00',
    campusScope: 'Multi-Campus',
    status: 'active',
    permissions: {
      dashboard: { view: true, create: false, edit: true, delete: false, export: true, approve: true },
      estudiantes: { view: true, create: true, edit: true, delete: false, export: true, approve: true },
      cursos: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      reportes: { view: true, create: false, edit: true, delete: false, export: true, approve: false },
      alertas: { view: true, create: true, edit: true, delete: false, export: true, approve: true },
      rfid: { view: true, create: false, edit: true, delete: false, export: true, approve: false },
      configuracion: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      matriculas: { view: true, create: false, edit: true, delete: false, export: true, approve: true },
      pagos: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      ia: { view: true, create: false, edit: true, delete: false, export: false, approve: false }
    }
  },
  {
    id: 'r-3',
    name: 'Secretario Académico',
    description: 'Operario de admisiones, registro de calificaciones oficiales, matrículas y actas de grado.',
    hierarchy: 'Media',
    usersCount: 2,
    securityStatus: 'secure',
    mfaActive: 'Llave + RFID',
    rfidScope: 'Administrativo',
    hoursRestriction: '07:00 - 18:00',
    campusScope: 'Sede Principal',
    status: 'active',
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      estudiantes: { view: true, create: true, edit: true, delete: false, export: true, approve: false },
      cursos: { view: true, create: false, edit: true, delete: false, export: true, approve: false },
      reportes: { view: true, create: true, edit: true, delete: false, export: true, approve: true },
      alertas: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      rfid: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      configuracion: { view: true, create: false, edit: true, delete: false, export: false, approve: false },
      matriculas: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      pagos: { view: true, create: true, edit: true, delete: false, export: true, approve: false },
      ia: { view: false, create: false, edit: false, delete: false, export: false, approve: false }
    }
  },
  {
    id: 'r-4',
    name: 'Docente',
    description: 'Generador de notas, controlador de asistencia del aula, creador de mallas curriculares.',
    hierarchy: 'Media',
    usersCount: 42,
    securityStatus: 'secure',
    mfaActive: 'Clave simple',
    rfidScope: 'Salón',
    hoursRestriction: '06:00 - 18:00',
    campusScope: 'Sede Asignada',
    status: 'active',
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      estudiantes: { view: true, create: false, edit: true, delete: false, export: false, approve: false },
      cursos: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      reportes: { view: true, create: true, edit: true, delete: false, export: false, approve: false },
      alertas: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      rfid: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      configuracion: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      matriculas: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      pagos: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      ia: { view: true, create: false, edit: false, delete: false, export: false, approve: false }
    }
  },
  {
    id: 'r-5',
    name: 'Vigilancia',
    description: 'Encargado del control físico de accesos, lectura RFID de portería y aforo en zonas comunes.',
    hierarchy: 'Baja',
    usersCount: 4,
    securityStatus: 'secure',
    mfaActive: 'RFID Tag',
    rfidScope: 'Portería Total',
    hoursRestriction: 'Ilimitado',
    campusScope: 'Sede Asignada',
    status: 'active',
    permissions: {
      dashboard: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      estudiantes: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      cursos: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      reportes: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      alertas: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      rfid: { view: true, create: true, edit: true, delete: false, export: true, approve: true },
      configuracion: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      matriculas: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      pagos: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      ia: { view: false, create: false, edit: false, delete: false, export: false, approve: false }
    }
  },
  {
    id: 'r-6',
    name: 'Transporte',
    description: 'Conductores y coordinadores de rutas escolares con telemetría GPS e indexación RFID.',
    hierarchy: 'Baja',
    usersCount: 8,
    securityStatus: 'restricted',
    mfaActive: 'RFID Tag',
    rfidScope: 'Acceso Vehículos',
    hoursRestriction: '05:00 - 19:00',
    campusScope: 'Sede Rural/Principal',
    status: 'active',
    permissions: {
      dashboard: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      estudiantes: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      cursos: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      reportes: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      alertas: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      rfid: { view: true, create: false, edit: true, delete: false, export: false, approve: false },
      configuracion: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      matriculas: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      pagos: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      ia: { view: false, create: false, edit: false, delete: false, export: false, approve: false }
    }
  }
];

const SEED_USERS: Record<string, AssignedUser[]> = {
  'r-1': [
    { name: 'Dra. Mariana Restrepo', email: 'm.restrepo@aulacore.edu.co', avatar: '👩‍💼', lastActive: 'Activa ahora', activeNow: true, device: 'Safari - macOS' }
  ],
  'r-2': [
    { name: 'Lic. Claudia Gómez', email: 'c.gomez@aulacore.edu.co', avatar: '👩‍🏫', lastActive: 'Hace 5 min', activeNow: true, device: 'Chrome - Windows 11' },
    { name: 'Ing. Alberto González', email: 'a.gonzalez@aulacore.edu.co', avatar: '👨‍🏫', lastActive: 'Ayer, 04:30 PM', activeNow: false, device: 'iPad App' }
  ],
  'r-3': [
    { name: 'Dr. Carlos Mario Hoyos', email: 'c.hoyos@aulacore.edu.co', avatar: '👨‍💼', lastActive: 'Activo ahora', activeNow: true, device: 'Chrome - Windows 11' },
    { name: 'Dra. María Clara Tobón', email: 'mc.tobon@aulacore.edu.co', avatar: '👩‍💼', lastActive: 'Hace 12 h', activeNow: false, device: 'Safari - iOS' }
  ],
  'r-4': [
    { name: 'Lic. Sofia Tobón', email: 's.tobon@aulacore.edu.co', avatar: '👩‍🏫', lastActive: 'Activa ahora', activeNow: true, device: 'Chrome - macOS' },
    { name: 'Prof. Andrés Beltrán', email: 'a.beltran@aulacore.edu.co', avatar: '👨‍🏫', lastActive: 'Hace 20 min', activeNow: false, device: 'Android Phone' },
    { name: 'Lic. Martha Restrepo', email: 'martha.r@aulacore.edu.co', avatar: '👩‍🏫', lastActive: 'Hace 3 h', activeNow: false, device: 'Firefox - Linux' }
  ]
};

const SEED_LOGS: Record<string, SecurityLog[]> = {
  'r-1': [
    { time: 'Hace 12 min', action: 'Elevación de privilegios en Matrícula', user: 'Mariana Restrepo', ip: '190.24.45.12', level: 'info' },
    { time: 'Hace 2 h', action: 'Doble autenticación biométrica exitosa', user: 'Mariana Restrepo', ip: '190.24.45.12', level: 'info' }
  ],
  'r-2': [
    { time: 'Hace 23 min', action: 'Modificó tolerancia de retardo RFID a 15min', user: 'Claudia Gómez', ip: '190.24.45.13', level: 'info' },
    { time: 'Ayer', action: 'Intento de ingreso bloqueado fuera de horario', user: 'Alberto González', ip: '186.115.30.94', level: 'warning' }
  ],
  'r-4': [
    { time: 'Hace 4 min', action: 'Ingreso masivo de notas matemáticas 11-A', user: 'Sofia Tobón', ip: '190.24.45.88', level: 'info' },
    { time: 'Ayer', action: 'Exportó boletines de periodo 1 (Pre-aprobación)', user: 'Sofia Tobón', ip: '190.24.45.88', level: 'info' }
  ]
};

export default function IdentityAccessControlCenterPage() {
  const [roles, setSedes] = useState<RoleDetails[]>(SEED_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('r-1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [hierarchyFilter, setHierarchyFilter] = useState<'all' | 'Alta' | 'Media' | 'Baja'>('all');

  // Role 360 Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRoleId, setDrawerRoleId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'resumen' | 'personal' | 'restricciones' | 'rfid' | 'bitacora'>('resumen');

  // Notion modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleHierarchy, setNewRoleHierarchy] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  const [newRoleMfa, setNewRoleMfa] = useState<RoleDetails['mfaActive']>('Clave simple');
  const [newRoleRfid, setNewRoleRfid] = useState<RoleDetails['rfidScope']>('Salón');
  const [newRoleHours, setNewRoleHours] = useState<RoleDetails['hoursRestriction']>('06:00 - 18:00');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync state with LocalStorage roles settings
  useEffect(() => {
    const rawRoles = localStorage.getItem('aulacore-roles-settings');
    if (rawRoles) {
      try {
        const parsed = JSON.parse(rawRoles);
        if (parsed && parsed.length > 0) setSedes(parsed);
      } catch (e) {
        console.error('Error loading roles settings', e);
      }
    }
  }, []);

  const saveRoles = (updatedList: RoleDetails[]) => {
    setSedes(updatedList);
    localStorage.setItem('aulacore-roles-settings', JSON.stringify(updatedList));
  };

  // Get active role details for the Matrix
  const activeRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  // Get selected drawer role details
  const drawerRole = roles.find(r => r.id === drawerRoleId) || null;

  // Toggle dynamic permission state on Matrix
  const handleTogglePermission = (moduleId: string, actionKey: keyof RolePermission) => {
    const updatedRoles = roles.map(role => {
      if (role.id === selectedRoleId) {
        const currentModulePerm = role.permissions[moduleId] || { view: false, create: false, edit: false, delete: false, export: false, approve: false };
        const updatedModulePerm = { ...currentModulePerm, [actionKey]: !currentModulePerm[actionKey] };
        
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [moduleId]: updatedModulePerm
          }
        };
      }
      return role;
    });

    saveRoles(updatedRoles);
    triggerToast(`✓ Permiso ${actionKey.toUpperCase()} de ${moduleId.toUpperCase()} modificado para ${activeRole.name}.`);
  };

  // Enable/Disable role switch
  const handleToggleRoleStatus = (roleId: string, roleName: string, currentStatus: RoleDetails['status']) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' as const : 'active' as const;
    const updatedRoles = roles.map(r => {
      if (r.id === roleId) return { ...r, status: nextStatus };
      return r;
    });

    saveRoles(updatedRoles);
    triggerToast(nextStatus === 'active' ? `✓ Rol ${roleName} habilitado en la red local.` : `🔒 Acceso revocado temporalmente para el rol ${roleName}.`);
  };

  // Add new Custom Role
  const handleCreateRole = () => {
    if (!newRoleName || !newRoleDescription) {
      triggerToast('⚠️ Por favor escribe el nombre y descripción del rol.');
      return;
    }

    const defaultPermissions: Record<string, RolePermission> = {};
    MODULES_LIST.forEach(mod => {
      defaultPermissions[mod.id] = { view: true, create: false, edit: false, delete: false, export: false, approve: false };
    });

    const newR: RoleDetails = {
      id: 'r-' + Date.now(),
      name: newRoleName,
      description: newRoleDescription,
      hierarchy: newRoleHierarchy,
      usersCount: 0,
      securityStatus: 'secure',
      mfaActive: newRoleMfa,
      rfidScope: newRoleRfid,
      hoursRestriction: newRoleHours,
      campusScope: 'Sede Asignada',
      status: 'active',
      permissions: defaultPermissions
    };

    const updatedList = [...roles, newR];
    saveRoles(updatedList);

    // Reset Form
    setNewRoleName('');
    setNewRoleDescription('');
    setNewRoleHierarchy('Media');
    setAddModalOpen(false);
    triggerToast(`✓ Rol jerárquico ${newRoleName} aprovisionado con éxito.`);
  };

  // Delete Custom Role
  const handleDeleteRole = (id: string, name: string) => {
    const updatedList = roles.filter(r => r.id !== id);
    saveRoles(updatedList);
    triggerToast(`✓ Rol ${name} removido del IAM Center.`);
    if (drawerRoleId === id) setDrawerOpen(false);
  };

  // Helper values for security logs
  const getRoleLogs = (roleId: string): SecurityLog[] => {
    return SEED_LOGS[roleId] || [
      { time: 'Hace 4 h', action: 'Acceso autorizado al portal', user: 'Usuario de Red', ip: '190.24.45.15', level: 'info' },
      { time: 'Ayer', action: 'Lectura de credencial RFID física', user: 'Usuario de Red', ip: '190.24.45.15', level: 'info' }
    ];
  };

  const getRoleUsers = (roleId: string): AssignedUser[] => {
    return SEED_USERS[roleId] || [
      { name: 'Administrador de Pruebas', email: 'admin.temp@aulacore.edu.co', avatar: '👨‍💻', lastActive: 'Hace 2 d', activeNow: false, device: 'Chrome - Linux' }
    ];
  };

  // Filtered Roles Grid list
  const filteredRoles = roles.filter(role => {
    const matchesSearch = 
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesHierarchy = hierarchyFilter === 'all' || role.hierarchy === hierarchyFilter;
    return matchesSearch && matchesHierarchy;
  });

  // Calculate Global Security KPIs
  const totalRoles = roles.length;
  const activeRolesCount = roles.filter(r => r.status === 'active').length;
  
  // Count connected users
  let connectedUsers = 0;
  Object.values(SEED_USERS).forEach(userList => {
    userList.forEach(u => { if (u.activeNow) connectedUsers++; });
  });

  // Count active critical permissions (delete, export, approve)
  let criticalPermsCount = 0;
  roles.forEach(role => {
    Object.values(role.permissions).forEach(perm => {
      if (perm.delete) criticalPermsCount++;
      if (perm.export) criticalPermsCount++;
      if (perm.approve) criticalPermsCount++;
    });
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/20 py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      
      {/* Toast Notification Stack */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
          <Shield className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header operations bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" /> Identity & Access Control Center
          </h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wider mt-1 uppercase">Jerarquía institucional de seguridad y delegación granular de accesos</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Aprovisionar Rol
          </button>
        </div>
      </div>

      {/* 1. IDENTITY INTEL KPI ROW (Power BI Minimalist style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Roles */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Jerarquía Escolar</span>
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-850">{totalRoles}</span>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{activeRolesCount} Activos</span>
          </div>
          <div className="text-[9px] text-slate-450 font-medium">Roles institucionales aprovisionados</div>
        </div>

        {/* KPI 2: Connected Staff Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Directivos en Red</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-850">{connectedUsers}</span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">En línea</span>
          </div>
          <div className="text-[9px] text-slate-450 font-medium">Sesiones activas concurrentes en AulaCore</div>
        </div>

        {/* KPI 3: Sensitive Delegated Permissions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Permisos Críticos</span>
            <Lock className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-850">{criticalPermsCount}</span>
            <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">Privilegiados</span>
          </div>
          <div className="text-[9px] text-slate-450 font-medium">Ediciones, descargas y aprobaciones activas</div>
        </div>

        {/* KPI 4: Security Health State */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Seguridad Operacional</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-850">100%</span>
            <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Uptime</span>
          </div>
          <div className="text-[9px] text-slate-450 font-medium">Auditorías y doble factor de seguridad activo</div>
        </div>

      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="w-full sm:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input 
            type="text" 
            placeholder="Buscar por rol, descripción o alcance..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-650 outline-none focus:bg-white focus:border-indigo-500 transition-all placeholder-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Hierarchy filters */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mr-1">Jerarquía:</span>
          {['all', 'Alta', 'Media', 'Baja'].map(h => (
            <button
              key={h}
              onClick={() => setHierarchyFilter(h as any)}
              className={cn(
                "px-3 py-1.5 rounded-xl border text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer",
                hierarchyFilter === h 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" 
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
              )}
            >
              {h === 'all' ? 'Todos' : h}
            </button>
          ))}
        </div>

      </div>

      {/* 2. CAMPUS ROLES GRID (Tarjetas de Roles Compactas & Respirables) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map(role => {
          const isSelected = selectedRoleId === role.id;
          const isActive = role.status === 'active';

          return (
            <div 
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              className={cn(
                "bg-white border rounded-3xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 relative",
                isSelected ? "border-indigo-550 ring-1 ring-indigo-500/10 shadow-sm" : "border-slate-200"
              )}
            >
              
              {/* Header */}
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-[8.5px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border",
                    role.hierarchy === 'Alta' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                    role.hierarchy === 'Media' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                    'bg-slate-100 border-slate-200 text-slate-600'
                  )}>
                    Jerarquía: {role.hierarchy}
                  </span>

                  {/* Operational status toggle switch */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleRoleStatus(role.id, role.name, role.status);
                    }}
                    className={cn(
                      "w-8 h-4.5 rounded-full relative transition-colors cursor-pointer shrink-0 border border-slate-200",
                      isActive ? "bg-indigo-600" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-3.5 h-3.5 bg-white rounded-full absolute top-0.2 transition-transform shadow-sm",
                      isActive ? "left-3.8" : "left-0.5"
                    )} />
                  </button>
                </div>

                <h3 className="text-base font-semibold text-slate-800 tracking-tight pt-2 leading-tight">
                  {role.name}
                </h3>
                <p className="text-[11px] text-slate-450 font-medium leading-relaxed line-clamp-2">
                  {role.description}
                </p>
              </div>

              {/* Specific metadata chips grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{role.usersCount} usuarios</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{role.mfaActive}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">RFID: {role.rfidScope}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{role.hoursRestriction}</span>
                </div>
              </div>

              {/* Visual action row */}
              <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium text-[9px] uppercase font-mono">
                  Sedes: {role.campusScope}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDrawerRoleId(role.id);
                    setDrawerTab('resumen');
                    setDrawerOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-850 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1 hover:translate-x-0.5 transition-all cursor-pointer"
                >
                  Ver Perfil 360 <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* 3. DYNAMIC PERMISSION MATRIX (Roles vs Módulos visual Jira/Notion grid) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        
        {/* Matrix Header controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Matriz de Permisos Global</h3>
            <p className="text-xs text-slate-450 font-medium">Audita y edita la matriz cruzada de privilegios de acceso para el rol de <span className="text-indigo-600 font-bold underline leading-none uppercase">{activeRole.name}</span>.</p>
          </div>

          {/* Active Role selector drop */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Rol Auditado:</span>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-650 outline-none hover:bg-slate-100 cursor-pointer"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* The Crusader Matrix Table - Horizontally scrollable and lightweight */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-full divide-y divide-slate-150 text-left text-xs font-semibold text-slate-650">
            <thead className="bg-slate-55/40 text-[9px] font-black text-slate-450 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-3.5 min-w-[200px]">Módulo del Ecosistema</th>
                <th className="px-4 py-3.5 text-center">View (Ver)</th>
                <th className="px-4 py-3.5 text-center">Create (Crear)</th>
                <th className="px-4 py-3.5 text-center">Edit (Editar)</th>
                <th className="px-4 py-3.5 text-center">Delete (Borrar)</th>
                <th className="px-4 py-3.5 text-center">Export (Descargar)</th>
                <th className="px-4 py-3.5 text-center">Approve (Aprobar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {MODULES_LIST.map(mod => {
                const permissions = activeRole.permissions[mod.id] || { view: false, create: false, edit: false, delete: false, export: false, approve: false };

                return (
                  <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 text-[13px]">{mod.label}</span>
                    </td>
                    
                    {/* View Action cell */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(mod.id, 'view')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider transition-all select-none border cursor-pointer",
                          permissions.view 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold" 
                            : "bg-slate-50 border-slate-150/70 text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {permissions.view ? 'Granted' : 'Denied'}
                      </button>
                    </td>

                    {/* Create Action cell */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(mod.id, 'create')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider transition-all select-none border cursor-pointer",
                          permissions.create 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold" 
                            : "bg-slate-50 border-slate-150/70 text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {permissions.create ? 'Granted' : 'Denied'}
                      </button>
                    </td>

                    {/* Edit Action cell */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(mod.id, 'edit')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider transition-all select-none border cursor-pointer",
                          permissions.edit 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold" 
                            : "bg-slate-50 border-slate-150/70 text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {permissions.edit ? 'Granted' : 'Denied'}
                      </button>
                    </td>

                    {/* Delete Action cell */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(mod.id, 'delete')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider transition-all select-none border cursor-pointer",
                          permissions.delete 
                            ? "bg-rose-50 border-rose-100 text-rose-700 font-bold" 
                            : "bg-slate-50 border-slate-150/70 text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {permissions.delete ? 'Active' : 'Denied'}
                      </button>
                    </td>

                    {/* Export Action cell */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(mod.id, 'export')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider transition-all select-none border cursor-pointer",
                          permissions.export 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold" 
                            : "bg-slate-50 border-slate-150/70 text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {permissions.export ? 'Granted' : 'Denied'}
                      </button>
                    </td>

                    {/* Approve Action cell */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(mod.id, 'approve')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider transition-all select-none border cursor-pointer",
                          permissions.approve 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold" 
                            : "bg-slate-50 border-slate-150/70 text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {permissions.approve ? 'Granted' : 'Denied'}
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* 4. ROLE 360 DRAWER (Identity sliding drawer with high-contrast text) */}
      {drawerOpen && drawerRole && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Dark glass backdrop overlay */}
            <div 
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            />

            {/* Sliding Panel wrapper */}
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-2xl transform bg-slate-900 text-white border-l border-slate-800 shadow-2xl transition-all duration-300">
                
                <div className="flex h-full flex-col overflow-y-scroll py-6 px-6 space-y-6">
                  
                  {/* Header Area */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded">
                          Jerarquía: {drawerRole.hierarchy}
                        </span>
                        <span className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          drawerRole.status === 'active' ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                        <span className="text-[10px] font-semibold text-slate-350 font-mono uppercase">
                          Rol {drawerRole.status === 'active' ? 'Habilitado' : 'Inactivo'}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold text-slate-100 tracking-tight leading-tight pt-1">
                        Perfil IAM: {drawerRole.name}
                      </h2>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">
                        {drawerRole.description}
                      </p>
                    </div>

                    <button 
                      onClick={() => setDrawerOpen(false)}
                      className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Drawer Tabbed Navigation */}
                  <div className="flex border-b border-slate-800/80 pb-0.5 gap-2 overflow-x-auto scrollbar-thin">
                    {[
                      { id: 'resumen' as const, label: 'Visión IAM', icon: Shield },
                      { id: 'personal' as const, label: 'Personal Activo', icon: Users },
                      { id: 'restricciones' as const, label: 'Restricciones', icon: Clock },
                      { id: 'rfid' as const, label: 'IoT RFID Credenciales', icon: Activity },
                      { id: 'bitacora' as const, label: 'Logs Auditoría', icon: Terminal }
                    ].map(tab => {
                      const isActive = drawerTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setDrawerTab(tab.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 cursor-pointer border-t border-x border-transparent",
                            isActive 
                              ? "bg-slate-850 text-indigo-400 border-slate-800 border-b-2 border-b-indigo-500 font-bold" 
                              : "text-slate-400 hover:text-slate-200"
                          )}
                        >
                          <tab.icon className="w-3.5 h-3.5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab 1: Overview responsibilities */}
                  {drawerTab === 'resumen' && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      
                      {/* Security stats card */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 text-center">
                          <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block mb-1">MFA Requerido</span>
                          <span className="text-sm font-semibold text-slate-100 leading-none">{drawerRole.mfaActive}</span>
                        </div>
                        <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 text-center">
                          <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Sedes Permitidas</span>
                          <span className="text-sm font-semibold text-slate-100 leading-none">{drawerRole.campusScope}</span>
                        </div>
                        <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 text-center">
                          <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Usuarios Asignados</span>
                          <span className="text-sm font-semibold text-slate-100 leading-none">{drawerRole.usersCount} Staff</span>
                        </div>
                      </div>

                      {/* Security classification box */}
                      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block">Auditoría de Seguridad del Rol</span>
                        
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-350">Estado de Seguridad:</span>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded text-[10px] uppercase font-bold",
                            drawerRole.securityStatus === 'secure' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          )}>
                            {drawerRole.securityStatus.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-350">Privilegios de Borrado:</span>
                          <span className="text-slate-200">
                            {Object.values(drawerRole.permissions).some(p => p.delete) ? '⚠️ Habilitados en ciertos módulos' : 'No Habilitados'}
                          </span>
                        </div>
                      </div>

                      {/* Biometric Auth placeholder */}
                      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-xl font-bold">
                          🔑
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">Inicio de Sesión Biométrico Soportado</p>
                          <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Compatible con FaceID, TouchID y credenciales de hardware FIDO2</p>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Tab 2: Assigned Staff users */}
                  {drawerTab === 'personal' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100">Usuarios Activos en este Rol</h3>
                        <p className="text-xs text-slate-450 font-medium">Lista de funcionarios con credenciales de acceso asignadas al rol.</p>
                      </div>

                      <div className="space-y-3.5 pt-2">
                        {getRoleUsers(drawerRole.id).map((user, idx) => (
                          <div key={idx} className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 flex justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shrink-0 select-none">
                                {user.avatar}
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-slate-100 leading-none">{user.name}</h4>
                                <p className="text-[10px] text-slate-450 font-semibold mt-1">{user.email}</p>
                                <p className="text-[9px] text-slate-500 font-mono mt-1 font-semibold">{user.device}</p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className={cn(
                                "inline-flex items-center gap-1 text-[8.5px] font-bold px-2 py-0.5 rounded uppercase border",
                                user.activeNow 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                  : "bg-slate-800 text-slate-450 border-slate-700"
                              )}>
                                {user.activeNow ? 'En línea' : user.lastActive}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Operational Constraints (Schedules, campuses, delegations) */}
                  {drawerTab === 'restricciones' && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      
                      {/* Schedule constraints */}
                      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 space-y-3.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block">Restricción de Horario de Acceso</span>
                        
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-350">Horarios Autorizados:</span>
                          <span className="text-slate-100">{drawerRole.hoursRestriction}</span>
                        </div>

                        <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                          Cualquier intento de inicio de sesión en AulaCore por fuera de este intervalo horario requerirá una aprobación de doble firma biométrica por parte del Rector.
                        </p>
                      </div>

                      {/* Campus bounds */}
                      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 space-y-3.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block">Alcance Geográfico (Sedes)</span>
                        
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-350">Ámbito de Gestión:</span>
                          <span className="text-slate-100">{drawerRole.campusScope}</span>
                        </div>

                        <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                          Los usuarios en este rol solo podrán visualizar expedientes e interactuar con estudiantes cuyas fichas de matrícula estén registradas dentro de su sede asignada.
                        </p>
                      </div>

                      {/* Delegation warning box */}
                      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450 block">Sustituciones y Reemplazos Temporales</span>
                        <p className="text-xs text-slate-300 font-semibold leading-normal">
                          Mapeo para delegar temporalmente credenciales académicas (ej. reemplazo de docentes por incapacidad o licencias).
                        </p>
                        <button 
                          onClick={() => triggerToast('✓ Redireccionando a delegador temporal... (Preparación Escalar)')}
                          className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-indigo-400 font-semibold px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-colors w-full text-center"
                        >
                          Configurar Delegación Temporal
                        </button>
                      </div>

                    </div>
                  )}

                  {/* Tab 4: RFID credentials IoT scopes */}
                  {drawerTab === 'rfid' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100">Credenciales RFID del Campus</h3>
                        <p className="text-xs text-slate-455 font-medium">Asignación física del chip RFID para control de accesos e ingresos por terminales IoT.</p>
                      </div>

                      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4.5 space-y-3.5 pt-2">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-350">Alcance RFID Asignado:</span>
                          <span className="text-slate-100 font-bold">{drawerRole.rfidScope}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-350">Permiso de Aforos:</span>
                          <span className="text-slate-100">
                            {drawerRole.rfidScope === 'Total' ? 'Total Multi-Sede' : 'Restringido a Zonas Académicas'}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-450 leading-relaxed font-semibold border-t border-slate-800 pt-3">
                          La credencial RFID se emite en el onboarding (Matrícula/Docentes) y permite cruzar los portales biométricos de AulaCore, registrando la bitácora de asistencia en tiempo real en la central de teledetección.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tab 5: Localized chronological audit logs */}
                  {drawerTab === 'bitacora' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100">Bitácora Forense de Seguridad</h3>
                        <p className="text-xs text-slate-455 font-medium">Registro forense de auditoría reciente sobre este rol en AulaCore.</p>
                      </div>

                      <div className="space-y-3.5 pt-2">
                        {getRoleLogs(drawerRole.id).map((log, idx) => (
                          <div key={idx} className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-slate-300">
                            <div>
                              <p className={cn(
                                "font-semibold",
                                log.level === 'warning' ? "text-amber-400" : log.level === 'danger' ? "text-rose-400" : "text-slate-100"
                              )}>{log.action}</p>
                              <p className="text-[9px] text-slate-500 font-semibold mt-1">Operario: {log.user}</p>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="text-[9px] text-slate-400 font-mono">{log.time}</p>
                              <p className="text-[8px] text-slate-500 font-mono mt-0.5">IP: {log.ip}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drawer Footer controls */}
                  <div className="border-t border-slate-800 pt-5 mt-auto flex items-center justify-between text-xs">
                    {drawerRole.usersCount === 0 ? (
                      <button
                        onClick={() => handleDeleteRole(drawerRole.id, drawerRole.name)}
                        className="text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 px-3.5 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors animate-pulse"
                      >
                        Remover Rol
                      </button>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider bg-slate-850 px-2.5 py-1 rounded">
                        Rol con Usuarios Vinculados (Bloqueado)
                      </span>
                    )}
                    
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-semibold leading-none">
                      AulaCore IAM Core v2026
                    </span>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. NOTION-STYLE NEW ROLE APREVISION OVERLAY MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            
            {/* Backdrop shadow */}
            <div 
              onClick={() => setAddModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            />

            {/* Trick center block */}
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            {/* Modal Box */}
            <div className="inline-block transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              
              <div className="bg-white px-6 pt-6 pb-4 space-y-4">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" /> Aprovisionar Rol Personalizado
                  </h3>
                  <button 
                    onClick={() => setAddModalOpen(false)}
                    className="text-slate-450 hover:text-slate-650"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Nombre del Rol</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Psicorientador"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Descripción Operativa</label>
                    <textarea 
                      placeholder="Escribe las responsabilidades de este rol administrativo..."
                      value={newRoleDescription}
                      onChange={(e) => setNewRoleDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Jerarquía</label>
                      <select 
                        value={newRoleHierarchy} 
                        onChange={(e) => setNewRoleHierarchy(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-650 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        <option value="Alta">Alta (Directivos)</option>
                        <option value="Media">Media (Académicos)</option>
                        <option value="Baja">Baja (Operativos)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Doble Factor (MFA)</label>
                      <select 
                        value={newRoleMfa} 
                        onChange={(e) => setNewRoleMfa(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-650 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        <option value="Biométrico">Biométrico</option>
                        <option value="Llave + RFID">Llave + RFID</option>
                        <option value="RFID Tag">RFID Tag</option>
                        <option value="Clave simple">Clave simple</option>
                        <option value="Doble Factor">Doble Factor</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">RFID Scope</label>
                      <select 
                        value={newRoleRfid} 
                        onChange={(e) => setNewRoleRfid(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-650 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        <option value="Total">Total</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Salón">Salón</option>
                        <option value="Portería Total">Portería Total</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Restricción de Horarios</label>
                      <select 
                        value={newRoleHours} 
                        onChange={(e) => setNewRoleHours(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-650 outline-none hover:bg-slate-100 cursor-pointer"
                      >
                        <option value="Ilimitado">Ilimitado</option>
                        <option value="06:00 - 18:00">06:00 - 18:00</option>
                        <option value="07:00 - 17:00">07:00 - 17:00</option>
                        <option value="07:00 - 18:00">07:00 - 18:00</option>
                      </select>
                    </div>
                  </div>

                </div>

              </div>

              {/* Modal actions */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-650 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateRole}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Confirmar Aprovisionamiento
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
