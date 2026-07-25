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

// Helper para timeout de 3 segundos en operaciones asíncronas
async function withTimeout<T>(promise: PromiseLike<T>, stepName: string, timeoutMs = 3000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      console.error(`BLOQUEADO EN: ${stepName}`);
      reject(new Error(`BLOQUEADO EN: ${stepName}`));
    }, timeoutMs);
  });
  try {
    const result = await Promise.race([Promise.resolve(promise), timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch (err) {
    clearTimeout(timer!);
    throw err;
  }
};

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

  // Función para cargar los datos del usuario con instrumentación completa y fallback de metadatos
  const loadUserData = async (currentUser: User, currentSession: Session, overrideId?: string | null) => {
    console.log('[Auth Flow] 1. Token/Sesión recibida desde Supabase:', currentSession ? 'VÁLIDO' : 'NULO');
    console.log('[Auth Flow] 2. Usuario autenticado (auth.uid()):', currentUser.id, '| email:', currentUser.email);
    
    try {
      // Step A: Consulta a profiles con timeout de 3s
      let profileData: any = null;
      try {
        console.log('[Auth Flow] 3. Iniciando consulta a profiles...');
        const result = await withTimeout(
          supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle(),
          'Consulta a profiles'
        );
        profileData = result.data;
        console.log('[Auth Flow] 3. Consulta a profiles exitosa:', profileData);
      } catch (err: any) {
        console.error('[Auth Flow] Error en consulta a profiles:', err?.message || err);
      }

      const userProfile = profileData || {
        first_name: currentUser.user_metadata?.first_name || currentUser.user_metadata?.name || 'Usuario',
        last_name: currentUser.user_metadata?.last_name || 'Institucional',
        avatar_url: currentUser.user_metadata?.avatar_url || '',
      };
      setProfile(userProfile as AuthProfile);

      // Step B: Consulta a user_roles con timeout de 3s
      let rolesData: any = null;
      try {
        console.log('[Auth Flow] 4. Iniciando consulta a user_roles...');
        const result = await withTimeout(
          supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', currentUser.id),
          'Consulta a user_roles'
        );
        rolesData = result.data;
        console.log('[Auth Flow] 4. Consulta a user_roles exitosa:', rolesData);
      } catch (err: any) {
        console.error('[Auth Flow] Error en consulta a user_roles:', err?.message || err);
      }

      let userRoles = (rolesData?.map((r: any) => r.role) || []) as UserRole[];
      
      // FALLBACK SEGURO: Si user_roles está vacío pero el metadato traía rol (ej. rector)
      if (userRoles.length === 0 && currentUser.user_metadata?.role) {
        userRoles = [currentUser.user_metadata.role as UserRole];
        console.log('[Auth Flow] Fallback aplicado desde user_metadata.role:', userRoles);
      }
      setRoles(userRoles);

      let defaultInstId = rolesData && rolesData.length > 0 ? rolesData[0].institution_id : null;
      if (!defaultInstId && currentUser.user_metadata?.institution_id) {
        defaultInstId = currentUser.user_metadata.institution_id;
        console.log('[Auth Flow] Fallback aplicado para institution_id desde metadata:', defaultInstId);
      }

      // Step C: Cargar todas las instituciones si es super_admin
      if (userRoles.includes('super_admin')) {
        try {
          const { data: allInsts } = await withTimeout(
            supabase.from('institutions').select('*').order('name'),
            'Consulta a todas las instituciones'
          );
          if (allInsts) setAllInstitutions(allInsts as any);
        } catch (err: any) {
          console.error('[Auth Flow] Error cargando lista de instituciones:', err?.message || err);
        }
      }

      // Step D: institution_id activo
      const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('aulacore-override-institution-id') : null;
      const activeId = (userRoles.includes('super_admin') && (overrideId || savedOverride)) 
        ? (overrideId || savedOverride) 
        : defaultInstId;

      setInstitutionId(activeId);
      console.log('[Auth Flow] 5. institution_id resuelto:', activeId);

      // Step E: Detalle de institución activa
      if (activeId) {
        try {
          const { data: instData } = await withTimeout(
            supabase.from('institutions').select('*').eq('id', activeId).maybeSingle(),
            'Consulta a institución activa'
          );
          setActiveInstitution(instData as any);
        } catch (err: any) {
          console.error('[Auth Flow] Error cargando institución activa:', err?.message || err);
          setActiveInstitution(null);
        }
      } else {
        setActiveInstitution(null);
      }

      // Step F: Rol activo resuelto
      let selectedRole: UserRole | null = null;
      if (userRoles.length > 0) {
        const savedRole = typeof window !== 'undefined' ? localStorage.getItem('aulacore-user-role') as UserRole : null;
        if (savedRole && userRoles.includes(savedRole)) {
          selectedRole = savedRole;
        } else {
          const hierarchy: UserRole[] = ['super_admin', 'rector', 'coordinador', 'director_grupo', 'docente', 'secretaria', 'padre_familia', 'estudiante'];
          for (const role of hierarchy) {
            if (userRoles.includes(role)) {
              selectedRole = role;
              break;
            }
          }
          if (!selectedRole) selectedRole = userRoles[0];
          if (typeof window !== 'undefined') localStorage.setItem('aulacore-user-role', selectedRole);
        }
      }
      
      setActiveRoleState(selectedRole);
      console.log('[Auth Flow] 6. Rol obtenido:', selectedRole);

      // Determinar Dashboard destino
      const targetDashboard = selectedRole === 'super_admin' ? '/configuracion/saas' : '/dashboard';
      console.log('[Auth Flow] 7. Dashboard al que intenta redirigir:', targetDashboard);

      console.log('[Auth Flow] 8. Estado Completo de Sesión:', {
        loading: false,
        isAuthenticated: true,
        user: currentUser.id,
        profile: userProfile,
        userRole: selectedRole,
        institution: activeId
      });

    } catch (err: any) {
      console.error('[Auth Flow] Excepción general en loadUserData:', err?.message || err);
    }
  };

  const refreshSession = async () => {
    setLoading(true);
    try {
      const { data: { session: currentSession } } = await withTimeout(supabase.auth.getSession(), 'getSession()');
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
    let isMounted = true;

    const initializeAuth = async () => {
      console.log('[Auth Flow] initializeAuth iniciado');
      try {
        const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('aulacore-override-institution-id') : null;
        if (savedOverride) setOverrideInstitutionIdState(savedOverride);
        
        const { data: { session: initialSession }, error } = await withTimeout(supabase.auth.getSession(), 'getSession() en initializeAuth');
        
        if (!isMounted) return;

        if (initialSession && initialSession.user && !error) {
          console.log('[Auth Flow] setSession() exitoso en initializeAuth. User ID:', initialSession.user.id);
          setSession(initialSession);
          setUser(initialSession.user);
          await loadUserData(initialSession.user, initialSession, savedOverride);
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error('[Auth Flow] Error inicializando autenticación:', err);
      } finally {
        if (isMounted) {
          console.log('[Auth Flow] Finalizando initializeAuth. Setting loading: false');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, newSession: any) => {
      console.log(`[Auth Flow] onAuthStateChange Evento: ${event}`, { newSessionUser: newSession?.user?.id });
      if (!isMounted) return;

      if (newSession && newSession.user) {
        console.log('[Auth Flow] setSession() exitoso en onAuthStateChange. User ID:', newSession.user.id);
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

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      setActiveRoleState(null);
      setInstitutionId(null);
      setActiveInstitution(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aulacore-user-role');
        localStorage.removeItem('aulacore-override-institution-id');
      }
      setLoading(false);
      router.replace('/login');
    }
  };

  const isAuthenticated = !!user && !!session;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      roles,
      activeRole,
      setActiveRole: (role) => {
        setActiveRoleState(role);
        if (typeof window !== 'undefined') localStorage.setItem('aulacore-user-role', role);
      },
      loading,
      isAuthenticated,
      signOut,
      refreshSession,
      institutionId,
      activeInstitution,
      setOverrideInstitutionId,
      overrideInstitutionId,
      allInstitutions
    }}>
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
