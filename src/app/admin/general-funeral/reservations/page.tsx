'use client';

import { ServiceListPage } from '@/components/admin/service-list-page';
import type { Column } from '@/components/admin/data-table';

interface Row {
  id: number;
  status?: string;
  name: string;
  contact_number: string;
  funeral_location: string;
  funeral_scale: string;
  created_at: string;
}

const columns: Column<Row>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '이름' },
  { key: 'contact_number', label: '연락처' },
  { key: 'funeral_location', label: '장례 장소' },
  { key: 'funeral_scale', label: '장례 규모' },
  {
    key: 'created_at',
    label: '접수일',
    render: (row) => new Date(row.created_at).toLocaleDateString('ko-KR'),
  },
];

export default function Page() {
  return (
    <ServiceListPage
      title="일반상조 - 장례 설계 예약"
      apiPath="/api/v1/admin/general-funeral/reservations"
      columns={columns}
    />
  );
}
