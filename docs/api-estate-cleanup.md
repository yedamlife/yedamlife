# 유품정리 (Estate Cleanup) - API & DB 설계 문서

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

유품정리 랜딩 페이지(`estate-cleanup.tsx`)에서 수집하는 견적 상담 신청 데이터를 서버 API + DB로 연동한다.

| #   | 기능           | 설명                                                                                        |
| --- | -------------- | ------------------------------------------------------------------------------------------- |
| 1   | 견적 상담 신청 | 유품정리 견적 상담 모달 폼 (성함, 연락처, 주소, 서비스종류, 평수, 층수, 주거형태, 방문날짜) |

---

## 2. DB 테이블 설계

### 2-1. 견적 상담 신청 내역 (`ec_estimate_requests`)

> 유품정리 견적 상담 모달 폼 데이터

```sql
CREATE TABLE ec_estimate_requests (
  id               BIGSERIAL PRIMARY KEY,
  -- 신청자 정보
  name             VARCHAR(50)   NOT NULL,  -- 성함
  phone            VARCHAR(20)   NOT NULL,  -- 연락처
  -- 주소
  address          TEXT,                     -- 기본주소
  address_detail   VARCHAR(200),             -- 상세주소
  -- 서비스 정보
  service_types    TEXT[]        NOT NULL,   -- 서비스 종류 (복수 선택)
                                             -- '유품정리', '유품소각', '유품정리+딥클린청소',
                                             -- '유품정리+유품소각', '유품정리+분리이사',
                                             -- '유품정리+내부인테리어', '유품정리+특수 방역,소독',
                                             -- '생전 유품정리'
  area             VARCHAR(20),              -- 평수 (10평 이하, 10~20평, 20~30평, 30~40평, 40평 이상)
  floor            VARCHAR(20),              -- 층수 (1층~5층 이상, 지하, 옥탑)
  housing_type     VARCHAR(20),              -- 주거형태 (아파트, 빌라, 오피스텔, 주택, 원룸/투룸, 상가/사무실, 기타)
  visit_date       DATE,                     -- 무료 방문 견적 희망 날짜
  -- 메타
  status           VARCHAR(20)   NOT NULL DEFAULT 'pending',  -- pending / contacted / completed
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_ec_estimate_status ON ec_estimate_requests(status);
CREATE INDEX idx_ec_estimate_created_at ON ec_estimate_requests(created_at DESC);
```

### RLS (Row Level Security) 정책

```sql
-- RLS 활성화
ALTER TABLE ec_estimate_requests ENABLE ROW LEVEL SECURITY;

-- service_role만 접근 가능 (Next.js API Route에서 service_role key 사용)
-- 클라이언트에서 직접 접근 불가
```

---

## 3. API 엔드포인트 설계

### Base Path: `/api/v1/estate-cleanup`

### 3-1. 견적 상담 신청 API

| Method | Endpoint                          | 설명                |
| ------ | --------------------------------- | ------------------- |
| POST   | `/api/v1/estate-cleanup/estimate` | 견적 상담 신청 생성 |

**Request Body:**

```json
{
  "name": "홍길동",
  "phone": "01012345678",
  "address": "서울시 강남구 테헤란로 123",
  "address_detail": "101호",
  "service_types": ["유품정리", "유품정리+딥클린청소"],
  "area": "20~30평",
  "floor": "3층",
  "housing_type": "아파트",
  "visit_date": "2026-04-15"
}
```

**필수 필드:** `name`, `phone`, `service_types`

**선택 필드:** `address`, `address_detail`, `area`, `floor`, `housing_type`, `visit_date`

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
    { "field": "name", "message": "성함을 입력해주세요." },
    { "field": "service_types", "message": "서비스 종류를 선택해주세요." }
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

- [ ] Supabase에 `ec_estimate_requests` 테이블 생성
- [ ] RLS 정책 적용

### Phase 2: API 구현

- [ ] `src/app/api/v1/estate-cleanup/estimate/route.ts` - 견적 상담 신청 API

### Phase 3: 프론트엔드 연동

- [ ] `estate-cleanup.tsx` 견적 모달 `handleEstimateSubmit` → `/api/v1/estate-cleanup/estimate` 연동

---

## 5. 전체 파일 구조

```
src/
├── app/
│   └── api/
│       └── v1/
│           └── estate-cleanup/
│               └── estimate/route.ts      -- 견적 상담 신청
└── components/
    └── template/
        └── YedamLife/
            └── estate-cleanup.tsx         -- 유품정리 랜딩 (견적 모달 포함)
```

### 테이블 네이밍 규칙

기존 패턴을 따라 유품정리는 `ec_` prefix를 사용한다.

| 테이블                 | Prefix | 용도                    |
| ---------------------- | ------ | ----------------------- |
| `ec_estimate_requests` | `ec_`  | 유품정리 견적 상담 신청 |
