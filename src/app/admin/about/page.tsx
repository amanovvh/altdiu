import { prisma } from '@/lib/db/prisma';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { SectionEditor } from './SectionEditor';
import { HeroImageEditor } from './HeroImageEditor';
import { ABOUT_HERO_KEY } from '@/services/about-media.service';
import type { Locale } from '@prisma/client';

export const dynamic = 'force-dynamic';

type LocaleCode = 'ru' | 'uz' | 'en';

const LOCALES: LocaleCode[] = ['ru', 'uz', 'en'];

interface SectionDef {
  key: string;
  label: string;
  iconKey: 'history' | 'general' | 'mission' | 'features' | 'advantages' | 'environment';
}

/**
 * Section order reflects the narrative flow of the public /about page:
 *  1. Hero photo (separate editor at top)
 *  2. History — who we are, where we come from
 *  3. General info — basic facts
 *  4. Mission — what we aim for
 *  5. Features — how learning is organised
 *  6. Advantages — what makes us stand out
 *  7. Environment — atmosphere, community, surroundings
 */
const SECTIONS: SectionDef[] = [
  { key: 'about.history',     label: 'История',            iconKey: 'history' },
  { key: 'about.general',     label: 'Общая информация',   iconKey: 'general' },
  { key: 'about.mission',     label: 'Миссия и задачи',    iconKey: 'mission' },
  { key: 'about.features',    label: 'Особенности обучения', iconKey: 'features' },
  { key: 'about.advantages',  label: 'Преимущества',       iconKey: 'advantages' },
  { key: 'about.environment', label: 'Образовательная среда', iconKey: 'environment' },
];

function emptyLocales(): Record<LocaleCode, { title: string; body: string }> {
  return {
    ru: { title: '', body: '' },
    uz: { title: '', body: '' },
    en: { title: '', body: '' },
  };
}

export default async function AboutAdminPage() {
  // Single round-trip: load all SiteContent rows we care about.
  const allBlocks = await prisma.siteContent.findMany({
    where: {
      key: { in: [ABOUT_HERO_KEY, ...SECTIONS.map((s) => s.key)] },
      locale: { in: LOCALES as unknown as Locale[] },
    },
  });

  // Index blocks by [key][locale].
  type SectionLocales = Record<LocaleCode, { title: string; body: string }>;
  const byKey: Record<string, SectionLocales> = {};
  for (const block of allBlocks) {
    if (block.key === ABOUT_HERO_KEY) continue;
    const loc = block.locale as LocaleCode;
    if (!byKey[block.key]) byKey[block.key] = emptyLocales();
    byKey[block.key][loc] = { title: block.title ?? '', body: block.body };
  }

  // Hero block is special — we store image in `data.image`, one row per locale.
  const heroImageByLocale: Record<LocaleCode, { image: string | null; caption: string }> = {
    ru: { image: null, caption: '' },
    uz: { image: null, caption: '' },
    en: { image: null, caption: '' },
  };
  for (const block of allBlocks) {
    if (block.key !== ABOUT_HERO_KEY) continue;
    const loc = block.locale as LocaleCode;
    const data = (block.data as Record<string, unknown> | null) ?? null;
    const img = typeof data?.image === 'string' ? data.image : null;
    heroImageByLocale[loc] = {
      image: img,
      caption: typeof data?.caption === 'string' ? data.caption : block.title ?? '',
    };
  }

  return (
    <>
      <AdminPageHeader
        title="О лицее"
        description="Все текстовые секции и главное фото для страницы /about и блока «О лицее» на главной"
      />

      {/* 1. Hero image — full-width card at the top */}
      <HeroImageEditor initial={heroImageByLocale} />

      {/* Quick hint */}
      <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
        💡 В каждой карточке секции — три колонки (ru · uz · en). Заполните нужные
        локали и нажмите «Сохранить секцию». Пустые поля не перезаписывают
        существующий контент — можно редактировать языки по одному.
      </div>

      {/* 2. All sections — flat, no tabs */}
      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const initial =
            byKey[section.key] ?? emptyLocales();
          return (
            <SectionEditor
              key={section.key}
              keyName={section.key}
              label={section.label}
              iconKey={section.iconKey}
              initial={initial}
            />
          );
        })}
      </div>
    </>
  );
}