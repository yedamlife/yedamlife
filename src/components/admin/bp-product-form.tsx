'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/components/ui/utils';
import { Phone, Printer, MapPin } from 'lucide-react';

const FACILITY_TYPE_LABEL: Record<string, string> = {
  CharnelDet: '봉안시설',
  NaturalBurialDet: '자연장지',
  CemeteryDet: '공원묘지',
};

const CATEGORIES = ['봉안당', '수목장', '공원묘지', '해양장'] as const;
const TABS = ['소개', '가격', '사진', '시설'] as const;

const SORT_FIELDS: { key: keyof Pick<BpProductFormValue, 'sort_all' | 'sort_charnel' | 'sort_tree' | 'sort_park' | 'sort_ocean'>; label: string; category: string | null }[] = [
  { key: 'sort_all', label: '전체', category: null },
  { key: 'sort_charnel', label: '봉안당', category: '봉안당' },
  { key: 'sort_tree', label: '수목장', category: '수목장' },
  { key: 'sort_park', label: '공원묘지', category: '공원묘지' },
  { key: 'sort_ocean', label: '해양장', category: '해양장' },
];
type Tab = (typeof TABS)[number];

interface Intro {
  companyname?: string | null;
  publiccodeLabel?: string | null;
  representativename?: string | null;
  companyno?: string | null;
  telephone?: string | null;
  faxnum?: string | null;
  homepage?: string | null;
  fulladdress?: string | null;
  zipcd?: string | null;
  sidonm?: string | null;
  etcinfw?: string | null;
  traffpublic?: string | null;
  traffowner?: string | null;
  facilities?: {
    handicap?: boolean;
    mealroom?: boolean;
    parking?: boolean;
    parkingCount?: number | null;
    supermarket?: boolean;
    waitroom?: boolean;
  } | null;
  [key: string]: unknown;
}

interface PriceItem {
  item?: string | null;
  category?: string | null;
  subcategory?: string | null;
  rentcontent?: string | null;
  facilityamt?: number | null;
  facilityamtm?: string | null;
  sale?: boolean;
  saleNm?: string | null;
}

interface Price {
  hallRent?: PriceItem[];
  commission?: PriceItem[];
  funeralItem?: PriceItem[];
}

interface Photo {
  fileorder?: number;
  filetitle?: string | null;
  filename?: string | null;
  fileurl?: string | null;
  fileurl_full?: string | null;
  filesize?: number | null;
}

interface RelatedFacility {
  facilitycd?: string | null;
  facilitygroupcd?: string | null;
  companyname?: string | null;
  type?: string | null;
  fulladdress?: string | null;
  telephone?: string | null;
  fileurl_full?: string | null;
}

export interface BpProductFormValue {
  categories: string[];
  intro: Intro;
  price: Price;
  photos: Photo[];
  related_facilities: RelatedFacility[];
  min_price: number | null;
  is_recommended: boolean;
  is_active: boolean;
  thumbnail_url: string | null;
  sort_all: number | null;
  sort_charnel: number | null;
  sort_tree: number | null;
  sort_park: number | null;
  sort_ocean: number | null;
}

interface Props {
  value: BpProductFormValue;
  onChange: (next: BpProductFormValue) => void;
  productId?: string;
}

export function BpProductForm({ value, onChange, productId }: Props) {
  const [tab, setTab] = useState<Tab>('소개');
  const [uploading, setUploading] = useState(false);

  const update = <K extends keyof BpProductFormValue>(key: K, val: BpProductFormValue[K]) => {
    onChange({ ...value, [key]: val });
  };

  const updateIntro = (patch: Partial<Intro>) => update('intro', { ...value.intro, ...patch });

  const toggleCategory = (c: string) => {
    const has = value.categories.includes(c);
    update('categories', has ? value.categories.filter((x) => x !== c) : [...value.categories, c]);
  };

  const intro = value.intro || {};
  const price = value.price || {};
  const photos = value.photos || [];
  const relatedFacilities = value.related_facilities || [];
  const facilities = intro.facilities || {};

  const defaultImage = photos[0]?.fileurl_full;
  const heroImage = value.thumbnail_url || defaultImage;
  const isThumbnail = !!value.thumbnail_url;

  const handleThumbnailUpload = async (file: File) => {
    if (!productId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/v1/admin/burial-plus/products/${productId}/thumbnail`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        update('thumbnail_url', json.url);
      } else {
        alert(json.message || '업로드에 실패했습니다.');
      }
    } catch {
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 카드 */}
      <Card className="overflow-hidden border-gray-200">
        <div className="grid gap-6 p-6 md:grid-cols-[240px_1fr]">
          <div className="space-y-2">
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-gray-100">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImage} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-sm text-gray-400">대표 이미지 없음</span>
              )}
            </div>
            {productId && (
              <div className="flex gap-2">
                <label className="flex-1 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  {uploading ? '업로드 중...' : '이미지 업로드'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleThumbnailUpload(file);
                      e.target.value = '';
                    }}
                  />
                </label>
                {isThumbnail && (
                  <button
                    type="button"
                    onClick={() => update('thumbnail_url', null)}
                    className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    기본 이미지로 변경
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch
                  checked={value.is_recommended}
                  onCheckedChange={(checked) => update('is_recommended', checked)}
                />
                <span className="text-gray-700">추천장지</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch
                  checked={value.is_active}
                  onCheckedChange={(checked) => update('is_active', checked)}
                />
                <span className="text-gray-700">활성</span>
              </label>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">장지명</label>
              <input
                value={intro.companyname ?? ''}
                onChange={(e) => updateIntro({ companyname: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-base font-semibold outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">카테고리 (복수 선택 가능)</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const on = value.categories.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCategory(c)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-sm transition-colors',
                        on
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-500">공설/사설</label>
                <Select
                  value={intro.publiccodeLabel ?? ''}
                  onValueChange={(label) =>
                    updateIntro({
                      publiccodeLabel: label || null,
                      publiccode:
                        label === '공설' ? 'TCM0100001' : label === '사설' ? 'TCM0100002' : null,
                    })
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="w-full border-gray-200 text-sm h-[38px]! px-3! py-0!"
                  >
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="공설">공설</SelectItem>
                    <SelectItem value="사설">사설</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field label="대표자" value={intro.representativename ?? ''} onChange={(v) => updateIntro({ representativename: v })} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-500">
                최소금액
                {value.min_price != null && value.min_price > 0 && (
                  <span className="ml-2 text-xs text-gray-400">
                    {value.min_price.toLocaleString()}원
                  </span>
                )}
              </label>
              <input
                type="number"
                value={value.min_price ?? ''}
                onChange={(e) =>
                  update('min_price', e.target.value ? Number(e.target.value) : null)
                }
                placeholder="원 단위 숫자 입력"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-500">카테고리별 정렬 순서</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SORT_FIELDS
                  .filter((sf) => sf.category === null || value.categories.includes(sf.category))
                  .map((sf) => (
                    <div key={sf.key} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                      <span className="shrink-0 text-xs font-medium text-gray-500">{sf.label}</span>
                      <input
                        type="number"
                        value={value[sf.key] ?? ''}
                        onChange={(e) =>
                          update(sf.key, e.target.value ? Number(e.target.value) : null)
                        }
                        placeholder="0"
                        className="w-full min-w-0 rounded-md border border-gray-200 px-2 py-1 text-right text-sm outline-none focus:border-gray-400"
                      />
                    </div>
                  ))}
              </div>
              <p className="mt-1 text-xs text-gray-400">숫자가 작을수록 먼저 노출됩니다. 해당 카테고리에 속한 항목만 표시됩니다.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 탭 */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'relative px-5 py-2.5 text-sm font-medium transition-colors',
              tab === t ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t}
            {tab === t && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gray-900" />}
          </button>
        ))}
      </div>

      {tab === '소개' && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Field label="사업자번호" value={intro.companyno ?? ''} onChange={(v) => updateIntro({ companyno: v })} />
            <Field label="우편번호" value={intro.zipcd ?? ''} onChange={(v) => updateIntro({ zipcd: v })} />
            <div className="sm:col-span-2">
              <Field label="주소" value={intro.fulladdress ?? ''} onChange={(v) => updateIntro({ fulladdress: v })} icon={<MapPin className="size-4" />} />
            </div>
            <Field label="지역명" value={intro.sidonm ?? ''} onChange={(v) => updateIntro({ sidonm: v })} />
            <Field label="홈페이지" value={intro.homepage ?? ''} onChange={(v) => updateIntro({ homepage: v })} />
            <Field label="전화번호" value={intro.telephone ?? ''} onChange={(v) => updateIntro({ telephone: v })} icon={<Phone className="size-4" />} />
            <Field label="팩스번호" value={intro.faxnum ?? ''} onChange={(v) => updateIntro({ faxnum: v })} icon={<Printer className="size-4" />} />

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-500">대중교통 안내</label>
              <textarea
                value={intro.traffpublic ?? ''}
                onChange={(e) => updateIntro({ traffpublic: e.target.value })}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-500">자가용 안내</label>
              <textarea
                value={intro.traffowner ?? ''}
                onChange={(e) => updateIntro({ traffowner: e.target.value })}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-500">기타 안내</label>
              <textarea
                value={intro.etcinfw ?? ''}
                onChange={(e) => updateIntro({ etcinfw: e.target.value })}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {tab === '가격' && <PriceTab price={price} onChange={(p) => update('price', p)} />}

      {tab === '사진' && <PhotosTab photos={photos} onChange={(ps) => update('photos', ps)} />}

      {tab === '시설' && (
        <div className="space-y-4">
          <RelatedFacilitiesCard
            items={relatedFacilities}
            onChange={(list) => update('related_facilities', list)}
          />

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base">부대시설</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ['handicap', '장애인 편의시설'],
                  ['mealroom', '식당'],
                  ['parking', '주차장'],
                  ['supermarket', '매점'],
                  ['waitroom', '대기실'],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                >
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(facilities[key])}
                    onChange={(e) =>
                      updateIntro({ facilities: { ...facilities, [key]: e.target.checked } })
                    }
                    className="size-4"
                  />
                </label>
              ))}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">주차 가능 대수</span>
                <input
                  type="number"
                  value={facilities.parkingCount ?? ''}
                  onChange={(e) =>
                    updateIntro({
                      facilities: {
                        ...facilities,
                        parkingCount: e.target.value ? Number(e.target.value) : null,
                      },
                    })
                  }
                  className="w-28 rounded-lg border border-gray-200 px-2 py-1 text-sm outline-none focus:border-gray-400"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-500">
        {icon}
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
      />
    </div>
  );
}

function PriceTab({ price, onChange }: { price: Price; onChange: (p: Price) => void }) {
  const sections = useMemo(
    () =>
      [
        ['hallRent', '시설사용료'],
        ['commission', '수수료/부대비'],
        ['funeralItem', '장례용품'],
      ] as const,
    [],
  );

  const update = (key: keyof Price, items: PriceItem[]) => onChange({ ...price, [key]: items });
  const updateItem = (key: keyof Price, idx: number, patch: Partial<PriceItem>) => {
    const items = [...(price[key] || [])];
    items[idx] = { ...items[idx], ...patch };
    update(key, items);
  };
  const addItem = (key: keyof Price) =>
    update(key, [...(price[key] || []), { item: '', category: '', rentcontent: '', facilityamt: 0 }]);
  const removeItem = (key: keyof Price, idx: number) =>
    update(key, (price[key] || []).filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {sections.map(([key, title]) => {
        const items = price[key] || [];
        return (
          <Card key={key} className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{title}</CardTitle>
              <button
                type="button"
                onClick={() => addItem(key)}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                + 추가
              </button>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">항목이 없습니다.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                        <th className="py-2 pr-3 font-medium">항목</th>
                        <th className="py-2 pr-3 font-medium">분류</th>
                        <th className="py-2 pr-3 font-medium">세부내용</th>
                        <th className="py-2 pr-3 font-medium">금액(원)</th>
                        <th className="py-2 pr-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-0">
                          <td className="py-2 pr-3">
                            <input
                              value={row.item ?? ''}
                              onChange={(e) => updateItem(key, idx, { item: e.target.value })}
                              className="w-full rounded-md border border-gray-200 px-2 py-1 outline-none focus:border-gray-400"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              value={row.category ?? ''}
                              onChange={(e) => updateItem(key, idx, { category: e.target.value })}
                              className="w-full rounded-md border border-gray-200 px-2 py-1 outline-none focus:border-gray-400"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              value={row.rentcontent ?? ''}
                              onChange={(e) => updateItem(key, idx, { rentcontent: e.target.value })}
                              className="w-full rounded-md border border-gray-200 px-2 py-1 outline-none focus:border-gray-400"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="number"
                              value={row.facilityamt ?? ''}
                              onChange={(e) =>
                                updateItem(key, idx, {
                                  facilityamt: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                              className="w-32 rounded-md border border-gray-200 px-2 py-1 text-right outline-none focus:border-gray-400"
                            />
                          </td>
                          <td className="py-2 pr-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeItem(key, idx)}
                              className="text-xs text-red-500 hover:text-red-600"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function PhotosTab({ photos, onChange }: { photos: Photo[]; onChange: (ps: Photo[]) => void }) {
  const update = (idx: number, patch: Partial<Photo>) => {
    const next = [...photos];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };
  const remove = (idx: number) => onChange(photos.filter((_, i) => i !== idx));
  const add = () =>
    onChange([
      ...photos,
      { fileorder: photos.length + 1, filetitle: '', fileurl_full: '' },
    ]);

  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">사진</CardTitle>
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          + 추가
        </button>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">사진이 없습니다.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p, idx) => (
              <div key={idx} className="space-y-2 rounded-lg border border-gray-200 p-3">
                <div className="aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
                  {p.fileurl_full ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.fileurl_full} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-gray-400">
                      미리보기 없음
                    </div>
                  )}
                </div>
                <input
                  placeholder="제목"
                  value={p.filetitle ?? ''}
                  onChange={(e) => update(idx, { filetitle: e.target.value })}
                  className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm outline-none focus:border-gray-400"
                />
                <input
                  placeholder="이미지 URL"
                  value={p.fileurl_full ?? ''}
                  onChange={(e) => update(idx, { fileurl_full: e.target.value })}
                  className="w-full rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="w-full rounded-md border border-gray-200 py-1 text-xs text-red-500 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RelatedFacilitiesCard({
  items,
  onChange,
}: {
  items: RelatedFacility[];
  onChange: (list: RelatedFacility[]) => void;
}) {
  const update = (idx: number, patch: Partial<RelatedFacility>) => {
    const next = [...items];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const add = () =>
    onChange([
      ...items,
      {
        facilitycd: '',
        companyname: '',
        type: 'CharnelDet',
        fulladdress: '',
        telephone: '',
        fileurl_full: '',
      },
    ]);

  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">관련 시설</CardTitle>
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          + 추가
        </button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">관련 시설이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {items.map((rf, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 p-3 sm:flex-row"
              >
                {/* 썸네일 */}
                <div className="relative size-28 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:size-24">
                  {rf.fileurl_full ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={rf.fileurl_full} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-[11px] text-gray-400">
                      사진 없음
                    </div>
                  )}
                  {rf.type && (
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {FACILITY_TYPE_LABEL[rf.type] ?? rf.type}
                    </span>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex flex-1 flex-col gap-2">
                  <input
                    value={rf.companyname ?? ''}
                    onChange={(e) => update(idx, { companyname: e.target.value })}
                    placeholder="시설명"
                    className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm font-semibold outline-none focus:border-gray-400"
                  />
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <MapPin className="mt-1.5 size-3.5 shrink-0" />
                    <input
                      value={rf.fulladdress ?? ''}
                      onChange={(e) => update(idx, { fulladdress: e.target.value })}
                      placeholder="주소"
                      className="w-full rounded-md border border-gray-200 px-2 py-1 outline-none focus:border-gray-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="size-3.5 shrink-0" />
                    <input
                      value={rf.telephone ?? ''}
                      onChange={(e) => update(idx, { telephone: e.target.value })}
                      placeholder="전화번호"
                      className="w-40 rounded-md border border-gray-200 px-2 py-1 outline-none focus:border-gray-400"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={rf.fileurl_full ?? ''}
                      onChange={(e) => update(idx, { fileurl_full: e.target.value })}
                      placeholder="이미지 URL"
                      className="flex-1 min-w-[200px] rounded-md border border-gray-200 px-2 py-1 text-[11px] outline-none focus:border-gray-400"
                    />
                    <select
                      value={rf.type ?? ''}
                      onChange={(e) => update(idx, { type: e.target.value })}
                      className="rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:border-gray-400"
                    >
                      <option value="">유형 선택</option>
                      <option value="CharnelDet">봉안시설</option>
                      <option value="NaturalBurialDet">자연장지</option>
                      <option value="CemeteryDet">공원묘지</option>
                    </select>
                  </div>
                </div>

                {/* 삭제 */}
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="self-start rounded-md border border-gray-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50 sm:self-center"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
