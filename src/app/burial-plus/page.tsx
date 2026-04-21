import { Suspense } from 'react';
import type { Metadata } from 'next';
import { YedamLife } from '@/components/template/YedamLife';

export const metadata: Metadata = {
  title: '예담라이프 | 장지+',
};

export default function BurialPlusPage() {
  return (
    <Suspense>
      <YedamLife initialCategoryIdx={4} hideHeader={true} />
    </Suspense>
  );
}
