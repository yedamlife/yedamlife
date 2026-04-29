import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface FeeRow {
  품종?: string;
  품종상세?: string;
  품명?: string;
  기타정보?: string;
  판매여부?: string;
  판매구분?: string;
  요금?: number;
  [key: string]: unknown;
}

interface HallRow {
  facility_cd: string;
  facility_fees: FeeRow[] | null;
  service_items: FeeRow[] | null;
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
function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
}

const DIRECTOR_KEYWORDS = [
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

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('funeral_halls')
      .select(
        'facility_cd, facility_fees, service_items, funeral_supplies',
      )
      .limit(2000)
      .returns<HallRow[]>();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: error?.message ?? 'no data' },
        { status: 500 },
      );
    }

    // 메이크업 (시설임대료 제외, 무료 포함)
    const makeupHalls = new Set<string>();
    const makeupAmounts: number[] = [];

    // 장의버스/리무진 (>= 50,000)
    const vehicleHalls = new Set<string>();
    const busAmounts: number[] = [];
    const limoAmounts: number[] = [];

    // 장례/입관 지도사
    const directorHalls = new Set<string>();
    const directorAmounts: number[] = [];

    // 수의: 장례식장별 최저가
    const shroudHallLowest: number[] = [];
    let shroudAllCount = 0;

    // 오동나무 관: 장례식장별 최저가
    const coffinHallLowest: number[] = [];
    let coffinAllCount = 0;

    // 유골함: 재질별 장례식장별 최저가 (도자기 / 나무)
    const urnWoodHallLowest: number[] = [];
    const urnCeramicHallLowest: number[] = [];
    const urnAnyHalls = new Set<string>();

    // 영정사진 (service_items): 장례식장별 최저가
    const portraitByHall = new Map<string, number>();

    // 상복: 성별 분리, 장례식장별 최저가
    const maleByHall = new Map<string, number>();
    const femaleByHall = new Map<string, number>();

    for (const hall of data) {
      const combined: FeeRow[] = [
        ...(hall.facility_fees ?? []),
        ...(hall.service_items ?? []),
      ];
      const supplies = hall.funeral_supplies ?? [];

      // ── facility_fees + service_items 순회 ──
      for (const fee of combined) {
        const isSale = fee['판매여부'] === 'Y';
        const amt = Number(fee['요금'] ?? 0);
        if (!isSale) continue;
        const text = JSON.stringify(fee);
        const isFacility = fee['품종'] === '시설임대료';

        // 메이크업
        if (!isFacility && text.includes('메이크업')) {
          makeupHalls.add(hall.facility_cd);
          makeupAmounts.push(amt);
        }

        // 차량
        if (amt >= 50000) {
          const hasBus = text.includes('버스');
          const hasLimo = text.includes('리무진');
          if (hasBus || hasLimo) {
            vehicleHalls.add(hall.facility_cd);
            if (hasBus && !hasLimo) busAmounts.push(amt);
            else if (hasLimo && !hasBus) limoAmounts.push(amt);
          }
        }

        // 지도사
        if (amt > 0) {
          const matched = DIRECTOR_KEYWORDS.some((k) => text.includes(k));
          if (matched) {
            directorHalls.add(hall.facility_cd);
            directorAmounts.push(amt);
          }
        }

        // 영정사진 (장례식장별 최저가, 사진 한정 / 액자 제외)
        if (
          fee['품종'] === '영정사진' &&
          fee['품종상세'] === '사진' &&
          amt >= 10000
        ) {
          const cur = portraitByHall.get(hall.facility_cd);
          if (cur == null || amt < cur) {
            portraitByHall.set(hall.facility_cd, amt);
          }
        }
      }

      // ── funeral_supplies 순회 ──
      const shroudPrices: number[] = [];
      const coffinPrices: number[] = [];
      const urnWoodPrices: number[] = [];
      const urnCeramicPrices: number[] = [];
      let minMale: number | null = null;
      let minFemale: number | null = null;

      for (const item of supplies) {
        const isSale =
          item['판매여부'] === 'Y' && item['판매구분'] === '판매';
        const amt = Number(item['요금'] ?? 0);
        if (!isSale) continue;
        const cat = item['품종'] ?? '';
        const detail = item['품종상세'] ?? '';
        const name = item['품명'] ?? '';
        const etc =
          typeof item['기타정보'] === 'string' ? item['기타정보'] : '';

        // 수의
        if (cat === '수의' && amt >= 10000) {
          shroudPrices.push(amt);
        }
        // 오동나무 관
        if (cat === '관' && amt >= 10000) {
          const isPaulownia =
            detail === '오동나무' ||
            name.includes('오동') ||
            etc.includes('오동');
          if (isPaulownia) coffinPrices.push(amt);
        }
        // 유골함 (재질별: 나무 / 도자기)
        if (cat === '유골함' && amt >= 10000) {
          if (detail === '나무') {
            urnWoodPrices.push(amt);
          } else if (detail === '도자기') {
            urnCeramicPrices.push(amt);
          }
        }
        // 상복
        if (cat === '상주용품' && amt >= 5000) {
          if (detail === '남상복') {
            minMale = minMale == null ? amt : Math.min(minMale, amt);
          } else if (detail === '여상복') {
            minFemale = minFemale == null ? amt : Math.min(minFemale, amt);
          }
        }
      }

      if (shroudPrices.length > 0) {
        shroudHallLowest.push(Math.min(...shroudPrices));
        shroudAllCount += shroudPrices.length;
      }
      if (coffinPrices.length > 0) {
        coffinHallLowest.push(Math.min(...coffinPrices));
        coffinAllCount += coffinPrices.length;
      }
      if (urnWoodPrices.length > 0) {
        urnWoodHallLowest.push(Math.min(...urnWoodPrices));
        urnAnyHalls.add(hall.facility_cd);
      }
      if (urnCeramicPrices.length > 0) {
        urnCeramicHallLowest.push(Math.min(...urnCeramicPrices));
        urnAnyHalls.add(hall.facility_cd);
      }
      if (minMale != null) maleByHall.set(hall.facility_cd, minMale);
      if (minFemale != null) femaleByHall.set(hall.facility_cd, minFemale);
    }

    const maleAmounts = Array.from(maleByHall.values());
    const femaleAmounts = Array.from(femaleByHall.values());
    const portraitAmounts = Array.from(portraitByHall.values());

    return NextResponse.json({
      success: true,
      data: {
        makeup: {
          hall_count: makeupHalls.size,
          avg_amount: avg(makeupAmounts),
          median_amount: median(makeupAmounts),
        },
        shroud: {
          hall_count: shroudHallLowest.length,
          avg_amount: avg(shroudHallLowest),
          median_amount: median(shroudHallLowest),
          sample_count: shroudAllCount,
        },
        coffin: {
          hall_count: coffinHallLowest.length,
          avg_amount: avg(coffinHallLowest),
          median_amount: median(coffinHallLowest),
          sample_count: coffinAllCount,
        },
        urn: {
          hall_count: urnAnyHalls.size,
          wood: {
            hall_count: urnWoodHallLowest.length,
            avg_amount: avg(urnWoodHallLowest),
            median_amount: median(urnWoodHallLowest),
          },
          ceramic: {
            hall_count: urnCeramicHallLowest.length,
            avg_amount: avg(urnCeramicHallLowest),
            median_amount: median(urnCeramicHallLowest),
          },
        },
        portrait: {
          hall_count: portraitAmounts.length,
          avg_amount: avg(portraitAmounts),
          median_amount: median(portraitAmounts),
        },
        vehicle: {
          hall_count: vehicleHalls.size,
          bus: {
            avg_amount: avg(busAmounts),
            median_amount: median(busAmounts),
            sample_count: busAmounts.length,
          },
          limo: {
            avg_amount: avg(limoAmounts),
            median_amount: median(limoAmounts),
            sample_count: limoAmounts.length,
          },
        },
        director: {
          hall_count: directorHalls.size,
          avg_amount: avg(directorAmounts),
          median_amount: median(directorAmounts),
          sample_count: directorAmounts.length,
        },
        mourning: {
          male: {
            hall_count: maleAmounts.length,
            avg_amount: avg(maleAmounts),
            median_amount: median(maleAmounts),
          },
          female: {
            hall_count: femaleAmounts.length,
            avg_amount: avg(femaleAmounts),
            median_amount: median(femaleAmounts),
          },
        },
      },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
