import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const limit = Math.min(Number(searchParams.get('limit')) || 6, 20);

  if (!category) {
    return NextResponse.json(
      { success: false, message: 'category is required' },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('id, author, written_at, title, content, tags')
    .eq('category', category)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data });
}
