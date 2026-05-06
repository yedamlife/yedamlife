// 카카오 알림톡 템플릿 정의
// 본문은 NCP/카카오 비즈센터에 등록된 템플릿과 1:1로 일치해야 함 (변경 시 V2로 신규 등록)
// docs/알림톡/readme.md 참고

import type { AlimtalkButton } from './ncp-client';

export const TEMPLATES = {
  GF_CONSULT: 'YDMGFCONSULTV1',
  CF_CONSULT: 'YDMCFCONSULTV1',
  EC_ESTIMATE: 'YDMECESTIMATEV1',
  FE_RESERVE: 'YDMFERESERVEV1',
  BP_CONSULT: 'YDMBPCONSULTV1',
  PC_CONSULT: 'YDMPCCONSULTV1',
  GF_MEMBER: 'YDMGFMEMBERV1',
  CF_MEMBER: 'YDMCFMEMBERV2',
  FC_RESULT: 'YEDAMFCRESULTV2',
  FC_CONSULT: 'YDMFCCONSULTV1',
  TEL_CALL: 'YDMTELCALLV1',
} as const;

export type TemplateKey = keyof typeof TEMPLATES;

// 관리용 한글명 (alimtalk_logs.template_name에 기록)
export const TEMPLATE_NAMES: Record<TemplateKey, string> = {
  GF_CONSULT: '후불제상조_상담접수_v1',
  CF_CONSULT: '기업상조_상담접수_v1',
  EC_ESTIMATE: '유품정리_견적상담_v1',
  FE_RESERVE: '운구의전_간편예약_v1',
  BP_CONSULT: '장지_상담신청_v1',
  PC_CONSULT: '사후행정케어_무료상담_v1',
  GF_MEMBER: '후불제상조_멤버십신청_v1',
  CF_MEMBER: '기업상조_멤버십신청_v2',
  FC_RESULT: '장례비용결과안내_v2',
  FC_CONSULT: '장례비용_상담신청_v1',
  TEL_CALL: '전화상담_클릭알림_v1',
};

// 템플릿키 → 도메인/용도 (alimtalk_logs.domain / .purpose)
export function parseTemplateKey(key: TemplateKey): {
  domain: string;
  purpose: string;
} {
  const [domain, ...rest] = key.split('_');
  return { domain, purpose: rest.join('_') };
}

type Vars = Record<string, string | number | undefined | null>;

const v = (val: Vars[string]) => {
  if (val === null || val === undefined) return '-';
  const s = String(val).trim();
  return s === '' ? '-' : s;
};

export const TEMPLATE_BUILDERS: Record<TemplateKey, (vars: Vars) => string> = {
  GF_CONSULT: (x) =>
    `[예담라이프] 후불제 상조 상담 신청 접수

${v(x.고객명)}님, 후불제 상조 상담 신청이 정상 접수되었습니다.

■ 상품: ${v(x.상품)}
■ 이름: ${v(x.고객명)}
■ 연락처: ${v(x.연락처)}
■ 지역: ${v(x.지역)}
■ 상담 희망 시간: ${v(x.상담시간)}`,

  CF_CONSULT: (x) =>
    `[예담라이프] 기업 상조 상담 신청 접수

${v(x.고객명)}님, 기업 상조 상담 신청이 정상 접수되었습니다.

■ 상품: ${v(x.상품)}
■ 이름: ${v(x.고객명)}
■ 연락처: ${v(x.연락처)}
■ 지역: ${v(x.지역)}
■ 상담 희망 시간: ${v(x.상담시간)}`,

  EC_ESTIMATE: (x) =>
    `[예담라이프] 유품정리 견적 상담 접수

${v(x.고객명)}님, 유품정리 견적 상담이 정상 접수되었습니다.

■ 성함: ${v(x.고객명)}
■ 연락처: ${v(x.연락처)}
■ 주소: ${v(x.주소)} ${v(x.상세주소)}
■ 서비스 종류: ${v(x.서비스종류)}
■ 평수: ${v(x.평수)}
■ 층: ${v(x.층)}
■ 주거형태: ${v(x.주거형태)}
■ 방문 희망일: ${v(x.방문희망일)}`,

  FE_RESERVE: (x) =>
    `[예담라이프] 운구의전 간편 예약 접수

${v(x.작성자)}님, 운구의전 예약이 정상 접수되었습니다.

■ 작성자: ${v(x.작성자)} / ${v(x.작성자연락처)}
■ 고인: ${v(x.고인명)} (${v(x.고인성별)})
■ 장례식장: ${v(x.장례식장)}
■ 장례식장 주소: ${v(x.장례식장주소)}
■ 호실: ${v(x.호실)}
■ 발인: ${v(x.발인일)} ${v(x.발인시)}시 ${v(x.발인분)}분
■ 장례 방법: ${v(x.장례방법)}
■ 도착지: ${v(x.도착지주소)} ${v(x.도착지상세)}
■ 복장: ${v(x.복장)}
■ 운구 인원: ${v(x.인원)}명`,

  BP_CONSULT: (x) =>
    `[예담라이프] 장지 상담 신청 접수

${v(x.고객명)}님, 장지 상담 신청이 정상 접수되었습니다.

■ 선택 장지: ${v(x.선택장지)}
■ 이름: ${v(x.고객명)}
■ 연락처: ${v(x.연락처)}
■ 종교: ${v(x.종교)}
■ 희망 지역: ${v(x.시도)} ${v(x.시구군)}
■ 예산: ${v(x.예산)}
■ 메시지: ${v(x.메시지)}`,

  PC_CONSULT: (x) =>
    `[예담라이프] 사후 행정 케어 무료 상담 접수

${v(x.고객명)}님, 사후 행정 케어 무료 상담이 정상 접수되었습니다.

■ 성함: ${v(x.고객명)}
■ 연락처: ${v(x.연락처)}
■ 지역: ${v(x.시도)} ${v(x.시구군)}
■ 상담 유형: ${v(x.상담유형)}
■ 상담 내용: ${v(x.상담내용)}`,

  GF_MEMBER: (x) =>
    `[예담라이프] 후불제 상조 멤버십 신청 접수

${v(x.고객명)}님, 후불제 상조 멤버십 신청이 정상 접수되었습니다.

■ 이름: ${v(x.고객명)}
■ 연락처: ${v(x.연락처)}
■ 생년월일: ${v(x.생년월일)}
■ 성별: ${v(x.성별)}
■ 종교: ${v(x.종교)}
■ 보호자: ${v(x.보호자명)} (${v(x.보호자관계)}) ${v(x.보호자연락처)}
■ 주소: ${v(x.주소)} ${v(x.상세주소)}
■ 상품: ${v(x.상품)}
■ 추천인: ${v(x.추천인)}`,

  CF_MEMBER: (x) =>
    `[예담라이프] 기업 상조 멤버십 신청 접수

${v(x.신청인)}님, 기업 상조 멤버십 신청이 정상 접수되었습니다.

■ 신청인: ${v(x.신청인)}
■ 휴대폰: ${v(x.휴대폰)}
■ 기업명: ${v(x.기업명)}
■ 직급: ${v(x.직급)}
■ 담당자 이메일: ${v(x.담당자이메일)}
■ 추천인: ${v(x.추천인)}
■ 기타 요구사항: ${v(x.기타요구사항)}`,

  FC_RESULT: (x) =>
    `[예담라이프] 장례비용 예상 결과

안녕하세요, ${v(x.이름)} 님!
요청하신 장례비용 예상 결과가 준비되었습니다.
`,

  FC_CONSULT: (x) =>
    `[예담라이프] 장례비용 상담 신청 접수

${v(x.고객명)}님, 예담라이프 상품 상담 신청이 정상 접수되었습니다.
빠른 시일 내에 담당자가 연락드리겠습니다.

■ 신청 상품: ${v(x.상품)}
■ 이름: ${v(x.고객명)}
■ 연락처: ${v(x.연락처)}
■ 장례식장: ${v(x.장례식장)}
■ 빈소 규모: ${v(x.규모)}
■ 예상 장례비용: ${v(x.예상비용)}`,

  TEL_CALL: (x) =>
    `[예담라이프] 전화 상담 버튼 클릭

■ 경로: ${v(x.경로)}
■ 페이지 URL: ${v(x.URL)}
■ 전화번호: ${v(x.전화번호)}
■ 발생 시각: ${v(x.접수일시)}

고객이 전화 상담 버튼을 눌렀습니다.`,
};

// 알림톡 발송 실패 시 NCP 가 자동 폴백할 SMS 본문 빌더.
// - 등록된 템플릿만 SMS 폴백 동작 (없으면 SMS 미발송)
// - 알림톡 버튼은 SMS 로 변환되지 않으므로, URL 등 행동 유도 정보를 본문 텍스트로 직접 포함
export const TEMPLATE_SMS_BUILDERS: Partial<
  Record<TemplateKey, (vars: Vars) => string>
> = {
  GF_MEMBER: (x) =>
    `[예담라이프] ${v(x.고객명)}님 후불제 상조 멤버십 신청이 접수되었습니다.

가입증서 보기: ${v(x.가입증서URL)}`,

  CF_MEMBER: (x) =>
    `[예담라이프] ${v(x.신청인)}님 기업 상조 멤버십 신청이 접수되었습니다.

가입증서 보기: ${v(x.가입증서URL)}`,

  FC_RESULT: (x) =>
    `[예담라이프] ${v(x.이름)}님의 장례비용 결과가 준비되었습니다.
결과 링크: ${v(x.결과URL)}`,

  FC_CONSULT: (x) =>
    `[예담라이프] ${v(x.고객명)}님 장례비용 상담 신청이 접수되었습니다.
신청 상품: ${v(x.상품)} / 예상비용: ${v(x.예상비용)}
결과 링크: ${v(x.결과URL)}`,
};

// 템플릿 버튼 빌더 (NCP SENS 비즈센터 등록 버튼과 동일하게 보내야 검수 통과)
// vars 의 변수를 치환한 최종 URL/이름을 반환. 등록된 버튼이 없는 템플릿은 생략.
export const TEMPLATE_BUTTON_BUILDERS: Partial<
  Record<TemplateKey, (vars: Vars) => AlimtalkButton[]>
> = {
  FC_RESULT: (x) => {
    const url = `https://yedamlife.com/funeral-cost/result/${v(x.uuid)}`;
    return [
      {
        type: 'WL',
        name: '결과 확인하기',
        linkMobile: url,
        linkPc: url,
      },
    ];
  },
};
