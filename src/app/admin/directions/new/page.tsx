import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DirectionForm } from '../DirectionForm';
import { createDirection } from '../actions';

export default function NewDirectionPage() {
  return (
    <>
      <AdminPageHeader title="Новое направление" />
      <DirectionForm action={createDirection} submitLabel="Создать" />
    </>
  );
}
