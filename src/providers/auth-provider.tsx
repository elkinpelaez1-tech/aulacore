'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/lib/navigation';
import { User, Session } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

export interface AuthProfile {
  first_name: string;
  last_name: string;
  avatar_url: string;
}

export interface InstitutionData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  slogan: string | null;
  nit: string | null;
  dane_code: string | null;
  resolution: string | null;
  legal_nature: string;
  rector_name: string | null;
  secretary_name: string | null;
  primary_color: string;
  sidebar_color: string;
  plan_type: string;
  subscription_status: string;
  active_modules: string[];
  subscription_expires_at?: string;
  organization_type?: string;
  parent_organization_id?: string | null;
  department?: string | null;
  municipality?: string | null;
  territorial_type?: string | null;
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
  institutionId: string | null;
  activeInstitution: InstitutionData | null;
  setOverrideInstitutionId: (id: string | null) => void;
  overrideInstitutionId: string | null;
  allInstitutions: InstitutionData[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [activeInstitution, setActiveInstitution] = useState<InstitutionData | null>(null);
  const [overrideInstitutionId, setOverrideInstitutionIdState] = useState<string | null>(null);
  const [allInstitutions, setAllInstitutions] = useState<InstitutionData[]>([]);
  
  const router = useRouter();
  const pathname = usePathname();

  const setOverrideInstitutionId = (id: string | null) => {
    setOverrideInstitutionIdState(id);
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem('aulacore-override-institution-id', id);
      } else {
        localStorage.removeItem('aulacore-override-institution-id');
      }
    }
  };

  // Función para cargar los datos del usuario 100% desde la base de datos pública
  const loadUserData = async (currentUser: User, currentSession: Session, overrideId?: string | null) => {
    try {
      // 1. Consultar perfil en public.profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileError) console.error('Error cargando perfil desde Supabase:', profileError);

      const userProfile = profileData || {
        first_name: currentUser.user_metadata?.first_name || 'Usuario',
        last_name: currentUser.user_metadata?.last_name || 'Nuevo',
        avatar_url: currentUser.user_metadata?.avatar_url || '',
      };

      setProfile(userProfile as AuthProfile);

      // 2. Consultar roles asignados en public.user_roles (incluyendo institution_id)
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, institution_id')
        .eq('user_id', currentUser.id);

      if (rolesError) console.error('Error cargando roles desde Supabase:', rolesError);

      const userRoles = (rolesData?.map((r: any) => r.role) || []) as UserRole[];
      setRoles(userRoles);

      const defaultInstId = rolesData && rolesData.length > 0 ? rolesData[0].institution_id : null;

      // 3. Cargar todas las instituciones si es super_admin
      let allInstsData: any[] = [];
      if (userRoles.includes('super_admin')) {
        const { data: allInsts } = await supabase
          .from('institutions')
          .select('*')
          .order('name');
        if (allInsts) {
          allInstsData = allInsts;
          setAllInstitutions(allInsts as any);
        }
      }

      // 4. Determinar institutionId activo
      const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('aulacore-override-institution-id') : null;
      const activeId = (userRoles.includes('super_admin') && (overrideId || savedOverride)) 
        ? (overrideId || savedOverride) 
        : defaultInstId;

      setInstitutionId(activeId);

      // 5. Cargar detalles de la institución activa si existe
      if (activeId) {
        const { data: instData, error: instErr } = await supabase
          .from('institutions')
          .select('*')
          .eq('id', activeId)
          .maybeSingle();

        if (instData && !instErr) {
          setActiveInstitution(instData as any);
        } else {
          setActiveInstitution(null);
        }
      } else {
        setActiveInstitution(null);
      }

      // 6. Determinar el rol activo sin forzar variables quemadas
      if (userRoles.length > 0) {
        const savedRole = typeof window !== 'undefined' ? localStorage.getItem('aulacore-user-role') as UserRole : null;
        
        // Si el rol guardado es válido para el usuario, usarlo. Si no, aplicar jerarquía.
        if (savedRole && userRoles.includes(savedRole)) {
          setActiveRoleState(savedRole);
        } else {
          let selectedRole: UserRole = userRoles[0];
          const hierarchy: UserRole[] = ['super_admin', 'rector', 'coordinador', 'director_grupo', 'docente', 'secretaria', 'padre_familia', 'estudiante'];
          for (const role of hierarchy) {
            if (userRoles.includes(role)) {
              selectedRole = role;
              break;
            }
          }
          setActiveRoleState(selectedRole);
          if (typeof window !== 'undefined') {
            localStorage.setItem('aulacore-user-role', selectedRole);
          }
        }
      } else {
        setActiveRoleState(null);
        if (typeof window !== 'undefined') localStorage.removeItem('aulacore-user-role');
      }
    } catch (err) {
      console.error('Error en loadUserData:', err);
    }
  };

  const refreshSession = async () => {
    setLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (currentSession && currentSession.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        await loadUserData(currentSession.user, currentSession, overrideInstitutionId);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
        setRoles([]);
        setActiveRoleState(null);
        setInstitutionId(null);
        setActiveInstitution(null);
      }
    } catch (err) {
      console.error('Error al refrescar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && session) {
      loadUserData(user, session, overrideInstitutionId);
    }
  }, [overrideInstitutionId]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('aulacore-override-institution-id') : null;
        if (savedOverride) setOverrideInstitutionIdState(savedOverride);
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (initialSession && initialSession.user && !error) {
          setSession(initialSession);
          setUser(initialSession.user);
          await loadUserData(initialSession.user, initialSession, savedOverride);
        } else {
          // Limpiar si hay error o no hay sesión real
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error('Error inicializando autenticación:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, newSession: any) => {
      if (!isMounted) return;

      console.log(`[Supabase Auth] Evento detectado: ${event}`);

      if (newSession && newSession.user) {
        setSession(newSession);
        setUser(newSession.user);
        const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('aulacore-override-institution-id') : null;
        await loadUserData(newSession.user, newSession, savedOverride);
        setLoading(false);
        
        if (pathname === '/login') {
          router.replace('/dashboard');
        }
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        setSession(null);
        setProfile(null);
        setRoles([]);
        setActiveRoleState(null);
        setInstitutionId(null);
        setActiveInstitution(null);
        setOverrideInstitutionIdState(null);
        setAllInstitutions([]);
        setLoading(false);

        if (pathname !== '/login' && pathname !== '/' && !pathname?.startsWith('/territorio')) {
          router.replace('/login');
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!session && pathname !== '/login' && pathname !== '/' && !pathname?.startsWith('/territorio')) {
        router.replace('/login');
      } else if (session && pathname === '/login') {
        router.replace('/dashboard');
      }
    }
  }, [pathname, session, loading, router]);

  const setActiveRole = (role: UserRole) => {
    // Validar que el usuario realmente tiene este rol antes de cambiarlo
    if (roles.includes(role)) {
      setActiveRoleState(role);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aulacore-user-role', role);
      }
    } else {
      console.warn(`Intento de cambio a rol no autorizado: ${role}`);
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      // 1. Esperar cierre real de sesión en el backend Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // 2. Limpieza inmediata y robusta de estados de React
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      setActiveRoleState(null);
      setInstitutionId(null);
      setActiveInstitution(null);
      setOverrideInstitutionIdState(null);
      setAllInstitutions([]);
      
      // 3. Limpiar TODO el Storage para evitar que Mocks o cachés anteriores sobrevivan
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // 4. Redirección limpia mediante el enrutador de Next.js en vez de window.location
      router.replace('/login');
    } catch (err) {
      console.error('Error durante el cierre de sesión:', err);
      // Forzar limpieza y salida si Supabase falla
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
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
        institutionId,
        activeInstitution,
        setOverrideInstitutionId,
        overrideInstitutionId,
        allInstitutions
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
