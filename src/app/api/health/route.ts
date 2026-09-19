import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Lightweight healthcheck used by Docker / load balancers.
 *
 * - Returns 200 always (the process is alive).
 * - Verifies Prisma connectivity; reports DB status in the JSON body.
 */
export async function GET() {
  let dbStatus: 'up' | 'down' = 'down';
  try {
    const { prisma } = await import('@/lib/db/prisma');
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'up';
  } catch {
    dbStatus = 'down';
  }

  return NextResponse.json({
    ok: dbStatus === 'up',
    db: dbStatus,
    ts: new Date().toISOString(),
  });
}