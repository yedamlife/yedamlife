-- 모든 운영 테이블에 soft delete용 deleted_at 컬럼 추가
-- 실행: Supabase SQL Editor에서 전체 실행

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'admin_users',
    'alimtalk_logs',
    'bp_consultation_requests',
    'bp_products',
    'cf_consultation_requests',
    'cf_membership_applications',
    'corporate_proposal_requests',
    'ec_estimate_requests',
    'fe_reservation_requests',
    'funeral_halls',
    'gf_consultation_requests',
    'gf_direct_requests',
    'gf_membership_applications',
    'membership_card_requests',
    'notices',
    'pc_consultation_requests',
    'reviews'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ',
      t
    );
    -- 살아있는 행만 인덱싱하는 partial index (조회 성능 + 인덱스 크기 최소화)
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON public.%I (deleted_at) WHERE deleted_at IS NULL',
      'idx_' || t || '_active',
      t
    );
  END LOOP;
END $$;
