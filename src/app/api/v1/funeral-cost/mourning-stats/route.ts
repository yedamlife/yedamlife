import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface FeeRow {
  품종?: string;
  품종상세?: string;
  품명?: string;
  판매여부?: string;
  판매구분?: string;
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

    // 장례식장별 성별 최저가 추출
    const maleByHall = new Map<string, number>();
    const femaleByHall = new Map<string, number>();

    for (const hall of data) {
      const supplies = hall.funeral_supplies ?? [];
      let minMale: number | null = null;
      let minFemale: number | null = null;
      for (const item of supplies) {
        const isSale =
          item['판매여부'] === 'Y' && item['판매구분'] === '판매';
        const isMourning = item['품종'] === '상주용품';
        const amt = Number(item['요금'] ?? 0);
        if (!isSale || !isMourning || amt < 5000) continue;
        const detail = item['품종상세'] ?? '';
        if (detail === '남상복') {
          minMale = minMale == null ? amt : Math.min(minMale, amt);
        } else if (detail === '여상복') {
          minFemale = minFemale == null ? amt : Math.min(minFemale, amt);
        }
      }
      if (minMale != null) maleByHall.set(hall.facility_cd, minMale);
      if (minFemale != null) femaleByHall.set(hall.facility_cd, minFemale);
    }

    const maleAmounts = Array.from(maleByHall.values());
    const femaleAmounts = Array.from(femaleByHall.values());

    const buildStat = (amounts: number[]) => ({
      hall_count: amounts.length,
      avg_amount:
        amounts.length === 0
          ? 0
          : Math.round(amounts.reduce((s, v) => s + v, 0) / amounts.length),
      median_amount: median(amounts),
    });

    return NextResponse.json({
      success: true,
      data: {
        male: buildStat(maleAmounts),
        female: buildStat(femaleAmounts),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
