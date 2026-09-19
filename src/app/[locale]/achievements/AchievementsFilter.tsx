'use client';

import { useRouter, usePathname } from '@/lib/i18n/routing';
import { CategoryTabs } from '@/components/ui/CategoryTabs';

interface Tab {
  value: string;
  label: string;
  count: number;
}

interface Props {
  tabs: Tab[];
  active: string;
}

export function AchievementsFilter({ tabs, active }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (value: string) => {
    if (value === 'ALL') {
      router.push(pathname as any);
    } else {
      router.push(`${pathname}?category=${value.toLowerCase()}` as any);
    }
  };

  return <CategoryTabs tabs={tabs} active={active} onChange={handleChange} />;
}
