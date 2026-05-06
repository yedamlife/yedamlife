import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseListParams } from '@/lib/admin/api-helpers';

const TABLE = 'fc_consultation_requests';
const SEARCH_COLUMNS = ['name', 'phone', 'selected_product_name'];

export async function GET(request: Request) {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    sort = 'created_at',
    order = 'desc',
  } = parseListParams(request.url);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .is('deleted_at', null);

  if (status) {
    query = query.eq('consult_status', status);
  }

  if (search) {
    const orFilter = SEARCH_COLUMNS.map((col) => `${col}.ilike.%${search}%`).join(
      ',',
    );
    query = query.or(orFilter);
  }

  query = query.order(sort, { ascending: order === 'asc' }).range(from, to);

  const [listResult, statusRows] = await Promise.all([
    query,
    supabase.from(TABLE).select('consult_status').is('deleted_at', null),
  ]);

  if (listResult.error) {
    console.error('[Admin API] fc_consultation_requests list error:', listResult.error);
    return NextResponse.json(
      {
        success: false,
        error: 'internal_error',
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }

  const rows = statusRows.data ?? [];
  const total = rows.length;
  let pending = 0;
  let contacted = 0;
  let closedWon = 0;
  let closedLost = 0;
  for (const r of rows) {
    if (r.consult_status === 'pending') pending++;
    else if (r.consult_status === 'contacted') contacted++;
    else if (r.consult_status === 'closed_won') closedWon++;
    else if (r.consult_status === 'closed_lost') closedLost++;
  }

  return NextResponse.json({
    success: true,
    data: listResult.data ?? [],
    pagination: {
      page,
      limit,
      total: listResult.count || 0,
      total_pages: Math.ceil((listResult.count || 0) / limit),
    },
    stats: {
      total,
      pending,
      contacted,
      closed_won: closedWon,
      closed_lost: closedLost,
    },
  });
}
