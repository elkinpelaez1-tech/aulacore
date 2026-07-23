'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { UserRole, ROLE_DISPLAY_NAMES } from '@/lib/navigation';
import { useSearchParams } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  User, 
  Copy, 
  Check,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Cloud,
  BrainCircuit
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

// Ecosystem configurations
interface EcosystemContent {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  contentType: 'banner' | 'card';
  date?: string;
  location?: string;
  descShort?: string;
  flagUrl?: string;
}

const CAROUSEL_BANNERS: EcosystemContent[] = [
  {
    id: 'b-1',
    title: 'Congreso Internacional Escuela y Paz 2027',
    subtitle: 'Innovación, convivencia y liderazgo para transformar la educación.',
    imageUrl: '/ecosystem/congreso_paz.png',
    buttonText: 'Conocer más',
    buttonUrl: 'https://aulacore.org/ecosistema/escuela-y-paz',
    contentType: 'banner',
    date: '24 y 25 de abril de 2027',
    location: 'Medellín, Colombia'
  },
  {
    id: 'b-2',
    title: 'Pasantía Educativa Finlandia 2027',
    subtitle: 'Conoce el sistema educativo líder del mundo y sus metodologías de enseñanza activa.',
    imageUrl: '/ecosystem/finlandia_edu.png',
    buttonText: 'Conocer más',
    buttonUrl: 'https://aulacore.org/ecosistema/finlandia',
    contentType: 'banner',
    date: '12 al 22 de mayo de 2027',
    location: 'Helsinki, Finlandia'
  },
  {
    id: 'b-3',
    title: 'Pasantía Educativa Japón 2027',
    subtitle: 'Innovación, disciplina y excelencia escolar dentro del ecosistema tecnológico de vanguardia.',
    imageUrl: '/ecosystem/japon_edu.png',
    buttonText: 'Conocer más',
    buttonUrl: 'https://aulacore.org/ecosistema/japon',
    contentType: 'banner',
    date: '10 al 20 de junio de 2027',
    location: 'Tokio, Japón'
  },
  {
    id: 'b-4',
    title: 'Curso de Neuroeducación Consciente',
    subtitle: 'Formación avanzada y herramientas prácticas para docentes que inspiran y transforman mentes.',
    imageUrl: '/ecosystem/neuro_edu.png',
    buttonText: 'Conocer más',
    buttonUrl: 'https://aulacore.org/ecosistema/neuroeducacion',
    contentType: 'banner',
    date: 'Inicio: 15 de julio de 2027',
    location: 'Online Sincrónico'
  },
  {
    id: 'b-5',
    title: 'Diplomado IA para Directivos Colegios',
    subtitle: 'Estrategias, ética y herramientas de Inteligencia Artificial para el liderazgo escolar moderno.',
    imageUrl: '/ecosystem/ia_directivos.png',
    buttonText: 'Conocer más',
    buttonUrl: 'https://aulacore.org/ecosistema/ia-directivos',
    contentType: 'banner',
    date: 'Inicio: 1 de agosto de 2027',
    location: 'Híbrido (Bogotá / Online)'
  }
];

const ECOSISTEMA_CARDS: EcosystemContent[] = [
  {
    id: 'c-1',
    title: 'Pasantía Educativa Finlandia 2027',
    descShort: 'Conoce el sistema educativo líder del mundo.',
    imageUrl: '/ecosystem/finlandia_edu.png',
    buttonText: 'Ver programa',
    buttonUrl: 'https://aulacore.org/ecosistema/finlandia',
    contentType: 'card',
    flagUrl: '🇫🇮'
  },
  {
    id: 'c-2',
    title: 'Pasantía Educativa Japón 2027',
    descShort: 'Innovación, disciplina y excelencia educativa.',
    imageUrl: '/ecosystem/japon_edu.png',
    buttonText: 'Ver programa',
    buttonUrl: 'https://aulacore.org/ecosistema/japon',
    contentType: 'card',
    flagUrl: '🇯🇵'
  },
  {
    id: 'c-3',
    title: 'Neuroeducación Consciente',
    descShort: 'Formación para educadores que inspiran mentes.',
    imageUrl: '/ecosystem/neuro_edu.png',
    buttonText: 'Ver programa',
    buttonUrl: 'https://aulacore.org/ecosistema/neuroeducacion',
    contentType: 'card'
  },
  {
    id: 'c-4',
    title: 'Diplomado IA para Directivos',
    descShort: 'Lidera el cambio con inteligencia artificial.',
    imageUrl: '/ecosystem/ia_directivos.png',
    buttonText: 'Inscribirse',
    buttonUrl: 'https://aulacore.org/ecosistema/ia-directivos',
    contentType: 'card'
  }
];

function LoginContent() {
  const { refreshSession } = useAuth();
  const searchParams = useSearchParams();
  const showDemo = searchParams.get('demo') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Carousel State
  const [bannerIndex, setBannerIndex] = useState(0);

  // Auto transition for banner carrousel
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prevIndex) => (prevIndex + 1) % CAROUSEL_BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevBanner = () => {
    setBannerIndex((prevIndex) => (prevIndex - 1 + CAROUSEL_BANNERS.length) % CAROUSEL_BANNERS.length);
  };

  const handleNextBanner = () => {
    setBannerIndex((prevIndex) => (prevIndex + 1) % CAROUSEL_BANNERS.length);
  };

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
    setSuccess(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aulacore-user-role');
      localStorage.removeItem('aulacore-demo-session');
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // EN PRODUCCIÓN: JAMÁS PERMITIR ACCESO DEMO OFFLINE ANTE CREDENCIALES INVÁLIDAS
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
        // En producción no existe bypass: si las credenciales en Supabase no coinciden, se rechaza
        if (process.env.NODE_ENV === 'production') {
          throw signInError;
        }
        // Solo en desarrollo se permite sesión simulada
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

  const currentBanner = CAROUSEL_BANNERS[bannerIndex];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center font-sans w-full">
      <div className="w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row items-stretch">
        
        {/* 🏛️ COLUMNA IZQUIERDA: Ecosistema AulaCore (53% Desktop Only) */}
        <section className="hidden lg:flex lg:w-[53%] bg-transparent relative overflow-hidden flex-col justify-center items-center p-6 xl:p-8 select-none">
          
          {/* Card Ecosistema AulaCore */}
          <div className="w-full h-[calc(100vh-3rem)] max-h-[820px] bg-[#030712] rounded-[2.5rem] border border-slate-800/40 relative overflow-hidden flex flex-col justify-between p-8 xl:p-10 text-white shadow-2xl">
            
            {/* Glows abstractos */}
            <div className="absolute top-[-30%] left-[-20%] w-[90%] h-[90%] bg-blue-600/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Content container inside Card */}
            <div className="w-full h-full flex flex-col justify-between relative z-10">
              
              {/* Header Logo */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center p-1.5 backdrop-blur-md border border-blue-500/25 shadow-inner">
                  <img 
                    src="/logo-aulacore.png" 
                    alt="AulaCore Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-extrabold text-sm tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-350">
                  AULACORE
                </span>
              </div>

              {/* Ecosistema Content Panel */}
              <div className="flex-1 flex flex-col justify-start pt-3 pb-2 gap-5">
                
                {/* 1. CAROUSEL BANNER (240px) */}
                <div className="relative w-full h-[240px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/40 backdrop-blur-md group transition-all duration-300 shadow-2xl">
                  {/* Background image loaded dynamically with overlay */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-100 group-hover:scale-102"
                    style={{ backgroundImage: `url(${currentBanner.imageUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
                  
                  {/* Carousel navigation arrows */}
                  <button 
                    type="button"
                    onClick={handlePrevBanner}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-950 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer z-20"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={handleNextBanner}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-950 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer z-20"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Inner Content Area */}
                  <div className="absolute inset-0 flex flex-col justify-between p-6 pl-12 pr-12 relative z-10">
                    <div className="space-y-2 max-w-[85%]">
                      <span className="text-[9px] font-black tracking-widest text-indigo-400 bg-indigo-550/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase leading-none inline-block">
                        Eventos & Alianzas
                      </span>
                      <h2 className="text-xl font-black tracking-tight leading-tight text-white pt-1">
                        {currentBanner.title}
                      </h2>
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                        {currentBanner.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/40">
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                        {currentBanner.date && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            {currentBanner.date}
                          </span>
                        )}
                        {currentBanner.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                            {currentBanner.location}
                          </span>
                        )}
                      </div>

                      <a 
                        href={currentBanner.buttonUrl}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition shadow-md shadow-blue-500/10 cursor-pointer"
                      >
                        {currentBanner.buttonText}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Bottom dots indicators */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                    {CAROUSEL_BANNERS.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBannerIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${bannerIndex === idx ? "bg-white w-4" : "bg-slate-600 hover:bg-slate-450"}`}
                      />
                    ))}
                  </div>
                </div>

                {/* 2. GRID DE TARJETAS DEL ECOSISTEMA (4 Tarjetas) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-200 tracking-wider uppercase">
                    Ecosistema AulaCore
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {ECOSISTEMA_CARDS.map((card) => (
                      <div 
                        key={card.id}
                        className="bg-slate-950/30 border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between h-[160px] hover:shadow-lg group"
                      >
                        <div className="relative h-[65px] bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${card.imageUrl})` }}>
                          <div className="absolute inset-0 bg-slate-950/60" />
                          {card.flagUrl && (
                            <span className="absolute top-2 left-2 text-md leading-none filter drop-shadow">
                              {card.flagUrl}
                            </span>
                          )}
                        </div>

                        <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">
                          <div>
                            <h4 className="text-[11px] font-black text-white leading-tight truncate-2-lines">
                              {card.title}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-semibold leading-snug line-clamp-2 mt-0.5">
                              {card.descShort}
                            </p>
                          </div>

                          <a 
                            href={card.buttonUrl}
                            className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-all cursor-pointer mt-auto"
                          >
                            {card.buttonText}
                            <ChevronRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. BENEFICIOS AULACORE (100px) */}
              <div className="border-t border-slate-800/60 pt-6 pb-2 flex items-center justify-between gap-6 text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450 shrink-0">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-slate-200 block">Seguridad Avanzada</span>
                    <p className="text-[9px] font-semibold text-slate-500 leading-none mt-0.5">Aislamiento y políticas RLS estrictas.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-450 shrink-0">
                    <Cloud className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-slate-200 block">Plataforma en la Nube</span>
                    <p className="text-[9px] font-semibold text-slate-500 leading-none mt-0.5">Acceso 24/7 de alta disponibilidad.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-450 shrink-0">
                    <BrainCircuit className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-slate-200 block">Inteligencia Predictiva</span>
                    <p className="text-[9px] font-semibold text-slate-500 leading-none mt-0.5">Modelos de IA aplicados a la educación.</p>
                  </div>
                </div>
              </div>

              {/* Footer legal block */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/30 pt-4 font-semibold">
                <span>&copy; {new Date().getFullYear()} AulaCore S.A.S. Todos los derechos reservados.</span>
                <div className="flex gap-4">
                  <a href="https://aulacore.org/terminos" className="hover:text-slate-400">Términos de uso</a>
                  <span>|</span>
                  <a href="https://aulacore.org/privacidad" className="hover:text-slate-400">Política de privacidad</a>
                  <span>|</span>
                  <a href="https://aulacore.org/soporte" className="hover:text-slate-400">Soporte</a>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* 🔐 COLUMNA DERECHA: Formulario de Login (47% Desktop/Tablet/Mobile) */}
        <section className="flex-1 lg:w-[47%] bg-slate-50 flex flex-col justify-between p-8 sm:p-12 overflow-y-auto min-h-screen">
        
        {/* Top Spacer or Mobile Header */}
        <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1 border border-slate-200 shadow-md">
            <img 
              src="/logo-aulacore.png" 
              alt="AulaCore Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-extrabold text-slate-900 tracking-wider text-sm">AULACORE</span>
        </div>
        <div className="hidden lg:block shrink-0" />

        {/* Central Login Card (White premium card floating on light gray canvas) */}
        <div className="w-full max-w-md mx-auto space-y-6 my-auto bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-lg">
          
          {/* Logo & Welcome text */}
          <div className="text-center space-y-2">
            <div className="hidden lg:flex justify-center items-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center p-2.5 border border-slate-150 shadow-inner">
                <img 
                  src="/logo-aulacore.png" 
                  alt="AulaCore Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
              Bienvenido a <span className="text-blue-600">AulaCore</span>
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              Ingresa tus credenciales para acceder a la plataforma corporativa.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-150 text-red-700 text-xs font-bold flex items-start gap-2.5 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs font-bold flex items-center gap-2.5 shadow-sm">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Autenticación exitosa. Redirigiendo...</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] font-black text-slate-600 tracking-wide uppercase">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="ejemplo@aulacore.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 shadow-sm transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[10px] font-black text-slate-600 tracking-wide uppercase">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 shadow-sm transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  disabled={loading || success}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox Recordarme & Recuperar Contraseña */}
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-slate-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer bg-white"
                  disabled={loading || success}
                />
                <span>Recordarme</span>
              </label>
              
              <a href="https://aulacore.org/recuperar" className="text-blue-650 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 rounded-xl bg-slate-950 text-white font-black text-xs uppercase tracking-widest shadow-md hover:bg-slate-850 active:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-75 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Secure details card (Linear/Stripe style) */}
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide block">Plataforma segura y confiable</span>
              <p className="text-[10px] text-slate-500 font-semibold leading-normal">Cumplimos con los más altos estándares de seguridad y protección de datos escolares.</p>
            </div>
          </div>

          {/* ⚡ PANEL DEMO: Muestra condicionalmente con ?demo=true */}
          {showDemo && (
            <div className="space-y-3.5 pt-4 border-t border-slate-200 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Consolas de Demostración Activas
                </span>
                <span className="text-[8px] font-black text-blue-650 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wider">
                  Auto-fill
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {DEMO_ACCOUNTS.map((account, idx) => (
                  <div
                    key={account.role}
                    onClick={() => handleDemoClick(account.email)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3 cursor-pointer transition active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-[10px] border shadow-sm ${account.color}`}>
                        {ROLE_DISPLAY_NAMES[account.role].charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 leading-none">
                          <span className="font-bold text-slate-800 text-xs">
                            {account.name}
                          </span>
                          <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border ${account.color} leading-none scale-90`}>
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
                      className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors relative z-20 cursor-pointer shrink-0"
                      title="Copiar correo"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              
              <p className="text-[9px] text-slate-400 font-bold text-center">
                Contraseña demo: <strong className="text-slate-650 font-black select-all">AulaCore2026!</strong>
              </p>
            </div>
          )}

        </div>

        {/* Central Logo and Footer */}
        <div className="pt-6 border-t border-slate-200/60 text-center flex flex-col items-center gap-1.5 mt-8 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center p-1 border border-slate-150 shadow-sm">
              <img 
                src="/logo-aulacore.png" 
                alt="AulaCore Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-black text-slate-800 tracking-wider text-xs">AulaCore</span>
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">
            Transformamos la educación con inteligencia y corazón.
          </p>
        </div>

      </section>
      
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-3 select-none">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-slate-500 font-bold text-xs uppercase tracking-widest">Iniciando Ecosistema AulaCore...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
