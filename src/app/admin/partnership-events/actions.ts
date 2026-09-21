'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { PartnershipEventCategory } from '@prisma/client';
import {
  createPartnershipEvent,
  updatePartnershipEvent,
  deletePartnershipEvent,
} from '@/services/partnership-event.service';

const VALID_CATEGORIES: PartnershipEventCategory[] = [
  'DEBATE', 'MEETING', 'FORUM', 'SIGNING', 'OTHER',
];

function parseCategory(v: FormDataEntryValue | null): PartnershipEventCategory {
  const s = String(v ?? '').toUpperCase();
  return (VALID_CATEGORIES as string[]).includes(s)
    ? (s as PartnershipEventCategory)
    : 'OTHER';
}

export async function createPartnershipEventAction(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const description = (formData.get('description') as string | null)?.trim() || null;
  const location = (formData.get('location') as string | null)?.trim() || null;
  const coverImage = (formData.get('coverImage') as string | null)?.trim() || null;
  const photosRaw = String(formData.get('photos') ?? '').trim();
  const photos = photosRaw
    ? photosRaw
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const dateRaw = String(formData.get('date') ?? '').trim();
  const date = dateRaw ? new Date(dateRaw) : new Date();
  const order = Number(formData.get('order') ?? 0);
  const isActive = formData.get('isActive') === 'on';
  const category = parseCategory(formData.get('category'));

  if (!title) {
    throw new Error('Заполните название');
  }

  await createPartnershipEvent({
    title,
    description,
    category,
    location,
    coverImage,
    photos,
    date,
    order,
    isActive,
  });

  revalidatePath('/admin/partnership-events');
  revalidatePath('/community');
  redirect('/admin/partnership-events');
}

export async function updatePartnershipEventAction(id: string, formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const description = (formData.get('description') as string | null)?.trim() || null;
  const location = (formData.get('location') as string | null)?.trim() || null;
  const coverImage = (formData.get('coverImage') as string | null)?.trim() || null;
  const photosRaw = String(formData.get('photos') ?? '').trim();
  const photos = photosRaw
    ? photosRaw
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const dateRaw = String(formData.get('date') ?? '').trim();
  const date = dateRaw ? new Date(dateRaw) : new Date();
  const order = Number(formData.get('order') ?? 0);
  const isActive = formData.get('isActive') === 'on';
  const category = parseCategory(formData.get('category'));

  if (!title) {
    throw new Error('Заполните название');
  }

  await updatePartnershipEvent(id, {
    title,
    description,
    category,
    location,
    coverImage,
    photos,
    date,
    order,
    isActive,
  });

  revalidatePath('/admin/partnership-events');
  revalidatePath(`/admin/partnership-events/${id}`);
  revalidatePath('/community');
  redirect('/admin/partnership-events');
}

export async function deletePartnershipEventAction(id: string) {
  await deletePartnershipEvent(id);
  revalidatePath('/admin/partnership-events');
  revalidatePath('/community');
}