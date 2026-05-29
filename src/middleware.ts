import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Si faltan las claves, permitir el paso (para evitar bloqueos en el build o desarrollo local sin env)
  if (!supabaseUrl || !supabaseAnonKey) {
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

    // Refrescar el token del usuario si está expirado (importante para mantener la sesión)
    const { data: { user } } = await supabase.auth.getUser();

    // Rutas que requieren autenticación
    const protectedPaths = [
      '/dashboard',
      '/directores',
      '/docentes',
      '/estudiantes',
      '/cursos',
      '/reportes',
      '/alertas',
      '/configuracion',
      '/asistencia',
      '/observaciones',
      '/notas',
      '/evaluaciones',
      '/documentos',
      '/mi-hijo'
    ];
    
    const pathname = request.nextUrl.pathname;
    const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(path + '/'));

    if (isProtected && !user) {
      // Si no está autenticado, redirigir a /login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    if (pathname === '/login' && user) {
      // Si está autenticado e intenta ir a /login, redirigir a /dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
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
     * - images, logos, logos/assets (static files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
