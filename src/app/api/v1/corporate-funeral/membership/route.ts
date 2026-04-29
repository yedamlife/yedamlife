import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendAlimtalk, productLabel } from '@/lib/alimtalk';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = [
      'name', 'phone', 'gender',
      'address', 'company_name', 'product',
    ];
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
      .from('cf_membership_applications')
      .insert({
        name: body.name,
        phone: body.phone,
        gender: body.gender,
        address: body.address,
        address_detail: body.address_detail || null,
        company_name: body.company_name,
        position: body.position || null,
        product: body.product,
        referrer: body.referrer || null,
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
      'CF_MEMBER',
      {
        신청인: body.name,
        휴대폰: body.phone,
        기업명: body.company_name,
        직급: body.position,
        주소: body.address,
        상세주소: body.address_detail,
        가입상품: productLabel(body.product),
        추천인: body.referrer,
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
