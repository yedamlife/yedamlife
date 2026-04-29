import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendAlimtalk, productLabel } from '@/lib/alimtalk';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['product', 'name', 'phone', 'region', 'preferred_time'];
    const missing = requiredFields.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'validation_error',
          message: '필수 항목을 입력해주세요.',
          details: missing.map((field) => ({ field, message: `${field}을(를) 입력해주세요.` })),
        },
        { status: 400 },
      );
    }

    if (!body.privacy_agreed) {
      return NextResponse.json(
        {
          success: false,
          error: 'validation_error',
          message: '개인정보 수집 및 이용에 동의해주세요.',
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('cf_consultation_requests')
      .insert({
        product: body.product,
        name: body.name,
        phone: body.phone,
        region: body.region,
        preferred_time: body.preferred_time,
        privacy_agreed: body.privacy_agreed,
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

    sendAlimtalk(
      'CF_CONSULT',
      {
        상품: productLabel(body.product),
        고객명: body.name,
        연락처: body.phone,
        지역: body.region,
        상담시간: body.preferred_time,
      },
      { customerPhone: body.phone, host: request.headers.get('host') },
    ).catch(() => {});

    return NextResponse.json({ success: true, data: { id: data.id } }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
