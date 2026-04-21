import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TABLE = 'notices';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);
  const search = searchParams.get('search') || undefined;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from(TABLE)
    .select('id, uuid, title, is_active, sort_order, view_count, created_at', {
      count: 'exact',
    });

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  query = query
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('[Admin API] notices list error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit),
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const required = ['title', 'content'];
  const missing = required.filter((f) => !body[f]);
  if (missing.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'validation_error',
        message: '필수 항목을 입력해주세요.',
        details: missing.map((f) => ({ field: f })),
      },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      title: body.title,
      content: body.content,
      is_active: body.is_active ?? true,
    })
    .select('id, uuid')
    .single();

  if (error) {
    console.error('[Admin API] notices create error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
