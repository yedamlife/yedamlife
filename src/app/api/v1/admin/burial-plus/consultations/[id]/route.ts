import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { updateRecord, deleteRecord } from '@/lib/admin/api-helpers';

const TABLE = 'bp_consultation_requests';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await supabase
    .from(TABLE)
    .select('*, bp_products!bp_consultation_requests_product_id_fkey(company_name)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { success: false, error: 'not_found', message: '데이터를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }
    console.error(`[Admin API] ${TABLE} detail error:`, error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  const { bp_products, ...rest } = data as Record<string, unknown>;
  const product = bp_products as { company_name?: string } | null;

  return NextResponse.json({
    success: true,
    data: { ...rest, product_name: product?.company_name ?? null },
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  return updateRecord(TABLE, id, body);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return deleteRecord(TABLE, id);
}
