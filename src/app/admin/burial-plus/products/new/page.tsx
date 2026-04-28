'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { BpProductForm, type BpProductFormValue } from '@/components/admin/bp-product-form';

const BACK_HREF = '/admin/burial-plus/products';

const INITIAL: BpProductFormValue = {
  categories: [],
  religions: [],
  intro: {
    companyname: '',
    publiccodeLabel: '사설',
    representativename: '',
    companyno: '',
    telephone: '',
    faxnum: '',
    homepage: '',
    fulladdress: '',
    zipcd: '',
    sidonm: '',
    traffpublic: '',
    traffowner: '',
    etcinfw: '',
    facilities: {
      handicap: false,
      mealroom: false,
      parking: false,
      parkingCount: null,
      supermarket: false,
      waitroom: false,
    },
  },
  price: { hallRent: [], commission: [], funeralItem: [] },
  photos: [],
  related_facilities: [],
  min_price: null,
  is_recommended: false,
  is_active: true,
  sort_all: null,
  sort_charnel: null,
  sort_tree: null,
  sort_park: null,
  sort_ocean: null,
};

function randomFacilityCd() {
  // 9자리 숫자 (예담 수동 등록분 식별용)
  return '9' + Math.floor(100_000_000 + Math.random() * 900_000_000).toString().slice(0, 9);
}

export default function Page() {
  const router = useRouter();
  const [value, setValue] = useState<BpProductFormValue>(INITIAL);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!value.intro.companyname?.trim()) {
      toast.error('장지명을 입력해주세요.');
      return;
    }
    if (value.categories.length === 0) {
      toast.error('카테고리를 1개 이상 선택해주세요.');
      return;
    }

    setSaving(true);
    const res = await fetch('/api/v1/admin/burial-plus/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facility_cd: randomFacilityCd(),
        facility_group_cd: 'MANUAL',
        menu_id: 'M0001000100000000',
        ...value,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      toast.success('등록되었습니다.');
      router.push(`${BACK_HREF}/${json.data.id}`);
    } else {
      const j = await res.json().catch(() => null);
      toast.error(j?.message ?? '등록에 실패했습니다.');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(BACK_HREF)}>
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-xl font-bold text-gray-900">장지 등록</h2>
        </div>
        <Button
          disabled={saving}
          onClick={handleSave}
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          <Check className="size-4" />
          {saving ? '저장 중...' : '등록'}
        </Button>
      </div>

      <BpProductForm value={value} onChange={setValue} />
    </div>
  );
}
