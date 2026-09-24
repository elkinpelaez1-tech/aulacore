'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';

function RecuperarContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectTo = `${origin}/auth/establecer-clave`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo }
      );

      if (resetError) {
        // En caso de rate limit u otro error del servicio
        console.error('[Recuperar] Error en resetPasswordForEmail:', resetError);
        // Si es un error de formato o rate limit, informar respetando la seguridad
        if (resetError.message?.toLowerCase().includes('rate limit')) {
          setError('Has alcanzado el límite de solicitudes. Por favor espera unos minutos antes de intentar de nuevo.');
          setLoading(false);
          return;
        }
      }

      // Siempre mostramos el mensaje genérico para evitar enumeración de usuarios
      setSubmitted(true);
    } catch (err: any) {
      console.error('[Recuperar] Excepción inesperada:', err);
      // Mantener respuesta genérica segura
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

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
              Recuperación Segura
            </div>

            <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight font-heading pt-1">
              ¿Olvidaste tu contraseña?
            </h2>

            <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
              Ingresa el correo electrónico asociado a tu cuenta institucional y te enviaremos un enlace seguro para restablecerla.
            </p>
          </div>

          {/* Estado: Solicitud enviada (Mensaje genérico anti-enumeración) */}
          {submitted ? (
            <div className="space-y-6 animate-in fade-in-50">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Solicitud procesada</span>
                </div>
                <p className="text-emerald-700 leading-relaxed">
                  Si el correo está registrado en AulaCore, recibirás un enlace para recuperar tu contraseña.
                </p>
                <p className="text-[11px] text-emerald-600/90 pt-1">
                  Revisa tu bandeja de entrada y la carpeta de correo no deseado (spam). El enlace es de un solo uso y expirará pronto por seguridad.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/login"
                  className="w-full h-[48px] rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a Iniciar Sesión</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition py-1 cursor-pointer"
                >
                  ¿No recibiste el correo? Intentar con otra dirección
                </button>
              </div>
            </div>
          ) : (
            /* Formulario */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Notificación de Error */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2.5 shadow-xs animate-in fade-in-50">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Campo: Correo Electrónico */}
              <div className="space-y-1.5">
                <label htmlFor="recovery-email" className="text-[11px] font-black text-slate-700 tracking-wider uppercase block">
                  Correo Electrónico Registrado
                </label>
                <div className="relative rounded-2xl border border-slate-200/90 bg-[#f1f6fd] focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all shadow-xs">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <input
                    id="recovery-email"
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@aulacore.com"
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 sm:py-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Botón CTA: Enviar Enlace */}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full h-[52px] sm:h-[56px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-500/25 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Enviando enlace seguro...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar enlace de recuperación</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>

              {/* Volver a Login */}
              <div className="text-center pt-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver al Inicio de Sesión</span>
                </Link>
              </div>
            </form>
          )}

          {/* Footer Informativo */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Autenticación segura protegida por AulaCore IAM.</span>
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

export default function RecuperarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <RecuperarContent />
    </Suspense>
  );
}
