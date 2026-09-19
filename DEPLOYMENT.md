# Deployment Guide

## Option 1 — VPS (Ubuntu 22.04, recommended)

### 1. System dependencies

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 2. PostgreSQL

```bash
sudo -u postgres psql
CREATE USER lyceum_user WITH PASSWORD 'STRONG_PASSWORD';
CREATE DATABASE lyceum_db OWNER lyceum_user;
GRANT ALL PRIVILEGES ON DATABASE lyceum_db TO lyceum_user;
\q
```

### 3. Deploy code

```bash
sudo mkdir -p /opt/academic-lyceum
sudo chown -R $USER:$USER /opt/academic-lyceum
cd /opt/academic-lyceum
git clone <repo-url> .
npm ci
```

### 4. Configure environment

```bash
cp .env.example .env
nano .env
```

Required:

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://lyceum.tg
DATABASE_URL=postgresql://lyceum_user:STRONG_PASSWORD@localhost:5432/lyceum_db?schema=public
ADMIN_DEFAULT_EMAIL=admin@lyceum.uz
ADMIN_DEFAULT_PASSWORD=VERY_STRONG_PASSWORD
ADMIN_DEFAULT_NAME=Site Administrator
NEXTAUTH_SECRET=$(openssl rand -hex 32)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
BACKUP_PATH=/var/backups/lyceum
BACKUP_RETENTION_DAYS=30
```

### 5. Database

```bash
npm run db:generate
npm run db:migrate:prod   # for production
npm run db:seed            # creates first admin + defaults
```

### 6. Build

```bash
npm run build
```

### 7. Start with PM2

```bash
pm2 start npm --name lyceum-web -- start
pm2 save
pm2 startup
```

### 8. Nginx

`/etc/nginx/sites-available/lyceum`:

```nginx
server {
    listen 80;
    server_name lyceum.tg www.lyceum.tg;
    client_max_body_size 12M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/lyceum /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d lyceum.tg -d www.lyceum.tg
```

### 9. Backup cron

```bash
sudo mkdir -p /var/backups/lyceum
sudo chown $USER:$USER /var/backups/lyceum
crontab -e
```

Add:

```
0 3 * * * /opt/academic-lyceum/scripts/backup.sh >> /var/log/lyceum-backup.log 2>&1
```

---

## Option 2 — Docker

`Dockerfile`:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run db:generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/public ./public
COPY --from=builder /app/messages ./messages
EXPOSE 3000
CMD ["npm", "start"]
```

`docker-compose.yml`:

```yaml
version: '3.9'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: lyceum_user
      POSTGRES_PASSWORD: strong_password
      POSTGRES_DB: lyceum_db
    volumes:
      - pgdata:/var/lib/postgresql/data

  web:
    build: .
    depends_on: [db]
    ports: ['3000:3000']
    environment:
      DATABASE_URL: postgresql://lyceum_user:strong_password@db:5432/lyceum_db
      NODE_ENV: production
      ADMIN_DEFAULT_EMAIL: admin@lyceum.uz
      ADMIN_DEFAULT_PASSWORD: change_me
      NEXTAUTH_SECRET: change_me_openssl_rand_hex_32
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: xxx
      CLOUDINARY_API_KEY: xxx
      CLOUDINARY_API_SECRET: xxx
    volumes:
      - backups:/var/backups/lyceum

volumes:
  pgdata:
  backups:
```

```bash
docker compose up -d
docker compose exec web npx prisma migrate deploy
docker compose exec web npm run db:seed
```

---

## Option 3 — Vercel

1. Push to GitHub.
2. Import in Vercel.
3. Set environment variables in dashboard.
4. Set `NEXT_PUBLIC_SITE_URL` to your domain.
5. After first deploy:
   ```bash
   vercel env pull .env.production
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   ```

For Vercel, use Vercel Postgres or a managed PostgreSQL (Neon, Supabase, etc.).

---

## Post-deploy checklist

- [ ] Site loads at `https://lyceum.tg`, redirects on all locales
- [ ] `/admin/login` is reachable
- [ ] First admin login works (credentials from `.env`)
- [ ] Create a test news — appears on homepage
- [ ] Change password in `/admin/settings`
- [ ] Add second admin via "Users" → only Super Admin allowed
- [ ] Backup cron ran successfully
- [ ] Cloudinary uploads work
- [ ] Mobile view: burger menu, language switcher visible
