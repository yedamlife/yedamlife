'use client';
import { CONTACT_PHONE, CONTACT_TEL_HREF } from '@/constants/contact';

import { useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { Gift, Phone, CheckCircle2, FileText, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
} from '@/components/template/YedamLife/constants';

// ── 기업상조 상품 옵션 ──
const productOptions = [
  {
    id: 'corp-1',
    name: '예담 기업 1호',
    originalPrice: '150만원',
    discountPrice: '130만원',
  },
  {
    id: 'corp-2',
    name: '예담 기업 2호',
    originalPrice: '250만원',
    discountPrice: '230만원',
  },
];

// ── 제공 서비스 (8개) ──
const serviceBenefits = [
  { title: '예담라이프 상조상품', desc: '20만원 할인' },
  { title: '관내 이송서비스', desc: '제공' },
  { title: '조사용품(200인분) 한 상자', desc: '또는 근조화환 제공' },
  { title: '입관 시', desc: '관꽃장식 서비스' },
  { title: '발인 시 운구인원', desc: '2~4인 지원' },
  { title: '무료 부고 알림', desc: '서비스 제공' },
  { title: '근조기 및', desc: '안내 배너 설치' },
  { title: '예담라이프 멤버십 서비스', desc: '제휴할인 제공' },
];

// ── 멤버십 서비스 ──
const membershipConsulting = [
  { title: '장지 컨설팅', desc: '전문가 무료상담 (현장답사 가능)' },
  { title: '개장 및 이장 컨설팅', desc: '전문가 무료상담 (현장답사 가능)' },
  {
    title: '고인 유품정리 컨설팅',
    desc: '유품정리 전문가 상담 (무료 방문견적)',
  },
  {
    title: '법률 컨설팅',
    desc: '법률 및 세무 전문가 상담 (상속/증여/세금 등)',
  },
  { title: '장례운구의전 지원 컨설팅', desc: '장례 운구지원 전문 상담' },
];

export default function MembershipCorporatePage() {
  return (
    <Suspense>
      <MembershipCorporatePageContent />
    </Suspense>
  );
}

function MembershipCorporatePageContent() {
  const searchParams = useSearchParams();
  const homeUrl = searchParams.get('from') || '/';
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: '',
    gender: '남',
    religion: '무교',
    address: '',
    addressDetail: '',
    companyName: '',
    position: '',
    product: '',
    referrer: '',
  });
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPostcode, setShowPostcode] = useState(false);
  const postcodeRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`;

  const openAddressSearch = () => {
    const run = () => {
      const daum = (window as unknown as Record<string, unknown>).daum as
        | {
            Postcode: new (opts: {
              oncomplete: (data: {
                address: string;
                buildingName: string;
              }) => void;
              onclose: () => void;
              width: string;
              height: string;
            }) => { embed: (el: HTMLElement) => void };
          }
        | undefined;
      if (!daum?.Postcode || !postcodeRef.current) return;

      postcodeRef.current.innerHTML = '';
      setShowPostcode(true);

      new daum.Postcode({
        width: '100%',
        height: '100%',
        oncomplete: (data) => {
          const addr = data.buildingName
            ? `${data.address} (${data.buildingName})`
            : data.address;
          updateField('address', addr);
          setShowPostcode(false);
        },
        onclose: () => {
          setShowPostcode(false);
        },
      }).embed(postcodeRef.current);
    };

    if ((window as unknown as Record<string, unknown>).daum) {
      run();
      return;
    }

    const script = document.createElement('script');
    script.src =
      '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.onload = run;
    document.head.appendChild(script);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const missing: string[] = [];
    if (!formData.name) missing.push('신청인');
    if (!formData.phone) missing.push('휴대폰');
    if (!formData.address) missing.push('주소');
    if (!formData.companyName) missing.push('회사명');
    if (!formData.product) missing.push('가입상품');
    if (missing.length > 0) {
      toast.warning(`다음 항목을 입력해주세요: ${missing.join(', ')}`);
      return;
    }
    if (!privacyAgreed) {
      toast.warning('개인정보 이용·제공·활용 동의가 필요합니다.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/corporate-funeral/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          birth_date: formData.birthDate,
          gender: formData.gender,
          religion: formData.religion,
          address: formData.address,
          address_detail: formData.addressDetail,
          company_name: formData.companyName,
          position: formData.position,
          product: formData.product,
          referrer: formData.referrer,
          privacy_agreed: privacyAgreed,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        toast.error(
          result.message || '오류가 발생했습니다. 다시 시도해주세요.',
        );
      }
    } catch {
      toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: BRAND_COLOR_LIGHT }}
          >
            <CheckCircle2
              className="w-10 h-10"
              style={{ color: BRAND_COLOR }}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            가입신청이 완료되었습니다
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            담당자가 확인 후 빠른 시일 내에
            <br />
            연락드리겠습니다.
          </p>
          <a
            href={homeUrl}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="min-h-screen"
        style={{ fontFamily: 'Pretendard, sans-serif' }}
      >
        {/* ════════════════════════════════════════════ */}
        {/* PAGE 1: 기업상조 가입신청서                      */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-white">
          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-16">
            {/* 타이틀 */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-3">
                <p
                  className="text-sm font-medium"
                  style={{ color: BRAND_COLOR }}
                >
                  예담라이프(주)
                </p>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-2 sm:mb-3 leading-tight">
                후불제 기업상조 가입신청서
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div
                  className="h-px w-12"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
                <p className="text-sm text-gray-500">
                  가입비 및 매월 납입금 없는 기업 상조
                </p>
                <div
                  className="h-px w-12"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
              </div>
            </div>

            {/* 신청 폼 카드 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 sm:px-6 py-3 sm:py-4 flex items-center gap-2 rounded-t-2xl bg-gray-200">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                <span className="text-gray-800 font-medium text-xs sm:text-sm tracking-wide">
                  가입 정보 입력
                </span>
              </div>

              <div className="p-5 sm:p-8 space-y-6">
                {/* 신청인 / 휴대폰 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#4a5a2b] mb-2">
                      신청인 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="이름"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4a5a2b] mb-2">
                      휴대폰 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="-를 제외한 숫자만 입력해주세요"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* 주소 */}
                <div>
                  <label className="block text-sm font-semibold text-[#4a5a2b] mb-2">
                    주소
                  </label>
                  <button
                    type="button"
                    onClick={openAddressSearch}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 hover:bg-gray-100 transition-all mb-3 flex items-center justify-between cursor-pointer text-left"
                    style={{ minHeight: 'auto' }}
                  >
                    <span
                      className={
                        formData.address ? 'text-gray-900' : 'text-gray-400'
                      }
                    >
                      {formData.address || '주소 검색'}
                    </span>
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>
                  <input
                    type="text"
                    placeholder="상세주소를 입력해주세요"
                    value={formData.addressDetail}
                    onChange={(e) =>
                      updateField('addressDetail', e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* 구분선 */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs font-medium text-gray-400">
                    기업 정보
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* 기업명 / 직급 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#4a5a2b] mb-2">
                      기업명
                    </label>
                    <input
                      type="text"
                      placeholder="기업명을 입력해주세요"
                      value={formData.companyName}
                      onChange={(e) =>
                        updateField('companyName', e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4a5a2b] mb-2">
                      직급
                    </label>
                    <input
                      type="text"
                      placeholder="직급을 입력해주세요"
                      value={formData.position}
                      onChange={(e) => updateField('position', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* 구분선 */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs font-medium text-gray-400">
                    가입 상품 선택
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* 가입상품 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    가입상품 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {productOptions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => updateField('product', p.id)}
                        className="relative flex items-center gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer"
                        style={{
                          backgroundColor:
                            formData.product === p.id
                              ? BRAND_COLOR_LIGHT
                              : '#f9fafb',
                          borderColor:
                            formData.product === p.id ? BRAND_COLOR : '#e5e7eb',
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                          style={{
                            borderColor:
                              formData.product === p.id
                                ? BRAND_COLOR
                                : '#d1d5db',
                          }}
                        >
                          {formData.product === p.id && (
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: BRAND_COLOR }}
                            />
                          )}
                        </div>
                        <div>
                          <p
                            className="text-sm font-bold"
                            style={{
                              color:
                                formData.product === p.id
                                  ? BRAND_COLOR
                                  : '#374151',
                            }}
                          >
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            <span className="line-through mr-1">
                              {p.originalPrice}
                            </span>
                            <span
                              className="font-semibold"
                              style={{ color: BRAND_COLOR }}
                            >
                              {p.discountPrice}
                            </span>
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 추천인 */}
                <div>
                  <label className="block text-sm font-semibold text-[#4a5a2b] mb-2">
                    추천인
                  </label>
                  <input
                    type="text"
                    placeholder="추천인을 입력해주세요"
                    value={formData.referrer}
                    onChange={(e) => updateField('referrer', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 기업상조 가입 시 지원 혜택 */}
            <div className="mt-8 rounded-2xl p-6 sm:p-8 border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 shrink-0 text-rose-700" />
                <h3 className="font-bold text-gray-900">
                  기업상조 가입 시 지원 혜택
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
                  업무 협약시 – 예담 기업1호(30만원 공제), 기업2호(40만원 공제)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
                  조사용품(200인분) 1BOX 제공 (15만원 상당)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
                  고급 근조 3단화환 제공 (10만원 상당)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
                  입관 시 관 꽃장식 제공 (20만원 상당)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
                  앰뷸런스 관내 이송서비스 (10만원 상당)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
                  협력 장례식장 및 장지 할인 혜택 제공
                </li>
              </ul>
            </div>

            {/* 회사 정보 */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-400 mb-1">
                  후불제 상조기업 예담라이프장례비용 알아보기
                </p>
                <p className="text-lg font-extrabold text-gray-900">
                  전국 365일 24시간 긴급출동
                </p>
              </div>
              <a
                href={CONTACT_TEL_HREF}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white bg-gray-800 hover:bg-gray-900 transition-colors"
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
                  예담라이프 후불제상조는 가입비 및 매월 납입금이 없습니다.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
                <p className="text-sm text-gray-600">
                  장례 발생 시 기업상조 담당자에게 연락을 주시면 신속하게
                  장례서비스를 이용하실 수 있습니다.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
                <p className="text-sm text-gray-600">
                  신청인 외 가족 및 친인척 분들도 이용 가능합니다.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
                <p className="text-sm text-gray-600">
                  장례 진행 시 상품변경 가능합니다.
                </p>
              </div>
            </div>

            {/* 가입일 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                가입일자 :{' '}
                <span className="font-semibold text-gray-700">
                  {formattedDate}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* PAGE 2: 사전가입 시 제공서비스                  */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-white">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="text-center mb-12">
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ color: BRAND_COLOR }}
              >
                Pre-registration Benefits
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
                사전가입 시 제공서비스
              </h2>
              <div
                className="w-12 h-1 rounded-full mx-auto"
                style={{ backgroundColor: BRAND_COLOR }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-16">
              {serviceBenefits.map((service, idx) => (
                <div
                  key={service.title}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="h-32 sm:h-40 overflow-hidden">
                    <img
                      src={`https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/before-service-${String(idx + 1).padStart(2, '0')}.png`}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                      {service.title}
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
                      {service.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
                예담라이프 멤버십 서비스
              </h3>
              <p className="text-sm text-gray-400">
                가입 회원 전용 컨설팅 서비스
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
              {membershipConsulting.map((item, idx) => (
                <div
                  key={item.title}
                  className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 px-5 sm:px-6 py-4 ${
                    idx !== membershipConsulting.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2 sm:min-w-[200px]">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: BRAND_COLOR }}
                    />
                    <span className="text-sm font-bold text-gray-900">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 pl-3.5 sm:pl-0">
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl p-6 bg-gray-100">
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-500">
                  후불제 상조기업 예담라이프(주)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-gray-700">
                  전국 365일 24시간 긴급출동
                </span>
                <a
                  href={CONTACT_TEL_HREF}
                  className="flex items-center gap-1.5 font-extrabold text-lg text-gray-900"
                >
                  <Phone className="w-4 h-4" />
                  {CONTACT_PHONE}
                </a>
              </div>
            </div>

            <p className="text-center text-[11px] text-gray-400 mt-4">
              ※ 후불제 상조기업 예담라이프(주)는 수익금 중 일부를 어려운
              이웃들에게 기부합니다.
            </p>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* PAGE 3: 개인정보 동의서                        */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-white" />

          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                개인정보
              </h2>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                이용·제공·활용 동의서
              </h2>
            </div>

            <p className="text-sm text-gray-500 text-center leading-relaxed mb-8 max-w-md mx-auto">
              예담라이프는 귀하의 소중한 개인정보를 수집하고자 하는 경우에
              「개인정보 보호법」에 따라 본인의 동의를 얻고 있습니다.
            </p>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div
                className="px-6 py-4 border-b border-gray-100"
                style={{ backgroundColor: '#fafaf8' }}
              >
                <h3 className="text-sm font-bold text-gray-900">
                  개인정보제공에 관한 동의사항
                </h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  수집된 개인정보가 향후 이용, 제공, 활용이 될 경우에는 아래와
                  같이 필요한 사항을 알리겠습니다.
                </p>
                <ol className="space-y-2.5 text-sm text-gray-600 pl-1">
                  {[
                    '개인정보를 제공받는 자',
                    '개인정보를 제공받는 자의 이용 목적',
                    '제공하는 개인정보의 항목',
                    '개인정보를 제공받은 자의 개인정보 보유 및 이용기간',
                    '동의 거부 권리 사실 및 불이익 내용',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                        style={{
                          backgroundColor: BRAND_COLOR_LIGHT,
                          color: BRAND_COLOR,
                        }}
                      >
                        {idx + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-6 space-y-4 px-2">
              <p className="text-sm text-gray-500 leading-relaxed">
                – 본 개인정보 취급방침은 불가피한 경우 변경될 수 있으며, 변경
                시에는 변경 전 공지사항을 통해 고지합니다.
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                – 변경사항의 효력은 7일 간의 고지기간이 지난 후에 발생함을
                알려드립니다.
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                – 「개인정보 보호법」 등 관련 법규에의거하여 본인의 개인정보를
                이용·제공·활용하는 것에 동의합니다.
              </p>
            </div>

            {/* 동의 체크 */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
              <button
                type="button"
                onClick={() => setPrivacyAgreed(!privacyAgreed)}
                className="flex items-center gap-3 cursor-pointer w-full text-left"
              >
                <div
                  className="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all"
                  style={{
                    backgroundColor: privacyAgreed ? BRAND_COLOR : 'white',
                    borderColor: privacyAgreed ? BRAND_COLOR : '#d1d5db',
                  }}
                >
                  {privacyAgreed && (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  개인정보 이용·제공·활용에 동의합니다.
                </span>
              </button>

              <div className="mt-5 flex items-center justify-end gap-3">
                <span className="text-sm text-gray-500">고객명 :</span>
                <div className="w-40 border-b border-gray-300 pb-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {formData.name || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* 주소 검색 팝업 */}
      <div
        className="fixed inset-0 z-200 flex items-center justify-center bg-black/40"
        style={{ display: showPostcode ? 'flex' : 'none' }}
        onClick={() => setShowPostcode(false)}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col"
          style={{ height: '500px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-3 flex items-center justify-between border-b border-gray-200 shrink-0">
            <span className="font-bold text-sm text-gray-800">주소 검색</span>
            <button
              onClick={() => setShowPostcode(false)}
              className="p-1 hover:bg-black/5 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div ref={postcodeRef} className="flex-1" />
        </div>
      </div>

      {/* 하단 고정 전화 상담 / 가입 신청 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:pb-4 pointer-events-none safe-area-bottom">
        <div className="mx-auto max-w-2xl sm:px-6 flex sm:rounded-xl overflow-hidden sm:shadow-xl">
          <a
            href={CONTACT_TEL_HREF}
            className="pointer-events-auto flex-1 h-14 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold text-base transition-colors"
          >
            <Phone className="w-5 h-5 shrink-0" />
            <span className="leading-none">전화 상담</span>
          </a>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="pointer-events-auto flex-1 h-14 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-bold text-base disabled:opacity-60 cursor-pointer transition-colors"
          >
            <FileText className="w-5 h-5 shrink-0" />
            <span className="leading-none">
              {submitting ? '신청 중...' : '가입 신청'}
            </span>
          </button>
        </div>
      </div>
      <div className="h-16" />
    </>
  );
}
