'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface Row {
  id: number;
  uuid: string;
  name: string;
  phone: string;
  funeral_type: '3day' | 'nobinso';
  current_situation: string | null;
  selected_size: string | null;
  guest_count: number | null;
  created_at: string;
  converted?: boolean;
  customer_alimtalk_status?: 'pending' | 'success' | 'failed' | 'skipped' | null;
}

function renderKakaoStatus(status: Row['customer_alimtalk_status']) {
  if (!status) {
    return <span className="text-gray-400">-</span>;
  }
  const isSuccess = status === 'success';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
        isSuccess
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {isSuccess ? 'Y' : 'N'}
    </span>
  );
}

function renderSmsStatus(status: Row['customer_alimtalk_status']) {
  if (!status || status === 'success') {
    return <span className="text-gray-400">-</span>;
  }
  // failed → NCP 콘솔에서 SMS 폴백 자동 전송
  // skipped/pending → 미발송
  const isFallback = status === 'failed';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
        isFallback
          ? 'border-blue-200 bg-blue-50 text-blue-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {isFallback ? 'Y' : 'N'}
    </span>
  );
}

const SIZE_LABELS: Record<string, string> = {
  small: '소형',
  medium: '중형',
  large: '대형',
  premium: '프리미엄',
  vip: 'VIP',
};

const FUNERAL_TYPE_LABELS: Record<string, string> = {
  '3day': '3일장',
  nobinso: '무빈소',
};

const columns: Column<Row>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  {
    key: 'funeral_type',
    label: '장례형태',
    render: (row) => FUNERAL_TYPE_LABELS[row.funeral_type] ?? row.funeral_type,
  },
  {
    key: 'selected_size',
    label: '규모',
    render: (row) =>
      row.selected_size ? SIZE_LABELS[row.selected_size] ?? row.selected_size : '-',
  },
  {
    key: 'guest_count',
    label: '예상 조문객',
    render: (row) => (row.guest_count != null ? `${row.guest_count}명` : '-'),
  },
  {
    key: 'kakao_status',
    label: '카카오톡',
    render: (row) => renderKakaoStatus(row.customer_alimtalk_status),
  },
  {
    key: 'sms_status',
    label: 'SMS',
    render: (row) => renderSmsStatus(row.customer_alimtalk_status),
  },
  {
    key: 'converted',
    label: '상담전환',
    render: (row) =>
      row.converted ? (
        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          전환
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
  },
  {
    key: 'created_at',
    label: '접수일',
    render: (row) =>
      new Date(row.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
  },
];

export default function Page() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<Row[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    threeDay: 0,
    nobinso: 0,
    converted: 0,
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const page = searchParams.get('page') || '1';

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const apiPath = '/api/v1/admin/general-funeral/estimate-requests';

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: '20' });
    if (debouncedSearch) params.set('search', debouncedSearch);

    const res = await fetch(`${apiPath}?${params}`);
    const json = await res.json();

    if (json.success) {
      setData(json.data);
      setPagination(json.pagination);
      if (json.stats) setStats(json.stats);
    }
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number | string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`${apiPath}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setData((prev) => prev.filter((item) => item.id !== id));
      fetchData();
    }
  };

  const cards = [
    { label: '전체', value: stats.total, className: 'bg-gray-700 text-white border-gray-700' },
    { label: '3일장', value: stats.threeDay, className: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
    { label: '무빈소', value: stats.nobinso, className: 'bg-blue-50 text-blue-600 border-blue-200' },
    { label: '상담전환', value: stats.converted, className: 'bg-green-50 text-green-600 border-green-200' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">일반상조 - 장례비용 전송 내역</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="이름·연락처 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-gray-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className={card.className}>
            <CardContent className="flex items-center justify-between px-6 py-4">
              <span className="text-sm font-medium opacity-80">{card.label}</span>
              <span className="text-2xl font-bold">{card.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-gray-400">로딩 중...</div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          pagination={pagination}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
