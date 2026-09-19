import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { PasswordForm } from './PasswordForm';
import { StatsForm } from './StatsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const statsRecord = await prisma.siteSetting.findUnique({ where: { key: 'hero.stats' } });
  const stats = (statsRecord?.value as any) ?? {
    years: 10,
    students: 600,
    teachers: 40,
    graduates: 1200,
  };

  return (
    <>
      <AdminPageHeader title="Настройки" description="Профиль и параметры сайта" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-primary-800">
            Статистика на главной странице
          </h2>
          <StatsForm
            initial={{
              years: stats.years ?? 10,
              students: stats.students ?? 600,
              teachers: stats.teachers ?? 40,
              graduates: stats.graduates ?? 1200,
            }}
          />
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-primary-800">
            Сменить пароль
          </h2>
          <PasswordForm />
        </div>
      </div>
    </>
  );
}
