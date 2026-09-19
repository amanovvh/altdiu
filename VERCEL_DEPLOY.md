# Бесплатный деплой на Vercel + Cloudflare R2 + Neon Postgres

Этот стек **полностью бесплатен** и работает без кредитной карты.
Cloudinary не используется (недоступен в Узбекистане).

## Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                       Vercel                            │
│  Next.js 14 (App Router)                                │
│  ┌─────────────────┐    ┌─────────────────┐             │
│  │  App routes     │    │  API routes     │             │
│  │  /, /about...   │    │  /api/admin/... │             │
│  └────────┬────────┘    └────────┬────────┘             │
│           │                       │                     │
└───────────┼───────────────────────┼─────────────────────┘
            │                       │
            ▼                       ▼
   ┌─────────────────┐    ┌─────────────────┐
   │  Neon Postgres  │    │  Cloudflare R2  │
   │  0.5 GB free    │    │  10 GB free     │
   │  (serverless)   │    │  (S3-compatible)│
   └─────────────────┘    └─────────────────┘
```

---

## Шаг 1. Аккаунты (все бесплатные)

| Сервис | Что делает | URL |
|---|---|---|
| **GitHub** | Хранит код | https://github.com/signup |
| **Vercel** | Деплоит сайт | https://vercel.com/signup (войти через GitHub) |
| **Neon** | База данных | https://console.neon.tech/signup (войти через GitHub) |
| **Cloudflare** | R2 хранилище | https://dash.cloudflare.com/sign-up |

**Все 4 — без кредитной карты.**

## Шаг 2. Залить код в GitHub

На вашем компьютере:

```bash
cd /Users/hasan/.minimax-agent/projects/academic-lyceum-website

# Если ещё не git-репозиторий
git init
git add .
git commit -m "Initial commit"

# Создать репо на github.com → скопировать URL
git remote add origin https://github.com/ВАШ-USERNAME/lyceum-website.git
git branch -M main
git push -u origin main
```

**⚠️ Перед push убедитесь, что `.env` НЕ попадает в коммит:**

```bash
# Должен быть в .gitignore
cat .gitignore | grep -E '^\.env'
# → ".env"
```

## Шаг 3. Создать базу данных в Neon

1. https://console.neon.tech → New Project → **lyceum**
2. Region: выбрать ближайший (например `Europe (Frankfurt)`)
3. После создания → **Connection Details** → копировать строку вида:
   ```
   postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/lyceum_db?sslmode=require
   ```
   Это и есть `DATABASE_URL` для Vercel.

## Шаг 4. Создать R2 bucket в Cloudflare

1. https://dash.cloudflare.com → **R2** → **Create bucket**
2. Имя: `lyceum-media` (любое, без пробелов)
3. Region: **Automatic** (или Europe)
4. После создания → **Settings** → **Public Access** → **Connect domain** или **Enable R2.dev subdomain**
   - Получите URL вида `https://pub-xxx.r2.dev/lyceum-media/...` — это ваш `R2_PUBLIC_BASE_URL`
   - Или подключите свой домен (например `cdn.lyceum.uz`)
5. **R2** → **Manage R2 API Tokens** → **Create API Token**
   - Permissions: **Object Read & Write**
   - Bucket: `lyceum-media`
   - TTL: оставить пустым
   - Скопировать:
     - **Access Key ID** → `R2_ACCESS_KEY_ID`
     - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
     - **Account ID** (из URL дашборда R2) → `R2_ACCOUNT_ID`

## Шаг 5. Деплой на Vercel

1. https://vercel.com/dashboard → **Add New → Project**
2. **Import** ваш GitHub-репозиторий `lyceum-website`
3. Framework Preset: **Next.js** (определится автоматически)
4. Нажать **Environment Variables** и ввести:

| Имя | Значение |
|---|---|
| `DATABASE_URL` | строка из Neon |
| `NEXTAUTH_SECRET` | `openssl rand -hex 32` (сгенерировать) |
| `NEXT_PUBLIC_SITE_URL` | оставьте пустым на старте — заполните после первого деплоя |
| `STORAGE_DRIVER` | `r2` |
| `R2_ACCOUNT_ID` | из Cloudflare |
| `R2_ACCESS_KEY_ID` | из Cloudflare |
| `R2_SECRET_ACCESS_KEY` | из Cloudflare |
| `R2_BUCKET_NAME` | `lyceum-media` |
| `R2_PUBLIC_BASE_URL` | `https://pub-xxx.r2.dev/lyceum-media` |
| `ADMIN_DEFAULT_EMAIL` | `admin@lyceum.uz` |
| `ADMIN_DEFAULT_PASSWORD` | ваш пароль (сменить после первого входа!) |
| `ADMIN_DEFAULT_NAME` | `Site Administrator` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `ru` |
| `NEXT_PUBLIC_SUPPORTED_LOCALES` | `ru,uz,en` |
| `NODE_ENV` | `production` |

5. Нажать **Deploy**

Первый деплой займёт 2–4 минуты.

## Шаг 6. Применить миграции и засеять БД

После успешного деплоя:

1. Открыть **Vercel Dashboard → Project → Settings → General**
2. Найти **Build & Development Settings** → там же вкладка **Functions**
3. Или проще: **Vercel Dashboard → Project → Deployments → выбрать последний → ⋯ → "Open in Shell"** (только платные планы)
4. **Самый простой способ** — настроить локально:

```bash
# На вашем компьютере
cd /Users/hasan/.minimax-agent/projects/academic-lyceum-website

# Создать .env.production с DATABASE_URL из Neon
echo "DATABASE_URL=postgresql://..." > .env.production
echo "NEXTAUTH_SECRET=$(openssl rand -hex 32)" >> .env.production
echo "STORAGE_DRIVER=r2" >> .env.production
echo "R2_ACCOUNT_ID=..." >> .env.production
# ... все остальные R2_* переменные

# Применить миграции (схема → БД)
DATABASE_URL=... npx prisma db push

# Засеять (admin + sample data)
DATABASE_URL=... npx prisma db seed
```

После сидинга — сделайте **Redeploy** в Vercel (или push новый commit, чтобы Vercel пересобрал с обновлённой БД).

## Шаг 7. Получить публичный URL

После деплоя Vercel выдаст URL вида `https://lyceum-website-xxx.vercel.app`.

**Все работает!** Сайт публично доступен по этому адресу.

## Шаг 8. Подключить свой домен (опционально)

Если у вас есть свой домен:

1. Купить домен (например `.uz` у ps.uz или .com на namecheap.com)
2. **Vercel → Project → Settings → Domains** → добавить `lyceum.example.uz`
3. Скопировать NS-сервера Vercel → вставить в настройки домена у регистратора
4. Подождать 5-30 минут → SSL сертификат выпустится автоматически
5. После этого обновить `NEXT_PUBLIC_SITE_URL=https://lyceum.example.uz` в Vercel

## Шаг 9. Дальнейшие обновления сайта

```bash
# На вашем компьютере
cd /Users/hasan/.minimax-agent/projects/academic-lyceum-website

# Внести изменения, например добавить новость через админку

# Закоммитить и запушить
git add .
git commit -m "Add news"
git push
```

Vercel автоматически задеплоит изменения через 1–2 минуты.

## Проверка после деплоя

```bash
# Главная
curl -sI https://lyceum-website-xxx.vercel.app/ | head -3
# HTTP/2 200

# Healthcheck
curl -s https://lyceum-website-xxx.vercel.app/api/health | jq
# {"ok": true, "db": "up", "ts": "2026-..."}

# Админка
open https://lyceum-website-xxx.vercel.app/admin/login
# Войти с ADMIN_DEFAULT_EMAIL / ADMIN_DEFAULT_PASSWORD
```

## Лимиты бесплатного tier

| Сервис | Лимит | Достаточно? |
|---|---|---|
| Vercel | 100 GB bandwidth / мес | ✅ для лицея |
| Vercel Functions | 100 GB-hours / мес | ✅ |
| Neon Postgres | 0.5 GB storage | ✅ (~10 MB сейчас) |
| Neon Compute | 191.9 hours / мес (auto-suspend) | ✅ |
| Cloudflare R2 | 10 GB storage, 1M class A / 10M class B запросов | ✅ |

**Сайт будет работать бесплатно несколько лет** при нормальной нагрузке.

## Что делать, если что-то сломалось

| Проблема | Решение |
|---|---|
| 500 при загрузке фото | Проверьте `R2_*` env vars в Vercel; R2 bucket должен быть публичным |
| `Database connection failed` | Проверьте `DATABASE_URL` (должен содержать `?sslmode=require`); Neon не "спит" ли? |
| Картинки не отображаются | Откройте `https://pub-xxx.r2.dev/lyceum-media/test.jpg` — должно открыться |
| Админ не входит | Проверьте `ADMIN_DEFAULT_PASSWORD` — мог ввести пароль с пробелом/кавычкой |
| Сайт работает, но медленно | Vercel cold start — после первого запроса разогреется |
