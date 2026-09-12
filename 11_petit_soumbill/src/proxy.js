import { NextResponse } from 'next/server';

export default function proxy(request) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('admin_session')?.value;

  // Si on tente d'accéder à l'admin (sauf la page login) sans session, on redirige vers le login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  // Si on tente d'aller sur la page login alors qu'on a déjà une session, on redirige vers le dashboard
  if (pathname === '/admin/login') {
    if (session) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
