'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Consultation {
  id: number;
  selected_product_id: string;
  selected_product_name: string;
  consult_status: string;
  created_at: string;
}

interface AlimtalkLog {
  id: number;
  template_code: string;
  status: 'pending' | 'success' | 'failed' | 'skipped';
  channel: string;
  error_code: string | null;
  error_message: string | null;
  requested_at: string;
  sent_at: string | null;
}

interface EstimateRequest {
  id: number;
  uuid: string;
  name: string;
  phone: string;
  age_group: string | null;
  funeral_type: '3day' | 'nobinso';
  current_situation: string | null;
  sido_cd: string | null;
  gungu_cd: string | null;
  facility_cd: string | null;
  selected_size: string | null;
  guest_count: number | null;
  input_json: Record<string, unknown> | null;
  admin_note: string | null;
  created_at: string;
  consultations: Consultation[];
  alimtalk_log: AlimtalkLog | null;
  sido_name: string | null;
  gungu_name: string | null;
  hall: {
    facility_cd: string;
    company_name: string;
    full_address: string;
  } | null;
}

const FUNERAL_TYPE_LABELS: Record<string, string> = {
  '3day': '3일장',
  nobinso: '무빈소',
};

const SITUATION_LABELS: Record<string, string> = {
  preparing: '급하지 않지만 미리 알아보려고 해요.',
  within_month: '1주에서 한 달 정도 기간이 남은 것 같아요.',
  within_days: '임종이 며칠 남지 않았어요.',
  after: '임종하신 상태입니다.',
};

const SIZE_LABELS: Record<string, string> = {
  small: '소형',
  medium: '중형',
  large: '대형',
  premium: '프리미엄',
  vip: 'VIP',
};

const CONSULT_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: '대기', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  contacted: { label: '연락완료', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  closed_won: { label: '계약', className: 'bg-green-50 text-green-700 border-green-200' },
  closed_lost: { label: '실패', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

function formatDateTime(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-1.5 text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{children}</dd>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const apiPath = '/api/v1/admin/general-funeral/estimate-requests';
  const backHref = '/admin/general-funeral/estimate-requests';

  const [data, setData] = useState<EstimateRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState('');
  const [savedNote, setSavedNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${apiPath}/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
          const note = json.data.admin_note ?? '';
          setAdminNote(note);
          setSavedNote(note);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const noteChanged = adminNote !== savedNote;

  const handleSaveNote = async () => {
    if (!noteChanged) return;
    setSaving(true);
    const res = await fetch(`${apiPath}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_note: adminNote }),
    });
    if (res.ok) {
      setSavedNote(adminNote);
      toast.success('메모가 저장되었습니다.');
    } else {
      toast.error('저장에 실패했습니다.');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`${apiPath}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('삭제되었습니다.');
      router.push(backHref);
    } else {
      toast.error('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-400">로딩 중...</div>;
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        데이터를 찾을 수 없습니다.
      </div>
    );
  }

  const resultUrl = `/funeral-cost/result/${data.uuid}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(backHref)}>
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-xl font-bold text-gray-900">장례비용 전송 내역 상세</h2>
        </div>
        <Button
          variant="outline"
          onClick={handleDelete}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="size-4" />
          삭제
        </Button>
      </div>

      {/* 신청자 정보 */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">신청자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-3">
            <InfoRow label="이름">{data.name}</InfoRow>
            <InfoRow label="연락처">{data.phone}</InfoRow>
            <InfoRow label="연령대">{data.age_group ?? '-'}</InfoRow>
            <InfoRow label="장례 형태">
              {FUNERAL_TYPE_LABELS[data.funeral_type] ?? data.funeral_type}
            </InfoRow>
            <InfoRow label="현재 상황">
              {data.current_situation
                ? SITUATION_LABELS[data.current_situation] ?? data.current_situation
                : '-'}
            </InfoRow>
            <InfoRow label="접수일">{formatDateTime(data.created_at)}</InfoRow>
          </dl>
        </CardContent>
      </Card>

      {/* 장례식장 정보 */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">장례식장 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-3">
            <InfoRow label="시도">{data.sido_name ?? '-'}</InfoRow>
            <InfoRow label="시군구">{data.gungu_name ?? '-'}</InfoRow>
            <InfoRow label="장례식장명">
              {data.hall?.company_name ?? '-'}
            </InfoRow>
            <InfoRow label="규모">
              {data.selected_size
                ? SIZE_LABELS[data.selected_size] ?? data.selected_size
                : '-'}
            </InfoRow>
            <InfoRow label="예상 조문객">
              {data.guest_count != null ? `${data.guest_count}명` : '-'}
            </InfoRow>
            {data.hall?.full_address && (
              <div className="md:col-span-3">
                <dt className="mb-1.5 text-sm font-medium text-gray-500">
                  장례식장 주소
                </dt>
                <dd className="text-sm text-gray-900">{data.hall.full_address}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* 결과 정보 */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">결과 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-5">
            <div>
              <dt className="mb-1.5 text-sm font-medium text-gray-500">결과 URL</dt>
              <dd>
                <Link
                  href={resultUrl}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 break-all rounded-lg bg-gray-50 px-3 py-2 font-mono text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  {resultUrl}
                  <ExternalLink className="size-3.5 shrink-0" />
                </Link>
              </dd>
            </div>
            {(() => {
              const log = data.alimtalk_log;
              const kakaoSuccess = log?.status === 'success';
              const kakaoFailed =
                log?.status === 'failed' || log?.status === 'skipped';

              // SMS 폴백: NCP 콘솔에서 카카오 발송 실패 시 SMS 자동 전송 (FC_RESULT 템플릿은 SMS 빌더 존재)
              // - 카카오 success → 폴백 불필요 ('-')
              // - 카카오 failed → SMS 폴백 시도됨 (Y)
              // - 카카오 skipped → 발송 자체 안 됨 (N)
              const smsLabel = !log
                ? '발송 시도 기록 없음'
                : kakaoSuccess
                  ? '-'
                  : log.status === 'failed'
                    ? 'Y (카카오 실패 → SMS 폴백)'
                    : 'N';
              const smsBadgeClass = !log
                ? 'bg-gray-100 text-gray-500 border-gray-200'
                : kakaoSuccess
                  ? 'bg-gray-100 text-gray-500 border-gray-200'
                  : log.status === 'failed'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-red-50 text-red-700 border-red-200';

              return (
                <>
                  <div>
                    <dt className="mb-1.5 text-sm font-medium text-gray-500">
                      카카오톡 전송 성공 여부
                    </dt>
                    <dd>
                      {!log ? (
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                          발송 시도 기록 없음
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            kakaoSuccess
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-red-200 bg-red-50 text-red-700'
                          }`}
                        >
                          {kakaoSuccess ? 'Y' : 'N'}
                        </span>
                      )}
                      {kakaoFailed && log?.error_message && (
                        <p className="mt-2 break-all rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                          실패 사유: {log.error_message}
                          {log.error_code ? ` (code: ${log.error_code})` : ''}
                        </p>
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="mb-1.5 text-sm font-medium text-gray-500">
                      SMS 전송 여부
                    </dt>
                    <dd>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${smsBadgeClass}`}
                      >
                        {smsLabel}
                      </span>
                      {log?.status === 'failed' && log.error_message && (
                        <p className="mt-2 break-all rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                          NCP 응답 사유: {log.error_message}
                          {log.error_code ? ` (code: ${log.error_code})` : ''}
                        </p>
                      )}
                    </dd>
                  </div>

                  {log && (
                    <div className="text-xs text-gray-400">
                      발송 요청: {formatDateTime(log.requested_at)}
                      {log.sent_at && ` · 응답: ${formatDateTime(log.sent_at)}`}
                    </div>
                  )}
                </>
              );
            })()}
          </dl>
        </CardContent>
      </Card>

      {/* 연관된 상담 신청 */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">
            연관된 상담 신청 ({data.consultations.length}건)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.consultations.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              아직 상담 신청이 없습니다.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium text-gray-500">ID</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">상품</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">상태</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">접수일</th>
                  </tr>
                </thead>
                <tbody>
                  {data.consultations.map((c) => {
                    const status = CONSULT_STATUS_LABELS[c.consult_status] ?? {
                      label: c.consult_status,
                      className: 'bg-gray-100 text-gray-600 border-gray-200',
                    };
                    return (
                      <tr
                        key={c.id}
                        className="cursor-pointer border-b border-gray-200 last:border-0 hover:bg-gray-50"
                        onClick={() =>
                          router.push(
                            `/admin/general-funeral/consultation-requests/${c.id}`,
                          )
                        }
                      >
                        <td className="px-3 py-2 text-gray-700">{c.id}</td>
                        <td className="px-3 py-2 text-gray-700">
                          {c.selected_product_name}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {formatDateTime(c.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 관리자 메모 */}
      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">관리자 메모</CardTitle>
          <Button
            size="sm"
            disabled={!noteChanged || saving}
            onClick={handleSaveNote}
            className={
              noteChanged
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          >
            <Check className="size-4" />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </CardHeader>
        <CardContent>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="관리자 메모를 입력하세요..."
            rows={5}
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors"
          />
        </CardContent>
      </Card>
    </div>
  );
}
