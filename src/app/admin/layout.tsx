import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getCurrentAdmin } from '@/server/auth';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata = {
  title: 'Панель администратора',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the pathname that middleware injected
  const pathname = headers().get('x-pathname') ?? '';

  // /admin/login is public — render children without auth check or shell
  if (pathname.startsWith('/admin/login')) {
    return <>{children}</>;
  }

  // Everything else under /admin requires auth
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <AdminShell admin={{ id: admin.id, email: admin.email, name: admin.name, role: admin.role }}>
      {children}
    </AdminShell>
  );
}
