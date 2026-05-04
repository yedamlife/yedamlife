'use client';

import { use } from 'react';
import Link from 'next/link';
import { DetailPage } from '@/components/admin/detail-page';

const MEMBERSHIP_TYPE_LABEL: Record<string, string> = {
  general: '일반상조',
  corporate: '기업상조',
};

const fields = [
  { key: 'membership_no', label: '회원번호', editable: false },
  { key: 'name', label: '성함' },
  { key: 'phone', label: '연락처' },
  { key: 'zonecode', label: '우편번호' },
  { key: 'address', label: '주소' },
  { key: 'detail_address', label: '상세주소' },
  {
    key: 'membership_link',
    label: '가입 신청',
    editable: false,
    render: (_: unknown, row: Record<string, unknown>) => {
      const type = row.membership_type as string | null;
      const id = row.membership_id as string | null;
      if (!type || !id) {
        return <span className="text-sm text-gray-400">미매칭</span>;
      }
      const href =
        type === 'general'
          ? `/admin/general-funeral/memberships/${id}`
          : `/admin/corporate-funeral/memberships/${id}`;
      return (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
        >
          {MEMBERSHIP_TYPE_LABEL[type] || type} 가입 신청 보기 →
        </Link>
      );
    },
  },
];

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <DetailPage
      title="실물 카드 신청 상세"
      apiPath="/api/v1/admin/membership/card-requests"
      id={id}
      fields={fields}
      backHref="/admin/membership/card-requests"
    />
  );
}
