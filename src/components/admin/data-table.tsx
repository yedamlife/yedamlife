'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { StatusBadge } from './status-badge';
import { useState, useRef, useEffect } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: number | string; status?: string }> {
  columns: Column<T>[];
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  onDelete?: (id: number | string) => void;
}

function ActionMenu({
  id,
  onView,
  onDelete,
}: {
  id: number | string;
  onView: () => void;
  onDelete?: (id: number | string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="size-8">
        <MoreHorizontal className="size-4" />
      </Button>
      {open && (
        <div className="fixed z-50 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg" style={{ top: ref.current?.getBoundingClientRect().bottom ?? 0, left: (ref.current?.getBoundingClientRect().right ?? 0) - 144 }}>
          <button
            onClick={() => {
              onView();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Eye className="size-4" />
            상세보기
          </button>
          {onDelete && (
            <button
              onClick={() => {
                onDelete(id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-4" />
              삭제
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function DataTable<T extends { id: number | string; status?: string }>({
  columns,
  data,
  pagination,
  onDelete,
}: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left font-medium text-gray-500">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium text-gray-500">상태</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="py-12 text-center text-gray-400"
                >
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
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '-')}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    {row.status ? <StatusBadge status={row.status} /> : '-'}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <ActionMenu
                      id={row.id}
                      onView={() => router.push(`${pathname}/${row.id}`)}
                      onDelete={onDelete}
                    />
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
            전체 {pagination.total}건 중 {(pagination.page - 1) * pagination.limit + 1}-
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
            {Array.from({ length: Math.min(pagination.total_pages, 5) }, (_, i) => {
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
            })}
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
  );
}
