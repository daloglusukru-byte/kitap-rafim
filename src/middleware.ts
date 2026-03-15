import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // API ve static dosyalar için middleware'i atla
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/giris') ||
    pathname === '/manifest.json' ||
    pathname === '/manifest.webmanifest' ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.mjs') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.wasm')
  ) {
    return NextResponse.next();
  }

  // Auth cookie kontrolü
  const authCookie = request.cookies.get('kitaprafim_auth');
  
  if (!authCookie || authCookie.value !== 'authenticated') {
    // Giriş sayfasına yönlendir
    const loginUrl = new URL('/giris', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
