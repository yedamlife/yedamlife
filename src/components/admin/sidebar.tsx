'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/ui/utils';
import {
  LayoutDashboard,
  Heart,
  Building2,
  Package,
  MapPin,
  FileText,
  ChevronDown,
  Ambulance,
  MessageSquareText,
  Megaphone,
  CreditCard,
} from 'lucide-react';
import { useState } from 'react';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    label: '대시보드',
    icon: <LayoutDashboard className="size-4" />,
    href: '/admin/dashboard',
  },
  {
    label: '후불제 상조',
    icon: <Heart className="size-4" />,
    children: [
      { label: '상담 신청', href: '/admin/general-funeral/consultations' },
      { label: '가입 신청', href: '/admin/general-funeral/memberships' },
      { label: '장례 설계 예약', href: '/admin/general-funeral/reservations' },
    ],
  },
  {
    label: '기업 상조',
    icon: <Building2 className="size-4" />,
    children: [
      { label: '상담 신청', href: '/admin/corporate-funeral/consultations' },
      { label: '가입 신청', href: '/admin/corporate-funeral/memberships' },
      { label: '제안서 신청', href: '/admin/corporate-funeral/proposals' },
    ],
  },
  {
    label: '유품 정리',
    icon: <Package className="size-4" />,
    children: [{ label: '견적 신청', href: '/admin/estate-cleanup/estimates' }],
  },
  {
    label: '장지+',
    icon: <MapPin className="size-4" />,
    children: [
      { label: '상담 신청', href: '/admin/burial-plus/consultations' },
      { label: '장지관리', href: '/admin/burial-plus/products' },
    ],
  },
  {
    label: '사후 행정 케어',
    icon: <FileText className="size-4" />,
    children: [{ label: '상담 신청', href: '/admin/post-care/consultations' }],
  },
  {
    label: '운구의전',
    icon: <Ambulance className="size-4" />,
    children: [
      { label: '예약 관리', href: '/admin/funeral-escort/reservations' },
    ],
  },
  {
    label: '실물 카드 관리',
    icon: <CreditCard className="size-4" />,
    children: [
      { label: '실물 카드 신청 내역', href: '/admin/membership/card-requests' },
    ],
  },
  {
    label: '후기 관리',
    icon: <MessageSquareText className="size-4" />,
    href: '/admin/reviews',
  },
  {
    label: '공지사항 관리',
    icon: <Megaphone className="size-4" />,
    href: '/admin/notices',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.children?.some((child) => pathname.startsWith(child.href))) {
        initial[item.label] = true;
      }
    });
    return initial;
  });

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-lg font-bold text-gray-900">예담라이프</h1>
        <p className="text-xs text-gray-500">Management System</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-3 px-3 text-xs font-semibold tracking-wider text-gray-400">
          ADMINISTRATION
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) =>
            item.href ? (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-gray-100 text-gray-900 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100',
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ) : (
              <li key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    item.children?.some((c) => pathname.startsWith(c.href))
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100',
                  )}
                >
                  {item.icon}
                  {item.label}
                  <ChevronDown
                    className={cn(
                      'ml-auto size-4 transition-transform',
                      openMenus[item.label] && 'rotate-180',
                    )}
                  />
                </button>
                {openMenus[item.label] && item.children && (
                  <ul className="ml-7 mt-1 space-y-1 border-l pl-3">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={cn(
                            'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                            pathname.startsWith(child.href)
                              ? 'font-semibold text-gray-900 bg-gray-100'
                              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
                          )}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ),
          )}
        </ul>
      </nav>
    </aside>
  );
}
