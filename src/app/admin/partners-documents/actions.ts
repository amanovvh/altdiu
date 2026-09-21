'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createPartnerDocument,
  updatePartnerDocument,
  deletePartnerDocument,
} from '@/services/partner-document.service';

export async function createPartnerDocumentAction(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const description = (formData.get('description') as string | null)?.trim() || null;
  const fileUrl = String(formData.get('fileUrl') ?? '').trim();
  const fileSizeRaw = formData.get('fileSize');
  const fileSize = fileSizeRaw ? Number(fileSizeRaw) : null;
  const dateRaw = String(formData.get('date') ?? '').trim();
  const date = dateRaw ? new Date(dateRaw) : new Date();
  const order = Number(formData.get('order') ?? 0);
  const isActive = formData.get('isActive') === 'on';

  if (!title || !fileUrl) {
    throw new Error('Заполните название и загрузите файл');
  }

  await createPartnerDocument({
    title,
    description,
    fileUrl,
    fileSize,
    date,
    order,
    isActive,
  });

  revalidatePath('/admin/partners-documents');
  revalidatePath('/community');
  redirect('/admin/partners-documents');
}

export async function updatePartnerDocumentAction(id: string, formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const description = (formData.get('description') as string | null)?.trim() || null;
  const fileUrl = String(formData.get('fileUrl') ?? '').trim();
  const fileSizeRaw = formData.get('fileSize');
  const fileSize = fileSizeRaw ? Number(fileSizeRaw) : null;
  const dateRaw = String(formData.get('date') ?? '').trim();
  const date = dateRaw ? new Date(dateRaw) : new Date();
  const order = Number(formData.get('order') ?? 0);
  const isActive = formData.get('isActive') === 'on';

  if (!title || !fileUrl) {
    throw new Error('Заполните название и файл');
  }

  await updatePartnerDocument(id, {
    title,
    description,
    fileUrl,
    fileSize,
    date,
    order,
    isActive,
  });

  revalidatePath('/admin/partners-documents');
  revalidatePath(`/admin/partners-documents/${id}`);
  revalidatePath('/community');
  redirect('/admin/partners-documents');
}

export async function deletePartnerDocumentAction(id: string) {
  await deletePartnerDocument(id);
  revalidatePath('/admin/partners-documents');
  revalidatePath('/community');
}