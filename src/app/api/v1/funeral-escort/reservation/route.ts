import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = [
      'writer_name',
      'writer_phone',
      'deceased_name',
      'deceased_gender',
      'funeral_hall',
      'funeral_hall_address',
      'departure_date',
      'departure_hour',
      'departure_minute',
      'funeral_method',
      'destination_address',
      'clothing',
      'people',
      'price',
    ];

    const missing = requiredFields.filter((f) => !body[f] && body[f] !== 0);
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
      .from('fe_reservation_requests')
      .insert({
        writer_name: body.writer_name,
        writer_phone: body.writer_phone,
        deceased_name: body.deceased_name,
        deceased_gender: body.deceased_gender,
        funeral_hall: body.funeral_hall,
        funeral_hall_address: body.funeral_hall_address,
        room_name: body.room_name || null,
        departure_date: body.departure_date,
        departure_hour: body.departure_hour,
        departure_minute: body.departure_minute,
        funeral_method: body.funeral_method,
        destination_address: body.destination_address,
        destination_detail: body.destination_detail || null,
        clothing: body.clothing,
        people: body.people,
        price: body.price,
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
