-- 공지사항 카테고리 컬럼 추가
-- 카테고리: 공지 / 이벤트 / 안내 / 보도자료

ALTER TABLE notices
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '공지';

ALTER TABLE notices
  DROP CONSTRAINT IF EXISTS notices_category_check;

ALTER TABLE notices
  ADD CONSTRAINT notices_category_check
  CHECK (category IN ('공지', '이벤트', '안내', '보도자료'));

CREATE INDEX IF NOT EXISTS notices_category_idx ON notices (category);
