'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/lib/navigation';
import { useAuth } from '@/providers/auth-provider';

interface RoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  userName: string;
  setUserName: (name: string) => void;
  mounted: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { profile, activeRole, setActiveRole, isAuthenticated, loading, roles } = useAuth();
  
  const [localRole, setLocalRoleState] = useState<UserRole>('rector');
  const [localName, setLocalNameState] = useState<string>('Dr. Ramírez');
  const [customDemoName, setCustomDemoName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Cargar desde localStorage tras montar para simulación local si no hay sesión activa
  useEffect(() => {
    const savedRole = localStorage.getItem('aulacore-user-role') as UserRole;
    const savedName = localStorage.getItem('aulacore-user-name');
    const savedDemoName = localStorage.getItem('aulacore-demo-name');
    
    if (savedRole) {
      setLocalRoleState(savedRole);
    } else {
      localStorage.setItem('aulacore-user-role', 'rector');
    }
    
    if (savedName) {
      setLocalNameState(savedName);
    } else {
      localStorage.setItem('aulacore-user-name', 'Dr. Ramírez');
    }

    if (savedDemoName) {
      setCustomDemoName(savedDemoName);
    }
    
    setMounted(true);
  }, []);

  // Consumir datos reales del AuthProvider si el usuario está autenticado en Supabase
  const userRole = isAuthenticated && activeRole ? activeRole : localRole;
  
  // Se considera simulado si el usuario está autenticado pero el rol activo no es uno de sus roles reales en la DB
  const isSimulatedRole = !!(
    isAuthenticated && 
    Array.isArray(roles) && 
    roles.includes && 
    !roles.includes(userRole)
  );

  const userName = (isAuthenticated && !isSimulatedRole && profile && profile.first_name)
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Usuario'
    : (customDemoName || localName || 'Usuario');

  const setUserRole = (role: UserRole) => {
    // Nombres realistas por rol para simulación local
    let name = 'Dr. Ramírez';
    if (role === 'rector') name = 'Dr. Ramírez';
    else if (role === 'director_grupo') name = 'Lic. Martínez';
    else if (role === 'docente') name = 'Prof. Gómez';
    else if (role === 'secretaria') name = 'Dra. Elena Toro';
    else if (role === 'padre_familia') name = 'Carlos Ortiz';
    else if (role === 'estudiante') name = 'Tomas Villa';

    if (isAuthenticated) {
      setActiveRole(role);
      setLocalNameState(name);
      localStorage.setItem('aulacore-user-name', name);
      setCustomDemoName(null);
      localStorage.removeItem('aulacore-demo-name');
    } else {
      setLocalRoleState(role);
      localStorage.setItem('aulacore-user-role', role);
      setLocalNameState(name);
      localStorage.setItem('aulacore-user-name', name);
      setCustomDemoName(null);
      localStorage.removeItem('aulacore-demo-name');
    }
  };

  const setUserName = (name: string) => {
    setLocalNameState(name);
    localStorage.setItem('aulacore-user-name', name);
    setCustomDemoName(name);
    localStorage.setItem('aulacore-demo-name', name);
  };

  // Se considera montado cuando cargó el cliente local para evitar errores de hidratación
  const isMounted = mounted;

  return (
    <RoleContext.Provider value={{ userRole, setUserRole, userName, setUserName, mounted: isMounted }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole debe ser usado dentro de un RoleProvider');
  }
  return context;
}
