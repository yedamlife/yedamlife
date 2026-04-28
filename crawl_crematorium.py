"""
e하늘 장사정보서비스 - 화장시설 상세정보 수집기
  - 목록 API : POST /portal/fnlfac/fac_list.ajax
  - 상세 API : POST /portal/fnlfac/price_info.ajax
결과를 json/crematorium.json 으로 저장합니다.
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

FACILITY_CODE = "TBC0700004"   # 화장시설
PAGE_SIZE     = 50
DELAY_SEC     = 0.5
MAX_PAGES     = None           # None=전체, 정수=해당 페이지까지만 (테스트용)
OUTPUT_DIR    = Path(__file__).resolve().parent / "json"
OUTPUT_FILE   = OUTPUT_DIR / "crematorium.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ── HTTP 세션 ──────────────────────────────────────────────────────────
SESSION = requests.Session()
SESSION.headers.update({
    "Content-Type":    "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest",
    "Referer":  f"{BASE_URL}/portal/esky/fnlfac/fac_list.do?menuId=M0001000100000000",
    "Origin":   BASE_URL,
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
})


# ── 목록 수집 ─────────────────────────────────────────────────────────
def fetch_list_page(page: int) -> dict:
    resp = SESSION.post(LIST_API, data={
        "pageInqCnt":      PAGE_SIZE,
        "curPageNo":       page,
        "sidocd":          "",
        "gungucd":         "",
        "companyname":     "",
        "facilitygroupcd": FACILITY_CODE,
        "publiccode":      "A",
    }, timeout=15)
    resp.raise_for_status()
    return resp.json()


def fetch_all_list() -> list[dict]:
    log.info("목록 수집 시작")

    first  = fetch_list_page(1)
    total  = first["cnt"]
    n_page = (total + PAGE_SIZE - 1) // PAGE_SIZE
    if MAX_PAGES:
        n_page = min(n_page, MAX_PAGES)

    log.info(f"전체 {total}건 / {n_page}페이지")

    items = list(first["list"])
    for page in range(2, n_page + 1):
        time.sleep(DELAY_SEC)
        items.extend(fetch_list_page(page)["list"])
        log.info(f"  목록 {page}/{n_page} (누계 {len(items)}건)")

    return items


# ── 상세 수집 ─────────────────────────────────────────────────────────
def fetch_detail(fac: dict) -> dict | None:
    try:
        resp = SESSION.post(DETAIL_API, data={
            "facilitycd":      fac["facilitycd"],
            "facilitygroupcd": fac["facilitygroupcd"],
            "sanbundiv":       fac.get("sanbundiv", "N"),
        }, timeout=15)
        resp.raise_for_status()
        d = resp.json()

        if not d.get("isSuccess"):
            log.warning(f"  상세 실패: {fac['companyname']}")
            return None

        return {
            "facilitycd":       fac["facilitycd"],
            "facilitygroupcd":  fac["facilitygroupcd"],
            "companyname":      fac["companyname"],
            "fulladdress":      fac["fulladdress"],
            "telephone":        fac["telephone"],
            "publiccode":       fac["publiccode"],
            "latitude":         fac.get("latitude"),
            "longitude":        fac.get("longitude"),
            "lastUpdateDate":   fac.get("lastUpdateDate"),
            "detail":           d.get("detail"),
            "hallRent":         d.get("hallRent"),       # 화장요금
            "funeralItem":      d.get("funeralItem"),
            "commission":       d.get("commission"),
            "facilityList":     d.get("facilityList"),
            "packageList":      d.get("packageList"),
            "filelist":         d.get("filelist"),
        }
    except Exception as e:
        log.error(f"  오류 [{fac['companyname']}]: {e}")
        return None


# ── 메인 ──────────────────────────────────────────────────────────────
def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    facilities = fetch_all_list()
    log.info(f"목록 수집 완료: {len(facilities)}건")

    results = []
    total = len(facilities)

    for idx, fac in enumerate(facilities, 1):
        detail = fetch_detail(fac)
        if detail:
            results.append(detail)
        log.info(f"  상세 [{idx}/{total}] {fac['companyname']}")
        time.sleep(DELAY_SEC)

    OUTPUT_FILE.write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    log.info(f"\n완료! {len(results)}건 → {OUTPUT_FILE.resolve()}")


if __name__ == "__main__":
    main()
