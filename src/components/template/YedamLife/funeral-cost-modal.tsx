'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  X,
  ChevronLeft,
  Search,
  Building2,
  MapPin,
  Car,
  Check,
  ArrowRight,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BRAND_COLOR } from './constants';

/* ─── 타입 ─── */
interface Region {
  code: string;
  name: string;
}

interface FuneralHall {
  facility_cd: string;
  company_name: string;
  funeral_type: string;
  public_label: string;
  manage_class: string;
  mortuary_count: number;
  parking_count: number;
  full_address: string;
  facility_fees: FacilityFee[];
  sido_cd: string;
}

interface FacilityFee {
  품종: string;
  품종상세: string;
  품명: string;
  임대내용: string;
  요금: number;
  요금_표시: string;
  판매여부: string;
  [key: string]: unknown;
}

// DB JSON의 '평수_㎡' 키를 안전하게 읽기
function getAreaSqm(fee: FacilityFee): number | null {
  const v = fee['평수_㎡'];
  return typeof v === 'number' && v > 0 ? v : null;
}

type FuneralType = '3day' | 'nobinso';
type SizeKey = 'small' | 'medium' | 'large' | 'premium' | 'vip';

/* ─── 상수 ─── */
const METRO_SIDO = ['6110000', '6410000', '6280000'];

const METRO_COSTS = {
  transfer: 300000,
  mortuary: 100000,
  encoffin: 350000,
  food: 24000,
};
const NON_METRO_COSTS = {
  transfer: 200000,
  mortuary: 70000,
  encoffin: 250000,
  food: 18000,
};

const SIZE_CATEGORIES: {
  key: SizeKey;
  label: string;
  pyeong: string;
  sqmMin: number;
  sqmMax: number;
  capacity: string;
  tables: string;
  guests: string;
  defaultGuests: number;
  desc: string;
}[] = [
  {
    key: 'small',
    label: '소형',
    pyeong: '30평형 내외',
    sqmMin: 0,
    sqmMax: 100,
    capacity: '동시 수용 16~24명',
    tables: '테이블 4~6개 배치 가능',
    guests: '50~100명 미만',
    defaultGuests: 70,
    desc: '친척 중심 소규모',
  },
  {
    key: 'medium',
    label: '중형',
    pyeong: '50평형 내외',
    sqmMin: 100,
    sqmMax: 198,
    capacity: '동시 수용 40~48명',
    tables: '테이블 10~12개 배치 가능',
    guests: '100~150명 내외',
    defaultGuests: 120,
    desc: '일반적인 3일장',
  },
  {
    key: 'large',
    label: '대형',
    pyeong: '80평형 내외',
    sqmMin: 200,
    sqmMax: 300,
    capacity: '동시 수용 64~72명',
    tables: '테이블 16~18개 배치 가능',
    guests: '150~200명 내외',
    defaultGuests: 170,
    desc: '사회적 활동 활발',
  },
  {
    key: 'premium',
    label: '특실',
    pyeong: '100평형 내외',
    sqmMin: 300,
    sqmMax: 390,
    capacity: '동시 수용 100명 이상',
    tables: '대기/식당 공간 분리',
    guests: '200~300명 내외',
    defaultGuests: 250,
    desc: '기업장, 단체장',
  },
  {
    key: 'vip',
    label: 'VIP실',
    pyeong: '130평형 이상',
    sqmMin: 390,
    sqmMax: 99999,
    capacity: '대규모 인원 수용',
    tables: '최고급 시설 특화',
    guests: '300명 이상',
    defaultGuests: 350,
    desc: 'VIP, 정재계 인사',
  },
];

/* ─── 평균 상조비용 상수 ─── */
const SANGJO_ITEMS_NOBINSO = [
  { label: '인력지원 (장례지도사, 입관지도사)', price: 500000 },
  { label: '장의차량 (장의버스, 리무진)', price: 350000 },
  { label: '고인용품 (수의, 관, 유골함, 횡대, 입관용품)', price: 600000 },
];

const SANGJO_ITEMS_3DAY = [
  { label: '인력지원 (장례지도사, 입관지도사)', price: 500000 },
  { label: '장의차량 (장의버스, 리무진)', price: 350000 },
  { label: '고인용품 (수의, 관, 유골함, 횡대, 입관용품, 빈소용품, 헌화)', price: 900000 },
  { label: '상복 (남자 상복, 여자 상복)', price: 200000 },
];

const SANGJO_TOTAL_NOBINSO = SANGJO_ITEMS_NOBINSO.reduce((s, i) => s + i.price, 0);
const SANGJO_TOTAL_3DAY = SANGJO_ITEMS_3DAY.reduce((s, i) => s + i.price, 0);

const YEDAM_PRODUCTS = [
  {
    id: 'yedam-1',
    name: '예담 1호',
    subtitle: '무빈소',
    price: 1300000,
    maxCost: 3000000,
    features: ['장례지도사 1명', '앰뷸런스 관내 이송', '수의·관·유골함 포함'],
  },
  {
    id: 'yedam-2',
    name: '예담 2호',
    price: 2300000,
    maxCost: 5000000,
    features: [
      '장례지도사 1명 x 3일',
      '접객 도우미 3명',
      '장의버스/리무진 180km',
      '수의·관·유골함·빈소용품 포함',
    ],
  },
  {
    id: 'yedam-3',
    name: '예담 3호',
    price: 3400000,
    maxCost: 7000000,
    features: [
      '장례지도사 1명 x 3일',
      '접객 도우미 4명',
      '장의버스/리무진 200km',
      '수의·관·유골함·빈소용품 포함',
      '운구 2인 지원',
    ],
  },
  {
    id: 'yedam-4',
    name: '예담 4호',
    price: 4600000,
    maxCost: Infinity,
    features: [
      '장례지도사 1명 x 3일',
      '접객 도우미 6명',
      '장의버스/리무진 300km',
      '수의·관·유골함·빈소용품 포함',
      '운구 4인 지원',
    ],
  },
];

function classifySize(sqm: number): SizeKey {
  if (sqm < 100) return 'small';
  if (sqm < 200) return 'medium';
  if (sqm < 300) return 'large';
  if (sqm < 390) return 'premium';
  return 'vip';
}

// 조문객 수 → 추천 규모 (해당 장례식장에 있는 규모만 대상)
const GUEST_RANGES: { key: SizeKey; max: number }[] = [
  { key: 'small', max: 100 },
  { key: 'medium', max: 150 },
  { key: 'large', max: 200 },
  { key: 'premium', max: 300 },
  { key: 'vip', max: Infinity },
];

function formatPrice(n: number): string {
  if (n >= 10000) {
    const man = Math.round(n / 10000);
    return `약 ${man.toLocaleString()}만원`;
  }
  return `${n.toLocaleString()}원`;
}

/* ─── 모달 ─── */
interface FuneralCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (productId: string) => void;
}

export function FuneralCostModal({
  isOpen,
  onClose,
  onSelectProduct,
}: FuneralCostModalProps): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restoredRef = useRef(false);

  // Steps
  const [step, setStep] = useState(1);

  // Step 1: 장례형태
  const [funeralType, setFuneralType] = useState<FuneralType | null>(null);

  // Step 2: 지역
  const [sidoList, setSidoList] = useState<Region[]>([]);
  const [gunguList, setGunguList] = useState<Region[]>([]);
  const [sido, setSido] = useState('');
  const [gungu, setGungu] = useState('');

  // Step 3: 장례식장
  const [halls, setHalls] = useState<FuneralHall[]>([]);
  const [hallSearch, setHallSearch] = useState('');
  const [selectedHall, setSelectedHall] = useState<FuneralHall | null>(null);
  const [hallsLoading, setHallsLoading] = useState(false);

  // Step 4: 빈소 규모 + 조문객
  const [selectedSize, setSelectedSize] = useState<SizeKey | null>(null);
  const [selectedFeeIndexes, setSelectedFeeIndexes] = useState<number[]>([]);
  // 결과 화면에서 체크한 시설 사용료 인덱스 (facility_fees 기준)
  const [checkedFeeIndexes, setCheckedFeeIndexes] = useState<number[]>([]);
  const [showFeeTooltip, setShowFeeTooltip] = useState(true);
  const [feeListOpen, setFeeListOpen] = useState(true);
  const [guestCount, setGuestCount] = useState(120);

  // ── URL 쿼리 파라미터에서 상태 복원 ──
  useEffect(() => {
    if (restoredRef.current) return;
    const fc = searchParams.get('fc_type');
    if (!fc) return;

    restoredRef.current = true;

    const pSido = searchParams.get('fc_sido') ?? '';
    const pGungu = searchParams.get('fc_gungu') ?? '';
    const pHall = searchParams.get('fc_hall') ?? '';
    const pSize = searchParams.get('fc_size') as SizeKey | null;
    const pGuests = parseInt(searchParams.get('fc_guests') ?? '120');
    const pChecked = searchParams.get('fc_checked');

    setFuneralType(fc as FuneralType);
    setSido(pSido);
    setGungu(pGungu);
    setGuestCount(pGuests);
    if (pSize) setSelectedSize(pSize);
    if (pChecked) setCheckedFeeIndexes(pChecked.split(',').map(Number));
    setShowFeeTooltip(false);

    // 장례식장 데이터 로드 후 결과 화면으로 이동
    if (pGungu && pHall) {
      fetch(`/api/v1/funeral-cost/halls?gungu=${pGungu}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.success) {
            setHalls(j.data);
            const hall = j.data.find(
              (h: FuneralHall) => h.facility_cd === pHall,
            );
            if (hall) {
              setSelectedHall(hall);
              const resultStep = fc === '3day' ? 5 : 4;
              setStep(resultStep);
            }
          }
        });
    }
  }, [searchParams]);

  // ── 결과 화면에서 URL 쿼리 파라미터 업데이트 ──
  const syncQueryParams = useCallback(() => {
    if (!selectedHall || !funeralType) return;
    const resultStep = funeralType === '3day' ? 5 : 4;
    if (step !== resultStep) return;

    const params = new URLSearchParams(window.location.search);
    params.set('fc_type', funeralType);
    params.set('fc_sido', sido);
    params.set('fc_gungu', gungu);
    params.set('fc_hall', selectedHall.facility_cd);
    params.set('fc_guests', String(guestCount));
    if (selectedSize) params.set('fc_size', selectedSize);
    if (checkedFeeIndexes.length > 0)
      params.set('fc_checked', checkedFeeIndexes.join(','));
    else params.delete('fc_checked');

    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', url);
  }, [
    step,
    funeralType,
    sido,
    gungu,
    selectedHall,
    selectedSize,
    guestCount,
    checkedFeeIndexes,
  ]);

  useEffect(() => {
    syncQueryParams();
  }, [syncQueryParams]);

  // body 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 시도 목록 로드
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/v1/funeral-cost/regions?type=sido')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setSidoList(j.data);
      });
  }, [isOpen]);

  // 시군구 목록 로드
  useEffect(() => {
    if (!sido) {
      setGunguList([]);
      return;
    }
    fetch(`/api/v1/funeral-cost/regions?type=gungu&sido=${sido}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setGunguList(j.data);
      });
  }, [sido]);

  // 장례식장 목록 로드
  useEffect(() => {
    if (!gungu) {
      setHalls([]);
      return;
    }
    setHallsLoading(true);
    fetch(`/api/v1/funeral-cost/halls?gungu=${gungu}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setHalls(j.data);
      })
      .finally(() => setHallsLoading(false));
  }, [gungu]);

  // 총 스텝 수
  const totalSteps = funeralType === '3day' ? 5 : 4;
  const resultStep = funeralType === '3day' ? 5 : 4;

  // 뒤로가기
  const goBack = useCallback(() => {
    if (step === 1) {
      onClose();
      return;
    }
    // 무빈소: step 4(결과)에서 뒤로가면 step 3
    if (funeralType === 'nobinso' && step === resultStep) {
      setStep(3);
    } else {
      setStep(step - 1);
    }
  }, [step, funeralType, resultStep, onClose]);

  // 리셋
  const handleClose = () => {
    setStep(1);
    setFuneralType(null);
    setSido('');
    setGungu('');
    setHalls([]);
    setHallSearch('');
    setSelectedHall(null);
    setSelectedSize(null);
    setSelectedFeeIndexes([]);
    setCheckedFeeIndexes([]);
    setGuestCount(120);
    setShowFeeTooltip(true);
    // URL 파라미터 정리
    const params = new URLSearchParams(window.location.search);
    [
      'fc_type',
      'fc_sido',
      'fc_gungu',
      'fc_hall',
      'fc_size',
      'fc_guests',
      'fc_checked',
    ].forEach((k) => params.delete(k));
    const qs = params.toString();
    window.history.replaceState(
      null,
      '',
      qs ? `${window.location.pathname}?${qs}` : window.location.pathname,
    );
    onClose();
  };

  // 개별 fee가 빈소인지 판별
  const isBinsoFee = useCallback((fee: FacilityFee) => {
    const cat = fee.품종상세 ?? '';
    const name = fee.품명 ?? '';
    // 품종상세/품명에 '빈소' 또는 '분향' 포함
    if (
      '빈소분향'.split('').some((_, i, a) => {
        const kw = a.slice(i, i + 2).join('');
        return kw.length === 2 && (cat.includes(kw) || name.includes(kw));
      })
    )
      return true;
    if (cat.includes('빈소') || name.includes('빈소')) return true;
    if (cat.includes('분향') || name.includes('분향')) return true;
    // 호실 패턴 + 평수 데이터 + 비빈소 키워드 제외
    const sqm = getAreaSqm(fee);
    if (
      sqm &&
      sqm > 30 &&
      /\d+호/.test(name) &&
      !name.includes('객실') &&
      !name.includes('영결') &&
      !name.includes('입관') &&
      !name.includes('안치')
    ) {
      return true;
    }
    return false;
  }, []);

  // 장례식장에서 빈소 fee 추출
  const getBinsoFees = useCallback(
    (hall: FuneralHall) => {
      return hall.facility_fees.filter(
        (f) => f.판매여부 === 'Y' && f.품종 === '시설임대료' && isBinsoFee(f),
      );
    },
    [isBinsoFee],
  );

  // 면적 데이터 있는지
  const hasAreaData = useCallback(
    (hall: FuneralHall) => {
      return getBinsoFees(hall).some((f) => getAreaSqm(f) !== null);
    },
    [getBinsoFees],
  );

  // 선택한 규모에 해당하는 빈소 fee 필터
  const getFeesForSize = useCallback(
    (hall: FuneralHall, size: SizeKey) => {
      const cat = SIZE_CATEGORIES.find((c) => c.key === size)!;
      return getBinsoFees(hall).filter((f) => {
        const sqm = getAreaSqm(f);
        if (!sqm) return false;
        return sqm >= cat.sqmMin && sqm < cat.sqmMax;
      });
    },
    [getBinsoFees],
  );

  // 비용 계산
  const calcResult = useCallback(() => {
    if (!selectedHall) return null;
    const isMetro = METRO_SIDO.includes(selectedHall.sido_cd);
    const costs = isMetro ? METRO_COSTS : NON_METRO_COSTS;

    if (funeralType === 'nobinso') {
      const transfer = costs.transfer;
      const mortuary = costs.mortuary;
      const encoffin = costs.encoffin;
      const basicTotal = transfer + mortuary + encoffin;
      const sangjoTotal = SANGJO_TOTAL_NOBINSO;
      const total = basicTotal + sangjoTotal;
      return {
        funeralType: 'nobinso' as const,
        isMetro,
        transfer,
        mortuary,
        encoffin,
        facilityFee: 0,
        food: 0,
        basicTotal,
        sangjoTotal,
        total,
        guestCount: 0,
      };
    }

    // 3일장 — 결과 화면에서 체크한 항목 기준
    const facilityFeeItems = selectedHall.facility_fees.filter(
      (f) => f.판매여부 === 'Y' && f.품종 === '시설임대료',
    );
    const facilityFee =
      checkedFeeIndexes.reduce(
        (sum, idx) => sum + (facilityFeeItems[idx]?.요금 ?? 0),
        0,
      ) * 3;

    // 입관실 사용료 (장례식장 데이터에서)
    const encoffinFee = selectedHall.facility_fees.find(
      (f) => f.판매여부 === 'Y' && f.품명.includes('입관'),
    );
    const encoffin = encoffinFee?.요금 ?? costs.encoffin;

    const transfer = costs.transfer;
    const mortuary = costs.mortuary * 3;
    const food = costs.food * guestCount;
    const basicTotal = facilityFee + encoffin + transfer + mortuary + food;
    const sangjoTotal = SANGJO_TOTAL_3DAY;
    const total = basicTotal + sangjoTotal;

    return {
      funeralType: '3day' as const,
      isMetro,
      transfer,
      mortuary,
      encoffin,
      facilityFee,
      food,
      basicTotal,
      sangjoTotal,
      total,
      guestCount,
    };
  }, [
    selectedHall,
    funeralType,
    selectedSize,
    selectedFeeIndexes,
    checkedFeeIndexes,
    guestCount,
    hasAreaData,
    getFeesForSize,
    getBinsoFees,
  ]);

  // 추천 상품
  const getRecommendedProduct = useCallback((total: number) => {
    return (
      YEDAM_PRODUCTS.find((p) => total <= p.maxCost) ??
      YEDAM_PRODUCTS[YEDAM_PRODUCTS.length - 1]
    );
  }, []);

  if (!isOpen) return null;

  // 검색 필터
  const filteredHalls = hallSearch
    ? halls.filter((h) => h.company_name.includes(hallSearch))
    : halls;

  // 현재 장례식장의 available sizes — 항상 5개 전부 노출
  const availableSizes = SIZE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 딤 배경 */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* 모달 본체 */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl bg-white overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0">
          <button
            onClick={goBack}
            className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
          >
            {step === 1 ? (
              <X className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
          <h2 className="text-base font-bold text-gray-900">
            장례비용 알아보기
          </h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer sm:block hidden"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-7 sm:hidden" />
        </div>

        {/* 스텝 인디케이터 */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-3 shrink-0">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{ backgroundColor: i < step ? BRAND_COLOR : '#e5e7eb' }}
            />
          ))}
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
          {/* ── Step 1: 장례형태 선택 ── */}
          {step === 1 && (
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                장례 형태를 선택해주세요
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                장례 형태에 따라 비용 구성이 달라집니다.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    key: '3day' as FuneralType,
                    label: '3일장',
                    sub: '빈소를 마련하여 3일간 조문 진행',
                    desc: '일반적인 장례 · 조문객 50명 이상',
                  },
                  {
                    key: 'nobinso' as FuneralType,
                    label: '무빈소',
                    sub: '빈소 없이 당일 장례 진행',
                    desc: '소규모/간소 장례 · 가족장/직계 중심',
                  },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setFuneralType(opt.key);
                      setStep(2);
                    }}
                    className="p-5 rounded-xl border-2 text-left cursor-pointer transition-colors hover:border-gray-400"
                    style={{
                      borderColor:
                        funeralType === opt.key ? BRAND_COLOR : '#e5e7eb',
                    }}
                  >
                    <p className="text-lg font-bold text-gray-900 mb-1">
                      {opt.label}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">{opt.sub}</p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: 지역 선택 ── */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  지역을 선택해주세요
                </h3>
                {(sido || gungu) && (
                  <button
                    onClick={() => { setSido(''); setGungu(''); setSelectedHall(null); }}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    다시 선택
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-6">
                장례식장을 찾을 지역을 선택합니다.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* 시도 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    시/도
                  </label>
                  <Select
                    value={sido}
                    onValueChange={(v) => {
                      setSido(v);
                      setGungu('');
                      setSelectedHall(null);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="시/도 선택" />
                    </SelectTrigger>
                    <SelectContent className="z-200">
                      {sidoList.map((s) => (
                        <SelectItem key={s.code} value={s.code}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* 시군구 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    시/군/구
                  </label>
                  <Select
                    value={gungu}
                    onValueChange={(v) => {
                      setGungu(v);
                      setSelectedHall(null);
                      setStep(3);
                    }}
                    disabled={!sido}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="시/군/구 선택" />
                    </SelectTrigger>
                    <SelectContent className="z-200">
                      {gunguList.map((g) => (
                        <SelectItem key={g.code} value={g.code}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: 장례식장 선택 ── */}
          {step === 3 && (
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                장례식장을 선택해주세요
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {gunguList.find((g) => g.code === gungu)?.name ?? ''} 지역
                장례식장 {halls.length}곳
              </p>

              {/* 검색 */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="장례식장명 검색"
                  value={hallSearch}
                  onChange={(e) => setHallSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              {hallsLoading && (
                <div className="py-12 text-center text-sm text-gray-400">
                  불러오는 중...
                </div>
              )}

              {!hallsLoading && filteredHalls.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-400">
                  검색 결과가 없습니다.
                </div>
              )}

              <div className="space-y-2 max-h-[50vh] sm:max-h-[40vh] overflow-y-auto">
                {filteredHalls.map((hall) => (
                  <button
                    key={hall.facility_cd}
                    onClick={() => {
                      setSelectedHall(hall);
                      setSelectedFeeIndexes([]);
                      if (funeralType === '3day') {
                        setStep(4);
                        // 기본: 소형 선택 + 조문객 수 세팅
                        setSelectedSize('small');
                        setGuestCount(SIZE_CATEGORIES[0].defaultGuests);
                      } else {
                        setStep(resultStep);
                      }
                    }}
                    className="w-full p-4 rounded-xl border border-gray-200 text-left cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <p className="font-bold text-gray-900 mb-1">
                      {hall.company_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                      <span>{hall.funeral_type}</span>
                      <span>·</span>
                      <span>{hall.public_label}</span>
                      <span>·</span>
                      <span>{hall.manage_class}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        빈소 {hall.mortuary_count}실
                      </span>
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" />
                        주차 {hall.parking_count}대
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{hall.full_address}</span>
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: 빈소 규모 + 조문객 수 (3일장만) ── */}
          {step === 4 && selectedHall && funeralType === '3day' && (
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                빈소 규모와 조문객 수
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {selectedHall.company_name}
              </p>

              <p className="text-sm font-semibold text-gray-700 mb-3">
                빈소 규모 선택
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                {availableSizes.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedSize(cat.key)}
                    className="p-3 rounded-xl border-2 text-left cursor-pointer transition-colors"
                    style={{
                      borderColor:
                        selectedSize === cat.key ? BRAND_COLOR : '#e5e7eb',
                    }}
                  >
                    <p className="font-bold text-gray-900 text-sm mb-0.5">
                      {cat.label} ({cat.pyeong})
                    </p>
                    <p className="text-xs text-gray-400">{cat.capacity}</p>
                    <p className="text-xs text-gray-400">{cat.tables}</p>
                    <p className="text-xs text-gray-400">
                      예상 조문객 {cat.guests}
                    </p>
                  </button>
                ))}
              </div>

              {/* 예상 조문객 수 */}
              <p className="text-sm font-semibold text-gray-700 mb-3">
                예상 조문객 수
              </p>
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={10}
                  value={guestCount}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setGuestCount(v);
                    const matched = GUEST_RANGES.find((r) => v <= r.max);
                    if (matched) setSelectedSize(matched.key);
                  }}
                  className="flex-1 h-2 rounded-full cursor-pointer"
                  style={{
                    accentColor: BRAND_COLOR,
                    background: `linear-gradient(to right, ${BRAND_COLOR} ${((guestCount - 10) / 490) * 100}%, #e5e7eb ${((guestCount - 10) / 490) * 100}%)`,
                  }}
                />
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => {
                      const v = Math.max(1, parseInt(e.target.value) || 0);
                      setGuestCount(v);
                      const matched = GUEST_RANGES.find((r) => v <= r.max);
                      if (matched) setSelectedSize(matched.key);
                    }}
                    className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                  <span className="text-sm text-gray-500">명</span>
                </div>
              </div>
              {selectedSize && (
                <p className="text-xs text-gray-400 mb-6">
                  {SIZE_CATEGORIES.find((c) => c.key === selectedSize)?.label}{' '}
                  기준 약{' '}
                  {
                    SIZE_CATEGORIES.find((c) => c.key === selectedSize)
                      ?.defaultGuests
                  }
                  명이 일반적입니다.
                </p>
              )}

              {/* 다음 버튼 */}
              <button
                onClick={() => setStep(5)}
                disabled={!selectedSize}
                className="w-full py-3 rounded-xl text-white font-bold text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                예상 비용 확인하기
              </button>
            </div>
          )}

          {/* ── Step 5 (or 4 for 무빈소): 결과 ── */}
          {step === resultStep &&
            selectedHall &&
            (() => {
              const result = calcResult();
              if (!result) return null;
              const recommended = getRecommendedProduct(result.total);
              const saving = result.total - recommended.price;

              return (
                <div>
                  {/* 총 예상비용 */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                      총 장례 예상비용
                    </h3>
                    <p
                      className="text-3xl sm:text-4xl font-extrabold"
                      style={{ color: BRAND_COLOR }}
                    >
                      {formatPrice(result.total)}
                    </p>
                  </div>

                  {/* ── 장례식장 기본 비용 ── */}
                  {(() => {
                    const facilityFeeItems = selectedHall.facility_fees.filter(
                      (f) => f.판매여부 === 'Y' && f.품종 === '시설임대료',
                    );
                    const checkedTotal = checkedFeeIndexes.reduce(
                      (sum, i) => sum + (facilityFeeItems[i]?.요금 ?? 0),
                      0,
                    );
                    const hasBinsoSelected =
                      funeralType === '3day' && checkedFeeIndexes.length > 0;

                    return (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-gray-700">장례식장 기본 비용</p>
                          <p className="text-sm font-bold" style={{ color: BRAND_COLOR }}>
                            {result.basicTotal.toLocaleString()}원
                          </p>
                        </div>
                        <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                          {funeralType === '3day' && (
                            <div className="px-4 py-2.5 flex justify-between items-center border-b border-gray-100">
                              <span className="text-gray-600">
                                빈소 사용료 (3일)
                              </span>
                              {hasBinsoSelected ? (
                                <span className="font-semibold text-gray-900 text-right">
                                  <span className="text-xs text-gray-400">
                                    {checkedTotal.toLocaleString()} x 3일 ={' '}
                                  </span>
                                  {(checkedTotal * 3).toLocaleString()}원
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                                  선택 필요
                                </span>
                              )}
                            </div>
                          )}
                          <div className="px-4 py-2.5 flex justify-between border-b border-gray-100">
                            <span className="text-gray-600">입관실 사용료</span>
                            <span className="font-semibold text-gray-900">
                              <span className="text-xs text-gray-400 mr-1">평균</span>
                              {result.encoffin.toLocaleString()}원
                            </span>
                          </div>
                          <div className="px-4 py-2.5 flex justify-between border-b border-gray-100">
                            <span className="text-gray-600">고인 이송비</span>
                            <span className="font-semibold text-gray-900">
                              <span className="text-xs text-gray-400 mr-1">평균</span>
                              {result.transfer.toLocaleString()}원
                            </span>
                          </div>
                          <div className="px-4 py-2.5 flex justify-between border-b border-gray-100">
                            <span className="text-gray-600">
                              안치실 안치료{funeralType === '3day' ? ' (3일)' : ''}
                            </span>
                            <span className="font-semibold text-gray-900">
                              <span className="text-xs text-gray-400 mr-1">평균</span>
                              {result.mortuary.toLocaleString()}원
                            </span>
                          </div>
                          {funeralType === '3day' && (
                            <div className="px-4 py-2.5 flex justify-between">
                              <span className="text-gray-600">
                                음식비 ({guestCount}명 x{' '}
                                {(result.isMetro ? METRO_COSTS : NON_METRO_COSTS).food.toLocaleString()}원)
                              </span>
                              <span className="font-semibold text-gray-900">
                                <span className="text-xs text-gray-400 mr-1">평균</span>
                                {result.food.toLocaleString()}원
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── 장례식장 평균 상조비용 ── */}
                  {(() => {
                    const isNobinso = funeralType === 'nobinso';
                    const sangjoItems = isNobinso ? SANGJO_ITEMS_NOBINSO : SANGJO_ITEMS_3DAY;

                    return (
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-gray-700">장례식장 평균 상조비용</p>
                          <p className="text-sm font-bold" style={{ color: BRAND_COLOR }}>
                            <span className="text-xs text-gray-400 mr-1">평균</span>
                            {result.sangjoTotal.toLocaleString()}원
                          </p>
                        </div>
                        <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                          {sangjoItems.map((item, i) => (
                            <div
                              key={i}
                              className={`px-4 py-2.5 text-gray-600 ${i < sangjoItems.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                              {item.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 선택 정보 */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-gray-600">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">장례식장</span>
                      <span className="font-semibold text-gray-900">
                        {selectedHall.company_name}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">장례형태</span>
                      <span className="font-semibold text-gray-900">
                        {funeralType === '3day' ? '3일장' : '무빈소'}
                        {selectedSize &&
                          ` · ${SIZE_CATEGORIES.find((c) => c.key === selectedSize)?.label}`}
                      </span>
                    </div>
                    {funeralType === '3day' && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">예상 조문객</span>
                        <span className="font-semibold text-gray-900">
                          {guestCount}명
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 시설 사용료 전체 리스트 — 체크박스로 선택 (3일장만) */}
                  {funeralType === '3day' &&
                    (() => {
                      const facilityFeeItems =
                        selectedHall.facility_fees.filter(
                          (f) => f.판매여부 === 'Y' && f.품종 === '시설임대료',
                        );
                      const checkedTotal = checkedFeeIndexes.reduce(
                        (sum, idx) => sum + (facilityFeeItems[idx]?.요금 ?? 0),
                        0,
                      );

                      return (
                        <div className="relative border border-gray-200 rounded-xl overflow-hidden mb-4">
                          {/* 아코디언 헤더 */}
                          <button
                            onClick={() => setFeeListOpen(!feeListOpen)}
                            className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex flex-col items-start gap-0.5">
                              <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                시설 사용료
                                {selectedSize && (
                                  <span
                                    className="text-xs font-bold"
                                    style={{ color: BRAND_COLOR }}
                                  >
                                    {
                                      SIZE_CATEGORIES.find(
                                        (c) => c.key === selectedSize,
                                      )?.label
                                    }{' '}
                                    추천
                                  </span>
                                )}
                              </span>
                              {checkedFeeIndexes.length > 0 && (
                                <span
                                  className="text-xs font-semibold"
                                  style={{ color: BRAND_COLOR }}
                                >
                                  선택 합계:{' '}
                                  {(checkedTotal * 3).toLocaleString()}원 (3일)
                                </span>
                              )}
                              {checkedFeeIndexes.length === 0 && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                                  빈소를 선택해주세요
                                </span>
                              )}
                            </div>
                            <ChevronDown
                              className="w-5 h-5 text-gray-400 shrink-0 transition-transform"
                              style={{
                                transform: feeListOpen
                                  ? 'rotate(180deg)'
                                  : 'rotate(0)',
                              }}
                            />
                          </button>

                          {/* 툴팁 */}
                          {feeListOpen &&
                            showFeeTooltip &&
                            checkedFeeIndexes.length === 0 && (
                              <div
                                className="px-4 py-2 border-t border-gray-100 flex items-center justify-between"
                                style={{ backgroundColor: '#fffbeb' }}
                              >
                                <span className="text-xs font-semibold text-amber-700">
                                  👆 체크해서 비용을 계산해보세요
                                </span>
                                <button
                                  onClick={() => setShowFeeTooltip(false)}
                                  className="text-amber-400 cursor-pointer p-0.5"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                          {/* 빈소 항목을 위로, 그 중 추천 항목을 최상단 */}
                          {feeListOpen &&
                            facilityFeeItems
                              .map((fee, idx) => ({
                                fee,
                                idx,
                                binso: isBinsoFee(fee),
                              }))
                              .sort((a, b) => {
                                // 빈소 우선
                                if (a.binso && !b.binso) return -1;
                                if (!a.binso && b.binso) return 1;
                                // 빈소 중 추천 우선
                                const aMatch =
                                  a.binso && selectedSize && getAreaSqm(a.fee)
                                    ? classifySize(getAreaSqm(a.fee)!) ===
                                      selectedSize
                                    : false;
                                const bMatch =
                                  b.binso && selectedSize && getAreaSqm(b.fee)
                                    ? classifySize(getAreaSqm(b.fee)!) ===
                                      selectedSize
                                    : false;
                                if (aMatch && !bMatch) return -1;
                                if (!aMatch && bMatch) return 1;
                                return 0;
                              })
                              .map(({ fee, idx, binso }) => {
                                const sqm = getAreaSqm(fee);
                                const matchedSize =
                                  binso && sqm ? classifySize(sqm) : null;
                                const sizeLabel = matchedSize
                                  ? SIZE_CATEGORIES.find(
                                      (c) => c.key === matchedSize,
                                    )?.label
                                  : null;
                                const isRecommended =
                                  binso && selectedSize
                                    ? matchedSize === selectedSize
                                    : false;
                                const isChecked =
                                  checkedFeeIndexes.includes(idx);
                                // 평수 표시: "50평 (165㎡) - 중형"
                                // 품명에 이미 ㎡가 포함된 경우 평수+규모만, 아닌 경우 전체 표시
                                const pyeong = sqm
                                  ? Math.round(sqm / 3.3058)
                                  : 0;
                                const hasAreaInName =
                                  fee.품명.includes('㎡') ||
                                  fee.품명.includes('m²') ||
                                  fee.품명.includes('m2');
                                const areaDesc = sqm
                                  ? hasAreaInName
                                    ? `${pyeong}평`
                                    : `${pyeong}평 (${sqm}㎡)`
                                  : null;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setCheckedFeeIndexes(
                                        isChecked
                                          ? checkedFeeIndexes.filter(
                                              (i) => i !== idx,
                                            )
                                          : [...checkedFeeIndexes, idx],
                                      );
                                      setShowFeeTooltip(false);
                                    }}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm border-t border-gray-100 text-left cursor-pointer transition-colors"
                                    style={
                                      isChecked
                                        ? { backgroundColor: '#e8eddf' }
                                        : isRecommended
                                          ? { backgroundColor: '#eef3e6' }
                                          : undefined
                                    }
                                  >
                                    {/* 체크박스 */}
                                    <div
                                      className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0"
                                      style={{
                                        borderColor: isChecked
                                          ? BRAND_COLOR
                                          : '#d1d5db',
                                        backgroundColor: isChecked
                                          ? BRAND_COLOR
                                          : 'transparent',
                                      }}
                                    >
                                      {isChecked && (
                                        <Check className="w-3 h-3 text-white" />
                                      )}
                                    </div>
                                    {/* 내용 */}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span
                                          className={
                                            isChecked
                                              ? 'font-bold text-gray-900'
                                              : 'text-gray-600'
                                          }
                                        >
                                          {fee.품명}
                                          {areaDesc ? ` ${areaDesc}` : ''}
                                        </span>
                                        {sizeLabel && (
                                          <span
                                            className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                                            style={
                                              isRecommended
                                                ? {
                                                    backgroundColor:
                                                      BRAND_COLOR,
                                                    color: 'white',
                                                  }
                                                : {
                                                    backgroundColor: '#f3f4f6',
                                                    color: '#9ca3af',
                                                  }
                                            }
                                          >
                                            {sizeLabel}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        {fee.임대내용}
                                      </p>
                                    </div>
                                    <span
                                      className={`shrink-0 ml-3 ${isChecked ? 'font-bold text-gray-900' : 'text-gray-500'}`}
                                    >
                                      {fee.요금_표시}원
                                    </span>
                                  </button>
                                );
                              })}
                        </div>
                      );
                    })()}

                  <p className="text-xs text-gray-400 text-center">
                    ※ 본 금액은 평균 데이터 기반 추정치이며, 실제 비용과 차이가
                    있을 수 있습니다.
                  </p>
                </div>
              );
            })()}
        </div>

        {/* 하단 고정 버튼 (결과 화면에서만) */}
        {step === resultStep &&
          selectedHall &&
          (() => {
            const res = calcResult();
            const recommended = getRecommendedProduct(res?.total ?? 0);
            const discountPct = res && res.sangjoTotal > 0
              ? Math.round(((res.sangjoTotal - recommended.price) / res.sangjoTotal) * 100)
              : 0;
            return (
              <div
                className="shrink-0 border-t border-gray-100 bg-white px-4 sm:px-6 pt-3 pb-4 sm:pb-4"
                style={{
                  paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                }}
              >
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('링크가 복사되었습니다.');
                    }}
                    className="w-[100px] shrink-0 py-3.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    결과 링크 복사
                  </button>
                  <a
                    href="#inquiry"
                    onClick={(e) => {
                      e.preventDefault();
                      const productId = recommended.id;
                      handleClose();
                      onSelectProduct?.(productId);
                      setTimeout(() => {
                        document
                          .getElementById('inquiry')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-sm font-bold cursor-pointer"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    {recommended.name}로 평균 {discountPct}% 할인 받기
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
