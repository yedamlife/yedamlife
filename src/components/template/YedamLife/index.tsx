'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Plus,
  MessageCircle,
  Headphones,
  Phone,
  ChevronDown,
  FileText,
  PenLine,
  ClipboardList,
} from 'lucide-react';
import {
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
  BRAND_COLOR_PREMIUM,
  GOOGLE_FORM_URL,
  categoryTabs,
  topNavItems,
  topBanners,
} from './constants';
import { GeneralFuneral } from './general-funeral';
import { CorporateFuneral } from './corporate-funeral';
import { EstateCleanup } from './estate-cleanup';
import { CeremonyService } from './ceremony-service';
import { YedamFooter } from './footer';

interface YedamLifeProps {
  hideHeader?: boolean;
  embedded?: boolean;
  initialCategoryIdx?: number;
}

export function YedamLife({
  hideHeader = false,
  embedded = false,
  initialCategoryIdx = 0,
}: YedamLifeProps) {
  const googleFormUrl = GOOGLE_FORM_URL;
  const pathname = usePathname();
  const isSharedTemplate = pathname.startsWith('/shared/templates/');
  const buildHref = useMemo(() => {
    if (!isSharedTemplate) return (href: string) => href;
    const fromParam = `from=${encodeURIComponent(pathname)}`;
    return (href: string) => {
      if (!href.startsWith('/')) return href;
      return href.includes('?')
        ? `${href}&${fromParam}`
        : `${href}?${fromParam}`;
    };
  }, [isSharedTemplate, pathname]);

  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategoryIdx, setActiveCategoryIdx] =
    useState(initialCategoryIdx);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [surveyStep, setSurveyStep] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<number, string>>(
    {},
  );
  const [productInquiryTab, setProductInquiryTab] = useState<'all' | string>(
    'all',
  );
  const [chartProductIdx, setChartProductIdx] = useState(1); // 기본: 예담 2호
  const [corpChartProductIdx, setCorpChartProductIdx] = useState(0);
  const [corpEffectTab, setCorpEffectTab] = useState<'company' | 'employee'>(
    'company',
  );
  const [corpTableFilter, setCorpTableFilter] = useState<
    'all' | 'corp-1' | 'corp-2'
  >('all');
  const [inquiryMainTab, setInquiryMainTab] = useState<'products' | 'design'>(
    'products',
  );
  const [footerModal, setFooterModal] = useState<'privacy' | 'terms' | null>(
    null,
  );
  const headerRef = useRef<HTMLElement>(null);
  const inquirySectionRef = useRef<HTMLDivElement>(null);
  const [showFixedInquiryTab, setShowFixedInquiryTab] = useState(false);
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);

  // 브라우저 타이틀 동기화
  useEffect(() => {
    const tab = categoryTabs[activeCategoryIdx];
    if (tab && !tab.external) {
      document.title = `예담라이프 | ${tab.pageTitle}`;
    } else {
      document.title = '예담라이프 | 후불제 상조';
    }
  }, [activeCategoryIdx]);

  // 문의 탭 고정 표시 로직
  useEffect(() => {
    const inquirySection = inquirySectionRef.current;
    const header = headerRef.current;
    if (!inquirySection || !header || activeCategoryIdx !== 0) {
      setShowFixedInquiryTab(false);
      return;
    }

    const onScroll = () => {
      const headerBottom = header.getBoundingClientRect().bottom;
      const sectionRect = inquirySection.getBoundingClientRect();
      const shouldShow =
        sectionRect.top <= headerBottom &&
        sectionRect.bottom > headerBottom + 50;
      setShowFixedInquiryTab(shouldShow);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeCategoryIdx]);

  // 상단 배너 자동 로테이션
  useEffect(() => {
    if (hideHeader) return;
    const timer = setInterval(
      () => setCurrentBannerIdx((prev) => (prev + 1) % topBanners.length),
      4000,
    );
    return () => clearInterval(timer);
  }, [hideHeader]);

  const handleCategoryChange = (idx: number) => {
    setActiveCategoryIdx(idx);
    const slug = categoryTabs[idx]?.slug;
    if (slug && idx !== 0) {
      router.replace(`/${slug}`, { scroll: false });
    } else {
      router.replace('/', { scroll: false });
    }
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    setIsMobileMenuOpen(false);

    if (href.startsWith('/')) {
      if (isSharedTemplate) {
        e.preventDefault();
        window.location.href = buildHref(href);
      }
      return;
    }

    e.preventDefault();

    // 일반/기업 상조 가입신청 → 해당 탭 전환 후 inquiry로 스크롤
    if (href === '#inquiry-general') {
      handleCategoryChange(0);
      setTimeout(() => {
        document
          .getElementById('inquiry')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    if (href === '#inquiry-corporate') {
      handleCategoryChange(1);
      setTimeout(() => {
        document
          .getElementById('inquiry')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const element = document.getElementById(href.replace('#', ''));
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.12); }
          30% { transform: scale(1); }
          45% { transform: scale(1.08); }
          60% { transform: scale(1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>

      <div
        className="min-h-screen bg-white"
        style={{
          fontFamily:
            "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
          overflowX: 'clip',
        }}
      >
        {/* ── 1단: 상단 로테이션 배너 ── */}
        {!hideHeader && (
          <div
            className="relative text-center py-2.5 text-sm font-medium overflow-hidden"
            style={{
              backgroundColor: topBanners[currentBannerIdx].bgColor,
              transition: 'background-color 0.5s ease',
            }}
          >
            {topBanners.map((banner, idx) => {
              const Icon = banner.icon;
              return (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 transition-all duration-500 ease-in-out"
                  style={{
                    color: banner.textColor,
                    opacity: currentBannerIdx === idx ? 1 : 0,
                    transform:
                      currentBannerIdx === idx
                        ? 'translateY(0)'
                        : 'translateY(8px)',
                    position:
                      currentBannerIdx === idx ? 'relative' : 'absolute',
                    pointerEvents: currentBannerIdx === idx ? 'auto' : 'none',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {banner.text}
                </span>
              );
            })}
          </div>
        )}

        {/* ── 2단: 고정 헤더 (메인헤더 + 카테고리탭) ── */}
        {!hideHeader && (
          <header
            ref={headerRef}
            className={`bg-white border-b border-gray-200 sticky ${embedded ? 'top-14' : 'top-0'} z-50`}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between h-20">
                <div className="flex items-center">
                  <a
                    href="#"
                    className="flex items-center cursor-pointer shrink-0"
                  >
                    <img
                      src="https://mrwwnkmklzgevbzdkbtz.supabase.co/storage/v1/object/public/private-templates/yedam/main_logo.png"
                      alt="예담라이프"
                      className="h-[120px] sm:h-[140px] w-auto object-contain scale-x-110"
                    />
                  </a>
                  <nav className="hidden md:flex items-center gap-7 ml-7">
                    {topNavItems.map((item) => (
                      <div key={item.label} className="relative group">
                        <a
                          href={buildHref(item.href)}
                          onClick={(e) => handleNavClick(e, item.href)}
                          className="flex items-center gap-1 text-[16px] font-semibold text-gray-900 transition-colors cursor-pointer whitespace-nowrap"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = BRAND_COLOR;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#111827';
                          }}
                        >
                          {item.label}
                          {item.subItems && (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </a>
                        {item.subItems && (
                          <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[130px]">
                              {item.subItems.map((sub) => (
                                <a
                                  key={sub.label}
                                  href={buildHref(sub.href)}
                                  {...(sub.external
                                    ? {
                                        target: '_blank',
                                        rel: 'noopener noreferrer',
                                      }
                                    : {})}
                                  onClick={(e) => {
                                    if (!sub.external)
                                      handleNavClick(e, sub.href);
                                  }}
                                  className="block px-4 py-2 text-sm text-gray-600 whitespace-nowrap transition-colors cursor-pointer"
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      BRAND_COLOR_LIGHT;
                                    e.currentTarget.style.color = BRAND_COLOR;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      'transparent';
                                    e.currentTarget.style.color = '#4b5563';
                                  }}
                                >
                                  {sub.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>
                </div>
                <div className="hidden md:flex items-center gap-3">
                  <a
                    href="tel:1660-0959"
                    className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-col leading-tight">
                      <span className="text-[11px] text-gray-500">
                        빠른상담신청
                      </span>
                      <span className="text-[13px] font-extrabold text-gray-900">
                        1660-0959
                      </span>
                    </div>
                  </a>
                </div>
                <button
                  className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="메뉴"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* 카테고리 탭 */}
            <div className="border-t border-gray-100">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div
                  className="flex items-center overflow-x-auto"
                  style={
                    {
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    } as React.CSSProperties
                  }
                >
                  {categoryTabs.map((tab, idx) => {
                    const isActive = activeCategoryIdx === idx;
                    const isExternal = 'external' in tab && tab.external;
                    return (
                      <div key={tab.label} className="relative group">
                        {isExternal ? (
                          <a
                            href={tab.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-3 sm:px-5 py-3.5 text-base sm:text-lg font-bold whitespace-nowrap transition-colors cursor-pointer"
                            style={{ color: '#111111' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = BRAND_COLOR;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#111111';
                            }}
                          >
                            {tab.label}
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              handleCategoryChange(idx);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="flex items-center justify-center px-3 sm:px-5 py-3.5 text-base sm:text-lg font-bold whitespace-nowrap transition-colors cursor-pointer"
                            style={
                              isActive
                                ? { color: BRAND_COLOR }
                                : { color: '#111111' }
                            }
                            onMouseEnter={(e) => {
                              if (!isActive)
                                e.currentTarget.style.color = BRAND_COLOR;
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive)
                                e.currentTarget.style.color = '#111111';
                            }}
                          >
                            {tab.label}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            <div
              className={`md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div
              className={`md:hidden fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="text-base font-bold text-gray-900">메뉴</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="메뉴 닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col p-4 space-y-1 overflow-y-auto h-[calc(100%-60px)]">
                {topNavItems.map((item) => (
                  <div key={item.label}>
                    <a
                      href={buildHref(item.href)}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className="py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer text-[15px] block"
                    >
                      {item.label}
                    </a>
                    {item.subItems && (
                      <div className="flex flex-col ml-4 border-l-2 border-gray-100">
                        {item.subItems.map((sub) =>
                          sub.external ? (
                            <a
                              key={sub.label}
                              href={buildHref(sub.href)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="py-2 px-4 text-sm text-gray-500 hover:bg-gray-50 rounded-r-lg transition-colors cursor-pointer"
                            >
                              {sub.label}
                            </a>
                          ) : (
                            <a
                              key={sub.label}
                              href={buildHref(sub.href)}
                              onClick={(e) => handleNavClick(e, sub.href)}
                              className="py-2 px-4 text-sm text-gray-500 hover:bg-gray-50 rounded-r-lg transition-colors cursor-pointer"
                            >
                              {sub.label}
                            </a>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-3 mt-2">
                  <p className="px-4 pb-2 text-xs text-gray-400 font-medium">
                    서비스
                  </p>
                  <div className="flex flex-col gap-1">
                    {categoryTabs.map((tab, idx) => {
                      const isExternal = 'external' in tab && tab.external;
                      return isExternal ? (
                        <a
                          key={tab.label}
                          href={tab.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-2.5 px-4 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        >
                          {tab.label}
                        </a>
                      ) : (
                        <button
                          key={tab.label}
                          onClick={() => {
                            handleCategoryChange(idx);
                            setIsMobileMenuOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`py-2.5 px-4 text-sm text-left rounded-lg transition-colors cursor-pointer ${activeCategoryIdx === idx ? 'font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                          style={
                            activeCategoryIdx === idx
                              ? {
                                  color: BRAND_COLOR,
                                  backgroundColor: BRAND_COLOR_LIGHT,
                                }
                              : undefined
                          }
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <a
                  href={googleFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 py-3 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  <Phone className="w-4 h-4" />
                  무료 상담신청
                </a>
              </nav>
            </div>
          </header>
        )}

        {/* ══════════════ 탭별 콘텐츠 ══════════════ */}

        {activeCategoryIdx === 0 && (
          <GeneralFuneral
            googleFormUrl={googleFormUrl}
            inquiryMainTab={inquiryMainTab}
            setInquiryMainTab={setInquiryMainTab}
            chartProductIdx={chartProductIdx}
            setChartProductIdx={setChartProductIdx}
            productInquiryTab={productInquiryTab}
            setProductInquiryTab={setProductInquiryTab}
            surveyStep={surveyStep}
            setSurveyStep={setSurveyStep}
            surveyAnswers={surveyAnswers}
            setSurveyAnswers={setSurveyAnswers}
            inquirySectionRef={inquirySectionRef}
            embedded={embedded}
            headerRef={headerRef}
          />
        )}

        {activeCategoryIdx === 1 && (
          <CorporateFuneral
            googleFormUrl={googleFormUrl}
            corpChartProductIdx={corpChartProductIdx}
            setCorpChartProductIdx={setCorpChartProductIdx}
            corpEffectTab={corpEffectTab}
            setCorpEffectTab={setCorpEffectTab}
            corpTableFilter={corpTableFilter}
            setCorpTableFilter={setCorpTableFilter}
          />
        )}

        {activeCategoryIdx === 2 && (
          <EstateCleanup googleFormUrl={googleFormUrl} />
        )}

        {activeCategoryIdx === 3 && (
          <CeremonyService googleFormUrl={googleFormUrl} />
        )}

        {/* ── CTA Section (기업상조는 자체 CTA 보유) ── */}
        {activeCategoryIdx !== 1 && (
          <section
            id="contact"
            className="relative py-16 sm:py-24 overflow-hidden"
            style={{
              backgroundImage:
                'url(https://mrwwnkmklzgevbzdkbtz.supabase.co/storage/v1/object/public/private-templates/yedam/ungu_main_banner.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 text-white">
                가장 어려운 순간,
                <br />
                예담라이프가 함께합니다
              </h2>
              <p className="text-white/70 mb-8 leading-relaxed">
                전문 상담사가 24시간 대기하고 있습니다.
                <br />
                부담 없이 문의해 주세요.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {activeCategoryIdx === 2 ? (
                  <>
                    <button
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent('open-estimate-modal'),
                        )
                      }
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
                      <ClipboardList className="relative w-5 h-5" />
                      <span className="relative">견적 상담</span>
                    </button>
                    <a
                      href="tel:1660-0959"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      <Phone className="w-5 h-5" />
                      빠른 상담신청
                    </a>
                  </>
                ) : (
                  <a
                    href={
                      activeCategoryIdx === 0
                        ? buildHref('/membership/general')
                        : googleFormUrl
                    }
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
                )}
                {activeCategoryIdx !== 2 && (
                  <a
                    href="tel:1660-0959"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <Phone className="w-5 h-5" />
                    전화 상담
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── 고정 문의 탭 (스크롤 시 fixed) ── */}
        {showFixedInquiryTab && !hideHeader && (
          <div
            className="fixed left-0 right-0 bg-white z-45"
            style={{
              top: headerRef.current
                ? `${headerRef.current.getBoundingClientRect().height + (embedded ? 56 : 0)}px`
                : embedded
                  ? '166px'
                  : '110px',
            }}
          >
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
        )}

        {/* ── PC 우측 플로팅 사이드바 (sm 이상) ── */}
        {(activeCategoryIdx === 0 || activeCategoryIdx === 1) &&
          !hideHeader && (
            <div className="hidden sm:flex fixed right-4 bottom-6 z-50 flex-col gap-2">
              <button
                onClick={() => {
                  if (activeCategoryIdx === 0) {
                    setInquiryMainTab('products');
                    setTimeout(() => {
                      document
                        .getElementById('inquiry')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  } else {
                    document
                      .getElementById('sec-corp-inquiry')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex flex-col items-center justify-center w-[52px] h-[52px] rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                style={{
                  backgroundColor: BRAND_COLOR_LIGHT,
                  color: BRAND_COLOR,
                }}
              >
                <Headphones className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">상담신청</span>
              </button>
              {activeCategoryIdx === 0 && (
                <button
                  onClick={() => {
                    setInquiryMainTab('design');
                    setTimeout(() => {
                      inquirySectionRef.current?.scrollIntoView({
                        behavior: 'smooth',
                      });
                    }, 50);
                  }}
                  className="flex flex-col items-center justify-center w-[52px] h-[52px] rounded-xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <PenLine className="w-5 h-5 text-gray-700" />
                  <span className="text-[10px] font-bold text-gray-600 mt-0.5">
                    장례설계
                  </span>
                </button>
              )}
              <a
                href="tel:1660-0959"
                className="flex flex-col items-center justify-center w-[52px] h-[52px] rounded-xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer"
              >
                <Phone className="w-5 h-5 text-gray-700" />
                <span className="text-[9px] font-bold text-gray-600 mt-0.5 leading-tight text-center">
                  24시
                  <br />
                  긴급출동
                </span>
              </a>
              <a
                href="https://pf.kakao.com/_예담라이프"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center w-[52px] h-[52px] rounded-xl bg-[#FEE500] shadow-lg border border-[#FEE500] hover:shadow-xl transition-shadow cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E">
                  <path d="M12 3C6.48 3 2 6.54 2 10.86c0 2.78 1.86 5.22 4.65 6.6l-.95 3.53c-.08.3.25.55.52.39l4.2-2.8c.51.07 1.04.1 1.58.1 5.52 0 10-3.54 10-7.86S17.52 3 12 3z" />
                </svg>
                <span className="text-[9px] font-bold text-[#3C1E1E]/70 mt-0.5">
                  친구추가
                </span>
              </a>
              <a
                href={buildHref(
                  activeCategoryIdx === 0
                    ? '/membership/general'
                    : '/membership/corporate',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center w-[52px] h-[52px] rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer text-white"
                style={{ backgroundColor: '#b8964e' }}
              >
                <FileText className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">가입신청</span>
              </a>
            </div>
          )}

        {/* ── 모바일 FAB (sm 미만) ── */}
        {(activeCategoryIdx === 0 || activeCategoryIdx === 1) &&
          !hideHeader && (
            <div className="sm:hidden fixed right-3 bottom-5 z-50 flex flex-col items-end gap-1.5">
              {/* 펼쳐지는 버튼들 */}
              <div
                className={`flex flex-col items-end gap-1.5 transition-all duration-300 ${
                  isFloatingOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
              >
                <a
                  href={googleFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full shadow-lg cursor-pointer"
                  style={{
                    backgroundColor: BRAND_COLOR_LIGHT,
                    color: BRAND_COLOR,
                  }}
                >
                  <span className="text-[10px] font-bold">상담신청</span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
                  >
                    <Headphones className="w-4 h-4" />
                  </div>
                </a>
                {activeCategoryIdx === 0 && (
                  <button
                    onClick={() => {
                      setIsFloatingOpen(false);
                      setInquiryMainTab('design');
                      setTimeout(() => {
                        inquirySectionRef.current?.scrollIntoView({
                          behavior: 'smooth',
                        });
                      }, 50);
                    }}
                    className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full bg-white shadow-lg border border-gray-200 cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-gray-700">
                      장례설계
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <PenLine className="w-4 h-4 text-gray-700" />
                    </div>
                  </button>
                )}
                <a
                  href="tel:1660-0959"
                  className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full bg-white shadow-lg border border-gray-200 cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-gray-700">
                    24시 긴급출동
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-gray-700" />
                  </div>
                </a>
                <a
                  href="https://pf.kakao.com/_예담라이프"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full bg-[#FEE500] shadow-lg cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-[#3C1E1E]">
                    친구추가
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#F5DC00] flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#3C1E1E">
                      <path d="M12 3C6.48 3 2 6.54 2 10.86c0 2.78 1.86 5.22 4.65 6.6l-.95 3.53c-.08.3.25.55.52.39l4.2-2.8c.51.07 1.04.1 1.58.1 5.52 0 10-3.54 10-7.86S17.52 3 12 3z" />
                    </svg>
                  </div>
                </a>
                <a
                  href={buildHref(
                    activeCategoryIdx === 0
                      ? '/membership/general'
                      : '/membership/corporate',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full shadow-lg cursor-pointer text-white"
                  style={{ backgroundColor: '#b8964e' }}
                >
                  <span className="text-[10px] font-bold">가입신청</span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                </a>
              </div>

              {/* FAB 토글 버튼 */}
              <button
                onClick={() => setIsFloatingOpen(!isFloatingOpen)}
                className="w-10 h-10 rounded-full shadow-xl flex items-center justify-center cursor-pointer transition-all duration-300"
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  transform: isFloatingOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                }}
              >
                {isFloatingOpen ? (
                  <Plus className="w-5 h-5" />
                ) : (
                  <MessageCircle className="w-5 h-5" />
                )}
              </button>
            </div>
          )}

        <YedamFooter />
      </div>
    </>
  );
}
