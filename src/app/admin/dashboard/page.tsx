import { prisma } from '@/lib/db/prisma';
import { getCurrentAdmin } from '@/server/auth';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import {
  Newspaper,
  Users,
  Trophy,
  Building2,
  BookOpen,
  Clock,
  Globe,
  Sparkles,
  Handshake,
} from 'lucide-react';
import Link from 'next/link';
import { formatRelative } from '@/lib/utils/dates';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const admin = await getCurrentAdmin();

  const [
    newsTotal,
    newsDraft,
    teachersTotal,
    adminsTotal,
    achievementsTotal,
    directionsTotal,
    recentActions,
  ] = await Promise.all([
    prisma.news.count(),
    prisma.news.count({ where: { status: 'DRAFT' } }),
    prisma.teacher.count(),
    prisma.administrator.count(),
    prisma.achievement.count(),
    prisma.direction.count(),
    prisma.adminAction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { admin: { select: { email: true, name: true } } },
    }),
  ]);

  return (
    <>
      <AdminPageHeader
        title={`Добро пожаловать, ${admin?.name ?? admin?.email ?? 'администратор'}`}
        description="Сводка по содержимому сайта"
      />

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Новости"
          value={newsTotal}
          icon={Newspaper}
          accent="primary"
          hint={`${newsDraft} черновик${newsDraft === 1 ? '' : 'ов'}`}
        />
        <AdminStatCard
          label="Преподаватели"
          value={teachersTotal}
          icon={Users}
          accent="primary"
        />
        <AdminStatCard
          label="Достижения"
          value={achievementsTotal}
          icon={Trophy}
          accent="accent"
        />
        <AdminStatCard
          label="Администрация"
          value={adminsTotal}
          icon={Building2}
          accent="success"
        />
        <AdminStatCard
          label="Направления"
          value={directionsTotal}
          icon={BookOpen}
          accent="success"
        />
        <AdminStatCard
          label="Переводы"
          value={3}
          icon={Globe}
          accent="primary"
          hint="ru · uz · en"
        />
        <AdminStatCard
          label="Действия в логе"
          value={recentActions.length}
          icon={Clock}
          accent="warning"
          hint="Последние 10"
        />
      </div>

      {/* Quick links + recent activity */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-bold text-primary-800">
            Быстрые действия
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { href: '/admin/news/new', label: 'Опубликовать новость', icon: Newspaper },
              { href: '/admin/teachers/new', label: 'Добавить преподавателя', icon: Users },
              { href: '/admin/achievements/new', label: 'Новое достижение', icon: Trophy },
              { href: '/admin/why-us/new', label: 'Преимущество лицея', icon: Sparkles },
              { href: '/admin/partners/new', label: 'Добавить партнёра', icon: Handshake },
              { href: '/admin/contacts', label: 'Обновить контакты', icon: Building2 },
              { href: '/admin/about', label: 'Редактировать «О лицее»', icon: BookOpen },
            ].map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="group flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-4 transition hover:border-accent-300 hover:bg-accent-50/50"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700 group-hover:bg-accent-100 group-hover:text-accent-700">
                  <q.icon className="h-5 w-5" />
                </span>
                <span className="font-medium text-primary-800">{q.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-primary-800">
            Последние действия
          </h2>
          {recentActions.length === 0 ? (
            <p className="text-sm text-ink-500">Пока нет записей.</p>
          ) : (
            <ul className="space-y-3">
              {recentActions.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 border-b border-ink-100 pb-3 last:border-0 last:pb-0"
                >
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-primary-800">
                      {a.admin.name ?? a.admin.email}
                    </p>
                    <p className="truncate text-xs text-ink-500">{a.action}</p>
                    <p className="text-xs text-ink-400">
                      {formatRelative(a.createdAt, 'ru')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}