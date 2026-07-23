import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // 1. INVENTARIO DE RUTAS PÚBLICAS (ESTRICTAMENTE NECESARIAS - ALLOW LIST EXCLUSIVA)
  const publicPaths = [
    '/login',
    '/verify',
    '/join',
    '/transparencia',
    '/api' // Endpoints públicos como webhook/notificación (auditar independientemente en P1)
  ];

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Si faltan las claves en entorno de producción para una ruta NO pública, bloquear el acceso por defecto
  if (!supabaseUrl || !supabaseAnonKey) {
    if (!isPublicPath && process.env.NODE_ENV === 'production') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return response;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refrescar el token y validar la sesión activa (SSR segura en el Edge)
    const { data: { user } } = await supabase.auth.getUser();

    // 2. REDIRECCIÓN DE USUARIO LOGUEADO INTENTANDO IR A /LOGIN
    if (pathname === '/login' && user) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // 3. ESTRATEGIA DEFAULT DENY: CUALQUIER RUTA NO PÚBLICA REQUIERE AUTENTICACIÓN
    if (!isPublicPath && !user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error('[Security Middleware] Error verificando sesión:', error);
    // En caso de fallo criptográfico o de conexión al verificar sesión en ruta protegida, DENY BY DEFAULT
    if (!isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, logos, assets (static files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
