'use client';
import { CONTACT_PHONE, CONTACT_TEL_HREF } from '@/constants/contact';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Menu, X, Phone, ChevronDown, Plus, Bell } from 'lucide-react';
import {
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
  GOOGLE_FORM_URL,
  categoryTabs,
  topNavItems,
} from './constants';

interface YedamHeaderProps {
  /** 카테고리 탭 숨김 (about 페이지 등) */
  hideCategoryTabs?: boolean;
  /** 현재 활성 카테고리 인덱스 */
  activeCategoryIdx?: number;
  /** 카테고리 변경 핸들러 */
  onCategoryChange?: (idx: number) => void;
  /** shared template 에서 넘어온 경우의 원본 경로 */
  fromUrl?: string;
}

export function YedamHeader({
  hideCategoryTabs = false,
  activeCategoryIdx = 0,
  onCategoryChange,
  fromUrl,
}: YedamHeaderProps) {
  const googleFormUrl = GOOGLE_FORM_URL;
  const homeUrl = fromUrl || '/';
  const buildHref = useMemo(() => {
    if (!fromUrl) return (href: string) => href;
    const fromParam = `from=${encodeURIComponent(fromUrl)}`;
    return (href: string) => {
      if (!href.startsWith('/')) return href;
      return href.includes('?')
        ? `${href}&${fromParam}`
        : `${href}?${fromParam}`;
    };
  }, [fromUrl]);

  const renderLabel = (label: string) => {
    if (!label.includes('+')) return label;
    return label.split('+').map((part, idx) => (
      <span key={idx}>
        {part}
        {idx < label.split('+').length - 1 && (
          <Plus className="inline w-3.5 h-3.5 mx-0.5" />
        )}
      </span>
    ));
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [notices, setNotices] = useState<{ id: number; title: string }[]>([]);
  const headerRef = useRef<HTMLElement>(null);

  // 공지사항 fetch
  useEffect(() => {
    fetch('/api/v1/notices?limit=5')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setNotices(j.data);
      })
      .catch(() => {});
  }, []);

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
    if (allBanners.length === 0) return;
    const timer = setInterval(
      () => setCurrentBannerIdx((prev) => (prev + 1) % allBanners.length),
      4000,
    );
    return () => clearInterval(timer);
  }, [allBanners.length]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    setIsMobileMenuOpen(false);

    if (href.startsWith('/')) {
      if (fromUrl) {
        e.preventDefault();
        window.location.href = buildHref(href);
      }
      return;
    }

    e.preventDefault();

    const element = document.getElementById(href.replace('#', ''));
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="sticky top-0 z-50">
      {/* ── 1단: 상단 로테이션 배너 ── */}
      {allBanners.length > 0 && <div
        className="relative text-center py-2.5 text-sm font-medium overflow-hidden"
        style={{
          backgroundColor: allBanners[currentBannerIdx]?.bgColor ?? '#f3f4f6',
          transition: 'background-color 0.5s ease',
        }}
      >
        {allBanners.map((banner, idx) => {
          const Icon = banner.icon;
          const isNotice = banner.noticeId !== null;
          return (
            <span
              key={`banner-${idx}`}
              className={`inline-flex items-center gap-1.5 transition-all duration-500 ease-in-out ${isNotice ? 'cursor-pointer' : ''}`}
              style={{
                color: banner.textColor,
                opacity: currentBannerIdx === idx ? 1 : 0,
                transform:
                  currentBannerIdx === idx
                    ? 'translateY(0)'
                    : 'translateY(8px)',
                position: currentBannerIdx === idx ? 'relative' : 'absolute',
                pointerEvents: currentBannerIdx === idx ? 'auto' : 'none',
              }}
              onClick={() => {
                if (isNotice) {
                  window.location.href = `/notices/${banner.noticeId}`;
                }
              }}
            >
              <Icon className="w-4 h-4" />
              {banner.text}
            </span>
          );
        })}
      </div>}

      {/* ── 2단: 헤더 (메인헤더 + 카테고리탭) ── */}
      <header ref={headerRef} className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center min-w-0 overflow-hidden md:overflow-visible">
              <a
                href={homeUrl}
                className="flex items-center cursor-pointer shrink-0"
              >
                <img
                  src="https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/main_logo.png"
                  alt="예담라이프"
                  className="h-[100px] sm:h-[140px] w-auto object-contain scale-x-110"
                />
              </a>
              <nav className="hidden md:flex items-center gap-7 ml-7">
                {topNavItems.map((item) => (
                  <div key={item.label} className="relative group">
                    {item.href ? (
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
                        {renderLabel(item.label)}
                        {item.subItems && (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </a>
                    ) : (
                      <span className="flex items-center gap-1 text-[16px] font-semibold text-gray-900 whitespace-nowrap cursor-default">
                        {renderLabel(item.label)}
                        {item.subItems && (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
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
                                if (sub.modal) {
                                  e.preventDefault();
                                  window.dispatchEvent(
                                    new CustomEvent('open-funeral-guide-modal', {
                                      detail: sub.modal,
                                    }),
                                  );
                                  return;
                                }
                                if (!sub.external) handleNavClick(e, sub.href);
                              }}
                              className="block px-4 py-2 text-sm text-gray-600 whitespace-nowrap transition-colors cursor-pointer"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  '#f3f4f6';
                                e.currentTarget.style.color = '#111827';
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
            <div className="flex md:hidden items-center gap-1.5 shrink-0">
              <a
                href={CONTACT_TEL_HREF}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 whitespace-nowrap"
              >
                <Phone className="w-3 h-3 text-gray-500 shrink-0" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[9px] text-gray-400">빠른상담</span>
                  <span className="text-[11px] font-bold text-gray-900">
                    {CONTACT_PHONE}
                  </span>
                </div>
              </a>
              <button
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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
        </div>

        {/* 카테고리 탭 */}
        {!hideCategoryTabs && (
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
                            onCategoryChange?.(idx);
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
        )}

        {/* Mobile Menu Overlay */}
        <div
          className={`md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        {/* Mobile Menu Drawer */}
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
            {topNavItems.map((item, navIdx) => (
              <div key={item.href || item.label}>
                {item.subItems ? (
                  <>
                    <button
                      onClick={() =>
                        setOpenMenuIdx(openMenuIdx === navIdx ? null : navIdx)
                      }
                      className="w-full flex items-center justify-between py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer text-[15px]"
                    >
                      {renderLabel(item.label)}
                      <ChevronDown
                        className="w-4 h-4 text-gray-400 transition-transform duration-200"
                        style={{
                          transform:
                            openMenuIdx === navIdx
                              ? 'rotate(180deg)'
                              : 'rotate(0)',
                        }}
                      />
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-200"
                      style={{
                        maxHeight:
                          openMenuIdx === navIdx
                            ? `${item.subItems.length * 40 + 8}px`
                            : '0px',
                      }}
                    >
                      <div className="flex flex-col ml-4 border-l-2 border-gray-100 py-1">
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
                          ) : sub.modal ? (
                            <button
                              key={sub.label}
                              type="button"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                window.dispatchEvent(
                                  new CustomEvent('open-funeral-guide-modal', {
                                    detail: sub.modal,
                                  }),
                                );
                              }}
                              className="py-2 px-4 text-left text-sm text-gray-500 hover:bg-gray-50 rounded-r-lg transition-colors cursor-pointer"
                            >
                              {sub.label}
                            </button>
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
                    </div>
                  </>
                ) : (
                  <a
                    href={buildHref(item.href)}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer text-[15px] block"
                  >
                    {renderLabel(item.label)}
                  </a>
                )}
              </div>
            ))}
            {!hideCategoryTabs && (
              <div className="border-t border-gray-100 pt-3 mt-2">
                <button
                  onClick={() => setIsServiceOpen(!isServiceOpen)}
                  className="w-full flex items-center justify-between px-4 pb-2 cursor-pointer"
                >
                  <span className="text-xs text-gray-400 font-medium">
                    서비스
                  </span>
                  <ChevronDown
                    className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200"
                    style={{
                      transform: isServiceOpen ? 'rotate(180deg)' : 'rotate(0)',
                    }}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-200"
                  style={{
                    maxHeight: isServiceOpen
                      ? `${categoryTabs.length * 44 + 8}px`
                      : '0px',
                  }}
                >
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
                            onCategoryChange?.(idx);
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
              </div>
            )}
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
    </div>
  );
}
