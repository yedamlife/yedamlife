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
  service_items?: FacilityFee[];
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

// 사용료 단위 판별
//  - 시간당 (예: '시간당', '1시간') → 24시간 x 2일 = 48 적용
//  - 일/24시간 단위 (예: '1일', '24시간 기준', '1실/24시간 기준') → 2일 적용
//  - 그 외 → 데이터 그대로 사용
function getFeeMultiplier(fee: FacilityFee): {
  multiplier: number;
  unitLabel: string;
} {
  const raw = `${fee.임대내용 ?? ''} ${fee.품명 ?? ''} ${
    typeof fee['서비스내용'] === 'string' ? (fee['서비스내용'] as string) : ''
  }`;
  const desc = raw.replace(/\s/g, '');
  if (/시간당|1시간|시간\/회/.test(desc)) {
    return { multiplier: 48, unitLabel: '24시간 x 2일' };
  }
  if (/24시간|일/.test(desc)) {
    return { multiplier: 2, unitLabel: '2일' };
  }
  return { multiplier: 1, unitLabel: '' };
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
type SangjoItem = {
  label: string;
  price: number;
  items?: { label: string; price?: number; note?: string }[];
};

const SANGJO_ITEMS_NOBINSO: SangjoItem[] = [
  {
    label: '인력지원 (2명 * 2일)',
    price: 480000,
    items: [
      { label: '장례지도사', price: 240000 },
      { label: '입관지도사', price: 240000 },
    ],
  },
  {
    label: '장의차량',
    price: 900000,
    items: [
      { label: '장의버스 1대', price: 450000 },
      { label: '리무진 1대', price: 450000 },
    ],
  },
  {
    label: '고인용품',
    price: 850000,
    items: [
      { label: '기본수의 평균', price: 250000 },
      { label: '관(오동나무 기본) 평균', price: 290000 },
      { label: '입관 꽃장식 평균', price: 150000 },
      {
        label: '고인메이크업 평균',
        price: 10000,
      },
      { label: '영정사진 평균', price: 150000 },
    ],
  },
  {
    label: '유골함',
    price: 250000,
    items: [
      { label: '도자기 유골함 평균', price: 230000 },
      { label: '나무 유골함 평균', price: 20000 },
    ],
  },
];

const SANGJO_ITEMS_3DAY: SangjoItem[] = [
  {
    label: '인력지원 (2명 * 2일)',
    price: 480000,
    items: [
      { label: '장례지도사', price: 240000 },
      { label: '입관지도사', price: 240000 },
    ],
  },
  {
    label: '장의차량',
    price: 900000,
    items: [
      { label: '장의버스 1대', price: 450000 },
      { label: '리무진 1대', price: 450000 },
    ],
  },
  {
    label: '고인용품',
    price: 940000,
    items: [
      { label: '기본수의 평균', price: 250000 },
      { label: '관(오동나무 기본) 평균', price: 290000 },
      { label: '입관 꽃장식 평균', price: 150000 },
      {
        label: '고인메이크업 평균',
        price: 100000,
      },
      { label: '영정사진 평균', price: 150000 },
    ],
  },
  {
    label: '유골함',
    price: 250000,
    items: [
      { label: '도자기 유골함 평균', price: 230000 },
      { label: '나무 유골함 평균', price: 20000 },
    ],
  },
  {
    label: '상복',
    price: 52000,
    items: [
      { label: '남자상복 1벌', price: 30000 },
      { label: '여자상복 1벌', price: 22000 },
    ],
  },
];

const SANGJO_TOTAL_NOBINSO = SANGJO_ITEMS_NOBINSO.reduce(
  (s, i) => s + i.price,
  0,
);
const SANGJO_TOTAL_3DAY = SANGJO_ITEMS_3DAY.reduce((s, i) => s + i.price, 0);

// 라이브 통계가 적용되는 sub 라벨 키워드 목록.
// sub.label에 아래 키워드가 포함되면 stats 로딩 동안 스켈레톤 표시 / 응답 후 ㄴ 라벨 표시.
const LIVE_STATS_KEYWORDS = [
  '메이크업',
  '수의',
  '남자상복',
  '여자상복',
  '장의버스',
  '리무진',
  '장례지도사',
  '입관지도사',
  '오동나무',
  '나무 유골함',
  '도자기 유골함',
  '영정사진',
] as const;

const hasLiveStatsLabel = (label: string): boolean =>
  LIVE_STATS_KEYWORDS.some((k) => label.includes(k));

// 라이브 라벨 안에서 강조할 숫자 색상 (파란색 계열).
const LIVE_LABEL_HIGHLIGHT = '#2563eb';

// 기본 선택 해제 키: '나무 유골함'은 기본 비선택, '도자기 유골함'이 기본 선택.
// 두 데이터 구조 모두에서 동일 인덱스를 보장하기 위해 양쪽을 스캔해 합집합으로 처리.
const createInitialUnselectedSangjoKeys = (): Set<string> => {
  const set = new Set<string>();
  const collect = (items: SangjoItem[]) => {
    items.forEach((item, i) => {
      item.items?.forEach((sub, j) => {
        if (sub.label.includes('나무 유골함')) {
          set.add(`${i}:${j}`);
        }
      });
    });
  };
  collect(SANGJO_ITEMS_3DAY);
  collect(SANGJO_ITEMS_NOBINSO);
  return set;
};

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
  const [checkedEncoffinIndexes, setCheckedEncoffinIndexes] = useState<
    number[]
  >([]);
  const [checkedMortuaryIndexes, setCheckedMortuaryIndexes] = useState<
    number[]
  >([]);
  const [showFeeTooltip, setShowFeeTooltip] = useState(true);
  const [feeListOpen, setFeeListOpen] = useState(true);
  const [encoffinListOpen, setEncoffinListOpen] = useState(true);
  const [mortuaryListOpen, setMortuaryListOpen] = useState(true);
  // 상조비용 항목별 선택 해제 키 (예: "0:1" = 인력지원의 입관지도사). 비어있으면 전체 선택.
  // 단, '나무 유골함'은 기본 비선택 (도자기 유골함이 기본).
  const [unselectedSangjoKeys, setUnselectedSangjoKeys] = useState<Set<string>>(
    () => createInitialUnselectedSangjoKeys(),
  );

  // 메이크업 통계 (실시간 쿼리)
  const [makeupStats, setMakeupStats] = useState<{
    hall_count: number;
    avg_amount: number;
    median_amount: number;
  } | null>(null);

  // 수의 통계 (실시간 쿼리)
  const [shroudStats, setShroudStats] = useState<{
    hall_count: number;
    avg_amount: number;
    median_amount: number;
  } | null>(null);

  // 상복 통계 (성별 분리)
  const [mourningStats, setMourningStats] = useState<{
    male: { hall_count: number; avg_amount: number; median_amount: number };
    female: { hall_count: number; avg_amount: number; median_amount: number };
  } | null>(null);

  // 장의버스/리무진 통계
  const [vehicleStats, setVehicleStats] = useState<{
    hall_count: number;
    bus: { avg_amount: number; median_amount: number; sample_count: number };
    limo: { avg_amount: number; median_amount: number; sample_count: number };
  } | null>(null);

  // 장례지도사/입관지도사 통계
  const [directorStats, setDirectorStats] = useState<{
    hall_count: number;
    hall_count_exact: number;
    avg_amount: number;
    median_amount: number;
  } | null>(null);

  // 오동나무 관 통계
  const [coffinStats, setCoffinStats] = useState<{
    hall_count: number;
    avg_amount: number;
    median_amount: number;
  } | null>(null);

  // 유골함 통계 (재질별: 나무 / 도자기)
  const [urnStats, setUrnStats] = useState<{
    hall_count: number;
    wood: { hall_count: number; avg_amount: number; median_amount: number };
    ceramic: { hall_count: number; avg_amount: number; median_amount: number };
  } | null>(null);

  // 영정사진 통계
  const [portraitStats, setPortraitStats] = useState<{
    hall_count: number;
    avg_amount: number;
    median_amount: number;
  } | null>(null);

  // 상복 수량 (key: "i:j" → 수량, 기본 1)
  const [sangjoQuantities, setSangjoQuantities] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (!isOpen) return;
    if (
      makeupStats &&
      shroudStats &&
      mourningStats &&
      vehicleStats &&
      directorStats &&
      coffinStats &&
      urnStats &&
      portraitStats
    )
      return;
    fetch('/api/v1/funeral-cost/sangjo-stats')
      .then((r) => r.json())
      .then((j) => {
        if (!j.success || !j.data) return;
        if (j.data.makeup) setMakeupStats(j.data.makeup);
        if (j.data.shroud) setShroudStats(j.data.shroud);
        if (j.data.mourning) setMourningStats(j.data.mourning);
        if (j.data.vehicle) setVehicleStats(j.data.vehicle);
        if (j.data.director) setDirectorStats(j.data.director);
        if (j.data.coffin) setCoffinStats(j.data.coffin);
        if (j.data.urn) setUrnStats(j.data.urn);
        if (j.data.portrait) setPortraitStats(j.data.portrait);
      })
      .catch(() => {});
  }, [
    isOpen,
    makeupStats,
    shroudStats,
    mourningStats,
    vehicleStats,
    directorStats,
    coffinStats,
    urnStats,
    portraitStats,
  ]);

  // 실시간 통계를 적용한 동적 상조 항목 (메이크업, 수의)
  const applyMakeupStats = useCallback(
    (items: SangjoItem[]): SangjoItem[] =>
      items.map((item) => {
        if (!item.items) return item;
        const newSubs = item.items.map((sub) => {
          if (sub.label.includes('메이크업') && makeupStats) {
            return {
              ...sub,
              price: makeupStats.avg_amount,
              note: `'메이크업 비용' 제공하는 ${makeupStats.hall_count}개 장례식장 실시간 평균 비용`,
            };
          }
          if (sub.label.includes('수의') && shroudStats) {
            return {
              ...sub,
              price: shroudStats.avg_amount,
              note: `'수의 비용' 제공하는 ${shroudStats.hall_count}개 장례식장 실시간 평균 비용`,
            };
          }
          if (sub.label.includes('남자상복') && mourningStats?.male) {
            return {
              ...sub,
              price: mourningStats.male.median_amount,
              note: `'남자상복 비용' 제공하는 ${mourningStats.male.hall_count}개 장례식장 실시간 평균 비용`,
            };
          }
          if (sub.label.includes('여자상복') && mourningStats?.female) {
            return {
              ...sub,
              price: mourningStats.female.median_amount,
              note: `'여자상복 비용' 제공하는 ${mourningStats.female.hall_count}개 장례식장 실시간 평균 비용`,
            };
          }
          if (sub.label.includes('장의버스') && vehicleStats) {
            return {
              ...sub,
              price: vehicleStats.bus.median_amount,
              note: `'장의버스 비용' 제공하는 ${vehicleStats.hall_count}개 장례식장 실시간 평균 비용`,
            };
          }
          if (sub.label.includes('리무진') && vehicleStats) {
            return {
              ...sub,
              price: vehicleStats.limo.median_amount,
              note: `'리무진 비용' 제공하는 ${vehicleStats.hall_count}개 장례식장 실시간 평균 비용`,
            };
          }
          if (sub.label.includes('장례지도사') && directorStats) {
            return {
              ...sub,
              price: directorStats.median_amount,
              note: `'장례지도사 비용' 제공하는 ${directorStats.hall_count}개 장례식장 실시간 평균 비용`,
            };
          }
          if (sub.label.includes('입관지도사') && directorStats) {
            return {
              ...sub,
              price: directorStats.median_amount,
              note: `'입관지도사 비용' 제공하는 ${directorStats.hall_count}개 장례식장 실시간 평균 비용`,
            };
          }
          if (sub.label.includes('오동나무') && coffinStats) {
            return {
              ...sub,
              price: coffinStats.median_amount,
              note: `'오동나무 관 비용' 제공하는 ${coffinStats.hall_count}개 장례식장 실시간 평균 비용`,
            };
          }
          if (sub.label.includes('나무 유골함') && urnStats?.wood) {
            return {
              ...sub,
              price: urnStats.wood.median_amount,
              note: `'나무 유골함 비용' 제공하는 ${urnStats.wood.hall_count}개 장례식장 실시간 평균 비용`,
            };
          }
          if (sub.label.includes('도자기 유골함') && urnStats?.ceramic) {
            return {
              ...sub,
              price: urnStats.ceramic.median_amount,
              note: `'도자기 유골함 비용' 제공하는 ${urnStats.ceramic.hall_count}개 장례식장 실시간 평균 비용`,
            };
          }
          if (sub.label.includes('영정사진') && portraitStats) {
            return {
              ...sub,
              price: portraitStats.median_amount,
              note: `'영정사진 비용' 제공하는 ${portraitStats.hall_count}개 장례식장 실시간 평균 비용`,
            };
          }
          return sub;
        });
        const newPrice = newSubs.reduce((s, sub) => s + (sub.price ?? 0), 0);
        return { ...item, items: newSubs, price: newPrice };
      }),
    [
      makeupStats,
      shroudStats,
      mourningStats,
      vehicleStats,
      directorStats,
      coffinStats,
      urnStats,
      portraitStats,
    ],
  );

  const toggleSangjoKey = (key: string) => {
    setUnselectedSangjoKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const [guestCount, setGuestCount] = useState(120);

  // Contact step
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

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
              const resultStep = fc === '3day' ? 6 : 5;
              setStep(resultStep);
            }
          }
        });
    }
  }, [searchParams]);

  // ── 결과 화면에서 URL 쿼리 파라미터 업데이트 ──
  const syncQueryParams = useCallback(() => {
    if (!selectedHall || !funeralType) return;
    const resultStep = funeralType === '3day' ? 6 : 5;
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
  const totalSteps = funeralType === '3day' ? 6 : 5;
  const resultStep = funeralType === '3day' ? 6 : 5;
  const contactStep = funeralType === '3day' ? 5 : 4;

  // 뒤로가기
  const goBack = useCallback(() => {
    if (step === 1) {
      onClose();
      return;
    }
    // 무빈소: contact step(4)에서 뒤로가면 step 3
    if (funeralType === 'nobinso' && step === contactStep) {
      setStep(3);
    } else {
      setStep(step - 1);
    }
  }, [step, funeralType, contactStep, onClose]);

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
    setCheckedEncoffinIndexes([]);
    setCheckedMortuaryIndexes([]);
    setUnselectedSangjoKeys(createInitialUnselectedSangjoKeys());
    setSangjoQuantities({});
    setGuestCount(120);
    setName('');
    setPhone('');
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

  // 염습/입관 — service_items에서 조회
  const encoffinCategoryItems = selectedHall?.service_items
    ? selectedHall.service_items.filter(
        (f) => f.판매여부 === 'Y' && f.품종 === '염습/입관',
      )
    : [];

  // 안치실이용료 — facility_fees에서 조회
  const mortuaryCategoryItems = selectedHall
    ? selectedHall.facility_fees.filter(
        (f) => f.판매여부 === 'Y' && f.품종 === '안치실이용료',
      )
    : [];

  // 결과 화면 진입 시 염습/입관 '일반' 항목 자동 체크
  const encoffinAutoCheckedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedHall) return;
    if (step !== resultStep) return;
    const key = selectedHall.facility_cd;
    if (encoffinAutoCheckedRef.current === key) return;
    if (encoffinCategoryItems.length === 0) return;
    const idx = encoffinCategoryItems.findIndex((f) => f.품종상세 === '일반');
    if (idx >= 0 && checkedEncoffinIndexes.length === 0) {
      setCheckedEncoffinIndexes([idx]);
    }
    encoffinAutoCheckedRef.current = key;
  }, [
    selectedHall,
    step,
    resultStep,
    encoffinCategoryItems,
    checkedEncoffinIndexes.length,
  ]);

  // 결과 화면 진입 시 안치실 최저가 항목 자동 체크
  const mortuaryAutoCheckedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedHall) return;
    if (step !== resultStep) return;
    const key = selectedHall.facility_cd;
    if (mortuaryAutoCheckedRef.current === key) return;
    if (mortuaryCategoryItems.length === 0) return;
    let minIdx = 0;
    for (let i = 1; i < mortuaryCategoryItems.length; i++) {
      if (mortuaryCategoryItems[i].요금 < mortuaryCategoryItems[minIdx].요금) {
        minIdx = i;
      }
    }
    if (checkedMortuaryIndexes.length === 0) {
      setCheckedMortuaryIndexes([minIdx]);
    }
    mortuaryAutoCheckedRef.current = key;
  }, [
    selectedHall,
    step,
    resultStep,
    mortuaryCategoryItems,
    checkedMortuaryIndexes.length,
  ]);

  // 비용 계산
  const calcResult = useCallback(() => {
    if (!selectedHall) return null;
    const isMetro = METRO_SIDO.includes(selectedHall.sido_cd);
    const costs = isMetro ? METRO_COSTS : NON_METRO_COSTS;

    // 입관실 사용료 lookup: 1) 염습/입관 '일반' 카테고리, 2) 시설임대료 입관, 3) 평균
    const defaultEncoffinIdx = encoffinCategoryItems.findIndex(
      (f) => f.품종상세 === '일반',
    );
    const encoffinFromCategory =
      defaultEncoffinIdx >= 0
        ? encoffinCategoryItems[defaultEncoffinIdx]
        : undefined;
    const encoffinFromFacility = selectedHall.facility_fees.find(
      (f) =>
        f.판매여부 === 'Y' &&
        f.품종 === '시설임대료' &&
        f.품명.includes('입관'),
    );
    let encoffin: number;
    let encoffinIsAvg: boolean;
    if (encoffinFromCategory) {
      encoffin = encoffinFromCategory.요금;
      encoffinIsAvg = false;
    } else if (encoffinFromFacility) {
      encoffin = encoffinFromFacility.요금;
      encoffinIsAvg = false;
    } else {
      encoffin = costs.encoffin;
      encoffinIsAvg = true;
    }

    // 염습/입관 추가 선택 (기본 입관실 외 체크한 항목)
    const extraEncoffinItems = checkedEncoffinIndexes
      .filter((i) => i !== defaultEncoffinIdx)
      .map((i) => encoffinCategoryItems[i])
      .filter((f): f is FacilityFee => Boolean(f));
    const extraEncoffinTotal = extraEncoffinItems.reduce(
      (s, f) => s + f.요금,
      0,
    );

    const computeSangjoTotal = (items: SangjoItem[]) =>
      items.reduce((sum, item, i) => {
        if (item.items && item.items.length > 0) {
          return (
            sum +
            item.items.reduce((s, sub, j) => {
              const key = `${i}:${j}`;
              if (unselectedSangjoKeys.has(key)) return s;
              const qty = sangjoQuantities[key] ?? 1;
              return s + (sub.price ?? 0) * qty;
            }, 0)
          );
        }
        if (unselectedSangjoKeys.has(String(i))) return sum;
        return sum + item.price;
      }, 0);

    if (funeralType === 'nobinso') {
      const transfer = costs.transfer;
      const mortuary = costs.mortuary;
      const basicTotal = transfer + mortuary + encoffin + extraEncoffinTotal;
      const sangjoTotal = computeSangjoTotal(
        applyMakeupStats(SANGJO_ITEMS_NOBINSO),
      );
      const total = basicTotal + sangjoTotal;
      return {
        funeralType: 'nobinso' as const,
        isMetro,
        transfer,
        mortuary,
        mortuaryUnit: '',
        mortuaryIsAvg: true,
        mortuarySource: undefined as FacilityFee | undefined,
        encoffin,
        encoffinIsAvg,
        extraEncoffinItems,
        extraMortuaryItems: [] as FacilityFee[],
        selectedFacilityItems: [] as FacilityFee[],
        selectedEncoffinItems: encoffinFromCategory
          ? [encoffinFromCategory, ...extraEncoffinItems]
          : extraEncoffinItems,
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
    const facilityFee = checkedFeeIndexes.reduce((sum, idx) => {
      const fee = facilityFeeItems[idx];
      if (!fee) return sum;
      return sum + fee.요금 * getFeeMultiplier(fee).multiplier;
    }, 0);

    // 안치실 사용료 lookup: 1) 체크된 항목, 2) 안치실이용료 카테고리 최저가, 3) facility_fees 안치, 4) 평균
    const checkedMortuaryItem =
      checkedMortuaryIndexes.length > 0
        ? mortuaryCategoryItems[checkedMortuaryIndexes[0]]
        : undefined;
    const cheapestMortuaryItem =
      mortuaryCategoryItems.length > 0
        ? mortuaryCategoryItems.reduce((min, f) =>
            f.요금 < min.요금 ? f : min,
          )
        : undefined;
    const mortuaryFromFacility = !cheapestMortuaryItem
      ? selectedHall.facility_fees.find(
          (f) =>
            f.판매여부 === 'Y' &&
            f.품종 !== '안치실이용료' &&
            f.품명.includes('안치'),
        )
      : undefined;
    const mortuarySource =
      checkedMortuaryItem ?? cheapestMortuaryItem ?? mortuaryFromFacility;
    const mortuaryUnit = mortuarySource
      ? getFeeMultiplier(mortuarySource).unitLabel
      : '';
    const mortuary = mortuarySource
      ? mortuarySource.요금 * getFeeMultiplier(mortuarySource).multiplier
      : costs.mortuary;
    const extraMortuaryItems: FacilityFee[] = [];
    const extraMortuaryTotal = 0;

    const transfer = costs.transfer;
    const food = costs.food * guestCount;
    const basicTotal =
      facilityFee +
      encoffin +
      transfer +
      mortuary +
      food +
      extraEncoffinTotal +
      extraMortuaryTotal;
    const sangjoTotal = computeSangjoTotal(applyMakeupStats(SANGJO_ITEMS_3DAY));
    const total = basicTotal + sangjoTotal;

    const selectedFacilityItems = checkedFeeIndexes
      .map((i) => facilityFeeItems[i])
      .filter((f): f is FacilityFee => Boolean(f));
    const selectedEncoffinItems = [
      ...(encoffinFromCategory ? [encoffinFromCategory] : []),
      ...extraEncoffinItems,
    ];

    return {
      funeralType: '3day' as const,
      isMetro,
      transfer,
      mortuary,
      mortuaryUnit,
      mortuaryIsAvg: !mortuarySource,
      mortuarySource,
      encoffin,
      encoffinIsAvg,
      extraEncoffinItems,
      extraMortuaryItems,
      selectedFacilityItems,
      selectedEncoffinItems,
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
    checkedEncoffinIndexes,
    checkedMortuaryIndexes,
    encoffinCategoryItems,
    mortuaryCategoryItems,
    guestCount,
    unselectedSangjoKeys,
    sangjoQuantities,
    applyMakeupStats,
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
                    onClick={() => {
                      setSido('');
                      setGungu('');
                      setSelectedHall(null);
                    }}
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
                        setStep(contactStep);
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
            </div>
          )}

          {/* ── Contact step: 이름 + 전화번호 ── */}
          {step === contactStep && selectedHall && (
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                선택하신 장례식장 정보와
                <br />
                주변 장지까지 함께 보내드려요.
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {selectedHall.company_name}
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    이름
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력해주세요"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="숫자만 입력해주세요 (예: 01012345678)"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── 결과 ── */}
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
                  <div className="text-center mb-4 mt-4">
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

                  {/* 선택 정보 */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-600">
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

                  {/* ── 장례식장 기본 비용 ── */}
                  {(() => {
                    const facilityFeeItems = selectedHall.facility_fees.filter(
                      (f) => f.판매여부 === 'Y' && f.품종 === '시설임대료',
                    );
                    const checkedDetails = checkedFeeIndexes
                      .map((i) => facilityFeeItems[i])
                      .filter((f): f is FacilityFee => Boolean(f))
                      .map((f) => ({ fee: f, ...getFeeMultiplier(f) }));
                    const checkedTotal = checkedDetails.reduce(
                      (sum, d) => sum + d.fee.요금 * d.multiplier,
                      0,
                    );
                    const allHourly =
                      checkedDetails.length > 0 &&
                      checkedDetails.every((d) => d.multiplier === 48);
                    const allDaily =
                      checkedDetails.length > 0 &&
                      checkedDetails.every((d) => d.multiplier === 3);
                    const unitLabel = allHourly
                      ? '24시간 x 2일'
                      : allDaily
                        ? '3일'
                        : '';
                    const hasBinsoSelected =
                      funeralType === '3day' && checkedFeeIndexes.length > 0;

                    return (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-base font-bold text-gray-700">
                            장례식장 이용료
                          </p>
                          <p
                            className="text-base font-bold"
                            style={{ color: BRAND_COLOR }}
                          >
                            {result.basicTotal.toLocaleString()}원
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 -mt-2 mb-4 mt-2 pl-1">
                          * <span className="font-semibold">실제비용</span>은
                          아래{' '}
                          <span className="font-semibold">‘전부 확인하기’</span>{' '}
                          버튼을 눌러 세부 항목과 금액을 한 번 더 확인해 주세요.
                        </p>
                        <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                          {funeralType === '3day' && (
                            <div className="px-4 py-2.5 border-b border-gray-100">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold">
                                    필수
                                  </span>
                                  빈소 사용료{' '}
                                  <span className="text-xs text-gray-500">
                                    (2일)
                                  </span>
                                </span>
                                {hasBinsoSelected ? (
                                  <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                                    <span
                                      className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-white"
                                      style={{ backgroundColor: BRAND_COLOR }}
                                    >
                                      실제비용
                                    </span>
                                    {checkedTotal.toLocaleString()}원
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                                    선택 필요
                                  </span>
                                )}
                              </div>
                              {result.selectedFacilityItems?.map((f, i) => (
                                <p
                                  key={`bs-${i}`}
                                  className="text-xs text-gray-400 mt-1 pl-6"
                                >
                                  ㄴ {f.품명}
                                </p>
                              ))}
                              <button
                                onClick={() => {
                                  setFeeListOpen(true);
                                  setTimeout(() => {
                                    document
                                      .getElementById('fc-table-binso')
                                      ?.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start',
                                      });
                                  }, 0);
                                }}
                                className="mt-2 ml-6 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
                              >
                                빈소 전부 확인하기
                              </button>
                            </div>
                          )}
                          <div className="px-4 py-2.5 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold">
                                  필수
                                </span>
                                안치실 이용료{' '}
                                <span className="text-xs text-gray-500">
                                  (2일)
                                </span>
                              </span>
                              <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                                {result.mortuaryIsAvg ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                                    평균비용
                                  </span>
                                ) : (
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-white"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                  >
                                    실제비용
                                  </span>
                                )}
                                {result.mortuary.toLocaleString()}원
                              </span>
                            </div>
                            {result.mortuarySource && (
                              <p className="text-xs text-gray-400 mt-1 pl-6">
                                ㄴ {result.mortuarySource.품명}
                              </p>
                            )}
                            {!result.mortuaryIsAvg &&
                              mortuaryCategoryItems.length > 0 && (
                                <button
                                  onClick={() => {
                                    setMortuaryListOpen(true);
                                    setTimeout(() => {
                                      document
                                        .getElementById('fc-table-mortuary')
                                        ?.scrollIntoView({
                                          behavior: 'smooth',
                                          block: 'start',
                                        });
                                    }, 0);
                                  }}
                                  className="mt-2 ml-6 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
                                >
                                  안치실 전부 확인하기
                                </button>
                              )}
                          </div>
                          <div className="px-4 py-2.5 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 flex items-center gap-1.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold">
                                  필수
                                </span>
                                염습/입관
                              </span>
                              <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                                {result.encoffinIsAvg ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                                    평균비용
                                  </span>
                                ) : (
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-white"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                  >
                                    실제비용
                                  </span>
                                )}
                                {(
                                  result.encoffin +
                                  (result.extraEncoffinItems?.reduce(
                                    (s, f) => s + f.요금,
                                    0,
                                  ) ?? 0)
                                ).toLocaleString()}
                                원
                              </span>
                            </div>
                            {result.selectedEncoffinItems?.map((f, i) => (
                              <p
                                key={`en-${i}`}
                                className="text-xs text-gray-400 mt-1 pl-6"
                              >
                                ㄴ {f.품명}
                              </p>
                            ))}
                            {!result.encoffinIsAvg &&
                              encoffinCategoryItems.length > 0 && (
                                <button
                                  onClick={() => {
                                    setEncoffinListOpen(true);
                                    setTimeout(() => {
                                      document
                                        .getElementById('fc-table-encoffin')
                                        ?.scrollIntoView({
                                          behavior: 'smooth',
                                          block: 'start',
                                        });
                                    }, 0);
                                  }}
                                  className="mt-2 ml-6 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
                                >
                                  염습/입관 전부 확인하기
                                </button>
                              )}
                          </div>
                          <div className="px-4 py-2.5 flex justify-between items-center border-b border-gray-100">
                            <span className="text-gray-600 flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold">
                                필수
                              </span>
                              고인 이송비
                            </span>
                            <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                                평균비용
                              </span>
                              {result.transfer.toLocaleString()}원
                            </span>
                          </div>
                          {funeralType === '3day' && (
                            <div className="px-4 py-2.5 flex justify-between items-center">
                              <span className="text-gray-600 flex items-center gap-1.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold">
                                  필수
                                </span>
                                음식비 ({guestCount}명 x{' '}
                                {(result.isMetro
                                  ? METRO_COSTS
                                  : NON_METRO_COSTS
                                ).food.toLocaleString()}
                                원)
                              </span>
                              <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                                  평균비용
                                </span>
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
                    const sangjoItems = applyMakeupStats(
                      isNobinso ? SANGJO_ITEMS_NOBINSO : SANGJO_ITEMS_3DAY,
                    );

                    return (
                      <div className="mt-6 mb-5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-base font-bold text-gray-700">
                            장례식장 상조비용
                          </p>
                          <p
                            className="text-base font-bold flex items-center gap-1.5"
                            style={{ color: BRAND_COLOR }}
                          >
                            {result.sangjoTotal.toLocaleString()}원
                          </p>
                        </div>
                        <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                          {sangjoItems.map((item, i) => {
                            const hasSubs = !!item.items?.length;
                            const parentKey = String(i);
                            const parentSelected = hasSubs
                              ? item.items!.some(
                                  (_, j) =>
                                    !unselectedSangjoKeys.has(`${i}:${j}`),
                                )
                              : !unselectedSangjoKeys.has(parentKey);
                            const parentTotal = hasSubs
                              ? item.items!.reduce((s, sub, j) => {
                                  const key = `${i}:${j}`;
                                  if (unselectedSangjoKeys.has(key)) return s;
                                  const qty = sangjoQuantities[key] ?? 1;
                                  return s + (sub.price ?? 0) * qty;
                                }, 0)
                              : parentSelected
                                ? item.price
                                : 0;
                            return (
                              <div
                                key={i}
                                className={`px-4 py-4 text-gray-600 ${i < sangjoItems.length - 1 ? 'border-b border-gray-100' : ''}`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (hasSubs) {
                                      setUnselectedSangjoKeys((prev) => {
                                        const next = new Set(prev);
                                        if (parentSelected) {
                                          item.items!.forEach((_, j) =>
                                            next.add(`${i}:${j}`),
                                          );
                                        } else {
                                          item.items!.forEach((_, j) =>
                                            next.delete(`${i}:${j}`),
                                          );
                                        }
                                        return next;
                                      });
                                    } else {
                                      toggleSangjoKey(parentKey);
                                    }
                                  }}
                                  className="w-full flex justify-between items-center cursor-pointer text-left"
                                >
                                  <span className="flex items-center gap-2">
                                    <span
                                      className="w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0"
                                      style={{
                                        borderColor: parentSelected
                                          ? BRAND_COLOR
                                          : '#d1d5db',
                                        backgroundColor: parentSelected
                                          ? BRAND_COLOR
                                          : 'transparent',
                                      }}
                                    >
                                      {parentSelected && (
                                        <Check className="w-3 h-3 text-white" />
                                      )}
                                    </span>
                                    {item.label}
                                  </span>
                                  <span className="font-semibold text-gray-900">
                                    {parentTotal.toLocaleString()}원
                                  </span>
                                </button>
                                {item.items?.map((sub, j) => {
                                  const subKey = `${i}:${j}`;
                                  const subSelected =
                                    !unselectedSangjoKeys.has(subKey);
                                  const supportsQty = /1벌|1대/.test(sub.label);
                                  const qty = sangjoQuantities[subKey] ?? 1;
                                  return (
                                    <div key={j}>
                                      <div className="w-full mt-3 pl-4 flex items-center gap-2 text-[13px]">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            toggleSangjoKey(subKey)
                                          }
                                          className="flex items-center gap-2 cursor-pointer text-left flex-1 min-w-0"
                                        >
                                          <span
                                            className="w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center shrink-0"
                                            style={{
                                              borderColor: subSelected
                                                ? BRAND_COLOR
                                                : '#d1d5db',
                                              backgroundColor: subSelected
                                                ? BRAND_COLOR
                                                : 'transparent',
                                            }}
                                          >
                                            {subSelected && (
                                              <Check className="w-2.5 h-2.5 text-white" />
                                            )}
                                          </span>
                                          <span
                                            className={
                                              subSelected
                                                ? 'text-gray-600'
                                                : 'text-gray-400 line-through'
                                            }
                                          >
                                            {sub.label}
                                            {typeof sub.price === 'number' && (
                                              <span
                                                className={`ml-1 font-bold ${subSelected ? 'text-gray-900' : 'text-gray-400'}`}
                                              >
                                                {sub.price.toLocaleString()}원
                                                {supportsQty && qty > 1 && (
                                                  <span className="ml-1 text-gray-500 font-normal">
                                                    × {qty} ={' '}
                                                    {(
                                                      sub.price * qty
                                                    ).toLocaleString()}
                                                    원
                                                  </span>
                                                )}
                                              </span>
                                            )}
                                          </span>
                                        </button>
                                        {supportsQty && subSelected && (
                                          <div className="shrink-0 flex items-center gap-1.5 border border-gray-200 rounded-full px-1 py-0.5">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setSangjoQuantities((prev) => ({
                                                  ...prev,
                                                  [subKey]: Math.max(
                                                    1,
                                                    (prev[subKey] ?? 1) - 1,
                                                  ),
                                                }))
                                              }
                                              disabled={qty <= 1}
                                              className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-sm leading-none"
                                            >
                                              −
                                            </button>
                                            <span className="text-xs font-semibold text-gray-900 min-w-[1ch] text-center">
                                              {qty}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setSangjoQuantities((prev) => ({
                                                  ...prev,
                                                  [subKey]:
                                                    (prev[subKey] ?? 1) + 1,
                                                }))
                                              }
                                              className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer text-sm leading-none"
                                            >
                                              +
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                      {sub.note ? (
                                        <div className="mt-2 ml-[1.4rem]">
                                          <div className="flex items-start gap-1.5">
                                            <span className="text-[11px] text-gray-400 leading-relaxed">
                                              ㄴ
                                            </span>
                                            <span className="inline-flex items-center text-[11px] font-semibold leading-relaxed px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                              {sub.note
                                                .split('\n')[0]
                                                .split(
                                                  /(\d{1,3}(?:,\d{3})*(?:건|개|원))/,
                                                )
                                                .map((part, k) =>
                                                  /^\d{1,3}(?:,\d{3})*(?:건|개|원)$/.test(
                                                    part,
                                                  ) ? (
                                                    <span
                                                      key={k}
                                                      className="font-extrabold mx-0.5"
                                                      style={{
                                                        color:
                                                          LIVE_LABEL_HIGHLIGHT,
                                                      }}
                                                    >
                                                      {part}
                                                    </span>
                                                  ) : (
                                                    <React.Fragment key={k}>
                                                      {part}
                                                    </React.Fragment>
                                                  ),
                                                )}
                                            </span>
                                          </div>
                                          {sub.note
                                            .split('\n')
                                            .slice(1)
                                            .map((line, k) => (
                                              <p
                                                key={k}
                                                className="mt-1 ml-3 text-[11px] text-gray-400 leading-relaxed"
                                              >
                                                {line}
                                              </p>
                                            ))}
                                        </div>
                                      ) : hasLiveStatsLabel(sub.label) ? (
                                        <div
                                          className="mt-2 ml-[1.4rem]"
                                          aria-busy="true"
                                          aria-label="실시간 평균 비용 불러오는 중"
                                        >
                                          <div className="flex items-start gap-1.5">
                                            <span className="text-[11px] text-gray-400 leading-relaxed">
                                              ㄴ
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold leading-relaxed px-2 py-0.5 rounded-full bg-gray-100">
                                              <span className="inline-block h-2.5 w-24 rounded-full bg-gray-200 animate-pulse" />
                                              <span className="inline-block h-2.5 w-10 rounded-full bg-gray-200 animate-pulse" />
                                            </span>
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 시설 사용료 전체 리스트 — 체크박스로 선택 (3일장만) */}
                  {funeralType === '3day' &&
                    (() => {
                      const facilityFeeItems =
                        selectedHall.facility_fees.filter(
                          (f) => f.판매여부 === 'Y' && f.품종 === '시설임대료',
                        );
                      const checkedTotal = checkedFeeIndexes.reduce(
                        (sum, idx) => {
                          const f = facilityFeeItems[idx];
                          if (!f) return sum;
                          return sum + f.요금 * getFeeMultiplier(f).multiplier;
                        },
                        0,
                      );

                      return (
                        <div
                          id="fc-table-binso"
                          className="relative border border-gray-200 rounded-xl overflow-hidden mb-4 scroll-mt-4"
                        >
                          {/* 아코디언 헤더 */}
                          <button
                            onClick={() => setFeeListOpen(!feeListOpen)}
                            className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex flex-col items-start gap-0.5">
                              <span className="text-sm font-bold text-gray-700">
                                시설 사용료
                              </span>
                              <span className="text-xs">
                                (빈소와 접객실이 분리되어 있는 경우에는 2개를
                                선택해주세요)
                              </span>
                              {checkedFeeIndexes.length > 0 && (
                                <span
                                  className="text-xs font-semibold"
                                  style={{ color: BRAND_COLOR }}
                                >
                                  선택 합계: {checkedTotal.toLocaleString()}원
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

                  {/* 안치실이용료 항목 — 데이터 있을 때만 노출 */}
                  {mortuaryCategoryItems.length > 0 && (
                    <div
                      id="fc-table-mortuary"
                      className="border border-gray-200 rounded-xl overflow-hidden mb-4 scroll-mt-4"
                    >
                      <button
                        onClick={() => setMortuaryListOpen(!mortuaryListOpen)}
                        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="text-sm font-bold text-gray-700">
                            안치실 이용료
                          </span>
                          {checkedMortuaryIndexes.length > 0 && (
                            <span
                              className="text-xs font-semibold"
                              style={{ color: BRAND_COLOR }}
                            >
                              선택 합계:{' '}
                              {checkedMortuaryIndexes
                                .reduce(
                                  (s, i) =>
                                    s + (mortuaryCategoryItems[i]?.요금 ?? 0),
                                  0,
                                )
                                .toLocaleString()}
                              원
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          className="w-5 h-5 text-gray-400 shrink-0 transition-transform"
                          style={{
                            transform: mortuaryListOpen
                              ? 'rotate(180deg)'
                              : 'rotate(0)',
                          }}
                        />
                      </button>
                      {mortuaryListOpen &&
                        (() => {
                          let cheapestIdx = 0;
                          for (
                            let i = 1;
                            i < mortuaryCategoryItems.length;
                            i++
                          ) {
                            if (
                              mortuaryCategoryItems[i].요금 <
                              mortuaryCategoryItems[cheapestIdx].요금
                            ) {
                              cheapestIdx = i;
                            }
                          }
                          const effectiveIdx =
                            checkedMortuaryIndexes.length > 0
                              ? checkedMortuaryIndexes[0]
                              : cheapestIdx;
                          return mortuaryCategoryItems.map((fee, idx) => {
                            const isChecked = effectiveIdx === idx;
                            const desc =
                              fee.임대내용 ||
                              (typeof fee['서비스내용'] === 'string'
                                ? (fee['서비스내용'] as string)
                                : '');
                            return (
                              <button
                                key={idx}
                                onClick={() => setCheckedMortuaryIndexes([idx])}
                                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm border-t border-gray-100 text-left cursor-pointer transition-colors"
                                style={
                                  isChecked
                                    ? { backgroundColor: '#e8eddf' }
                                    : undefined
                                }
                              >
                                <div
                                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
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
                                <div className="min-w-0 flex-1">
                                  <span
                                    className={
                                      isChecked
                                        ? 'font-bold text-gray-900'
                                        : 'text-gray-600'
                                    }
                                  >
                                    {fee.품명}
                                  </span>
                                  {desc && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      {desc}
                                    </p>
                                  )}
                                </div>
                                <span
                                  className={`shrink-0 ml-3 ${isChecked ? 'font-bold text-gray-900' : 'text-gray-500'}`}
                                >
                                  {fee.요금_표시}원
                                </span>
                              </button>
                            );
                          });
                        })()}
                    </div>
                  )}

                  {/* 염습/입관 항목 — 데이터 있을 때만 노출 */}
                  {encoffinCategoryItems.length > 0 && (
                    <div
                      id="fc-table-encoffin"
                      className="border border-gray-200 rounded-xl overflow-hidden mb-4 scroll-mt-4"
                    >
                      <button
                        onClick={() => setEncoffinListOpen(!encoffinListOpen)}
                        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="text-sm font-bold text-gray-700">
                            염습/입관
                          </span>
                          {(() => {
                            const defaultIdx = encoffinCategoryItems.findIndex(
                              (f) => f.품종상세 === '일반',
                            );
                            const effectiveIdxs =
                              checkedEncoffinIndexes.length > 0
                                ? checkedEncoffinIndexes
                                : defaultIdx >= 0
                                  ? [defaultIdx]
                                  : [];
                            if (effectiveIdxs.length === 0) return null;
                            const sum = effectiveIdxs.reduce(
                              (s, i) =>
                                s + (encoffinCategoryItems[i]?.요금 ?? 0),
                              0,
                            );
                            return (
                              <span
                                className="text-xs font-semibold"
                                style={{ color: BRAND_COLOR }}
                              >
                                선택 합계: {sum.toLocaleString()}원
                              </span>
                            );
                          })()}
                        </div>
                        <ChevronDown
                          className="w-5 h-5 text-gray-400 shrink-0 transition-transform"
                          style={{
                            transform: encoffinListOpen
                              ? 'rotate(180deg)'
                              : 'rotate(0)',
                          }}
                        />
                      </button>
                      {encoffinListOpen &&
                        (() => {
                          const defaultIdx = encoffinCategoryItems.findIndex(
                            (f) => f.품종상세 === '일반',
                          );
                          return encoffinCategoryItems.map((fee, idx) => {
                            const isManuallyChecked =
                              checkedEncoffinIndexes.includes(idx);
                            const isDefault = idx === defaultIdx;
                            // 수동 체크가 하나도 없으면 default 항목을 시각적으로 체크 처리
                            const isChecked =
                              isManuallyChecked ||
                              (checkedEncoffinIndexes.length === 0 &&
                                isDefault);
                            const desc =
                              fee.임대내용 ||
                              (typeof fee['서비스내용'] === 'string'
                                ? (fee['서비스내용'] as string)
                                : '');
                            return (
                              <button
                                key={idx}
                                onClick={() =>
                                  setCheckedEncoffinIndexes(
                                    isManuallyChecked
                                      ? checkedEncoffinIndexes.filter(
                                          (i) => i !== idx,
                                        )
                                      : [...checkedEncoffinIndexes, idx],
                                  )
                                }
                                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm border-t border-gray-100 text-left cursor-pointer transition-colors"
                                style={
                                  isChecked
                                    ? { backgroundColor: '#e8eddf' }
                                    : undefined
                                }
                              >
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
                                <div className="min-w-0 flex-1">
                                  <span
                                    className={
                                      isChecked
                                        ? 'font-bold text-gray-900'
                                        : 'text-gray-600'
                                    }
                                  >
                                    {fee.품명}
                                  </span>
                                  {desc && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      {desc}
                                    </p>
                                  )}
                                </div>
                                <span
                                  className={`shrink-0 ml-3 ${isChecked ? 'font-bold text-gray-900' : 'text-gray-500'}`}
                                >
                                  {fee.요금_표시}원
                                </span>
                              </button>
                            );
                          });
                        })()}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 text-center">
                    ※ 본 금액은 평균 데이터 기반 추정치이며, 실제 비용과 차이가
                    있을 수 있습니다.
                  </p>
                </div>
              );
            })()}
        </div>

        {/* 하단 고정 버튼 — Step 4 (빈소 규모) */}
        {step === 4 && funeralType === '3day' && (
          <button
            onClick={() => setStep(contactStep)}
            disabled={!selectedSize}
            className="shrink-0 w-full py-4 rounded-t-none sm:rounded-b-2xl text-white font-bold text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            다음
          </button>
        )}

        {/* 하단 고정 버튼 — Contact step */}
        {step === contactStep && selectedHall && (
          <button
            onClick={() => setStep(resultStep)}
            disabled={!name.trim() || phone.replace(/\D/g, '').length < 9}
            className="shrink-0 w-full py-4 rounded-t-none sm:rounded-b-2xl text-white font-bold text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            예상 비용 확인하기
          </button>
        )}

        {/* 하단 고정 버튼 (결과 화면에서만) */}
        {step === resultStep &&
          selectedHall &&
          (() => {
            const res = calcResult();
            const recommended = getRecommendedProduct(res?.total ?? 0);
            const discountPct =
              res && res.sangjoTotal > 0
                ? Math.round(
                    ((res.sangjoTotal - recommended.price) / res.sangjoTotal) *
                      100,
                  )
                : 0;
            return (
              <div
                className="shrink-0 border-t border-gray-100 bg-white px-4 sm:px-6 pt-3 pb-4 sm:pb-4"
                style={{
                  paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                }}
              >
                <div className="flex gap-3">
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
                    {recommended.name}로 평균 20% 할인 받기
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
