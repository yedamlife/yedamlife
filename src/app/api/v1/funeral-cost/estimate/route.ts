import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendAlimtalk } from '@/lib/alimtalk';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['name', 'phone', 'funeralType', 'inputJson'];
    const missing = requiredFields.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'validation_error',
          message: '필수 항목을 입력해주세요.',
          details: missing.map((field) => ({
            field,
            message: `${field}을(를) 입력해주세요.`,
          })),
        },
        { status: 400 },
      );
    }

    if (body.funeralType !== '3day' && body.funeralType !== 'nobinso') {
      return NextResponse.json(
        {
          success: false,
          error: 'validation_error',
          message: 'funeralType 값이 올바르지 않습니다.',
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('fc_estimate_requests')
      .insert({
        name: body.name,
        phone: body.phone,
        age_group: body.ageGroup ?? null,
        funeral_type: body.funeralType,
        current_situation: body.currentSituation ?? null,
        sido_cd: body.sido ?? null,
        gungu_cd: body.gungu ?? null,
        facility_cd: body.facilityCd ?? null,
        selected_size: body.selectedSize ?? null,
        guest_count: body.guestCount ?? null,
        input_json: body.inputJson,
      })
      .select('id, uuid')
      .single();

    if (error || !data) {
      console.error('[fc_estimate_requests] insert failed', error);
      return NextResponse.json(
        {
          success: false,
          error: 'internal_error',
          message: '서버 오류가 발생했습니다.',
        },
        { status: 500 },
      );
    }

    // 결과 URL — 운영 origin 우선, 없으면 host 헤더
    const host = request.headers.get('host') ?? 'yedamlife.com';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const origin =
      process.env.NEXT_PUBLIC_SITE_ORIGIN ?? `${protocol}://${host}`;
    const resultUrl = `${origin}/funeral-cost/result/${data.uuid}`;

    try {
      const sendResult = await sendAlimtalk(
        'FC_RESULT',
        {
          이름: body.name,
          uuid: data.uuid,
          결과URL: resultUrl,
        },
        {
          customerPhone: body.phone,
          host,
          source: { table: 'fc_estimate_requests', id: data.id },
        },
      );

      // 알림톡 발송 매핑(id + role + phone)을 fc_estimate_requests 에 저장
      const logEntries = sendResult.logEntries ?? [];
      if (logEntries.length > 0) {
        const { error: updateError } = await supabase
          .from('fc_estimate_requests')
          .update({ alimtalk_logs: logEntries })
          .eq('id', data.id);
        if (updateError) {
          console.error(
            '[fc_estimate_requests] alimtalk_logs update failed',
            updateError,
          );
        }
      }
    } catch (e) {
      console.error('[FC_RESULT] sendAlimtalk threw', e);
    }

    return NextResponse.json(
      { success: true, data: { uuid: data.uuid, resultUrl } },
      { status: 201 },
    );
  } catch (e) {
    console.error('[POST /api/v1/funeral-cost/estimate]', e);
    return NextResponse.json(
      {
        success: false,
        error: 'internal_error',
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
