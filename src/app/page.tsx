import { redirect } from 'next/navigation';

// Root URL → /ru (default locale). The locale layout handles everything else.
export default function RootPage() {
  redirect('/ru');
}
