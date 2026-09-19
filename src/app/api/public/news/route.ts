import { NextRequest, NextResponse } from 'next/server';
import { getNewsList } from '@/services/news.service';
import { isValidLocale } from '@/lib/i18n/config';

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') ?? 'ru';
  if (!isValidLocale(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
  }
  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(req.nextUrl.searchParams.get('pageSize') ?? '12', 10);
  const category = req.nextUrl.searchParams.get('category') ?? undefined;

  const result = await getNewsList(locale, { page, pageSize, category: category ?? undefined });
  return NextResponse.json(result);
}
