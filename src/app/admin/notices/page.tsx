'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const CATEGORIES = ['공지', '이벤트', '안내', '보도자료'] as const;
const CATEGORY_BADGE: Record<string, string> = {
  공지: 'bg-gray-100 text-gray-700',
  이벤트: 'bg-rose-100 text-rose-700',
  안내: 'bg-blue-100 text-blue-700',
  보도자료: 'bg-amber-100 text-amber-700',
};

interface Row {
  id: number;
  uuid: string;
  title: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  view_count: number;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<Row[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // drag & drop
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);

    const res = await fetch(`/api/v1/admin/notices?${params}`);
    const json = await res.json();
    if (json.success) {
      setData(json.data);
      setPagination(json.pagination);
    }
    setLoading(false);
  }, [page, debouncedSearch, categoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('page', String(p));
    router.push(`${pathname}?${next.toString()}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/v1/admin/notices/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('삭제되었습니다.');
      fetchData();
    } else {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (row: Row) => {
    const res = await fetch(`/api/v1/admin/notices/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !row.is_active }),
    });
    if (res.ok) {
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, is_active: !r.is_active } : r,
        ),
      );
    } else {
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  // ── Drag & Drop ──
  const handleDragStart = (idx: number) => {
    dragIdx.current = idx;
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleDrop = async (targetIdx: number) => {
    const fromIdx = dragIdx.current;
    dragIdx.current = null;
    setDragOverIdx(null);
    if (fromIdx === null || fromIdx === targetIdx) return;

    const updated = [...data];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(targetIdx, 0, moved);
    setData(updated);

    const res = await fetch('/api/v1/admin/notices/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: updated.map((r) => r.id) }),
    });
    if (res.ok) {
      toast.success('정렬이 저장되었습니다.');
    } else {
      toast.error('정렬 저장에 실패했습니다.');
      fetchData();
    }
  };

  const handleDragEnd = () => {
    dragIdx.current = null;
    setDragOverIdx(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">공지사항 관리</h2>
        <Button
          onClick={() => router.push(`${pathname}/new`)}
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          <Plus className="size-4" />
          공지 등록
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="제목, 내용 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-gray-400"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 카테고리</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="w-10 px-2 py-3" />
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  ID
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">
                  카테고리
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  제목
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">
                  조회수
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  등록일
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">
                  활성
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    로딩 중...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr
                    key={row.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={() => handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    className={`border-b border-gray-200 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                      dragOverIdx === idx
                        ? 'border-t-2 border-t-gray-900'
                        : ''
                    }`}
                    onClick={() => router.push(`${pathname}/${row.id}`)}
                  >
                    <td
                      className="px-2 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="size-4 text-gray-300 cursor-grab active:cursor-grabbing mx-auto" />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{row.id}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          CATEGORY_BADGE[row.category] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {row.category ?? '공지'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[360px]">
                      {row.title}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {(row.view_count ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(row.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td
                      className="px-4 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Switch
                        checked={row.is_active}
                        onCheckedChange={() => handleToggleActive(row)}
                      />
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDelete(row.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-500">
              전체 {pagination.total}건 중{' '}
              {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}건
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
                    Math.min(
                      pagination.page - 2,
                      pagination.total_pages - 4,
                    ),
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
    </div>
  );
}
