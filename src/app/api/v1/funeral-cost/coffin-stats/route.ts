import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface FeeRow {
  품종?: string;
  품종상세?: string;
  품명?: string;
  기타정보?: string;
  판매여부?: string;
  요금?: number;
  [key: string]: unknown;
}

interface HallRow {
  facility_cd: string;
  funeral_supplies: FeeRow[] | null;
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
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

    const hallLowest: number[] = [];
    let allCount = 0;

    for (const hall of data) {
      const supplies = hall.funeral_supplies ?? [];
      const valid: number[] = [];
      for (const item of supplies) {
        const isSale = item['판매여부'] === 'Y';
        const isCoffin = item['품종'] === '관';
        const amt = Number(item['요금'] ?? 0);
        if (!isSale || !isCoffin || amt < 10000) continue;
        const detail = item['품종상세'] ?? '';
        const name = item['품명'] ?? '';
        const etc =
          typeof item['기타정보'] === 'string' ? item['기타정보'] : '';
        const isPaulownia =
          detail === '오동나무' ||
          name.includes('오동') ||
          etc.includes('오동');
        if (!isPaulownia) continue;
        valid.push(amt);
      }
      if (valid.length > 0) {
        hallLowest.push(Math.min(...valid));
        allCount += valid.length;
      }
    }

    if (hallLowest.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const avg = Math.round(
      hallLowest.reduce((s, v) => s + v, 0) / hallLowest.length,
    );

    return NextResponse.json({
      success: true,
      data: {
        hall_count: hallLowest.length,
        avg_amount: avg,
        median_amount: median(hallLowest),
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
