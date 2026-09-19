/**
 * Authentication for the /admin panel.
 *
 * - Passwords hashed with bcrypt (cost 12).
 * - Sessions are JWTs signed with HS256 using NEXTAUTH_SECRET.
 * - The JWT is stored in an httpOnly cookie ("lyceum_admin_session").
 * - All admin routes (UI + API) call `getCurrentAdmin()` / `requireAdmin()`.
 */
import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import type { AdminUser } from '@prisma/client';

export const SESSION_COOKIE = 'lyceum_admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function secret(): Uint8Array {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      'NEXTAUTH_SECRET is missing or too short. Set it in .env (use `openssl rand -hex 32`).'
    );
  }
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  sub: string; // admin user id
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Hash a plain-text password with bcrypt (cost factor 12).
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

/**
 * Verify a plain-text password against a stored bcrypt hash.
 */
export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Sign a new session JWT and set it as an httpOnly cookie.
 */
export async function createSession(admin: Pick<AdminUser, 'id'> & { email: string; role: string }): Promise<string> {
  const jwt = await new SignJWT({ email: admin.email, role: admin.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret());

  cookies().set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });

  return jwt;
}

/**
 * Clear the session cookie (logout).
 */
export function destroySession(): void {
  cookies().delete(SESSION_COOKIE);
}

/**
 * Verify the session cookie and return the payload (or null on failure).
 * Does NOT hit the database — used inside middleware where DB access is
 * not available. Use `requireAdmin()` for server-side checks.
 */
export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Read the session cookie from the request and verify it. Returns the
 * payload only — does not load the admin from DB.
 */
export async function readSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/**
 * Return the currently authenticated admin (with DB lookup), or null.
 * Updates `lastSeenAt` opportunistically.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const session = await readSession();
  if (!session) return null;
  const admin = await prisma.adminUser.findUnique({ where: { id: session.sub } });
  if (!admin || !admin.isActive) return null;
  // Fire-and-forget lastSeenAt update
  prisma.adminUser
    .update({ where: { id: admin.id }, data: { lastSeenAt: new Date() } })
    .catch(() => {});
  return admin;
}

/**
 * Authenticate by email + password. Returns the admin on success, null otherwise.
 * Constant-time: bcrypt.compare is already constant-time relative to the hash.
 */
export async function authenticate(
  email: string,
  password: string
): Promise<AdminUser | null> {
  const admin = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!admin || !admin.isActive) return null;
  const ok = await verifyPassword(password, (admin as any).passwordHash);
  return ok ? admin : null;
}

/**
 * Log an admin action for the audit log.
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  entityType?: string,
  entityId?: string
): Promise<void> {
  try {
    await prisma.adminAction.create({
      data: {
        adminId,
        action,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
      },
    });
  } catch (err) {
    console.error('[admin] failed to log action', err);
  }
}

/**
 * Simple in-memory rate limiter for the login endpoint.
 * For production replace with Redis-backed limiter.
 */
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const LOGIN_WINDOW_MS = 60_000;
const LOGIN_MAX = 8;

export function checkLoginRate(ip: string): { allowed: boolean; retryIn?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return { allowed: true };
  }
  entry.count += 1;
  if (entry.count > LOGIN_MAX) {
    return { allowed: false, retryIn: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

export function recordFailedLogin(ip: string): void {
  const entry = loginAttempts.get(ip);
  if (entry) entry.count += 1;
}

export function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

/**
 * For API routes: returns the current admin or null. Routes handle 403 themselves.
 * Replaces the old `verifyAdminRequest()` interface.
 */
export async function getCurrentAdminApi(): Promise<AdminUser | null> {
  return getCurrentAdmin();
}
