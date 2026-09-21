import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { PartnershipEventForm } from '../PartnershipEventForm';
import { createPartnershipEventAction } from '../actions';

export const dynamic = 'force-dynamic';

export default function NewPartnershipEventPage() {
  return (
    <>
      <AdminPageHeader
        title="Новое мероприятие"
        description="Дебаты, встреча, форум — добавьте обложку и фотографии."
      />
      <div className="max-w-3xl rounded-2xl border border-ink-100 bg-white p-6 shadow-soft md:p-8">
        <PartnershipEventForm action={createPartnershipEventAction} />
      </div>
    </>
  );
}