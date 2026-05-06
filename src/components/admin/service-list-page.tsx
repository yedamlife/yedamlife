'use client';

import { Suspense, useEffect, useState, useCallback, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { StatsCards } from './stats-cards';
import { DataTable, type Column } from './data-table';
import { Search } from 'lucide-react';

interface ServiceListPageProps<T extends { id: number | string; status?: string }> {
  title: string;
  apiPath: string;
  columns: Column<T>[];
}

export function ServiceListPage<T extends { id: number | string; status?: string }>(
  props: ServiceListPageProps<T>,
) {
  // useSearchParams() 가 정적 prerender 를 깨뜨리므로 Suspense 로 감싸 csr-bailout 처리
  return (
    <Suspense fallback={null}>
      <ServiceListPageInner {...props} />
    </Suspense>
  );
}

function ServiceListPageInner<T extends { id: number | string; status?: string }>({
  title,
  apiPath,
  columns,
}: ServiceListPageProps<T>) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const page = searchParams.get('page') || '1';
  const status = searchParams.get('status') || '';

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: '20' });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (status) params.set('status', status);

    const res = await fetch(`${apiPath}?${params}`);
    const json = await res.json();

    if (json.success) {
      setData(json.data);
      setPagination(json.pagination);
      // stats가 응답에 포함되어 있으면 즉시 반영
      if (json.stats) {
        startTransition(() => {
          setStats({
            total: json.stats.total,
            pending: json.stats.pending,
            inProgress: json.stats.in_progress,
            completed: json.stats.completed,
          });
        });
      }
    }
    setLoading(false);
  }, [apiPath, page, status, debouncedSearch]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-gray-400"
          />
        </div>
      </div>

      <StatsCards
        total={stats.total}
        pending={stats.pending}
        inProgress={stats.inProgress}
        completed={stats.completed}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center text-gray-400">로딩 중...</div>
      ) : (
        <DataTable columns={columns} data={data} pagination={pagination} onDelete={handleDelete} />
      )}
    </div>
  );
}
