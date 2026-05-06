import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { deleteRecord, updateRecord } from '@/lib/admin/api-helpers';

const TABLE = 'fc_consultation_requests';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    if (error?.code === 'PGRST116' || !data) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: '데이터를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }
    console.error('[Admin API] fc_consultation_requests detail error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  // 매칭되는 견적 요청 (장례비용 전송 내역)
  let estimate: {
    id: number;
    uuid: string;
    funeral_type: string;
    name: string;
    phone: string;
  } | null = null;
  if (data.estimate_request_id) {
    const { data: est } = await supabase
      .from('fc_estimate_requests')
      .select('id, uuid, funeral_type, name, phone')
      .eq('id', data.estimate_request_id)
      .is('deleted_at', null)
      .maybeSingle();
    estimate = est ?? null;
  } else if (data.estimate_uuid) {
    const { data: est } = await supabase
      .from('fc_estimate_requests')
      .select('id, uuid, funeral_type, name, phone')
      .eq('uuid', data.estimate_uuid)
      .is('deleted_at', null)
      .maybeSingle();
    estimate = est ?? null;
  }

  return NextResponse.json({
    success: true,
    data: { ...data, estimate },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  return updateRecord(TABLE, id, body);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return deleteRecord(TABLE, id);
}
