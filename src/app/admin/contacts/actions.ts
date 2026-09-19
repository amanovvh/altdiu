'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getCurrentAdmin, logAdminAction } from '@/server/auth';
import type { Locale, SocialPlatform } from '@prisma/client';

const ContactSchema = z.object({
  locale: z.enum(['ru', 'uz', 'en']),
  address: z.string().min(2),
  phone: z.string().min(3),
  email: z.string().email(),
  mapEmbed: z.string().optional(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  schedule: z.string().optional(),
  description: z.string().optional(),
});

const SocialSchema = z.object({
  platform: z.enum(['TELEGRAM', 'INSTAGRAM', 'FACEBOOK', 'YOUTUBE', 'TWITTER', 'LINKEDIN']),
  url: z.string().url(),
  isVisible: z.coerce.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

export interface FormState {
  error?: string;
  ok?: boolean;
}

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Unauthorized');
  return admin;
}

export async function saveContact(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = ContactSchema.safeParse({
    locale: formData.get('locale'),
    address: formData.get('address'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    mapEmbed: formData.get('mapEmbed') || undefined,
    latitude: formData.get('latitude') || null,
    longitude: formData.get('longitude') || null,
    schedule: formData.get('schedule') || undefined,
    description: formData.get('description') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };

  const { locale, ...rest } = parsed.data;
  await prisma.contactInfo.upsert({
    where: { locale },
    create: { locale, ...rest, latitude: rest.latitude ?? null, longitude: rest.longitude ?? null },
    update: rest,
  });
  await logAdminAction(admin.id, 'contacts.save', 'contacts', locale);
  revalidatePath('/admin/contacts');
  revalidatePath('/ru/contacts');
  revalidatePath('/uz/contacts');
  revalidatePath('/en/contacts');
  return { ok: true };
}

export async function saveSocialLink(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = SocialSchema.safeParse({
    platform: formData.get('platform'),
    url: formData.get('url'),
    isVisible: formData.get('isVisible') ?? true,
    order: formData.get('order') || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Ошибка' };

  await prisma.socialLink.upsert({
    where: { platform: parsed.data.platform as SocialPlatform },
    create: parsed.data,
    update: { url: parsed.data.url, isVisible: parsed.data.isVisible, order: parsed.data.order },
  });
  await logAdminAction(admin.id, 'social.save', 'social', parsed.data.platform);
  revalidatePath('/admin/contacts');
  revalidatePath('/ru/contacts');
  return { ok: true };
}

export async function deleteSocialLink(platform: string): Promise<void> {
  const admin = await requireAdmin();
  await prisma.socialLink.delete({ where: { platform: platform as SocialPlatform } });
  await logAdminAction(admin.id, 'social.delete', 'social', platform);
  revalidatePath('/admin/contacts');
}
