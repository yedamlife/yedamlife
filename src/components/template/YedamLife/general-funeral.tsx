'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  Headphones,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  MessageCircle,
  Mail,
  Shield,
  Search,
  Gift,
  Handshake,
  RefreshCw,
  ChevronDown,
  Info,
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
  consultationData,
  obituaryData,
  serviceBenefits,
  membershipServices,
  funeralProducts,
  productDetails,
  testimonials,
  afterServices,
  clientLogoRow1,
  clientLogoRow2,
  clientLogoRow3,
  LOGO_BASE,
  surveyQuestions,
  comparisonData,
} from './constants';
import { Ticker, FaqItem, CountUp } from './components';

export interface GeneralFuneralProps {
  googleFormUrl: string;
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
            className="absolute inset-0 bg-cover bg-no-repeat bg-right sm:bg-center"
            style={{
              backgroundImage:
                'url(https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/general-funeral-hero.png)',
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 py-20 sm:py-28 lg:py-36 px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto">
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
                className="hidden sm:block text-[34px] lg:text-[44px] font-bold text-white leading-snug mb-1"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                대한민국 代表 후불제 상조기업
              </h1>
              <h1
                className="hidden sm:block text-[34px] lg:text-[44px] font-bold leading-snug mb-10"
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
                className="sm:hidden text-white text-[13.5px] font-semibold mb-2.5 tracking-wide"
                style={{
                  textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                진심으로 禮를 담아 감동을 전해드리는
              </p>
              <p
                className="sm:hidden font-bold text-white leading-relaxed mb-0.5"
                style={{
                  fontSize: '20px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                대한민국 代表 후불제 상조기업
              </p>
              <p
                className="sm:hidden font-bold leading-relaxed mb-7"
                style={{
                  fontSize: '20px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                <span style={{ color: '#e8d5a3', fontWeight: 700 }}>
                  &ldquo;예담라이프&rdquo;
                </span>
              </p>
              <div className="flex flex-row flex-wrap items-center justify-center gap-3">
                <a
                  href="#inquiry"
                  onClick={(e) => {
                    e.preventDefault();
                    setInquiryMainTab('products');
                    document
                      .getElementById('inquiry')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-gray-900 text-sm sm:text-base font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
                >
                  <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
                  장례상품 상담신청
                </a>
                <a
                  href="#inquiry"
                  onClick={(e) => {
                    e.preventDefault();
                    setInquiryMainTab('design');
                    document
                      .getElementById('inquiry')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 border-2 border-white/70 text-white text-sm sm:text-base font-bold rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  다이렉트 장례설계
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1-2. 가입상담현황 + 부고알림현황 티커 ── */}
      <section
        className="border-b border-gray-200 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* 가입상담현황 */}
            <div className="flex items-center gap-4 py-4 pr-0 md:pr-6">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                >
                  <MessageCircle
                    className="w-4 h-4"
                    style={{ color: BRAND_COLOR }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                  가입상담현황
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <Ticker
                  data={consultationData}
                  renderItem={(item) => (
                    <span className="text-sm text-gray-600 truncate">
                      <span className="font-medium text-gray-500">
                        {item.id}
                      </span>{' '}
                      {item.name} {item.status}{' '}
                      <span className="text-gray-400">{item.date}</span>
                    </span>
                  )}
                />
              </div>
            </div>
            {/* 부고알림현황 */}
            <div className="flex items-center gap-4 py-4 pl-0 md:pl-6">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                >
                  <Mail className="w-4 h-4" style={{ color: BRAND_COLOR }} />
                </div>
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                  부고알림현황
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <Ticker
                  data={obituaryData}
                  interval={3500}
                  renderItem={(item) => (
                    <span className="text-sm text-gray-600 truncate">
                      {item.name} / {item.period} {item.location}
                    </span>
                  )}
                />
              </div>
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
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 tracking-wide leading-tight"
                style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}
              >
                예담라이프는 진심을 담아 <br />
                아름다운 이별을 준비합니다.
              </h2>
            </div>

            {/* 4개 카드 - 배너 스타일 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: '투명한 가격 정책',
                  icon: Shield,
                  desc: '• 사전 가입비, 월회비, 연회비 전혀 없습니다.\n• 발인 전날 비용 정산\n• 장례용품 품질보증, 가격 정찰제',
                },
                {
                  title: '고객 맞춤 시스템',
                  icon: User,
                  desc: '엄격한 서비스 관리로\n고객 가풍, 예산에 따른 맞춤형 장례서비스 제공해요',
                },
                {
                  title: '혜택 8가지 + 사후 케어까지',
                  icon: Gift,
                  desc: '상조 할인·운구지원 등 사전 혜택 8가지와\n감동후기·1주기 답례·돌봄상담 등\n사후 케어까지 빠짐없이 제공해요',
                },
                {
                  title: '멤버십 시스템',
                  icon: Star,
                  desc: '멤버십 전용 제휴 할인으로\n장지 · 개장&이장 · 유품정리 · 법률·세무\n무료 컨설팅을 받을 수 있어요',
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col"
                  >
                    <div
                      className="py-3 px-5 flex items-center justify-center gap-2"
                      style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                    >
                      <Icon
                        className="w-4 h-4 shrink-0"
                        style={{ color: BRAND_COLOR }}
                      />
                      <p
                        className="text-sm sm:text-base font-bold"
                        style={{ color: BRAND_COLOR }}
                      >
                        {card.title}
                      </p>
                    </div>
                    <div className="px-5 py-5 text-center flex-1 flex items-center justify-center">
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
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

            {/* 차트: 예담라이프 vs 선불제상조 vs 장례식장 상조 비교 */}
            {(() => {
              const priceMap = [
                { yedam: 130, prepaid: 200, funeral: 350 },
                { yedam: 230, prepaid: 330, funeral: 500 },
                { yedam: 340, prepaid: 480, funeral: 700 },
                { yedam: 460, prepaid: 630, funeral: 900 },
              ];
              const prices = priceMap[chartProductIdx];
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
                        장례식장 상조
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
                          <button
                            onClick={() => {
                              setProductInquiryTab(product.id);
                              document
                                .getElementById('inquiry')
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
                      setProductInquiryTab(product.id);
                      document
                        .getElementById('inquiry')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer hover:bg-gray-200 bg-gray-100 text-gray-700"
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

      {/* ── 3. 제공 서비스 (사전가입 시 제공) ── */}
      <section
        id="sec-services"
        className="py-16 sm:py-24 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
        }}
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
      <section
        id="sec-membership"
        className="py-16 sm:py-24 overflow-hidden bg-white"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              예담라이프 멤버십 서비스 &quot;제휴 할인&quot;
            </h2>
          </div>
          <div className="flex justify-center mb-12">
            <div className="w-px h-10 bg-gray-400" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {membershipServices.map((item) => {
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="h-36 bg-gray-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <div
                      className="w-8 h-px mx-auto mb-2"
                      style={{
                        backgroundColor: BRAND_COLOR,
                        opacity: 0.2,
                      }}
                    />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {item.desc}
                    </p>
                    {item.note && (
                      <p className="text-xs text-gray-400 mt-1">{item.note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. 후기 ── */}
      <section
        id="reviews"
        className="py-16 sm:py-24 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
        }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((review, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {review.author}
                      </p>
                      <p className="text-xs text-gray-400">{review.relation}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-300">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
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
        className="py-12 sm:py-16 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
        }}
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
                <Headphones
                  className="w-7 h-7"
                  style={{ color: BRAND_COLOR }}
                />
                <span
                  className="text-2xl sm:text-3xl font-extrabold"
                  style={{ color: BRAND_COLOR }}
                >
                  1660.0959
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

      {/* ── 11. 장례상품 문의신청 & 장례설계 문의신청 ── */}
      <div ref={inquirySectionRef}>
        <div id="inquiry" className="mt-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-0 border-b border-gray-200">
              <button
                onClick={() => {
                  setInquiryMainTab('products');
                  setTimeout(() => {
                    const el = document.getElementById('inquiry');
                    if (el) {
                      const headerH =
                        headerRef.current?.getBoundingClientRect().height ??
                        110;
                      const top =
                        el.getBoundingClientRect().top +
                        window.scrollY -
                        headerH -
                        8;
                      window.scrollTo({ top, behavior: 'smooth' });
                    }
                  }, 50);
                }}
                className={`flex-1 py-3 text-sm sm:text-base font-bold transition-colors cursor-pointer border-b-2 -mb-px ${
                  inquiryMainTab === 'products'
                    ? 'text-gray-900 border-gray-900'
                    : 'text-gray-400 border-transparent hover:text-gray-600'
                }`}
              >
                장례상품 상담신청
              </button>
              <button
                onClick={() => {
                  setInquiryMainTab('design');
                  setTimeout(() => {
                    const el = document.getElementById('inquiry');
                    if (el) {
                      const headerH =
                        headerRef.current?.getBoundingClientRect().height ??
                        110;
                      const top =
                        el.getBoundingClientRect().top +
                        window.scrollY -
                        headerH -
                        8;
                      window.scrollTo({ top, behavior: 'smooth' });
                    }
                  }, 50);
                }}
                className={`flex-1 py-3 text-sm sm:text-base font-bold transition-colors cursor-pointer border-b-2 -mb-px ${
                  inquiryMainTab === 'design'
                    ? 'text-gray-900 border-gray-900'
                    : 'text-gray-400 border-transparent hover:text-gray-600'
                }`}
              >
                다이렉트 장례설계
              </button>
            </div>
          </div>
        </div>

        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* 장례상품 탭 내용 */}
            {inquiryMainTab === 'products' && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    예담라이프 장례상품 안내
                  </h2>
                  <p className="text-sm sm:text-base text-gray-500 mt-3">
                    가족의 마음을 담아 정성스럽게 예담라이프가 준비해드립니다
                  </p>
                </div>

                {/* 탭 */}
                <div
                  className="flex items-center gap-2 overflow-x-auto pb-4 mb-6"
                  style={{ scrollbarWidth: 'none' } as React.CSSProperties}
                >
                  <button
                    onClick={() => setProductInquiryTab('all')}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${productInquiryTab === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    전체 상품 비교
                  </button>
                  {funeralProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setProductInquiryTab(p.id)}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${productInquiryTab === p.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {p.name} {p.subtitle}
                    </button>
                  ))}
                </div>

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
                            <th className="p-3 text-left bg-gray-50 border border-gray-200 font-bold text-gray-700 w-32">
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
                                    className="p-3 border border-gray-200 font-bold text-gray-700 whitespace-pre-line align-top"
                                    rowSpan={section.items.length}
                                  >
                                    {section.category}
                                  </td>
                                )}
                                <td className="p-3 border border-gray-200 text-gray-700">
                                  <div className="font-medium">
                                    {item.label}
                                  </div>
                                  {'sub' in item && item.sub && (
                                    <div className="text-xs text-gray-400">
                                      {item.sub}
                                    </div>
                                  )}
                                </td>
                                {item.values[0] && item.values[1] === '' ? (
                                  <td
                                    className="p-3 border border-gray-200 text-center text-gray-600"
                                    colSpan={4}
                                  >
                                    {item.values[0]}
                                  </td>
                                ) : (
                                  item.values.map((val, vi) => (
                                    <td
                                      key={vi}
                                      className="p-3 border border-gray-200 text-center text-gray-600 whitespace-pre-line"
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
                                {detail.tableRows.map((section) =>
                                  section.items.map((item, itemIdx) => (
                                    <tr
                                      key={`${section.category}-${item.label}-${itemIdx}`}
                                      className="border-b border-gray-200"
                                    >
                                      {itemIdx === 0 && (
                                        <td
                                          className="p-3 text-center font-bold text-gray-700 whitespace-pre-line align-middle border-r border-gray-200 w-24"
                                          rowSpan={section.items.length}
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
                                      </td>
                                      <td className="p-3 text-center text-gray-900 font-medium align-middle whitespace-pre-line">
                                        {item.value || '-'}
                                      </td>
                                    </tr>
                                  )),
                                )}
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

                {/* 공통 문의 폼 */}
                <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-sm font-bold text-gray-700 mb-4">
                    상담 신청
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <Select
                      value={
                        productInquiryTab !== 'all'
                          ? productInquiryTab
                          : undefined
                      }
                    >
                      <SelectTrigger className="px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer">
                        <SelectValue placeholder="상품을 선택해주세요." />
                      </SelectTrigger>
                      <SelectContent>
                        {funeralProducts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                            {p.subtitle ? ` (${p.subtitle})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="text"
                      placeholder="이름"
                      className="px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white"
                    />
                    <input
                      type="tel"
                      placeholder="연락처(01012345678)"
                      className="px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white"
                    />
                    <Select>
                      <SelectTrigger className="px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer">
                        <SelectValue placeholder="시/도 선택해주세요." />
                      </SelectTrigger>
                      <SelectContent>
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
                    <div className="sm:col-span-2">
                      <Select>
                        <SelectTrigger className="px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer w-full">
                          <SelectValue placeholder="상담시간을 선택해주세요." />
                        </SelectTrigger>
                        <SelectContent>
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
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{ accentColor: BRAND_COLOR }}
                      />
                      <span className="text-xs text-gray-500">
                        개인정보 수집 및 이용 동의
                      </span>
                    </label>
                    <a
                      href={googleFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-3 text-white text-sm font-bold rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      상담 신청
                    </a>
                  </div>
                </div>
              </>
            )}

            {/* 다이렉트 장례설계 탭 내용 */}
            {inquiryMainTab === 'design' && (
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
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none"
                        />
                        <input
                          type="tel"
                          placeholder="연락처 (01012345678)"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 mt-10">
                      <button
                        onClick={() =>
                          setSurveyStep(Math.max(0, surveyStep - 1))
                        }
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
                        <a
                          href={googleFormUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-colors cursor-pointer hover:opacity-90 flex-1 text-center block"
                          style={{ backgroundColor: BRAND_COLOR }}
                        >
                          상담 신청하기
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
