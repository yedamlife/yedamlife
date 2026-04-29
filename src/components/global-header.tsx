'use client';

import { usePathname, useRouter } from 'next/navigation';
import { YedamHeader } from '@/components/template/YedamLife/header';
import { categoryTabs } from '@/components/template/YedamLife/constants';

export function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();

  // admin 및 장지 상품 상세 페이지에서는 헤더 숨김
  if (pathname.startsWith('/admin') || pathname.startsWith('/burial-plus/products/')) return null;

  // URL 기반 활성 탭 감지
  const membershipSlug = pathname.startsWith('/membership/general')
    ? 'general-funeral'
    : pathname.startsWith('/membership/corporate')
      ? 'corporate-funeral'
      : null;
  const slugIdx = categoryTabs.findIndex((tab) => {
    const slug = 'slug' in tab ? tab.slug : undefined;
    if (!slug) return false;
    if (membershipSlug) return slug === membershipSlug;
    return pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
  });
  const activeCategoryIdx = pathname === '/' ? 0 : slugIdx;

  // about 등에서는 카테고리 탭 숨김 (membership 가입신청서는 노출)
  const hideCategoryTabs = pathname.startsWith('/about');

  const handleCategoryChange = (idx: number) => {
    const tab = categoryTabs[idx];
    const slug = 'slug' in tab ? tab.slug : undefined;
    const target = slug && idx !== 0 ? `/${slug}` : '/';
    router.push(target);
  };

  return (
    <YedamHeader
      activeCategoryIdx={activeCategoryIdx}
      onCategoryChange={handleCategoryChange}
      hideCategoryTabs={hideCategoryTabs}
    />
  );
}
