# 장례비용 계산기 — 결과 공유 & 상담 전환 플로우

> 관련 문서: [장례비용 계산기 기획서](./funeral-cost-calculator.md), [알림톡 템플릿](./알림톡/readme.md)

## 1. 배경

현재 장례비용 모달은 **5단계(연락처 입력) → 알림톡 전송 후 즉시 6단계(결과)로 이동**하는 흐름이다.
이 방식은 다음 문제가 있다.

- 결과 화면이 모달 안에서만 살아있어 **고객이 다시 보기 어려움**(URL 공유 불가)
- 알림톡으로 받은 메시지에서 결과로 바로 진입하는 동선이 없음
- 6단계에서 추천 상품을 클릭해 상담 전환하는 단계가 **데이터로 적재되지 않음** (전환 측정 불가)

## 2. 변경 후 플로우

```
┌──────────────────────────────────────────────────────┐
│ Step 1~4. 장례형태/지역/장례식장/규모 선택              │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│ Step 5. 이름·연락처 입력 + [알림톡으로 전송 받기]      │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│ ① fc_estimate_requests INSERT (uuid 생성)            │
│ ② 알림톡 발송 — 결과 URL 버튼 포함                    │
│    https://yedamlife.com/funeral-cost/result/{uuid}  │
│ ③ 모달 닫기 + 토스트 "알림톡으로 전송되었습니다"       │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│ 고객이 알림톡 버튼 / 링크 클릭                         │
│ → /funeral-cost/result/{uuid}                        │
│ → 우선순위로 결과 결정 (4-4 일관성 규칙 참고)           │
│   ① fc_consultation_requests 가 있으면 result_json    │
│      박제값 그대로 (라이브 호출 없음, read-only)         │
│   ② 없으면 fc_estimate_requests.input_json + 라이브    │
│      통계로 재계산                                     │
│   매칭 없으면 토스트 "결과가 존재하지 않습니다"         │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│ 결과 화면에서 [예담 ○○으로 상담받기] 클릭              │
│ ① fc_consultation_requests INSERT (resultJson 적재)  │
│ ② 알림톡 발송 (FC_CONSULT)                            │
│ ③ 모달 닫기 + 토스트 "상담이 접수되었습니다"            │
└──────────────────────────────────────────────────────┘
```

## 3. 데이터베이스

### 3-1. `fc_estimate_requests` — 비용 견적 요청 (Step 5 시점 적재)

5단계까지 입력한 모든 선택지를 보존해 **결과 URL 재방문 시 동일한 화면을 복원**한다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `bigserial PK` | |
| `uuid` | `uuid UNIQUE NOT NULL DEFAULT gen_random_uuid()` | 결과 URL 식별자 |
| `name` | `text NOT NULL` | 신청자 이름 |
| `phone` | `text NOT NULL` | 신청자 연락처 (`010-0000-0000`) |
| `age_group` | `text NULL` | 연령대 (선택) |
| `funeral_type` | `text NOT NULL` | `3day` / `nobinso` |
| `current_situation` | `text NULL` | `preparing` / `within_month` / `within_days` / `after` |
| `sido_cd` | `text NULL` | 시도 코드 |
| `gungu_cd` | `text NULL` | 시군구 코드 |
| `facility_cd` | `text NULL` | 선택한 장례식장 코드 |
| `selected_size` | `text NULL` | `small` / `medium` / `large` / `premium` / `vip` |
| `guest_count` | `int NULL` | 예상 조문객 수 |
| `input_json` | `jsonb NOT NULL` | **5단계까지의 모든 입력 상태 스냅샷** (아래 스키마 참고) |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | |
| `viewed_at` | `timestamptz NULL` | 결과 페이지 첫 방문 시각 |
| `view_count` | `int NOT NULL DEFAULT 0` | 결과 페이지 조회수 |
| `deleted_at` | `timestamptz NULL` | 소프트 삭제 |

**`input_json` 스키마** (모달 상태 그대로 직렬화)
```json
{
  "funeralType": "3day",
  "currentSituation": "preparing",
  "sido": "6110000",
  "gungu": "6110100",
  "facilityCd": "...",
  "selectedSize": "medium",
  "guestCount": 120,
  "checkedFeeIndexes": [0],
  "checkedEncoffinIndexes": [0],
  "checkedMortuaryIndexes": [0],
  "unselectedSangjoKeys": ["3:1", "3:2", "3:3", "4:1", ...],
  "sangjoQuantities": { "0:0": 4, "7:0": 4, "7:1": 4 },
  "flowerDecor": "normal",
  "ritual": "none"
}
```

> `input_json` 만 있으면 결과 URL에서 모달과 동일한 6단계 화면을 복원할 수 있어야 한다. 칼럼으로도 분리한 핵심 키들은 검색·집계 편의를 위한 중복 적재.

**인덱스**
- `idx_fc_estimate_requests_uuid` UNIQUE — URL 조회 hot path
- `idx_fc_estimate_requests_phone` — 동일 고객 식별
- `idx_fc_estimate_requests_created_at` — 어드민 리스트

**RLS**
- 익명 사용자: `INSERT` 만 허용 (`anon`), `SELECT` 는 anon/일반 사용자 모두 차단
- 결과 페이지 조회는 **API 라우트 → service_role** 로 우회 (uuid 가 사실상 비밀)
- 어드민(`auth.uid()` 또는 admin role): `SELECT/UPDATE/DELETE` 허용

---

### 3-2. `fc_consultation_requests` — 추천 상품 상담 신청 (Step 6 CTA 클릭)

결과 화면에서 **추천 예담 상품 카드의 [상담받기]** 를 누른 시점에 적재.
6단계의 모든 정적 데이터(계산된 비용 결과)를 그대로 보존해 영업 컨텍스트로 활용.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `bigserial PK` | |
| `estimate_request_id` | `bigint NULL REFERENCES fc_estimate_requests(id)` | **3-1 레코드와 매칭** (없을 수도 있음 — 예: 어드민 미리보기) |
| `estimate_uuid` | `uuid NULL` | `fc_estimate_requests.uuid` 미러 (조인 없이 추적용) |
| `name` | `text NOT NULL` | 신청자 이름 |
| `phone` | `text NOT NULL` | 신청자 연락처 |
| `selected_product_id` | `text NOT NULL` | `yedam-1` / `yedam-2` / `yedam-3` / `yedam-4` / `yedam-vip` |
| `selected_product_name` | `text NOT NULL` | `예담 무빈소`, `예담 2호` 등 (스냅샷) |
| `result_json` | `jsonb NOT NULL` | **6단계 결과 데이터 전체 스냅샷** (아래 스키마 참고) |
| `consult_status` | `text NOT NULL DEFAULT 'pending'` | `pending` / `contacted` / `closed_won` / `closed_lost` |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | |
| `deleted_at` | `timestamptz NULL` | |

**`result_json` 스키마**

크게 세 영역으로 구성한다.

1. **`selections`** — 고객이 6단계에서 명시적으로 선택/체크한 모든 항목 (영업 응대 시 가장 중요)
2. **`computed`** — 위 선택을 바탕으로 계산된 항목별 비용 (영업 자료용)
3. **`recommendation`** — 추천 상품 및 절감 효과

**최종 비용 = 장례식장 기본 이용료 + 상조비용**. 두 영역 모두 빠짐없이 적재되어야 한다. 누락 시 어드민·영업 측에서 합계가 맞지 않아 신뢰도가 무너진다.

#### 비용 구성 매핑 (`computed.total` = ?)

| 장례 형태 | basicTotal 구성 | sangjoTotal 구성 |
|---|---|---|
| **3일장** | 빈소 + 이송 + 안치 + 식대 + 제단꽃 + 제사 | SANGJO_ITEMS_3DAY 전체 (전문도우미·인력·차량·수의·관·고인추가용품·유골함·상복·**수시비·염습 포함**) |
| **무빈소** | 이송 + 안치 | SANGJO_ITEMS_NOBINSO 전체 + **염습(별도) + 수시비(250,000원 별도)** |

> 3일장은 수시비·염습이 SANGJO 배열 안에 포함되지만, 무빈소는 별도 가산. 두 케이스 모두 `selections.sangjo.items` 배열에 항목으로 명시한다.

#### 스키마 예시 (3일장)

```json
{
  "funeralType": "3day",
  "isMetro": true,
  "region": { "sidoCd": "6110000", "sidoLabel": "서울특별시", "gunguCd": "6110100", "gunguLabel": "종로구" },
  "hall": {
    "facilityCd": "...",
    "companyName": "○○장례식장",
    "fullAddress": "..."
  },

  "selections": {
    "selectedSize": "medium",
    "selectedSizeLabel": "중형",
    "guestCount": 120,

    // ── 장례식장 기본 이용료 영역 ──
    "binso": {
      "checkedFeeIndexes": [0],
      "items": [
        { "품명": "5호실", "평수": 50, "요금": 705000, "단가설명": "1실/24시간 기준", "multiplier": 2, "합계": 1410000 }
      ],
      "fallbackToMedian": false,
      "amount": 1410000
    },
    "transfer": {
      "amount": 300000,
      "isFixed": true,
      "source": "metro"          // metro / non_metro 지역 고정값
    },
    "mortuary": {
      "checkedMortuaryIndexes": [0],
      "items": [
        { "품명": "안치료", "요금": 48000, "단가설명": "1일", "multiplier": 2, "합계": 96000 }
      ],
      "isAvg": false,             // 매칭 데이터 없으면 true (지역 평균 폴백)
      "amount": 96000
    },
    "food": {
      "perGuest": 24000,
      "guestCount": 120,
      "amount": 2880000,
      "isFixed": true,
      "source": "metro"
    },
    "flowerDecor": { "key": "normal", "label": "일반형 평균", "amount": 700000 },
    "ritual":      { "key": "formal", "label": "정식 제사 평균", "amount": 550000 },

    // ── 상조비용 영역 ──
    "sangjo": {
      "items": [
        {
          "label": "전문도우미",
          "selectedSubs": [
            { "label": "전문도우미 1명 (1일당 120,000원)", "qty": 2, "unit": 240000, "total": 480000 }
          ],
          "total": 480000
        },
        {
          "label": "인력지원",
          "selectedSubs": [
            { "label": "장례지도사 1명", "qty": 1, "unit": 240000, "total": 240000 },
            { "label": "입관지도사 1명", "qty": 1, "unit": 240000, "total": 240000 }
          ],
          "total": 480000
        },
        {
          "label": "장의차량",
          "kind": "optional",
          "selectedSubs": [
            { "label": "장의버스 1대", "qty": 1, "unit": 450000, "total": 450000 },
            { "label": "리무진 1대", "qty": 1, "unit": 450000, "total": 450000 }
          ],
          "skippedSubs": [],
          "total": 900000
        },
        {
          "label": "수의",
          "kind": "radio",
          "selected": { "label": "면수의", "price": 350000 },
          "candidates": ["기본수의", "면수의", "저마수의", "대마수의"],
          "total": 350000
        },
        {
          "label": "관",
          "kind": "radio",
          "selected": { "label": "오동나무 맞춤 특관", "price": 450000 },
          "candidates": ["오동나무 기본", "오동나무 맞춤 특관", "솔송나무(매장)", "향나무(매장)"],
          "total": 450000
        },
        {
          "label": "고인 추가용품",
          "kind": "optional",
          "selectedSubs": [
            { "label": "입관 꽃장식 평균", "price": 150000 },
            { "label": "영정사진 평균", "price": 150000 }
          ],
          "skippedSubs": ["고인메이크업 평균"],
          "total": 300000
        },
        {
          "label": "유골함",
          "kind": "radio",
          "selected": { "label": "도자기 2중 진공함", "price": 600000 },
          "candidates": ["도자기 유골함", "도자기 2중 진공함", "도자기 3중 진공함"],
          "total": 600000
        },
        {
          "label": "상복",
          "selectedSubs": [
            { "label": "남자상복 1벌", "qty": 4, "unit": 50000, "total": 200000 },
            { "label": "여자상복 1벌", "qty": 4, "unit": 30000, "total": 120000 }
          ],
          "total": 320000
        },
        { "label": "수시비", "total": 250000, "source": "fixed" },
        { "label": "염습",   "total": 400000, "source": "fixed" }
      ],

      "rawState": {
        "unselectedSangjoKeys": ["3:0", "3:2", "3:3", "4:0", "4:2", "4:3", "5:1", "6:0", "6:2"],
        "sangjoQuantities": { "0:0": 2, "7:0": 4, "7:1": 4 }
      }
    }
  },

  "computed": {
    "basic": {
      "binso": 1410000,
      "transfer": 300000,
      "mortuary": 96000,
      "food": 2880000,
      "flowerDecor": 700000,
      "ritual": 550000,
      "subtotal": 5936000     // = basicTotal
    },
    "sangjo": {
      "전문도우미": 480000,
      "인력지원": 480000,
      "장의차량": 900000,
      "수의": 350000,
      "관": 450000,
      "고인 추가용품": 300000,
      "유골함": 600000,
      "상복": 320000,
      "수시비": 250000,
      "염습": 400000,
      "subtotal": 4530000     // = sangjoTotal
    },
    "total": 10466000          // basic.subtotal + sangjo.subtotal
  },

  "recommendation": {
    "id": "yedam-3",
    "name": "예담 3호",
    "price": 3400000,
    "savings": 7066000        // total - price
  }
}
```

#### 무빈소(nobinso) 케이스 차이

`selections.binso` / `food` / `flowerDecor` / `ritual` 키는 **생략**한다. 대신 `sangjo.items` 에 다음 두 항목이 추가된다.

```json
{
  "selections": {
    "sangjo": {
      "items": [
        ... (SANGJO_ITEMS_NOBINSO 항목들),
        { "label": "염습", "total": 350000, "source": "metro" },          // costs.encoffin
        { "label": "수시비", "total": 250000, "source": "fixed" }
      ]
    }
  },
  "computed": {
    "basic":  { "transfer": 300000, "mortuary": 96000, "subtotal": 396000 },
    "sangjo": { "...": "...", "subtotal": ... }
  }
}
```

**`selections` 설계 원칙**

- **모든 합산 대상 항목은 selections 안에 1:1로 존재해야 한다.** `computed.basic.subtotal` 과 `selections` 의 amount 합산이 일치해야 함 (체크 가능한 invariant).
- **사람이 읽기 좋게 라벨까지 함께 저장**: `selectedSize: "medium"` 외에 `selectedSizeLabel: "중형"` 도 같이.
- **체크한 인덱스와 실제 항목 스냅샷 둘 다 저장**: 장례식장 fee 배열이 재정렬되어도 의미 보존.
- **단가 단위 메타** (`단가설명`, `multiplier`) 보존: 24시간/시간당/1회 등 라벨 그대로 노출.
- **고정값 항목** (`transfer`, `food`, `수시비`, 무빈소 `염습`): `isFixed: true` 또는 `source: "metro"|"non_metro"|"fixed"` 로 출처 명시.
- **평균 fallback** (안치실 데이터 부재): `isAvg: true` 플래그로 표시.
- **라디오 선택**: `kind: "radio"`, `selected` + `candidates` 배열.
- **옵션 항목**: `selectedSubs` / `skippedSubs` 로 켠/끈 항목 명시.
- **수량 변동 항목**: `qty`, `unit`, `total` 모두 보존.
- **`rawState`**: 모달 내부 상태 백업 (디버그·QA·복원용).

> ⚠️ `result_json` 은 **시점 스냅샷** 이므로 추후 라벨/가격이 바뀌어도 해당 레코드는 변하지 않는다. 어드민 화면에서 표시할 때 별도 매핑 없이 바로 사용 가능하도록 라벨을 풍부하게 담는다.

#### 어드민 모달 재현 (replay)

> 어드민에서 고객이 본 모달과 **동일한 화면**을 띄우려면 result_json 만으로 자족 가능해야 한다. 장례식장 가격이나 라이브 통계가 추후 바뀌어도 어드민이 본 결과 = 고객이 본 결과여야 함.

기본 `selections` / `computed` 외에 다음 두 키를 추가로 적재한다.

```json
{
  "...": "(앞서 정의한 selections / computed / recommendation)",

  "hallSnapshot": {
    "facility_cd": "...",
    "company_name": "○○장례식장",
    "full_address": "...",
    "sido_cd": "6110000",
    "funeral_type": "...",
    "public_label": "...",
    "manage_class": "...",
    "mortuary_count": 8,
    "parking_count": 50,

    // 모달 step 6 의 시설 사용료/염습/안치 리스트를 그대로 다시 그리기 위한 raw 배열.
    // 'Y'/판매여부=Y 필터링 전 상태 그대로 박제.
    "facility_fees":  [ /* funeral_halls.facility_fees 시점 복사 */ ],
    "service_items":  [ /* funeral_halls.service_items 시점 복사 */ ]
  },

  "statsSnapshot": {
    // 고객이 본 시점의 라이브 통계 평균값. /api/v1/funeral-cost/sangjo-stats 응답 그대로.
    // 어드민에서 동일 라벨/금액을 재현할 때 사용.
    "makeup":   { "hall_count": 14,  "avg_amount": 127143, "median_amount": 100000 },
    "shroud":   { "hall_count": 232, "avg_amount": 250000, "median_amount": 250000 },
    "mourning": { "male": {...}, "female": {...} },
    "vehicle":  { "hall_count": ..., "bus": {...}, "limo": {...} },
    "director": { "hall_count": ..., "avg_amount": ..., "median_amount": ... },
    "coffin":   { "hall_count": 909, "avg_amount": 290000, "median_amount": 290000 },
    "urn":      { "hall_count": ..., "wood": {...}, "ceramic": {...} },
    "portrait": { "hall_count": 275, "avg_amount": 150000, "median_amount": 150000 },
    "cleaning": { "metro": {...}, "non_metro": {...} }
  },

  "uiSnapshot": {
    // 모달 내부 상태 (재방문 시 동일 화면 복원용 — selections.sangjo.rawState 와 일부 중복).
    "checkedFeeIndexes": [0],
    "checkedEncoffinIndexes": [0],
    "checkedMortuaryIndexes": [0],
    "unselectedSangjoKeys": ["3:0", "3:2", ...],
    "sangjoQuantities": { "0:0": 2, "7:0": 4, "7:1": 4 },
    "flowerDecor": "normal",
    "ritual": "formal",
    "guestCount": 120,
    "selectedSize": "medium"
  }
}
```

**어드민 화면 구현 가이드**

1. 모달 6단계 렌더링 부분을 `<FuneralCostResultView />` 로 분리한다 (5장 5-1 참고).
2. 컴포넌트는 **두 가지 데이터 소스 모드**를 지원한다.
   - `live` 모드: 현재처럼 `selectedHall` / 라이브 통계 props 를 받아 동작 (모달, 결과 페이지)
   - `snapshot` 모드: `result_json` 단일 prop 만 받아 동작 (어드민)
3. `snapshot` 모드에서는:
   - 빈소/염습/안치 리스트 → `hallSnapshot.facility_fees` / `service_items` 사용
   - 라이브 통계 라벨 → `statsSnapshot` 에서 직접 읽음 (네트워크 호출 없음)
   - 체크박스/라디오 → `uiSnapshot` 에서 복원, **모두 read-only** (어드민은 수정 불가, 변경하려면 별도 시뮬레이션 모드 필요)
4. 어드민 라우트: `app/admin/funeral-cost/consultations/[id]/page.tsx`
   - `fc_consultation_requests` 단건 조회 → `result_json` 추출 → `<FuneralCostResultView mode="snapshot" data={result_json} />`

**저장 시점**

`hallSnapshot` 과 `statsSnapshot` 은 **모달 6단계 진입 시점에 한 번** 캡처해두고, 5단계 [알림톡으로 전송 받기] 시 `fc_estimate_requests.input_json` 에 함께 저장. 이후 결과 페이지 / 상담 신청에서는 동일 스냅샷을 그대로 복사해 `fc_consultation_requests.result_json` 에 박제.

> 라이브 통계는 매일 변동될 수 있으므로 **고객이 결과 페이지를 재방문할 때마다 다시 계산하지 않고 스냅샷 그대로 보여주는 게 일관성에 유리**. 단, "현재 시세 다시 계산" 버튼을 별도 노출할 수도 있음 (운영 정책 결정 필요).

**인덱스**
- `idx_fc_consultation_requests_estimate_uuid`
- `idx_fc_consultation_requests_phone`
- `idx_fc_consultation_requests_created_at`

**RLS**
- 익명 사용자: `INSERT` 만 허용
- 어드민: `SELECT/UPDATE/DELETE` 허용

---

### 3-3. CREATE TABLE SQL (Supabase / Postgres)

> Supabase SQL Editor 에서 실행. `gen_random_uuid()` 는 `pgcrypto` 확장 필요.

```sql
-- ─────────────────────────────────────────────
-- 0. 의존 확장
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────
-- 1. fc_estimate_requests — 비용 견적 요청
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fc_estimate_requests (
  id                 bigserial      PRIMARY KEY,
  uuid               uuid           NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  name               text           NOT NULL,
  phone              text           NOT NULL,
  age_group          text           NULL,
  funeral_type       text           NOT NULL CHECK (funeral_type IN ('3day', 'nobinso')),
  current_situation  text           NULL,
  sido_cd            text           NULL,
  gungu_cd           text           NULL,
  facility_cd        text           NULL,
  selected_size      text           NULL CHECK (
                       selected_size IS NULL OR
                       selected_size IN ('small','medium','large','premium','vip')
                     ),
  guest_count        int            NULL,
  input_json         jsonb          NOT NULL,
  created_at         timestamptz    NOT NULL DEFAULT now(),
  viewed_at          timestamptz    NULL,
  view_count         int            NOT NULL DEFAULT 0,
  deleted_at         timestamptz    NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fc_estimate_requests_uuid
  ON public.fc_estimate_requests (uuid)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_fc_estimate_requests_phone
  ON public.fc_estimate_requests (phone)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_fc_estimate_requests_created_at
  ON public.fc_estimate_requests (created_at DESC)
  WHERE deleted_at IS NULL;

COMMENT ON TABLE  public.fc_estimate_requests IS '장례비용 계산기 5단계 제출 시 적재. uuid 로 결과 URL 식별.';
COMMENT ON COLUMN public.fc_estimate_requests.uuid       IS '/funeral-cost/result/{uuid} 결과 URL 키';
COMMENT ON COLUMN public.fc_estimate_requests.input_json IS '5단계까지 모달 상태 스냅샷 (재방문 시 동일 화면 복원용)';
COMMENT ON COLUMN public.fc_estimate_requests.view_count IS '결과 페이지 조회수 (best-effort 갱신)';

-- RLS
ALTER TABLE public.fc_estimate_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert" ON public.fc_estimate_requests;
CREATE POLICY "anon_insert"
  ON public.fc_estimate_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- SELECT 는 service_role 키로 우회 (RLS 정책 추가 안 함)
-- 어드민(internal Supabase auth) 정책은 별도 admin role 도입 시 추가

-- ─────────────────────────────────────────────
-- 2. fc_consultation_requests — 추천 상품 상담 신청
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fc_consultation_requests (
  id                     bigserial    PRIMARY KEY,
  estimate_request_id    bigint       NULL REFERENCES public.fc_estimate_requests(id) ON DELETE SET NULL,
  estimate_uuid          uuid         NULL,
  name                   text         NOT NULL,
  phone                  text         NOT NULL,
  selected_product_id    text         NOT NULL,
  selected_product_name  text         NOT NULL,
  result_json            jsonb        NOT NULL,
  consult_status         text         NOT NULL DEFAULT 'pending' CHECK (
                           consult_status IN ('pending','contacted','closed_won','closed_lost')
                         ),
  created_at             timestamptz  NOT NULL DEFAULT now(),
  deleted_at             timestamptz  NULL
);

CREATE INDEX IF NOT EXISTS idx_fc_consultation_requests_estimate_uuid
  ON public.fc_consultation_requests (estimate_uuid)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_fc_consultation_requests_phone
  ON public.fc_consultation_requests (phone)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_fc_consultation_requests_created_at
  ON public.fc_consultation_requests (created_at DESC)
  WHERE deleted_at IS NULL;

COMMENT ON TABLE  public.fc_consultation_requests IS '결과 화면 [예담 ○○으로 상담받기] 클릭 시 적재. fc_estimate_requests 와 estimate_request_id / estimate_uuid 로 매칭.';
COMMENT ON COLUMN public.fc_consultation_requests.estimate_request_id IS 'fc_estimate_requests.id FK (NULL 허용 — 모달 직진입/어드민 미리보기 케이스 대비)';
COMMENT ON COLUMN public.fc_consultation_requests.estimate_uuid       IS 'fc_estimate_requests.uuid 미러. 조인 없이 추적용';
COMMENT ON COLUMN public.fc_consultation_requests.result_json         IS '6단계 selections + computed + recommendation 시점 스냅샷';
COMMENT ON COLUMN public.fc_consultation_requests.consult_status      IS '영업 상태 — pending/contacted/closed_won/closed_lost';

-- RLS
ALTER TABLE public.fc_consultation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert" ON public.fc_consultation_requests;
CREATE POLICY "anon_insert"
  ON public.fc_consultation_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

> 두 테이블 모두 SELECT/UPDATE/DELETE 는 RLS 정책에 추가하지 않고 **`service_role` 키 (서버 API 라우트)** 에서만 접근. 어드민 화면이 도입되면 인증된 admin role 정책을 별도로 추가한다.

---

## 4. API

### 4-1. `POST /api/v1/funeral-cost/estimate` — 견적 요청 저장 + 알림톡 발송

**Request Body**
```ts
{
  name: string;             // 필수
  phone: string;            // 필수, 010-0000-0000 포맷
  ageGroup?: string;
  funeralType: '3day' | 'nobinso';
  currentSituation?: string;
  sido: string;
  gungu: string;
  facilityCd: string;
  selectedSize?: SizeKey;
  guestCount?: number;
  inputJson: object;        // 모달 상태 스냅샷 (필수)
}
```

**Response** `201`
```ts
{
  success: true;
  data: { uuid: string; resultUrl: string }
}
```

**처리 순서**
1. 필수 필드 validation
2. `fc_estimate_requests` INSERT — `uuid`, `id` 회수
3. `sendAlimtalk('FC_RESULT', { 이름, 결과URL }, { customerPhone, source })` 호출
   - `결과URL` = `https://yedamlife.com/funeral-cost/result/{uuid}` (host 헤더 기반 동적 origin)
   - 알림톡 템플릿은 `V2` 버전으로 신규 등록 필요 (현재 V1 은 URL 변수 미포함)
4. `{ uuid, resultUrl }` 반환

**클라이언트 후처리**
- 응답 200/201 시 `toast.success('알림톡으로 전송되었습니다')`
- 모달 닫기 + URL 쿼리 파라미터 정리 (현재 `handleClose` 로직 재사용)
- `step` 을 6으로 이동시키지 **않음**

---

### 4-2. `GET /api/v1/funeral-cost/estimate/[uuid]` — 결과 조회

**Response** `200`
```ts
{
  success: true;
  data: {
    uuid: string;
    name: string;
    funeralType: '3day' | 'nobinso';

    // 핵심: 상담 신청 이력이 있으면 그 시점의 result_json 을 source of truth 로 사용
    mode: 'live' | 'snapshot';

    // mode === 'live' 일 때 채워짐 — 견적 요청만 있고 상담 미신청
    inputJson?: object;

    // mode === 'snapshot' 일 때 채워짐 — 가장 최근 상담 신청의 result_json
    resultJson?: object;
    consultedAt?: string;     // 가장 최근 상담 신청 시각
    consultedProduct?: { id: string; name: string };

    createdAt: string;        // 견적 요청 생성 시각
  }
}
```

`404` — uuid 매칭 없음
```ts
{ success: false; error: 'not_found'; message: '결과가 존재하지 않습니다' }
```

**처리 순서**
1. `service_role` 키로 `fc_estimate_requests` 조회 (deleted_at IS NULL).
2. **해당 estimate 와 매칭되는 `fc_consultation_requests` 가 있는지 확인**
   - `WHERE estimate_uuid = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1`
3. 결과 분기:
   - 상담 이력 **있음** → `mode: "snapshot"` + `resultJson` (저장된 시점의 결과)
   - 상담 이력 **없음** → `mode: "live"` + `inputJson` (현재 시점에서 라이브 계산)
4. `view_count` +1, `viewed_at` 갱신 (best-effort)

---

### 4-3. `POST /api/v1/funeral-cost/consultation` — 추천 상품 상담 신청

**Request Body**
```ts
{
  estimateUuid?: string;        // /result/{uuid} 화면에서만 채워짐. 모달 직진입 시 null
  selectedProductId: string;    // yedam-1 ~ yedam-vip
  selectedProductName: string;
  resultJson: object;           // 6단계 계산 결과 전체
  // estimateUuid 가 있으면 name/phone 은 서버에서 fc_estimate_requests 에서 가져옴
  // 없으면 클라이언트에서 함께 보냄
  name?: string;
  phone?: string;
}
```

**처리 순서**
1. `estimateUuid` 가 있으면 `fc_estimate_requests` 조회 → `id`, `name`, `phone` 회수
2. **`resultJson` 검증**: `selections` / `computed` / `hallSnapshot` / `statsSnapshot` / `uiSnapshot` 키 존재 여부 확인. 누락 시 `400`. 결과 페이지 재방문 일관성을 위해 자족적 스냅샷이어야 함 (3-2 참고).
3. `fc_consultation_requests` INSERT — `result_json` 그대로 저장
4. `sendAlimtalk('FC_CONSULT', { 고객명, 연락처, 상품, 예상비용, 장례식장, 규모 }, ...)` 호출
   - 신규 등록 템플릿 `YDMFCCONSULTV1` 사용 (아래 6-2 참고)
5. `{ id }` 반환

---

### 4-4. 결과 일관성 규칙 (Source of Truth)

```
┌─────────────────────────────────────────────────────────┐
│  /funeral-cost/result/{uuid} 진입 시 우선순위           │
└─────────────────────────────────────────────────────────┘

  [1순위] fc_consultation_requests 의 가장 최근 result_json
          (estimate_uuid = {uuid} 매칭, deleted_at IS NULL)
          → 박제된 selections / computed / hallSnapshot / statsSnapshot
          → 라이브 호출 X, 모든 값 그대로 렌더 (read-only)

      ↓ 없으면

  [2순위] fc_estimate_requests 의 input_json
          → 라이브 통계 + 현재 장례식장 데이터로 재계산
          → 시간이 지나면 합계가 바뀔 수 있음

      ↓ 없으면

  [404] '결과가 존재하지 않습니다' 토스트
```

**왜 이렇게 하나**

- 상담 신청 직후 영업이 고객에게 전화했을 때, 영업이 본 화면(어드민) 과 고객이 다시 보는 화면이 **동일한 숫자**로 보여야 신뢰성 ↑.
- 라이브 통계는 매일 변동, 장례식장 가격은 운영 주기로 갱신됨. 이 변동이 **이미 신청된 견적/상담 결과** 에 영향을 주면 안 됨.
- 결과 페이지가 read-only 가 되므로 **고객이 결과를 변경하려면 새 견적 신청** 이 필요 (5단계부터 다시).

**여러 번 상담 신청한 경우**

- `fc_consultation_requests` 에 N 건이 쌓이고, 결과 URL 은 **항상 가장 최근 1건**을 보여줌.
- 이전 상담 신청 결과는 어드민에서 이력으로 조회 가능 (별도 어드민 화면에서 created_at DESC 리스트).

---

## 5. 페이지 라우팅

### 5-1. `/funeral-cost/result/[uuid]/page.tsx` (신규)

- 서버 컴포넌트에서 `GET /estimate/[uuid]` 호출 → `mode` + 데이터 획득
- 응답 `mode` 에 따라 컴포넌트 데이터 소스 분기:
  - `mode: "snapshot"` → `<FuneralCostResultView mode="snapshot" data={resultJson} />`
    상담 신청 시점의 결과를 그대로 렌더 (라이브 통계 호출 X, 모든 값이 박제됨)
  - `mode: "live"` → `<FuneralCostResultView mode="live" inputJson={inputJson} />`
    `inputJson` + 현재 라이브 통계로 재계산해서 렌더
- 모달 6단계 렌더링 코드를 추출해 재사용 (`FuneralCostModal` 의 `renderResult` 영역을 별도 컴포넌트로 분리)
- **상단 step 인디케이터, 헤더의 뒤로가기 버튼은 표시하지 않음**

> 핵심: 상담 신청 후에는 다시 결과 URL 로 돌아와도 **항상 상담 신청 시점의 결과** 가 보인다. 라이브 통계가 변동하거나 장례식장 가격이 바뀌어도 고객이 본 마지막 결과(= 상담 신청에 사용된 결과)와 일치.
- 404 (uuid 없음) — `notFound()` 또는 토스트 후 `/`로 리다이렉트

### 5-2. 모달 동작 변경

`FuneralCostModal` 의 5단계 (`contactStep`) 제출 핸들러:

**현재**
```ts
// 알림톡 발송 → setStep(resultStep)
```

**변경 후**
```ts
const res = await fetch('/api/v1/funeral-cost/estimate', { ... });
if (res.ok) {
  toast.success('알림톡으로 전송되었습니다');
  handleClose();   // 모달 닫기 + URL 정리
} else {
  toast.error('전송에 실패했습니다');
}
```

`step === resultStep` 분기는 **결과 페이지에서만** 도달 가능. 모달 안에서는 더 이상 6단계 진입 불가.

### 5-3. 결과 화면 [상담받기] 핸들러

`/funeral-cost/result/[uuid]` 화면 또는 모달 직진입한 6단계의 추천 상품 카드 [예담 ○○으로 상담받기] 클릭 핸들러:

```ts
const res = await fetch('/api/v1/funeral-cost/consultation', {
  method: 'POST',
  body: JSON.stringify({
    estimateUuid,            // /result/{uuid} 진입 시 채워짐
    selectedProductId,       // yedam-3 등
    selectedProductName,     // 예담 3호
    resultJson,              // 6단계 selections + computed + recommendation
  }),
});
if (res.ok) {
  toast.success('상담이 접수되었습니다');
  handleClose();             // 모달 닫기 + URL 정리
} else {
  toast.error('접수에 실패했습니다');
}
```

- `/result/[uuid]` 페이지에서는 모달 컨테이너가 없으므로 `handleClose` 대신 페이지 내 후처리(폼 비활성/완료 메시지)로 대체.
- 알림톡(`FC_CONSULT`)은 API 라우트 안에서 `sendAlimtalk` 호출로 자동 발송.

---

## 6. 알림톡 템플릿 변경

### 6-1. `FC_RESULT` → `YDMFCRESULTV2` (신규 등록 필요)

5단계에서 [알림톡으로 전송 받기] 클릭 시 발송. 결과 URL 버튼이 추가된다.

**현재 V1 본문**
```
[예담라이프] 장례비용 예상 결과

안녕하세요, #{이름} 님!
요청하신 장례비용 예상 결과가 준비되었습니다.
#{이름}님 만을 위한 특별 혜택과 함께 결과를 확인해보세요.
```

**V2 본문 (확정)**
```
[예담라이프] 장례비용 예상 결과

안녕하세요, #{이름} 님!
요청하신 장례비용 예상 결과가 준비되었습니다.
```

**버튼**
- 버튼명: `결과 확인하기`
- 링크 타입: `WL` (웹 링크)
- 링크: `https://yedamlife.com/funeral-cost/result/#{uuid}`

**SMS 폴백 본문**
```
[예담라이프] #{이름}님의 장례비용 결과가 준비되었습니다.
https://yedamlife.com/funeral-cost/result/#{uuid}
```

**변수 매핑**: `#{이름}=name`, `#{uuid}=uuid`

> 등록 후 `src/lib/alimtalk/templates.ts` 의 `FC_RESULT` 코드를 `YDMFCRESULTV2` 로 교체하고 `TEMPLATE_BUILDERS.FC_RESULT` 본문을 V2 와 일치시킨다. 버튼 정보는 NCP 콘솔의 템플릿에 등록되어 있어 코드에서는 본문만 동기화한다.

---

### 6-2. `FC_CONSULT` → `YDMFCCONSULTV1` (신규 등록 필요)

결과 화면에서 [예담 ○○으로 상담받기] 클릭 시 발송. 견적 컨텍스트(추천 상품·예상 비용·장례식장·규모)를 포함해 영업이 후속 통화 시 즉시 활용할 수 있도록 한다.

| 항목 | 값 |
|------|-----|
| **템플릿 코드** | `YDMFCCONSULTV1` |
| **템플릿 명**   | `장례비용_상담신청_v1` |
| **발송 시점**   | `POST /api/v1/funeral-cost/consultation` 성공 시 |
| **수신자**     | 고객 (`phone`) + 운영자(테스트 단계는 dev_override) |
| **도메인**     | `FC` (Funeral Cost) |
| **용도**       | `CONSULT` |

**본문 (제안)**
```
[예담라이프] 장례비용 상담 신청 접수

#{고객명}님, 예담라이프 상품 상담 신청이 정상 접수되었습니다.
빠른 시일 내에 담당자가 연락드리겠습니다.

■ 신청 상품: #{상품}
■ 이름: #{고객명}
■ 연락처: #{연락처}
■ 장례식장: #{장례식장}
■ 빈소 규모: #{규모}
■ 예상 장례비용: #{예상비용}
```

**버튼**: 없음 (상담 접수 확인용 알림톡이므로 별도 CTA 불필요)

**SMS 폴백 본문**
```
[예담라이프] #{고객명}님 장례비용 상담 신청이 접수되었습니다.
신청 상품: #{상품} / 예상비용: #{예상비용}
```

**변수 매핑**

| 알림톡 변수 | 소스 | 비고 |
|------------|------|------|
| `#{고객명}` | `fc_consultation_requests.name` | |
| `#{연락처}` | `fc_consultation_requests.phone` | |
| `#{상품}` | `fc_consultation_requests.selected_product_name` | 예: `예담 3호` |
| `#{장례식장}` | `result_json.hall.companyName` | |
| `#{규모}` | `result_json.selectedSize` | `소형` / `중형` 등 한글 라벨로 변환 |
| `#{예상비용}` | `result_json.computed.total` | `9,436,000원` 포맷 |

**`templates.ts` 추가 사항**
```ts
// TEMPLATES
FC_CONSULT: 'YDMFCCONSULTV1',

// TEMPLATE_NAMES
FC_CONSULT: '장례비용_상담신청_v1',

// TEMPLATE_BUILDERS
FC_CONSULT: (x) =>
  `[예담라이프] 장례비용 상담 신청 접수

${v(x.고객명)}님, 예담라이프 상품 상담 신청이 정상 접수되었습니다.
빠른 시일 내에 담당자가 연락드리겠습니다.

■ 신청 상품: ${v(x.상품)}
■ 이름: ${v(x.고객명)}
■ 연락처: ${v(x.연락처)}
■ 장례식장: ${v(x.장례식장)}
■ 빈소 규모: ${v(x.규모)}
■ 예상 장례비용: ${v(x.예상비용)}`,

// TEMPLATE_SMS_BUILDERS
FC_CONSULT: (x) =>
  `[예담라이프] ${v(x.고객명)}님 장례비용 상담 신청이 접수되었습니다.
신청 상품: ${v(x.상품)} / 예상비용: ${v(x.예상비용)}`,
```

> 알림톡 템플릿 등록 가이드는 [docs/알림톡/readme.md](./알림톡/readme.md) 참고. `FC_RESULT` (V2) 와 `FC_CONSULT` (V1) 두 건을 함께 신청해 심사 대기 시간을 합치는 것을 권장.

---

## 7. 마이그레이션 작업 순서

1. **DB**: `fc_estimate_requests`, `fc_consultation_requests` 테이블 + RLS 정책 생성
2. **알림톡**: NCP 콘솔에서 `YDMFCRESULTV2`, `YDMFCCONSULTV1` 동시 신청·심사 (며칠 소요)
3. **API**:
   - `POST /api/v1/funeral-cost/estimate`
   - `GET /api/v1/funeral-cost/estimate/[uuid]`
   - `POST /api/v1/funeral-cost/consultation`
4. **페이지**: `app/funeral-cost/result/[uuid]/page.tsx` + `FuneralCostResultView` 컴포넌트 분리
5. **모달**: 5단계 제출 핸들러 변경 (`handleClose` 로 종료, step 6 진입 차단)
6. **어드민**: 견적 요청 / 상담 신청 리스트 화면 (후속 작업)

---

## 8. 미해결 / 결정 필요 사항

- **결과 페이지에 SEO/공개 노출 여부** — uuid 가 추측 불가능해 사실상 private 이지만, robots.txt 에서 `/funeral-cost/result/` 차단 권장.
- **결과 만료 정책** — 영구 보존 vs 30일 후 토스트로 만료 안내. 현재 docs 는 **영구 보존** 가정.
- **재방문 시 데이터 변경 가능성** — 통계 API(`sangjo-stats`) 의 평균값이 시간이 지나면 달라짐. `input_json` 만 저장하면 재방문 시 최신 통계로 다시 렌더되므로 금액이 바뀔 수 있음. 그대로 둘지 / 결과 시점의 통계 스냅샷도 함께 저장할지 결정 필요.
