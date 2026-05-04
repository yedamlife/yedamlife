import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { updateRecord, deleteRecord } from '@/lib/admin/api-helpers';

const TABLE = 'membership_card_requests';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { success: false, error: 'not_found', message: '데이터를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }
    console.error('[Admin API] card-request detail error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  let membershipNo: string | null = null;
  if (data.membership_type && data.membership_id) {
    const table =
      data.membership_type === 'general'
        ? 'gf_membership_applications'
        : data.membership_type === 'corporate'
          ? 'cf_membership_applications'
          : null;
    if (table) {
      const { data: app } = await supabase
        .from(table)
        .select('membership_no')
        .eq('id', data.membership_id)
        .is('deleted_at', null)
        .maybeSingle();
      membershipNo = app?.membership_no ?? null;
    }
  }

  return NextResponse.json({ success: true, data: { ...data, membership_no: membershipNo } });
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
