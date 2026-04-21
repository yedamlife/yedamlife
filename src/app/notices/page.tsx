import Link from 'next/link';
import { Calendar, Bell, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BRAND_COLOR } from '@/components/template/YedamLife/constants';

export const revalidate = 60;

interface NoticeRow {
  id: number;
  title: string;
  created_at: string;
}

export default async function NoticesPage() {
  const { data } = await supabase
    .from('notices')
    .select('id, title, created_at')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const notices: NoticeRow[] = data ?? [];

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-8 sm:mb-10">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{ backgroundColor: '#e8eddf', color: BRAND_COLOR }}
          >
            <Bell className="w-3.5 h-3.5" />
            공지사항
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            예담라이프 공지사항
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            예담라이프의 최신 소식과 안내사항을 확인하세요.
          </p>
        </div>

        {notices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-sm text-gray-500">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <ul className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            {notices.map((notice) => (
              <li key={notice.id}>
                <Link
                  href={`/notices/${notice.id}`}
                  className="flex items-center gap-4 px-5 sm:px-6 py-4 sm:py-5 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm sm:text-base font-semibold text-gray-900 truncate group-hover:text-gray-700">
                      {notice.title}
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
