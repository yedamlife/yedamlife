# 기업상조 (Corporate Funeral) - API & DB 설계 문서

> 작성일: 2026-04-10

---

## 목차

1. [개요](#1-개요)
2. [DB 테이블 설계](#2-db-테이블-설계)
3. [API 엔드포인트 설계](#3-api-엔드포인트-설계)
4. [구현 순서](#4-구현-순서)
5. [전체 파일 구조](#5-전체-파일-구조)

---

## 1. 개요

기업상조 랜딩 페이지(`corporate-funeral.tsx`)에서 수집하는 폼 데이터를 서버 API + DB로 연동한다.

| #   | 기능                       | 설명                                                          |
| --- | -------------------------- | ------------------------------------------------------------- |
| 1   | 기업상조 상담신청          | 랜딩 페이지 하단 상담 폼 (상품, 이름, 연락처, 지역, 상담시간) |
| 2   | 후불제 기업상조 가입신청서 | 기업 회원 가입 신청 (membership/corporate)                    |
| 3   | 기업상조 제안서 신청       | 기업 제안서 다운로드 + 담당자 정보 수집 (ProposalModal)       |

---

## 2. DB 테이블 설계

### 2-1. 기업상조 상담신청 내역 (`cf_consultation_requests`)

> 기업상조 랜딩 페이지 하단 상담 폼 데이터

```sql
CREATE TABLE cf_consultation_requests (
  id                BIGSERIAL PRIMARY KEY,
  -- 상담 정보
  product           VARCHAR(20)   NOT NULL,  -- 상품 (corp-1, corp-2)
  name              VARCHAR(50)   NOT NULL,  -- 이름
  phone             VARCHAR(20)   NOT NULL,  -- 연락처
  region            VARCHAR(10)   NOT NULL,  -- 시/도 (서울, 경기, ...)
  preferred_time    VARCHAR(20)   NOT NULL,  -- 상담 희망 시간대 (00:00~06:00, ...)
  -- 동의
  privacy_agreed    BOOLEAN       NOT NULL DEFAULT false,
  -- 메타
  status            VARCHAR(20)   NOT NULL DEFAULT 'pending',  -- pending / contacted / completed
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_cf_consultation_status ON cf_consultation_requests(status);
CREATE INDEX idx_cf_consultation_created_at ON cf_consultation_requests(created_at DESC);
```

### 2-2. 후불제 기업상조 가입신청서 내역 (`cf_membership_applications`)

> 기업 회원 가입 신청 데이터 (membership/corporate)

```sql
CREATE TABLE cf_membership_applications (
  id               BIGSERIAL PRIMARY KEY,
  -- 회원 정보
  name             VARCHAR(50)   NOT NULL,  -- 신청인
  phone            VARCHAR(20)   NOT NULL,  -- 연락처
  birth_date       VARCHAR(10)   NOT NULL,  -- 생년월일 (YYYY-MM-DD)
  gender           VARCHAR(5)    NOT NULL,  -- 남 / 여
  religion         VARCHAR(10)   NOT NULL,  -- 무교, 기독교, 천주교, 불교, 원불교, 기타
  -- 주소
  address          TEXT          NOT NULL,  -- 주소 (다음 우편번호 API)
  address_detail   VARCHAR(200),            -- 상세주소
  -- 기업 정보
  company_name     VARCHAR(100)  NOT NULL,  -- 회사명
  position         VARCHAR(50),             -- 직급
  -- 가입 상품
  product          VARCHAR(20)   NOT NULL,  -- corp-1, corp-2
  referrer         VARCHAR(50),             -- 추천자
  -- 동의
  privacy_agreed   BOOLEAN       NOT NULL DEFAULT false,
  -- 메타
  status           VARCHAR(20)   NOT NULL DEFAULT 'pending',  -- pending / approved / rejected
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_cf_membership_status ON cf_membership_applications(status);
CREATE INDEX idx_cf_membership_phone ON cf_membership_applications(phone);
CREATE INDEX idx_cf_membership_created_at ON cf_membership_applications(created_at DESC);
```

### 2-3. 기업상조 제안서 신청 내역 (`corporate_proposal_requests`)

> 기업 제안서 다운로드 시 담당자 정보 수집 (ProposalModal) — 일반상조·기업상조 공통 테이블

```sql
CREATE TABLE corporate_proposal_requests (
  id            BIGSERIAL PRIMARY KEY,
  -- 신청자 정보
  name          VARCHAR(50)   NOT NULL,  -- 이름
  phone         VARCHAR(20)   NOT NULL,  -- 연락처
  email         VARCHAR(100)  NOT NULL,  -- 이메일
  company_name  VARCHAR(100)  NOT NULL,  -- 회사명
  position      VARCHAR(50),             -- 직급
  -- 메타
  status        VARCHAR(20)   NOT NULL DEFAULT 'pending',  -- pending / contacted / completed
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_corp_proposal_status ON corporate_proposal_requests(status);
CREATE INDEX idx_corp_proposal_created_at ON corporate_proposal_requests(created_at DESC);
```

### RLS (Row Level Security) 정책

```sql
-- RLS 활성화
ALTER TABLE cf_consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_proposal_requests ENABLE ROW LEVEL SECURITY;

-- service_role만 접근 가능 (Next.js API Route에서 service_role key 사용)
-- 클라이언트에서 직접 접근 불가
```

---

## 3. API 엔드포인트 설계

### Base Path: `/api/v1/corporate-funeral`

### 3-1. 기업상조 상담신청 API

| Method | Endpoint                                 | 설명                   |
| ------ | ---------------------------------------- | ---------------------- |
| POST   | `/api/v1/corporate-funeral/consultation` | 기업상조 상담신청 생성 |

**Request Body:**

```json
{
  "product": "corp-1",
  "name": "김담당",
  "phone": "010-1234-5678",
  "region": "서울",
  "preferred_time": "10:00~12:00",
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

### 3-2. 후불제 기업상조 가입신청서 API

| Method | Endpoint                               | 설명                    |
| ------ | -------------------------------------- | ----------------------- |
| POST   | `/api/v1/corporate-funeral/membership` | 기업상조 가입 신청 생성 |

**Request Body:**

```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "birth_date": "1990-01-01",
  "gender": "남",
  "religion": "무교",
  "address": "서울시 강남구 테헤란로 123",
  "address_detail": "1층",
  "company_name": "주식회사 예시",
  "position": "인사팀장",
  "product": "corp-1",
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

### 3-3. 기업상조 제안서 신청 API

| Method | Endpoint                             | 설명                  |
| ------ | ------------------------------------ | --------------------- |
| POST   | `/api/v1/corporate-funeral/proposal` | 기업 제안서 신청 생성 |

**Request Body:**

```json
{
  "name": "김담당",
  "phone": "010-1234-5678",
  "email": "kim@company.com",
  "company_name": "주식회사 예시",
  "position": "인사팀장"
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
    { "field": "name", "message": "name을(를) 입력해주세요." }
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

- [ ] Supabase에 `cf_consultation_requests` 테이블 생성
- [ ] Supabase에 `cf_membership_applications` 테이블 생성
- [ ] RLS 정책 적용

### Phase 2: API 구현

- [ ] `src/app/api/v1/corporate-funeral/consultation/route.ts` - 기업상조 상담신청 API
- [ ] `src/app/api/v1/corporate-funeral/membership/route.ts` - 기업상조 가입신청서 API
- [ ] `src/app/api/v1/corporate-funeral/proposal/route.ts` - 기업상조 제안서 신청 API

### Phase 3: 프론트엔드 연동

- [ ] `corporate-funeral.tsx` 상담 폼 → `/api/v1/corporate-funeral/consultation` 연동
- [ ] `membership/corporate/page.tsx` 가입폼 → `/api/v1/corporate-funeral/membership` 연동
- [ ] `proposal-modal.tsx` 제안서 폼 → `/api/v1/corporate-funeral/proposal` 연동

---

## 5. 전체 파일 구조

```
src/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── corporate-funeral/
│   │           ├── consultation/route.ts   -- 기업상조 상담신청
│   │           ├── membership/route.ts     -- 기업상조 가입신청서
│   │           └── proposal/route.ts       -- 기업상조 제안서 신청
│   └── membership/
│       └── corporate/
│           └── page.tsx                    -- 기업상조 가입신청서 폼
└── components/
    └── template/
        └── YedamLife/
            └── corporate-funeral.tsx       -- 기업상조 랜딩 (상담 폼 포함)
```

### 테이블 네이밍 규칙

기존 일반상조(`gf_`) 패턴을 따라 기업상조는 `cf_` prefix를 사용한다.

| 테이블                        | Prefix | 용도                    |
| ----------------------------- | ------ | ----------------------- |
| `cf_consultation_requests`    | `cf_`  | 기업상조 상담신청       |
| `cf_membership_applications`  | `cf_`  | 기업상조 가입신청서     |
| `corporate_proposal_requests` | —      | 기업 제안서 신청 (공통) |
