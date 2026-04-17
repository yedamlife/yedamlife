'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Field {
  key: string;
  label: string;
  editable?: boolean;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface DetailPageProps {
  title: string;
  apiPath: string;
  id: string;
  fields: Field[];
  backHref: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: '접수', className: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
  { value: 'in_progress', label: '진행중', className: 'bg-blue-50 text-blue-700 border-blue-300' },
  { value: 'completed', label: '완료', className: 'bg-green-50 text-green-700 border-green-300' },
];

export function DetailPage({ title, apiPath, id, fields, backHref }: DetailPageProps) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [editedData, setEditedData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${apiPath}/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
          setEditedData(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, [apiPath, id]);

  const hasChanges = useMemo(() => {
    if (!data) return false;
    return Object.keys(editedData).some(
      (key) => JSON.stringify(editedData[key]) !== JSON.stringify(data[key]),
    );
  }, [data, editedData]);

  const handleFieldChange = (key: string, value: string) => {
    setEditedData((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatusChange = (newStatus: string) => {
    setEditedData((prev) => ({ ...prev, status: newStatus }));
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);

    const changedFields: Record<string, unknown> = {};
    for (const key of Object.keys(editedData)) {
      if (JSON.stringify(editedData[key]) !== JSON.stringify(data![key])) {
        changedFields[key] = editedData[key];
      }
    }

    const res = await fetch(`${apiPath}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changedFields),
    });

    if (res.ok) {
      setData({ ...data, ...changedFields });
      toast.success('수정이 완료되었습니다.');
    } else {
      toast.error('수정에 실패했습니다.');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-400">로딩 중...</div>;
  }

  if (!data) {
    return <div className="flex h-64 items-center justify-center text-gray-400">데이터를 찾을 수 없습니다.</div>;
  }

  const currentStatus = (editedData.status ?? data.status) as string | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(backHref)}>
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        <Button
          disabled={!hasChanges || saving}
          onClick={handleSave}
          className={hasChanges
            ? 'bg-gray-900 text-white hover:bg-gray-800'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        >
          <Check className="size-4" />
          {saving ? '저장 중...' : '수정완료'}
        </Button>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">상세 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
            {fields.map((field) => {
              const editable = field.editable !== false;
              const value = editedData[field.key];
              return (
                <div key={field.key}>
                  <dt className="mb-1.5 text-sm font-medium text-gray-500">{field.label}</dt>
                  <dd>
                    {field.render ? (
                      field.render(value, editedData)
                    ) : editable ? (
                      <input
                        type="text"
                        value={String(value ?? '')}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{String(value ?? '-')}</span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </CardContent>
      </Card>

      {currentStatus && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base">상태 변경</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleStatusChange(s.value)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                    currentStatus === s.value
                      ? s.className
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">관리자 메모</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={String(editedData.admin_note ?? '')}
            onChange={(e) => handleFieldChange('admin_note', e.target.value)}
            placeholder="관리자 메모를 입력하세요..."
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors"
          />
        </CardContent>
      </Card>

      {data.created_at && (
        <p className="text-sm text-gray-400">
          접수일: {new Date(data.created_at as string).toLocaleDateString('ko-KR')}
        </p>
      )}
    </div>
  );
}
