import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TABLE = 'bp_products';

const SELECT_COLUMNS =
  'id, company_name, sido_name, full_address, public_label, categories, intro, price, photos, thumbnail_url, related_facilities, min_price';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_COLUMNS)
    .eq('id', id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { success: false, error: 'not_found', message: '데이터를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }
    console.error('[Public API] bp_products detail error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data });
}
