import { NextResponse, type NextRequest } from 'next/server';
import { getAuthSecrets } from '@/lib/auth/config';
import { clientIpFrom, hitRateLimit, LIMITS, refundRateLimit } from '@/lib/rate-limit';
import {
  createSessionToken,
  roleForCode,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifySessionToken,
} from '@/lib/auth/token';

/**
 * Zugangsschutz für die ganze Seite.
 *
 * - Ohne gültige Session → Weiterleitung zu /login (bzw. /admin/login).
 * - `?code=<Gästecode>` in der URL (z. B. im QR-Code auf der Einladung)
 *   meldet Gäste direkt an und entfernt den Code wieder aus der Adresse.
 * - Öffentlich bleiben nur Login-Seiten, Datenschutz und technische Dateien.
 */

const PUBLIC_PATHS = new Set(['/login', '/admin/login', '/datenschutz', '/robots.txt']);

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const secrets = getAuthSecrets();
  const role = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, secrets);
  const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/');

  if (PUBLIC_PATHS.has(pathname)) {
    // Bereits angemeldete Gäste brauchen die Login-Seite nicht.
    if (pathname === '/login' && role) {
      return withNoIndex(NextResponse.redirect(new URL('/', request.url)));
    }
    if (pathname === '/admin/login' && role === 'admin') {
      return withNoIndex(NextResponse.redirect(new URL('/admin', request.url)));
    }
    return withNoIndex(NextResponse.next());
  }

  // Automatische Anmeldung per Link/QR-Code: /?code=...
  const codeParam = searchParams.get('code');
  if (codeParam !== null && !isAdminArea) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete('code');
    if (role) return withNoIndex(NextResponse.redirect(cleanUrl));
    // Gleiches Kontingent wie das Login-Formular – sonst ließe sich der Code hier durchprobieren.
    const { key, limit, window } = LIMITS.guestLogin;
    const limitKey = key(clientIpFrom(request.headers));
    if (!(await hitRateLimit(limitKey, limit, window))) {
      return withNoIndex(redirectToLogin(request, '/login', 'rate'));
    }
    if (roleForCode(codeParam, secrets) === 'guest') {
      const token = await createSessionToken('guest', secrets);
      if (token) {
        await refundRateLimit(limitKey); // Erfolg zählt nicht gegen das Kontingent
        const response = NextResponse.redirect(cleanUrl);
        response.cookies.set(SESSION_COOKIE, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: SESSION_MAX_AGE.guest,
        });
        return withNoIndex(response);
      }
    }
    // Falscher Code: weiter zum Login, Code nicht in der Adresse behalten.
    return withNoIndex(redirectToLogin(request, '/login', 'code'));
  }

  if (isAdminArea) {
    if (role === 'admin') return withNoIndex(NextResponse.next());
    return withNoIndex(redirectToLogin(request, '/admin/login'));
  }

  if (role) return withNoIndex(NextResponse.next());
  return withNoIndex(redirectToLogin(request, '/login'));
}

function redirectToLogin(request: NextRequest, loginPath: string, error?: 'code' | 'rate' | 'sitzung') {
  const url = new URL(loginPath, request.url);
  const target = request.nextUrl.clone();
  target.searchParams.delete('code');
  const next = target.pathname + target.search;
  if (next !== '/' && next !== loginPath) url.searchParams.set('next', next);
  const isWrite = request.method !== 'GET' && request.method !== 'HEAD';
  // Server Action ohne (gültige) Sitzung, z. B. abgelaufenes Cookie: Der Next-Client versteht
  // nur einen Action-Redirect – ein 401 endet sonst auf der englischen Absturzseite.
  // So navigiert der Browser hart zur Anmeldung, ohne dass Seiteninhalt ausgeliefert wird.
  const isServerAction = isWrite && request.headers.has('next-action');
  const reason = error ?? (isServerAction ? 'sitzung' : undefined);
  if (reason) url.searchParams.set('fehler', reason);
  if (isServerAction) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'x-action-redirect': `${url.pathname}${url.search};replace`,
        'content-type': 'text/plain',
      },
    });
  }
  // Sonstige Fetches nicht umleiten, sondern sauber ablehnen.
  if (isWrite) {
    return new NextResponse('Nicht angemeldet', { status: 401 });
  }
  return NextResponse.redirect(url);
}

function withNoIndex(response: NextResponse) {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return response;
}

export const config = {
  matcher: [
    // Alles außer Next.js-Build-Dateien, Bildoptimierung, Icons und Link-Vorschaubild.
    // Next liefert Icons und Vorschaubild ohne Endung aus (/apple-icon?<hash>, /opengraph-image?<hash>).
    // Die Ausnahmen gelten nur für exakt diese Pfade (optional mit Endung), nicht für alles mit
    // gleichem Anfang.
    '/((?!_next/static|_next/image|(?:favicon\\.ico|icon\\.svg|apple-icon|opengraph-image)(?:\\.\\w+)?$).*)',
  ],
};
