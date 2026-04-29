// 카카오 알림톡 템플릿 정의
// 본문은 NCP/카카오 비즈센터에 등록된 템플릿과 1:1로 일치해야 함 (변경 시 V2로 신규 등록)
// docs/알림톡/readme.md 참고

export const TEMPLATES = {
  GF_CONSULT: 'YDMGFCONSULTV1',
  CF_CONSULT: 'YDMCFCONSULTV1',
  EC_ESTIMATE: 'YDMECESTIMATEV1',
  FE_RESERVE: 'YDMFERESERVEV1',
  BP_CONSULT: 'YDMBPCONSULTV1',
  PC_CONSULT: 'YDMPCCONSULTV1',
  GF_MEMBER: 'YDMGFMEMBERV1',
  CF_MEMBER: 'YDMCFMEMBERV1',
  FC_RESULT: 'YEDAMFCRESULTV1',
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
  CF_MEMBER: '기업상조_멤버십신청_v1',
  FC_RESULT: '장례비용결과안내',
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
■ 주소: ${v(x.주소)} ${v(x.상세주소)}
■ 가입상품: ${v(x.가입상품)}
■ 추천인: ${v(x.추천인)}`,

  FC_RESULT: (x) =>
    `[예담라이프] 장례비용 예상 결과

안녕하세요, ${v(x.이름)} 님!
요청하신 장례비용 예상 결과가 준비되었습니다.
${v(x.이름)}님 만을 위한 특별 혜택과 함께 결과를 확인해보세요.`,

  TEL_CALL: (x) =>
    `[예담라이프] 전화 상담 버튼 클릭

■ 경로: ${v(x.경로)}
■ 페이지 URL: ${v(x.URL)}
■ 전화번호: ${v(x.전화번호)}
■ 발생 시각: ${v(x.접수일시)}

고객이 전화 상담 버튼을 눌렀습니다.`,
};
