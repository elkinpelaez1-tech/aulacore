'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Check
} from 'lucide-react';

function EstablecerClaveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEmail = searchParams.get('email') || '';

  // Estados de sesión
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [userEmail, setUserEmail] = useState<string>(queryEmail);

  // Estados del formulario
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de operación
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validación de la sesión generada por el enlace de invitación / recuperación
  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      try {
        // 1. Detectar si existe window.location.hash con tokens de Supabase Auth
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashString = window.location.hash.startsWith('#')
            ? window.location.hash.substring(1)
            : window.location.hash;
          const hashParams = new URLSearchParams(hashString);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            // Suministrar directamente los tokens a Supabase Auth para sortear la incompatibilidad PKCE del SDK
            const { data, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!isMounted) return;

            if (!setSessionError && data?.session?.user) {
              setHasValidSession(true);
              if (data.session.user.email) {
                setUserEmail(data.session.user.email);
              }
              // Limpiar de forma segura el hash sensible de la barra de direcciones sin recargar
              window.history.replaceState(
                null,
                '',
                window.location.pathname + window.location.search
              );
              setCheckingSession(false);
              return;
            } else {
              console.error('[EstablecerClave] Error en setSession con tokens del hash:', setSessionError);
              setHasValidSession(false);
              setCheckingSession(false);
              return;
            }
          }
        }

        // 2. Fallback: Si no hay hash (o si el usuario ya tenía sesión activa / refrescó la página)
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          setHasValidSession(true);
          if (session.user.email) {
            setUserEmail(session.user.email);
          }
        } else {
          setHasValidSession(false);
        }
        setCheckingSession(false);

      } catch (err) {
        if (isMounted) {
          console.error('[EstablecerClave] Excepción procesando autenticación:', err);
          setHasValidSession(false);
          setCheckingSession(false);
        }
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones de frontend
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifica que ambas sean idénticas.');
      return;
    }

    setSubmitting(true);

    try {
      // Establecer la contraseña en Supabase Auth
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      // Redirección directa a /dashboard. AuthProvider resolverá los roles automáticamente desde user_roles
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);

    } catch (err: any) {
      console.error('[EstablecerClave] Error al actualizar contraseña:', err);
      setError(err.message || 'Ocurrió un error al actualizar la contraseña. Intenta nuevamente.');
      setSubmitting(false);
    }
  };

  // 1. Estado de carga / verificación inicial de sesión
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] border border-slate-200/90 shadow-xl p-8 sm:p-10 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <h2 className="text-xl font-black text-slate-900 font-heading">
            Verificando enlace de activación...
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Estamos validando tu enlace de invitación institucional para configurar tu cuenta de forma segura.
          </p>
        </div>
      </div>
    );
  }

  // 2. Estado de enlace inválido o sesión expirada
  if (!hasValidSession) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] border border-red-200 shadow-xl p-8 sm:p-10 max-w-md w-full text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 font-heading">
              Enlace no válido o expirado
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Este enlace de activación no es válido, ha expirado o ya fue utilizado para activar la cuenta.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Volver al Inicio de Sesión</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Formulario principal de Establecer Contraseña
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Fondo decorativo sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-transparent pointer-events-none -z-10 blur-3xl" />

      {/* Contenedor Central */}
      <div className="w-full max-w-[480px] mx-auto my-auto p-4 sm:p-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-200/90 shadow-[0_20px_50px_rgba(37,99,235,0.07),0_4px_16px_rgba(15,23,42,0.03)] p-7 sm:p-10 space-y-6">
          
          {/* Encabezado */}
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center mb-1">
              <img 
                src="/logo-aulacore.png" 
                alt="AulaCore Logo" 
                className="h-10 sm:h-11 w-auto object-contain select-none"
              />
            </div>
            
            <div className="inline-block bg-blue-50 border border-blue-200/80 rounded-full px-3 py-1 text-[10px] font-black tracking-wider text-blue-700 uppercase">
              AulaCore Enterprise
            </div>

            <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight font-heading pt-1">
              Activa tu cuenta institucional
            </h2>

            <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
              Bienvenido a AulaCore. Crea tu contraseña privada para completar la activación y acceder a tu consola.
            </p>

            {/* Chip con el correo verificado */}
            {userEmail && (
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>{userEmail}</span>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
            )}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Mensaje de Error */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2.5 shadow-xs animate-in fade-in-50">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Mensaje de Éxito */}
            {success && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2.5 shadow-xs animate-in fade-in-50">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                <span>¡Contraseña configurada con éxito! Redirigiendo a tu consola...</span>
              </div>
            )}

            {/* Campo: Nueva Contraseña */}
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-[11px] font-black text-slate-700 tracking-wider uppercase block">
                Nueva Contraseña
              </label>
              <div className="relative rounded-2xl border border-slate-200/90 bg-[#f1f6fd] focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all shadow-xs">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={submitting || success}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-transparent pl-11 pr-12 py-3.5 sm:py-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition p-1"
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Campo: Confirmar Contraseña */}
            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-[11px] font-black text-slate-700 tracking-wider uppercase block">
                Confirmar Contraseña
              </label>
              <div className="relative rounded-2xl border border-slate-200/90 bg-[#f1f6fd] focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all shadow-xs">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  disabled={submitting || success}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full bg-transparent pl-11 pr-12 py-3.5 sm:py-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition p-1"
                  title={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Requisitos mínimos */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>Mínimo 8 caracteres</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <div className={`w-2 h-2 rounded-full ${password.length > 0 && password === confirmPassword ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>Ambas contraseñas deben coincidir</span>
              </div>
            </div>

            {/* Botón Principal CTA: Activar mi cuenta */}
            <button
              type="submit"
              disabled={submitting || success || password.length < 8 || password !== confirmPassword}
              className="w-full h-[52px] sm:h-[56px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-500/25 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Activando cuenta...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4.5 h-4.5" />
                  <span>¡Cuenta Activada!</span>
                </>
              ) : (
                <>
                  <span>Activar mi cuenta</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Informativo */}
          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-400">
              🔒 Comunicación cifrada y autenticación segura con AulaCore Enterprise.
            </p>
          </div>

        </div>
      </div>

      {/* Footer corporativo */}
      <footer className="w-full py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} AulaCore S.A.S. Todos los derechos reservados.
      </footer>

    </div>
  );
}

export default function EstablecerClavePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <EstablecerClaveContent />
    </Suspense>
  );
}
