# 후기 관리 (Reviews) - 설계 문서

> 작성일: 2026-04-17

---

## 목차

1. [개요](#1-개요)
2. [DB 테이블 설계](#2-db-테이블-설계)
3. [API 엔드포인트 설계](#3-api-엔드포인트-설계)
4. [에디터 선택](#4-에디터-선택)
5. [이미지 업로드](#5-이미지-업로드)
6. [어드민 UI 설계](#6-어드민-ui-설계)
7. [구현 순서](#7-구현-순서)
8. [파일 구조](#8-파일-구조)

---

## 1. 개요

어드민에서 서비스별 후기를 등록·수정·삭제·검색할 수 있는 관리 기능.

| 기능     | 설명                                                                 |
| -------- | -------------------------------------------------------------------- |
| 리스트   | 카테고리 SelectBox 필터 + 내용 검색 + 페이지네이션                   |
| 등록     | 작성자, 작성일자, 카테고리 선택, 에디터(HTML) 내용 입력               |
| 상세=수정 | 상세 진입 시 수정 폼으로 동작. 데이터 변경 시 "수정완료" 버튼 활성화 |
| 삭제     | 리스트에서 삭제 또는 상세에서 삭제                                    |

### 카테고리

| 값             | 라벨         |
| -------------- | ------------ |
| `general`      | 일반상조     |
| `corporate`    | 기업상조     |
| `estate`       | 유품정리     |
| `burial`       | 장지+        |
| `postcare`     | 사후행정케어 |
| `escort`       | 운구의전     |

---

## 2. DB 테이블 설계

### `reviews` 테이블

```sql
CREATE TABLE reviews (
  id               BIGSERIAL PRIMARY KEY,
  uuid             UUID          NOT NULL DEFAULT gen_random_uuid() UNIQUE,

  -- 카테고리
  category         VARCHAR(20)   NOT NULL,  -- general, corporate, estate, burial, postcare, escort

  -- 작성 정보
  author           VARCHAR(50)   NOT NULL,  -- 작성자명
  written_at       DATE          NOT NULL,  -- 작성일자 (관리자 직접 입력)

  -- 본문
  title            VARCHAR(200),            -- 제목 (선택)
  content          TEXT          NOT NULL,  -- HTML (에디터 출력)

  -- 운영
  is_active        BOOLEAN       NOT NULL DEFAULT true,
  display_order    INT           NOT NULL DEFAULT 0,

  -- 메타
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_reviews_category   ON reviews(category);
CREATE INDEX idx_reviews_active     ON reviews(is_active);
CREATE INDEX idx_reviews_written_at ON reviews(written_at DESC);
CREATE INDEX idx_reviews_order      ON reviews(display_order, id);

-- updated_at 자동 갱신
CREATE TRIGGER trg_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION bp_products_touch_updated_at();
-- (기존 bp_products용 함수 재사용 가능, 또는 별도 generic 함수 생성)
```

### RLS

```sql
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 활성 후기는 누구나 조회 가능 (랜딩 페이지)
CREATE POLICY reviews_public_read ON reviews
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- service_role은 모든 작업 가능 (관리자)
CREATE POLICY reviews_service_all ON reviews
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

---

## 3. API 엔드포인트 설계

### Base Path: `/api/v1/admin/reviews`

| Method | Endpoint                         | 설명               | 비고                    |
| ------ | -------------------------------- | ------------------ | ----------------------- |
| GET    | `/api/v1/admin/reviews`          | 후기 목록 (관리자) | 카테고리·검색·페이지네이션 |
| POST   | `/api/v1/admin/reviews`          | 후기 등록          |                         |
| GET    | `/api/v1/admin/reviews/:id`      | 후기 상세          |                         |
| PATCH  | `/api/v1/admin/reviews/:id`      | 후기 수정          |                         |
| DELETE | `/api/v1/admin/reviews/:id`      | 후기 삭제          |                         |
| POST   | `/api/v1/admin/reviews/upload`   | 에디터 이미지 업로드 | → Supabase Storage     |

### GET `/api/v1/admin/reviews`

**Query Params:**

| 파라미터   | 타입   | 설명                                              |
| ---------- | ------ | ------------------------------------------------- |
| `page`     | number | 페이지 (기본 1)                                   |
| `limit`    | number | 페이지당 건수 (기본 20)                           |
| `category` | string | 카테고리 필터 (`general`, `corporate`, ...)        |
| `search`   | string | 제목·내용·작성자 검색 (ilike)                     |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "uuid": "...",
      "category": "general",
      "author": "김예담",
      "written_at": "2026-04-10",
      "title": "감사했습니다",
      "content": "<p>...</p>",
      "is_active": true,
      "display_order": 0,
      "created_at": "..."
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 45, "total_pages": 3 }
}
```

### POST `/api/v1/admin/reviews`

**Request Body:**

```json
{
  "category": "general",
  "author": "김예담",
  "written_at": "2026-04-10",
  "title": "감사했습니다",
  "content": "<p>정말 감사드립니다...</p>",
  "is_active": true
}
```

**필수:** `category`, `author`, `written_at`, `content`

### POST `/api/v1/admin/reviews/upload` (에디터 이미지)

**Request:** `multipart/form-data` — `file` 필드

**Response (200):**

```json
{
  "success": true,
  "url": "https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/review/1713345600000_abc123.webp"
}
```

---

## 4. 에디터 선택

### TipTap (권장)

| 항목       | 내용                                                    |
| ---------- | ------------------------------------------------------- |
| 라이브러리 | `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-image` |
| 번들 크기  | ~50KB gzipped (starter-kit 기준)                        |
| React 호환 | React 19 지원, hooks 기반                               |
| 장점       | 모듈식 아키텍처, 활발한 유지보수, TypeScript 네이티브   |
| GitHub     | 26k+ stars                                              |

### 필요 패키지

```bash
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/pm
```

### 에디터 기능 범위

| 기능       | 포함 여부 |
| ---------- | --------- |
| 굵게/기울임/밑줄 | ✅   |
| 제목 (H2, H3) | ✅      |
| 목록 (ul/ol) | ✅       |
| 이미지 삽입 | ✅ (Storage 업로드 후 URL 삽입) |
| 링크       | ✅        |
| 인용       | ✅        |
| 코드 블록  | ❌ (불필요) |
| 테이블     | ❌ (불필요) |

---

## 5. 이미지 업로드

### 흐름

```
에디터에서 이미지 삽입 클릭
  → 파일 선택
  → POST /api/v1/admin/reviews/upload (FormData)
  → 서버: sharp로 webp 변환 (선택) → Supabase Storage 업로드
  → 응답: public URL 반환
  → 에디터: <img src="URL"> 삽입
```

### Storage 경로

```
yedamlife/review/{timestamp}_{random}.webp
```

예시:
```
https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/review/1713345600000_a1b2c3.webp
```

### 업로드 제한

| 항목     | 값        |
| -------- | --------- |
| 최대 크기 | 5MB      |
| 허용 형식 | image/*  |
| 저장 형식 | .webp    |

---

## 6. 어드민 UI 설계

### 6-1. 리스트 페이지 (`/admin/reviews`)

```
┌─────────────────────────────────────────────┐
│ 후기 관리                      [+ 후기 등록] │
├─────────────────────────────────────────────┤
│ [카테고리 ▼]  [검색... 🔍]                  │
├─────────────────────────────────────────────┤
│ ID │ 카테고리 │ 제목 │ 작성자 │ 작성일 │ 활성 │ 관리 │
│  1 │ 일반상조 │ 감사... │ 김예담 │ 04/10 │ ● │ 🗑 │
│  2 │ 기업상조 │ 좋은... │ 이하나 │ 04/08 │ ● │ 🗑 │
│ ...│         │       │       │       │     │    │
├─────────────────────────────────────────────┤
│ 전체 45건 중 1-20건           [< 1 2 3 >]   │
└─────────────────────────────────────────────┘
```

- **카테고리 SelectBox** (shadcn Select): 전체 / 일반상조 / 기업상조 / ...
- **검색**: 제목·내용·작성자 대상 ilike 검색 (debounce 300ms)
- **활성 토글**: 클릭 시 즉시 PATCH

### 6-2. 등록 페이지 (`/admin/reviews/new`)

```
┌─────────────────────────────────────────────┐
│ [←] 후기 등록                       [등록]  │
├─────────────────────────────────────────────┤
│ 카테고리: [일반상조 ▼]                      │
│ 작성자:   [________]                        │
│ 작성일자: [2026-04-17]                      │
│ 제목:     [________]        (선택)          │
├─────────────────────────────────────────────┤
│ ┌─ 에디터 툴바 ───────────────────────────┐ │
│ │ B I U  H2 H3  • ─  🖼 🔗  ❝           │ │
│ ├─────────────────────────────────────────┤ │
│ │                                         │ │
│ │ (TipTap 에디터 영역)                     │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 6-3. 상세=수정 페이지 (`/admin/reviews/:id`)

- 등록 폼과 동일한 레이아웃
- 데이터 로드 후 폼에 채움
- 값 변경 시 "수정완료" 버튼 활성화 (dirty state 감지)
- 삭제 버튼 포함

---

## 7. 구현 순서

### Phase 1: DB + API

- [ ] `reviews` 테이블 + RLS 생성 (Supabase SQL Editor)
- [ ] TipTap 패키지 설치
- [ ] `src/app/api/v1/admin/reviews/route.ts` — GET (목록), POST (등록)
- [ ] `src/app/api/v1/admin/reviews/[id]/route.ts` — GET, PATCH, DELETE
- [ ] `src/app/api/v1/admin/reviews/upload/route.ts` — 이미지 업로드

### Phase 2: 어드민 UI

- [ ] `src/components/admin/review-editor.tsx` — TipTap 에디터 래퍼
- [ ] `src/app/admin/reviews/page.tsx` — 리스트
- [ ] `src/app/admin/reviews/new/page.tsx` — 등록
- [ ] `src/app/admin/reviews/[id]/page.tsx` — 상세=수정
- [ ] `src/components/admin/sidebar.tsx` — "후기 관리" 메뉴 추가

### Phase 3: 랜딩 연동 (후속)

- [ ] 공개 API: `GET /api/v1/reviews` (카테고리 필터, 활성만)
- [ ] 랜딩 페이지 후기 섹션 연동

---

## 8. 파일 구조

```
src/
├── app/
│   ├── admin/
│   │   └── reviews/
│   │       ├── page.tsx              -- 리스트
│   │       ├── new/page.tsx          -- 등록
│   │       └── [id]/page.tsx         -- 상세=수정
│   └── api/
│       └── v1/
│           └── admin/
│               └── reviews/
│                   ├── route.ts      -- GET (목록), POST (등록)
│                   ├── [id]/route.ts -- GET, PATCH, DELETE
│                   └── upload/route.ts -- 이미지 업로드
└── components/
    └── admin/
        ├── review-editor.tsx         -- TipTap 에디터 컴포넌트
        └── sidebar.tsx              -- "후기 관리" 메뉴 추가
```

### 사이드바 메뉴 위치

```
대시보드
일반상조 ▸
기업상조 ▸
유품정리 ▸
장지+    ▸
사후행정케어 ▸
운구의전 ▸
── 추가 ──
후기 관리               ← 신규
```

### 카테고리 매핑 (코드 ↔ 라벨)

```ts
const REVIEW_CATEGORIES: Record<string, string> = {
  general: '일반상조',
  corporate: '기업상조',
  estate: '유품정리',
  burial: '장지+',
  postcare: '사후행정케어',
  escort: '운구의전',
};
```
