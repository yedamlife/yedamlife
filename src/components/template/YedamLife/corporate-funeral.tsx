'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Building2,
  Briefcase,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
  Download,
  FileText,
  ChevronDown,
  Info,
  Settings,
  Users,
  MapPin,
  PiggyBank,
  ScrollText,
} from 'lucide-react';

import {
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
  BRAND_COLOR_PREMIUM,
  corpConsultationData,
  corpServiceData,
  corpFuneralProducts,
  corpTestimonials,
  corpComparisonData,
  clientLogoRow1,
  clientLogoRow2,
  clientLogoRow3,
  LOGO_BASE,
} from './constants';

import { Ticker, CtaSection, MembershipSection } from './components';
import { ProposalModal } from './proposal-modal';

const PRODUCT_IMG_BASE =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/products';

const PRODUCT_LABEL_IMAGES: Record<string, { src: string; alt: string }[]> = {
  '장례지도사': [{ src: `${PRODUCT_IMG_BASE}/funeral_director.avif`, alt: '장례지도사' }],
  '장례관리사': [{ src: `${PRODUCT_IMG_BASE}/funeral_manager.avif`, alt: '장례관리사' }],
  '입관상례사': [{ src: `${PRODUCT_IMG_BASE}/encoffinment_director.avif`, alt: '입관상례사' }],
  '앰뷸런스': [{ src: `${PRODUCT_IMG_BASE}/ambulance.avif`, alt: '앰뷸런스' }],
  '장의버스 / 리무진': [
    { src: `${PRODUCT_IMG_BASE}/funeral_bus-v2.avif`, alt: '장의버스' },
    { src: `${PRODUCT_IMG_BASE}/limousine-v2.avif`, alt: '리무진' },
  ],
  '수의(화장용)': [{ src: `${PRODUCT_IMG_BASE}/burial_shroud_converted.avif`, alt: '수의' }],
  '관(화장용) / 횡대(매장시)': [
    { src: `${PRODUCT_IMG_BASE}/cremation_coffin.avif`, alt: '관' },
    { src: `${PRODUCT_IMG_BASE}/burial_boards_converted.avif`, alt: '횡대' },
  ],
  '유골함': [{ src: `${PRODUCT_IMG_BASE}/cremation_urn_converted.avif`, alt: '유골함' }],
  '입관용품': [{ src: `${PRODUCT_IMG_BASE}/encoffinment_supplies.avif`, alt: '입관용품' }],
  '빈소용품': [{ src: `${PRODUCT_IMG_BASE}/altar_supplies.avif`, alt: '빈소용품' }],
  '헌화': [{ src: `${PRODUCT_IMG_BASE}/flower_offering.avif`, alt: '헌화' }],
  '관꽃장식': [{ src: `${PRODUCT_IMG_BASE}/casket_spray.avif`, alt: '관꽃장식' }],
  '남자상복': [{ src: `${PRODUCT_IMG_BASE}/male_mourning_clothes_converted.avif`, alt: '남자상복' }],
  '여자상복': [{ src: `${PRODUCT_IMG_BASE}/female_mourning_clothes.avif`, alt: '여자상복' }],
};

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface CorporateFuneralProps {
  googleFormUrl: string;
  corpChartProductIdx: number;
  setCorpChartProductIdx: (idx: number) => void;
  corpEffectTab: 'company' | 'employee';
  setCorpEffectTab: (tab: 'company' | 'employee') => void;
  corpTableFilter: 'all' | 'corp-1' | 'corp-2';
  setCorpTableFilter: (filter: 'all' | 'corp-1' | 'corp-2') => void;
}

export function CorporateFuneral(props: CorporateFuneralProps) {
  const {
    googleFormUrl,
    corpChartProductIdx,
    setCorpChartProductIdx,
    corpEffectTab,
    setCorpEffectTab,
    corpTableFilter,
    setCorpTableFilter,
  } = props;

  // 제안서 문의 모달
  const [showProposalModal, setShowProposalModal] = useState(false);

  // 상담 신청 폼 state
  const [corpConsultForm, setCorpConsultForm] = useState({
    product: '',
    name: '',
    phone: '',
    region: '',
    timeSlot: '',
    privacyAgreed: false,
  });
  const [corpConsultSubmitting, setCorpConsultSubmitting] = useState(false);

  // 모바일 캐러셀: 확장 배열 [last, ...all, first]
  const [corpCarouselIdx, setCorpCarouselIdx] = useState(1);
  const [corpCarouselTransition, setCorpCarouselTransition] = useState(true);
  const extendedCorpProducts = [
    corpFuneralProducts[corpFuneralProducts.length - 1],
    ...corpFuneralProducts,
    corpFuneralProducts[0],
  ];
  const realCorpProductIdx =
    (((corpCarouselIdx - 1) % corpFuneralProducts.length) +
      corpFuneralProducts.length) %
    corpFuneralProducts.length;

  const CAROUSEL_MS = 370;

  const handleCorpCarouselNext = useCallback(() => {
    setCorpCarouselTransition(true);
    setCorpCarouselIdx((prev) => prev + 1);
  }, []);

  const handleCorpCarouselPrev = useCallback(() => {
    setCorpCarouselTransition(true);
    setCorpCarouselIdx((prev) => prev - 1);
  }, []);

  useEffect(() => {
    if (
      corpCarouselIdx === 0 ||
      corpCarouselIdx === corpFuneralProducts.length + 1
    ) {
      const timer = setTimeout(() => {
        setCorpCarouselTransition(false);
        setCorpCarouselIdx(
          corpCarouselIdx === 0 ? corpFuneralProducts.length : 1,
        );
      }, CAROUSEL_MS);
      return () => clearTimeout(timer);
    }
  }, [corpCarouselIdx]);

  const handleCorpDotClick = useCallback((idx: number) => {
    setCorpCarouselTransition(true);
    setCorpCarouselIdx(idx + 1);
  }, []);

  // 추가혜택 캐러셀 (3개)
  const benefitItems = [
    {
      icon: '📦',
      title: '친환경 조사용품',
      desc: '200인분 1Box',
      note: '예담라이프 명의',
      value: '15만원 상당',
    },
    {
      icon: '💐',
      title: '고급 근조 3단화환',
      desc: '품격 있는 조문 화환',
      note: '기업 명의',
      value: '10만원 상당',
    },
    {
      icon: '💰',
      title: '현금 지원',
      desc: '장례 비용 직접 지원',
      note: '즉시 지급',
      value: '10만원',
    },
  ];
  const [benefitIdx, setBenefitIdx] = useState(1);
  const [benefitTransition, setBenefitTransition] = useState(true);
  const extendedBenefits = [
    benefitItems[benefitItems.length - 1],
    ...benefitItems,
    benefitItems[0],
  ];
  const realBenefitIdx =
    (((benefitIdx - 1) % benefitItems.length) + benefitItems.length) %
    benefitItems.length;

  const handleBenefitNext = useCallback(() => {
    setBenefitTransition(true);
    setBenefitIdx((p) => p + 1);
  }, []);
  const handleBenefitPrev = useCallback(() => {
    setBenefitTransition(true);
    setBenefitIdx((p) => p - 1);
  }, []);
  useEffect(() => {
    if (benefitIdx === 0 || benefitIdx === benefitItems.length + 1) {
      const timer = setTimeout(() => {
        setBenefitTransition(false);
        setBenefitIdx(benefitIdx === 0 ? benefitItems.length : 1);
      }, CAROUSEL_MS);
      return () => clearTimeout(timer);
    }
  }, [benefitIdx, benefitItems.length]);
  const handleBenefitDotClick = useCallback((idx: number) => {
    setBenefitTransition(true);
    setBenefitIdx(idx + 1);
  }, []);

  // 스와이프 지원
  const touchStartX = useRef(0);
  const swipeHandlers = (onPrev: () => void, onNext: () => void) => ({
    onTouchStart: (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? onNext() : onPrev();
      }
    },
  });

  // 주요정보 안내사항 토글
  const [corpNoticeOpen, setCorpNoticeOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const corpNoticeItems: { category: string; items: string[] }[] = [
    {
      category: '장례식장',
      items: [
        '장례식장 사용료(접객실, 염습실, 안치실, 음식, 매점 등)는 별도 유가족 부담입니다.',
      ],
    },
    {
      category: '장례지도사',
      items: [
        '3日기준 초과시 20만원/日 비용 청구합니다.',
        '출동 후 취소하는 경우 인건비 30만원과 용품 투입비용 실비 청구합니다.',
      ],
    },
    {
      category: '장례도우미',
      items: [
        '1日 10시간 기준입니다. 10시간 근무 후 초과 1시간 추가 근무시 상주님께서는 20,000원 현금 지급합니다.',
        '밤 11시 이후 근무시 교통비 20,000원 별도 지급해야 합니다.',
        '1일 추가 근무는 1인당 150,000원 입니다.',
      ],
    },
    {
      category: '장의차량',
      items: [
        '고인이송 장의차량은 관내 무료 지원해드리며, 그 외 비용 발생시 청구합니다.',
        '제공거리 초과시 1km 당 2천원 추가비용이 발생합니다.',
        '차량운행시 발생하는 비용은 유가족 부담입니다.(ex: 도로통행료, 도선료 등)',
        '장의리무진은 1차장지(화장시:화장장, 매장시:매장지)까지 운행합니다.',
      ],
    },
    {
      category: '상복',
      items: [
        '장례기간 동안 대여해 드립니다.(넥타이와 와이셔츠 포함)',
        '장례종료시 반드시 택배 반품해 주셔야 하며, 미반납시 상복당 100,000원의 비용이 청구됩니다.',
        '상복 추가시 남자 상복 60,000원/벌당, 여자상복 30,000원/벌당 비용 청구됩니다.',
      ],
    },
    {
      category: '기타',
      items: [
        '제공 상품 외 품목 요청시 추가 비용이 발생할 수 있습니다.',
        '직접 준비한 장례용품에 대해서 비용 공제는 불가합니다.',
      ],
    },
  ];

  return (
    <>
      {/* Tab 1: 기업 상조 히어로 */}
      <section id="sec-corp-hero" className="overflow-hidden">
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-position-[center_right_-30vw] sm:bg-center bg-no-repeat"
            style={{
              backgroundImage:
                'url(https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/main_logo_company.png)',
            }}
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative z-10 py-20 sm:py-28 lg:py-36 px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <p
                className="text-white/90 text-base sm:text-lg font-medium mb-4 sm:mb-6 tracking-wide"
                style={{
                  textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                기업 복리후생의 새로운 기준
              </p>
              <h1
                className="text-2xl sm:text-[28px] lg:text-[36px] font-bold text-white leading-snug mb-2 sm:mb-3"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                임직원과 그 가족을 위한
              </h1>
              <h1
                className="text-2xl sm:text-[28px] lg:text-[36px] font-bold leading-snug mb-8 sm:mb-10"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                <span className="text-white">기업 맞춤형 상조 복지서비스 </span>
                <span style={{ color: '#e8d5a3', fontWeight: 700 }}>
                  &ldquo;예담라이프&rdquo;
                </span>
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    document
                      .getElementById('sec-corp-inquiry')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-gray-900 text-sm sm:text-base font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
                >
                  <ScrollText className="w-4 h-4 sm:w-5 sm:h-5" />
                  기업상조 도입 상담
                </button>
                <button
                  onClick={() => setShowProposalModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 border-2 border-white/70 text-white text-sm sm:text-base font-bold rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  기업상조 제안서 다운로드
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ Tab 1: 기업 상조 콘텐츠 (14개 섹션) ══════════════ */}

      {/* ── 2. 기업도입현황 + 서비스이용현황 티커 ── */}
      <section
        className="border-b border-gray-200 overflow-hidden"
        style={{ backgroundColor: '#f7f7f7' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* 기업도입현황 */}
            <div className="flex items-center gap-4 py-4 pr-0 md:pr-6">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                >
                  <Building2
                    className="w-4 h-4"
                    style={{ color: BRAND_COLOR }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                  기업도입현황
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <Ticker
                  data={corpConsultationData}
                  interval={3500}
                  renderItem={(item) => (
                    <span className="text-sm text-gray-600 truncate">
                      <span className="text-gray-400">{item.date}</span>{' '}
                      {item.company} ({item.count}){' '}
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            item.status === '도입완료'
                              ? BRAND_COLOR
                              : '#d97706',
                        }}
                      >
                        {item.status}
                      </span>
                    </span>
                  )}
                />
              </div>
            </div>

            {/* 서비스이용현황 */}
            <div className="flex items-center gap-4 py-4 pl-0 md:pl-6">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                >
                  <Briefcase
                    className="w-4 h-4"
                    style={{ color: BRAND_COLOR }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                  서비스 이용현황
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <Ticker
                  data={corpServiceData}
                  interval={4000}
                  renderItem={(item) => (
                    <span className="text-sm text-gray-600 truncate">
                      <span className="text-gray-400">{item.date}</span>{' '}
                      {item.company} ·{' '}
                      <span className="font-medium">{item.service}</span>
                    </span>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. 기업상조 소개 (6개 카드) ── */}
      <section
        id="sec-corp-intro"
        className="py-16 sm:py-24 overflow-hidden bg-white"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm sm:text-base font-semibold text-gray-400 mb-3 tracking-wide">
              기업이 예담라이프를 선택하는 이유
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              기업의 복리후생 경쟁력을 높이는
              <br />
              스마트한 선택
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                title: '맞춤형 복지 설계',
                desc: '기업 규모·특성에 맞춘\n유연한 복지 플랜 설계',
                image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
              },
              {
                title: '임직원 실질 혜택',
                desc: '임직원과 가족 모두에게\n장례지원 및 복지 혜택 제공',
                image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
              },
              {
                title: '전국 서비스망 운영',
                desc: '전국 어디서나 동일한 품질의\n신속하고 안정적인 지원',
                image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
              },
              {
                title: '비용 절감 효과',
                desc: '단체 계약 통한 합리적 비용으로\n고품질 복지 서비스 제공',
                image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col"
              >
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-4 py-4 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. 기업 혜택가 비교 차트 ── */}
      <section
        className="py-20 sm:py-28 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #eef6fb 0%, #f7f7f7 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-sm sm:text-base font-semibold text-gray-500 mb-3 tracking-wide bg-white px-4 py-1.5 rounded-full">
              선불제 타 상조 가격 대비 30~40% 저렴
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              상조 서비스 품질 우수!
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-500">
              기업 혜택가로 합리적인 비용의 장례 서비스
            </p>
          </div>

          {/* 상품 탭 */}
          <div
            className="flex items-center sm:justify-center gap-2 mb-10 overflow-x-auto sm:flex-wrap"
            style={{ scrollbarWidth: 'none' } as React.CSSProperties}
          >
            {corpFuneralProducts.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setCorpChartProductIdx(idx)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors cursor-pointer border ${corpChartProductIdx === idx ? 'bg-gray-800 text-white border-gray-800' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* 차트: 예담라이프 vs 선불제상조 vs 장례식장 상조 비교 */}
          {(() => {
            const corpPriceMap = [
              { yedam: 220, prepaid: 370, funeral: 550 },
              { yedam: 330, prepaid: 490, funeral: 700 },
            ];
            const prices = corpPriceMap[corpChartProductIdx];
            const maxPrice = prices.funeral;
            const barHeight = (val: number) =>
              Math.round((val / maxPrice) * 220);
            const savingPercent = Math.round(
              ((prices.funeral - prices.yedam) / prices.funeral) * 100,
            );
            return (
              <div className="relative max-w-lg mx-auto mb-14 scale-[0.8] sm:scale-100 origin-top">
                <div className="flex items-end justify-center gap-6 sm:gap-10 h-[280px] sm:h-[320px]">
                  {/* 예담라이프 */}
                  <div className="flex flex-col items-center gap-2 flex-1 max-w-[110px]">
                    <div className="relative">
                      <div
                        className="px-3 py-1.5 rounded-lg text-sm font-bold text-white whitespace-nowrap"
                        style={{ backgroundColor: '#4a7fb5' }}
                      >
                        {prices.yedam}만원
                      </div>
                      <div
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                        style={{ backgroundColor: '#4a7fb5' }}
                      />
                    </div>
                    <div
                      className="w-full rounded-t-xl transition-all duration-500"
                      style={{
                        height: `${barHeight(prices.yedam)}px`,
                        backgroundColor: '#4a7fb5',
                      }}
                    />
                    <span
                      className="text-xs sm:text-sm font-bold text-center leading-tight"
                      style={{ color: '#4a7fb5' }}
                    >
                      예담라이프
                    </span>
                  </div>

                  {/* 선불제상조 */}
                  <div className="flex flex-col items-center gap-2 flex-1 max-w-[110px]">
                    <span className="text-sm font-bold text-gray-400">
                      {prices.prepaid}만원
                    </span>
                    <div
                      className="w-full rounded-t-xl transition-all duration-500"
                      style={{
                        height: `${barHeight(prices.prepaid)}px`,
                        backgroundColor: '#d1d5db',
                      }}
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-400 text-center leading-tight">
                      선불제상조
                    </span>
                  </div>

                  {/* 장례식장 상조 */}
                  <div className="flex flex-col items-center gap-2 flex-1 max-w-[110px]">
                    <span className="text-sm font-bold text-gray-400">
                      {prices.funeral}만원
                    </span>
                    <div
                      className="w-full rounded-t-xl transition-all duration-500"
                      style={{
                        height: `${barHeight(prices.funeral)}px`,
                        backgroundColor: '#e5e7eb',
                      }}
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-400 text-center leading-tight">
                      장례식장
                    </span>
                  </div>

                  {/* 절약 말풍선 */}
                  <div className="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: BRAND_COLOR_LIGHT,
                        animation: 'heartbeat 1.5s ease-in-out infinite',
                      }}
                    >
                      <p
                        className="text-xs font-bold text-center leading-tight"
                        style={{ color: BRAND_COLOR }}
                      >
                        최대
                        <br />
                        <span className="text-sm font-extrabold">
                          {savingPercent}% 절약
                        </span>
                        <br />
                        월납입금 0원
                      </p>
                    </div>
                  </div>
                </div>

                {/* 점선 기준선 */}
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed pointer-events-none transition-all duration-500"
                  style={{
                    bottom: `${barHeight(prices.yedam) + 35}px`,
                    borderColor: '#4a7fb5',
                    opacity: 0.6,
                  }}
                />
              </div>
            );
          })()}

          {/* CTA 버튼 */}
          <div className="text-center">
            <button
              onClick={() => {
                const product = corpFuneralProducts[corpChartProductIdx];
                setCorpTableFilter(product.id as 'corp-1' | 'corp-2');
                document
                  .getElementById('sec-corp-inquiry')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 text-base sm:text-lg font-bold text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              {corpFuneralProducts[corpChartProductIdx].name}로 장례 준비하기
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. 기업상조 상품안내 (카드 리스트) ── */}
      <section
        id="sec-corp-products"
        className="py-16 sm:py-24 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm sm:text-base font-semibold text-gray-400 mb-3 tracking-wide">
              기업상조 상품안내
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              기업 규모에 맞는 최적의
              <br />
              상조 플랜을 선택하세요
            </h2>
          </div>
          {/* 모바일: 슬라이드 캐러셀 */}
          <div className="sm:hidden -mx-4">
            <div className="relative overflow-hidden">
              <div
                className="flex items-stretch"
                style={{
                  gap: 10,
                  transition: corpCarouselTransition
                    ? 'transform 0.35s ease-in-out'
                    : 'none',
                  transform: `translateX(calc(-${corpCarouselIdx} * (72vw + 10px) + (100vw - 72vw) / 2))`,
                }}
                {...swipeHandlers(
                  handleCorpCarouselPrev,
                  handleCorpCarouselNext,
                )}
              >
                {extendedCorpProducts.map((product, i) => {
                  const isActive = i === corpCarouselIdx;
                  const originalIdx =
                    (((i - 1) % corpFuneralProducts.length) +
                      corpFuneralProducts.length) %
                    corpFuneralProducts.length;
                  return (
                    <div
                      key={`corp-carousel-${i}`}
                      className="shrink-0"
                      style={{
                        width: '72vw',
                        opacity: isActive ? 1 : 0.35,
                        transform: isActive ? 'scale(1)' : 'scale(0.93)',
                        transition: corpCarouselTransition
                          ? 'opacity 0.35s ease, transform 0.35s ease'
                          : 'none',
                      }}
                    >
                      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 h-full flex flex-col">
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={corpFuneralProducts[originalIdx].image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-0 right-4 bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-b-lg">
                            {product.name}
                          </span>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <p className="text-xs text-gray-500 mb-3 leading-relaxed whitespace-pre-line">
                            {product.desc}
                          </p>
                          <div className="flex items-center gap-2 mb-3 mt-auto">
                            <span className="text-xs text-gray-400 line-through">
                              {product.originalPrice}
                            </span>
                            <span
                              className="text-base font-extrabold"
                              style={{ color: BRAND_COLOR }}
                            >
                              → {product.discountPrice}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setCorpTableFilter(
                                product.id as 'corp-1' | 'corp-2',
                              );
                              document
                                .getElementById('sec-corp-inquiry')
                                ?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer hover:bg-gray-200 bg-gray-100 text-gray-700"
                          >
                            상품 상세 보기
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 좌우 화살표 */}
              <button
                onClick={handleCorpCarouselPrev}
                className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center cursor-pointer"
                style={{
                  width: 56,
                  height: 56,
                  background: 'transparent',
                  border: 'none',
                  minHeight: 'auto',
                  touchAction: 'manipulation',
                }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  }}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </span>
              </button>
              <button
                onClick={handleCorpCarouselNext}
                className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center cursor-pointer"
                style={{
                  width: 56,
                  height: 56,
                  background: 'transparent',
                  border: 'none',
                  minHeight: 'auto',
                  touchAction: 'manipulation',
                }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  }}
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </span>
              </button>
            </div>

            {/* 인디케이터 dot */}
            <div className="flex items-center justify-center gap-2.5 mt-5">
              {corpFuneralProducts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCorpDotClick(idx)}
                  className="cursor-pointer"
                  style={{
                    width: realCorpProductIdx === idx ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      realCorpProductIdx === idx ? BRAND_COLOR : '#d1d5db',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    padding: 0,
                    minHeight: 'auto',
                  }}
                />
              ))}
            </div>
          </div>

          {/* 데스크탑: 그리드 */}
          <div className="hidden sm:grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {corpFuneralProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow flex flex-col"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-0 right-4 bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-b-lg">
                    {product.name}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed whitespace-pre-line">
                    {product.desc}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-400 line-through">
                      {product.originalPrice}
                    </span>
                    <span
                      className="text-base font-extrabold"
                      style={{ color: BRAND_COLOR }}
                    >
                      → {product.discountPrice}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setCorpTableFilter(product.id as 'corp-1' | 'corp-2');
                      document
                        .getElementById('sec-corp-inquiry')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer hover:bg-gray-200 bg-gray-100 text-gray-700 mt-auto"
                  >
                    상품 상세 보기
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. 3030α 기업상조 복지서비스 ── */}
      <section
        id="sec-corp-welfare"
        className="py-16 sm:py-24 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #f5f7f2 0%, #f5f7f3 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm sm:text-base font-semibold text-gray-400 mb-3 tracking-wide">
              예담라이프 3030α 기업상조 복지서비스
            </p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight">
              경제성, 실질적인 임직원의 혜택,
              <br />
              기업 맞춤형 지원까지 모두 갖춘 스마트한 선택
            </h2>
          </div>

          {/* 3개 핵심 포인트 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {[
              {
                num: '30',
                color: '#1e3a5f',
                line1: '기본 상조 상품가격에서',
                line2: '30만원 즉시 공제',
              },
              {
                num: '30',
                color: '#2d7d46',
                line1: '타 상조 대비',
                line2: '30% 이상 비용절감',
              },
              {
                num: 'α',
                color: '#c0392b',
                line1: '기업 선택형',
                line2: '추가 혜택(α) 제공',
              },
            ].map((item) => (
              <div
                key={item.line2}
                className="bg-white rounded-2xl border border-gray-200 py-8 px-6 text-center flex flex-col items-center"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                  style={{ backgroundColor: item.color }}
                >
                  <span className="text-2xl font-extrabold text-white">
                    {item.num}
                  </span>
                </div>
                <p className="text-base text-gray-500 mb-1">{item.line1}</p>
                <p className="text-xl font-extrabold text-gray-900">
                  {item.line2}
                </p>
              </div>
            ))}
          </div>

          {/* 기업 지원 추가혜택 */}
          <div className="text-center mb-10">
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              기업 지원 추가혜택
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              예담 기업1호(택1) / 예담 기업2호(택2)
            </p>
          </div>
          {/* 모바일: 캐러셀 */}
          <div className="sm:hidden -mx-4">
            <div className="relative overflow-hidden">
              <div
                className="flex items-stretch"
                style={{
                  gap: 10,
                  transition: benefitTransition
                    ? 'transform 0.35s ease-in-out'
                    : 'none',
                  transform: `translateX(calc(-${benefitIdx} * (65vw + 10px) + (100vw - 65vw) / 2))`,
                }}
                {...swipeHandlers(handleBenefitPrev, handleBenefitNext)}
              >
                {extendedBenefits.map((item, i) => {
                  const isActive = i === benefitIdx;
                  return (
                    <div
                      key={`benefit-${i}`}
                      className="shrink-0"
                      style={{
                        width: '65vw',
                        opacity: isActive ? 1 : 0.35,
                        transform: isActive ? 'scale(1)' : 'scale(0.93)',
                        transition: benefitTransition
                          ? 'opacity 0.35s ease, transform 0.35s ease'
                          : 'none',
                      }}
                    >
                      <div className="relative bg-white rounded-2xl p-5 text-center h-full">
                        <div className="text-3xl mb-3">{item.icon}</div>
                        <h4 className="text-base font-bold text-gray-900">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.desc}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {item.note}
                        </p>
                        <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                          {item.value}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleBenefitPrev}
                className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center cursor-pointer"
                style={{
                  width: 56,
                  height: 56,
                  background: 'transparent',
                  border: 'none',
                  minHeight: 'auto',
                  touchAction: 'manipulation',
                }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  }}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </span>
              </button>
              <button
                onClick={handleBenefitNext}
                className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center cursor-pointer"
                style={{
                  width: 56,
                  height: 56,
                  background: 'transparent',
                  border: 'none',
                  minHeight: 'auto',
                  touchAction: 'manipulation',
                }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  }}
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </span>
              </button>
            </div>
            <div className="flex items-center justify-center gap-2.5 mt-5">
              {benefitItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleBenefitDotClick(idx)}
                  className="cursor-pointer"
                  style={{
                    width: realBenefitIdx === idx ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      realBenefitIdx === idx ? BRAND_COLOR : '#d1d5db',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    padding: 0,
                    minHeight: 'auto',
                  }}
                />
              ))}
            </div>
          </div>

          {/* 데스크탑: 그리드 */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-4">
            {benefitItems.map((item) => (
              <div
                key={item.title}
                className="relative bg-white rounded-2xl p-5 sm:p-6 text-center"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="text-base font-bold text-gray-900">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                <p className="text-xs text-gray-400 mt-1">{item.note}</p>
                <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. 기업 상조서비스의 도입효과 ── */}
      <section
        id="sec-corp-effect"
        className="py-16 sm:py-24 bg-white overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              기업 상조서비스의 도입효과
            </h2>
          </div>
          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              onClick={() => setCorpEffectTab('company')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-colors cursor-pointer ${corpEffectTab === 'company' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
            >
              기업 측면
            </button>
            <button
              onClick={() => setCorpEffectTab('employee')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-colors cursor-pointer ${corpEffectTab === 'employee' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
            >
              임직원 측면
            </button>
          </div>
          {(() => {
            const effectItems =
              corpEffectTab === 'company'
                ? [
                    {
                      num: '01',
                      title: '임직원 복리증진 및 사기 진작',
                      desc: '임직원 또는 회사에서 지원함으로써 임직원의 애사심과 충성심 고취',
                    },
                    {
                      num: '02',
                      title: '유족 및 조문객에게 기업이미지 제고',
                      desc: '장례지도사 및 장례관리사가 명찰 착용으로 책임을 다하여 장례서비스 제공',
                    },
                    {
                      num: '03',
                      title: '장례 관련 업무 통합으로 업무 효율성 제고',
                      desc: '장례 관련 행사 업무는 예담라이프에서 모든 업무 진행! 기업에서는 조문과 위로만으로 임직원 장례복지에서 자유로움!',
                    },
                  ]
                : [
                    {
                      num: '01',
                      title: '경제적 부담 경감',
                      desc: '협약된 금액으로 장례 진행, 추가 비용 부담 없음',
                    },
                    {
                      num: '02',
                      title: '전문 장례 서비스',
                      desc: '전문 장례지도사가 처음부터 끝까지 체계적으로 진행',
                    },
                    {
                      num: '03',
                      title: '퇴사 후에도 혜택 유지',
                      desc: '퇴사 후에도 협약 금액으로 장례행사 제공 보장',
                    },
                  ];
            return (
              <>
                {/* 모바일: 좌측 번호 + 우측 내용 */}
                <div className="sm:hidden space-y-5">
                  {effectItems.map((item) => (
                    <div key={item.num} className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                      >
                        <span
                          className="font-extrabold text-sm"
                          style={{ color: BRAND_COLOR }}
                        >
                          {item.num}
                        </span>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 데스크탑: 3열 중앙 정렬 */}
                <div className="hidden sm:grid sm:grid-cols-3 gap-6">
                  {effectItems.map((item) => (
                    <div
                      key={item.num}
                      className="flex flex-col items-center text-center"
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                      >
                        <span
                          className="font-extrabold text-base"
                          style={{ color: BRAND_COLOR }}
                        >
                          {item.num}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* ── 8. 업무 제휴 시 제공 서비스 ── */}
      <section
        className="py-16 sm:py-24 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16">
            {/* 좌측 타이틀 */}
            <div className="lg:w-1/3 shrink-0">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                업무 제휴 시
                <br />
                제공 서비스
              </h2>
              <p className="mt-3 text-sm text-gray-500">
                기업과의 업무 제휴를 통해 다양한 서비스를 제공합니다
              </p>
            </div>

            {/* 우측 리스트 */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  '사전가입 시 관내 고인 이송 지원',
                  '조사용품 200인분 1BOX 또는 근조화환 제공',
                  '부고 알림 문자',
                  '화장장 예약',
                  '장지 상담',
                  '유품정리 할인',
                  '상속관련 법률자문 할인',
                  '임직원 복지의 지속성을 위해 퇴사 후에도 협약된 금액으로 장례행사 제공 보장',
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200"
                  >
                    <span
                      className="text-sm font-extrabold shrink-0 mt-0.5"
                      style={{ color: BRAND_COLOR }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm text-gray-700 leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. 기업 멤버십 혜택 ── */}
      <MembershipSection background="bg-white" ctaHref="/membership/corporate" ctaLabel="기업 상조 가입신청" />

      {/* ── 10. 장례 복지 혜택 진행과정 (마일스톤) ── */}
      <section
        className="py-16 sm:py-24 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              기업 상조 복지 혜택 진행과정
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-3">
              기업 부담{' '}
              <span className="font-bold" style={{ color: BRAND_COLOR }}>
                ZERO
              </span>
              , 간단한 3단계로 도입됩니다
            </p>
          </div>

          {/* 데스크탑: 가로 마일스톤 */}
          <div className="hidden md:block">
            <div className="relative">
              {/* 연결선 */}
              <div className="absolute top-7 left-[16.67%] right-[16.67%] h-0.5 bg-gray-300" />
              <div
                className="absolute top-7 left-[16.67%] h-0.5"
                style={{ backgroundColor: BRAND_COLOR, width: '66.66%' }}
              />

              <div className="grid grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: 'MOU 체결 & 공지',
                    desc: '업무협약(MOU)을 맺고 임직원에게 상조 제휴회사임을 공지하여 장례 발생 시 접수를 진행합니다.',
                  },
                  {
                    step: 2,
                    title: '장례 복지 제공',
                    desc: '귀사에서는 어떠한 비용도 발생하지 않으며, 임직원과 가족들까지 장례 복지 혜택을 받을 수 있습니다.',
                  },
                  {
                    step: 3,
                    title: '장례 후 정산',
                    desc: '장례 종료 후, 협약된 금액으로 장례를 치루신 임직원 가족분들께서 직접 정산하시면 완료됩니다.',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex flex-col items-center text-center"
                  >
                    <div
                      className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-md"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      <span className="text-white font-extrabold text-lg">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-[280px]">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 모바일: 세로 타임라인 */}
          <div className="md:hidden">
            <div className="relative pl-8">
              {/* 세로 연결선 */}
              <div
                className="absolute left-[15px] top-0 bottom-0 w-0.5"
                style={{ backgroundColor: BRAND_COLOR }}
              />

              <div className="space-y-10">
                {[
                  {
                    step: 1,
                    title: 'MOU 체결 & 공지',
                    desc: '업무협약(MOU)을 맺고 임직원에게 상조 제휴회사임을 공지하여 장례 발생 시 접수를 진행합니다.',
                  },
                  {
                    step: 2,
                    title: '장례 복지 제공',
                    desc: '귀사에서는 어떠한 비용도 발생하지 않으며, 임직원과 가족들까지 장례 복지 혜택을 받을 수 있습니다.',
                  },
                  {
                    step: 3,
                    title: '장례 후 정산',
                    desc: '장례 종료 후, 협약된 금액으로 장례를 치루신 임직원 가족분들께서 직접 정산하시면 완료됩니다.',
                  },
                ].map((item) => (
                  <div key={item.step} className="relative">
                    <div
                      className="absolute -left-8 top-0 w-[31px] h-[31px] rounded-full flex items-center justify-center border-3 border-white shadow-md"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      <span className="text-white font-bold text-sm">
                        {item.step}
                      </span>
                    </div>
                    <div className="ml-2">
                      <h3 className="text-base font-bold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. 기업 도입 후기 ── */}
      <section
        id="sec-corp-reviews"
        className="py-16 sm:py-24 bg-white overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              기업 도입 후기
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              가족의 마음으로 함께한 시간, 그 진심이 전해졌습니다
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {corpTestimonials.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">
                  &ldquo;{item.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.author}
                      </p>
                      <p className="text-xs text-gray-400">{item.relation}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-300">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. 주요 고객사 (로고 캐러셀) ── */}
      <section
        className="py-16 sm:py-20 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              주요 고객사
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-3">
              <span className="font-bold" style={{ color: BRAND_COLOR }}>
                60+
              </span>{' '}
              기업이 예담라이프와 함께하고 있습니다
            </p>
          </div>
          <div className="space-y-3">
            {/* 1줄 — 왼쪽으로 */}
            <div className="overflow-hidden">
              <div
                className="flex gap-3"
                style={{
                  animation: 'scrollLeft 30s linear infinite',
                  width: 'max-content',
                }}
              >
                {[...clientLogoRow1, ...clientLogoRow1].map((num, i) => (
                  <div
                    key={`row1-${i}`}
                    className="shrink-0 flex items-center justify-center h-16 sm:h-20 w-32 sm:w-36"
                  >
                    <img
                      src={`${LOGO_BASE}/logo_${String(num).padStart(2, '0')}.jpg`}
                      alt={`고객사 ${num}`}
                      className="h-10 sm:h-14 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* 2줄 — 오른쪽으로 */}
            <div className="overflow-hidden">
              <div
                className="flex gap-3"
                style={{
                  animation: 'scrollRight 30s linear infinite',
                  width: 'max-content',
                }}
              >
                {[...clientLogoRow2, ...clientLogoRow2].map((num, i) => (
                  <div
                    key={`row2-${i}`}
                    className="shrink-0 flex items-center justify-center h-16 sm:h-20 w-32 sm:w-36"
                  >
                    <img
                      src={`${LOGO_BASE}/logo_${String(num).padStart(2, '0')}.jpg`}
                      alt={`고객사 ${num}`}
                      className="h-10 sm:h-14 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* 3줄 — 왼쪽으로 */}
            <div className="overflow-hidden">
              <div
                className="flex gap-3"
                style={{
                  animation: 'scrollLeft 25s linear infinite',
                  width: 'max-content',
                }}
              >
                {[...clientLogoRow3, ...clientLogoRow3].map((num, i) => (
                  <div
                    key={`row3-${i}`}
                    className="shrink-0 flex items-center justify-center h-16 sm:h-20 w-32 sm:w-36"
                  >
                    <img
                      src={`${LOGO_BASE}/logo_${String(num).padStart(2, '0')}.jpg`}
                      alt={`고객사 ${num}`}
                      className="h-10 sm:h-14 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 13. 장례상품 비교 테이블 + 신청폼 ── */}
      <section
        id="sec-corp-inquiry"
        className="py-16 sm:py-24 bg-white overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              예담라이프 장례상품 안내
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-3">
              가족의 마음을 담아 정성스럽게 예담라이프가 준비해드립니다
            </p>
          </div>

          {/* 상품 필터 탭 */}
          <div
            className="flex items-center gap-2 overflow-x-auto pb-4 mb-6"
            style={{ scrollbarWidth: 'none' } as React.CSSProperties}
          >
            <button
              onClick={() => setCorpTableFilter('all')}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${corpTableFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
            >
              전체 상품 비교
            </button>
            <button
              onClick={() => setCorpTableFilter('corp-1')}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${corpTableFilter === 'corp-1' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
            >
              예담 기업 1호
            </button>
            <button
              onClick={() => setCorpTableFilter('corp-2')}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${corpTableFilter === 'corp-2' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
            >
              예담 기업 2호
            </button>
          </div>

          {/* 전체 비교표 */}
          {corpTableFilter === 'all' && (
            <div>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="min-w-[700px] w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="p-3 text-left bg-gray-50 border border-gray-200 font-bold text-gray-700 w-[80px] sm:w-[100px]">
                        항목
                      </th>
                      <th className="p-3 text-left bg-gray-50 border border-gray-200 font-bold text-gray-700 w-[140px] sm:w-[180px]">
                        내용
                      </th>
                      <th
                        className="p-3 text-center border border-gray-200 font-bold text-gray-900"
                        style={{ backgroundColor: '#f5f0eb' }}
                      >
                        <div>예담 기업 1호</div>
                      </th>
                      <th
                        className="p-3 text-center border border-gray-200 font-bold text-gray-900"
                        style={{ backgroundColor: '#f5f0eb' }}
                      >
                        <div>예담 기업 2호</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {corpComparisonData.map((section) =>
                      section.items.map((item, itemIdx) => (
                        <tr
                          key={`${section.category}-${item.label}`}
                          className="hover:bg-gray-50"
                        >
                          {itemIdx === 0 && (
                            <td
                              className="p-3 border border-gray-200 font-bold text-gray-700 whitespace-pre-line align-middle"
                              rowSpan={section.items.length}
                            >
                              {section.category}
                            </td>
                          )}
                          <td className="p-3 border border-gray-200 text-gray-700 text-center">
                            <div className="font-medium">{item.label}</div>
                            {item.sub && (
                              <div className="text-xs text-gray-400">
                                {item.sub}
                              </div>
                            )}
                            {PRODUCT_LABEL_IMAGES[item.label] && (
                              <div className="flex justify-center gap-2 mt-2">
                                {PRODUCT_LABEL_IMAGES[item.label].map((img) => (
                                  <div
                                    key={img.alt}
                                    className="w-24 h-24 rounded overflow-hidden cursor-pointer"
                                    onClick={() => setLightboxSrc(img.src)}
                                  >
                                    <img
                                      src={img.src}
                                      alt={img.alt}
                                      className="w-full h-full object-cover scale-110"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          {item.values[0] && item.values[1] === '' ? (
                            <td
                              className="p-3 border border-gray-200 text-center text-gray-600 align-middle"
                              colSpan={2}
                            >
                              {item.values[0]}
                            </td>
                          ) : (
                            item.values.map((val, vi) => (
                              <td
                                key={vi}
                                className="p-3 border border-gray-200 text-center text-gray-600 whitespace-pre-line align-middle"
                              >
                                {val || '-'}
                              </td>
                            ))
                          )}
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 개별 상품 탭 */}
          {corpTableFilter !== 'all' &&
            (() => {
              const valIdx = corpTableFilter === 'corp-1' ? 0 : 1;
              return (
                <div>
                  <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <table className="min-w-[500px] w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="p-3 text-center bg-gray-50 border-t-2 border-b border-gray-300 font-bold text-gray-700 w-[80px] sm:w-[100px]">
                            구분
                          </th>
                          <th className="p-3 text-center bg-gray-50 border-t-2 border-b border-gray-300 font-bold text-gray-700 w-[140px] sm:w-[180px]">
                            항목
                          </th>
                          <th className="p-3 text-center bg-gray-50 border-t-2 border-b border-gray-300 font-bold text-gray-700">
                            내용
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {corpComparisonData.map((section) =>
                          section.items.map((item, itemIdx) => (
                            <tr
                              key={`${section.category}-${item.label}`}
                              className="border-b border-gray-200"
                            >
                              {itemIdx === 0 && (
                                <td
                                  className="p-3 text-center font-bold text-gray-700 whitespace-pre-line align-middle border-r border-gray-200"
                                  rowSpan={section.items.length}
                                >
                                  {section.category}
                                </td>
                              )}
                              <td className="p-3 text-center text-gray-700 align-middle border-r border-gray-200">
                                <div className="font-medium">{item.label}</div>
                                {item.sub && (
                                  <div className="text-xs text-gray-400 whitespace-pre-line">
                                    {item.sub}
                                  </div>
                                )}
                                {PRODUCT_LABEL_IMAGES[item.label] && (
                                  <div className="flex justify-center gap-2 mt-2">
                                    {PRODUCT_LABEL_IMAGES[item.label].map((img) => (
                                      <div
                                        key={img.alt}
                                        className="w-24 h-24 rounded overflow-hidden cursor-pointer"
                                        onClick={() => setLightboxSrc(img.src)}
                                      >
                                        <img
                                          src={img.src}
                                          alt={img.alt}
                                          className="w-full h-full object-cover scale-110"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-center text-gray-900 font-medium align-middle whitespace-pre-line">
                                {item.values[valIdx] || '-'}
                              </td>
                            </tr>
                          )),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

          {/* 주요정보 안내사항 - 접기/펼치기 */}
          <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setCorpNoticeOpen((prev) => !prev)}
            >
              <Info className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-sm font-medium text-gray-600">
                주요정보 안내사항
              </span>
              <ChevronDown
                className="w-4 h-4 text-gray-400 ml-auto transition-transform"
                style={{
                  transform: corpNoticeOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>
            {corpNoticeOpen && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {corpNoticeItems.map((section) =>
                      section.items.map((item, idx) => (
                        <tr
                          key={`${section.category}-${idx}`}
                          className="border-t border-gray-200"
                        >
                          {idx === 0 && (
                            <td
                              className="p-3 sm:p-4 text-center font-bold text-gray-700 align-middle border-r border-gray-200 w-20 sm:w-28 bg-gray-50 whitespace-nowrap"
                              rowSpan={section.items.length}
                            >
                              {section.category}
                            </td>
                          )}
                          <td className="p-3 sm:p-4 text-gray-600 align-middle leading-relaxed">
                            · {item}
                          </td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 공통 문의 폼 */}
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <p className="text-sm font-bold text-gray-700 mb-4">상담 신청</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <Select
                value={corpConsultForm.product}
                onValueChange={(v) => setCorpConsultForm((p) => ({ ...p, product: v }))}
              >
                <SelectTrigger className="px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer">
                  <SelectValue placeholder="상품을 선택해주세요." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corp-1">예담 기업 1호</SelectItem>
                  <SelectItem value="corp-2">예담 기업 2호</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="text"
                placeholder="이름"
                value={corpConsultForm.name}
                onChange={(e) => setCorpConsultForm((p) => ({ ...p, name: e.target.value }))}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white"
              />
              <input
                type="tel"
                placeholder="-를 제외한 숫자만 입력해주세요"
                value={corpConsultForm.phone}
                onChange={(e) => setCorpConsultForm((p) => ({ ...p, phone: e.target.value }))}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white"
              />
              <Select
                value={corpConsultForm.region}
                onValueChange={(v) => setCorpConsultForm((p) => ({ ...p, region: v }))}
              >
                <SelectTrigger className="px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer">
                  <SelectValue placeholder="시/도 선택해주세요." />
                </SelectTrigger>
                <SelectContent>
                  {[
                    '서울', '부산', '대구', '인천', '광주', '대전',
                    '울산', '세종', '경기', '강원', '충북', '충남',
                    '전북', '전남', '경북', '경남', '제주', '미정',
                  ].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="sm:col-span-2">
                <Select
                  value={corpConsultForm.timeSlot}
                  onValueChange={(v) => setCorpConsultForm((p) => ({ ...p, timeSlot: v }))}
                >
                  <SelectTrigger className="px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer w-full">
                    <SelectValue placeholder="상담시간을 선택해주세요." />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      '00:00~06:00', '06:00~08:00', '08:00~10:00',
                      '10:00~12:00', '12:00~14:00', '14:00~16:00',
                      '16:00~18:00', '18:00~20:00', '20:00~22:00',
                      '22:00~24:00',
                    ].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={corpConsultForm.privacyAgreed}
                  onChange={(e) => setCorpConsultForm((p) => ({ ...p, privacyAgreed: e.target.checked }))}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: BRAND_COLOR }}
                />
                <span className="text-xs text-gray-500">
                  개인정보 수집 및 이용 동의
                </span>
              </label>
              <button
                disabled={corpConsultSubmitting}
                onClick={async () => {
                  if (!corpConsultForm.product) {
                    toast.warning('상품을 선택해주세요.');
                    return;
                  }
                  if (!corpConsultForm.name.trim() || !corpConsultForm.phone.trim()) {
                    toast.warning('이름과 연락처를 입력해주세요.');
                    return;
                  }
                  if (!corpConsultForm.privacyAgreed) {
                    toast.warning('개인정보 수집 및 이용에 동의해주세요.');
                    return;
                  }
                  setCorpConsultSubmitting(true);
                  try {
                    const res = await fetch('/api/v1/corporate-funeral/consultation', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        product: corpConsultForm.product,
                        name: corpConsultForm.name,
                        phone: corpConsultForm.phone,
                        region: corpConsultForm.region || '미정',
                        preferred_time: corpConsultForm.timeSlot || '미정',
                        privacy_agreed: corpConsultForm.privacyAgreed,
                      }),
                    });
                    const result = await res.json();
                    if (result.success) {
                      toast.success('상담 신청이 완료되었습니다.\n담당자가 빠르게 연락드리겠습니다.');
                      setCorpConsultForm({ product: '', name: '', phone: '', region: '', timeSlot: '', privacyAgreed: false });
                    } else {
                      toast.error(result.message || '오류가 발생했습니다.');
                    }
                  } catch {
                    toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                  } finally {
                    setCorpConsultSubmitting(false);
                  }
                }}
                className="px-8 py-3 text-white text-sm font-bold rounded-xl cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {corpConsultSubmitting ? '신청 중...' : '상담 신청'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 14. CTA 버튼 섹션 ── */}
      <CtaSection
        title={
          <>
            기업의 복리후생,
            <br />
            예담라이프와 함께 시작하세요
          </>
        }
        description={
          <>
            전문 상담사가 기업 맞춤 복지 플랜을 제안해 드립니다.
            <br />
            부담 없이 문의해 주세요.
          </>
        }
        buttons={
          <>
            <a
              href="/membership/corporate"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl transition-colors shadow-lg cursor-pointer hover:opacity-90 overflow-hidden"
              style={{
                backgroundColor: BRAND_COLOR_PREMIUM,
                color: '#ffffff',
              }}
            >
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  animation: 'shimmer 2.5s ease-in-out infinite',
                  width: '60%',
                }}
              />
              <FileText className="relative w-5 h-5" />
              <span className="relative">가입증서 신청하기</span>
            </a>
            <button
              onClick={() => setShowProposalModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Download className="w-5 h-5" />
              기업상조 제안서 다운로드
            </button>
          </>
        }
      />

      <ProposalModal
        open={showProposalModal}
        onClose={() => setShowProposalModal(false)}
      />

      {/* 이미지 확대 모달 */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 cursor-pointer"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
