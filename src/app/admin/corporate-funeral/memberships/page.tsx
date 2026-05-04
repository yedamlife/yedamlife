'use client';

import { ServiceListPage } from '@/components/admin/service-list-page';
import type { Column } from '@/components/admin/data-table';

interface Row {
  id: number;
  status?: string;
  membership_no: string | null;
  name: string;
  phone: string;
  company_name: string;
  created_at: string;
}

const columns: Column<Row>[] = [
  { key: 'id', label: 'ID' },
  { key: 'membership_no', label: '회원번호' },
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  { key: 'company_name', label: '회사명' },
  {
    key: 'created_at',
    label: '접수일',
    render: (row) => new Date(row.created_at).toLocaleDateString('ko-KR'),
  },
];

export default function Page() {
  return (
    <ServiceListPage
      title="기업상조 - 가입 신청"
      apiPath="/api/v1/admin/corporate-funeral/memberships"
      columns={columns}
    />
  );
}
