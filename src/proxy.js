import { NextResponse } from 'next/server';

export function proxy(request) {
  // Let Next.js continue to the matched route (client-side checks will handle auth gating)
  const response = NextResponse.next();
  
  // Keep cache headers logic intact for history/security hygiene
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
