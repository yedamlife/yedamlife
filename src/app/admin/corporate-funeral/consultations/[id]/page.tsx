'use client';

import { use } from 'react';
import { DetailPage } from '@/components/admin/detail-page';
import { productLabel } from '@/lib/alimtalk/products';

const fields = [
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  {
    key: 'product',
    label: '상품',
    editable: false,
    render: (value: unknown) => (
      <span className="text-sm text-gray-900">
        {productLabel(value as string | null | undefined)}
      </span>
    ),
  },
  { key: 'region', label: '지역' },
  { key: 'preferred_time', label: '희망 상담 시간' },
];

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <DetailPage
      title="기업 상담 신청 상세"
      apiPath="/api/v1/admin/corporate-funeral/consultations"
      id={id}
      fields={fields}
      backHref="/admin/corporate-funeral/consultations"
    />
  );
}
