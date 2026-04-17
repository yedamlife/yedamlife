'use client';

import { ServiceListPage } from '@/components/admin/service-list-page';
import type { Column } from '@/components/admin/data-table';

interface Row {
  id: number;
  status?: string;
  name: string;
  phone: string;
  address: string;
  housing_type: string;
  created_at: string;
}

const columns: Column<Row>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  { key: 'address', label: '주소' },
  { key: 'housing_type', label: '주거 유형' },
  {
    key: 'created_at',
    label: '접수일',
    render: (row) => new Date(row.created_at).toLocaleDateString('ko-KR'),
  },
];

export default function Page() {
  return (
    <ServiceListPage
      title="유품정리 - 견적 신청"
      apiPath="/api/v1/admin/estate-cleanup/estimates"
      columns={columns}
    />
  );
}
