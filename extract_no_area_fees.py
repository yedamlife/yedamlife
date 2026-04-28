"""
1단계: 시설사용료 항목 중 ㎡/평수가 단 하나도 없는 장례식장을 추출
2단계: 해당 장례식장의 시설사용료 항목 전체를 CSV로 내보냄

실행 전 환경변수 설정 필요:
  export SUPABASE_URL="https://<project>.supabase.co"
  export SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
또는 프로젝트 루트의 .env(.gitignore 처리됨)에서 자동 로드.
"""

import os, re, csv, sys
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit(
        "[error] SUPABASE_URL 및 SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.\n"
        "예: export SUPABASE_SERVICE_ROLE_KEY=<your-key> && "
        "python extract_no_area_fees.py"
    )

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── 전체 funeral_halls 조회 (페이지네이션) ──
rows = []
page_size = 1000
offset = 0

while True:
    resp = (
        sb.table("funeral_halls")
        .select("facility_cd, company_name, full_address, facility_fees")
        .range(offset, offset + page_size - 1)
        .execute()
    )
    batch = resp.data
    if not batch:
        break
    rows.extend(batch)
    if len(batch) < page_size:
        break
    offset += page_size

print(f"총 장례식장 수: {len(rows)}")

# ── 1단계: ㎡ 정보가 하나도 없는 장례식장 필터링 ──
SQM_RE = re.compile(r"(\d+(?:\.\d+)?)\s*㎡")


def fee_has_area(fee: dict) -> bool:
    """평수_㎡ 필드 또는 임대내용 텍스트에서 면적 존재 여부"""
    area = fee.get("평수_㎡")
    if isinstance(area, (int, float)) and area > 0:
        return True
    rent_text = fee.get("임대내용", "") or ""
    if SQM_RE.search(rent_text):
        return True
    return False


no_area_halls = []
for hall in rows:
    fees = hall.get("facility_fees") or []
    if not isinstance(fees, list) or len(fees) == 0:
        no_area_halls.append(hall)
        continue
    # 모든 fee 항목에 면적이 없어야 "면적 없는 장례식장"
    if not any(fee_has_area(fee) for fee in fees):
        no_area_halls.append(hall)

print(f"면적 정보가 하나도 없는 장례식장 수: {len(no_area_halls)}")

# ── 2단계: 해당 장례식장의 시설사용료 전체 항목 CSV 추출 ──
csv_rows = []
for hall in no_area_halls:
    fees = hall.get("facility_fees") or []
    if not isinstance(fees, list):
        continue
    for fee in fees:
        csv_rows.append({
            "facility_cd": hall["facility_cd"],
            "company_name": hall["company_name"],
            "full_address": hall.get("full_address", ""),
            "품종": fee.get("품종", ""),
            "품종상세": fee.get("품종상세", ""),
            "품명": fee.get("품명", ""),
            "임대내용": fee.get("임대내용", "") or "",
            "요금": fee.get("요금", ""),
            "요금_표시": fee.get("요금_표시", ""),
            "판매여부": fee.get("판매여부", ""),
        })

print(f"추출된 시설사용료 항목 수: {len(csv_rows)}")

# ── CSV 저장 ──
out_path = os.path.join(os.path.dirname(__file__), "no_area_facility_fees.csv")
fieldnames = [
    "facility_cd", "company_name", "full_address",
    "품종", "품종상세", "품명", "임대내용",
    "요금", "요금_표시", "판매여부",
]

with open(out_path, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(csv_rows)

print(f"CSV 저장 완료: {out_path}")
