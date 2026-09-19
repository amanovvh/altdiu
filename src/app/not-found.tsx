import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-6 py-16">
      <div className="text-center">
        <p className="font-display text-9xl font-bold text-primary-800">404</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-primary-800 md:text-4xl">
          Страница не найдена
        </h1>
        <p className="mx-auto mt-3 max-w-md text-pretty text-ink-500">
          Запрашиваемая страница не существует или была удалена.
        </p>
        <Link href="/ru" className="btn-primary mt-8 inline-flex">
          <Home className="h-4 w-4" />
          На главную
        </Link>
      </div>
    </div>
  );
}
