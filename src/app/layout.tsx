import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { GlobalHeader } from '@/components/global-header';
import { KakaoSDK } from '@/components/kakao-sdk';
import './globals.css';

export const metadata: Metadata = {
  title: '예담라이프',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <KakaoSDK />
        <GlobalHeader />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
