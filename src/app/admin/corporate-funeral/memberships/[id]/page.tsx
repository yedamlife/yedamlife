'use client';

import { use } from 'react';
import { DetailPage } from '@/components/admin/detail-page';

const fields = [
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  { key: 'gender', label: '성별' },
  { key: 'company_name', label: '회사명' },
  { key: 'position', label: '직책' },
  { key: 'address', label: '주소' },
  { key: 'address_detail', label: '상세 주소' },
  { key: 'product', label: '상품' },
  { key: 'referrer', label: '추천인' },
];

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <DetailPage
      title="기업 가입 신청 상세"
      apiPath="/api/v1/admin/corporate-funeral/memberships"
      id={id}
      fields={fields}
      backHref="/admin/corporate-funeral/memberships"
    />
  );
}
