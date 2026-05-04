import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendAlimtalk, productLabel } from '@/lib/alimtalk';

const normalizePhone = (raw: string) => raw.replace(/[^0-9]/g, '');

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

    // 중복 신청 체크 (이름 + 연락처 정확 일치, soft-delete 제외)
    const phoneNorm = normalizePhone(body.phone);
    const { data: existing } = await supabase
      .from('gf_membership_applications')
      .select('id, phone')
      .eq('name', body.name)
      .is('deleted_at', null);
    const duplicate = existing?.some((r) => normalizePhone(r.phone || '') === phoneNorm);
    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: 'duplicate',
          message: '이미 신청된 내역이 있습니다.',
        },
        { status: 409 },
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

    sendAlimtalk(
      'GF_MEMBER',
      {
        고객명: body.name,
        연락처: body.phone,
        생년월일: body.birth_date,
        성별: body.gender,
        종교: body.religion,
        보호자명: body.guardian_name,
        보호자관계: body.guardian_relation,
        보호자연락처: body.guardian_phone,
        주소: body.address,
        상세주소: body.address_detail,
        상품: productLabel(body.product),
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
