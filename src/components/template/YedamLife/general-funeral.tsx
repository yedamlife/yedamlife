'use client';
import { CONTACT_PHONE, CONTACT_TEL_HREF } from '@/constants/contact';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Headphones,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  ChevronDown,
  Info,
  ScrollText,
  Calculator,
  Phone,
  MapPin,
  X,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
  serviceBenefits,
  funeralProducts,
  productDetails,
  afterServices,
  clientLogoRow1,
  clientLogoRow2,
  clientLogoRow3,
  LOGO_BASE,
  surveyQuestions,
  comparisonData,
} from './constants';
import {
  FaqItem,
  CountUp,
  MembershipSection,
  CtaSection,
  ReviewCarousel,
  ReviewItem,
  stripHtml,
} from './components';
import { FuneralCostModal } from './funeral-cost-modal';

const PRODUCT_IMG_BASE =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/products';

const PRODUCT_LABEL_IMAGES: Record<string, { src: string; alt: string }[]> = {
  장례지도사: [
    { src: `${PRODUCT_IMG_BASE}/funeral_director.avif`, alt: '장례지도사' },
  ],
  '접객 도우미': [
    { src: `${PRODUCT_IMG_BASE}/funeral_manager2.png`, alt: '접객 도우미' },
  ],
  입관지도사: [
    {
      src: `${PRODUCT_IMG_BASE}/encoffinment_director.avif`,
      alt: '입관지도사',
    },
  ],
  입관상례사: [
    {
      src: `${PRODUCT_IMG_BASE}/encoffinment_director.avif`,
      alt: '입관상례사',
    },
  ],
  앰뷸런스: [{ src: `${PRODUCT_IMG_BASE}/ambulance.avif`, alt: '앰뷸런스' }],
  장의버스: [
    { src: `${PRODUCT_IMG_BASE}/funeral_bus-v2.avif`, alt: '장의버스' },
  ],
  리무진: [{ src: `${PRODUCT_IMG_BASE}/limousine-v2.avif`, alt: '리무진' }],
  '장의버스 / 리무진': [
    { src: `${PRODUCT_IMG_BASE}/funeral_bus-v2.avif`, alt: '장의버스' },
    { src: `${PRODUCT_IMG_BASE}/limousine-v2.avif`, alt: '리무진' },
  ],
  '장의버스 / 장의리무진': [
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
  '관(화장용)': [
    { src: `${PRODUCT_IMG_BASE}/cremation_coffin.avif`, alt: '관' },
  ],
  횡대: [
    { src: `${PRODUCT_IMG_BASE}/burial_boards_converted.avif`, alt: '횡대' },
  ],
  유골함: [
    { src: `${PRODUCT_IMG_BASE}/cremation_urn_converted.avif`, alt: '유골함' },
  ],
  '유골함/횡대(매장시)': [
    { src: `${PRODUCT_IMG_BASE}/cremation_urn_converted.avif`, alt: '유골함' },
    { src: `${PRODUCT_IMG_BASE}/burial_boards_converted.avif`, alt: '횡대' },
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
  운구지원: [
    {
      src: `${PRODUCT_IMG_BASE}/pallbearing_support_converted.avif`,
      alt: '운구지원',
    },
  ],
};

export interface GeneralFuneralProps {
  googleFormUrl: string;
  membershipHref: string;
  inquiryMainTab: 'products' | 'design';
  setInquiryMainTab: (tab: 'products' | 'design') => void;
  chartProductIdx: number;
  setChartProductIdx: (idx: number) => void;
  productInquiryTab: string;
  setProductInquiryTab: (tab: string) => void;
  surveyStep: number;
  setSurveyStep: (step: number) => void;
  surveyAnswers: Record<number, string>;
  setSurveyAnswers: (answers: Record<number, string>) => void;
  inquirySectionRef: React.RefObject<HTMLDivElement | null>;
  embedded?: boolean;
  headerRef: React.RefObject<HTMLElement | null>;
}

export function GeneralFuneral({
  googleFormUrl,
  membershipHref,
  inquiryMainTab,
  setInquiryMainTab,
  chartProductIdx,
  setChartProductIdx,
  productInquiryTab,
  setProductInquiryTab,
  surveyStep,
  setSurveyStep,
  surveyAnswers,
  setSurveyAnswers,
  inquirySectionRef,
  embedded,
  headerRef,
}: GeneralFuneralProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    fetch('/api/v1/reviews?category=general&limit=8')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setReviews(json.data);
      })
      .catch(() => {});
  }, []);

  // 상담 신청 폼 state
  const [consultForm, setConsultForm] = useState({
    product: '',
    name: '',
    phone: '',
    region: '',
    timeSlot: '',
    privacyAgreed: false,
  });
  const [consultSubmitting, setConsultSubmitting] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);

  useEffect(() => {
    const handler = () => setShowConsultModal(true);
    window.addEventListener('open-general-consult-modal', handler);
    return () =>
      window.removeEventListener('open-general-consult-modal', handler);
  }, []);

  // CTA 라이브 피드 — 상담완료 로테이션
  const [liveFeed, setLiveFeed] = useState<
    { id: number; name: string; status: string; time: string }[]
  >(() => [
    { id: 0, name: '김*철', status: '전화상담완료', time: '방금' },
    { id: 1, name: '박*솔', status: '상담신청', time: '1분전' },
    { id: 2, name: '박*안', status: '전화상담완료', time: '3분전' },
    { id: 3, name: '임*순', status: '상담신청', time: '방금' },
  ]);

  useEffect(() => {
    const namePool = [
      '김*철',
      '박*솔',
      '박*안',
      '임*순',
      '이*민',
      '정*혜',
      '최*우',
      '강*진',
      '윤*서',
      '한*규',
      '조*아',
      '서*호',
      '문*경',
      '오*빈',
      '신*경',
      '권*영',
      '황*수',
      '안*지',
      '송*현',
      '류*연',
      '백*재',
      '남*호',
      '장*미',
      '홍*기',
      '구*린',
      '나*은',
      '전*아',
      '문*수',
      '주*혁',
      '심*나',
    ];
    const statusPool = ['전화상담완료', '상담신청'];
    const timePool = ['방금', '1분전', '2분전', '3분전', '5분전', '7분전'];
    const pick = <T,>(arr: T[]): T =>
      arr[Math.floor(Math.random() * arr.length)];

    let counter = 1000;
    const swap = (slotIdx: number) => {
      setLiveFeed((prev) =>
        prev.map((item, i) =>
          i === slotIdx
            ? {
                id: counter++,
                name: pick(namePool),
                status: pick(statusPool),
                time: pick(timePool),
              }
            : item,
        ),
      );
    };

    // 각 슬롯마다 독립적인 주기(5~9초)로 변경
    const timers: ReturnType<typeof setTimeout>[] = [];
    const scheduleSlot = (slotIdx: number) => {
      const delay = 5000 + Math.random() * 4000;
      timers[slotIdx] = setTimeout(() => {
        swap(slotIdx);
        scheduleSlot(slotIdx);
      }, delay);
    };
    for (let i = 0; i < 4; i++) scheduleSlot(i);
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  // 다이렉트 장례설계 폼 state
  const [directName, setDirectName] = useState('');
  const [directPhone, setDirectPhone] = useState('');
  const [directSubmitting, setDirectSubmitting] = useState(false);

  // 모바일 캐러셀: 확장 배열 [last, ...all, first] → 인덱스 1부터 시작
  const [carouselInternalIdx, setCarouselInternalIdx] = useState(1);
  const [carouselTransition, setCarouselTransition] = useState(true);
  const extendedProducts = [
    funeralProducts[funeralProducts.length - 1],
    ...funeralProducts,
    funeralProducts[0],
  ];
  const realProductIdx =
    (((carouselInternalIdx - 1) % funeralProducts.length) +
      funeralProducts.length) %
    funeralProducts.length;

  const CAROUSEL_MS = 370;

  const handleCarouselNext = useCallback(() => {
    setCarouselTransition(true);
    setCarouselInternalIdx((prev) => prev + 1);
  }, []);

  const handleCarouselPrev = useCallback(() => {
    setCarouselTransition(true);
    setCarouselInternalIdx((prev) => prev - 1);
  }, []);

  // 클론 위치 도달 시 타이머로 점프 (onTransitionEnd 대체)
  useEffect(() => {
    if (
      carouselInternalIdx === 0 ||
      carouselInternalIdx === funeralProducts.length + 1
    ) {
      const timer = setTimeout(() => {
        setCarouselTransition(false);
        setCarouselInternalIdx(
          carouselInternalIdx === 0 ? funeralProducts.length : 1,
        );
      }, CAROUSEL_MS);
      return () => clearTimeout(timer);
    }
  }, [carouselInternalIdx]);

  const handleDotClick = useCallback((idx: number) => {
    setCarouselTransition(true);
    setCarouselInternalIdx(idx + 1);
  }, []);

  // 사전·당일 서비스 캐러셀 (8개)
  const [beforeIdx, setBeforeIdx] = useState(1);
  const [beforeTransition, setBeforeTransition] = useState(true);
  const extendedBefore = [
    serviceBenefits[serviceBenefits.length - 1],
    ...serviceBenefits,
    serviceBenefits[0],
  ];
  const realBeforeIdx =
    (((beforeIdx - 1) % serviceBenefits.length) + serviceBenefits.length) %
    serviceBenefits.length;

  const handleBeforeNext = useCallback(() => {
    setBeforeTransition(true);
    setBeforeIdx((prev) => prev + 1);
  }, []);
  const handleBeforePrev = useCallback(() => {
    setBeforeTransition(true);
    setBeforeIdx((prev) => prev - 1);
  }, []);
  useEffect(() => {
    if (beforeIdx === 0 || beforeIdx === serviceBenefits.length + 1) {
      const timer = setTimeout(() => {
        setBeforeTransition(false);
        setBeforeIdx(beforeIdx === 0 ? serviceBenefits.length : 1);
      }, CAROUSEL_MS);
      return () => clearTimeout(timer);
    }
  }, [beforeIdx]);
  const handleBeforeDotClick = useCallback((idx: number) => {
    setBeforeTransition(true);
    setBeforeIdx(idx + 1);
  }, []);

  // 사후 케어 캐러셀 (5개)
  const [afterIdx, setAfterIdx] = useState(1);
  const [afterTransition, setAfterTransition] = useState(true);
  const extendedAfter = [
    afterServices[afterServices.length - 1],
    ...afterServices,
    afterServices[0],
  ];
  const realAfterIdx =
    (((afterIdx - 1) % afterServices.length) + afterServices.length) %
    afterServices.length;

  const handleAfterNext = useCallback(() => {
    setAfterTransition(true);
    setAfterIdx((prev) => prev + 1);
  }, []);
  const handleAfterPrev = useCallback(() => {
    setAfterTransition(true);
    setAfterIdx((prev) => prev - 1);
  }, []);
  useEffect(() => {
    if (afterIdx === 0 || afterIdx === afterServices.length + 1) {
      const timer = setTimeout(() => {
        setAfterTransition(false);
        setAfterIdx(afterIdx === 0 ? afterServices.length : 1);
      }, CAROUSEL_MS);
      return () => clearTimeout(timer);
    }
  }, [afterIdx]);
  const handleAfterDotClick = useCallback((idx: number) => {
    setAfterTransition(true);
    setAfterIdx(idx + 1);
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
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [costModalOpen, setCostModalOpen] = useState(false);

  // URL에 fc_type 파라미터가 있으면 모달 자동 오픈
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('fc_type')) {
      setCostModalOpen(true);
    }
  }, []);

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

  // 주요정보 안내사항 데이터 (전 상품 공통)
  const noticeItems: { category: string; items: string[] }[] = [
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
    {
      category: '운구서비스',
      items: [
        '운구지원 서비스는 2인 & 4인 수도권내(서울,경기,인천)지역 화장시 지원이며,',
        '운구지원 추가시 화장 : 12만원/인당, 매장 : 15만원/인당 추가비용 발생 (수도권내 지역)',
      ],
    },
  ];

  return (
    <>
      {/* Tab 0: 일반 상조 히어로 */}
      <section id="sec-hero" className="overflow-hidden">
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-no-repeat bg-position-[75%_center] sm:bg-position-[15%_center] scale-[1.25] sm:scale-100 origin-center"
            style={{
              backgroundImage:
                'url(https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/general_funeral/general_funeral_hero.jpg)',
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 py-32 sm:py-28 lg:py-36 px-4 sm:px-6">
            <div className="text-left max-w-3xl sm:mx-auto sm:max-w-5xl sm:pr-[20%] lg:pr-[25%]">
              {/* ISO 9001 업계 최초 배지 */}
              <div className="flex justify-start mb-7 sm:mb-9">
                <a
                  href="/about#iso"
                  className="group inline-flex items-center gap-2 sm:gap-3 pl-5 sm:pl-6 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-2xl text-center transition-colors hover:bg-black/25 cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.18)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  <span className="block text-left">
                    <span
                      className="block font-bold leading-tight"
                      style={{
                        fontSize: '13px',
                        color: '#e8d5a3',
                        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                      }}
                    >
                      국내 후불제 상조업계 최초
                    </span>
                    <span
                      className="block font-semibold text-white leading-tight mt-0.5"
                      style={{
                        fontSize: '12.5px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                      }}
                    >
                      ISO 9001 품질경영시스템 인증 획득
                    </span>
                  </span>
                  <ChevronRight
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 transition-transform duration-300 group-hover:translate-x-0.5"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                  />
                </a>
              </div>

              {/* PC: 서브타이틀 + 메인타이틀 */}
              <p
                className="hidden sm:block text-white text-xl lg:text-2xl font-medium mb-5 tracking-wide"
                style={{
                  textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                진심으로 禮를 담아 감동을 전해드리는
              </p>
              <h1
                className="hidden sm:block text-[28px] lg:text-[36px] font-bold text-white leading-snug mb-1 whitespace-nowrap"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                대한민국 代表 후불제 상조기업
              </h1>
              <h1
                className="hidden sm:block text-[28px] lg:text-[36px] font-bold leading-snug mb-10"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                <span style={{ color: '#e8d5a3', fontWeight: 700 }}>
                  &ldquo;예담라이프&rdquo;
                </span>
              </h1>

              {/* 모바일: 서브타이틀 + 메인타이틀 */}
              <p
                className="sm:hidden text-white text-[15px] font-semibold mb-3 tracking-wide"
                style={{
                  textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                진심으로 禮를 담아 감동을 전해드리는
              </p>
              <p
                className="sm:hidden font-bold text-white leading-relaxed mb-1 whitespace-nowrap"
                style={{
                  fontSize: '24px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                대한민국 代表 후불제 상조기업
              </p>
              <p
                className="sm:hidden font-bold leading-relaxed mb-8"
                style={{
                  fontSize: '24px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                <span style={{ color: '#e8d5a3', fontWeight: 700 }}>
                  &ldquo;예담라이프&rdquo;
                </span>
              </p>
              {/* CTA 버튼 그룹 — 전화 상담 / 장례비용 계산 */}
              <div className="flex justify-start px-2 mt-12 sm:mt-16">
                <div
                  className="relative w-auto sm:w-full max-w-2xl rounded-2xl overflow-hidden bg-white"
                  style={{
                    boxShadow:
                      '0 1px 0 0 rgba(255,255,255,0.9) inset, 0 22px 48px -14px rgba(20,16,8,0.35), 0 8px 16px -6px rgba(20,16,8,0.18)',
                  }}
                >
                  {/* 상단 미세 하이라이트 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-white to-transparent z-10"
                  />

                  {/* 자동 shimmer */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-yellow-50/60 to-transparent z-0"
                    style={{
                      animation: 'shimmer 3.5s ease-in-out infinite',
                    }}
                  />

                  <div className="relative grid grid-cols-2 sm:flex items-stretch z-10">
                    {/* 좌: 전화 상담 (모바일 숨김) */}
                    <a
                      href={CONTACT_TEL_HREF}
                      className="group/phone hidden sm:flex flex-1 items-center gap-2.5 sm:gap-3 pl-4 sm:pl-5 pr-3 sm:pr-4 py-3.5 sm:py-4 min-w-0 cursor-pointer transition-colors duration-300 bg-white hover:bg-gray-50"
                    >
                      <Phone
                        className="shrink-0 w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] text-gray-800 transition-transform duration-300 group-hover/phone:-rotate-12"
                        strokeWidth={1.9}
                      />
                      <p className="text-left leading-tight tracking-[-0.01em] whitespace-nowrap">
                        <span className="block text-[10.5px] sm:text-[11px] font-semibold tracking-[0.06em] text-gray-500 mb-0.5">
                          전화 상담
                        </span>
                        <span className="block text-[14.5px] sm:text-[15.5px] font-extrabold text-gray-900">
                          {CONTACT_PHONE}
                        </span>
                      </p>
                    </a>

                    {/* 구분선 (모바일 숨김) */}
                    <span className="hidden sm:block w-px bg-gray-200/80" />

                    {/* 중: 장례비용 계산 */}
                    <button
                      onClick={() => setCostModalOpen(true)}
                      className="group/calc flex items-center gap-2.5 pl-4 pr-3 py-3.5 sm:py-4 min-w-0 cursor-pointer transition-colors duration-300 bg-white hover:bg-gray-50 sm:flex-[1.25]"
                    >
                      <Calculator
                        className="shrink-0 w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] text-blue-800 transition-transform duration-300 group-hover/calc:-rotate-6 group-hover/calc:scale-110"
                        strokeWidth={1.9}
                      />
                      <p className="min-w-0 text-left leading-tight tracking-[-0.01em] whitespace-nowrap">
                        <span className="block text-[10.5px] sm:text-[11px] font-semibold tracking-[0.06em] text-gray-500 mb-0.5">
                          30초만에
                        </span>
                        <span className="block text-[14.5px] sm:text-[14.5px] font-extrabold text-gray-900">
                          <span>장례비용</span> 계산
                        </span>
                      </p>
                      <ArrowRight
                        className="shrink-0 ml-auto w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-gray-400 transition-all duration-300 group-hover/calc:text-gray-900 group-hover/calc:translate-x-1"
                        strokeWidth={1.8}
                      />
                    </button>

                    {/* 구분선 (모바일에서는 grid 컬럼 차지하지 않도록 숨김 — 대신 우측 버튼 좌측 보더) */}
                    <span className="hidden sm:block w-px bg-gray-200/80" />

                    {/* 우: 장지+ */}
                    <a
                      href="/burial-plus"
                      className="group/burial flex items-center gap-2.5 sm:gap-3 pl-4 sm:pl-5 pr-3 sm:pr-4 py-3.5 sm:py-4 min-w-0 cursor-pointer transition-colors duration-300 bg-white hover:bg-gray-50 border-l border-gray-200/80 sm:border-l-0 sm:flex-1"
                    >
                      <MapPin
                        className="shrink-0 w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] text-amber-900 transition-transform duration-300 group-hover/burial:-translate-y-0.5 group-hover/burial:scale-110"
                        strokeWidth={1.9}
                      />
                      <p className="flex-1 text-left leading-tight tracking-[-0.01em] whitespace-nowrap">
                        <span className="block text-[10.5px] sm:text-[11px] font-semibold tracking-[0.06em] text-gray-500 mb-0.5">
                          장지 검색
                        </span>
                        <span className="block text-[14.5px] sm:text-[15.5px] font-extrabold text-gray-900">
                          장지<span style={{ color: BRAND_COLOR }}>+</span>
                        </span>
                      </p>
                      <ArrowRight
                        className="shrink-0 w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-gray-400 transition-all duration-300 group-hover/burial:text-gray-900 group-hover/burial:translate-x-1"
                        strokeWidth={1.8}
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1-2. 통계 섹션 ── */}
      <section
        className="border-b border-gray-200 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 md:gap-y-0">
            {/* 1. 상담 건수 */}
            <div className="flex flex-col items-center justify-center px-2 py-1.5 md:py-3 min-h-[58px] md:min-h-0 border-r border-gray-200">
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
                누적 상담 건수
              </p>
            </div>

            {/* 2. 가입 건수 */}
            <div className="flex flex-col items-center justify-center px-2 py-1.5 md:py-3 min-h-[58px] md:min-h-0 md:border-r border-gray-200">
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

            {/* 3. 24시 긴급출동 */}
            <div className="flex flex-col items-center justify-center px-2 py-1.5 md:py-3 min-h-[58px] md:min-h-0 border-r border-gray-200">
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

            {/* 4. 가입비 0원 */}
            <div className="flex flex-col items-center justify-center px-2 py-1.5 md:py-3 min-h-[58px] md:min-h-0">
              <div className="flex items-baseline">
                <span className="text-lg sm:text-3xl font-extrabold tracking-tight text-gray-900">
                  0
                </span>
                <span className="text-[13px] sm:text-lg font-extrabold ml-0.5 sm:ml-1 text-gray-900">
                  원
                </span>
              </div>
              <p className="text-[11px] sm:text-sm text-gray-500 mt-1 text-center">
                가입비 · 월 납입금
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4.5 후불제 상조 소개 섹션 ── */}
      <section id="sec-about" className="overflow-hidden">
        {/* 상단: 후불제 상조 소개 */}
        <div className="relative py-20 sm:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            {/* 타이틀 */}
            <div className="text-center mb-14">
              {/*  행간 조절 */}
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 tracking-wide leading-relaxed"
                style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}
              >
                예담라이프는 진심을 담아 <br />
                아름다운 이별을 준비합니다
              </h2>
            </div>

            {/* 4개 카드 - 아이콘 스타일 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  title: '빈소 운영 지원',
                  desc: '장례식장 설의부터 빈소 세팅, 조문객 안내까지\n전 과정을 책임집니다.',
                  icon: '⛪',
                },
                {
                  title: '전문 장례지도사',
                  desc: '전문 장례지도사가 입관·발인·화장까지\n세심하게 도움합니다.',
                  icon: '👤',
                },
                {
                  title: '사전가입 혜택',
                  desc: '사전 가입 시 20만원 즉시 할인\n및 소개 혜택으로 합리적인 서비스를 제공합니다.',
                  icon: '📋',
                },
                {
                  title: '사후 행정 지원',
                  desc: '유품정리·안심상속·법률상담까지\n사후 모든 행정 절차를 안내합니다.',
                  icon: '✨',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl border border-gray-200 px-4 py-6 flex flex-col"
                >
                  <div className="text-4xl mb-3">{card.icon}</div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단: 차트 + CTA */}
        <div
          className="py-20 sm:py-28"
          style={{
            background: 'linear-gradient(180deg, #eef6fb 0%, #f7f7f7 100%)',
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-sm sm:text-base font-semibold text-gray-400 mb-3 tracking-wide">
                장례비용도 매년 오른다고?
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                0원으로
                <br />
                미래 장례 비용을 절약하세요!
              </h2>
              <p className="mt-3 text-base sm:text-lg text-gray-500">
                사전 가입비, 월회비, 연회비 전혀 없습니다!
              </p>
            </div>

            {/* 상품 탭 */}
            <div
              className="flex items-center sm:justify-center gap-2 mb-10 overflow-x-auto sm:flex-wrap"
              style={{ scrollbarWidth: 'none' } as React.CSSProperties}
            >
              {funeralProducts.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setChartProductIdx(idx)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors cursor-pointer border ${chartProductIdx === idx ? 'bg-gray-800 text-white border-gray-800' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
                >
                  {p.name}
                  {p.subtitle ? ` (${p.subtitle})` : ''}
                </button>
              ))}
            </div>

            {/* 차트: 예담라이프 vs 선불제상조 vs 장례식장 비교 (2단 스택 바) */}
            {(() => {
              // 장례식장 비용(공통) + 상조 비용(차이) 분리
              const priceMap = [
                {
                  facilityFee: 100,
                  yedamFee: 30,
                  prepaidFee: 100,
                  funeralHomeFee: 250,
                },
                {
                  facilityFee: 150,
                  yedamFee: 80,
                  prepaidFee: 180,
                  funeralHomeFee: 350,
                },
                {
                  facilityFee: 200,
                  yedamFee: 140,
                  prepaidFee: 280,
                  funeralHomeFee: 500,
                },
                {
                  facilityFee: 250,
                  yedamFee: 210,
                  prepaidFee: 380,
                  funeralHomeFee: 650,
                },
              ];
              const p = priceMap[chartProductIdx];
              const totalYedam = p.facilityFee + p.yedamFee;
              const totalPrepaid = p.facilityFee + p.prepaidFee;
              const totalFuneral = p.facilityFee + p.funeralHomeFee;
              const maxTotal = totalFuneral;
              const maxBarH = 220;
              const h = (val: number) => Math.round((val / maxTotal) * maxBarH);
              const savingPercent = Math.round(
                ((totalFuneral - totalYedam) / totalFuneral) * 100,
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
                {
                  label: '장례식장',
                  total: totalFuneral,
                  serviceFee: p.funeralHomeFee,
                  darkColor: '#6b7280',
                  lightColor: '#e5e7eb',
                  isHighlight: false,
                },
              ];

              const maxServiceFee = Math.max(...bars.map((b) => b.serviceFee));

              return (
                <div className="max-w-xl mx-auto mb-14">
                  <div
                    className="grid justify-center transition-all duration-500"
                    style={{
                      gridTemplateColumns:
                        'repeat(3, minmax(70px, 110px)) auto',
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
                        height={h(bars[2].serviceFee)}
                        viewBox={`0 0 32 ${h(bars[2].serviceFee)}`}
                        style={{
                          display: 'block',
                          minWidth: 32,
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      >
                        <path
                          d={`M 2 4 C 16 4, 16 ${h(bars[2].serviceFee) / 2}, 16 ${h(bars[2].serviceFee) / 2} C 16 ${h(bars[2].serviceFee) / 2}, 16 ${h(bars[2].serviceFee) - 4}, 2 ${h(bars[2].serviceFee) - 4}`}
                          stroke="#374151"
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                      <span
                        className="text-[11px] sm:text-xs font-semibold whitespace-nowrap"
                        style={{ color: '#374151' }}
                      >
                        &apos;상조&apos;
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
                        style={{
                          display: 'block',
                          minWidth: 32,
                          flexShrink: 0,
                        }}
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
                      <span
                        className="text-[11px] sm:text-xs font-semibold whitespace-nowrap"
                        style={{ color: '#374151' }}
                      >
                        장례식장 기본 이용료
                      </span>
                    </div>

                    {/* Row 4: 하단 라벨 */}
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
                  const product = funeralProducts[chartProductIdx];
                  setProductInquiryTab(product.id);
                  setTimeout(() => {
                    document
                      .getElementById('inquiry')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 text-base sm:text-lg font-bold text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {funeralProducts[chartProductIdx].name}
                {funeralProducts[chartProductIdx].subtitle
                  ? `(${funeralProducts[chartProductIdx].subtitle})`
                  : ''}
                로 장례 준비하기
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. 후불제 상조 상품안내 ── */}
      <section
        id="sec-products"
        className="py-16 sm:py-24 overflow-hidden bg-white"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              후불제상조 상품안내
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-500">
              합리적인 비용으로 품격 있는 장례를 준비하세요
            </p>
          </div>
          {/* 모바일: 슬라이드 캐러셀 (양옆 카드 미리보기, 무한 순환) */}
          <div className="sm:hidden -mx-4">
            <div className="relative overflow-hidden">
              {/* 카드 트랙: [clone-last, ...real, clone-first] */}
              <div
                className="flex items-stretch"
                style={{
                  gap: 10,
                  transition: carouselTransition
                    ? 'transform 0.35s ease-in-out'
                    : 'none',
                  transform: `translateX(calc(-${carouselInternalIdx} * (72vw + 10px) + (100vw - 72vw) / 2))`,
                }}
                {...swipeHandlers(handleCarouselPrev, handleCarouselNext)}
              >
                {extendedProducts.map((product, i) => {
                  const isActive = i === carouselInternalIdx;
                  const originalIdx =
                    (((i - 1) % funeralProducts.length) +
                      funeralProducts.length) %
                    funeralProducts.length;
                  return (
                    <div
                      key={`carousel-${i}`}
                      className="shrink-0"
                      style={{
                        width: '72vw',
                        opacity: isActive ? 1 : 0.35,
                        transform: isActive ? 'scale(1)' : 'scale(0.93)',
                        transition: carouselTransition
                          ? 'opacity 0.35s ease, transform 0.35s ease'
                          : 'none',
                      }}
                    >
                      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 h-full flex flex-col">
                        <div className="h-44 overflow-hidden">
                          <img
                            src={`https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/product_bnr0${originalIdx + 1}.jpg`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="text-base font-bold text-gray-900 mb-1.5">
                            {product.name}
                            {product.subtitle ? ` (${product.subtitle})` : ''}
                          </h3>
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
                          {product.subtitle === '무빈소' ? (
                            <button
                              onClick={() => {
                                window.dispatchEvent(
                                  new CustomEvent('open-general-consult-modal'),
                                );
                              }}
                              className="w-full px-1 py-2.5 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer hover:bg-gray-200 bg-gray-100 text-gray-700 whitespace-nowrap"
                            >
                              상담신청
                            </button>
                          ) : (
                            <div className="flex rounded-lg overflow-hidden border border-gray-200">
                              <button
                                onClick={() => {
                                  window.dispatchEvent(
                                    new CustomEvent(
                                      'open-general-consult-modal',
                                    ),
                                  );
                                }}
                                className="flex-1 px-1 py-2.5 text-[11px] font-semibold transition-colors cursor-pointer hover:bg-gray-100 bg-white text-gray-700 whitespace-nowrap"
                              >
                                상담신청
                              </button>
                              <span className="w-px bg-gray-200" />
                              <a
                                href="/membership/general"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-1 py-2.5 text-[11px] font-bold transition-opacity cursor-pointer text-center inline-flex items-center justify-center whitespace-nowrap hover:opacity-90"
                                style={{
                                  backgroundColor: BRAND_COLOR_LIGHT,
                                  color: BRAND_COLOR,
                                }}
                              >
                                80만원 혜택받기
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 좌우 화살표 */}
              <button
                onClick={handleCarouselPrev}
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
                onClick={handleCarouselNext}
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
              {funeralProducts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  className="cursor-pointer"
                  style={{
                    width: realProductIdx === idx ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      realProductIdx === idx ? BRAND_COLOR : '#d1d5db',
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
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {funeralProducts.map((product, idx) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="h-44 overflow-hidden">
                  <img
                    src={`https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/product_bnr0${idx + 1}.jpg`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    {product.name}
                    {product.subtitle ? ` (${product.subtitle})` : ''}
                  </h3>
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
                  {product.subtitle === '무빈소' ? (
                    <button
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent('open-general-consult-modal'),
                        );
                      }}
                      className="w-full py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer hover:bg-gray-200 bg-gray-100 text-gray-700"
                    >
                      상담신청
                    </button>
                  ) : (
                    <div className="flex rounded-lg overflow-hidden border border-gray-200">
                      <button
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent('open-general-consult-modal'),
                          );
                        }}
                        className="flex-1 py-2.5 text-xs font-semibold transition-colors cursor-pointer hover:bg-gray-100 bg-white text-gray-700"
                      >
                        상담신청
                      </button>
                      <span className="w-px bg-gray-200" />
                      <a
                        href="/membership/general"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 text-xs font-bold transition-opacity cursor-pointer text-center inline-flex items-center justify-center hover:opacity-90"
                        style={{
                          backgroundColor: BRAND_COLOR_LIGHT,
                          color: BRAND_COLOR,
                        }}
                      >
                        80만원 혜택받기
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. 장례상품 안내 ── */}
      <div ref={inquirySectionRef}>
        <section id="inquiry" className="mt-16 py-16 sm:py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                예담라이프 장례상품 안내
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mt-3">
                가족의 마음을 담아 정성스럽게 예담라이프가 준비해드립니다
              </p>
            </div>

            {/* Sticky 탭 */}
            <div className="sticky top-0 z-20 bg-gray-50 pt-2 pb-4">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                <button
                  onClick={() => setProductInquiryTab('all')}
                  className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${productInquiryTab === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  전체비교
                </button>
                {funeralProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProductInquiryTab(p.id)}
                    className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${productInquiryTab === p.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {p.name} {p.subtitle}
                  </button>
                ))}
              </div>
            </div>

            {/* ===== 카드 UI (신규 — 기본 표시) ===== */}
            {viewMode === 'card' && (
              <div className="mt-8">
                {/* 전체비교 탭 — 카드 그리드 */}
                {productInquiryTab === 'all' && (
                  <div>
                    {comparisonData.map((section) => (
                      <div
                        key={section.category}
                        className="mb-10 max-w-3xl mx-auto"
                      >
                        <div
                          className="w-8 h-1 rounded-full mb-3"
                          style={{ backgroundColor: BRAND_COLOR }}
                        />
                        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-5">
                          {section.category.replace(/\n/g, ' ')}
                        </h3>
                        <div className="grid gap-x-4 sm:gap-x-6 gap-y-6 justify-items-center grid-cols-3 sm:grid-cols-5">
                          {section.items.map((item) => {
                            const images = PRODUCT_LABEL_IMAGES[item.label];
                            return (
                              <div
                                key={item.label}
                                className="flex flex-col items-center text-center w-full"
                              >
                                {/* 정사각형 이미지 */}
                                {images ? (
                                  <div
                                    className="w-full aspect-square rounded-lg overflow-hidden bg-gray-50 cursor-pointer"
                                    onClick={() =>
                                      setLightboxSrc(images[0].src)
                                    }
                                  >
                                    <img
                                      src={images[0].src}
                                      alt={images[0].alt}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                                    <span className="text-2xl text-gray-300">
                                      {section.category.includes('인력')
                                        ? '👤'
                                        : section.category.includes('차량')
                                          ? '🚐'
                                          : section.category.includes('상복')
                                            ? '👔'
                                            : '📦'}
                                    </span>
                                  </div>
                                )}
                                {/* 텍스트 정보 */}
                                <div className="mt-2 w-full min-w-0">
                                  <div className="relative flex items-center justify-center gap-1 mb-1.5">
                                    <h4 className="text-sm font-medium text-gray-500">
                                      {item.label}
                                    </h4>
                                    {'sub' in item && item.sub && (
                                      <button
                                        type="button"
                                        className="shrink-0 cursor-pointer"
                                        onClick={() =>
                                          setTooltipLabel(
                                            tooltipLabel === item.label
                                              ? null
                                              : item.label,
                                          )
                                        }
                                      >
                                        <Info className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700 transition-colors" />
                                      </button>
                                    )}
                                    {tooltipLabel === item.label &&
                                      'sub' in item &&
                                      item.sub && (
                                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-10 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                                          {item.sub}
                                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                                        </div>
                                      )}
                                  </div>
                                  {item.values.every((v, i) => i === 0 || !v) &&
                                  item.values[0] ? (
                                    <p className="text-xs font-bold text-gray-900 mt-1">
                                      {item.values[0]}
                                    </p>
                                  ) : (
                                    <ul className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
                                      {funeralProducts.map((p, idx) => (
                                        <li
                                          key={p.id}
                                          className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs"
                                        >
                                          <span className="text-gray-500 whitespace-nowrap shrink-0">
                                            {p.name}
                                          </span>
                                          <span
                                            className={`font-semibold text-right ${item.values[idx] && item.values[idx] !== '-' ? 'text-gray-700' : 'text-gray-300'}`}
                                          >
                                            {item.values[idx] || '-'}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 상품별 탭 — 카드 그리드 */}
                {productInquiryTab !== 'all' &&
                  (() => {
                    const product = funeralProducts.find(
                      (p) => p.id === productInquiryTab,
                    );
                    const detail = productDetails[productInquiryTab];
                    if (!product || !detail) return null;
                    return (
                      <div className="max-w-3xl mx-auto">
                        {/* 추천 대상 */}
                        <div className="mb-10">
                          <div
                            className="w-8 h-1 rounded-full mb-3"
                            style={{ backgroundColor: BRAND_COLOR }}
                          />
                          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug mb-4">
                            {product.subtitle
                              ? `${product.name.replace('예담 ', '무빈소 ')} 이용,`
                              : `${product.name},`}
                            <br />
                            다음과 같은 분께 추천드립니다.
                          </h3>
                          <ul className="space-y-2">
                            {detail.recommendations.map((rec, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-gray-600"
                              >
                                <span className="text-gray-400 shrink-0 mt-0.5">
                                  ·
                                </span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 카테고리별 이미지 카드 그리드 */}
                        {detail.tableRows.map((section) => {
                          const filtered = section.items.filter(
                            (item) =>
                              item.value &&
                              item.value !== '-' &&
                              item.value !== 'x',
                          );
                          if (filtered.length === 0) return null;
                          return (
                            <div key={section.category} className="mb-10">
                              <div
                                className="w-8 h-1 rounded-full mb-3"
                                style={{ backgroundColor: BRAND_COLOR }}
                              />
                              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-5">
                                {section.category.replace(/\n/g, ' ')}
                              </h3>
                              <div className="grid gap-x-4 sm:gap-x-6 gap-y-6 justify-items-center grid-cols-3 sm:grid-cols-5">
                                {filtered.map((item) => {
                                  const images =
                                    PRODUCT_LABEL_IMAGES[item.label];
                                  return (
                                    <div
                                      key={item.label}
                                      className="flex flex-col items-center text-center w-full"
                                    >
                                      {images ? (
                                        <div
                                          className="w-full aspect-square rounded-lg overflow-hidden bg-gray-50 cursor-pointer"
                                          onClick={() =>
                                            setLightboxSrc(images[0].src)
                                          }
                                        >
                                          <img
                                            src={images[0].src}
                                            alt={images[0].alt}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-full aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                                          <span className="text-2xl text-gray-300">
                                            📦
                                          </span>
                                        </div>
                                      )}
                                      <div className="mt-2">
                                        <div className="relative flex items-center justify-center gap-1">
                                          <h4 className="text-sm font-medium text-gray-500">
                                            {item.label}
                                          </h4>
                                          {item.sub && (
                                            <button
                                              type="button"
                                              className="shrink-0 cursor-pointer"
                                              onClick={() =>
                                                setTooltipLabel(
                                                  tooltipLabel === item.label
                                                    ? null
                                                    : item.label,
                                                )
                                              }
                                            >
                                              <Info className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700 transition-colors" />
                                            </button>
                                          )}
                                          {tooltipLabel === item.label &&
                                            item.sub && (
                                              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-10 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                                                {item.sub}
                                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                                              </div>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold mt-0.5 whitespace-pre-line text-gray-900">
                                          {item.value}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        {/* 안내사항 */}
                        <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => setNoticeOpen((prev) => !prev)}
                          >
                            <Info className="w-4 h-4 text-red-600 shrink-0" />
                            <span className="text-sm font-medium text-gray-600">
                              주요정보 안내사항
                            </span>
                            <ChevronDown
                              className="w-4 h-4 text-gray-400 ml-auto transition-transform"
                              style={{
                                transform: noticeOpen
                                  ? 'rotate(180deg)'
                                  : 'rotate(0deg)',
                              }}
                            />
                          </button>
                          {noticeOpen && (
                            <div className="px-4 py-3">
                              {noticeItems.map((section) => (
                                <div
                                  key={section.category}
                                  className="mb-3 last:mb-0"
                                >
                                  <p className="text-sm font-bold text-gray-700 mb-1">
                                    {section.category}
                                  </p>
                                  {section.items.map((item, idx) => (
                                    <p
                                      key={idx}
                                      className="text-sm text-gray-600 leading-relaxed pl-2"
                                    >
                                      · {item}
                                    </p>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
              </div>
            )}

            {/* ===== 테이블 UI (기존 — Cmd+B로 전환) ===== */}
            {viewMode === 'table' && (
              <>
                {/* 전체 비교표 탭 */}
                {productInquiryTab === 'all' && (
                  <div>
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                      <table className="min-w-[700px] w-full border-collapse text-sm">
                        <thead>
                          <tr>
                            <th className="p-3 text-left bg-gray-50 border border-gray-200 font-bold text-gray-700 w-24">
                              항목
                            </th>
                            <th className="p-3 text-left bg-gray-50 border border-gray-200 font-bold text-gray-700 w-56">
                              내용
                            </th>
                            {funeralProducts.map((p) => (
                              <th
                                key={p.id}
                                className="p-3 text-center border border-gray-200 font-bold text-gray-900"
                                style={{ backgroundColor: '#f5f0eb' }}
                              >
                                <div>{p.name}</div>
                                {p.subtitle && (
                                  <div className="text-xs font-normal text-gray-500">
                                    {p.subtitle}
                                  </div>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonData.map((section) =>
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
                                  <div className="font-medium">
                                    {item.label}
                                  </div>
                                  {'sub' in item && item.sub && (
                                    <div className="text-xs text-gray-400">
                                      {item.sub}
                                    </div>
                                  )}
                                  {PRODUCT_LABEL_IMAGES[item.label] && (
                                    <div className="flex justify-center gap-2 mt-2">
                                      {PRODUCT_LABEL_IMAGES[item.label].map(
                                        (img) => (
                                          <div
                                            key={img.alt}
                                            className="w-24 h-24 rounded overflow-hidden cursor-pointer"
                                            onClick={() =>
                                              setLightboxSrc(img.src)
                                            }
                                          >
                                            <img
                                              src={img.src}
                                              alt={img.alt}
                                              className="w-full h-full object-cover scale-110"
                                            />
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}
                                </td>
                                {item.values[0] && item.values[1] === '' ? (
                                  <td
                                    className="p-3 border border-gray-200 text-center text-gray-600 align-middle"
                                    colSpan={4}
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
                          {/* 가격 행 */}
                          <tr className="bg-gray-50">
                            <td
                              className="p-3 border border-gray-200 font-bold text-gray-700"
                              colSpan={2}
                            >
                              사전가입 시, 할인가
                            </td>
                            {funeralProducts.map((p) => (
                              <td
                                key={p.id}
                                className="p-3 border border-gray-200 text-center"
                              >
                                <div className="text-xs text-gray-400 line-through">
                                  {p.originalPrice}
                                </div>
                                <div
                                  className="text-base font-extrabold"
                                  style={{ color: BRAND_COLOR }}
                                >
                                  → {p.discountPrice}
                                </div>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 상품별 탭 */}
                {productInquiryTab !== 'all' &&
                  (() => {
                    const product = funeralProducts.find(
                      (p) => p.id === productInquiryTab,
                    );
                    const detail = productDetails[productInquiryTab];
                    if (!product || !detail) return null;
                    return (
                      <div>
                        {/* 추천 대상 */}
                        <div className="mb-10">
                          <div className="flex items-start gap-6 flex-col sm:flex-row">
                            <div className="shrink-0">
                              <div
                                className="w-8 h-1 rounded-full mb-3"
                                style={{ backgroundColor: BRAND_COLOR }}
                              />
                              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
                                {product.subtitle
                                  ? `${product.name.replace('예담 ', '무빈소 ')} 이용,`
                                  : `${product.name},`}
                                <br />
                                다음과 같은 분께 추천드립니다.
                              </h3>
                            </div>
                            <ul className="space-y-2 pt-1">
                              {detail.recommendations.map((rec, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-gray-600"
                                >
                                  <span className="text-gray-400 shrink-0 mt-0.5">
                                    ·
                                  </span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* 상품 정보 테이블 */}
                        <div className="mb-10">
                          <div
                            className="w-8 h-1 rounded-full mb-3"
                            style={{ backgroundColor: BRAND_COLOR }}
                          />
                          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6">
                            {product.name} {product.subtitle} 상품정보
                          </h3>

                          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                            <table className="min-w-[500px] w-full border-collapse text-sm">
                              <thead>
                                <tr>
                                  <th className="p-3 text-center bg-gray-50 border-t-2 border-b border-gray-300 font-bold text-gray-700 w-24">
                                    구분
                                  </th>
                                  <th className="p-3 text-center bg-gray-50 border-t-2 border-b border-gray-300 font-bold text-gray-700">
                                    필수항목
                                  </th>
                                  <th className="p-3 text-center bg-gray-50 border-t-2 border-b border-gray-300 font-bold text-gray-700">
                                    내용
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {detail.tableRows.map((section) => {
                                  const filtered = section.items.filter(
                                    (item) =>
                                      item.value &&
                                      item.value !== '-' &&
                                      item.value !== 'x',
                                  );
                                  if (filtered.length === 0) return null;
                                  return filtered.map((item, itemIdx) => (
                                    <tr
                                      key={`${section.category}-${item.label}-${itemIdx}`}
                                      className="border-b border-gray-200"
                                    >
                                      {itemIdx === 0 && (
                                        <td
                                          className="p-3 text-center font-bold text-gray-700 whitespace-pre-line align-middle border-r border-gray-200 w-24"
                                          rowSpan={filtered.length}
                                        >
                                          {section.category}
                                        </td>
                                      )}
                                      <td className="p-3 text-center text-gray-700 align-middle border-r border-gray-200">
                                        <div className="font-medium">
                                          {item.label}
                                        </div>
                                        {item.sub && (
                                          <div className="text-xs text-gray-400 whitespace-pre-line">
                                            {item.sub}
                                          </div>
                                        )}
                                        {PRODUCT_LABEL_IMAGES[item.label] && (
                                          <div className="flex justify-center gap-2 mt-2">
                                            {PRODUCT_LABEL_IMAGES[
                                              item.label
                                            ].map((img) => (
                                              <div
                                                key={img.alt}
                                                className="w-24 h-24 rounded overflow-hidden cursor-pointer"
                                                onClick={() =>
                                                  setLightboxSrc(img.src)
                                                }
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
                                        {item.value || '-'}
                                      </td>
                                    </tr>
                                  ));
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* 주요정보 안내사항 - 접기/펼치기 */}
                          <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
                            <button
                              type="button"
                              className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                              onClick={() => setNoticeOpen((prev) => !prev)}
                            >
                              <Info className="w-4 h-4 text-red-600 shrink-0" />
                              <span className="text-sm font-medium text-gray-600">
                                주요정보 안내사항
                              </span>
                              <ChevronDown
                                className="w-4 h-4 text-gray-400 ml-auto transition-transform"
                                style={{
                                  transform: noticeOpen
                                    ? 'rotate(180deg)'
                                    : 'rotate(0deg)',
                                }}
                              />
                            </button>
                            {noticeOpen && (
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                  <tbody>
                                    {noticeItems.map((section) =>
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
                        </div>
                      </div>
                    );
                  })()}
              </>
            )}
          </div>
        </section>
      </div>
      {/* ── 3. 제공 서비스 (사전가입 시 제공) ── */}
      <section
        id="sec-services"
        className="py-16 sm:py-24 overflow-hidden bg-white"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* 통합 타이틀 */}
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              사전가입 시 제공 서비스
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              장례 전·후 모든 과정을 예담라이프가 함께합니다
            </p>
          </div>

          {/* 사전 제공 */}
          <p className="text-base font-extrabold text-gray-700 mb-4">
            사전 · 당일 서비스
          </p>

          {/* 모바일: 캐러셀 */}
          <div className="sm:hidden -mx-4">
            <div className="relative overflow-hidden">
              <div
                className="flex items-stretch"
                style={{
                  gap: 10,
                  transition: beforeTransition
                    ? 'transform 0.35s ease-in-out'
                    : 'none',
                  transform: `translateX(calc(-${beforeIdx} * (72vw + 10px) + (100vw - 72vw) / 2))`,
                }}
                {...swipeHandlers(handleBeforePrev, handleBeforeNext)}
              >
                {extendedBefore.map((item, i) => {
                  const isActive = i === beforeIdx;
                  const originalIdx =
                    (((i - 1) % serviceBenefits.length) +
                      serviceBenefits.length) %
                    serviceBenefits.length;
                  return (
                    <div
                      key={`before-${i}`}
                      className="shrink-0"
                      style={{
                        width: '72vw',
                        opacity: isActive ? 1 : 0.35,
                        transform: isActive ? 'scale(1)' : 'scale(0.93)',
                        transition: beforeTransition
                          ? 'opacity 0.35s ease, transform 0.35s ease'
                          : 'none',
                      }}
                    >
                      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full flex flex-col">
                        <div className="h-44 overflow-hidden">
                          <img
                            src={`https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/before-service-${String(originalIdx + 1).padStart(2, '0')}.png`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 text-center">
                          <h3 className="text-sm font-bold text-gray-900 mb-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleBeforePrev}
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
                onClick={handleBeforeNext}
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
              {serviceBenefits.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleBeforeDotClick(idx)}
                  className="cursor-pointer"
                  style={{
                    width: realBeforeIdx === idx ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      realBeforeIdx === idx ? BRAND_COLOR : '#d1d5db',
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
          <div className="hidden sm:grid sm:grid-cols-4 gap-5">
            {serviceBenefits.map((item, idx) => (
              <div
                key={item.title}
                className="flex flex-col bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="h-44 overflow-hidden">
                  <img
                    src={`https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/before-service-${String(idx + 1).padStart(2, '0')}.png`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 사후 케어 */}
          <p className="text-base font-extrabold text-gray-700 mt-12 mb-4">
            사후 케어
          </p>

          {/* 모바일: 캐러셀 */}
          <div className="sm:hidden -mx-4">
            <div className="relative overflow-hidden">
              <div
                className="flex items-stretch"
                style={{
                  gap: 10,
                  transition: afterTransition
                    ? 'transform 0.35s ease-in-out'
                    : 'none',
                  transform: `translateX(calc(-${afterIdx} * (72vw + 10px) + (100vw - 72vw) / 2))`,
                }}
                {...swipeHandlers(handleAfterPrev, handleAfterNext)}
              >
                {extendedAfter.map((item, i) => {
                  const isActive = i === afterIdx;
                  const originalIdx =
                    (((i - 1) % afterServices.length) + afterServices.length) %
                    afterServices.length;
                  return (
                    <div
                      key={`after-${i}`}
                      className="shrink-0"
                      style={{
                        width: '72vw',
                        opacity: isActive ? 1 : 0.35,
                        transform: isActive ? 'scale(1)' : 'scale(0.93)',
                        transition: afterTransition
                          ? 'opacity 0.35s ease, transform 0.35s ease'
                          : 'none',
                      }}
                    >
                      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full flex flex-col">
                        <div className="h-40 overflow-hidden">
                          <img
                            src={`https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/after-service-${String(originalIdx + 1).padStart(2, '0')}.jpg`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 text-center">
                          <h3 className="text-sm font-bold text-gray-900 mb-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleAfterPrev}
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
                onClick={handleAfterNext}
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
              {afterServices.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAfterDotClick(idx)}
                  className="cursor-pointer"
                  style={{
                    width: realAfterIdx === idx ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      realAfterIdx === idx ? BRAND_COLOR : '#d1d5db',
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
          <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {afterServices.map((item, idx) => (
              <div
                key={item.title}
                className="flex flex-col bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="h-32 overflow-hidden">
                  <img
                    src={`https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/after-service-${String(idx + 1).padStart(2, '0')}.jpg`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. 멤버십 제휴할인 ── */}
      <MembershipSection
        id="sec-membership"
        background="bg-gray-50"
        ctaHref={membershipHref}
        ctaLabel="후불제 상조 가입신청"
      />

      {/* ── 5-2. 장례 가이드 ── */}
      <section
        id="sec-funeral-guide"
        className="py-16 sm:py-24 bg-white overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              장례 가이드
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
              고인의 마지막을 禮를 다하여 모십니다.
              <br />
              예담라이프는 100% 후불제로 진행하여 유가족의 슬픔을 함께 나눕니다.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                label: '장례정보',
                img: 'round_illust01.png',
                href: '/funeral-guide/info',
                modal: null as null | 'son-eopneun-nal' | '49je',
              },
              {
                label: '장례절차',
                img: 'round_illust02.png',
                href: '/funeral-guide/procedure',
                modal: null,
              },
              {
                label: '손 없는 날',
                img: 'round_illust03.png',
                href: '#modal-son-eopneun-nal',
                modal: 'son-eopneun-nal' as const,
              },
              {
                label: '49재 계산',
                img: 'round_illust04.png',
                href: '#modal-49je',
                modal: '49je' as const,
              },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.modal) {
                    e.preventDefault();
                    window.dispatchEvent(
                      new CustomEvent('open-funeral-guide-modal', {
                        detail: item.modal,
                      }),
                    );
                  }
                }}
                className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
              >
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: '#f5efe2' }}
                >
                  <img
                    src={`https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/funeral_guide/${item.img}`}
                    alt={item.label}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                  />
                </div>
                <p className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">
                  {item.label}
                </p>
                <span className="text-xs sm:text-sm text-gray-500 underline underline-offset-4">
                  자세히 보기
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. 후기 ── */}
      <section
        id="reviews"
        className="py-16 sm:py-24 overflow-hidden bg-gray-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              고객 감동 후기
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              가족의 마음으로 함께한 시간, 그 진심이 전해졌습니다
            </p>
          </div>

          <ReviewCarousel reviews={reviews} />
        </div>
      </section>

      {/* ── 8. 주요 고객사 ── */}
      <section
        id="sec-clients"
        className="py-16 sm:py-20 bg-white overflow-hidden"
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
              이상의 기업이 예담라이프와 함께하고 있습니다
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
                    className="shrink-0 flex items-center justify-center h-12 sm:h-14 w-24 sm:w-28"
                  >
                    <img
                      src={`${LOGO_BASE}/logo_${String(num).padStart(2, '0')}.jpg`}
                      alt={`고객사 ${num}`}
                      className="h-8 sm:h-10 w-auto object-contain"
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
                    className="shrink-0 flex items-center justify-center h-12 sm:h-14 w-24 sm:w-28"
                  >
                    <img
                      src={`${LOGO_BASE}/logo_${String(num).padStart(2, '0')}.jpg`}
                      alt={`고객사 ${num}`}
                      className="h-8 sm:h-10 w-auto object-contain"
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
                    className="shrink-0 flex items-center justify-center h-12 sm:h-14 w-24 sm:w-28"
                  >
                    <img
                      src={`${LOGO_BASE}/logo_${String(num).padStart(2, '0')}.jpg`}
                      alt={`고객사 ${num}`}
                      className="h-8 sm:h-10 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. 365일 긴급출동서비스 ── */}

      <section
        id="sec-emergency"
        className="py-12 sm:py-16 overflow-hidden bg-gray-50"
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

      {/* ── 13. 다이렉트 장례설계 ── */}
      <section id="sec-direct-design" className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                다이렉트 장례설계
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mt-3">
                나에게 맞는 후불제 장례서비스 상품을 간단한 질문 답변을 통해
                확인하세요
              </p>
              <span
                className="inline-block px-4 py-2 text-sm font-bold rounded-lg mt-4"
                style={{
                  backgroundColor: BRAND_COLOR_LIGHT,
                  color: BRAND_COLOR,
                }}
              >
                사전상담 시 20만원 할인 혜택
              </span>
            </div>

            <div className="w-full max-w-xl mx-auto px-0">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Question
                    </span>
                    <span className="text-sm font-medium text-gray-400">
                      {surveyStep + 1} / {surveyQuestions.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${((surveyStep + 1) / surveyQuestions.length) * 100}%`,
                        backgroundColor: BRAND_COLOR,
                      }}
                    />
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-8">
                  {surveyQuestions[surveyStep].question}
                </h3>

                {surveyQuestions[surveyStep].type === 'select' && (
                  <Select
                    value={surveyAnswers[surveyStep] || ''}
                    onValueChange={(value) =>
                      setSurveyAnswers({
                        ...surveyAnswers,
                        [surveyStep]: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full rounded-xl">
                      <SelectValue placeholder="선택해주세요." />
                    </SelectTrigger>
                    <SelectContent>
                      {surveyQuestions[surveyStep].options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {surveyQuestions[surveyStep].type === 'radio' && (
                  <RadioGroup
                    value={surveyAnswers[surveyStep] || ''}
                    onValueChange={(value) =>
                      setSurveyAnswers({
                        ...surveyAnswers,
                        [surveyStep]: value,
                      })
                    }
                    className="space-y-3"
                  >
                    {surveyQuestions[surveyStep].options.map((opt) => (
                      <label
                        key={opt}
                        htmlFor={`q-${surveyStep}-${opt}`}
                        className="flex items-center gap-3 cursor-pointer group rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:border-gray-300 data-[state=checked]:border-[var(--brand)]"
                        style={
                          {
                            '--brand': BRAND_COLOR,
                            ...(surveyAnswers[surveyStep] === opt
                              ? {
                                  borderColor: BRAND_COLOR,
                                  backgroundColor: `${BRAND_COLOR}08`,
                                }
                              : {}),
                          } as React.CSSProperties
                        }
                      >
                        <RadioGroupItem
                          value={opt}
                          id={`q-${surveyStep}-${opt}`}
                          className="border-gray-300 data-[state=checked]:border-[var(--brand)] data-[state=checked]:text-[var(--brand)]"
                          style={
                            {
                              '--brand': BRAND_COLOR,
                            } as React.CSSProperties
                          }
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {opt}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                )}

                {surveyQuestions[surveyStep].type === 'text' && (
                  <div className="space-y-3 w-full">
                    <input
                      type="text"
                      placeholder="이름"
                      value={directName}
                      onChange={(e) => setDirectName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="-를 제외한 숫자만 입력해주세요"
                      value={directPhone}
                      onChange={(e) => setDirectPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 mt-10">
                  <button
                    onClick={() => setSurveyStep(Math.max(0, surveyStep - 1))}
                    disabled={surveyStep === 0}
                    className="px-6 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-gray-200 text-gray-600 hover:bg-gray-300 flex-1"
                  >
                    이전
                  </button>
                  {surveyStep < surveyQuestions.length - 1 ? (
                    <button
                      onClick={() => setSurveyStep(surveyStep + 1)}
                      className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-colors cursor-pointer hover:opacity-90 flex-1"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      다음
                    </button>
                  ) : (
                    <button
                      disabled={directSubmitting}
                      onClick={async () => {
                        if (!directName.trim() || !directPhone.trim()) {
                          toast.warning('이름과 연락처를 입력해주세요.');
                          return;
                        }
                        setDirectSubmitting(true);
                        try {
                          const res = await fetch(
                            '/api/v1/general-funeral/direct-design',
                            {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                funeral_location: surveyAnswers[0] || '',
                                expected_guests: surveyAnswers[1] || '',
                                funeral_scale: surveyAnswers[2] || '',
                                binso_required: surveyAnswers[3] || '',
                                escort_service: surveyAnswers[4] || '',
                                clothing_type: surveyAnswers[5] || '',
                                funeral_gown_required: surveyAnswers[6] || '',
                                additional_service: surveyAnswers[7] || '',
                                name: directName,
                                contact_number: directPhone,
                              }),
                            },
                          );
                          const result = await res.json();
                          if (result.success) {
                            toast.success(
                              '상담 신청이 완료되었습니다.\n담당자가 빠르게 연락드리겠습니다.',
                            );
                            setDirectName('');
                            setDirectPhone('');
                            setSurveyStep(0);
                            setSurveyAnswers({});
                          } else {
                            toast.error(
                              result.message || '오류가 발생했습니다.',
                            );
                          }
                        } catch {
                          toast.error(
                            '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                          );
                        } finally {
                          setDirectSubmitting(false);
                        }
                      }}
                      className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-colors cursor-pointer hover:opacity-90 flex-1 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      {directSubmitting ? '신청 중...' : '상담 신청하기'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section
        id="contact"
        className="relative py-16 sm:py-24 overflow-hidden"
        style={{
          background: `linear-gradient(180deg, #fafbf7 0%, #ffffff 40%)`,
        }}
      >
        <style>{`
          @keyframes feedNameSwap {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
          @keyframes pulseDot {
            0%,
            100% {
              opacity: 1;
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
            }
            50% {
              opacity: 0.85;
              transform: scale(1.15);
              box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
            }
          }
        `}</style>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 leading-snug"
            style={{
              fontFamily:
                "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            지금 바로
            <br />
            무료 상담 신청하세요
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed text-sm sm:text-base">
            사전 가입 상담 시{' '}
            <span className="font-bold text-gray-900">20만원 할인 혜택</span>
            <br />
            가입비 · 월 납입금 없는 100% 후불제 상조
            <br />
            365일 24시간 언제든 부담 없이 연락해 주세요
          </p>

          {/* 라이브 피드 */}
          <ul className="mx-auto max-w-md mb-10 flex flex-col text-left">
            {liveFeed.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 px-2 py-3.5 border-b border-gray-200"
              >
                <span
                  className="shrink-0 w-2 h-2 rounded-full bg-emerald-500"
                  style={{ animation: 'pulseDot 2s ease-in-out infinite' }}
                />
                <span
                  key={item.id}
                  className="flex-1 text-[13.5px] sm:text-sm text-gray-800 font-medium"
                  style={{
                    animation: 'feedNameSwap 0.9s ease-out',
                  }}
                >
                  {item.name}님 {item.status}
                </span>
                <span
                  key={`time-${item.id}`}
                  className="text-[11px] sm:text-xs text-gray-400"
                  style={{
                    animation: 'feedNameSwap 0.9s ease-out',
                  }}
                >
                  {item.time}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex justify-center px-2">
            <div
              className="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-white"
              style={{
                boxShadow:
                  '0 1px 0 0 rgba(255,255,255,0.9) inset, 0 22px 48px -14px rgba(20,16,8,0.35), 0 8px 16px -6px rgba(20,16,8,0.18)',
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-white to-transparent z-10"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-yellow-50/60 to-transparent z-0"
                style={{ animation: 'shimmer 3.5s ease-in-out infinite' }}
              />

              <div className="relative grid grid-cols-2 sm:flex sm:flex-row sm:items-stretch z-10">
                {/* 전화 상담 */}
                <a
                  href={CONTACT_TEL_HREF}
                  className="group/phone flex items-center justify-center sm:flex-1 gap-2.5 px-4 py-3.5 sm:py-4 cursor-pointer transition-colors duration-300 hover:bg-gray-50/80"
                >
                  <Phone
                    className="shrink-0 w-[20px] h-[20px] text-slate-700 transition-transform duration-300 group-hover/phone:-rotate-12"
                    strokeWidth={1.9}
                  />
                  <p className="text-left leading-tight tracking-[-0.01em] whitespace-nowrap">
                    <span className="block text-[10.5px] sm:text-[11px] font-semibold tracking-[0.06em] text-gray-500 mb-0.5">
                      24시간
                    </span>
                    <span className="block text-[13px] sm:text-[14px] font-extrabold text-gray-900">
                      전화상담
                    </span>
                  </p>
                </a>

                <span className="hidden sm:block w-px bg-gray-200/80 self-stretch" />

                {/* 상담 신청 */}
                <button
                  type="button"
                  onClick={() => setShowConsultModal(true)}
                  className="group/consult flex items-center justify-center sm:flex-1 gap-2.5 px-4 py-3.5 sm:py-4 cursor-pointer transition-colors duration-300 hover:bg-gray-50/80 border-l border-gray-200/80 sm:border-l-0"
                >
                  <ScrollText
                    className="shrink-0 w-[20px] h-[20px] text-amber-800 transition-transform duration-300 group-hover/consult:scale-110"
                    strokeWidth={1.9}
                  />
                  <p className="text-left leading-tight tracking-[-0.01em] whitespace-nowrap">
                    <span className="block text-[10.5px] sm:text-[11px] font-semibold tracking-[0.06em] text-gray-500 mb-0.5">
                      무료
                    </span>
                    <span className="block text-[13px] sm:text-[14px] font-extrabold text-gray-900">
                      상담신청
                    </span>
                  </p>
                </button>

                <span className="hidden sm:block w-px bg-gray-200/80 self-stretch" />

                {/* 가입 신청 */}
                <a
                  href={membershipHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/join flex items-center justify-center sm:flex-1 gap-2.5 px-4 py-3.5 sm:py-4 cursor-pointer transition-colors duration-300 hover:bg-gray-50/80 border-t border-gray-200/80 sm:border-t-0"
                >
                  <FileText
                    className="shrink-0 w-[20px] h-[20px] text-emerald-800 transition-transform duration-300 group-hover/join:scale-110"
                    strokeWidth={1.9}
                  />
                  <p className="text-left leading-tight tracking-[-0.01em] whitespace-nowrap">
                    <span className="block text-[10.5px] sm:text-[11px] font-semibold tracking-[0.06em] text-gray-500 mb-0.5">
                      20만원 할인
                    </span>
                    <span className="block text-[13px] sm:text-[14px] font-extrabold">
                      가입신청
                    </span>
                  </p>
                </a>

                <span className="hidden sm:block w-px bg-gray-200/80 self-stretch" />

                {/* 장례비용 계산 */}
                <button
                  onClick={() => setCostModalOpen(true)}
                  className="group/calc flex items-center justify-center sm:flex-1 gap-2.5 px-4 py-3.5 sm:py-4 cursor-pointer transition-colors duration-300 hover:bg-gray-50/80 border-t border-l border-gray-200/80 sm:border-t-0 sm:border-l-0"
                >
                  <Calculator
                    className="shrink-0 w-[20px] h-[20px] text-blue-800 transition-transform duration-300 group-hover/calc:-rotate-6 group-hover/calc:scale-110"
                    strokeWidth={1.9}
                  />
                  <p className="text-left leading-tight tracking-[-0.01em] whitespace-nowrap">
                    <span className="block text-[10.5px] sm:text-[11px] font-semibold tracking-[0.06em] text-gray-500 mb-0.5">
                      30초
                    </span>
                    <span className="block text-[13px] sm:text-[14px] font-extrabold text-gray-900">
                      장례비용 계산
                    </span>
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* ══════════════ 상담 신청 모달 ══════════════ */}
      {showConsultModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50"
          onClick={() => setShowConsultModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 flex items-center justify-between bg-gray-100 rounded-t-2xl shrink-0">
              <span className="font-bold text-gray-800">상담 신청</span>
              <button
                onClick={() => setShowConsultModal(false)}
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
                  value={consultForm.product}
                  onValueChange={(v) =>
                    setConsultForm((p) => ({ ...p, product: v }))
                  }
                >
                  <SelectTrigger className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white cursor-pointer">
                    <SelectValue placeholder="상품을 선택해주세요." />
                  </SelectTrigger>
                  <SelectContent className="z-200">
                    {funeralProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                        {p.subtitle ? ` (${p.subtitle})` : ''}
                      </SelectItem>
                    ))}
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
                    value={consultForm.name}
                    onChange={(e) =>
                      setConsultForm((p) => ({ ...p, name: e.target.value }))
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
                    value={consultForm.phone}
                    onChange={(e) =>
                      setConsultForm((p) => ({ ...p, phone: e.target.value }))
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
                    value={consultForm.region}
                    onValueChange={(v) =>
                      setConsultForm((p) => ({ ...p, region: v }))
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
                    value={consultForm.timeSlot}
                    onValueChange={(v) =>
                      setConsultForm((p) => ({ ...p, timeSlot: v }))
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
            </div>

            <div className="px-6 py-4 shrink-0">
              <button
                disabled={consultSubmitting}
                onClick={async () => {
                  if (!consultForm.name.trim() || !consultForm.phone.trim()) {
                    toast.warning('이름과 연락처를 입력해주세요.');
                    return;
                  }
                  setConsultSubmitting(true);
                  try {
                    const res = await fetch(
                      '/api/v1/general-funeral/consultation',
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          funeral_location: consultForm.region || '미정',
                          expected_guests: '상담 후 결정',
                          funeral_scale: consultForm.product || '상담 후 결정',
                          binso_required: '상담 후 결정',
                          escort_service: '상담 후 결정',
                          clothing_type: '상담 후 결정',
                          funeral_gown_required: '상담 후 결정',
                          additional_service: '상담 후 결정',
                          contact_number: consultForm.phone,
                          // 알림톡용 추가 필드
                          name: consultForm.name,
                          phone: consultForm.phone,
                          product: consultForm.product,
                          region: consultForm.region,
                          preferred_time: consultForm.timeSlot,
                        }),
                      },
                    );
                    const result = await res.json();
                    if (result.success) {
                      toast.success(
                        '상담 신청이 완료되었습니다.\n담당자가 빠르게 연락드리겠습니다.',
                      );
                      setConsultForm({
                        product: '',
                        name: '',
                        phone: '',
                        region: '',
                        timeSlot: '',
                        privacyAgreed: false,
                      });
                      setShowConsultModal(false);
                    } else {
                      toast.error(result.message || '오류가 발생했습니다.');
                    }
                  } catch {
                    toast.error(
                      '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                    );
                  } finally {
                    setConsultSubmitting(false);
                  }
                }}
                className="w-full py-4 rounded-xl text-white font-bold text-base cursor-pointer hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {consultSubmitting ? '신청 중...' : '상담 신청하기'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 장례비용 알아보기 모달 */}
      <FuneralCostModal
        isOpen={costModalOpen}
        onClose={() => setCostModalOpen(false)}
        onSelectProduct={(productId) => setProductInquiryTab(productId)}
      />
    </>
  );
}
