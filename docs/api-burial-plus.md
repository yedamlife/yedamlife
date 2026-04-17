# 장지 플러스 (Burial Plus) - API & DB 설계 문서

> 작성일: 2026-04-10
> 최종 수정: 2026-04-16

---

## 목차

1. [개요](#1-개요)
2. [DB 테이블 설계](#2-db-테이블-설계)
3. [API 엔드포인트 설계](#3-api-엔드포인트-설계)
4. [구현 순서](#4-구현-순서)
5. [전체 파일 구조](#5-전체-파일-구조)

---

## 1. 개요

장지 플러스 랜딩 페이지(`burial-plus.tsx`)의 상담 폼 및 장지 상품 데이터를 서버 API + DB로 연동한다.

| #   | 기능          | 설명                                                                                            |
| --- | ------------- | ----------------------------------------------------------------------------------------------- |
| 1   | 장지 상담신청 | 상담 모달 폼 (BurialConsultationModal) — 이름, 연락처, 종교, 희망 지역, 예산, 메세지, 동의 항목 |
| 2   | 장지 상품     | 봉안당 · 수목장 · 공원묘지 · 해양장 카테고리별 상품 목록 (관리자 CMS에서 등록, 랜딩에서 필터 조회) |

---

## 2. DB 테이블 설계

### 2-1. 장지 상담신청 내역 (`bp_consultation_requests`)

> 장지 플러스 상담 모달 폼 데이터

```sql
CREATE TABLE bp_consultation_requests (
  id               BIGSERIAL PRIMARY KEY,
  -- 신청자 정보
  name             VARCHAR(50)   NOT NULL,  -- 이름
  phone            VARCHAR(20)   NOT NULL,  -- 연락처
  religion         VARCHAR(10)   NOT NULL,  -- 해당 없음, 기독교, 천주교, 불교, 원불교, 기타
  -- 희망 지역
  region           VARCHAR(10)   NOT NULL,  -- 시/도 (서울, 경기, 인천, ...)
  district         VARCHAR(20),             -- 시/군/구 (강남구, 용인시, ...)
  -- 상담 정보
  budget           VARCHAR(20),             -- 예산 (100~300만원, 300~500만원, 500~700만원, 700~1,000만원, 1,000만원 이상)
  message          TEXT,                    -- 전달 메세지
  -- 동의
  privacy_agreed       BOOLEAN   NOT NULL DEFAULT false,  -- 개인정보 수집 동의
  third_party_agreed   BOOLEAN   NOT NULL DEFAULT false,  -- 제3자 제공 동의
  -- 메타
  status           VARCHAR(20)   NOT NULL DEFAULT 'pending',  -- pending / contacted / completed
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_bp_consultation_status ON bp_consultation_requests(status);
CREATE INDEX idx_bp_consultation_region ON bp_consultation_requests(region);
CREATE INDEX idx_bp_consultation_created_at ON bp_consultation_requests(created_at DESC);
```

### RLS (Row Level Security) 정책

```sql
-- RLS 활성화
ALTER TABLE bp_consultation_requests ENABLE ROW LEVEL SECURITY;

-- service_role만 접근 가능 (Next.js API Route에서 service_role key 사용)
-- 클라이언트에서 직접 접근 불가
```

---

### 2-2. 장지 상품 (`bp_products`)

> 봉안당 · 수목장 · 공원묘지 · 해양장 카테고리별 상품 데이터
> 한 상품이 여러 카테고리를 가질 수 있어(예: 동두천공원묘지 = 수목장+봉안당+공원묘지), `bp_burial_type` enum 배열 컬럼으로 모델링한다.

```sql
-- ── 장지 카테고리 enum ──
CREATE TYPE bp_burial_type AS ENUM ('봉안당', '수목장', '공원묘지', '해양장');

-- ── 장지 상품 테이블 ──
CREATE TABLE bp_products (
  id               BIGSERIAL PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,             -- 상품명 (예: 용인봉안당)
  -- 위치
  region           VARCHAR(10)  NOT NULL,             -- 시/도 (서울, 경기, …)
  district         VARCHAR(20)  NOT NULL,             -- 시/군/구 (용인시, 강남구, …)
  address          VARCHAR(200),                      -- 상세 주소 (선택)
  -- 카테고리 (다중)
  types            bp_burial_type[] NOT NULL,         -- 예: {'봉안당','수목장'}
  -- 가격 (원 단위 정수, 표시는 프론트에서 toLocaleString 포맷)
  price            BIGINT       NOT NULL,             -- 예: 3000000
  -- 이미지
  image_url        TEXT         NOT NULL,             -- 대표 이미지
  gallery_urls     TEXT[],                            -- 추가 이미지 (선택)
  -- 설명
  description      TEXT,                              -- 상세 설명 (선택)
  -- 운영
  is_active        BOOLEAN      NOT NULL DEFAULT true, -- 노출 여부
  display_order    INT          NOT NULL DEFAULT 0,    -- 정렬 순서 (작을수록 먼저)
  -- 메타
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_bp_products_region     ON bp_products(region);
CREATE INDEX idx_bp_products_district   ON bp_products(district);
CREATE INDEX idx_bp_products_types      ON bp_products USING GIN (types);
CREATE INDEX idx_bp_products_is_active  ON bp_products(is_active);
CREATE INDEX idx_bp_products_order      ON bp_products(display_order, id);
```

### RLS (Row Level Security) 정책

```sql
-- RLS 활성화
ALTER TABLE bp_products ENABLE ROW LEVEL SECURITY;

-- 활성 상품은 누구나 조회 가능 (랜딩 페이지)
CREATE POLICY bp_products_public_read ON bp_products
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- service_role은 모든 작업 가능 (관리자 CMS)
CREATE POLICY bp_products_service_all ON bp_products
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

### 쿼리 예시

```sql
-- 전체 활성 상품 (정렬순)
SELECT * FROM bp_products
WHERE is_active = true
ORDER BY display_order, id;

-- 봉안당 카테고리만
SELECT * FROM bp_products
WHERE is_active = true AND '봉안당' = ANY(types)
ORDER BY display_order, id;

-- 경기 + 봉안당
SELECT * FROM bp_products
WHERE is_active = true
  AND region = '경기'
  AND '봉안당' = ANY(types)
ORDER BY display_order, id;
```

---

## 3. API 엔드포인트 설계

### Base Path: `/api/v1/burial-plus`

### 3-1. 장지 상담신청 API

| Method | Endpoint                           | 설명               |
| ------ | ---------------------------------- | ------------------ |
| POST   | `/api/v1/burial-plus/consultation` | 장지 상담신청 생성 |

**Request Body:**

```json
{
  "name": "홍길동",
  "phone": "01012345678",
  "religion": "해당 없음",
  "region": "경기",
  "district": "용인시",
  "budget": "300~500만원",
  "message": "봉안당 위주로 상담 부탁드립니다.",
  "privacy_agreed": true,
  "third_party_agreed": true
}
```

**필수 필드:** `name`, `phone`, `religion`, `region`, `privacy_agreed`, `third_party_agreed`

**선택 필드:** `district`, `budget`, `message`

**Response (201):**

```json
{
  "success": true,
  "data": { "id": 1 }
}
```

### 3-2. 장지 상품 API

| Method | Endpoint                             | 설명                       | 권한         |
| ------ | ------------------------------------ | -------------------------- | ------------ |
| GET    | `/api/v1/burial-plus/products`       | 상품 목록 조회 (랜딩)      | public       |
| GET    | `/api/v1/admin/burial-plus/products` | 상품 목록 조회 (관리자)    | service_role |
| POST   | `/api/v1/admin/burial-plus/products` | 상품 등록                  | service_role |
| PATCH  | `/api/v1/admin/burial-plus/products/:id` | 상품 수정              | service_role |
| DELETE | `/api/v1/admin/burial-plus/products/:id` | 상품 삭제 (소프트)     | service_role |

#### GET `/api/v1/burial-plus/products`

**Query Params:**

| 파라미터  | 타입   | 설명                                                 |
| --------- | ------ | ---------------------------------------------------- |
| `region`  | string | 시/도 필터 (예: `경기`)                              |
| `district`| string | 시/군/구 필터 (예: `용인시`)                         |
| `type`    | string | 카테고리 필터 (`봉안당` / `수목장` / `공원묘지` / `해양장`) |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "용인봉안당",
      "region": "경기",
      "district": "용인시",
      "types": ["봉안당"],
      "price": 3000000,
      "image_url": "https://.../yongin.jpg"
    }
  ],
  "total": 12
}
```

> 활성 상품(`is_active = true`)만 반환. 정렬은 `display_order ASC, id ASC`.

#### POST `/api/v1/admin/burial-plus/products` (관리자)

**Request Body:**

```json
{
  "name": "용인봉안당",
  "region": "경기",
  "district": "용인시",
  "address": "경기도 용인시 ...",
  "types": ["봉안당"],
  "price": 3000000,
  "image_url": "https://.../yongin.jpg",
  "gallery_urls": [],
  "description": null,
  "is_active": true,
  "display_order": 0
}
```

**필수 필드:** `name`, `region`, `district`, `types`, `price`, `image_url`

### 공통 에러 응답

```json
// 400 Bad Request - 유효성 검증 실패
{
  "success": false,
  "error": "validation_error",
  "message": "필수 항목을 입력해주세요.",
  "details": [
    { "field": "name", "message": "이름을 입력해주세요." },
    { "field": "privacy_agreed", "message": "개인정보 수집에 동의해주세요." }
  ]
}

// 500 Internal Server Error
{
  "success": false,
  "error": "internal_error",
  "message": "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
}
```

---

## 4. 구현 순서

### Phase 1: DB 테이블 생성

- [x] Supabase에 `bp_consultation_requests` 테이블 생성
- [x] 상담신청 RLS 정책 적용
- [ ] `bp_burial_type` enum 및 `bp_products` 테이블 생성
- [ ] 상품 테이블 RLS 정책 적용
- [ ] 기존 하드코딩 데이터(`burialProducts` 20건) 시드 투입

### Phase 2: API 구현

- [x] `src/app/api/v1/burial-plus/consultation/route.ts` - 장지 상담신청 API
- [ ] `src/app/api/v1/burial-plus/products/route.ts` - 공개 상품 목록 GET
- [ ] `src/app/api/v1/admin/burial-plus/products/route.ts` - 관리자 상품 목록/생성
- [ ] `src/app/api/v1/admin/burial-plus/products/[id]/route.ts` - 관리자 상품 수정/삭제

### Phase 3: 관리자 UI

- [ ] `src/app/admin/burial-plus/products/page.tsx` - 상품 목록 + CRUD 폼

### Phase 4: 프론트엔드 연동

- [x] `burial-plus.tsx` 상담 모달 `handleSubmit` → `/api/v1/burial-plus/consultation` 연동
- [ ] `burial-plus.tsx` 하드코딩 `burialProducts` 제거 → `/api/v1/burial-plus/products` 호출로 교체

---

## 5. 전체 파일 구조

```
src/
├── app/
│   ├── admin/
│   │   └── burial-plus/
│   │       ├── consultations/              -- 상담신청 관리
│   │       └── products/                   -- 장지 상품 관리 (신규)
│   └── api/
│       └── v1/
│           ├── burial-plus/
│           │   ├── consultation/route.ts   -- 상담신청 POST
│           │   └── products/route.ts       -- 상품 공개 GET (신규)
│           └── admin/
│               └── burial-plus/
│                   └── products/
│                       ├── route.ts         -- 관리자 GET/POST (신규)
│                       └── [id]/route.ts    -- 관리자 PATCH/DELETE (신규)
└── components/
    └── template/
        └── YedamLife/
            └── burial-plus.tsx             -- 장지 플러스 랜딩
```

### 테이블 네이밍 규칙

기존 패턴을 따라 장지 플러스는 `bp_` prefix를 사용한다.

| 테이블                     | Prefix | 용도          |
| -------------------------- | ------ | ------------- |
| `bp_consultation_requests` | `bp_`  | 장지 상담신청 |
| `bp_products`              | `bp_`  | 장지 상품     |

### 페이지별 API/테이블 매핑 전체 현황

| 랜딩 페이지                    | API 네임스페이스             | 테이블 prefix |
| ------------------------------ | ---------------------------- | ------------- |
| 일반상조 (`general-funeral`)   | `/api/v1/general-funeral/`   | `gf_`         |
| 기업상조 (`corporate-funeral`) | `/api/v1/corporate-funeral/` | `cf_`         |
| 유품정리 (`estate-cleanup`)    | `/api/v1/estate-cleanup/`    | `ec_`         |
| 운구의전 (`funeral-escort`)    | `/api/v1/funeral-escort/`    | `fe_`         |
| 장지 플러스 (`burial-plus`)    | `/api/v1/burial-plus/`       | `bp_`         |
