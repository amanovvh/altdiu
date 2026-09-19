import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Edge middleware that protects every /admin/* route.
 *
 * Public paths (no redirect):
 *   - /admin/login
 *   - /api/admin/login
 *
 * Everything else under /admin requires a valid session cookie.
 *
 * Note: middleware runs in the Edge runtime — no Prisma. The session JWT
 * is verified with the shared secret. Server-side routes additionally
 * call getCurrentAdmin() to confirm the user is still active.
 */

const SESSION_COOKIE = 'lyceum_admin_session';

function getSecret(): Uint8Array | null {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s || s.length < 16) return null;
  return new TextEncoder().encode(s);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public admin paths
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/login/') ||
    pathname === '/api/admin/login'
  ) {
    // Pass pathname as a request header so server components can read it
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Only protect /admin/* routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = getSecret();

  if (!secret) {
    // Misconfiguration: NEXTAUTH_SECRET missing. Redirect to login with a notice.
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }
    return NextResponse.redirect(new URL('/admin/login?error=config', req.url));
  }

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL('/admin/login', req.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, secret);
    // Authenticated — pass pathname through for server components
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL('/admin/login', req.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
