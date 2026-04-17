'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ReviewEditor } from '@/components/admin/review-editor';

const BACK_HREF = '/admin/reviews';

const CATEGORIES: Record<string, string> = {
  general: '일반상조',
  corporate: '기업상조',
  estate: '유품정리',
  burial: '장지+',
  postcare: '사후행정케어',
  escort: '운구의전',
};

interface ReviewData {
  category: string;
  author: string;
  written_at: string;
  title: string;
  content: string;
  is_active: boolean;
}

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [original, setOriginal] = useState<ReviewData | null>(null);
  const [edited, setEdited] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/admin/reviews/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const d = json.data;
        const v: ReviewData = {
          category: d.category ?? '',
          author: d.author ?? '',
          written_at: d.written_at ?? '',
          title: d.title ?? '',
          content: d.content ?? '',
          is_active: d.is_active ?? true,
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

  const update = <K extends keyof ReviewData>(key: K, val: ReviewData[K]) => {
    setEdited((prev) => (prev ? { ...prev, [key]: val } : prev));
  };

  const handleSave = async () => {
    if (!edited || !hasChanges) return;
    setSaving(true);

    const changedFields: Record<string, unknown> = {};
    for (const key of Object.keys(edited) as (keyof ReviewData)[]) {
      if (JSON.stringify(edited[key]) !== JSON.stringify(original![key])) {
        changedFields[key] = edited[key];
      }
    }

    const res = await fetch(`/api/v1/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changedFields),
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
    const res = await fetch(`/api/v1/admin/reviews/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('삭제되었습니다.');
      router.push(BACK_HREF);
    } else {
      toast.error('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-400">로딩 중...</div>;
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
          <Button variant="ghost" size="icon" onClick={() => router.push(BACK_HREF)}>
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-xl font-bold text-gray-900">후기 상세</h2>
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

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-500">카테고리</label>
            <Select value={edited.category} onValueChange={(v) => update('category', v)}>
              <SelectTrigger size="sm" className="w-full border-gray-200 text-sm h-[38px]! px-3! py-0!">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORIES).map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-500">작성자</label>
            <input
              value={edited.author}
              onChange={(e) => update('author', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-500">작성일자</label>
            <input
              type="date"
              value={edited.written_at}
              onChange={(e) => update('written_at', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-500">제목 (선택)</label>
            <input
              value={edited.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Switch
                checked={edited.is_active}
                onCheckedChange={(checked) => update('is_active', checked)}
              />
              <span className="text-gray-700">활성</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">내용</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewEditor
            content={edited.content}
            onChange={(html) => update('content', html)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
