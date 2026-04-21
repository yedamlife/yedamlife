import { Suspense } from 'react';
import type { Metadata } from 'next';
import { YedamLife } from '@/components/template/YedamLife';

export const metadata: Metadata = {
  title: '예담라이프 | 후불제 상조',
};

export default function Home() {
  return (
    <Suspense>
      <YedamLife initialCategoryIdx={0} hideHeader={true} />
    </Suspense>
  );
}
