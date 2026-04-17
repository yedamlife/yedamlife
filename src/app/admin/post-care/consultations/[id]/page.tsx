'use client';

import { use } from 'react';
import { DetailPage } from '@/components/admin/detail-page';

const fields = [
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  { key: 'service_type', label: '서비스 유형' },
  { key: 'region', label: '지역' },
  { key: 'message', label: '문의 내용' },
];

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <DetailPage
      title="사후행정케어 상담신청 상세"
      apiPath="/api/v1/admin/post-care/consultations"
      id={id}
      fields={fields}
      backHref="/admin/post-care/consultations"
    />
  );
}
