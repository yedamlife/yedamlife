import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('환경변수 누락: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SOURCES = [
  { path: '/Users/dahun/Desktop/봉안시설.json', categories: ['봉안당'] },
  { path: '/Users/dahun/Desktop/자연장지.json', categories: ['수목장'] },
  { path: '/Users/dahun/Downloads/공원묘지 (1).json', categories: ['공원묘지'] },
];

const BATCH_SIZE = 200;

function toRow(item, meta, categories) {
  return {
    facility_cd: item.facilitycd,
    menu_id: item.menuId,
    facility_group_cd: item.facilitygroupcd,
    categories,
    intro: item.intro ?? {},
    price: item.price ?? {},
    photos: item.photos ?? [],
    related_facilities: item.relatedFacilities ?? [],
    package_list: item.packageList ?? [],
    source_extracted_at: meta.extractedAt
      ? new Date(meta.extractedAt.replace(' ', 'T') + '+09:00').toISOString()
      : null,
  };
}

async function upsertBatch(rows) {
  const { error } = await supabase
    .from('bp_products')
    .upsert(rows, { onConflict: 'facility_cd' });
  if (error) throw error;
}

async function seedFile({ path, categories }) {
  const raw = await readFile(path, 'utf-8');
  const data = JSON.parse(raw);
  const { meta, list } = data;

  console.log(`\n── ${meta.facilityType} (${list.length}건) → categories=${JSON.stringify(categories)}`);

  const rows = list.map((item) => toRow(item, meta, categories));

  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    await upsertBatch(chunk);
    done += chunk.length;
    console.log(`  upsert ${done}/${rows.length}`);
  }
}

async function main() {
  for (const src of SOURCES) {
    try {
      await seedFile(src);
    } catch (err) {
      console.error(`FAILED for ${src.path}:`, err.message ?? err);
      process.exit(1);
    }
  }

  const { count, error } = await supabase
    .from('bp_products')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  console.log(`\n✓ 완료. bp_products 총 ${count}건`);
}

main();
