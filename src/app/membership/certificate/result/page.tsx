'use client';
import { CONTACT_PHONE, CONTACT_TEL_HREF } from '@/constants/contact';

import { Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Phone,
  Shield,
  Award,
  Share2,
  CreditCard,
  Check,
  ChevronRight,
  Crown,
  X,
  Search,
} from 'lucide-react';
import {
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
} from '@/components/template/YedamLife/constants';

const SUPABASE_BASE =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife';

const VIP_BENEFITS = [
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
  {
    title: '장례운구의전 지원 컨설팅',
    desc: '장례 운구지원 전문 상담',
  },
];

export default function CertificateResultPage() {
  return (
    <Suspense>
      <CertificateResultContent />
    </Suspense>
  );
}

function CertificateResultContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || '';
  const phone = searchParams.get('phone') || '';
  const homeUrl = searchParams.get('from') || '/';
  const [showShareToast, setShowShareToast] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardForm, setCardForm] = useState({
    name: '',
    phone: '',
    zonecode: '',
    address: '',
    detailAddress: '',
  });
  const [cardSubmitted, setCardSubmitted] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // 카카오 주소검색 스크립트 로드
  useEffect(() => {
    if (document.getElementById('daum-postcode-script')) return;
    const script = document.createElement('script');
    script.id = 'daum-postcode-script';
    script.src =
      '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const openPostcode = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const daum = (window as any).daum;
    if (!daum?.Postcode) return;
    new daum.Postcode({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      oncomplete(data: any) {
        setCardForm((p) => ({
          ...p,
          zonecode: data.zonecode,
          address: data.roadAddress || data.jibunAddress,
        }));
      },
    }).open();
  };

  const [cardSubmitting, setCardSubmitting] = useState(false);
  const handleCardSubmit = async () => {
    if (!cardForm.name || !cardForm.phone || !cardForm.address) return;
    if (cardSubmitting) return;
    setCardSubmitting(true);
    try {
      const res = await fetch('/api/v1/membership/card-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_no: memberNo,
          name: cardForm.name,
          phone: cardForm.phone,
          zonecode: cardForm.zonecode,
          address: cardForm.address,
          detail_address: cardForm.detailAddress,
        }),
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.message || '신청에 실패했습니다.');
      setCardSubmitted(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : '신청에 실패했습니다.');
    } finally {
      setCardSubmitting(false);
    }
  };

  const [memberNo, setMemberNo] = useState<string>('');
  const [lookupLoading, setLookupLoading] = useState(true);
  const [lookupError, setLookupError] = useState(false);

  useEffect(() => {
    if (!name || !phone) return;
    const params = new URLSearchParams({ name, phone });
    fetch(`/api/v1/membership/lookup?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.membership_no) {
          setMemberNo(json.data.membership_no);
        } else {
          setLookupError(true);
        }
      })
      .catch(() => setLookupError(true))
      .finally(() => setLookupLoading(false));
  }, [name, phone]);
  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`;
  const formattedPhone = phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');

  const handleShare = async () => {
    const shareData = {
      title: '예담라이프 가입증서',
      text: `${name}님의 예담라이프 후불제 상조 가입증서입니다.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      }
    } catch {
      /* user cancelled */
    }
  };

  if (!name || !phone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-center space-y-4 px-4">
          <p className="text-gray-500">잘못된 접근입니다.</p>
          <a
            href="/membership/certificate"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            가입증서 조회로 이동
          </a>
        </div>
      </div>
    );
  }

  if (lookupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <p className="text-gray-500 text-sm">
          가입 정보를 확인하고 있습니다...
        </p>
      </div>
    );
  }

  if (lookupError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-center space-y-4 px-4">
          <p className="text-gray-700 font-semibold">
            가입 내역을 찾을 수 없습니다.
          </p>
          <p className="text-gray-500 text-sm">
            입력하신 이름과 연락처로 가입된 회원이 없습니다.
          </p>
          <a
            href="/membership/certificate"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            가입증서 조회로 이동
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        html, body { scrollbar-width: none; -ms-overflow-style: none; overflow-x: clip; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out both; }
        .animate-delay-1 { animation-delay: 0.15s; }
        .animate-delay-2 { animation-delay: 0.3s; }
        .animate-delay-3 { animation-delay: 0.45s; }
        .animate-delay-4 { animation-delay: 0.6s; }
        .gold-shimmer {
          background: linear-gradient(90deg, #c5a55a 0%, #f0d98c 40%, #c5a55a 60%, #f0d98c 100%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* 공유 토스트 */}
      {showShareToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-xl animate-fade-in-up">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            링크가 복사되었습니다
          </div>
        </div>
      )}

      <div
        className="min-h-screen"
        style={{ fontFamily: 'Pretendard, sans-serif' }}
      >
        {/* ── 배경 ── */}
        <div className="fixed inset-0 -z-10 bg-white" />

        <div className="relative max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* ── 1. 회원증 (Certificate) ── */}
          <div className="animate-fade-in-up" ref={certificateRef}>
            <div className="relative rounded-3xl overflow-hidden shadow-xl bg-white border border-gray-200">
              <div className="px-6 sm:px-10 pt-8 pb-10">
                {/* 회원번호 & 인증 */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[10px] text-gray-400 tracking-wider mb-0.5">
                      MEMBER NO.
                    </p>
                    <p
                      className="text-sm font-bold tracking-widest text-gray-900"
                      suppressHydrationWarning
                    >
                      {memberNo}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-gray-700" />
                    <span className="text-[10px] font-semibold tracking-wider text-gray-700">
                      VERIFIED
                    </span>
                  </div>
                </div>

                {/* 타이틀 */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-px w-10 bg-gradient-to-r from-transparent to-gray-300" />
                    <Award className="w-5 h-5 text-gray-700" />
                    <div className="h-px w-10 bg-gradient-to-r from-gray-300 to-transparent" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 text-gray-900">
                    회원증
                  </h1>
                  <p className="text-xs tracking-[0.2em] text-gray-500">
                    CERTIFICATE OF MEMBERSHIP
                  </p>
                </div>

                {/* 회원 정보 */}
                <div className="rounded-2xl p-5 sm:p-6 mb-6 bg-gray-50 border border-gray-100">
                  <div className="space-y-0">
                    <div className="flex items-center py-3.5 border-b border-gray-200">
                      <span className="text-xs font-semibold w-20 shrink-0 tracking-wider text-gray-500">
                        회원성명
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {name}
                      </span>
                    </div>
                    <div className="flex items-center py-3.5 border-b border-gray-200">
                      <span className="text-xs font-semibold w-20 shrink-0 tracking-wider text-gray-500">
                        연락처
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formattedPhone}
                      </span>
                    </div>
                    <div className="flex items-center py-3.5">
                      <span className="text-xs font-semibold w-20 shrink-0 tracking-wider text-gray-500">
                        가입일
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 증명 문구 */}
                <p className="text-center text-sm text-gray-600 leading-relaxed">
                  귀하는 후불제 상조기업{' '}
                  <span className="font-bold text-gray-900">예담라이프</span>의
                  <br />
                  회원임을 증명합니다.
                </p>
              </div>
            </div>
          </div>

          {/* ── 2. VIP 멤버십 카드 ── */}
          <div className="mt-8 animate-fade-in-up animate-delay-1">
            <div className="rounded-3xl overflow-hidden shadow-xl bg-white">
              {/* 카드 이미지 영역 */}
              <div className="relative aspect-[1.6/1] rounded-t-3xl overflow-hidden">
                <img
                  src={`${SUPABASE_BASE}/member_card_bg.png`}
                  alt="VIP Membership Card"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* 회원번호 & 이름 오버레이 */}
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <p
                      className="text-white/80 text-xs sm:text-sm tracking-widest font-medium"
                      suppressHydrationWarning
                    >
                      No. {memberNo}
                    </p>
                    <p className="text-white/90 text-sm sm:text-base font-bold">
                      {name}
                    </p>
                  </div>
                </div>
              </div>

              {/* VIP 혜택 */}
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-4 h-4" style={{ color: '#c5a55a' }} />
                  <h2 className="text-base font-extrabold text-gray-900">
                    VIP 멤버십 회원께 드리는 혜택
                  </h2>
                </div>
                <p className="text-xs text-gray-400 mb-5">
                  예담라이프 제휴된 장례 관련서비스에 할인 혜택을 드립니다.
                </p>

                <div className="space-y-0">
                  {VIP_BENEFITS.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 py-3.5 border-b border-gray-100 last:border-0"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                      >
                        <Check
                          className="w-3 h-3"
                          style={{ color: BRAND_COLOR }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {b.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 자세히보기 */}
                <div className="mt-5 flex justify-center">
                  <a
                    href={homeUrl}
                    className="inline-flex items-center gap-1 text-sm font-semibold px-6 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    자세히보기
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. 안내 사항 ── */}
          <div className="mt-6 animate-fade-in-up animate-delay-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div
                  className="w-1 h-1 rounded-full mt-2 shrink-0"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
                <p className="text-xs text-gray-500 leading-relaxed">
                  장례 발생 시 유가족분들께서 예담라이프에 연락을 주시면 바로
                  상담하여 장례 진행해드립니다.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div
                  className="w-1 h-1 rounded-full mt-2 shrink-0"
                  style={{ backgroundColor: BRAND_COLOR }}
                />
                <p className="text-xs text-gray-500 leading-relaxed">
                  신청인 외 가족 친인척 분들도 이용 가능하며 장례 진행 시
                  상품변경 가능합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 하단 고정 버튼 영역 확보용 여백 */}
          <div className="h-20" />
        </div>

        {/* ── 5. 하단 고정 액션 버튼 ── */}
        <div className="fixed bottom-0 left-0 right-0 z-50 sm:pb-4 pointer-events-none safe-area-bottom">
          <div className="mx-auto max-w-2xl sm:px-6 flex sm:rounded-xl overflow-hidden sm:shadow-xl">
            <button
              type="button"
              onClick={handleShare}
              className="pointer-events-auto flex-1 h-14 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold text-base cursor-pointer transition-colors"
            >
              <Share2 className="w-5 h-5 shrink-0" />
              <span className="leading-none">공유하기</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCardForm((p) => ({
                  ...p,
                  name: name,
                  phone: formattedPhone,
                }));
                setCardSubmitted(false);
                setShowCardModal(true);
              }}
              className="pointer-events-auto flex-1 h-14 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-bold text-base cursor-pointer transition-colors"
            >
              <CreditCard className="w-5 h-5 shrink-0" />
              <span className="leading-none">실물카드 수령</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 실물카드수령 모달 ── */}
      {showCardModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCardModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">실물카드 수령 신청</h3>
              <button
                onClick={() => setShowCardModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {cardSubmitted ? (
              <div className="px-6 py-12 text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                >
                  <Check className="w-7 h-7" style={{ color: BRAND_COLOR }} />
                </div>
                <p className="text-lg font-bold text-gray-900 mb-1">
                  신청이 완료되었습니다
                </p>
                <p className="text-sm text-gray-500">
                  입력하신 주소로 실물카드가 발송됩니다.
                </p>
                <button
                  onClick={() => setShowCardModal(false)}
                  className="mt-6 px-8 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  확인
                </button>
              </div>
            ) : (
              <div className="px-6 py-5 space-y-4">
                {/* 성함 / 연락처 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      성함
                    </label>
                    <input
                      type="text"
                      value={cardForm.name}
                      onChange={(e) =>
                        setCardForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      연락처
                    </label>
                    <input
                      type="tel"
                      value={cardForm.phone}
                      onChange={(e) =>
                        setCardForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/20"
                    />
                  </div>
                </div>

                {/* 주소 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    주소
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={cardForm.zonecode}
                      readOnly
                      placeholder="우편번호"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 cursor-default"
                    />
                    <button
                      onClick={openPostcode}
                      className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      주소검색
                    </button>
                  </div>
                  <input
                    type="text"
                    value={cardForm.address}
                    readOnly
                    placeholder="주소를 검색해주세요"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 mb-2 cursor-default"
                  />
                  <input
                    type="text"
                    value={cardForm.detailAddress}
                    onChange={(e) =>
                      setCardForm((p) => ({
                        ...p,
                        detailAddress: e.target.value,
                      }))
                    }
                    placeholder="상세주소 입력"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/20"
                  />
                </div>

                {/* 제출 */}
                <button
                  onClick={handleCardSubmit}
                  disabled={
                    !cardForm.name ||
                    !cardForm.phone ||
                    !cardForm.address ||
                    cardSubmitting
                  }
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  {cardSubmitting ? '신청 중...' : '실물카드수령 신청'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
