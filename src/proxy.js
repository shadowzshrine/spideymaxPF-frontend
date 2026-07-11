import { NextResponse } from 'next/server';

export function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const guestId = request.cookies.get('guest_id')?.value;
  const { pathname } = request.nextUrl;

  const hasAccess = token || guestId;

  // 1. If user is trying to access portfolio pages without authentication, redirect to /login
  if (!hasAccess && pathname !== '/login') {
    // Exclude static assets and api calls to avoid middleware overhead
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }

  // 2. If user already has valid auth token and visits /login, skip and send to portfolio
  if (token && pathname === '/login') {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

// Ensure compatibility for both old/new conventions
export const middleware = proxy;

// Config matcher to ensure the proxy runs on page routes, adding no-cache security headers
export const config = {
  matcher: ['/', '/login', '/onboarding', '/admin/:path*']
};
