'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { Gift, Phone, CheckCircle2, FileText, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
  BRAND_COLOR_PREMIUM,
} from '@/components/template/YedamLife/constants';

// ── 상품 옵션 ──
const productOptions = [
  {
    id: 'yedam-1',
    name: '예담1호 무빈소',
    price: '150만원',
    discount: '130만원',
  },
  { id: 'yedam-2', name: '예담2호', price: '250만원', discount: '230만원' },
  { id: 'yedam-3', name: '예담3호', price: '360만원', discount: '340만원' },
  { id: 'yedam-4', name: '예담4호', price: '480만원', discount: '460만원' },
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

// ── 종교 옵션 ──
const religionOptions = ['무교', '기독교', '천주교', '불교', '원불교', '기타'];

export default function MembershipGeneralPage() {
  return (
    <Suspense>
      <MembershipGeneralPageContent />
    </Suspense>
  );
}

function MembershipGeneralPageContent() {
  const searchParams = useSearchParams();
  const homeUrl = searchParams.get('from') || '/';
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: '',
    gender: '남',
    religion: '무교',
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    address: '',
    addressDetail: '',
    product: '',
    referrer: '',
  });
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`;

  const openAddressSearch = () => {
    const daum = (window as unknown as Record<string, unknown>).daum as
      | {
          Postcode: new (opts: {
            oncomplete: (data: {
              address: string;
              buildingName: string;
            }) => void;
          }) => { open: () => void };
        }
      | undefined;
    if (!daum?.Postcode) return;
    new daum.Postcode({
      oncomplete: (data) => {
        const addr = data.buildingName
          ? `${data.address} (${data.buildingName})`
          : data.address;
        updateField('address', addr);
      },
    }).open();
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.product) {
      alert('필수 항목을 입력해주세요. (회원명, 연락처, 가입상품)');
      return;
    }
    if (!privacyAgreed) {
      alert('개인정보 이용·제공·활용 동의가 필요합니다.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/general-funeral/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          birth_date: formData.birthDate,
          gender: formData.gender,
          religion: formData.religion,
          guardian_name: formData.guardianName,
          guardian_relation: formData.guardianRelation,
          guardian_phone: formData.guardianPhone,
          address: formData.address,
          address_detail: formData.addressDetail,
          product: formData.product,
          referrer: formData.referrer,
          privacy_agreed: privacyAgreed,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        alert(result.message || '오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch {
      alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#faf8f5] to-white px-4">
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
          overflow-x: hidden;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="min-h-screen"
        style={{ fontFamily: 'Pretendard, sans-serif' }}
      >
        {/* ════════════════════════════════════════════ */}
        {/* PAGE 1: 가입신청서                           */}
        {/* ════════════════════════════════════════════ */}
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

          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-3 sm:pt-6 pb-12 sm:pb-16">
            {/* 헤더 로고 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <img
                  src="https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/main_logo.png"
                  alt="예담라이프"
                  className="h-[120px] sm:h-[150px] w-auto object-contain"
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium text-[#4a5a2b]"
                  style={{ backgroundColor: BRAND_COLOR_LIGHT }}
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
                후불제상조 가입신청서
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div
                  className="h-px w-12"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
                <p className="text-sm text-gray-500">
                  월 납입금 없이 가입하는 후불제 상조
                </p>
                <div
                  className="h-px w-12"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
              </div>
            </div>

            {/* 신청 폼 카드 */}
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

              <div className="p-5 sm:p-8 space-y-6">
                {/* 회원명 / 연락처 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#4a5a2b] mb-2">
                      회원명 <span className="text-red-500">*</span>
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
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="-를 제외한 숫자만 입력해주세요"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* 생년월일 / 성별 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#4a5a2b] mb-2">
                      생년월일
                    </label>
                    <input
                      type="text"
                      placeholder="6자리 숫자로 입력"
                      value={formData.birthDate}
                      onChange={(e) => updateField('birthDate', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4a5a2b] mb-2">
                      성별
                    </label>
                    <div className="flex gap-3 mt-1">
                      {['남', '여'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => updateField('gender', g)}
                          className="flex-1 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer"
                          style={{
                            backgroundColor:
                              formData.gender === g
                                ? BRAND_COLOR_LIGHT
                                : '#f9fafb',
                            color:
                              formData.gender === g ? BRAND_COLOR : '#6b7280',
                            borderColor:
                              formData.gender === g ? BRAND_COLOR : '#e5e7eb',
                          }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 종교 */}
                <div>
                  <label className="block text-sm font-semibold text-[#4a5a2b] mb-2">
                    종교
                  </label>
                  <Select
                    value={formData.religion}
                    onValueChange={(v) => updateField('religion', v)}
                  >
                    <SelectTrigger className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm cursor-pointer">
                      <SelectValue placeholder="종교 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {religionOptions.map((r) => (
                        <SelectItem
                          key={r}
                          value={r}
                          className="cursor-pointer"
                        >
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 구분선 */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs font-medium text-gray-400">
                    보호자/가족 정보
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* 보호자 */}
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-[#4a5a2b] mb-2">
                        보호자 성명
                      </label>
                      <input
                        type="text"
                        placeholder="이름"
                        value={formData.guardianName}
                        onChange={(e) =>
                          updateField('guardianName', e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#4a5a2b] mb-2">
                        관계
                      </label>
                      <input
                        type="text"
                        placeholder="ex)배우자"
                        value={formData.guardianRelation}
                        onChange={(e) =>
                          updateField('guardianRelation', e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4a5a2b] mb-2">
                      보호자 연락처
                    </label>
                    <input
                      type="tel"
                      placeholder="-를 제외한 숫자만 입력해주세요"
                      value={formData.guardianPhone}
                      onChange={(e) =>
                        updateField('guardianPhone', e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white"
                  />
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
                            <span className="line-through">{p.price}</span>
                            {' → '}
                            <span
                              className="font-semibold"
                              style={{ color: BRAND_COLOR }}
                            >
                              {p.discount}
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 사전가입 혜택 안내 */}
            <div
              className="mt-8 rounded-2xl p-6 sm:p-8 border"
              style={{
                backgroundColor: BRAND_COLOR_LIGHT,
                borderColor: `${BRAND_COLOR}20`,
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Gift
                  className="w-5 h-5 shrink-0"
                  style={{ color: BRAND_COLOR }}
                />
                <h3 className="font-bold text-gray-900">
                  사전가입 시{' '}
                  <span style={{ color: BRAND_COLOR }}>80만원 상당</span>의 특별
                  혜택!
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: BRAND_COLOR }}
                  />
                  상조상품 20만원 즉시할인 (예담1호/예담2호/예담3호/예담4호
                  해당)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: BRAND_COLOR }}
                  />
                  조사용품(200인분) 1Box 또는 고급 근조3단화환 제공
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: BRAND_COLOR }}
                  />
                  VIP 멤버십 패키지 증정 (예담라이프 10만원 상품권 포함)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: BRAND_COLOR }}
                  />
                  입관 시 관 꽃장식 제공 (20만원 상당)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: BRAND_COLOR }}
                  />
                  앰뷸런스 관내 이송서비스
                </li>
              </ul>
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
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: BRAND_COLOR }}
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

            {/* 가입일 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                가입일 :{' '}
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

            <div
              className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl p-6"
              style={{ backgroundColor: BRAND_COLOR_LIGHT }}
            >
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-500">
                  후불제 상조기업 예담라이프(주)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="text-xs font-semibold"
                  style={{ color: BRAND_COLOR }}
                >
                  전국 365일 24시간 긴급출동
                </span>
                <a
                  href="tel:1660-0959"
                  className="flex items-center gap-1.5 font-extrabold text-lg"
                  style={{ color: BRAND_COLOR }}
                >
                  <Phone className="w-4 h-4" />
                  1660-0959
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
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-[#faf8f5]" />

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

            {/* 제출 버튼 */}
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-12 py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                <FileText className="w-5 h-5" />
                {submitting ? '신청 중...' : '가입증서 신청'}
              </button>
              <p className="text-xs text-gray-400 mt-4">
                신청 후 담당자가 확인하여 연락드립니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
