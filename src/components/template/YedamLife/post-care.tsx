'use client';

import { useState } from 'react';
import {
  Phone,
  ScrollText,
  Heart,
  Scale,
  Calculator,
  FileText,
  CheckCircle2,
  X,
} from 'lucide-react';
import { BRAND_COLOR, BRAND_COLOR_LIGHT } from './constants';
import { CountUp, FaqItem, CtaSection, MembershipSection } from './components';
import { Checkbox } from '@/components/ui/checkbox';

const SUPABASE_BASE =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife';

// ── 서비스 데이터 ──
const services = [
  {
    id: 'counseling',
    icon: Heart,
    title: '심리 상담',
    subtitle: '사별 슬픔 상담 · 애도 케어 · 가족 심리 지원',
    desc: '사별 후 겪는 슬픔과 상실감을 전문 심리상담사가 함께합니다. 유족 개인 및 가족 단위의 심리 안정을 돕는 맞춤형 상담을 제공합니다.',
    details: [
      '사별 슬픔(애도) 전문 상담',
      '유족 심리 안정 프로그램',
      '가족 관계 회복 상담',
      '아동·청소년 애도 상담',
      '일상 복귀 심리 지원',
    ],
    process: [
      {
        step: '01',
        title: '초기 상담',
        desc: '유족 심리 상태 파악 및 상담 계획 수립',
      },
      {
        step: '02',
        title: '맞춤 프로그램',
        desc: '개인·가족별 심리 케어 프로그램 설계',
      },
      {
        step: '03',
        title: '정기 상담',
        desc: '전문 심리상담사와 정기 상담 진행',
      },
      {
        step: '04',
        title: '경과 확인',
        desc: '심리 회복 경과 점검 및 프로그램 조정',
      },
      {
        step: '05',
        title: '일상 복귀',
        desc: '안정적 일상 복귀 지원 및 후속 관리',
      },
    ],
  },
  {
    id: 'tax',
    icon: Calculator,
    title: '세무 상담',
    subtitle: '상속세 · 증여세 · 종합소득세',
    desc: '사망 후 발생하는 상속세 신고, 증여세 정리, 종합소득세 정산 등 복잡한 세무 문제를 전문 세무사가 체계적으로 상담해 드립니다.',
    details: [
      '상속세 신고 및 납부 대행',
      '증여세 사전·사후 정리',
      '피상속인 종합소득세 준확정 신고',
      '부동산·금융자산 세무 평가',
      '절세 전략 수립 및 자문',
    ],
    process: [
      {
        step: '01',
        title: '초기 상담',
        desc: '유족 상황 파악 및 필요 서비스 확인',
      },
      {
        step: '02',
        title: '자산 조사',
        desc: '상속 재산 및 채무 현황 종합 조사',
      },
      { step: '03', title: '세액 산출', desc: '상속세·증여세 예상 세액 산출' },
      { step: '04', title: '신고 대행', desc: '세무 신고서 작성 및 제출 대행' },
      {
        step: '05',
        title: '사후 관리',
        desc: '세무조사 대응 및 추가 상담 지원',
      },
    ],
  },
  {
    id: 'inheritance',
    icon: FileText,
    title: '상속 절차',
    subtitle: '재산 분할 · 명의 이전 · 채무 정리',
    desc: '상속 재산의 분할 협의부터 부동산·금융 자산 명의 이전, 채무 정리까지 상속 절차 전반을 원스톱으로 지원합니다.',
    details: [
      '상속인 조사 및 상속 관계 확인',
      '상속 재산·채무 목록 작성',
      '상속 분할 협의서 작성 지원',
      '부동산 소유권 이전 등기 대행',
      '금융 자산(예금, 보험, 주식) 명의 변경',
      '상속 포기·한정승인 절차 안내',
    ],
    process: [
      { step: '01', title: '상담 접수', desc: '유족 상황 및 상속 관계 파악' },
      {
        step: '02',
        title: '재산 조회',
        desc: '안심상속 원스톱 서비스 활용 재산 조회',
      },
      { step: '03', title: '분할 협의', desc: '상속인 간 재산 분할 협의 지원' },
      {
        step: '04',
        title: '명의 이전',
        desc: '부동산·금융자산 명의 변경 대행',
      },
      {
        step: '05',
        title: '완료 확인',
        desc: '모든 절차 완료 확인 및 서류 전달',
      },
    ],
  },
  {
    id: 'legal',
    icon: Scale,
    title: '법률 지원',
    subtitle: '상속 분쟁 · 유언 검인 · 한정승인',
    desc: '상속 분쟁 조정, 유언장 검인, 한정승인·상속포기 등 법률적 판단이 필요한 사안에 전문 변호사가 대응합니다.',
    details: [
      '상속 분쟁 조정 및 소송 대리',
      '유언장 검인 신청 절차 대행',
      '한정승인·상속포기 심판 청구',
      '유류분 반환 청구 상담',
      '특별 기여분 인정 청구',
      '상속 관련 법률 자문 전반',
    ],
    process: [
      {
        step: '01',
        title: '법률 상담',
        desc: '분쟁 상황 파악 및 법적 쟁점 분석',
      },
      { step: '02', title: '전략 수립', desc: '최적의 법적 대응 전략 수립' },
      {
        step: '03',
        title: '서류 준비',
        desc: '필요 서류 작성 및 증거자료 확보',
      },
      {
        step: '04',
        title: '절차 진행',
        desc: '소송·심판·조정 등 법적 절차 수행',
      },
      { step: '05', title: '결과 안내', desc: '결과 확인 및 후속 조치 안내' },
    ],
  },
];

// ── 상담 모달 ──
function PostCareConsultationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    serviceType: '' as string,
    message: '',
    agreeAll: false,
    agreePrivacy: false,
    agreeThirdParty: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.serviceType ||
      !form.agreePrivacy ||
      !form.agreeThirdParty
    ) {
      return;
    }
    alert('상담 신청이 완료되었습니다.\n담당자가 빠르게 연락 드리겠습니다.');
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between bg-gray-100 rounded-t-2xl shrink-0">
          <span className="font-bold text-gray-800">
            사후행정케어 상담 신청
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/5 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                성함 <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 ${submitted && !form.name.trim() ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="이름을 입력하세요"
              />
              {submitted && !form.name.trim() && (
                <p className="text-xs text-red-500 mt-1">
                  이름을 입력해주세요.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 ${submitted && !form.phone.trim() ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="010-0000-0000"
              />
              {submitted && !form.phone.trim() && (
                <p className="text-xs text-red-500 mt-1">
                  연락처를 입력해주세요.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">
              상담 유형 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {['심리 상담', '세무 상담', '상속 절차', '법률 지원'].map(
                (type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setForm((p) => ({ ...p, serviceType: type }))
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                      form.serviceType === type
                        ? 'font-bold'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                    style={
                      form.serviceType === type
                        ? {
                            backgroundColor: BRAND_COLOR_LIGHT,
                            borderColor: BRAND_COLOR,
                            color: BRAND_COLOR,
                          }
                        : undefined
                    }
                  >
                    {type}
                  </button>
                ),
              )}
            </div>
            {submitted && !form.serviceType && (
              <p className="text-xs text-red-500 mt-1">
                상담 유형을 선택해주세요.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">
              상담 내용
            </label>
            <textarea
              value={form.message}
              onChange={(e) =>
                setForm((p) => ({ ...p, message: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
              rows={3}
              placeholder="상담이 필요한 내용을 간략히 적어주세요."
            />
          </div>
          {submitted && (!form.agreePrivacy || !form.agreeThirdParty) && (
            <p className="text-xs text-red-500 mt-1">
              필수 약관에 동의해주세요.
            </p>
          )}
        </div>

        <div className="px-6 py-4 shrink-0">
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl text-white font-bold text-base cursor-pointer hover:opacity-90 transition-all"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            상담 신청하기
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──
export function PostCare() {
  const [showConsultation, setShowConsultation] = useState(false);

  return (
    <>
      {/* ══════════════ 히어로 섹션 ══════════════ */}
      <section className="overflow-hidden">
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80)`,
            }}
          />
          <div className="absolute inset-0 bg-black/65" />
          <div className="relative z-10 py-24 sm:py-32 lg:py-40 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto text-center">
              <span
                className="inline-block px-5 py-2 mb-5 rounded-full text-sm sm:text-base font-semibold tracking-wide text-white border border-white/30"
                style={{ background: 'transparent' }}
              >
                사별 후 행정, 전문가에게 맡기세요
              </span>
              <h1
                className="text-[28px] sm:text-[40px] lg:text-[48px] font-medium text-white leading-tight mb-6"
                style={{
                  textShadow: '0 3px 12px rgba(0,0,0,0.8)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                복잡한 사후 행정 절차
                <br />
                예담이 함께합니다
              </h1>
              <p
                className="text-gray-300 text-sm sm:text-base font-medium leading-relaxed max-w-lg mx-auto mb-8"
                style={{
                  textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                세무 · 상속 · 법률
                <br />
                전문가가 유족의 부담을 덜어드립니다.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setShowConsultation(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-gray-900 text-base font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
                >
                  <ScrollText className="w-5 h-5" />
                  무료 상담 신청
                </button>
                <a
                  href="tel:1660-0959"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-white/70 text-white text-base font-bold rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  전화 상담
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 바 */}
        <div className="bg-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* 모바일: 상단 전문 인력 풀와이드 + 하단 2열 */}
            <div className="flex flex-col gap-5 sm:hidden">
              <div className="text-center">
                <p className="text-base font-extrabold text-gray-900">
                  심리상담사 · 세무사
                  <br />
                  법무사 · 변호사
                </p>
                <p className="text-xs text-gray-500 font-medium mt-1.5">
                  전문 인력 보유
                </p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-200">
                <div className="text-center px-3">
                  <CountUp
                    end={98}
                    suffix="%"
                    className="text-2xl font-extrabold text-gray-900"
                    duration={2000}
                  />
                  <p className="text-xs text-gray-500 font-medium mt-1.5">
                    상담 만족도
                  </p>
                </div>
                <div className="text-center px-3">
                  <CountUp
                    end={3141}
                    suffix="건+"
                    className="text-2xl font-extrabold text-gray-900"
                    duration={2000}
                  />
                  <p className="text-xs text-gray-500 font-medium mt-1.5">
                    누적 상담
                  </p>
                </div>
              </div>
            </div>
            {/* PC: 3열 */}
            <div className="hidden sm:grid grid-cols-3 divide-x divide-gray-200">
              <div className="text-center px-4">
                <p className="text-lg font-extrabold text-gray-900">
                  심리상담사 · 세무사 · 법무사 · 변호사
                </p>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  전문 인력
                </p>
              </div>
              <div className="text-center px-4">
                <CountUp
                  end={98}
                  suffix="%"
                  className="text-2xl font-extrabold text-gray-900"
                  duration={2000}
                />
                <p className="text-sm text-gray-500 font-medium mt-1">
                  상담 만족도
                </p>
              </div>
              <div className="text-center px-4">
                <CountUp
                  end={3141}
                  suffix="건+"
                  className="text-2xl font-extrabold text-gray-900"
                  duration={2000}
                />
                <p className="text-sm text-gray-500 font-medium mt-1">
                  누적 상담
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 서비스 안내 카드 ══════════════ */}
      <section className="py-16 sm:py-24 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 sm:mb-20">
            <h2
              className="text-2xl sm:text-[36px] font-bold text-gray-900 mb-4 leading-snug"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              사후행정케어 서비스
            </h2>
            <p
              className="text-gray-600 text-sm sm:text-base leading-relaxed"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              사별 후 복잡한 행정 절차, 각 분야 전문가가 도와드립니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {services.map((service) => {
              const Icon = service.icon;
              const colorMap: Record<string, { bg: string; icon: string }> = {
                counseling: { bg: '#fce4ec', icon: '#c0526e' },
                tax: { bg: '#e8f0fe', icon: '#4a7fb5' },
                inheritance: { bg: '#fef3e2', icon: '#c4873a' },
                legal: { bg: '#f0e8f5', icon: '#7c5ca3' },
              };
              const colors = colorMap[service.id];
              return (
                <button
                  key={service.id}
                  onClick={() =>
                    document
                      .getElementById(`sec-postcare-${service.id}`)
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="relative flex flex-col items-center text-center px-6 py-8 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <Icon
                      className="w-8 h-8 sm:w-10 sm:h-10"
                      style={{ color: colors.icon }}
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-3">
                    {service.subtitle}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {service.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════ 서비스 상세 섹션 (01~03 전부 표시) ══════════════ */}
      {services.map((service, idx) => {
        const num = String(idx + 1).padStart(2, '0');
        const sectionBg = idx % 2 === 0 ? '#fafaf8' : '#ffffff';

        return (
          <section
            key={service.id}
            id={`sec-postcare-${service.id}`}
            className="py-16 sm:py-24 overflow-hidden"
            style={{ backgroundColor: sectionBg }}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              {/* 넘버링 */}
              <div className="text-center mb-6">
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold"
                  style={{
                    backgroundColor: BRAND_COLOR_LIGHT,
                    color: BRAND_COLOR,
                  }}
                >
                  {num}
                </span>
              </div>

              {/* 타이틀 */}
              <h2
                className="text-2xl sm:text-[32px] font-extrabold text-gray-900 text-center mb-3"
                style={{ fontFamily: 'Pretendard, sans-serif' }}
              >
                {service.title}
              </h2>
              <p className="text-center text-gray-500 text-sm sm:text-base mb-4">
                {service.subtitle}
              </p>

              {/* 설명 */}
              <p className="text-center text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-12 sm:mb-16">
                {service.desc}
              </p>

              {/* 상세 내용 */}
              <div className="mb-16 sm:mb-20 max-w-2xl mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center mb-6 sm:mb-8">
                  주요 서비스 내용
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.details.map((detail) => (
                    <div
                      key={detail}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-100"
                    >
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-gray-700" />
                      <span className="text-sm text-gray-800">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 진행 절차 */}
              <h3
                className="text-lg sm:text-xl font-bold text-gray-900 mb-8 sm:mb-10 text-center"
                style={{ fontFamily: 'Pretendard, sans-serif' }}
              >
                진행 절차
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-12 sm:mb-14">
                {service.process.map((step) => (
                  <div
                    key={step.step}
                    className="relative flex flex-col items-center text-center bg-white rounded-2xl px-3 py-5 sm:px-4 sm:py-6 border border-gray-200"
                  >
                    <span className="absolute -top-3 -left-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-300 text-xs sm:text-sm font-bold text-gray-900 flex items-center justify-center">
                      {step.step}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-2 mt-2">
                      {step.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* 상담 CTA */}
              <div className="text-center">
                <button
                  onClick={() => setShowConsultation(true)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-white font-bold rounded-xl cursor-pointer hover:opacity-90 transition-all"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  <ScrollText className="w-5 h-5" />
                  {service.title} 무료 상담 신청
                </button>
              </div>
            </div>
          </section>
        );
      })}

      {/* ══════════════ 왜 예담인가 ══════════════ */}
      <section
        className="py-16 sm:py-24 overflow-hidden"
        style={{ backgroundColor: '#fafaf8' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              왜 예담 사후행정케어인가요?
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              유족의 부담을 최소화하는 원스톱 전문가 서비스
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: '각 분야 전문가 직접 상담',
                desc: '세무사, 법무사, 변호사 등 각 분야 전문 자격을 갖춘 전문가가 직접 상담하고 업무를 처리합니다.',
                icon: '👨‍⚖️',
              },
              {
                title: '원스톱 통합 서비스',
                desc: '세무·상속·법률 문제를 한 곳에서 해결할 수 있어 여러 곳을 방문할 필요가 없습니다.',
                icon: '🏢',
              },
              {
                title: '합리적인 비용',
                desc: '초기 상담 무료, 이후 서비스도 합리적인 비용으로 제공하여 유족의 경제적 부담을 줄여드립니다.',
                icon: '💰',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 rounded-2xl p-6 sm:p-8 text-center"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 멤버십 제휴할인 ══════════════ */}
      <MembershipSection background="bg-white" />

      {/* ══════════════ CTA 하단 ══════════════ */}
      <CtaSection
        overlayOpacity={65}
        title={
          <>
            사별 후 행정 절차
            <br />
            혼자 고민하지 마세요
          </>
        }
        description={
          <>
            세무 · 상속 · 법률, 전문가가 처음부터 끝까지 함께합니다.
            <br />
            지금 무료 상담을 신청하세요.
          </>
        }
        buttons={
          <>
            <button
              onClick={() => setShowConsultation(true)}
              className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-gray-900 text-base font-bold rounded-xl cursor-pointer transition-all hover:bg-gray-100 shadow-lg"
            >
              <ScrollText className="w-5 h-5" />
              무료 상담 신청
            </button>
            <a
              href="tel:1660-0959"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-white/70 text-white text-base font-bold rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Phone className="w-5 h-5" />
              전화 상담
            </a>
          </>
        }
      />

      {/* 상담 모달 */}
      <PostCareConsultationModal
        open={showConsultation}
        onClose={() => setShowConsultation(false)}
      />

      {/* ── PC 우측 플로팅 버튼 (sm 이상) ── */}
      <div className="hidden sm:flex fixed right-4 bottom-6 z-50 flex-col gap-2">
        <button
          onClick={() => setShowConsultation(true)}
          className="flex flex-col items-center justify-center w-[52px] h-[52px] rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          style={{
            backgroundColor: BRAND_COLOR_LIGHT,
            color: BRAND_COLOR,
          }}
        >
          <ScrollText className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">상담 신청</span>
        </button>
        <a
          href="tel:1660-0959"
          className="flex flex-col items-center justify-center w-[52px] h-[52px] rounded-xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <Phone className="w-5 h-5 text-gray-700" />
          <span className="text-[9px] font-bold text-gray-600 mt-0.5 leading-tight text-center">
            빠른
            <br />
            상담 신청
          </span>
        </a>
      </div>

      {/* ── 모바일 플로팅 버튼 (sm 미만) ── */}
      <div className="sm:hidden fixed right-3 bottom-5 z-50 flex flex-col items-end gap-2">
        <button
          onClick={() => setShowConsultation(true)}
          className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full shadow-lg cursor-pointer"
          style={{
            backgroundColor: BRAND_COLOR_LIGHT,
            color: BRAND_COLOR,
          }}
        >
          <span className="text-[10px] font-bold">상담 신청</span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
          >
            <ScrollText className="w-4 h-4" />
          </div>
        </button>
        <a
          href="tel:1660-0959"
          className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full bg-white shadow-lg border border-gray-200 cursor-pointer"
        >
          <span className="text-[10px] font-bold text-gray-700">
            빠른 상담 신청
          </span>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Phone className="w-4 h-4 text-gray-700" />
          </div>
        </a>
      </div>
    </>
  );
}
