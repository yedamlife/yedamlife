-- 후불제/기업 가입 신청 테이블에 외부 노출용 uuid 컬럼 추가
-- 가입증서 URL을 정수 id 대신 uuid로 사용하기 위함
-- 실행: Supabase SQL Editor

-- 1) 후불제상조
ALTER TABLE public.gf_membership_applications
  ADD COLUMN IF NOT EXISTS uuid UUID NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS gf_membership_applications_uuid_key
  ON public.gf_membership_applications (uuid);

-- 2) 기업상조
ALTER TABLE public.cf_membership_applications
  ADD COLUMN IF NOT EXISTS uuid UUID NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS cf_membership_applications_uuid_key
  ON public.cf_membership_applications (uuid);
