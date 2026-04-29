// 알림톡 발송 오케스트레이션
// 외부에선 sendAlimtalk 만 사용

import { supabase } from '@/lib/supabase';
import {
  TEMPLATES,
  TEMPLATE_BUILDERS,
  TEMPLATE_NAMES,
  parseTemplateKey,
  type TemplateKey,
} from './templates';
import { isDevEnv, resolveRecipients } from './recipients';
import { sendNcpAlimtalk, type SendResult } from './ncp-client';

export interface SendOpts {
  /** 신청자 본인 휴대폰. TEL_CALL 처럼 관리자 전용 템플릿이면 생략 */
  customerPhone?: string | null;
  /** 요청의 host 헤더 (로컬/운영 판별용). API route에서 `request.headers.get('host')` 전달 */
  host?: string | null;
  /** 원본 폼/접수 레코드 추적 (alimtalk_logs.source_table / source_id) */
  source?: { table: string; id: number | string } | null;
}

type Vars = Record<string, string | number | undefined | null>;

interface LogInsertRow {
  template_code: string;
  template_name: string;
  domain: string;
  purpose: string;
  recipient_phone: string;
  recipient_role: 'customer' | 'admin' | 'dev_override';
  variables: Vars;
  rendered_body: string;
  status: 'pending' | 'success' | 'failed' | 'skipped';
  channel: 'alimtalk';
  vendor: 'ncp_sens';
  vendor_response?: unknown;
  error_code?: string | null;
  error_message?: string | null;
  source_table?: string | null;
  source_id?: number | null;
  is_dev: boolean;
  requested_at: string;
  sent_at?: string | null;
}

function recipientRole(
  phone: string,
  customerPhone: string | null | undefined,
  isDev: boolean,
): LogInsertRow['recipient_role'] {
  if (isDev) return 'dev_override';
  const normCustomer = (customerPhone ?? '').replace(/\D/g, '');
  return normCustomer && phone === normCustomer ? 'customer' : 'admin';
}

async function logRows(rows: LogInsertRow[]): Promise<number[]> {
  if (rows.length === 0) return [];
  try {
    const { data, error } = await supabase
      .from('alimtalk_logs')
      .insert(rows)
      .select('id');
    if (error) {
      console.error('[alimtalk] log insert failed', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        firstRow: rows[0],
      });
      return [];
    }
    const ids = (data ?? []).map((r) => r.id as number);
    console.log('[alimtalk] log inserted', { ids, rows: rows.length });
    return ids;
  } catch (e) {
    console.error('[alimtalk] log insert exception', e);
    return [];
  }
}

export async function sendAlimtalk(
  templateKey: TemplateKey,
  vars: Vars,
  opts: SendOpts = {},
): Promise<SendResult> {
  const requestedAt = new Date().toISOString();
  const isDev = isDevEnv(opts.host);
  const { domain, purpose } = parseTemplateKey(templateKey);
  const templateCode = TEMPLATES[templateKey];
  const templateName = TEMPLATE_NAMES[templateKey];
  const content = TEMPLATE_BUILDERS[templateKey](vars);
  const sourceId =
    opts.source?.id != null ? Number(opts.source.id) : null;
  const sourceTable = opts.source?.table ?? null;

  const baseRow = {
    template_code: templateCode,
    template_name: templateName,
    domain,
    purpose,
    variables: vars,
    rendered_body: content,
    channel: 'alimtalk' as const,
    vendor: 'ncp_sens' as const,
    source_table: sourceTable,
    source_id: sourceId,
    is_dev: isDev,
    requested_at: requestedAt,
  };

  const accessKey = process.env.NCP_SENS_ACCESS_KEY;
  const secretKey = process.env.NCP_SENS_SECRET_KEY;
  const serviceId = process.env.NCP_SENS_SERVICE_ID;
  const plusFriendId = process.env.NCP_SENS_PLUS_FRIEND_ID;

  // env 누락 → 시도 자체를 skipped로 기록
  if (!accessKey || !secretKey || !serviceId || !plusFriendId) {
    console.warn(
      '[alimtalk] NCP env vars not set, skipping send',
      templateKey,
    );
    await logRows([
      {
        ...baseRow,
        recipient_phone: '',
        recipient_role: isDev ? 'dev_override' : 'admin',
        status: 'skipped',
        error_message: 'env_not_set',
      },
    ]);
    return { ok: false, error: 'env_not_set' };
  }

  const recipients = resolveRecipients({
    template: templateKey,
    customerPhone: opts.customerPhone,
    host: opts.host,
  });

  // 수신자 없음 → skipped 기록
  if (recipients.length === 0) {
    await logRows([
      {
        ...baseRow,
        recipient_phone: '',
        recipient_role: isDev ? 'dev_override' : 'admin',
        status: 'skipped',
        error_message: 'no_recipients',
      },
    ]);
    return { ok: false, error: 'no_recipients' };
  }

  // 1) pending 로그 선기록
  const pendingRows: LogInsertRow[] = recipients.map((phone) => ({
    ...baseRow,
    recipient_phone: phone,
    recipient_role: recipientRole(phone, opts.customerPhone, isDev),
    status: 'pending',
  }));
  const insertedIds = await logRows(pendingRows);

  // 2) 실제 발송
  const result = await sendNcpAlimtalk({
    serviceId,
    accessKey,
    secretKey,
    plusFriendId,
    templateCode,
    recipients,
    content,
  });

  // 3) 결과 update
  if (insertedIds.length > 0) {
    try {
      const sentAt = new Date().toISOString();
      const updatePayload = result.ok
        ? {
            status: 'success' as const,
            sent_at: sentAt,
            vendor_response: { status: result.status },
          }
        : {
            status: 'failed' as const,
            sent_at: sentAt,
            error_code: result.status ? String(result.status) : null,
            error_message: result.error ?? null,
            vendor_response: { status: result.status, error: result.error },
          };
      const { error } = await supabase
        .from('alimtalk_logs')
        .update(updatePayload)
        .in('id', insertedIds);
      if (error) {
        console.error('[alimtalk] log update failed', error);
      }
    } catch (e) {
      console.error('[alimtalk] log update exception', e);
    }
  }

  if (!result.ok) {
    console.error('[alimtalk] send failed', {
      template: templateKey,
      recipients,
      error: result.error,
      status: result.status,
    });
  } else {
    console.log('[alimtalk] sent', { template: templateKey, recipients });
  }
  return result;
}
