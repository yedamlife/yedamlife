import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Bell } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { BRAND_COLOR } from '@/components/template/YedamLife/constants';
import { NoticeViewTracker } from './view-tracker';

export const revalidate = 60;

const CATEGORY_STYLE: Record<string, { bg: string; color: string }> = {
  이벤트: { bg: '#ffe4e6', color: '#be123c' },
  안내: { bg: '#dbeafe', color: '#1d4ed8' },
  보도자료: { bg: '#fef3c7', color: '#b45309' },
};

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: notice } = await supabase
    .from('notices')
    .select('id, title, content, category, created_at')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (!notice) notFound();

  const categoryStyle =
    notice.category && CATEGORY_STYLE[notice.category]
      ? CATEGORY_STYLE[notice.category]
      : { bg: '#e8eddf', color: BRAND_COLOR };
  const categoryLabel = notice.category || '공지사항';

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50">
      <NoticeViewTracker id={notice.id} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-5">
          <Link
            href="/notices"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            공지사항 목록으로
          </Link>
        </div>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-gray-100">
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{
                backgroundColor: categoryStyle.bg,
                color: categoryStyle.color,
              }}
            >
              <Bell className="w-3 h-3" />
              {categoryLabel}
            </span>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-5">
              {notice.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="px-6 sm:px-10 py-8">
            <div
              className="review-content"
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />
          </div>

          <div className="px-6 sm:px-10 pb-8">
            <Link
              href="/notices"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              목록으로 돌아가기
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
