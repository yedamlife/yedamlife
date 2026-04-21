import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TABLE = 'notices';

export async function PATCH(request: Request) {
  const body: { ids: number[] } = await request.json();

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json(
      { success: false, error: 'validation_error', message: 'ids 배열이 필요합니다.' },
      { status: 400 },
    );
  }

  const updates = body.ids.map((id, idx) =>
    supabase.from(TABLE).update({ sort_order: idx, updated_at: new Date().toISOString() }).eq('id', id),
  );

  const results = await Promise.all(updates);
  const failed = results.filter((r) => r.error);

  if (failed.length > 0) {
    console.error('[Admin API] notices reorder errors:', failed.map((r) => r.error));
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '일부 정렬 업데이트에 실패했습니다.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
