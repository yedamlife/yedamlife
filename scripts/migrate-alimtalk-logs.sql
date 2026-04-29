-- 알림톡 전송 내역 테이블
-- 모든 알림톡 발송 시도(성공/실패/폴백)를 한 줄씩 기록합니다.
-- 도메인(GF/CF/EC/FE/BP/PC/TEL) 별 원본 레코드는 source_table + source_id 로 추적합니다.

CREATE TABLE IF NOT EXISTS alimtalk_logs (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid(),

  -- 템플릿 정보
  template_code TEXT NOT NULL,        -- 예: YDMGFCONSULTV1
  template_name TEXT,                 -- 관리용 한글명 (예: 후불제상조_상담접수_v1)
  domain TEXT NOT NULL,               -- GF | CF | EC | FE | BP | PC | TEL | FC
  purpose TEXT NOT NULL,              -- CONSULT | MEMBER | ESTIMATE | RESERVE | CALL | RESULT

  -- 수신자
  recipient_phone TEXT NOT NULL,      -- 010-0000-0000 또는 01000000000
  recipient_role TEXT NOT NULL DEFAULT 'customer', -- customer | admin | dev_override

  -- 발송 본문/변수
  variables JSONB NOT NULL DEFAULT '{}'::jsonb,  -- #{변수명} → 값 매핑
  rendered_body TEXT,                            -- 변수 치환 후 본문 (감사용)

  -- 발송 결과
  status TEXT NOT NULL,               -- pending | success | failed | rejected | fallback_sms
  channel TEXT NOT NULL DEFAULT 'alimtalk', -- alimtalk | sms | lms
  vendor TEXT,                        -- 벤더 식별 (예: kakao, solapi, aligo)
  vendor_message_id TEXT,             -- 벤더 측 메시지 ID
  vendor_response JSONB,              -- 벤더 raw response
  error_code TEXT,
  error_message TEXT,

  -- 폴백 정보 (실패 시 SMS/LMS 자동 전환)
  fallback_of BIGINT REFERENCES alimtalk_logs(id) ON DELETE SET NULL,

  -- 원본 레코드 추적
  source_table TEXT,                  -- 예: gf_consultations, fe_reservations
  source_id BIGINT,                   -- 원본 레코드 PK

  -- 환경
  is_dev BOOLEAN NOT NULL DEFAULT false, -- 로컬/개발 환경 발송 여부

  -- 타임스탬프
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS alimtalk_logs_template_code_idx ON alimtalk_logs (template_code);
CREATE INDEX IF NOT EXISTS alimtalk_logs_domain_idx ON alimtalk_logs (domain);
CREATE INDEX IF NOT EXISTS alimtalk_logs_status_idx ON alimtalk_logs (status);
CREATE INDEX IF NOT EXISTS alimtalk_logs_recipient_phone_idx ON alimtalk_logs (recipient_phone);
CREATE INDEX IF NOT EXISTS alimtalk_logs_source_idx ON alimtalk_logs (source_table, source_id);
CREATE INDEX IF NOT EXISTS alimtalk_logs_created_at_idx ON alimtalk_logs (created_at DESC);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION set_alimtalk_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS alimtalk_logs_set_updated_at ON alimtalk_logs;
CREATE TRIGGER alimtalk_logs_set_updated_at
  BEFORE UPDATE ON alimtalk_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_alimtalk_logs_updated_at();

COMMENT ON TABLE alimtalk_logs IS '알림톡(및 SMS 폴백) 발송 내역';
COMMENT ON COLUMN alimtalk_logs.template_code IS '카카오 알림톡 템플릿 코드 (예: YDMGFCONSULTV1)';
COMMENT ON COLUMN alimtalk_logs.domain IS 'GF/CF/EC/FE/BP/PC/TEL/FC';
COMMENT ON COLUMN alimtalk_logs.status IS 'pending | success | failed | rejected | fallback_sms';
COMMENT ON COLUMN alimtalk_logs.channel IS 'alimtalk | sms | lms';
COMMENT ON COLUMN alimtalk_logs.recipient_role IS 'customer(고객) | admin(관리자) | dev_override(개발 환경 단일 수신자)';
COMMENT ON COLUMN alimtalk_logs.fallback_of IS 'SMS 폴백 발송인 경우 원본 알림톡 로그 id';
COMMENT ON COLUMN alimtalk_logs.source_table IS '원본 폼/접수 레코드 테이블명';
COMMENT ON COLUMN alimtalk_logs.source_id IS '원본 폼/접수 레코드 PK';
