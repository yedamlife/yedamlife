'use client';

import { use } from 'react';
import { DetailPage } from '@/components/admin/detail-page';

const fields = [
  { key: 'name', label: '이름' },
  { key: 'contact_number', label: '연락처' },
  { key: 'funeral_location', label: '장례 장소' },
  { key: 'expected_guests', label: '예상 조문객' },
  { key: 'funeral_scale', label: '장례 규모' },
  { key: 'binso_required', label: '빈소 필요 여부' },
  { key: 'escort_service', label: '운구 서비스' },
  { key: 'clothing_type', label: '수의 종류' },
  { key: 'funeral_gown_required', label: '장례복 필요 여부' },
  { key: 'additional_service', label: '추가 서비스' },
];

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <DetailPage
      title="장례 설계 예약 상세"
      apiPath="/api/v1/admin/general-funeral/reservations"
      id={id}
      fields={fields}
      backHref="/admin/general-funeral/reservations"
    />
  );
}
