import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TABLE = 'notices';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 10, 20);
  const category = searchParams.get('category') || undefined;

  let query = supabase
    .from(TABLE)
    .select('id, title, category, created_at')
    .eq('is_active', true)
    .is('deleted_at', null);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data });
}
