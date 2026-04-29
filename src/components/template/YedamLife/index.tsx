'use client';
import { CONTACT_PHONE, CONTACT_TEL_HREF } from '@/constants/contact';

import { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Plus,
  Phone,
  MapPin,
  ChevronDown,
  FileText,
  PenLine,
  ScrollText,
  Bell,
} from 'lucide-react';
import {
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
  GOOGLE_FORM_URL,
  categoryTabs,
  topNavItems,
} from './constants';
import { GeneralFuneral } from './general-funeral';
import { CorporateFuneral } from './corporate-funeral';
import { EstateCleanup } from './estate-cleanup';
import { CeremonyService } from './funeral-escort-service';
import { BurialPlus } from './burial-plus';
import { PostCare } from './post-care';
import { YedamFooter } from './footer';

interface YedamLifeProps {
  hideHeader?: boolean;
  embedded?: boolean;
  initialCategoryIdx?: number;
  headerOnly?: boolean;
  onMounted?: () => void;
}

export function YedamLife({
  hideHeader = false,
  embedded = false,
  initialCategoryIdx = 0,
  headerOnly = false,
  onMounted,
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
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);
  const [showFloating, setShowFloating] = useState(false);

  // 4.5 후불제 상조 소개 섹션부터 플로팅 사이드바 노출 (데스크탑)
  useEffect(() => {
    if (activeCategoryIdx !== 0 && activeCategoryIdx !== 1) return;
    const targetId = activeCategoryIdx === 0 ? 'sec-about' : 'sec-corp-intro';
    const checkScroll = () => {
      const target = document.getElementById(targetId);
      if (!target) {
        setShowFloating(false);
        return;
      }
      const rect = target.getBoundingClientRect();
      setShowFloating(rect.top <= window.innerHeight * 0.5);
    };
    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [activeCategoryIdx]);

  // 브라우저 타이틀 동기화
  useEffect(() => {
    const tab = categoryTabs[activeCategoryIdx];
    if (tab && !tab.external) {
      document.title = `예담라이프 | ${tab.pageTitle}`;
    } else {
      document.title = '예담라이프 | 후불제 상조';
    }
  }, [activeCategoryIdx]);

  // 공지사항 fetch
  const [notices, setNotices] = useState<{ id: number; title: string }[]>([]);
  useEffect(() => {
    if (hideHeader) return;
    fetch('/api/v1/notices?limit=5')
      .then((r) => r.json())
      .then((j) => { if (j.success) setNotices(j.data); })
      .catch(() => {});
  }, [hideHeader]);

  const NOTICE_COLORS = [
    { bgColor: '#f3f4f6', textColor: '#374151' },
    { bgColor: '#eef2ff', textColor: '#4338ca' },
    { bgColor: '#fdf2f8', textColor: '#be185d' },
    { bgColor: '#fefce8', textColor: '#854d0e' },
    { bgColor: '#ecfdf5', textColor: '#065f46' },
  ];

  const allBanners = useMemo(() => {
    return notices.map((n, i) => ({
      text: n.title,
      icon: Bell,
      noticeId: n.id,
      ...NOTICE_COLORS[i % NOTICE_COLORS.length],
    }));
  }, [notices]);

  // 상단 배너 자동 로테이션
  useEffect(() => {
    if (hideHeader || allBanners.length === 0) return;
    const timer = setInterval(
      () => setCurrentBannerIdx((prev) => (prev + 1) % allBanners.length),
      4000,
    );
    return () => clearInterval(timer);
  }, [hideHeader, allBanners.length]);

  const handleCategoryChange = (idx: number) => {
    setActiveCategoryIdx(idx);
    const slug = categoryTabs[idx]?.slug;
    const target = slug && idx !== 0 ? `/${slug}` : '/';
    if (pathname !== target) {
      router.push(target, { scroll: false });
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
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div
        className={headerOnly ? 'bg-white' : 'min-h-screen bg-white'}
        style={{
          fontFamily:
            "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
          overflowX: 'clip',
        }}
      >
        {/* ── 1단: 상단 로테이션 배너 ── */}
        {!hideHeader && allBanners.length > 0 && (
          <div
            className="relative text-center py-2.5 text-sm font-medium overflow-hidden"
            style={{
              backgroundColor: allBanners[currentBannerIdx]?.bgColor ?? '#f3f4f6',
              transition: 'background-color 0.5s ease',
            }}
          >
            {allBanners.map((banner, idx) => {
              const Icon = banner.icon;
              return (
                <span
                  key={`banner-${idx}`}
                  className="inline-flex items-center gap-1.5 transition-all duration-500 ease-in-out cursor-pointer"
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
                  onClick={() => {
                    window.location.href = `/notices/${banner.noticeId}`;
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
                      src="https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/main_logo.png"
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
                    href={CONTACT_TEL_HREF}
                    className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-col leading-tight">
                      <span className="text-[11px] text-gray-500">
                        빠른상담 신청
                      </span>
                      <span className="text-[13px] font-extrabold text-gray-900">
                        {CONTACT_PHONE}
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
                  무료 상담 신청
                </a>
              </nav>
            </div>
          </header>
        )}

        {/* ══════════════ 탭별 콘텐츠 ══════════════ */}

        {!headerOnly && activeCategoryIdx === 0 && (
          <GeneralFuneral
            googleFormUrl={googleFormUrl}
            membershipHref={buildHref('/membership/general')}
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

        {!headerOnly && activeCategoryIdx === 1 && (
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

        {!headerOnly && activeCategoryIdx === 2 && (
          <EstateCleanup googleFormUrl={googleFormUrl} />
        )}

        {!headerOnly && activeCategoryIdx === 3 && (
          <CeremonyService googleFormUrl={googleFormUrl} />
        )}

        {!headerOnly && activeCategoryIdx === 4 && (
          <BurialPlus googleFormUrl={googleFormUrl} />
        )}

        {!headerOnly && activeCategoryIdx === 5 && <PostCare />}

        {/* ── PC 우측 플로팅 사이드바 (sm 이상, 후불제 상조 소개 섹션부터) ── */}
        {(activeCategoryIdx === 0 || activeCategoryIdx === 1) && (
          <div
            className="hidden sm:flex fixed right-4 top-1/2 z-50 flex-col bg-white rounded-[32px] shadow-xl border border-gray-200 overflow-hidden divide-y divide-gray-200 transition-all duration-500 ease-out"
            style={{
              opacity: showFloating ? 1 : 0,
              transform: showFloating
                ? 'translate(0, -50%)'
                : 'translate(20px, -50%)',
              pointerEvents: showFloating ? 'auto' : 'none',
            }}
          >
            {activeCategoryIdx === 0 && (
              <a
                href="/burial-plus"
                className="group relative flex flex-col items-center justify-center w-[60px] py-3 hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-yellow-100/60 to-transparent" />
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full animate-ping"
                  style={{ backgroundColor: '#b8964e' }}
                />
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: '#b8964e' }}
                />
                <MapPin
                  className="w-5 h-5 text-gray-700 animate-bounce transition-transform duration-300 group-hover:-translate-y-0.5"
                />
                <span className="text-[10px] font-bold text-gray-700 mt-1">
                  장지+
                </span>
              </a>
            )}
            <a
              href={CONTACT_TEL_HREF}
              className="flex flex-col items-center justify-center w-[60px] py-3 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Phone className="w-5 h-5 text-gray-700" />
              <span className="text-[10px] font-bold text-gray-600 mt-1 leading-tight text-center">
                전화 상담
              </span>
            </a>
            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent(
                    activeCategoryIdx === 0
                      ? 'open-general-consult-modal'
                      : 'open-corp-consult-modal',
                  ),
                );
              }}
              className="flex flex-col items-center justify-center w-[60px] py-3 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ScrollText className="w-5 h-5 text-gray-700" />
              <span className="text-[10px] font-bold text-gray-600 mt-1">
                상담 신청
              </span>
            </button>
            {activeCategoryIdx === 0 && (
              <button
                onClick={() => {
                  document
                    .getElementById('sec-direct-design')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex flex-col items-center justify-center w-[60px] py-3 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <PenLine className="w-5 h-5 text-gray-700" />
                <span className="text-[10px] font-bold text-gray-600 mt-1">
                  장례설계
                </span>
              </button>
            )}

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
            <a
              href={buildHref(
                activeCategoryIdx === 0
                  ? '/membership/general'
                  : '/membership/corporate',
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center w-[60px] py-3 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <FileText className="w-5 h-5 text-gray-700" />
              <span className="text-[10px] font-bold text-gray-700 mt-1">
                가입신청
              </span>
            </a>
          </div>
        )}

{/* ── 모바일 하단 고정 바 (sm 미만) ── */}
        {(activeCategoryIdx === 0 || activeCategoryIdx === 1) && (
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#222] safe-area-bottom">
            <div className="flex items-center divide-x divide-white/20">
              <a
                href={CONTACT_TEL_HREF}
                className="flex-1 flex items-center justify-center gap-2 py-4.5 text-white cursor-pointer"
              >
                <Phone className="w-5 h-5" />
                <span className="text-base font-bold">전화 상담</span>
              </a>
              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent(
                      activeCategoryIdx === 0
                        ? 'open-general-consult-modal'
                        : 'open-corp-consult-modal',
                    ),
                  );
                }}
                className="flex-1 flex items-center justify-center gap-2 py-4.5 text-white cursor-pointer"
              >
                <ScrollText className="w-5 h-5" />
                <span className="text-base font-bold">상담 신청</span>
              </button>
              <a
                href={buildHref(
                  activeCategoryIdx === 0
                    ? '/membership/general'
                    : '/membership/corporate',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-4.5 text-white cursor-pointer"
              >
                <FileText className="w-5 h-5" />
                <span className="text-base font-bold">가입 신청</span>
              </a>
            </div>
          </div>
        )}

        {!headerOnly && <YedamFooter />}
        {!headerOnly && <div className="sm:hidden h-16" />}
      </div>
    </>
  );
}
