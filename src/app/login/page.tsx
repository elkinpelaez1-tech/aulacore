'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { UserRole, ROLE_DISPLAY_NAMES } from '@/lib/navigation';
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
  EyeOff
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
    email: 'rector@aulacore.com',
    role: 'rector',
    name: 'Dr. Ramón Ramírez',
    desc: 'Control total de la institución',
    color: 'bg-blue-600 border-blue-200 text-blue-700',
    bgGradient: 'from-blue-50 to-blue-100/50 hover:border-blue-300'
  },
  {
    email: 'director@aulacore.com',
    role: 'director_grupo',
    name: 'Lic. Patricia Martínez',
    desc: 'Gestión de curso y asistencia QR',
    color: 'bg-purple-600 border-purple-200 text-purple-700',
    bgGradient: 'from-purple-50 to-purple-100/50 hover:border-purple-300'
  },
  {
    email: 'docente@aulacore.com',
    role: 'docente',
    name: 'Prof. Gómez',
    desc: 'Registro de calificaciones y asistencia',
    color: 'bg-emerald-600 border-emerald-200 text-emerald-700',
    bgGradient: 'from-emerald-50 to-emerald-100/50 hover:border-emerald-300'
  },
  {
    email: 'secretaria@aulacore.com',
    role: 'secretaria',
    name: 'Dra. Elena Toro',
    desc: 'Expedición de certificados e informes',
    color: 'bg-amber-500 border-amber-200 text-amber-700',
    bgGradient: 'from-amber-50 to-amber-100/50 hover:border-amber-300'
  },
  {
    email: 'padre@aulacore.com',
    role: 'padre_familia',
    name: 'Carlos Ortiz',
    desc: 'Seguimiento del rendimiento e inasistencias',
    color: 'bg-rose-500 border-rose-200 text-rose-700',
    bgGradient: 'from-rose-50 to-rose-100/50 hover:border-rose-300'
  }
];

export default function LoginPage() {
  const { refreshSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      setSuccess(true);
      // Forzar al AuthProvider a leer la nueva sesión activa inmediatamente
      await refreshSession();
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      // Traducir algunos errores comunes para mejor UX
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

  const handleDemoClick = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('AulaCore2026!');
    setError(null);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* 🏛️ COLUMNA IZQUIERDA: Banner Corporativo Premium (Desktop Only) */}
      <section className="hidden lg:flex w-[45%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 relative overflow-hidden flex-col justify-between p-12 text-white border-r border-slate-700/30">
        
        {/* Glows abstractos */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-3xl" />

        {/* Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center p-1.5 backdrop-blur-md border border-white/20 shadow-inner">
            <img 
              src="/logo-aulacore.png" 
              alt="AulaCore Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
            AULACORE
          </span>
        </div>

        {/* Content */}
        <div className="my-auto relative z-10 space-y-8">
          <div className="space-y-4 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plataforma SaaS Educativa Enterprise</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight font-heading">
              Gestión Educativa Inteligente y Unificada
            </h1>
            <p className="text-slate-300 text-base leading-relaxed font-light">
              La consola corporativa diseñada para rectores, coordinadores, docentes y familias. Optimiza procesos académicos con la robustez y velocidad de grado gubernamental.
            </p>
          </div>

          {/* Características */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-200">Autenticación Segura Multi-tenant (Supabase Auth)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-200">Redirección Inteligente de Consolas de Trabajo</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} AulaCore S.A.S. Todos los derechos reservados.
        </div>
      </section>

      {/* 🔐 COLUMNA DERECHA: Login Form & Accesos Rápidos Demo */}
      <section className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile logo & titles */}
          <div className="text-center space-y-3 lg:text-left">
            <div className="flex justify-center lg:justify-start items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1 border border-slate-200 shadow-md">
                <img 
                  src="/logo-aulacore.png" 
                  alt="AulaCore Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-slate-800 tracking-wider">AULACORE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Iniciar Sesión
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Ingresa tus credenciales para acceder a la plataforma corporativa.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-150 text-red-700 text-sm font-semibold flex items-start gap-3 shadow-sm animate-shake">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-150 text-emerald-700 text-sm font-semibold flex items-center gap-3 shadow-sm">
                <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                <span>Autenticación exitosa. Redirigiendo...</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 tracking-wider uppercase">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="ejemplo@aulacore.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 shadow-sm transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-bold text-slate-700 tracking-wider uppercase">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 shadow-sm transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  disabled={loading || success}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm tracking-wide shadow-lg border border-slate-950 hover:bg-slate-800 active:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-75 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando Credenciales...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ⚡ PANEL DEMO: Cuentas Rápidas e Instrucciones de Prueba */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Consolas de Demostración Activas
              </span>
              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-150">
                1-Clic Auto-fill
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2.5">
              {DEMO_ACCOUNTS.map((account, idx) => (
                <div
                  key={account.role}
                  onClick={() => handleDemoClick(account.email)}
                  className={`group relative p-3 rounded-xl border border-slate-200 bg-gradient-to-br ${account.bgGradient} flex items-center justify-between gap-4 cursor-pointer transition-all duration-300 hover:shadow-sm hover:scale-[1.01] active:scale-[0.99]`}
                >
                  <div className="flex items-center gap-3">
                    {/* Role Indicator Circle */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs border shadow-sm ${account.color}`}>
                      {ROLE_DISPLAY_NAMES[account.role].charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-sm leading-none group-hover:text-slate-950">
                          {account.name}
                        </span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${account.color} leading-none scale-90`}>
                          {ROLE_DISPLAY_NAMES[account.role]}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {account.desc}
                      </span>
                    </div>
                  </div>

                  {/* Copy helper button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar autocompletar al presionar copiar
                      handleCopy(account.email, idx);
                    }}
                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors relative z-20 cursor-pointer"
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
            <p className="text-[10px] text-slate-400 font-medium text-center italic">
              Contraseña única de demostración: <strong className="text-slate-600 select-all font-semibold">AulaCore2026!</strong>
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
