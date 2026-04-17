import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const SORT_COLUMN: Record<string, string> = {
  '전체': 'sort_all',
  '봉안당': 'sort_charnel',
  '수목장': 'sort_tree',
  '공원묘지': 'sort_park',
  '해양장': 'sort_ocean',
};

interface OrderItem {
  id: number;
  sort_value: number;
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { items?: OrderItem[]; category?: string };
  const items = body.items ?? [];
  const category = body.category ?? '전체';
  const sortCol = SORT_COLUMN[category];

  if (!sortCol) {
    return NextResponse.json(
      { success: false, error: 'invalid', message: `잘못된 카테고리: ${category}` },
      { status: 400 },
    );
  }
  if (items.length === 0) {
    return NextResponse.json(
      { success: false, error: 'invalid', message: 'items 누락' },
      { status: 400 },
    );
  }

  const updates = await Promise.all(
    items.map((it) =>
      supabase
        .from('bp_products')
        .update({ [sortCol]: it.sort_value, updated_at: new Date().toISOString() })
        .eq('id', it.id),
    ),
  );

  const failed = updates.find((r) => r.error);
  if (failed?.error) {
    console.error('[Admin API] bp_products reorder error:', failed.error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: failed.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
