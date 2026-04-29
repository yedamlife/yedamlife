import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const normalizePhone = (raw: string) => raw.replace(/[^0-9]/g, '');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = (searchParams.get('name') || '').trim();
    const phone = normalizePhone(searchParams.get('phone') || '');

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'validation_error', message: '이름과 연락처가 필요합니다.' },
        { status: 400 },
      );
    }

    // 1) 일반상조
    const gf = await supabase
      .from('gf_membership_applications')
      .select('id, membership_no, name, phone')
      .eq('name', name)
      .order('created_at', { ascending: false });

    const gfMatch = gf.data?.find((r) => normalizePhone(r.phone || '') === phone);
    if (gfMatch) {
      return NextResponse.json({
        success: true,
        data: {
          membership_no: gfMatch.membership_no,
          membership_type: 'general',
          membership_id: gfMatch.id,
        },
      });
    }

    // 2) 기업상조
    const cf = await supabase
      .from('cf_membership_applications')
      .select('id, membership_no, name, phone')
      .eq('name', name)
      .order('created_at', { ascending: false });

    const cfMatch = cf.data?.find((r) => normalizePhone(r.phone || '') === phone);
    if (cfMatch) {
      return NextResponse.json({
        success: true,
        data: {
          membership_no: cfMatch.membership_no,
          membership_type: 'corporate',
          membership_id: cfMatch.id,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'not_found', message: '가입 내역을 찾을 수 없습니다.' },
      { status: 404 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
