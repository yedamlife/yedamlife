'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Headphones,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ScrollText,
} from 'lucide-react';
import { BRAND_COLOR, BRAND_COLOR_LIGHT } from './constants';
import {
  FaqItem,
  Ticker,
  CtaSection,
  MembershipSection,
  ReviewCarousel,
  ReviewItem,
} from './components';
import { ReservationModal } from './reservation-modal';

const SUPABASE_BASE =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife';

// ── 실시간 상담 데이터 ──
const consultationData = [
  { no: 8951, name: '김*식', status: '상담완료', date: '2026.04.01' },
  { no: 8950, name: '이*영', status: '상담완료', date: '2026.03.31' },
  { no: 8949, name: '박*현', status: '예약확정', date: '2026.03.31' },
  { no: 8948, name: '최*진', status: '상담완료', date: '2026.03.30' },
  { no: 8947, name: '정*우', status: '상담완료', date: '2026.03.30' },
];

const obituaryData = [
  {
    name: '이*자',
    period: '2026-03-28 ~ 2026-03-30',
    location: '삼척의료원...',
  },
  {
    name: '김*수',
    period: '2026-03-27 ~ 2026-03-29',
    location: '서울대병원...',
  },
  {
    name: '박*희',
    period: '2026-03-26 ~ 2026-03-28',
    location: '아산병원...',
  },
];

// ── Point 4 ──
const points = [
  {
    num: '01',
    title: '합리적인 비용',
    desc: '품격 높은 운구의전 서비스를\n예담라이프에서 직접 진행하여\n합리적인 비용으로 제공합니다.',
    icon: `${SUPABASE_BASE}/funeral-escort/point01.svg`,
  },
  {
    num: '02',
    title: '전문적인 운구의전',
    desc: '장례 전문 지식을 갖춘\n장례지도사가 정성껏 예를 다하여\n직접 운구의전을 진행합니다.',
    icon: `${SUPABASE_BASE}/funeral-escort/point02.svg`,
  },
  {
    num: '03',
    title: '고객 맞춤형',
    desc: '장례식장 검색부터 화장·매장 및\n필요 인원까지 선택 가능한\n고객 맞춤형 예약 시스템입니다.',
    icon: `${SUPABASE_BASE}/funeral-escort/point03.svg`,
  },
  {
    num: '04',
    title: '간편 예약 신청',
    desc: '발인 전날 간편 예약으로 진행,\n가입 없이 누구나 쉽고\n간편하게 예약 신청할 수 있습니다.',
    icon: `${SUPABASE_BASE}/funeral-escort/point04.svg`,
  },
];

// ── 추천 상품 ──
const products = {
  metro: {
    title: '수도권 지역',
    sub: '서울, 경기, 인천',
    items: [
      {
        type: '화장',
        people: '4인 추천 상품',
        originalPrice: '480,000원',
        price: '450,000',
      },
      {
        type: '매장',
        people: '6인 추천 상품',
        originalPrice: '900,000원',
        price: '800,000',
      },
    ],
  },
  nonMetro: {
    title: '수도권 외 지역',
    sub: '강원도(춘천, 원주), 충청도',
    items: [
      {
        type: '화장',
        people: '4인 추천 상품',
        originalPrice: '600,000원',
        price: '550,000',
      },
      {
        type: '매장',
        people: '6인 추천 상품',
        originalPrice: '1,080,000원',
        price: '1,000,000',
      },
    ],
  },
};

// ── 진행절차 9단계 ──
const steps = [
  { num: 1, title: '발인 전\n간편 예약접수' },
  { num: 2, title: '접수 신청 후\n전문상담원 연락' },
  { num: 3, title: '장법(화장,매장)/운구인원\n4명(화장)~8명(매장)선택' },
  { num: 4, title: '예약금 先 50% 입금 후\n운구의전 진행 확정' },
  { num: 5, title: '발인 당일 1시간 전\n장례식장 대기', sub: '잔액결제' },
  { num: 6, title: '발인 당일\n빈소→장의차량까지 운구' },
  { num: 7, title: '화장장\n또는 매장지 이동' },
  { num: 8, title: '장의차량에서\n화장장 또는 매장지 운구' },
  { num: 9, title: '운구의전 종료' },
];

// ── TIP 탭 데이터 ──
const tips = [
  {
    id: 'clothing',
    label: '복장 문의',
    title: '복장',
    desc: '검은 정장과 의장대 복장 중 선택 가능\n(단, 의장대 복장 선택 시 인당 추가요금 2만원이 발생됩니다.)',
  },
  {
    id: 'people',
    label: '운구인원 문의',
    title: '운구 인원',
    desc: '접수 후 운구 인원은 관의 무게에 따라\n화장일 경우 4명~6명,\n매장일 경우 6명(공원 묘원)~8명(선산)이 필요\nTip. 도움 주시는 장례지도사께 문의하시면\n운구 인원수를 알려드립니다.',
  },
  {
    id: 'cost',
    label: '비용 문의',
    title: '결제',
    desc: '선예약금 50% / 발인 대기 시 잔금 지급\n카카오뱅크 예담라이프 3333-25-1117779\n요청 시 세금계산서 발행 가능(단, 부가세별도)',
  },
  {
    id: 'reservation',
    label: '예약 문의',
    title: '예약',
    desc: '발인 전날까지 예약 접수 가능\n온라인 예약 또는 전화 상담을 통해\n간편하게 예약하실 수 있습니다.',
  },
  {
    id: 'consult',
    label: '상담 문의',
    title: '상담',
    desc: '24시간 전화 상담 및 카카오톡 상담 가능\n장례 전문 상담원이 친절하게\n안내해 드립니다.',
  },
  {
    id: 'payment',
    label: '결제 문의',
    title: '결제 방법',
    desc: '계좌이체, 카드결제 가능\n세금계산서 발행 가능(부가세 별도)\n영수증 발급도 가능합니다.',
  },
];

// ── 리뷰 ──
// ── 파트너 ──
const partners = Array.from(
  { length: 14 },
  (_, i) =>
    `${SUPABASE_BASE}/funeral-escort/partner${String(i + 1).padStart(2, '0')}.png`,
);

// ── 파트너 레일 컴포넌트 ──
function PartnerRail() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animId: number;
    let pos = 0;
    const speed = 0.5;

    const animate = () => {
      pos += speed;
      const half = el.scrollWidth / 2;
      if (pos >= half) pos = 0;
      el.scrollLeft = pos;
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      ref={scrollRef}
      className="overflow-hidden"
      style={{ touchAction: 'none', pointerEvents: 'none' }}
    >
      <div className="flex items-center gap-8 w-max">
        {[...partners, ...partners].map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center px-4 rounded-lg"
            style={{ minWidth: '180px' }}
          >
            <img
              src={src}
              alt={`파트너 ${(i % 14) + 1}`}
              className="h-8 sm:h-10 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CeremonyService({}: { googleFormUrl?: string }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    fetch('/api/v1/reviews?category=escort&limit=6')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setReviews(json.data);
      })
      .catch(() => {});
  }, []);

  const [activeTip, setActiveTip] = useState(0);
  const [showReservation, setShowReservation] = useState(false);
  const [tipDirection, setTipDirection] = useState<'left' | 'right'>('right');
  const tipTouchRef = useRef<number>(0);

  const goTip = (idx: number) => {
    setTipDirection(idx > activeTip ? 'right' : 'left');
    setActiveTip(idx);
  };
  const nextTip = () => {
    setTipDirection('right');
    setActiveTip((prev) => (prev + 1) % tips.length);
  };
  const prevTip = () => {
    setTipDirection('left');
    setActiveTip((prev) => (prev - 1 + tips.length) % tips.length);
  };

  return (
    <>
      {/* ══════════════ 히어로 섹션 ══════════════ */}
      <section id="sec-ceremony-hero" className="overflow-hidden">
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${SUPABASE_BASE}/ungu_main_banner.png)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
          <div className="relative z-10 py-20 sm:py-28 lg:py-36 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <h1
                className="text-[24px] sm:text-[34px] lg:text-[40px] font-bold text-white leading-snug mb-1 sm:mb-2"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                고인의 마지막 가시는길,
              </h1>
              <h1
                className="text-[24px] sm:text-[34px] lg:text-[40px] font-bold text-white leading-snug mb-1 sm:mb-2"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                진심으로 禮를 다하여 정성껏 모시는
              </h1>
              <h1
                className="text-[24px] sm:text-[34px] lg:text-[40px] font-bold leading-snug mb-6 sm:mb-8"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                <span style={{ color: '#e8d5a3', fontWeight: 700 }}>
                  예담운구의전
                </span>
                <span className="text-white">입니다</span>
              </h1>

              <p
                className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-md"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
              >
                발인 후 장지까지, 전문 장례지도사가
                <br />
                직접 운구의전을 진행합니다.
              </p>

              <div className="flex flex-row flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowReservation(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-gray-900 text-base font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
                >
                  <ScrollText className="w-5 h-5" />
                  간편 예약하기
                </button>
                <a
                  href="tel:1660-0000"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/15 text-white text-base font-bold rounded-xl border border-white/30 hover:bg-white/25 transition-colors backdrop-blur-sm cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  전화 상담
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 실시간 현황 티커 ══════════════ */}
      <section className="border-b border-gray-200 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center py-3 gap-3 sm:gap-0">
            {/* 예약상담현황 */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                >
                  <Headphones
                    className="w-3.5 h-3.5"
                    style={{ color: BRAND_COLOR }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900">
                  예약상담현황
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <Ticker
                  data={consultationData}
                  renderItem={(item) => (
                    <span className="text-xs sm:text-sm text-gray-500 truncate">
                      NO.{item.no} {item.name}님 {item.status} {item.date}
                    </span>
                  )}
                />
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-gray-200 mx-6" />

            {/* 부고알림현황 */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                >
                  <ScrollText
                    className="w-3.5 h-3.5"
                    style={{ color: BRAND_COLOR }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900">
                  부고알림현황
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <Ticker
                  data={obituaryData}
                  renderItem={(item) => (
                    <span className="text-xs sm:text-sm text-gray-500 truncate">
                      {item.name} / {item.period} {item.location}
                    </span>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ Point 4 ══════════════ */}
      <section
        id="sec-ceremony-products"
        className="py-16 sm:py-24 bg-white overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              예담운구의전 Point 4
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {points.map((point) => (
              <div
                key={point.num}
                className="relative bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-7 sm:px-6 sm:py-8 flex flex-col items-center text-center group hover:shadow-md transition-shadow"
              >
                {/* 넘버링 */}
                <span
                  className="absolute top-3 left-4 text-base sm:text-lg font-extrabold tracking-wider"
                  style={{
                    color: BRAND_COLOR,
                    fontFamily: 'Pretendard, sans-serif',
                  }}
                >
                  {point.num}
                </span>

                {/* 아이콘 */}
                <div
                  className={`mb-5 sm:mb-6 ${
                    point.num === '02'
                      ? 'w-28 h-18 sm:w-36 sm:h-24'
                      : 'w-16 h-16 sm:w-20 sm:h-20'
                  }`}
                >
                  <img
                    src={point.icon}
                    alt={point.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* 제목 */}
                <h3
                  className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3"
                  style={{ fontFamily: 'Pretendard, sans-serif' }}
                >
                  {point.title}
                </h3>

                {/* 구분선 */}
                <div
                  className="w-8 h-0.5 rounded-full mb-3 sm:mb-4"
                  style={{ backgroundColor: BRAND_COLOR }}
                />

                {/* 설명 */}
                <p
                  className="text-xs sm:text-sm text-gray-500 leading-relaxed whitespace-pre-line"
                  style={{ fontFamily: 'Pretendard, sans-serif' }}
                >
                  {point.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 추천 상품 ══════════════ */}
      <section
        className="py-16 sm:py-24 overflow-hidden"
        style={{ backgroundColor: '#fafaf8' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-3">
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              예담운구의전 추천 상품
            </h2>
          </div>
          <p className="text-center text-sm text-gray-600 mb-10">
            *금액을 클릭하시면 간편하게 예약하실 수 있습니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[products.metro, products.nonMetro].map((region) => (
              <div
                key={region.title}
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <div className="pt-6 pb-4 text-center">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">
                    {region.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{region.sub}</p>
                </div>
                <div className="border-t border-gray-50 grid grid-cols-2 divide-x divide-gray-50">
                  {region.items.map((item) => (
                    <div key={item.type} className="px-4 py-6 text-center">
                      <span
                        className="inline-block px-3.5 py-0.5 rounded-full text-[11px] font-semibold mb-3"
                        style={{
                          backgroundColor:
                            item.type === '화장'
                              ? BRAND_COLOR
                              : BRAND_COLOR_LIGHT,
                          color: item.type === '화장' ? '#fff' : BRAND_COLOR,
                        }}
                      >
                        {item.type}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 mb-3">
                        {item.people}
                      </h4>
                      <p
                        className="text-xs line-through mb-2"
                        style={{ color: '#e25555' }}
                      >
                        {item.originalPrice}
                      </p>
                      <p className="text-base sm:text-lg font-extrabold text-gray-900">
                        {item.price}
                        <span className="text-xs font-normal text-gray-500">
                          원
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 진행절차 ══════════════ */}
      <section
        id="sec-ceremony-why"
        className="py-16 sm:py-24 bg-white overflow-hidden"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-4">
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              예담운구의전 진행절차
            </h2>
          </div>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-12 leading-relaxed">
            오랜 경험과 노하우를 갖춘 전문 장례지도사들이
            <br />
            24시간 전화 상담 및 카톡상담을 통해 친절하게 상담해드립니다.
          </p>
          <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8">
            {steps.map((step) => (
              <div
                key={step.num}
                className="relative flex flex-col items-center text-center bg-white rounded-2xl px-3 py-5 sm:px-4 sm:py-6 border"
                style={{ borderColor: BRAND_COLOR_LIGHT }}
              >
                {/* 번호 뱃지 */}
                <span className="absolute -top-3 -left-3 sm:-top-3.5 sm:-left-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-300 text-xs sm:text-sm font-bold text-gray-900 flex items-center justify-center">
                  {step.num}
                </span>

                {/* 아이콘 */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4">
                  <img
                    src={`${SUPABASE_BASE}/funeral-escort/step${String(step.num).padStart(2, '0')}.png`}
                    alt={`Step ${step.num}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* 텍스트 */}
                <p className="text-[11px] sm:text-sm font-semibold text-gray-800 leading-snug whitespace-pre-line">
                  {step.title}
                </p>
                {step.sub && (
                  <p
                    className="text-[10px] sm:text-xs mt-1 font-medium"
                    style={{ color: '#c4873a' }}
                  >
                    {step.sub}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ TIP 섹션 ══════════════ */}
      <section
        className="py-16 sm:py-24 overflow-hidden"
        style={{ backgroundColor: '#fafaf8' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-4">
            <h2
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              &lsquo;예담운구의전&rsquo; 문의 전 알아두면 좋은 TIP !
            </h2>
          </div>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-10">
            예약 신청 후 전화 또는 카톡을 통해 정확한 상담이 가능합니다.
          </p>

          {/* TIP 콘텐츠 */}
          <div
            className="relative bg-white rounded-2xl overflow-hidden shadow-sm mb-8"
            onTouchStart={(e) => {
              tipTouchRef.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const diff = tipTouchRef.current - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 50) {
                if (diff > 0) nextTip();
                else prevTip();
              }
            }}
          >
            <div
              key={activeTip}
              className="flex flex-col sm:flex-row animate-fade-in"
              style={{
                animation: `${tipDirection === 'right' ? 'slideInRight' : 'slideInLeft'} 0.3s ease-out`,
              }}
            >
              {/* 좌측: 이미지 */}
              <div className="sm:w-1/3 flex items-center justify-center p-8 sm:p-10">
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gray-100 flex items-center justify-center">
                  <img
                    src={`${SUPABASE_BASE}/funeral-escort/tip${String(activeTip + 1).padStart(2, '0')}.png`}
                    alt={tips[activeTip].title}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                  />
                </div>
              </div>

              {/* 우측: 텍스트 */}
              <div className="sm:w-2/3 flex">
                <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                  <h3
                    className="text-lg sm:text-xl font-semibold mb-4"
                    style={{
                      fontFamily: 'Pretendard, sans-serif',
                      color: '#111827',
                    }}
                  >
                    {tips[activeTip].title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {tips[activeTip].desc}
                  </p>
                </div>
              </div>
            </div>

            {/* 좌우 화살표 */}
            <button
              onClick={prevTip}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={nextTip}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* 탭 네비게이션 */}
          <div className="relative">
            {/* 프로그레스 바 */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300">
              <div
                className="h-full transition-all duration-300"
                style={{
                  backgroundColor: BRAND_COLOR,
                  width: `${100 / tips.length}%`,
                  marginLeft: `${(activeTip * 100) / tips.length}%`,
                }}
              />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6">
              {tips.map((tip, idx) => (
                <button
                  key={tip.id}
                  onClick={() => goTip(idx)}
                  className={`py-3 text-xs sm:text-sm font-medium transition-colors cursor-pointer text-center ${
                    idx === activeTip
                      ? 'font-bold'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  style={idx === activeTip ? { color: BRAND_COLOR } : {}}
                >
                  {tip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 주요 협력사 ══════════════ */}
      <section className="py-16 sm:py-24 overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-sm text-gray-400 mb-2">✻ ★ ✻</p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              주요 협력사
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-3">
              14+ 기업이 예담라이프와 함께하고 있습니다
            </p>
          </div>
          <PartnerRail />
        </div>
      </section>

      {/* ══════════════ 멤버십 제휴할인 ══════════════ */}
      <MembershipSection style={{ backgroundColor: '#fafaf8' }} />

      {/* ══════════════ 후기 ══════════════ */}
      {reviews.length > 0 && (
        <section
          id="sec-ceremony-reviews"
          className="py-16 sm:py-24 overflow-hidden bg-white"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: BRAND_COLOR }}
              >
                REVIEW
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                고객 후기
              </h2>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                예담운구의전 서비스를 경험하신 분들의 생생한 후기입니다
              </p>
            </div>
            <ReviewCarousel reviews={reviews} />
          </div>
        </section>
      )}

      {/* ══════════════ Q&A ══════════════ */}
      <section
        id="sec-ceremony-faq"
        className="py-16 sm:py-24 overflow-hidden bg-white"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              Q&amp;A
            </h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: '상담 시 비용이 청구되나요?',
                a: '아닙니다. 상담은 무료로 진행되며, 예약 확정 후에만 비용이 발생합니다.',
              },
              {
                q: '화장운구와 매장운구시의 비용이 각각 다른가요?',
                a: '네, 화장과 매장은 필요 인원 및 이동 거리에 따라 비용이 상이합니다. 화장은 4인 기준, 매장은 6인 기준으로 책정됩니다.',
              },
              {
                q: '장례 절차 중 언제신청해야 하나요?',
                a: '발인 전날까지 예약 접수해 주시면 됩니다. 발인 당일 1시간 전에 장례식장에 대기합니다.',
              },
              {
                q: '당일 예약이나 취소도 가능한가요?',
                a: '당일 예약은 상황에 따라 가능하며, 취소는 발인 전날까지 전액 환불이 가능합니다.',
              },
              {
                q: '환불 규정도 따로 있나요?',
                a: '네, 발인 전날 취소 시 전액 환불, 발인 당일 취소 시 예약금의 50%가 환불됩니다.',
              },
              {
                q: '예담 운구의전 서비스 비용 외 추가요금이 있나요?',
                a: '기본 서비스 외 의장대 복장 선택 시 인당 2만원의 추가요금이 발생할 수 있습니다. 그 외 추가요금은 없습니다.',
              },
            ].map((item, idx) => (
              <FaqItem key={idx} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA 하단 ══════════════ */}
      <CtaSection
        overlayOpacity={60}
        title={
          <>
            가장 어려운 순간,
            <br />
            예담라이프가 함께합니다
          </>
        }
        description={
          <>
            전문 상담사가 24시간 대기하고 있습니다.
            <br />
            부담 없이 문의해 주세요.
          </>
        }
        buttons={
          <>
            <button
              onClick={() => setShowReservation(true)}
              className="relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-xl transition-colors shadow-lg cursor-pointer hover:bg-gray-100 overflow-hidden"
            >
              <ScrollText className="relative w-5 h-5" />
              <span className="relative">간편 예약하기</span>
            </button>
            <a
              href="tel:1660-0959"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Phone className="w-5 h-5" />
              전화 상담
            </a>
          </>
        }
      />

      <ReservationModal
        open={showReservation}
        onClose={() => setShowReservation(false)}
      />

      {/* ── PC 우측 플로팅 사이드바 (sm 이상) ── */}
      <div className="hidden sm:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 flex-col bg-white rounded-[32px] shadow-xl border border-gray-200 overflow-hidden divide-y divide-gray-200">
        <a
          href="tel:1660-0959"
          className="flex flex-col items-center justify-center w-[60px] py-3 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Phone className="w-5 h-5 text-gray-700" />
          <span className="text-[10px] font-bold text-gray-600 mt-1 leading-tight text-center">
            전화 상담
          </span>
        </a>
        <button
          onClick={() => setShowReservation(true)}
          className="flex flex-col items-center justify-center w-[60px] py-3 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <ScrollText className="w-5 h-5 text-gray-700" />
          <span className="text-[10px] font-bold text-gray-600 mt-1">
            간편예약
          </span>
        </button>
        <a
          href="https://pf.kakao.com/_예담라이프"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center w-[60px] py-3 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#374151">
            <path d="M12 3C6.48 3 2 6.54 2 10.86c0 2.78 1.86 5.22 4.65 6.6l-.95 3.53c-.08.3.25.55.52.39l4.2-2.8c.51.07 1.04.1 1.58.1 5.52 0 10-3.54 10-7.86S17.52 3 12 3z" />
          </svg>
          <span className="text-[10px] font-bold text-gray-700 mt-1">
            친구추가
          </span>
        </a>
      </div>

      {/* ── 모바일 하단 고정 바 (sm 미만) ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#222] safe-area-bottom">
        <div className="flex items-center divide-x divide-white/20">
          <a
            href="tel:1660-0959"
            className="flex-1 flex items-center justify-center gap-2 py-4.5 text-white cursor-pointer"
          >
            <Phone className="w-5 h-5" />
            <span className="text-base font-bold">전화 상담</span>
          </a>
          <button
            onClick={() => setShowReservation(true)}
            className="flex-1 flex items-center justify-center gap-2 py-4.5 text-white cursor-pointer"
          >
            <ScrollText className="w-5 h-5" />
            <span className="text-base font-bold">간편예약</span>
          </button>
        </div>
      </div>
      {/* 모바일 하단 고정 바 높이만큼 여백 */}
      <div className="sm:hidden h-16" />
    </>
  );
}
