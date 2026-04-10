# 장지 플러스 (Burial Plus) - API & DB 설계 문서

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

장지 플러스 랜딩 페이지(`burial-plus.tsx`)에서 수집하는 폼 데이터를 서버 API + DB로 연동한다.

| # | 기능 | 설명 |
|---|------|------|
| 1 | 장지 상담 신청 | 상담 모달 폼 (BurialConsultationModal) — 이름, 연락처, 종교, 희망 지역, 예산, 메세지, 동의 항목 |

---

## 2. DB 테이블 설계

### 2-1. 장지 상담 신청 내역 (`bp_consultation_requests`)

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

## 3. API 엔드포인트 설계

### Base Path: `/api/v1/burial-plus`

### 3-1. 장지 상담 신청 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/burial-plus/consultation` | 장지 상담 신청 생성 |

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

- [ ] Supabase에 `bp_consultation_requests` 테이블 생성
- [ ] RLS 정책 적용

### Phase 2: API 구현

- [ ] `src/app/api/v1/burial-plus/consultation/route.ts` - 장지 상담 신청 API

### Phase 3: 프론트엔드 연동

- [ ] `burial-plus.tsx` 상담 모달 `handleSubmit` → `/api/v1/burial-plus/consultation` 연동
  - 기존 `alert()` 방식에서 `fetch()` API 호출로 변경

---

## 5. 전체 파일 구조

```
src/
├── app/
│   └── api/
│       └── v1/
│           └── burial-plus/
│               └── consultation/route.ts     -- 장지 상담 신청
└── components/
    └── template/
        └── YedamLife/
            └── burial-plus.tsx               -- 장지 플러스 랜딩 (상담 모달 포함)
```

### 테이블 네이밍 규칙

기존 패턴을 따라 장지 플러스는 `bp_` prefix를 사용한다.

| 테이블 | Prefix | 용도 |
|--------|--------|------|
| `bp_consultation_requests` | `bp_` | 장지 상담 신청 |

### 페이지별 API/테이블 매핑 전체 현황

| 랜딩 페이지 | API 네임스페이스 | 테이블 prefix |
|------------|-----------------|--------------|
| 일반상조 (`general-funeral`) | `/api/v1/general-funeral/` | `gf_` |
| 기업상조 (`corporate-funeral`) | `/api/v1/corporate-funeral/` | `cf_` |
| 유품정리 (`estate-cleanup`) | `/api/v1/estate-cleanup/` | `ec_` |
| 운구의전 (`funeral-escort`) | `/api/v1/funeral-escort/` | `fe_` |
| 장지 플러스 (`burial-plus`) | `/api/v1/burial-plus/` | `bp_` |
