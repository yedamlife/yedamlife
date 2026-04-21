/**
 * 시설사용료(facility_fees)에서 평수 정보를 추출하여 "평수_㎡" 필드를 추가하는 마이그레이션 스크립트
 *
 * 처리 패턴:
 *   1. ㎡ 단위: "330㎡", "(561㎡)" → 숫자 그대로 저장
 *   2. 평 단위: "120평형", "76평" → ㎡로 변환 (1평 = 3.3058㎡)
 *   3. 평 + ㎡ 동시 표기: "170평(562.44㎡)" → ㎡ 값 사용
 *   4. 평수 없음 → null
 *
 * 품명, 임대내용 두 필드에서 추출하며 품명 우선
 */

import { readFileSync, writeFileSync } from "fs";

const PYEONG_TO_SQM = 3.3058;
const INPUT_PATH = process.argv[2] || "/Users/dahun/Downloads/funeral_halls_full_1081.json";
const OUTPUT_PATH =
  process.argv[3] || INPUT_PATH.replace(".json", "_with_area.json");

function extractAreaSqm(text) {
  if (!text) return null;

  // 평과 ㎡ 동시 표기 → ㎡ 값 사용
  // ex) "170평(562.44㎡)", "96평(316.80㎡)"
  const bothMatch = text.match(
    /(\d+\.?\d*)\s*평[형]?\s*[\(（]\s*(\d+\.?\d*)\s*㎡/
  );
  if (bothMatch) {
    return parseFloat(bothMatch[2]);
  }

  // ㎡ 단위만 있는 경우
  // ex) "330㎡", "(561㎡)", "254.1㎡ / 1실"
  const sqmMatch = text.match(/(\d+\.?\d*)\s*㎡/);
  if (sqmMatch) {
    return parseFloat(sqmMatch[1]);
  }

  // 평 단위만 있는 경우 → ㎡로 변환
  // ex) "120평형", "76평", "30평/1일"
  const pyeongMatch = text.match(/(\d+\.?\d*)\s*평/);
  if (pyeongMatch) {
    const pyeong = parseFloat(pyeongMatch[1]);
    return Math.round(pyeong * PYEONG_TO_SQM * 100) / 100;
  }

  return null;
}

// 메인
const data = JSON.parse(readFileSync(INPUT_PATH, "utf-8"));

let totalFees = 0;
let withArea = 0;
let withoutArea = 0;

for (const hall of data) {
  const fees = hall["시설사용료"] || [];
  for (const fee of fees) {
    totalFees++;

    // 품명 우선, 없으면 임대내용에서 추출
    const areaFromName = extractAreaSqm(fee["품명"]);
    const areaFromDesc = extractAreaSqm(fee["임대내용"]);
    const area = areaFromName ?? areaFromDesc ?? null;

    fee["평수_㎡"] = area;

    if (area !== null) {
      withArea++;
    } else {
      withoutArea++;
    }
  }
}

writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), "utf-8");

console.log(`완료!`);
console.log(`  총 시설사용료 항목: ${totalFees}`);
console.log(`  평수 추출 성공: ${withArea}`);
console.log(`  평수 없음 (null): ${withoutArea}`);
console.log(`  출력 파일: ${OUTPUT_PATH}`);
