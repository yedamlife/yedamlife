/**
 * facility_fees jsonb 컬럼에 평수_㎡ 필드를 추가하는 마이그레이션 스크립트
 *
 * 소스: funeral_halls_full_1081_with_area.json (평수_㎡ 필드가 추가된 파일)
 * 대상: funeral_halls 테이블의 facility_fees jsonb 컬럼
 */

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "환경변수 누락: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SOURCE_PATH =
  process.argv[2] || "/Users/dahun/Downloads/funeral_halls_full_1081_with_area.json";

async function main() {
  console.log("JSON 파일 로드 중...");
  const raw = await readFile(SOURCE_PATH, "utf-8");
  const data = JSON.parse(raw);
  console.log(`총 ${data.length}건 로드 완료`);

  const rows = data.map((item) => ({
    facility_cd: item.facilitycd,
    facility_fees: item["시설사용료"] ?? [],
  }));

  let updated = 0;
  let errors = 0;

  for (const row of rows) {
    const { error } = await supabase
      .from("funeral_halls")
      .update({ facility_fees: row.facility_fees })
      .eq("facility_cd", row.facility_cd);

    if (error) {
      console.error(`${row.facility_cd} 실패:`, error.message);
      errors++;
    } else {
      updated++;
      if (updated % 100 === 0) {
        console.log(`${updated}/${rows.length} 완료`);
      }
    }
  }

  console.log(`\n완료: ${updated}건 성공, ${errors}건 실패`);
}

main().catch((err) => {
  console.error("스크립트 에러:", err);
  process.exit(1);
});
