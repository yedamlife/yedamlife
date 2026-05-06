import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseListParams } from '@/lib/admin/api-helpers';

const TABLE = 'fc_estimate_requests';
const SEARCH_COLUMNS = ['name', 'phone'];

export async function GET(request: Request) {
  const { page = 1, limit = 20, search, sort = 'created_at', order = 'desc' } =
    parseListParams(request.url);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .is('deleted_at', null);

  if (search) {
    const orFilter = SEARCH_COLUMNS.map((col) => `${col}.ilike.%${search}%`).join(',');
    query = query.or(orFilter);
  }

  query = query.order(sort, { ascending: order === 'asc' }).range(from, to);

  // 통계: 전체 / 3일장 / 무빈소 / 상담전환
  const [listResult, typeCounts, convertedUuids] = await Promise.all([
    query,
    supabase
      .from(TABLE)
      .select('funeral_type')
      .is('deleted_at', null),
    supabase
      .from('fc_consultation_requests')
      .select('estimate_uuid')
      .is('deleted_at', null)
      .not('estimate_uuid', 'is', null),
  ]);

  // 고객(customer) 알림톡 로그 매핑 (source_id별 최신 1건)
  const listIds = (listResult.data ?? []).map((r) => r.id as number);
  const alimtalkLogsResult = listIds.length
    ? await supabase
        .from('alimtalk_logs')
        .select('id, source_id, status')
        .eq('source_table', 'fc_estimate_requests')
        .eq('recipient_role', 'customer')
        .in('source_id', listIds)
        .order('id', { ascending: false })
    : { data: [] as { id: number; source_id: number; status: string }[] };

  const latestLogBySourceId = new Map<number, { status: string }>();
  for (const log of alimtalkLogsResult.data ?? []) {
    if (!latestLogBySourceId.has(log.source_id)) {
      latestLogBySourceId.set(log.source_id, { status: log.status });
    }
  }

  if (listResult.error) {
    console.error('[Admin API] fc_estimate_requests list error:', listResult.error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  const typeRows = typeCounts.data ?? [];
  const total = typeRows.length;
  const threeDay = typeRows.filter((r) => r.funeral_type === '3day').length;
  const nobinso = typeRows.filter((r) => r.funeral_type === 'nobinso').length;
  const convertedSet = new Set(
    (convertedUuids.data ?? []).map((r) => r.estimate_uuid as string),
  );
  const converted = convertedSet.size;

  // 각 row 에 상담 전환 여부 + 고객 알림톡 발송 상태 주입
  const rows = (listResult.data ?? []).map((row) => {
    const log = latestLogBySourceId.get(row.id);
    return {
      ...row,
      converted: convertedSet.has(row.uuid),
      customer_alimtalk_status: log?.status ?? null,
    };
  });

  return NextResponse.json({
    success: true,
    data: rows,
    pagination: {
      page,
      limit,
      total: listResult.count || 0,
      total_pages: Math.ceil((listResult.count || 0) / limit),
    },
    stats: { total, threeDay, nobinso, converted },
  });
}
