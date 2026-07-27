// src/app/auth/complete-invitation/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, Loader2 } from 'lucide-react';

function InvitationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tokens que Supabase incluye en la URL de redirección
  const accessToken = searchParams.get('access_token') ?? '';
  const refreshToken = searchParams.get('refresh_token') ?? '';

  const [sessionReady, setSessionReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1️⃣ Establecemos la sesión con los tokens recibidos
  useEffect(() => {
    async function initSession() {
      if (!accessToken) {
        setError('Token de acceso no encontrado en la URL.');
        return;
      }
      try {
        const { error: sessError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessError) throw sessError;
        setSessionReady(true);
      } catch (e: any) {
        setError(e.message ?? 'No se pudo establecer la sesión.');
      }
    }
    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateErr) {
      setError(updateErr.message);
    } else {
      // 2️⃣ Contraseña guardada → redirigir al dashboard
      router.push('/dashboard');
    }
  };

  return (
    <section className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Activar tu cuenta</h2>
      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 mb-4 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {!sessionReady ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
          <span className="ml-2 text-sm text-slate-600">Validando invitación…</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Nueva contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-slate-950 text-white font-semibold rounded-md hover:bg-slate-800 transition"
          >
            {loading ? (
              <>
                <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
                Guardando…
              </>
            ) : (
              'Crear contraseña y continuar'
            )}
          </button>
        </form>
      )}
    </section>
  );
}

export default function CompleteInvitation() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-600" /> <span className="ml-2 text-sm text-slate-600">Cargando página…</span></div>}>
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <InvitationForm />
      </main>
    </Suspense>
  );
}
