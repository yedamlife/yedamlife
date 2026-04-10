# 운구의전 (Funeral Escort) - API & DB 설계 문서

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

운구의전 랜딩 페이지(`funeral-escort-service.tsx`)에서 수집하는 폼 데이터를 서버 API + DB로 연동한다.

| # | 기능 | 설명 |
|---|------|------|
| 1 | 운구의전 간편 예약 | 운구의전 예약 모달 폼 (ReservationModal) — 작성자 정보, 고인 정보, 장례식장, 발인 일자, 장례 방법, 복장, 인원 등 |

---

## 2. DB 테이블 설계

### 2-1. 운구의전 예약 내역 (`fe_reservation_requests`)

> 운구의전 간편 예약 모달 폼 데이터

```sql
CREATE TABLE fe_reservation_requests (
  id                   BIGSERIAL PRIMARY KEY,
  -- 신청자 정보
  writer_name          VARCHAR(50)   NOT NULL,  -- 신청자명
  writer_phone         VARCHAR(20)   NOT NULL,  -- 신청자 연락처
  -- 고인 정보
  deceased_name        VARCHAR(50)   NOT NULL,  -- 고인명
  deceased_gender      VARCHAR(10)   NOT NULL,  -- male / female
  -- 장례식장 정보
  funeral_hall         VARCHAR(100)  NOT NULL,  -- 장례식장명
  funeral_hall_address TEXT          NOT NULL,  -- 장례식장 주소
  room_name            VARCHAR(50),             -- 호실명
  -- 발인 정보
  departure_date       DATE          NOT NULL,  -- 발인일자
  departure_hour       VARCHAR(2)    NOT NULL,  -- 시간 (00~23)
  departure_minute     VARCHAR(2)    NOT NULL,  -- 분 (00/10/20/30/40/50)
  -- 장례 방법
  funeral_method       VARCHAR(20)   NOT NULL,  -- cremation / burial
  destination_address  Text          NOT NULL,  -- 화장장/매장지 주소
  destination_detail   VARCHAR(200),            -- 상세 주소
  -- 서비스 옵션
  clothing             VARCHAR(20)   NOT NULL,  -- suit / guard
  people               INTEGER       NOT NULL,  -- 운구 인원 (2/4/6/8)
  price                INTEGER       NOT NULL,  -- 계산된 금액 (원)
  -- 메타
  status               VARCHAR(20)   NOT NULL DEFAULT 'pending',  -- pending / confirmed / completed / cancelled
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_fe_reservation_status ON fe_reservation_requests(status);
CREATE INDEX idx_fe_reservation_departure ON fe_reservation_requests(departure_date);
CREATE INDEX idx_fe_reservation_created_at ON fe_reservation_requests(created_at DESC);
```

### RLS (Row Level Security) 정책

```sql
-- RLS 활성화
ALTER TABLE fe_reservation_requests ENABLE ROW LEVEL SECURITY;

-- service_role만 접근 가능 (Next.js API Route에서 service_role key 사용)
-- 클라이언트에서 직접 접근 불가
```

### 가격 계산 로직

`ReservationModal`에서 클라이언트 사이드로 계산 후 서버에 전송:

| 장례 방법 | 2명당 단가 | 4명 | 6명 | 8명 |
|-----------|-----------|-----|-----|-----|
| 화장 (cremation) | 300,000원 | 600,000원 | 900,000원 | 1,200,000원 |
| 매장 (burial) | 360,000원 | 720,000원 | 1,080,000원 | 1,440,000원 |

```
price = (people / 2) * PRICE_PER_2[funeralMethod]
```

---

## 3. API 엔드포인트 설계

### Base Path: `/api/v1/funeral-escort`

### 3-1. 운구의전 간편 예약 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/funeral-escort/reservation` | 운구의전 간편 예약 생성 |

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

**필수 필드:** `writer_name`, `writer_phone`, `deceased_name`, `funeral_hall`, `departure_date`, `funeral_method`, `clothing`, `people`

**선택 필드:** `deceased_gender`, `funeral_hall_address`, `room_name`, `departure_hour`, `departure_minute`, `destination_address`, `destination_detail`, `price`

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
    { "field": "writer_name", "message": "신청자명을 입력해주세요." }
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

- [ ] Supabase에 `fe_reservation_requests` 테이블 생성
- [ ] RLS 정책 적용

### Phase 2: API 구현

- [ ] `src/app/api/v1/funeral-escort/reservation/route.ts` - 운구의전 간편 예약 API

### Phase 3: 프론트엔드 연동

- [ ] `reservation-modal.tsx` 예약폼 → `/api/v1/funeral-escort/reservation` 연동
  - 기존 `/api/v1/general-funeral/reservation` 경로를 `/api/v1/funeral-escort/reservation`으로 변경

---

## 5. 전체 파일 구조

```
src/
├── app/
│   └── api/
│       └── v1/
│           └── funeral-escort/
│               └── reservation/route.ts      -- 운구의전 간편 예약
├── components/
│   └── template/
│       └── YedamLife/
│           ├── funeral-escort-service.tsx     -- 운구의전 랜딩 페이지
│           └── reservation-modal.tsx          -- 간편 예약 모달
└── lib/
    └── supabase.ts
```

### 테이블 네이밍 규칙

기존 패턴을 따라 운구의전은 `fe_` prefix를 사용한다.

| 테이블 | Prefix | 용도 |
|--------|--------|------|
| `fe_reservation_requests` | `fe_` | 운구의전 간편 예약 |

### 페이지별 API/테이블 매핑 전체 현황

| 랜딩 페이지 | API 네임스페이스 | 테이블 prefix |
|------------|-----------------|--------------|
| 일반상조 (`general-funeral`) | `/api/v1/general-funeral/` | `gf_` |
| 기업상조 (`corporate-funeral`) | `/api/v1/corporate-funeral/` | `cf_` |
| 유품정리 (`estate-cleanup`) | `/api/v1/estate-cleanup/` | `ec_` |
| 운구의전 (`funeral-escort`) | `/api/v1/funeral-escort/` | `fe_` |
