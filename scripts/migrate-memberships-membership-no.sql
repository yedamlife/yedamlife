-- ====================================================================
-- 후불제상조 (gf_membership_applications) + 기업상조 (cf_membership_applications)
-- 회원번호 자동 발급 규칙: YD{yyyymmdd_KST}{daily_seq:4}-{religion_code}
--
-- 동시 INSERT race-free 보장:
--   - daily_sequence 컬럼 + (KST 날짜, daily_sequence) 부분 unique 인덱스
--   - BEFORE INSERT 트리거에서 advisory lock 으로 동일 KST 날짜 직렬화
--   - 1만번째 INSERT 부터는 ERRCODE 'check_violation' 으로 실패
--
-- 종교 코드: 무교=N, 기독교=P, 천주교=C, 불교=B, 기타=O
--   기업상조는 종교 컬럼이 없으므로 항상 'N'
-- ====================================================================

-- 0) 종교 → 코드 매핑 헬퍼
CREATE OR REPLACE FUNCTION religion_to_code(r text)
RETURNS text AS $$
BEGIN
  RETURN CASE r
    WHEN '무교'   THEN 'N'
    WHEN '기독교' THEN 'P'
    WHEN '천주교' THEN 'C'
    WHEN '불교'   THEN 'B'
    WHEN '기타'   THEN 'O'
    ELSE 'N'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- ====================================================================
-- 1) 후불제상조: gf_membership_applications
-- ====================================================================

ALTER TABLE gf_membership_applications
  ADD COLUMN IF NOT EXISTS daily_sequence integer;

CREATE UNIQUE INDEX IF NOT EXISTS gf_membership_kst_seq_uniq
  ON gf_membership_applications (((created_at AT TIME ZONE 'Asia/Seoul')::date), daily_sequence)
  WHERE daily_sequence IS NOT NULL;

-- 기존 record 의 daily_sequence 백필 (KST 날짜별 created_at 정순)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY (created_at AT TIME ZONE 'Asia/Seoul')::date
    ORDER BY created_at, id
  ) AS seq
  FROM gf_membership_applications
  WHERE daily_sequence IS NULL
)
UPDATE gf_membership_applications g
SET daily_sequence = r.seq
FROM ranked r
WHERE g.id = r.id;

CREATE OR REPLACE FUNCTION assign_gf_membership_no()
RETURNS TRIGGER AS $$
DECLARE
  next_seq integer;
  d        date;
  ymd      text;
  rcode    text;
BEGIN
  d   := (COALESCE(NEW.created_at, now()) AT TIME ZONE 'Asia/Seoul')::date;
  ymd := to_char(COALESCE(NEW.created_at, now()) AT TIME ZONE 'Asia/Seoul', 'YYYYMMDD');

  PERFORM pg_advisory_xact_lock(hashtext('gf_member_seq_' || d::text));

  SELECT COALESCE(MAX(daily_sequence), 0) + 1 INTO next_seq
  FROM gf_membership_applications
  WHERE (created_at AT TIME ZONE 'Asia/Seoul')::date = d;

  IF next_seq > 9999 THEN
    RAISE EXCEPTION 'gf_membership_applications daily_sequence overflow for %: %', d, next_seq
      USING ERRCODE = 'check_violation';
  END IF;

  rcode := religion_to_code(NEW.religion);

  NEW.daily_sequence := next_seq;
  NEW.membership_no  := 'YD' || ymd || lpad(next_seq::text, 4, '0') || '-' || rcode;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ====================================================================
-- 2) 기업상조: cf_membership_applications
-- ====================================================================

ALTER TABLE cf_membership_applications
  ADD COLUMN IF NOT EXISTS daily_sequence integer;

CREATE UNIQUE INDEX IF NOT EXISTS cf_membership_kst_seq_uniq
  ON cf_membership_applications (((created_at AT TIME ZONE 'Asia/Seoul')::date), daily_sequence)
  WHERE daily_sequence IS NOT NULL;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY (created_at AT TIME ZONE 'Asia/Seoul')::date
    ORDER BY created_at, id
  ) AS seq
  FROM cf_membership_applications
  WHERE daily_sequence IS NULL
)
UPDATE cf_membership_applications c
SET daily_sequence = r.seq
FROM ranked r
WHERE c.id = r.id;

CREATE OR REPLACE FUNCTION assign_cf_membership_no()
RETURNS TRIGGER AS $$
DECLARE
  next_seq integer;
  d        date;
  ymd      text;
BEGIN
  d   := (COALESCE(NEW.created_at, now()) AT TIME ZONE 'Asia/Seoul')::date;
  ymd := to_char(COALESCE(NEW.created_at, now()) AT TIME ZONE 'Asia/Seoul', 'YYYYMMDD');

  PERFORM pg_advisory_xact_lock(hashtext('cf_member_seq_' || d::text));

  SELECT COALESCE(MAX(daily_sequence), 0) + 1 INTO next_seq
  FROM cf_membership_applications
  WHERE (created_at AT TIME ZONE 'Asia/Seoul')::date = d;

  IF next_seq > 9999 THEN
    RAISE EXCEPTION 'cf_membership_applications daily_sequence overflow for %: %', d, next_seq
      USING ERRCODE = 'check_violation';
  END IF;

  NEW.daily_sequence := next_seq;
  NEW.membership_no  := 'YD' || ymd || lpad(next_seq::text, 4, '0') || '-N';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ====================================================================
-- 3) 기존 default / 트리거 제거 + 새 트리거 부착
--    (기존 membership_no 자동 발급 메커니즘이 default 또는 다른 트리거로 있다면 수동 확인 필요)
-- ====================================================================

ALTER TABLE gf_membership_applications ALTER COLUMN membership_no DROP DEFAULT;
ALTER TABLE cf_membership_applications ALTER COLUMN membership_no DROP DEFAULT;

DROP TRIGGER IF EXISTS gf_membership_set_no ON gf_membership_applications;
CREATE TRIGGER gf_membership_set_no
  BEFORE INSERT ON gf_membership_applications
  FOR EACH ROW EXECUTE FUNCTION assign_gf_membership_no();

DROP TRIGGER IF EXISTS cf_membership_set_no ON cf_membership_applications;
CREATE TRIGGER cf_membership_set_no
  BEFORE INSERT ON cf_membership_applications
  FOR EACH ROW EXECUTE FUNCTION assign_cf_membership_no();


-- ====================================================================
-- 4) (선택) 기존 record 의 membership_no 도 새 포맷으로 덮어쓰기
--    membership_no 가 알림톡/외부 시스템 등에서 참조되고 있다면 영향 검토 후 실행
-- ====================================================================

-- 후불제상조
-- UPDATE gf_membership_applications g
-- SET membership_no = 'YD'
--   || to_char(g.created_at AT TIME ZONE 'Asia/Seoul', 'YYYYMMDD')
--   || lpad(g.daily_sequence::text, 4, '0')
--   || '-' || religion_to_code(g.religion);

-- 기업상조
-- UPDATE cf_membership_applications c
-- SET membership_no = 'YD'
--   || to_char(c.created_at AT TIME ZONE 'Asia/Seoul', 'YYYYMMDD')
--   || lpad(c.daily_sequence::text, 4, '0')
--   || '-N';


-- ====================================================================
-- 5) 검증 쿼리
-- ====================================================================

-- daily_sequence 백필 누락 확인
-- SELECT 'gf' AS t, COUNT(*) FILTER (WHERE daily_sequence IS NULL) AS missing, COUNT(*) AS total
-- FROM gf_membership_applications
-- UNION ALL
-- SELECT 'cf', COUNT(*) FILTER (WHERE daily_sequence IS NULL), COUNT(*)
-- FROM cf_membership_applications;

-- 새 포맷 INSERT 확인 (트리거 동작)
-- INSERT INTO gf_membership_applications (name, phone, birth_date, gender, religion, address, product, privacy_agreed)
-- VALUES ('테스트', '01000000000', '1990-01-01', '남', '기독교', '서울', 'PRODUCT_ID', true)
-- RETURNING membership_no, daily_sequence, created_at;
