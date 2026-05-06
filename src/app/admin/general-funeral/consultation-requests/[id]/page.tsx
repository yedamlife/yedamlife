'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { FuneralCostModal } from '@/components/template/YedamLife/funeral-cost-modal';

type SizeKey = 'small' | 'medium' | 'large' | 'premium' | 'vip';

interface UiSnapshot {
  funeralType?: '3day' | 'nobinso';
  sido?: string;
  gungu?: string;
  facilityCd?: string;
  selectedSize?: SizeKey;
  guestCount?: number;
  checkedFeeIndexes?: number[];
  checkedEncoffinIndexes?: number[];
  checkedMortuaryIndexes?: number[];
  unselectedSangjoKeys?: string[];
  sangjoQuantities?: Record<string, number>;
  flowerDecor?: 'normal' | 'special' | 'premium' | 'top';
  ritual?: 'none' | 'formal' | 'simple' | 'christian';
}

interface ResultJson {
  funeralType?: '3day' | 'nobinso';
  hall?: {
    facilityCd?: string;
    companyName?: string;
    fullAddress?: string;
  };
  selections?: {
    selectedSize?: string;
    selectedSizeLabel?: string;
    guestCount?: number;
  };
  computed?: { total?: number; basicTotal?: number; sangjoTotal?: number };
  recommendation?: { id?: string; name?: string; price?: number; savings?: number };
  uiSnapshot?: UiSnapshot;
}

interface Estimate {
  id: number;
  uuid: string;
  funeral_type: '3day' | 'nobinso';
  name: string;
  phone: string;
}

interface Detail {
  id: number;
  estimate_request_id: number | null;
  estimate_uuid: string | null;
  name: string;
  phone: string;
  selected_product_id: string | null;
  selected_product_name: string | null;
  consult_status: string;
  result_json: ResultJson | null;
  admin_note: string | null;
  created_at: string;
  estimate: Estimate | null;
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending: {
    label: '대기',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  contacted: {
    label: '연락완료',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  closed_won: {
    label: '계약',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  closed_lost: {
    label: '실패',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

const STATUS_OPTIONS = ['pending', 'contacted', 'closed_won', 'closed_lost'];

const FUNERAL_TYPE_LABELS: Record<string, string> = {
  '3day': '3일장',
  nobinso: '무빈소',
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

function formatWon(n: number | undefined | null) {
  if (typeof n !== 'number' || !isFinite(n)) return '-';
  return `${n.toLocaleString('ko-KR')}원`;
}

const API_PATH = '/api/v1/admin/general-funeral/consultation-requests';
const BACK_HREF = '/admin/general-funeral/consultation-requests';
const ESTIMATE_HREF = '/admin/general-funeral/estimate-requests';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [savedNote, setSavedNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetch(`${API_PATH}/${id}`)
      .then((r) => r.json())
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
    if (!noteChanged || savingNote) return;
    setSavingNote(true);
    const res = await fetch(`${API_PATH}/${id}`, {
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
    setSavingNote(false);
  };

  const handleStatusChange = async (next: string) => {
    if (!data || savingStatus) return;
    setSavingStatus(true);
    try {
      const res = await fetch(`${API_PATH}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consult_status: next }),
      });
      if (res.ok) {
        setData({ ...data, consult_status: next });
        toast.success('상태가 변경되었습니다.');
      } else {
        toast.error('상태 변경에 실패했습니다.');
      }
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`${API_PATH}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('삭제되었습니다.');
      router.push(BACK_HREF);
    } else {
      toast.error('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        로딩 중...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        데이터를 찾을 수 없습니다.
      </div>
    );
  }

  const result = data.result_json ?? {};
  const status = STATUS_META[data.consult_status] ?? {
    label: data.consult_status,
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const funeralType = result.funeralType ?? data.estimate?.funeral_type;
  const typeLabel = funeralType
    ? FUNERAL_TYPE_LABELS[funeralType] ?? funeralType
    : '-';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(BACK_HREF)}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-xl font-bold text-gray-900">
            장례비용 상담 신청 상세
          </h2>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">신청자 정보</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => setResultOpen(true)}
              disabled={!funeralType}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              실제 결과 화면으로 보기
            </Button>
            {data.estimate ? (
              <Link
                href={`${ESTIMATE_HREF}/${data.estimate.id}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                고객이 선택한 정보 확인
                <ExternalLink className="size-3.5" />
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-md border border-dashed border-gray-200 px-3 py-1.5 text-xs text-gray-400">
                연결된 견적 요청 없음
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-3">
            <InfoRow label="이름">{data.name}</InfoRow>
            <InfoRow label="연락처">{data.phone}</InfoRow>
            <InfoRow label="접수일">{formatDateTime(data.created_at)}</InfoRow>
            <InfoRow label="장례 형태">{typeLabel}</InfoRow>
            <InfoRow label="장례식장">
              {result.hall?.companyName ?? '-'}
            </InfoRow>
            <InfoRow label="규모 / 조문객">
              {(result.selections?.selectedSizeLabel ?? '-') +
                ' / ' +
                (typeof result.selections?.guestCount === 'number'
                  ? `${result.selections.guestCount}명`
                  : '-')}
            </InfoRow>
            <InfoRow label="총 예상비용">
              <span className="font-semibold text-gray-900">
                {formatWon(result.computed?.total)}
              </span>
            </InfoRow>
            <InfoRow label="추천 / 선택 상품">
              {data.selected_product_name ?? '-'}
            </InfoRow>
            <InfoRow label="추천 절감액">
              {formatWon(result.recommendation?.savings)}
            </InfoRow>
          </dl>
        </CardContent>
      </Card>

      {/* 상담 상태 */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">상담 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => {
              const meta = STATUS_META[s];
              const active = s === data.consult_status;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={savingStatus}
                  onClick={() => handleStatusChange(s)}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition ${
                    active
                      ? meta.className + ' ring-2 ring-offset-1 ring-gray-300'
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 관리자 메모 */}
      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">관리자 메모</CardTitle>
          <Button
            size="sm"
            disabled={!noteChanged || savingNote}
            onClick={handleSaveNote}
            className={
              noteChanged
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          >
            <Check className="size-4" />
            {savingNote ? '저장 중...' : '저장'}
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

      {resultOpen && data.result_json && (
        <FuneralCostModal
          isOpen
          viewOnly
          onClose={() => setResultOpen(false)}
          initialEstimateUuid={data.estimate?.uuid ?? data.estimate_uuid ?? undefined}
          snapshotResult={
            data.result_json as unknown as React.ComponentProps<
              typeof FuneralCostModal
            >['snapshotResult']
          }
        />
      )}
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="mb-1.5 text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{children}</dd>
    </div>
  );
}
