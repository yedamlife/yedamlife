import { AdminLayoutClient } from './layout-client';

// admin 영역은 인증/검색파라미터 의존이 많아 정적 prerender 비활성
export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
