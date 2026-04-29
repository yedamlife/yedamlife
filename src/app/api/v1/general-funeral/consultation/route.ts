import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendAlimtalk, productLabel } from '@/lib/alimtalk';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = [
      'funeral_location',
      'expected_guests',
      'funeral_scale',
      'binso_required',
      'escort_service',
      'clothing_type',
      'funeral_gown_required',
      'additional_service',
      'contact_number',
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

    const { data, error } = await supabase
      .from('gf_consultation_requests')
      .insert({
        funeral_location: body.funeral_location,
        expected_guests: body.expected_guests,
        funeral_scale: body.funeral_scale,
        binso_required: body.binso_required,
        escort_service: body.escort_service,
        clothing_type: body.clothing_type,
        funeral_gown_required: body.funeral_gown_required,
        additional_service: body.additional_service,
        contact_number: body.contact_number,
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

    try {
      await sendAlimtalk(
        'GF_CONSULT',
        {
          상품: productLabel(body.product || body.funeral_scale),
          고객명: body.name,
          연락처: body.phone || body.contact_number,
          지역: body.region || body.funeral_location,
          상담시간: body.preferred_time,
        },
        {
          customerPhone: body.phone || body.contact_number,
          host: request.headers.get('host'),
          source: { table: 'gf_consultation_requests', id: data.id },
        },
      );
    } catch (e) {
      console.error('[GF_CONSULT] sendAlimtalk threw', e);
    }

    return NextResponse.json({ success: true, data: { id: data.id } }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
