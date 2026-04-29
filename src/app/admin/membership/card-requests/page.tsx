'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { ServiceListPage } from '@/components/admin/service-list-page';
import type { Column } from '@/components/admin/data-table';

interface Row {
  id: number;
  status?: string;
  member_no: string | null;
  matched_member_no: string | null;
  membership_type: string | null;
  membership_id: number | null;
  name: string;
  phone: string;
  zonecode: string;
  address: string;
  detail_address: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: '신청',
  shipped: '발송',
  done: '완료',
  canceled: '취소',
};

const TYPE_LABEL: Record<string, string> = {
  general: '일반상조',
  corporate: '기업상조',
};

const columns: Column<Row>[] = [
  { key: 'id', label: 'ID' },
  {
    key: 'matched_member_no',
    label: '회원번호',
    render: (row) => row.matched_member_no || row.member_no || '-',
  },
  {
    key: 'membership_type',
    label: '구분',
    render: (row) =>
      row.membership_type ? TYPE_LABEL[row.membership_type] || row.membership_type : '미매칭',
  },
  { key: 'name', label: '성함' },
  { key: 'phone', label: '연락처' },
  {
    key: 'address',
    label: '주소',
    render: (row) =>
      `[${row.zonecode}] ${row.address}${row.detail_address ? ' ' + row.detail_address : ''}`,
  },
  {
    key: 'status',
    label: '상태',
    render: (row) => STATUS_LABEL[row.status || 'pending'] || row.status,
  },
  {
    key: 'created_at',
    label: '접수일',
    render: (row) => new Date(row.created_at).toLocaleDateString('ko-KR'),
  },
  {
    key: 'membership_link',
    label: '가입 신청',
    render: (row) => {
      if (!row.membership_type || !row.membership_id) {
        return <span className="text-xs text-gray-400">미매칭</span>;
      }
      const href =
        row.membership_type === 'general'
          ? `/admin/general-funeral/memberships/${row.membership_id}`
          : `/admin/corporate-funeral/memberships/${row.membership_id}`;
      return (
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
        >
          바로가기
          <ExternalLink className="w-3 h-3" />
        </Link>
      );
    },
  },
];

export default function Page() {
  return (
    <ServiceListPage
      title="멤버십관리 - 실물 카드 신청 내역"
      apiPath="/api/v1/admin/membership/card-requests"
      columns={columns}
    />
  );
}
