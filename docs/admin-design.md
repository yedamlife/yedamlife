# 어드민 화면 설계 & API 연동 문서

> 작성일: 2026-04-10

---

## 목차

1. [개요](#1-개요)
2. [접속 Flow](#2-접속-flow)
3. [기술 스택](#3-기술-스택)
4. [DB 테이블 설계](#4-db-테이블-설계)
5. [API 엔드포인트 설계](#5-api-엔드포인트-설계)
6. [화면 설계](#6-화면-설계)
7. [파일 구조](#7-파일-구조)
8. [구현 순서](#8-구현-순서)

---

## 1. 개요

예담라이프 관리자 시스템. 각 서비스별 문의/신청 데이터를 통합 관리하는 어드민 대시보드.

### 관리 대상 서비스 (사이드 메뉴)

| # | 서비스 | DB Prefix | 테이블 수 |
|---|--------|-----------|----------|
| 1 | 일반상조 (General Funeral) | `gf_` | 3 |
| 2 | 기업상조 (Corporate Funeral) | `cf_` | 3 |
| 3 | 유품정리 (Estate Cleanup) | `ec_` | 1 |
| 4 | 장지+ (Burial Plus) | `bp_` | 1 |
| 5 | 사후행정케어 (Post Care) | `pc_` | 1 |
| 6 | 운구의전 (Funeral Escort) | `gf_` | (gf_funeral_escort_reservations 공유) |

---

## 2. 접속 Flow

```
[/admin 접속]
    │
    ▼
[로그인 상태 확인] ──(미인증)──▶ [/admin/login] ──(구글 OAuth)──▶ [Supabase Auth]
    │                                                                    │
    (인증됨)                                                         (인증 성공)
    │                                                                    │
    ▼                                                                    ▼
[관리자 권한 확인] ──(비관리자)──▶ [403 접근 거부 페이지]
    │
    (관리자)
    │
    ▼
[/admin/dashboard] ── 관리자 대시보드
```

### 인증 상세

| 단계 | 설명 |
|------|------|
| 1. 진입 | `/admin` 접속 시 미들웨어에서 세션 확인 |
| 2. 로그인 | Supabase Auth + Google OAuth Provider |
| 3. 권한 검증 | `admin_users` 테이블에서 이메일 기반 관리자 여부 확인 |
| 4. 리다이렉트 | 인증 완료 시 `/admin/dashboard`로 이동 |

---

## 3. 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Auth | Supabase Auth (Google OAuth) |
| API | Next.js Route Handlers |
| Database | Supabase (PostgreSQL) |
| UI | Tailwind CSS + shadcn/ui (기존 컴포넌트 재활용) |
| State | React Server Components + Client Components |

---

## 4. DB 테이블 설계

### 4-1. 관리자 사용자 테이블 (`admin_users`)

```sql
CREATE TABLE admin_users (
  id          BIGSERIAL PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,  -- 구글 로그인 이메일
  name        VARCHAR(100) NOT NULL,         -- 관리자 이름
  role        VARCHAR(20)  NOT NULL DEFAULT 'admin',  -- admin / super_admin
  avatar_url  TEXT,                          -- 프로필 이미지 URL
  is_active   BOOLEAN      NOT NULL DEFAULT true,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 초기 관리자 등록
INSERT INTO admin_users (email, name, role) VALUES
  ('dahunee37@gmail.com', 'DAHUN LEE', 'super_admin');

-- 인덱스
CREATE INDEX idx_admin_users_email ON admin_users(email);
```

### RLS 정책

```sql
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- service_role key로만 접근 (API Route에서 사용)
```

---

## 5. API 엔드포인트 설계

### Base Path: `/api/v1/admin`

### 5-1. 인증 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/admin/auth/login` | 구글 OAuth 로그인 처리 |
| POST | `/api/v1/admin/auth/logout` | 로그아웃 |
| GET | `/api/v1/admin/auth/me` | 현재 로그인 사용자 정보 |
| GET | `/api/v1/admin/auth/callback` | Google OAuth 콜백 |

### 5-2. 서비스별 CRUD API

모든 서비스에 공통 적용되는 CRUD 패턴:

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/admin/{service}` | 리스트 조회 (페이지네이션, 검색, 필터) |
| GET | `/api/v1/admin/{service}/{id}` | 상세 조회 |
| POST | `/api/v1/admin/{service}` | 생성 |
| PATCH | `/api/v1/admin/{service}/{id}` | 수정 |
| DELETE | `/api/v1/admin/{service}/{id}` | 삭제 |

### 서비스별 엔드포인트 목록

#### 일반상조 (general-funeral)

| Endpoint | 대상 테이블 | 설명 |
|----------|------------|------|
| `/api/v1/admin/general-funeral/consultations` | `gf_consultation_requests` | 상담 신청 관리 |
| `/api/v1/admin/general-funeral/memberships` | `gf_membership_applications` | 가입 신청 관리 |
| `/api/v1/admin/general-funeral/reservations` | `gf_funeral_escort_reservations` | 장례 설계 예약 관리 |

#### 기업상조 (corporate-funeral)

| Endpoint | 대상 테이블 | 설명 |
|----------|------------|------|
| `/api/v1/admin/corporate-funeral/consultations` | `cf_consultation_requests` | 상담 신청 관리 |
| `/api/v1/admin/corporate-funeral/memberships` | `cf_membership_applications` | 가입 신청 관리 |
| `/api/v1/admin/corporate-funeral/proposals` | `corporate_proposal_requests` | 제안서 신청 관리 |

#### 유품정리 (estate-cleanup)

| Endpoint | 대상 테이블 | 설명 |
|----------|------------|------|
| `/api/v1/admin/estate-cleanup/estimates` | `ec_estimate_requests` | 견적 신청 관리 |

#### 장지+ (burial-plus)

| Endpoint | 대상 테이블 | 설명 |
|----------|------------|------|
| `/api/v1/admin/burial-plus/consultations` | `bp_consultation_requests` | 상담 신청 관리 |

#### 사후행정케어 (post-care)

| Endpoint | 대상 테이블 | 설명 |
|----------|------------|------|
| `/api/v1/admin/post-care/consultations` | `pc_consultation_requests` | 상담 신청 관리 |

### 5-3. 공통 Query Parameters (리스트 조회)

```
GET /api/v1/admin/{service}/{resource}?page=1&limit=20&search=홍길동&status=pending&sort=created_at&order=desc
```

| Parameter | Type | Default | 설명 |
|-----------|------|---------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 20 | 페이지당 항목 수 |
| `search` | string | - | 이름, 이메일, 연락처 등 검색 |
| `status` | string | - | 상태 필터 (pending, contacted, completed 등) |
| `sort` | string | created_at | 정렬 기준 컬럼 |
| `order` | string | desc | 정렬 방향 (asc / desc) |

### 5-4. 공통 Response 형식

#### 리스트 조회

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 66,
    "total_pages": 4
  }
}
```

#### 상세 조회

```json
{
  "success": true,
  "data": { ... }
}
```

#### 생성 / 수정

```json
{
  "success": true,
  "data": { "id": 1 }
}
```

#### 삭제

```json
{
  "success": true,
  "message": "삭제되었습니다."
}
```

#### 에러 응답

```json
// 401 Unauthorized
{
  "success": false,
  "error": "unauthorized",
  "message": "로그인이 필요합니다."
}

// 403 Forbidden
{
  "success": false,
  "error": "forbidden",
  "message": "관리자 권한이 필요합니다."
}

// 404 Not Found
{
  "success": false,
  "error": "not_found",
  "message": "데이터를 찾을 수 없습니다."
}
```

---

## 6. 화면 설계

### 6-1. 레이아웃 구조

캡처 화면 기준 레이아웃:

```
┌──────────────────────────────────────────────────────┐
│ [사이드바 240px]  │  [메인 컨텐츠 영역]               │
│                   │                                   │
│ Make Admin        │  문의 관리              [검색바]   │
│ Management System │                                   │
│                   │  ┌─────────────────────────────┐  │
│ ADMINISTRATION    │  │ 통계 카드 (전체/접수/진행/완료) │  │
│                   │  └─────────────────────────────┘  │
│ □ 문의 관리       │                                   │
│ □ 회원 관리       │  ┌─────────────────────────────┐  │
│ □ 제작 관리       │  │ 데이터 테이블               │  │
│ □ 템플릿 관리     │  │ (유형/문의자/제작유형/업종   │  │
│ □ 예약 관리       │  │  /상태/접수일/관리)          │  │
│ □ 대시보드        │  └─────────────────────────────┘  │
│                   │                                   │
│                   │  [우측 상단: 유저 프로필]          │
└──────────────────────────────────────────────────────┘
```

### 6-2. 사이드 메뉴 구성

예담라이프 어드민에 맞게 아래와 같이 매핑:

| 메뉴명 | 하위 메뉴 | 경로 |
|--------|----------|------|
| 대시보드 | - | `/admin/dashboard` |
| 일반상조 | 상담 신청 | `/admin/general-funeral/consultations` |
| | 가입 신청 | `/admin/general-funeral/memberships` |
| | 장례 설계 예약 | `/admin/general-funeral/reservations` |
| 기업상조 | 상담 신청 | `/admin/corporate-funeral/consultations` |
| | 가입 신청 | `/admin/corporate-funeral/memberships` |
| | 제안서 신청 | `/admin/corporate-funeral/proposals` |
| 유품정리 | 견적 신청 | `/admin/estate-cleanup/estimates` |
| 장지+ | 상담 신청 | `/admin/burial-plus/consultations` |
| 사후행정케어 | 상담 신청 | `/admin/post-care/consultations` |

### 6-3. 통계 카드 섹션

캡처 기준 상단 통계 카드 4개:

| 카드 | 설명 | 색상 |
|------|------|------|
| 전체 | 총 데이터 수 | 검정 배경 + 흰 글씨 |
| 접수 | `status = 'pending'` | 노란 글씨 |
| 진행중 | `status = 'contacted' or 'confirmed'` | 노란 글씨 |
| 완료 | `status = 'completed' or 'approved'` | 노란 글씨 |

### 6-4. 데이터 테이블 컬럼

서비스별로 컬럼 구성이 다르나, 공통 패턴:

| 컬럼 | 설명 |
|------|------|
| 유형 | 서비스/요청 유형 배지 |
| 문의자 | 이름 + 이메일/연락처 |
| 상세 정보 | 서비스별 주요 정보 |
| 상태 | 접수/진행중/완료 (상태 변경 가능) |
| 접수일 | `created_at` 포맷팅 |
| 관리 | 더보기 메뉴 (상세보기, 수정, 삭제) |

### 6-5. 상세/수정 화면

- 리스트에서 항목 클릭 또는 `...` 메뉴 → 상세보기
- 모달 또는 별도 페이지로 상세 정보 표시
- 상태 변경 드롭다운 (접수 → 진행중 → 완료)
- 메모/노트 필드 (관리자가 추가 메모 가능)

---

## 7. 파일 구조

```
src/
├── app/
│   ├── admin/                              -- 어드민 영역
│   │   ├── layout.tsx                      -- 어드민 공통 레이아웃 (사이드바 + 헤더)
│   │   ├── page.tsx                        -- /admin → dashboard 리다이렉트
│   │   ├── login/
│   │   │   └── page.tsx                    -- 로그인 페이지
│   │   ├── dashboard/
│   │   │   └── page.tsx                    -- 대시보드 (통합 통계)
│   │   ├── general-funeral/
│   │   │   ├── consultations/
│   │   │   │   ├── page.tsx                -- 상담 신청 리스트
│   │   │   │   └── [id]/page.tsx           -- 상담 신청 상세
│   │   │   ├── memberships/
│   │   │   │   ├── page.tsx                -- 가입 신청 리스트
│   │   │   │   └── [id]/page.tsx           -- 가입 신청 상세
│   │   │   └── reservations/
│   │   │       ├── page.tsx                -- 장례 설계 예약 리스트
│   │   │       └── [id]/page.tsx           -- 장례 설계 예약 상세
│   │   ├── corporate-funeral/
│   │   │   ├── consultations/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── memberships/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── proposals/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── estate-cleanup/
│   │   │   └── estimates/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── burial-plus/
│   │   │   └── consultations/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   └── post-care/
│   │       └── consultations/
│   │           ├── page.tsx
│   │           └── [id]/page.tsx
│   │
│   └── api/
│       └── v1/
│           └── admin/                      -- 어드민 API
│               ├── auth/
│               │   ├── login/route.ts
│               │   ├── logout/route.ts
│               │   ├── me/route.ts
│               │   └── callback/route.ts
│               ├── general-funeral/
│               │   ├── consultations/
│               │   │   ├── route.ts        -- GET (리스트), POST (생성)
│               │   │   └── [id]/route.ts   -- GET (상세), PATCH (수정), DELETE (삭제)
│               │   ├── memberships/
│               │   │   ├── route.ts
│               │   │   └── [id]/route.ts
│               │   └── reservations/
│               │       ├── route.ts
│               │       └── [id]/route.ts
│               ├── corporate-funeral/
│               │   ├── consultations/
│               │   │   ├── route.ts
│               │   │   └── [id]/route.ts
│               │   ├── memberships/
│               │   │   ├── route.ts
│               │   │   └── [id]/route.ts
│               │   └── proposals/
│               │       ├── route.ts
│               │       └── [id]/route.ts
│               ├── estate-cleanup/
│               │   └── estimates/
│               │       ├── route.ts
│               │       └── [id]/route.ts
│               ├── burial-plus/
│               │   └── consultations/
│               │       ├── route.ts
│               │       └── [id]/route.ts
│               └── post-care/
│                   └── consultations/
│                       ├── route.ts
│                       └── [id]/route.ts
│
├── components/
│   └── admin/                              -- 어드민 전용 컴포넌트
│       ├── sidebar.tsx                     -- 사이드바 네비게이션
│       ├── header.tsx                      -- 상단 헤더 (검색 + 유저 프로필)
│       ├── stats-cards.tsx                 -- 통계 카드 (전체/접수/진행/완료)
│       ├── data-table.tsx                  -- 공통 데이터 테이블
│       ├── status-badge.tsx                -- 상태 배지 컴포넌트
│       └── detail-modal.tsx                -- 상세 보기 모달
│
└── lib/
    ├── supabase.ts                         -- Supabase 클라이언트 (기존)
    └── admin/
        ├── auth.ts                         -- 어드민 인증 유틸
        └── api-helpers.ts                  -- CRUD 공통 헬퍼 함수
```

---

## 8. 구현 순서

### Phase 1: 인증 & 기본 레이아웃

- [ ] `admin_users` 테이블 생성 (SQL)
- [ ] Supabase Auth에 Google OAuth Provider 설정
- [ ] `/admin/login` 페이지 구현
- [ ] `/api/v1/admin/auth/*` 인증 API 구현
- [ ] 어드민 미들웨어 (인증 체크 + 관리자 권한 확인)
- [ ] 어드민 레이아웃 (`layout.tsx` - 사이드바 + 헤더)

### Phase 2: 공통 컴포넌트

- [ ] `sidebar.tsx` - 사이드 메뉴 (서비스별 메뉴 트리)
- [ ] `header.tsx` - 상단 헤더 (검색바 + 유저 프로필)
- [ ] `stats-cards.tsx` - 통계 카드 4종
- [ ] `data-table.tsx` - 공통 데이터 테이블 (정렬, 페이지네이션, 검색)
- [ ] `status-badge.tsx` - 상태 배지
- [ ] `api-helpers.ts` - CRUD 공통 헬퍼 함수

### Phase 3: 서비스별 CRUD API

- [ ] 일반상조 API (consultations, memberships, reservations)
- [ ] 기업상조 API (consultations, memberships, proposals)
- [ ] 유품정리 API (estimates)
- [ ] 장지+ API (consultations)
- [ ] 사후행정케어 API (consultations)

### Phase 4: 서비스별 화면

- [ ] 대시보드 페이지 (통합 통계)
- [ ] 일반상조 리스트/상세 페이지
- [ ] 기업상조 리스트/상세 페이지
- [ ] 유품정리 리스트/상세 페이지
- [ ] 장지+ 리스트/상세 페이지
- [ ] 사후행정케어 리스트/상세 페이지

### Phase 5: 고도화

- [ ] 상태 변경 기능 (드롭다운 + API 연동)
- [ ] 관리자 메모/노트 기능
- [ ] 엑셀 다운로드 기능
- [ ] 대시보드 차트 (일별/주별 접수 추이)
