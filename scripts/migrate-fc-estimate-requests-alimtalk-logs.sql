-- fc_estimate_requests 에 알림톡 발송 로그 추적 컬럼 추가
-- 5단계 [알림톡으로 전송 받기] 클릭 시 발송된 alimtalk_logs 매핑 정보를 함께 저장
-- 실행: Supabase SQL Editor

ALTER TABLE public.fc_estimate_requests
  ADD COLUMN IF NOT EXISTS alimtalk_logs JSONB;

COMMENT ON COLUMN public.fc_estimate_requests.alimtalk_logs IS
  '결과 알림톡(FC_RESULT) 발송 매핑. 수신자별 1개 항목: [{id, role, phone}]. role = customer | admin | dev_override';
