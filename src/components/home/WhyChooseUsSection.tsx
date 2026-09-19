import {
  Sparkles,
  Trophy,
  Users,
  GraduationCap,
  Globe,
  BookOpen,
  Target,
  Heart,
  Award,
  Lightbulb,
  Compass,
  ShieldCheck,
  Clock,
  Briefcase,
  Languages,
  TrendingUp,
  Calculator,
  Library,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Link } from '@/lib/i18n/routing';
import type { WhyChooseUsCardItem } from '@/services/why-choose-us.service';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import type { Locale } from '@/lib/i18n/config';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, Trophy, Users, GraduationCap, Globe, BookOpen,
  Target, Heart, Award, Lightbulb, Compass, ShieldCheck,
  Clock, Briefcase, Languages, TrendingUp, Calculator, Library,
};

interface Props {
  cards: WhyChooseUsCardItem[];
  variant?: 'homepage' | 'full';
  className?: string;
}

export function WhyChooseUsSection({ cards, variant = 'homepage', className }: Props) {
  const t = useTranslations('home');
  const locale = useLocale() as Locale;

  const limited = variant === 'homepage' ? cards.slice(0, 6) : cards;

  if (cards.length === 0) return null;

  return (
    <section className={cn(variant === 'homepage' ? 'section bg-white' : 'section bg-surface-alt', className)}>
      <div className="container-wide">
        <SectionHeader
          eyebrow={t('whyUsSubtitle')}
          title={t('whyUsTitle')}
          align="center"
          className="mb-12"
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {limited.map((card) => {
            const tr = card.translations.find((t) => t.locale === locale) || card.translations[0];
            if (!tr) return null;
            const Icon = (card.icon && ICONS[card.icon]) || Sparkles;
            return (
              <article
                key={card.id}
                className="group flex flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 text-primary-800 transition-colors group-hover:from-primary-800 group-hover:to-primary-700 group-hover:text-accent-400">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-primary-800">
                  {tr.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  {tr.description}
                </p>
              </article>
            );
          })}
        </div>

        {variant === 'homepage' && cards.length > 6 && (
          <div className="mt-10 text-center">
            <Link href="/why-us" className="btn-outline">
              {t('whyUsViewAll')}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
