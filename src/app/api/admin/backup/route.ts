import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { getCurrentAdminApi } from '@/server/auth';
import { prisma } from '@/lib/db/prisma';

const execAsync = promisify(exec);

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 min

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdminApi();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const record = await prisma.backupRecord.create({
    data: {
      filename: `pending-${Date.now()}.dump`,
      size: 0,
      storage: 'local',
      status: 'RUNNING',
      startedAt: new Date(),
      triggeredBy: admin.id,
    },
  });

  const backupDir = process.env.BACKUP_PATH || path.join(process.cwd(), 'backups');
  await fs.mkdir(backupDir, { recursive: true });

  const filename = `lyceum-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
  const filepath = path.join(backupDir, filename);

  try {
    const dbUrl = new URL(process.env.DATABASE_URL || '');
    const command =
      `PGPASSWORD='${dbUrl.password}' pg_dump ` +
      `-h ${dbUrl.hostname} -p ${dbUrl.port || 5432} -U ${dbUrl.username} ` +
      `-d ${dbUrl.pathname.slice(1)} -F c -f "${filepath}"`;

    await execAsync(command, { shell: '/bin/sh' });
    const stats = await fs.stat(filepath);

    // Optional: cleanup older backups
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10);
    if (retentionDays > 0) {
      try {
        const files = await fs.readdir(backupDir);
        const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
        await Promise.all(
          files
            .filter((f) => f.endsWith('.sql'))
            .map(async (f) => {
              const s = await fs.stat(path.join(backupDir, f));
              if (s.mtimeMs < cutoff) {
                await fs.unlink(path.join(backupDir, f)).catch(() => {});
              }
            })
        );
      } catch (err) {
        console.error('cleanup failed', err);
      }
    }

    await prisma.backupRecord.update({
      where: { id: record.id },
      data: {
        filename,
        size: stats.size,
        status: 'SUCCESS',
        finishedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, filename, size: stats.size });
  } catch (err: any) {
    console.error('[backup] failed', err);
    await prisma.backupRecord.update({
      where: { id: record.id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        error: String(err?.message ?? err),
      },
    });
    return NextResponse.json({ error: 'Backup failed', detail: err.message }, { status: 500 });
  }
}

export async function GET() {
  const admin = await getCurrentAdminApi();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const records = await prisma.backupRecord.findMany({
    orderBy: { startedAt: 'desc' },
    take: 20,
  });
  return NextResponse.json({ records });
}
