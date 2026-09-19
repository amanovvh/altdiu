import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { NewsForm } from '../NewsForm';
import { updateNews } from '../actions';
import { DeleteNewsButton } from './DeleteButton';

export const dynamic = 'force-dynamic';

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await prisma.news.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!news) notFound();

  const initial = {
    status: news.status,
    isPinned: news.isPinned,
    category: news.category,
    coverImage: news.coverImage,
    images: news.images,
    publishedAt: news.publishedAt
      ? new Date(news.publishedAt).toISOString().slice(0, 16)
      : null,
    translations: news.translations.map((t) => ({
      locale: t.locale as 'ru' | 'uz' | 'en',
      title: t.title,
      excerpt: t.excerpt ?? '',
      body: t.body,
    })),
  };

  const action = updateNews.bind(null, id);

  return (
    <>
      <AdminPageHeader
        title="Редактирование новости"
        description={`Slug: ${news.slug}`}
        action={<DeleteNewsButton id={id} />}
      />
      <NewsForm action={action} initial={initial} submitLabel="Сохранить изменения" />
    </>
  );
}
