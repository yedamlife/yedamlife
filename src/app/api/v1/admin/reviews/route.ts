import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TABLE = 'reviews';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const hasTags = searchParams.get('has_tags') === 'true';
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from(TABLE)
    .select('id, uuid, category, author, written_at, title, tags, is_active, display_order, created_at', {
      count: 'exact',
    });

  if (category) query = query.eq('category', category);

  if (hasTags) {
    query = query.not('tags', 'is', null).neq('tags', '{}');
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,content.ilike.%${search}%,author.ilike.%${search}%`,
    );
  }

  query = query.order('id', { ascending: false }).range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('[Admin API] reviews list error:', error);
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

  const required = ['category', 'author', 'written_at', 'content'];
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
      category: body.category,
      author: body.author,
      written_at: body.written_at,
      title: body.title || null,
      content: body.content,
      tags: Array.isArray(body.tags) ? body.tags : [],
      is_active: body.is_active ?? true,
    })
    .select('id, uuid')
    .single();

  if (error) {
    console.error('[Admin API] reviews create error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
