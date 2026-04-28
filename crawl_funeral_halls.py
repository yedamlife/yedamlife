"""
e하늘 장사정보서비스 - 전국 장례식장 상세정보 수집기
  - 목록 API : POST /portal/fnlfac/fac_list.ajax
  - 상세 API : POST /portal/fnlfac/price_info.ajax
결과를 funeral_halls.json 으로 저장합니다.
"""

import json
import time
import logging
from pathlib import Path
import requests

# ── 설정 ──────────────────────────────────────────────────────────────
BASE_URL    = "https://15774129.go.kr"
LIST_API    = f"{BASE_URL}/portal/fnlfac/fac_list.ajax"
DETAIL_API  = f"{BASE_URL}/portal/fnlfac/price_info.ajax"
OUTPUT_DIR  = Path(__file__).resolve().parent / "json"
OUTPUT_FILE = OUTPUT_DIR / "funeral_halls.json"

PAGE_SIZE   = 50        # 한 번에 가져올 목록 수 (최대 테스트 결과 100 정도 안정적)
DELAY_SEC   = 0.5       # 요청 간 딜레이 (서버 부하 방지)
MAX_PAGES   = None      # None → 전체 수집 / 숫자 입력 시 해당 페이지까지만

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

HEADERS = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest",
    "Referer": f"{BASE_URL}/portal/esky/fnlfac/fac_list.do?menuId=M0001000100000000",
    "Origin": BASE_URL,
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
}

session = requests.Session()
session.headers.update(HEADERS)


# ── 목록 수집 ─────────────────────────────────────────────────────────
def fetch_list(page: int) -> dict:
    """장례식장 목록 1페이지 조회"""
    payload = {
        "pageInqCnt":      PAGE_SIZE,
        "curPageNo":       page,
        "sidocd":          "",      # 빈 값 = 전국
        "gungucd":         "",
        "companyname":     "",
        "facilitygroupcd": "TBC0700001",   # 장례식장 코드
        "publiccode":      "A",            # A=전체, Y=공설, N=사설
    }
    resp = session.post(LIST_API, data=payload, timeout=15)
    resp.raise_for_status()
    return resp.json()


def fetch_all_list() -> list[dict]:
    """전국 장례식장 목록 전체 수집"""
    log.info("목록 수집 시작...")

    # 1페이지로 전체 건수 파악
    first = fetch_list(1)
    total = first["cnt"]
    total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE
    if MAX_PAGES:
        total_pages = min(total_pages, MAX_PAGES)

    log.info(f"전체 {total}건 / {total_pages}페이지")

    all_items = list(first["list"])

    for page in range(2, total_pages + 1):
        time.sleep(DELAY_SEC)
        data = fetch_list(page)
        all_items.extend(data["list"])
        log.info(f"  목록 {page}/{total_pages} 완료 (누계 {len(all_items)}건)")

    return all_items


# ── 상세 수집 ─────────────────────────────────────────────────────────
def fetch_detail(facility: dict) -> dict | None:
    """시설 1건 상세정보 조회 후 목록 데이터와 병합"""
    payload = {
        "facilitycd":      facility["facilitycd"],
        "facilitygroupcd": facility["facilitygroupcd"],
        "sanbundiv":       facility.get("sanbundiv", "N"),
    }
    try:
        resp = session.post(DETAIL_API, data=payload, timeout=15)
        resp.raise_for_status()
        detail_json = resp.json()

        if not detail_json.get("isSuccess"):
            log.warning(f"  상세조회 실패: {facility['companyname']}")
            return None

        return {
            # 목록 기본 정보
            "facilitycd":       facility["facilitycd"],
            "facilitygroupcd":  facility["facilitygroupcd"],
            "companyname":      facility["companyname"],
            "fulladdress":      facility["fulladdress"],
            "telephone":        facility["telephone"],
            "latitude":         facility["latitude"],
            "longitude":        facility["longitude"],
            "publiccode":       facility["publiccode"],   # TCM0100001=공설, TCM0100002=사설
            "lastUpdateDate":   facility.get("lastUpdateDate"),
            # 상세 정보
            "detail":           detail_json.get("detail"),
            "hallRent":         detail_json.get("hallRent"),      # 시설사용료
            "funeralItem":      detail_json.get("funeralItem"),   # 장사용품 가격
            "commission":       detail_json.get("commission"),    # 서비스 수수료
            "packageList":      detail_json.get("packageList"),   # 패키지 상품
            "filelist":         detail_json.get("filelist"),      # 시설 사진 목록
        }
    except Exception as e:
        log.error(f"  오류 [{facility['companyname']}]: {e}")
        return None


# ── 메인 ──────────────────────────────────────────────────────────────
def main():
    # 1) 전체 목록 수집
    all_facilities = fetch_all_list()
    log.info(f"목록 수집 완료: {len(all_facilities)}건")

    # 2) 상세 정보 수집
    results = []
    total = len(all_facilities)

    for idx, fac in enumerate(all_facilities, 1):
        detail = fetch_detail(fac)
        if detail:
            results.append(detail)
        log.info(f"상세 [{idx}/{total}] {fac['companyname']}")
        time.sleep(DELAY_SEC)

    # 3) JSON 저장
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = Path(OUTPUT_FILE)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    log.info(f"\n완료! {len(results)}건 → {output_path.resolve()}")


if __name__ == "__main__":
    main()
