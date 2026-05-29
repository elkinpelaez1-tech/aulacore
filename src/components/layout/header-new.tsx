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
  const { userRole: activeRole, setUserRole } = useRole();
  const { signOut, roles } = useAuth();
  
  const [activePeriod, setActivePeriod] = useState('Periodo 1');
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [dynamicPeriods, setDynamicPeriods] = useState<AcademicPeriodConfig[]>([]);

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
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 cursor-pointer font-medium" onClick={signOut}>
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
