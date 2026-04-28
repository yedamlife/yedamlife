'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  BpProductForm,
  type BpProductFormValue,
} from '@/components/admin/bp-product-form';

const BACK_HREF = '/admin/burial-plus/products';

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [original, setOriginal] = useState<BpProductFormValue | null>(null);
  const [edited, setEdited] = useState<BpProductFormValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/admin/burial-plus/products/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const d = json.data;
        const v: BpProductFormValue = {
          categories: d.categories ?? [],
          religions: d.religions ?? [],
          intro: d.intro ?? {},
          price: d.price ?? {},
          photos: d.photos ?? [],
          related_facilities: d.related_facilities ?? [],
          min_price: d.min_price ?? null,
          thumbnail_url: d.thumbnail_url ?? null,
          is_recommended: d.is_recommended ?? false,
          is_active: d.is_active ?? true,
          sort_all: d.sort_all ?? null,
          sort_charnel: d.sort_charnel ?? null,
          sort_tree: d.sort_tree ?? null,
          sort_park: d.sort_park ?? null,
          sort_ocean: d.sort_ocean ?? null,
        };
        setOriginal(v);
        setEdited(v);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const hasChanges = useMemo(() => {
    if (!original || !edited) return false;
    return JSON.stringify(original) !== JSON.stringify(edited);
  }, [original, edited]);

  const handleSave = async () => {
    if (!edited || !hasChanges) return;
    setSaving(true);
    const res = await fetch(`/api/v1/admin/burial-plus/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(edited),
    });
    if (res.ok) {
      toast.success('수정이 완료되었습니다.');
      setOriginal(edited);
    } else {
      const j = await res.json().catch(() => null);
      toast.error(j?.message ?? '수정에 실패했습니다.');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/v1/admin/burial-plus/products/${id}`, {
      method: 'DELETE',
    });
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
  if (!edited) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        데이터를 찾을 수 없습니다.
      </div>
    );
  }

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
          <h2 className="text-xl font-bold text-gray-900">장지 상세</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDelete}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="size-4" />
            삭제
          </Button>
          <Button
            disabled={!hasChanges || saving}
            onClick={handleSave}
            className={
              hasChanges
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          >
            <Check className="size-4" />
            {saving ? '저장 중...' : '수정완료'}
          </Button>
        </div>
      </div>

      <BpProductForm value={edited} onChange={setEdited} productId={id} />
    </div>
  );
}
