'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Building2,
  Trophy,
  BookOpen,
  Phone,
  Info,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Handshake,
  FileText,
  Calendar,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { logoutAction } from '@/app/admin/login/actions';
import { cn } from '@/lib/utils/cn';

interface AdminProps {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: 'Главное',
    items: [
      { href: '/admin/dashboard', label: 'Дашборд', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Контент',
    items: [
      { href: '/admin/news', label: 'Новости', icon: Newspaper },
      { href: '/admin/teachers', label: 'Преподаватели', icon: Users },
      { href: '/admin/administration', label: 'Администрация', icon: Building2 },
      { href: '/admin/directions', label: 'Направления', icon: BookOpen },
      { href: '/admin/achievements', label: 'Достижения', icon: Trophy },
      { href: '/admin/why-us', label: 'Почему мы', icon: Sparkles },
      { href: '/admin/partners', label: 'Сотрудничество', icon: Handshake },
      { href: '/admin/partners-documents', label: 'Документы', icon: FileText },
      { href: '/admin/partnership-events', label: 'Мероприятия', icon: Calendar },
    ],
  },
  {
    section: 'Сайт',
    items: [
      { href: '/admin/contacts', label: 'Контакты', icon: Phone },
      { href: '/admin/about', label: 'О лицее', icon: Info },
    ],
  },
  {
    section: 'Система',
    items: [
      { href: '/admin/users', label: 'Пользователи', icon: Users },
      { href: '/admin/settings', label: 'Настройки', icon: Settings },
    ],
  },
];

export function AdminShell({
  admin,
  children,
}: {
  admin: AdminProps;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-surface-alt">
      {/* Mobile backdrop */}
      {open && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-primary-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Base styles (apply on all sizes)
          'z-50 flex w-72 shrink-0 flex-col border-r border-ink-100 bg-white',
          // Mobile: fixed slide-in/out
          'fixed inset-y-0 left-0 transition-transform duration-300 ease-out-soft',
          open ? 'translate-x-0' : '-translate-x-full',
          // Desktop: in normal flow, always at x=0
          'lg:relative lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-ink-100 px-5">
          <Logo />
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-ink-500 hover:bg-ink-50 lg:hidden"
            aria-label="Закрыть меню"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((group) => (
            <div key={group.section} className="mb-5">
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
                {group.section}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary-800 text-white shadow-soft'
                            : 'text-ink-700 hover:bg-primary-50 hover:text-primary-800'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            active ? 'text-accent-400' : 'text-ink-500'
                          )}
                        />
                        <span>{item.label}</span>
                        {active && (
                          <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-70" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="mt-6 rounded-xl border border-ink-100 bg-gradient-soft p-4 text-xs text-ink-600">
            <p className="font-semibold text-primary-800">Совет</p>
            <p className="mt-1 leading-relaxed">
              Контент на сайте появляется сразу после сохранения — просто обновите страницу.
            </p>
            <a
              href="/ru"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-primary-700 hover:text-accent-700"
            >
              Открыть сайт <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </nav>

        <div className="border-t border-ink-100 px-3 py-3">
          <UserBlock admin={admin} />
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 text-ink-600 hover:bg-ink-50 lg:hidden"
              aria-label="Открыть меню"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Breadcrumbs pathname={pathname} />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-ink-500 sm:inline">
              {admin.email}
            </span>
            <span className="hidden rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-800 sm:inline">
              {admin.role}
            </span>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function UserBlock({ admin }: { admin: AdminProps }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
          {(admin.name?.[0] ?? admin.email[0]).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-primary-800">
            {admin.name ?? admin.email}
          </p>
          <p className="truncate text-xs text-ink-500">{admin.email}</p>
        </div>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </form>
    </div>
  );
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return null;
  return (
    <nav className="hidden text-sm text-ink-500 sm:flex" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5">
        {segments.map((seg, i) => {
          const href = '/' + segments.slice(0, i + 1).join('/');
          const isLast = i === segments.length - 1;
          return (
            <li key={href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
              <span className={isLast ? 'font-medium text-primary-800' : ''}>
                {labelize(seg)}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function labelize(s: string): string {
  if (s === 'admin') return 'Дашборд';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
