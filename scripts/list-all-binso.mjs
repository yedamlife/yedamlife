/**
 * 모든 장례식장 빈소 정보 리스트업 + 시간당 판별
 * node scripts/list-all-binso.mjs > docs/장례식장/모든장례식장빈소정보.md
 */

import fs from 'fs';
import path from 'path';

// .env.local 수동 로드
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('환경변수 누락: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

function parseDisplay(str) {
  if (str == null) return null;
  const cleaned = String(str).replace(/[^\d.]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function getAreaSqm(fee) {
  const v = fee['평수_㎡'];
  return typeof v === 'number' && v > 0 ? v : null;
}

function isBinsoFee(fee) {
  if (fee['판매여부'] !== 'Y') return false;
  if (fee['품종'] !== '시설임대료') return false;
  const cat = fee['품종상세'] ?? '';
  const name = fee['품명'] ?? '';
  if (cat.includes('빈소') || name.includes('빈소')) return true;
  if (cat.includes('분향') || name.includes('분향')) return true;
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

const HOURLY_RE = /시간당|1시간|시간\/회|\/[hH](?![a-zA-Z])|\/\s*시/;

function hasHourlyKeyword(fee) {
  const text = `${fee['임대내용'] ?? ''} ${fee['품명'] ?? ''} ${fee['서비스내용'] ?? ''}`.replace(/\s/g, '');
  return HOURLY_RE.test(text);
}

// 임대내용/품명에서 "시간당 N원" 패턴의 시간당 단가 추출
function extractHourlyRate(fee) {
  const text = `${fee['임대내용'] ?? ''} ${fee['품명'] ?? ''} ${fee['서비스내용'] ?? ''}`;
  // "시간당 36,000원" / "시간당36000" / "1시간 16,000원" / "16,000원/시간" / "시간/회 12,000"
  const patterns = [
    /시간당\s*([\d,]+)\s*원?/,
    /1\s*시간\s*([\d,]+)\s*원?/,
    /([\d,]+)\s*원?\s*\/\s*시간?/,
    /시간\s*\/\s*회\s*([\d,]+)/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const n = Number(m[1].replace(/,/g, ''));
      if (Number.isFinite(n) && n >= 1000) return n;
    }
  }
  return null;
}

/**
 * 요금_표시 단위 판별
 * 1) 임대내용에서 시간당 단가 N 추출 가능 → disp/N 비율로 판별
 * 2) 추출 불가 + 시간당 키워드 → ?
 * 3) 시간당 키워드 없음 → -
 */
function classifyDisplayUnit(fee) {
  const raw = Number(fee['요금'] ?? 0);
  const disp = parseDisplay(fee['요금_표시']);
  const hourly = hasHourlyKeyword(fee);
  if (!hourly) return { hourly: false, displayUnit: '-', raw, disp, rate: null };
  const rate = extractHourlyRate(fee);
  if (disp == null) return { hourly: true, displayUnit: '?', raw, disp, rate };
  if (rate != null && rate > 0) {
    const ratio = disp / rate;
    if (Math.abs(ratio - 1) < 0.02) return { hourly: true, displayUnit: '시간당', raw, disp, rate };
    if (Math.abs(ratio - 24) < 0.5) return { hourly: true, displayUnit: '24시간', raw, disp, rate };
    if (Math.abs(ratio - 48) < 1) return { hourly: true, displayUnit: '48시간(2일)', raw, disp, rate };
    if (Math.abs(ratio - 12) < 0.5) return { hourly: true, displayUnit: '12시간', raw, disp, rate };
    return { hourly: true, displayUnit: `×${ratio.toFixed(1)}`, raw, disp, rate };
  }
  // 명시 단가 추출 실패 — 보조 추정
  // 임대내용에 1시간/시간당 표기 + 요금 자체가 비교적 작음(<200,000) 이면 시간당으로 추정
  if (raw > 0 && Math.abs(disp / raw - 1) < 0.02) {
    if (raw < 200000) return { hourly: true, displayUnit: '시간당(추정)', raw, disp, rate: null };
    return { hourly: true, displayUnit: '?', raw, disp, rate: null };
  }
  return { hourly: true, displayUnit: '?', raw, disp, rate: null };
}

async function fetchAll() {
  const halls = [];
  let offset = 0;
  const limit = 500;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/funeral_halls?select=facility_cd,company_name,sido_cd,full_address,facility_fees&deleted_at=is.null&offset=${offset}&limit=${limit}`;
    const res = await fetch(url, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const page = await res.json();
    if (!page.length) break;
    halls.push(...page);
    if (page.length < limit) break;
    offset += limit;
  }
  return halls;
}

const SIDO_NAME = {
  '6110000': '서울', '6260000': '부산', '6270000': '대구', '6280000': '인천',
  '6290000': '광주', '6300000': '대전', '6310000': '울산', '5690000': '세종',
  '0000000': '세종', '6410000': '경기', '3940000': '경기', '6420000': '강원',
  '6430000': '충북', '6440000': '충남', '4490000': '충남', '6450000': '전북',
  '6460000': '전남', '6470000': '경북', '5020000': '경북', '6480000': '경남',
  '5270000': '경남', '6490000': '제주',
};

function md() {
  return fetchAll().then((halls) => {
    halls.sort((a, b) => (a.sido_cd ?? '').localeCompare(b.sido_cd ?? '') || a.company_name.localeCompare(b.company_name));

    const out = [];
    out.push('# 시간당 요금 표시 빈소 객실 리스트');
    out.push('');
    out.push(`전체 ${halls.length.toLocaleString()}곳 장례식장 DB(\`funeral_halls\`) 에서 \`fee.요금_표시\`가 **시간당 단가** 형태로 노출되는 빈소(시설임대료) 객실만 추출.`);
    out.push('');
    out.push('## 분류 기준');
    out.push('');
    out.push('- **🔴 정확 매칭**: `임대내용`에서 추출한 시간당 단가(N) ≈ `요금_표시` (N×1).');
    out.push('- **🟠 추정**: 시간당 키워드는 있으나 단가 추출 실패. `요금 == 요금_표시` 이고 금액이 작아(<200,000) 시간당으로 추정.');
    out.push('- **⚪ 불명**: 시간당 키워드 있음. 단가 추출 실패 + 휴리스틱도 일치 안 함 — 수동 확인 필요.');
    out.push('');
    out.push('## 객실 업데이트 키');
    out.push('');
    out.push('각 행은 `funeral_halls.facility_fees` JSONB 배열의 한 원소. 업데이트 시 식별자:');
    out.push('');
    out.push('- `facility_cd` (장례식장)');
    out.push('- `fee_index` (`facility_fees` 배열 내 0-base 인덱스)');
    out.push('');
    out.push('예: `update funeral_halls set facility_fees = jsonb_set(facility_fees, \'{<fee_index>,구분}\', \'"hourly"\') where facility_cd = \'<facility_cd>\';`');
    out.push('');
    out.push('---');
    out.push('');
    // 시간당 객실(요금_표시가 시간당 단가)만 추출 — 정확/추정/불명
    const HOURLY_DISPLAY_UNITS = new Set(['시간당', '시간당(추정)', '?']);

    function bucketOf(unit) {
      if (unit === '시간당') return { tag: '🔴', label: '정확' };
      if (unit === '시간당(추정)') return { tag: '🟠', label: '추정' };
      if (unit === '?') return { tag: '⚪', label: '불명' };
      return null;
    }

    const grouped = []; // [{ hall, rows: [{feeIndex, fee, displayUnit, rate, ...}] }]
    let totalRows = 0;
    let countByBucket = { '🔴': 0, '🟠': 0, '⚪': 0 };
    let hallByBucket = { '🔴': new Set(), '🟠': new Set(), '⚪': new Set() };

    for (const h of halls) {
      const allFees = h.facility_fees ?? [];
      const rows = [];
      allFees.forEach((fee, feeIndex) => {
        if (!isBinsoFee(fee)) return;
        const c = classifyDisplayUnit(fee);
        if (!HOURLY_DISPLAY_UNITS.has(c.displayUnit)) return;
        rows.push({ feeIndex, fee, ...c });
      });
      if (rows.length > 0) {
        grouped.push({ hall: h, rows });
        totalRows += rows.length;
        for (const r of rows) {
          const b = bucketOf(r.displayUnit);
          if (b) {
            countByBucket[b.tag] = (countByBucket[b.tag] ?? 0) + 1;
            hallByBucket[b.tag].add(h.facility_cd);
          }
        }
      }
    }

    out.push('## 합계');
    out.push('');
    out.push('| 분류 | 장례식장 수 | 객실 수 |');
    out.push('| --- | ---: | ---: |');
    out.push(`| 🔴 정확 | ${hallByBucket['🔴'].size} | ${countByBucket['🔴']} |`);
    out.push(`| 🟠 추정 | ${hallByBucket['🟠'].size} | ${countByBucket['🟠']} |`);
    out.push(`| ⚪ 불명 | ${hallByBucket['⚪'].size} | ${countByBucket['⚪']} |`);
    out.push(`| **합계** | **${grouped.length}** | **${totalRows}** |`);
    out.push('');
    out.push('---');
    out.push('');
    out.push('## 객실 리스트');
    out.push('');

    // 시도 → 장례식장 → 객실
    grouped.sort((a, b) => {
      const sa = SIDO_NAME[a.hall.sido_cd] ?? a.hall.sido_cd ?? '-';
      const sb = SIDO_NAME[b.hall.sido_cd] ?? b.hall.sido_cd ?? '-';
      return sa.localeCompare(sb) || a.hall.company_name.localeCompare(b.hall.company_name);
    });

    let prevSido = null;
    for (const g of grouped) {
      const sido = SIDO_NAME[g.hall.sido_cd] ?? g.hall.sido_cd ?? '-';
      if (sido !== prevSido) {
        out.push(`### ${sido}`);
        out.push('');
        prevSido = sido;
      }
      out.push(`#### ${g.hall.company_name}`);
      out.push('');
      out.push(`- facility_cd: \`${g.hall.facility_cd}\``);
      out.push('');
      out.push('| fee_index | 분류 | 품명 | 평수(㎡) | 요금 | 요금_표시 | 시간당 단가 | 임대내용 |');
      out.push('| ---: | :---: | --- | ---: | ---: | ---: | ---: | --- |');
      for (const r of g.rows) {
        const f = r.fee;
        const sqm = getAreaSqm(f);
        const pyeong = sqm ? `${Math.round(sqm / 3.3058)}평 (${sqm}㎡)` : '-';
        const raw = (f['요금'] ?? 0).toLocaleString();
        const disp = f['요금_표시'] ?? '-';
        const lease = (f['임대내용'] ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 60);
        const rate = r.rate ? r.rate.toLocaleString() : '-';
        const b = bucketOf(r.displayUnit);
        const tag = b ? `${b.tag} ${b.label}` : r.displayUnit;
        out.push(`| ${r.feeIndex} | ${tag} | ${(f['품명'] ?? '').replace(/\|/g, '\\|')} | ${pyeong} | ${raw} | ${disp} | ${rate} | ${lease} |`);
      }
      out.push('');
    }
    return out.join('\n');
  });
}

md().then((text) => {
  process.stdout.write(text);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
