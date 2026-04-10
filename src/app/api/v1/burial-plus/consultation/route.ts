import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const missing: { field: string; message: string }[] = [];
    if (!body.name) missing.push({ field: 'name', message: '이름을 입력해주세요.' });
    if (!body.phone) missing.push({ field: 'phone', message: '연락처를 입력해주세요.' });
    if (!body.religion) missing.push({ field: 'religion', message: '종교를 선택해주세요.' });
    if (!body.region) missing.push({ field: 'region', message: '희망 지역을 선택해주세요.' });
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
      .from('bp_consultation_requests')
      .insert({
        name: body.name,
        phone: body.phone,
        religion: body.religion,
        region: body.region,
        district: body.district || null,
        budget: body.budget || null,
        message: body.message || null,
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
