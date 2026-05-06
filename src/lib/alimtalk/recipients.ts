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

export interface ResolvedRecipient {
  phone: string;
  role: 'customer' | 'admin';
}

// 운영 환경 기준 (template 의도) 으로 수신자·role 을 결정
function buildProdRecipients(
  template: TemplateKey,
  normalizedCustomer: string,
  admins: string[],
): ResolvedRecipient[] {
  // 관리자 전용 템플릿 (전화 클릭 알림 등)
  if (template === 'TEL_CALL') {
    return admins.map((phone) => ({ phone, role: 'admin' }));
  }
  // 고객 전용 템플릿 — 관리자 미발송
  if (template === 'FC_RESULT') {
    return normalizedCustomer
      ? [{ phone: normalizedCustomer, role: 'customer' }]
      : [];
  }

  const list: ResolvedRecipient[] = [];
  if (normalizedCustomer) {
    list.push({ phone: normalizedCustomer, role: 'customer' });
  }
  list.push(...admins.map((phone) => ({ phone, role: 'admin' as const })));
  return list;
}

export function resolveRecipients({
  template,
  customerPhone,
  host,
}: Args): ResolvedRecipient[] {
  const admins =
    template === 'EC_ESTIMATE'
      ? [...DEFAULT_ADMINS, EC_ADMIN_EXTRA]
      : DEFAULT_ADMINS;
  const normalized = normalizePhone(customerPhone);
  const prodList = buildProdRecipients(template, normalized, admins);

  if (!isDevEnv(host)) {
    // 운영: 동일 phone 중복 제거 (역할이 다른 경우 customer 우선)
    const byPhone = new Map<string, ResolvedRecipient>();
    for (const r of prodList) {
      const existing = byPhone.get(r.phone);
      if (!existing || (existing.role === 'admin' && r.role === 'customer')) {
        byPhone.set(r.phone, r);
      }
    }
    return Array.from(byPhone.values());
  }

  // 개발 환경: DEV_PHONES 로 라우팅하되 의도된 role 은 그대로 유지.
  // (phone, role) 기준 중복 제거 — 같은 의도 중복 발송 방지.
  const out: ResolvedRecipient[] = [];
  const seen = new Set<string>();
  for (const r of prodList) {
    for (const dp of DEV_PHONES) {
      const key = `${dp}|${r.role}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ phone: dp, role: r.role });
    }
  }
  return out;
}
