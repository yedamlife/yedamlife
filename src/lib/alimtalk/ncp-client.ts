// NCP SENS 카카오 알림톡 어댑터
// 벤더 교체 시 이 파일만 수정

import crypto from 'crypto';

const NCP_HOST = 'https://sens.apigw.ntruss.com';

/** NCP SENS 알림톡 버튼. type 코드:
 * - WL: 웹링크
 * - AL: 앱링크
 * - DS: 배송조회
 * - BK: 봇키워드
 * - MD: 메시지전달
 */
export interface AlimtalkButton {
  type: 'WL' | 'AL' | 'DS' | 'BK' | 'MD';
  name: string;
  linkMobile?: string;
  linkPc?: string;
  schemeIos?: string;
  schemeAndroid?: string;
}

export interface SendArgs {
  serviceId: string;
  accessKey: string;
  secretKey: string;
  plusFriendId: string;
  templateCode: string;
  recipients: string[];
  content: string;
  /** 템플릿에 등록된 버튼들 (변수 치환된 최종 형태). 없으면 미전송. */
  buttons?: AlimtalkButton[];
  /** 알림톡 발송 실패 시 NCP 가 자동 폴백할 SMS/LMS 본문. 없으면 폴백 안 함. */
  smsContent?: string | null;
  /** SMS 발신번호 (NCP 콘솔에 사전 등록된 번호) */
  smsFrom?: string | null;
}

export interface SendLogEntry {
  id: number;
  role: 'customer' | 'admin';
  phone: string;
}

export interface SendResult {
  ok: boolean;
  status?: number;
  error?: string;
  /** alimtalk_logs 에 기록된 항목들 (수신자 수만큼). 발송 시도가 기록된 경우에만 채워짐. */
  logEntries?: SendLogEntry[];
}

export async function sendNcpAlimtalk(args: SendArgs): Promise<SendResult> {
  const {
    serviceId,
    accessKey,
    secretKey,
    plusFriendId,
    templateCode,
    recipients,
    content,
    buttons,
    smsContent,
    smsFrom,
  } = args;

  const path = `/alimtalk/v2/services/${encodeURIComponent(serviceId)}/messages`;
  const url = `${NCP_HOST}${path}`;
  const timestamp = Date.now().toString();
  const signature = makeSignature({
    method: 'POST',
    path,
    timestamp,
    accessKey,
    secretKey,
  });

  // SMS 폴백: smsContent 와 smsFrom 둘 다 있을 때만 활성화
  // type 은 NCP 의 byte 환산(EUC-KR 기준 한글 2바이트) 90 초과 시 LMS
  const useFailover = !!(smsContent && smsFrom);
  const failoverType =
    smsContent && Buffer.byteLength(smsContent, 'utf8') > 90 ? 'LMS' : 'SMS';

  const body = {
    plusFriendId,
    templateCode,
    messages: recipients.map((to) => ({
      to,
      content,
      countryCode: '82',
      ...(buttons && buttons.length > 0 && { buttons }),
      ...(useFailover && {
        useSmsFailover: true,
        failoverConfig: {
          type: failoverType,
          from: smsFrom!,
          content: smsContent!,
        },
      }),
    })),
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': accessKey,
        'x-ncp-apigw-signature-v2': signature,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, status: res.status, error: text };
    }
    return { ok: true, status: res.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function makeSignature({
  method,
  path,
  timestamp,
  accessKey,
  secretKey,
}: {
  method: string;
  path: string;
  timestamp: string;
  accessKey: string;
  secretKey: string;
}): string {
  const space = ' ';
  const newLine = '\n';
  const message =
    method + space + path + newLine + timestamp + newLine + accessKey;
  return crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('base64');
}
