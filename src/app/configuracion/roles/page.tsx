'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, ShieldAlert, Key, Terminal, Smartphone, 
  MapPin, Clock, Activity, Search, SlidersHorizontal, Plus, 
  X, Check, AlertTriangle, RefreshCw, Eye, Settings2, 
  Lock, ArrowRight, UserPlus, Info, CheckCircle2, ChevronRight,
  ShieldCheck, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/providers/role-provider';

// TYPES & INTERFACES
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
  { id: 'estudiantes', label: 'Estudiantes360' },
  { id: 'cursos', label: 'Cursos & Horarios' },
  { id: 'reportes', label: 'Reportes & Boletines' },
  { id: 'alertas', label: 'Alertas Predictivas' },
  { id: 'rfid', label: 'IoT RFID & Portería' },
  { id: 'configuracion', label: 'Configuración de Marca' },
  { id: 'matriculas', label: 'Matrículas & Onboarding' },
  { id: 'pagos', label: 'Facturación & Pagos' },
  { id: 'ia', label: 'IA & Motor Predictivo' }
];

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
    id: 'r-coordinador',
    name: 'Coordinador Académico',
    description: 'Gestor de disciplina, control de asistencia curricular y organización horaria académica.',
    hierarchy: 'Alta',
    usersCount: 1,
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
      pagos: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      ia: { view: true, create: false, edit: true, delete: false, export: false, approve: false }
    }
  },
  {
    id: 'r-secretaria',
    name: 'Secretario Académico',
    description: 'Operario de admisiones, registro de calificaciones oficiales, matrículas y actas de grado.',
    hierarchy: 'Media',
    usersCount: 1,
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
    id: 'r-docente',
    name: 'Docente de Aula',
    description: 'Generador de notas, controlador de asistencia del aula y creador de actividades curriculares.',
    hierarchy: 'Media',
    usersCount: 0,
    securityStatus: 'secure',
    mfaActive: 'Clave simple',
    rfidScope: 'Salón',
    hoursRestriction: '06:00 - 18:00',
    campusScope: 'Sede Asignada',
    status: 'active',
    permissions: {
      dashboard: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      estudiantes: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      cursos: { view: true, create: false, edit: true, delete: false, export: true, approve: false },
      reportes: { view: true, create: true, edit: true, delete: false, export: false, approve: false },
      alertas: { view: true, create: true, edit: false, delete: false, export: false, approve: false },
      rfid: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      configuracion: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      matriculas: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      pagos: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      ia: { view: true, create: false, edit: false, delete: false, export: false, approve: false }
    }
  },
  {
    id: 'r-director-grupo',
    name: 'Director de Grupo',
    description: 'Líder pedagógico y disciplinario de grado con consolidación de boletines y contacto con acudientes.',
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
      estudiantes: { view: true, create: false, edit: true, delete: false, export: true, approve: false },
      cursos: { view: true, create: false, edit: true, delete: false, export: true, approve: false },
      reportes: { view: true, create: true, edit: true, delete: false, export: true, approve: false },
      alertas: { view: true, create: true, edit: true, delete: false, export: false, approve: false },
      rfid: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      configuracion: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      matriculas: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      pagos: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      ia: { view: true, create: false, edit: false, delete: false, export: false, approve: false }
    }
  },
  {
    id: 'r-orientador',
    name: 'Orientador Escolar',
    description: 'Atención psicológica, seguimiento convivencial, plan PIAR y bienestar psicosocial del educando.',
    hierarchy: 'Media',
    usersCount: 0,
    securityStatus: 'secure',
    mfaActive: 'Clave simple',
    rfidScope: 'Acceso Autorizado',
    hoursRestriction: '07:00 - 17:00',
    campusScope: 'Sede Principal',
    status: 'active',
    permissions: {
      dashboard: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      estudiantes: { view: true, create: false, edit: true, delete: false, export: true, approve: false },
      cursos: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      reportes: { view: true, create: true, edit: true, delete: false, export: true, approve: false },
      alertas: { view: true, create: true, edit: true, delete: false, export: true, approve: true },
      rfid: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      configuracion: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      matriculas: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      pagos: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      ia: { view: true, create: false, edit: false, delete: false, export: false, approve: false }
    }
  },
  {
    id: 'r-administrativo',
    name: 'Personal Administrativo',
    description: 'Soporte operacional, recepción, gestión de suministros e inventario escolar.',
    hierarchy: 'Baja',
    usersCount: 0,
    securityStatus: 'secure',
    mfaActive: 'RFID Tag',
    rfidScope: 'Administrativo',
    hoursRestriction: '07:00 - 17:00',
    campusScope: 'Sede Asignada',
    status: 'active',
    permissions: {
      dashboard: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      estudiantes: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      cursos: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      reportes: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      alertas: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      rfid: { view: true, create: true, edit: true, delete: false, export: true, approve: false },
      configuracion: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      matriculas: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      pagos: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      ia: { view: false, create: false, edit: false, delete: false, export: false, approve: false }
    }
  },
  {
    id: 'r-padre',
    name: 'Padre de Familia / Acudiente',
    description: 'Portal de acudientes: seguimiento de calificaciones de sus hijos, circulares y bitácora escolar.',
    hierarchy: 'Baja',
    usersCount: 0,
    securityStatus: 'restricted',
    mfaActive: 'Clave simple',
    rfidScope: 'Portería Total',
    hoursRestriction: 'Solo en citación',
    campusScope: 'Sede del Estudiante',
    status: 'active',
    permissions: {
      dashboard: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      estudiantes: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      cursos: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      reportes: { view: true, create: false, edit: false, delete: false, export: true, approve: false },
      alertas: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      rfid: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      configuracion: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      matriculas: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      pagos: { view: true, create: false, edit: false, delete: false, export: true, approve: false },
      ia: { view: false, create: false, edit: false, delete: false, export: false, approve: false }
    }
  },
  {
    id: 'r-estudiante',
    name: 'Estudiante',
    description: 'Portal estudiantil: consulta de boletines, carné virtual RFID y plan académico.',
    hierarchy: 'Baja',
    usersCount: 0,
    securityStatus: 'restricted',
    mfaActive: 'RFID Tag',
    rfidScope: 'Portería Total',
    hoursRestriction: '06:30 - 15:30',
    campusScope: 'Sede del Estudiante',
    status: 'active',
    permissions: {
      dashboard: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      estudiantes: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      cursos: { view: true, create: false, edit: false, delete: false, export: false, approve: false },
      reportes: { view: true, create: false, edit: false, delete: false, export: true, approve: false },
      alertas: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      rfid: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      configuracion: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      matriculas: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      pagos: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      ia: { view: false, create: false, edit: false, delete: false, export: false, approve: false }
    }
  }
];

export default function IdentityAccessControlCenterPage() {
  const { activeInstitution, institutionId, mounted } = useRole();

  const [roles, setRoles] = useState<RoleDetails[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [hierarchyFilter, setHierarchyFilter] = useState<'all' | 'Alta' | 'Media' | 'Baja'>('all');

  // Role 360 Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRoleId, setDrawerRoleId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'resumen' | 'personal' | 'restricciones' | 'rfid' | 'bitacora'>('resumen');

  // Modal State for Adding New Role
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleHierarchy, setNewRoleHierarchy] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  const [newRoleMfa, setNewRoleMfa] = useState<RoleDetails['mfaActive']>('Clave simple');
  const [newRoleRfid, setNewRoleRfid] = useState<RoleDetails['rfidScope']>('Salón');
  const [newRoleHours, setNewRoleHours] = useState<RoleDetails['hoursRestriction']>('06:00 - 18:00');

  // Permission Configuration Modal State
  const [permModal, setPermModal] = useState<PermissionModalState | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Institutional Multi-Tenant Storage Key
  const storageKey = (activeInstitution?.id || institutionId)
    ? `aulacore-roles-settings-${activeInstitution?.id || institutionId}`
    : 'aulacore-roles-settings';

  // Persistence handler
  const saveRoles = (updatedList: RoleDetails[]) => {
    setRoles(updatedList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
        window.dispatchEvent(new CustomEvent('aulacore-roles-updated', {
          detail: { institutionId: activeInstitution?.id || institutionId }
        }));
      } catch (err) {
        console.error('Error saving roles to localStorage:', err);
      }
    }
  };

  // Load and synchronize roles
  useEffect(() => {
    if (!mounted) return;

    const loadRoles = async () => {
      let initialRoles: RoleDetails[] = [];

      // 1. Read from institutional localStorage
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              initialRoles = parsed;
            }
          } catch (e) {
            console.error('Error parsing cached roles:', e);
          }
        }
      }

      // 2. Fallback to canonical default roles if empty
      if (initialRoles.length === 0) {
        initialRoles = DEFAULT_INSTITUTIONAL_ROLES;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(storageKey, JSON.stringify(initialRoles));
          } catch (e) {
            console.error('Error saving initial roles:', e);
          }
        }
      }

      // 3. Attempt to count active users from user_roles in Supabase
      const currentInstId = activeInstitution?.id || institutionId;
      if (currentInstId) {
        try {
          const { data: userRolesData, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('institution_id', currentInstId);

          if (!error && userRolesData && userRolesData.length > 0) {
            const countsByRole: Record<string, number> = {};
            userRolesData.forEach((ur: any) => {
              const r = String(ur.role || '').toLowerCase().trim();
              countsByRole[r] = (countsByRole[r] || 0) + 1;
            });

            initialRoles = initialRoles.map(role => {
              const norm = role.name.toLowerCase();
              let count = role.usersCount;
              if (norm.includes('rector') && countsByRole['rector'] !== undefined) {
                count = countsByRole['rector'];
              } else if (norm.includes('coordinador') && countsByRole['coordinador'] !== undefined) {
                count = countsByRole['coordinador'];
              } else if (norm.includes('docente') && countsByRole['docente'] !== undefined) {
                count = countsByRole['docente'];
              } else if (norm.includes('secretari') && countsByRole['secretaria'] !== undefined) {
                count = countsByRole['secretaria'];
              } else if (norm.includes('director de grupo') && countsByRole['director_grupo'] !== undefined) {
                count = countsByRole['director_grupo'];
              } else if (norm.includes('estudiante') && countsByRole['estudiante'] !== undefined) {
                count = countsByRole['estudiante'];
              } else if (norm.includes('padre') && countsByRole['padre_familia'] !== undefined) {
                count = countsByRole['padre_familia'];
              }
              return { ...role, usersCount: count };
            });
          }
        } catch (err) {
          console.warn('User roles counting exception:', err);
        }
      }

      setRoles(initialRoles);

      // Select first role by default
      if (initialRoles.length > 0) {
        setSelectedRoleId(prev => {
          const exists = initialRoles.some(r => r.id === prev);
          return exists ? prev : initialRoles[0].id;
        });
      }
    };

    loadRoles();

    // Cross-view and cross-tab real-time sync listeners
    const handleSync = () => {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setRoles(parsed);
            }
          } catch (err) {
            console.error('Error syncing roles:', err);
          }
        }
      }
    };

    window.addEventListener('aulacore-roles-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('aulacore-roles-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [mounted, activeInstitution?.id, institutionId, storageKey]);

  // Active role for the Matrix
  const activeRole = roles.find(r => r.id === selectedRoleId) || (roles.length > 0 ? roles[0] : null);

  // Active role for the 360 Drawer
  const drawerRole = roles.find(r => r.id === drawerRoleId) || null;

  // Open the Permission Configuration Modal
  const handleOpenPermModal = (
    moduleId: string, 
    moduleLabel: string, 
    actionKey: keyof RolePermission, 
    actionLabel: string, 
    currentValue: boolean
  ) => {
    const targetRole = activeRole || (roles.length > 0 ? roles[0] : null);
    if (!targetRole) return;

    setPermModal({
      isOpen: true,
      roleId: targetRole.id,
      roleName: targetRole.name,
      moduleId,
      moduleLabel,
      actionKey,
      actionLabel,
      currentValue
    });
  };

  // Save changes from the Permission Configuration Modal
  const handleSavePermModal = (newValue: boolean) => {
    if (!permModal) return;
    const { roleId, moduleId, actionKey, moduleLabel, actionLabel, roleName } = permModal;
    
    const updatedRoles = roles.map(role => {
      if (role.id === roleId) {
        const currentModulePerm = role.permissions?.[moduleId] || { 
          view: false, create: false, edit: false, delete: false, export: false, approve: false 
        };
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [moduleId]: {
              ...currentModulePerm,
              [actionKey]: newValue
            }
          }
        };
      }
      return role;
    });

    saveRoles(updatedRoles);
    setPermModal(null);
    triggerToast(`✓ Permiso ${actionLabel} en ${moduleLabel} marcado como ${newValue ? 'PERMITIDO' : 'DENEGADO'} para ${roleName}.`);
  };

  // Enable/Disable role switch
  const handleToggleRoleStatus = (roleId: string, roleName: string, currentStatus: RoleDetails['status']) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' as const : 'active' as const;
    const updatedRoles = roles.map(r => {
      if (r.id === roleId) return { ...r, status: nextStatus };
      return r;
    });

    saveRoles(updatedRoles);
    triggerToast(nextStatus === 'active' ? `✓ Rol ${roleName} habilitado en la red institucional.` : `🔒 Acceso revocado temporalmente para el rol ${roleName}.`);
  };

  // Add new Custom Role
  const handleCreateRole = () => {
    if (!newRoleName.trim() || !newRoleDescription.trim()) {
      triggerToast('⚠️ Por favor escribe el nombre y descripción del rol.');
      return;
    }

    const defaultPermissions: Record<string, RolePermission> = {};
    MODULES_LIST.forEach(mod => {
      defaultPermissions[mod.id] = { view: true, create: false, edit: false, delete: false, export: false, approve: false };
    });

    const newR: RoleDetails = {
      id: 'r-' + Date.now(),
      name: newRoleName.trim(),
      description: newRoleDescription.trim(),
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
    setSelectedRoleId(newR.id);

    // Reset Form
    setNewRoleName('');
    setNewRoleDescription('');
    setNewRoleHierarchy('Media');
    setAddModalOpen(false);
    triggerToast(`✓ Rol personalizado ${newRoleName} aprovisionado con éxito.`);
  };

  // Delete Custom Role
  const handleDeleteRole = (id: string, name: string) => {
    const updatedList = roles.filter(r => r.id !== id);
    saveRoles(updatedList);
    if (selectedRoleId === id && updatedList.length > 0) {
      setSelectedRoleId(updatedList[0].id);
    }
    triggerToast(`✓ Rol ${name} removido del IAM Center.`);
    if (drawerRoleId === id) setDrawerOpen(false);
  };

  // Helper values for security logs & users
  const getRoleLogs = (roleId: string): SecurityLog[] => {
    return [];
  };

  const getRoleUsers = (roleId: string): AssignedUser[] => {
    return [];
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
  
  let connectedUsers = 0;
  roles.forEach(role => {
    connectedUsers += role.usersCount || 0;
  });

  let criticalPermsCount = 0;
  roles.forEach(role => {
    if (role.permissions) {
      Object.values(role.permissions).forEach(perm => {
        if (perm.delete) criticalPermsCount++;
        if (perm.export) criticalPermsCount++;
        if (perm.approve) criticalPermsCount++;
      });
    }
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/20 py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      
      {/* Toast Notification Stack */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[70] bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header operations bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-600" /> Roles & Permisos
            </h1>
            {activeInstitution && (
              <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                {activeInstitution.name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-semibold tracking-wider mt-1 uppercase">Jerarquía de seguridad institucional y delegación granular de accesos por rol</p>
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

      {/* 1. IDENTITY INTEL KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Roles */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Jerarquía Institucional</span>
            <Shield className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-850">{totalRoles}</span>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{activeRolesCount} Activos</span>
          </div>
          <div className="text-[9px] text-slate-450 font-medium">Roles configurados para la institución</div>
        </div>

        {/* KPI 2: Connected Staff Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Usuarios Registrados</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-850">{connectedUsers}</span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Asignados</span>
          </div>
          <div className="text-[9px] text-slate-450 font-medium">Cuentas institucionales vinculadas</div>
        </div>

        {/* KPI 3: Sensitive Delegated Permissions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Permisos Críticos</span>
            <Lock className="w-4 h-4 text-amber-600" />
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
            <span className="text-[10px] font-semibold uppercase tracking-wider">Aislamiento de Tenant</span>
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-850">100%</span>
            <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Protegido</span>
          </div>
          <div className="text-[9px] text-slate-450 font-medium">Ámbito institucional restringido</div>
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

      {/* 2. CAMPUS ROLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map(role => {
          const isSelected = (selectedRoleId === role.id) || (!selectedRoleId && activeRole?.id === role.id);
          const isActive = role.status === 'active';

          return (
            <div 
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              className={cn(
                "bg-white border rounded-3xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 relative",
                isSelected ? "border-indigo-600 ring-2 ring-indigo-500/15 shadow-sm" : "border-slate-200 hover:border-slate-300"
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
                    title={isActive ? 'Desactivar rol' : 'Activar rol'}
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

                <div className="flex items-center justify-between pt-2">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
                    {role.name}
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" title="Seleccionado en Matriz" />
                    )}
                  </h3>
                  {isSelected && (
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      Auditado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
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

      {/* 3. DYNAMIC PERMISSION MATRIX */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        
        {/* Matrix Header controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-850 tracking-tight">Matriz de Permisos Global</h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Interactivo
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Audita y edita la matriz cruzada de privilegios de acceso para el rol de <span className="text-indigo-600 font-bold underline leading-none uppercase">{activeRole?.name ?? 'Rol Seleccionado'}</span>. Haz clic en cualquier celda para configurar el permiso.
            </p>
          </div>

          {/* Active Role selector drop */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Rol Auditado:</span>
            <select
              value={selectedRoleId || activeRole?.id || ''}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 focus:border-indigo-500 cursor-pointer"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.hierarchy})</option>
              ))}
            </select>
          </div>
        </div>

        {/* The Crusader Matrix Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-full divide-y divide-slate-150 text-left text-xs font-semibold text-slate-650">
            <thead className="bg-slate-50/70 text-[9px] font-black text-slate-450 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-3.5 min-w-[200px]">Módulo del Ecosistema</th>
                <th className="px-3 py-3.5 text-center">View (Ver)</th>
                <th className="px-3 py-3.5 text-center">Create (Crear)</th>
                <th className="px-3 py-3.5 text-center">Edit (Editar)</th>
                <th className="px-3 py-3.5 text-center">Delete (Borrar)</th>
                <th className="px-3 py-3.5 text-center">Export (Descargar)</th>
                <th className="px-3 py-3.5 text-center">Approve (Aprobar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {MODULES_LIST.map(mod => {
                const permissions = (activeRole?.permissions?.[mod.id]) || { 
                  view: false, create: false, edit: false, delete: false, export: false, approve: false 
                };

                return (
                  <tr key={mod.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-850 text-[13px]">{mod.label}</span>
                      </div>
                    </td>
                    
                    {/* View Action cell */}
                    <td className="px-3 py-3.5 text-center">
                      <button
                        onClick={() => handleOpenPermModal(mod.id, mod.label, 'view', 'VIEW (Ver)', permissions.view)}
                        title={`Clic para configurar permiso VIEW en ${mod.label}`}
                        className={cn(
                          "w-full max-w-[110px] py-1.5 px-2 rounded-xl text-[10px] font-bold tracking-wider transition-all select-none border cursor-pointer flex items-center justify-center gap-1.5 mx-auto",
                          permissions.view 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 shadow-xs" 
                            : "bg-slate-100/70 border-slate-200 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600"
                        )}
                      >
                        {permissions.view ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Permitido</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Denegado</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Create Action cell */}
                    <td className="px-3 py-3.5 text-center">
                      <button
                        onClick={() => handleOpenPermModal(mod.id, mod.label, 'create', 'CREATE (Crear)', permissions.create)}
                        title={`Clic para configurar permiso CREATE en ${mod.label}`}
                        className={cn(
                          "w-full max-w-[110px] py-1.5 px-2 rounded-xl text-[10px] font-bold tracking-wider transition-all select-none border cursor-pointer flex items-center justify-center gap-1.5 mx-auto",
                          permissions.create 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 shadow-xs" 
                            : "bg-slate-100/70 border-slate-200 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600"
                        )}
                      >
                        {permissions.create ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Permitido</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Denegado</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Edit Action cell */}
                    <td className="px-3 py-3.5 text-center">
                      <button
                        onClick={() => handleOpenPermModal(mod.id, mod.label, 'edit', 'EDIT (Editar)', permissions.edit)}
                        title={`Clic para configurar permiso EDIT en ${mod.label}`}
                        className={cn(
                          "w-full max-w-[110px] py-1.5 px-2 rounded-xl text-[10px] font-bold tracking-wider transition-all select-none border cursor-pointer flex items-center justify-center gap-1.5 mx-auto",
                          permissions.edit 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 shadow-xs" 
                            : "bg-slate-100/70 border-slate-200 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600"
                        )}
                      >
                        {permissions.edit ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Permitido</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Denegado</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Delete Action cell */}
                    <td className="px-3 py-3.5 text-center">
                      <button
                        onClick={() => handleOpenPermModal(mod.id, mod.label, 'delete', 'DELETE (Borrar)', permissions.delete)}
                        title={`Clic para configurar permiso DELETE en ${mod.label}`}
                        className={cn(
                          "w-full max-w-[110px] py-1.5 px-2 rounded-xl text-[10px] font-bold tracking-wider transition-all select-none border cursor-pointer flex items-center justify-center gap-1.5 mx-auto",
                          permissions.delete 
                            ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300 shadow-xs" 
                            : "bg-slate-100/70 border-slate-200 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600"
                        )}
                      >
                        {permissions.delete ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span>Permitido</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Denegado</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Export Action cell */}
                    <td className="px-3 py-3.5 text-center">
                      <button
                        onClick={() => handleOpenPermModal(mod.id, mod.label, 'export', 'EXPORT (Descargar)', permissions.export)}
                        title={`Clic para configurar permiso EXPORT en ${mod.label}`}
                        className={cn(
                          "w-full max-w-[110px] py-1.5 px-2 rounded-xl text-[10px] font-bold tracking-wider transition-all select-none border cursor-pointer flex items-center justify-center gap-1.5 mx-auto",
                          permissions.export 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 shadow-xs" 
                            : "bg-slate-100/70 border-slate-200 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600"
                        )}
                      >
                        {permissions.export ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Permitido</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Denegado</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Approve Action cell */}
                    <td className="px-3 py-3.5 text-center">
                      <button
                        onClick={() => handleOpenPermModal(mod.id, mod.label, 'approve', 'APPROVE (Aprobar)', permissions.approve)}
                        title={`Clic para configurar permiso APPROVE en ${mod.label}`}
                        className={cn(
                          "w-full max-w-[110px] py-1.5 px-2 rounded-xl text-[10px] font-bold tracking-wider transition-all select-none border cursor-pointer flex items-center justify-center gap-1.5 mx-auto",
                          permissions.approve 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 shadow-xs" 
                            : "bg-slate-100/70 border-slate-200 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600"
                        )}
                      >
                        {permissions.approve ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Permitido</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Denegado</span>
                          </>
                        )}
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* 4. PERMISSION CONFIGURATION MODAL (Jira / Notion High Fidelity Dialog) */}
      {permModal?.isOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          {/* Backdrop shadow */}
          <div 
            onClick={() => setPermModal(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
            aria-hidden="true"
          />

          {/* Modal Box */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left shadow-2xl transition-all my-8 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex justify-between items-start">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Configurar Permiso
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {permModal.moduleLabel} • Acción <span className="font-bold text-indigo-600">{permModal.actionLabel}</span>
                </p>
              </div>
              <button 
                onClick={() => setPermModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              
              {/* Role context chip */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                <span className="text-xs font-semibold text-slate-600">Rol Institucional:</span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                  {permModal.roleName}
                </span>
              </div>

              {/* Status Banner */}
              {permModal.currentValue ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Estado: Permitido (Allowed)</h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Los usuarios con este rol tienen autorización activa para ejecutar esta acción.</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Estado: Denegado (Denied)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">La acción se encuentra bloqueada para los usuarios asignados a este rol.</p>
                  </div>
                </div>
              )}

              {/* Interactive Selector Buttons */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Asignar Privilegio</label>
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Allow Button */}
                  <button
                    type="button"
                    onClick={() => setPermModal({ ...permModal, currentValue: true })}
                    className={cn(
                      "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5",
                      permModal.currentValue
                        ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 text-emerald-900 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className={cn("w-4 h-4", permModal.currentValue ? "text-emerald-600" : "text-slate-400")} />
                        Permitir
                      </span>
                      {permModal.currentValue && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">Concede acceso y ejecución en el módulo</span>
                  </button>

                  {/* Deny Button */}
                  <button
                    type="button"
                    onClick={() => setPermModal({ ...permModal, currentValue: false })}
                    className={cn(
                      "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5",
                      !permModal.currentValue
                        ? "bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 text-rose-900 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Lock className={cn("w-4 h-4", !permModal.currentValue ? "text-rose-600" : "text-slate-400")} />
                        Denegar
                      </span>
                      {!permModal.currentValue && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">Bloquea la ejecución en el módulo</span>
                  </button>

                </div>
              </div>

              {/* Institution Context Note */}
              <div className="text-[10px] text-slate-450 border-t border-slate-100 pt-3 flex items-center justify-between">
                <span>Institución: <strong className="text-slate-700">{activeInstitution?.name || 'Instituto Profes'}</strong></span>
                <span className="text-indigo-600 font-semibold">Aislamiento Multi-Tenant Activo</span>
              </div>

            </div>

            {/* Modal actions */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPermModal(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSavePermModal(permModal.currentValue)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-indigo-700 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                Guardar Permiso
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. ROLE 360 DRAWER */}
      {drawerOpen && drawerRole && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Dark glass backdrop overlay */}
            <div 
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            />

            {/* Sliding Panel wrapper */}
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 z-10">
              <div className="pointer-events-auto w-screen max-w-2xl transform bg-slate-900 text-white border-l border-slate-800 shadow-2xl transition-all duration-300 relative z-10">
                
                <div className="flex h-full flex-col overflow-y-scroll py-6 px-6 space-y-6">
                  
                  {/* Drawer Header Area */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded">
                          {drawerRole.hierarchy} Jerarquía
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online" />
                      </div>
                      <h2 className="text-xl font-bold tracking-tight text-white">{drawerRole.name}</h2>
                      <p className="text-xs text-slate-400">{drawerRole.description}</p>
                    </div>

                    <button 
                      onClick={() => setDrawerOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Navigation tabs inside Drawer */}
                  <div className="flex border-b border-slate-800 text-xs font-semibold text-slate-400 gap-6">
                    {[
                      { id: 'resumen', label: 'Resumen & Seguridad' },
                      { id: 'personal', label: `Personal (${drawerRole.usersCount})` },
                      { id: 'restricciones', label: 'Restricciones' },
                      { id: 'rfid', label: 'Credenciales RFID' },
                      { id: 'bitacora', label: 'Bitácora' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setDrawerTab(tab.id as any)}
                        className={cn(
                          "pb-3 border-b-2 font-semibold uppercase tracking-wider text-[10px] transition-colors cursor-pointer",
                          drawerTab === tab.id ? "border-indigo-500 text-indigo-400" : "border-transparent hover:text-slate-300"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
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
                            {Object.values(drawerRole.permissions || {}).some(p => p.delete) ? '⚠️ Habilitados en ciertos módulos' : 'No Habilitados'}
                          </span>
                        </div>
                      </div>

                      {/* Biometric Auth info */}
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
                        {getRoleUsers(drawerRole.id).length === 0 ? (
                          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
                            No hay usuarios asignados directamente a este rol en la bitácora local.
                          </div>
                        ) : (
                          getRoleUsers(drawerRole.id).map((user, idx) => (
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
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Operational Constraints */}
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

                  {/* Tab 5: Audit logs */}
                  {drawerTab === 'bitacora' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100">Bitácora Forense de Seguridad</h3>
                        <p className="text-xs text-slate-455 font-medium">Registro forense de auditoría reciente sobre este rol en AulaCore.</p>
                      </div>

                      <div className="space-y-3.5 pt-2">
                        {getRoleLogs(drawerRole.id).length === 0 ? (
                          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
                            No hay eventos forenses registrados para este rol en el periodo actual.
                          </div>
                        ) : (
                          getRoleLogs(drawerRole.id).map((log, idx) => (
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
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Drawer Footer controls */}
                  <div className="border-t border-slate-800 pt-5 mt-auto flex items-center justify-between text-xs">
                    {drawerRole.usersCount === 0 ? (
                      <button
                        onClick={() => handleDeleteRole(drawerRole.id, drawerRole.name)}
                        className="text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 px-3.5 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Remover Rol
                      </button>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider bg-slate-850 px-2.5 py-1 rounded">
                        Rol con Usuarios Vinculados (Protegido)
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

      {/* 6. NOTION-STYLE NEW ROLE APREVISION OVERLAY MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 sm:p-6" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Backdrop shadow */}
          <div 
            onClick={() => setAddModalOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
            aria-hidden="true"
          />

          {/* Modal Box */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-3xl bg-white border border-slate-200 text-left shadow-2xl transition-all my-8 animate-in zoom-in-95 duration-200"
          >
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
      )}

    </div>
  );
}
