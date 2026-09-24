'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { UserRole, ROLE_DISPLAY_NAMES } from '@/lib/navigation';
import { useSearchParams } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  CheckCircle,
  Globe, 
  ChevronDown, 
  BarChart3, 
  Users, 
  AlertCircle, 
  TrendingUp, 
  Sparkles
} from 'lucide-react';

interface DemoAccount {
  email: string;
  role: UserRole;
  name: string;
  desc: string;
  color: string;
  bgGradient: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'superadmin@aulacore.com',
    role: 'super_admin' as any,
    name: 'Ing. Carlos Mendoza (SaaS)',
    desc: 'Fabricante y Centro de Control 360°',
    color: 'bg-indigo-900 border-indigo-400 text-indigo-300',
    bgGradient: 'from-indigo-950 to-slate-900 shadow-indigo-500/20'
  },
  {
    email: 'secretario@sed.gov.co',
    role: 'secretario_educacion' as any,
    name: 'Dr. Alejandro Gómez (SED)',
    desc: 'Portal Territorial Gubernamental y CAT',
    color: 'bg-amber-600 border-amber-300 text-amber-300',
    bgGradient: 'from-amber-950 to-slate-900 shadow-amber-500/20'
  },
  {
    email: 'rector@aulacore.com',
    role: 'rector',
    name: 'Dr. Ramón Ramírez',
    desc: 'Control total de la institución',
    color: 'bg-blue-600 border-blue-200 text-blue-700',
    bgGradient: 'from-blue-550 to-blue-600 shadow-blue-500/10'
  },
  {
    email: 'coordinador@aulacore.com',
    role: 'coordinador',
    name: 'Lic. Diana Reyes',
    desc: 'Supervisión académica y convivencia',
    color: 'bg-indigo-600 border-indigo-200 text-indigo-700',
    bgGradient: 'from-indigo-550 to-indigo-600 shadow-indigo-500/10'
  },
  {
    email: 'director@aulacore.com',
    role: 'director_grupo',
    name: 'Lic. Patricia Martínez',
    desc: 'Gestión de curso y asistencia QR',
    color: 'bg-purple-600 border-purple-200 text-purple-700',
    bgGradient: 'from-purple-550 to-purple-600 shadow-purple-500/10'
  },
  {
    email: 'docente@aulacore.com',
    role: 'docente',
    name: 'Prof. Gómez',
    desc: 'Calificaciones y asistencia',
    color: 'bg-emerald-600 border-emerald-200 text-emerald-700',
    bgGradient: 'from-emerald-550 to-emerald-600 shadow-emerald-500/10'
  },
  {
    email: 'secretaria@aulacore.com',
    role: 'secretaria',
    name: 'Dra. Elena Toro',
    desc: 'Certificados e informes oficiales',
    color: 'bg-amber-500 border-amber-200 text-amber-700',
    bgGradient: 'from-amber-550 to-amber-600 shadow-amber-500/10'
  },
  {
    email: 'padre@aulacore.com',
    role: 'padre_familia',
    name: 'Carlos Ortiz',
    desc: 'Rendimiento escolar e inasistencias',
    color: 'bg-rose-500 border-rose-200 text-rose-700',
    bgGradient: 'from-rose-550 to-rose-600 shadow-rose-500/10'
  }
];

function LoginContent() {
  const { refreshSession } = useAuth();
  const searchParams = useSearchParams();
  const showDemo = searchParams.get('demo') === 'true';
  const paramEmail = searchParams.get('email') || '';
  const isResetSuccess = searchParams.get('reset') === 'success';

  const [email, setEmail] = useState(paramEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [socialNotice, setSocialNotice] = useState<string | null>(null);

  const assignRoleFromEmail = (mail: string) => {
    if (typeof window === 'undefined') return;
    const m = mail.toLowerCase();
    localStorage.setItem('aulacore-demo-session', mail);
    if (m.includes('superadmin') || m.includes('admin') || m.includes('saas')) localStorage.setItem('aulacore-user-role', 'super_admin');
    else if (m.includes('rector')) localStorage.setItem('aulacore-user-role', 'rector');
    else if (m.includes('coordinador')) localStorage.setItem('aulacore-user-role', 'coordinador');
    else if (m.includes('director')) localStorage.setItem('aulacore-user-role', 'director_grupo');
    else if (m.includes('docente') || m.includes('prof')) localStorage.setItem('aulacore-user-role', 'docente');
    else if (m.includes('secretaria')) localStorage.setItem('aulacore-user-role', 'secretaria');
    else if (m.includes('secretario') || m.includes('sed.gov') || m.includes('territorio') || m.includes('alcaldia') || m.includes('gob')) localStorage.setItem('aulacore-user-role', 'secretario_educacion');
    else if (m.includes('padre')) localStorage.setItem('aulacore-user-role', 'padre_familia');
    else if (m.includes('estudiante')) localStorage.setItem('aulacore-user-role', 'estudiante');
  };

  const getTargetUrl = (mail: string) => {
    const m = mail.toLowerCase();
    if (m.includes('secretario') || m.includes('sed.gov') || m.includes('territorio') || m.includes('alcaldia') || m.includes('gob')) {
      return '/territorio';
    }
    return (m.includes('superadmin') || m.includes('admin') || m.includes('saas')) ? '/configuracion/saas' : '/dashboard';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    setError(null);
    setSocialNotice(null);
    setSuccess(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aulacore-user-role');
      localStorage.removeItem('aulacore-demo-session');
    }

    try {
      console.log('[PERF AUDIT] [Supabase Auth] signInWithPassword INICIA', { email });
      const startTime = performance.now();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      const duration = (performance.now() - startTime).toFixed(2);
      console.log(`[PERF AUDIT] [Supabase Auth] signInWithPassword TERMINA (${duration}ms)`, { user: data?.user?.id, error: signInError });

      if (signInError) {
        if (process.env.NODE_ENV !== 'production' && (email.toLowerCase().includes('@aulacore.com') || email.toLowerCase().includes('@sed.gov.co') || email.toLowerCase().includes('territorio') || email.toLowerCase().includes('secretario'))) {
          console.log('Fallo inicio en Supabase en DEV, activando sesión demo offline...');
          assignRoleFromEmail(email);
          setSuccess(true);
          await refreshSession();
          window.location.href = getTargetUrl(email);
          return;
        }
        throw signInError;
      }

      if (email.toLowerCase().includes('@aulacore.com') || email.toLowerCase().includes('@sed.gov.co') || email.toLowerCase().includes('territorio') || email.toLowerCase().includes('secretario')) {
        assignRoleFromEmail(email);
      }
      setSuccess(true);
      await refreshSession();
      window.location.href = getTargetUrl(email);
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      let userFriendlyError = err.message || 'Ocurrió un error inesperado al intentar iniciar sesión.';
      if (err.message?.includes('Invalid login credentials')) {
        userFriendlyError = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
      } else if (err.message?.includes('Email not confirmed')) {
        userFriendlyError = 'El correo electrónico no ha sido confirmado aún.';
      }
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('AulaCore2026!');
    setError(null);
    setSocialNotice(null);
    setLoading(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aulacore-user-role');
      localStorage.removeItem('aulacore-demo-session');
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: 'AulaCore2026!',
      });

      if (signInError) {
        if (process.env.NODE_ENV === 'production') {
          throw signInError;
        }
        assignRoleFromEmail(demoEmail);
        setSuccess(true);
        await refreshSession();
        window.location.href = getTargetUrl(demoEmail);
        return;
      }

      assignRoleFromEmail(demoEmail);
      setSuccess(true);
      await refreshSession();
      window.location.href = getTargetUrl(demoEmail);
    } catch (err: any) {
      console.error('Error en autenticación de cuenta demo:', err);
      setError('En producción, esta cuenta demo requiere credenciales válidas en Supabase Auth.');
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const handleSocialClick = (provider: string) => {
    setSocialNotice(`El inicio de sesión con ${provider} se habilitará próximamente según las políticas de tu institución.`);
  };

  return (
    <main className="min-h-screen w-full bg-[#f4f7fc] flex flex-col lg:flex-row font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ========================================================================= */}
      {/* 🏛️ PANEL IZQUIERDO: INFORMATIVO, BRANDING Y VALOR EDUCATIVO (≈ 58-60%) */}
      {/* ========================================================================= */}
      <section className="relative w-full lg:w-[58%] xl:w-[60%] bg-gradient-to-br from-white via-[#f7faff] to-[#edf4fe] flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200/70 select-none">
        
        {/* Esfera decorativa superior y resplandor suave */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-gradient-to-bl from-blue-200/35 via-indigo-100/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute top-1/3 left-[-100px] w-[350px] h-[350px] bg-gradient-to-tr from-sky-100/40 via-blue-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Contenido principal superior e intermedio */}
        <div className="relative z-10 p-8 sm:p-12 lg:p-12 xl:p-16 flex-1 flex flex-col justify-between max-w-[920px]">
          
          {/* 1. Header / Logo AulaCore con Tagline */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <img 
                src="/logo-aulacore.png" 
                alt="AulaCore Logo" 
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-tight pl-1">
              Gestión educativa predictiva: Predice. Conecta. Transforma.
            </p>
          </div>

          {/* 2. Cuerpo Central: Titular, Descripción, Grilla de Capacidades y Fotografía */}
          <div className="my-8 xl:my-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Columna Textual y Capacidades (7 columnas en desktop) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Eyebrow Tag */}
              <div className="inline-block">
                <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-slate-500 uppercase">
                  DATOS HOY, MEJORES OPORTUNIDADES MAÑANA
                </span>
              </div>

              {/* Titular Principal */}
              <h1 className="text-3xl sm:text-4xl xl:text-[45px] font-black text-slate-900 tracking-tight font-heading leading-[1.12]">
                La educación <br />
                toma mejores <br />
                decisiones <br />
                <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                  con datos
                </span>
              </h1>

              {/* Párrafo Descriptivo */}
              <p className="text-slate-600 text-xs sm:text-sm xl:text-[15px] leading-relaxed font-normal max-w-lg">
                AulaCore identifica riesgos académicos, ausentismo, deserción y alertas institucionales antes de que se conviertan en crisis.
              </p>

              {/* 4 Indicadores / Capacidades */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-lg">
                
                {/* 1. Rendimiento Académico */}
                <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-white/90 border border-emerald-100/90 shadow-xs backdrop-blur-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 mb-2 shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">Rendimiento</span>
                  <span className="text-[10px] text-slate-500 leading-tight">académico</span>
                </div>

                {/* 2. Ausentismo y Permanencia */}
                <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-white/90 border border-blue-100/90 shadow-xs backdrop-blur-xs">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 mb-2 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">Ausentismo</span>
                  <span className="text-[10px] text-slate-500 leading-tight">y permanencia</span>
                </div>

                {/* 3. Alertas Tempranas */}
                <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-white/90 border border-amber-100/90 shadow-xs backdrop-blur-xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600 mb-2 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">Alertas</span>
                  <span className="text-[10px] text-slate-500 leading-tight">tempranas</span>
                </div>

                {/* 4. Decisiones con Impacto */}
                <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-white/90 border border-purple-100/90 shadow-xs backdrop-blur-xs">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/70 flex items-center justify-center text-purple-600 mb-2 shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">Decisiones</span>
                  <span className="text-[10px] text-slate-500 leading-tight">con impacto</span>
                </div>

              </div>

              {/* Tarjeta Institucional */}
              <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-150/80 flex items-center gap-3.5 shadow-xs max-w-lg backdrop-blur-xs">
                <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                  Más que una plataforma, <br className="hidden sm:inline" />
                  un aliado para transformar la educación.
                </p>
              </div>

            </div>

            {/* Columna Visual / Fotografía y Frase (5 columnas en desktop) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col items-center relative">
              
              {/* Frase inspiradora superior en la composición */}
              <div className="w-full text-right mb-3 pr-2">
                <p className="text-xs sm:text-sm font-serif italic text-slate-400 font-medium leading-tight">
                  <span className="text-slate-600 font-bold not-italic font-sans text-xs uppercase tracking-wider block mb-0.5">“Grandes” futuros</span>
                  comienzan en aulas más conscientes
                </p>
              </div>

              {/* Matriz decorativa de puntos */}
              <div className="absolute -top-3 right-0 grid grid-cols-5 gap-2 opacity-35 pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                ))}
              </div>

              {/* Contenedor Fotográfico con máscara y borde estilizado */}
              <div className="relative w-full max-w-[320px] xl:max-w-[360px] aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/15 border-4 border-white bg-slate-100">
                <img 
                  src="/images/aulacore-hero-education.jpg" 
                  alt="Docente y estudiantes en aula de clase AulaCore" 
                  className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
                />
                
                {/* Degradado inferior integrado para fundirse con la base */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent pointer-events-none" />
              </div>

            </div>

          </div>

        </div>

        {/* 3. Ondas Orgánicas Inferiores y Footer del Panel */}
        <div className="relative w-full overflow-hidden mt-auto">
          
          {/* Ondas vectoriales fluidas multicapa con degradados AulaCore (Azul -> Celeste -> Violeta) */}
          <svg 
            viewBox="0 0 1000 220" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-full h-28 sm:h-36 lg:h-44 object-cover"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.45" />
              </linearGradient>
              <linearGradient id="waveMainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="45%" stopColor="#3b82f6" />
                <stop offset="85%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>

            {/* Onda posterior */}
            <path 
              d="M0,70 C180,130 350,15 620,75 C820,115 920,40 1000,50 L1000,220 L0,220 Z" 
              fill="url(#waveBgGradient)" 
            />

            {/* Onda principal frontal */}
            <path 
              d="M0,120 C220,60 400,165 680,105 C850,70 940,115 1000,90 L1000,220 L0,220 Z" 
              fill="url(#waveMainGradient)" 
            />
          </svg>

          {/* Información institucional y frase sobre las ondas */}
          <div className="absolute inset-0 flex items-end justify-between px-6 sm:px-12 pb-4 sm:pb-6 text-white z-10 pointer-events-none">
            
            {/* Copyright y propósito */}
            <div className="space-y-0.5 text-[10px] sm:text-[11px] font-medium text-white/90 drop-shadow-sm">
              <p className="font-bold">
                &copy; 2026 AulaCore S.A.S. Todos los derechos reservados.
              </p>
              <p className="text-white/80">
                Transformamos la educación con inteligencia y corazón.
              </p>
            </div>

            {/* Frase poética / misión en cursiva elegante */}
            <div className="text-right pb-0.5">
              <p className="font-serif italic text-xs sm:text-sm text-white/95 leading-snug drop-shadow-sm tracking-wide">
                Educación <br />
                que anticipa, <br />
                vidas que avanzan.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 🔐 PANEL DERECHO: FORMULARIO DE ACCESO Y EXPERIENCIA DE LOGIN (≈ 40-42%) */}
      {/* ========================================================================= */}
      <section className="w-full lg:w-[42%] xl:w-[40%] bg-[#f8faff] flex flex-col justify-between p-6 sm:p-10 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
        
        {/* Barra superior con Selector de Idioma */}
        <div className="w-full flex items-center justify-between lg:justify-end mb-4 sm:mb-6">
          {/* Logo visible en pantallas pequeñas para móviles */}
          <div className="lg:hidden flex items-center gap-2">
            <img 
              src="/logo-aulacore.png" 
              alt="AulaCore Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition border border-slate-200/80 px-3 py-1.5 rounded-full shadow-xs cursor-pointer select-none">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Español</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Tarjeta Central Flotante de Inicio de Sesión */}
        <div className="w-full max-w-[480px] sm:max-w-[500px] mx-auto my-auto bg-white rounded-[2.5rem] border border-slate-150/90 shadow-[0_20px_50px_rgba(37,99,235,0.07),0_4px_16px_rgba(15,23,42,0.03)] p-7 sm:p-10 space-y-6">
          
          {/* Encabezado de la Tarjeta: Logo y Bienvenida */}
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center mb-1">
              <img 
                src="/logo-aulacore.png" 
                alt="AulaCore Logo" 
                className="h-10 sm:h-11 w-auto object-contain select-none"
              />
            </div>
            
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">
              Gestión educativa predictiva: Predice. Conecta. Transforma.
            </p>

            <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight font-heading pt-2">
              Bienvenido a <span className="text-blue-600 font-extrabold">AulaCore</span>
            </h2>

            <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
              Ingresa tus credenciales para acceder a la plataforma educativa y continuar transformando la educación.
            </p>
          </div>

          {/* Formulario de Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Notificaciones de error y éxito */}
            {isResetSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2.5 shadow-xs animate-in fade-in-50">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Tu contraseña ha sido restablecida exitosamente. Inicia sesión con tus nuevas credenciales.
                </span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2.5 shadow-xs animate-in fade-in-50">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {socialNotice && (
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium flex items-start gap-2 shadow-xs">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{socialNotice}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2.5 shadow-xs animate-in fade-in-50">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Autenticación exitosa. Redirigiendo a tu consola...</span>
              </div>
            )}

            {/* Campo: CORREO ELECTRÓNICO */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[11px] font-black text-slate-700 tracking-wider uppercase block">
                Correo Electrónico
              </label>
              <div className="relative rounded-2xl border border-slate-200/90 bg-[#f1f6fd] focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all shadow-xs">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="info@corporacionprofesalaula.org"
                  className="w-full pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-medium bg-transparent focus:outline-none disabled:opacity-60"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Campo: CONTRASEÑA */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[11px] font-black text-slate-700 tracking-wider uppercase block">
                Contraseña
              </label>
              <div className="relative rounded-2xl border border-slate-200/90 bg-[#f1f6fd] focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all shadow-xs">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-12 py-3.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-medium bg-transparent focus:outline-none disabled:opacity-60"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
                  disabled={loading || success}
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Opciones: Recordarme & Recuperación */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-semibold hover:text-slate-800">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer bg-white"
                  disabled={loading || success}
                />
                <span>Recordarme</span>
              </label>
              
              <Link 
                href="/auth/recuperar" 
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón Principal CTA: Iniciar sesión */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full h-[52px] sm:h-[56px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-500/25 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Divisor "o continúa con" */}
          <div className="relative flex items-center justify-center my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-xs font-semibold text-slate-400">
              o continúa con
            </span>
          </div>

          {/* Botones de Social Login (Google, Microsoft, Apple) */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialClick('Google')}
              className="py-2.5 px-3 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google</span>
            </button>

            {/* Microsoft */}
            <button
              type="button"
              onClick={() => handleSocialClick('Microsoft')}
              className="py-2.5 px-3 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              <span>Microsoft</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocialClick('Apple')}
              className="py-2.5 px-3 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.45-.6.69-1.12 1.83-.98 2.95 1.07.08 2.15-.56 2.79-1.3"/>
              </svg>
              <span>Apple</span>
            </button>

          </div>

          {/* Bloque Institucional de Seguridad y Privacidad */}
          <div className="p-3.5 rounded-2xl bg-[#f0f6fe] border border-blue-100 flex items-center gap-3.5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-xs shrink-0 border border-blue-100">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                Plataforma segura y confiable
              </span>
              <span className="text-[11px] text-slate-600 font-medium block leading-snug mt-0.5">
                Protegemos tus datos y los de tu comunidad educativa.
              </span>
            </div>
          </div>

          {/* ⚡ PANEL DEMO: Se activa condicionalmente con ?demo=true */}
          {showDemo && (
            <div className="space-y-3 pt-4 border-t border-slate-100 animate-in fade-in-50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Consolas de Demostración Activas
                </span>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wider">
                  Auto-fill
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {DEMO_ACCOUNTS.map((account, idx) => (
                  <div
                    key={account.role}
                    onClick={() => handleDemoClick(account.email)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-200 flex items-center justify-between gap-3 cursor-pointer transition active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-black text-[10px] border shadow-xs ${account.color}`}>
                        {ROLE_DISPLAY_NAMES[account.role].charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 leading-none">
                          <span className="font-bold text-slate-800 text-xs">
                            {account.name}
                          </span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${account.color} leading-none`}>
                            {ROLE_DISPLAY_NAMES[account.role]}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium leading-none block mt-0.5">
                          {account.desc}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(account.email, idx);
                      }}
                      className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition relative z-20 cursor-pointer shrink-0"
                      title="Copiar correo"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              
              <p className="text-[10px] text-slate-400 font-semibold text-center pt-1">
                Contraseña demo: <strong className="text-slate-700 font-bold select-all">AulaCore2026!</strong>
              </p>
            </div>
          )}

        </div>

        {/* Footer sutil móvil */}
        <div className="lg:hidden text-center text-[10px] text-slate-400 pt-6">
          &copy; {new Date().getFullYear()} AulaCore S.A.S. Todos los derechos reservados.
        </div>

      </section>

    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-3 select-none">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-slate-400 font-bold text-xs uppercase tracking-widest">Iniciando Ecosistema AulaCore...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
