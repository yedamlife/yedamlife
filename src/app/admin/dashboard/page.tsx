import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStatusCounts } from '@/lib/admin/api-helpers';
import { StatsCards } from '@/components/admin/stats-cards';
import Link from 'next/link';

const services = [
  { label: '일반상조 - 상담신청', table: 'gf_consultation_requests', href: '/admin/general-funeral/consultations' },
  { label: '일반상조 - 가입 신청', table: 'gf_membership_applications', href: '/admin/general-funeral/memberships' },
  { label: '일반상조 - 장례 설계 예약', table: 'gf_direct_requests', href: '/admin/general-funeral/reservations' },
  { label: '기업상조 - 상담신청', table: 'cf_consultation_requests', href: '/admin/corporate-funeral/consultations' },
  { label: '기업상조 - 가입 신청', table: 'cf_membership_applications', href: '/admin/corporate-funeral/memberships' },
  { label: '기업상조 - 제안서 신청', table: 'corporate_proposal_requests', href: '/admin/corporate-funeral/proposals' },
  { label: '유품정리 - 견적 신청', table: 'ec_estimate_requests', href: '/admin/estate-cleanup/estimates' },
  { label: '장지+ - 상담신청', table: 'bp_consultation_requests', href: '/admin/burial-plus/consultations' },
  { label: '사후행정케어 - 상담신청', table: 'pc_consultation_requests', href: '/admin/post-care/consultations' },
];

export default async function DashboardPage() {
  const allCounts = await Promise.all(
    services.map(async (s) => {
      const counts = await getStatusCounts(s.table);
      return { ...s, counts };
    }),
  );

  const totals = allCounts.reduce(
    (acc, s) => ({
      total: acc.total + s.counts.total,
      pending: acc.pending + s.counts.pending,
      in_progress: acc.in_progress + s.counts.in_progress,
      completed: acc.completed + s.counts.completed,
    }),
    { total: 0, pending: 0, in_progress: 0, completed: 0 },
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">대시보드</h2>

      <StatsCards
        total={totals.total}
        pending={totals.pending}
        inProgress={totals.in_progress}
        completed={totals.completed}
      />

      <div className="grid grid-cols-3 gap-4">
        {allCounts.map((s) => (
          <Link key={s.table} href={s.href}>
            <Card className="border-gray-200 transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-gray-900">{s.counts.total}</span>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>접수 {s.counts.pending}</span>
                    <span>진행 {s.counts.in_progress}</span>
                    <span>완료 {s.counts.completed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
