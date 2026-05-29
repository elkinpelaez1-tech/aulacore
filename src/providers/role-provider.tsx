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
  const { profile, activeRole, setActiveRole, isAuthenticated, loading } = useAuth();
  
  const [localRole, setLocalRoleState] = useState<UserRole>('rector');
  const [localName, setLocalNameState] = useState<string>('Dr. Ramírez');
  const [mounted, setMounted] = useState(false);

  // Cargar desde localStorage tras montar para simulación local si no hay sesión activa
  useEffect(() => {
    const savedRole = localStorage.getItem('aulacore-user-role') as UserRole;
    const savedName = localStorage.getItem('aulacore-user-name');
    
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
    
    setMounted(true);
  }, []);

  // Consumir datos reales del AuthProvider si el usuario está autenticado en Supabase
  const userRole = isAuthenticated && activeRole ? activeRole : localRole;
  
  const userName = isAuthenticated && profile 
    ? `${profile.first_name} ${profile.last_name}` 
    : localName;

  const setUserRole = (role: UserRole) => {
    if (isAuthenticated) {
      setActiveRole(role);
    } else {
      setLocalRoleState(role);
      localStorage.setItem('aulacore-user-role', role);
      
      // Nombres realistas por rol para simulación local
      let name = 'Dr. Ramírez';
      if (role === 'rector') name = 'Dr. Ramírez';
      else if (role === 'director_grupo') name = 'Lic. Martínez';
      else if (role === 'docente') name = 'Prof. Gómez';
      else if (role === 'secretaria') name = 'Dra. Elena Toro';
      else if (role === 'padre_familia') name = 'Carlos Ortiz';
      
      setLocalNameState(name);
      localStorage.setItem('aulacore-user-name', name);
    }
  };

  const setUserName = (name: string) => {
    if (!isAuthenticated) {
      setLocalNameState(name);
      localStorage.setItem('aulacore-user-name', name);
    }
  };

  // Se considera montado cuando cargó el cliente local y la sesión de Supabase finalizó su carga inicial
  const isMounted = mounted && !loading;

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
