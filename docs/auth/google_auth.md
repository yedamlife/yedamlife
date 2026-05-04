# 어드민 Google OAuth 인증

`/admin/**` 경로에 대한 Google 계정 기반 인증 시스템 문서.

## 개요

- 인증 방식: **Google Identity Services (GIS) — ID Token 직접 검증**
- 보호 범위: `/admin/**` (단, `/admin/login`은 예외)
- 세션 저장소: HttpOnly 쿠키 `admin_session` (JSON 직렬화)
- 화이트리스트: Supabase `admin_users` 테이블의 `is_active = true` 레코드만 허용
- 세션 만료: 7일

> Supabase 는 **`admin_users` 테이블 저장소로만** 사용한다. Supabase Auth(OAuth provider) 는 사용하지 않는다. Google 로그인 자체는 GIS 로 직접 처리한다.

로컬 개발 환경(`localhost`, `127.0.0.1`)에서는 OAuth를 우회하고 고정 어드민 계정으로 즉시 로그인되는 dev 모드를 제공한다.

## 인증 흐름

### 프로덕션

```
1. 사용자 → /admin/* 접근
2. middleware: admin_session 쿠키 없음 → /admin/login 으로 redirect
3. /admin/login 페이지에서 GIS 스크립트 로드 후 Google 버튼 렌더
4. 사용자가 버튼 클릭 → Google 동의 화면(팝업)
5. GIS 가 ID Token(JWT) 을 콜백으로 전달
6. 페이지가 POST /api/v1/admin/auth/login { credential: <idToken> }
7. login route:
   - verifyGoogleIdToken(): Google tokeninfo 엔드포인트로 검증
     · 서명/만료/issuer 검사
     · aud === NEXT_PUBLIC_GOOGLE_CLIENT_ID 검사
     · email_verified === true 검사
   - admin_users 테이블에서 email 조회 (is_active = true)
   - 통과 시 setAdminSession() → admin_session 쿠키 발급
   - last_login 업데이트
8. 응답 받은 페이지가 router.push('/admin/dashboard')
```

### 로컬 개발 (localhost)

```
1. /admin/login → "개발자 계정으로 로그인" 클릭
2. POST /api/v1/admin/auth/login (body 없음)
3. 서버에서 host 검증 (localhost/127.0.0.1)
4. DEV_ADMIN 으로 setAdminSession()
5. 페이지가 /admin/dashboard 로 이동
```

> 동일 엔드포인트(`/api/v1/admin/auth/login`)에서 `body.credential` 유무로 dev / 프로덕션 분기한다. credential 없이 호출되고 host 가 localhost 가 아니면 403.

## 핵심 파일

| 파일 | 역할 |
|------|------|
| [src/middleware.ts](../../src/middleware.ts) | `/admin/**` 진입 시 `admin_session` 쿠키 검사 |
| [src/app/admin/login/page.tsx](../../src/app/admin/login/page.tsx) | GIS 버튼 렌더 + credential POST. localhost dev 분기 |
| [src/app/api/v1/admin/auth/login/route.ts](../../src/app/api/v1/admin/auth/login/route.ts) | ID Token 검증 + 화이트리스트 + 세션 발급 (dev 로그인 통합) |
| [src/app/api/v1/admin/auth/logout/route.ts](../../src/app/api/v1/admin/auth/logout/route.ts) | 세션 쿠키 제거 |
| [src/app/api/v1/admin/auth/me/route.ts](../../src/app/api/v1/admin/auth/me/route.ts) | 현재 어드민 세션 조회 |
| [src/lib/admin/auth.ts](../../src/lib/admin/auth.ts) | 세션 get/set/clear 헬퍼, `DEV_ADMIN` 상수 |
| [src/lib/admin/google.ts](../../src/lib/admin/google.ts) | Google ID Token 검증 (`verifyGoogleIdToken`) |
| [src/lib/supabase.ts](../../src/lib/supabase.ts) | service_role Supabase 클라이언트 (admin_users 조회 전용) |

> 이전 Supabase OAuth 구조에서 사용하던 `/api/v1/admin/auth/callback`, `src/lib/supabase-server.ts`, `src/lib/supabase-browser.ts` 는 제거되었다.

## ID Token 검증

`src/lib/admin/google.ts` 의 `verifyGoogleIdToken(idToken)` 이 Google 의 [tokeninfo 엔드포인트](https://oauth2.googleapis.com/tokeninfo)로 토큰을 보내서 검증한다. 이 엔드포인트는:

- JWT 서명 (Google 의 공개키)
- 만료 (`exp`)
- issuer (`iss`)

를 자동으로 검사하고 클레임을 JSON 으로 반환한다. 이후 앱 코드에서 추가 검증:

| 검사 항목 | 이유 |
|-----------|------|
| `iss` ∈ `{accounts.google.com, https://accounts.google.com}` | issuer 정상 확인 |
| `aud === NEXT_PUBLIC_GOOGLE_CLIENT_ID` | 다른 앱이 발급받은 토큰을 못 쓰게 차단 |
| `email_verified === 'true'` | 이메일 소유권 검증된 계정만 허용 |
| `exp > now` | tokeninfo 가 검사하지만 한 번 더 |

> 별도 라이브러리(`google-auth-library`, `jose`) 없이 fetch 한 번으로 끝난다. 추가 네트워크 round-trip 이 있지만 어드민 로그인 빈도에서는 문제 없다.

## DB 스키마

### `admin_users`

화이트리스트 테이블. Google 로그인 후 이 테이블에 활성 레코드가 있어야만 어드민 진입 가능.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | PK |
| `email` | text | Google 계정 이메일 (unique) |
| `name` | text | 표시 이름 |
| `role` | text | `super_admin`, `admin` 등 |
| `avatar_url` | text \| null | 아바타 이미지 (null 이면 Google `picture` 클레임으로 fallback) |
| `is_active` | boolean | 비활성 시 로그인 차단 |
| `last_login` | timestamptz | 로그인 성공 시 갱신 |

신규 어드민 추가는 이 테이블에 INSERT 하면 된다. Google 계정만 있으면 별도 사전 가입 절차는 없다.

### 테이블 생성 쿼리

Supabase SQL Editor 에서 1회 실행한다.

```sql
-- admin_users: 어드민 화이트리스트
CREATE TABLE IF NOT EXISTS admin_users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL UNIQUE,
  name        text NOT NULL,
  role        text NOT NULL DEFAULT 'admin',
  avatar_url  text,
  is_active   boolean NOT NULL DEFAULT true,
  last_login  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- role 값 제약
ALTER TABLE admin_users
  DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE admin_users
  ADD CONSTRAINT admin_users_role_check
  CHECK (role IN ('super_admin', 'admin'));

-- 조회 인덱스
CREATE INDEX IF NOT EXISTS admin_users_email_active_idx
  ON admin_users (email)
  WHERE is_active = true;

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_users_set_updated_at ON admin_users;
CREATE TRIGGER admin_users_set_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: 어플리케이션은 service_role 키로 접근하므로 RLS 활성화 + 정책 없음
-- (anon/authenticated 키로는 절대 읽지 못하게 함)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 최초 super_admin 시드
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('dahunee37@gmail.com', 'DAHUN LEE', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;
```

> RLS 는 켜두지만 정책은 만들지 않는다. 앱은 [src/lib/supabase.ts](../../src/lib/supabase.ts) 의 `service_role` 키로만 이 테이블에 접근하기 때문에 RLS 를 우회할 수 있고, 클라이언트에 노출되는 `anon` 키로는 화이트리스트가 절대 새지 않는다.

## 세션 쿠키

- 이름: `admin_session`
- 값: `JSON.stringify({ email, name, role, avatar_url })`
- 옵션: `httpOnly`, `sameSite=lax`, `secure` (production), `path=/`, `maxAge=7d`

미들웨어는 쿠키의 **존재만** 확인하며 값 파싱은 하지 않는다. 실제 사용자 정보가 필요한 서버 컴포넌트/API에서는 [`getAdminSession()`](../../src/lib/admin/auth.ts) 를 호출한다.

## 환경 변수

`.env.local` (개발) / 배포 환경의 환경 변수에 다음 값을 설정한다.

```bash
# ─── Google OAuth ─────────────────────────────────────────
# Google Cloud Console 에서 발급받은 OAuth 2.0 Web Client ID.
# 클라이언트(GIS 버튼 초기화)와 서버(ID Token aud 검증) 양쪽에서 사용.
# Web Client ID 는 비밀이 아니다 — 클라이언트에 노출되어도 안전.
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com

# ─── Supabase (admin_users DB 저장소 전용) ───────────────
# Supabase 프로젝트 URL.
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co

# 서버 전용 키. RLS를 우회하므로 절대 클라이언트에 노출 금지.
# admin_users 조회/last_login 업데이트에 사용됨 (src/lib/supabase.ts).
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

> Supabase Auth 를 더 이상 쓰지 않으므로 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 는 인증 흐름에 필요 없다. 다른 곳에서 anon 클라이언트를 쓰지 않는다면 함께 제거해도 된다.
> Google **Client Secret** 은 ID Token 방식에서는 사용하지 않으므로 환경 변수에 추가하지 않는다.

### 변수별 사용처

| 변수 | 노출 범위 | 사용 위치 | 용도 |
|------|-----------|-----------|------|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | 클라이언트 + 서버 | [admin/login/page.tsx](../../src/app/admin/login/page.tsx), [admin/google.ts](../../src/lib/admin/google.ts) | GIS 버튼 초기화, ID Token `aud` 검증 |
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트 + 서버 | [supabase.ts](../../src/lib/supabase.ts) | Supabase 엔드포인트 (admin_users 테이블 접근) |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용** | [supabase.ts](../../src/lib/supabase.ts) | `admin_users` 화이트리스트 조회/업데이트 (RLS 우회) |

### 발급 위치

- **`NEXT_PUBLIC_GOOGLE_CLIENT_ID`**
  Google Cloud Console → `APIs & Services → Credentials → OAuth 2.0 Client IDs → Web application`
  - **Authorized JavaScript origins** 에 다음 등록:
    ```
    http://localhost:3001
    https://your-domain.com
    ```
  - **Authorized redirect URIs** 는 비워둬도 된다 (ID Token 방식은 redirect 사용 안 함).
  - 발급된 Client ID 가 환경 변수 값.

- **`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`**
  Supabase Dashboard → `Project Settings → API`
  - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - `service_role` `secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 주의사항

- `NEXT_PUBLIC_` 접두사가 붙은 변수는 **빌드 타임에 클라이언트 번들로 인라인**된다. 시크릿 값을 넣지 말 것 (Web Client ID 는 시크릿이 아니므로 OK).
- `SUPABASE_SERVICE_ROLE_KEY` 는 사실상 DB 마스터 키와 동급이다. 깃 커밋 / 클라이언트 코드 / 로그 출력 절대 금지.
- 환경 변수 변경 시 `next dev` 프로세스 재시작 필요 (Hot reload 로는 반영되지 않음).
- Vercel 등에 배포하는 경우 동일 값을 Production / Preview / Development 환경 각각에 등록해야 한다.

## Google Cloud Console 설정 (요약)

1. [Google Cloud Console](https://console.cloud.google.com/) → 프로젝트 선택/생성
2. `APIs & Services → OAuth consent screen` 설정 (앱 이름, 지원 이메일, scope: `email`, `profile`, `openid`)
3. `APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID`
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:3001`
     - `https://your-domain.com`
   - Authorized redirect URIs: 비움
4. 생성된 Client ID 를 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 로 설정

## 트러블슈팅

| 증상 | 원인 / 해결 |
|------|-------------|
| GIS 버튼이 안 보임 | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 미설정, 또는 현재 origin 이 Google Cloud Console 의 Authorized JavaScript origins 에 없음 |
| `invalid_token` (401) | ID Token 만료/위조. 사용자가 페이지를 오래 열어둔 경우 새로고침 후 재시도 |
| `invalid_audience` | `aud` 불일치. 환경변수의 Client ID 와 GIS 가 사용한 Client ID 가 다름 |
| `not_admin` (403) | OAuth 통과했지만 `admin_users` 에 활성 레코드 없음. 테이블에 INSERT 필요 |
| `forbidden` (403) | 프로덕션에서 credential 없이 호출됨 (dev shortcut 차단) |
| 로그인 후 다시 `/admin/login` 으로 튕김 | 쿠키 발급 실패. `secure` 플래그(HTTPS 여부) 확인 |
| 로컬에서 GIS 버튼이 뜸 | host 가 `localhost`/`127.0.0.1` 이 아닌 경우 (예: LAN IP). `isLocalhost()` 판정 로직 참고 |

## 어드민 추가 절차

1. Supabase SQL Editor 또는 Table Editor 에서 `admin_users` 에 레코드 INSERT:
   ```sql
   INSERT INTO admin_users (email, name, role, is_active)
   VALUES ('newadmin@example.com', '홍길동', 'admin', true);
   ```
2. 해당 사용자가 `/admin/login` → Google 로그인.
3. ID Token 검증 + 화이트리스트 통과 → 자동 진입.

## 어드민 제거

```sql
UPDATE admin_users SET is_active = false WHERE email = 'someone@example.com';
```

`is_active = false` 로만 바꿔도 다음 로그인 시도부터 차단된다. 단, **이미 발급된 `admin_session` 쿠키는 만료(7일)까지 유효**하다는 점에 유의. 즉시 차단이 필요하면:

- 쿠키 시크릿을 회전하거나
- 미들웨어에서 매 요청마다 `admin_users` 조회로 검증하도록 변경 (현재는 쿠키 존재만 확인)
