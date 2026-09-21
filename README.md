# International Finance — Academic Lyceum Website

A production-ready full-stack website for the **Academic Lyceum under Tashkent State University of Economics «International Finance»** with a secure web Admin Panel.

---

## ✨ Highlights

- **Frontend** — Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend** — Next.js API Routes + Server Actions + Prisma ORM
- **Database** — PostgreSQL
- **Storage** — Cloudinary (image optimization + CDN)
- **Auth** — bcrypt password hashing + JWT session cookies (jose)
- **Admin Panel** — `/admin` route, protected by middleware, full CMS
- **Languages** — Russian / Uzbek / English with full SEO alternates
- **Performance** — Server Components, lazy loading, Cloudinary `f_auto,q_auto`
- **Backup** — Built-in shell scripts + optional in-app backup endpoint
- **Security** — Server-side validation (zod), HMAC-signed sessions, role-based access

---

## 🧱 Project Structure

```
academic-lyceum-website/
├── prisma/
│   ├── schema.prisma         # Database schema (22 models, multilingual)
│   └── seed.ts               # Seeds default content + first admin
├── messages/
│   ├── ru.json               # Russian translations
│   ├── uz.json               # Uzbek translations
│   └── en.json               # English translations
├── public/
│   ├── logo.jpeg             # Official seal
│   ├── favicon-32.png
│   ├── favicon-192.png
│   ├── favicon-512.png
│   └── og-image.png
├── scripts/
│   ├── backup.sh             # Cron-friendly PG backup
│   ├── restore.sh            # Restore from backup
│   └── create-admin.ts       # CLI to create/update admins
├── src/
│   ├── middleware.ts         # Protects /admin/* routes
│   ├── app/
│   │   ├── layout.tsx        # Root layout (fonts, metadata)
│   │   ├── globals.css       # Tailwind + design tokens
│   │   ├── sitemap.ts        # Dynamic multilingual sitemap
│   │   ├── robots.ts         # robots.txt
│   │   ├── [locale]/         # PUBLIC SITE — ru/uz/en routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx      # Home
│   │   │   ├── about/
│   │   │   ├── administration/
│   │   │   ├── teachers/
│   │   │   ├── directions/
│   │   │   ├── achievements/
│   │   │   ├── news/
│   │   │   ├── gallery/
│   │   │   └── contacts/
│   │   ├── admin/            # ADMIN PANEL — not localized
│   │   │   ├── layout.tsx    # Sidebar + content shell
│   │   │   ├── login/        # Login page + server action
│   │   │   ├── dashboard/    # Stats overview
│   │   │   ├── news/         # CRUD
│   │   │   ├── teachers/
│   │   │   ├── administration/
│   │   │   ├── directions/
│   │   │   ├── achievements/
│   │   │   ├── gallery/
│   │   │   ├── contacts/
│   │   │   ├── about/
│   │   │   ├── users/        # Manage admins
│   │   │   └── settings/     # Profile + hero stats
│   │   └── api/
│   │       ├── public/       # Public read APIs
│   │       └── admin/        # Authenticated write APIs
│   ├── components/
│   │   ├── layout/           # Header, Footer, Logo, MobileMenu, LanguageSwitcher
│   │   ├── admin/            # AdminShell, AdminPageHeader, AdminFormField, AdminDataTable, AdminStatCard
│   │   └── ui/               # NewsCard, TeacherCard, DirectionCard, Lightbox, etc.
│   ├── lib/
│   │   ├── i18n/             # next-intl config (locales, routing)
│   │   ├── db/               # Prisma singleton
│   │   ├── cloudinary.ts     # Upload + URL builder
│   │   └── utils/            # cn(), dates, text helpers
│   ├── server/
│   │   └── auth.ts           # bcrypt + JWT + session helpers
│   └── services/             # Data access layer (one per entity)
```

---

## 🚀 Quick start

### 1. Prerequisites

- Node.js ≥ 18.18
- PostgreSQL ≥ 14 (local or hosted)

### 2. Install

```bash
git clone <repo-url> academic-lyceum-website
cd academic-lyceum-website
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in at minimum:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/lyceum_db?schema=public
ADMIN_DEFAULT_EMAIL=admin@lyceum.uz
ADMIN_DEFAULT_PASSWORD=change_me_immediately
ADMIN_DEFAULT_NAME=Site Administrator
NEXTAUTH_SECRET=$(openssl rand -hex 32)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 4. Database

```bash
npm run db:generate
npm run db:push
npm run db:seed         # creates first admin + default content
```

### 5. Run

```bash
npm run dev
```

- **Public site:** http://localhost:3000 (auto-redirects to `/ru`)
- **Admin panel:** http://localhost:3000/admin/login

Log in with the credentials from `.env`.

---

## 🔐 Admin Panel

URL: **`/admin`**

Features:

- 📊 **Dashboard** — site stats and recent activity
- 📰 **News** — full CRUD with multilingual content, publish/pin toggle
- 👨‍🏫 **Teachers** — CRUD with category filtering, photo, education
- 🏛 **Administration** — leadership CRUD
- 📚 **Directions** — study programs CRUD with subjects
- 🏆 **Achievements** — CRUD with category, date, photo
- 🖼 **Gallery** — albums with photo upload (Cloudinary public_id)
- 📞 **Contacts** — per-locale contact info + social links
- 🏫 **About** — per-locale SiteContent blocks (history, mission, etc.)
- 👥 **Users** — manage admin users (Super Admin only)
- ⚙️ **Settings** — change own password + hero stats

All actions are logged to `AdminAction` for audit.

### Adding more admins

```bash
npm run admin:create -- --email editor@lyceum.uz --password "secret123" --name "Editor" --role EDITOR
```

Available roles: `SUPER_ADMIN`, `ADMIN`, `EDITOR`.

---

## 🎨 Design system

The brand palette is derived from the official seal:

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

## 💾 Backup

### One-off (CLI)

```bash
./scripts/backup.sh    # reads DATABASE_URL from .env
```

### Cron

```
0 3 * * * /opt/academic-lyceum-website/scripts/backup.sh
```

### Restore

```bash
./scripts/restore.sh /var/backups/lyceum/lyceum-2026-09-17.sql.gz
```

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
| `npm run backup:create` | Run backup script |
| `npm run backup:restore` | Run restore script |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint |

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for VPS / Docker / Vercel instructions.

---

## 📄 License

© Academic Lyceum «International Finance». All rights reserved.


