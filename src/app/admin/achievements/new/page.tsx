import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AchievementForm } from '../AchievementForm';
import { createAchievement } from '../actions';

export default function NewAchievementPage() {
  return (
    <>
      <AdminPageHeader title="Новое достижение" />
      <AchievementForm action={createAchievement} submitLabel="Сохранить" />
    </>
  );
}
