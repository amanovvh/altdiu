import { NextResponse } from 'next/server';
import { getSocialLinks, getContactInfo } from '@/services/contact.service';

// Prisma needs Node.js runtime.
export const runtime = 'nodejs';
// Always render on demand — this route reads from Postgres and must never
// be statically prerendered at build time (which would require DATABASE_URL
// during `next build`).
export const dynamic = 'force-dynamic';

export async function GET() {
  const [links, ruContact] = await Promise.all([
    getSocialLinks(),
    getContactInfo('ru').catch(() => null),
  ]);
  return NextResponse.json({
    links,
    contacts: ruContact
      ? { address: ruContact.address, phone: ruContact.phone, email: ruContact.email }
      : null,
  });
}
