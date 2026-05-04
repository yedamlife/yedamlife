'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'small' | 'medium' | 'large';
              type?: 'standard' | 'icon';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              logo_alignment?: 'left' | 'center';
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gisReady, setGisReady] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredential = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        router.push('/admin/dashboard');
      } else {
        setError(json.message ?? '로그인에 실패했습니다.');
      }
    } catch {
      setError('서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gisReady || !clientId || !buttonRef.current) return;
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => handleCredential(response.credential),
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      shape: 'rectangular',
      text: 'signin_with',
      logo_alignment: 'left',
      width: 320,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gisReady, clientId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGisReady(true)}
      />
      <div className="w-full max-w-md space-y-10 rounded-2xl bg-white px-10 py-12 shadow-lg sm:px-14 sm:py-16">
        <div className="text-center">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
            <img src="/images/favicon.ico" alt="" className="h-7 w-7" />
            예담라이프
          </h1>
          <p className="mt-2 text-sm text-gray-500">Admin System</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">{error}</div>
        )}

        <div className="flex justify-center">
          <div ref={buttonRef} />
        </div>
        {loading && (
          <p className="text-center text-xs text-gray-400">로그인 중...</p>
        )}
      </div>
    </div>
  );
}
