# 일반상조 (General Funeral) - API & DB 설계 문서

> 작성일: 2026-04-10

---

## 목차

1. [개요](#1-개요)
2. [기술 스택](#2-기술-스택)
3. [DB 테이블 설계](#3-db-테이블-설계)
4. [API 엔드포인트 설계](#4-api-엔드포인트-설계)
5. [구현 순서](#5-구현-순서)
6. [전체 파일 구조](#6-전체-파일-구조)

---

## 1. 개요

일반상조 랜딩 페이지(`general-funeral.tsx`)에서 수집하는 폼 데이터를 서버 API + DB로 연동한다.

| #   | 기능                  | 설명                                          |
| --- | --------------------- | --------------------------------------------- |
| 1   | 상담 신청             | 다이렉트 장례 설계 설문(9단계) 기반 상담 요청 |
| 2   | 후불제상조 가입신청서 | 일반 회원 가입 신청 (membership/general)      |
| 3   | 다이렉트 장례 설계    | 장례 운구 서비스 예약 (ReservationModal)      |

> 기업 제안서 신청은 `corporate_proposal_requests` 공통 테이블을 사용합니다. → [api-corporate-funeral.md](./api-corporate-funeral.md) 참고

---

## 2. 기술 스택

| 구분       | 기술                                    |
| ---------- | --------------------------------------- |
| Framework  | Next.js 16 (App Router)                 |
| API        | Next.js Route Handlers (`src/app/api/`) |
| Database   | Supabase (PostgreSQL)                   |
| ORM/Client | `@supabase/supabase-js`                 |

---

## 3. DB 테이블 설계

### 3-1. 상담 신청 내역 (`gf_consultation_requests`)

> 9단계 설문 결과 + 연락처를 저장

```sql
CREATE TABLE gf_consultation_requests (
  id            BIGSERIAL PRIMARY KEY,
  -- 설문 응답
  funeral_location      VARCHAR(20)  NOT NULL,  -- 장례 희망 지역 (서울, 경기, ...)
  expected_guests       VARCHAR(20)  NOT NULL,  -- 예상 조문객 수 (50명 이하, 50~100명, ...)
  funeral_scale         VARCHAR(30)  NOT NULL,  -- 장례 규모 (간소한 장례, 기본 장례, ...)
  binso_required        VARCHAR(30)  NOT NULL,  -- 빈소 설치 여부 (빈소 설치, 무빈소, 상담 후 결정)
  escort_service        VARCHAR(30)  NOT NULL,  -- 운구 서비스 필요 여부
  clothing_type         VARCHAR(30)  NOT NULL,  -- 수의 종류 (예담수의 1~4호, 상담 후 결정)
  funeral_gown_required VARCHAR(30)  NOT NULL,  -- 수의 필요 여부
  additional_service    VARCHAR(30)  NOT NULL,  -- 부가 서비스 (추모 영상, 유품정리, 49재 등)
  contact_number        VARCHAR(20)  NOT NULL,  -- 연락처
  -- 메타
  status        VARCHAR(20)  NOT NULL DEFAULT 'pending',  -- pending / contacted / completed
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_gf_consultation_status ON gf_consultation_requests(status);
CREATE INDEX idx_gf_consultation_created_at ON gf_consultation_requests(created_at DESC);
```

### 3-2. 후불제상조 가입신청서 내역 (`gf_membership_applications`)

> 일반 회원 가입 신청 데이터 (membership/general)

```sql
CREATE TABLE gf_membership_applications (
  id               BIGSERIAL PRIMARY KEY,
  -- 회원 정보
  name             VARCHAR(50)   NOT NULL,  -- 회원명
  phone            VARCHAR(20)   NOT NULL,  -- 연락처
  birth_date       VARCHAR(10)   NOT NULL,  -- 생년월일 (YYYY-MM-DD)
  gender           VARCHAR(5)    NOT NULL,  -- 남 / 여
  religion         VARCHAR(10)   NOT NULL,  -- 무교, 기독교, 천주교, 불교, 원불교, 기타
  -- 보호자 정보
  guardian_name     VARCHAR(50),             -- 보호자명
  guardian_relation VARCHAR(20),             -- 보호자 관계
  guardian_phone    VARCHAR(20),             -- 보호자 연락처
  -- 주소
  address          TEXT          NOT NULL,  -- 주소 (다음 우편번호 API)
  address_detail   VARCHAR(200),            -- 상세주소
  -- 가입 상품
  product          VARCHAR(20)   NOT NULL,  -- yedam-1, yedam-2, yedam-3, yedam-4
  referrer         VARCHAR(50),             -- 추천자
  -- 동의
  privacy_agreed   BOOLEAN       NOT NULL DEFAULT false,
  -- 메타
  status           VARCHAR(20)   NOT NULL DEFAULT 'pending',  -- pending / approved / rejected
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_gf_membership_status ON gf_membership_applications(status);
CREATE INDEX idx_gf_membership_phone ON gf_membership_applications(phone);
CREATE INDEX idx_gf_membership_created_at ON gf_membership_applications(created_at DESC);
```

### 3-3. 다이렉트 장례 설계 내역 (`gf_direct_requests`)

> 9단계 설문 결과 + 연락처를 저장

```sql
CREATE TABLE gf_direct_requests (
  id                    BIGSERIAL PRIMARY KEY,
  -- 설문 응답
  funeral_location      VARCHAR(20),   -- 장례 희망 지역 (서울, 경기, ...)
  expected_guests       VARCHAR(20),   -- 예상 조문객 수 (50명 이하, 50~100명, ...)
  funeral_scale         VARCHAR(30),   -- 장례 규모 (간소한 장례, 기본 장례, ...)
  binso_required        VARCHAR(30),   -- 빈소 설치 여부 (빈소 설치, 무빈소, 상담 후 결정)
  escort_service        VARCHAR(30),   -- 운구 서비스 필요 여부
  clothing_type         VARCHAR(30),   -- 수의 종류 (예담수의 1~4호, 상담 후 결정)
  funeral_gown_required VARCHAR(30),   -- 상복 필요 여부
  additional_service    VARCHAR(30),   -- 부가 서비스 (추모 영상, 유품정리, 49재 등)
  -- 신청자 정보
  name                  VARCHAR(50)   NOT NULL,  -- 이름
  contact_number        VARCHAR(20)   NOT NULL,  -- 연락처
  -- 메타
  status                VARCHAR(20)   NOT NULL DEFAULT 'pending',  -- pending / contacted / completed
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_gf_direct_status ON gf_direct_requests(status);
CREATE INDEX idx_gf_direct_created_at ON gf_direct_requests(created_at DESC);
```

### RLS (Row Level Security) 정책

Supabase 환경에서 서버 사이드(`service_role` key)로만 접근하므로 클라이언트 직접 접근은 차단한다.

```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE gf_consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gf_membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gf_direct_requests ENABLE ROW LEVEL SECURITY;

-- service_role만 접근 가능 (Next.js API Route에서 service_role key 사용)
-- 클라이언트에서 직접 접근 불가
```

---

## 4. API 엔드포인트 설계

### Base Path: `/api/v1/general-funeral`

### 4-1. 상담 신청 API

| Method | Endpoint                               | 설명           |
| ------ | -------------------------------------- | -------------- |
| POST   | `/api/v1/general-funeral/consultation` | 상담 신청 생성 |

**Request Body:**

```json
{
  "funeral_location": "서울",
  "expected_guests": "50~100명",
  "funeral_scale": "기본 장례",
  "binso_required": "빈소 설치",
  "escort_service": "필요합니다",
  "clothing_type": "예담수의 1호",
  "funeral_gown_required": "필요합니다",
  "additional_service": "추모 영상 제작",
  "contact_number": "010-1234-5678"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": { "id": 1 }
}
```

### 4-2. 후불제상조 가입신청서 API

| Method | Endpoint                             | 설명           |
| ------ | ------------------------------------ | -------------- |
| POST   | `/api/v1/general-funeral/membership` | 가입 신청 생성 |

**Request Body:**

```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "birth_date": "1990-01-01",
  "gender": "남",
  "religion": "무교",
  "guardian_name": "홍부모",
  "guardian_relation": "부",
  "guardian_phone": "010-9876-5432",
  "address": "서울시 강남구 테헤란로 123",
  "address_detail": "1층",
  "product": "yedam-1",
  "referrer": "김추천",
  "privacy_agreed": true
}
```

**Response (201):**

```json
{
  "success": true,
  "data": { "id": 1 }
}
```

### 4-3. 다이렉트 장례 설계 API

| Method | Endpoint                                | 설명                |
| ------ | --------------------------------------- | ------------------- |
| POST   | `/api/v1/general-funeral/direct-design` | 장례 설계 예약 생성 |

**Request Body:**

```json
{
  "writer_name": "홍길동",
  "writer_phone": "010-1234-5678",
  "deceased_name": "홍부모",
  "deceased_gender": "male",
  "funeral_hall": "삼성서울병원 장례식장",
  "funeral_hall_address": "서울시 강남구 일원로 81",
  "room_name": "1호실",
  "departure_date": "2026-04-15",
  "departure_hour": "09",
  "departure_minute": "00",
  "funeral_method": "cremation",
  "destination_address": "서울추모공원",
  "destination_detail": "",
  "clothing": "suit",
  "people": 4,
  "price": 600000
}
```

**Response (201):**

```json
{
  "success": true,
  "data": { "id": 1 }
}
```

### 공통 에러 응답

```json
// 400 Bad Request - 유효성 검증 실패
{
  "success": false,
  "error": "validation_error",
  "message": "필수 항목을 입력해주세요.",
  "details": [
    { "field": "name", "message": "이름을 입력해주세요." }
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

## 5. 구현 순서

### Phase 1: 기본 설정

- [ ] Supabase 프로젝트에 테이블 생성 (위 SQL 실행)
- [ ] `@supabase/supabase-js` 패키지 설치
- [ ] `src/lib/supabase.ts` - Supabase 클라이언트 설정 (server-side, service_role key)
- [ ] `.env.local`에 환경변수 추가
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://aipfebcrgjythjywzgqp.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
  ```

### Phase 2: API 구현

- [ ] `src/app/api/v1/general-funeral/consultation/route.ts` - 상담 신청 API
- [ ] `src/app/api/v1/general-funeral/membership/route.ts` - 가입신청서 API
- [ ] `src/app/api/v1/general-funeral/direct-design/route.ts` - 다이렉트 장례 설계 API

### Phase 3: 프론트엔드 연동

- [ ] `general-funeral.tsx` 설문 폼 -> `/api/v1/general-funeral/consultation` 연동
- [ ] `membership/general/page.tsx` 가입폼 -> `/api/v1/general-funeral/membership` 연동
- [ ] `reservation-modal.tsx` 예약폼 -> `/api/v1/general-funeral/direct-design` 연동
- [ ] `proposal-modal.tsx` 제안서폼 -> `/api/v1/corporate-funeral/proposal` 연동 (공통 테이블)

---

## 6. 전체 파일 구조

> 카테고리별 네임스페이스 구조 - 각 랜딩 페이지가 독립적인 API/테이블을 가짐

```
src/
├── app/
│   └── api/
│       └── v1/
│           └── general-funeral/          -- 일반상조
│               ├── consultation/route.ts
│               ├── membership/route.ts
│               └── direct-design/route.ts
└── lib/
    └── supabase.ts
```

### 테이블 네이밍 규칙

| 카테고리 | Prefix | 예시                       |
| -------- | ------ | -------------------------- |
| 일반상조 | `gf_`  | `gf_consultation_requests` |
