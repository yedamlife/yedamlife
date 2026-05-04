import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { buildCertificateCode, getKstDayBoundsUtc } from '@/lib/religion';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { success: false, error: 'invalid_id', message: '잘못된 요청입니다.' },
        { status: 400 },
      );
    }

    // 1) 후불제상조 → 2) 기업상조 순으로 매칭
    const gf = await supabase
      .from('gf_membership_applications')
      .select('id, uuid, name, phone, membership_no, religion, created_at')
      .eq('uuid', id)
      .is('deleted_at', null)
      .maybeSingle();

    let app: {
      id: number;
      uuid: string;
      name: string;
      phone: string;
      membership_no: string | null;
      religion: string | null;
      created_at: string;
      type: 'general' | 'corporate';
    } | null = null;

    if (gf.data) {
      app = { ...gf.data, type: 'general' };
    } else {
      const cf = await supabase
        .from('cf_membership_applications')
        .select('id, uuid, name, phone, membership_no, created_at')
        .eq('uuid', id)
        .is('deleted_at', null)
        .maybeSingle();
      if (cf.data) {
        app = { ...cf.data, religion: null, type: 'corporate' };
      }
    }

    if (!app) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: '가입 신청 내역이 없습니다.' },
        { status: 404 },
      );
    }

    // 일별 순번: 같은 KST 날짜 + 같은 테이블 내 created_at 순위
    const table = app.type === 'general' ? 'gf_membership_applications' : 'cf_membership_applications';
    const { start } = getKstDayBoundsUtc(app.created_at);
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .gte('created_at', start)
      .lte('created_at', app.created_at);
    const dailySequence = count ?? 1;
    const membershipCode = buildCertificateCode(app.created_at, dailySequence, app.religion);

    return NextResponse.json({
      success: true,
      data: {
        id: app.uuid,
        name: app.name,
        phone: app.phone,
        membership_no: app.membership_no,
        membership_code: membershipCode,
        daily_sequence: dailySequence,
        membership_type: app.type,
        religion: app.religion,
        created_at: app.created_at,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
