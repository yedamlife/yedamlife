import {
  Flower2,
  Sparkles,
  Heart,
  Tag,
  Truck,
  Coffee,
  Smartphone,
  Monitor,
  Gift,
  Scale,
  Shield,
  MapPin,
  Mail,
  Bell,
} from 'lucide-react';

// ── 브랜드 컬러 ──
export const BRAND_COLOR = '#4a5a2b';
export const BRAND_COLOR_LIGHT = '#e8eddf';
export const BRAND_COLOR_PREMIUM = '#8a7356';
export const GOLD = '#a8b84d';

// ── 스크롤 스파이 섹션 (탭별) ──
export interface ScrollSpySection {
  id: string;
  label: string;
}

export const scrollSpySections: ScrollSpySection[][] = [
  // Tab 0: 일반 상조
  [
    { id: 'sec-hero', label: '소개' },
    { id: 'sec-about', label: '후불제 상조' },
    { id: 'sec-products', label: '상품안내' },
    { id: 'sec-services', label: '제공 서비스' },
    { id: 'sec-membership', label: '멤버십 혜택' },
    { id: 'reviews', label: '고객 후기' },
    { id: 'sec-clients', label: '주요 고객사' },
    { id: 'sec-emergency', label: '긴급출동' },
    { id: 'inquiry', label: '상담 신청' },
  ],
  // Tab 1: 기업 상조
  [
    { id: 'sec-corp-hero', label: '소개' },
    { id: 'sec-corp-intro', label: '기업상조 안내' },
    { id: 'sec-corp-products', label: '상품안내' },
    { id: 'sec-corp-welfare', label: '복지서비스' },
    { id: 'sec-corp-effect', label: '도입효과' },
    { id: 'sec-corp-reviews', label: '도입 후기' },
    { id: 'sec-corp-inquiry', label: '상품비교/신청' },
  ],
  // Tab 2: 유품정리
  [
    { id: 'sec-cleanup-hero', label: '소개' },
    { id: 'sec-cleanup-products', label: '서비스 상품' },
    { id: 'sec-cleanup-process', label: '진행 절차' },
    { id: 'sec-cleanup-faq', label: '자주 묻는 질문' },
  ],
  // Tab 3: 운구의전
  [
    { id: 'sec-ceremony-hero', label: '소개' },
    { id: 'sec-ceremony-products', label: 'Point 4' },
    { id: 'sec-ceremony-why', label: '진행절차' },
    { id: 'sec-ceremony-faq', label: 'Q&A' },
  ],
  // Tab 4: 장지+
  [
    { id: 'sec-burial-hero', label: '소개' },
    { id: 'sec-burial-stats', label: '통계' },
    { id: 'sec-burial-products', label: '장지 검색' },
  ],
];

// ── 카테고리 탭 데이터 ──
export const categoryTabs = [
  {
    label: '후불제 상조',
    href: '#services',
    slug: 'general-funeral',
    pageTitle: '후불제 상조',
    subItems: ['기본 예식', '정성 예식', '품격 예식', '프리미엄 예식'],
  },
  {
    label: '기업 상조',
    href: '#corporate-services',
    slug: 'corporate-funeral',
    pageTitle: '기업 상조',
    subItems: ['기업 단체', '임직원 복지', '기업 맞춤'],
  },
  {
    label: '유품정리',
    href: '#cleanup',
    slug: 'cleanup',
    pageTitle: '유품정리',
    subItems: ['기본 정리', '전체 정리', '특수 정리'],
  },
  {
    label: '운구의전',
    href: '#funeral-escort',
    slug: 'funeral-escort',
    pageTitle: '운구의전',
    subItems: ['장례의전', '추모의전', 'VIP의전'],
  },
  {
    label: '장지+',
    href: '#burial-plus',
    slug: 'burial-plus',
    pageTitle: '장지+',
    subItems: ['장지 안내', '장지 예약', '프리미엄 장지'],
  },
  {
    label: '사후행정케어',
    href: '#post-care',
    slug: 'post-care',
    pageTitle: '사후행정케어',
    subItems: ['세무 상담', '상속 절차', '법률 지원'],
  },
  {
    label: '예담부고',
    href: 'http://xn--299a78ip7jtzi.com/',
    external: true,
    subItems: undefined,
  },
  {
    label: '리멤버49',
    href: 'https://www.xn--oi2bo5sikduta837auig.com/',
    external: true,
    subItems: undefined,
  },
];

// ── 상단 네비게이션 ──
export const topNavItems: {
  label: string;
  href: string;
  subItems?: { label: string; href: string; external?: boolean }[];
}[] = [
  {
    label: '회사소개',
    href: '/about',
    subItems: [
      { label: '인사말', href: '/about#greeting' },
      { label: 'ISO 9001', href: '/about#iso' },
      { label: '사회적기업', href: '/about#mission' },
      { label: '상표등록증', href: '/about#ci' },
      { label: '전국본부현황', href: '/about#branches' },
      { label: '오시는길', href: '/about#location' },
    ],
  },
  {
    label: '멤버십 가이드',
    href: '',
    subItems: [
      {
        label: '후불제 상조 가입신청',
        href: '/membership/general',
        external: true,
      },
      {
        label: '기업 상조 가입신청',
        href: '/membership/corporate',
        external: true,
      },
      {
        label: '가입증서 보기',
        href: '/membership/certificate',
        external: true,
      },
    ],
  },
  {
    label: '고객센터',
    href: '',
    subItems: [{ label: '공지사항', href: '/notices' }],
  },
];


// ── Google Form URL ──
export const GOOGLE_FORM_URL = 'https://forms.gle/yp4FxcD7yUNERkzp7';

// ── 날짜 유틸 ──
export function fmtDate(d: Date) {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
export function fmtShort(d: Date) {
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
export function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ── 가입상담현황 티커 데이터 ──
export const consultationData = [
  {
    id: 'NO.8875',
    name: '박*솔님',
    status: '상담완료',
    date: fmtDate(daysAgo(0)),
  },
  {
    id: 'NO.8874',
    name: '김*현님',
    status: '상담완료',
    date: fmtDate(daysAgo(0)),
  },
  {
    id: 'NO.8873',
    name: '이*수님',
    status: '상담진행',
    date: fmtDate(daysAgo(1)),
  },
  {
    id: 'NO.8872',
    name: '최*영님',
    status: '상담완료',
    date: fmtDate(daysAgo(1)),
  },
  {
    id: 'NO.8871',
    name: '정*미님',
    status: '상담완료',
    date: fmtDate(daysAgo(2)),
  },
  {
    id: 'NO.8870',
    name: '한*우님',
    status: '상담진행',
    date: fmtDate(daysAgo(2)),
  },
];

// ── 부고알림현황 티커 데이터 ──
export const obituaryData = [
  {
    name: '최*국',
    period: `${fmtShort(daysAgo(1))}~${fmtShort(daysAgo(-1))}`,
    location: '일산복음병원장례식장',
  },
  {
    name: '박*한',
    period: `${fmtShort(daysAgo(2))}~${fmtShort(daysAgo(0))}`,
    location: '서울아산병원장례식장',
  },
  {
    name: '김*정',
    period: `${fmtShort(daysAgo(3))}~${fmtShort(daysAgo(1))}`,
    location: '세브란스병원장례식장',
  },
  {
    name: '이*호',
    period: `${fmtShort(daysAgo(4))}~${fmtShort(daysAgo(2))}`,
    location: '분당서울대병원장례식장',
  },
  {
    name: '정*은',
    period: `${fmtShort(daysAgo(5))}~${fmtShort(daysAgo(3))}`,
    location: '고려대학교안암병원장례식장',
  },
];

// ── 제공 서비스 (8개) ──
export const serviceBenefits = [
  { icon: Tag, title: '예담라이프 상조상품', desc: '20만원 할인 혜택' },
  { icon: Truck, title: '관내 이송서비스', desc: '제공' },
  { icon: Coffee, title: '일회용품(200인분)', desc: '1BOX 또는 근조화환 제공' },
  { icon: Flower2, title: '입관 시', desc: '관꽃장식 서비스' },
  { icon: Heart, title: '발인 시', desc: '운구인원 2~4인 지원' },
  {
    icon: Smartphone,
    title: '무료 부고 알림 서비스',
    desc: '49재&기일 추모 알림 제공',
  },
  { icon: Monitor, title: '근조기 및', desc: '안내 배너 설치' },
  { icon: Gift, title: '예담라이프 멤버십', desc: '"제휴할인" 제공' },
];

// ── 멤버십 제휴할인 (5개) ──
export const membershipServices = [
  {
    title: '장지컨설팅',
    desc: '장지 무료 상담',
    note: '*현장 답사 가능',
    icon: MapPin,
    image:
      'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/membership01.jpg',
  },
  {
    title: '개장 및 이장 컨설팅',
    desc: '전문가 무료 상담',
    note: '*현장 답사 가능',
    icon: Sparkles,
    image:
      'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/membership02.jpg',
  },
  {
    title: '고인 유품정리 컨설팅',
    desc: '유품정리 전문가 상담',
    note: '*무료방문견적',
    icon: Heart,
    image:
      'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/membership03.jpg',
  },
  {
    title: '법률 컨설팅',
    desc: '법률 및 세무 전문가 상담',
    note: '(상속/증여/세금 등)',
    icon: Scale,
    image:
      'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/membership04.jpg',
  },
  {
    title: '장례 운구지원 컨설팅',
    desc: '장례 운구 전문 상담',
    note: '',
    icon: Shield,
    image:
      'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/membership05.jpg',
  },
];

// ── 후불제 상조 상품 (4개) ──
export const funeralProducts = [
  {
    id: 'yedam-1',
    name: '예담 1호',
    subtitle: '무빈소',
    desc: '빈소없이 간소하게\n예를 다하고자 하시는 분께',
    originalPrice: '150만원',
    discountPrice: '130만원',
    features: [
      '장례지도사 1명',
      '입관지도사 1명',
      '예담수의 1호',
      '관(오동)',
      '기본목함',
      '입관용품 제공',
      '관꽃장식 제공',
    ],
  },
  {
    id: 'yedam-2',
    name: '예담 2호',
    subtitle: '',
    desc: '기본에 충실한 최적의 상품으로\n예를 다하고자 하시는 분께',
    originalPrice: '250만원',
    discountPrice: '230만원',
    features: [
      '장례지도사 1명*3일',
      '접객 도우미 3명',
      '입관지도사 1명',
      '예담수의 2호',
      '관(오동)',
      '일반황토함',
      '입관·빈소용품 제공',
      '헌화 30송이',
      '관꽃장식 제공',
      '남자상복 3벌',
      '여자상복 5벌',
    ],
  },
  {
    id: 'yedam-3',
    name: '예담 3호',
    subtitle: '',
    desc: '실속과 품성함을 모두 갖춘\n상품으로 예를 다하고자 하시는 분께',
    originalPrice: '360만원',
    discountPrice: '340만원',
    features: [
      '장례지도사 1명*3일',
      '접객 도우미 4명',
      '입관지도사 1명',
      '예담수의 3호',
      '관(오동)',
      '일반황토함',
      '입관·빈소용품 제공',
      '헌화 30송이',
      '관꽃장식 제공',
      '남자상복 5벌',
      '여자상복 7벌',
      '운구지원 2인(수도권)',
    ],
  },
  {
    id: 'yedam-4',
    name: '예담 4호',
    subtitle: '',
    desc: '프리미엄과 품격을 모두 갖춘\n상품으로 예를 다하고자 하시는 분께',
    originalPrice: '480만원',
    discountPrice: '460만원',
    features: [
      '장례지도사 1명*3일',
      '접객 도우미 6명',
      '입관지도사 1명',
      '예담수의 4호',
      '관(오동)',
      '고급진공함',
      '입관·빈소용품 제공',
      '헌화 50송이',
      '관꽃장식 제공',
      '남자상복 10벌',
      '여자상복 10벌',
      '운구지원 4인(수도권)',
    ],
  },
];

// ── 상품별 추천 대상 + 상세 테이블 ──
export const productDetails: Record<
  string,
  {
    recommendations: string[];
    tableRows: {
      category: string;
      items: { label: string; sub?: string; value: string }[];
    }[];
  }
> = {
  'yedam-1': {
    recommendations: [
      '기초생활수급자여서 장례식을 저렴하게 치루고 싶다.',
      '경제적 여유가 없어 빈소를 차리기 부담스럽다.',
      '고인에 대한 기본적인 격식은 갖추고 최소 비용으로 장례를 치르고 싶다.',
      '조문도 부고도 생략할 예정이며, 가족끼리 추모하고 싶다.',
      '나의 장례로 인해 그 누구에게도 부담을 주기 싫다.',
      '남아있는 가족에게 장례 부담을 주고싶지 않다.',
      '직계자녀 및 친인척이 5명 전후일 것 같다.',
      '1일장 최간소화 장례 절차로 빠른 장례를 원한다.',
      '오랜 외국생활로 가족 또는 지인이 적다.',
    ],
    tableRows: [
      {
        category: '인력지원',
        items: [
          { label: '장례지도사', value: '1명' },
          { label: '접객 도우미', sub: '(1일 10시간 기준)', value: 'x' },
          { label: '입관지도사', value: '1명' },
        ],
      },
      {
        category: '장의차량',
        items: [
          { label: '장의버스', value: '택1 / 150km' },
          { label: '리무진', value: '택1 / 150km' },
          { label: '앰뷸런스', value: '사전가입 시 관내 이송 지원 혜택' },
        ],
      },
      {
        category: '고인용품\n&\n빈소용품',
        items: [
          { label: '수의(화장용)', value: '예담수의 1호' },
          { label: '관(화장용)', value: '오동' },
          { label: '횡대', sub: '(매장시)', value: '오동' },
          { label: '유골함', value: '기본목함' },
          {
            label: '입관용품',
            sub: '(관보, 명정, 꽃침대,\n알코올, 지의)',
            value: '제공',
          },
          {
            label: '빈소용품',
            sub: '(향, 초, 부의록,\n위패, 운구장갑)',
            value: 'x',
          },
          { label: '헌화', value: 'x' },
        ],
      },
      {
        category: '상복',
        items: [
          { label: '남자상복', sub: '(넥타이&와이셔츠 포함)', value: 'x' },
          { label: '여자상복', value: 'x' },
        ],
      },
      { category: '운구', items: [{ label: '운구지원', value: 'x' }] },
    ],
  },
  'yedam-2': {
    recommendations: [
      '가족이 적어 유가족들만 직접 이동을 원해 리무진을 이용하는 경우, 조문객 50명 내외',
      '장례에 꼭 필요한 서비스만 경제적, 합리적으로 이용하실 경우',
    ],
    tableRows: [
      {
        category: '인력지원',
        items: [
          { label: '장례지도사', value: '1명*3일' },
          { label: '접객 도우미', sub: '(1일 10시간 기준)', value: '3명' },
          { label: '입관지도사', value: '1명' },
        ],
      },
      {
        category: '장의차량',
        items: [
          { label: '장의버스', value: '택1 / 180km' },
          { label: '리무진', value: '택1 / 180km' },
          { label: '앰뷸런스', value: '사전가입 시 관내 이송 지원 혜택' },
        ],
      },
      {
        category: '고인용품\n&\n빈소용품',
        items: [
          { label: '수의(화장용)', value: '예담수의 2호' },
          { label: '관(화장용)', value: '오동' },
          { label: '횡대', sub: '(매장시)', value: '오동' },
          { label: '유골함', value: '일반황토함' },
          {
            label: '입관용품',
            sub: '(관보, 명정, 꽃침대,\n알코올, 지의)',
            value: '제공',
          },
          {
            label: '빈소용품',
            sub: '(향, 초, 부의록,\n위패, 운구장갑)',
            value: '제공',
          },
          { label: '헌화', value: '30송이' },
        ],
      },
      {
        category: '상복',
        items: [
          { label: '남자상복', sub: '(넥타이&와이셔츠 포함)', value: '3벌' },
          { label: '여자상복', value: '5벌' },
        ],
      },
      { category: '운구', items: [{ label: '운구지원', value: 'x' }] },
    ],
  },
  'yedam-3': {
    recommendations: [
      '가족이 어느 정도 있고 조문객이 100명 내외',
      '버스와 리무진 둘 다 제공(200km)',
      '일정 조문객 이상의 장례로 장례 진행 시 필요한 인원이 규모상 어느 정도 필요할 경우',
    ],
    tableRows: [
      {
        category: '인력지원',
        items: [
          { label: '장례지도사', value: '1명*3일' },
          { label: '접객 도우미', sub: '(1일 10시간 기준)', value: '4명' },
          { label: '입관지도사', value: '1명' },
        ],
      },
      {
        category: '장의차량',
        items: [
          { label: '장의버스', value: '200km' },
          { label: '리무진', value: '200km' },
          { label: '앰뷸런스', value: '사전가입 시 관내 이송 지원 혜택' },
        ],
      },
      {
        category: '고인용품\n&\n빈소용품',
        items: [
          { label: '수의(화장용)', value: '예담수의 3호' },
          { label: '관(화장용)', value: '오동' },
          { label: '횡대', sub: '(매장시)', value: '오동' },
          { label: '유골함', value: '일반황토함' },
          {
            label: '입관용품',
            sub: '(관보, 명정, 꽃침대,\n알코올, 지의)',
            value: '제공',
          },
          {
            label: '빈소용품',
            sub: '(향, 초, 부의록,\n위패, 운구장갑)',
            value: '제공',
          },
          { label: '헌화', value: '30송이' },
        ],
      },
      {
        category: '상복',
        items: [
          { label: '남자상복', sub: '(넥타이&와이셔츠 포함)', value: '5벌' },
          { label: '여자상복', value: '7벌' },
        ],
      },
      {
        category: '운구',
        items: [{ label: '운구지원', value: '2인 지원\n(수도권/화장장 한함)' }],
      },
    ],
  },
  'yedam-4': {
    recommendations: [
      '가족이 많고 조문객이 100명 이상인 경우',
      '버스와 리무진 둘 다 제공(300km)',
      '가족과 조문객이 많아 진행 인원이 많이 필요하고 최고급 VIP 사양으로 고인 용품이 준비되길 원할 경우',
    ],
    tableRows: [
      {
        category: '인력지원',
        items: [
          { label: '장례지도사', value: '1명*3일' },
          { label: '접객 도우미', sub: '(1일 10시간 기준)', value: '6명' },
          { label: '입관지도사', value: '1명' },
        ],
      },
      {
        category: '장의차량',
        items: [
          { label: '장의버스', value: '300km' },
          { label: '리무진', value: '300km' },
          { label: '앰뷸런스', value: '사전가입 시 관내 이송 지원 혜택' },
        ],
      },
      {
        category: '고인용품\n&\n빈소용품',
        items: [
          { label: '수의(화장용)', value: '예담수의 4호' },
          { label: '관(화장용)', value: '오동' },
          { label: '횡대', sub: '(매장시)', value: '오동' },
          { label: '유골함', value: '고급진공함' },
          {
            label: '입관용품',
            sub: '(관보, 명정, 꽃침대,\n알코올, 지의)',
            value: '제공',
          },
          {
            label: '빈소용품',
            sub: '(향, 초, 부의록,\n위패, 운구장갑)',
            value: '제공',
          },
          { label: '헌화', value: '50송이' },
        ],
      },
      {
        category: '상복',
        items: [
          { label: '남자상복', sub: '(넥타이&와이셔츠 포함)', value: '10벌' },
          { label: '여자상복', value: '10벌' },
        ],
      },
      {
        category: '운구',
        items: [{ label: '운구지원', value: '4인 지원\n(수도권/화장장 한함)' }],
      },
    ],
  },
};

// ── 후기 ──
export const testimonials = [
  {
    text: '갑작스러운 상황에서 처음부터 끝까지 세심하게 안내해주셔서 가족 모두가 위로받았습니다. 진심으로 감사드립니다.',
    author: '김*호',
    relation: '부친상',
    rating: 5,
    date: '2026.02',
  },
  {
    text: '어머니의 마지막 길을 품격 있게 준비해주셨습니다. 행정 절차까지 꼼꼼히 챙겨주신 덕분에 장례에만 집중할 수 있었어요.',
    author: '박*영',
    relation: '모친상',
    rating: 5,
    date: '2026.01',
  },
  {
    text: '월 납입금 없이 후불로 진행할 수 있어서 부담이 없었습니다. 장례 후에도 추모 관리까지 해주셔서 정말 만족합니다.',
    author: '이*수',
    relation: '장인상',
    rating: 5,
    date: '2025.12',
  },
  {
    text: '새벽에 급하게 연락드렸는데 바로 상담사분이 연결되어 안내받았습니다. 전담 지도사님이 끝까지 함께해주셔서 든든했습니다.',
    author: '정*미',
    relation: '시어머니상',
    rating: 5,
    date: '2025.11',
  },
];

// ── 사후 서비스 ──
export const afterServices = [
  {
    icon: Gift,
    title: '고객감동후기 작성 시 혜택 제공',
    desc: '장례 후 고객감동후기를 작성해주신 분들에게 장례메모리앨범 혹은 스타벅스 모바일 상품권을 증정합니다',
  },
  {
    icon: Mail,
    title: '고인 1주기 답례품',
    desc: '장례 후 1주기를 맞아 예담라이프(주) 대표자의 서한과 예담라이프 상조 상품권(10만원)을 보내드립니다',
  },
  {
    icon: Smartphone,
    title: '부고 답례 문자서비스',
    desc: '장례식 후 조문해주신 분들께 감사의 답례문자를 예담부고에서 무료로 이용하실 수 있습니다',
  },
  {
    icon: Bell,
    title: '무료 알림서비스',
    desc: '49재, 1주기 기일을 무료 알림 받으실 수 있습니다. 임종일 기준 1주일 전 / 1일 전 문자 발송',
  },
  {
    icon: Heart,
    title: '유족 정신건강 돌봄 전문상담',
    desc: '전문자격을 보유한 예담라이프의 상담가로부터 임종기 노인 및 유족의 심리적, 정서적 불안감을 해소하는 돌봄 상담을 지원합니다',
  },
];

// ── 주요 고객사 ──
export const LOGO_BASE =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife';
const clientLogoNums = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
  42, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
];
export const clientLogoRow1 = clientLogoNums.slice(0, 20);
export const clientLogoRow2 = clientLogoNums.slice(20, 40);
export const clientLogoRow3 = clientLogoNums.slice(40);

// ── 다이렉트 장례설계 질문 ──
export const surveyQuestions = [
  {
    id: 1,
    question: '장례식장 예정 지역을 선택해주세요.',
    type: 'select' as const,
    options: [
      '서울',
      '경기',
      '인천',
      '부산',
      '대구',
      '대전',
      '광주',
      '울산',
      '세종',
      '강원',
      '충북',
      '충남',
      '전북',
      '전남',
      '경북',
      '경남',
      '제주',
    ],
  },
  {
    id: 2,
    question: '예상 조문객 수를 선택해주세요.',
    type: 'select' as const,
    options: ['50명 이하', '50~100명', '100~200명', '200~300명', '300명 이상'],
  },
  {
    id: 3,
    question: '희망하시는 장례 규모를 선택해주세요.',
    type: 'radio' as const,
    options: [
      '간소한 장례 (무빈소)',
      '기본 장례',
      '품격 있는 장례',
      '프리미엄 장례',
    ],
  },
  {
    id: 4,
    question: '빈소 설치 여부를 선택해주세요.',
    type: 'radio' as const,
    options: ['빈소 설치', '무빈소 (빈소 없이 진행)', '상담 후 결정'],
  },
  {
    id: 5,
    question: '운구 서비스가 필요하신가요?',
    type: 'radio' as const,
    options: ['필요합니다', '필요하지 않습니다', '상담 후 결정'],
  },
  {
    id: 6,
    question: '수의 종류를 선택해주세요.',
    type: 'select' as const,
    options: [
      '예담수의 1호',
      '예담수의 2호',
      '예담수의 3호',
      '예담수의 4호',
      '상담 후 결정',
    ],
  },
  {
    id: 7,
    question: '상복이 필요하신가요?',
    type: 'radio' as const,
    options: ['필요합니다', '필요하지 않습니다', '상담 후 결정'],
  },
  {
    id: 8,
    question: '추가 서비스를 선택해주세요.',
    type: 'radio' as const,
    options: ['추모 영상 제작', '유품정리', '49재 알림 서비스', '특별히 없음'],
  },
  {
    id: 9,
    question: '연락처를 남겨주시면 맞춤 상담을 드립니다.',
    type: 'text' as const,
    options: [],
  },
];

// ── 비교표 데이터 ──
export const comparisonData = [
  {
    category: '인력지원',
    items: [
      { label: '장례지도사', values: ['1명', '1명*3일', '1명*3일', '1명*3일'] },
      {
        label: '접객 도우미',
        sub: '(1일 10시간 기준)',
        values: ['-', '3명', '4명', '6명'],
      },
      { label: '입관지도사', values: ['1명', '1명', '1명', '1명'] },
    ],
  },
  {
    category: '장의차량',
    items: [
      {
        label: '장의버스',
        values: ['택1 / 150km', '택1 / 180km', '200km', '300km'],
      },
      {
        label: '리무진',
        values: ['택1 / 150km', '택1 / 180km', '200km', '300km'],
      },
      {
        label: '앰뷸런스',
        values: ['사전가입 시 관내 이송 지원 혜택', '', '', ''],
      },
    ],
  },
  {
    category: '고인용품\n&빈소용품',
    items: [
      {
        label: '수의(화장용)',
        values: [
          '예담수의 1호',
          '예담수의 2호',
          '예담수의 3호',
          '예담수의 4호',
        ],
      },
      { label: '관(화장용)', values: ['오동', '오동', '오동', '오동'] },
      {
        label: '유골함',
        values: ['기본목함', '일반황토함', '일반황토함', '고급진공함'],
      },
      {
        label: '횡대',
        sub: '(매장시)',
        values: ['제공', '제공', '제공', '제공'],
      },
      { label: '입관용품', values: ['제공', '제공', '제공', '제공'] },
      { label: '빈소용품', values: ['-', '제공', '제공', '제공'] },
      { label: '헌화', values: ['-', '30송이', '30송이', '50송이'] },
      { label: '관꽃장식', values: ['제공', '제공', '제공', '제공'] },
    ],
  },
  {
    category: '상복',
    items: [
      {
        label: '남자상복',
        sub: '(넥타이&와이셔츠 포함)',
        values: ['-', '3벌', '5벌', '10벌'],
      },
      { label: '여자상복', values: ['-', '5벌', '7벌', '10벌'] },
    ],
  },
  {
    category: '운구',
    items: [
      {
        label: '운구지원',
        sub: '(수도권/화장장 한함)',
        values: ['-', '-', '2인 지원', '4인 지원'],
      },
    ],
  },
];

// ── 기업상조 티커 데이터 ──
export const corpConsultationData = [
  {
    company: 'ㅇㅇ전자',
    count: '임직원 150명',
    status: '도입완료',
    date: fmtDate(daysAgo(0)),
  },
  {
    company: 'ㅇㅇ건설',
    count: '임직원 80명',
    status: '상담중',
    date: fmtDate(daysAgo(1)),
  },
  {
    company: 'ㅇㅇ금융',
    count: '임직원 300명',
    status: '도입완료',
    date: fmtDate(daysAgo(2)),
  },
  {
    company: 'ㅇㅇ제약',
    count: '임직원 200명',
    status: '도입완료',
    date: fmtDate(daysAgo(3)),
  },
  {
    company: 'ㅇㅇ물산',
    count: '임직원 120명',
    status: '상담중',
    date: fmtDate(daysAgo(4)),
  },
  {
    company: 'ㅇㅇ에너지',
    count: '임직원 250명',
    status: '도입완료',
    date: fmtDate(daysAgo(5)),
  },
];

export const corpServiceData = [
  {
    company: 'ㅇㅇ전자',
    service: '장례지원 서비스 이용',
    date: fmtDate(daysAgo(0)),
  },
  {
    company: 'ㅇㅇ건설',
    service: '멤버십 혜택 이용',
    date: fmtDate(daysAgo(1)),
  },
  {
    company: 'ㅇㅇ금융',
    service: '장례지원 서비스 이용',
    date: fmtDate(daysAgo(2)),
  },
  {
    company: 'ㅇㅇ제약',
    service: '복지 컨설팅 진행',
    date: fmtDate(daysAgo(3)),
  },
  {
    company: 'ㅇㅇ물산',
    service: '장례지원 서비스 이용',
    date: fmtDate(daysAgo(4)),
  },
];

// ── 기업상조 상품 (2개) ──
export const CORP_IMAGE_BASE =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife';

export const corpFuneralProducts = [
  {
    id: 'corp-1',
    name: '예담 기업 1호',
    desc: '빈소없이 간소하게\n예를 다하고자 하시는 분께',
    originalPrice: '150만원',
    discountPrice: '130만원',
    image: `${CORP_IMAGE_BASE}/company-product-01.jpg`,
    summary: [
      '유가족들만 직접 이동을 원해 리무진을 이용하는 경우, 조문객 50명 내외',
      '장례에 꼭 필요한 서비스만 경제적, 합리적으로 이용하실 경우',
    ],
    features: [
      '장례지도사 1명*3일',
      '접객 도우미 3명',
      '입관상례사 1명',
      '버스, 리무진 중 택1 / 180km',
      '예담수의 1호',
      '관(오동) / 일반 황토함',
      '입관·빈소용품 제공',
      '헌화 30송이 / 관꽃장식',
      '남자상복 3벌 / 여자상복 5벌',
    ],
  },
  {
    id: 'corp-2',
    name: '예담 기업 2호',
    desc: '가족이 어느 정도 있고\n조문객이 100명 내외인 경우',
    originalPrice: '250만원',
    discountPrice: '230만원',
    image: `${CORP_IMAGE_BASE}/company-product-02.jpg`,
    summary: [
      '가족이 어느 정도 있고 조문객이 100명 내외',
      '버스와 리무진 둘 다 제공(200km)',
      '장례 진행 시 필요한 인원이 규모상 어느 정도 필요할 경우',
    ],
    features: [
      '장례지도사 1명*3일',
      '접객 도우미 4명',
      '입관상례사 1명',
      '버스&리무진 / 200km',
      '예담수의 2호',
      '관(오동) / 일반 황토함',
      '입관·빈소용품 제공',
      '헌화 30송이 / 관꽃장식',
      '남자상복 5벌 / 여자상복 7벌',
    ],
  },
];

// ── 기업상조 후기 ──
export const corpTestimonials = [
  {
    text: '복리후생 강화를 위해 예담라이프 기업상조를 도입했는데, 직원들의 만족도가 크게 높아져 재계약을 결정했습니다.',
    author: '김OO',
    relation: 'ㅇㅇ전자 인사팀장',
    rating: 5,
    date: '2026.02',
  },
  {
    text: '임직원 가족 장례 시 전담팀이 즉시 대응해주셔서 회사로서 큰 도움이 되었습니다. 임직원들도 안심하고 있습니다.',
    author: '이OO',
    relation: 'ㅇㅇ건설 총무부장',
    rating: 5,
    date: '2026.01',
  },
  {
    text: '비용 대비 서비스 품질이 매우 우수합니다. 타 상조 대비 합리적인 가격에 전문적인 서비스를 받을 수 있어 추천합니다.',
    author: '박OO',
    relation: 'ㅇㅇ금융 복지담당',
    rating: 5,
    date: '2025.12',
  },
  {
    text: '기업상조 도입 후 임직원 복지에 대한 신뢰를 쌓을 수 있었습니다. 전담 매니저분의 세심한 관리에 감사드립니다.',
    author: '최OO',
    relation: 'ㅇㅇ제약 대표이사',
    rating: 5,
    date: '2025.11',
  },
];

// ── 기업상조 비교표 데이터 ──
export const corpComparisonData = [
  {
    category: '인력지원',
    items: [
      { label: '장례지도사', values: ['1명*3일', '1명*3일'] },
      {
        label: '접객 도우미',
        sub: '(1일 10시간 기준)',
        values: ['3명', '4명'],
      },
      { label: '입관상례사', values: ['1명', '1명'] },
    ],
  },
  {
    category: '장의차량',
    items: [
      {
        label: '장의버스 / 리무진',
        values: ['버스, 리무진 중\n택1 / 180km', '버스&리무진\n200km'],
      },
    ],
  },
  {
    category: '고인용품\n&빈소용품',
    items: [
      { label: '수의(화장용)', values: ['예담수의 1호', '예담수의 2호'] },
      { label: '관(화장용) / 횡대(매장시)', values: ['오동', '오동'] },
      { label: '유골함', values: ['일반 황토함', '일반 황토함'] },
      { label: '입관용품', values: ['제공', '제공'] },
      { label: '빈소용품', values: ['제공', '제공'] },
      { label: '헌화', values: ['30송이', '30송이'] },
      { label: '관꽃장식', values: ['제공', '제공'] },
    ],
  },
  {
    category: '상복',
    items: [
      { label: '남자상복', values: ['3벌', '5벌'] },
      { label: '여자상복', values: ['5벌', '7벌'] },
    ],
  },
];
