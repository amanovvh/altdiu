/**
 * CLI script to create or update an admin user.
 *
 *   npm run admin:create -- --email admin@example.com --password "secret123" --name "Admin" --role SUPER_ADMIN
 *
 * If --password is omitted, you will be prompted interactively.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const prisma = new PrismaClient();

function parseArgs(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    const m = arg.match(/^--([^=]+)(?:=(.*))?$/);
    if (m) out[m[1]] = m[2] ?? 'true';
  }
  return out;
}

async function promptPassword(): Promise<string> {
  const rl = createInterface({ input, output });
  const pw = await rl.question('Password (min 8 chars): ');
  rl.close();
  return pw;
}

async function main() {
  const args = parseArgs();
  const email = (args.email ?? process.env.ADMIN_DEFAULT_EMAIL ?? 'admin@lyceum.uz')
    .toLowerCase()
    .trim();
  const name = args.name ?? process.env.ADMIN_DEFAULT_NAME ?? 'Administrator';
  const role = (args.role ?? 'EDITOR') as 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';

  let password = args.password ?? process.env.ADMIN_DEFAULT_PASSWORD;
  if (!password) password = await promptPassword();

  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const u = await prisma.adminUser.upsert({
    where: { email },
    create: { email, name, passwordHash, role, isActive: true },
    update: { name, passwordHash, role, isActive: true },
  });
  console.log(`\n✅ Admin "${u.email}" (${u.role}) ready.`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
