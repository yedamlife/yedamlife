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
  BarChart2,
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
  요금단위?: '시간당' | '24시간' | '48시간';
  [key: string]: unknown;
}

// DB JSON의 '평수_㎡' 키를 안전하게 읽기
function getAreaSqm(fee: FacilityFee): number | null {
  const v = fee['평수_㎡'];
  return typeof v === 'number' && v > 0 ? v : null;
}

// 사용료 단위 판별
// 1) DB의 명시 필드 fee.요금단위가 있으면 우선 사용
// 2) 없으면 임대내용/품명/서비스내용 키워드로 추정
function getFeeMultiplier(fee: FacilityFee): {
  multiplier: number;
  unitLabel: string;
} {
  if (fee.요금단위 === '시간당')
    return { multiplier: 48, unitLabel: '24시간 x 2일' };
  if (fee.요금단위 === '24시간') return { multiplier: 2, unitLabel: '2일' };
  if (fee.요금단위 === '48시간') return { multiplier: 1, unitLabel: '' };
  const raw = `${fee.임대내용 ?? ''} ${fee.품명 ?? ''} ${
    typeof fee['서비스내용'] === 'string' ? (fee['서비스내용'] as string) : ''
  }`;
  const desc = raw.replace(/\s/g, '');
  if (/시간당|1시간|시간\/회|\/[hH](?![a-zA-Z])/.test(desc)) {
    return { multiplier: 48, unitLabel: '24시간 x 2일' };
  }
  if (/24시간|일/.test(desc)) {
    return { multiplier: 2, unitLabel: '2일' };
  }
  if (/\d*회/.test(desc)) {
    return { multiplier: 1, unitLabel: '' };
  }
  return { multiplier: 2, unitLabel: '24시간' };
}

type FuneralType = '3day' | 'nobinso';
type CurrentSituation = 'preparing' | 'within_month' | 'within_days' | 'after';

const CURRENT_SITUATION_OPTIONS: { value: CurrentSituation; label: string }[] =
  [
    { value: 'preparing', label: '급하지 않지만 미리 알아보려고 해요.' },
    {
      value: 'within_month',
      label: '1주에서 한 달 정도 기간이 남은 것 같아요.',
    },
    { value: 'within_days', label: '임종이 며칠 남지 않았어요.' },
    { value: 'after', label: '임종하신 상태입니다.' },
  ];
type SizeKey = 'small' | 'medium' | 'large' | 'premium' | 'vip';

/* ─── 상수 ─── */
const METRO_SIDO = ['6110000', '6410000', '6280000'];

// 빈소 사용료 — 규모별 중간값 (2일 기준) / docs/비용/빈소사용료.md
const BINSO_MEDIAN: Record<string, { metro: number; non_metro: number }> = {
  small: { metro: 720000, non_metro: 600000 },
  medium: { metro: 1410000, non_metro: 1000000 },
  large: { metro: 2160000, non_metro: 1440000 },
  premium: { metro: 2460000, non_metro: 1800000 },
  vip: { metro: 3150000, non_metro: 2400000 },
};

const METRO_COSTS = {
  transfer: 300000,
  mortuary: 96000, // 수도권 안치실 이용료 중간값
  encoffin: 350000,
  food: 24000,
};
const NON_METRO_COSTS = {
  transfer: 200000,
  mortuary: 80000, // 수도권 외 안치실 이용료 중간값
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

/* ─── 장례식장 이용료 옵션 (제단 꽃 장식 / 제사 비용) ─── */
type FlowerDecorKey = 'normal' | 'special' | 'premium' | 'top';
type RitualKey = 'none' | 'formal' | 'simple' | 'christian';

const FLOWER_DECOR_OPTIONS: {
  key: FlowerDecorKey;
  label: string;
  price: number;
}[] = [
  { key: 'normal', label: '일반형 평균', price: 700000 },
  { key: 'special', label: '특선형 평균', price: 1000000 },
  { key: 'premium', label: '고급형 평균', price: 1500000 },
  { key: 'top', label: '최고급형 평균', price: 2000000 },
];

const RITUAL_OPTIONS: { key: RitualKey; label: string; price: number }[] = [
  { key: 'none', label: '제사 없음', price: 0 },
  { key: 'formal', label: '정식 제사 평균', price: 550000 },
  { key: 'simple', label: '약식 제사 평균', price: 280000 },
  { key: 'christian', label: '기독교 헌화 평균', price: 75000 },
];

/* ─── 평균 상조비용 상수 ─── */
type SangjoItem = {
  label: string;
  price: number;
  items?: {
    label: string;
    price?: number;
    note?: string;
    optional?: boolean;
  }[];
};

const SANGJO_ITEMS_NOBINSO: SangjoItem[] = [
  {
    label: '인력지원',
    price: 480000,
    items: [
      { label: '장례지도사 1명', price: 240000 },
      { label: '입관지도사 1명', price: 240000 },
    ],
  },
  {
    label: '장의차량',
    price: 900000,
    items: [
      { label: '장의버스 1대', price: 450000, optional: true },
      { label: '리무진 1대', price: 450000, optional: true },
    ],
  },
  {
    label: '수의',
    price: 250000,
    items: [
      { label: '기본수의', price: 250000 },
      { label: '면수의', price: 350000 },
      { label: '저마수의', price: 700000 },
      { label: '대마수의', price: 1000000 },
    ],
  },
  {
    label: '관',
    price: 290000,
    items: [
      { label: '오동나무 기본', price: 290000 },
      { label: '오동나무 맞춤 특관', price: 450000 },
      { label: '솔송나무(매장)', price: 1100000 },
      { label: '향나무(매장)', price: 1600000 },
    ],
  },
  {
    label: '고인 추가용품',
    price: 400000,
    items: [
      { label: '입관 꽃장식 평균', price: 150000, optional: true },
      { label: '고인메이크업 평균', price: 100000, optional: true },
      { label: '영정사진 평균', price: 150000, optional: true },
    ],
  },
  {
    label: '유골함',
    price: 350000,
    items: [
      { label: '도자기 유골함', price: 350000 },
      { label: '도자기 2중 진공함', price: 600000 },
      { label: '도자기 3중 진공함', price: 1200000 },
    ],
  },
];

const SANGJO_ITEMS_3DAY: SangjoItem[] = [
  // index 0
  {
    label: '전문도우미',
    price: 240000,
    items: [{ label: '전문도우미 1명 (1일당 120,000원)', price: 240000 }],
  },
  // index 1
  {
    label: '인력지원',
    price: 480000,
    items: [
      { label: '장례지도사 1명', price: 240000 },
      { label: '입관지도사 1명', price: 240000 },
    ],
  },
  // index 2
  {
    label: '장의차량',
    price: 900000,
    items: [
      { label: '장의버스 1대', price: 450000, optional: true },
      { label: '리무진 1대', price: 450000, optional: true },
    ],
  },
  // index 3
  {
    label: '수의',
    price: 250000,
    items: [
      { label: '기본수의', price: 250000 },
      { label: '면수의', price: 350000 },
      { label: '저마수의', price: 700000 },
      { label: '대마수의', price: 1000000 },
    ],
  },
  // index 4
  {
    label: '관',
    price: 290000,
    items: [
      { label: '오동나무 기본', price: 290000 },
      { label: '오동나무 맞춤 특관', price: 450000 },
      { label: '솔송나무(매장)', price: 1100000 },
      { label: '향나무(매장)', price: 1600000 },
    ],
  },
  // index 5
  {
    label: '고인 추가용품',
    price: 400000,
    items: [
      { label: '입관 꽃장식 평균', price: 150000, optional: true },
      { label: '고인메이크업 평균', price: 100000, optional: true },
      { label: '영정사진 평균', price: 150000, optional: true },
    ],
  },
  // index 6
  {
    label: '유골함',
    price: 350000,
    items: [
      { label: '도자기 유골함', price: 350000 },
      { label: '도자기 2중 진공함', price: 600000 },
      { label: '도자기 3중 진공함', price: 1200000 },
    ],
  },
  // index 7
  {
    label: '상복',
    price: 80000,
    items: [
      { label: '남자상복 1벌', price: 50000 },
      { label: '여자상복 1벌', price: 30000 },
    ],
  },
  // index 8
  {
    label: '수시비',
    price: 250000,
  },
  // index 9
  {
    label: '염습',
    price: 400000,
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
  '기본수의',
  '남자상복',
  '여자상복',
  '장의버스',
  '리무진',
  '장례지도사',
  '입관지도사',
  '오동나무 기본',
  '도자기 유골함',
  '영정사진',
] as const;

const hasLiveStatsLabel = (label: string): boolean =>
  LIVE_STATS_KEYWORDS.some((k) => label.includes(k));

// 라이브 라벨 안에서 강조할 숫자 색상 (파란색 계열).
const LIVE_LABEL_HIGHLIGHT = BRAND_COLOR;

// 단일 선택(라디오) 부모 라벨. 첫 번째 sub가 기본 선택, 나머지는 기본 비선택.
const RADIO_PARENT_LABELS: ReadonlySet<string> = new Set([
  '수의',
  '관',
  '유골함',
]);

// 부모 행 체크박스/토글 숨김 라벨. 하위 항목은 그대로 동작.
const HIDE_PARENT_CHECKBOX_LABELS: ReadonlySet<string> = new Set([
  '수의',
  '관',
  '고인 추가용품',
  '유골함',
  '장의차량',
]);

// 빈소 규모별 수의·관·유골함 기본 sub 인덱스
function getSangjoRadioDefaultSubIdx(
  parentLabel: string,
  size: SizeKey | null,
): number {
  if (parentLabel === '수의') {
    if (size === 'medium' || size === 'large') return 1; // 면수의
    if (size === 'premium') return 2; // 저마수의
    if (size === 'vip') return 3; // 대마수의
    return 0; // 기본수의 (소형/무빈소)
  }
  if (parentLabel === '관') {
    if (
      size === 'medium' ||
      size === 'large' ||
      size === 'premium' ||
      size === 'vip'
    )
      return 1; // 오동나무 맞춤 특관
    return 0; // 오동나무 기본
  }
  if (parentLabel === '유골함') {
    if (size === 'medium' || size === 'large') return 1; // 도자기 2중 진공함
    if (size === 'premium' || size === 'vip') return 2; // 도자기 3중 진공함
    return 0; // 도자기 유골함
  }
  return 0;
}

// 기본 선택 해제 키: size·funeralType에 따라 수의·관·유골함 기본 선택이 달라짐.
// funeralType에 맞는 항목 배열만 스캔해 인덱스 충돌을 방지한다.
const createInitialUnselectedSangjoKeys = (
  size: SizeKey | null = null,
  funeralType: FuneralType | null = null,
): Set<string> => {
  const set = new Set<string>();
  const items =
    funeralType === 'nobinso' ? SANGJO_ITEMS_NOBINSO : SANGJO_ITEMS_3DAY;
  items.forEach((item, i) => {
    if (RADIO_PARENT_LABELS.has(item.label) && item.items) {
      const defaultJ = getSangjoRadioDefaultSubIdx(item.label, size);
      item.items.forEach((_, j) => {
        if (j !== defaultJ) set.add(`${i}:${j}`);
      });
    }
  });
  return set;
};

const YEDAM_PRODUCTS = [
  {
    id: 'yedam-1',
    name: '예담 무빈소',
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
    maxCost: 9000000,
    features: [
      '장례지도사 1명 x 3일',
      '접객 도우미 6명',
      '장의버스/리무진 300km',
      '수의·관·유골함·빈소용품 포함',
      '운구 4인 지원',
    ],
  },
  {
    id: 'yedam-vip',
    name: '예담 VIP',
    price: 5800000,
    maxCost: Infinity,
    features: [
      '장례지도사 1명 x 3일',
      '접객 도우미 8명',
      '장의버스/리무진 400km',
      '수의·관·유골함·빈소용품 포함',
      '운구 6인 지원',
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
interface SnapshotUi {
  funeralType?: FuneralType;
  sido?: string;
  gungu?: string;
  facilityCd?: string;
  selectedSize?: SizeKey;
  guestCount?: number;
  checkedFeeIndexes?: number[];
  checkedEncoffinIndexes?: number[];
  checkedMortuaryIndexes?: number[];
  unselectedSangjoKeys?: string[];
  sangjoQuantities?: Record<string, number>;
  flowerDecor?: FlowerDecorKey;
  ritual?: RitualKey;
}

interface SnapshotSangjoStats {
  makeup?: {
    hall_count: number;
    avg_amount: number;
    median_amount: number;
  } | null;
  shroud?: {
    hall_count: number;
    avg_amount: number;
    median_amount: number;
  } | null;
  mourning?: {
    male: { hall_count: number; avg_amount: number; median_amount: number };
    female: { hall_count: number; avg_amount: number; median_amount: number };
  } | null;
  vehicle?: {
    hall_count: number;
    bus: { avg_amount: number; median_amount: number; sample_count: number };
    limo: { avg_amount: number; median_amount: number; sample_count: number };
  } | null;
  director?: {
    hall_count: number;
    hall_count_exact: number;
    avg_amount: number;
    median_amount: number;
  } | null;
  coffin?: {
    hall_count: number;
    avg_amount: number;
    median_amount: number;
  } | null;
  urn?: {
    hall_count: number;
    wood: { hall_count: number; avg_amount: number; median_amount: number };
    ceramic: { hall_count: number; avg_amount: number; median_amount: number };
  } | null;
  portrait?: {
    hall_count: number;
    avg_amount: number;
    median_amount: number;
  } | null;
  cleaning?: {
    metro: { hall_count: number; avg_amount: number };
    non_metro: { hall_count: number; avg_amount: number };
  } | null;
}

interface SnapshotResult {
  funeralType?: FuneralType;
  hall?: { facilityCd?: string; companyName?: string; fullAddress?: string };
  snapshot?: {
    facilityFeeTable?: FacilityFee[];
    mortuaryFeeTable?: FacilityFee[];
    serviceItems?: FacilityFee[];
    sangjoStats?: SnapshotSangjoStats;
  };
  uiSnapshot?: SnapshotUi;
}

interface FuneralCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 결과 URL 진입 시 기존 견적 UUID — 상담 요청 시 저장된 name/phone 회수에 사용
  initialEstimateUuid?: string;
  // 어드민에서 결과 화면을 그대로 열람할 때 사용 — 모든 인터랙션/CTA 비활성화
  viewOnly?: boolean;
  // 어드민 스냅샷 모드 — 저장된 result_json 으로 결과 화면을 그대로 재현
  snapshotResult?: SnapshotResult;
  // 이미 상담 신청이 완료된 결과 URL — 상담받기 CTA 만 비활성화 (다른 인터랙션은 가능)
  consultLocked?: boolean;
}

export function FuneralCostModal({
  isOpen,
  onClose,
  initialEstimateUuid,
  viewOnly = false,
  snapshotResult,
  consultLocked = false,
}: FuneralCostModalProps): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restoredRef = useRef(false);
  // initialEstimateUuid 가 있으면 결과 URL 진입으로 간주, 첫 렌더부터 step 1 대신 스켈레톤 노출
  const [enteredViaResultUrl, setEnteredViaResultUrl] =
    useState(!!initialEstimateUuid);

  // Steps
  const [step, setStep] = useState(1);

  // Step 1: 장례형태 + 현재 상황
  const [funeralType, setFuneralType] = useState<FuneralType | null>(null);
  const [currentSituation, setCurrentSituation] =
    useState<CurrentSituation | null>(null);

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
  // 수의·관·유골함은 첫 번째 sub만 선택, 나머지는 기본 비선택.
  const [unselectedSangjoKeys, setUnselectedSangjoKeys] = useState<Set<string>>(
    () => createInitialUnselectedSangjoKeys(),
  );

  // 장례식장 이용료 — 제단 꽃 장식 / 제사 비용 단일 선택
  const [flowerDecor, setFlowerDecor] = useState<FlowerDecorKey>('normal');
  const [ritual, setRitual] = useState<RitualKey>('none');

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

  // 청소비 통계 (수도권/비수도권 분리)
  const [cleaningStats, setCleaningStats] = useState<{
    metro: { hall_count: number; avg_amount: number };
    non_metro: { hall_count: number; avg_amount: number };
  } | null>(null);

  // 상조 항목 수량 (key: "i:j" → 수량, 기본 1)
  // 3일장 전문도우미(index 0): 1명(0:0)=2 기본 셋팅
  // 3일장 상복(index 7): 남자상복(7:0)=4, 여자상복(7:1)=4 기본 셋팅
  const DEFAULT_SANGJO_QUANTITIES: Record<string, number> = {
    '0:0': 2,
    '7:0': 4,
    '7:1': 4,
  };
  // 항목별 최소 수량 (key: "i:j"). 미지정 시 1.
  const MIN_SANGJO_QUANTITIES: Record<string, number> = {
    '0:0': 2, // 전문도우미 최소 2명
  };
  const [sangjoQuantities, setSangjoQuantities] = useState<
    Record<string, number>
  >({ ...DEFAULT_SANGJO_QUANTITIES });

  // 빈소 규모가 바뀌면 수의·관·유골함 기본 선택을 규모에 맞게 리셋
  // viewOnly·snapshotResult 모드에서는 저장된 unselectedSangjoKeys 를 보존해야 하므로 스킵.
  useEffect(() => {
    if (viewOnly || snapshotResult) return;
    setUnselectedSangjoKeys(createInitialUnselectedSangjoKeys(selectedSize));
  }, [selectedSize, viewOnly, snapshotResult]);

  // 빈소 규모가 바뀌면 전문도우미 기본 인원도 규모에 맞게 리셋
  useEffect(() => {
    if (viewOnly || snapshotResult) return;
    const helperCount =
      selectedSize === 'large' || selectedSize === 'premium'
        ? 4
        : selectedSize === 'vip'
          ? 5
          : 2; // 소형·중형·무빈소
    setSangjoQuantities((prev) => ({ ...prev, '0:0': helperCount }));
  }, [selectedSize, viewOnly, snapshotResult]);

  useEffect(() => {
    if (!isOpen) return;
    // 어드민 스냅샷 모드 — 상담 시점 통계가 result_json 에 박혀 있으면 실시간 호출 금지
    if (snapshotResult?.snapshot?.sangjoStats) return;
    if (
      makeupStats &&
      shroudStats &&
      mourningStats &&
      vehicleStats &&
      directorStats &&
      coffinStats &&
      urnStats &&
      portraitStats &&
      cleaningStats
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
        if (j.data.cleaning) setCleaningStats(j.data.cleaning);
      })
      .catch(() => {});
  }, [
    isOpen,
    snapshotResult,
    makeupStats,
    shroudStats,
    mourningStats,
    vehicleStats,
    directorStats,
    coffinStats,
    urnStats,
    portraitStats,
    cleaningStats,
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
              note: `메이크업 비용을 공개하는 ${makeupStats.hall_count}개 장례식장의 정보를 예담라이프가 실시간 분석해 제공합니다.`,
            };
          }
          // 수의 — 모든 옵션에 통계 라벨 부여 (선택 옵션 무관)
          if (item.label === '수의' && shroudStats) {
            const note = `수의 비용을 공개하는 ${shroudStats.hall_count}개 장례식장의 정보를 예담라이프가 실시간 분석해 제공합니다.`;
            if (sub.label === '기본수의') {
              return { ...sub, price: shroudStats.avg_amount, note };
            }
            return { ...sub, note };
          }
          if (sub.label.includes('남자상복') && mourningStats?.male) {
            return {
              ...sub,
              price: 50000,
              note: `남자상복 비용을 공개하는 ${mourningStats.male.hall_count}개 장례식장의 정보를 예담라이프가 실시간 분석해 제공합니다.`,
            };
          }
          if (sub.label.includes('여자상복') && mourningStats?.female) {
            return {
              ...sub,
              price: 30000,
              note: `여자상복 비용을 공개하는 ${mourningStats.female.hall_count}개 장례식장의 정보를 예담라이프가 실시간 분석해 제공합니다.`,
            };
          }
          if (sub.label.includes('장의버스') && vehicleStats) {
            return {
              ...sub,
              price: vehicleStats.bus.median_amount,
              note: `장의버스 비용을 공개하는 ${vehicleStats.hall_count}개 장례식장의 정보를 예담라이프가 실시간 분석해 제공합니다.`,
            };
          }
          if (sub.label.includes('리무진') && vehicleStats) {
            return {
              ...sub,
              price: vehicleStats.limo.median_amount,
              note: `리무진 비용을 공개하는 ${vehicleStats.hall_count}개 장례식장의 정보를 예담라이프가 실시간 분석해 제공합니다.`,
            };
          }
          if (sub.label.includes('장례지도사') && directorStats) {
            return {
              ...sub,
              price: directorStats.median_amount,
              note: `장례지도사 비용을 공개하는 ${directorStats.hall_count}개 장례식장의 정보를 예담라이프가 실시간 분석해 제공합니다.`,
            };
          }
          if (sub.label.includes('입관지도사') && directorStats) {
            return {
              ...sub,
              price: directorStats.median_amount,
              note: `입관지도사 비용을 공개하는 ${directorStats.hall_count}개 장례식장의 정보를 예담라이프가 실시간 분석해 제공합니다.`,
            };
          }
          // 관 — 모든 옵션에 통계 라벨 부여 ('오동나무' 키워드 제거)
          if (item.label === '관' && coffinStats) {
            const note = `관 비용을 공개하는 ${coffinStats.hall_count}개 장례식장의 정보를 예담라이프가 실시간 분석해 제공합니다.`;
            if (sub.label === '오동나무 기본') {
              return { ...sub, price: 290000, note };
            }
            return { ...sub, note };
          }
          // 유골함 — 모든 옵션에 통계 라벨 부여 ('도자기' 키워드 제거)
          if (item.label === '유골함' && urnStats?.ceramic) {
            const note = `유골함 비용을 공개하는 ${urnStats.ceramic.hall_count}개 장례식장의 정보를 예담라이프가 실시간 분석해 제공합니다.`;
            if (sub.label === '도자기 유골함') {
              return { ...sub, price: 350000, note };
            }
            return { ...sub, note };
          }
          if (sub.label.includes('영정사진') && portraitStats) {
            return {
              ...sub,
              price: 150000,
              note: `영정사진 비용을 공개하는 ${portraitStats.hall_count}개 장례식장의 정보를 예담라이프가 실시간 분석해 제공합니다.`,
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
    // 재선택 시 0이면 1로 복구 (장의버스/리무진처럼 0 허용 항목 대응)
    setSangjoQuantities((prev) => {
      if (unselectedSangjoKeys.has(key)) {
        // 방금 선택으로 전환됨 — 수량 0이면 1로 보정
        const cur = prev[key] ?? 1;
        if (cur <= 0) return { ...prev, [key]: 1 };
      }
      return prev;
    });
  };
  const [guestCount, setGuestCount] = useState(120);

  // Contact step
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ageGroup, setAgeGroup] = useState('');

  // 5단계 [알림톡으로 전송 받기] 시 fc_estimate_requests 에 저장된 견적 uuid.
  // 6단계 상담받기 시 estimateUuid 로 전달해 fc_consultation_requests 와 매칭.
  // 결과 URL 진입 시 props 의 initialEstimateUuid 로 미리 채워짐.
  const [estimateUuid, setEstimateUuid] = useState<string | null>(
    initialEstimateUuid ?? null,
  );
  const [estimateSubmitting, setEstimateSubmitting] = useState(false);
  const [consultSubmitting, setConsultSubmitting] = useState(false);

  // 어드민 스냅샷 진입 시, 저장된 테이블이 없어 라이브 데이터로 폴백한 경우 true
  const [snapshotStale, setSnapshotStale] = useState(false);

  // ── 스냅샷(result_json) 으로부터 결과 화면 복원 — 어드민 view-only 전용 ──
  useEffect(() => {
    if (restoredRef.current) return;
    if (!snapshotResult) return;
    const ft =
      snapshotResult.funeralType ?? snapshotResult.uiSnapshot?.funeralType;
    if (!ft) return;

    restoredRef.current = true;

    const ui = snapshotResult.uiSnapshot ?? {};
    const snap = snapshotResult.snapshot ?? {};

    setFuneralType(ft);
    setSido(ui.sido ?? '');
    setGungu(ui.gungu ?? '');
    if (ui.selectedSize) setSelectedSize(ui.selectedSize);
    if (typeof ui.guestCount === 'number') setGuestCount(ui.guestCount);
    if (ui.checkedFeeIndexes) setCheckedFeeIndexes(ui.checkedFeeIndexes);
    if (ui.checkedEncoffinIndexes)
      setCheckedEncoffinIndexes(ui.checkedEncoffinIndexes);
    if (ui.checkedMortuaryIndexes)
      setCheckedMortuaryIndexes(ui.checkedMortuaryIndexes);
    if (ui.unselectedSangjoKeys)
      setUnselectedSangjoKeys(new Set(ui.unselectedSangjoKeys));
    if (ui.sangjoQuantities) setSangjoQuantities(ui.sangjoQuantities);
    if (ui.flowerDecor) setFlowerDecor(ui.flowerDecor);
    if (ui.ritual) setRitual(ui.ritual);
    setShowFeeTooltip(false);
    setEnteredViaResultUrl(true);

    // 시설/안치실 테이블이 있는지 — 구버전 데이터에는 없을 수 있음
    const hasSnapshotTables =
      Array.isArray(snap.facilityFeeTable) && snap.facilityFeeTable.length > 0;
    const targetFacilityCd =
      ui.facilityCd ?? snapshotResult.hall?.facilityCd ?? '';

    if (hasSnapshotTables) {
      // 합성 hall — 저장된 시설/안치실/염습입관 테이블만으로 selectedHall 구성
      const facilityFees: FacilityFee[] = [
        ...(snap.facilityFeeTable ?? []),
        ...(snap.mortuaryFeeTable ?? []),
      ];
      const syntheticHall: FuneralHall = {
        facility_cd: snapshotResult.hall?.facilityCd ?? '',
        company_name: snapshotResult.hall?.companyName ?? '',
        funeral_type: '',
        public_label: '',
        manage_class: '',
        mortuary_count: 0,
        parking_count: 0,
        full_address: snapshotResult.hall?.fullAddress ?? '',
        facility_fees: facilityFees,
        service_items: snap.serviceItems ?? [],
        sido_cd: ui.sido ?? '',
      };
      setSelectedHall(syntheticHall);
      setHalls([syntheticHall]);
    } else if (ui.gungu && targetFacilityCd) {
      // 구버전 데이터 — 라이브 halls API 폴백 (현재 시점 시설/안치실 테이블)
      setSnapshotStale(true);
      fetch(`/api/v1/funeral-cost/halls?gungu=${ui.gungu}`)
        .then((r) => r.json())
        .then((j) => {
          if (!j.success || !Array.isArray(j.data)) return;
          setHalls(j.data);
          const hall = j.data.find(
            (h: FuneralHall) => h.facility_cd === targetFacilityCd,
          );
          if (hall) setSelectedHall(hall);
        })
        .catch(() => {});
    } else {
      setSnapshotStale(true);
    }

    // 라벨 카운트·평균/중앙값 — 상담 시점 통계를 그대로 주입 (있을 때만)
    const stats = snap.sangjoStats;
    if (stats) {
      if (stats.makeup) setMakeupStats(stats.makeup);
      if (stats.shroud) setShroudStats(stats.shroud);
      if (stats.mourning) setMourningStats(stats.mourning);
      if (stats.vehicle) setVehicleStats(stats.vehicle);
      if (stats.director) setDirectorStats(stats.director);
      if (stats.coffin) setCoffinStats(stats.coffin);
      if (stats.urn) setUrnStats(stats.urn);
      if (stats.portrait) setPortraitStats(stats.portrait);
      if (stats.cleaning) setCleaningStats(stats.cleaning);
    }

    const resultStep = ft === '3day' ? 6 : 5;
    setStep(resultStep);
  }, [snapshotResult]);

  // ── URL 쿼리 파라미터에서 상태 복원 ──
  useEffect(() => {
    if (restoredRef.current) return;
    if (snapshotResult) return; // 스냅샷 모드 우선
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
    if (
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/funeral-cost/result/')
    ) {
      setEnteredViaResultUrl(true);
    }

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
    // 결과 URL로 직접 진입한 경우 결과 화면에서 이전 단계로 못 가게 함
    const resultStep = funeralType === '3day' ? 6 : 5;
    if (enteredViaResultUrl && step === resultStep) {
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
    setSangjoQuantities({ ...DEFAULT_SANGJO_QUANTITIES });
    setGuestCount(120);
    setName('');
    setPhone('');
    setAgeGroup('');
    setEstimateUuid(null);
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

  // 결과 화면 — 선택 규모에 맞는 빈소가 정확히 1개이면 자동 체크
  const binsoAutoCheckedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedHall || !selectedSize) return;
    if (step !== resultStep) return;
    const key = `${selectedHall.facility_cd}-${selectedSize}`;
    if (binsoAutoCheckedRef.current === key) return;
    binsoAutoCheckedRef.current = key;
    const allFacilityItems = selectedHall.facility_fees.filter(
      (f) => f.판매여부 === 'Y' && f.품종 === '시설임대료',
    );
    const matched = getFeesForSize(selectedHall, selectedSize);
    if (matched.length !== 1) return;
    const targetFee = matched[0];
    const idx = allFacilityItems.indexOf(targetFee);
    if (idx >= 0 && checkedFeeIndexes.length === 0) {
      setCheckedFeeIndexes([idx]);
    }
  }, [
    selectedHall,
    selectedSize,
    step,
    resultStep,
    getFeesForSize,
    checkedFeeIndexes.length,
  ]);

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

    const computeSangjoTotal = (items: SangjoItem[]) =>
      items.reduce((sum, item, i) => {
        if (item.items && item.items.length > 0) {
          const isRadio = RADIO_PARENT_LABELS.has(item.label);
          // 라디오 부모(수의/관/유골함) — 항상 단일 선택: 첫 비-unselected sub만 합산
          if (isRadio) {
            const selJ = item.items.findIndex(
              (_, j) => !unselectedSangjoKeys.has(`${i}:${j}`),
            );
            if (selJ < 0) return sum;
            const sub = item.items[selJ];
            const qty = sangjoQuantities[`${i}:${selJ}`] ?? 1;
            return sum + (sub.price ?? 0) * qty;
          }
          return (
            sum +
            item.items.reduce((s, sub, j) => {
              const key = `${i}:${j}`;
              if (sub.optional && unselectedSangjoKeys.has(key)) return s;
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
      const susiFee = 250000;
      const basicTotal = transfer + mortuary;
      const sangjoTotal =
        computeSangjoTotal(applyMakeupStats(SANGJO_ITEMS_NOBINSO)) +
        encoffin +
        susiFee;
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
    // 빈소 미선택 + 데이터 없는 경우에만 규모·지역 중간값 사용
    const binsoIsAvg = facilityFee === 0;
    const hasBinsoData = getBinsoFees(selectedHall).length > 0;
    const binsoMedianFee =
      selectedSize && binsoIsAvg && !hasBinsoData
        ? (BINSO_MEDIAN[selectedSize]?.[isMetro ? 'metro' : 'non_metro'] ?? 0)
        : 0;
    const effectiveFacilityFee = facilityFee > 0 ? facilityFee : binsoMedianFee;

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
    const flowerDecorPrice =
      FLOWER_DECOR_OPTIONS.find((o) => o.key === flowerDecor)?.price ?? 0;
    const ritualPrice =
      RITUAL_OPTIONS.find((o) => o.key === ritual)?.price ?? 0;
    const basicTotal =
      effectiveFacilityFee +
      transfer +
      mortuary +
      food +
      flowerDecorPrice +
      ritualPrice +
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
      facilityFee: effectiveFacilityFee,
      binsoIsAvg,
      binsoMedianFee,
      food,
      flowerDecorPrice,
      ritualPrice,
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
    flowerDecor,
    ritual,
  ]);

  // 추천 상품
  const getRecommendedProduct = useCallback((total: number) => {
    return (
      YEDAM_PRODUCTS.find((p) => total <= p.maxCost) ??
      YEDAM_PRODUCTS[YEDAM_PRODUCTS.length - 1]
    );
  }, []);

  // ── 견적 요청 input_json 빌더 (Step 5 시점) ──
  const buildInputJson = useCallback(() => {
    return {
      funeralType,
      currentSituation,
      sido,
      gungu,
      facilityCd: selectedHall?.facility_cd ?? null,
      selectedSize,
      guestCount,
      checkedFeeIndexes,
      checkedEncoffinIndexes,
      checkedMortuaryIndexes,
      unselectedSangjoKeys: Array.from(unselectedSangjoKeys),
      sangjoQuantities,
      flowerDecor,
      ritual,
    };
  }, [
    funeralType,
    currentSituation,
    sido,
    gungu,
    selectedHall,
    selectedSize,
    guestCount,
    checkedFeeIndexes,
    checkedEncoffinIndexes,
    checkedMortuaryIndexes,
    unselectedSangjoKeys,
    sangjoQuantities,
    flowerDecor,
    ritual,
  ]);

  // ── 결과 result_json 빌더 (Step 6 시점) ──
  const buildResultJson = useCallback(() => {
    const res = calcResult();
    if (!res || !selectedHall || !funeralType) return null;
    const recommended = getRecommendedProduct(res.total);
    const sizeLabel = selectedSize
      ? (SIZE_CATEGORIES.find((c) => c.key === selectedSize)?.label ?? null)
      : null;

    const facilityFeeTable = selectedHall.facility_fees.filter(
      (f) => f.판매여부 === 'Y' && f.품종 === '시설임대료',
    );
    const mortuaryFeeTable = selectedHall.facility_fees.filter(
      (f) => f.판매여부 === 'Y' && f.품종 === '안치실이용료',
    );
    const serviceItemsSnapshot = (selectedHall.service_items ?? []).filter(
      (f) => f.판매여부 === 'Y' && f.품종 === '염습/입관',
    );

    return {
      funeralType,
      isMetro: res.isMetro,
      hall: {
        facilityCd: selectedHall.facility_cd,
        companyName: selectedHall.company_name,
        fullAddress: selectedHall.full_address,
      },
      selections: {
        selectedSize,
        selectedSizeLabel: sizeLabel,
        guestCount: res.guestCount,
      },
      computed: {
        total: res.total,
        basicTotal: res.basicTotal,
        sangjoTotal: res.sangjoTotal,
        transfer: res.transfer,
        mortuary: res.mortuary,
        mortuaryUnit: res.mortuaryUnit,
        mortuaryIsAvg: res.mortuaryIsAvg,
        encoffin: res.encoffin,
        encoffinIsAvg: res.encoffinIsAvg,
        facilityFee: res.facilityFee,
        binsoIsAvg: res.binsoIsAvg,
        binsoMedianFee: res.binsoMedianFee,
        food: res.food,
        flowerDecorPrice: res.flowerDecorPrice,
        ritualPrice: res.ritualPrice,
      },
      // 상담신청 시점의 요금 테이블 스냅샷 — 원본 테이블이 추후 변경되어도
      // 그 시점의 견적을 그대로 재현할 수 있도록 함께 저장한다.
      snapshot: {
        capturedAt: new Date().toISOString(),
        facilityFeeTable,
        mortuaryFeeTable,
        serviceItems: serviceItemsSnapshot,
        selectedFacilityItems: res.selectedFacilityItems,
        selectedEncoffinItems: res.selectedEncoffinItems,
        selectedMortuaryItem: res.mortuarySource ?? null,
        extraMortuaryItems: res.extraMortuaryItems,
        // 라벨 카운트·평균/중앙값 — 상담 시점의 실시간 통계 응답을 그대로 박아둔다.
        // 어드민 view-only 에서 이 값을 그대로 복원하면 라벨/단가가 시점에 고정된다.
        sangjoStats: {
          makeup: makeupStats,
          shroud: shroudStats,
          mourning: mourningStats,
          vehicle: vehicleStats,
          director: directorStats,
          coffin: coffinStats,
          urn: urnStats,
          portrait: portraitStats,
          cleaning: cleaningStats,
        },
      },
      recommendation: {
        id: recommended.id,
        name: recommended.name,
        price: recommended.price,
        savings: Math.max(0, res.total - recommended.price),
      },
      uiSnapshot: {
        ...buildInputJson(),
      },
    };
  }, [
    calcResult,
    selectedHall,
    funeralType,
    selectedSize,
    getRecommendedProduct,
    buildInputJson,
    makeupStats,
    shroudStats,
    mourningStats,
    vehicleStats,
    directorStats,
    coffinStats,
    urnStats,
    portraitStats,
    cleaningStats,
  ]);

  // ── 5단계 [알림톡으로 전송 받기] ──
  // 기존 동작(setStep(resultStep))은 유지하면서 사이드 이펙트로 견적 저장 + 알림톡 발송.
  const submitEstimate = useCallback(async () => {
    if (estimateSubmitting) return;
    if (!funeralType || !selectedHall) return;
    setEstimateSubmitting(true);
    try {
      const res = await fetch('/api/v1/funeral-cost/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          ageGroup: ageGroup || undefined,
          funeralType,
          currentSituation,
          sido,
          gungu,
          facilityCd: selectedHall.facility_cd,
          selectedSize: selectedSize ?? undefined,
          guestCount,
          inputJson: buildInputJson(),
        }),
      });
      const json = await res.json();
      if (res.ok && json?.success && json?.data?.uuid) {
        setEstimateUuid(json.data.uuid);
      }
    } catch (e) {
      console.error('[submitEstimate] failed', e);
    } finally {
      setEstimateSubmitting(false);
    }
  }, [
    estimateSubmitting,
    funeralType,
    selectedHall,
    name,
    phone,
    ageGroup,
    currentSituation,
    sido,
    gungu,
    selectedSize,
    guestCount,
    buildInputJson,
  ]);

  // ── 6단계 [예담 ○○으로 상담받기] ──
  // 기존 동작(handleClose + onSelectProduct + 스크롤)은 유지하고 사이드 이펙트로 상담 저장.
  const submitConsultation = useCallback(
    async (productId: string, productName: string) => {
      if (consultSubmitting) return;
      const resultJson = buildResultJson();
      if (!resultJson) return;
      setConsultSubmitting(true);
      try {
        const res = await fetch('/api/v1/funeral-cost/consultation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            estimateUuid: estimateUuid ?? undefined,
            selectedProductId: productId,
            selectedProductName: productName,
            resultJson,
            // estimateUuid 가 없는 경우(모달 직진입) name/phone 함께 전송
            name: estimateUuid ? undefined : name || undefined,
            phone: estimateUuid ? undefined : phone || undefined,
          }),
        });
        const json = await res.json();
        if (res.ok && json?.success) {
          toast.success('상담 신청이 완료되었습니다');
        } else {
          toast.error(json?.message ?? '접수에 실패했습니다');
        }
      } catch (e) {
        console.error('[submitConsultation] failed', e);
        toast.error('접수에 실패했습니다');
      } finally {
        setConsultSubmitting(false);
      }
    },
    [consultSubmitting, buildResultJson, estimateUuid, name, phone],
  );

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
          {step === resultStep ? (
            <span className="w-7 h-7" />
          ) : (
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
          )}
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            장례비용 알아보기
            {viewOnly && (
              <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                보기 전용
              </span>
            )}
            {viewOnly && snapshotStale && (
              <span
                className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
                title="상담 시점 스냅샷이 저장되지 않아 현재 시점 데이터를 표시합니다."
              >
                ⚠ 스냅샷 미저장 — 현재 시점 데이터
              </span>
            )}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer sm:block hidden"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-7 sm:hidden" />
        </div>

        {/* 스텝 인디케이터 — 결과 URL 복원 중엔 숨김 */}
        {!(enteredViaResultUrl && step !== resultStep) && (
          <div className="flex items-center gap-1 px-4 sm:px-6 py-3 shrink-0">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-colors"
                style={{ backgroundColor: i < step ? BRAND_COLOR : '#e5e7eb' }}
              />
            ))}
          </div>
        )}

        {/* 컨텐츠 */}
        <div
          className={`flex-1 overflow-y-auto px-4 sm:px-6 pb-6 ${
            viewOnly
              ? '[&_button]:pointer-events-none [&_a]:pointer-events-none [&_input]:pointer-events-none [&_label]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none select-text'
              : ''
          }`}
        >
          {/* 결과 URL 진입 시 복원 완료 전까지 스켈레톤 */}
          {enteredViaResultUrl && step !== resultStep && (
            <div className="animate-pulse pt-6 space-y-4">
              <div className="h-6 w-1/3 bg-gray-200 rounded" />
              <div className="h-24 bg-gray-100 rounded-2xl" />
              <div className="h-40 bg-gray-100 rounded-2xl" />
              <div className="h-40 bg-gray-100 rounded-2xl" />
              <div className="h-32 bg-gray-100 rounded-2xl" />
            </div>
          )}
          {/* ── Step 1: 장례형태 선택 ── */}
          {!(enteredViaResultUrl && step !== resultStep) && step === 1 && (
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
                    onClick={() => setFuneralType(opt.key)}
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

              <div className="mt-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  현재 상황을 알려주세요
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  상황에 맞춰 안내드릴 수 있도록 도와드립니다.
                </p>
                <div className="space-y-2">
                  {CURRENT_SITUATION_OPTIONS.map((opt) => {
                    const selected = currentSituation === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setCurrentSituation(opt.value)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left cursor-pointer transition-colors ${
                          selected
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            selected ? 'border-gray-900' : 'border-gray-300'
                          }`}
                        >
                          {selected && (
                            <span className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                          )}
                        </span>
                        <span
                          className={`text-sm sm:text-base font-medium ${
                            selected ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!funeralType || !currentSituation}
                className="mt-8 w-full py-4 rounded-xl text-white font-bold text-base transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                다음
              </button>
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
                선택하신 장례식장 비용을
                <br />
                알림톡으로 전송해드립니다.
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                알림톡 전송 실패 시 SMS로 전송됩니다.
              </p>
              <p className="text-sm text-gray-500 mb-2">
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
                    휴대폰 번호
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
                  <p className="mt-1.5 text-xs text-gray-500">
                    기재해주신 전화번호로 알림톡 또는 문자를 전송해드립니다.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    연령대
                  </label>
                  <Select value={ageGroup} onValueChange={setAgeGroup}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="선택해주세요" />
                    </SelectTrigger>
                    <SelectContent className="z-[110]">
                      {[
                        '10대',
                        '20대',
                        '30대',
                        '40대',
                        '50대',
                        '60대',
                        '70대',
                        '80대',
                        '90대',
                      ].map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  {/* 총 예상비용 — sticky */}
                  <div className="sticky top-0 z-10 bg-white -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 pb-3 mb-2 border-b border-gray-100 text-center">
                    <h3 className="text-sm font-semibold text-gray-500 mb-0.5">
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
                      checkedDetails.every((d) => d.multiplier === 2);
                    const unitLabel = allHourly
                      ? '24시간 x 2일'
                      : allDaily
                        ? '24시간'
                        : '';
                    const hasBinsoSelected =
                      funeralType === '3day' && checkedFeeIndexes.length > 0;

                    return (
                      <div className="mb-4 rounded-2xl bg-white border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <span className="inline-block w-1 h-4 rounded-full bg-gray-400" />
                            장례식장 이용료
                          </p>
                          <p
                            className="text-lg font-bold"
                            style={{ color: BRAND_COLOR }}
                          >
                            {result.basicTotal.toLocaleString()}원
                          </p>
                        </div>
                        <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                          {funeralType === '3day' && (
                            <div className="px-4 py-2.5 border-b border-gray-100">
                              <div className="flex items-center gap-3">
                                <span className="flex-1 min-w-0 text-gray-600 flex items-center gap-1.5 flex-wrap">
                                  빈소 사용료{' '}
                                  <span className="text-xs text-gray-500">
                                    (2일)
                                  </span>
                                  {facilityFeeItems.length > 0 && (
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
                                      className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer transition-colors"
                                    >
                                      비용 확인하기
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </span>
                                <div className="shrink-0 w-28 flex flex-col items-end gap-0.5">
                                  {hasBinsoSelected ? (
                                    <>
                                      <span
                                        className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-white"
                                        style={{ backgroundColor: BRAND_COLOR }}
                                      >
                                        실제비용
                                      </span>
                                      <span className="text-[15px] font-semibold text-gray-900">
                                        {checkedTotal.toLocaleString()}원
                                      </span>
                                    </>
                                  ) : (result.binsoMedianFee ?? 0) > 0 ? (
                                    <span className="text-[15px] font-semibold text-gray-900">
                                      {(
                                        result.binsoMedianFee ?? 0
                                      ).toLocaleString()}
                                      원
                                    </span>
                                  ) : (
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
                                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 cursor-pointer transition-colors"
                                    >
                                      선택하러 가기
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              {result.selectedFacilityItems?.map((f, i) => (
                                <p
                                  key={`bs-${i}`}
                                  className="text-xs text-gray-400 mt-1 pl-6"
                                >
                                  ㄴ {f.품명}
                                </p>
                              ))}
                            </div>
                          )}
                          <div className="px-4 py-2.5 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <span className="flex-1 min-w-0 text-gray-600 flex items-center gap-1.5 flex-wrap">
                                안치실 이용료{' '}
                                <span className="text-xs text-gray-500">
                                  (2일)
                                </span>
                                {mortuaryCategoryItems.length > 0 && (
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
                                    className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer transition-colors"
                                  >
                                    비용 확인하기
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </span>
                              <div className="shrink-0 w-28 flex flex-col items-end gap-0.5">
                                {!result.mortuaryIsAvg && (
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-white"
                                    style={{ backgroundColor: BRAND_COLOR }}
                                  >
                                    실제비용
                                  </span>
                                )}
                                <span className="text-[15px] font-semibold text-gray-900">
                                  {result.mortuary.toLocaleString()}원
                                </span>
                              </div>
                            </div>
                            {result.mortuarySource && (
                              <p className="text-xs text-gray-400 mt-1 pl-6">
                                ㄴ {result.mortuarySource.품명}
                              </p>
                            )}
                          </div>
                          <div className="px-4 py-2.5 flex items-center gap-3 border-b border-gray-100">
                            <span className="flex-1 min-w-0 text-gray-600 flex items-center gap-1.5">
                              고인 이송비
                            </span>
                            <div className="shrink-0 w-28 flex flex-col items-end gap-0.5">
                              <span className="text-[15px] font-semibold text-gray-900">
                                {result.transfer.toLocaleString()}원
                              </span>
                            </div>
                          </div>
                          {funeralType === '3day' && (
                            <div className="px-4 py-2.5 flex items-center gap-3 border-b border-gray-100">
                              <span className="flex-1 min-w-0 text-gray-600 flex items-center gap-1.5">
                                음식비 ({guestCount}명 x{' '}
                                {(result.isMetro
                                  ? METRO_COSTS
                                  : NON_METRO_COSTS
                                ).food.toLocaleString()}
                                원)
                              </span>
                              <div className="shrink-0 w-28 flex flex-col items-end gap-0.5">
                                <span className="text-[15px] font-semibold text-gray-900">
                                  {result.food.toLocaleString()}원
                                </span>
                              </div>
                            </div>
                          )}
                          {funeralType === '3day' && (
                            <div className="px-4 py-3 border-b border-gray-100 flex items-start gap-3">
                              {/* 좌: 라벨 + 옵션 */}
                              <div className="flex-1 min-w-0">
                                <span className="text-gray-600 flex items-center gap-1.5 mb-2">
                                  제단 꽃 장식
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {FLOWER_DECOR_OPTIONS.map((opt) => {
                                    const selected = flowerDecor === opt.key;
                                    return (
                                      <button
                                        key={opt.key}
                                        type="button"
                                        onClick={() => setFlowerDecor(opt.key)}
                                        className="flex items-center gap-2 cursor-pointer text-left text-[13px]"
                                      >
                                        <span
                                          className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                                          style={{
                                            borderColor: selected
                                              ? BRAND_COLOR
                                              : '#d1d5db',
                                            backgroundColor: selected
                                              ? BRAND_COLOR
                                              : 'transparent',
                                          }}
                                        >
                                          {selected && (
                                            <Check className="w-2.5 h-2.5 text-white" />
                                          )}
                                        </span>
                                        <span
                                          className={
                                            selected
                                              ? 'text-gray-700'
                                              : 'text-gray-400'
                                          }
                                        >
                                          {opt.label}
                                          <span
                                            className={`ml-1 font-bold ${selected ? 'text-gray-900' : 'text-gray-400'}`}
                                          >
                                            {opt.price.toLocaleString()}원
                                          </span>
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              {/* 우: 비용 */}
                              <div className="shrink-0 w-28 flex flex-col items-end gap-0.5 pt-0.5">
                                <span className="text-[15px] font-semibold text-gray-900">
                                  {(
                                    FLOWER_DECOR_OPTIONS.find(
                                      (o) => o.key === flowerDecor,
                                    )?.price ?? 0
                                  ).toLocaleString()}
                                  원
                                </span>
                              </div>
                            </div>
                          )}
                          {funeralType === '3day' && (
                            <div className="px-4 py-3 flex items-start gap-3">
                              {/* 좌: 라벨 + 옵션 */}
                              <div className="flex-1 min-w-0">
                                <span className="text-gray-600 flex items-center gap-1.5 mb-2">
                                  제사 비용
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {RITUAL_OPTIONS.map((opt) => {
                                    const selected = ritual === opt.key;
                                    return (
                                      <button
                                        key={opt.key}
                                        type="button"
                                        onClick={() => setRitual(opt.key)}
                                        className="flex items-center gap-2 cursor-pointer text-left text-[13px]"
                                      >
                                        <span
                                          className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                                          style={{
                                            borderColor: selected
                                              ? BRAND_COLOR
                                              : '#d1d5db',
                                            backgroundColor: selected
                                              ? BRAND_COLOR
                                              : 'transparent',
                                          }}
                                        >
                                          {selected && (
                                            <Check className="w-2.5 h-2.5 text-white" />
                                          )}
                                        </span>
                                        <span
                                          className={
                                            selected
                                              ? 'text-gray-700'
                                              : 'text-gray-400'
                                          }
                                        >
                                          {opt.label}
                                          <span
                                            className={`ml-1 font-bold ${selected ? 'text-gray-900' : 'text-gray-400'}`}
                                          >
                                            {opt.price.toLocaleString()}원
                                          </span>
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              {/* 우: 비용 */}
                              <div className="shrink-0 w-28 flex flex-col items-end gap-0.5 pt-0.5">
                                <span className="text-[15px] font-semibold text-gray-900">
                                  {(
                                    RITUAL_OPTIONS.find((o) => o.key === ritual)
                                      ?.price ?? 0
                                  ).toLocaleString()}
                                  원
                                </span>
                              </div>
                            </div>
                          )}
                          {/* 청소비 */}
                          {(() => {
                            const isMetro = selectedHall
                              ? METRO_SIDO.includes(selectedHall.sido_cd)
                              : false;
                            const stat = cleaningStats
                              ? isMetro
                                ? cleaningStats.metro
                                : cleaningStats.non_metro
                              : null;
                            const displayAmt = stat?.avg_amount ?? 0;
                            return (
                              <div className="px-4 py-3 border-t border-gray-100 flex items-start gap-3">
                                {/* 좌: 라벨 + note */}
                                <div className="flex-1 min-w-0">
                                  <span className="text-gray-600 flex items-center gap-1.5 mb-2">
                                    청소비
                                  </span>
                                  <div className="ml-[1.4rem]">
                                    <div className="flex items-start gap-1.5">
                                      {stat ? (
                                        <span className="inline-block text-[11px] font-semibold leading-relaxed px-2 py-0.5 rounded-2xl bg-gray-100 text-gray-600 break-keep">
                                          {`청소비를 공개하는 ${stat.hall_count}개 장례식장의 정보를 예담라이프가 실시간 분석해 제공합니다.`
                                            .split(
                                              /(\d{1,3}(?:,\d{3})*(?:건|개|원)|예담라이프)/,
                                            )
                                            .map((part, k) =>
                                              /^\d{1,3}(?:,\d{3})*(?:건|개|원)$/.test(
                                                part,
                                              ) || part === '예담라이프' ? (
                                                <span
                                                  key={k}
                                                  className="font-extrabold mx-0.5"
                                                  style={{
                                                    color: LIVE_LABEL_HIGHLIGHT,
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
                                      ) : (
                                        <span className="inline-block w-48 h-5 bg-gray-200 rounded-2xl animate-pulse" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {/* flex-1 end */}
                                {/* 우: 비용 */}
                                <div className="shrink-0 w-28 flex flex-col items-end gap-0.5 pt-0.5">
                                  {stat ? (
                                    <span className="text-[15px] font-semibold text-gray-900">
                                      {displayAmt.toLocaleString()}원
                                    </span>
                                  ) : (
                                    <span className="inline-block w-16 h-4 bg-gray-200 rounded animate-pulse mt-0.5" />
                                  )}
                                </div>
                              </div>
                            );
                          })()}
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
                      <div className="mt-4 mb-5 rounded-2xl bg-white border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <span className="inline-block w-1 h-4 rounded-full bg-gray-400" />
                            장례식장 상조비용
                          </p>
                          <p
                            className="text-lg font-bold flex items-center gap-1.5"
                            style={{ color: BRAND_COLOR }}
                          >
                            {result.sangjoTotal.toLocaleString()}원
                          </p>
                        </div>
                        <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                          {sangjoItems.map((item, i) => {
                            const hasSubs = !!item.items?.length;
                            const parentKey = String(i);
                            const isRadioParentForCalc =
                              RADIO_PARENT_LABELS.has(item.label);
                            // 라디오 부모는 첫 비-unselected sub 만 선택된 것으로 취급
                            const radioSelectedJ =
                              isRadioParentForCalc && item.items
                                ? item.items.findIndex(
                                    (_, j) =>
                                      !unselectedSangjoKeys.has(`${i}:${j}`),
                                  )
                                : -1;
                            const isSubSelected = (j: number) => {
                              const sub = item.items![j];
                              if (isRadioParentForCalc) {
                                return j === radioSelectedJ;
                              }
                              if (sub.optional) {
                                return !unselectedSangjoKeys.has(`${i}:${j}`);
                              }
                              return true;
                            };
                            const parentSelected = hasSubs
                              ? item.items!.some((_, j) => isSubSelected(j))
                              : !unselectedSangjoKeys.has(parentKey);
                            const parentTotal = hasSubs
                              ? item.items!.reduce((s, sub, j) => {
                                  if (!isSubSelected(j)) return s;
                                  const key = `${i}:${j}`;
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
                                {(() => {
                                  const isRadioParent = RADIO_PARENT_LABELS.has(
                                    item.label,
                                  );
                                  const optionalSubIdx = hasSubs
                                    ? item
                                        .items!.map((s, j) =>
                                          s.optional ? j : -1,
                                        )
                                        .filter((j) => j >= 0)
                                    : [];
                                  const hideParentCheckbox =
                                    HIDE_PARENT_CHECKBOX_LABELS.has(item.label);
                                  const parentToggleable =
                                    !hideParentCheckbox &&
                                    hasSubs &&
                                    (isRadioParent ||
                                      optionalSubIdx.length > 0);
                                  return (
                                    <button
                                      type="button"
                                      disabled={!parentToggleable}
                                      onClick={() => {
                                        if (!parentToggleable) return;
                                        if (isRadioParent) {
                                          setUnselectedSangjoKeys((prev) => {
                                            const next = new Set(prev);
                                            if (parentSelected) {
                                              item.items!.forEach((_, j) =>
                                                next.add(`${i}:${j}`),
                                              );
                                            } else {
                                              item.items!.forEach((_, j) => {
                                                if (j === 0)
                                                  next.delete(`${i}:${j}`);
                                                else next.add(`${i}:${j}`);
                                              });
                                            }
                                            return next;
                                          });
                                        } else {
                                          // 비-라디오: 옵션 sub만 일괄 토글
                                          const allOptionalSelected =
                                            optionalSubIdx.every(
                                              (j) =>
                                                !unselectedSangjoKeys.has(
                                                  `${i}:${j}`,
                                                ),
                                            );
                                          setUnselectedSangjoKeys((prev) => {
                                            const next = new Set(prev);
                                            optionalSubIdx.forEach((j) => {
                                              if (allOptionalSelected)
                                                next.add(`${i}:${j}`);
                                              else next.delete(`${i}:${j}`);
                                            });
                                            return next;
                                          });
                                        }
                                      }}
                                      className={`w-full flex items-center gap-3 text-left ${parentToggleable ? 'cursor-pointer' : 'cursor-default'}`}
                                    >
                                      <span className="flex-1 min-w-0 flex items-center gap-2">
                                        {parentToggleable && (
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
                                        )}
                                        {(item.label === '인력지원' ||
                                          item.label === '전문도우미') &&
                                        hasSubs
                                          ? (() => {
                                              const totalMan =
                                                item.items!.reduce(
                                                  (s, _sub, j) => {
                                                    const key = `${i}:${j}`;
                                                    if (
                                                      unselectedSangjoKeys.has(
                                                        key,
                                                      )
                                                    )
                                                      return s;
                                                    return (
                                                      s +
                                                      (sangjoQuantities[key] ??
                                                        1)
                                                    );
                                                  },
                                                  0,
                                                );
                                              return `${item.label} (${totalMan}명 * 2일)`;
                                            })()
                                          : item.label}
                                      </span>
                                      <span className="shrink-0 w-28 text-[15px] font-bold text-gray-900 text-right">
                                        {parentTotal.toLocaleString()}원
                                      </span>
                                    </button>
                                  );
                                })()}
                                {/* 라디오 부모: 선택된 sub의 통계 라벨을 부모 아래 표시 */}
                                {RADIO_PARENT_LABELS.has(item.label) &&
                                  item.items &&
                                  (() => {
                                    const selectedSub = item.items.find(
                                      (_, j) =>
                                        !unselectedSangjoKeys.has(`${i}:${j}`),
                                    );
                                    if (!selectedSub) return null;
                                    if (selectedSub.note) {
                                      return (
                                        <div className="mt-1.5 pl-4 pr-28">
                                          <span className="inline-block text-[11px] font-semibold leading-relaxed px-2 py-0.5 rounded-2xl bg-gray-100 text-gray-600 break-keep">
                                            {selectedSub.note
                                              .split('\n')[0]
                                              .split(
                                                /(\d{1,3}(?:,\d{3})*(?:건|개|원)|예담라이프)/,
                                              )
                                              .map((part, k) =>
                                                /^\d{1,3}(?:,\d{3})*(?:건|개|원)$/.test(
                                                  part,
                                                ) || part === '예담라이프' ? (
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
                                      );
                                    }
                                    if (hasLiveStatsLabel(selectedSub.label)) {
                                      return (
                                        <div
                                          className="mt-1.5 pl-4 pr-28"
                                          aria-busy="true"
                                        >
                                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold leading-relaxed px-2 py-0.5 rounded-full bg-gray-100">
                                            <span className="inline-block h-2.5 w-24 rounded-full bg-gray-200 animate-pulse" />
                                            <span className="inline-block h-2.5 w-10 rounded-full bg-gray-200 animate-pulse" />
                                          </span>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                {item.items?.map((sub, j) => {
                                  const subKey = `${i}:${j}`;
                                  const supportsQty = /1벌|1대|1명/.test(
                                    sub.label,
                                  );
                                  const qty = sangjoQuantities[subKey] ?? 1;
                                  const isRadio = RADIO_PARENT_LABELS.has(
                                    item.label,
                                  );
                                  const canToggle = isRadio || !!sub.optional;
                                  // 라디오 부모는 외부에서 계산된 radioSelectedJ 가 일치할 때만 체크
                                  const subSelected = isRadio
                                    ? j === radioSelectedJ
                                    : canToggle
                                      ? !unselectedSangjoKeys.has(subKey)
                                      : true;
                                  return (
                                    <div key={j}>
                                      <div className="mt-3 pl-4 flex items-start gap-2 text-[13px]">
                                        {/* 좌: [라벨행] + [note] */}
                                        <div className="flex-1 min-w-0 flex flex-col">
                                          {/* 라벨행 */}
                                          <div className="flex items-center gap-2 overflow-hidden">
                                            {canToggle && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (isRadio) {
                                                    setUnselectedSangjoKeys(
                                                      (prev) => {
                                                        const next = new Set(
                                                          prev,
                                                        );
                                                        item.items!.forEach(
                                                          (_, k) =>
                                                            next.add(
                                                              `${i}:${k}`,
                                                            ),
                                                        );
                                                        next.delete(subKey);
                                                        return next;
                                                      },
                                                    );
                                                  } else {
                                                    toggleSangjoKey(subKey);
                                                  }
                                                }}
                                                className="shrink-0 w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center cursor-pointer"
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
                                              </button>
                                            )}
                                            <span
                                              role={
                                                canToggle ? 'button' : undefined
                                              }
                                              tabIndex={canToggle ? 0 : -1}
                                              onClick={() => {
                                                if (!canToggle) return;
                                                if (isRadio) {
                                                  setUnselectedSangjoKeys(
                                                    (prev) => {
                                                      const next = new Set(
                                                        prev,
                                                      );
                                                      item.items!.forEach(
                                                        (_, k) =>
                                                          next.add(`${i}:${k}`),
                                                      );
                                                      next.delete(subKey);
                                                      return next;
                                                    },
                                                  );
                                                } else {
                                                  toggleSangjoKey(subKey);
                                                }
                                              }}
                                              onKeyDown={(e) => {
                                                if (
                                                  canToggle &&
                                                  (e.key === 'Enter' ||
                                                    e.key === ' ')
                                                )
                                                  e.currentTarget.click();
                                              }}
                                              className={`truncate select-none ${canToggle ? 'cursor-pointer' : 'cursor-default'} ${subSelected ? 'text-gray-600' : 'text-gray-400'}`}
                                            >
                                              {sub.label}
                                              {sub.optional && (
                                                <span className="ml-1 text-[11px] text-gray-400">
                                                  (선택)
                                                </span>
                                              )}
                                            </span>
                                            {supportsQty &&
                                              subSelected &&
                                              (() => {
                                                // 장의버스/리무진은 수량 0까지 허용 — 0이 되면 자동 체크해제
                                                const allowZero =
                                                  sub.label.includes(
                                                    '장의버스',
                                                  ) ||
                                                  sub.label.includes('리무진');
                                                const minQty = allowZero
                                                  ? 0
                                                  : (MIN_SANGJO_QUANTITIES[
                                                      subKey
                                                    ] ?? 1);
                                                return (
                                                  <div className="shrink-0 flex items-center gap-1.5 border border-gray-200 rounded-full px-1 py-0.5">
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const nextQty =
                                                          Math.max(
                                                            minQty,
                                                            (sangjoQuantities[
                                                              subKey
                                                            ] ?? 1) - 1,
                                                          );
                                                        setSangjoQuantities(
                                                          (prev) => ({
                                                            ...prev,
                                                            [subKey]: nextQty,
                                                          }),
                                                        );
                                                        // 0이 되면 체크 해제
                                                        if (
                                                          allowZero &&
                                                          nextQty === 0
                                                        ) {
                                                          setUnselectedSangjoKeys(
                                                            (prev) => {
                                                              if (
                                                                prev.has(subKey)
                                                              )
                                                                return prev;
                                                              const next =
                                                                new Set(prev);
                                                              next.add(subKey);
                                                              return next;
                                                            },
                                                          );
                                                        }
                                                      }}
                                                      disabled={qty <= minQty}
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
                                                        setSangjoQuantities(
                                                          (prev) => ({
                                                            ...prev,
                                                            [subKey]:
                                                              (prev[subKey] ??
                                                                1) + 1,
                                                          }),
                                                        )
                                                      }
                                                      className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer text-sm leading-none"
                                                    >
                                                      +
                                                    </button>
                                                  </div>
                                                );
                                              })()}
                                          </div>
                                          {/* note — 라디오 부모는 부모 행에 표시하므로 sub에서는 숨김 */}
                                          {!isRadio &&
                                            (sub.note ? (
                                              <div className="mt-1.5 ml-[1.4rem]">
                                                <span className="inline-block text-[11px] font-semibold leading-relaxed px-2 py-0.5 rounded-2xl bg-gray-100 text-gray-600 break-keep">
                                                  {sub.note
                                                    .split('\n')[0]
                                                    .split(
                                                      /(\d{1,3}(?:,\d{3})*(?:건|개|원)|예담라이프)/,
                                                    )
                                                    .map((part, k) =>
                                                      /^\d{1,3}(?:,\d{3})*(?:건|개|원)$/.test(
                                                        part,
                                                      ) ||
                                                      part === '예담라이프' ? (
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
                                                {sub.note
                                                  .split('\n')
                                                  .slice(1)
                                                  .map((line, k) => (
                                                    <p
                                                      key={k}
                                                      className="mt-1 text-[11px] text-gray-400 leading-relaxed"
                                                    >
                                                      {line}
                                                    </p>
                                                  ))}
                                              </div>
                                            ) : hasLiveStatsLabel(sub.label) ? (
                                              <div
                                                className="mt-1.5 ml-[1.4rem]"
                                                aria-busy="true"
                                                aria-label="실시간 평균 비용 불러오는 중"
                                              >
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold leading-relaxed px-2 py-0.5 rounded-full bg-gray-100">
                                                  <span className="inline-block h-2.5 w-24 rounded-full bg-gray-200 animate-pulse" />
                                                  <span className="inline-block h-2.5 w-10 rounded-full bg-gray-200 animate-pulse" />
                                                </span>
                                              </div>
                                            ) : null)}
                                        </div>
                                        {/* 우: 가격 */}
                                        {typeof sub.price === 'number' && (
                                          <div className="shrink-0 w-28 flex flex-col items-end gap-0 pt-0.5">
                                            {supportsQty && qty > 1 && (
                                              <span className="text-[11px] text-gray-400">
                                                × {qty}
                                              </span>
                                            )}
                                            <span
                                              className={`text-[13px] font-semibold ${subSelected ? 'text-gray-700' : 'text-gray-400'}`}
                                            >
                                              {(
                                                sub.price *
                                                (supportsQty && qty > 1
                                                  ? qty
                                                  : 1)
                                              ).toLocaleString()}
                                              원
                                            </span>
                                          </div>
                                        )}
                                      </div>
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
                      if (facilityFeeItems.length === 0) return null;

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
                                      {fee.요금단위 === '시간당'
                                        ? `${(fee.요금 * 48).toLocaleString()}원`
                                        : `${fee.요금_표시}원`}
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

                  {/* ── 차트로 비교하기 ── */}
                  {(() => {
                    let yedam: { product: string; price: number };
                    if (funeralType === 'nobinso') {
                      yedam = { product: '예담 무빈소', price: 1300000 };
                    } else if (selectedSize === 'vip') {
                      yedam = { product: '예담 VIP', price: 5800000 };
                    } else if (selectedSize === 'premium') {
                      yedam = { product: '예담 4호', price: 4600000 };
                    } else if (
                      selectedSize === 'medium' ||
                      selectedSize === 'large'
                    ) {
                      yedam = { product: '예담 3호', price: 3400000 };
                    } else {
                      yedam = { product: '예담 2호', price: 2300000 };
                    }

                    let prepayPrice: number;
                    if (funeralType === 'nobinso') {
                      prepayPrice = 2500000;
                    } else if (selectedSize === 'vip') {
                      prepayPrice = 8130000;
                    } else if (selectedSize === 'premium') {
                      prepayPrice = 8130000;
                    } else if (selectedSize === 'large') {
                      prepayPrice = 5114000;
                    } else if (selectedSize === 'medium') {
                      prepayPrice = 4650000;
                    } else {
                      prepayPrice = 3970000;
                    }
                    const hallSangjo = result.sangjoTotal;
                    const facility = result.basicTotal;

                    const yedamTotal = yedam.price + facility;
                    const prepayTotal = prepayPrice + facility;
                    const hallTotal = hallSangjo + facility;

                    const saving = Math.max(0, hallTotal - yedamTotal);
                    const savePct =
                      hallTotal > 0
                        ? Math.round((saving / hallTotal) * 100)
                        : 0;

                    const maxTop = Math.max(
                      yedam.price,
                      prepayPrice,
                      hallSangjo,
                      1,
                    );
                    const topMaxPx = 160;
                    const minTopPx = 32;
                    const facilityPx = 56;
                    const heightOf = (v: number) =>
                      Math.max(minTopPx, Math.round((v / maxTop) * topMaxPx));

                    const fmt10k = (v: number) =>
                      `${Math.round(v / 10000).toLocaleString()}만`;
                    const fmt10kWon = (v: number) =>
                      `${Math.round(v / 10000).toLocaleString()}만원`;

                    const bars: {
                      label: string;
                      isHighlight: boolean;
                      sangjo: number;
                      total: number;
                      barColor: string;
                      labelColor: string;
                    }[] = [
                      {
                        label: yedam.product,
                        isHighlight: true,
                        sangjo: yedam.price,
                        total: yedamTotal,
                        barColor: '#5b7fb6',
                        labelColor: '#111827',
                      },
                      {
                        label: '선불제상조',
                        isHighlight: false,
                        sangjo: prepayPrice,
                        total: prepayTotal,
                        barColor: '#9ca3af',
                        labelColor: '#111827',
                      },
                      {
                        label: selectedHall.company_name,
                        isHighlight: false,
                        sangjo: hallSangjo,
                        total: hallTotal,
                        barColor: '#6b7280',
                        labelColor: '#111827',
                      },
                    ];

                    return (
                      <div id="fc-chart-section" className="mt-8 mb-6">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span className="inline-block w-1 h-4 rounded-full bg-gray-400" />
                          차트로 비교하기
                        </h3>
                        {/* 필수 항목 미선택 유효성 라벨 */}
                        {(() => {
                          const warnings: { msg: string; targetId: string }[] =
                            [];
                          if (
                            funeralType === '3day' &&
                            getBinsoFees(selectedHall).length > 0 &&
                            checkedFeeIndexes.length === 0
                          ) {
                            warnings.push({
                              msg: '장례식장 빈소 사용료가 선택되지 않았습니다.',
                              targetId: 'fc-table-binso',
                            });
                          }
                          if (
                            mortuaryCategoryItems.length > 0 &&
                            checkedMortuaryIndexes.length === 0
                          ) {
                            warnings.push({
                              msg: '안치실 이용료가 선택되지 않았습니다.',
                              targetId: 'fc-table-mortuary',
                            });
                          }
                          if (warnings.length === 0) return null;
                          return (
                            <div className="mb-4 flex flex-col gap-1.5">
                              {warnings.map((w) => (
                                <button
                                  key={w.targetId}
                                  type="button"
                                  onClick={() =>
                                    document
                                      .getElementById(w.targetId)
                                      ?.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'center',
                                      })
                                  }
                                  className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                                >
                                  <span>{w.msg}</span>
                                  <span className="ml-2 shrink-0">›</span>
                                </button>
                              ))}
                            </div>
                          );
                        })()}
                        <div className="rounded-2xl bg-[#f3f6fb] border border-gray-200 p-4 sm:p-5">
                          <div
                            className="grid justify-center transition-all duration-500"
                            style={{
                              gridTemplateColumns:
                                'repeat(3, minmax(52px, 72px)) auto',
                              gap: '0 clamp(6px, 2vw, 20px)',
                            }}
                          >
                            {/* Row 1: 상조비용 막대 + 총합 말풍선 */}
                            {bars.map((b, i) => {
                              const topH = heightOf(b.sangjo);
                              return (
                                <div
                                  key={`s-${i}`}
                                  className="self-end flex flex-col items-center"
                                >
                                  <div className="mb-2">
                                    {b.isHighlight ? (
                                      <div
                                        className="relative"
                                        style={{
                                          animation:
                                            'heartbeat 2s ease-in-out infinite',
                                        }}
                                      >
                                        <div
                                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-white whitespace-nowrap text-center"
                                          style={{
                                            backgroundColor: b.barColor,
                                          }}
                                        >
                                          {saving > 0 && (
                                            <>
                                              <span className="text-[10px] font-semibold text-white/80">
                                                최대 {savePct}% 절약
                                              </span>
                                              <br />
                                            </>
                                          )}
                                          {fmt10kWon(b.total)}
                                        </div>
                                        <div
                                          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                                          style={{
                                            backgroundColor: b.barColor,
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <span className="text-xs font-bold text-gray-400 whitespace-nowrap">
                                        {fmt10kWon(b.total)}
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    className="w-full rounded-t-xl flex items-center justify-center transition-all duration-500"
                                    style={{
                                      height: `${topH}px`,
                                      backgroundColor: b.barColor,
                                    }}
                                  >
                                    {topH > 24 && (
                                      <span className="text-xs font-bold text-white/90">
                                        {fmt10k(b.sangjo)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {/* 우측: 상조 평균 비용 브래킷 */}
                            <div className="self-end flex items-center gap-1.5 ml-0 sm:-ml-3">
                              {(() => {
                                const maxH = heightOf(
                                  Math.max(...bars.map((b) => b.sangjo)),
                                );
                                const w = 28;
                                return (
                                  <svg
                                    width={w}
                                    height={maxH}
                                    viewBox={`0 0 ${w} ${maxH}`}
                                    style={{
                                      display: 'block',
                                      minWidth: w,
                                      flexShrink: 0,
                                    }}
                                    aria-hidden="true"
                                  >
                                    <path
                                      d={`M 2 4 C 14 4, 14 ${maxH / 2}, 14 ${maxH / 2} C 14 ${maxH / 2}, 14 ${maxH - 4}, 2 ${maxH - 4}`}
                                      stroke="#374151"
                                      strokeWidth="2.5"
                                      strokeDasharray="6 4"
                                      strokeLinecap="round"
                                      fill="none"
                                    />
                                  </svg>
                                );
                              })()}
                              <span
                                className="text-[11px] font-semibold whitespace-nowrap leading-tight"
                                style={{ color: '#374151' }}
                              >
                                &apos;상조&apos;
                                <br />
                                평균 비용
                              </span>
                            </div>

                            {/* 구분선 */}
                            <div style={{ gridColumn: '1 / -1' }} />

                            {/* Row 2: 이용료 막대 */}
                            {bars.map((_, i) => (
                              <div
                                key={`f-${i}`}
                                className="w-full bg-gray-200 rounded-b-xl flex items-center justify-center transition-all duration-500"
                                style={{ height: `${facilityPx}px` }}
                              >
                                <span
                                  className="text-[10px] sm:text-xs font-bold"
                                  style={{ color: '#9ca3af' }}
                                >
                                  {fmt10k(facility)}
                                </span>
                              </div>
                            ))}
                            {/* 우측: 기본 이용료 브래킷 */}
                            <div className="self-center flex items-center gap-1.5 ml-0 sm:-ml-3">
                              {(() => {
                                const w = 28;
                                return (
                                  <svg
                                    width={w}
                                    height={facilityPx}
                                    viewBox={`0 0 ${w} ${facilityPx}`}
                                    style={{
                                      display: 'block',
                                      minWidth: w,
                                      flexShrink: 0,
                                    }}
                                    aria-hidden="true"
                                  >
                                    <path
                                      d={`M 2 4 C 14 4, 14 ${facilityPx / 2}, 14 ${facilityPx / 2} C 14 ${facilityPx / 2}, 14 ${facilityPx - 4}, 2 ${facilityPx - 4}`}
                                      stroke="#374151"
                                      strokeWidth="2.5"
                                      strokeDasharray="6 4"
                                      strokeLinecap="round"
                                      fill="none"
                                    />
                                  </svg>
                                );
                              })()}
                              <span
                                className="text-[11px] font-semibold whitespace-nowrap leading-tight"
                                style={{ color: '#374151' }}
                              >
                                장례식장
                                <br />
                                기본 이용료
                              </span>
                            </div>

                            {/* Row 3: 하단 라벨 */}
                            {bars.map((b, i) => (
                              <div
                                key={`l-${i}`}
                                className="pt-2.5 self-center w-full text-center"
                              >
                                <span
                                  className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
                                  style={{ backgroundColor: b.barColor }}
                                />
                                <span
                                  className={`align-middle leading-tight break-keep ${i === 2 ? 'whitespace-normal' : 'whitespace-nowrap'} ${b.isHighlight ? 'text-xs font-bold' : 'text-[10px] sm:text-[11px] font-semibold'}`}
                                  style={{ color: b.labelColor }}
                                >
                                  {b.label}
                                </span>
                              </div>
                            ))}
                            <div />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <p className="text-xs text-gray-400 text-center">
                    ※ 본 금액은 평균 데이터 기반 추정치이며, 실제 비용과 차이가
                    있을 수 있습니다.
                  </p>
                  <p className="mt-1 text-xs text-gray-400 text-center">
                    ※ 위 장례식장 추가된 품목에 따라서 예담 상조 비용도 추가 될
                    수 있음을 알려드립니다.
                  </p>
                </div>
              );
            })()}
        </div>

        {/* 하단 고정 버튼 — Step 4 (빈소 규모) */}
        {step === 4 && funeralType === '3day' && !viewOnly && (
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
        {step === contactStep && selectedHall && !viewOnly && (
          <button
            onClick={() => {
              // 토스트 즉시 노출 (NCP 자동 SMS 폴백이 실패를 흡수)
              toast.success(
                '알림톡으로 전송되었습니다 (실패 시 SMS 전송됩니다)',
              );
              // 견적 저장 + 알림톡 발송 (백그라운드)
              void submitEstimate();
              // 모달 닫기
              handleClose();
            }}
            disabled={
              !name.trim() ||
              phone.replace(/\D/g, '').length < 9 ||
              estimateSubmitting
            }
            className="shrink-0 w-full py-4 rounded-t-none sm:rounded-b-2xl text-white font-bold text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            알림톡으로 전송 받기
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
                  <button
                    onClick={() => {
                      const el = document.getElementById('fc-chart-section');
                      el?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      });
                    }}
                    className="shrink-0 flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <BarChart2 className="w-5 h-5" />
                    <span className="text-[10px] font-semibold whitespace-nowrap">
                      차트로 비교
                    </span>
                  </button>
                  {consultLocked || viewOnly ? (
                    <button
                      type="button"
                      disabled
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-sm font-bold bg-gray-300 cursor-not-allowed"
                    >
                      {consultLocked
                        ? '이미 상담 신청 완료'
                        : `${recommended.name}로 상담 받기`}
                    </button>
                  ) : (
                    <a
                      href="#inquiry"
                      onClick={(e) => {
                        e.preventDefault();
                        const productId = recommended.id;
                        // 상담 신청 저장 + 알림톡 발송 (사이드 이펙트, await 안 함)
                        void submitConsultation(productId, recommended.name);
                        handleClose();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-sm font-bold cursor-pointer"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      {recommended.name}로 상담 받기
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
