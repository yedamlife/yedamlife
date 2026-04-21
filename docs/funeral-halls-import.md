# 장례식장 데이터 Import 설계

## 원본 데이터

- 파일: `funeral_halls_full_1081.json`
- 건수: 1,081개 장례식장
- 구조: 플랫 필드 + 한글 키 JSON 배열 4개 + 메타 배열 2개

## 테이블: `funeral_halls`

### 기본 정보 (플랫 컬럼)

| 원본 필드 | DB 컬럼 | 타입 | 설명 |
|-----------|---------|------|------|
| facilitycd | facility_cd | text (PK) | 시설 코드 |
| facilitygroupcd | facility_group_cd | text | 시설 그룹 코드 |
| companyname | company_name | text | 장례식장 이름 |
| companyno | company_no | text | 사업자번호 |
| representativename | representative_name | text | 대표자명 |
| homepage | homepage | text | 홈페이지 |
| zipcd | zip_code | text | 우편번호 |
| fulladdress | full_address | text | 전체 주소 |
| address1 | address1 | text | 주소1 (도로명) |
| address2 | address2 | text | 주소2 (상세) |
| telephone | telephone | text | 전화번호 |
| faxnum | fax_number | text | 팩스번호 |
| latitude | latitude | numeric | 위도 |
| longitude | longitude | numeric | 경도 |
| orgid | org_id | text | 관할 기관 코드 |
| orgidnm | org_name | text | 관할 기관명 (예: 서울특별시 구로구) |
| sidocd | sido_cd | text | 시도 코드 |
| gungucd | gungu_cd | text | 군구 코드 |
| publiccode | public_code | text | 공설/사설 코드 |
| publicYn | public_label | text | 공설/사설 표시명 |
| manageclassdiv | manage_class | text | 운영 구분 (직영/위탁 등) |
| funeraltypecd | funeral_type | text | 장례식장 유형 (병원/전문 등) |
| mortuaycnt | mortuary_count | integer | 빈소 수 |
| charnelabilitycnt | charnel_capacity | integer | 안치 능력 수 |
| parkcnt | parking_count | integer | 주차 대수 |
| businessdate | business_date | date | 영업 개시일 |
| mealroomyn | has_meal_room | boolean | 식당 유무 |
| waitroomyn | has_wait_room | boolean | 대기실 유무 |
| imparyn | has_imparity | boolean | 장애인 시설 유무 |
| parkyn | has_parking | boolean | 주차장 유무 |
| superyn | has_convenience | boolean | 편의점 유무 |
| traffpublic | traffic_public | text | 대중교통 안내 |
| traffowner | traffic_car | text | 자가용 안내 |
| etcinfw | etc_info | text | 기타 안내 |
| lastUpdateDate | last_update_date | date | 최종 수정일 |
| priceitemdate | price_update_date | date | 가격 정보 수정일 |
| packageYn | has_package | boolean | 패키지 상품 유무 |

### JSON 컬럼 (배열 그대로 저장)

| 원본 필드 | DB 컬럼 | 타입 | 설명 |
|-----------|---------|------|------|
| 시설사용료 | facility_fees | jsonb | 시설 사용료 목록 |
| 서비스항목 | service_items | jsonb | 서비스 항목 목록 |
| 장사용품분류 | funeral_supplies | jsonb | 장사 용품 목록 |
| packageList | package_list | jsonb | 패키지 상품 목록 |
| filelist | file_list | jsonb | 첨부 이미지 파일 목록 |

> `facilityList`는 기본 정보와 중복되므로 저장하지 않음

### JSON 내부 필드 매핑 (참고)

#### facility_fees (시설사용료)

| 원본 | 영문 키 | 설명 |
|------|---------|------|
| 품종 | category | 대분류 |
| 품종상세 | sub_category | 소분류 |
| 품명 | item_name | 품명 |
| 임대내용 | rental_desc | 임대 조건 |
| 요금 | price | 요금 (숫자) |
| 요금_표시 | price_display | 요금 (포맷) |
| 관내평균가격 | local_avg_price | 관내 평균가 |
| 관내평균가격_표시 | local_avg_display | 관내 평균가 (포맷) |
| 관내개소수 | local_count | 관내 업소 수 |
| 전국평균가격 | national_avg_price | 전국 평균가 |
| 전국평균가격_표시 | national_avg_display | 전국 평균가 (포맷) |
| 전국개소수 | national_count | 전국 업소 수 |
| 판매구분 | sale_type | 판매/비판매 |
| 판매여부 | is_selling | Y/N |

#### service_items (서비스항목)

> facility_fees와 동일 구조, `임대내용` → `서비스내용(service_desc)`

#### funeral_supplies (장사용품분류)

| 원본 | 영문 키 | 설명 |
|------|---------|------|
| 품종 | category | 대분류 |
| 품종상세 | sub_category | 소분류 |
| 품명 | item_name | 품명 |
| 기타정보 | extra_info | 기타 정보 |
| 비고 | remark | 비고 |
| 요금~판매여부 | (동일) | facility_fees와 동일 |

## DDL

```sql
CREATE TABLE funeral_halls (
  facility_cd       text PRIMARY KEY,
  facility_group_cd text,
  company_name      text NOT NULL,
  company_no        text,
  representative_name text,
  homepage          text,
  zip_code          text,
  full_address      text,
  address1          text,
  address2          text,
  telephone         text,
  fax_number        text,
  latitude          numeric,
  longitude         numeric,
  org_id            text,
  org_name          text,
  sido_cd           text,
  gungu_cd          text,
  public_code       text,
  public_label      text,
  manage_class      text,
  funeral_type      text,
  mortuary_count    integer DEFAULT 0,
  charnel_capacity  integer DEFAULT 0,
  parking_count     integer DEFAULT 0,
  business_date     date,
  has_meal_room     boolean DEFAULT false,
  has_wait_room     boolean DEFAULT false,
  has_imparity      boolean DEFAULT false,
  has_parking       boolean DEFAULT false,
  has_convenience   boolean DEFAULT false,
  traffic_public    text,
  traffic_car       text,
  etc_info          text,
  last_update_date  date,
  price_update_date date,
  has_package       boolean DEFAULT false,
  facility_fees     jsonb DEFAULT '[]'::jsonb,
  service_items     jsonb DEFAULT '[]'::jsonb,
  funeral_supplies  jsonb DEFAULT '[]'::jsonb,
  package_list      jsonb DEFAULT '[]'::jsonb,
  file_list         jsonb DEFAULT '[]'::jsonb,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- 검색용 인덱스
CREATE INDEX idx_funeral_halls_sido ON funeral_halls (sido_cd);
CREATE INDEX idx_funeral_halls_gungu ON funeral_halls (gungu_cd);
CREATE INDEX idx_funeral_halls_type ON funeral_halls (funeral_type);
CREATE INDEX idx_funeral_halls_name ON funeral_halls (company_name);
CREATE INDEX idx_funeral_halls_lat ON funeral_halls (latitude);
CREATE INDEX idx_funeral_halls_lng ON funeral_halls (longitude);
```

## Import 스크립트 매핑

```ts
// Y/N → boolean
const toBool = (v: string | null) => v === 'Y';

// 날짜 변환 (2026/04/01 → 2026-04-01)
const toDate = (v: string | null) => v?.replace(/\//g, '-') || null;

// 원본 → DB 매핑
{
  facility_cd: item.facilitycd,
  facility_group_cd: item.facilitygroupcd,
  company_name: item.companyname,
  company_no: item.companyno,
  representative_name: item.representativename,
  homepage: item.homepage,
  zip_code: item.zipcd,
  full_address: item.fulladdress,
  address1: item.address1,
  address2: item.address2,
  telephone: item.telephone,
  fax_number: item.faxnum,
  latitude: parseFloat(item.latitude) || null,
  longitude: parseFloat(item.longitude) || null,
  org_id: item.orgid,
  org_name: item.orgidnm,
  sido_cd: item.sidocd,
  gungu_cd: item.gungucd,
  public_code: item.publiccode,
  public_label: item.publicYn,
  manage_class: item.manageclassdiv,
  funeral_type: item.funeraltypecd,
  mortuary_count: item.mortuaycnt ?? 0,
  charnel_capacity: item.charnelabilitycnt ?? 0,
  parking_count: item.parkcnt ?? 0,
  business_date: toDate(item.businessdate),
  has_meal_room: toBool(item.mealroomyn),
  has_wait_room: toBool(item.waitroomyn),
  has_imparity: toBool(item.imparyn),
  has_parking: toBool(item.parkyn),
  has_convenience: toBool(item.superyn),
  traffic_public: item.traffpublic,
  traffic_car: item.traffowner,
  etc_info: item.etcinfw,
  last_update_date: toDate(item.lastUpdateDate),
  price_update_date: toDate(item.priceitemdate),
  has_package: toBool(item.packageYn),
  facility_fees: item['시설사용료'] ?? [],
  service_items: item['서비스항목'] ?? [],
  funeral_supplies: item['장사용품분류'] ?? [],
  package_list: item.packageList ?? [],
  file_list: item.filelist ?? [],
}
```
