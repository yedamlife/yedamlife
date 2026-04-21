'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Phone, MapPin, X, ScrollText, Loader2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  CountUp,
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
import { BRAND_COLOR, BRAND_COLOR_LIGHT } from './constants';

const SUPABASE_BASE =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife';

// ── 장지 타입 ──
type BurialType = '봉안당' | '수목장' | '공원묘지' | '해양장';

const BurialIcon = ({
  type,
  className = 'w-10 h-10',
  color = BRAND_COLOR,
}: {
  type: BurialType;
  className?: string;
  color?: string;
}) => {
  const icons: Record<BurialType, React.ReactNode> = {
    봉안당: (
      <svg viewBox="0 0 48 48" fill="none" className={className}>
        <path
          d="M14 36h20M16 36V22M32 36V22"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M12 22h24l-12-10L12 22z"
          stroke={color}
          strokeWidth="2.2"
          strokeLinejoin="round"
          fill="none"
        />
        <rect
          x="20"
          y="26"
          width="8"
          height="10"
          rx="1"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
        <circle cx="24" cy="18" r="1.5" fill={color} />
      </svg>
    ),
    수목장: (
      <svg viewBox="0 0 48 48" fill="none" className={className}>
        <path
          d="M24 38V24"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M24 10c-6 0-11 4-11 10 0 5 4 9 11 9s11-4 11-9c0-6-5-10-11-10z"
          stroke={color}
          strokeWidth="2.2"
          fill="none"
        />
        <path
          d="M18 22c2-2 4-3 6-3s4 1 6 3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M20 17c1.5-1 2.5-1.5 4-1.5s2.5.5 4 1.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
    공원묘지: (
      <svg viewBox="0 0 48 48" fill="none" className={className}>
        <path
          d="M16 38h16"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <rect
          x="19"
          y="18"
          width="10"
          height="20"
          rx="5"
          stroke={color}
          strokeWidth="2.2"
          fill="none"
        />
        <path
          d="M22 24h4M24 22v4"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M14 38c0-2 2-4 4-5M34 38c0-2-2-4-4-5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
    해양장: (
      <svg viewBox="0 0 48 48" fill="none" className={className}>
        <path
          d="M8 28c4-3 8-3 12 0s8 3 12 0s8 3 12 0"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M10 33c4-3 8-3 12 0s8 3 12 0"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <circle
          cx="24"
          cy="16"
          r="4"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M20 16l4 4 4-4"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  };
  return <>{icons[type]}</>;
};

const burialTypes: {
  type: BurialType;
  label: string;
  desc: string;
}[] = [
  {
    type: '봉안당',
    label: '봉안당',
    desc: '유골을 봉안함에 안치하는 실내형 추모 공간',
  },
  {
    type: '수목장',
    label: '수목장',
    desc: '나무 아래 자연으로 돌아가는 친환경 장법',
  },
  {
    type: '공원묘지',
    label: '공원묘지',
    desc: '잔디와 조경이 어우러진 전통적 안식 공간',
  },
  {
    type: '해양장',
    label: '해양장',
    desc: '바다에 유골을 산포하는 자연 회귀형 장법',
  },
];

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

// ── 후기 ──
// ── 장지 상품 데이터 (API) ──
interface BurialProductRow {
  id: number;
  company_name: string;
  sido_name: string | null;
  full_address: string | null;
  categories: string[];
  photos: Array<{ fileurl_full?: string | null }> | null;
  thumbnail_url: string | null;
  min_price: number | null;
  is_recommended: boolean;
}

// ── 종교 목록 ──
const RELIGIONS = ['해당 없음', '기독교', '천주교', '불교', '원불교', '기타'];

// ── 상담 신청 모달 ──
export function BurialConsultationModal({
  open,
  onClose,
  productId,
  productName,
}: {
  open: boolean;
  onClose: () => void;
  productId?: number | null;
  productName?: string | null;
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    religion: '',
    region: '',
    district: '',
    budget: '',
    message: '',
    agreeAll: false,
    agreePrivacy: false,
    agreeThirdParty: false,
  });
  const [showThirdParty, setShowThirdParty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        name: '',
        phone: '',
        religion: '',
        region: '',
        district: '',
        budget: '',
        message: '',
        agreeAll: false,
        agreePrivacy: false,
        agreeThirdParty: false,
      });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const handleSubmit = async () => {
    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.religion ||
      !form.region
    ) {
      toast.warning('필수 항목을 모두 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/burial-plus/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          religion: form.religion,
          region: form.region,
          district: form.district || null,
          budget: form.budget || null,
          message: form.message || null,
          product_id: productId || null,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(
          '상담 신청이 완료되었습니다.\n담당자가 빠르게 연락드리겠습니다.',
        );
        onClose();
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

  if (!open) return null;

  const inputClass =
    'w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 transition-all bg-white placeholder:text-gray-400';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-6 py-5 shrink-0 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">상담 신청</h2>
              <p className="text-sm text-gray-500 mt-1">
                소중한 분의 마지막 안식처를 위해 전문 상담을 무료로 제공해
                드립니다.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* 선택 장지 */}
          {productName && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                선택 장지
              </label>
              <div className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-700">
                {productName}
              </div>
            </div>
          )}
          {/* 이름 & 연락처 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="이름은 입력해 주세요."
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="-를 제외한 숫자만 입력해주세요"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* 종교 & 희망 지역 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                종교 <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.religion}
                onValueChange={(v) => setForm((p) => ({ ...p, religion: v }))}
              >
                <SelectTrigger className="h-auto px-4 py-3 rounded-lg border-gray-200 bg-white text-sm">
                  <SelectValue placeholder="해당 없음" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {RELIGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                희망 지역 선택 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={form.region}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, region: v, district: '' }))
                  }
                >
                  <SelectTrigger className="h-auto px-4 py-3 rounded-lg border-gray-200 bg-white text-sm">
                    <SelectValue placeholder="시/도" />
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
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
                  <SelectTrigger className="h-auto px-4 py-3 rounded-lg border-gray-200 bg-white text-sm">
                    <SelectValue placeholder="시/구/군" />
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    {(REGIONS[form.region] ?? []).map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 예산 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              예산
            </label>
            <Select
              value={form.budget}
              onValueChange={(v) => setForm((p) => ({ ...p, budget: v }))}
            >
              <SelectTrigger className="h-auto px-4 py-3 rounded-lg border-gray-200 bg-white text-sm">
                <SelectValue placeholder="예산을 선택해 주세요" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                {[
                  '100~300만원',
                  '300~500만원',
                  '500~700만원',
                  '700~1,000만원',
                  '1,000만원 이상',
                ].map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 메세지 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              전달하실 메세지가 있으신가요??
            </label>
            <textarea
              placeholder="메세지를 작성해 주세요."
              value={form.message}
              onChange={(e) =>
                setForm((p) => ({ ...p, message: e.target.value }))
              }
              rows={4}
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="px-6 py-4 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 rounded-xl text-white font-bold text-base cursor-pointer hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            {submitting ? '신청 중...' : '신청하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──
export function BurialPlus({ googleFormUrl }: { googleFormUrl: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initializedRef = useRef(false);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const [selectedType, setSelectedType] = useState<BurialType | '전체'>(
    '봉안당',
  );
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showConsultation, setShowConsultation] = useState(false);

  const [products, setProducts] = useState<BurialProductRow[]>([]);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    fetch('/api/v1/reviews?category=burial&limit=6')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setReviews(json.data);
      })
      .catch(() => {});
  }, []);

  // URL 쿼리 파라미터에서 초기값 복원
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const qType = searchParams.get('category');
    const qRegion = searchParams.get('sido');
    const qDistrict = searchParams.get('sigungu');

    if (
      qType &&
      ['봉안당', '수목장', '공원묘지', '해양장', '전체'].includes(qType)
    ) {
      setSelectedType(qType as BurialType | '전체');
    }
    if (qRegion) setSelectedRegion(qRegion);
    if (qDistrict) setSelectedDistrict(qDistrict);

    // hash가 있으면 해당 섹션으로 스크롤, 없으면 쿼리 파라미터가 있으면 상품 섹션으로
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else if (qType || qRegion || qDistrict) {
      setTimeout(() => {
        document
          .getElementById('sec-burial-products')
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [searchParams]);

  // 필터 변경 시 URL 쿼리 파라미터 동기화 — 이벤트 핸들러에서 직접 호출
  const syncFilterUrl = useCallback(
    (type: BurialType | '전체', region: string, district: string) => {
      if (!initializedRef.current) return;
      const params = new URLSearchParams();
      if (type !== '봉안당') params.set('category', type);
      if (region && region !== 'all-regions') params.set('sido', region);
      if (district && district !== '전체') params.set('sigungu', district);
      const qs = params.toString();
      const url = qs ? `${pathnameRef.current}?${qs}` : pathnameRef.current;
      router.replace(url, { scroll: false });
    },
    [router],
  );

  const buildApiQuery = useCallback(
    (nextCursor: string | null) => {
      const params = new URLSearchParams({ limit: '10' });
      if (nextCursor) params.set('cursor', nextCursor);
      if (selectedType !== '전체') params.set('category', selectedType);
      if (selectedRegion && selectedRegion !== 'all-regions')
        params.set('sido', selectedRegion);
      if (selectedDistrict && selectedDistrict !== '전체')
        params.set('sigungu', selectedDistrict);
      return params.toString();
    },
    [selectedType, selectedRegion, selectedDistrict],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    setShowResults(false);
    setProducts([]);
    setCursor(null);
    setHasMore(false);

    (async () => {
      const fetchStart = Date.now();
      try {
        const res = await fetch(
          `/api/v1/burial-plus/products?${buildApiQuery(null)}`,
        );
        const json = await res.json();
        if (cancelled) return;

        // AI 검색 연출: 최소 2초 대기
        const elapsed = Date.now() - fetchStart;
        const remaining = Math.max(2000 - elapsed, 0);
        await new Promise((r) => setTimeout(r, remaining));
        if (cancelled) return;

        if (json.success) {
          setProducts(json.data);
          setCursor(json.next_cursor);
          setHasMore(json.has_more);
          setTotal(json.total ?? 0);
        }
      } catch {
        if (!cancelled) toast.error('상품 목록을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) {
          setLoading(false);
          // 카드가 fade-in 되도록 약간의 딜레이
          setTimeout(() => {
            if (!cancelled) setShowResults(true);
          }, 50);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [buildApiQuery]);

  const loadMore = async () => {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/v1/burial-plus/products?${buildApiQuery(cursor)}`,
      );
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => [...prev, ...json.data]);
        setCursor(json.next_cursor);
        setHasMore(json.has_more);
      }
    } catch {
      toast.error('추가 목록을 불러오지 못했습니다.');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      {/* ══════════════ 히어로 섹션 ══════════════ */}
      <section id="sec-burial-hero" className="overflow-hidden">
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${SUPABASE_BASE}/burial/hero.jpg)`,
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 py-24 sm:py-32 lg:py-40 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto text-center">
              <span
                className="inline-block px-5 py-2 mb-5 rounded-full text-sm sm:text-base font-semibold tracking-wide text-white border border-white/30"
                style={{
                  background: 'transparent',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                소중한 분을 위한 마지막 공간
              </span>
              <h1
                className="text-[28px] sm:text-[40px] lg:text-[48px] font-medium text-white leading-tight mb-6"
                style={{
                  textShadow: '0 3px 12px rgba(0,0,0,0.8)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                가장 편안한 안식처를
                <br />
                찾아드립니다
              </h1>
              <p
                className="text-white text-sm sm:text-base font-semibold leading-relaxed max-w-lg mx-auto"
                style={{
                  textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                전국 봉안당 · 수목장 · 공원묘지
                <br />
                가족에게 맞는 최적의 장지를 안내합니다.
              </p>
              <div
                className="flex flex-wrap items-center justify-center gap-3 mt-8"
                style={{ fontFamily: 'Pretendard, sans-serif' }}
              >
                <button
                  onClick={() => setShowConsultation(true)}
                  className="relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl transition-colors shadow-lg cursor-pointer hover:opacity-90 overflow-hidden text-gray-900"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <span
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                      animation: 'shimmer 2.5s ease-in-out infinite',
                      width: '60%',
                    }}
                  />
                  <ScrollText className="relative w-5 h-5" />
                  <span className="relative">상담 신청</span>
                </button>
                <a
                  href="tel:1660-0959"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  전화 상담
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── 통계 바 ── */}
        <div className="bg-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6 grid grid-cols-2 sm:grid-cols-4 gap-y-4 divide-x-0 sm:divide-x divide-gray-200">
            {[
              { label: '상담 가능 장지', value: 100, suffix: '+ 곳' },
              { label: '상담 신청 건수', value: 28050, suffix: '건' },
              { label: '계약 체결 건수', value: 25342, suffix: '건' },
              { label: '고객 만족도', value: 98, suffix: '%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-2">
                <CountUp
                  end={stat.value}
                  suffix={stat.suffix}
                  className="text-lg sm:text-2xl font-extrabold text-gray-900"
                  duration={2000}
                />
                <p className="text-[11px] sm:text-sm text-gray-500 font-medium mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 차별점 섹션 ══════════════ */}
      <section
        id="sec-burial-trust"
        className="py-20 sm:py-28 overflow-hidden bg-white"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* 헤더 */}
          <div className="text-center mb-14 sm:mb-20">
            <h2
              className="text-2xl sm:text-[36px] font-bold text-gray-900 mb-4 leading-snug"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              예담이 걸어온 길이 곧 신뢰입니다
            </h2>
            <p
              className="text-gray-500 text-sm sm:text-base leading-relaxed"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              수만 가족이 선택한 장지 전문 상담, 예담라이프입니다.
            </p>
          </div>

          {/* 스텝 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: '01',
                title: '가족 맞춤 장지 상담',
                desc: '예담의 상담은 단순히 장지 정보나 가격을 나열하는 것이 아닙니다. 가족의 상황과 고인의 뜻을 깊이 이해하고, 그에 맞는 최적의 장지를 추천해 드립니다.',
                image:
                  'https://images.unsplash.com/photo-1599418173975-f370302d0fa2?w=800&q=80',
              },
              {
                step: '02',
                title: '전문가 동행 현장 답사',
                desc: '예담에서는 가족들이 답사할 때 전문 상담사가 직접 동행하여 시설을 확인하는 서비스를 제공합니다. 풍부한 경험을 바탕으로 현실적인 조언을 드립니다.',
                image:
                  'https://images.unsplash.com/photo-1683531014354-3922aa2357e5?w=800&q=80',
              },
              {
                step: '03',
                title: '계약부터 사후 관리까지',
                desc: '상담이 종료된 후에도 계약에 필요한 상황과 절차를 함께합니다. 계약이 끝난 후에도 추모의 길이 이어지도록 늘 함께하겠습니다.',
                image:
                  'https://images.unsplash.com/photo-1621351568723-bb5809fe2bd0?w=800&q=80',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col">
                {/* 이미지 */}
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-6 bg-gray-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                {/* 텍스트 */}
                <p
                  className="text-gray-400 text-sm mb-2"
                  style={{ fontFamily: 'Pretendard, sans-serif' }}
                >
                  step {item.step}.
                </p>
                <div className="w-full h-px bg-gray-200 mb-4" />
                <h3
                  className="text-lg sm:text-xl font-semibold text-gray-900 mb-3"
                  style={{ fontFamily: 'Pretendard, sans-serif' }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-gray-500 text-sm leading-relaxed"
                  style={{ fontFamily: 'Pretendard, sans-serif' }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 장지 유형 카드 ══════════════ */}
      <section
        id="sec-burial-types"
        className="py-12 sm:py-16 overflow-hidden"
        style={{ backgroundColor: '#fafaf8' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              장지 유형 안내
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              원하시는 장지 유형을 선택하여 맞춤 상품을 확인하세요.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {burialTypes.map((bt) => {
              const isActive = selectedType === bt.type;
              return (
                <button
                  key={bt.type}
                  onClick={() => {
                    const next = isActive ? '전체' : bt.type;
                    setSelectedType(next);
                    syncFilterUrl(next, selectedRegion, selectedDistrict);
                  }}
                  className={`relative flex flex-col items-center text-center px-4 py-6 sm:py-8 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                  style={isActive ? { borderColor: BRAND_COLOR } : undefined}
                >
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-3 transition-colors"
                    style={{
                      backgroundColor: isActive ? BRAND_COLOR_LIGHT : '#f3f4f6',
                    }}
                  >
                    <BurialIcon
                      type={bt.type}
                      className="w-9 h-9 sm:w-11 sm:h-11"
                      color={isActive ? BRAND_COLOR : '#6b7280'}
                    />
                  </div>
                  <h3
                    className="text-sm sm:text-base font-bold mb-1.5 transition-colors"
                    style={{ color: isActive ? BRAND_COLOR : '#111827' }}
                  >
                    {bt.label}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">
                    {bt.desc}
                  </p>
                  <span
                    className="mt-3 w-full py-2 rounded-lg text-[11px] sm:text-xs font-medium text-gray-500 bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isActive) {
                        setSelectedType(bt.type);
                        syncFilterUrl(
                          bt.type,
                          selectedRegion,
                          selectedDistrict,
                        );
                      }
                      setTimeout(
                        () => {
                          document
                            .getElementById('sec-burial-products')
                            ?.scrollIntoView({ behavior: 'smooth' });
                        },
                        isActive ? 0 : 100,
                      );
                    }}
                  >
                    상품 상세 보기 &nbsp;→
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════ 상품 검색 & 리스트 ══════════════ */}
      <section
        id="sec-burial-products"
        className="py-16 sm:py-24 bg-white overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* 필터 바 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-row sm:gap-4">
              <Select
                value={selectedRegion}
                onValueChange={(v) => {
                  setSelectedRegion(v);
                  setSelectedDistrict('');
                  syncFilterUrl(selectedType, v, '');
                }}
              >
                <SelectTrigger className="h-auto px-3 py-3 rounded-xl border-gray-200 bg-white text-sm sm:w-48 sm:px-4">
                  <SelectValue placeholder="시/도" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="all-regions">전체</SelectItem>
                  {Object.keys(REGIONS).map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedDistrict}
                onValueChange={(v) => {
                  setSelectedDistrict(v);
                  syncFilterUrl(selectedType, selectedRegion, v);
                }}
                disabled={!selectedRegion || selectedRegion === 'all-regions'}
              >
                <SelectTrigger className="h-auto px-3 py-3 rounded-xl border-gray-200 bg-white text-sm sm:w-48 sm:px-4">
                  <SelectValue placeholder="시/군/구" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  {(REGIONS[selectedRegion] ?? []).map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedType === '전체' ? 'all-types' : selectedType}
                onValueChange={(v) => {
                  const next = v === 'all-types' ? '전체' : (v as BurialType);
                  setSelectedType(next);
                  syncFilterUrl(next, selectedRegion, selectedDistrict);
                }}
              >
                <SelectTrigger className="h-auto px-3 py-3 rounded-xl border-gray-200 bg-white text-sm sm:w-48 sm:px-4">
                  <SelectValue placeholder="봉안(납골)당" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="all-types">전체</SelectItem>
                  <SelectItem value="봉안당">봉안(납골)당</SelectItem>
                  <SelectItem value="수목장">수목장</SelectItem>
                  <SelectItem value="공원묘지">공원묘지</SelectItem>
                  <SelectItem value="해양장">해양장</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 총 개수 + 공유 */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              총{' '}
              <span className="font-bold" style={{ color: BRAND_COLOR }}>
                {total}
              </span>
              개
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('현재 검색 결과 링크가 복사되었습니다.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              공유
            </button>
          </div>

          {/* 상품 카드 그리드 */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative w-10 h-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: '#111827',
                    animation: 'smoothMorph 3s ease-in-out infinite',
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  AI 검색중
                </span>
                <span className="inline-flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-gray-400 animate-[aiDot_1.4s_ease-in-out_infinite]" />
                  <span className="w-1 h-1 rounded-full bg-gray-400 animate-[aiDot_1.4s_ease-in-out_0.2s_infinite]" />
                  <span className="w-1 h-1 rounded-full bg-gray-400 animate-[aiDot_1.4s_ease-in-out_0.4s_infinite]" />
                </span>
              </div>
              <style jsx>{`
                @keyframes smoothMorph {
                  0% {
                    transform: scale(1) rotate(0deg);
                    border-radius: 50%;
                  }
                  20% {
                    transform: scale(0.9) rotate(72deg);
                    border-radius: 35%;
                  }
                  40% {
                    transform: scale(1.1) rotate(144deg);
                    border-radius: 15%;
                  }
                  60% {
                    transform: scale(0.85) rotate(216deg);
                    border-radius: 8%;
                  }
                  80% {
                    transform: scale(1.05) rotate(288deg);
                    border-radius: 25%;
                  }
                  100% {
                    transform: scale(1) rotate(360deg);
                    border-radius: 50%;
                  }
                }
                @keyframes aiDot {
                  0%,
                  80%,
                  100% {
                    opacity: 0.3;
                    transform: scale(0.8);
                  }
                  40% {
                    opacity: 1;
                    transform: scale(1.2);
                  }
                }
              `}</style>
            </div>
          ) : products.length > 0 ? (
            <>
              <div
                className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 transition-all duration-500 ${
                  showResults
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
              >
                {products.map((product) => {
                  const thumb =
                    product.thumbnail_url || product.photos?.[0]?.fileurl_full;
                  return (
                    <Link
                      key={product.id}
                      href={`/burial-plus/products/${product.id}`}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={product.company_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            이미지 없음
                          </div>
                        )}
                        {product.is_recommended && (
                          <span
                            className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shadow-sm"
                            style={{
                              backgroundColor: '#ffffff',
                              color: BRAND_COLOR,
                            }}
                          >
                            추천
                          </span>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 truncate">
                          {product.company_name}
                        </h3>
                        <p className="text-xs text-gray-400 mb-2.5 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {product.sido_name ?? ''}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {product.categories.map((t) => (
                            <span
                              key={t}
                              className="inline-block px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium border"
                              style={{
                                color: BRAND_COLOR,
                                borderColor: BRAND_COLOR_LIGHT,
                                backgroundColor: BRAND_COLOR_LIGHT,
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loadingMore && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {loadingMore ? '불러오는 중...' : '더보기'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-sm">
                해당 조건에 맞는 장지가 없습니다.
                <br />
                다른 조건으로 검색해 보세요.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ 이용 안내 ══════════════ */}
      <section
        id="sec-burial-guide"
        className="py-20 sm:py-28 overflow-hidden"
        style={{ backgroundColor: '#fafaf8' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 sm:mb-20">
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              이용 안내
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              간편한 3단계로 최적의 장지를 찾아드립니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 items-stretch">
            {[
              {
                icon: (
                  <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14">
                    <rect
                      x="12"
                      y="8"
                      width="28"
                      height="36"
                      rx="4"
                      stroke="#8a7356"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <line
                      x1="18"
                      y1="18"
                      x2="34"
                      y2="18"
                      stroke="#8a7356"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <line
                      x1="18"
                      y1="24"
                      x2="30"
                      y2="24"
                      stroke="#8a7356"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <line
                      x1="18"
                      y1="30"
                      x2="32"
                      y2="30"
                      stroke="#8a7356"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="44"
                      cy="44"
                      r="12"
                      stroke="#8a7356"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <path
                      d="M40 44l3 3 6-6"
                      stroke="#8a7356"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                ),
                title: '장지 상담 신청',
                desc: '24시간 365일 무료 상담\n전문 상담사가 친절하게 안내드립니다.',
              },
              {
                icon: (
                  <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14">
                    <rect
                      x="12"
                      y="16"
                      width="40"
                      height="32"
                      rx="4"
                      stroke="#8a7356"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <path d="M12 28h40" stroke="#8a7356" strokeWidth="1.5" />
                    <circle cx="32" cy="22" r="2" fill="#e87c6a" />
                    <path
                      d="M20 36c4 6 12 8 24-2"
                      stroke="#6b9b5e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M28 34c2 4 8 5 12-1"
                      stroke="#8ab878"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                ),
                title: '현장 답사 및 무료 상담',
                desc: '전문 상담사가 직접 동행하여\n최적의 장지를 찾아드립니다.',
              },
              {
                icon: (
                  <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14">
                    <rect
                      x="16"
                      y="10"
                      width="32"
                      height="44"
                      rx="3"
                      stroke="#8a7356"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <line
                      x1="22"
                      y1="20"
                      x2="42"
                      y2="20"
                      stroke="#8a7356"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="22"
                      y1="26"
                      x2="38"
                      y2="26"
                      stroke="#8a7356"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="22"
                      y1="32"
                      x2="40"
                      y2="32"
                      stroke="#8a7356"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M28 40l3 3 7-7"
                      stroke="#e87c6a"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                ),
                title: '위치 결정 후 계약',
                desc: '간편한 계약 절차와 함께\n업계 최고 지원혜택을 제공합니다.',
              },
            ].map((item, idx) => (
              <div key={item.title} className="flex items-stretch">
                <div className="flex-1 h-full bg-white rounded-2xl p-8 sm:p-10 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-start">
                  <div className="flex justify-center mb-5">{item.icon}</div>
                  <h3 className="text-base sm:text-lg font-bold mb-3 text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                    {item.desc}
                  </p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:flex items-center justify-center w-10 shrink-0 self-center">
                    <span className="text-gray-300 text-2xl">&gt;</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 멤버십 제휴할인 ══════════════ */}
      <div id="sec-burial-membership">
        <MembershipSection background="bg-white" />
      </div>

      {/* ══════════════ 후기 섹션 ══════════════ */}
      {reviews.length > 0 && (
        <section
          id="sec-burial-reviews"
          className="py-16 sm:py-24 overflow-hidden bg-white"
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
                예담라이프 장지 서비스를 경험하신 분들의 생생한 후기입니다
              </p>
            </div>
            <ReviewCarousel reviews={reviews} />
          </div>
        </section>
      )}

      {/* ══════════════ CTA 섹션 ══════════════ */}
      <CtaSection
        overlayOpacity={60}
        backgroundUrl={`${SUPABASE_BASE}/burial/hero.jpg`}
        title={
          <>
            소중한 분의 마지막 안식처,
            <br />
            예담라이프가 함께합니다
          </>
        }
        description={
          <>
            전문 상담사가 최적의 장지를 안내해 드립니다.
            <br />
            부담 없이 무료 상담 받아보세요.
          </>
        }
        buttons={
          <>
            <button
              onClick={() => setShowConsultation(true)}
              className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-xl transition-colors shadow-lg cursor-pointer hover:bg-gray-100 overflow-hidden"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  animation: 'shimmer 2.5s ease-in-out infinite',
                  width: '60%',
                }}
              />
              <ScrollText className="relative w-5 h-5" />
              <span className="relative">상담 신청</span>
            </button>
            <a
              href="tel:1660-0959"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-colors cursor-pointer"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              <Phone className="w-5 h-5" />
              전화 상담
            </a>
          </>
        }
      />

      {/* 상담 신청 모달 */}
      <BurialConsultationModal
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
