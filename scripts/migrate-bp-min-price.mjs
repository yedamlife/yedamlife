import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('환경변수 누락: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * '관리'만 있는 순수 관리비 항목인지 판단.
 * - rentcontent는 설명문이라 검사 대상에서 제외
 * - item/category/subcategory에 '관리'가 있어도 '사용료' 또는 '포함'이 함께 있으면
 *   사용료(혹은 관리비 포함 가격)이므로 제외하지 않음
 */
function isManagementItem(it) {
  const text = [it?.item, it?.category, it?.subcategory].filter(Boolean).join(' ');
  if (!text.includes('관리')) return false;
  if (text.includes('사용료') || text.includes('포함')) return false;
  return true;
}

/** price JSONB에서 '관리' 제외한 최저가 산출 */
function computeMinPrice(price) {
  const sections = [price?.hallRent, price?.commission, price?.funeralItem];
  const candidates = [];
  for (const section of sections) {
    if (!Array.isArray(section)) continue;
    for (const it of section) {
      if (isManagementItem(it)) continue;
      const amt = Number(it?.facilityamt);
      if (Number.isFinite(amt) && amt > 0) candidates.push(amt);
    }
  }
  return candidates.length > 0 ? Math.min(...candidates) : null;
}

async function fetchAll() {
  const rows = [];
  const PAGE = 1000;
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from('bp_products')
      .select('id, price')
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

async function main() {
  console.log('bp_products 전체 조회 중...');
  const rows = await fetchAll();
  console.log(`총 ${rows.length}건`);

  const tasks = rows
    .map((row) => ({ id: row.id, min: computeMinPrice(row.price) }))
    .filter((t) => t.min != null);
  const skipped = rows.length - tasks.length;

  console.log(`갱신 대상 ${tasks.length}건, 건너뜀 ${skipped}건 (가격 없음 또는 전부 '관리' 항목)`);

  // 동시성 제한 (10개씩 병렬)
  const CONCURRENCY = 10;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const chunk = tasks.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (t) => {
        const { error } = await supabase
          .from('bp_products')
          .update({ min_price: t.min })
          .eq('id', t.id);
        if (error) {
          failed++;
          console.error(`  id=${t.id} 실패:`, error.message);
        } else {
          updated++;
        }
      }),
    );
    if ((i + CONCURRENCY) % 200 === 0 || i + CONCURRENCY >= tasks.length) {
      console.log(`  진행 ${Math.min(i + CONCURRENCY, tasks.length)}/${tasks.length}`);
    }
  }

  console.log(`\n✓ 완료. 갱신 ${updated}건 / 실패 ${failed}건 / 건너뜀 ${skipped}건`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
