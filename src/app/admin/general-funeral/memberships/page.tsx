'use client';

import { ServiceListPage } from '@/components/admin/service-list-page';
import type { Column } from '@/components/admin/data-table';
import { productLabel } from '@/lib/alimtalk/products';

interface Row {
  id: number;
  status?: string;
  membership_no: string | null;
  name: string;
  phone: string;
  product: string;
  address: string;
  created_at: string;
}

const columns: Column<Row>[] = [
  { key: 'id', label: 'ID' },
  { key: 'membership_no', label: '회원번호' },
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  { key: 'product', label: '상품', render: (row) => productLabel(row.product) },
  { key: 'address', label: '주소' },
  {
    key: 'created_at',
    label: '접수일',
    render: (row) => new Date(row.created_at).toLocaleDateString('ko-KR'),
  },
];

export default function Page() {
  return (
    <ServiceListPage
      title="일반상조 - 가입 신청"
      apiPath="/api/v1/admin/general-funeral/memberships"
      columns={columns}
    />
  );
}
