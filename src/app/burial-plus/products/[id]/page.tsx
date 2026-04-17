'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Car,
  Bus,
  ScrollText,
  Phone,
  Loader2,
  Globe,
  ParkingCircle,
  Utensils,
  Accessibility,
  Armchair,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BRAND_COLOR, BRAND_COLOR_LIGHT } from '@/components/template/YedamLife/constants';
import { BurialConsultationModal } from '@/components/template/YedamLife/burial-plus';

const FACILITY_TYPE_LABEL: Record<string, string> = {
  CharnelDet: '봉안시설',
  NaturalBurialDet: '자연장지',
  CemeteryDet: '공원묘지',
};

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
}

interface PriceItem {
  item?: string | null;
  category?: string | null;
  subcategory?: string | null;
  rentcontent?: string | null;
  facilityamt?: number | null;
  facilityamtm?: string | null;
}

interface Price {
  hallRent?: PriceItem[];
  commission?: PriceItem[];
  funeralItem?: PriceItem[];
}

interface Photo {
  filetitle?: string | null;
  fileurl_full?: string | null;
}

interface RelatedFacility {
  companyname?: string | null;
  type?: string | null;
  fulladdress?: string | null;
  fileurl_full?: string | null;
}

interface ProductDetail {
  id: number;
  company_name: string;
  sido_name: string | null;
  full_address: string | null;
  public_label: string | null;
  categories: string[];
  intro: Intro;
  price: Price;
  photos: Photo[];
  thumbnail_url: string | null;
  related_facilities: RelatedFacility[];
  min_price: number | null;
}

export default function BurialProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConsultation, setShowConsultation] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/burial-plus/products/${params.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-gray-500">데이터를 찾을 수 없습니다.</p>
        <button
          onClick={() => router.back()}
          className="text-sm font-medium underline"
          style={{ color: BRAND_COLOR }}
        >
          돌아가기
        </button>
      </div>
    );
  }

  const intro = data.intro ?? {};
  const photos = data.photos ?? [];
  const price = data.price ?? {};
  const facilities = intro.facilities ?? {};
  const relatedFacilities = data.related_facilities ?? [];
  const heroImage = data.thumbnail_url || photos[0]?.fileurl_full;

  const facilityList = [
    { key: 'parking', label: '주차장', icon: ParkingCircle, extra: facilities.parkingCount ? `(${facilities.parkingCount}대)` : '' },
    { key: 'mealroom', label: '식당', icon: Utensils },
    { key: 'waitroom', label: '대기실', icon: Armchair },
    { key: 'handicap', label: '장애인 편의시설', icon: Accessibility },
    { key: 'supermarket', label: '매점', icon: ShoppingCart },
  ] as const;

  const activeFacilities = facilityList.filter((f) => facilities[f.key]);

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* 상단 네비 */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate">
            {data.company_name}
          </h1>
        </div>
      </div>

      {/* 히어로 이미지 */}
      {heroImage && (
        <div className="w-full aspect-[21/9] sm:aspect-[3/1] bg-gray-200 overflow-hidden">
          <img
            src={heroImage}
            alt={data.company_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {data.categories.map((c) => (
              <span
                key={c}
                className="px-3 py-1 rounded-full text-xs font-semibold border"
                style={{
                  color: BRAND_COLOR,
                  borderColor: BRAND_COLOR_LIGHT,
                  backgroundColor: BRAND_COLOR_LIGHT,
                }}
              >
                {c}
              </span>
            ))}
            {data.public_label && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {data.public_label}
              </span>
            )}
          </div>

          <h2
            className="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: 'Pretendard, sans-serif' }}
          >
            {data.company_name}
          </h2>

          {data.min_price != null && data.min_price > 0 && (
            <p className="text-lg sm:text-xl font-extrabold mb-6" style={{ color: BRAND_COLOR }}>
              {data.min_price.toLocaleString()}
              <span className="text-sm font-normal text-gray-500">원~</span>
            </p>
          )}

          <div className="space-y-3 text-sm text-gray-600">
            {intro.fulladdress && (
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                <span>{intro.fulladdress}</span>
              </div>
            )}
            {intro.homepage && (
              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                <a
                  href={intro.homepage.startsWith('http') ? intro.homepage : `https://${intro.homepage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-900 break-all"
                >
                  {intro.homepage}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* 사진 갤러리 */}
        {photos.length > 1 && (
          <section>
            <SectionTitle>사진</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((p, i) =>
                p.fileurl_full ? (
                  <div key={i} className="aspect-4/3 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={p.fileurl_full}
                      alt={p.filetitle ?? `사진 ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null,
              )}
            </div>
          </section>
        )}

        {/* 부대시설 */}
        {activeFacilities.length > 0 && (
          <section>
            <SectionTitle>부대시설</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {activeFacilities.map((f) => (
                <div
                  key={f.key}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                  >
                    <f.icon className="w-4 h-4" style={{ color: BRAND_COLOR }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {f.label}
                    {'extra' in f && f.extra ? ` ${f.extra}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 가격 정보 */}
        <PriceSection price={price} />

        {/* 교통 안내 */}
        {(intro.traffpublic || intro.traffowner) && (
          <section>
            <SectionTitle>교통 안내</SectionTitle>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
              {intro.traffpublic && (
                <TrafficBlock
                  icon={<Bus className="w-4 h-4" style={{ color: BRAND_COLOR }} />}
                  label="대중교통"
                  text={intro.traffpublic}
                />
              )}
              {intro.traffowner && (
                <TrafficBlock
                  icon={<Car className="w-4 h-4" style={{ color: BRAND_COLOR }} />}
                  label="자가용"
                  text={intro.traffowner}
                />
              )}
            </div>
          </section>
        )}

        {/* 기타 안내 */}
        {intro.etcinfw && (
          <section>
            <SectionTitle>기타 안내</SectionTitle>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {intro.etcinfw}
              </p>
            </div>
          </section>
        )}

        {/* 관련 시설 */}
        {relatedFacilities.length > 0 && (
          <section>
            <SectionTitle>관련 시설</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedFacilities.map((rf, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {rf.fileurl_full && (
                    <div className="aspect-4/3 bg-gray-100 relative">
                      <img
                        src={rf.fileurl_full}
                        alt={rf.companyname ?? ''}
                        className="w-full h-full object-cover"
                      />
                      {rf.type && (
                        <span
                          className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[11px] font-semibold text-white"
                          style={{ backgroundColor: BRAND_COLOR }}
                        >
                          {FACILITY_TYPE_LABEL[rf.type] ?? rf.type}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4 space-y-1.5">
                    <h4 className="text-sm font-bold text-gray-900">
                      {rf.companyname}
                    </h4>
                    {rf.fulladdress && (
                      <p className="text-xs text-gray-500 flex items-start gap-1.5">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                        {rf.fulladdress}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* 하단 고정 바 (PC + 모바일) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#222] safe-area-bottom">
        <div className="flex items-center divide-x divide-white/20">
          <a
            href="tel:1660-0959"
            className="flex-1 flex items-center justify-center gap-2 py-4.5 text-white cursor-pointer"
          >
            <Phone className="w-5 h-5" />
            <span className="text-base font-bold">전화상담</span>
          </a>
          <button
            onClick={() => setShowConsultation(true)}
            className="flex-1 flex items-center justify-center gap-2 py-4.5 text-white cursor-pointer"
          >
            <ScrollText className="w-5 h-5" />
            <span className="text-base font-bold">상담신청</span>
          </button>
        </div>
      </div>
      <div className="h-16" />

      <BurialConsultationModal
        open={showConsultation}
        onClose={() => setShowConsultation(false)}
        productId={data.id}
        productName={data.company_name}
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-lg sm:text-xl font-bold text-gray-900 mb-4"
      style={{ fontFamily: 'Pretendard, sans-serif' }}
    >
      {children}
    </h3>
  );
}

function TrafficBlock({
  icon,
  label,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
}) {
  const [open, setOpen] = useState(false);
  const isLong = text.length > 100;

  return (
    <div className="p-5 sm:p-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mb-2 cursor-pointer w-full"
      >
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: BRAND_COLOR_LIGHT }}
        >
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        {isLong && (
          <span className="ml-auto text-gray-400">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        )}
      </button>
      <p
        className={`text-sm text-gray-600 leading-relaxed whitespace-pre-line pl-9 ${
          !open && isLong ? 'line-clamp-3' : ''
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function PriceSection({ price }: { price: Price }) {
  const sections = [
    { key: 'hallRent' as const, title: '시설 사용료' },
    { key: 'commission' as const, title: '수수료 / 부대비' },
    { key: 'funeralItem' as const, title: '장례 용품' },
  ];

  const hasPriceData = sections.some((s) => (price[s.key] ?? []).length > 0);
  if (!hasPriceData) return null;

  return (
    <section>
      <SectionTitle>가격 정보</SectionTitle>
      <div className="space-y-4">
        {sections.map((s) => {
          const items = price[s.key] ?? [];
          if (items.length === 0) return null;
          return (
            <div
              key={s.key}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h4 className="text-sm font-bold text-gray-900">{s.title}</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500">
                      <th className="px-5 py-2.5 text-left font-medium">항목</th>
                      <th className="px-5 py-2.5 text-left font-medium">분류</th>
                      <th className="px-5 py-2.5 text-left font-medium">세부내용</th>
                      <th className="px-5 py-2.5 text-right font-medium">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-gray-50 hover:bg-gray-50/50"
                      >
                        <td className="px-5 py-3 text-gray-800 font-medium">
                          {row.item ?? '-'}
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {row.category ?? '-'}
                        </td>
                        <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate">
                          {row.rentcontent ?? '-'}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums font-semibold text-gray-900">
                          {row.facilityamt != null && row.facilityamt > 0
                            ? `${row.facilityamt.toLocaleString()}원`
                            : row.facilityamtm ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
