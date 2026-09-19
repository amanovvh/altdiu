import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { TeacherForm } from '../TeacherForm';
import { createTeacher } from '../actions';

export default function NewTeacherPage() {
  return (
    <>
      <AdminPageHeader title="Новый преподаватель" description="Заполните минимум на одном языке" />
      <TeacherForm action={createTeacher} submitLabel="Сохранить" />
    </>
  );
}
