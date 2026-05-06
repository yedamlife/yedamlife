import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendAlimtalk } from '@/lib/alimtalk';

const SIZE_LABELS: Record<string, string> = {
  small: '소형',
  medium: '중형',
  large: '대형',
  premium: '특실',
  vip: 'VIP실',
};

interface ResultJson {
  hall?: { companyName?: string };
  selections?: { selectedSize?: string; selectedSizeLabel?: string };
  computed?: { total?: number };
}

function formatWon(n: number | undefined | null): string {
  if (typeof n !== 'number' || !isFinite(n)) return '-';
  return `${n.toLocaleString('ko-KR')}원`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = [
      'selectedProductId',
      'selectedProductName',
      'resultJson',
    ];
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

    // estimateUuid 가 있으면 fc_estimate_requests 에서 name/phone 회수
    let estimateRequestId: number | null = null;
    let estimateUuid: string | null = body.estimateUuid ?? null;
    let name: string | undefined = body.name;
    let phone: string | undefined = body.phone;

    if (estimateUuid) {
      const { data: estimate } = await supabase
        .from('fc_estimate_requests')
        .select('id, name, phone')
        .eq('uuid', estimateUuid)
        .is('deleted_at', null)
        .maybeSingle();

      if (estimate) {
        estimateRequestId = estimate.id;
        name = name ?? estimate.name;
        phone = phone ?? estimate.phone;
      }
    }

    if (!name || !phone) {
      return NextResponse.json(
        {
          success: false,
          error: 'validation_error',
          message: '이름·연락처가 필요합니다.',
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('fc_consultation_requests')
      .insert({
        estimate_request_id: estimateRequestId,
        estimate_uuid: estimateUuid,
        name,
        phone,
        selected_product_id: body.selectedProductId,
        selected_product_name: body.selectedProductName,
        result_json: body.resultJson,
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('[fc_consultation_requests] insert failed', error);
      return NextResponse.json(
        {
          success: false,
          error: 'internal_error',
          message: '서버 오류가 발생했습니다.',
        },
        { status: 500 },
      );
    }

    // 알림톡 변수 가공
    const result: ResultJson = body.resultJson ?? {};
    const hallName = result.hall?.companyName ?? '-';
    const sizeKey = result.selections?.selectedSize;
    const sizeLabel =
      result.selections?.selectedSizeLabel ??
      (sizeKey ? (SIZE_LABELS[sizeKey] ?? sizeKey) : '-');
    const totalAmount = formatWon(result.computed?.total);

    // 결과 URL — estimateUuid 가 있을 때만 의미 있음 (없으면 빈 문자열)
    const host = request.headers.get('host') ?? 'yedamlife.com';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const origin =
      process.env.NEXT_PUBLIC_SITE_ORIGIN ?? `${protocol}://${host}`;
    const resultUrl = estimateUuid
      ? `${origin}/funeral-cost/result/${estimateUuid}`
      : '';

    try {
      await sendAlimtalk(
        'FC_CONSULT',
        {
          고객명: name,
          연락처: phone,
          상품: body.selectedProductName,
          장례식장: hallName,
          규모: sizeLabel,
          예상비용: totalAmount,
          결과URL: resultUrl,
        },
        {
          customerPhone: phone,
          host,
          source: { table: 'fc_consultation_requests', id: data.id },
        },
      );
    } catch (e) {
      console.error('[FC_CONSULT] sendAlimtalk threw', e);
    }

    return NextResponse.json(
      { success: true, data: { id: data.id } },
      { status: 201 },
    );
  } catch (e) {
    console.error('[POST /api/v1/funeral-cost/consultation]', e);
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
