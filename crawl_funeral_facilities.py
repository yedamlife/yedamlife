"""
e하늘 장사정보서비스 - 다중 시설 유형 상세정보 수집기
수집 대상:
  TBC0700002  묘지
  TBC0700003  봉안시설 (납골당)
  TBC0700005  자연장지
결과: json/funeral_facilities.json (유형별 파일도 개별 저장)
"""

import json
import time
import logging
from pathlib import Path
from dataclasses import dataclass

import requests

# ── 설정 ──────────────────────────────────────────────────────────────
BASE_URL    = "https://15774129.go.kr"
LIST_API    = f"{BASE_URL}/portal/fnlfac/fac_list.ajax"
DETAIL_API  = f"{BASE_URL}/portal/fnlfac/price_info.ajax"

PAGE_SIZE   = 50        # 페이지당 목록 수
DELAY_SEC   = 0.5       # 요청 간 딜레이 (초)
MAX_PAGES   = None      # None=전체, 정수=해당 페이지까지만 (테스트용)
OUTPUT_DIR  = Path(__file__).resolve().parent / "json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)


# ── 시설 유형 정의 ─────────────────────────────────────────────────────
@dataclass
class FacilityType:
    code: str           # facilitygroupcd
    name: str           # 한글명
    filename: str       # 저장 파일명

FACILITY_TYPES = [
    FacilityType("TBC0700002", "묘지",     "cemetery"),
    FacilityType("TBC0700003", "봉안시설", "charnel"),
    FacilityType("TBC0700005", "자연장지", "natural_burial"),
]

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
def fetch_list_page(ftype: FacilityType, page: int) -> dict:
    resp = SESSION.post(LIST_API, data={
        "pageInqCnt":      PAGE_SIZE,
        "curPageNo":       page,
        "sidocd":          "",
        "gungucd":         "",
        "companyname":     "",
        "facilitygroupcd": ftype.code,
        "publiccode":      "A",   # A=전체, Y=공설, N=사설
    }, timeout=15)
    resp.raise_for_status()
    return resp.json()


def fetch_all_list(ftype: FacilityType) -> list[dict]:
    log.info(f"[{ftype.name}] 목록 수집 시작")

    first  = fetch_list_page(ftype, 1)
    total  = first["cnt"]
    n_page = (total + PAGE_SIZE - 1) // PAGE_SIZE
    if MAX_PAGES:
        n_page = min(n_page, MAX_PAGES)

    log.info(f"[{ftype.name}] 전체 {total}건 / {n_page}페이지")

    items = list(first["list"])
    for page in range(2, n_page + 1):
        time.sleep(DELAY_SEC)
        items.extend(fetch_list_page(ftype, page)["list"])
        log.info(f"[{ftype.name}] 목록 {page}/{n_page} (누계 {len(items)}건)")

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
            # ── 공통 기본 정보 ──────────────────────────────────────
            "facilitycd":       fac["facilitycd"],
            "facilitygroupcd":  fac["facilitygroupcd"],
            "companyname":      fac["companyname"],
            "fulladdress":      fac["fulladdress"],
            "telephone":        fac["telephone"],
            "publiccode":       fac["publiccode"],   # TCM0100001=공설, TCM0100002=사설
            "latitude":         fac.get("latitude"),
            "longitude":        fac.get("longitude"),
            "lastUpdateDate":   fac.get("lastUpdateDate"),

            # ── 상세 정보 (유형별 고유 필드 포함) ──────────────────
            "detail":           d.get("detail"),

            # ── 가격 정보 ───────────────────────────────────────────
            # hallRent  : 시설사용료 / 봉안단·납골 이용료 / 화장요금 등
            # funeralItem: 장사용품(수의·관 등) 가격  ← 묘지/봉안에만 있음
            # commission : 서비스 수수료             ← 장례식장 위주
            "hallRent":    d.get("hallRent"),
            "funeralItem": d.get("funeralItem"),
            "commission":  d.get("commission"),

            # ── 부속 시설 (봉안시설에 자연장지가 딸린 경우 등) ──────
            "facilityList": d.get("facilityList"),

            # ── 패키지 / 사진 ───────────────────────────────────────
            "packageList": d.get("packageList"),
            "filelist":    d.get("filelist"),
        }
    except Exception as e:
        log.error(f"  오류 [{fac['companyname']}]: {e}")
        return None


# ── 단일 유형 수집 파이프라인 ─────────────────────────────────────────
def collect_one_type(ftype: FacilityType) -> list[dict]:
    facilities = fetch_all_list(ftype)
    results    = []
    total      = len(facilities)

    for idx, fac in enumerate(facilities, 1):
        detail = fetch_detail(fac)
        if detail:
            results.append(detail)
        log.info(f"[{ftype.name}] 상세 {idx}/{total}: {fac['companyname']}")
        time.sleep(DELAY_SEC)

    # 유형별 개별 파일 저장
    out = OUTPUT_DIR / f"{ftype.filename}.json"
    out.write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    log.info(f"[{ftype.name}] 저장 완료 → {out} ({len(results)}건)")
    return results


# ── 메인 ──────────────────────────────────────────────────────────────
def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    all_results: dict[str, list[dict]] = {}

    for ftype in FACILITY_TYPES:
        all_results[ftype.name] = collect_one_type(ftype)
        log.info("")   # 유형 구분 빈 줄

    # 통합 파일 저장
    combined_path = OUTPUT_DIR / "funeral_facilities.json"
    combined_path.write_text(
        json.dumps(all_results, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    total = sum(len(v) for v in all_results.values())
    log.info("=" * 50)
    log.info(f"전체 수집 완료: {total}건")
    for name, items in all_results.items():
        log.info(f"  {name}: {len(items)}건")
    log.info(f"통합 파일 → {combined_path.resolve()}")


if __name__ == "__main__":
    main()
