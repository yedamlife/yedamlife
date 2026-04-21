'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { ReviewEditor } from '@/components/admin/review-editor';

const BACK_HREF = '/admin/notices';

export default function Page() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return toast.error('제목을 입력해주세요.');
    if (!content.trim() || content === '<p></p>')
      return toast.error('내용을 입력해주세요.');

    setSaving(true);
    const res = await fetch('/api/v1/admin/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(BACK_HREF)}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-xl font-bold text-gray-900">공지 등록</h2>
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
        <CardContent>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-500">
              제목
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지사항 제목을 입력하세요"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
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
