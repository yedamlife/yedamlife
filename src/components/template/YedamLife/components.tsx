'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { ChevronRight, FileText } from 'lucide-react';
import { BRAND_COLOR, BRAND_COLOR_LIGHT, BRAND_COLOR_PREMIUM, membershipServices } from './constants';

const CTA_BG_URL =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/ungu_main_banner.png';

// ── CTA 섹션 ──
export function CtaSection({
  title,
  description,
  buttons,
  id,
  overlayOpacity = 60,
  backgroundUrl = CTA_BG_URL,
}: {
  title: ReactNode;
  description: ReactNode;
  buttons: ReactNode;
  id?: string;
  overlayOpacity?: number;
  backgroundUrl?: string;
}) {
  return (
    <section
      id={id}
      className="relative py-16 sm:py-24 overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }}
      />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center" style={{ fontFamily: '"Nanum Myeongjo", serif' }}>
        <h2 className="text-2xl sm:text-3xl font-medium mb-4 text-white">
          {title}
        </h2>
        <p className="text-white/90 mb-8 leading-relaxed">{description}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4" style={{ fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
          {buttons}
        </div>
      </div>
    </section>
  );
}

// ── CountUp 애니메이션 ──
export function CountUp({
  end,
  suffix = '',
  duration = 2000,
  className,
}: {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) setHasStarted(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return (
    <div ref={ref} className={className}>
      {end >= 1000 ? count.toLocaleString() : String(count)}
      {suffix}
    </div>
  );
}

// ── FAQ 아코디언 ──
export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm sm:text-base font-semibold pr-4 text-gray-900">
          {question}
        </span>
        <ChevronRight
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-4">
          <p className="text-sm text-gray-500 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

// ── 멤버십 제휴할인 섹션 ──
export function MembershipSection({
  id,
  background = 'bg-white',
  style,
  ctaHref,
  ctaLabel = '멤버십 신청하기',
}: {
  id?: string;
  background?: string;
  style?: React.CSSProperties;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <section
      id={id}
      className={`py-16 sm:py-24 overflow-hidden ${background}`}
      style={style}
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
          {membershipServices.map((item) => (
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
                    style={{ backgroundColor: BRAND_COLOR, opacity: 0.2 }}
                  />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                  {item.note && (
                    <p className="text-xs text-gray-400 mt-1">{item.note}</p>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
        <div className="flex justify-center mt-12">
          {ctaHref ? (
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white text-sm font-bold rounded-xl cursor-pointer hover:opacity-90 transition-all overflow-hidden"
              style={{ backgroundColor: BRAND_COLOR_PREMIUM }}
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
              <FileText className="relative w-4 h-4" />
              <span className="relative">{ctaLabel}</span>
            </a>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="relative inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white text-sm font-bold rounded-xl cursor-pointer hover:opacity-90 transition-all overflow-hidden"
              style={{ backgroundColor: BRAND_COLOR_PREMIUM }}
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
              <FileText className="relative w-4 h-4" />
              <span className="relative">{ctaLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* 멤버십 선택 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              멤버십 가입 신청
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              가입할 상조 서비스를 선택해주세요.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="/membership/general"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold cursor-pointer hover:opacity-90 transition-all"
                style={{ backgroundColor: BRAND_COLOR_LIGHT, color: BRAND_COLOR }}
              >
                <FileText className="w-4 h-4" />
                후불제 상조 가입신청
              </a>
              <a
                href="/membership/corporate"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white cursor-pointer hover:opacity-90 transition-all"
                style={{ backgroundColor: BRAND_COLOR_PREMIUM }}
              >
                <FileText className="w-4 h-4" />
                기업 상조 가입신청
              </a>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ── 티커 컴포넌트 ──
export function Ticker<T>({
  data,
  renderItem,
  interval = 3000,
}: {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  interval?: number;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % data.length);
    }, interval);
    return () => clearInterval(timer);
  }, [data.length, interval]);

  return (
    <div className="relative h-6 overflow-hidden">
      {data.map((item, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center transition-all duration-500 ease-in-out"
          style={{
            transform: `translateY(${(i - idx) * 100}%)`,
            opacity: i === idx ? 1 : 0,
          }}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
