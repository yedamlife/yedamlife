'use client';

import Script from 'next/script';

export function KakaoSDK() {
  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        const K = (window as any).Kakao;
        if (K && !K.isInitialized()) {
          K.init('76f9b861d31c0eaac3cd5e56e915303a');
        }
      }}
    />
  );
}
