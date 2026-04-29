import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('환경변수 누락: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = path.resolve(__dirname, '../json/crematorium.json');
const BATCH_SIZE = 100;

const toNum = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function toRow(item, index) {
  return {
    facilitycd: item.facilitycd,
    facilitygroupcd: item.facilitygroupcd ?? null,
    companyname: item.companyname ?? null,
    fulladdress: item.fulladdress ?? null,
    telephone: item.telephone ?? null,
    publiccode: item.publiccode ?? null,
    latitude: toNum(item.latitude),
    longitude: toNum(item.longitude),
    lastUpdateDate: item.lastUpdateDate ?? null,
    detail: item.detail ?? null,
    hallRent: item.hallRent ?? [],
    is_active: true,
    sort_order: index,
  };
}

async function main() {
  console.log(`JSON 파일 로드: ${SOURCE_PATH}`);
  const raw = await readFile(SOURCE_PATH, 'utf-8');
  const data = JSON.parse(raw);
  console.log(`총 ${data.length}건 로드 완료`);

  const rows = data.map((item, idx) => toRow(item, idx));

  // facilitycd 중복 검사
  const seen = new Set();
  const dups = [];
  for (const r of rows) {
    if (seen.has(r.facilitycd)) dups.push(r.facilitycd);
    seen.add(r.facilitycd);
  }
  if (dups.length) {
    console.warn(`중복 facilitycd ${dups.length}건:`, dups.slice(0, 10));
  }

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('crematoriums')
      .upsert(batch, { onConflict: 'facilitycd' });

    if (error) {
      console.error(`배치 ${i}~${i + batch.length - 1} 실패:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`${inserted}/${rows.length} 완료`);
    }
  }

  console.log(`\n완료: ${inserted}건 성공, ${errors}건 실패`);
}

main().catch((err) => {
  console.error('스크립트 에러:', err);
  process.exit(1);
});
