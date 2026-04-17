import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseListParams, getStatusCounts } from '@/lib/admin/api-helpers';

const TABLE = 'bp_consultation_requests';
const SEARCH_COLUMNS = ['name', 'phone', 'region'];

export async function GET(request: Request) {
  const { page = 1, limit = 20, search, status, sort = 'created_at', order = 'desc' } =
    parseListParams(request.url);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from(TABLE)
    .select('*, bp_products!bp_consultation_requests_product_id_fkey(company_name)', {
      count: 'exact',
    });

  if (status) query = query.eq('status', status);

  if (search && SEARCH_COLUMNS.length > 0) {
    const orFilter = SEARCH_COLUMNS.map((col) => `${col}.ilike.%${search}%`).join(',');
    query = query.or(orFilter);
  }

  query = query.order(sort, { ascending: order === 'asc' }).range(from, to);

  const [listResult, statsResult] = await Promise.all([query, getStatusCounts(TABLE)]);

  if (listResult.error) {
    console.error(`[Admin API] ${TABLE} list error:`, listResult.error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  const data = (listResult.data ?? []).map((row) => {
    const { bp_products, ...rest } = row as Record<string, unknown>;
    const product = bp_products as { company_name?: string } | null;
    return { ...rest, product_name: product?.company_name ?? null };
  });

  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total: listResult.count || 0,
      total_pages: Math.ceil((listResult.count || 0) / limit),
    },
    stats: statsResult,
  });
}
