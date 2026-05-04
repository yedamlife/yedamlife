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

const KEYWORDS = [
  '장례지도사',
  '입관지도사',
  '염사',
  '염습사',
  '입관사',
  '장례사',
  '장의사',
  '지도사',
  '염습지도',
  '인력',
  '인건비',
];

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
    const hallSetExact = new Set<string>();
    const amounts: number[] = [];

    for (const hall of data) {
      const fees: FeeRow[] = [
        ...(hall.facility_fees ?? []),
        ...(hall.service_items ?? []),
      ];
      for (const fee of fees) {
        const isSale = fee['판매여부'] === 'Y';
        const amt = Number(fee['요금'] ?? 0);
        if (!isSale || amt <= 0) continue;
        const text = JSON.stringify(fee);
        const matched = KEYWORDS.some((k) => text.includes(k));
        if (!matched) continue;
        const isExact =
          text.includes('장례지도사') || text.includes('입관지도사');
        hallSet.add(hall.facility_cd);
        if (isExact) hallSetExact.add(hall.facility_cd);
        amounts.push(amt);
      }
    }

    if (amounts.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const avg = Math.round(amounts.reduce((s, v) => s + v, 0) / amounts.length);

    return NextResponse.json({
      success: true,
      data: {
        hall_count: hallSet.size,
        hall_count_exact: hallSetExact.size,
        avg_amount: avg,
        median_amount: median(amounts),
        sample_count: amounts.length,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
