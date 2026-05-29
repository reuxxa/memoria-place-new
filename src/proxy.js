import { NextResponse } from 'next/server';

export default function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('kw_token')?.value;

  // Halaman yang membutuhkan autentikasi login
  const isProtectedRoute = pathname.startsWith('/tulis') || pathname.startsWith('/kamar');

  // Halaman autentikasi login/register
  const isAuthRoute = pathname.startsWith('/auth');

  if (isProtectedRoute && !token) {
    // Jika tidak ada token dan mencoba mengakses halaman terproteksi,
    // alihkan secara instan ke halaman login dengan query unauthorized.
    const url = new URL('/auth', request.url);
    url.searchParams.set('mode', 'login');
    url.searchParams.set('alert', 'unauthorized');
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    // Jika sudah memiliki token aktif dan mencoba mengakses halaman masuk/daftar,
    // alihkan kembali ke halaman utama.
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Menentukan rute mana saja yang akan diproses oleh proxy
export const config = {
  matcher: [
    '/tulis',
    '/kamar/:path*',
    '/auth',
  ],
};
