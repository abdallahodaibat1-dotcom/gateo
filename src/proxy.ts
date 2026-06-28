import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;
  const userRole = req.auth?.user?.role;

  // Public paths that don't require authentication
  const isPublicPath =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/ads') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/templates') ||
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/login/') ||
    // Public content pages
    pathname.startsWith('/business/') ||
    pathname.startsWith('/businesses') ||
    pathname.startsWith('/professional/') ||
    pathname.startsWith('/professionals') ||
    pathname.startsWith('/post/') ||
    pathname.startsWith('/profile/') ||
    pathname.startsWith('/ladies-gate') ||
    pathname.startsWith('/search') ||
    pathname.startsWith('/groups') ||
    pathname.startsWith('/leaderboard') ||
    pathname.startsWith('/badges') ||
    pathname.startsWith('/trending');

  // API routes should be handled by their own auth
  const isApiPath = pathname.startsWith('/api/');

  // Admin area detection
  const isAdminArea =
    pathname.startsWith('/admin-dashboard') ||
    (pathname.startsWith('/admin') && !pathname.startsWith('/api/'));

  // Admin login page is public
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return NextResponse.next();
  }

  if (isAdminArea) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/admin/login', nextUrl);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
    return NextResponse.next();
  }

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isApiPath) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
