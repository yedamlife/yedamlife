import { notFound } from 'next/navigation';
import { ArrowLeft, User, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { BRAND_COLOR } from '@/components/template/YedamLife/constants';

const CATEGORY_LABEL: Record<string, string> = {
  general: '일반상조',
  corporate: '기업상조',
  estate: '유품정리',
  burial: '장지+',
  postcare: '사후행정케어',
  escort: '운구의전',
};

const BACK_URL: Record<string, string> = {
  general: '/general-funeral#reviews',
  corporate: '/corporate-funeral#sec-corp-reviews',
  estate: '/cleanup#sec-cleanup-reviews',
  escort: '/funeral-escort#sec-ceremony-reviews',
  burial: '/burial-plus#sec-burial-reviews',
  postcare: '/post-care#sec-postcare-reviews',
};

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: review } = await supabase
    .from('reviews')
    .select('id, category, author, written_at, title, content, tags')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (!review) notFound();

  const backUrl = BACK_URL[review.category] ?? '/';

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-5">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            후기 목록으로
          </Link>
        </div>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-gray-100">
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ backgroundColor: '#e8eddf', color: BRAND_COLOR }}
            >
              <Tag className="w-3 h-3" />
              {CATEGORY_LABEL[review.category] ?? review.category}
            </span>

            {review.title && (
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-4">
                {review.title}
              </h1>
            )}

            {Array.isArray(review.tags) && review.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {review.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold border"
                    style={{
                      color: BRAND_COLOR,
                      borderColor: '#e8eddf',
                      backgroundColor: '#f7f9f1',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="font-medium text-gray-700">{review.author}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(review.written_at).toLocaleDateString('ko-KR', {
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
              dangerouslySetInnerHTML={{ __html: review.content }}
            />
          </div>

          <div className="px-6 sm:px-10 pb-8">
            <Link
              href={backUrl}
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
