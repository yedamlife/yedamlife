-- 후기 태그 컬럼 추가
-- 태그는 자유 입력형 문자열 배열 (예: ['친절', '신속한 대응', '가격 합리적'])

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS reviews_tags_gin_idx ON reviews USING GIN (tags);
