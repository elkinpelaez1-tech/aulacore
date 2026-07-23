'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/lib/navigation';
import { useAuth, InstitutionData } from '@/providers/auth-provider';

interface RoleContextType {
  userRole: UserRole | null;
  setUserRole: (role: UserRole) => void;
  userName: string;
  mounted: boolean;
  institutionId: string | null;
  activeInstitution: InstitutionData | null;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { profile, activeRole, setActiveRole, isAuthenticated, loading, institutionId, activeInstitution } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const authRole = activeRole;

  useEffect(() => {
    let isMounted = true;
    console.log('[RoleProvider] Mounted effect started', { authLoading: loading, authUserRole: authRole });
    
    // Solo marcamos como montado cuando auth termine de cargar
    if (!loading) {
      if (isMounted) {
        console.log('[RoleProvider] Auth loading finished. Setting mounted=true');
        setMounted(true);
      }
    }

    return () => {
      isMounted = false;
      console.log('[RoleProvider] Unmounted');
    };
  }, [loading]);

  useEffect(() => {
    console.log('[RoleProvider] State updated:', { mounted, authRole, loading });
  }, [mounted, authRole, loading]);

  const userRole = activeRole;
  
  // Nombre 100% real traído desde public.profiles a través de AuthProvider
  const userName = (isAuthenticated && profile && profile.first_name)
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Usuario'
    : 'Usuario';

  const handleSetUserRole = (role: UserRole) => {
    if (isAuthenticated) {
      setActiveRole(role);
    }
  };

  const isMounted = mounted;

  return (
    <RoleContext.Provider value={{ 
      userRole, 
      setUserRole: handleSetUserRole, 
      userName, 
      mounted: isMounted, 
      institutionId, 
      activeInstitution 
    }}>
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
