import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  // 1. Validar que exista token_hash y que el tipo sea estrictamente 'recovery'
  if (token_hash && type === 'recovery') {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // 2. Instanciar cliente SSR con las credenciales públicas anónimas (sin service role key)
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Captura de errores al mutar cookies
          }
        },
      },
    });

    // 3. Verificar el OTP en el servidor
    const { error } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash,
    });

    if (!error) {
      // 4. Redirigir SIEMPRE a la ruta interna de AulaCore /auth/establecer-clave (sin open redirect)
      return NextResponse.redirect(new URL('/auth/establecer-clave', request.url));
    }

    console.error('[Auth Confirm] Error al verificar token de recuperación:', error.message);
  }

  // 5. En caso de token inválido, expirado o tipo incorrecto, redirigir a estado de error
  return NextResponse.redirect(
    new URL('/auth/establecer-clave?error=invalid_token', request.url)
  );
}
