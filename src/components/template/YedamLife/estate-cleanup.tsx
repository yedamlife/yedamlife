'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Plus,
  ChevronDown,
  ClipboardList,
  ScrollText,
  X,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
  BRAND_COLOR_PREMIUM,
  fmtShort,
  daysAgo,
} from './constants';
import {
  FaqItem,
  MembershipSection,
  CtaSection,
  ReviewCarousel,
  ReviewItem,
} from './components';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

// ── 실시간 상담 신청 현황 ──
const consultationData = [
  { type: '원룸', service: '유품소각', name: '권OO', daysAgo: 0 },
  { type: '투룸', service: '유품정리+분리이사', name: '노OO', daysAgo: 0 },
  { type: '오피스텔', service: '유품정리', name: '홍OO', daysAgo: 0 },
  { type: '아파트', service: '유품정리+유품소각', name: '양OO', daysAgo: 0 },
  { type: '빌라', service: '유품소각', name: '윤OO', daysAgo: 0 },
  { type: '오피스텔', service: '유품소각', name: '백OO', daysAgo: 1 },
  { type: '아파트', service: '특수청소', name: '김OO', daysAgo: 1 },
  { type: '주택', service: '생전정리', name: '이OO', daysAgo: 1 },
  { type: '빌라', service: '유품정리', name: '최OO', daysAgo: 2 },
  { type: '아파트', service: '유품소각+특수청소', name: '정OO', daysAgo: 2 },
  { type: '원룸', service: '생전정리', name: '한OO', daysAgo: 2 },
  { type: '오피스텔', service: '유품정리+유품소각', name: '서OO', daysAgo: 2 },
  { type: '주택', service: '유품소각', name: '강OO', daysAgo: 2 },
  { type: '투룸', service: '특수청소', name: '임OO', daysAgo: 2 },
];

// ── 고객 한줄후기 ──
const reviewData = [
  {
    name: '조OO',
    text: '유품소각 부탁드렸는데 잘해주셔서 감사합니다.',
    daysAgo: 0,
  },
  {
    name: '김OO',
    text: '전문가의 손길로 유품이 정리되니까 집이 더 깔끔해보여요.',
    daysAgo: 0,
  },
  {
    name: '박OO',
    text: '덕분에 더 이상 필요없는 물건을 잘 정리할 수 있었어요!',
    daysAgo: 1,
  },
  {
    name: '장OO',
    text: '깔끔한 일 처리와 진행절차가 마음에 드네요.',
    daysAgo: 1,
  },
  {
    name: '송OO',
    text: '예비사회적기업이라 믿음이 가서 선택했어요~',
    daysAgo: 2,
  },
  {
    name: '유OO',
    text: '만족해서 주변에 소개많이 시키려고 합니다.',
    daysAgo: 2,
  },
];

// ── 자동 스크롤 티커 ──
function AutoScrollTicker({
  children,
  speed = 30,
}: {
  children: React.ReactNode;
  speed?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const timer = setInterval(() => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
        el.scrollTop = 0;
      } else {
        el.scrollTop += 1;
      }
    }, speed);
    return () => clearInterval(timer);
  }, [speed]);
  return (
    <div
      ref={scrollRef}
      className="overflow-hidden"
      style={{ maxHeight: '160px', touchAction: 'none', pointerEvents: 'none' }}
    >
      {children}
    </div>
  );
}

// ── 생전정리 항목 캐러셀 ──
type ItemType = { title: string; desc: string; image: string };

function ItemsCarousel({ items }: { items: ItemType[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const itemCard = (item: ItemType) => (
    <div className="text-center">
      <div
        className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden p-6"
        style={{ backgroundColor: BRAND_COLOR_LIGHT }}
      >
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-contain"
        />
      </div>
      <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">
        {item.title}
      </h4>
      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed whitespace-pre-line">
        {item.desc}
      </p>
    </div>
  );

  return (
    <div>
      {/* 데스크탑: 5개 전부 노출 */}
      <div
        className="hidden sm:grid"
        style={{
          gridTemplateColumns: `repeat(${items.length}, 1fr)`,
          gap: '1.5rem',
        }}
      >
        {items.map((item) => (
          <div key={item.title}>{itemCard(item)}</div>
        ))}
      </div>

      {/* 모바일: 캐러셀 */}
      <div className="sm:hidden">
        <div className="relative">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="overflow-hidden mx-10" ref={emblaRef}>
            <div className="flex">
              {items.map((item) => (
                <div
                  key={item.title}
                  className="flex-[0_0_100%] min-w-0 px-2 py-6"
                >
                  {itemCard(item)}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="flex justify-center gap-1.5 mt-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                idx === selectedIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 인테리어 전&후 캐러셀 ──
function BeforeAfterCarousel({
  items,
}: {
  items: { before: string; after: string }[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="mb-24">
      <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-8 text-center">
        인테리어 전&amp;후 한눈에 보기
      </h3>
      <div className="relative">
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 shadow flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="overflow-hidden mx-12" ref={emblaRef}>
          <div className="flex">
            {items.map((item, idx) => (
              <div key={idx} className="flex-[0_0_100%] min-w-0 px-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={item.before}
                      alt={`Before ${idx + 1}`}
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 py-2 text-center bg-gradient-to-t from-black/60 to-transparent">
                      <span className="text-white font-bold text-lg">
                        Before
                      </span>
                    </div>
                  </div>
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={item.after}
                      alt={`After ${idx + 1}`}
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 py-2 text-center"
                      style={{ backgroundColor: 'rgba(74,90,43,0.7)' }}
                    >
                      <span className="text-white font-bold text-lg">
                        After
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 shadow flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => emblaApi?.scrollTo(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
              idx === selectedIndex ? 'bg-gray-800' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const SUPABASE_BASE =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife';

// ── 6대 서비스 ──
const services = [
  {
    title: '유품정리',
    desc: '유품을 간직할 물품, 재활용품, 매각물품, 폐기물품, 기증물품, 소각물품으로 분류·처리',
    detailId: 'cleanup',
    svg: `${SUPABASE_BASE}/yupum/cleanup_service01.svg`,
  },
  {
    title: '생전정리',
    desc: '생전에 자신의 물품을 정리 정돈하여 유가족의 부담을 줄이고 삶의 질을 높이는 서비스',
    detailId: 'living',
    svg: `${SUPABASE_BASE}/yupum/cleanup_service02.svg`,
  },
  {
    title: '유품소각',
    desc: '고인의 흔이 담긴 물품을 관련법인 폐기물관리법에 의거하여 전문 소각장에서 소각 처리',
    detailId: 'incineration',
    svg: `${SUPABASE_BASE}/yupum/cleanup_service03.svg`,
  },
  {
    title: '특수청소/소독',
    desc: '고독사, 사건현장 등 전문약품으로 위생 소독, 악취제거, 바이오 클리닝으로 원상복구',
    detailId: 'special',
    svg: `${SUPABASE_BASE}/yupum/cleanup_service04.svg`,
  },
  {
    title: '고독사정리',
    desc: '1인 가구 및 독거노인 증가에 따른 고독사 현장을 전문 인력이 체계적으로 정리·복구',
    detailId: 'special',
    svg: `${SUPABASE_BASE}/yupum/cleanup_service05.svg`,
  },
  {
    title: '인테리어',
    desc: '유품 정리나 고독사 정리 후 공간을 재구성하고 새로운 시작을 마련하는 인테리어 서비스',
    detailId: 'interior',
    svg: `${SUPABASE_BASE}/yupum/cleanup_service06.svg`,
  },
];

// ── Point 3 ──
const points = [
  {
    num: '01',
    title: '유품을 대하는\n마음가짐',
    desc: '유가족에게 애도와 존중의 자세로 추억이 담긴 물품 전달 및 반듯한 정리정돈으로 한 인생의 마무리를 도우며 고인에 대한 예(禮)를 담아 소중하고 정중하게 정리',
    image: `${SUPABASE_BASE}/yupum/estate_cleanout_point_1.jpg`,
  },
  {
    num: '02',
    title: '예비사회적기업으로서의\n공신력과 나눔의 실천',
    desc: '예비사회적기업으로서 공정과 신뢰를 우선으로 업무를 정직하게 수행하며, 사회에 작은 나눔의 실천으로 선한 이웃으로서의 사명감을 갖고 유품정리를 진행',
    image: `${SUPABASE_BASE}/yupum/estate_cleanout_point_2.jpg`,
  },
  {
    num: '03',
    title: '합리적인 가격과\n편의성',
    desc: '후불제 상조기업 예담라이프에 가입하여 30% 이상의 상조 할인과 더불어 멤버십 할인 혜택을 더해드리는 원스톱서비스 장례관련 일괄 진행으로 편의성 제공',
    image: `${SUPABASE_BASE}/yupum/estate_cleanout_point_3.jpg`,
  },
];

// ── 유품정리가 필요한 이유 ──
const cleanupReasons = [
  {
    num: '01',
    desc: '갑작스럽게 일을 당하여 스스로 정리\n(분류, 폐기, 소각)를 할 수 없는 경우',
  },
  {
    num: '02',
    desc: '유품과 거소의 정리, 재활용, 이사를\n일괄적으로 의뢰하고 싶은 경우',
  },
  { num: '03', desc: '장례 후 곧바로 직장으로\n복귀하여야 하는 경우' },
  { num: '04', desc: '일손이 없어서 큰 집을\n이동 및 처분이 힘든 경우' },
];

// ── 유품정리서비스 ──
const cleanupServices = [
  {
    title: '유품정리',
    desc: '유품을 간직할 물품, 재활용품, 매각물품,\n폐기물품, 기증물품, 소각물품으로 분류, 처리',
    image: `${SUPABASE_BASE}/yupum/estate_cleanout_service_1.jpg`,
  },
  {
    title: '유품소각',
    desc: '소각물품을 유품전문 소각장에서\n소각 처리',
    image: `${SUPABASE_BASE}/yupum/estate_cleanout_service_2.jpg`,
  },
  {
    title: '특수청소',
    desc: '전문약품으로 위생 소독,\n악취제거로 클리닝',
    image: `${SUPABASE_BASE}/yupum/estate_cleanout_service_3.jpg`,
  },
];

// ── 서비스별 상세 ──
const serviceDetails = [
  {
    id: 'cleanup',
    title: '유품정리 서비스',
    subtitle: '유품정리는 장례의례의 실질적 마무리입니다.',
    desc: '장례 후 관계 법령에 의거하여 예담라이프(주) 전문 유품정리사가 고인의 생활물품을 유족으로부터 위탁받아 분류·정리, 거소의 방역·소독 필요시 악취제거, 특수청소로 반듯하게 정리해 드립니다.',
    details: [
      '유품정리는 재활용품(판매 또는 기증), 소각물품, 폐기물품으로 분류하여 수거 및 정리, 처분하는 업무를 대신하고 고인이 머물렀던 거소의 위생관리를 위해 소독 등 특수청소로 원상복구합니다.',
      '예전에는 가족들이 직접 유품정리를 해왔지만 바쁜 생활로 장례 후 직장으로 바로 복귀해야 하거나 원거리, 핵가족화와 1인 가구 및 고령사회 독거노인의 증가 등으로 스스로 정리가 힘든 분들이 늘어나고 있습니다.',
      '유품정리 가운데 발견된 수첩, 일기장 등 의미있는 물건이나 귀중품일 경우 유가족에게 바로 전달하며 다량의 폐기물도 깨끗이 처분해 드립니다.',
    ],
    process: [
      {
        step: '01',
        title: '유품 분류 정리',
        detail: '문의 1600-0959, 홈페이지, 카카오톡, 메일 문의',
      },
      {
        step: '02',
        title: '간직할 유품\n전달,\n그 외 반출',
        detail: '상담 후 전화로 접수하거나 홈페이지, 카카오톡으로 접수',
      },
      {
        step: '03',
        title: '재활용 물품\n기증,\n기증·판매 처리',
        detail:
          '현장을 방문하여 견적을 내거나 고객 사정상 현장 사진으로 견적(고객 첨부 사진)\n- 고객과 협의하여 주의사항 숙지 후 작업 예상 시간이나 작업량, 현장 상황, 요청사항에 따른 견적\n- 일반(유품정리, 소각, 기증, 매각, 폐기)\n- 특수(크리닝 + 해충방역 + 살균소독 + 악취제거)',
      },
      {
        step: '04',
        title: '폐기물 및\n소각물 처리',
        detail:
          '작업인력이 투입되어 고인과 유가족에 대한 예도의 마음으로 유품분류 및 정리, 크리닝, 소독 방역, 살균소독과 특수청소(유가족 요청 시)',
      },
      {
        step: '05',
        title: '유족과\n소통 업무 처리',
        detail:
          '유가족 확인 단계로 작업 완료 후 의뢰인이 현장을 확인하거나 완료된 현장사진 전송',
      },
    ],
    order: [
      {
        title: '문의 및 접수',
        desc: '전화 상담·접수하거나\n온라인 견적 상담, 카카오톡으로 접수',
        image: `${SUPABASE_BASE}/yupum/cleanup_order01.jpg`,
      },
      {
        title: '현장 방문 및 견적',
        desc: '현장 방문하여\n상황에 맞는 맞춤 견적 진행',
        image: `${SUPABASE_BASE}/yupum/cleanup_order02.jpg`,
      },
      {
        title: '유품정리 작업',
        desc: '유품정리 및\n필요시 특수청소(소독,살균) 진행',
        image: `${SUPABASE_BASE}/yupum/cleanup_order03.jpg`,
      },
      {
        title: '검수 및 완료',
        desc: '의뢰인이 현장을 확인하거나\n완료된 현장사진 전송',
        image: `${SUPABASE_BASE}/yupum/cleanup_order04.jpg`,
      },
    ],
  },
  {
    id: 'living',
    title: '생전유품정리',
    subtitle:
      '생전 유품정리는 생전시에 자신의 물품을 정리 정돈하는 것을 말합니다.',
    desc: '죽음 후 유가족들에게 모두 맡기는 것이 아니라 생전에 유가족들에게 알려야할 사항들은 알리고 남아있는 생에 가운데 꼭 필요하고 간직하고 싶은 것과 사후 유가족들에게 요긴하게 간직할만한 물건 등을 분류하고 정리하는 것을 말합니다.',
    details: [
      '일본에서는 초고령 사회로의 진입과 함께, 사후 정리뿐만 아니라 생전 정리가 매우 일반화되고 있습니다.',
      '고령이 되어 자녀의 집에 동거하게 되거나 노인 시설에 입소하기 전에도 생전 정리의 필요성이 대두되고 있습니다.',
      '미니멀라이프를 실천하고 정리를 습관화하는 추세도 생전 정리의 한 형태로 볼 수 있습니다.',
      '개인이나 가족 단위로 생전 정리를 진행하는 것은 쉽지 않은 일이므로, 예담유품정리는 이 과정을 상담 후 진행해 드림으로써 도움을 제공합니다.',
    ],
    benefits: [
      {
        title: '유가족 부담 감소',
        desc: '생전정리를 통하여 남은 유가족들의 부담을 줄여줄 수 있습니다.',
      },
      {
        title: '삶의 질 상승',
        desc: '생전정리를 통하여 삶의 질이 높아집니다.',
      },
      {
        title: '치료 호전 도움',
        desc: '정돈된 생활환경 가운데 방문 간병, 간호를 받고 계신 분들의 치료 호전에도 도움이 됩니다.',
      },
      {
        title: '사후 비용 감소',
        desc: '사후 유품정리의 비용을 줄일 수 있습니다.',
      },
    ],
    items: [
      {
        title: '엔딩노트 작성',
        desc: '자신의 치료, 장례 관련\n의사표현과 준비 상황',
        image: `${SUPABASE_BASE}/yupum/life_organizing_tip_01.png`,
      },
      {
        title: '재산목록 작성',
        desc: '부동산, 예·적금, 보험,\n유가증권, 대출 등',
        image: `${SUPABASE_BASE}/yupum/life_organizing_tip_02.png`,
      },
      {
        title: '유언장',
        desc: '법적 효력이 있는\n유언장 작성 방법 안내',
        image: `${SUPABASE_BASE}/yupum/life_organizing_tip_03.png`,
      },
      {
        title: '가입 보험 관련 정리',
        desc: '보험회사 명칭, 종류, 보험증권번호,\n지급예정액, 증서 보관자 등',
        image: `${SUPABASE_BASE}/yupum/life_organizing_tip_04.png`,
      },
      {
        title: '디지털기기 정리',
        desc: '휴대폰, 컴퓨터\n온라인 가입 ID, PW 해약 등',
        image: `${SUPABASE_BASE}/yupum/life_organizing_tip_05.png`,
      },
    ],
  },
  {
    id: 'incineration',
    title: '유품소각',
    subtitle: '고인의 흔이 담긴 물품을 전문 소각장에서 정중하게 처리합니다.',
    desc: '고인의 흔이 담긴 생활물품, 애장품, 추억의 물품, 의류, 장례용품 등의 소각은 관련법인 폐기물관리법에 의거 처리되고 있습니다. 예담라이프는 유품소각만을 취급하는 전문업체에 위탁하여 시행하고 있습니다.',
    process: [
      {
        step: '01',
        title: '유품수령',
        image: `${SUPABASE_BASE}/yupum/sogak_order_1.png`,
      },
      {
        step: '02',
        title: '고인 위패작성',
        image: `${SUPABASE_BASE}/yupum/sogak_order_2.png`,
      },
      {
        step: '03',
        title: '종교 의식 후\n소각기로 소각',
        image: `${SUPABASE_BASE}/yupum/sogak_order_3.png`,
      },
      {
        step: '04',
        title: '소각장면 촬영',
        image: `${SUPABASE_BASE}/yupum/sogak_order_4.png`,
      },
      {
        step: '05',
        title: '사진전송 및\n홈페이지 업로드',
        image: `${SUPABASE_BASE}/yupum/sogak_order_5.png`,
      },
    ],
  },
  {
    id: 'special',
    title: '고독사, 사건현장 특수청소',
    subtitle: '전문 약품과 장비로 원상복구합니다.',
    desc: '1인 가구 및 독거노인 증가에 따른 고독사, 자살, 사건 및 화재현장, 쓰레기집, 반려동물 냄새, 기타 악취제거의 특수청소를 통해 재사용 가능한 거소 공간으로 원상복구하는 것을 말합니다.',
    details: [
      '고인이 거처한 집의 청소, 소독, 살균, 악취제거 등의 특수청소나 일반 클리닝으로 새로운 공간을 만들어 드립니다.',
      '오랜 기간에 걸친 찌든 때와 악취, 곰팡이 등을 말끔하게 제거하여 쾌적한 공간에서 새로운 일상이 시작되도록 예담유품정리 특수청소팀이 해결해 드리며, 고독사나 사건현장의 경우 전문약제의 특수청소를 통해 혈흔이나 오염원의 흔적들과 악취를 제거하여 말끔하게 원상복구해드립니다.',
    ],
    processDetails: [
      {
        title: '가재철거',
        desc: '불필요해진 가전제품, 가구류 등을 정리해서 폐기 처분 및 오염물질이 부착되어 일반적으로 처리하기 어려운 물건이나 대량 폐기물 반출',
      },
      {
        title: '오염물 제거',
        desc: '악취의 원인이 되고 일반적으로는 처리하기 어려운 찌든 오염물질\n(혈액/체액/부패액/오물 등)을 철저하게 제거하고 완전히 밀폐하여 폐기 처리',
      },
      {
        title: '해충구제',
        desc: '사후 경과 및 생활쓰레기에서 발생한 해충 박멸',
      },
      {
        title: '소독·악취제거',
        desc: '반려동물, 자살 및 사건 현장의 악취제거, 음식물 찌든 냄새가 배어있는 식당, 악취가 심하게 나는 화장실, 주방, 담배 냄새가 심한 영업장소 등에 원인에 따른 약제 살포와 오존 탈취기로 심한 악취제거. 기타 원인 모를 악취 제거',
      },
      {
        title: '클리닝',
        desc: '집을 깨끗하고 쾌적하게 클리닝 소독하여 위생적인 공간으로 재탄생',
      },
      {
        title: '원상회복',
        desc: '오염된 도배, 장판, 바닥 철거작업에서 교체까지 원스톱서비스로 이전보다 양호한 상태로 복구',
      },
    ],
    process: [
      {
        step: '01',
        title: '가재 철거',
        image: `${SUPABASE_BASE}/yupum/special_cleaning_1.png`,
      },
      {
        step: '02',
        title: '오염물 제거',
        image: `${SUPABASE_BASE}/yupum/special_cleaning_2.png`,
      },
      {
        step: '03',
        title: '해충 구제',
        image: `${SUPABASE_BASE}/yupum/special_cleaning_3.png`,
      },
      {
        step: '04',
        title: '소독·악취제거',
        image: `${SUPABASE_BASE}/yupum/special_cleaning_4.png`,
      },
      {
        step: '05',
        title: '클리닝',
        image: `${SUPABASE_BASE}/yupum/special_cleaning_5.png`,
      },
      {
        step: '06',
        title: '원상회복',
        image: `${SUPABASE_BASE}/yupum/special_cleaning_6.png`,
      },
    ],
  },
  {
    id: 'interior',
    title: '인테리어',
    subtitle: '유품 정리 후 공간을 재구성하여 새로운 시작을 마련합니다.',
    desc: '유품 정리나 고독사 정리 후의 인테리어 작업은 공간을 재구성하고 새로운 시작을 마련하는 중요한 과정입니다. 유품정리에서 인테리어(도배, 장판 등) 교체작업 까지 한번에 해결해드립니다.',
    details: [
      '이 과정은 유가족이나 해당 공간을 새로 사용할 사람들에게 정서적 치유와 새로운 가능성의 공간을 제공하는 역할을 합니다.',
      '유품 정리나 고독사 정리 후 인테리어는 새로운 시작을 의미하는 중요한 단계입니다.',
      '과거를 기리면서도 앞으로 나아갈 길을 준비하는 과정에서, 공간을 통해 새로운 기대와 희망을 품을 수 있는 기회가 될 수 있습니다.',
    ],
    beforeAfter: [
      {
        before: `${SUPABASE_BASE}/yupum/interior_before_1.jpg`,
        after: `${SUPABASE_BASE}/yupum/interior_after_1.jpg`,
      },
      {
        before: `${SUPABASE_BASE}/yupum/interior_before_2.jpg`,
        after: `${SUPABASE_BASE}/yupum/interior_after_2.jpg`,
      },
    ],
  },
];

// ── FAQ ──
const faqItems = [
  {
    q: '유품정리와 특수청소 견적을 어떻게 받을 수 있나요?',
    a: '저희 홈페이지 홈 화면 또는 전화로 견적을 신청하시면 예상 가격을 알려드립니다.\n정리대상 물품과 특수청소가 필요한 현장의 여러 사진을 보내주시면 더욱 정확한 견적이 될 수 있습니다.\n비용은 정리물품 규모 및 위치에 따라 작업인원, 작업환경, 작업장비, 난이도 등을 토대로 산출됩니다.',
  },
  {
    q: '작업현장에 갈 수 없는데, 진행이 될까요?',
    a: '대리인을 보내시거나 작업 중에 의문나는 점은 통화하여 조치하고 현장사진도 보내드려 확인을 받습니다.\n특히 작업 중에 발견되는 귀중품은 반드시 반환해 드립니다.',
  },
  {
    q: '혈흔과 벌레, 악취가 있는데 의뢰가 가능한가요?',
    a: '특수청소 전문인력이 오염물질 제거와 멸균, 소독, 악취제거를 통해 이웃들에게 폐가 되지 않도록 전문장비로 작업을 진행합니다.',
  },
  {
    q: '주변에 알려지지 않고 조용하게 작업이 가능한가요?',
    a: '완벽하게 차단하기는 어렵지만 고객 정보 보안에 최선을 다하고 있습니다.\n사전 협의로 시간 등 대응 방안을 고객님과 미리 논의할 수 있습니다.',
  },
  {
    q: '주말이나 공휴일에도 가능할까요?',
    a: '네, 365일 작업이 가능합니다.',
  },
  {
    q: '요금 지불은 어떻게 해야 하나요?',
    a: '기본적으로 작업이 끝나면 일괄 정산합니다. 유품정리를 의뢰하신 고객이 확인 후 결제를 하시면 됩니다.',
  },
  {
    q: '고인의 불용물품을 처분하고 싶은데 어떻게하면 좋은가요?',
    a: '저희는 유품정리를 전문업으로 운영하고 있습니다.\n가전제품, 가구류, 도서 등 재활용이 가능한 물품은 기증 또는 판매의 두 가지 방안이 있으므로 선택하시면 조치해 드리겠습니다.',
  },
  {
    q: '에어컨의 탈착도 가능합니까?',
    a: '네, 가능합니다.',
  },
  {
    q: '자동차나 오토바이 폐차는 어떻게 하는지요?',
    a: '자동차 폐차, 말소등록, 차량보험정리 등의 제반사항을 대리하여 조치해 드립니다.\n사용이 가능한 차량은 판매도 가능하며 아울러 오토바이 폐차도 대행하여 드립니다.',
  },
];

// ── 서비스 종류 옵션 ──
const serviceTypeOptions = [
  '유품정리',
  '유품소각',
  '유품정리+딥클린청소',
  '유품정리+유품소각',
  '유품정리+분리이사',
  '유품정리+내부인테리어',
  '유품정리+특수 방역,소독',
  '생전 유품정리',
];
const areaOptions = ['10평 이하', '10~20평', '20~30평', '30~40평', '40평 이상'];
const floorOptions = ['1층', '2층', '3층', '4층', '5층 이상', '지하', '옥탑'];
const housingOptions = [
  '아파트',
  '빌라',
  '오피스텔',
  '주택',
  '원룸/투룸',
  '상가/사무실',
  '기타',
];

export function EstateCleanup(_props: { googleFormUrl: string }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    fetch('/api/v1/reviews?category=estate&limit=6')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setReviews(json.data);
      })
      .catch(() => {});
  }, []);

  const [expandedDetail, setExpandedDetail] = useState<string | null>(null);
  const [expandedReligion, setExpandedReligion] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // 외부(index.tsx CTA)에서 견적 모달 열기 이벤트 수신
  useEffect(() => {
    const handler = () => setShowEstimateModal(true);
    window.addEventListener('open-estimate-modal', handler);
    return () => window.removeEventListener('open-estimate-modal', handler);
  }, []);
  const [estimateForm, setEstimateForm] = useState({
    name: '',
    phone: '',
    address: '',
    addressDetail: '',
    serviceTypes: [] as string[],
    area: '',
    floor: '',
    housing: '',
    visitDate: '',
  });

  const [estimateSubmitting, setEstimateSubmitting] = useState(false);
  const [showPostcode, setShowPostcode] = useState(false);
  const postcodeRef = useRef<HTMLDivElement>(null);

  const openDaumSearch = () => {
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
          setEstimateForm((p) => ({ ...p, address: addr }));
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

  const handleEstimateSubmit = async () => {
    if (!estimateForm.name || !estimateForm.phone) {
      toast.warning('성함과 연락처는 필수 항목입니다.');
      return;
    }
    if (estimateForm.serviceTypes.length === 0) {
      toast.warning('서비스 종류를 선택해주세요.');
      return;
    }

    setEstimateSubmitting(true);
    try {
      const res = await fetch('/api/v1/estate-cleanup/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: estimateForm.name,
          phone: estimateForm.phone,
          address: estimateForm.address || undefined,
          address_detail: estimateForm.addressDetail || undefined,
          service_types: estimateForm.serviceTypes,
          area: estimateForm.area || undefined,
          floor: estimateForm.floor || undefined,
          housing_type: estimateForm.housing || undefined,
          visit_date: estimateForm.visitDate || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('API error');
      }

      toast.success(
        '견적 상담 신청이 완료되었습니다.\n담당자가 빠른 시일 내에 연락드리겠습니다.',
      );
      setShowEstimateModal(false);
      setEstimateForm({
        name: '',
        phone: '',
        address: '',
        addressDetail: '',
        serviceTypes: [],
        area: '',
        floor: '',
        housing: '',
        visitDate: '',
      });
    } catch {
      toast.error('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setEstimateSubmitting(false);
    }
  };

  const toggleServiceType = (type: string) => {
    setEstimateForm((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter((t) => t !== type)
        : [...prev.serviceTypes, type],
    }));
  };

  return (
    <>
      {/* ── 히어로 + 서비스 카드 + 실시간 티커 ── */}
      <section id="sec-cleanup-hero" className="overflow-hidden">
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${SUPABASE_BASE}/yupum/cleanup-hero.jpg)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          <div className="relative z-10 pt-20 sm:pt-28 pb-10 sm:pb-14 px-4 sm:px-6">
            {/* 타이틀 */}
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <p
                className="inline-flex items-center gap-2 text-white/80 text-sm sm:text-lg font-medium mb-4 sm:mb-6 tracking-wide"
                style={{
                  textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                <img
                  src={`${SUPABASE_BASE}/yupum/seoul.svg`}
                  alt="서울특별시"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
                서울특별시 지정 유일 예비사회적기업 유품정리업체
              </p>
              <h1
                className="text-[28px] sm:text-[34px] lg:text-[40px] font-bold text-white leading-snug mb-2"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                고인의 마지막 공간을
              </h1>
              <h1
                className="text-[28px] sm:text-[34px] lg:text-[40px] font-bold leading-snug mb-8 sm:mb-10"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  fontFamily: '"Nanum Myeongjo", serif',
                }}
              >
                <span className="text-white">정성껏 정리하는 </span>
                <span style={{ color: '#e8d5a3', fontWeight: 700 }}>
                  &ldquo;예담유품정리&rdquo;
                </span>
              </h1>
            </div>

            {/* 서비스 카드 6개 */}
            <div className="max-w-6xl mx-auto mb-10 sm:mb-14">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
                {services.map((s) => (
                  <button
                    key={s.title}
                    onClick={() => {
                      document
                        .getElementById(`detail-${s.detailId}`)
                        ?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                    }}
                    className="group bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 text-center hover:bg-white hover:shadow-lg transition-all cursor-pointer border border-white/20"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <img
                        src={s.svg}
                        alt={s.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                      {s.title}
                    </h3>
                  </button>
                ))}
              </div>
            </div>

            {/* 실시간 상담 신청 현황 + 고객 한줄후기 */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 상담 신청 현황 */}
                <div className="rounded-2xl overflow-hidden backdrop-blur-md bg-white/95">
                  <div className="px-5 py-3 bg-gray-200/80 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-800">
                      실시간 상담 신청 현황
                    </h3>
                  </div>
                  <AutoScrollTicker speed={40}>
                    <div className="px-5 py-2">
                      {[...consultationData, ...consultationData].map(
                        (item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-400 w-[70px] shrink-0">
                                {fmtShort(daysAgo(item.daysAgo))}
                              </span>
                              <span className="text-xs text-gray-500 w-16">
                                {item.type}
                              </span>
                              <span className="text-xs text-gray-800 font-medium">
                                {item.service}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">
                                {item.name}
                              </span>
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: BRAND_COLOR_LIGHT,
                                  color: BRAND_COLOR,
                                }}
                              >
                                상담완료
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </AutoScrollTicker>
                </div>

                {/* 고객 한줄후기 */}
                <div className="rounded-2xl overflow-hidden backdrop-blur-md bg-white/95">
                  <div className="px-5 py-3 bg-gray-200/80 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-800">
                      고객 한줄후기
                    </h3>
                  </div>
                  <AutoScrollTicker speed={45}>
                    <div className="px-5 py-2">
                      {[...reviewData, ...reviewData].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-4 py-2.5 border-b border-gray-100 last:border-0"
                        >
                          <span className="text-xs text-gray-400 shrink-0 w-[70px]">
                            {fmtShort(daysAgo(item.daysAgo))}
                          </span>
                          <span className="text-xs text-gray-500 shrink-0 w-10">
                            {item.name}
                          </span>
                          <span className="text-xs text-gray-800 leading-relaxed">
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </AutoScrollTicker>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Point 3 ── */}
      <section
        className="py-16 sm:py-24 overflow-hidden"
        style={{ backgroundColor: '#fafaf8' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p
              className="text-sm font-semibold mb-2"
              style={{ color: BRAND_COLOR }}
            >
              Why Yedam
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              예담유품정리 <span style={{ color: BRAND_COLOR }}>Point 3</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {points.map((p) => (
              <div
                key={p.num}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="h-48 sm:h-56 overflow-hidden relative">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-white/70" />
                  <div className="absolute top-4 left-4">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: BRAND_COLOR_LIGHT,
                        color: BRAND_COLOR,
                      }}
                    >
                      Point {String(p.num).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-gray-900 whitespace-pre-line leading-snug">
                      {p.title}
                    </h3>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 서비스 상세 ── */}
      {serviceDetails.map((svc, svcIdx) => (
        <section
          key={svc.id}
          id={`detail-${svc.id}`}
          className="py-16 sm:py-24 overflow-hidden"
          style={{
            background:
              svc.id === 'living'
                ? 'linear-gradient(180deg, #eef4fb 0%, #f7fafd 50%, #ffffff 100%)'
                : svc.id === 'incineration'
                  ? 'linear-gradient(180deg, #fdf0ee 0%, #faf6f5 50%, #ffffff 100%)'
                  : svc.id === 'special'
                    ? 'linear-gradient(180deg, #e8f4f2 0%, #f2f9f8 50%, #ffffff 100%)'
                    : svc.id === 'interior'
                      ? 'linear-gradient(180deg, #eef5ec 0%, #f5f9f4 50%, #ffffff 100%)'
                      : svcIdx % 2 === 0
                        ? '#ffffff'
                        : '#fafaf8',
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="mb-10 text-center">
              <div
                className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4 tracking-wide"
                style={{ backgroundColor: BRAND_COLOR, color: '#fff' }}
              >
                0{svcIdx + 1}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
                {svc.title}
              </h2>
              <p className="text-base sm:text-lg text-gray-500 font-medium mb-4">
                {svc.subtitle}
              </p>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed max-w-3xl mx-auto">
                {svc.desc}
              </p>
            </div>

            {/* details: special/interior는 바로 노출, 나머지는 더보기 토글 */}
            {svc.details &&
              svc.id !== 'special' &&
              svc.id !== 'interior' &&
              (() => {
                const isDetailOpen = expandedDetail === svc.id;
                return (
                  <div className="mb-24">
                    <div className="flex justify-center">
                      <button
                        onClick={() =>
                          setExpandedDetail(isDetailOpen ? null : svc.id)
                        }
                        className="flex items-center gap-1 text-sm font-medium text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                      >
                        {isDetailOpen ? '접기' : '내용 더보기'}
                        <ChevronDown
                          className="w-4 h-4 transition-transform duration-200"
                          style={{
                            transform: isDetailOpen
                              ? 'rotate(180deg)'
                              : 'rotate(0)',
                          }}
                        />
                      </button>
                    </div>
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{ maxHeight: isDetailOpen ? '1000px' : '0px' }}
                    >
                      <div className="bg-gray-50 rounded-xl p-4 sm:p-5 mt-3 space-y-3 text-center">
                        {svc.details.map((d, i) => (
                          <p
                            key={i}
                            className="text-sm text-gray-600 leading-relaxed"
                          >
                            {d}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* special: details 바로 노출 */}
            {svc.details && (svc.id === 'special' || svc.id === 'interior') && (
              <div className="mb-24">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-5 space-y-3 text-center">
                  {svc.details.map((d, i) => (
                    <p
                      key={i}
                      className="text-sm text-gray-600 leading-relaxed"
                    >
                      {d}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {svc.id === 'cleanup' && (
              <>
                {/* 유품정리가 필요한 이유 */}
                <div className="mb-24">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 text-center">
                    유품정리가 필요한 이유
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {cleanupReasons.map((r) => (
                      <div
                        key={r.num}
                        className="border border-gray-200 rounded-xl p-5 text-center"
                      >
                        <div
                          className="w-10 h-10  flex items-center justify-center mx-auto mb-4 text-xs font-bold text-gray-900 white"
                          style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                        >
                          {r.num}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                          {r.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 유품정리서비스 */}
                <div className="mb-24">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 text-center">
                    유품정리서비스
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {cleanupServices.map((s) => (
                      <div
                        key={s.title}
                        className="rounded-xl overflow-hidden border border-gray-200"
                      >
                        <div className="h-48 sm:h-56 overflow-hidden">
                          <img
                            src={s.image}
                            alt={s.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-5 text-center">
                          <h4 className="text-base font-bold text-gray-900 mb-2">
                            {s.title}
                          </h4>
                          <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {svc.process && (
              <div className="mb-24">
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-8 text-center">
                  {svc.id === 'cleanup'
                    ? '유품정리 작업 절차'
                    : svc.id === 'incineration'
                      ? '유품소각 진행순서'
                      : svc.id === 'special'
                        ? '특수청소 진행과정'
                        : '진행과정'}
                </h3>

                {svc.id === 'special' ? (
                  /* ── 특수청소 전용 레이아웃 ── */
                  <>
                    {/* PC: 3x2 그리드 */}
                    <div className="hidden sm:grid sm:grid-cols-3 gap-x-6 gap-y-10 max-w-3xl mx-auto">
                      {svc.process.map((p) => (
                        <div key={p.step} className="text-center">
                          {'image' in p && p.image && (
                            <div className="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden bg-gray-100">
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <p className="text-xs font-bold text-gray-900 mb-1">
                            {p.step}
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {p.title}
                          </p>
                        </div>
                      ))}
                    </div>
                    {/* 모바일: 2x3 그리드 */}
                    <div className="sm:hidden grid grid-cols-2 gap-x-4 gap-y-8">
                      {svc.process.map((p) => (
                        <div key={p.step} className="text-center">
                          {'image' in p && p.image && (
                            <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden bg-gray-100">
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <p className="text-xs font-bold text-gray-900 mb-1">
                            {p.step}
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {p.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="relative">
                    {/* PC: 가로 한 줄 */}
                    <div className="hidden sm:grid sm:grid-cols-5 sm:gap-0">
                      {svc.process.map((p, idx) => {
                        const hasImage = 'image' in p && p.image;
                        return (
                          <div key={p.step} className="text-center relative">
                            {/* 연결선: 첫 번째 아이템 제외, 원형 중앙 높이에 맞춤 */}
                            {idx > 0 && (
                              <div
                                className="absolute h-px right-1/2"
                                style={{
                                  backgroundColor: BRAND_COLOR,
                                  top: hasImage ? '56px' : '5px',
                                  left: '-50%',
                                }}
                              />
                            )}
                            {hasImage ? (
                              <>
                                <div
                                  className={`w-28 h-28 rounded-full mx-auto mb-3 overflow-hidden relative z-10 ${svc.id === 'incineration' ? 'bg-white p-6' : 'bg-gray-100'}`}
                                >
                                  <img
                                    src={p.image}
                                    alt={p.title}
                                    className={`w-full h-full ${svc.id === 'incineration' ? 'object-contain' : 'object-cover'}`}
                                  />
                                </div>
                                <p className="text-xs text-gray-400 mb-1">
                                  {p.step}
                                </p>
                              </>
                            ) : (
                              <>
                                <div
                                  className="w-2.5 h-2.5 rounded-full mx-auto mb-3 relative z-10"
                                  style={{ backgroundColor: BRAND_COLOR }}
                                />
                                <p className="text-sm font-bold text-gray-900 mb-1.5">
                                  {p.step}
                                </p>
                              </>
                            )}
                            <p className="text-xs text-gray-600 font-medium whitespace-pre-line leading-snug">
                              {p.title}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* 모바일: 2열 지그재그 (선 없이) */}
                    <div className="sm:hidden">
                      <div
                        className="grid grid-cols-2 gap-y-8"
                        style={{
                          gridTemplateAreas: `
                          'item1 item2'
                          'item3 item4'
                          'item5 .'
                        `,
                        }}
                      >
                        {svc.process.map((p, idx) => {
                          const gridAreas = [
                            'item1',
                            'item2',
                            'item3',
                            'item4',
                            'item5',
                          ];
                          return (
                            <div
                              key={p.step}
                              className="text-center"
                              style={{ gridArea: gridAreas[idx] }}
                            >
                              {'image' in p && p.image ? (
                                <>
                                  <div
                                    className={`w-14 h-14 rounded-full mx-auto mb-2 overflow-hidden ${svc.id === 'incineration' ? 'bg-white p-3' : 'bg-gray-100'}`}
                                  >
                                    <img
                                      src={p.image}
                                      alt={p.title}
                                      className={`w-full h-full ${svc.id === 'incineration' ? 'object-contain' : 'object-cover'}`}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-400 mb-0.5">
                                    {p.step}
                                  </p>
                                </>
                              ) : (
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white mx-auto mb-2"
                                  style={{ backgroundColor: BRAND_COLOR }}
                                >
                                  {p.step}
                                </div>
                              )}
                              <p className="text-xs text-gray-600 font-medium whitespace-pre-line leading-snug">
                                {p.title}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {'processDetails' in svc &&
              svc.processDetails &&
              (() => {
                const isOpen = expandedDetail === svc.id;
                return (
                  <div className="mb-24">
                    <div className="flex justify-center border-t border-gray-200 pt-6">
                      <button
                        onClick={() =>
                          setExpandedDetail(isOpen ? null : svc.id)
                        }
                        className="flex items-center gap-1 text-sm font-bold text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                      >
                        {isOpen ? '접기' : '내용 더보기'}
                        <ChevronDown
                          className="w-4 h-4 transition-transform duration-200"
                          style={{
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                          }}
                        />
                      </button>
                    </div>
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{ maxHeight: isOpen ? '2000px' : '0px' }}
                    >
                      <div className="mt-6 rounded-xl overflow-hidden border border-gray-300">
                        {svc.processDetails.map(
                          (pd: { title: string; desc: string }, i: number) => (
                            <div
                              key={i}
                              className="flex border-b border-gray-300 last:border-0"
                            >
                              <div className="w-32 sm:w-40 shrink-0 flex items-center justify-center p-4 bg-gray-50 border-r border-gray-300">
                                <span className="text-sm font-bold text-gray-900 text-center">
                                  {pd.title}
                                </span>
                              </div>
                              <div className="flex-1 p-4 flex items-center">
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                  {pd.desc}
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

            {svc.id === 'incineration' && (
              <div className="mb-24">
                <div className="flex justify-center">
                  <button
                    onClick={() => setExpandedReligion((prev) => !prev)}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                  >
                    종교별 소각 자세히보기
                    <ChevronDown
                      className="w-4 h-4 transition-transform duration-200"
                      style={{
                        transform: expandedReligion
                          ? 'rotate(180deg)'
                          : 'rotate(0)',
                      }}
                    />
                  </button>
                </div>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: expandedReligion ? '1200px' : '0px' }}
                >
                  <div className="mt-6 rounded-xl overflow-hidden">
                    <img
                      src={`${SUPABASE_BASE}/yupum/sogak_religion.jpg`}
                      alt="종교별 소각 안내"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            )}

            {svc.id === 'special' && (
              <div className="mb-24">
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 text-center">
                  특수소독 방역이 필요한 곳
                </h3>
                <div className="overflow-hidden -mx-4 sm:-mx-6">
                  <div
                    className="flex gap-4 animate-marquee"
                    style={{ width: 'max-content' }}
                  >
                    {[...Array(2)].flatMap((_, dup) =>
                      Array.from({ length: 7 }, (_, i) => (
                        <div
                          key={`${dup}-${i}`}
                          className="w-48 sm:w-56 shrink-0 rounded-xl overflow-hidden"
                        >
                          <img
                            src={`${SUPABASE_BASE}/yupum/special_sodog_${i + 1}.jpg`}
                            alt={`특수소독 방역 ${i + 1}`}
                            className="w-full h-36 sm:h-44 object-cover rounded-xl"
                          />
                        </div>
                      )),
                    )}
                  </div>
                  <style>{`
                    @keyframes marquee {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                    }
                    .animate-marquee {
                      animation: marquee 25s linear infinite;
                    }
                    .animate-marquee:hover {
                      animation-play-state: paused;
                    }
                  `}</style>
                </div>
                <p className="text-sm sm:text-base text-gray-600 text-center mt-6 leading-relaxed">
                  가정집, 사건현장, 각종 사업장, 학교 및 교육시설, 의료시설,
                  제조업, 숙박업, 빌딩, 공공기관 등
                  <br />
                  건물위생관리 용역이 필요한 곳
                </p>
              </div>
            )}

            {'beforeAfter' in svc && svc.beforeAfter && (
              <BeforeAfterCarousel
                items={svc.beforeAfter as { before: string; after: string }[]}
              />
            )}

            {svc.order && (
              <div className="mb-24">
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6">
                    유품정리 진행 순서
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
                  {svc.order.map((o, i) => (
                    <div key={i} className="text-center">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mx-auto mb-5 border border-gray-200">
                        <img
                          src={`${SUPABASE_BASE}/yupum/estate_clean_order_${i + 1}.png`}
                          alt={o.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">
                        {o.title}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                        {o.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 내용 더보기 버튼 */}
                {svc.process && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() =>
                        setExpandedOrderId(
                          expandedOrderId === svc.id ? null : svc.id,
                        )
                      }
                      className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      내용 더보기
                      <ChevronDown
                        className="w-4 h-4 transition-transform"
                        style={{
                          transform:
                            expandedOrderId === svc.id ? 'rotate(180deg)' : '',
                        }}
                      />
                    </button>
                  </div>
                )}

                {/* 상세 진행 순서 */}
                {svc.process && expandedOrderId === svc.id && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="max-w-2xl mx-auto space-y-4">
                      {svc.process.map((p) => (
                        <div key={p.step} className="flex gap-4 items-start">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                            style={{
                              backgroundColor: BRAND_COLOR_LIGHT,
                              color: BRAND_COLOR,
                            }}
                          >
                            {p.step}
                          </div>
                          <div className="pt-1">
                            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">
                              {(p as any).detail || p.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {'benefits' in svc && svc.benefits && (
              <div className="mb-24">
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 text-center">
                  생전정리의 효과
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  {svc.benefits.map((b, bIdx) => (
                    <div
                      key={b.title}
                      className="rounded-xl overflow-hidden border border-gray-200"
                    >
                      <div className="h-40 sm:h-48 overflow-hidden">
                        <img
                          src={`${SUPABASE_BASE}/yupum/life_organizing_0${bIdx + 1}.jpg`}
                          alt={b.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-5 text-center">
                        <p className="text-sm sm:text-base font-bold text-gray-900 mb-2">
                          {b.title}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                          {b.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {'items' in svc && svc.items && (
              <div className="mb-24">
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 text-center">
                  생전정리 항목 및 방법
                </h3>
                <ItemsCarousel items={svc.items} />
              </div>
            )}
          </div>
        </section>
      ))}

      {/* ── 멤버십 제휴할인 ── */}
      <MembershipSection
        style={{
          background:
            'linear-gradient(180deg, #faf6ee 0%, #fcf9f4 50%, #ffffff 100%)',
        }}
      />

      {/* ── 후기 ── */}
      {reviews.length > 0 && (
        <section
          id="sec-cleanup-reviews"
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
                예담라이프 유품정리 서비스를 경험하신 분들의 생생한 후기입니다
              </p>
            </div>
            <ReviewCarousel reviews={reviews} />
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section
        id="sec-cleanup-faq"
        className="py-16 sm:py-24 overflow-hidden"
        style={{ backgroundColor: '#fafaf8' }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p
              className="text-sm font-semibold mb-2"
              style={{ color: BRAND_COLOR }}
            >
              FAQ
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              자주 묻는 질문
            </h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <FaqItem key={idx} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PC 우측 플로팅 사이드바 (sm 이상) ── */}
      <div className="hidden sm:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 flex-col bg-white rounded-[32px] shadow-xl border border-gray-200 overflow-hidden divide-y divide-gray-200">
        <a
          href="tel:1899-1477"
          className="flex flex-col items-center justify-center w-[60px] py-3 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Phone className="w-5 h-5 text-gray-700" />
          <span className="text-[10px] font-bold text-gray-600 mt-1 leading-tight text-center">
            전화 상담
          </span>
        </a>
        <button
          onClick={() => setShowEstimateModal(true)}
          className="flex flex-col items-center justify-center w-[60px] py-3 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <ScrollText className="w-5 h-5 text-gray-700" />
          <span className="text-[10px] font-bold text-gray-600 mt-1">
            견적 상담
          </span>
        </button>
        <a
          href="https://pf.kakao.com/_예담라이프"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center w-[60px] py-3 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#374151">
            <path d="M12 3C6.48 3 2 6.54 2 10.86c0 2.78 1.86 5.22 4.65 6.6l-.95 3.53c-.08.3.25.55.52.39l4.2-2.8c.51.07 1.04.1 1.58.1 5.52 0 10-3.54 10-7.86S17.52 3 12 3z" />
          </svg>
          <span className="text-[10px] font-bold text-gray-700 mt-1">
            친구추가
          </span>
        </a>
      </div>

      {/* ── 모바일 하단 고정 바 (sm 미만) ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#222] safe-area-bottom">
        <div className="flex items-center divide-x divide-white/20">
          <a
            href="tel:1899-1477"
            className="flex-1 flex items-center justify-center gap-2 py-4.5 text-white cursor-pointer"
          >
            <Phone className="w-5 h-5" />
            <span className="text-base font-bold">전화 상담</span>
          </a>
          <button
            onClick={() => setShowEstimateModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-4.5 text-white cursor-pointer"
          >
            <ScrollText className="w-5 h-5" />
            <span className="text-base font-bold">상담 신청</span>
          </button>
        </div>
      </div>
      {/* 모바일 하단 고정 바 높이만큼 여백 */}
      <div className="sm:hidden h-16" />

      {/* ── 견적 상담 모달 ── */}
      {showEstimateModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50"
          onClick={() => setShowEstimateModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between bg-gray-100 rounded-t-2xl">
              <span className="font-bold text-gray-800">
                빠른 견적 상담 신청
              </span>
              <button
                onClick={() => setShowEstimateModal(false)}
                className="p-1 hover:bg-black/5 rounded-lg cursor-pointer transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-500 rotate-45" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* 성함 / 연락처 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">
                    성함 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="성함"
                    value={estimateForm.name}
                    onChange={(e) =>
                      setEstimateForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1.5">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="-를 제외한 숫자만 입력해주세요"
                    value={estimateForm.phone}
                    onChange={(e) =>
                      setEstimateForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* 주소 */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  주소
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={openDaumSearch}
                      className="shrink-0 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer hover:opacity-90 transition-colors"
                      style={{
                        backgroundColor: BRAND_COLOR_LIGHT,
                        color: BRAND_COLOR,
                      }}
                    >
                      <Search className="w-4 h-4 inline-block mr-1" />
                      주소 검색
                    </button>
                    <input
                      type="text"
                      placeholder="주소 검색 버튼을 눌러주세요"
                      value={estimateForm.address}
                      readOnly
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none bg-gray-50 cursor-default"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="상세주소"
                    value={estimateForm.addressDetail}
                    onChange={(e) =>
                      setEstimateForm((p) => ({
                        ...p,
                        addressDetail: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* 서비스 종류 + 평수/층수/주거형태/날짜 */}
              <div className="bg-gray-50 rounded-2xl p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* 서비스 종류 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      서비스 종류 <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2.5">
                      {serviceTypeOptions.map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2.5 cursor-pointer"
                        >
                          <Checkbox
                            checked={estimateForm.serviceTypes.includes(type)}
                            onCheckedChange={() => toggleServiceType(type)}
                            className="border-gray-300 data-[state=checked]:bg-[#4a5a2b] data-[state=checked]:border-[#4a5a2b]"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 평수/층수/주거형태/날짜 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">
                        평수
                      </label>
                      <Select
                        value={estimateForm.area}
                        onValueChange={(v) =>
                          setEstimateForm((p) => ({ ...p, area: v }))
                        }
                      >
                        <SelectTrigger className="w-full rounded-xl border-gray-200 bg-white text-sm">
                          <SelectValue placeholder="평수 선택" />
                        </SelectTrigger>
                        <SelectContent className="z-200">
                          {areaOptions.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">
                        층수
                      </label>
                      <Select
                        value={estimateForm.floor}
                        onValueChange={(v) =>
                          setEstimateForm((p) => ({ ...p, floor: v }))
                        }
                      >
                        <SelectTrigger className="w-full rounded-xl border-gray-200 bg-white text-sm">
                          <SelectValue placeholder="층수 선택" />
                        </SelectTrigger>
                        <SelectContent className="z-200">
                          {floorOptions.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">
                        주거형태
                      </label>
                      <Select
                        value={estimateForm.housing}
                        onValueChange={(v) =>
                          setEstimateForm((p) => ({ ...p, housing: v }))
                        }
                      >
                        <SelectTrigger className="w-full rounded-xl border-gray-200 bg-white text-sm">
                          <SelectValue placeholder="주거형태 선택" />
                        </SelectTrigger>
                        <SelectContent className="z-200">
                          {housingOptions.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">
                        무료 방문 견적 날짜
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 transition-all"
                          >
                            <span
                              className={
                                estimateForm.visitDate
                                  ? 'text-gray-900'
                                  : 'text-gray-400'
                              }
                            >
                              {estimateForm.visitDate
                                ? format(
                                    new Date(estimateForm.visitDate),
                                    'yyyy년 MM월 dd일',
                                    { locale: ko },
                                  )
                                : '날짜 선택'}
                            </span>
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 z-200"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={
                              estimateForm.visitDate
                                ? new Date(estimateForm.visitDate)
                                : undefined
                            }
                            onSelect={(date) =>
                              setEstimateForm((p) => ({
                                ...p,
                                visitDate: date
                                  ? format(date, 'yyyy-MM-dd')
                                  : '',
                              }))
                            }
                            locale={ko}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleEstimateSubmit}
                disabled={estimateSubmitting}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {estimateSubmitting ? '신청 중...' : '신청하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ CTA ══════════════ */}
      <CtaSection
        id="contact"
        title={
          <>
            가장 어려운 순간,
            <br />
            예담라이프가 함께합니다
          </>
        }
        description={
          <>
            전문 상담사가 24시간 대기하고 있습니다.
            <br />
            부담 없이 문의해 주세요.
          </>
        }
        buttons={
          <>
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent('open-estimate-modal'))
              }
              className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl transition-colors shadow-lg cursor-pointer hover:opacity-90 overflow-hidden"
              style={{
                backgroundColor: BRAND_COLOR_PREMIUM,
                color: '#ffffff',
              }}
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
              <ClipboardList className="relative w-5 h-5" />
              <span className="relative">견적 상담</span>
            </button>
            <a
              href="tel:1660-0959"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Phone className="w-5 h-5" />
              전화 상담
            </a>
          </>
        }
      />
      {/* 주소 검색 팝업 (모달 위에 띄움) */}
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
    </>
  );
}
