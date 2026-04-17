import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const missing: { field: string; message: string }[] = [];
    if (!body.name) missing.push({ field: 'name', message: '이름을 입력해주세요.' });
    if (!body.contact_number) missing.push({ field: 'contact_number', message: '연락처를 입력해주세요.' });

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
      .from('gf_direct_requests')
      .insert({
        funeral_location: body.funeral_location || null,
        expected_guests: body.expected_guests || null,
        funeral_scale: body.funeral_scale || null,
        binso_required: body.binso_required || null,
        escort_service: body.escort_service || null,
        clothing_type: body.clothing_type || null,
        funeral_gown_required: body.funeral_gown_required || null,
        additional_service: body.additional_service || null,
        name: body.name,
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

    return NextResponse.json({ success: true, data: { id: data.id } }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'internal_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
