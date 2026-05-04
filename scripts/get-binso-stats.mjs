/**
 * 빈소 사용료 통계 — 사이즈별 × 수도권/비수도권
 * node scripts/get-binso-stats.mjs
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const METRO_SIDO = new Set(['6110000', '6280000', '6410000']); // 서울·인천·경기

const SIZE_CATS = [
  { key: 'small',   label: '소형',  sqmMin: 0,   sqmMax: 100  },
  { key: 'medium',  label: '중형',  sqmMin: 100, sqmMax: 198  },
  { key: 'large',   label: '대형',  sqmMin: 200, sqmMax: 300  },
  { key: 'premium', label: '특실',  sqmMin: 300, sqmMax: 390  },
  { key: 'vip',     label: 'VIP실', sqmMin: 390, sqmMax: 99999},
];

function getAreaSqm(fee) {
  const v = fee['평수_㎡'];
  return typeof v === 'number' && v > 0 ? v : null;
}

function classifySize(sqm) {
  return SIZE_CATS.find((c) => sqm >= c.sqmMin && sqm < c.sqmMax) ?? null;
}

function isBinsoFee(fee) {
  if (fee['판매여부'] !== 'Y') return false;
  if (fee['품종'] !== '시설임대료') return false;
  const cat = fee['품종상세'] ?? '';
  const name = fee['품명'] ?? '';
  if (cat.includes('빈소') || name.includes('빈소')) return true;
  if (cat.includes('분향') || name.includes('분향')) return true;
  // 호실 패턴 + 면적 있음 + 비빈소 키워드 없음
  const sqm = getAreaSqm(fee);
  if (
    sqm && sqm > 30 &&
    /\d+호/.test(name) &&
    !name.includes('객실') &&
    !name.includes('영결') &&
    !name.includes('입관') &&
    !name.includes('안치')
  ) return true;
  return false;
}

function getFeeMultiplier(fee) {
  const raw = `${fee['임대내용'] ?? ''} ${fee['품명'] ?? ''} ${fee['서비스내용'] ?? ''}`;
  const desc = raw.replace(/\s/g, '');
  if (/시간당|1시간|시간\/회|\/[hH](?![a-zA-Z])/.test(desc)) return 48; // 시간당 → 24h × 2일
  if (/1일|하루|일당|24시간|1박/.test(desc)) return 2;                    // 1일 → 2일
  if (/1회|회당|per\s*use/i.test(desc)) return 1;                         // 1회
  return 2; // 기본: 24시간 기준 × 2일
}

async function fetchPage(offset, limit) {
  const url = `${SUPABASE_URL}/rest/v1/funeral_halls?select=facility_cd,sido_cd,facility_fees&deleted_at=is.null&offset=${offset}&limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  // 전체 데이터 페이지별 수집
  const halls = [];
  let offset = 0;
  const limit = 500;
  while (true) {
    const page = await fetchPage(offset, limit);
    if (!page.length) break;
    halls.push(...page);
    if (page.length < limit) break;
    offset += limit;
  }
  console.error(`총 ${halls.length}개 장례식장 로드`);

  // region × size 별 집계
  const stats = {
    metro:     Object.fromEntries(SIZE_CATS.map((c) => [c.key, []])),
    non_metro: Object.fromEntries(SIZE_CATS.map((c) => [c.key, []])),
  };
  // 장례식장별 최저가 기준 집계용 (hall_count)
  const hallBest = {
    metro:     Object.fromEntries(SIZE_CATS.map((c) => [c.key, new Map()])),
    non_metro: Object.fromEntries(SIZE_CATS.map((c) => [c.key, new Map()])),
  };

  for (const hall of halls) {
    const region = METRO_SIDO.has(hall.sido_cd ?? '') ? 'metro' : 'non_metro';
    const fees = hall.facility_fees ?? [];
    for (const fee of fees) {
      if (!isBinsoFee(fee)) continue;
      const sqm = getAreaSqm(fee);
      if (!sqm) continue;
      const size = classifySize(sqm);
      if (!size) continue;
      const raw = Number(fee['요금'] ?? 0);
      if (raw <= 0) continue;
      const multiplier = getFeeMultiplier(fee);
      const amount = raw * multiplier;
      stats[region][size.key].push(amount);
      // hall별 최솟값
      const cur = hallBest[region][size.key].get(hall.facility_cd);
      if (cur == null || amount < cur) {
        hallBest[region][size.key].set(hall.facility_cd, amount);
      }
    }
  }

  function median(arr) {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
  }
  function avg(arr) {
    if (!arr.length) return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  }

  console.log('\n=== 수도권 (서울·인천·경기) ===');
  for (const cat of SIZE_CATS) {
    const amounts = stats.metro[cat.key];
    const hallMap = hallBest.metro[cat.key];
    const hallAmounts = Array.from(hallMap.values());
    console.log(`\n[${cat.label} ${cat.sqmMin}~${cat.sqmMax === 99999 ? cat.sqmMin + '㎡ 이상' : cat.sqmMax + '㎡'}]`);
    console.log(`  전체 건수: ${amounts.length}건 / 장례식장 수: ${hallMap.size}곳`);
    if (amounts.length) {
      console.log(`  전체 평균: ${avg(amounts).toLocaleString()}원 / 중간값: ${median(amounts).toLocaleString()}원`);
      console.log(`  최저: ${Math.min(...amounts).toLocaleString()}원 / 최고: ${Math.max(...amounts).toLocaleString()}원`);
      console.log(`  장례식장별 최저가 평균: ${avg(hallAmounts).toLocaleString()}원 / 중간값: ${median(hallAmounts).toLocaleString()}원`);
    } else {
      console.log('  데이터 없음');
    }
  }

  console.log('\n=== 수도권 외 ===');
  for (const cat of SIZE_CATS) {
    const amounts = stats.non_metro[cat.key];
    const hallMap = hallBest.non_metro[cat.key];
    const hallAmounts = Array.from(hallMap.values());
    console.log(`\n[${cat.label} ${cat.sqmMin}~${cat.sqmMax === 99999 ? cat.sqmMin + '㎡ 이상' : cat.sqmMax + '㎡'}]`);
    console.log(`  전체 건수: ${amounts.length}건 / 장례식장 수: ${hallMap.size}곳`);
    if (amounts.length) {
      console.log(`  전체 평균: ${avg(amounts).toLocaleString()}원 / 중간값: ${median(amounts).toLocaleString()}원`);
      console.log(`  최저: ${Math.min(...amounts).toLocaleString()}원 / 최고: ${Math.max(...amounts).toLocaleString()}원`);
      console.log(`  장례식장별 최저가 평균: ${avg(hallAmounts).toLocaleString()}원 / 중간값: ${median(hallAmounts).toLocaleString()}원`);
    } else {
      console.log('  데이터 없음');
    }
  }

  // JSON 출력 (문서 작성용)
  const result = {};
  for (const region of ['metro', 'non_metro']) {
    result[region] = {};
    for (const cat of SIZE_CATS) {
      const amounts = stats[region][cat.key];
      const hallMap = hallBest[region][cat.key];
      const hallAmounts = Array.from(hallMap.values());
      result[region][cat.key] = {
        label: cat.label,
        sample_count: amounts.length,
        hall_count: hallMap.size,
        avg: avg(amounts),
        median: median(amounts),
        hall_avg: avg(hallAmounts),
        hall_median: median(hallAmounts),
        min: amounts.length ? Math.min(...amounts) : 0,
        max: amounts.length ? Math.max(...amounts) : 0,
      };
    }
  }
  console.log('\n--- JSON ---');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
