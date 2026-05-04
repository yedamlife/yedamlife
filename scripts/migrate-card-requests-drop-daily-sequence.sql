-- membership_card_requests: daily_sequence 관련 설정 전부 제거
-- 회원번호의 일별 순번은 이제 gf/cf_membership_applications 테이블에서 발급되며,
-- card_requests 자체에는 daily_sequence 가 더 이상 필요 없음.

DROP TRIGGER IF EXISTS membership_card_requests_set_daily_sequence ON membership_card_requests;
DROP FUNCTION IF EXISTS assign_card_request_daily_sequence();
DROP INDEX IF EXISTS membership_card_requests_kst_seq_uniq;
ALTER TABLE membership_card_requests DROP COLUMN IF EXISTS daily_sequence;
