import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface AuthenticatedApiContext {
  user: {
    id: string;
    email?: string;
  };
  isInternalService?: boolean;
}

type ApiHandler = (
  request: Request,
  context: AuthenticatedApiContext
) => Promise<NextResponse> | NextResponse;

/**
 * Wrapper estándar de seguridad para Route Handlers en AulaCore Enterprise.
 * Garantiza que cualquier nuevo endpoint en src/app/api/* valide sesión de Supabase Auth
 * o secreto interno de servicio antes de ejecutar la lógica de negocio.
 *
 * Ejemplo de uso:
 * export const POST = withAuth(async (request, { user }) => {
 *   return NextResponse.json({ ok: true, userId: user.id });
 * });
 */
export function withAuth(handler: ApiHandler) {
  return async (request: Request): Promise<NextResponse> => {
    try {
      // 1. Validar Header de servicio interno (si aplica)
      const authHeader = request.headers.get('authorization') || '';
      const internalServiceSecret = process.env.INTERNAL_API_SECRET || '';
      if (internalServiceSecret && authHeader === `Bearer ${internalServiceSecret}`) {
        return await handler(request, {
          user: { id: 'SERVICE_ACCOUNT', email: 'service@aulacore.internal' },
          isInternalService: true
        });
      }

      // 2. Validar sesión Supabase Auth (SSR vía Cookies)
      const cookieStore = await cookies();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {},
          },
        });

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          return await handler(request, {
            user: { id: user.id, email: user.email },
            isInternalService: false
          });
        }
      }

      // Si no existe usuario válido ni token de servicio en producción, 401 Unauthorized
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: '401 Unauthorized: Sesión de usuario o token de servicio requerido.' },
          { status: 401 }
        );
      }

      // En desarrollo sin env, se previene fallo de build
      return await handler(request, {
        user: { id: 'DEV_USER', email: 'dev@aulacore.local' }
      });
    } catch (error: any) {
      console.error('[API Auth Wrapper] Error de autenticación:', error);
      return NextResponse.json(
        { error: '500 Internal Server Error (Auth validation failure)' },
        { status: 500 }
      );
    }
  };
}
