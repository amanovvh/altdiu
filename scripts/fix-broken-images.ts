/**
 * fix-broken-images.ts
 *
 * Diagnoses broken image URLs in the database (e.g. references to a deleted
 * Vercel Blob store) and optionally clears them so the admin panel can show
 * the entities as "needs re-upload".
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/fix-broken-images.ts           # dry-run
 *   DATABASE_URL=... npx tsx scripts/fix-broken-images.ts --fix     # clear broken
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DO_FIX = process.argv.includes('--fix');

const TIMEOUT_MS = 8000;

async function checkUrl(url: string | null | undefined): Promise<'ok' | 'broken' | 'skip'> {
  if (!url) return 'skip';
  // Skip local paths — they belong to a different storage driver.
  if (url.startsWith('/uploads/') || url.startsWith('/images/')) return 'skip';
  // Skip Cloudinary public_ids (they don't contain a host).
  if (!url.startsWith('http')) return 'skip';

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
    clearTimeout(t);
    return res.ok ? 'ok' : 'broken';
  } catch {
    clearTimeout(t);
    return 'broken';
  }
}

interface BrokenRecord {
  table: string;
  id: string;
  field: string;
  url: string;
}

async function main() {
  console.log(`\n🔍 Scanning image URLs in the database${DO_FIX ? ' (FIX mode)' : ' (dry-run)'}\n`);

  const broken: BrokenRecord[] = [];
  let scanned = 0;

  // 1) News
  const newsList = await prisma.news.findMany({
    select: { id: true, coverImage: true, images: true, translations: { select: { title: true, locale: true } } },
  });
  for (const n of newsList) {
    scanned++;
    const c = await checkUrl(n.coverImage);
    if (c === 'broken') broken.push({ table: 'News', id: n.id, field: 'coverImage', url: n.coverImage! });
    for (let i = 0; i < n.images.length; i++) {
      const r = await checkUrl(n.images[i]);
      if (r === 'broken') broken.push({ table: 'News', id: n.id, field: `images[${i}]`, url: n.images[i] });
    }
  }

  // 2) Teachers
  const teachers = await prisma.teacher.findMany({
    select: { id: true, photo: true, translations: { select: { fullName: true, locale: true } } },
  });
  for (const t of teachers) {
    scanned++;
    const r = await checkUrl(t.photo);
    if (r === 'broken') broken.push({ table: 'Teacher', id: t.id, field: 'photo', url: t.photo! });
  }

  // 3) Achievements
  const achievements = await prisma.achievement.findMany({
    select: { id: true, image: true, images: true, translations: { select: { title: true, locale: true } } },
  });
  for (const a of achievements) {
    scanned++;
    const r = await checkUrl(a.image);
    if (r === 'broken') broken.push({ table: 'Achievement', id: a.id, field: 'image', url: a.image! });
    for (let i = 0; i < a.images.length; i++) {
      const r2 = await checkUrl(a.images[i]);
      if (r2 === 'broken') broken.push({ table: 'Achievement', id: a.id, field: `images[${i}]`, url: a.images[i] });
    }
  }

  // 4) Administrators
  const admins = await prisma.administrator.findMany({
    select: { id: true, photo: true, images: true, translations: { select: { fullName: true, locale: true } } },
  });
  for (const a of admins) {
    scanned++;
    const r = await checkUrl(a.photo);
    if (r === 'broken') broken.push({ table: 'Administrator', id: a.id, field: 'photo', url: a.photo! });
    for (let i = 0; i < a.images.length; i++) {
      const r2 = await checkUrl(a.images[i]);
      if (r2 === 'broken') broken.push({ table: 'Administrator', id: a.id, field: `images[${i}]`, url: a.images[i] });
    }
  }

  // 5) WhyChooseUs
  const cards = await prisma.whyChooseUsCard.findMany({
    select: { id: true, image: true, translations: { select: { title: true, locale: true } } },
  });
  for (const c of cards) {
    scanned++;
    const r = await checkUrl(c.image);
    if (r === 'broken') broken.push({ table: 'WhyChooseUsCard', id: c.id, field: 'image', url: c.image! });
  }

  // 6) Partners
  const partners = await prisma.partner.findMany({
    select: { id: true, logo: true, translations: { select: { name: true, locale: true } } },
  });
  for (const p of partners) {
    scanned++;
    const r = await checkUrl(p.logo);
    if (r === 'broken') broken.push({ table: 'Partner', id: p.id, field: 'logo', url: p.logo! });
  }

  // 7) GalleryAlbum + GalleryImage
  const albums = await prisma.galleryAlbum.findMany({
    select: { id: true, coverImage: true, translations: { select: { title: true, locale: true } } },
  });
  for (const a of albums) {
    scanned++;
    const r = await checkUrl(a.coverImage);
    if (r === 'broken') broken.push({ table: 'GalleryAlbum', id: a.id, field: 'coverImage', url: a.coverImage! });
  }
  const gimages = await prisma.galleryImage.findMany({ select: { id: true, albumId: true, publicId: true } });
  for (const g of gimages) {
    scanned++;
    const r = await checkUrl(g.publicId);
    if (r === 'broken') broken.push({ table: 'GalleryImage', id: g.id, field: 'publicId', url: g.publicId });
  }

  // Report
  console.log(`📊 Scanned ${scanned} records across 7 tables.\n`);
  if (broken.length === 0) {
    console.log('✅ No broken image URLs found!\n');
  } else {
    console.log(`❌ Found ${broken.length} broken image URL(s):\n`);
    // Group by table
    const byTable = broken.reduce<Record<string, BrokenRecord[]>>((acc, b) => {
      (acc[b.table] ||= []).push(b);
      return acc;
    }, {});
    for (const [table, list] of Object.entries(byTable)) {
      console.log(`  📋 ${table}: ${list.length} broken`);
      list.forEach((b) => {
        const shortUrl = b.url.length > 70 ? b.url.slice(0, 67) + '...' : b.url;
        console.log(`     · ${b.field}: ${shortUrl}`);
      });
    }

    if (DO_FIX) {
      console.log('\n🔧 Clearing broken URLs...');
      let cleared = 0;
      for (const b of broken) {
        try {
          if (b.table === 'News') {
            if (b.field === 'coverImage') {
              await prisma.news.update({ where: { id: b.id }, data: { coverImage: null } });
            } else {
              const m = b.field.match(/^images\[(\d+)\]$/);
              if (m) {
                const news = await prisma.news.findUnique({ where: { id: b.id }, select: { images: true } });
                if (news) {
                  const arr = [...news.images];
                  arr[Number(m[1])] = '';
                  await prisma.news.update({ where: { id: b.id }, data: { images: arr.filter((x) => x) } });
                }
              }
            }
          } else if (b.table === 'Teacher') {
            await prisma.teacher.update({ where: { id: b.id }, data: { photo: null } });
          } else if (b.table === 'Achievement') {
            if (b.field === 'image') {
              await prisma.achievement.update({ where: { id: b.id }, data: { image: null } });
            } else {
              const m = b.field.match(/^images\[(\d+)\]$/);
              if (m) {
                const ach = await prisma.achievement.findUnique({ where: { id: b.id }, select: { images: true } });
                if (ach) {
                  const arr = [...ach.images];
                  arr[Number(m[1])] = '';
                  await prisma.achievement.update({ where: { id: b.id }, data: { images: arr.filter((x) => x) } });
                }
              }
            }
          } else if (b.table === 'Administrator') {
            if (b.field === 'photo') {
              await prisma.administrator.update({ where: { id: b.id }, data: { photo: null } });
            } else {
              const m = b.field.match(/^images\[(\d+)\]$/);
              if (m) {
                const adm = await prisma.administrator.findUnique({ where: { id: b.id }, select: { images: true } });
                if (adm) {
                  const arr = [...adm.images];
                  arr[Number(m[1])] = '';
                  await prisma.administrator.update({ where: { id: b.id }, data: { images: arr.filter((x) => x) } });
                }
              }
            }
          } else if (b.table === 'WhyChooseUsCard') {
            await prisma.whyChooseUsCard.update({ where: { id: b.id }, data: { image: null } });
          } else if (b.table === 'Partner') {
            await prisma.partner.update({ where: { id: b.id }, data: { logo: null } });
          } else if (b.table === 'GalleryAlbum') {
            await prisma.galleryAlbum.update({ where: { id: b.id }, data: { coverImage: null } });
          } else if (b.table === 'GalleryImage') {
            await prisma.galleryImage.delete({ where: { id: b.id } });
          }
          cleared++;
        } catch (e) {
          console.error(`  ⚠️  Failed to clear ${b.table}.${b.field} (${b.id}):`, e);
        }
      }
      console.log(`\n✅ Cleared ${cleared} broken URL(s). Admin panel will now show them as "needs upload".`);
    } else {
      console.log('\n💡 Run with --fix to clear these broken URLs:');
      console.log('   DATABASE_URL=... npx tsx scripts/fix-broken-images.ts --fix\n');
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
