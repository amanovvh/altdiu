/**
 * Seed script — populates the database with default content and creates
 * the initial admin user.
 *
 *   npm run db:seed
 *
 * Required environment variables:
 *   ADMIN_DEFAULT_EMAIL    e.g. admin@lyceum.uz
 *   ADMIN_DEFAULT_PASSWORD e.g. (use a strong one — change after first login!)
 *   ADMIN_DEFAULT_NAME     e.g. "Site Administrator"
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  /* ===== Hero stats default ===== */
  await prisma.siteSetting.upsert({
    where: { key: 'hero.stats' },
    create: {
      key: 'hero.stats',
      value: {
        years: 10,
        students: 600,
        teachers: 40,
        graduates: 1200,
      },
    },
    update: {},
  });
  console.log('  ✓ hero.stats');

  /* ===== Initial admin user ===== */
  const email = (process.env.ADMIN_DEFAULT_EMAIL ?? 'admin@lyceum.uz')
    .toLowerCase()
    .trim();
  const password = process.env.ADMIN_DEFAULT_PASSWORD ?? 'admin123';
  const name = process.env.ADMIN_DEFAULT_NAME ?? 'Site Administrator';

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      name,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    update: {
      passwordHash,
      name,
      isActive: true,
    },
  });
  console.log(`  ✓ admin user: ${email}`);

  /* ===== Directions ===== */
  const directions = [
    {
      slug: 'economics',
      icon: 'trending-up',
      color: '#0e2046',
      order: 1,
      subjects: ['Математика', 'Английский язык'],
      translations: [
        {
          locale: 'ru' as const,
          title: 'Экономика',
          shortTitle: 'Экономический профиль',
          description:
            '<p>Экономическое направление готовит будущих специалистов в сфере финансов, ' +
            'менеджмента и международного бизнеса.</p>' +
            '<p>Углублённое изучение математики и английского языка обеспечивает прочный фундамент ' +
            'для поступления на экономические и финансовые специальности ведущих университетов.</p>',
          highlights: [
            'Углублённая программа по математике',
            'Академический английский с уклоном в деловую коммуникацию',
            'Подготовка к международным экзаменам',
          ],
        },
        {
          locale: 'uz' as const,
          title: 'Iqtisodiyot',
          shortTitle: "Iqtisodiy yo'nalish",
          description:
            "<p>Iqtisodiy yo'nalishi moliya, menejment va xalqaro biznes sohasidagi " +
            'kelajak mutaxassislarini tayyorlaydi.</p>',
          highlights: [
            "Matematika bo'yicha chuqurlashtirilgan dastur",
            'Biznes kommunikatsiyaga yo\'naltirilgan akademik ingliz tili',
            'Xalqaro imtihonlarga tayyorlov',
          ],
        },
        {
          locale: 'en' as const,
          title: 'Economics',
          shortTitle: 'Economics track',
          description:
            '<p>The Economics track prepares future specialists in finance, management, ' +
            'and international business.</p>',
          highlights: [
            'Advanced mathematics curriculum',
            'Academic English with business communication focus',
            'International exam preparation',
          ],
        },
      ],
    },
    {
      slug: 'languages',
      icon: 'languages',
      color: '#c9a961',
      order: 2,
      subjects: ['Русский язык', 'Английский язык'],
      translations: [
        {
          locale: 'ru' as const,
          title: 'Иностранные языки',
          shortTitle: 'Языковой профиль',
          description:
            '<p>Языковое направление готовит будущих лингвистов, переводчиков и специалистов ' +
            'в сфере международных коммуникаций.</p>',
          highlights: [
            'Углублённая программа по русскому языку',
            'Академический английский на уровне носителя',
            'Лингвистический и культурологический компонент',
          ],
        },
        {
          locale: 'uz' as const,
          title: 'Xorijiy tillar',
          shortTitle: "Til yo'nalishi",
          description:
            '<p>Til yo\'nalishi kelajak lingvistlari, tarjimonlari va xalqaro kommunikatsiya ' +
            'mutaxassislarini tayyorlaydi.</p>',
          highlights: [
            "Rus tilini chuqur o'rganish",
            'Ona tili darajasida akademik ingliz tili',
            'Madaniyatshunoslik komponenti',
          ],
        },
        {
          locale: 'en' as const,
          title: 'Foreign Languages',
          shortTitle: 'Languages track',
          description:
            '<p>The Languages track prepares future linguists, translators, and international ' +
            'communication specialists.</p>',
          highlights: [
            'Advanced Russian curriculum',
            'Native-level academic English',
            'Linguistics and cultural studies component',
          ],
        },
      ],
    },
  ];

  for (const dir of directions) {
    const existing = await prisma.direction.findUnique({ where: { slug: dir.slug } });
    if (existing) {
      console.log(`  ↻ direction "${dir.slug}" already exists, updating translations...`);
      for (const tr of dir.translations) {
        await prisma.directionTranslation.upsert({
          where: { directionId_locale: { directionId: existing.id, locale: tr.locale } },
          create: { ...tr, directionId: existing.id },
          update: tr,
        });
      }
      continue;
    }
    await prisma.direction.create({
      data: {
        slug: dir.slug,
        icon: dir.icon,
        color: dir.color,
        order: dir.order,
        translations: { create: dir.translations },
        subjects: { create: dir.subjects.map((name, idx) => ({ name, order: idx })) },
      },
    });
    console.log(`  ✓ direction "${dir.slug}"`);
  }

  /* ===== Why choose us cards ===== */
  const WHY_US_CARDS = [
    {
      icon: 'GraduationCap',
      order: 1,
      translations: [
        {
          locale: 'ru' as const,
          title: 'Преподаватели мирового уровня',
          description: 'Наши педагоги — кандидаты наук и преподаватели ведущих вузов страны с международным опытом.',
        },
        {
          locale: 'uz' as const,
          title: "Jahon darajasidagi o'qituvchilar",
          description: "Pedagoglarimiz — mamlakatning yetakchi OTMlarining fan nomzodlari va xalqaro tajribaga ega o'qituvchilari.",
        },
        {
          locale: 'en' as const,
          title: 'World-class teachers',
          description: 'Our faculty includes PhDs and lecturers from the country\'s top universities with international experience.',
        },
      ],
    },
    {
      icon: 'Trophy',
      order: 2,
      translations: [
        {
          locale: 'ru' as const,
          title: 'Высокие результаты',
          description: 'Ежегодно наши ученики побеждают на республиканских и международных олимпиадах.',
        },
        {
          locale: 'uz' as const,
          title: 'Yuqori natijalar',
          description: "Har yili o'quvchilarimiz respublika va xalqaro olimpiadalarda g'olib bo'lishadi.",
        },
        {
          locale: 'en' as const,
          title: 'Outstanding results',
          description: 'Every year our students win national and international academic olympiads.',
        },
      ],
    },
    {
      icon: 'Globe',
      order: 3,
      translations: [
        {
          locale: 'ru' as const,
          title: 'Международные программы',
          description: 'Обмены, стажировки и партнёрские программы с ведущими университетами мира.',
        },
        {
          locale: 'uz' as const,
          title: 'Xalqaro dasturlar',
          description: "Jahon yetakchi universitetlari bilan almashinuv, amaliyot va hamkorlik dasturlari.",
        },
        {
          locale: 'en' as const,
          title: 'International programs',
          description: 'Exchanges, internships and partnerships with leading universities worldwide.',
        },
      ],
    },
    {
      icon: 'BookOpen',
      order: 4,
      translations: [
        {
          locale: 'ru' as const,
          title: 'Современная программа',
          description: 'Актуальные учебные планы с фокусом на практические навыки и критическое мышление.',
        },
        {
          locale: 'uz' as const,
          title: 'Zamonaviy dastur',
          description: "Amaliy ko'nikmalar va tanqidiy fikrlashga e'tibor qaratilgan dolzarb o'quv rejalari.",
        },
        {
          locale: 'en' as const,
          title: 'Modern curriculum',
          description: 'Up-to-date study plans focused on practical skills and critical thinking.',
        },
      ],
    },
    {
      icon: 'Users',
      order: 5,
      translations: [
        {
          locale: 'ru' as const,
          title: 'Камерная атмосфера',
          description: 'Небольшие группы позволяют уделить внимание каждому ученику.',
        },
        {
          locale: 'uz' as const,
          title: 'Yaxshi muhit',
          description: "Kichik guruhlar har bir o'quvchiga e'tibor berish imkonini beradi.",
        },
        {
          locale: 'en' as const,
          title: 'Small class sizes',
          description: 'Small groups allow personalized attention for every student.',
        },
      ],
    },
    {
      icon: 'Award',
      order: 6,
      translations: [
        {
          locale: 'ru' as const,
          title: 'Престижные выпускники',
          description: 'Наши выпускники поступают в ведущие вузы Узбекистана и зарубежья.',
        },
        {
          locale: 'uz' as const,
          title: 'Nufuzli bitiruvchilar',
          description: "Bitiruvchilarimiz O'zbekiston va xorijiy yetakchi OTMlariga kirishadi.",
        },
        {
          locale: 'en' as const,
          title: 'Prestigious graduates',
          description: 'Our graduates enter leading universities in Uzbekistan and abroad.',
        },
      ],
    },
  ];

  for (const card of WHY_US_CARDS) {
    const existing = await prisma.whyChooseUsCard.findFirst({ where: { order: card.order } });
    if (existing) {
      console.log(`  ↻ why-us card #${card.order} already exists`);
      continue;
    }
    await prisma.whyChooseUsCard.create({
      data: {
        icon: card.icon,
        order: card.order,
        translations: { create: card.translations },
      },
    });
  }
  console.log(`  ✓ ${WHY_US_CARDS.length} why-us cards`);

  /* ===== Partners (Сотрудничетсво) ===== */
  const PARTNERS = [
    {
      logo: null,
      websiteUrl: 'https://tsue.uz',
      category: 'Университет',
      order: 1,
      translations: [
        { locale: 'ru' as const, name: 'Ташкентский государственный экономический университет', description: 'Головной вуз' },
        { locale: 'uz' as const, name: 'Toshkent davlat iqtisodiyot universiteti', description: 'Bosh universitet' },
        { locale: 'en' as const, name: 'Tashkent State University of Economics', description: 'Parent university' },
      ],
    },
    {
      logo: null,
      websiteUrl: 'https://example.com',
      category: 'Партнёр',
      order: 2,
      translations: [
        { locale: 'ru' as const, name: 'Международный образовательный фонд', description: 'Партнёр по обменам' },
        { locale: 'uz' as const, name: 'Xalqaro ta\'lim fondi', description: 'Almashinuv bo\'yicha hamkor' },
        { locale: 'en' as const, name: 'International Education Foundation', description: 'Exchange partner' },
      ],
    },
    {
      logo: null,
      websiteUrl: 'https://example.com',
      category: 'Партнёр',
      order: 3,
      translations: [
        { locale: 'ru' as const, name: 'Ассоциация выпускников', description: 'Сообщество выпускников лицея' },
        { locale: 'uz' as const, name: 'Bitiruvchilar assotsiatsiyasi', description: 'Litsey bitiruvchilari jamiyati' },
        { locale: 'en' as const, name: 'Alumni Association', description: 'Lyceum alumni community' },
      ],
    },
  ];

  for (const partner of PARTNERS) {
    const existing = await prisma.partner.findFirst({ where: { order: partner.order } });
    if (existing) {
      console.log(`  ↻ partner #${partner.order} already exists`);
      continue;
    }
    await prisma.partner.create({
      data: {
        logo: partner.logo,
        websiteUrl: partner.websiteUrl,
        category: partner.category,
        order: partner.order,
        translations: { create: partner.translations },
      },
    });
  }
  console.log(`  ✓ ${PARTNERS.length} partners`);

  /* ===== Empty contact placeholders ===== */
  for (const locale of ['ru', 'uz', 'en'] as const) {
    await prisma.contactInfo.upsert({
      where: { locale },
      create: {
        locale,
        address: '[Адрес будет добавлен]',
        phone: '[Телефон будет добавлен]',
        email: '[Email будет добавлен]',
        schedule: 'Пн — Пт: 09:00 — 18:00',
      },
      update: {},
    });
  }
  console.log('  ✓ contact placeholders for ru/uz/en');

  console.log('\n✅ Seed complete.');
  console.log(`\n🔐 Admin login: ${email}`);
  console.log(`   Password: ${password}`);
  console.log('   ⚠️  Change the password after first login!');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
