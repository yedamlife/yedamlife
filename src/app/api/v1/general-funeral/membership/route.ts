import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['name', 'phone', 'birth_date', 'gender', 'religion', 'address', 'product'];
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
      .from('gf_membership_applications')
      .insert({
        name: body.name,
        phone: body.phone,
        birth_date: body.birth_date,
        gender: body.gender,
        religion: body.religion,
        guardian_name: body.guardian_name || null,
        guardian_relation: body.guardian_relation || null,
        guardian_phone: body.guardian_phone || null,
        address: body.address,
        address_detail: body.address_detail || null,
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

    return NextResponse.json({ success: true, data: { id: data.id } }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
