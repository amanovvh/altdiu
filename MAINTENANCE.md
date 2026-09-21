# 🔧 Ежегодное обслуживание (раз в год, 2-3 часа)

> **Для кого:** новый разработчик / IT-отдел лицея, который будет поддерживать сайт.

Эта инструкция описывает **минимальное ежегодное обслуживание**, чтобы сайт работал стабильно 5+ лет.

---

## 📅 Расписание

| Когда | Что делать | Время |
|---|---|---|
| **Каждые 12 месяцев** | Обновить npm зависимости | 30 минут |
| **Каждые 12 месяцев** | Обновить Node.js (если вышла LTS) | 15 минут |
| **Каждые 3 года** | Обновить Next.js до новой мажорной версии | 3-4 часа |
| **Каждый год** | Продлить домен `.uz` (если купили) | 15 минут |
| **Раз в 3 месяца** | Проверить что бэкапы БД работают | 15 минут |

---

## 🔄 Ежегодное обновление зависимостей (30 минут)

```bash
# 1. Зайти в проект
cd /Users/hasan/.minimax-agent/projects/academic-lyceum-website

# 2. Посмотреть что устарело
npm outdated

# 3. Обновить всё что безопасно (только patch и minor версии)
npm update

# 4. Проверить что билд проходит
npm run build

# 5. Если есть конфликты (например, peer dependency) — НЕ делай force
#    Лучше обновлять пакеты по одному:
npm install package-name@latest
```

**После успешного билда:**

```bash
# 6. Закоммитить
git add -A
git commit -m "chore: bump dependencies"

# 7. Запушить
git push origin main

# 8. Подождать 1-2 минуты, проверить https://altdiu.vercel.app
```

---

## 🆕 Обновление Next.js до новой мажорной версии (3-4 часа)

Делать **только когда выйдет новая мажорная версия** (раз в 1.5-2 года). Сейчас используется Next.js 14, плановый переход на 15/16.

```bash
# 1. Прочитать официальный migration guide
# https://nextjs.org/docs/app/building-your-application/upgrading

# 2. Создать отдельную ветку
git checkout -b upgrade-next-15

# 3. Обновить
npm install next@15 react@19 react-dom@19

# 4. Прочитать breaking changes и поправить код

# 5. Локально проверить
npm run build
npm run dev   # потыкай вручную все ключевые страницы

# 6. Закоммитить → push → Vercel автоматически задеплоит preview
git add -A
git commit -m "feat: upgrade Next.js to v15"
git push origin upgrade-next-15

# 7. Vercel даст preview URL — потыкай там
# 8. Если всё ок → merge в main
```

> ⚠️ **Если не получается** — нанять фрилансера на Upwork / FL.ru за $50-100. Это стандартная задача.

---

## 📦 Проверка бэкапов БД (15 минут, раз в квартал)

1. Открой https://console.prisma.io
2. Зайди в проект **altdiu**
3. **Backups** → должно быть **включено** (Prisma автоматически делает бэкапы)
4. Если хочешь **свой бэкап** (для параноиков):
   ```bash
   # Получить connection string из Prisma Dashboard
   DATABASE_URL='postgres://...' pg_dump -Fc lyceum > backup-$(date +%Y%m%d).dump
   # Сохранить backup-файл в безопасное место (Google Drive, Dropbox)
   ```

---

## 💳 Продление домена (если есть)

Если купили `financelyceum.uz`:

1. За неделю до окончания получи email от регистратора
2. Зайди в личный кабинет (cctld.uz / webhost.uz / где покупал)
3. **Оплатить** продление (обычно 50-150 тыс сум/год)
4. Проверить что домен всё ещё указывает на Vercel: https://dnschecker.org/#A/financelyceum.uz

---

## 📊 Мониторинг (настройка один раз)

### UptimeRobot (бесплатно)

1. Зайди на https://uptimerobot.com → Sign Up (бесплатно)
2. **Add New Monitor** → HTTP(s)
   - URL: https://altdiu.vercel.app
   - Interval: 5 minutes
3. **Alert Contacts** → добавь email того, кто отвечает за сайт
4. Готово. Если сайт упадёт — на email придёт уведомление.

### Vercel Analytics (бесплатно)

Vercel показывает метрики прямо в Dashboard:
- https://vercel.com/hasan-4f99/altdiu/analytics

---

## 🛠 Что может сломаться через 3-5 лет

| Проблема | Решение |
|---|---|
| **Next.js больше не поддерживает Node.js 18** | `nvm install 20 && nvm use 20` |
| **Prisma меняет API** | `npm install prisma@latest @prisma/client@latest && npx prisma generate` |
| **Vercel изменил free tier** | Перенести на VPS (Hetzner €4/мес) |
| **SSL протух** | Vercel обновляет автоматически, ничего делать не нужно |
| **Истёк срок сертификата Telegram бота** | См. BOTFATHER_SETUP.md |
| **Vercel Blob кончилось место (500 MB)** | Перейти на Cloudflare R2 (бесплатно 10 GB) |

---

## 💼 Если нужна разовая помощь

Необязательно разбираться самому. Любую задачу можно отдать фрилансеру:

- **Upwork** — https://upwork.com (международный)
- **FL.ru** — https://fl.ru (русскоязычный)
- **Telegram** — https://t.me/freelance_hire (чаты с разработчиками)

**Что написать фрилансеру:**
> "Есть Next.js + Prisma Postgres сайт, развёрнут на Vercel. Репо: github.com/amanovvh/altdiu. Нужно сделать [задача]. Оплата: договорная. Срок: сегодня-завтра."

Средняя ставка: **$10-30/час**. Разовые задачи — $30-100.

---

## 📞 Контакты для критических ситуаций

| Сервис | Где искать помощь |
|---|---|
| **Vercel** | https://vercel.com/support — чат на сайте, ответ за час |
| **Prisma** | https://www.prisma.io/support — Discord + email |
| **Next.js** | https://github.com/vercel/next.js/discussions — GitHub Discussions |
| **Бывший разработчик** | _(добавить контакт)_ |

---

> ✅ **Главное:** не бойся обновлять. Всё что здесь описано — стандартные операции, их делают тысячи разработчиков каждый день. Если сломалось — в Vercel Dashboard всё можно откатить одной кнопкой **"Rollback to previous deployment"**.