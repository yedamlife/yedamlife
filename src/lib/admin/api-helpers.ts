import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function parseListParams(url: string): ListParams {
  const { searchParams } = new URL(url);
  return {
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 20,
    search: searchParams.get('search') || undefined,
    status: searchParams.get('status') || undefined,
    sort: searchParams.get('sort') || 'created_at',
    order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
  };
}

export async function getList(
  table: string,
  params: ListParams,
  searchColumns: string[] = ['name', 'contact_number'],
) {
  const { page = 1, limit = 20, search, status, sort = 'created_at', order = 'desc' } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from(table).select('*', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (search && searchColumns.length > 0) {
    const orFilter = searchColumns.map((col) => `${col}.ilike.%${search}%`).join(',');
    query = query.or(orFilter);
  }

  query = query.order(sort, { ascending: order === 'asc' }).range(from, to);

  // 리스트 조회 + 통계 카운트를 병렬 실행
  const [listResult, statsResult] = await Promise.all([
    query,
    getStatusCounts(table),
  ]);

  if (listResult.error) {
    console.error(`[Admin API] ${table} list error:`, listResult.error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: listResult.data,
    pagination: {
      page,
      limit,
      total: listResult.count || 0,
      total_pages: Math.ceil((listResult.count || 0) / limit),
    },
    stats: statsResult,
  });
}

export async function getDetail(table: string, id: string) {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { success: false, error: 'not_found', message: '데이터를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }
    console.error(`[Admin API] ${table} detail error:`, error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data });
}

export async function updateRecord(table: string, id: string, body: Record<string, unknown>) {
  const { data, error } = await supabase
    .from(table)
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
    .single();

  if (error) {
    console.error(`[Admin API] ${table} update error:`, error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: { id: data.id } });
}

export async function deleteRecord(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq('id', id);

  if (error) {
    console.error(`[Admin API] ${table} delete error:`, error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, message: '삭제되었습니다.' });
}

export async function getStatusCounts(table: string) {
  // status 컬럼만 전체 조회 후 JS에서 집계 (DB 1회)
  const { data } = await supabase.from(table).select('status');
  const rows = data || [];
  const total = rows.length;
  let pending = 0;
  let inProgress = 0;
  let completed = 0;

  for (const row of rows) {
    const s = row.status;
    if (s === 'pending') pending++;
    else if (s === 'in_progress') inProgress++;
    else if (s === 'completed') completed++;
  }

  return { total, pending, in_progress: inProgress, completed };
}
