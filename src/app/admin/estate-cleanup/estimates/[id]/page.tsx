'use client';

import { use } from 'react';
import { DetailPage } from '@/components/admin/detail-page';

const fields = [
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  { key: 'address', label: '주소' },
  { key: 'address_detail', label: '상세 주소' },
  { key: 'service_types', label: '서비스 종류' },
  { key: 'area', label: '면적' },
  { key: 'floor', label: '층수' },
  { key: 'housing_type', label: '주거 유형' },
  { key: 'visit_date', label: '희망 방문일' },
  { key: 'message', label: '요청 내용' },
];

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <DetailPage
      title="견적 신청 상세"
      apiPath="/api/v1/admin/estate-cleanup/estimates"
      id={id}
      fields={fields}
      backHref="/admin/estate-cleanup/estimates"
    />
  );
}
