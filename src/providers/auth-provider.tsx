'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/lib/navigation';
import { User, Session } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

interface AuthProfile {
  first_name: string;
  last_name: string;
  avatar_url: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  roles: UserRole[];
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole) => void;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const router = useRouter();
  const pathname = usePathname();

  // Función para cargar los datos del usuario desde la base de datos pública
  const loadUserData = async (currentUser: User, currentSession: Session) => {
    try {
      // 1. Consultar perfil en public.profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', currentUser.id)
        .maybeSingle();

      // 2. Consultar roles asignados en public.user_roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id);

      if (profileError) console.error('Error cargando perfil:', profileError);
      if (rolesError) console.error('Error cargando roles:', rolesError);

      const userProfile = profileData || {
        first_name: currentUser.user_metadata?.first_name || 'Usuario',
        last_name: currentUser.user_metadata?.last_name || 'AulaCore',
        avatar_url: currentUser.user_metadata?.avatar_url || '',
      };

      const userRoles = (rolesData?.map((r) => r.role) || []) as UserRole[];

      setProfile(userProfile);
      setRoles(userRoles);

      // Determinar el rol activo
      if (userRoles.length > 0) {
        // Intentar recuperar el rol previamente activo de localStorage
        const savedRole = localStorage.getItem('aulacore-user-role') as UserRole;
        
        // En entorno de demo/desarrollo, permitimos a los roles administrativos mantener la simulación de otros roles
        const canSwitchRoles = userRoles.includes('rector') || userRoles.includes('coordinador') || userRoles.includes('secretaria') || userRoles.includes('director_grupo');
        
        if (savedRole && (userRoles.includes(savedRole) || canSwitchRoles)) {
          setActiveRoleState(savedRole);
        } else {
          // Asignar el de mayor jerarquía por defecto
          let selectedRole: UserRole = userRoles[0];
          const hierarchy: UserRole[] = ['rector', 'director_grupo', 'docente', 'secretaria', 'padre_familia'];
          for (const role of hierarchy) {
            if (userRoles.includes(role)) {
              selectedRole = role;
              break;
            }
          }
          setActiveRoleState(selectedRole);
          localStorage.setItem('aulacore-user-role', selectedRole);
        }
      } else {
        setActiveRoleState(null);
      }
    } catch (err) {
      console.error('Error en loadUserData:', err);
    }
  };

  const refreshSession = async () => {
    setLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        await loadUserData(currentSession.user, currentSession);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
        setRoles([]);
        setActiveRoleState(null);
      }
    } catch (err) {
      console.error('Error al refrescar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  // Escuchar cambios en el estado de autenticación (onAuthStateChange)
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          await loadUserData(initialSession.user, initialSession);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error inicializando autenticación:', err);
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    // Suscribirse a cambios del estado de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      console.log(`Evento de Auth detectado: ${event}`);

      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        await loadUserData(newSession.user, newSession);
        setLoading(false);
        
        // Redirigir al dashboard si está en el login
        if (pathname === '/login') {
          router.replace('/dashboard');
        }
      } else {
        // Sesión destruida
        setUser(null);
        setSession(null);
        setProfile(null);
        setRoles([]);
        setActiveRoleState(null);
        setLoading(false);

        // Si está en una ruta protegida, redirigir al login
        if (pathname !== '/login' && pathname !== '/') {
          router.replace('/login');
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Run only on mount

  // Redirigir si cambia la ruta y no hay sesión (protección de rutas cliente)
  useEffect(() => {
    if (!loading) {
      if (!session && pathname !== '/login' && pathname !== '/') {
        router.replace('/login');
      } else if (session && pathname === '/login') {
        router.replace('/dashboard');
      }
    }
  }, [pathname, session, loading, router]);

  const setActiveRole = (role: UserRole) => {
    // Permitir cambio de rol si está en la DB o si es una conmutación de jerarquía permitida (ej. Coordinador)
    setActiveRoleState(role);
    localStorage.setItem('aulacore-user-role', role);
    // Actualizar el nombre en localStorage para mantener compatibilidad con RoleProvider simulado
    const name = profile ? `${profile.first_name} ${profile.last_name}` : 'Usuario';
    localStorage.setItem('aulacore-user-name', name);
  };

  const signOut = async () => {
    setLoading(true);
    // Limpiar localStorage de inmediato para evitar bloqueos
    localStorage.removeItem('aulacore-user-role');
    localStorage.removeItem('aulacore-user-name');
    localStorage.removeItem('aulacore-demo-name');
    
    try {
      // Ejecutar signOut en segundo plano para no demorar al cliente si la red falla
      supabase.auth.signOut().catch(err => {
        console.error('Error en signOut de Supabase en segundo plano:', err);
      });
    } catch (err) {
      console.error('Error llamando a signOut:', err);
    }
    
    // Redirigir inmediatamente
    window.location.href = '/login';
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        activeRole,
        setActiveRole,
        loading,
        isAuthenticated,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
