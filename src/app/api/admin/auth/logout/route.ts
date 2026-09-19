import { NextResponse } from 'next/server';
import { destroySession, logAdminAction, getCurrentAdmin } from '@/server/auth';

export async function POST() {
  const admin = await getCurrentAdmin();
  if (admin) await logAdminAction(admin.id, 'auth.logout');
  destroySession();
  return NextResponse.json({ ok: true });
}
