# 예담라이프 알림톡 템플릿 정의

카카오 알림톡 템플릿 등록·관리용 문서입니다.
템플릿 본문은 심사 후 수정이 번거로우므로 **버전 관리(V1, V2…)** 로 운용합니다.

> 각 템플릿 본문에 포함된 변수는 **실제 폼(모달)에서 수집하는 항목만** 기준으로 정의되어 있습니다.

---

## 네이밍 규칙

### 템플릿 코드 (영문+숫자만 허용)
```
YDM{도메인}{용도}V{버전}
```

| 구성 | 설명 | 예 |
|------|------|-----|
| `YDM`  | 브랜드 접두사 (예담)                  | 고정 |
| `{도메인}` | 업무 영역 코드 (DB 테이블 prefix와 동일) | `GF`, `CF`, `EC`, `FE`, `BP`, `PC`, `TEL`, `MC` |
| `{용도}`   | 목적                               | `CONSULT`, `MEMBER`, `ESTIMATE`, `RESERVE`, `CALL`, `CARD` |
| `V{버전}`  | 버전                               | `V1`, `V2` … |

**도메인 코드표**

| 코드 | 도메인 | DB prefix |
|------|--------|-----------|
| `GF`  | 후불제 상조 (General Funeral)   | `gf_` |
| `CF`  | 기업 상조 (Corporate Funeral)  | `cf_` |
| `EC`  | 유품정리 (Estate Cleanup)       | `ec_` |
| `FE`  | 운구의전 (Funeral Escort)       | `fe_` |
| `BP`  | 장지+ (Burial Plus)            | `bp_` |
| `PC`  | 사후 행정케어 (Post Care)       | `pc_` |
| `MC`  | 멤버십 카드 (Membership Card)   | `mc_` |
| `TEL` | 전화 상담 클릭 트래킹            | —     |

### 템플릿 명 (관리용 · 한글 허용)
```
{도메인한글}_{용도}_v{버전}
```

예: `후불제상조_상담접수_v1`

---

## 공통 변수

| 변수 | 의미 | 비고 |
|------|------|------|
| `#{고객명}` | 신청자 이름           | 없으면 `#{연락처}` 사용 |
| `#{연락처}` | 신청자 전화번호       | `010-0000-0000` 포맷 |
| `#{접수일시}` | `YYYY-MM-DD HH:mm` | |

빈 값 가능성 있는 선택 필드는 발송 로직에서 `-` 로 치환합니다.

---

## 1. 문의 접수 알림톡 (고객 발송)

각 카테고리별 **실제 모달/폼에서 수집하는 항목만** 담아 고객에게 접수 확인용으로 발송합니다.

### 1-1. 후불제 상조 상담 신청

**폼 경로**: `후불제 상조` → `상담 신청하기` 버튼 → 모달
**수집 항목**: 상품, 이름 *, 연락처 *, 지역(시/도), 상담 희망 시간

| 항목 | 값 |
|------|-----|
| **템플릿 코드** | `YDMGFCONSULTV1` |
| **템플릿 명**   | `후불제상조_상담접수_v1` |
| **발송 시점**   | `POST /api/v1/general-funeral/consultation` 성공 시 |
| **수신자**     | `phone` |

**본문**
```
[예담라이프] 후불제 상조 상담 신청 접수

#{고객명}님, 후불제 상조 상담 신청이 정상 접수되었습니다.

■ 상품: #{상품}
■ 이름: #{고객명}
■ 연락처: #{연락처}
■ 지역: #{지역}
■ 상담 희망 시간: #{상담시간}
```

**변수 매핑**: `#{상품}=product`, `#{고객명}=name`, `#{연락처}=phone`, `#{지역}=region`, `#{상담시간}=timeSlot`

---

### 1-2. 기업 상조 상담 신청

**폼 경로**: `기업 상조` 페이지 내 인라인 상담 신청 폼
**수집 항목**: 상품, 이름 *, 연락처 *, 시/도, 상담시간, 개인정보 동의

| 항목 | 값 |
|------|-----|
| **템플릿 코드** | `YDMCFCONSULTV1` |
| **템플릿 명**   | `기업상조_상담접수_v1` |
| **발송 시점**   | `POST /api/v1/corporate-funeral/consultation` 성공 시 |
| **수신자**     | `phone` |

**본문**
```
[예담라이프] 기업 상조 상담 신청 접수

#{고객명}님, 기업 상조 상담 신청이 정상 접수되었습니다.

■ 상품: #{상품}
■ 이름: #{고객명}
■ 연락처: #{연락처}
■ 지역: #{지역}
■ 상담 희망 시간: #{상담시간}
```

**변수 매핑**: `#{상품}=product`, `#{고객명}=name`, `#{연락처}=phone`, `#{지역}=region`, `#{상담시간}=preferred_time`

> 개인정보 동의 항목은 알림톡 본문에 포함하지 않음.

---

### 1-3. 유품정리 견적 상담

**폼 경로**: `유품 정리` → `견적 상담` 버튼 → 모달
**수집 항목**: 성함 *, 연락처 *, 주소, 상세주소, 서비스 종류 *, 평수, 층, 주거형태, 방문 희망일

| 항목 | 값 |
|------|-----|
| **템플릿 코드** | `YDMECESTIMATEV1` |
| **템플릿 명**   | `유품정리_견적상담_v1` |
| **발송 시점**   | `POST /api/v1/estate-cleanup/estimate` 성공 시 |
| **수신자**     | `phone` |

**본문**
```
[예담라이프] 유품정리 견적 상담 접수

#{고객명}님, 유품정리 견적 상담이 정상 접수되었습니다.

■ 성함: #{고객명}
■ 연락처: #{연락처}
■ 주소: #{주소} #{상세주소}
■ 서비스 종류: #{서비스종류}
■ 평수: #{평수}
■ 층: #{층}
■ 주거형태: #{주거형태}
■ 방문 희망일: #{방문희망일}
```

**변수 매핑**: `#{고객명}=name`, `#{연락처}=phone`, `#{주소}=address`, `#{상세주소}=address_detail`, `#{서비스종류}=service_types` (배열 → 쉼표 join), `#{평수}=area`, `#{층}=floor`, `#{주거형태}=housing_type`, `#{방문희망일}=visit_date`

---

### 1-4. 운구의전 간편 예약

**폼 경로**: `운구 의전` → `간편 예약 하기` 버튼 → 모달
**수집 항목**: 작성자명 *, 작성자 연락처 *, 고인명 *, 고인 성별, 장례식장명 *, 장례식장 주소 *, 호실, 발인 날짜 *, 발인 시간 *, 장례 방법 *, 도착지 주소 *, 도착지 상세, 복장 *, 운구 인원 *

| 항목 | 값 |
|------|-----|
| **템플릿 코드** | `YDMFERESERVEV1` |
| **템플릿 명**   | `운구의전_간편예약_v1` |
| **발송 시점**   | `POST /api/v1/funeral-escort/reservation` 성공 시 |
| **수신자**     | `writer_phone` |

**본문**
```
[예담라이프] 운구의전 간편 예약 접수

#{작성자}님, 운구의전 예약이 정상 접수되었습니다.

■ 작성자: #{작성자} / #{작성자연락처}
■ 고인: #{고인명} (#{고인성별})
■ 장례식장: #{장례식장}
■ 장례식장 주소: #{장례식장주소}
■ 호실: #{호실}
■ 발인: #{발인일} #{발인시}시 #{발인분}분
■ 장례 방법: #{장례방법}
■ 도착지: #{도착지주소} #{도착지상세}
■ 복장: #{복장}
■ 운구 인원: #{인원}명
```

**변수 매핑**: `#{작성자}=writer_name`, `#{작성자연락처}=writer_phone`, `#{고인명}=deceased_name`, `#{고인성별}=deceased_gender`, `#{장례식장}=funeral_hall`, `#{장례식장주소}=funeral_hall_address`, `#{호실}=room_name`, `#{발인일}=departure_date`, `#{발인시}=departure_hour`, `#{발인분}=departure_minute`, `#{장례방법}=funeral_method` (화장/매장), `#{도착지주소}=destination_address`, `#{도착지상세}=destination_detail`, `#{복장}=clothing` (정장/의장대), `#{인원}=people`

---

### 1-5. 장지 상담 신청

**폼 경로**: `장지` → 상담 신청 모달
**수집 항목**: 선택 장지, 이름 *, 연락처 *, 종교 *, 희망 지역(시/도 * / 시/구/군), 예산, 메시지

| 항목 | 값 |
|------|-----|
| **템플릿 코드** | `YDMBPCONSULTV1` |
| **템플릿 명**   | `장지_상담신청_v1` |
| **발송 시점**   | `POST /api/v1/burial-plus/consultation` 성공 시 |
| **수신자**     | `phone` |

**본문**
```
[예담라이프] 장지 상담 신청 접수

#{고객명}님, 장지 상담 신청이 정상 접수되었습니다.

■ 선택 장지: #{선택장지}
■ 이름: #{고객명}
■ 연락처: #{연락처}
■ 종교: #{종교}
■ 희망 지역: #{시도} #{시구군}
■ 예산: #{예산}
■ 메시지: #{메시지}
```

**변수 매핑**: `#{선택장지}=products.name (product_id 조인)`, `#{고객명}=name`, `#{연락처}=phone`, `#{종교}=religion`, `#{시도}=region`, `#{시구군}=district`, `#{예산}=budget`, `#{메시지}=message`

---

### 1-6. 사후 행정 케어 무료 상담

**폼 경로**: `사후 행정 케어` → `무료 상담 신청` 버튼 → 모달
**수집 항목**: 성함 *, 연락처 *, 지역(시/도 / 시/구/군), 상담 유형 *, 상담 내용

| 항목 | 값 |
|------|-----|
| **템플릿 코드** | `YDMPCCONSULTV1` |
| **템플릿 명**   | `사후행정케어_무료상담_v1` |
| **발송 시점**   | `POST /api/v1/post-care/consultation` 성공 시 |
| **수신자**     | `phone` |

**본문**
```
[예담라이프] 사후 행정 케어 무료 상담 접수

#{고객명}님, 사후 행정 케어 무료 상담이 정상 접수되었습니다.

■ 성함: #{고객명}
■ 연락처: #{연락처}
■ 지역: #{시도} #{시구군}
■ 상담 유형: #{상담유형}
■ 상담 내용: #{상담내용}
```

**변수 매핑**: `#{고객명}=name`, `#{연락처}=phone`, `#{시도}=region`, `#{시구군}=district`, `#{상담유형}=service_type` (심리상담/세무상담/상속절차/법률지원), `#{상담내용}=message`

---

### 1-7. 장례비용 예상 결과 안내

**폼 경로**: `후불제 상조` → `장례비용 계산` 버튼 → 모달 → 결과 알림톡 받기
**수집 항목**: 이름 *, 연락처 *

| 항목 | 값 |
|------|-----|
| **템플릿 코드** | `YEDAMFCRESULTV1` |
| **템플릿 명**   | `장례비용결과안내` |
| **발송 시점**   | `POST /api/v1/funeral-cost/result` 성공 시 |
| **수신자**     | `phone` |

**본문**
```
[예담라이프] 장례비용 예상 결과

안녕하세요, #{이름} 님!
요청하신 장례비용 예상 결과가 준비되었습니다.
#{이름}님 만을 위한 특별 혜택과 함께 결과를 확인해보세요.
```

**변수 매핑**: `#{이름}=name`

> ⚠️ **네이밍 규칙 예외**: 다른 템플릿은 모두 `YDM` prefix를 사용하지만 이 템플릿은 `YEDAM` prefix로 등록되어 있습니다. 차후 `V2` 개정 시 `YDMGFCRESULTV2`로 정렬을 검토합니다.

---

## 2. 멤버십 신청 알림톡

### 2-1. 후불제 상조 멤버십 신청

**수집 항목**: 이름 *, 연락처 *, 생년월일 *, 성별 *, 종교 *, 보호자명, 보호자관계, 보호자연락처, 주소 *, 상세주소, 상품 *, 추천인

| 항목 | 값 |
|------|-----|
| **템플릿 코드** | `YDMGFMEMBERV1` |
| **템플릿 명**   | `후불제상조_멤버십신청_v1` |
| **발송 시점**   | `POST /api/v1/general-funeral/membership` 성공 시 |
| **수신자**     | `phone` |

**본문**
```
[예담라이프] 후불제 상조 멤버십 신청 접수

#{고객명}님, 후불제 상조 멤버십 신청이 정상 접수되었습니다.

■ 이름: #{고객명}
■ 연락처: #{연락처}
■ 생년월일: #{생년월일}
■ 성별: #{성별}
■ 종교: #{종교}
■ 보호자: #{보호자명} (#{보호자관계}) #{보호자연락처}
■ 주소: #{주소} #{상세주소}
■ 상품: #{상품}
■ 추천인: #{추천인}
```

**변수 매핑**: `#{고객명}=name`, `#{연락처}=phone`, `#{생년월일}=birth_date`, `#{성별}=gender`, `#{종교}=religion`, `#{보호자명}=guardian_name`, `#{보호자관계}=guardian_relation`, `#{보호자연락처}=guardian_phone`, `#{주소}=address`, `#{상세주소}=address_detail`, `#{상품}=product`, `#{추천인}=referrer`

---

### 2-2. 기업 상조 멤버십 신청

**수집 항목**: 신청인 *, 휴대폰 *, 기업명 *, 직급, 주소 *, 상세주소, 가입상품 *, 추천인

| 항목 | 값 |
|------|-----|
| **템플릿 코드** | `YDMCFMEMBERV1` |
| **템플릿 명**   | `기업상조_멤버십신청_v1` |
| **발송 시점**   | `POST /api/v1/corporate-funeral/membership` 성공 시 |
| **수신자**     | `phone` |

**본문**
```
[예담라이프] 기업 상조 멤버십 신청 접수

#{신청인}님, 기업 상조 멤버십 신청이 정상 접수되었습니다.

■ 신청인: #{신청인}
■ 휴대폰: #{휴대폰}
■ 기업명: #{기업명}
■ 직급: #{직급}
■ 주소: #{주소} #{상세주소}
■ 가입상품: #{가입상품}
■ 추천인: #{추천인}
```

**변수 매핑**: `#{신청인}=name`, `#{휴대폰}=phone`, `#{기업명}=company_name`, `#{직급}=position`, `#{주소}=address`, `#{상세주소}=address_detail`, `#{가입상품}=product`, `#{추천인}=referrer`

---

### 2-3. 멤버십 카드 신청 내역

기존 가입자가 가입증서 결과 페이지에서 **실물 멤버십 카드 발송**을 신청한 내역을 고객에게 안내합니다.

**폼 경로**: `/membership/certificate` 가입증서 조회 → `/membership/certificate/result` → `멤버십 카드 신청` 모달
**수집 항목**: 회원번호 *, 이름 *, 연락처 *, 우편번호, 주소 *, 상세주소

| 항목 | 값 |
|------|-----|
| **템플릿 코드** | `YDMMCCARDV1` |
| **템플릿 명**   | `멤버십카드_신청내역_v1` |
| **발송 시점**   | `POST /api/v1/membership/card-request` 성공 시 |
| **수신자**     | `phone` |

**본문**
```
[예담라이프] 멤버십 카드 신청 접수

#{고객명}님, 멤버십 카드 신청이 정상 접수되었습니다.
영업일 기준 3~5일 내 등기로 발송됩니다.

■ 회원번호: #{회원번호}
■ 이름: #{고객명}
■ 연락처: #{연락처}
■ 배송지: (#{우편번호}) #{주소} #{상세주소}
■ 접수일시: #{접수일시}
```

**변수 매핑**: `#{회원번호}=member_no`, `#{고객명}=name`, `#{연락처}=phone`, `#{우편번호}=zonecode`, `#{주소}=address`, `#{상세주소}=detail_address`, `#{접수일시}=now`

> 우편번호/상세주소가 비어있으면 발송 로직에서 `-` 로 치환합니다.

---

## 3. 전화 상담 클릭 알림톡 (관리자 발송)

고객이 각 카테고리 페이지에서 전화 상담 버튼(`tel:` 링크)을 클릭하면,
**내부 담당자**에게 어느 페이지에서 클릭했는지 알림톡을 발송합니다.

| 항목 | 값 |
|------|-----|
| **템플릿 코드** | `YDMTELCALLV1` |
| **템플릿 명**   | `전화상담_클릭알림_v1` |
| **발송 시점**   | 전화 버튼 `onClick` → `POST /api/v1/tel-click` |
| **수신자**     | 관리자 번호 (환경변수 `ADMIN_PHONE`) |

**본문**
```
[예담라이프] 전화 상담 버튼 클릭

■ 경로: #{경로}
■ 페이지 URL: #{URL}
■ 전화번호: #{전화번호}
■ 발생 시각: #{접수일시}

고객이 전화 상담 버튼을 눌렀습니다.
```

**변수 매핑**

| 변수 | 값 | 설명 |
|------|-----|------|
| `#{경로}` | `후불제 상조`, `기업 상조`, `유품정리`, `운구의전`, `장지`, `사후 행정케어` 등 | 클릭된 페이지의 카테고리 한글명 |
| `#{URL}` | `https://yedamlife.com/general-funeral` 등 | 클릭 시점의 `window.location.href` |
| `#{전화번호}` | `1660-0959`, `1660-0000` 등 | 클릭된 `tel:` 번호 |
| `#{접수일시}` | `2026-04-22 15:30` | 서버 발송 시점 |

**클라이언트 구현 메모**
- 전화 버튼 공통 래퍼 컴포넌트(`<TelButton category="..." phone="..." />`) 만들기
- `onClick` 시 `fetch('/api/v1/tel-click', { body: { category, phone, url }, keepalive: true })` 호출 후 기본 동작(`tel:` 이동) 진행

---

## 4. 발송 수신자 관리

### 4-1. 기본 수신자 (전체 템플릿)

다음 번호들은 **모든 알림톡**을 수신합니다.

| 번호 | 용도 |
|------|------|
| `01062704860` | 내부 담당자 1 |
| `01063300959` | 내부 담당자 2 |

### 4-2. 유품정리 전용 추가 수신자

**유품정리 견적 상담** 알림톡(`유품정리_견적상담_v1`)은 위 2개 번호 + 아래 1개 번호로 **총 3개 번호**에 발송합니다.

| 번호 | 용도 |
|------|------|
| `01062704860` | 내부 담당자 1 |
| `01063300959` | 내부 담당자 2 |
| `01040898272` | 유품정리 담당자 |

### 4-3. 로컬(개발) 환경 오버라이드

`localhost` / 개발 환경에서는 운영 수신자 리스트를 무시하고 **개발자 번호 1개로만** 발송합니다.

| 번호 | 용도 |
|------|------|
| `01091622508` | 개발 테스트 수신자 |

**판별 기준** (다음 중 하나라도 true 이면 개발 환경으로 간주):
- `process.env.NODE_ENV !== 'production'`
- `request.headers.host` 가 `localhost` 또는 `127.0.0.1` 로 시작

**구현 예시** (`src/lib/alimtalk/send.ts`)
```ts
const DEV_PHONE = '01091622508';

function resolveRecipients(template: TemplateKey, host?: string): string[] {
  const isDev =
    process.env.NODE_ENV !== 'production' ||
    host?.startsWith('localhost') ||
    host?.startsWith('127.0.0.1');

  if (isDev) return [DEV_PHONE];

  return template === 'EC_ESTIMATE'
    ? ALIMTALK_RECIPIENTS.EC_ESTIMATE
    : ALIMTALK_RECIPIENTS.DEFAULT;
}
```

> **고객 발송 알림톡(접수 확인)은 그대로 본인 번호로 발송**되지만, 로컬에서는 본인 번호 대신 `01091622508` 로 강제 치환합니다. 즉, 로컬에서는 모든 알림톡(고객용/관리자용)이 `01091622508` 단 1번호로만 전송됩니다.

---

## 5. 알림톡 발송 실패 시 폴백 (Fallback)

**알림톡 발송 실패** 또는 **수신 거부 시** 다음과 같이 처리합니다.

| 구분 | 방법 | 발신번호 |
|------|------|---------|
| **실패 시** | SMS/LMS 발송 | `01062704860` |
| **수신거부** | SMS/LMS 발송 | `01062704860` |

> **발송 흐름**: AlimTalk 시도 → 실패/거부 → SMS/LMS 로 자동 전환

---

## 6. 버전 개정 절차

템플릿 본문을 바꿔야 할 때는 **기존 코드를 유지한 채 새 코드로 신규 등록**합니다.

1. `YDMGFCONSULTV1` → `YDMGFCONSULTV2` 새 템플릿 등록 및 심사
2. 코드에서 발송 시 참조하는 템플릿 코드 상수만 교체
3. 기존 `V1`은 일정 기간 유지 후 벤더 어드민에서 비활성화

## 템플릿 상수 및 수신자 설정

**템플릿 코드 상수 예시** (`src/lib/alimtalk/templates.ts`)
```ts
export const ALIMTALK_TEMPLATES = {
  GF_CONSULT: 'YDMGFCONSULTV1',
  CF_CONSULT: 'YDMCFCONSULTV1',
  EC_ESTIMATE: 'YDMECESTIMATEV1',
  FE_RESERVE: 'YDMFERESERVEV1',
  BP_CONSULT: 'YDMBPCONSULTV1',
  PC_CONSULT: 'YDMPCCONSULTV1',
  GF_MEMBER: 'YDMGFMEMBERV1',
  CF_MEMBER: 'YDMCFMEMBERV1',
  MC_CARD: 'YDMMCCARDV1',
  FC_RESULT: 'YEDAMFCRESULTV1',
  TEL_CALL: 'YDMTELCALLV1',
} as const;

export const ALIMTALK_RECIPIENTS = {
  DEFAULT: ['01062704860', '01063300959'],
  EC_ESTIMATE: ['01062704860', '01063300959', '01040898272'],  // 유품정리 3명
} as const;
```

---

## 7. 발송 내역 저장 (`alimtalk_logs`)

모든 알림톡(및 SMS 폴백) 발송 시도를 한 줄씩 기록합니다. 운영 모니터링 / 재발송 / 고객 문의 추적용.

**마이그레이션**: [`scripts/migrate-alimtalk-logs.sql`](../../scripts/migrate-alimtalk-logs.sql)

### 컬럼 요약

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `BIGSERIAL` | PK |
| `uuid` | `UUID` | 외부 노출용 식별자 |
| `template_code` | `TEXT` | 카카오 템플릿 코드 (`YDMGFCONSULTV1` 등) |
| `template_name` | `TEXT` | 관리용 한글명 |
| `domain` | `TEXT` | `GF / CF / EC / FE / BP / PC / TEL / FC` |
| `purpose` | `TEXT` | `CONSULT / MEMBER / ESTIMATE / RESERVE / CALL / RESULT` |
| `recipient_phone` | `TEXT` | 수신 번호 |
| `recipient_role` | `TEXT` | `customer / admin / dev_override` |
| `variables` | `JSONB` | `#{변수명} → 값` 매핑 |
| `rendered_body` | `TEXT` | 치환 후 본문 (감사용) |
| `status` | `TEXT` | `pending / success / failed / rejected / fallback_sms` |
| `channel` | `TEXT` | `alimtalk / sms / lms` |
| `vendor` | `TEXT` | 벤더 식별 (kakao / solapi / aligo …) |
| `vendor_message_id` | `TEXT` | 벤더 측 메시지 ID |
| `vendor_response` | `JSONB` | 벤더 raw response |
| `error_code`, `error_message` | `TEXT` | 실패 사유 |
| `fallback_of` | `BIGINT FK` | SMS 폴백인 경우 원본 알림톡 `id` |
| `source_table`, `source_id` | `TEXT, BIGINT` | 원본 레코드 (예: `gf_consultations`, `42`) |
| `is_dev` | `BOOLEAN` | 로컬/개발 환경 발송 여부 |
| `requested_at`, `sent_at`, `created_at`, `updated_at` | `TIMESTAMPTZ` | 시각 정보 |

### 인덱스

- `template_code`, `domain`, `status`, `recipient_phone`
- `(source_table, source_id)` 복합
- `created_at DESC`

### 운영 쿼리 예시

**도메인별 일자별 성공/실패 집계**
```sql
SELECT
  date_trunc('day', created_at) AS day,
  domain,
  status,
  count(*) AS cnt
FROM alimtalk_logs
WHERE created_at >= now() - interval '30 days'
GROUP BY day, domain, status
ORDER BY day DESC, domain, status;
```

**특정 접수 건의 발송 이력**
```sql
SELECT id, template_code, status, channel, error_message, created_at
FROM alimtalk_logs
WHERE source_table = 'fe_reservations' AND source_id = 42
ORDER BY id;
```

**최근 실패 건과 폴백 SMS 매칭**
```sql
SELECT
  f.id          AS sms_log_id,
  f.recipient_phone,
  f.status      AS sms_status,
  o.id          AS original_alimtalk_id,
  o.template_code,
  o.error_message
FROM alimtalk_logs f
JOIN alimtalk_logs o ON o.id = f.fallback_of
WHERE f.channel IN ('sms', 'lms')
  AND f.created_at >= now() - interval '7 days'
ORDER BY f.id DESC;
```

### 발송 코드 연동 메모

`src/lib/alimtalk/send.ts` (가칭) 에서 발송 흐름:

1. `INSERT alimtalk_logs (... status='pending')` → `id` 확보
2. 벤더 API 호출
3. 성공: `UPDATE ... SET status='success', sent_at=now(), vendor_message_id=...`
4. 실패: `UPDATE ... SET status='failed', error_*=...` 후
   SMS 폴백 시 별도 row 추가 (`fallback_of = 원본 id`, `channel='sms'`)

---

## 8. 체크리스트 (템플릿 등록 시)

- [ ] 본문 1,000자 이하
- [ ] 변수는 `#{변수명}` 형태
- [ ] 광고성 문구 미포함 (정보성 알림톡만 가능)
- [ ] 수신자 전화번호 필드가 DB 스키마에 실제 존재하는지 확인
- [ ] 빈 값 가능성 있는 선택 필드는 발송 로직에서 `-` 또는 `미입력` 치환
- [ ] 배열 필드(`service_types` 등)는 문자열로 join
- [ ] 변경 시 버전 업 후 기존 버전은 일정 기간 공존 운영
