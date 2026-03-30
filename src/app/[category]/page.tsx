import { Suspense } from 'react';
import type { Metadata } from 'next';
import { YedamLife } from '@/components/template/YedamLife';
import { categoryTabs } from '@/components/template/YedamLife/constants';

export async function generateStaticParams() {
  return categoryTabs
    .filter((t) => !t.external && t.slug)
    .map((t) => ({
      category: t.slug,
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const matched = categoryTabs.find((t) => !t.external && t.slug === category);
  const subtitle = matched?.pageTitle ?? '후불제 상조';
  return {
    title: `예담라이프 | ${subtitle}`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const initialIdx = categoryTabs.findIndex(
    (t) => !t.external && t.slug === category,
  );

  return (
    <Suspense>
      <YedamLife initialCategoryIdx={initialIdx >= 0 ? initialIdx : 0} />
    </Suspense>
  );
}
