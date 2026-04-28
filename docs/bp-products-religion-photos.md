# 장지 상품 — 종교 다중선택 & 다중 이미지 업로드

> 작성일: 2026-04-28
> 대상: `bp_products` 테이블 / `/admin/burial-plus/products` 등록·수정 화면

---

## 목차

1. [요구사항](#1-요구사항)
2. [DB 변경](#2-db-변경)
3. [API 변경](#3-api-변경)
4. [Storage 경로](#4-storage-경로)
5. [Frontend 변경](#5-frontend-변경)
6. [작업 순서](#6-작업-순서)

---

## 1. 요구사항

### 1-1. 종교 다중선택

- 장지 등록/수정 화면에 **종교** 항목을 추가한다.
- 선택지: `무교`, `기독교`, `불교`, `천주교`
- 다중 선택 가능 (카테고리와 동일한 칩 UI 패턴 재사용).
- 기본값: `[]` (미선택). 미선택은 "종교 무관"으로 간주.

### 1-2. 편의시설 / 교통편 별점 (5점 척도)

- 장지 수정 화면 **시설 탭**에 **편의시설 별점**, **교통편 별점**
  두 개의 별점 입력 UI를 추가한다.
- 0 ~ 5 정수 (반점 없음). `null` 허용 = "미평가".
- 기존 부대시설 체크박스(handicap, mealroom, …)와 대중교통/자가용
  텍스트 안내는 그대로 유지하고, **종합 평점**으로서 별도 추가.
- 클릭으로 점수 지정, 별 다시 클릭 시 해제(=`null`)되도록 한다.

### 1-3. 다중 이미지 수동 업로드

- 장지 수정 화면 **사진 탭**에서, 기존의 "URL 직접 입력" + "+ 추가"
  방식에 더해, **여러 장의 이미지를 한 번에 업로드**할 수 있게 한다.
- 업로드된 이미지는 Supabase Storage에 저장되고, 결과 URL이
  `photos[]` 배열의 새 항목으로 자동 추가된다.
- 메인(대표) 이미지(`thumbnail_url`)는 별개 — 기존 동작 유지.
- 등록(신규) 화면에서는 `productId`가 없으므로 업로드 비활성 — 기존
  thumbnail UI와 동일한 정책.

---

## 2. DB 변경

`bp_products` 테이블에 `religions` 컬럼 추가.

```sql
ALTER TABLE bp_products
  ADD COLUMN religions TEXT[] NOT NULL DEFAULT '{}';

-- 카테고리 필터처럼 GIN 인덱스 (필요 시)
CREATE INDEX idx_bp_products_religions
  ON bp_products USING GIN (religions);
```

| 값       | 의미   |
| -------- | ------ |
| `무교`   | 무교   |
| `기독교` | 기독교 |
| `불교`   | 불교   |
| `천주교` | 천주교 |

> 기존 데이터는 `[]` (빈 배열). 마이그레이션 별도 백필 불필요.

`facility_rating` / `traffic_rating` 은 `intro` JSONB 안에 두 필드로
추가한다 (별도 컬럼 신설 없이 JSONB 확장).

```jsonc
intro: {
  // ...기존
  facility_rating: 4,   // 0~5 정수 또는 null
  traffic_rating: 3,    // 0~5 정수 또는 null
}
```

`photos` 컬럼은 기존 JSONB 배열을 그대로 사용한다 (스키마 변경 없음).

```jsonc
photos: [
  { fileorder: 1, filetitle: "전경", fileurl_full: "https://.../foo.webp" },
  ...
]
```

---

## 3. API 변경

### 3-1. `bp_products` CRUD

| 변경                                       | 파일                                                                                                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EDITABLE_FIELDS`에 `religions` 추가       | [src/app/api/v1/admin/burial-plus/products/[id]/route.ts](src/app/api/v1/admin/burial-plus/products/%5Bid%5D/route.ts)                                        |
| `POST` insert payload에 `religions` 추가   | [src/app/api/v1/admin/burial-plus/products/route.ts](src/app/api/v1/admin/burial-plus/products/route.ts)                                                      |
| 목록 `SELECT_COLUMNS`에 `religions` 추가   | 동일 파일 (필터에 쓰지 않더라도 행 응답에 포함시키면 추후 활용 가능; 현 단계에선 필수 아님)                                                                   |
| 공개 상세/목록 (`/api/v1/burial-plus/...`) | 현 라운드에서는 admin만 다루므로 변경 없음. 추후 종교 필터 노출 시 `categories`와 동일한 `query.contains('religions', […])` 패턴으로 확장.                    |

### 3-2. 다중 이미지 업로드 (신규)

신규 라우트: `POST /api/v1/admin/burial-plus/products/[id]/photos`

- 입력: `multipart/form-data`, 필드명 `files` (다중)
- 동작:
  1. 각 파일을 Storage에 업로드 (UUID 파일명).
  2. 업로드 성공한 파일들의 public URL을 모아 응답.
- 출력:
  ```json
  {
    "success": true,
    "urls": [
      "https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/burial/bp-products/photos/{id}/{uuid}.webp",
      ...
    ]
  }
  ```
- 실패 정책: 일부 파일 실패 시 부분 성공 — 성공한 URL만 반환하고
  `errors` 배열에 실패 사유를 함께 내려준다 (UX 단순화 위해 부분
  성공을 허용).
- DB 갱신은 **하지 않는다.** 클라이언트가 응답 URL을 받아
  `photos[]`에 항목으로 추가한 뒤, 폼 저장(PATCH) 시 한꺼번에
  반영된다 — 기존 사진 탭 편집 흐름과 일관성 유지.

> 단일 업로드 라우트(`/thumbnail`)는 그대로 유지한다 (대표 이미지는
> 단일·고정 경로 저장이라 별개).

---

## 4. Storage 경로

| 용도                     | 경로                                                  |
| ------------------------ | ----------------------------------------------------- |
| 대표 이미지 (기존)       | `burial/bp-products/{id}.webp`                        |
| 수동 업로드 사진 (신규)  | `burial/bp-products/photos/{id}/{uuid}.webp`          |

- 버킷: `yedamlife` (기존과 동일).
- `contentType: 'image/webp'`, `upsert: false` (UUID이므로 충돌 X).
- 변환은 별도로 하지 않고 원본 그대로 업로드 (현 thumbnail 라우트와
  동일한 정책).

---

## 5. Frontend 변경

### 5-1. `BpProductForm` ([src/components/admin/bp-product-form.tsx](src/components/admin/bp-product-form.tsx))

#### 타입

```ts
export interface BpProductFormValue {
  // ...기존
  religions: string[]; // 추가
}

interface Intro {
  // ...기존
  facility_rating?: number | null; // 0~5 (정수) | null
  traffic_rating?: number | null;
}

const RELIGIONS = ['무교', '기독교', '불교', '천주교'] as const;
```

#### UI — 종교 칩

- 위치: **소개 탭** > "카테고리" 블록 바로 아래.
- 구현: 카테고리의 `toggleCategory` / 칩 렌더링 로직을 `toggleReligion`로
  복제. 라벨 "종교 (복수 선택 가능)".

#### UI — 별점 (시설 탭)

- 위치: **시설 탭** > "부대시설" 카드 위에 신규 카드 "종합 평점"
  추가.
- 항목 2개: **편의시설**, **교통편**.
- 별 5개 렌더링. hover/active 시 하이라이트, 같은 별 재클릭 시
  `null`로 초기화.
- 저장 모델: `intro.facility_rating`, `intro.traffic_rating`.
- 구현 노트: `lucide-react`의 `Star` 아이콘을 채움/빈 상태로 렌더링,
  `text-yellow-400` / `text-gray-300` 스타일.

```tsx
// 예시 시그니처
function StarRating({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}): JSX.Element;
```

#### UI — 사진 일괄 업로드 (PhotosTab)

- 카드 헤더의 "+ 추가" 좌측에 **이미지 업로드** 버튼 추가
  (productId 있을 때만 노출).
- `<input type="file" multiple accept="image/*">` 사용.
- 선택 시 `POST /api/v1/admin/burial-plus/products/{id}/photos`
  호출 → 응답 `urls[]` 각 URL을 `photos`에 신규 항목으로 push:
  ```ts
  onChange([
    ...photos,
    ...urls.map((u, i) => ({
      fileorder: photos.length + i + 1,
      filetitle: '',
      fileurl_full: u,
    })),
  ]);
  ```
- 업로드 중 spinner/disabled — 기존 `uploading` state 패턴과 동일.

### 5-2. 등록/수정 페이지

- [new/page.tsx](src/app/admin/burial-plus/products/new/page.tsx)의
  `INITIAL`에 `religions: []` 추가.
- 수정 페이지([id]/page.tsx) — 응답 매핑 부분에 `religions:
  data.religions ?? []` 추가.

---

## 6. 작업 순서

1. **DB 마이그레이션** — `ALTER TABLE bp_products ADD COLUMN religions ...`
   (Supabase SQL editor 또는 마이그레이션 도구).
2. **API**
   - `[id]/route.ts` `EDITABLE_FIELDS`에 `religions` 추가.
   - `route.ts` POST insert payload에 `religions` 추가.
   - `[id]/photos/route.ts` 신규 생성 (다중 업로드).
3. **Form 타입 & UI**
   - `BpProductFormValue.religions` 추가, 등록 페이지 INITIAL 보정.
   - `Intro.facility_rating` / `Intro.traffic_rating` 타입 추가.
   - 소개 탭에 종교 칩 UI 추가.
   - 시설 탭 상단에 "종합 평점" 별점 카드 추가 (`StarRating` x 2).
   - PhotosTab에 다중 업로드 버튼/핸들러 추가.
4. **검증**
   - 등록 → 종교 선택 저장 → 상세 reload 시 유지되는지 확인.
   - 시설 탭에서 별점 0/1/3/5/해제 케이스 저장·복원 확인.
   - 사진 탭 다중 업로드 → 카드 추가 → 폼 저장 → 재로드 시 유지 확인.
   - 메인 이미지(`thumbnail_url`) 동작이 회귀 없는지 확인.

---

## 7. 비고 (의도적 비-범위)

- **공개 페이지(burial-plus.tsx) 종교 필터**: 이번 라운드에서는
  적용하지 않는다. DB/Admin에 종교 데이터가 쌓이고 나서 별도
  티켓으로 진행.
- **이미지 리사이즈/포맷 변환**: 현재 thumbnail 라우트와 동일하게
  원본을 webp 컨텐츠 타입으로만 저장. 추후 sharp 등을 도입할 수 있으나
  범위 외.
- **드래그&드롭 업로드 / 진행률 표시**: 기본 `<input multiple>`로 충분.
  요구 시 추가.
