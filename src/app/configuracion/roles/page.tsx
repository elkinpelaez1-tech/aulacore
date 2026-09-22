'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield, Users, ShieldAlert, Key, Terminal, Smartphone,
  MapPin, Clock, Activity, Search, SlidersHorizontal, Plus,
  X, Check, AlertTriangle, RefreshCw, Eye, Settings2,
  Lock, ArrowRight, UserPlus, Info, CheckCircle2, ChevronRight,
  ShieldCheck, CheckCircle, Mail, MoreVertical, Trash2, Edit3,
  UserCheck, AlertCircle, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/providers/role-provider';
import { useAuth } from '@/providers/auth-provider';

// TYPES & INTERFACES
export interface InstitutionalUser {
  user_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  status: 'active' | 'invited' | 'pending';
  avatar_url?: string;
}

export interface RolePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  approve: boolean;
}

export interface RoleDetails {
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

export interface AssignedUser {
  name: string;
  email: string;
  avatar: string;
  lastActive: string;
  activeNow: boolean;
  device: string;
}

export interface SecurityLog {
  time: string;
  action: string;
  user: string;
  ip: string;
  level: 'info' | 'warning' | 'danger';
}

interface PermissionModalState {
  isOpen: boolean;
  roleId: string;
  roleName: string;
  moduleId: string;
  moduleLabel: string;
  actionKey: keyof RolePermission;
  actionLabel: string;
  currentValue: boolean;
}

// MODULES DEFINITIONS
export const MODULES_LIST = [
  { id: 'dashboard', label: 'Dashboard Rectoral' },
  { id: 'mallas', label: 'Mallas Curriculares & PEI' },
  { id: 'estudiantes', label: 'Estudiantes360' },
  { id: 'cursos', label: 'Cursos & Horarios' },
  { id: 'reportes', label: 'Reportes & Boletines' },
  { id: 'alertas', label: 'Alertas Predictivas' },
  { id: 'rfid', label: 'IoT RFID & Portería' },
  { id: 'configuracion', label: 'Configuración Institucional' },
  { id: 'matriculas', label: 'Matrículas & Onboarding' },
  { id: 'ia', label: 'IA & Motor Predictivo' }
];

// CANONICAL ROLES DICTIONARY
export const ROLE_NAMES: Record<string, string> = {
  super_admin: 'Super Administrador',
  rector: 'Rector Institucional',
  coordinador: 'Coordinador Académico / Convivencial',
  director_grupo: 'Director de Grupo',
  docente: 'Docente de Aula',
  secretaria: 'Secretaría Académica',
  padre_familia: 'Padre de Familia / Acudiente',
  estudiante: 'Estudiante',
};

export const ROLE_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  super_admin: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  rector: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  coordinador: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  director_grupo: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  docente: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  secretaria: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  padre_familia: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  estudiante: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
};

// CANONICAL INSTITUTIONAL ROLES DEFAULT SEED
const DEFAULT_INSTITUTIONAL_ROLES: RoleDetails[] = [
  {
    id: 'r-rector',
    name: 'Rector',
    description: 'Control operacional maestro y representación legal de toda la institución en AulaCore.',
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
      mallas: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      estudiantes: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      cursos: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      reportes: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      alertas: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      rfid: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      configuracion: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      matriculas: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      ia: { view: true, create: true, edit: true, delete: true, export: true, approve: true }
    }
  },
  {
    id: 'r-coordinador',
    name: 'Coordinador Académico / Convivencial',
    description: 'Gestor curricular, disciplinario y revisor autorizado de mallas pedagógicas.',
    hierarchy: 'Alta',
    usersCount: 0,
    securityStatus: 'secure',
    mfaActive: 'Llave + RFID',
    rfidScope: 'Total',
    hoursRestriction: '06:00 - 20:00',
    campusScope: 'Multi-Campus',
    status: 'active',
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false, export: true, approve: false },
      mallas: { view: true, create: true, edit: true, delete: false, export: true, approve: true },
      estudiantes: { view: true, create: true, edit: true, delete: false, export: true, approve: true },
      cursos: { view: true, create: true, edit: true, delete: false, export: true, approve: true },
      reportes: { view: true, create: true, edit: true, delete: false, export: true, approve: true },
      alertas: { view: true, create: true, edit: true, delete: false, export: false, approve: true },
      rfid: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      configuracion: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      matriculas: { view: true, create: true, edit: true, delete: false, export: true, approve: false },
      ia: { view: true, create: false, edit: false, delete: false, export: false, approve: false }
    }
  },
  {
    id: 'r-docente',
    name: 'Docente de Aula',
    description: 'Diseñador de unidades curriculares, calificador y gestor de aula cotidiana.',
    hierarchy: 'Media',
    usersCount: 0,
    securityStatus: 'secure',
    mfaActive: 'Clave simple',
    rfidScope: 'Salón',
    hoursRestriction: '06:00 - 18:00',
    campusScope: 'Sede Asignada',
    status: 'active',
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      mallas: { view: true, create: true, edit: true, delete: false, export: true, approve: false },
      estudiantes: { view: true, create: false, edit: true, delete: false, export: false, approve: false },
      cursos: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      reportes: { view: true, create: false, edit: false, delete: false, export: true, approve: false },
      alertas: { view: true, create: true, edit: false, delete: false, export: false, approve: false },
      rfid: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      configuracion: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      matriculas: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      ia: { view: true, create: false, edit: false, delete: false, export: false, approve: false }
    }
  },
  {
    id: 'r-secretaria',
    name: 'Secretaría Académica',
    description: 'Gestor documental institucional, matrículas SIMAT y certificados académicos.',
    hierarchy: 'Media',
    usersCount: 0,
    securityStatus: 'secure',
    mfaActive: 'Doble Factor',
    rfidScope: 'Administrativo',
    hoursRestriction: '07:00 - 18:00',
    campusScope: 'Sede Principal',
    status: 'active',
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false, export: true, approve: false },
      mallas: { view: true, create: false, edit: false, delete: false, export: true, approve: false },
      estudiantes: { view: true, create: true, edit: true, delete: false, export: true, approve: false },
      cursos: { view: true, create: true, edit: true, delete: false, export: true, approve: false },
      reportes: { view: true, create: true, edit: false, delete: false, export: true, approve: false },
      alertas: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      rfid: { view: true, create: true, edit: true, delete: false, export: true, approve: false },
      configuracion: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      matriculas: { view: true, create: true, edit: true, delete: true, export: true, approve: true },
      ia: { view: false, create: false, edit: false, delete: false, export: false, approve: false }
    }
  }
];

export default function IdentityAccessControlCenterPage() {
  const { activeInstitution, institutionId, mounted, userRole } = useRole();
  const { user } = useAuth();

  // Navigation tab: 'usuarios' (REAL Supabase) | 'catalogo' (Roles Architecture)
  const [activeTab, setActiveTab] = useState<'usuarios' | 'catalogo'>('usuarios');

  // Real institutional users from Supabase RPC get_institution_users
  const [users, setUsers] = useState<InstitutionalUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Modal State for Inviting New User
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('docente');
  const [inviting, setInviting] = useState(false);

  // Modal State for Changing Role
  const [editUserModal, setEditUserModal] = useState<{ isOpen: boolean; user: InstitutionalUser | null; targetRole: string }>({
    isOpen: false,
    user: null,
    targetRole: ''
  });
  const [updatingRole, setUpdatingRole] = useState(false);

  // Catalog Roles State
  const [roles, setRoles] = useState<RoleDetails[]>(DEFAULT_INSTITUTIONAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('r-rector');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentInstId = activeInstitution?.id || institutionId;

  // 1. Cargar Usuarios Reales desde la RPC get_institution_users
  const fetchInstitutionUsers = async () => {
    if (!currentInstId) return;
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase.rpc('get_institution_users', {
        p_institution_id: currentInstId
      });

      if (error) {
        console.error('[Roles & Usuarios] Error al invocar get_institution_users:', error);
        triggerToast(`⚠️ ${error.message}`);
      } else if (data) {
        setUsers(data as InstitutionalUser[]);
      }
    } catch (err: any) {
      console.error('[Roles & Usuarios] Excepción cargando usuarios:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (mounted && currentInstId) {
      fetchInstitutionUsers();
    }
  }, [mounted, currentInstId]);

  // 2. Invitar Usuario Institucional
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInstId) return;

    if (!inviteEmail || !inviteRole) {
      triggerToast('⚠️ El correo electrónico y el rol son obligatorios.');
      return;
    }

    setInviting(true);
    try {
      const res = await fetch('/api/institution/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          name: inviteName.trim(),
          role: inviteRole,
          institutionId: currentInstId
        })
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        triggerToast(`❌ ${json.error || 'Error al enviar invitación.'}`);
      } else {
        triggerToast(`✓ Invitación enviada exitosamente a ${inviteEmail}.`);
        setInviteModalOpen(false);
        setInviteName('');
        setInviteEmail('');
        setInviteRole('docente');
        await fetchInstitutionUsers();
      }
    } catch (err: any) {
      triggerToast(`❌ Error de conexión: ${err.message}`);
    } finally {
      setInviting(false);
    }
  };

  // 3. Modificar / Asignar Rol mediante RPC assign_institution_role
  const handleUpdateRole = async () => {
    if (!editUserModal.user || !editUserModal.targetRole || !currentInstId) return;

    setUpdatingRole(true);
    try {
      const { data, error } = await supabase.rpc('assign_institution_role', {
        p_user_id: editUserModal.user.user_id,
        p_institution_id: currentInstId,
        p_role: editUserModal.targetRole
      });

      if (error) {
        triggerToast(`❌ ${error.message}`);
      } else {
        triggerToast(`✓ Rol de ${editUserModal.user.name} actualizado a ${ROLE_NAMES[editUserModal.targetRole] || editUserModal.targetRole}.`);
        setEditUserModal({ isOpen: false, user: null, targetRole: '' });
        await fetchInstitutionUsers();
      }
    } catch (err: any) {
      triggerToast(`❌ Error: ${err.message}`);
    } finally {
      setUpdatingRole(false);
    }
  };

  // 4. Revocar Rol mediante RPC revoke_institution_role
  const handleRevokeRole = async (targetUser: InstitutionalUser) => {
    if (!currentInstId) return;

    if (targetUser.role === 'rector') {
      triggerToast('🔒 El rol de Rector está protegido y no puede ser revocado desde esta consola.');
      return;
    }

    if (!confirm(`¿Estás seguro de revocar el rol de ${ROLE_NAMES[targetUser.role] || targetUser.role} a ${targetUser.name}? El usuario perderá acceso inmediato a los módulos correspondientes.`)) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('revoke_institution_role', {
        p_user_id: targetUser.user_id,
        p_institution_id: currentInstId,
        p_role: targetUser.role
      });

      if (error) {
        triggerToast(`❌ ${error.message}`);
      } else {
        triggerToast(`✓ Rol de ${targetUser.name} revocado exitosamente.`);
        await fetchInstitutionUsers();
      }
    } catch (err: any) {
      triggerToast(`❌ Error: ${err.message}`);
    }
  };

  // Filtro de usuarios
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearchQuery, userRoleFilter]);

  // Cálculos de KPIs Reales
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const pendingUsersCount = users.filter(u => u.status === 'invited' || u.status === 'pending').length;
  const coordinatorsCount = users.filter(u => u.role === 'coordinador').length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/40 py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative">

      {/* Toast Notification Stack */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[70] bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-600" /> Roles & Membresía Institucional
            </h1>
            {activeInstitution && (
              <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                {activeInstitution.name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">
            Gestión oficial de usuarios, roles reales y asignación de credenciales en Supabase
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setInviteModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Invitar Usuario
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('usuarios')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'usuarios'
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          <Users className="w-4 h-4" /> Miembros & Usuarios ({totalUsersCount})
        </button>
        <button
          onClick={() => setActiveTab('catalogo')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'catalogo'
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          <Shield className="w-4 h-4" /> Catálogo de Roles & Alcance
        </button>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Usuarios</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalUsersCount}</div>
          <div className="text-[10px] text-slate-500 font-medium">Registrados en {activeInstitution?.name || 'la institución'}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Cuentas Activas</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{activeUsersCount}</div>
          <div className="text-[10px] text-slate-500 font-medium">Con acceso confirmado</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Invitaciones Pendientes</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">{pendingUsersCount}</div>
          <div className="text-[10px] text-slate-500 font-medium">Pendientes de activar contraseña</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Equipo Directivo</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{1 + coordinatorsCount}</div>
          <div className="text-[10px] text-slate-500 font-medium">1 Rector + {coordinatorsCount} Coordinadores</div>
        </div>
      </div>

      {/* TAB 1: REAL INSTITUTIONAL USERS */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="all">Todos los roles</option>
                <option value="rector">Rector</option>
                <option value="coordinador">Coordinador</option>
                <option value="docente">Docente</option>
                <option value="director_grupo">Director de Grupo</option>
                <option value="secretaria">Secretaría</option>
                <option value="padre_familia">Padre de Familia</option>
                <option value="estudiante">Estudiante</option>
              </select>

              <button
                onClick={fetchInstitutionUsers}
                className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                title="Actualizar listado"
              >
                <RefreshCw className={cn("w-4 h-4", loadingUsers && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {loadingUsers ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-xs text-slate-500 font-medium">Consultando usuarios reales en Supabase...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No se encontraron usuarios</h3>
                <p className="text-xs text-slate-400">Prueba ajustando los filtros de búsqueda o invita un nuevo miembro.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Usuario</th>
                      <th className="py-3 px-4">Correo Electrónico</th>
                      <th className="py-3 px-4">Rol en Base de Datos</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Fecha de Alta</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {filteredUsers.map(u => {
                      const badge = ROLE_BADGES[u.role] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
                      const roleName = ROLE_NAMES[u.role] || u.role;
                      const isRector = u.role === 'rector';

                      return (
                        <tr key={`${u.user_id}-${u.role}`} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{u.name}</div>
                              {isRector && <span className="text-[9px] text-blue-600 font-bold uppercase">Representante Legal</span>}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{u.email}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-extrabold border tracking-wide uppercase",
                              badge.bg, badge.text, badge.border
                            )}>
                              {roleName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {u.status === 'active' ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Activo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-amber-700 text-[10px] font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Invitación Pendiente
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {!isRector ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setEditUserModal({ isOpen: true, user: u, targetRole: u.role })}
                                  className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                  Gestionar roles
                                </button>
                                <button
                                  onClick={() => handleRevokeRole(u)}
                                  className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-1 rounded-lg transition-colors cursor-pointer"
                                  title="Revocar Rol"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold italic">Principal</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ROLES CATALOG ARCHITECTURE */}
      {activeTab === 'catalogo' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jerarquía Institucional</h3>
            <div className="space-y-2">
              {roles.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={cn(
                    "p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1",
                    selectedRoleId === r.id
                      ? "bg-white border-indigo-600 shadow-md ring-1 ring-indigo-600/10"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{r.name}</span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{r.hierarchy}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{r.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            {roles.find(r => r.id === selectedRoleId) && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {roles.find(r => r.id === selectedRoleId)?.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {roles.find(r => r.id === selectedRoleId)?.description}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                    Autoridad: public.user_roles
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matriz de Acceso por Módulo</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {MODULES_LIST.map(mod => {
                      const roleObj = roles.find(r => r.id === selectedRoleId);
                      const perm = roleObj?.permissions?.[mod.id] || { view: false, create: false, edit: false, delete: false, export: false, approve: false };

                      return (
                        <div key={mod.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                          <span className="font-semibold text-slate-800">{mod.label}</span>
                          <div className="flex items-center gap-1.5">
                            {perm.view && <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">VER</span>}
                            {perm.create && <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">CREAR</span>}
                            {perm.edit && <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">EDITAR</span>}
                            {perm.approve && <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">APROBAR</span>}
                            {perm.delete && <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold">ELIMINAR</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: INVITAR NUEVO USUARIO */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Invitar Miembro Institucional</h3>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej: Lic. Ana María Gómez"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Correo Electrónico Oficial</label>
                <input
                  type="email"
                  placeholder="ana.gomez@institucion.edu.co"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rol a Asignar en Supabase</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none font-semibold text-slate-700"
                >
                  <option value="coordinador">Coordinador Académico / Convivencial</option>
                  <option value="docente">Docente de Aula</option>
                  <option value="director_grupo">Director de Grupo</option>
                  <option value="secretaria">Secretaría Académica</option>
                  <option value="padre_familia">Padre de Familia / Acudiente</option>
                  <option value="estudiante">Estudiante</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  El rol otorga los privilegios reales en el motor de base de datos (PostgreSQL RLS).
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  disabled={inviting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {inviting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {inviting ? 'Aprovisionando...' : 'Enviar Invitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CAMBIAR ROL */}
      {editUserModal.isOpen && editUserModal.user && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Asignar / Gestionar Rol Institucional</h3>
              <button
                onClick={() => setEditUserModal({ isOpen: false, user: null, targetRole: '' })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Usuario</span>
                <p className="font-bold text-slate-900">{editUserModal.user.name}</p>
                <p className="text-[11px] text-slate-500">{editUserModal.user.email}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rol a Asignar / Gestionar</label>
                <select
                  value={editUserModal.targetRole}
                  onChange={e => setEditUserModal(prev => ({ ...prev, targetRole: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="coordinador">Coordinador Académico / Convivencial</option>
                  <option value="docente">Docente de Aula</option>
                  <option value="director_grupo">Director de Grupo</option>
                  <option value="secretaria">Secretaría Académica</option>
                  <option value="padre_familia">Padre de Familia / Acudiente</option>
                  <option value="estudiante">Estudiante</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditUserModal({ isOpen: false, user: null, targetRole: '' })}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  disabled={updatingRole}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUpdateRole}
                  disabled={updatingRole}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {updatingRole && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {updatingRole ? 'Actualizando...' : 'Guardar Cambio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
