import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { PartnerForm } from '../PartnerForm';
import { createPartner } from '../actions';

export default function NewPartnerPage() {
  return (
    <>
      <AdminPageHeader title="Новый партнёр" />
      <PartnerForm action={createPartner} submitLabel="Сохранить" />
    </>
  );
}
