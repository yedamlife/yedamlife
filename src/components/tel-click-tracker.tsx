'use client';

import { useEffect } from 'react';

// pathname → 카테고리 한글명 매핑
// 첫 매칭 prefix가 적용됨 (구체적인 경로 먼저)
const PATH_CATEGORY: Array<[RegExp, string]> = [
  [/^\/general-funeral/, '후불제 상조'],
  [/^\/corporate-funeral/, '기업 상조'],
  [/^\/cleanup/, '유품정리'],
  [/^\/funeral-escort/, '운구의전'],
  [/^\/burial-plus/, '장지+'],
  [/^\/post-care/, '사후행정케어'],
  [/^\/membership\/general/, '후불제상조 가입신청서'],
  [/^\/membership\/corporate/, '기업상조 가입신청서'],
  [/^\/notices/, '예담라이프'],
  [/^\/about/, '예담라이프'],
  // 루트는 '후불제 상조'로 매핑 (요청사항)
  [/^\/$/, '후불제 상조'],
];

function pathToCategory(pathname: string): string {
  for (const [pattern, label] of PATH_CATEGORY) {
    if (pattern.test(pathname)) return label;
  }
  return '예담라이프';
}

export function TelClickTracker() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest(
        'a[href^="tel:"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const phoneRaw = anchor.getAttribute('href')?.replace(/^tel:/, '') ?? '';
      const phone = phoneRaw.trim();
      if (!phone) return;

      const category = pathToCategory(window.location.pathname);
      const url = window.location.href;

      // tel: 기본 동작은 그대로 진행. fetch는 keepalive로 백그라운드 송신
      fetch('/api/v1/tel-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, category, url }),
        keepalive: true,
      }).catch(() => {});
    };

    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);

  return null;
}
