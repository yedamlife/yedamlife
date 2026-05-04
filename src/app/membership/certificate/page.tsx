'use client';
import { CONTACT_PHONE, CONTACT_TEL_HREF } from '@/constants/contact';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Phone, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { BRAND_COLOR, BRAND_COLOR_LIGHT } from '@/components/template/YedamLife/constants';

type MembershipType = 'general' | 'corporate';

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
  const [type, setType] = useState<MembershipType>('general');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '');
    setPhone(digits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'general' && !name.trim()) {
      toast.warning('이름을 입력해주세요.');
      return;
    }
    if (type === 'corporate' && !companyName.trim()) {
      toast.warning('기업명을 입력해주세요.');
      return;
    }
    if (!phone.trim()) {
      toast.warning('연락처를 입력해주세요.');
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      const params = new URLSearchParams({ type, phone: phone.trim() });
      if (type === 'general') params.set('name', name.trim());
      else params.set('company_name', companyName.trim());

      const res = await fetch(`/api/v1/membership/lookup?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data?.id) {
        const fromQuery = homeUrl ? `?from=${encodeURIComponent(homeUrl)}` : '';
        router.push(`/membership/certificate/result/${json.data.id}${fromQuery}`);
        return;
      }

      if (json.error === 'pending') {
        toast.info(json.message || '현재 접수 상태입니다.');
        return;
      }

      if (res.status === 404 || json.error === 'not_found') {
        toast.error(json.message || '가입 신청 내역이 없습니다.');
        return;
      }

      toast.error(json.message || '조회에 실패했습니다.');
    } catch {
      toast.error('서버에 연결할 수 없습니다.');
    } finally {
      setSubmitting(false);
    }
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
        <section className="relative overflow-hidden bg-white">
          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="text-center mb-6">
              <p className="text-sm font-medium mb-2" style={{ color: BRAND_COLOR }}>
                예담라이프(주)
              </p>
              <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-2 sm:mb-3 leading-tight">
                가입증서 조회
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-12" style={{ backgroundColor: BRAND_COLOR }} />
                <p className="text-sm text-gray-500">신청하신 정보를 입력해주세요</p>
                <div className="h-px w-12" style={{ backgroundColor: BRAND_COLOR }} />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 sm:px-6 py-3 sm:py-4 flex items-center gap-2 rounded-t-2xl bg-gray-200">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                  <span className="text-gray-800 font-medium text-xs sm:text-sm tracking-wide">
                    가입 정보 입력
                  </span>
                </div>

                <div className="p-5 sm:p-8 space-y-5">
                  {/* 가입 유형 선택 */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      가입 유형 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { value: 'general', label: '후불제 상조' },
                          { value: 'corporate', label: '기업 상조' },
                        ] as const
                      ).map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                            type === opt.value
                              ? ''
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                          style={
                            type === opt.value
                              ? {
                                  backgroundColor: BRAND_COLOR_LIGHT,
                                  borderColor: BRAND_COLOR,
                                  color: BRAND_COLOR,
                                }
                              : undefined
                          }
                        >
                          <input
                            type="radio"
                            name="membership_type"
                            value={opt.value}
                            checked={type === opt.value}
                            onChange={() => setType(opt.value)}
                            className="sr-only"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 후불제: 이름 / 기업: 기업명 */}
                  {type === 'general' ? (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">
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
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">
                        기업명 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="기업명을 입력해주세요"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                  )}

                  {/* 연락처 */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      {type === 'corporate' ? '신청인 연락처' : '연락처'}{' '}
                      <span className="text-red-500">*</span>
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
                  <p className="text-xs text-gray-400 mb-1">후불제 상조기업 예담라이프</p>
                  <p className="text-lg font-extrabold text-gray-900">
                    전국 365일 24시간 긴급출동
                  </p>
                </div>
                <a
                  href={CONTACT_TEL_HREF}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all hover:bg-gray-200 cursor-pointer bg-gray-100 text-gray-800"
                >
                  <Phone className="w-4 h-4" />
                  대표번호 {CONTACT_PHONE}
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
                    장례 발생 시 유가족분들께서는 예담라이프에 연락을 주셔야 이용하실 수 있습니다.
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
                    <span className="text-gray-400">(장례 진행 시 상품변경 가능)</span>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* 하단 고정 가입증서 보기 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:pb-4 pointer-events-none safe-area-bottom">
        <div className="mx-auto max-w-2xl sm:px-6 flex sm:rounded-xl overflow-hidden sm:shadow-xl">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            className="pointer-events-auto flex-1 h-14 flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold text-base transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-5 h-5 shrink-0" />
            <span className="leading-none">{submitting ? '조회 중...' : '가입증서 보기'}</span>
          </button>
        </div>
      </div>
      <div className="h-16" />
    </>
  );
}
