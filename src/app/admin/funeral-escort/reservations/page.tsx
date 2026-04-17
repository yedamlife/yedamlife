'use client';

import { ServiceListPage } from '@/components/admin/service-list-page';
import type { Column } from '@/components/admin/data-table';

interface Row {
  id: number;
  status?: string;
  writer_name: string;
  writer_phone: string;
  deceased_name: string;
  funeral_hall: string;
  departure_date: string;
  created_at: string;
}

const columns: Column<Row>[] = [
  { key: 'id', label: 'ID' },
  { key: 'writer_name', label: '작성자' },
  { key: 'writer_phone', label: '연락처' },
  { key: 'deceased_name', label: '고인 성함' },
  { key: 'funeral_hall', label: '장례식장' },
  { key: 'departure_date', label: '발인일' },
  {
    key: 'created_at',
    label: '접수일',
    render: (row) => new Date(row.created_at).toLocaleDateString('ko-KR'),
  },
];

export default function Page() {
  return (
    <ServiceListPage
      title="운구의전 - 예약 관리"
      apiPath="/api/v1/admin/funeral-escort/reservations"
      columns={columns}
    />
  );
}
