-- fc_estimate_requests 에 어드민 운영 컬럼 추가
-- 실행: Supabase SQL Editor

ALTER TABLE public.fc_estimate_requests
  ADD COLUMN IF NOT EXISTS admin_note TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

COMMENT ON COLUMN public.fc_estimate_requests.admin_note IS '어드민 운영 메모';
COMMENT ON COLUMN public.fc_estimate_requests.updated_at IS '어드민 수정 시각';
