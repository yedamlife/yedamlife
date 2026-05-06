import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteContext {
  params: Promise<{ uuid: string }>;
}

export async function GET(_request: Request, ctx: RouteContext) {
  try {
    const { uuid } = await ctx.params;
    if (!uuid) {
      return NextResponse.json(
        {
          success: false,
          error: 'validation_error',
          message: 'uuid 가 필요합니다.',
        },
        { status: 400 },
      );
    }

    const { data: estimate, error } = await supabase
      .from('fc_estimate_requests')
      .select(
        'id, uuid, name, phone, funeral_type, input_json, created_at, view_count',
      )
      .eq('uuid', uuid)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('[fc_estimate_requests] select failed', error);
      return NextResponse.json(
        {
          success: false,
          error: 'internal_error',
          message: '서버 오류가 발생했습니다.',
        },
        { status: 500 },
      );
    }

    if (!estimate) {
      return NextResponse.json(
        {
          success: false,
          error: 'not_found',
          message: '결과가 존재하지 않습니다',
        },
        { status: 404 },
      );
    }

    // 가장 최근 상담 신청 매칭 — 있으면 snapshot 모드
    const { data: latestConsult } = await supabase
      .from('fc_consultation_requests')
      .select(
        'id, result_json, created_at, selected_product_id, selected_product_name',
      )
      .eq('estimate_uuid', uuid)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 조회수 갱신 (best-effort)
    supabase
      .from('fc_estimate_requests')
      .update({
        view_count: (estimate.view_count ?? 0) + 1,
        viewed_at: new Date().toISOString(),
      })
      .eq('id', estimate.id)
      .then(({ error: upErr }) => {
        if (upErr) console.error('[fc_estimate_requests] view_count update failed', upErr);
      });

    if (latestConsult) {
      return NextResponse.json({
        success: true,
        data: {
          uuid: estimate.uuid,
          name: estimate.name,
          funeralType: estimate.funeral_type,
          mode: 'snapshot' as const,
          resultJson: latestConsult.result_json,
          consultedAt: latestConsult.created_at,
          consultedProduct: {
            id: latestConsult.selected_product_id,
            name: latestConsult.selected_product_name,
          },
          createdAt: estimate.created_at,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        uuid: estimate.uuid,
        name: estimate.name,
        funeralType: estimate.funeral_type,
        mode: 'live' as const,
        inputJson: estimate.input_json,
        createdAt: estimate.created_at,
      },
    });
  } catch (e) {
    console.error('[GET /api/v1/funeral-cost/estimate/[uuid]]', e);
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
