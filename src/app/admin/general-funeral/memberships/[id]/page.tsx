'use client';

import { use } from 'react';
import { DetailPage } from '@/components/admin/detail-page';

const fields = [
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  { key: 'birth_date', label: '생년월일' },
  { key: 'gender', label: '성별' },
  { key: 'religion', label: '종교' },
  { key: 'guardian_name', label: '보호자 이름' },
  { key: 'guardian_relation', label: '보호자 관계' },
  { key: 'guardian_phone', label: '보호자 연락처' },
  { key: 'address', label: '주소' },
  { key: 'address_detail', label: '상세 주소' },
  { key: 'product', label: '상품' },
  { key: 'referrer', label: '추천인' },
];

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <DetailPage
      title="가입 신청 상세"
      apiPath="/api/v1/admin/general-funeral/memberships"
      id={id}
      fields={fields}
      backHref="/admin/general-funeral/memberships"
    />
  );
}
