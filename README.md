# International Finance — Academic Lyceum Website

A production-ready full-stack website for the **Academic Lyceum under Tashkent State University of Economics «International Finance»** with a secure web Admin Panel.

🌐 **Live:** https://altdiu.vercel.app

---

## 👋 Для нового администратора сайта / преемника

**Если ты здесь, потому что предыдущий разработчик ушёл**, начни с этих документов (в таком порядке):

1. **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)** — как работать с админкой (новости, галерея, достижения) — **5 минут**
2. **[EMERGENCY.md](./EMERGENCY.md)** — что делать если сайт упал — прочитай заранее
3. **[DEPLOY.md](./DEPLOY.md)** — как развернуть с нуля или мигрировать
4. **[MAINTENANCE.md](./MAINTENANCE.md)** — ежегодное обслуживание (30 минут в год)

Если что-то непонятно — все 4 файла написаны для человека без опыта программирования.

---

## ✨ Технические детали (для разработчиков)

- **Frontend** — Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend** — Next.js API Routes + Server Actions + Prisma ORM
- **Database** — PostgreSQL (managed: Prisma Postgres)
- **Storage** — Vercel Blob (S3-compatible, 500 MB free)
- **Auth** — bcrypt password hashing + JWT session cookies (jose)
- **Admin Panel** — `/admin` route, protected by middleware, full CMS
- **Languages** — Russian / Uzbek / English with full SEO alternates
- **Performance** — Server Components, lazy loading, Vercel CDN
- **Security** — Server-side validation (zod), HMAC-signed sessions, role-based access

**Cost:** 0₽/мес on Vercel Hobby + Prisma Postgres Free + Vercel Blob Free tiers.

---

## 🧱 Project Structure

```
academic-lyceum-website/
├── ADMIN_GUIDE.md          # ← для контент-менеджера (новости, галерея)
├── DEPLOY.md               # ← как развернуть с нуля
├── EMERGENCY.md            # ← что делать если сайт упал
├── MAINTENANCE.md          # ← обслуживание раз в год
├── AGENTS.md               # ← для AI-агентов / новых разработчиков
├── BOTFATHER_SETUP.md      # ← настройка Telegram бота
├── prisma/
│   ├── schema.prisma       # Database schema (22 models, multilingual)
│   ├── seed.ts             # Seeds default content + first admin
│   └── migrations/
├── messages/
│   ├── ru.json             # Russian translations
│   ├── uz.json             # Uzbek translations
│   └── en.json             # English translations
├── public/
│   ├── logo.jpeg           # Official seal
│   ├── hero-lyceum-building.jpg  # Hero background photo
│   ├── favicon-32.png
│   ├── favicon-192.png
│   ├── favicon-512.png
│   └── og-image.png
├── scripts/
│   ├── backup.sh           # Cron-friendly PG backup (для VPS-деплоя)
│   ├── restore.sh          # Restore from backup
│   └── create-admin.ts     # CLI: создать/обновить админа
├── src/
│   ├── middleware.ts       # Protects /admin/* routes
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── globals.css
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── [locale]/       # PUBLIC SITE — ru/uz/en routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── about/
│   │   │   ├── administration/
│   │   │   ├── teachers/
│   │   │   ├── directions/
│   │   │   ├── achievements/
│   │   │   ├── news/
│   │   │   ├── gallery/
│   │   │   └── contacts/
│   │   ├── admin/          # ADMIN PANEL
│   │   │   ├── dashboard/
│   │   │   ├── news/
│   │   │   ├── teachers/
│   │   │   ├── administration/
│   │   │   ├── directions/
│   │   │   ├── achievements/
│   │   │   ├── gallery/
│   │   │   ├── contacts/
│   │   │   ├── about/
│   │   │   ├── users/
│   │   │   ├── settings/
│   │   │   └── login/
│   │   └── api/
│   │       ├── public/     # Public read APIs
│   │       ├── admin/      # Authenticated write APIs
│   │       ├── health/     # Health check (для UptimeRobot)
│   │       └── internal/   # One-off seed endpoints
│   ├── components/
│   │   ├── layout/         # Header, Footer, Logo, MobileMenu, LanguageSwitcher, NavLinks
│   │   ├── admin/          # AdminShell, AdminPageHeader, AdminFormField, AdminDataTable
│   │   ├── home/           # WhyChooseUsSection, PartnersSection, AboutHeroImage
│   │   └── ui/             # NewsCard, TeacherCard, DirectionCard, AchievementCard, Lightbox, EntityGallery*
│   ├── lib/
│   │   ├── i18n/           # next-intl config (locales, routing)
│   │   ├── db/             # Prisma singleton
│   │   ├── vercel-blob-storage.ts  # Blob driver (active)
│   │   ├── r2-storage.ts   # Cloudflare R2 driver (alternative)
│   │   ├── cloudinary*.ts  # Cloudinary driver (alternative)
│   │   ├── storage.ts      # Local /uploads/ driver (dev)
│   │   ├── auth/           # bcrypt + JWT + session helpers
│   │   └── utils/          # cn(), dates, text helpers
│   ├── server/
│   │   └── auth.ts         # Server-side auth
│   └── services/           # Data access layer (one per entity)
├── next.config.mjs         # Next config (image domains, etc)
├── tailwind.config.ts      # Design tokens + brand colors
├── tsconfig.json
├── package.json
└── vercel.json              # Vercel deployment config
```

---

## 🚀 Local development (для разработчиков)

### Prerequisites

- Node.js ≥ 18.18 (use `nvm install 20`)
- PostgreSQL database (or use Prisma Postgres)

### Setup

```bash
git clone https://github.com/amanovvh/altdiu.git
cd altdiu
npm install
cp .env.example .env  # then fill in DATABASE_URL, BLOB_READ_WRITE_TOKEN
npm run db:push       # apply Prisma schema
npm run db:seed       # seed default content + first admin
npm run dev           # http://localhost:3000
```

---

## 🎨 Design system

Brand palette derived from the official seal:

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-800` | `#0e2046` | Navy — header, hero, footer, headings |
| `accent-400` | `#c9a961` | Gold — buttons, highlights |
| `ink-500` | `#5b6b7d` | Muted text |

Defined in `tailwind.config.ts`. Rebrand by editing values there.

---

## 🌍 Internationalization

Three locales: `ru` (default), `uz`, `en` via `next-intl`. URL always includes locale prefix.

- Language switcher in header + mobile menu
- Per-locale `sitemap.xml`
- Each entity has its own `*Translation` table

---

## 💾 Backup & maintenance

See **[MAINTENANCE.md](./MAINTENANCE.md)** for:
- Database backup strategy (Prisma auto-backups + manual pg_dump)
- npm dependency updates (yearly)
- Next.js major version upgrades (every 2-3 years)
- Domain renewal
- What to do if Vercel/Prisma changes pricing

---

## 🛠 Available Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema (dev) |
| `npm run db:migrate` | Create + apply migration |
| `npm run db:seed` | Seed initial data + admin user |
| `npm run db:studio` | Open Prisma Studio |
| `npm run admin:create` | Create/update an admin user |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint |

---

## 🚢 Deployment

See **[DEPLOY.md](./DEPLOY.md)** for:
- Current production stack (Vercel + Prisma + Blob)
- Deploy from scratch
- Alternative storage drivers
- Migration to VPS

See **[EMERGENCY.md](./EMERGENCY.md)** for rollback procedures.

---

## 📄 License

© Academic Lyceum «International Finance». All rights reserved.