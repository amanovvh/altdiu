import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { WhyUsForm } from '../WhyUsForm';
import { createWhyUsCard } from '../actions';

export default function NewWhyUsCardPage() {
  return (
    <>
      <AdminPageHeader title="Новая карточка преимущества" />
      <WhyUsForm action={createWhyUsCard} submitLabel="Сохранить" />
    </>
  );
}
