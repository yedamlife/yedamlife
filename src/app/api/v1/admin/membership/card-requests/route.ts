import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseListParams, getStatusCounts } from '@/lib/admin/api-helpers';

const TABLE = 'membership_card_requests';
const SEARCH_COLUMNS = ['name', 'phone', 'address'];

interface CardRequestRow {
  id: string;
  membership_type: 'general' | 'corporate' | null;
  membership_id: string | null;
  [key: string]: unknown;
}

export async function GET(request: Request) {
  const params = parseListParams(request.url);
  const { page = 1, limit = 20, search, status, sort = 'created_at', order = 'desc' } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from(TABLE).select('*', { count: 'exact' }).is('deleted_at', null);
  if (status) query = query.eq('status', status);
  if (search) {
    const orFilter = SEARCH_COLUMNS.map((col) => `${col}.ilike.%${search}%`).join(',');
    query = query.or(orFilter);
  }
  query = query.order(sort, { ascending: order === 'asc' }).range(from, to);

  const [listResult, statsResult] = await Promise.all([query, getStatusCounts(TABLE)]);

  if (listResult.error) {
    console.error('[Admin API] card-requests list error:', listResult.error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  const rows = (listResult.data ?? []) as CardRequestRow[];
  const memberNoMap = await buildMembershipNoMap(rows);
  const enriched = rows.map((r) => ({
    ...r,
    membership_no:
      r.membership_type && r.membership_id
        ? memberNoMap.get(`${r.membership_type}:${r.membership_id}`) ?? null
        : null,
  }));

  return NextResponse.json({
    success: true,
    data: enriched,
    pagination: {
      page,
      limit,
      total: listResult.count || 0,
      total_pages: Math.ceil((listResult.count || 0) / limit),
    },
    stats: statsResult,
  });
}

export async function buildMembershipNoMap(
  rows: CardRequestRow[],
): Promise<Map<string, string | null>> {
  const generalIds = rows
    .filter((r) => r.membership_type === 'general' && r.membership_id)
    .map((r) => r.membership_id as string);
  const corporateIds = rows
    .filter((r) => r.membership_type === 'corporate' && r.membership_id)
    .map((r) => r.membership_id as string);

  const [gf, cf] = await Promise.all([
    generalIds.length
      ? supabase
          .from('gf_membership_applications')
          .select('id, membership_no')
          .in('id', generalIds)
          .is('deleted_at', null)
      : Promise.resolve({ data: [] }),
    corporateIds.length
      ? supabase
          .from('cf_membership_applications')
          .select('id, membership_no')
          .in('id', corporateIds)
          .is('deleted_at', null)
      : Promise.resolve({ data: [] }),
  ]);

  const map = new Map<string, string | null>();
  (gf.data ?? []).forEach((a: { id: string; membership_no: string | null }) =>
    map.set(`general:${a.id}`, a.membership_no),
  );
  (cf.data ?? []).forEach((a: { id: string; membership_no: string | null }) =>
    map.set(`corporate:${a.id}`, a.membership_no),
  );
  return map;
}
