'use client';

import { use } from 'react';
import { DetailPage } from '@/components/admin/detail-page';

const fields = [
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  { key: 'religion', label: '종교' },
  { key: 'region', label: '희망 지역' },
  { key: 'district', label: '세부 지역' },
  { key: 'product_name', label: '선택 장지' },
  { key: 'budget', label: '예산' },
  { key: 'message', label: '문의 내용' },
];

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <DetailPage
      title="장지+ 상담 신청 상세"
      apiPath="/api/v1/admin/burial-plus/consultations"
      id={id}
      fields={fields}
      backHref="/admin/burial-plus/consultations"
    />
  );
}
