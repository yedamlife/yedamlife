'use client';

import { ServiceListPage } from '@/components/admin/service-list-page';
import type { Column } from '@/components/admin/data-table';
import { ExternalLink } from 'lucide-react';

interface Row {
  id: number;
  status?: string;
  name: string;
  phone: string;
  religion: string;
  region: string;
  product_id: number | null;
  product_name: string | null;
  created_at: string;
}

const columns: Column<Row>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  { key: 'religion', label: '종교' },
  { key: 'region', label: '희망 지역' },
  {
    key: 'product_name',
    label: '선택 장지',
    render: (row) =>
      row.product_name ? (
        <span className="inline-flex items-center gap-1.5">
          {row.product_name}
          {row.product_id && (
            <a
              href={`/admin/burial-plus/products/${row.product_id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-gray-700 transition-colors"
              title="장지 상세보기"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </span>
      ) : (
        '-'
      ),
  },
  {
    key: 'created_at',
    label: '접수일',
    render: (row) => new Date(row.created_at).toLocaleDateString('ko-KR'),
  },
];

export default function Page() {
  return (
    <ServiceListPage
      title="장지+ - 상담 신청"
      apiPath="/api/v1/admin/burial-plus/consultations"
      columns={columns}
    />
  );
}
