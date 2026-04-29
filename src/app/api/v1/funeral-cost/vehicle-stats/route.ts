import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface FeeRow {
  판매여부?: string;
  요금?: number;
  [key: string]: unknown;
}

interface HallRow {
  facility_cd: string;
  facility_fees: FeeRow[] | null;
  service_items: FeeRow[] | null;
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
      .select('facility_cd, facility_fees, service_items')
      .limit(2000)
      .returns<HallRow[]>();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: error?.message ?? 'no data' },
        { status: 500 },
      );
    }

    const busAmounts: number[] = [];
    const limoAmounts: number[] = [];
    const hallSet = new Set<string>();

    for (const hall of data) {
      const fees: FeeRow[] = [
        ...(hall.facility_fees ?? []),
        ...(hall.service_items ?? []),
      ];
      for (const fee of fees) {
        const isSale = fee['판매여부'] === 'Y';
        const amt = Number(fee['요금'] ?? 0);
        if (!isSale || amt < 50000) continue;
        const text = JSON.stringify(fee);
        const hasBus = text.includes('버스');
        const hasLimo = text.includes('리무진');
        if (!hasBus && !hasLimo) continue;
        hallSet.add(hall.facility_cd);
        if (hasBus && !hasLimo) busAmounts.push(amt);
        else if (hasLimo && !hasBus) limoAmounts.push(amt);
      }
    }

    const buildStat = (amounts: number[]) => ({
      avg_amount:
        amounts.length === 0
          ? 0
          : Math.round(amounts.reduce((s, v) => s + v, 0) / amounts.length),
      median_amount: median(amounts),
      sample_count: amounts.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        hall_count: hallSet.size,
        bus: buildStat(busAmounts),
        limo: buildStat(limoAmounts),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
