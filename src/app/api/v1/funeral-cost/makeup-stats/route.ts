import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface FeeRow {
  품종?: string;
  판매여부?: string;
  요금?: number;
  [key: string]: unknown;
}

interface HallRow {
  facility_cd: string;
  facility_fees: FeeRow[] | null;
  service_items: FeeRow[] | null;
}

export async function GET() {
  try {
    // 1순위: RPC가 배포돼 있으면 사용
    const rpc = await supabase.rpc('get_makeup_stats');
    if (!rpc.error && rpc.data?.[0]) {
      return NextResponse.json({ success: true, data: rpc.data[0] });
    }

    // 2순위: 클라이언트 사이드 집계 (RPC 미배포 시 fallback)
    const { data, error } = await supabase
      .from('funeral_halls')
      .select('facility_cd, facility_fees, service_items')
      .is('deleted_at', null)
      .limit(2000)
      .returns<HallRow[]>();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: error?.message ?? 'no data' },
        { status: 500 },
      );
    }

    const hallSet = new Set<string>();
    const amounts: number[] = [];

    for (const hall of data) {
      const fees: FeeRow[] = [
        ...(hall.facility_fees ?? []),
        ...(hall.service_items ?? []),
      ];
      for (const fee of fees) {
        const isSale = fee['판매여부'] === 'Y';
        const amt = Number(fee['요금'] ?? 0);
        const isFacility = fee['품종'] === '시설임대료';
        const text = JSON.stringify(fee);
        // 시설임대료(패키지) 제외, 무료 케이스도 hall_count에는 포함
        if (isSale && !isFacility && text.includes('메이크업')) {
          hallSet.add(hall.facility_cd);
          amounts.push(amt);
        }
      }
    }

    if (amounts.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    amounts.sort((a, b) => a - b);
    const avg = Math.round(amounts.reduce((s, v) => s + v, 0) / amounts.length);
    const mid = Math.floor(amounts.length / 2);
    const median =
      amounts.length % 2
        ? amounts[mid]
        : Math.round((amounts[mid - 1] + amounts[mid]) / 2);

    return NextResponse.json({
      success: true,
      data: {
        hall_count: hallSet.size,
        avg_amount: avg,
        median_amount: median,
        min_amount: amounts[0],
        max_amount: amounts[amounts.length - 1],
        sample_count: amounts.length,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
