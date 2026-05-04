import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendAlimtalk } from '@/lib/alimtalk';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['name', 'phone', 'company_name'];
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
        company_name: body.company_name,
        position: body.position || null,
        manager_email: body.manager_email || null,
        referrer: body.referrer || null,
        other_requirements: body.other_requirements || null,
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
        담당자이메일: body.manager_email,
        추천인: body.referrer,
        기타요구사항: body.other_requirements,
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
