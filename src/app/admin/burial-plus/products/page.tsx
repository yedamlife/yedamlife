'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Plus, Trash2, GripVertical, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CATEGORIES = ['전체', '봉안당', '수목장', '공원묘지', '해양장'] as const;
const PAGE_SIZE = 30;

const SORT_COLUMN: Record<string, string> = {
  '전체': 'sort_all',
  '봉안당': 'sort_charnel',
  '수목장': 'sort_tree',
  '공원묘지': 'sort_park',
  '해양장': 'sort_ocean',
};

interface Row {
  id: number;
  uuid: string;
  company_name: string;
  sido_name: string | null;
  full_address: string | null;
  public_label: string | null;
  categories: string[];
  religions: string[] | null;
  photos: Array<{ fileurl_full?: string | null }> | null;
  min_price: number | null;
  is_recommended: boolean;
  is_active: boolean;
  sort_all: number;
  sort_charnel: number;
  sort_tree: number;
  sort_park: number;
  sort_ocean: number;
  created_at: string;
}

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();

  const [data, setData] = useState<Row[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<string>('전체');
  const [publicFilter, setPublicFilter] = useState<'전체' | '공설' | '사설'>('전체');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [hasReligion, setHasReligion] = useState(false);

  const sortCol = SORT_COLUMN[category] ?? 'sort_all';
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const buildQuery = useCallback(
    (nextCursor: string | null) => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (nextCursor) params.set('cursor', nextCursor);
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (category !== '전체') params.set('category', category);
      if (publicFilter !== '전체') params.set('public_label', publicFilter);
      if (activeFilter === 'active') params.set('is_active', 'true');
      if (activeFilter === 'inactive') params.set('is_active', 'false');
      if (hasReligion) params.set('has_religion', 'true');
      return params;
    },
    [debouncedSearch, category, publicFilter, activeFilter, hasReligion],
  );

  // 필터 변경 시 초기화하고 첫 페이지 로드
  useEffect(() => {
    let cancelled = false;
    setInitialLoading(true);
    setData([]);
    setCursor(null);
    setHasMore(false);

    (async () => {
      const res = await fetch(`/api/v1/admin/burial-plus/products?${buildQuery(null)}`);
      const json = await res.json();
      if (cancelled) return;
      if (json.success) {
        setData(json.data);
        setCursor(json.next_cursor);
        setHasMore(json.has_more);
        setTotal(json.total ?? 0);
      }
      setInitialLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [buildQuery]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    const res = await fetch(`/api/v1/admin/burial-plus/products?${buildQuery(cursor)}`);
    const json = await res.json();
    if (json.success) {
      setData((prev) => [...prev, ...json.data]);
      setCursor(json.next_cursor);
      setHasMore(json.has_more);
    }
    setLoadingMore(false);
  }, [buildQuery, cursor, hasMore, loadingMore]);

  // IntersectionObserver로 무한 스크롤
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/v1/admin/burial-plus/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('삭제되었습니다.');
      setData((prev) => prev.filter((r) => r.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } else {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (row: Row) => {
    const res = await fetch(`/api/v1/admin/burial-plus/products/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !row.is_active }),
    });
    if (res.ok) {
      setData((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_active: !r.is_active } : r)));
    } else {
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  const handleToggleRecommended = async (row: Row) => {
    const res = await fetch(`/api/v1/admin/burial-plus/products/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_recommended: !row.is_recommended }),
    });
    if (res.ok) {
      setData((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_recommended: !r.is_recommended } : r)));
    } else {
      toast.error('추천 변경에 실패했습니다.');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = data.findIndex((r) => r.id === active.id);
    const newIndex = data.findIndex((r) => r.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(data, oldIndex, newIndex);
    // 현재 카테고리의 정렬 값을 오름차순으로 재분배
    const orders = [...data.map((r) => (r as unknown as Record<string, number>)[sortCol])].sort((a, b) => a - b);
    const updated = reordered.map((r, idx) => ({ ...r, [sortCol]: orders[idx] }));
    setData(updated);

    // 마지막 행 기준으로 커서 재설정
    const last = updated[updated.length - 1];
    if (last) {
      setCursor(
        Buffer.from(JSON.stringify({ sort: (last as Record<string, unknown>)[sortCol] as number, id: last.id })).toString('base64'),
      );
    }

    const res = await fetch('/api/v1/admin/burial-plus/products/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        items: updated.map((r) => ({ id: r.id, sort_value: (r as unknown as Record<string, number>)[sortCol] })),
      }),
    });
    if (!res.ok) toast.error('순서 저장에 실패했습니다.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">장지관리</h2>
        <Button onClick={() => router.push(`${pathname}/new`)} className="bg-gray-900 text-white hover:bg-gray-800">
          <Plus className="size-4" />
          장지 등록
        </Button>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                category === c
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="장지명 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-gray-400"
            />
          </div>

          <Select
            value={publicFilter}
            onValueChange={(v) => setPublicFilter(v as '전체' | '공설' | '사설')}
          >
            <SelectTrigger
              size="sm"
              className="h-9! w-28 border-gray-200 bg-white text-sm px-3! py-0!"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체</SelectItem>
              <SelectItem value="공설">공설</SelectItem>
              <SelectItem value="사설">사설</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {(['all', 'active', 'inactive'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  activeFilter === f ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50',
                )}
              >
                {f === 'all' ? '전체' : f === 'active' ? '활성' : '비활성'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setHasReligion((v) => !v)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              hasReligion
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
            )}
          >
            종교 있음
          </button>
        </div>

      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 text-sm text-gray-500">
          <span>
            {total > 0
              ? `전체 ${total.toLocaleString()}건 · ${data.length.toLocaleString()}건 로드됨`
              : '데이터 없음'}
          </span>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="w-10 px-2 py-3"></th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">사진</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">장지명</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">카테고리</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">종교</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">지역</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">구분</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">최소금액</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">추천</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">활성</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">관리</th>
                </tr>
              </thead>
              <tbody>
                {initialLoading ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-gray-400">
                      로딩 중...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-gray-400">
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  <SortableContext items={data.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                    {data.map((row) => (
                      <SortableRow
                        key={row.id}
                        row={row}
                        onClick={() => router.push(`${pathname}/${row.id}`)}
                        onToggleRecommended={() => handleToggleRecommended(row)}
                        onToggleActive={() => handleToggleActive(row)}
                        onDelete={() => handleDelete(row.id)}
                      />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </table>
          </div>
        </DndContext>

        {/* 무한 스크롤 센티넬 */}
        {hasMore && (
          <div
            ref={sentinelRef}
            className="flex items-center justify-center gap-2 border-t border-gray-200 py-4 text-sm text-gray-400"
          >
            {loadingMore ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                더 불러오는 중...
              </>
            ) : (
              <span>스크롤하여 더 보기</span>
            )}
          </div>
        )}

        {!hasMore && !initialLoading && data.length > 0 && (
          <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
            마지막 항목입니다.
          </div>
        )}
      </div>
    </div>
  );
}

interface RowProps {
  row: Row;
  onClick: () => void;
  onToggleRecommended: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

function Thumb({ row }: { row: Row }) {
  const thumb = row.photos?.[0]?.fileurl_full;
  return (
    <div className="flex size-12 items-center justify-center overflow-hidden rounded-md bg-gray-100">
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" className="size-full object-cover" />
      ) : (
        <span className="text-xs text-gray-400">없음</span>
      )}
    </div>
  );
}

function CategoryChips({ categories }: { categories: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {categories.map((c) => (
        <span key={c} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
          {c}
        </span>
      ))}
    </div>
  );
}

const RELIGION_STYLE: Record<string, string> = {
  '무교': 'bg-gray-100 text-gray-600',
  '기독교': 'bg-blue-50 text-blue-700',
  '불교': 'bg-amber-50 text-amber-700',
  '천주교': 'bg-rose-50 text-rose-700',
};

function ReligionChips({ religions }: { religions: string[] | null }) {
  if (!religions || religions.length === 0) {
    return <span className="text-xs text-gray-300">-</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {religions.map((r) => (
        <span
          key={r}
          className={cn(
            'rounded-full px-2 py-0.5 text-xs',
            RELIGION_STYLE[r] ?? 'bg-gray-100 text-gray-700',
          )}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

function SortableRow({ row, onClick, onToggleRecommended, onToggleActive, onDelete }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#f9fafb' : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-gray-200 last:border-0 hover:bg-gray-50"
    >
      <td className="w-10 px-2 py-3 text-center align-middle">
        <button
          type="button"
          className="cursor-grab rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="드래그"
        >
          <GripVertical className="size-4" />
        </button>
      </td>
      <td className="px-4 py-3 cursor-pointer" onClick={onClick}><Thumb row={row} /></td>
      <td className="px-4 py-3 cursor-pointer font-medium text-gray-900" onClick={onClick}>
        {row.company_name}
      </td>
      <td className="px-4 py-3 cursor-pointer" onClick={onClick}>
        <CategoryChips categories={row.categories} />
      </td>
      <td className="px-4 py-3 cursor-pointer" onClick={onClick}>
        <ReligionChips religions={row.religions} />
      </td>
      <td className="px-4 py-3 cursor-pointer text-gray-600" onClick={onClick}>
        {row.sido_name ?? '-'}
      </td>
      <td className="px-4 py-3 cursor-pointer text-gray-600" onClick={onClick}>
        {row.public_label ?? '-'}
      </td>
      <td
        className="px-4 py-3 text-right tabular-nums text-gray-700 cursor-pointer"
        onClick={onClick}
      >
        {row.min_price != null ? `${row.min_price.toLocaleString()}원` : '-'}
      </td>
      <td className="px-4 py-3 text-center">
        <RecommendedToggle recommended={row.is_recommended} onClick={onToggleRecommended} />
      </td>
      <td className="px-4 py-3 text-center">
        <ActiveToggle active={row.is_active} onClick={onToggleActive} />
      </td>
      <td className="px-4 py-3 text-right">
        <DeleteButton onClick={onDelete} />
      </td>
    </tr>
  );
}

function RecommendedToggle({ recommended, onClick }: { recommended: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center cursor-pointer"
      title={recommended ? '추천 해제' : '추천 설정'}
    >
      <Star
        className={cn(
          'size-4 transition-colors',
          recommended ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300 hover:text-gray-400',
        )}
      />
    </button>
  );
}

function ActiveToggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
        active ? 'bg-gray-900' : 'bg-gray-300',
      )}
    >
      <span
        className={cn(
          'inline-block size-4 rounded-full bg-white transition-transform',
          active ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 text-red-500 hover:bg-red-50 hover:text-red-600"
      onClick={onClick}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
