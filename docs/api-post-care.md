# 사후행정케어 (Post Care) - API & DB 설계 문서

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

사후행정케어 랜딩 페이지(`post-care.tsx`)에서 수집하는 상담 신청 데이터를 서버 API + DB로 연동한다.

| # | 기능 | 설명 |
|---|------|------|
| 1 | 상담 신청 | 사후행정케어 상담 모달 폼 (성함, 연락처, 지역, 상담유형, 상담내용, 약관동의) |

---

## 2. DB 테이블 설계

### 2-1. 상담 신청 내역 (`pc_consultation_requests`)

> 사후행정케어 상담 모달 폼 데이터

```sql
CREATE TABLE pc_consultation_requests (
  id                  BIGSERIAL PRIMARY KEY,
  -- 신청자 정보
  name                VARCHAR(50)   NOT NULL,  -- 성함
  phone               VARCHAR(20)   NOT NULL,  -- 연락처
  region              VARCHAR(10),              -- 지역 (서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 경기, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주)
  -- 상담 정보
  service_type        VARCHAR(20)   NOT NULL,  -- 상담 유형 ('심리 상담', '세무 상담', '상속 절차', '법률 지원')
  message             TEXT,                     -- 상담 내용 (선택)
  -- 동의
  privacy_agreed      BOOLEAN       NOT NULL DEFAULT false,  -- 개인정보 수집 및 이용 동의
  third_party_agreed  BOOLEAN       NOT NULL DEFAULT false,  -- 제3자 정보 제공 동의
  -- 메타
  status              VARCHAR(20)   NOT NULL DEFAULT 'pending',  -- pending / contacted / completed
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_pc_consultation_status ON pc_consultation_requests(status);
CREATE INDEX idx_pc_consultation_created_at ON pc_consultation_requests(created_at DESC);
```

### RLS (Row Level Security) 정책

```sql
-- RLS 활성화
ALTER TABLE pc_consultation_requests ENABLE ROW LEVEL SECURITY;

-- service_role만 접근 가능 (Next.js API Route에서 service_role key 사용)
-- 클라이언트에서 직접 접근 불가
```

---

## 3. API 엔드포인트 설계

### Base Path: `/api/v1/post-care`

### 3-1. 상담 신청 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/post-care/consultation` | 사후행정케어 상담 신청 생성 |

**Request Body:**

```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "region": "서울",
  "service_type": "세무 상담",
  "message": "상속세 신고 관련 상담 희망합니다.",
  "privacy_agreed": true,
  "third_party_agreed": true
}
```

**필수 필드:** `name`, `phone`, `service_type`, `privacy_agreed`, `third_party_agreed`

**선택 필드:** `region`, `message`

**`service_type` 허용 값:**
- `심리 상담`
- `세무 상담`
- `상속 절차`
- `법률 지원`

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
    { "field": "service_type", "message": "상담 유형을 선택해주세요." }
  ]
}

// 400 Bad Request - 약관 미동의
{
  "success": false,
  "error": "validation_error",
  "message": "필수 약관에 동의해주세요."
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

- [ ] Supabase에 `pc_consultation_requests` 테이블 생성
- [ ] RLS 정책 적용

### Phase 2: API 구현

- [ ] `src/app/api/v1/post-care/consultation/route.ts` - 사후행정케어 상담 신청 API

### Phase 3: 프론트엔드 연동

- [ ] `post-care.tsx` 상담 모달 `handleSubmit` → `/api/v1/post-care/consultation` 연동

---

## 5. 전체 파일 구조

```
src/
├── app/
│   └── api/
│       └── v1/
│           └── post-care/
│               └── consultation/route.ts   -- 사후행정케어 상담 신청
└── components/
    └── template/
        └── YedamLife/
            └── post-care.tsx               -- 사후행정케어 랜딩 (상담 모달 포함)
```

### 테이블 네이밍 규칙

기존 패턴을 따라 사후행정케어는 `pc_` prefix를 사용한다.

| 테이블 | Prefix | 용도 |
|--------|--------|------|
| `pc_consultation_requests` | `pc_` | 사후행정케어 상담 신청 |
