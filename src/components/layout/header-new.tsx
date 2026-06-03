'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, User, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROLE_DISPLAY_NAMES, ACADEMIC_PERIODS, UserRole } from '@/lib/navigation';
import { useRole } from '@/providers/role-provider';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';
import { PeriodConfigModal, AcademicPeriodConfig } from '@/components/dashboard/PeriodConfigModal';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export interface RoleScopePermissions {
  role_scope: 'global' | 'institution_supervisor' | 'course' | 'subject' | 'administrative' | 'family' | 'student';
  can_switch_roles: boolean;
  visible_roles: UserRole[];
}

export const ROLE_SCOPE_MAP: Record<UserRole, RoleScopePermissions> = {
  rector: {
    role_scope: 'global',
    can_switch_roles: true,
    visible_roles: ['rector', 'coordinador', 'director_grupo', 'docente', 'secretaria', 'padre_familia', 'estudiante']
  },
  coordinador: {
    role_scope: 'institution_supervisor',
    can_switch_roles: true,
    visible_roles: ['coordinador', 'director_grupo', 'docente', 'padre_familia']
  },
  director_grupo: {
    role_scope: 'course',
    can_switch_roles: true,
    visible_roles: ['director_grupo', 'padre_familia']
  },
  docente: {
    role_scope: 'subject',
    can_switch_roles: false,
    visible_roles: ['docente']
  },
  secretaria: {
    role_scope: 'administrative',
    can_switch_roles: false,
    visible_roles: ['secretaria']
  },
  padre_familia: {
    role_scope: 'family',
    can_switch_roles: false,
    visible_roles: ['padre_familia']
  },
  estudiante: {
    role_scope: 'student',
    can_switch_roles: false,
    visible_roles: ['estudiante']
  }
};

interface HeaderProps {
  userName: string;
  userRole: UserRole;
}

export function Header({ userName, userRole }: HeaderProps) {
  const router = useRouter();
  const { userRole: activeRole, setUserRole, setUserName } = useRole();
  const { signOut, roles, user } = useAuth();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(userName);
  const [profileEmail, setProfileEmail] = useState('');
  
  const [activePeriod, setActivePeriod] = useState('Periodo 1');
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [dynamicPeriods, setDynamicPeriods] = useState<AcademicPeriodConfig[]>([]);

  // Sync profile details with current simulated/real active role
  useEffect(() => {
    if (isProfileOpen) {
      const savedName = localStorage.getItem(`aulacore-profile-name-${activeRole}`) || userName;
      setProfileName(savedName);
      
      let defaultEmail = `${activeRole}@aulacore.com`;
      if (activeRole === 'rector' && user?.email) {
        defaultEmail = user.email;
      }
      const savedEmail = localStorage.getItem(`aulacore-profile-email-${activeRole}`) || defaultEmail;
      setProfileEmail(savedEmail);
    }
  }, [isProfileOpen, activeRole, userName, user]);

  const handleSaveProfile = () => {
    localStorage.setItem(`aulacore-profile-name-${activeRole}`, profileName);
    localStorage.setItem(`aulacore-profile-email-${activeRole}`, profileEmail);
    setUserName(profileName);
    setIsProfileOpen(false);
  };

  // Cargar periodos dinámicos en el cliente
  useEffect(() => {
    const stored = localStorage.getItem('aulacore-periods-config');
    if (stored) {
      setDynamicPeriods(JSON.parse(stored));
    } else {
      // Defaults if none saved
      setDynamicPeriods([
        { id: '1', name: 'Periodo 1', startDate: '2026-01-15', endDate: '2026-03-30' },
        { id: '2', name: 'Periodo 2', startDate: '2026-04-01', endDate: '2026-06-15' },
        { id: '3', name: 'Periodo 3', startDate: '2026-07-05', endDate: '2026-09-15' },
      ]);
    }
  }, []);

  const permissions = ROLE_SCOPE_MAP[activeRole] || {
    role_scope: 'global',
    can_switch_roles: true,
    visible_roles: ['rector', 'director_grupo', 'docente', 'secretaria', 'padre_familia']
  };

  const allowedRoles = permissions.visible_roles;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3 gap-6">
        {/* Brand/Logo Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-150 p-1 shadow-inner">
            <img 
              src="/logo-aulacore.png" 
              alt="AulaCore Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-extrabold text-slate-800 tracking-tight text-sm hidden lg:inline-block">AulaCore</span>
          <span className="w-px h-5 bg-slate-200 mx-2 hidden lg:inline-block" />
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder="Buscar estudiantes, cursos, docentes..."
              className="pl-12 pr-4 py-2 rounded-lg bg-slate-50 border-slate-200 shadow-sm transition-colors focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* HOT ROLE SWITCHER */}
          {permissions.can_switch_roles ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 rounded-lg shadow-sm border-slate-200 cursor-pointer hover:bg-slate-50 transition-all duration-200 animate-fade-in"
                >
                  <span className={cn(
                    "w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0",
                    activeRole === 'rector' && "bg-blue-600",
                    activeRole === 'coordinador' && "bg-indigo-600",
                    activeRole === 'director_grupo' && "bg-purple-600",
                    activeRole === 'docente' && "bg-emerald-600",
                    activeRole === 'secretaria' && "bg-amber-500",
                    activeRole === 'padre_familia' && "bg-rose-500",
                    activeRole === 'estudiante' && "bg-cyan-500"
                  )} />
                  <span className="hidden md:inline font-semibold text-slate-700 text-sm">
                    {ROLE_DISPLAY_NAMES[activeRole]}
                  </span>
                  {roles && roles.length > 1 && (
                    <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 text-white animate-pulse shadow-sm tracking-wide">
                      HÍBRIDO
                    </span>
                  )}
                  <Shield className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-slate-500 text-xs">DEMO: Alternar Rol</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allowedRoles.map((role) => (
                  <DropdownMenuItem
                    key={role}
                    className={cn(
                      "flex items-center gap-2.5 cursor-pointer font-medium text-slate-700 rounded-md transition-colors",
                      activeRole === role && "bg-slate-100/80 font-bold text-slate-900"
                    )}
                    onClick={() => setUserRole(role)}
                  >
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      role === 'rector' && "bg-blue-600",
                      role === 'coordinador' && "bg-indigo-600",
                      role === 'director_grupo' && "bg-purple-600",
                      role === 'docente' && "bg-emerald-600",
                      role === 'secretaria' && "bg-amber-500",
                      role === 'padre_familia' && "bg-rose-500",
                      role === 'estudiante' && "bg-cyan-500"
                    )} />
                    <span>{ROLE_DISPLAY_NAMES[role]}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              disabled
              className="gap-2 rounded-lg shadow-sm border-slate-205 bg-slate-50 text-slate-450 cursor-not-allowed opacity-90 select-none flex items-center shrink-0"
            >
              <span className={cn(
                "w-2.5 h-2.5 rounded-full flex-shrink-0",
                activeRole === 'rector' && "bg-blue-600",
                activeRole === 'director_grupo' && "bg-purple-600",
                activeRole === 'docente' && "bg-emerald-600",
                activeRole === 'secretaria' && "bg-amber-500",
                activeRole === 'padre_familia' && "bg-rose-500",
                activeRole === 'estudiante' && "bg-cyan-500"
              )} />
              <span className="font-bold text-slate-600 text-sm">
                {ROLE_DISPLAY_NAMES[activeRole]}
              </span>
              <span className="text-[9px] bg-slate-200 text-slate-600 font-extrabold px-2 py-0.5 rounded leading-none shrink-0 tracking-wider">
                {permissions.role_scope.toUpperCase()}
              </span>
            </Button>
          )}

          {/* Academic Period */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" size="sm" className="gap-2 rounded-lg shadow-sm hidden sm:flex border-slate-200">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-700 text-sm">{activePeriod}</span>
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Período Académico</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {dynamicPeriods.map((period) => (
                <DropdownMenuItem key={period.id} onClick={() => setActivePeriod(period.name)} className="cursor-pointer">
                  {period.name}
                  {activePeriod === period.name && <span className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-indigo-600 font-bold cursor-pointer hover:text-indigo-700"
                onClick={() => setIsPeriodModalOpen(true)}
              >
                + Configurar Periodos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <PeriodConfigModal 
            isOpen={isPeriodModalOpen} 
            onClose={() => setIsPeriodModalOpen(false)} 
            onSave={(newPeriods) => {
              setDynamicPeriods(newPeriods);
              if (!newPeriods.find(p => p.name === activePeriod) && newPeriods.length > 0) {
                setActivePeriod(newPeriods[0].name);
              }
            }} 
          />

          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogContent className="max-w-md bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl p-6">
              <DialogHeader className="flex flex-col items-center text-center space-y-2 pb-4 border-b border-slate-100">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg",
                  activeRole === 'rector' && "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20",
                  activeRole === 'coordinador' && "bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/20",
                  activeRole === 'director_grupo' && "bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/20",
                  activeRole === 'docente' && "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20",
                  activeRole === 'secretaria' && "bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/20",
                  activeRole === 'padre_familia' && "bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/20",
                  activeRole === 'estudiante' && "bg-gradient-to-br from-cyan-400 to-cyan-500 shadow-cyan-500/20"
                )}>
                  {profileName.charAt(0)}
                </div>
                <div>
                  <DialogTitle className="text-lg font-black text-slate-800 tracking-tight">{profileName}</DialogTitle>
                  <DialogDescription className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mt-1">
                    {ROLE_DISPLAY_NAMES[activeRole]}
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="py-4 space-y-4 text-xs font-semibold text-slate-600">
                {/* Formulario de Edición */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</label>
                    <Input 
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 text-xs shadow-sm focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correo Electrónico</label>
                    <Input 
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 text-xs shadow-sm focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detalles de la Cuenta</h4>
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Institución Activa</span>
                      <span className="text-slate-800 font-bold">Colegio AulaCore Central</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Identificador de Usuario</span>
                      <span className="font-mono text-slate-500 text-[10px]">{user?.id ? user.id.slice(0, 18).toUpperCase() + '...' : 'AC-USER-DEMO-2026'}</span>
                    </div>
                  </div>
                </div>

                {/* Rol Autorizado (IAM) */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rol Autorizado (IAM)</h4>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-blue-50 border border-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-wide">
                      {ROLE_DISPLAY_NAMES[activeRole]}
                    </span>
                  </div>
                </div>

                {/* Estado de Seguridad */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado de Seguridad</h4>
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Doble Factor (MFA)</span>
                      <span className="text-emerald-700 flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activo (Biométrico)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Acceso Horario</span>
                      <span className="text-slate-800 font-bold">
                        {activeRole === 'rector' || activeRole === 'secretaria' || activeRole === 'coordinador' ? 'Ilimitado (Directivo)' : 'Restringido a Horario'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Dispositivo Autorizado</span>
                      <span className="text-slate-800 font-bold">Chrome - Windows (Verificado)</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2 flex gap-2">
                <Button 
                  onClick={() => setIsProfileOpen(false)} 
                  variant="outline"
                  className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveProfile} 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-750 text-white font-black text-xs uppercase tracking-wider py-2.5 rounded-xl cursor-pointer shadow-sm"
                >
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-slate-100 rounded-md transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-3 hover:bg-slate-100 rounded-md transition cursor-pointer"
              />
            }>
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow transition-all duration-300",
                activeRole === 'rector' && "bg-gradient-to-br from-blue-500 to-blue-600",
                activeRole === 'coordinador' && "bg-gradient-to-br from-indigo-500 to-indigo-600",
                activeRole === 'director_grupo' && "bg-gradient-to-br from-purple-500 to-purple-600",
                activeRole === 'docente' && "bg-gradient-to-br from-emerald-500 to-emerald-600",
                activeRole === 'secretaria' && "bg-gradient-to-br from-amber-500 to-amber-600",
                activeRole === 'padre_familia' && "bg-gradient-to-br from-rose-500 to-rose-600",
                activeRole === 'estudiante' && "bg-gradient-to-br from-cyan-400 to-cyan-500"
              )}>
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-sm font-semibold text-slate-900">
                  {userName}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {ROLE_DISPLAY_NAMES[activeRole]}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="cursor-pointer font-medium text-slate-700">
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-655 cursor-pointer font-medium" onClick={signOut}>
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
