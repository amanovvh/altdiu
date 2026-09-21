import { getTranslations, getMessages } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import { notFound } from 'next/navigation';
import { ArrowRight, GraduationCap, Sparkles, MapPin } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { NewsCard } from '@/components/ui/NewsCard';
import { NewsCarousel } from '@/components/ui/NewsCarousel';
import { TeacherCard } from '@/components/ui/TeacherCard';
import { DirectionCard } from '@/components/ui/DirectionCard';
import { AchievementCard } from '@/components/ui/AchievementCard';
import { Placeholder } from '@/components/ui/Placeholder';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { getNewsList, getHomepageNews } from '@/services/news.service';
import { getTeachers } from '@/services/teacher.service';
import { getDirections } from '@/services/direction.service';
import { getAchievements } from '@/services/achievement.service';
import { getSiteSettings } from '@/services/site-settings.service';
import { getWhyChooseUsCards } from '@/services/why-choose-us.service';
import { getPartners } from '@/services/partner.service';
import { getAboutHeroImage, getAboutSectionPreview } from '@/services/about-media.service';
import { truncate } from '@/lib/utils/text';
import { WhyChooseUsSection } from '@/components/home/WhyChooseUsSection';
import { PartnersSection } from '@/components/home/PartnersSection';
import { AboutHeroImage } from '@/components/home/AboutHeroImage';
import { isValidLocale, type Locale } from '@/lib/i18n/config';
import { buildCloudinaryUrl } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const typedLocale = locale as Locale;

  const [tHome, tCommon, tHero, tNav, tDirections, tTeachers, tAbout, tContacts] = await Promise.all([
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'hero' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'directions' }),
    getTranslations({ locale, namespace: 'teachers' }),
    getTranslations({ locale, namespace: 'about' }),
    getTranslations({ locale, namespace: 'contacts' }),
  ]);

  const [homepageNews, teachers, directions, achievements, settings, whyUs, partners, aboutHero, aboutPreview] = await Promise.all([
    getHomepageNews(typedLocale, 5),
    getTeachers(typedLocale, { category: undefined }),
    getDirections(typedLocale),
    getAchievements(typedLocale, { limit: 6 }),
    getSiteSettings(),
    getWhyChooseUsCards(typedLocale),
    getPartners(typedLocale),
    getAboutHeroImage(typedLocale),
    getAboutSectionPreview(typedLocale),
  ]);

  // Combine latest + recent for the homepage carousel.
  const news = homepageNews.latest
    ? [homepageNews.latest, ...homepageNews.recent].slice(0, 5)
    : homepageNews.recent.slice(0, 5);

  const stats = settings.heroStats;

  // Hero background is sourced from the DB ("about.hero_image" SiteContent row,
  // editable via /admin/about) so the photo comes from Vercel Blob and isn't
  // tied to the public/ directory — which Vercel aggressively caches between
  // deploys. Falls back to a CSS gradient when no image has been uploaded yet.
  const heroBgUrl = aboutHero?.src ? buildCloudinaryUrl(aboutHero.src) : null;

  return (
    <>
      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden text-white">
        {/* Background photo + overlay */}
        <div className="pointer-events-none absolute inset-0">
          {heroBgUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${heroBgUrl})` }}
              aria-hidden
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800"
              aria-hidden
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary-900/85 via-primary-800/75 to-primary-900/85"
            aria-hidden
          />
          <div className="absolute inset-0 bg-hero-pattern opacity-50" aria-hidden />
          <div
            className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl"
            aria-hidden
          />
          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full opacity-[0.04]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="heroGrid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M48 0 L0 0 L0 48" stroke="white" strokeWidth="0.5" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heroGrid)" />
          </svg>
        </div>

        <div className="container-wide relative grid items-center gap-10 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
          <div className="lg:col-span-7 xl:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent-300 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {tHero('badge')}
            </span>
            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
              {tHero('title')}
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base text-ink-200 md:text-lg lg:text-xl">
              {tHero('subtitle')}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/about"
                className="btn-accent group"
              >
                {tHero('secondaryCta')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Stats */}
            <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:max-w-2xl">
              {[
                { value: stats.years, label: tHero('stats.years') },
                { value: stats.students, label: tHero('stats.students') },
                { value: stats.teachers, label: tHero('stats.teachers') },
                { value: stats.graduates, label: tHero('stats.graduates') },
              ].map((s) => (
                <div key={s.label} className="border-l border-accent-400/40 pl-4">
                  <dt className="text-3xl font-bold text-accent-400 md:text-4xl">
                    <AnimatedCounter value={s.value} locale={locale} />
                  </dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-ink-300">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Decorative card on the right */}
          <div className="hidden lg:col-span-5 lg:block xl:col-span-5">
            <div className="relative">
              <div className="absolute inset-0 -rotate-2 rounded-3xl bg-accent-500/20 blur-2xl" />
              <div className="relative rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/20 text-accent-300">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-accent-300">
                      {tNav('about')}
                    </p>
                    <p className="font-display text-lg font-bold">{tDirections('pageTitle')}</p>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {directions.slice(0, 2).map((d, i) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-accent-400">
                          0{i + 1}
                        </span>
                        <span className="font-medium">{d.title}</span>
                      </div>
                      <Link
                        href={`/directions/${d.slug}` as any}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-500 text-primary-900 transition hover:bg-accent-400"
                        aria-label={d.title}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-2 text-xs text-ink-300">
                  <MapPin className="h-4 w-4 text-accent-400" />
                  {tContacts('pageTitle')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== LATEST NEWS ============== */}
      <section className="section bg-surface-alt relative">
        <div className="container-wide">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow={tCommon('publishedOn')}
              title={tHome('latestNews')}
              subtitle={tHome('latestNewsSubtitle')}
              align="left"
            />
            <Link href="/news" className="link-underline">
              {tCommon('allNews')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {news.length > 0 ? (
            <NewsCarousel news={news} />
          ) : (
            <Placeholder text={tCommon('noData')} />
          )}
        </div>
      </section>

      {/* ============== WHY CHOOSE US ============== */}
      <WhyChooseUsSection cards={whyUs} variant="homepage" />

      {/* ============== DIRECTIONS ============== */}
      <section className="section">
        <div className="container-wide">
          <SectionHeader
            eyebrow={tNav('directions')}
            title={tHome('directionsTitle')}
            subtitle={tHome('directionsSubtitle')}
            className="mb-12"
          />

          {directions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {directions.map((d) => {
                const tagline =
                  d.slug === 'economics'
                    ? tDirections('economics.tagline')
                    : d.slug === 'languages'
                      ? tDirections('languages.tagline')
                      : undefined;
                return (
                  <DirectionCard
                    key={d.id}
                    direction={d}
                    tagline={tagline}
                  />
                );
              })}
            </div>
          ) : (
            <Placeholder text={tAbout('placeholder')} />
          )}
        </div>
      </section>

      {/* ============== ABOUT (brief) ============== */}
      <section className="section bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl"
        />

        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
              {tNav('about')}
            </span>
            <h2 className="mt-3 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              {tHome('aboutTitle')}
            </h2>
            <p className="mt-4 text-pretty text-ink-200 md:text-lg">
              {tHome('aboutSubtitle')}
            </p>
          </div>

          {/* Two-column: photo + real content preview */}
          <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
            {/* Photo */}
            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              {aboutHero?.src ? (
                <AboutHeroImage
                  src={aboutHero.src}
                  alt={aboutHero.caption ?? tNav('about')}
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <div className="text-center text-ink-300">
                    <p className="text-sm">Фото «О лицее»</p>
                    <p className="mt-1 text-xs">
                      Загрузите в&nbsp;
                      <a
                        href="/admin/about"
                        className="text-accent-400 underline decoration-dotted underline-offset-2 hover:text-accent-300"
                      >
                        админке
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Real content from SiteContent */}
            <div>
              {aboutPreview ? (
                <article>
                  <h3 className="font-display text-2xl font-bold text-white md:text-3xl">
                    {aboutPreview.title}
                  </h3>
                  <p className="mt-4 text-pretty text-base leading-relaxed text-ink-200 md:text-lg">
                    {truncate(aboutPreview.preview, 380)}
                  </p>
                </article>
              ) : (
                <p className="text-pretty text-base text-ink-300 md:text-lg">
                  {tAbout('placeholder')}
                </p>
              )}

              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent-400 hover:text-accent-300"
              >
                {tCommon('learnMore')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============== ACHIEVEMENTS ============== */}
      <section className="section bg-surface-alt">
        <div className="container-wide">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow={tNav('achievements')}
              title={tHome('achievementsTitle')}
              subtitle={tHome('achievementsSubtitle')}
              align="left"
            />
            <Link href="/achievements" className="link-underline">
              {tCommon('allAchievements')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {achievements.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((a) => (
                <AchievementCard
                  key={a.id}
                  achievement={a}
                  locale={typedLocale}
                />
              ))}
            </div>
          ) : (
            <Placeholder text={tCommon('noData')} />
          )}
        </div>
      </section>

      {/* ============== TEACHERS ============== */}
      <section className="section">
        <div className="container-wide">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow={tNav('teachers')}
              title={tHome('teachersTitle')}
              subtitle={tHome('teachersSubtitle')}
              align="left"
            />
            <Link href="/teachers" className="link-underline">
              {tCommon('viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {teachers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {teachers.slice(0, 4).map((t) => (
                <TeacherCard key={t.id} teacher={t} />
              ))}
            </div>
          ) : (
            <Placeholder text={tTeachers('placeholder')} />
          )}
        </div>
      </section>

      {/* ============== PARTNERS (Сотрудничетсво) ============== */}
      <PartnersSection partners={partners} variant="homepage" />

      {/* ============== CONTACTS CTA ============== */}
      <section className="section">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-10 text-white md:p-14 lg:p-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-primary-500/30 blur-3xl"
            />
            <div className="relative max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
                {tNav('contacts')}
              </span>
              <h2 className="mt-3 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                {tHome('contactsTitle')}
              </h2>
              <p className="mt-4 text-pretty text-ink-200 md:text-lg">
                {tHome('contactsSubtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contacts" className="btn-accent group">
                  {tCommon('contactUs')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


