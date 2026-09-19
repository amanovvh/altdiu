# Деплой сайта на VPS

Этот сайт — Next.js 14 + PostgreSQL + локальное файловое хранилище
(`/public/uploads/`). Стек выбран потому, что **Cloudinary недоступен
в Узбекистане**, а serverless-платформы (Vercel/Netlify) теряют файлы
при каждом деплое.

Ниже — два варианта: **Docker** (рекомендую) и **systemd + Node.js**.

---

## Вариант A: Docker (рекомендую)

### Что нужно на сервере

| Компонент | Минимум |
|---|---|
| ОС | Ubuntu 22.04 / Debian 12 |
| CPU/RAM | 2 vCPU, 2 GB RAM |
| Диск | 30 GB SSD (с запасом под бэкапы и загрузки) |
| Docker | 24.0+ |
| Docker Compose | v2.20+ |
| Nginx | 1.18+ |
| Certbot | 1.21+ |

### Шаг 1. Подготовка сервера

```bash
# Обновить систему
apt update && apt upgrade -y

# Установить Docker
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin

# Установить Nginx и Certbot
apt install -y nginx certbot python3-certbot-nginx

# Открыть порты
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Шаг 2. Залить код

```bash
# На СВОЁМ компьютере — упаковать проект
cd /Users/hasan/.minimax-agent/projects/academic-lyceum-website
tar czf /tmp/lyceum.tar.gz \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.git \
    .

# Скопировать на сервер
scp /tmp/lyceum.tar.gz root@your-server-ip:/opt/

# На СЕРВЕРЕ — распаковать
ssh root@your-server-ip
cd /opt
tar xzf lyceum.tar.gz -C lyceum
mv lyceum/.??* lyceum/ 2>/dev/null || true
cd lyceum
ls
```

### Шаг 3. Настроить `.env`

```bash
cd /opt/lyceum
cp .env.production.example .env

# Сгенерировать криптостойкий секрет
sed -i "s/CHANGE_ME_HEX_32_BYTES/$(openssl rand -hex 32)/" .env

# Придумать и вписать пароли
nano .env
```

**Обязательно замените:**

```env
POSTGRES_PASSWORD=...случайный 32+ символа...
ADMIN_DEFAULT_PASSWORD=...ваш пароль админа (не 'admin123')...
NEXTAUTH_SECRET=...уже сгенерирован выше...
NEXT_PUBLIC_SITE_URL=https://ваш-домен.uz
```

### Шаг 4. Сборка и запуск

```bash
cd /opt/lyceum

# Первая сборка + миграции + сидинг
docker compose up -d --build

# Дождаться, пока Postgres станет healthy
docker compose ps

# Применить миграции и засеять БД (один раз)
docker compose exec app npx prisma db push
docker compose exec app npx prisma db seed
docker compose exec app node -e "
  const { hashPassword } = await import('./src/server/auth.ts').catch(() => ({}));
" 2>/dev/null || true

# Если admin seed не создал пользователя — выполните вручную:
docker compose exec -T postgres psql -U lyceum_user -d lyceum_db \
  -c "UPDATE \"AdminUser\" SET \"passwordHash\" = '<bcrypt-hash>' WHERE email = 'admin@lyceum.uz';"
# (хеш можно получить: docker compose exec app node -e "
#   const bcrypt = require('bcryptjs');
#   console.log(bcrypt.hashSync('ваш-пароль', 12));
# ")
```

### Шаг 5. Nginx + SSL

```bash
# Скопировать конфиг
cp deploy/nginx/lyceum.conf /etc/nginx/sites-available/lyceum.conf

# Заменить домен
sed -i 's/lyceum.example.com/ваш-домен.uz/g' /etc/nginx/sites-available/lyceum.conf

# Активировать
ln -sf /etc/nginx/sites-available/lyceum.conf /etc/nginx/sites-enabled/lyceum.conf
rm -f /etc/nginx/sites-enabled/default

# Проверить и применить
nginx -t
systemctl reload nginx

# Получить SSL-сертификат (бесплатно)
certbot --nginx -d ваш-домен.uz -d www.ваш-домен.uz
```

### Шаг 6. Автозапуск и бэкапы

```bash
# Docker уже настроен на restart: unless-stopped
systemctl enable docker

# Бэкап раз в день в 3:00
cp deploy/scripts/backup.sh /opt/lyceum/backup.sh
chmod +x /opt/lyceum/backup.sh
echo "0 3 * * * root /opt/lyceum/backup.sh >> /var/log/lyceum-backup.log 2>&1" \
  > /etc/cron.d/lyceum-backup
```

### Шаг 7. Обновление сайта

```bash
# На своём компьютере
cd /Users/hasan/.minimax-agent/projects/academic-lyceum-website
tar czf /tmp/lyceum.tar.gz --exclude=node_modules --exclude=.next .
scp /tmp/lyceum.tar.gz root@your-server-ip:/opt/lyceum/lyceum.tar.gz

# На сервере
ssh root@your-server-ip
cd /opt/lyceum
tar xzf lyceum.tar.gz --strip-components=1
docker compose up -d --build
docker compose exec app npx prisma db push
```

---

## Вариант B: systemd + Node.js (без Docker)

### Шаг 1. Установить Node.js 20 и PostgreSQL

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PostgreSQL 16
apt install -y postgresql postgresql-contrib
systemctl enable --now postgresql

sudo -u postgres psql <<EOF
CREATE USER lyceum_user WITH PASSWORD 'ваш-пароль';
CREATE DATABASE lyceum_db OWNER lyceum_user;
GRANT ALL PRIVILEGES ON DATABASE lyceum_db TO lyceum_user;
EOF
```

### Шаг 2. Подготовить приложение

```bash
# Создать пользователя и каталоги
useradd -m -s /bin/bash lyceum
mkdir -p /opt/lyceum /var/log/lyceum /var/backups/lyceum
chown -R lyceum:lyceum /opt/lyceum /var/log/lyceum /var/backups/lyceum

# Залить код
rsync -av --exclude=node_modules --exclude=.next /Users/hasan/lyceum/ /opt/lyceum/
# (или scp/sftp, как удобнее)

# Установить зависимости и собрать
cd /opt/lyceum
sudo -u lyceum npm ci --no-audit --no-fund
sudo -u lyceum npx prisma generate
sudo -u lyceum npm run build

# Скопировать .env
cp .env.production.example /opt/lyceum/.env
chown lyceum:lyceum /opt/lyceum/.env
# (отредактируйте под боевые значения)

# Инициализировать БД
sudo -u lyceum npx prisma db push
sudo -u lyceum npx prisma db seed
```

### Шаг 3. systemd-сервис

```bash
cp deploy/systemd/lyceum.service /etc/systemd/system/lyceum.service
systemctl daemon-reload
systemctl enable --now lyceum
systemctl status lyceum
```

### Шаг 4. Nginx и SSL — те же шаги, что в варианте A

---

## Проверка после деплоя

```bash
# Healthcheck
curl -s https://ваш-домен.uz/api/health | jq
# {"ok": true, "db": "up", "ts": "2026-..."}

# Главная
curl -sI https://ваш-домен.uz/ | head -3
# HTTP/2 200
# ...

# Админка (должна редиректить на /admin/login)
curl -sI https://ваш-домен.uz/admin | head -3
```

## Обслуживание

| Задача | Команда |
|---|---|
| Посмотреть логи Docker | `docker compose logs -f app` |
| Перезапустить приложение | `docker compose restart app` |
| Зайти в контейнер | `docker compose exec app sh` |
| pg_dump базы | `docker compose exec postgres pg_dump -U lyceum_user lyceum_db > backup.sql` |
| Ручной бэкап | `/opt/lyceum/backup.sh` |
| Посмотреть диск | `du -sh /var/lib/docker/volumes/lyceum_*` |
| Обновить SSL | `certbot renew` (cron уже настроен) |

## Что входит в резервную копию

- **PostgreSQL dump** (custom format, gzip) — `db_YYYY-MM-DD_HH-MM.dump`
- **Uploads** (все загруженные фото) — `uploads_YYYY-MM-DD_HH-MM.tar.gz`
- Хранятся 30 дней, затем удаляются автоматически
- Опционально синхронизируются в S3 (если настроены `BACKUP_S3_*`)

## Переменные окружения (production .env)

См. `.env.production.example`. **Обязательно замените:**
- `POSTGRES_PASSWORD` — криптостойкий пароль БД
- `ADMIN_DEFAULT_PASSWORD` — пароль первого админа
- `NEXTAUTH_SECRET` — `openssl rand -hex 32`
- `NEXT_PUBLIC_SITE_URL` — реальный домен

## Что делать, если что-то сломалось

| Симптом | Решение |
|---|---|
| 502 Bad Gateway | `docker compose ps` — запущены ли контейнеры? `docker compose logs app` |
| Картинки не загружаются | `ls -la /var/lib/docker/volumes/lyceum_uploads_data` — есть ли файлы? |
| DB не отвечает | `docker compose exec postgres pg_isready` |
| Сертификат истёк | `certbot renew --dry-run` → `certbot renew` |
| Закончилось место | `df -h` → `du -sh /var/lib/docker/volumes/*` |
