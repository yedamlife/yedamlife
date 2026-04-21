import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TABLE = 'notices';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { error } = await supabase.rpc('increment_notice_view_count', { notice_id: Number(id) });

  if (error) {
    // fallback: rpc가 없으면 직접 업데이트
    const { data } = await supabase.from(TABLE).select('view_count').eq('id', id).single();
    if (data) {
      await supabase.from(TABLE).update({ view_count: (data.view_count ?? 0) + 1 }).eq('id', id);
    }
  }

  return NextResponse.json({ success: true });
}
