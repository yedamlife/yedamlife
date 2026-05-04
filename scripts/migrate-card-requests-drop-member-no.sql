-- membership_card_requests: 회원번호 컬럼 제거
-- 회원번호는 이제 매칭된 gf/cf_membership_applications.membership_no 에서 가져온다.
-- 어플리케이션 코드(card-request POST, admin 라우트, certificate 결과 페이지)도 동시에 정리되어야 함.

ALTER TABLE membership_card_requests DROP COLUMN IF EXISTS member_no;
ALTER TABLE membership_card_requests DROP COLUMN IF EXISTS matched_member_no;
