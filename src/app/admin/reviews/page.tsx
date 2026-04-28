'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const CATEGORIES: Record<string, string> = {
  all: '전체',
  general: '일반상조',
  corporate: '기업상조',
  estate: '유품정리',
  burial: '장지+',
  postcare: '사후행정케어',
  escort: '운구의전',
};

interface Row {
  id: number;
  uuid: string;
  category: string;
  author: string;
  written_at: string;
  title: string | null;
  tags: string[] | null;
  is_active: boolean;
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
  const [category, setCategory] = useState('all');
  const [hasTagsOnly, setHasTagsOnly] = useState(false);

  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (category && category !== 'all') params.set('category', category);
    if (hasTagsOnly) params.set('has_tags', 'true');
    if (debouncedSearch) params.set('search', debouncedSearch);

    const res = await fetch(`/api/v1/admin/reviews?${params}`);
    const json = await res.json();
    if (json.success) {
      setData(json.data);
      setPagination(json.pagination);
    }
    setLoading(false);
  }, [page, category, hasTagsOnly, debouncedSearch]);

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
    const res = await fetch(`/api/v1/admin/reviews/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      toast.success('삭제되었습니다.');
      fetchData();
    } else {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (row: Row) => {
    const res = await fetch(`/api/v1/admin/reviews/${row.id}`, {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">후기 관리</h2>
        <Button
          onClick={() => router.push(`${pathname}/new`)}
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          <Plus className="size-4" />
          후기 등록
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger
            size="sm"
            className="h-9! w-32 border-gray-200 bg-white text-sm px-3! py-0!"
          >
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORIES).map(([val, label]) => (
              <SelectItem key={val} value={val}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="제목, 작성자, 내용 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
          <Switch checked={hasTagsOnly} onCheckedChange={setHasTagsOnly} />
          <span className="text-gray-700">태그 있는 후기만</span>
        </label>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  카테고리
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  제목
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  태그
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  작성자
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  작성일
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
                data.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 last:border-0 cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`${pathname}/${row.id}`)}
                  >
                    <td className="px-4 py-3 text-gray-500">{row.id}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        {CATEGORIES[row.category] ?? row.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[240px]">
                      {row.title || '(제목 없음)'}
                    </td>
                    <td className="px-4 py-3">
                      {row.tags && row.tags.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          {row.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                          {row.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{row.tags.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.author}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(row.written_at).toLocaleDateString('ko-KR')}
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
    </div>
  );
}
