import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { deleteRecord, updateRecord } from '@/lib/admin/api-helpers';

const TABLE = 'fc_estimate_requests';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: estimate, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !estimate) {
    if (error?.code === 'PGRST116' || !estimate) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: '데이터를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }
    console.error('[Admin API] fc_estimate_requests detail error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  // 상담 이력 + 장례식장/지역 라벨 + 알림톡 발송 로그 조회 (병렬)
  const [
    consultationsResult,
    hallResult,
    sidoResult,
    gunguResult,
    alimtalkLogResult,
  ] = await Promise.all([
      supabase
        .from('fc_consultation_requests')
        .select(
          'id, selected_product_id, selected_product_name, consult_status, created_at',
        )
        .eq('estimate_uuid', estimate.uuid)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
      estimate.facility_cd
        ? supabase
            .from('funeral_halls')
            .select('facility_cd, company_name, full_address')
            .eq('facility_cd', estimate.facility_cd)
            .is('deleted_at', null)
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null as null }),
      estimate.sido_cd
        ? supabase
            .from('funeral_halls')
            .select('org_name')
            .eq('sido_cd', estimate.sido_cd)
            .is('deleted_at', null)
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null as null }),
      estimate.gungu_cd
        ? supabase
            .from('funeral_halls')
            .select('org_name')
            .eq('gungu_cd', estimate.gungu_cd)
            .is('deleted_at', null)
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null as null }),
      supabase
        .from('alimtalk_logs')
        .select(
          'id, template_code, status, channel, error_code, error_message, requested_at, sent_at, recipient_role',
        )
        .eq('source_table', 'fc_estimate_requests')
        .eq('source_id', estimate.id)
        .eq('recipient_role', 'customer')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const sidoName =
    (sidoResult.data?.org_name as string | undefined)?.split(' ')[0] ?? null;
  const gunguName = (gunguResult.data?.org_name as string | undefined) ?? null;

  return NextResponse.json({
    success: true,
    data: {
      ...estimate,
      consultations: consultationsResult.data ?? [],
      sido_name: sidoName,
      gungu_name: gunguName,
      hall: hallResult.data
        ? {
            facility_cd: hallResult.data.facility_cd,
            company_name: hallResult.data.company_name,
            full_address: hallResult.data.full_address,
          }
        : null,
      alimtalk_log: alimtalkLogResult.data ?? null,
    },
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
