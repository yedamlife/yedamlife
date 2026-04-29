'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { YedamFooter } from '@/components/template/YedamLife/footer';

type TabKey = 'three-day' | 'no-mourning' | 'cremation' | 'burial' | 'after' | 'support';
type DayKey = 'd1' | 'd2' | 'd3';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'three-day', label: '3일장 장례식' },
  { key: 'no-mourning', label: '무빈소 장례식' },
  { key: 'cremation', label: '장례 후 화장' },
  { key: 'burial', label: '장례 후 매장' },
  { key: 'after', label: '장례 이후 절차' },
  { key: 'support', label: '운구 지원 & 답례문' },
];

interface Step {
  title: string;
  body: React.ReactNode;
}

const THREE_DAY: Record<DayKey, Step[]> = {
  d1: [
    {
      title: '장례준비 사전상담',
      body: (
        <>
          예담라이프의 엔딩플래너와 24시간 365일 사전상담을 진행할 수 있습니다.
          <br />
          사전상담에서는 전국 장례식장 시설사용료, 조문객 식대, 제단꽃장식,
          제사음식, 화장비용, 지자체 장례지원금 등을 안내드리고 있으며 다양한
          무료혜택 및 할인지원까지 사전상담을 통해 제공드리고 있습니다.
        </>
      ),
    },
    {
      title: '임종',
      body: (
        <>
          <p className="font-semibold text-gray-900">1) 의료기관 내 임종시</p>
          <p>원무과에서 사망진단서 10부 이상 발급합니다.</p>
          <p className="font-semibold text-gray-900 mt-3">
            2) 의료기관 외 임종시
          </p>
          <p>
            자택 임종, 사고사의 경우 병원 이송 후 사망진단서(시체검안서) 10부
            이상 발급합니다.
            <br />
            사망원인이 외인사/원인미상인 경우 관할 경찰서에 신고, 검사지휘서를
            수령해야 합니다.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            * 사망진단서(시체검안서), 검사지휘서는 원본이 효력 있습니다.
          </p>
          <p className="font-semibold text-gray-900 mt-3">
            3) 장례식장의 빈소 예약 확인
          </p>
          <p>이용하고자 하는 장례업체에 연락하여 장례식장의 빈소 예약을 확인합니다.</p>
        </>
      ),
    },
    {
      title: '고인 이송',
      body: <>운구차량으로 고인을 이송, 장례식장 안치실에 모십니다.</>,
    },
    {
      title: '장례세부사항 결정',
      body: (
        <>
          화장/매장 등 장법과 장지를 결정하고, 입관 및 발인 시간 등 일정과
          견적을 확인합니다.
        </>
      ),
    },
    {
      title: '부고알림 · 조문준비',
      body: (
        <>
          영정사진, 제단, 제사상 결정 후 가족 및 친지에게 부고를 발송합니다.
          <br />
          장례관리사 배정 및 음식 주문, 상복 착용과 제사 준비를 진행합니다.
        </>
      ),
    },
    {
      title: '입관식 진행',
      body: (
        <>
          고인의 몸을 깨끗이 씻겨드리고 단정히 옷을 입혀드린 후 관에 모시는
          절차로, 1시간~1시간 30분 정도 소요됩니다.
        </>
      ),
    },
    {
      title: '제사 및 종교의식',
      body: <>입관식 후 제사를 진행하고, 종교가 있을 경우 종교의식을 진행합니다.</>,
    },
  ],
  d2: [
    {
      title: '조문객 맞이 준비',
      body: (
        <>
          일반적으로 2일차 오후 시간대에 조문객이 가장 많이 방문합니다.
          <br />
          음식과 조문 답례품 등을 사전에 점검하고 조문객 응대를 준비합니다.
        </>
      ),
    },
    {
      title: '조문객 맞이',
      body: (
        <>
          상주는 빈소에 머물며 조문객을 맞이합니다. 조문 답례 인사와 안내를
          진행합니다.
        </>
      ),
    },
  ],
  d3: [
    {
      title: '장지 이동준비',
      body: (
        <>
          차량, 운구인원, 발인제를 지낼 장소 등 발인을 위한 사항을 최종
          점검합니다.
        </>
      ),
    },
    {
      title: '장례식장 비용정산',
      body: <>미사용 물품 반납 및 장례식장 비용을 정산합니다.</>,
    },
    {
      title: '빈소정리',
      body: <>개인물품을 챙기고 빈소를 정돈합니다.</>,
    },
    {
      title: '발인',
      body: (
        <>
          발인은 장례식장에서 장지로 떠나는 일련의 과정으로, 발인식을 진행한 후
          이동합니다.
        </>
      ),
    },
    {
      title: '장지 이동',
      body: <>관을 운구하여 화장장 또는 묘소로 이동합니다.</>,
    },
  ],
};

const NO_MOURNING: Step[] = [
  {
    title: '장례 일정 확인',
    body: (
      <>
        화장장과 입관실 현황을 확인하여 예약을 진행합니다.
        <br />
        입관식 시간과 장례 일정 결정 후 가족들은 자택에서 대기합니다.
      </>
    ),
  },
  {
    title: '부고 알림',
    body: (
      <>
        직계 가족 위주의 소규모 장례식으로 진행되며, 입관식 참석자에게 시간을
        알리거나 조문 사양 의사를 전달합니다.
      </>
    ),
  },
  {
    title: '고인 이송',
    body: <>운구차량으로 고인을 이송, 장례식장 안치실에 모십니다.</>,
  },
  {
    title: '장례세부사항 결정',
    body: (
      <>
        화장/매장 등 장법 결정과 장지 예약, 입관·발인 시간 등 일정과 견적을
        확인합니다.
      </>
    ),
  },
  {
    title: '입관식 진행',
    body: (
      <>
        가족 고별식을 별도로 요청할 수 있으며, 입관식 후 곧바로 화장장으로
        이동합니다.
      </>
    ),
  },
];

const CREMATION: Step[] = [
  {
    title: '화장장 예약',
    body: (
      <>
        장례 첫날 장례지도사가 화장장 예약을 진행합니다. 화장 예약 시간 30분
        전까지 화장장에 도착하여 접수 절차를 완료해야 하며, 사망진단서,
        검사지휘서, 고인의 주민등록등본(원본) 각 1부를 준비해야 합니다.
      </>
    ),
  },
  {
    title: '운구 및 접수',
    body: <>장의 차량으로 관을 화장장까지 옮기고, 화장장 접수처에서 필요한 수속을 진행합니다.</>,
  },
  {
    title: '화장 및 대기',
    body: (
      <>
        화장이 시작되면 가족들은 유족 대기실에서 대기합니다. 소요 시간은 1시간
        ~ 1시간 30분이며, 진행 중 종교별 추모의식을 지낼 수 있습니다.
      </>
    ),
  },
  {
    title: '수골 후 이동',
    body: <>화장 완료 후 분골된 유골을 한지로 감싸 유골함에 모시고, 안치를 위해 이동합니다.</>,
  },
];

const BURIAL: Step[] = [
  {
    title: '운구 및 장지 이동',
    body: (
      <>
        장의 차량에 모신 관을 장지로 운구합니다. 공원묘지 등에서는 서류 승인 후
        직원의 안내를 받습니다.
      </>
    ),
  },
  {
    title: '운구 및 묘지 이동',
    body: <>장지 도착 후 관을 운구하여 정해진 묘지 구역으로 이동합니다.</>,
  },
  {
    title: '하관 · 평토 · 성분',
    body: (
      <>
        미리 준비된 광중(구덩이)에 관을 모십니다. 그 후 흙으로 채우며 평지와
        같은 높이가 되도록 조성합니다. 봉분을 만들며 평토제와 성분제를
        진행하고, 마지막으로 종교별로 성분체 또는 추모의식(종교 예식)을
        진행합니다.
      </>
    ),
  },
];

const AFTER: Step[] = [
  {
    title: '장례 후 의례',
    body: (
      <>
        장례가 끝난 후 자택에서 행하는 의례로서, 가풍 또는 종교에 따라 예식을
        진행합니다. 일반적으로 초우제, 재우제, 삼우제를 치릅니다.
      </>
    ),
  },
  {
    title: '사망신고',
    body: (
      <>
        사망일로부터 30일 이내에 사망자의 주소지의 관할 읍면동 행정복지센터에
        신고합니다.
      </>
    ),
  },
  {
    title: '매장신고 (매장의 경우)',
    body: (
      <>
        개인묘는 설치 후 30일 이내에 신고하며, 가족묘·종중묘·법인묘는 사전
        허가가 필요합니다. 정부24 웹사이트에서 온라인 신청 가능합니다.
      </>
    ),
  },
  {
    title: '사망자 재산조회',
    body: <>&apos;안심상속 원스톱 서비스&apos;를 통해 상속 재산을 일괄 조회합니다.</>,
  },
  {
    title: '장례 후 감사인사',
    body: <>조문객과 위로해주신 분들께 답례 문자로 감사를 표합니다.</>,
  },
  {
    title: '고인의 유품정리',
    body: <>가족이 직접 정리하거나 전문청소업체를 통해 진행할 수 있습니다.</>,
  },
];

const SUPPORT: Step[] = [
  {
    title: '운구 지원 서비스',
    body: (
      <>
        예담라이프는 장례 전문지식을 갖춘 장례지도사를 통해 운구 서비스를
        제공합니다. 고인의 품위를 위한 전문화된 운구 인원을 배치하여, 핵가족화와
        바쁜 현대생활로 인한 유가족의 부담을 덜어드립니다.
      </>
    ),
  },
  {
    title: '운구 지원 신청 방법',
    body: (
      <>
        발인 전 18시까지 상담전화 또는 장례지도사에게 문의해주시면 됩니다.
        발인 당일 40~50분 전에 장례식장에 도착하여 운구 준비를 진행합니다.
      </>
    ),
  },
  {
    title: '답례문 안내',
    body: (
      <>
        장례식 때 문상을 와 주신 분들에게 답례의 인사를 드리는 것이 예의입니다.
        현대에는 문자로 답례 인사를 드리며, 추후 문상객에게 경조사가 있을 경우
        직접 찾아가는 것이 관례입니다.
      </>
    ),
  },
  {
    title: '답례 문자 예시',
    body: (
      <div className="space-y-3">
        <p className="text-sm text-gray-600 italic leading-relaxed">
          &ldquo;바쁘신 와중에도 큰 위로와 격려를 보내주셔서 깊이 감사드립니다.
          베풀어주신 따뜻한 정성으로 큰 슬픔을 잘 마무리할 수 있었습니다. 직접
          찾아 뵙고 인사드리는 것이 도리이오나 우선 글로써 인사를 대신합니다.
          베풀어 주신 은혜 잊지 않고 살아가겠습니다. - 상주 일동 -&rdquo;
        </p>
      </div>
    ),
  },
];

export default function FuneralProcedurePage() {
  return (
    <Suspense>
      <FuneralProcedureContent />
    </Suspense>
  );
}

function FuneralProcedureContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabKey | null;
  const dayParam = searchParams.get('day') as DayKey | null;

  const tab: TabKey = TABS.some((t) => t.key === tabParam)
    ? (tabParam as TabKey)
    : 'three-day';
  const day: DayKey =
    dayParam === 'd1' || dayParam === 'd2' || dayParam === 'd3'
      ? dayParam
      : 'd1';

  const setTab = (next: TabKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', next);
    params.delete('day');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setDay = (next: DayKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('day', next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const steps =
    tab === 'three-day'
      ? THREE_DAY[day]
      : tab === 'no-mourning'
        ? NO_MOURNING
        : tab === 'cremation'
          ? CREMATION
          : tab === 'burial'
            ? BURIAL
            : tab === 'after'
              ? AFTER
              : SUPPORT;

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        html, body { scrollbar-width: none; -ms-overflow-style: none; overflow-x: clip; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="min-h-screen bg-white"
        style={{ fontFamily: 'Pretendard, sans-serif' }}
      >
        {/* 페이지 타이틀 */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between flex-wrap gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                장례절차
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Home</span>
                <span>›</span>
                <span>장례정보</span>
                <span>›</span>
                <span className="text-gray-700">장례절차</span>
              </div>
            </div>
          </div>
        </section>

        {/* 메인 탭 */}
        <div className="border-y border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-3 sm:grid-cols-6">
              {TABS.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className="relative py-4 sm:py-5 text-xs sm:text-sm font-bold transition-colors cursor-pointer border-r border-gray-100 last:border-r-0"
                    style={{
                      backgroundColor: active ? '#f3f4f6' : 'transparent',
                      color: active ? '#374151' : '#9ca3af',
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <main className="py-14 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            {/* 일자 서브탭 (3일장만) */}
            {tab === 'three-day' && (
              <div className="flex justify-center gap-8 sm:gap-12 mb-10 sm:mb-14">
                {(['d1', 'd2', 'd3'] as DayKey[]).map((d, i) => {
                  const active = day === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setDay(d)}
                      className={`relative pb-2 text-base sm:text-lg font-bold cursor-pointer transition-colors ${
                        active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {i + 1}일차
                      {active && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded bg-gray-800" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 단계 리스트 */}
            <div className="space-y-0">
              {steps.map((step, idx) => (
                <div key={idx}>
                  <StepBlock index={idx + 1} step={step} />
                  {idx < steps.length - 1 && (
                    <div className="flex justify-center py-5">
                      <div className="w-9 h-10 rounded-md flex items-end justify-center pb-1 bg-gray-700">
                        <ChevronDown className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>

        <YedamFooter />
      </div>
    </>
  );
}

function StepBlock({ index, step }: { index: number; step: Step }) {
  return (
    <div className="rounded-xl bg-gray-50 px-6 sm:px-10 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">
        <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-2 sm:w-44 shrink-0">
          <span className="text-3xl sm:text-4xl font-extrabold text-gray-300 tracking-tight">
            {String(index).padStart(2, '0')}
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
            {step.title}
          </h3>
        </div>
        <div className="flex-1 border-l-2 border-gray-300 pl-5 sm:pl-7 text-sm sm:text-[15px] text-gray-700 leading-relaxed space-y-1.5">
          {step.body}
        </div>
      </div>
    </div>
  );
}
