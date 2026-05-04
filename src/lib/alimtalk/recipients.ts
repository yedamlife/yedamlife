// 알림톡 수신자 결정 로직
// docs/알림톡/readme.md 4. 발송 수신자 관리 참고

import type { TemplateKey } from './templates';

// localhost(dev 환경) 발송 대상 번호 목록
const DEV_PHONES = ['01091622508']; //'01062704860', '01063300959'];
const DEFAULT_ADMINS = ['01062704860', '01063300959'];
const EC_ADMIN_EXTRA = '01040898272';

export function isDevEnv(host?: string | null): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  if (!host) return false;
  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}

export function normalizePhone(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/\D/g, '');
}

interface Args {
  template: TemplateKey;
  customerPhone?: string | null;
  host?: string | null;
}

export function resolveRecipients({
  template,
  customerPhone,
  host,
}: Args): string[] {
  if (isDevEnv(host)) return [...DEV_PHONES];

  const admins =
    template === 'EC_ESTIMATE'
      ? [...DEFAULT_ADMINS, EC_ADMIN_EXTRA]
      : DEFAULT_ADMINS;

  // 관리자 전용 템플릿 (전화 클릭 알림 등)
  if (template === 'TEL_CALL') return admins;

  const normalized = normalizePhone(customerPhone);
  if (!normalized) return admins;

  // 중복 제거
  return Array.from(new Set([normalized, ...admins]));
}
