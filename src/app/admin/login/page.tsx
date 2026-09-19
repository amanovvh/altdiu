import { Logo } from '@/components/layout/Logo';
import { LoginForm } from './LoginForm';

export const metadata = {
  title: 'Вход — International Finance Admin',
  robots: { index: false, follow: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold text-primary-800">
              Панель администратора
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Войдите для управления сайтом
            </p>
          </div>

          <LoginPageInner searchParams={searchParams} />
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          © Academic Lyceum «International Finance»
        </p>
      </div>
    </div>
  );
}

async function LoginPageInner({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return <LoginForm redirect={sp.redirect} configError={sp.error === 'config'} />;
}
