import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '예담라이프 | 회사소개',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
