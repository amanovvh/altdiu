import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminPersonForm } from '../AdminForm';
import { createAdministrator } from '../actions';

export default function NewAdminPersonPage() {
  return (
    <>
      <AdminPageHeader title="Новый член администрации" />
      <AdminPersonForm action={createAdministrator} submitLabel="Сохранить" />
    </>
  );
}
