# Project Conventions for AI Agents

## Stack

- **Next.js 14** App Router, TypeScript strict mode
- **Tailwind CSS** — single source of design truth in `tailwind.config.ts`
- **Prisma** + **PostgreSQL**
- **next-intl** for 3 locales: `ru` (default), `uz`, `en`
- **Cloudinary** for image storage + transformations
- **zod** for input validation on all admin APIs
- **bcryptjs** + **jose** (JWT) for authentication

## Authentication

- Password hashing: bcrypt with cost factor 12 (`src/server/auth.ts → hashPassword()`)
- Session: JWT signed with HS256 using `NEXTAUTH_SECRET`, stored in `httpOnly` cookie `lyceum_admin_session`
- TTL: 8 hours
- Login endpoint: `POST /api/admin/auth/login` (or server action `loginAction`)
- Logout: `POST /api/admin/auth/logout` (or server action `logoutAction`)

## Routes

- **Public site** under `/[locale]/` — multilingual, no auth required
- **Admin panel** under `/admin/` — non-localized, auth required
  - Middleware (`src/middleware.ts`) protects `/admin/*` and `/api/admin/*` (except `/admin/login` and `/api/admin/auth/login`)
  - Layout (`src/app/admin/layout.tsx`) double-checks auth server-side
  - Server actions call `getCurrentAdmin()` to confirm

## Admin user roles

- `SUPER_ADMIN` — full access including creating/deleting admins
- `ADMIN` — content management, cannot manage users
- `EDITOR` — content management only

`Users` page checks `admin.role === 'SUPER_ADMIN'` before allowing CRUD.

## Conventions

### Naming

- Files: `kebab-case.tsx` for routes/components, `camelCase.ts` for utilities
- Components: `PascalCase.tsx`
- Prisma models: `PascalCase`, optional `Translation` suffix
- Translation tables always have a `locale` column with the `Locale` enum

### Imports

Path aliases (see `tsconfig.json`):

- `@/components/*` — UI components
- `@/lib/*` — utilities (cn, dates, i18n, cloudinary, db)
- `@/services/*` — data access layer
- `@/server/*` — server-only helpers (auth)
- `@/types/*` — shared TypeScript types

### Services layer

Each entity has a `src/services/<entity>.service.ts`:

```ts
export async function getEntityList(locale, options) { ... }
export async function getEntityBySlug(slug, locale) { ... }
```

Services call Prisma. Server components and API routes call services, never Prisma directly.

### Server actions for admin

Each admin page has:
- `page.tsx` — server component, reads from DB
- `actions.ts` — server actions (`'use server'`) for create/update/delete
- `*Form.tsx` — client component wrapping the form with `useFormState`

Form pattern:

```tsx
// Form
const [state, action] = useFormState(serverAction, {});
// serverAction signature: (prev, formData) => Promise<{ error?, ok? }>
```

### API routes

- Public reads: `src/app/api/public/*`
- Admin writes: `src/app/api/admin/*` — call `getCurrentAdminApi()` for auth

### Design tokens

- DO NOT hardcode hex/font sizes. Use Tailwind classes (`bg-primary-800`, `text-accent-400`)
- Rebrand via `tailwind.config.ts`
- Admin panel uses the same tokens as the public site

### Don'ts

- ❌ Don't store images in the database — always upload to Cloudinary first
- ❌ Don't expose server secrets to client components (use `'use server'` files)
- ❌ Don't invent facts (teacher names, addresses). Use placeholder
- ❌ Don't bypass auth middleware — every admin route must be protected
- ❌ Don't add user accounts / login for the public site — only admins log in

## Adding a new content type

1. Add the model to `prisma/schema.prisma` + run `npm run db:push`
2. Create `src/services/<entity>.service.ts`
3. Create `src/app/api/admin/<entity>/route.ts` (POST, GET) + `[id]/route.ts` (PATCH, DELETE)
4. Create `src/app/admin/<entity>/page.tsx` (list) + `actions.ts` + `<Entity>Form.tsx`
5. Add navigation entry in `src/components/admin/AdminShell.tsx`

## Re-skinning

1. Replace `public/logo.jpeg` + regenerate favicons (`sips -z 32 32 ...`)
2. Update `tailwind.config.ts` palette
3. Update `messages/<locale>.json` (`metadata.siteFullName`, etc.)
4. No component-level changes needed
