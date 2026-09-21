import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { PartnerDocumentForm } from '../PartnerDocumentForm';
import { createPartnerDocumentAction } from '../actions';

export const dynamic = 'force-dynamic';

export default function NewPartnerDocumentPage() {
  return (
    <>
      <AdminPageHeader
        title="Новый документ"
        description="Загрузите PDF с договором или соглашением о сотрудничестве."
      />
      <div className="max-w-2xl rounded-2xl border border-ink-100 bg-white p-6 shadow-soft md:p-8">
        <PartnerDocumentForm action={createPartnerDocumentAction} />
      </div>
    </>
  );
}