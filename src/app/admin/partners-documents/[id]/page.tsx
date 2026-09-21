import { notFound } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getPartnerDocument } from '@/services/partner-document.service';
import { PartnerDocumentForm } from '../PartnerDocumentForm';
import { updatePartnerDocumentAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditPartnerDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await getPartnerDocument(id);
  if (!doc) notFound();

  // Server action wrapper — bind the id.
  const action = async (formData: FormData) => {
    'use server';
    await updatePartnerDocumentAction(id, formData);
  };

  return (
    <>
      <AdminPageHeader
        title="Редактировать документ"
        description={doc.title}
      />
      <div className="max-w-2xl rounded-2xl border border-ink-100 bg-white p-6 shadow-soft md:p-8">
        <PartnerDocumentForm
          id={doc.id}
          initial={{
            title: doc.title,
            description: doc.description,
            fileUrl: doc.fileUrl,
            fileSize: doc.fileSize,
            date: doc.date.toISOString().slice(0, 10),
            order: doc.order,
            isActive: doc.isActive,
          }}
          action={action}
        />
      </div>
    </>
  );
}