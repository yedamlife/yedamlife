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

const SOURCE_PATH = '/Users/dahun/Downloads/funeral_halls_full_1081.json';
const BATCH_SIZE = 100;

// Y/N → boolean
const toBool = (v) => v === 'Y';

// 날짜 변환 — 잘못된 값("--", "2014-05-00" 등) 필터링
const toDate = (v) => {
  if (!v) return null;
  const d = v.replace(/\//g, '-');
  // 유효한 날짜 형식인지 확인 (YYYY-MM-DD, 월/일이 00이면 무효)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  if (d.includes('-00')) return null;
  return d;
};

function toRow(item) {
  return {
    facility_cd: item.facilitycd,
    facility_group_cd: item.facilitygroupcd,
    company_name: item.companyname,
    company_no: item.companyno,
    representative_name: item.representativename,
    homepage: item.homepage,
    zip_code: item.zipcd,
    full_address: item.fulladdress,
    address1: item.address1,
    address2: item.address2,
    telephone: item.telephone,
    fax_number: item.faxnum,
    latitude: item.latitude ? parseFloat(item.latitude) : null,
    longitude: item.longitude ? parseFloat(item.longitude) : null,
    org_id: item.orgid,
    org_name: item.orgidnm,
    sido_cd: item.sidocd,
    gungu_cd: item.gungucd,
    public_code: item.publiccode,
    public_label: item.publicYn,
    manage_class: item.manageclassdiv,
    funeral_type: item.funeraltypecd,
    mortuary_count: item.mortuaycnt ?? 0,
    charnel_capacity: item.charnelabilitycnt ?? 0,
    parking_count: item.parkcnt ?? 0,
    business_date: toDate(item.businessdate),
    has_meal_room: toBool(item.mealroomyn),
    has_wait_room: toBool(item.waitroomyn),
    has_imparity: toBool(item.imparyn),
    has_parking: toBool(item.parkyn),
    has_convenience: toBool(item.superyn),
    traffic_public: item.traffpublic,
    traffic_car: item.traffowner,
    etc_info: item.etcinfw,
    last_update_date: toDate(item.lastUpdateDate),
    price_update_date: toDate(item.priceitemdate),
    has_package: toBool(item.packageYn),
    facility_fees: item['시설사용료'] ?? [],
    service_items: item['서비스항목'] ?? [],
    funeral_supplies: item['장사용품분류'] ?? [],
    package_list: item.packageList ?? [],
    file_list: item.filelist ?? [],
  };
}

async function main() {
  console.log('JSON 파일 로드 중...');
  const raw = await readFile(SOURCE_PATH, 'utf-8');
  const data = JSON.parse(raw);
  console.log(`총 ${data.length}건 로드 완료`);

  const rows = data.map(toRow);

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('funeral_halls')
      .upsert(batch, { onConflict: 'facility_cd' });

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
