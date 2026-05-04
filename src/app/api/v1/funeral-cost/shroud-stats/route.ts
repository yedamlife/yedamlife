import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface FeeRow {
  품종?: string;
  판매여부?: string;
  판매구분?: string;
  요금?: number;
  [key: string]: unknown;
}

interface HallRow {
  facility_cd: string;
  funeral_supplies: FeeRow[] | null;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('funeral_halls')
      .select('facility_cd, funeral_supplies')
      .is('deleted_at', null)
      .limit(2000)
      .returns<HallRow[]>();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: error?.message ?? 'no data' },
        { status: 500 },
      );
    }

    // 장례식장별 최저가 1건 추출 (docs/비용/수의.md 기준)
    const hallLowest: number[] = [];
    let allCount = 0;
    for (const hall of data) {
      const supplies = hall.funeral_supplies ?? [];
      const validAmounts: number[] = [];
      for (const item of supplies) {
        const isSale =
          item['판매여부'] === 'Y' && item['판매구분'] === '판매';
        const isShroud = item['품종'] === '수의';
        const amt = Number(item['요금'] ?? 0);
        if (isSale && isShroud && amt >= 10000) {
          validAmounts.push(amt);
        }
      }
      if (validAmounts.length > 0) {
        hallLowest.push(Math.min(...validAmounts));
        allCount += validAmounts.length;
      }
    }

    if (hallLowest.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    hallLowest.sort((a, b) => a - b);
    const avg = Math.round(
      hallLowest.reduce((s, v) => s + v, 0) / hallLowest.length,
    );
    const mid = Math.floor(hallLowest.length / 2);
    const median =
      hallLowest.length % 2
        ? hallLowest[mid]
        : Math.round((hallLowest[mid - 1] + hallLowest[mid]) / 2);

    return NextResponse.json({
      success: true,
      data: {
        hall_count: hallLowest.length,
        avg_amount: avg,
        median_amount: median,
        min_amount: hallLowest[0],
        max_amount: hallLowest[hallLowest.length - 1],
        sample_count: allCount,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
