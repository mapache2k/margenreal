import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security headers en todas las respuestas (OWASP A05, NIST Protect)
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options',    'nosniff');
  response.headers.set('X-Frame-Options',           'DENY');
  response.headers.set('X-XSS-Protection',          '1; mode=block');
  response.headers.set('Referrer-Policy',           'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy',        'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://us.i.posthog.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://us.i.posthog.com",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
