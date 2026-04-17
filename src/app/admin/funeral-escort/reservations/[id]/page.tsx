'use client';

import { use } from 'react';
import { DetailPage } from '@/components/admin/detail-page';

const fields = [
  { key: 'writer_name', label: '작성자' },
  { key: 'writer_phone', label: '작성자 연락처' },
  { key: 'deceased_name', label: '고인 성함' },
  { key: 'deceased_gender', label: '고인 성별' },
  { key: 'funeral_hall', label: '장례식장' },
  { key: 'funeral_hall_address', label: '장례식장 주소' },
  { key: 'room_name', label: '호실' },
  { key: 'departure_date', label: '발인일' },
  { key: 'departure_hour', label: '발인 시' },
  { key: 'departure_minute', label: '발인 분' },
  { key: 'funeral_method', label: '장법' },
  { key: 'destination_address', label: '도착지 주소' },
  { key: 'destination_detail', label: '도착지 상세' },
  { key: 'clothing', label: '수의' },
  { key: 'people', label: '인원' },
  { key: 'price', label: '금액' },
];

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <DetailPage
      title="운구의전 예약 상세"
      apiPath="/api/v1/admin/funeral-escort/reservations"
      id={id}
      fields={fields}
      backHref="/admin/funeral-escort/reservations"
    />
  );
}
