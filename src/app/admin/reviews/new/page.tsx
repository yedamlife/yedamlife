'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { ReviewEditor } from '@/components/admin/review-editor';
import { TagInput } from '@/components/admin/tag-input';

const BACK_HREF = '/admin/reviews';

const CATEGORIES: Record<string, string> = {
  general: '일반상조',
  corporate: '기업상조',
  estate: '유품정리',
  burial: '장지+',
  postcare: '사후행정케어',
  escort: '운구의전',
};

export default function Page() {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [writtenAt, setWrittenAt] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!category) return toast.error('카테고리를 선택해주세요.');
    if (!author.trim()) return toast.error('작성자를 입력해주세요.');
    if (!content.trim() || content === '<p></p>') return toast.error('내용을 입력해주세요.');

    setSaving(true);
    const res = await fetch('/api/v1/admin/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, author, written_at: writtenAt, title: title || null, content, tags, is_active: isActive }),
    });
    if (res.ok) {
      const json = await res.json();
      toast.success('등록되었습니다.');
      router.push(`${BACK_HREF}/${json.data.id}`);
    } else {
      const j = await res.json().catch(() => null);
      toast.error(j?.message ?? '등록에 실패했습니다.');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(BACK_HREF)}>
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-xl font-bold text-gray-900">후기 등록</h2>
        </div>
        <Button
          disabled={saving}
          onClick={handleSave}
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          <Check className="size-4" />
          {saving ? '저장 중...' : '등록'}
        </Button>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <span className="text-gray-700">활성</span>
            </label>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-500">카테고리</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger size="sm" className="w-full border-gray-200 text-sm h-[38px]! px-3! py-0!">
                <SelectValue placeholder="선택" />
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
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-500">작성일자</label>
            <input
              type="date"
              value={writtenAt}
              onChange={(e) => setWrittenAt(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-500">제목 (선택)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-500">태그</label>
            <TagInput value={tags} onChange={setTags} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">내용</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewEditor content="" onChange={setContent} />
        </CardContent>
      </Card>
    </div>
  );
}
