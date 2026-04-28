import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { GlobalHeader } from '@/components/global-header';
import { FuneralGuideModals } from '@/components/funeral-guide-modals';
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
        <FuneralGuideModals />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
