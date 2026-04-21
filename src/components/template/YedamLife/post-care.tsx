'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Phone,
  ScrollText,
  Heart,
  Scale,
  Calculator,
  FileText,
  CheckCircle2,
  X,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { BRAND_COLOR, BRAND_COLOR_LIGHT } from './constants';
import {
  CountUp,
  FaqItem,
  CtaSection,
  MembershipSection,
  ReviewCarousel,
  ReviewItem,
} from './components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SUPABASE_BASE =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife';

// ── 시/도 & 시/군/구 데이터 ──
const REGIONS: Record<string, string[]> = {
  서울: [
    '전체',
    '강남구',
    '강동구',
    '강북구',
    '강서구',
    '관악구',
    '광진구',
    '구로구',
    '금천구',
    '노원구',
    '도봉구',
    '동대문구',
    '동작구',
    '마포구',
    '서대문구',
    '서초구',
    '성동구',
    '성북구',
    '송파구',
    '양천구',
    '영등포구',
    '용산구',
    '은평구',
    '종로구',
    '중구',
    '중랑구',
  ],
  경기: [
    '전체',
    '수원시',
    '성남시',
    '용인시',
    '고양시',
    '안양시',
    '부천시',
    '광명시',
    '평택시',
    '과천시',
    '오산시',
    '시흥시',
    '군포시',
    '의왕시',
    '하남시',
    '이천시',
    '안성시',
    '김포시',
    '화성시',
    '광주시',
    '양주시',
    '포천시',
    '여주시',
    '연천군',
    '가평군',
    '양평군',
    '동두천시',
    '구리시',
    '남양주시',
    '파주시',
    '의정부시',
  ],
  인천: [
    '전체',
    '중구',
    '동구',
    '미추홀구',
    '연수구',
    '남동구',
    '부평구',
    '계양구',
    '서구',
    '강화군',
    '옹진군',
  ],
  부산: [
    '전체',
    '중구',
    '서구',
    '동구',
    '영도구',
    '부산진구',
    '동래구',
    '남구',
    '북구',
    '해운대구',
    '사하구',
    '금정구',
    '강서구',
    '연제구',
    '수영구',
    '사상구',
    '기장군',
  ],
  대구: [
    '전체',
    '중구',
    '동구',
    '서구',
    '남구',
    '북구',
    '수성구',
    '달서구',
    '달성군',
  ],
  광주: ['전체', '동구', '서구', '남구', '북구', '광산구'],
  대전: ['전체', '동구', '중구', '서구', '유성구', '대덕구'],
  울산: ['전체', '중구', '남구', '동구', '북구', '울주군'],
  세종: ['전체'],
  강원: [
    '전체',
    '춘천시',
    '원주시',
    '강릉시',
    '동해시',
    '태백시',
    '속초시',
    '삼척시',
    '홍천군',
    '횡성군',
    '영월군',
    '평창군',
    '정선군',
    '철원군',
    '화천군',
    '양구군',
    '인제군',
    '고성군',
    '양양군',
  ],
  충북: [
    '전체',
    '청주시',
    '충주시',
    '제천시',
    '보은군',
    '옥천군',
    '영동군',
    '증평군',
    '진천군',
    '괴산군',
    '음성군',
    '단양군',
  ],
  충남: [
    '전체',
    '천안시',
    '공주시',
    '보령시',
    '아산시',
    '서산시',
    '논산시',
    '계룡시',
    '당진시',
    '금산군',
    '부여군',
    '서천군',
    '청양군',
    '홍성군',
    '예산군',
    '태안군',
  ],
  전북: [
    '전체',
    '전주시',
    '군산시',
    '익산시',
    '정읍시',
    '남원시',
    '김제시',
    '완주군',
    '진안군',
    '무주군',
    '장수군',
    '임실군',
    '순창군',
    '고창군',
    '부안군',
  ],
  전남: [
    '전체',
    '목포시',
    '여수시',
    '순천시',
    '나주시',
    '광양시',
    '담양군',
    '곡성군',
    '구례군',
    '고흥군',
    '보성군',
    '화순군',
    '장흥군',
    '강진군',
    '해남군',
    '영암군',
    '무안군',
    '함평군',
    '영광군',
    '장성군',
    '완도군',
    '진도군',
    '신안군',
  ],
  경북: [
    '전체',
    '포항시',
    '경주시',
    '김천시',
    '안동시',
    '구미시',
    '영주시',
    '영천시',
    '상주시',
    '문경시',
    '경산시',
    '군위군',
    '의성군',
    '청송군',
    '영양군',
    '영덕군',
    '청도군',
    '고령군',
    '성주군',
    '칠곡군',
    '예천군',
    '봉화군',
    '울진군',
    '울릉군',
  ],
  경남: [
    '전체',
    '창원시',
    '진주시',
    '통영시',
    '사천시',
    '김해시',
    '밀양시',
    '거제시',
    '양산시',
    '의령군',
    '함안군',
    '창녕군',
    '고성군',
    '남해군',
    '하동군',
    '산청군',
    '함양군',
    '거창군',
    '합천군',
  ],
  제주: ['전체', '제주시', '서귀포시'],
};

// ── 원스톱 통합 서비스 (카드 전용, 상세 섹션 없음) ──
const onestopService = {
  id: 'onestop',
  icon: Layers,
  title: '원스톱 통합 서비스',
  subtitle: '심리 · 세무 · 상속 · 법률 한 번에',
  desc: '여러 곳을 방문할 필요 없이 예담 한 곳에서 사후행정 전반을 통합 관리해 드립니다.',
};

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
    region: '' as string,
    district: '' as string,
    serviceType: '' as string,
    message: '',
    agreeAll: false,
    agreePrivacy: false,
    agreeThirdParty: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!form.name.trim() || !form.phone.trim() || !form.serviceType) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/post-care/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          region: form.region || undefined,
          district: form.district || undefined,
          service_type: form.serviceType,
          message: form.message || undefined,
          privacy_agreed: form.agreePrivacy,
          third_party_agreed: form.agreeThirdParty,
        }),
      });

      if (!res.ok) {
        throw new Error('API error');
      }

      toast.success(
        '상담 신청이 완료되었습니다.\n담당자가 빠르게 연락 드리겠습니다.',
      );
      onClose();
    } catch {
      toast.error('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
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
                placeholder="-를 제외한 숫자만 입력해주세요"
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
              희망 지역 선택
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={form.region}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, region: v, district: '' }))
                }
              >
                <SelectTrigger className="h-auto px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white cursor-pointer">
                  <SelectValue placeholder="시/도" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-200 max-h-60">
                  {Object.keys(REGIONS).map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={form.district}
                onValueChange={(v) => setForm((p) => ({ ...p, district: v }))}
                disabled={!form.region}
              >
                <SelectTrigger className="h-auto px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white cursor-pointer">
                  <SelectValue placeholder="시/구/군" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-200 max-h-60">
                  {(REGIONS[form.region] ?? []).map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        </div>

        <div className="px-6 py-4 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 rounded-xl text-white font-bold text-base cursor-pointer hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            {submitting ? '신청 중...' : '상담 신청하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──
export function PostCare() {
  const [showConsultation, setShowConsultation] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    fetch('/api/v1/reviews?category=postcare&limit=6')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setReviews(json.data);
      })
      .catch(() => {});
  }, []);

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {/* 원스톱 통합 서비스 카드 */}
            {(() => {
              const Icon = onestopService.icon;
              return (
                <button
                  key={onestopService.id}
                  onClick={() => setShowConsultation(true)}
                  className="relative flex flex-col items-center justify-between text-center px-6 py-8 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all cursor-pointer h-full"
                >
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                  >
                    <Icon
                      className="w-8 h-8 sm:w-10 sm:h-10"
                      style={{ color: BRAND_COLOR }}
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">
                    {onestopService.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-3">
                    {onestopService.subtitle}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {onestopService.desc}
                  </p>
                  <span className="inline-flex items-center justify-center gap-1 w-full text-xs sm:text-sm font-semibold bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    자세히 보기 <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })()}

            {/* 개별 서비스 카드 */}
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
                  className="relative flex flex-col items-center justify-between text-center px-6 py-8 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all cursor-pointer h-full"
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
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {service.desc}
                  </p>
                  <span className="inline-flex items-center justify-center gap-1 w-full text-xs sm:text-sm font-semibold bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    자세히 보기 <ArrowRight className="w-3.5 h-3.5" />
                  </span>
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

      {/* ══════════════ 고객 후기 ══════════════ */}
      {reviews.length > 0 && (
        <section
          id="sec-postcare-reviews"
          className="py-16 sm:py-24 overflow-hidden"
          style={{ backgroundColor: '#fafaf8' }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: BRAND_COLOR }}
              >
                REVIEW
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                고객 후기
              </h2>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                예담라이프 사후행정케어를 이용하신 분들의 생생한 후기입니다
              </p>
            </div>
            <ReviewCarousel reviews={reviews} />
          </div>
        </section>
      )}

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

      {/* ── 모바일 하단 고정 바 (sm 미만) ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#222] safe-area-bottom">
        <div className="flex items-center divide-x divide-white/20">
          <a
            href="tel:1660-0959"
            className="flex-1 flex items-center justify-center gap-2 py-4.5 text-white cursor-pointer"
          >
            <Phone className="w-5 h-5" />
            <span className="text-base font-bold">전화 상담</span>
          </a>
          <button
            onClick={() => setShowConsultation(true)}
            className="flex-1 flex items-center justify-center gap-2 py-4.5 text-white cursor-pointer"
          >
            <ScrollText className="w-5 h-5" />
            <span className="text-base font-bold">상담 신청</span>
          </button>
        </div>
      </div>
      {/* 모바일 하단 고정 바 높이만큼 여백 */}
      <div className="sm:hidden h-16" />
    </>
  );
}
