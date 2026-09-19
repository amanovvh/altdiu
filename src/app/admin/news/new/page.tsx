import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { NewsForm } from '../NewsForm';
import { createNews } from '../actions';

export default function NewNewsPage() {
  return (
    <>
      <AdminPageHeader
        title="Новая новость"
        description="Заполните контент минимум на одном языке"
      />
      <NewsForm action={createNews} submitLabel="Опубликовать / сохранить" />
    </>
  );
}
