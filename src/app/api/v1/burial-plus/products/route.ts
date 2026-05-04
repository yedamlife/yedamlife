import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TABLE = 'bp_products';
const DEFAULT_LIMIT = 10;

const SORT_COLUMN: Record<string, string> = {
  '전체': 'sort_all',
  '봉안당': 'sort_charnel',
  '수목장': 'sort_tree',
  '공원묘지': 'sort_park',
  '해양장': 'sort_ocean',
};

const SELECT_COLUMNS =
  'id, company_name, sido_name, full_address, public_label, categories, religions, photos, thumbnail_url, min_price, is_recommended, sort_all, sort_charnel, sort_tree, sort_park, sort_ocean';

interface Cursor {
  sort: number;
  id: number;
}

function decodeCursor(raw: string | null): Cursor | null {
  if (!raw) return null;
  try {
    const decoded = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
    if (typeof decoded.sort === 'number' && typeof decoded.id === 'number') {
      return decoded;
    }
  } catch {
    return null;
  }
  return null;
}

function encodeCursor(c: Cursor): string {
  return Buffer.from(JSON.stringify(c), 'utf-8').toString('base64');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || DEFAULT_LIMIT, 50);
  const cursor = decodeCursor(searchParams.get('cursor'));
  const category = searchParams.get('category') || '전체';
  const sido = searchParams.get('sido') || undefined;
  const sigungu = searchParams.get('sigungu') || undefined;
  const search = searchParams.get('search') || undefined;
  const publicLabel = searchParams.get('public_label') || undefined;
  const religionsParam = searchParams.get('religions') || undefined;
  const religions = religionsParam
    ? religionsParam.split(',').map((r) => r.trim()).filter(Boolean)
    : [];
  const minPriceParam = searchParams.get('min_price');
  const maxPriceParam = searchParams.get('max_price');
  const minPrice = minPriceParam != null ? Number(minPriceParam) : null;
  const maxPrice = maxPriceParam != null ? Number(maxPriceParam) : null;

  const sortCol = SORT_COLUMN[category] ?? 'sort_all';

  let query = supabase
    .from(TABLE)
    .select(SELECT_COLUMNS, { count: cursor ? undefined : 'exact' })
    .eq('is_active', true)
    .is('deleted_at', null);

  if (category && category !== '전체') {
    query = query.contains('categories', [category]);
  }

  if (sido) {
    query = query.ilike('sido_name', `${sido}%`);
  }

  if (sigungu && sigungu !== '전체') {
    query = query.ilike('sido_name', `%${sigungu}%`);
  }

  if (publicLabel === '공설' || publicLabel === '사설') {
    query = query.eq('public_label', publicLabel);
  }

  if (religions.length > 0) {
    query = query.overlaps('religions', religions);
  }

  if (minPrice != null && Number.isFinite(minPrice)) {
    query = query.gte('min_price', minPrice);
  }
  if (maxPrice != null && Number.isFinite(maxPrice)) {
    query = query.lte('min_price', maxPrice);
  }

  if (search) {
    query = query.or(
      `sido_name.ilike.%${search}%,full_address.ilike.%${search}%`,
    );
  }

  if (cursor) {
    query = query.or(
      `${sortCol}.gt.${cursor.sort},and(${sortCol}.eq.${cursor.sort},id.gt.${cursor.id})`,
    );
  }

  query = query
    .order(sortCol, { ascending: true })
    .order('id', { ascending: true })
    .limit(limit + 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('[Public API] bp_products list error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page[page.length - 1];
  const nextCursor =
    hasMore && last
      ? encodeCursor({ sort: last[sortCol as keyof typeof last] as number, id: last.id })
      : null;

  return NextResponse.json({
    success: true,
    data: page,
    next_cursor: nextCursor,
    has_more: hasMore,
    total: cursor ? undefined : count ?? 0,
  });
}
