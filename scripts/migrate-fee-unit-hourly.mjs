/**
 * 시간당 요금 표시 객실에 facility_fees[i].요금단위 = '시간당' 부여
 *
 * 대상: 🔴 정확 매칭 + 🟠 추정 (시간당 키워드 + 단가 추출 매칭 / 또는 휴리스틱)
 * 제외: 🟡 24시간 / 🟢 48시간 / ⚪ 불명
 *
 * 사용:
 *   DRY-RUN: node scripts/migrate-fee-unit-hourly.mjs
 *   실제 적용: node scripts/migrate-fee-unit-hourly.mjs --apply
 */

import fs from 'fs';
import path from 'path';

// .env.local 로드
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APPLY = process.argv.includes('--apply');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('환경변수 누락');
  process.exit(1);
}

// ── 분류 로직 (list-all-binso.mjs와 동일) ──
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
function extractHourlyRate(fee) {
  const text = `${fee['임대내용'] ?? ''} ${fee['품명'] ?? ''} ${fee['서비스내용'] ?? ''}`;
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
function classifyDisplayUnit(fee) {
  const raw = Number(fee['요금'] ?? 0);
  const disp = parseDisplay(fee['요금_표시']);
  if (!hasHourlyKeyword(fee)) return null;
  const rate = extractHourlyRate(fee);
  if (disp == null) return '?';
  if (rate != null && rate > 0) {
    const ratio = disp / rate;
    if (Math.abs(ratio - 1) < 0.02) return '시간당';
    if (Math.abs(ratio - 24) < 0.5) return '24시간';
    if (Math.abs(ratio - 48) < 1) return '48시간(2일)';
    if (Math.abs(ratio - 12) < 0.5) return '12시간';
    return `×${ratio.toFixed(1)}`;
  }
  if (raw > 0 && Math.abs(disp / raw - 1) < 0.02) {
    if (raw < 200000) return '시간당(추정)';
    return '?';
  }
  return '?';
}

// ── DB 호출 ──
async function fetchAll() {
  const halls = [];
  let offset = 0;
  const limit = 500;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/funeral_halls?select=facility_cd,company_name,facility_fees&deleted_at=is.null&offset=${offset}&limit=${limit}`;
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

async function patchHall(facility_cd, facility_fees) {
  const url = `${SUPABASE_URL}/rest/v1/funeral_halls?facility_cd=eq.${encodeURIComponent(facility_cd)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ facility_fees }),
  });
  if (!res.ok) throw new Error(`PATCH ${facility_cd}: ${res.status} ${await res.text()}`);
}

async function main() {
  console.error(`모드: ${APPLY ? '🔥 APPLY (DB 변경)' : '👁️  DRY-RUN (출력만)'}`);
  const halls = await fetchAll();
  console.error(`총 ${halls.length}곳 로드`);

  const TARGET_UNITS = new Set(['시간당', '시간당(추정)']);
  const updates = []; // { facility_cd, company_name, fees, changes: [{idx, unit}] }
  let totalChanges = 0;
  let exactCount = 0;
  let estimatedCount = 0;
  let alreadySetCount = 0;

  for (const hall of halls) {
    const fees = hall.facility_fees ?? [];
    let dirty = false;
    const changes = [];
    const newFees = fees.map((fee, idx) => {
      if (!isBinsoFee(fee)) return fee;
      const unit = classifyDisplayUnit(fee);
      if (!TARGET_UNITS.has(unit)) return fee;
      // 이미 동일 값이면 skip
      if (fee['요금단위'] === '시간당') {
        alreadySetCount++;
        return fee;
      }
      dirty = true;
      changes.push({ idx, unit, name: fee['품명'] });
      if (unit === '시간당') exactCount++;
      else estimatedCount++;
      totalChanges++;
      return { ...fee, 요금단위: '시간당' };
    });
    if (dirty) {
      updates.push({
        facility_cd: hall.facility_cd,
        company_name: hall.company_name,
        fees: newFees,
        changes,
      });
    }
  }

  console.error(`\n변경 대상: 장례식장 ${updates.length}곳, 객실 ${totalChanges}건`);
  console.error(`  🔴 정확:  ${exactCount}건`);
  console.error(`  🟠 추정:  ${estimatedCount}건`);
  console.error(`  ⏭️  이미 적용: ${alreadySetCount}건`);

  if (!APPLY) {
    console.error('\n샘플 5건:');
    for (const u of updates.slice(0, 5)) {
      console.error(`  [${u.facility_cd}] ${u.company_name}`);
      for (const c of u.changes.slice(0, 3)) {
        console.error(`    └ idx=${c.idx} (${c.unit}) ${c.name}`);
      }
    }
    console.error('\n실제 적용하려면: node scripts/migrate-fee-unit-hourly.mjs --apply');
    return;
  }

  // 실제 적용
  let done = 0;
  let failed = 0;
  for (const u of updates) {
    try {
      await patchHall(u.facility_cd, u.fees);
      done++;
      if (done % 20 === 0) {
        console.error(`  ${done}/${updates.length} 완료`);
      }
    } catch (e) {
      failed++;
      console.error(`  ❌ ${u.facility_cd} (${u.company_name}): ${e.message}`);
    }
  }
  console.error(`\n✅ 완료: ${done}곳, ❌ 실패: ${failed}곳`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
