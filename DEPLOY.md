# 🚀 Деплой сайта

> **Для кого:** новый разработчик / IT-отдел, которому нужно развернуть проект с нуля или мигрировать на другой хостинг.

---

## 📦 Текущий production-стек (на сентябрь 2026)

| Слой | Сервис | Free tier | Где смотреть |
|---|---|---|---|
| **Хостинг (Next.js runtime)** | Vercel Hobby | 100 GB bandwidth/мес | https://vercel.com/hasan-4f99/altdiu |
| **База данных** | Prisma Postgres | 512 MB, 5 GB egress/мес | https://console.prisma.io |
| **Файловое хранилище (картинки)** | Vercel Blob | 500 MB storage, 100 GB egress/мес | Vercel → Storage → Blob |
| **Код** | GitHub | Private repo | https://github.com/amanovvh/altdiu |

**Стоимость: 0₽/мес** (на ближайшие 2-3 года, дальше см. MAINTENANCE.md).

---

## 🔄 Текущий флоу деплоя

```bash
# 1. Локально: правишь код
git checkout -b fix-something
# ... изменения ...
git commit -am "fix: что-то"
git push origin fix-something

# 2. Открываешь Pull Request на GitHub — Vercel автоматически даст preview URL

# 3. Если preview ок — merge в main → auto-deploy на прод
```

Если GitHub webhook сломался (бывает после force-push):
```bash
# Vercel CLI — обходит webhook
npx vercel login
npx vercel deploy --prod --yes
```

---

## 🏗 Развёртывание с нуля (новый разработчик, новый сервер)

### Шаг 1. Клонировать репозиторий
```bash
git clone https://github.com/amanovvh/altdiu.git
cd altdiu
npm install
```

### Шаг 2. Создать аккаунты (все бесплатные, без карты)
1. **GitHub** — https://github.com/signup (если нет)
2. **Vercel** — https://vercel.com/signup (войти через GitHub)
3. **Prisma** — https://console.prisma.io (войти через GitHub)

### Шаг 3. Создать Postgres базу
1. Prisma Dashboard → **New Project** → **Postgres** → выбрать регион (Frankfurt или Singapore)
2. Скопировать **DATABASE_URL** (выглядит как `postgres://...:...@db.prisma.io:5432/postgres?sslmode=require`)

### Шаг 4. Залить схему + начальные данные
```bash
# В .env добавить DATABASE_URL
echo 'DATABASE_URL="postgres://...:...@db.prisma.io:5432/postgres?sslmode=require"' > .env

# Применить схему
npx prisma db push

# Засеять начальные данные (админ, контент по умолчанию)
npm run db:seed
```

### Шаг 5. Создать Vercel Blob store
1. Vercel → **Storage** → **Create Database** → **Blob**
2. Создать Public store
3. Скопировать `BLOB_READ_WRITE_TOKEN`

### Шаг 6. Залить в Vercel
1. Vercel → **Add New Project** → Import `altdiu` repo
2. **Environment Variables** добавить:
   ```
   DATABASE_URL = postgres://...
   BLOB_READ_WRITE_TOKEN = vercel_blob_...
   STORAGE_DRIVER = vercel-blob
   ADMIN_DEFAULT_EMAIL = admin@lyceum.uz
   ADMIN_DEFAULT_PASSWORD = (сгенерировать сильный пароль)
   ADMIN_DEFAULT_NAME = Site Administrator
   NEXTAUTH_SECRET = (openssl rand -hex 32)
   NEXT_PUBLIC_SITE_URL = https://altdiu.vercel.app
   ```
3. **Deploy** → Vercel соберёт и задеплоит за ~1-2 минуты

### Шаг 7. После деплоя
1. Зайти в `https://<домен>/admin/login`
2. Войти с `ADMIN_DEFAULT_EMAIL` / `ADMIN_DEFAULT_PASSWORD`
3. **Сразу сменить пароль**: Settings → Change Password
4. Удалить `ADMIN_DEFAULT_PASSWORD` из env переменных Vercel

---

## 🔧 Альтернативные хранилища (если Vercel Blob мало)

В коде уже есть готовые драйверы для альтернатив — переключение через `STORAGE_DRIVER`:

```env
STORAGE_DRIVER=local        # пишет в /public/uploads (dev)
STORAGE_DRIVER=vercel-blob  # Vercel Blob (по умолчанию)
STORAGE_DRIVER=r2           # Cloudflare R2 (10 GB бесплатно)
STORAGE_DRIVER=cloudinary   # Cloudinary (платный)
```

Подробнее про каждый — см. комментарии в `src/lib/*-storage.ts`.

---

## 🚚 Миграция на собственный VPS (если нужно)

См. старый гайд в git history (commit `0bdfa33` или раньше) — там подробная инструкция для Ubuntu + Docker. Это занимает 4-6 часов.

**Когда это нужно:** если Vercel изменит условия free tier, или появится требование хранить данные только в Узбекистане.

---

## ⚠️ Важные секреты

Все секреты хранятся в **Vercel Dashboard → Settings → Environment Variables**, **НЕ** в коде. Если случайно закоммитил `.env` — **немедленно** ротируй все ключи:
1. Vercel: создать новый Blob token, старый удалить
2. Prisma: создать новый database password
3. NEXTAUTH_SECRET: пересоздать через `openssl rand -hex 32`

Длинные детали про бэкапы, мониторинг и обновления — см. **MAINTENANCE.md**.
Экстренные ситуации — см. **EMERGENCY.md**.