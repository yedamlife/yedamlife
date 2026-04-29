'use client';

import { ServiceListPage } from '@/components/admin/service-list-page';
import type { Column } from '@/components/admin/data-table';
import { productLabel } from '@/lib/alimtalk/products';

interface Row {
  id: number;
  status?: string;
  name: string;
  phone: string;
  product: string;
  region: string;
  created_at: string;
}

const columns: Column<Row>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  { key: 'product', label: '상품', render: (row) => productLabel(row.product) },
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
      title="기업상조 - 상담 신청"
      apiPath="/api/v1/admin/corporate-funeral/consultations"
      columns={columns}
    />
  );
}
