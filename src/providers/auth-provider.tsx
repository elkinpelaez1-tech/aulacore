'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  
  // Referencias para renovación silenciosa de sesión y prevención de carreras
  const currentUserRef = useRef<User | null>(null);
  const isUserDataLoadedRef = useRef<boolean>(false);
  const inFlightLoadUserDataRef = useRef<Promise<void> | null>(null);
  const currentRolesRef = useRef<UserRole[]>([]);
  const currentActiveRoleRef = useRef<UserRole | null>(null);

  const updateRolesState = (newRoles: UserRole[]) => {
    currentRolesRef.current = newRoles;
    setRoles(newRoles);
  };

  const updateActiveRoleState = (newRole: UserRole | null) => {
    currentActiveRoleRef.current = newRole;
    setActiveRoleState(newRole);
  };
  
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
    // Evitar ejecuciones duplicadas concurrentes para el mismo usuario
    if (inFlightLoadUserDataRef.current && currentUserRef.current?.id === currentUser.id) {
      console.log('[Auth Flow] loadUserData ya en ejecución concurrente. Reutilizando promesa en vuelo.');
      return inFlightLoadUserDataRef.current;
    }

    const task = (async () => {
      console.log('[Auth Flow] 1. Token/Sesión recibida desde Supabase:', currentSession ? 'VÁLIDO' : 'NULO');
      console.log('[Auth Flow] 2. Usuario autenticado (auth.uid()):', currentUser.id, '| email:', currentUser.email);
      
      try {
        // Step A & B: Parallel fetch of profiles and user_roles with timeout of 3s
        let profileData: any = null;
        let rolesData: any = null;

        console.log('[Auth Flow] 3. Iniciando consultas paralelas a profiles y user_roles...');
        const profilePromise = withTimeout(
          supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle(),
          'Consulta a profiles'
        );
        const rolesPromise = withTimeout(
          supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', currentUser.id),
          'Consulta a user_roles'
        );

        const [profileResult, rolesResult] = await Promise.allSettled([profilePromise, rolesPromise]);

        if (profileResult.status === 'fulfilled') {
          profileData = profileResult.value.data;
          console.log('[Auth Flow] 3. Consulta a profiles exitosa:', profileData);
        } else {
          console.error('[Auth Flow] Error en consulta a profiles:', profileResult.reason?.message || profileResult.reason);
        }

        // Construir perfil con fallback de metadata si es necesario
        const userProfile = profileData || {
          first_name: currentUser.user_metadata?.first_name || currentUser.user_metadata?.name || 'Usuario',
          last_name: currentUser.user_metadata?.last_name || 'Institucional',
          avatar_url: currentUser.user_metadata?.avatar_url || '',
        };
        setProfile(userProfile as AuthProfile);

        let userRoles: UserRole[] = [];
        let selectedRole: UserRole | null = null;

        // Evaluar éxito estricto de la consulta a user_roles (fulfilled y sin error en la respuesta de Supabase)
        const isRolesQuerySuccessful = rolesResult.status === 'fulfilled' && !rolesResult.value.error;

        if (isRolesQuerySuccessful) {
          rolesData = rolesResult.value.data;
          console.log('[Auth Flow] 4. Consulta a user_roles exitosa:', rolesData);

          userRoles = (rolesData?.map((r: any) => r.role) || []) as UserRole[];
          
          // FALLBACK SEGURO: Si user_roles en BD está vacío pero el metadato traía rol (ej. rector)
          if (userRoles.length === 0 && currentUser.user_metadata?.role) {
            userRoles = [currentUser.user_metadata.role as UserRole];
            console.log('[Auth Flow] Fallback aplicado desde user_metadata.role:', userRoles);
          }
          updateRolesState(userRoles);

          // Resolución inmediata del rol activo (sin demorar por consultas secundarias de instituciones)
          if (userRoles.length > 0) {
            const savedRole = typeof window !== 'undefined' ? (localStorage.getItem('aulacore-user-role') as UserRole) : null;
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
          updateActiveRoleState(selectedRole);
          console.log('[Auth Flow] 6. Rol obtenido:', selectedRole);
        } else {
          const rolesError = rolesResult.status === 'rejected'
            ? (rolesResult.reason?.message || rolesResult.reason)
            : rolesResult.value.error?.message;
          console.warn('[Auth Flow] Consulta a user_roles falló o timeout. Evaluando preservación de roles para evitar falso Acceso Denegado:', rolesError);

          // Si ya teníamos roles en memoria (por ejemplo, refresco de sesión o reconexión), preservarlos
          if (currentRolesRef.current.length > 0) {
            userRoles = currentRolesRef.current;
            selectedRole = currentActiveRoleRef.current;
            console.log('[Auth Flow] Preservando roles previos en memoria:', userRoles);
          } else if (currentUser.user_metadata?.role) {
            // Salvaguarda temporal si está presente en los metadatos de la sesión mientras la consulta responde
            userRoles = [currentUser.user_metadata.role as UserRole];
            selectedRole = currentUser.user_metadata.role as UserRole;
            updateRolesState(userRoles);
            updateActiveRoleState(selectedRole);
            console.log('[Auth Flow] Salvaguarda temporal aplicada desde user_metadata.role tras fallo de consulta:', userRoles);
          } else {
            // Consulta falló o entró en timeout y NO hay datos en memoria ni metadata:
            // NO clasificar como 'usuario sin roles' prematuramente marcando loading=false con roles=[].
            console.error('[Auth Flow] Consulta a user_roles no confirmada y sin roles previos en memoria. No se clasifica prematuramente.');
            throw new Error(`Consulta a user_roles no confirmada: ${rolesError || 'Timeout o error de red'}`);
          }
        }

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
        isUserDataLoadedRef.current = true;

      } catch (err: any) {
        console.error('[Auth Flow] Excepción general en loadUserData:', err?.message || err);
        throw err;
      }
    })();

    inFlightLoadUserDataRef.current = task;
    try {
      await task;
    } finally {
      inFlightLoadUserDataRef.current = null;
    }
  };

  const refreshSession = async () => {
    setLoading(true);
    try {
      const { data: { session: currentSession } } = await withTimeout(supabase.auth.getSession(), 'getSession()');
      if (currentSession && currentSession.user) {
        currentUserRef.current = currentSession.user;
        setSession(currentSession);
        setUser(currentSession.user);
        await loadUserData(currentSession.user, currentSession, overrideInstitutionId);
      } else {
        currentUserRef.current = null;
        isUserDataLoadedRef.current = false;
        inFlightLoadUserDataRef.current = null;
        setUser(null);
        setSession(null);
        setProfile(null);
        updateRolesState([]);
        updateActiveRoleState(null);
        setInstitutionId(null);
        setActiveInstitution(null);
      }
    } catch (err) {
      console.error('Error al refrescar sesión:', err);
    } finally {
      if (!currentUserRef.current || isUserDataLoadedRef.current) {
        setLoading(false);
      }
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
          currentUserRef.current = initialSession.user;
          setSession(initialSession);
          setUser(initialSession.user);
          await loadUserData(initialSession.user, initialSession, savedOverride);
        } else {
          currentUserRef.current = null;
          isUserDataLoadedRef.current = false;
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error('[Auth Flow] Error inicializando autenticación:', err);
      } finally {
        if (isMounted) {
          if (!currentUserRef.current || isUserDataLoadedRef.current) {
            console.log('[Auth Flow] Finalizando initializeAuth. Setting loading: false');
            setLoading(false);
          } else {
            console.warn('[Auth Flow] initializeAuth no confirmado por fallo/timeout. Manteniendo loading activo para gestión de timeout de AppLayout.');
          }
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, newSession: any) => {
      console.log(`[Auth Flow] onAuthStateChange Evento: ${event}`, { newSessionUser: newSession?.user?.id });
      if (!isMounted) return;

      if (newSession && newSession.user) {
        // Renovación silenciosa de sesión: Si el usuario ya está autenticado y sus datos cargados en memoria,
        // cualquier evento de mantenimiento de sesión (TOKEN_REFRESHED, SIGNED_IN por cambio de pestaña/visibilidad, USER_UPDATED o INITIAL_SESSION)
        // debe únicamente actualizar tokens y sesión sin congelar la UI con loading=true ni volver a consultar la base de datos.
        const isSameUserAlreadyLoaded =
          currentUserRef.current?.id === newSession.user.id &&
          isUserDataLoadedRef.current;

        if (isSameUserAlreadyLoaded && (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION')) {
          console.log(`[Auth Flow] ${event} silencioso. Sesión y tokens actualizados sin congelar UI ni recargar roles.`);
          currentUserRef.current = newSession.user;
          setSession(newSession);
          setUser(newSession.user);
          return;
        }

        console.log('[Auth Flow] setSession() exitoso en onAuthStateChange. User ID:', newSession.user.id);
        currentUserRef.current = newSession.user;
        setLoading(true);
        setSession(newSession);
        setUser(newSession.user);
        try {
          const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('aulacore-override-institution-id') : null;
          await loadUserData(newSession.user, newSession, savedOverride);
        } catch (err) {
          console.error('[Auth Flow] Error cargando datos en onAuthStateChange:', err);
        } finally {
          if (isMounted) {
            if (!currentUserRef.current || isUserDataLoadedRef.current) {
              setLoading(false);
            }
          }
        }
        
        if (pathname === '/login') {
          router.replace('/dashboard');
        }
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        currentUserRef.current = null;
        isUserDataLoadedRef.current = false;
        inFlightLoadUserDataRef.current = null;
        setUser(null);
        setSession(null);
        setProfile(null);
        updateRolesState([]);
        updateActiveRoleState(null);
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
      currentUserRef.current = null;
      isUserDataLoadedRef.current = false;
      inFlightLoadUserDataRef.current = null;
      setUser(null);
      setSession(null);
      setProfile(null);
      updateRolesState([]);
      updateActiveRoleState(null);
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
        updateActiveRoleState(role);
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
