import { notFound } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getPartnershipEvent } from '@/services/partnership-event.service';
import { PartnershipEventForm } from '../PartnershipEventForm';
import { updatePartnershipEventAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditPartnershipEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getPartnershipEvent(id);
  if (!event) notFound();

  // Server action wrapper — bind the id.
  const action = async (formData: FormData) => {
    'use server';
    await updatePartnershipEventAction(id, formData);
  };

  return (
    <>
      <AdminPageHeader title="Редактировать мероприятие" description={event.title} />
      <div className="max-w-3xl rounded-2xl border border-ink-100 bg-white p-6 shadow-soft md:p-8">
        <PartnershipEventForm
          id={event.id}
          initial={{
            title: event.title,
            description: event.description,
            category: event.category,
            location: event.location,
            coverImage: event.coverImage,
            photos: event.photos,
            date: event.date.toISOString().slice(0, 10),
            order: event.order,
            isActive: event.isActive,
          }}
          action={action}
        />
      </div>
    </>
  );
}