'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Phone, FileText } from 'lucide-react';
import {
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
  BRAND_COLOR_PREMIUM,
} from '@/components/template/YedamLife/constants';

export default function MembershipCertificatePage() {
  return (
    <Suspense>
      <MembershipCertificateContent />
    </Suspense>
  );
}

function MembershipCertificateContent() {
  const searchParams = useSearchParams();
  const homeUrl = searchParams.get('from') || '/';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '');
    setPhone(digits);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('이름과 연락처를 입력해주세요.');
      return;
    }
    const params = new URLSearchParams({
      name: name.trim(),
      phone: phone.trim(),
      from: homeUrl,
    });
    router.push(`/membership/certificate/result?${params.toString()}`);
  };

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        html, body { scrollbar-width: none; -ms-overflow-style: none; overflow-x: hidden; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="min-h-screen"
        style={{ fontFamily: 'Pretendard, sans-serif' }}
      >
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f5] via-[#f5f0ea] to-white" />
          <div
            className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.07] rounded-full blur-3xl"
            style={{ backgroundColor: BRAND_COLOR }}
          />
          <div
            className="absolute bottom-0 left-0 w-[300px] h-[300px] opacity-[0.05] rounded-full blur-3xl"
            style={{ backgroundColor: BRAND_COLOR_PREMIUM }}
          />

          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            {/* 헤더 로고 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <img
                  src="https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/main_logo.png"
                  alt="예담라이프"
                  className="h-[100px] sm:h-[120px] w-auto object-contain"
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: BRAND_COLOR_LIGHT,
                    color: BRAND_COLOR,
                  }}
                >
                  ISO 9001
                </span>
                <span
                  className="text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: BRAND_COLOR_LIGHT,
                    color: BRAND_COLOR,
                  }}
                >
                  예비사회적기업
                </span>
              </div>
            </div>

            {/* 타이틀 */}
            <div className="text-center mb-6">
              <p
                className="text-sm font-medium mb-2"
                style={{ color: BRAND_COLOR }}
              >
                예담라이프(주)
              </p>
              <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-2 sm:mb-3 leading-tight">
                가입증서 조회
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div
                  className="h-px w-12"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
                <p className="text-sm text-gray-500">
                  신청하신 이름과 연락처를 입력해주세요
                </p>
                <div
                  className="h-px w-12"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
              </div>
            </div>

            {/* 입력 폼 카드 */}
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                  className="px-5 sm:px-6 py-3 sm:py-4 flex items-center gap-2 rounded-t-2xl"
                  style={{ backgroundColor: BRAND_COLOR, minHeight: 'auto' }}
                >
                  <FileText
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70"
                    style={{ minHeight: 'auto' }}
                  />
                  <span
                    className="text-white/90 font-medium text-xs sm:text-sm tracking-wide"
                    style={{ minHeight: 'auto' }}
                  >
                    가입 정보 입력
                  </span>
                </div>

                <div className="p-5 sm:p-8 space-y-5">
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: BRAND_COLOR }}
                    >
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="이름을 입력해주세요"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: BRAND_COLOR }}
                    >
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="'-' 빼고 숫자만 입력"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 회사 정보 */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <div className="text-center sm:text-left">
                  <p className="text-xs text-gray-400 mb-1">
                    후불제 상조기업 예담라이프
                  </p>
                  <p
                    className="text-lg font-extrabold"
                    style={{ color: BRAND_COLOR }}
                  >
                    전국 365일 24시간 긴급출동
                  </p>
                </div>
                <a
                  href="tel:1660-0959"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all hover:opacity-90 cursor-pointer"
                  style={{
                    backgroundColor: BRAND_COLOR_LIGHT,
                    color: BRAND_COLOR,
                  }}
                >
                  <Phone className="w-4 h-4" />
                  대표번호 1660-0959
                </a>
              </div>

              {/* 안내 문구 */}
              <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 space-y-2">
                <div className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: BRAND_COLOR }}
                  />
                  <p className="text-sm text-gray-600">
                    예담라이프 후불제상조는 월 납입금이 없습니다.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: BRAND_COLOR }}
                  />
                  <p className="text-sm text-gray-600">
                    장례 발생 시 유가족분들께서는 예담라이프에 연락을 주셔야
                    이용하실 수 있습니다.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: BRAND_COLOR }}
                  />
                  <p className="text-sm text-gray-600">
                    신청인 외 가족 및 친인척 분들도 이용 가능합니다.
                    <br />
                    <span className="text-gray-400">
                      (장례 진행 시 상품변경 가능)
                    </span>
                  </p>
                </div>
              </div>

              {/* 제출 버튼 */}
              <div className="mt-10 text-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-12 py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  <FileText className="w-5 h-5" />
                  가입증서 보기
                </button>
                <p className="text-xs text-gray-400 mt-4">
                  가입 시 입력한 이름과 연락처를 입력해주세요.
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
