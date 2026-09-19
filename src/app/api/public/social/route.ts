import { NextResponse } from 'next/server';
import { getSocialLinks, getContactInfo } from '@/services/contact.service';

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
