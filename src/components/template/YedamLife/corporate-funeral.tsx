'use client';
import { CONTACT_PHONE } from '@/constants/contact';

import { Fragment, useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  ChevronDown,
  Headphones,
  Info,
  ScrollText,
  X,
} from 'lucide-react';

import {
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
  BRAND_COLOR_PREMIUM,
  corpFuneralProducts,
  corpComparisonData,
  clientLogoRow1,
  clientLogoRow2,
  clientLogoRow3,
  LOGO_BASE,
} from './constants';

import {
  CountUp,
  CtaSection,
  MembershipSection,
  ReviewCarousel,
  ReviewItem,
} from './components';
import { ProposalModal } from './proposal-modal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const PRODUCT_IMG_BASE =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/products';

const PRODUCT_LABEL_IMAGES: Record<string, { src: string; alt: string }[]> = {
  장례지도사: [
    { src: `${PRODUCT_IMG_BASE}/funeral_director.avif`, alt: '장례지도사' },
  ],
  장례관리사: [
    { src: `${PRODUCT_IMG_BASE}/funeral_manager.avif`, alt: '장례관리사' },
  ],
  '접객 도우미': [
    { src: `${PRODUCT_IMG_BASE}/funeral_manager2.png`, alt: '접객 도우미' },
  ],
  입관상례사: [
    {
      src: `${PRODUCT_IMG_BASE}/encoffinment_director.avif`,
      alt: '입관상례사',
    },
  ],
  앰뷸런스: [{ src: `${PRODUCT_IMG_BASE}/ambulance.avif`, alt: '앰뷸런스' }],
  '장의버스 / 리무진': [
    { src: `${PRODUCT_IMG_BASE}/funeral_bus-v2.avif`, alt: '장의버스' },
    { src: `${PRODUCT_IMG_BASE}/limousine-v2.avif`, alt: '리무진' },
  ],
  '수의(화장용)': [
    { src: `${PRODUCT_IMG_BASE}/burial_shroud_converted.avif`, alt: '수의' },
  ],
  '관(화장용) / 횡대(매장시)': [
    { src: `${PRODUCT_IMG_BASE}/cremation_coffin.avif`, alt: '관' },
    { src: `${PRODUCT_IMG_BASE}/burial_boards_converted.avif`, alt: '횡대' },
  ],
  유골함: [
    { src: `${PRODUCT_IMG_BASE}/cremation_urn_converted.avif`, alt: '유골함' },
  ],
  입관용품: [
    { src: `${PRODUCT_IMG_BASE}/encoffinment_supplies.avif`, alt: '입관용품' },
  ],
  빈소용품: [
    { src: `${PRODUCT_IMG_BASE}/altar_supplies.avif`, alt: '빈소용품' },
  ],
  헌화: [{ src: `${PRODUCT_IMG_BASE}/flower_offering.avif`, alt: '헌화' }],
  관꽃장식: [{ src: `${PRODUCT_IMG_BASE}/casket_spray.avif`, alt: '관꽃장식' }],
  남자상복: [
    {
      src: `${PRODUCT_IMG_BASE}/male_mourning_clothes_converted.avif`,
      alt: '남자상복',
    },
  ],
  여자상복: [
    {
      src: `${PRODUCT_IMG_BASE}/female_mourning_clothes.avif`,
      alt: '여자상복',
    },
  ],
};

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function ProcessSteps() {
  const steps = [
    {
      emoji: '💬',
      num: '01',
      title: '사전 미팅',
      desc: '기업 상황과 필요를 파악하고\n후불제 상조를 안내합니다',
    },
    {
      emoji: '🎯',
      num: '02',
      title: '맞춤 컨설팅',
      desc: '계약 항목과 제공 내역을\n구체적으로 확정합니다',
    },
    {
      emoji: '🤝',
      num: '03',
      title: 'MOU 체결',
      desc: '계약 체결 및 협약서를\n작성합니다',
    },
    {
      emoji: '📢',
      num: '04',
      title: '사내 공지',
      desc: '기업상조 복지를\n임직원에게 안내합니다',
    },
    {
      emoji: '📅',
      num: '05',
      title: '정기 미팅',
      desc: '개선점을 논의하며\n서비스를 보완합니다',
    },
  ];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            steps.forEach((_, idx) => {
              setTimeout(() => setActiveIndex(idx), idx * 350);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [steps.length]);

  return (
    <div ref={containerRef} className="relative">
      {/* 데스크톱: 가로 연결선 (배경 회색) */}
      <div
        className="hidden sm:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gray-200"
        aria-hidden
      />
      {/* 데스크톱: 가로 연결선 (진행) */}
      <div
        className="hidden sm:block absolute top-8 left-[10%] h-0.5 bg-gray-900 transition-all duration-500 ease-out"
        style={{
          width: `${activeIndex < 0 ? 0 : (activeIndex / (steps.length - 1)) * 80}%`,
        }}
        aria-hidden
      />

      <div className="relative grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-5 sm:gap-y-0 sm:gap-x-4">
        {steps.map((s, idx) => {
          const isActive = idx <= activeIndex;
          return (
            <div
              key={s.num}
              className="relative flex flex-col items-center text-center"
            >
              {/* 번호 배지 */}
              <div
                className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg ring-4 ring-gray-50 bg-white border transition-all duration-500 ${
                  isActive
                    ? 'border-gray-900 scale-110 opacity-100'
                    : 'border-gray-200 opacity-40'
                }`}
              >
                <span>{s.emoji}</span>
                <span
                  className={`absolute -top-1 -right-1 text-[10px] font-extrabold rounded-full w-6 h-6 flex items-center justify-center shadow transition-colors duration-500 ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {s.num}
                </span>
              </div>

              {/* 텍스트 */}
              <div
                className={`mt-4 sm:mt-5 px-1 transition-all duration-500 ${
                  isActive
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-40 translate-y-1'
                }`}
              >
                <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.15em] sm:tracking-[0.2em] mb-1 text-gray-500">
                  STEP {s.num}
                </p>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 break-keep">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-keep whitespace-pre-line">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    fetch('/api/v1/reviews?category=corporate&limit=4')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setReviews(json.data);
      })
      .catch(() => {});
  }, []);

  // 제안서 문의 모달
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showCorpConsultModal, setShowCorpConsultModal] = useState(false);
  const [corpDetailProductId, setCorpDetailProductId] = useState<
    'corp-1' | 'corp-2' | null
  >(null);

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

  useEffect(() => {
    const handler = () => setShowCorpConsultModal(true);
    window.addEventListener('open-corp-consult-modal', handler);
    return () => window.removeEventListener('open-corp-consult-modal', handler);
  }, []);

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

  // A/B 뷰 전환: card(신규) / table(기존)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [tooltipLabel, setTooltipLabel] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'a') {
        e.preventDefault();
        setViewMode('card');
      }
      if (e.metaKey && e.key === 'b') {
        e.preventDefault();
        setViewMode('table');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
          <div className="relative z-10 py-32 sm:py-36 lg:py-40 px-4 sm:px-6">
            <div className="text-left max-w-3xl sm:mx-auto sm:max-w-5xl sm:pr-[20%] lg:pr-[25%]">
              <div className="flex justify-start mb-8 sm:mb-10">
                <span
                  className="inline-flex items-center px-5 sm:px-6 py-2 sm:py-2.5 rounded-2xl"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.18)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  <span
                    className="font-bold leading-tight tracking-wide"
                    style={{
                      fontSize: '13px',
                      color: '#ffffff',
                      textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                      fontFamily: '"Nanum Myeongjo", serif',
                    }}
                  >
                    기업 복리후생의 새로운 기준
                  </span>
                </span>
              </div>
              <h1
                className="text-2xl sm:text-[28px] lg:text-[36px] font-bold leading-[1.8] sm:leading-[1.6] mb-12 sm:mb-14"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                <span className="text-white">
                  임직원과 그 가족을 위한
                  <br />
                  기업 맞춤형 상조 복지서비스
                </span>
                <br className="sm:hidden" />
                <span className="hidden sm:inline text-white"> </span>
                <span style={{ color: '#e8d5a3', fontWeight: 700 }}>
                  &ldquo;예담라이프&rdquo;
                </span>
              </h1>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowCorpConsultModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl shadow-lg bg-white text-gray-900 text-sm sm:text-base font-bold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <ScrollText className="w-4 h-4 sm:w-5 sm:h-5" />
                  기업상조 도입 상담
                </button>
                <button
                  onClick={() => setShowProposalModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl shadow-lg bg-transparent border border-white text-white text-sm sm:text-base font-bold hover:bg-white/10 transition-colors cursor-pointer"
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

      {/* ── 2. 통계 섹션 ── */}
      <section className="border-b border-gray-200 overflow-hidden bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 md:gap-y-0">
            {/* 1. 가입건수 */}
            <div className="flex flex-col items-center justify-center px-2 py-1.5 md:py-3 min-h-[58px] md:min-h-0 border-r border-gray-200">
              <div className="flex items-baseline">
                <CountUp
                  end={1800}
                  className="text-lg sm:text-3xl font-extrabold tracking-tight text-gray-900"
                />
                <span className="text-[13px] sm:text-lg font-extrabold ml-0.5 sm:ml-1 text-gray-900">
                  건+
                </span>
              </div>
              <p className="text-[11px] sm:text-sm text-gray-500 mt-1 text-center">
                누적 가입 건수
              </p>
            </div>

            {/* 2. 상담신청 */}
            <div className="flex flex-col items-center justify-center px-2 py-1.5 md:py-3 min-h-[58px] md:min-h-0 md:border-r border-gray-200">
              <div className="flex items-baseline">
                <CountUp
                  end={5200}
                  className="text-lg sm:text-3xl font-extrabold tracking-tight text-gray-900"
                />
                <span className="text-[13px] sm:text-lg font-extrabold ml-0.5 sm:ml-1 text-gray-900">
                  건+
                </span>
              </div>
              <p className="text-[11px] sm:text-sm text-gray-500 mt-1 text-center">
                누적 상담신청
              </p>
            </div>

            {/* 3. 전국 의전본부 */}
            <div className="flex flex-col items-center justify-center px-2 py-1.5 md:py-3 min-h-[58px] md:min-h-0 border-r border-gray-200">
              <div className="flex items-baseline">
                <CountUp
                  end={120}
                  className="text-lg sm:text-3xl font-extrabold tracking-tight text-gray-900"
                />
                <span className="text-[13px] sm:text-lg font-extrabold ml-0.5 sm:ml-1 text-gray-900">
                  개+
                </span>
              </div>
              <p className="text-[11px] sm:text-sm text-gray-500 mt-1 text-center">
                전국 의전본부
              </p>
            </div>

            {/* 4. 24시간 긴급출동 */}
            <div className="flex flex-col items-center justify-center px-2 py-1.5 md:py-3 min-h-[58px] md:min-h-0">
              <div className="flex items-baseline">
                <CountUp
                  end={24}
                  className="text-lg sm:text-3xl font-extrabold tracking-tight text-gray-900"
                />
                <span className="text-[13px] sm:text-lg font-extrabold ml-0.5 sm:ml-1 text-gray-900">
                  H
                </span>
              </div>
              <p className="text-[11px] sm:text-sm text-gray-500 mt-1 text-center">
                365일 긴급출동 서비스
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. 기업 복지 담당자의 고민 ── */}
      <section
        id="sec-corp-intro"
        className="py-16 sm:py-24 overflow-hidden bg-white"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm sm:text-base font-semibold text-gray-400 mb-3 tracking-wide">
              기업 복지 담당자의 고민
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              이런 어려움, 겪고 계시지 않나요?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: '급작스러운 상황 대응',
                desc: '야간·주말에도 즉시 의전팀을\n파견해야 하는 긴급성 부담',
                image:
                  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
              },
              {
                title: '상조 서비스 품질 관리',
                desc: '도착 시간·장례지도사 응대 등\n서비스 퀄리티 유지·관리',
                image:
                  'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
              },
              {
                title: '비용의 합리성',
                desc: '고비용·끼워팔기 선불제 상조로\n임직원에게 경제적 손실 우려',
                image:
                  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col"
              >
                <div className="h-48 sm:aspect-4/3 sm:h-auto overflow-hidden">
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

      {/* ── 3-1. 기업상조 도입 프로세스 ── */}
      <section className="py-16 sm:py-24 overflow-hidden bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm sm:text-base font-semibold text-gray-400 mb-3 tracking-wide">
              PROCESS
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              기업상조 도입, 이렇게 간단합니다
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              별도 비용 없이 MOU 협약만으로 바로 도입하세요
            </p>
          </div>

          <ProcessSteps />
        </div>
      </section>

      {/* ── 4. 기업 혜택가 비교 차트 ── */}
      <section className="py-20 sm:py-28 overflow-hidden bg-white">
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

          {/* 차트: 예담라이프 vs 선불제상조 비교 */}
          {(() => {
            const priceMap = [
              {
                facilityFee: 100,
                yedamFee: 230,
                prepaidFee: 380,
              },
              {
                facilityFee: 150,
                yedamFee: 330,
                prepaidFee: 500,
              },
            ];
            const p = priceMap[corpChartProductIdx];
            const totalYedam = p.facilityFee + p.yedamFee;
            const totalPrepaid = p.facilityFee + p.prepaidFee;
            const maxTotal = totalPrepaid;
            const maxBarH = 220;
            const h = (val: number) => Math.round((val / maxTotal) * maxBarH);
            const savingPercent = Math.round(
              ((totalPrepaid - totalYedam) / totalPrepaid) * 100,
            );

            const bars = [
              {
                label: '예담라이프',
                total: totalYedam,
                serviceFee: p.yedamFee,
                darkColor: '#4a7fb5',
                lightColor: '#e5e7eb',
                isHighlight: true,
              },
              {
                label: '선불제상조',
                total: totalPrepaid,
                serviceFee: p.prepaidFee,
                darkColor: '#9ca3af',
                lightColor: '#e5e7eb',
                isHighlight: false,
              },
            ];

            return (
              <div className="max-w-xl mx-auto mb-14">
                <div
                  className="grid justify-center transition-all duration-500"
                  style={{
                    gridTemplateColumns: 'repeat(2, minmax(60px, 90px)) auto',
                    gap: '0 clamp(8px, 3vw, 40px)',
                  }}
                >
                  {/* Row 1: 상조 비용 (진한색) + 총합 라벨을 막대 바로 위에 */}
                  {bars.map((bar) => (
                    <div
                      key={`s-${bar.label}`}
                      className="self-end flex flex-col items-center"
                    >
                      {/* 총합 라벨 */}
                      <div className="mb-2">
                        {bar.isHighlight ? (
                          <div
                            className="relative"
                            style={{
                              animation: 'heartbeat 2s ease-in-out infinite',
                            }}
                          >
                            <div
                              className="px-3 py-1.5 rounded-lg text-sm font-bold text-white whitespace-nowrap text-center"
                              style={{ backgroundColor: bar.darkColor }}
                            >
                              <span className="text-[10px] font-semibold text-white/80">
                                최대 {savingPercent}% 절약
                              </span>
                              <br />
                              {bar.total}만원
                            </div>
                            <div
                              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                              style={{ backgroundColor: bar.darkColor }}
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-gray-400 whitespace-nowrap">
                            {bar.total}만원
                          </span>
                        )}
                      </div>
                      {/* 상조 비용 바 */}
                      <div
                        className="w-full rounded-t-xl flex items-center justify-center transition-all duration-500"
                        style={{
                          height: `${h(bar.serviceFee)}px`,
                          backgroundColor: bar.darkColor,
                        }}
                      >
                        {h(bar.serviceFee) > 24 && (
                          <span className="text-xs sm:text-sm font-bold text-white/90">
                            {bar.serviceFee}만
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* 우측: 상조 비용 라벨 + 점선 브래킷 */}
                  <div className="self-end flex items-center gap-1.5 -ml-4">
                    <svg
                      width={32}
                      height={h(bars[1].serviceFee)}
                      viewBox={`0 0 32 ${h(bars[1].serviceFee)}`}
                      style={{ display: 'block', minWidth: 32, flexShrink: 0 }}
                      aria-hidden="true"
                    >
                      <path
                        d={`M 2 4 C 16 4, 16 ${h(bars[1].serviceFee) / 2}, 16 ${h(bars[1].serviceFee) / 2} C 16 ${h(bars[1].serviceFee) / 2}, 16 ${h(bars[1].serviceFee) - 4}, 2 ${h(bars[1].serviceFee) - 4}`}
                        stroke="#374151"
                        strokeWidth="2.5"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    <span className="text-[11px] sm:text-xs font-semibold whitespace-nowrap" style={{ color: '#374151' }}>
                      장례식장 &apos;상조&apos;
                      <br />
                      평균 비용
                    </span>
                  </div>

                  {/* Row 4: 장례식장 비용 (연한색, 높이 동일) */}
                  {bars.map((bar) => (
                    <div key={`f-${bar.label}`}>
                      <div
                        className="w-full flex items-center justify-center transition-all duration-500"
                        style={{
                          height: `${h(p.facilityFee)}px`,
                          backgroundColor: bar.lightColor,
                        }}
                      >
                        {h(p.facilityFee) > 24 && (
                          <span
                            className="text-[10px] sm:text-xs font-bold"
                            style={{ color: '#9ca3af' }}
                          >
                            {p.facilityFee}만
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* 우측: 장례식장 비용 라벨 + 점선 브래킷 */}
                  <div className="self-center flex items-center gap-1.5 -ml-4">
                    <svg
                      width={32}
                      height={h(p.facilityFee)}
                      viewBox={`0 0 32 ${h(p.facilityFee)}`}
                      style={{ display: 'block', minWidth: 32, flexShrink: 0 }}
                      aria-hidden="true"
                    >
                      <path
                        d={`M 2 4 C 16 4, 16 ${h(p.facilityFee) / 2}, 16 ${h(p.facilityFee) / 2} C 16 ${h(p.facilityFee) / 2}, 16 ${h(p.facilityFee) - 4}, 2 ${h(p.facilityFee) - 4}`}
                        stroke="#374151"
                        strokeWidth="2.5"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    <span className="text-[11px] sm:text-xs font-semibold whitespace-nowrap" style={{ color: '#374151' }}>
                      장례식장 기본 이용료
                    </span>
                  </div>

                  {/* Row 5: 하단 라벨 */}
                  {bars.map((bar) => (
                    <div key={`l-${bar.label}`} className="text-center pt-2">
                      <span
                        className="text-xs sm:text-sm font-bold"
                        style={{
                          color: bar.isHighlight ? '#111827' : '#9ca3af',
                        }}
                      >
                        {bar.label}
                      </span>
                    </div>
                  ))}
                  <div />
                </div>
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

      {/* ── 6. 3030α 기업상조 복지서비스 ── */}
      <section
        id="sec-corp-welfare"
        className="py-16 sm:py-24 overflow-hidden bg-gray-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p
              className="text-sm sm:text-base font-semibold mb-3 tracking-[0.2em]"
              style={{ color: BRAND_COLOR }}
            >
              3030A BENEFIT
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              기업상조 3030α 복지서비스
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              MOU 협약만으로 임직원에게 즉시 제공되는 상조 복지 혜택
            </p>
          </div>

          {/* 3개 핵심 포인트 */}
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-2 mb-12">
            {[
              {
                num: '30',
                color: '#1e3a5f',
                title: '임직원 30만원 공제',
                line1: '기업상조 상품가에서',
                line2: '30만원 즉시 할인',
              },
              {
                num: '30%',
                color: '#b59c4d',
                title: '장례비용 절감',
                line1: '선불제 상조 대비',
                line2: '30% 경제적',
              },
              {
                num: 'α',
                color: '#a44a3f',
                title: '상품별 추가혜택',
                line1: '조사용품·근조화환',
                line2: '현금지원 등 택1~2',
              },
            ].map((item, idx, arr) => (
              <Fragment key={item.title}>
                <div
                  className="flex-1 rounded-2xl py-10 px-6 text-center flex flex-col items-center justify-center text-white"
                  style={{ backgroundColor: item.color }}
                >
                  <span className="text-5xl sm:text-6xl font-extrabold mb-6">
                    {item.num}
                  </span>
                  <p className="text-lg sm:text-xl font-bold mb-3">
                    {item.title}
                  </p>
                  <p className="text-sm opacity-90 leading-relaxed">
                    {item.line1}
                    <br />
                    {item.line2}
                  </p>
                </div>
                {idx < arr.length - 1 && (
                  <div className="flex items-center justify-center text-2xl font-bold text-gray-400 sm:px-1">
                    +
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs sm:text-sm text-gray-500">
              ※ 임직원 가족뿐만 아니라 친인척도 사전 가입 시 20만원 할인 + VIP
              MEMBERSHIP 패키지 제공
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              ※ 기업에 별도 비용 부담 없이, MOU 협약만으로 도입 가능
            </p>
          </div>
        </div>
      </section>

      {/* ── 6-2. 기업 지원 추가혜택 (구) ── */}
      <section className="hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
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

      {/* ── 9. 기업 멤버십 혜택 ── */}
      <MembershipSection
        background="bg-white"
        ctaHref="/membership/corporate"
        ctaLabel="기업 상조 가입신청"
      />

      {/* ── 5. 기업상조 상품안내 (카드 리스트) ── */}
      <section
        id="sec-corp-products"
        className="py-16 sm:py-24 overflow-hidden bg-white"
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
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setCorpDetailProductId(
                                  corpFuneralProducts[originalIdx].id as
                                    | 'corp-1'
                                    | 'corp-2',
                                )
                              }
                              className="flex-1 px-1 py-2.5 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer hover:bg-gray-100 bg-white border border-gray-300 text-gray-700 whitespace-nowrap"
                            >
                              자세히 보기
                            </button>
                            <button
                              onClick={() => {
                                setCorpConsultForm((p) => ({
                                  ...p,
                                  product: corpFuneralProducts[originalIdx]
                                    .id as 'corp-1' | 'corp-2',
                                }));
                                setShowCorpConsultModal(true);
                              }}
                              className="flex-1 px-1 py-2.5 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer hover:bg-gray-200 bg-gray-100 text-gray-700 whitespace-nowrap"
                            >
                              상담신청
                            </button>
                          </div>
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
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() =>
                        setCorpDetailProductId(
                          product.id as 'corp-1' | 'corp-2',
                        )
                      }
                      className="flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer hover:bg-gray-100 bg-white border border-gray-300 text-gray-700"
                    >
                      자세히 보기
                    </button>
                    <button
                      onClick={() => {
                        setCorpConsultForm((p) => ({
                          ...p,
                          product: product.id as 'corp-1' | 'corp-2',
                        }));
                        setShowCorpConsultModal(true);
                      }}
                      className="flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer hover:bg-gray-200 bg-gray-100 text-gray-700"
                    >
                      상담신청
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. 장례 발생 시 진행 절차 ── */}
      <section className="py-16 sm:py-24 overflow-hidden bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm sm:text-base font-semibold text-gray-400 mb-3 tracking-[0.25em]">
              FUNERAL PROCESS
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              장례 발생 시 진행 절차
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              365일 24시간, 전화 한 통이면 전문 장례지도사가 모든 것을
              책임집니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {[
              {
                day: '1일차',
                items: [
                  { emoji: '📞', label: '장례 접수 (24시간)' },
                  { emoji: '🏥', label: '장례식장 이송·호실 예약' },
                  { emoji: '👔', label: '장례지도사 파견' },
                  { emoji: '🕯️', label: '제단 설치·부고 알림' },
                ],
              },
              {
                day: '2일차',
                items: [
                  { emoji: '🙏', label: '염습 진행' },
                  { emoji: '💐', label: '입관식' },
                  { emoji: '👕', label: '성복례' },
                  { emoji: '🤝', label: '문상객 접객' },
                ],
              },
              {
                day: '3일차',
                items: [
                  { emoji: '🚐', label: '발인' },
                  { emoji: '⛰️', label: '화장/매장·장지이동' },
                  { emoji: '🕊️', label: '안치·사후 관리' },
                  { emoji: '💰', label: '비용 정산' },
                ],
              },
            ].map((col) => (
              <div key={col.day} className="flex flex-col">
                <div className="mb-5">
                  <span className="inline-block px-5 py-1.5 rounded-full text-sm font-bold text-white bg-gray-800">
                    {col.day}
                  </span>
                </div>
                <ul className="flex flex-col gap-3">
                  {col.items.map((it, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-gray-200"
                    >
                      <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base bg-gray-100">
                        {it.emoji}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {it.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 365일 24시간 긴급출동서비스 ── */}
      <section
        id="sec-emergency"
        className="py-12 sm:py-16 overflow-hidden bg-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* 좌측: 텍스트 */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
                365일 24시간
                <br />
                긴급출동서비스
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">
                예기치 못한 상황에도 흔들림 없이
                <br />
                가장 가까운 전담팀이 즉시 찾아갑니다
              </p>
              <div className="flex items-center gap-3 mb-5">
                <Headphones className="w-7 h-7" style={{ color: 'black' }} />
                <span
                  className="text-2xl sm:text-3xl font-extrabold"
                  style={{ color: 'black' }}
                >
                  {CONTACT_PHONE}
                </span>
              </div>
              <a
                href="https://accounts.kakao.com/login/?continue=http%3A%2F%2Fpf.kakao.com%2F_VLVJxj%2Fchat#login"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-5 py-2 rounded-lg font-bold text-xs sm:text-sm cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
              >
                <img
                  src="https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/kakao_icon.png"
                  alt="카카오톡"
                  className="w-4 h-4 object-contain"
                />
                카카오톡으로 상담하기
              </a>
            </div>
            {/* 우측: 전국 본부 현황 지도 */}
            <div className="relative flex items-center justify-center">
              <img
                src="https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/map.png"
                alt="전국 본부 현황 지도"
                className="w-full max-w-[200px] sm:max-w-[240px] lg:max-w-[280px]"
              />
            </div>
          </div>
        </div>
      </section>
      {/* ── 12. 주요 고객사 (로고 캐러셀) ── */}
      <section className="py-16 sm:py-20 overflow-hidden bg-gray-50">
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
      {/* ── 11. 기업 도입 후기 ── */}
      {reviews.length > 0 && (
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
                예담라이프 기업상조를 도입한 기업들의 생생한 후기입니다
              </p>
            </div>
            <ReviewCarousel reviews={reviews} />
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p
              className="text-xs sm:text-sm font-bold tracking-[0.2em] mb-3"
              style={{ color: BRAND_COLOR }}
            >
              FAQ
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              자주 묻는 질문
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[
              {
                q: '후불제 상조는 정말 추가 비용이 없나요?',
                a: '네, 예담라이프는 정찰제로 운영됩니다. 유가족의 상황을 고려하여 상조상품을 추천 드리며, 부가 상품 권유 없이 투명하게 장례를 진행합니다. 발인 전 비용을 정산하며, 대부분 부의금으로 정산이 가능합니다.',
              },
              {
                q: '이미 다른 상조에 가입되어 있는데 추가 가입 가능한가요?',
                a: '가능합니다. 기존 가입된 상조는 그대로 납입하여 만기 시 환급받으시고, 30% 비용 절감된 예담라이프에 별도로 가입하시면 됩니다.',
              },
              {
                q: '기업 상조 MOU 협약 시 회사에 비용 부담이 있나요?',
                a: '전혀 없습니다. MOU 협약만으로 도입되며, 기업에 별도 비용이 발생하지 않습니다. 실제 장례 발생 시 해당 임직원(유가족)이 후불로 정산합니다.',
              },
              {
                q: '사전 가입 없이도 서비스를 받을 수 있나요?',
                a: '네, 장례 발생 후 즉시 상담·이용이 가능합니다. 다만 사전 가입 시 앰뷸런스 관내 무료 지원 등 추가 혜택이 있으므로 미리 가입해두시는 것을 권해드립니다.',
              },
              {
                q: '임직원 가족 외 친인척도 혜택을 받을 수 있나요?',
                a: '네, 친인척도 사전 가입 시 20만원 할인 혜택과 VIP MEMBERSHIP 패키지를 제공해 드립니다.',
              },
            ].map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="border-b border-gray-200"
              >
                <AccordionTrigger className="py-6 hover:no-underline cursor-pointer">
                  <div className="flex items-start gap-4 flex-1">
                    <span
                      className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      Q
                    </span>
                    <span className="text-base sm:text-lg font-bold text-gray-900 text-left">
                      {item.q}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pl-11 pr-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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

      {/* ══════════════ 기업상조 상품 상세 모달 ══════════════ */}
      {corpDetailProductId &&
        (() => {
          const product = corpFuneralProducts.find(
            (p) => p.id === corpDetailProductId,
          );
          if (!product) return null;
          const valIdx = corpDetailProductId === 'corp-1' ? 0 : 1;
          const close = () => setCorpDetailProductId(null);
          return (
            <div
              className="fixed inset-0 z-100 flex items-center justify-center bg-black/50"
              onClick={close}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 flex items-center justify-between bg-gray-100 rounded-t-2xl shrink-0">
                  <span className="font-bold text-gray-800">
                    {product.name} 상세 내역
                  </span>
                  <button
                    onClick={close}
                    className="p-1 hover:bg-black/5 rounded-lg cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
                  {/* 가격 */}
                  <div className="text-center mb-5">
                    <div className="text-sm text-gray-400 line-through">
                      {product.originalPrice}
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        (30만 원 공제)
                      </span>
                      <span
                        className="text-2xl font-extrabold"
                        style={{ color: BRAND_COLOR }}
                      >
                        {product.discountPrice}
                      </span>
                    </div>
                  </div>

                  {/* 추천 대상 */}
                  {product.summary?.length > 0 && (
                    <div className="mb-5 bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-500 mb-2 tracking-wider">
                        이런 분께 추천드립니다
                      </p>
                      <ul className="space-y-1.5">
                        {product.summary.map((rec, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <span className="text-gray-400 shrink-0 mt-0.5">
                              ·
                            </span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 카테고리별 표 */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2.5 text-center font-bold text-gray-700 w-24 border-b border-gray-200">
                            항목
                          </th>
                          <th className="px-3 py-2.5 text-center font-bold text-gray-700 border-b border-l border-gray-200">
                            지원
                          </th>
                          <th className="px-3 py-2.5 text-center font-bold text-gray-700 border-b border-l border-gray-200">
                            세부지원
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {corpComparisonData.map((section) => {
                          const filtered = section.items.filter(
                            (item) =>
                              item.values[valIdx] &&
                              item.values[valIdx] !== '-' &&
                              item.values[valIdx] !== 'x',
                          );
                          if (filtered.length === 0) return null;
                          return filtered.map((item, idx) => (
                            <tr
                              key={`${section.category}-${item.label}`}
                              className="border-t border-gray-200"
                            >
                              {idx === 0 && (
                                <td
                                  className="px-3 py-2.5 text-center font-bold text-gray-700 align-middle bg-gray-50 whitespace-pre-line text-xs sm:text-sm"
                                  rowSpan={filtered.length}
                                >
                                  {section.category}
                                </td>
                              )}
                              <td className="px-3 py-2.5 text-gray-700 align-middle border-l border-gray-200 text-xs sm:text-sm">
                                <div className="font-medium">{item.label}</div>
                                {'sub' in item && item.sub && (
                                  <div className="text-[11px] text-gray-400 mt-0.5">
                                    {item.sub}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-center text-gray-900 font-medium align-middle border-l border-gray-200 whitespace-pre-line text-xs sm:text-sm">
                                {item.values[valIdx]}
                              </td>
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="px-5 sm:px-6 py-4 border-t border-gray-200 shrink-0 flex gap-2">
                  <button
                    onClick={close}
                    className="flex-1 py-3 text-sm font-bold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    닫기
                  </button>
                  <button
                    onClick={() => {
                      setCorpConsultForm((p) => ({
                        ...p,
                        product: product.id as 'corp-1' | 'corp-2',
                      }));
                      close();
                      setShowCorpConsultModal(true);
                    }}
                    className="flex-1 py-3 text-sm font-bold rounded-xl text-white transition-colors cursor-pointer"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    상담 신청
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ══════════════ 기업상조 상담 신청 모달 ══════════════ */}
      {showCorpConsultModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50"
          onClick={() => setShowCorpConsultModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 flex items-center justify-between bg-gray-100 rounded-t-2xl shrink-0">
              <span className="font-bold text-gray-800">
                기업상조 상담 신청
              </span>
              <button
                onClick={() => setShowCorpConsultModal(false)}
                className="p-1 hover:bg-black/5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  상품
                </label>
                <Select
                  value={corpConsultForm.product}
                  onValueChange={(v) =>
                    setCorpConsultForm((p) => ({ ...p, product: v }))
                  }
                >
                  <SelectTrigger className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white cursor-pointer">
                    <SelectValue placeholder="상품을 선택해주세요." />
                  </SelectTrigger>
                  <SelectContent className="z-200">
                    <SelectItem value="corp-1">예담 기업 1호</SelectItem>
                    <SelectItem value="corp-2">예담 기업 2호</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="이름을 입력해주세요"
                    value={corpConsultForm.name}
                    onChange={(e) =>
                      setCorpConsultForm((p) => ({
                        ...p,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="-를 제외한 숫자만 입력해주세요"
                    value={corpConsultForm.phone}
                    onChange={(e) =>
                      setCorpConsultForm((p) => ({
                        ...p,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">
                    지역
                  </label>
                  <Select
                    value={corpConsultForm.region}
                    onValueChange={(v) =>
                      setCorpConsultForm((p) => ({ ...p, region: v }))
                    }
                  >
                    <SelectTrigger className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white cursor-pointer">
                      <SelectValue placeholder="시/도 선택해주세요." />
                    </SelectTrigger>
                    <SelectContent className="z-200">
                      {[
                        '서울',
                        '부산',
                        '대구',
                        '인천',
                        '광주',
                        '대전',
                        '울산',
                        '세종',
                        '경기',
                        '강원',
                        '충북',
                        '충남',
                        '전북',
                        '전남',
                        '경북',
                        '경남',
                        '제주',
                        '미정',
                      ].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">
                    상담 희망 시간
                  </label>
                  <Select
                    value={corpConsultForm.timeSlot}
                    onValueChange={(v) =>
                      setCorpConsultForm((p) => ({ ...p, timeSlot: v }))
                    }
                  >
                    <SelectTrigger className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white cursor-pointer">
                      <SelectValue placeholder="상담시간을 선택해주세요." />
                    </SelectTrigger>
                    <SelectContent className="z-200">
                      {[
                        '00:00~06:00',
                        '06:00~08:00',
                        '08:00~10:00',
                        '10:00~12:00',
                        '12:00~14:00',
                        '14:00~16:00',
                        '16:00~18:00',
                        '18:00~20:00',
                        '20:00~22:00',
                        '22:00~24:00',
                      ].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={corpConsultForm.privacyAgreed}
                  onChange={(e) =>
                    setCorpConsultForm((p) => ({
                      ...p,
                      privacyAgreed: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: BRAND_COLOR }}
                />
                <span className="text-xs text-gray-500">
                  개인정보 수집 및 이용 동의
                </span>
              </label>
            </div>

            <div className="px-6 py-4 shrink-0">
              <button
                disabled={corpConsultSubmitting}
                onClick={async () => {
                  if (!corpConsultForm.product) {
                    toast.warning('상품을 선택해주세요.');
                    return;
                  }
                  if (
                    !corpConsultForm.name.trim() ||
                    !corpConsultForm.phone.trim()
                  ) {
                    toast.warning('이름과 연락처를 입력해주세요.');
                    return;
                  }
                  if (!corpConsultForm.privacyAgreed) {
                    toast.warning('개인정보 수집 및 이용에 동의해주세요.');
                    return;
                  }
                  setCorpConsultSubmitting(true);
                  try {
                    const res = await fetch(
                      '/api/v1/corporate-funeral/consultation',
                      {
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
                      },
                    );
                    const result = await res.json();
                    if (result.success) {
                      toast.success(
                        '상담 신청이 완료되었습니다.\n담당자가 빠르게 연락드리겠습니다.',
                      );
                      setCorpConsultForm({
                        product: '',
                        name: '',
                        phone: '',
                        region: '',
                        timeSlot: '',
                        privacyAgreed: false,
                      });
                      setShowCorpConsultModal(false);
                    } else {
                      toast.error(result.message || '오류가 발생했습니다.');
                    }
                  } catch {
                    toast.error(
                      '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                    );
                  } finally {
                    setCorpConsultSubmitting(false);
                  }
                }}
                className="w-full py-4 rounded-xl text-white font-bold text-base cursor-pointer hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {corpConsultSubmitting ? '신청 중...' : '상담 신청하기'}
              </button>
            </div>
          </div>
        </div>
      )}

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
