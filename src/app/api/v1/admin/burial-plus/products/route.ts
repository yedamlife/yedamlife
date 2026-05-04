import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TABLE = 'bp_products';
const DEFAULT_LIMIT = 20;

const SORT_COLUMN: Record<string, string> = {
  '전체': 'sort_all',
  '봉안당': 'sort_charnel',
  '수목장': 'sort_tree',
  '공원묘지': 'sort_park',
  '해양장': 'sort_ocean',
};
const SORT_COLUMNS_CSV = Object.values(SORT_COLUMN).join(', ');

const SELECT_COLUMNS =
  `id, uuid, facility_cd, company_name, sido_name, full_address, public_label, categories, religions, photos, min_price, is_recommended, is_active, ${SORT_COLUMNS_CSV}, created_at, updated_at`;

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
  const limit = Math.min(Number(searchParams.get('limit')) || DEFAULT_LIMIT, 100);
  const cursor = decodeCursor(searchParams.get('cursor'));
  const search = searchParams.get('search') || undefined;
  const category = searchParams.get('category') || '전체';
  const activeFilter = searchParams.get('is_active');
  const publicLabel = searchParams.get('public_label') || undefined;
  const hasReligion = searchParams.get('has_religion');

  const sortCol = SORT_COLUMN[category] ?? 'sort_all';

  let query = supabase
    .from(TABLE)
    .select(SELECT_COLUMNS, { count: cursor ? undefined : 'exact' })
    .is('deleted_at', null);

  if (category && category !== '전체') {
    query = query.contains('categories', [category]);
  }

  if (publicLabel === '공설' || publicLabel === '사설') {
    query = query.eq('public_label', publicLabel);
  }

  if (activeFilter === 'true') query = query.eq('is_active', true);
  else if (activeFilter === 'false') query = query.eq('is_active', false);

  if (hasReligion === 'true') {
    query = query.overlaps('religions', ['기독교', '불교', '천주교']);
  }

  if (search) {
    query = query.ilike('company_name', `%${search}%`);
  }

  // 커서: (sort_col, id) > (cursor.sort, cursor.id)
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
    console.error('[Admin API] bp_products list error:', error);
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
      ? encodeCursor({ sort: (last as Record<string, unknown>)[sortCol] as number, id: last.id })
      : null;

  return NextResponse.json({
    success: true,
    data: page,
    sort_column: sortCol,
    next_cursor: nextCursor,
    has_more: hasMore,
    total: cursor ? undefined : count ?? 0,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      facility_cd: body.facility_cd,
      menu_id: body.menu_id ?? 'M0001000100000000',
      facility_group_cd: body.facility_group_cd ?? '',
      categories: body.categories ?? [],
      religions: body.religions ?? [],
      intro: body.intro ?? {},
      price: body.price ?? {},
      photos: body.photos ?? [],
      related_facilities: body.related_facilities ?? [],
      package_list: body.package_list ?? [],
      min_price: body.min_price ?? null,
      is_recommended: body.is_recommended ?? false,
      is_active: body.is_active ?? true,
    })
    .select('id, uuid')
    .single();

  if (error) {
    console.error('[Admin API] bp_products create error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
