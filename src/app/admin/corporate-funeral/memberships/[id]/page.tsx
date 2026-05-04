'use client';

import { use } from 'react';
import { DetailPage } from '@/components/admin/detail-page';

const fields = [
  { key: 'membership_no', label: '회원번호', editable: false },
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  { key: 'company_name', label: '회사명' },
  { key: 'position', label: '직책' },
  { key: 'manager_email', label: '담당자 이메일' },
  { key: 'referrer', label: '추천인' },
  { key: 'other_requirements', label: '기타 요구사항' },
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
