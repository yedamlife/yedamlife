'use client';

import { ServiceListPage } from '@/components/admin/service-list-page';
import type { Column } from '@/components/admin/data-table';

interface Row {
  id: number;
  status?: string;
  name: string;
  phone: string;
  service_type: string;
  region: string;
  created_at: string;
}

const columns: Column<Row>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  { key: 'service_type', label: '서비스 유형' },
  { key: 'region', label: '지역' },
  {
    key: 'created_at',
    label: '접수일',
    render: (row) => new Date(row.created_at).toLocaleDateString('ko-KR'),
  },
];

export default function Page() {
  return (
    <ServiceListPage
      title="사후행정케어 - 상담신청"
      apiPath="/api/v1/admin/post-care/consultations"
      columns={columns}
    />
  );
}
