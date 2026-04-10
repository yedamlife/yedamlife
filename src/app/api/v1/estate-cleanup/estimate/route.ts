import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const missing: { field: string; message: string }[] = [];
    if (!body.name) missing.push({ field: 'name', message: '성함을 입력해주세요.' });
    if (!body.phone) missing.push({ field: 'phone', message: '연락처를 입력해주세요.' });
    if (!Array.isArray(body.service_types) || body.service_types.length === 0) {
      missing.push({ field: 'service_types', message: '서비스 종류를 선택해주세요.' });
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
      .from('ec_estimate_requests')
      .insert({
        name: body.name,
        phone: body.phone,
        address: body.address || null,
        address_detail: body.address_detail || null,
        service_types: body.service_types,
        area: body.area || null,
        floor: body.floor || null,
        housing_type: body.housing_type || null,
        visit_date: body.visit_date || null,
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
