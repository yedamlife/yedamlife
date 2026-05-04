import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('reviews')
    .select('id, category, author, written_at, title, content')
    .eq('id', id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, message: '후기를 찾을 수 없습니다.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data });
}
