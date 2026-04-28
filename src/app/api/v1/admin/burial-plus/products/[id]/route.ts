import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TABLE = 'bp_products';

const EDITABLE_FIELDS = [
  'categories',
  'religions',
  'intro',
  'price',
  'photos',
  'related_facilities',
  'package_list',
  'min_price',
  'thumbnail_url',
  'is_recommended',
  'is_active',
  'sort_all',
  'sort_charnel',
  'sort_tree',
  'sort_park',
  'sort_ocean',
] as const;

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { success: false, error: 'not_found', message: '데이터를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }
    console.error('[Admin API] bp_products detail error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of EDITABLE_FIELDS) {
    if (key in body) payload[key] = body[key];
  }

  const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select('id').single();

  if (error) {
    console.error('[Admin API] bp_products update error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: { id: data.id } });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { error } = await supabase.from(TABLE).delete().eq('id', id);

  if (error) {
    console.error('[Admin API] bp_products delete error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, message: '삭제되었습니다.' });
}
