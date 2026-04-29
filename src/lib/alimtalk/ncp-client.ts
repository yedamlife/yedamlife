// NCP SENS 카카오 알림톡 어댑터
// 벤더 교체 시 이 파일만 수정

import crypto from 'crypto';

const NCP_HOST = 'https://sens.apigw.ntruss.com';

export interface SendArgs {
  serviceId: string;
  accessKey: string;
  secretKey: string;
  plusFriendId: string;
  templateCode: string;
  recipients: string[];
  content: string;
}

export interface SendResult {
  ok: boolean;
  status?: number;
  error?: string;
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

  const body = {
    plusFriendId,
    templateCode,
    messages: recipients.map((to) => ({
      to,
      content,
      countryCode: '82',
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
