import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const VALID_SERVICE_TYPES = ['심리 상담', '세무 상담', '상속 절차', '법률 지원'];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const missing: { field: string; message: string }[] = [];
    if (!body.name) missing.push({ field: 'name', message: '이름을 입력해주세요.' });
    if (!body.phone) missing.push({ field: 'phone', message: '연락처를 입력해주세요.' });
    if (!body.service_type || !VALID_SERVICE_TYPES.includes(body.service_type)) {
      missing.push({ field: 'service_type', message: '상담 유형을 선택해주세요.' });
    }

    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'validation_error',
          message: '필수 항목을 입력해주세요.',
          details: missing,
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('pc_consultation_requests')
      .insert({
        name: body.name,
        phone: body.phone,
        region: body.region || null,
        service_type: body.service_type,
        message: body.message || null,
        privacy_agreed: body.privacy_agreed,
        third_party_agreed: body.third_party_agreed,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: { id: data.id } }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
