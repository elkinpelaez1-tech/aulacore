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

const MOCK_DEMO_INSTITUTION: InstitutionData = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Gimnasio Campestre AulaCore',
  slug: 'aulacore-central',
  logo_url: null,
  slogan: 'Liderazgo, Ciencia y Convivencia para el Futuro',
  nit: '900.123.456-7',
  dane_code: '111001012345',
  resolution: 'Resolución 1234 del 12 de Octubre de 2022 - MinEducación',
  legal_nature: 'Privada',
  rector_name: 'Dra. Mariana Restrepo Restrepo',
  secretary_name: 'Dr. Carlos Mario Hoyos',
  primary_color: '#6366f1',
  sidebar_color: 'slate-900',
  plan_type: 'enterprise',
  subscription_status: 'active',
  active_modules: ['onboarding', 'pei', 'pae', 'rfid']
};

const getDemoSessionIfPresent = () => {
  if (typeof window === 'undefined') return null;
  const demoEmail = localStorage.getItem('aulacore-demo-session');
  if (!demoEmail) return null;
  const mockUser: User = {
    id: 'demo-user-' + demoEmail.split('@')[0],
    app_metadata: { provider: 'email' },
    user_metadata: {
      first_name: demoEmail.includes('coordinador') ? 'Diana' : demoEmail.includes('rector') ? 'Ramón' : 'Usuario',
      last_name: demoEmail.includes('coordinador') ? 'Reyes' : demoEmail.includes('rector') ? 'Ramírez' : 'Demo'
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: demoEmail,
    role: 'authenticated',
    updated_at: new Date().toISOString()
  } as User;
  const mockSession: Session = {
    access_token: 'mock-token-' + Date.now(),
    refresh_token: 'mock-refresh-' + Date.now(),
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: mockUser
  };
  return { user: mockUser, session: mockSession };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [activeInstitution, setActiveInstitution] = useState<InstitutionData | null>(MOCK_DEMO_INSTITUTION);
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

  // Función para cargar los datos del usuario desde la base de datos pública
  const loadUserData = async (currentUser: User, currentSession: Session, overrideId?: string | null) => {
    try {
      // 1. Consultar perfil en public.profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', currentUser.id)
        .maybeSingle();

      // 2. Consultar roles asignados en public.user_roles (incluyendo institution_id)
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, institution_id')
        .eq('user_id', currentUser.id);

      if (profileError) console.error('Error cargando perfil:', profileError);
      if (rolesError) console.error('Error cargando roles:', rolesError);

      const userProfile = profileData || {
        first_name: currentUser.user_metadata?.first_name || 'Usuario',
        last_name: currentUser.user_metadata?.last_name || 'AulaCore',
        avatar_url: currentUser.user_metadata?.avatar_url || '',
      };

      let userRoles = (rolesData?.map((r: any) => r.role) || []) as string[];
      
      // Fallback para correos de demostración institucionales si la tabla user_roles no tiene el registro o está en entorno de prueba
      if (currentUser.email && (userRoles.length === 0 || currentUser.email.toLowerCase().includes('@aulacore.com'))) {
        const emailLower = currentUser.email.toLowerCase();
        if (emailLower.includes('rector@')) userRoles = ['rector'];
        else if (emailLower.includes('director@')) userRoles = ['director_grupo'];
        else if (emailLower.includes('coordinador@')) userRoles = ['coordinador'];
        else if (emailLower.includes('docente@') || emailLower.includes('prof@')) userRoles = ['docente'];
        else if (emailLower.includes('secretaria@')) userRoles = ['secretaria'];
        else if (emailLower.includes('padre@')) userRoles = ['padre_familia'];
        else if (emailLower.includes('estudiante@')) userRoles = ['estudiante'];
        else if (emailLower.includes('superadmin@') || emailLower.includes('admin@')) userRoles = ['super_admin'];
      }
      const defaultInstId = rolesData && rolesData.length > 0 ? rolesData[0].institution_id : null;

      setProfile(userProfile);
      setRoles(userRoles as UserRole[]);

      // Cargar todas las instituciones si es super_admin
      if (userRoles.includes('super_admin')) {
        const { data: allInsts } = await supabase
          .from('institutions')
          .select('*')
          .order('name');
        if (allInsts) {
          setAllInstitutions(allInsts as any);
        }
      }

      // Determinar institutionId activo
      const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('aulacore-override-institution-id') : null;
      const activeId = (userRoles.includes('super_admin') && (overrideId || savedOverride)) 
        ? (overrideId || savedOverride) 
        : defaultInstId;

      setInstitutionId(activeId);

      // Cargar detalles de la institución activa
      if (activeId) {
        const { data: instData, error: instErr } = await supabase
          .from('institutions')
          .select('*')
          .eq('id', activeId)
          .maybeSingle();

        if (instData && !instErr) {
          setActiveInstitution(instData as any);
        } else {
          setActiveInstitution({
            ...MOCK_DEMO_INSTITUTION,
            id: activeId,
            name: activeId === '11111111-1111-1111-1111-111111111111' ? 'Gimnasio Campestre AulaCore' : 'Colegio Piloto AulaCore'
          });
        }
      } else {
        setActiveInstitution(MOCK_DEMO_INSTITUTION);
      }

      // Determinar el rol activo (garantizar que director_grupo y otros roles no adopten el rol de rector por caché en localStorage)
      if (userRoles.length > 0) {
        const savedRole = typeof window !== 'undefined' ? localStorage.getItem('aulacore-user-role') as UserRole : null;
        const isSuperAdmin = userRoles.includes('super_admin');
        
        if (savedRole && (userRoles.includes(savedRole) || isSuperAdmin)) {
          setActiveRoleState(savedRole);
        } else {
          let selectedRole: UserRole = userRoles[0] as UserRole;
          const hierarchy: string[] = ['super_admin', 'rector', 'coordinador', 'director_grupo', 'docente', 'secretaria', 'padre_familia'];
          for (const role of hierarchy) {
            if (userRoles.includes(role)) {
              selectedRole = role as UserRole;
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
      }
    } catch (err) {
      console.error('Error en loadUserData:', err);
    }
  };

  const refreshSession = async () => {
    setLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const demoData = getDemoSessionIfPresent();
      const activeSession = currentSession || demoData?.session;
      const activeUser = currentSession?.user || demoData?.user;

      if (activeSession && activeUser) {
        setSession(activeSession);
        setUser(activeUser);
        await loadUserData(activeUser, activeSession, overrideInstitutionId);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
        setRoles([]);
        setActiveRoleState(null);
        setInstitutionId(null);
        setActiveInstitution(MOCK_DEMO_INSTITUTION);
      }
    } catch (err) {
      console.error('Error al refrescar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  // Escuchar cambios en overrideInstitutionId
  useEffect(() => {
    if (user && session) {
      loadUserData(user, session, overrideInstitutionId);
    }
  }, [overrideInstitutionId]);

  // Escuchar cambios en el estado de autenticación (onAuthStateChange)
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('aulacore-override-institution-id') : null;
        if (savedOverride) {
          setOverrideInstitutionIdState(savedOverride);
        }
        
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        const demoData = getDemoSessionIfPresent();
        const activeSession = initialSession || demoData?.session;
        const activeUser = initialSession?.user || demoData?.user;
        
        if (!isMounted) return;

        if (activeSession && activeUser) {
          setSession(activeSession);
          setUser(activeUser);
          await loadUserData(activeUser, activeSession, savedOverride);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, newSession: any) => {
      if (!isMounted) return;

      console.log(`Evento de Auth detectado: ${event}`);

      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('aulacore-override-institution-id') : null;
        await loadUserData(newSession.user, newSession, savedOverride);
        setLoading(false);
        
        // Redirigir al dashboard si está en el login
        if (pathname === '/login') {
          router.replace('/dashboard');
        }
      } else {
        // Verificar si hay sesión demo offline antes de destruir
        const demoData = getDemoSessionIfPresent();
        if (demoData?.session && demoData?.user) {
          console.log('Manteniendo sesión demo offline activa en onAuthStateChange...');
          setSession(demoData.session);
          setUser(demoData.user);
          const savedOverride = typeof window !== 'undefined' ? localStorage.getItem('aulacore-override-institution-id') : null;
          await loadUserData(demoData.user, demoData.session, savedOverride);
          setLoading(false);
          if (pathname === '/login') {
            router.replace('/dashboard');
          }
          return;
        }

        // Sesión destruida
        setUser(null);
        setSession(null);
        setProfile(null);
        setRoles([]);
        setActiveRoleState(null);
        setInstitutionId(null);
        setActiveInstitution(MOCK_DEMO_INSTITUTION);
        setOverrideInstitutionIdState(null);
        setAllInstitutions([]);
        setLoading(false);

        // Si está en una ruta protegida, redirigir al login
        if (pathname !== '/login' && pathname !== '/' && !pathname?.startsWith('/territorio')) {
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
      if (!session && pathname !== '/login' && pathname !== '/' && !pathname?.startsWith('/territorio')) {
        router.replace('/login');
      } else if (session && pathname === '/login') {
        router.replace('/dashboard');
      }
    }
  }, [pathname, session, loading, router]);

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aulacore-user-role', role);
      const name = profile ? `${profile.first_name} ${profile.last_name}` : 'Usuario';
      localStorage.setItem('aulacore-user-name', name);
    }
  };

  const signOut = async () => {
    setLoading(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aulacore-user-role');
      localStorage.removeItem('aulacore-user-name');
      localStorage.removeItem('aulacore-demo-name');
      localStorage.removeItem('aulacore-override-institution-id');
      localStorage.removeItem('aulacore-demo-session');
    }
    
    try {
      supabase.auth.signOut().catch((err: any) => {
        console.error('Error en signOut de Supabase en segundo plano:', err);
      });
    } catch (err) {
      console.error('Error llamando a signOut:', err);
    }
    
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
