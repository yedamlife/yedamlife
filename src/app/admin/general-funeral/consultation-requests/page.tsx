'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight, ExternalLink, Eye } from 'lucide-react';
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
  hall?: { facilityCd?: string; companyName?: string; fullAddress?: string };
  selections?: { selectedSize?: string; selectedSizeLabel?: string; guestCount?: number };
  computed?: { total?: number };
  snapshot?: {
    facilityFeeTable?: unknown[];
    mortuaryFeeTable?: unknown[];
    serviceItems?: unknown[];
  };
  uiSnapshot?: UiSnapshot;
}

interface Row {
  id: number;
  name: string;
  phone: string;
  selected_product_id: string | null;
  selected_product_name: string | null;
  estimate_request_id: number | null;
  estimate_uuid: string | null;
  consult_status: string;
  result_json: ResultJson | null;
  created_at: string;
}

const FUNERAL_TYPE_LABELS: Record<string, string> = {
  '3day': '3일장',
  nobinso: '무빈소',
};

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

function formatDateTime(value: string) {
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
const ESTIMATE_HREF = '/admin/general-funeral/estimate-requests';

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') || '1');
  const [rows, setRows] = useState<Row[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    closed_won: 0,
    closed_lost: 0,
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewerRow, setViewerRow] = useState<Row | null>(null);

  const openViewer = (row: Row) => setViewerRow(row);
  const closeViewer = () => setViewerRow(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (debouncedSearch) params.set('search', debouncedSearch);
    const res = await fetch(`${API_PATH}?${params}`);
    const json = await res.json();
    if (json.success) {
      setRows(json.data);
      setPagination(json.pagination);
      if (json.stats) setStats(json.stats);
    }
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  const statCards = [
    {
      label: '전체',
      value: stats.total,
      className: 'bg-gray-700 text-white border-gray-700',
    },
    {
      label: '대기',
      value: stats.pending,
      className: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    },
    {
      label: '연락완료',
      value: stats.contacted,
      className: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      label: '계약',
      value: stats.closed_won,
      className: 'bg-green-50 text-green-600 border-green-200',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          후불제 상조 - 장례비용 상담 신청 내역
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="이름·연락처·상품으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-64 rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-gray-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statCards.map((c) => (
          <Card key={c.label} className={c.className}>
            <CardContent className="flex items-center justify-between px-6 py-4">
              <span className="text-sm font-medium opacity-80">{c.label}</span>
              <span className="text-2xl font-bold">{c.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-gray-400">
          로딩 중...
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    이름
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    연락처
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    장례식장
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    형태·규모
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">
                    예상비용
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    선택 상품
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    접수일
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-12 text-center text-gray-400"
                    >
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const result = row.result_json ?? {};
                    const hallName = result.hall?.companyName ?? '-';
                    const typeLabel = result.funeralType
                      ? FUNERAL_TYPE_LABELS[result.funeralType] ?? result.funeralType
                      : '-';
                    const sizeLabel = result.selections?.selectedSizeLabel ?? '-';
                    const total = result.computed?.total;
                    const status = STATUS_META[row.consult_status] ?? {
                      label: row.consult_status,
                      className: 'bg-gray-100 text-gray-600 border-gray-200',
                    };
                    const estimateHref = row.estimate_request_id
                      ? `${ESTIMATE_HREF}/${row.estimate_request_id}`
                      : null;
                    return (
                      <tr
                        key={row.id}
                        className="cursor-pointer border-b border-gray-200 last:border-0 hover:bg-gray-50"
                        onClick={() => router.push(`${pathname}/${row.id}`)}
                      >
                        <td className="px-4 py-3 text-gray-700">{row.id}</td>
                        <td className="px-4 py-3 text-gray-700">{row.name}</td>
                        <td className="px-4 py-3 text-gray-700">{row.phone}</td>
                        <td className="px-4 py-3 text-gray-700">{hallName}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {typeLabel} · {sizeLabel}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {formatWon(total)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {row.selected_product_name ?? '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatDateTime(row.created_at)}
                        </td>
                        <td
                          className="px-4 py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openViewer(row)}
                              disabled={!result.funeralType && !result.uiSnapshot?.funeralType}
                              className="whitespace-nowrap"
                            >
                              <Eye className="mr-1 size-3.5" />
                              실제 결과 화면으로 보기
                            </Button>
                            {estimateHref ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(estimateHref)}
                                className="whitespace-nowrap"
                              >
                                고객이 선택한 정보 확인
                                <ExternalLink className="ml-1 size-3.5" />
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400">
                                연결된 견적 없음
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
              <p className="text-sm text-gray-500">
                전체 {pagination.total}건 중{' '}
                {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total,
                )}
                건
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(pagination.page - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from(
                  { length: Math.min(pagination.total_pages, 5) },
                  (_, i) => {
                    const start = Math.max(
                      1,
                      Math.min(pagination.page - 2, pagination.total_pages - 4),
                    );
                    const p = start + i;
                    return (
                      <Button
                        key={p}
                        variant={p === pagination.page ? 'default' : 'outline'}
                        size="icon"
                        className="size-8"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    );
                  },
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={pagination.page >= pagination.total_pages}
                  onClick={() => setPage(pagination.page + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {viewerRow && viewerRow.result_json && (
        <FuneralCostModal
          isOpen
          viewOnly
          onClose={closeViewer}
          initialEstimateUuid={viewerRow.estimate_uuid ?? undefined}
          snapshotResult={
            viewerRow.result_json as unknown as React.ComponentProps<
              typeof FuneralCostModal
            >['snapshotResult']
          }
        />
      )}
    </div>
  );
}
