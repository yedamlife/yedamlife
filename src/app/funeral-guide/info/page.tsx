'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Info, MapPin, FileText } from 'lucide-react';
import { YedamFooter } from '@/components/template/YedamLife/footer';

const ACCENT = '#374151'; // gray-700
const ACCENT_BG = '#f3f4f6'; // gray-100

const SUPABASE_BASE =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife/funeral_guide';

type TabKey = 'condolence' | 'ancestral' | 'relocation' | 'benefit';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'condolence', label: '조문 예절' },
  { key: 'ancestral', label: '제례 예절' },
  { key: 'relocation', label: '이장/개장' },
  { key: 'benefit', label: '장제급여' },
];

export default function FuneralInfoPage() {
  return (
    <Suspense>
      <FuneralInfoContent />
    </Suspense>
  );
}

function FuneralInfoContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabKey | null;
  const tab: TabKey = TABS.some((t) => t.key === tabParam)
    ? (tabParam as TabKey)
    : 'condolence';

  const setTab = (next: TabKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

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
                장례정보
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Home</span>
                <span>›</span>
                <span>장례정보</span>
                <span>›</span>
                <span className="text-gray-700">
                  {TABS.find((t) => t.key === tab)?.label}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 탭 네비 */}
        <div className="border-y border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4">
              {TABS.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className="relative py-4 sm:py-5 text-sm sm:text-base font-bold transition-colors cursor-pointer"
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

        {/* 탭 콘텐츠 */}
        <main className="py-14 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            {tab === 'condolence' && <CondolenceContent />}
            {tab === 'ancestral' && <AncestralContent />}
            {tab === 'relocation' && <RelocationContent />}
            {tab === 'benefit' && <BenefitContent />}
          </div>
        </main>

        <YedamFooter />
      </div>
    </>
  );
}

// ── 공통 ──
function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-6 sm:mb-8">
      <div
        className="w-12 h-1 mb-3 rounded"
        style={{
          background: `linear-gradient(90deg, #2c2c2c 0% 50%, ${ACCENT} 50% 100%)`,
        }}
      />
      <h3
        className="text-2xl sm:text-3xl font-extrabold"
        style={{ color: ACCENT }}
      >
        {title}
      </h3>
    </div>
  );
}

function NoticeBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div
      className="rounded-xl p-5 sm:p-6"
      style={{ backgroundColor: ACCENT_BG }}
    >
      <div
        className="flex items-center gap-2 mb-3 font-bold"
        style={{ color: ACCENT }}
      >
        <Info className="w-4 h-4" />
        {title}
      </div>
      <ul className="space-y-1.5 text-sm text-gray-700 leading-relaxed">
        {items.map((line, i) => (
          <li key={i}>· {line}</li>
        ))}
      </ul>
    </div>
  );
}

function NumberRow({ no, text }: { no: string; text: string }) {
  return (
    <div className="flex items-center gap-4 border border-gray-200 rounded-lg px-4 py-3">
      <div
        className="w-9 h-9 shrink-0 rounded flex items-center justify-center text-sm font-extrabold text-white"
        style={{ backgroundColor: ACCENT }}
      >
        {no}
      </div>
      <p className="text-sm sm:text-[15px] font-semibold text-gray-800">
        {text}
      </p>
    </div>
  );
}

function BowStepCard({
  src,
  desc,
}: {
  src: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-full aspect-square rounded-lg overflow-hidden bg-white mb-3">
        <img src={src} alt="" className="w-full h-full object-cover" />
      </div>
      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({
  no,
  title,
  desc,
  src,
}: {
  no: string;
  title?: string;
  desc?: string;
  src?: string;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white flex items-start gap-3">
      {src && (
        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
          <img
            src={src}
            alt={title || no}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[11px] font-extrabold px-2 py-0.5 rounded"
            style={{
              backgroundColor: ACCENT_BG,
              color: ACCENT,
            }}
          >
            {no}
          </span>
          {title && (
            <span className="text-sm font-bold text-gray-900">{title}</span>
          )}
        </div>
        {desc && (
          <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
            {desc}
          </p>
        )}
      </div>
    </div>
  );
}

// ── 1. 조문 예절 ──
function CondolenceContent() {
  const base = `${SUPABASE_BASE}/condolence`;
  return (
    <div className="space-y-16 sm:space-y-20">
      {/* 조문 방법 */}
      <section>
        <SectionHeading title="조문 방법" />
        <ul className="space-y-3 text-[15px] text-gray-700 leading-relaxed mb-6">
          {[
            '영좌에서 물러나와 상주와 맞절합니다. 종교적 이유로 절을 못한다면 정중히 목례만 해도 좋습니다.',
            '절을 한 후에 간단한 인사말을 건네도 좋지만, 기본적으로 아무말 하지 않는 것이 일반적입니다.',
            '문상이 끝난 후에는 두세 걸음 뒤로 물러난 뒤 몸을 돌려 나오는 것이 예의입니다.',
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: ACCENT }}
              />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <NoticeBox
          title="조문 시 주의사항"
          items={[
            '상주, 상제에게 악수를 청하는 행동을 삼가고, 인사는 목례로 대신합니다.',
            '반가운 지인을 만나더라도 큰 소리로 이름을 부르지 말아야 합니다.',
            '유가족에게 계속 말을 시키거나, 고인의 사망 원인을 상세히 묻는 것은 실례입니다.',
            '장례식장에서 술을 마실 때는 본인이 본인 잔을 채워서 마시는 것이 좋고, 건배도 해서는 안됩니다.',
          ]}
        />
      </section>

      {/* 조문 복장 */}
      <section>
        <SectionHeading title="조문 복장" />
        <div className="space-y-3 mb-8">
          <NumberRow
            no="01"
            text="검은색 정장이 기본이나, 없을 때는 무채색 계열의 어두운 옷도 괜찮습니다."
          />
          <NumberRow
            no="02"
            text="외투나 모자는 장례식장에 들어가기 전에 벗는 것이 예의입니다."
          />
          <NumberRow
            no="03"
            text="지나치게 화려한 악세사리(시계, 귀걸이, 팔찌 등)는 착용을 삼가합니다."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* 남성 조문 복장 */}
          <div
            className="rounded-xl p-5 sm:p-6"
            style={{ backgroundColor: ACCENT_BG }}
          >
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-5 text-center">
              남성 조문 복장 예시
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <DressCard
                src={`${base}/jj_img01.jpg`}
                desc="검은색 정장 자켓/바지"
              />
              <div className="grid grid-rows-2 gap-3 sm:gap-4">
                <DressCard
                  src={`${base}/jj_img02.jpg`}
                  desc="흰색 셔츠와 검은색 굵은 넥타이"
                />
                <DressCard
                  src={`${base}/jj_img03.jpg`}
                  desc="검은색 양말과 검은색 구두"
                />
              </div>
            </div>
          </div>

          {/* 여성 조문 복장 */}
          <div
            className="rounded-xl p-5 sm:p-6"
            style={{ backgroundColor: ACCENT_BG }}
          >
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-5 text-center">
              여성 조문 복장 예시
            </h4>
            <DressCard
              src={`${base}/jj_img04.jpg`}
              desc="검은색 정장 자켓/바지"
            />
          </div>
        </div>
      </section>

      {/* 부의금 봉투 */}
      <section>
        <SectionHeading title="부의금 봉투" />
        <div className="space-y-3 mb-8">
          <NumberRow
            no="01"
            text="봉투 앞면 중앙에 추모의 의미를 담은 한자어를 적으며, 보통 부의(賻儀)를 가장 많이 씁니다."
          />
          <NumberRow
            no="02"
            text="봉투 뒷면 왼쪽 하단에 세로로 이름을 적으며, 소속은 이름의 오른쪽 위쪽에 적습니다."
          />
          <NumberRow
            no="03"
            text="부의금은 홀수단위(3, 5, 10, 15, ....)로 내며, 정성을 담아 깨끗한 돈으로 준비하는 것이 좋습니다."
          />
        </div>

        <h4 className="text-lg font-bold text-gray-900 mb-4">부의 봉투 예</h4>
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 mb-6">
          <img
            src={`${base}/jj_img05.png`}
            alt="부의 봉투 예"
            className="w-full h-auto"
          />
        </div>

        <ul className="space-y-2 text-sm text-gray-700">
          {[
            ['부의(賻儀)', '상을 치루고 있는 곳에 보내는 물품이라는 뜻'],
            ['근조(謹弔)', '죽음에 대해 슬퍼하고 있는 뜻'],
            ['추모(追慕)', '돌아가신 분을 그리며 생각한다는 뜻'],
            ['추도(追悼)', '돌아가신 분을 생각하며 슬퍼하고 있다는 뜻'],
            ['애도(哀悼)', '죽음에 대해 슬퍼하고 있다는 뜻'],
            ['위령(慰靈)', '돌아가신 분의 영혼을 위로하고 있다는 뜻'],
          ].map(([term, mean]) => (
            <li key={term} className="flex gap-2">
              <span className="font-bold shrink-0" style={{ color: ACCENT }}>
                {term}
              </span>
              <span className="text-gray-500">: {mean}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 조문순서 */}
      <section>
        <SectionHeading title="조문순서" />
        <div className="rounded-xl border border-gray-200 p-6 bg-gray-50 mb-8">
          <img
            src={`${base}/jj_img06.png`}
            alt="조문순서"
            className="w-full h-auto"
          />
        </div>

        {/* 부의록 서명 */}
        <div className="mb-10">
          <h4 className="text-lg font-bold text-gray-900 mb-3">
            01. 부의록 서명
          </h4>
          <div className="space-y-2 text-[15px] text-gray-700 leading-relaxed">
            <p>장례식장에 도착하면 먼저 부의록에 서명합니다.</p>
            <p>
              부의금은 문상이 끝난 후 내는 것이 기본이지만, 요즘은 부의록 서명
              시 함께 내기도 하니 주변 분위기에 맞추면 됩니다.
            </p>
            <p>
              상가의 종교나 집안 문화에 따라 문상법의 차이가 있으니 주의할 점이
              있는지 물어보는 것이 좋으며, 특별히 없을 경우 본인의 종교에 맞는
              예법에 따릅니다.
            </p>
          </div>
        </div>

        {/* 분향 헌화 */}
        <div className="mb-10">
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            02. 분향 혹은 헌화
          </h4>
          <div className="space-y-3 mb-6">
            <NumberRow
              no="01"
              text="빈소에 들어가서 상주에게 가벼운 목례 후, 분향 혹은 헌화를 합니다."
            />
            <NumberRow
              no="02"
              text="단체로 왔을 경우, 대표로 한 명만 분향 혹은 헌화를 합니다."
            />
          </div>

          <p className="text-base font-bold text-gray-900 mb-3">분향 시</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StepCard
              no="01"
              src={`${base}/jj_img07.png`}
              desc="오른손으로 향 1개나 3개를 집은 뒤 촛불로 불을 붙입니다. (이미 향로에 향이 많을 경우 1개만 피우는 것이 좋습니다.)"
            />
            <StepCard
              no="02"
              src={`${base}/jj_img08.png`}
              desc="불은 왼손으로 가볍게 부채질하거나 흔들어 꺼줍니다. 절대 입으로 불어서는 안됩니다."
            />
            <StepCard
              no="03"
              src={`${base}/jj_img09.png`}
              desc="향을 잡은 오른손을 왼손으로 받치고 공손히 향로에 꽂습니다. 여러개 꽂을 경우 반드시 하나씩 꽂습니다."
            />
          </div>

          <p className="text-base font-bold text-gray-900 mb-3">헌화 시</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StepCard
              no="01"
              src={`${base}/jj_img10.png`}
              desc="헌화를 할 때는 오른손으로 꽃 줄기를 잡고 왼손으로 오른손을 받칩니다."
            />
            <StepCard
              no="02"
              src={`${base}/jj_img11.png`}
              desc="꽃봉오리가 영정사진을 향하도록 올립니다."
            />
          </div>
        </div>

        {/* 재배 또는 묵념 */}
        <div className="mb-10">
          <h4 className="text-lg font-bold text-gray-900 mb-3">
            03. 재배 또는 묵념
          </h4>
          <p className="text-[15px] text-gray-700 leading-relaxed mb-3">
            분향 혹은 헌화 후, 일어나 두 번 절을 합니다. 종교적 이유로 절하는
            것이 어려우면, 묵념/기도를 올려도 무방합니다.
          </p>
          <div
            className="rounded-lg p-4 text-sm space-y-1"
            style={{ backgroundColor: ACCENT_BG }}
          >
            <p>
              <b style={{ color: ACCENT }}>한 번</b> : 천신에게 잘 받아달라는
              의미
            </p>
            <p>
              <b style={{ color: ACCENT }}>두 번</b> : 지신에게 잘 떠나게
              해달라는 의미
            </p>
          </div>
        </div>

        {/* 절하는 법 - 남성/여성 큰절 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div
            className="rounded-xl p-5 sm:p-6"
            style={{ backgroundColor: ACCENT_BG }}
          >
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-5 text-center">
              절하는 법 (남성 큰절)
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <BowStepCard
                src={`${base}/jj_img12.jpg`}
                desc="오른손이 위로 오도록 합니다."
              />
              <BowStepCard
                src={`${base}/jj_img14.jpg`}
                desc="공수한 손으로 바닥을 짚고 왼쪽 무릎부터 꿇습니다."
              />
              <BowStepCard
                src={`${base}/jj_img13.jpg`}
                desc="공수한 손을 눈높이에 올립니다. 이때, 손바닥과 시선은 바닥을 향합니다."
              />
              <BowStepCard
                src={`${base}/jj_img19.jpg`}
                desc="몸을 앞으로 깊이 숙여 절합니다."
              />
            </div>
          </div>

          <div
            className="rounded-xl p-5 sm:p-6"
            style={{ backgroundColor: ACCENT_BG }}
          >
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-5 text-center">
              절하는 법 (여성 큰절)
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <BowStepCard
                src={`${base}/jj_img16.jpg`}
                desc="왼손이 위로 오도록 합니다."
              />
              <BowStepCard
                src={`${base}/jj_img18.jpg`}
                desc="양손으로 무릎 앞쪽 바닥을 짚으며 절합니다."
              />
              <BowStepCard
                src={`${base}/jj_img17.jpg`}
                desc="공수한 손을 눈높이에 올립니다. 이때, 손바닥과 시선은 바닥을 향합니다."
              />
              <BowStepCard
                src={`${base}/jj_img19.jpg`}
                desc="몸을 앞으로 깊이 숙여 절합니다."
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DressCard({ src, desc }: { src: string; desc: string }) {
  return (
    <div className="rounded-xl overflow-hidden bg-white flex flex-col">
      <div className="bg-white flex items-center justify-center p-3">
        <img
          src={src}
          alt={desc}
          className="w-full h-auto max-h-[420px] object-contain"
        />
      </div>
      <div className="px-3 pb-3 pt-1 text-center">
        <p className="text-sm font-semibold text-gray-800">{desc}</p>
      </div>
    </div>
  );
}

// ── 2. 제례 예절 ──
function AncestralContent() {
  const base = `${SUPABASE_BASE}/ancestral`;

  const ceremonies: { name: string; desc: string }[] = [
    {
      name: '성복제',
      desc: '입관 후 가족들이 상복을 정식으로 갖춰입고 처음으로 올리는 제사입니다.',
    },
    {
      name: '발인제',
      desc: '장례식장에서 장지로 떠나기 전 지내는 제사입니다.',
    },
    {
      name: '노제',
      desc: '장지로 가는 중 고인의 생가나 애착을 가진 곳에서 지내는 제사입니다.',
    },
    {
      name: '산신제',
      desc: '땅을 파기 전, 조상의 묘가 있는 산신에게 지내는 제사입니다.',
    },
    { name: '성분제', desc: '묘지의 봉분이 완성되고 지내는 제사입니다.' },
    {
      name: '평토제',
      desc: '하관 후 광중의 흙을 메꾸어 평도(땅이 평평해짐)가 되면 그 앞에서 지내는 제사입니다. * 지역에 따라 평토제를 생략하기도 합니다.',
    },
    {
      name: '초우제',
      desc: '삼우제 중 첫번째 제사로, 발인 당일 저녁에 집으로 돌아와서 지내는 제사입니다.',
    },
    {
      name: '재우제',
      desc: '초우제 다음날 지내는 두번째 제사로, 해당일이 유일이 아닌 강일이면 그 다음날인 유일날 지냅니다.',
    },
    {
      name: '삼우제',
      desc: '3번째 제사를 삼우제라 하며 재우제 다음날 지냅니다. 현대에선 초우, 재우를 생략하고 삼우제만 지내는 경우가 많으며 보통 발인 후 이틀 뒤의 낮에 장지에 방문해서 제사를 지냅니다.',
    },
    {
      name: '49재',
      desc: '돌아가신 날로부터 7일째 마다 1번씩 7번 지내는 제사입니다. 약식으로는 마지막 49일째 되는 날 1번 지내기도 합니다.',
    },
    {
      name: '기제',
      desc: '기일에 지내는 제사로, 고인이 돌아가신 날의 전날 밤 23시부터 제사를 준비하여 새벽에 지내는 제사입니다. * 현대에는 편의상 돌아가신 날 저녁에 지냅니다.',
    },
    {
      name: '차례',
      desc: '설이나 추석에 지내는 제사이며, 기제사와는 별개로 따로 지냅니다. 발인 후 이틀 뒤 낮 장지에 방문해서 제사를 지냅니다.',
    },
    {
      name: '생신제',
      desc: '고인의 생신일에 지내는 제사로, 첫번째 기제사 전에 한번만 지냅니다.',
    },
  ];

  const rows: { line: string; titles: string[]; descs: string[] }[] = [
    {
      line: '신위',
      titles: ['고서비동(考西妣東)', '합설(合設)'],
      descs: [
        '고위(남자 조상)은 서쪽, 비위(여자 조상)은 동쪽에 비치',
        '조상의 제사는 배우자가 있을 경우 함께 모심. 밥, 국, 술잔은 따로 놓고 나머지 제수는 공통으로 함.',
      ],
    },
    {
      line: '1열',
      titles: ['반서갱동(飯西羹東)', '시접거중(匙楪居中)'],
      descs: [
        '메(밥)은 서쪽, 갱(국)은 동쪽에 진설',
        '수저를 담은 그릇은 신위의 앞 중앙에 진설',
      ],
    },
    {
      line: '2열',
      titles: ['어동육서(漁東肉西)'],
      descs: ['생선은 동쪽, 육류는 서쪽에 진설'],
    },
    {
      line: '3열',
      titles: ['적전중앙(炙奠中央)', '두동미서(頭東尾西)'],
      descs: [
        '적은 중앙에 진설',
        '생선의 머리는 동쪽, 꼬리는 서쪽, 배는 신위 쪽으로 진설',
      ],
    },
    {
      line: '4열',
      titles: [
        '생동숙서(生東熟西)',
        '좌포우혜(左脯右醯)',
        '건좌습우(乾坐濕右)',
      ],
      descs: [
        '날 것은 동쪽, 익힌 것은 서쪽에 진설',
        '포는 왼쪽, 식혜(젓갈)은 오른쪽에 진설',
        '마른 것은 왼쪽, 젖은 것은 오른쪽에 진설',
      ],
    },
    {
      line: '5열',
      titles: ['조율이시(棗栗梨柹)', '홍동백서(紅東白西)'],
      descs: [
        '상의 왼쪽에서부터 대추, 밤, 감, 배의 순서로 진설',
        '붉은 과일은 동쪽, 흰색 과일은 서쪽에 진설',
      ],
    },
  ];

  const faqs = [
    {
      q: '제사는 언제, 몇 시에 지내야 하나요?',
      a: '기제는 고인이 돌아가신 날 해마다 한번씩 올리는 제사입니다. 돌아가신 날 자시(오후 11시부터 오전 1시)에 제사를 지내는 것이 원칙이므로, 돌아가신 날이 처음 시작되는 자정(12시)부터 인시(오전 3시부터 5시)까지 날이 새기 전 새벽에 기제를 올려야 합니다. 그러나 오늘날과 같은 사회구조와 생활여건에서 한밤중 제사는 가족들이 핵가족화되어 참석이 어려울 뿐만 아니라 다음날 출근과 활동에 지장이 많기 때문에, 가족과 협의를 통해 일몰 후 적당한 시간에 지내는 것도 가능합니다.',
    },
    {
      q: '제사와 차례의 차이는 무엇인가요?',
      a: '제사는 조상이 돌아가신 날에 지내고, 차례는 명절에 지냅니다. 그리고 제사는 밤에, 차례는 낮에 지냅니다. 제사는 그날 돌아가신 조상과 배우자만 지내고, 차례는 자신이 기제를 받드는 모든 조상을 한 상에서 지냅니다. 제사는 밥과 국을 올리지만 차례는 계절 특별음식으로 설에는 떡국을, 한가위에는 송편을 올립니다.',
    },
    {
      q: '49재 날짜는 어떻게 계산하나요?',
      a: '49재란 고인이 돌아가신 지 49일째 되는 날, 고인이 생전에 자주 찾았거나 존경하던 스님이 계신 사찰에 가서 고인의 영혼이 극락정토(極樂淨土)로 가시길 바라는 마음으로 올리는 제사입니다. 사찰에 갈 수 없는 사정이라면 집에서도 가족끼리 고인의 명복을 빌거나 묘소·봉안시설에 다녀오는 것도 뜻이 있는 일입니다. 49재 지내는 날짜를 계산하는 방법은 고인이 돌아가신 날을 기점으로 7주 후의 날에서 하루를 빼시면 됩니다.',
    },
    {
      q: '바르게 절하는 방법이 있나요?',
      a: '공수법이란 절을 하거나 웃어른을 모실 때, 두 손을 앞으로 모아 포개어 잡는 것을 말합니다. 평상시에는 남자는 왼손을 오른손 위에 놓고, 여자는 오른손을 왼손 위에 놓습니다. 흉사가 있을 때에는 반대로 합니다.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* 제례의 의미 */}
      <section>
        <SectionHeading title="제례의 의미" />
        <p className="text-[15px] text-gray-700 leading-relaxed">
          제례는 신과 죽은 사람의 넋에게 음식을 바치며 위안과 감사를 표현하는
          의식으로, 조상과 자손의 기운을 연결해주는 문화적 소통입니다. 제례의
          종류는 다양하지만 오늘날에는 종묘나 문묘 및 각 서원의 제향, 각
          가정에서 지내는 조상을 받드는 제사 등이 남아 있습니다. 대개 집안에서
          지내는 제례에는 기제사와 차례, 시제 등이 있는데, 현재는 간소하게
          지내고 있습니다.
        </p>
      </section>

      {/* 제사의 종류 */}
      <section>
        <SectionHeading title="제사의 종류" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ceremonies.map((c) => (
            <div key={c.name} className="border border-gray-200 rounded-lg p-4">
              <p className="font-bold mb-1" style={{ color: ACCENT }}>
                {c.name}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 제사상 차리는 법 */}
      <section>
        <SectionHeading title="제사상 차리는 법 (진설법)" />
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 mb-6">
          <img
            src={`${base}/jj2_img01.png`}
            alt="제사상 진설법"
            className="w-full h-auto"
          />
        </div>
        <ul className="space-y-1 text-sm text-gray-500 mb-8">
          <li>
            ※ 제사음식은 간소하게 고인이 생전에 좋아하던 음식으로 차릴 수 있으며
            차리는 방법은 각 가풍에 따라 다르게 진열하거나 가정의 음식을
            진설해도 무방합니다.
          </li>
          <li>※ 진설표는 지방마다 다를 수 있으니 참고바랍니다.</li>
        </ul>

        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.line}
              className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="flex items-center justify-center font-extrabold text-gray-700 bg-gray-100">
                {r.line}
              </div>
              <div className="p-4 space-y-2">
                {r.titles.map((t, i) => (
                  <div key={t}>
                    <p className="font-bold text-gray-900 text-sm">{t}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {r.descs[i]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 지방쓰는 법 */}
      <section>
        <SectionHeading title="지방쓰는 법" />
        <div className="space-y-2 text-[15px] text-gray-700 leading-relaxed mb-6">
          <p>
            신위는 고인의 사진으로 할 수 있습니다. 사진이 없는 경우 지방으로
            대신합니다.
          </p>
          <p className="text-sm text-gray-500">
            ※ 현대 장례에서는 사진이 있더라도 고인의 관직 및 본관(이름)을 확인할
            수 있도록 사진과 지방을 함께 쓰는 경우가 많습니다.
          </p>
          <p>
            지방은 깨끗한 백지에 먹으로 쓰며 크기는 (세로)22cm × (가로)6cm로
            합니다.
          </p>
        </div>

        <h4 className="text-lg font-bold text-gray-900 mb-4">
          상황별 지방 작성 예시
        </h4>
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
          <img
            src={`${base}/jj2_img02.png`}
            alt="지방 작성 예시"
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Q&A */}
      <section>
        <SectionHeading title="제례 예절 Q&A" />
        <div className="space-y-4">
          {faqs.map((f) => (
            <div
              key={f.q}
              className="border border-gray-200 rounded-xl p-5 sm:p-6"
            >
              <p className="font-bold mb-2" style={{ color: ACCENT }}>
                Q. {f.q}
              </p>
              <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── 3. 이장/개장 ──
function RelocationContent() {
  const base = `${SUPABASE_BASE}/relocation`;

  const steps = [
    '사전상담',
    '견적서송부',
    '개장일정 확정',
    '장비와 인원 현장도착',
    '종교별 의례',
    '작업 진행',
    '유골 수습',
    '화장',
    '화장한 유골 이장',
  ];

  const faqs = [
    {
      q: '개장 시에 손 없는 날이 좋다고 하는데 어떻게 알 수 있나요?',
      a: '손 없는 날이란 우리나라의 전통풍속 중 하나로 혼인, 이사 등에 있어 아무런 해가 없는 날을 뜻하는 용어입니다. 종교에 따라 보는 경우가 있고 안보는 경우가 있으며, 음력으로 9나 0이면 손 없는 날입니다.',
    },
    {
      q: '개장 이후 어디로 모셔야 하는지요?',
      a: '요즘 추세로는 선산의 매장묘에서 다른 산의 매장묘로 옮기는 일보다는, 방문의 편리성과 관리를 고려해 봉안당, 자연장, 바다장, 산골로 옮기는 경우가 늘어나고 있습니다.',
    },
    {
      q: '개장 시 필요한 서류는 뭐가 있나요?',
      a: '1) 개장신고서 — 발급신청자 도장, 신분증, 고인과의 가족관계증명서, 제적등본, 분묘지 정확한 주소, 분묘의 사진. 2) 관할관청 분묘매장 신고(대리) — 직계권리자의 위임장, 위임용 인감, 주민등록등본, 가족관계증명서, 고인 제적등본, 분묘지 정확한 주소, 분묘의 사진. 위 준비물은 관할 주민센터 또는 정부24를 통해 발급이 가능합니다.',
    },
  ];

  const sites = [
    { src: `${base}/jjs01.jpg`, name: '봉안당' },
    { src: `${base}/jjs02.jpg`, name: '봉안담' },
    { src: `${base}/jjs03.jpg`, name: '봉안묘' },
    { src: `${base}/jjs04.jpg`, name: '수목장' },
    { src: `${base}/jjs05.jpg`, name: '잔디장' },
    { src: `${base}/jjs06.jpg`, name: '해양장' },
  ];

  return (
    <div className="space-y-16 sm:space-y-20">
      <section>
        <SectionHeading title="이장/개장이란?" />
        <p className="text-[15px] text-gray-700 leading-relaxed">
          이장/개장이란 매장한 시신이나 유골을 다른 분묘 또는 봉안시설에
          옮기거나 화장 또는 자연장 하는 것을 말합니다. 묘지 개장은 다시 한번
          고인을 모셔야 하는 만큼 신중한 선택과 올바른 장지 결정이 매우
          중요합니다.
        </p>
      </section>

      {/* 진행순서 */}
      <section>
        <SectionHeading title="묘지 개장 진행순서" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {steps.map((s, i) => (
            <div
              key={s}
              className="rounded-xl border border-gray-200 px-4 py-5 text-center"
            >
              <p
                className="text-xs font-extrabold mb-1"
                style={{ color: ACCENT }}
              >
                {String(i + 1).padStart(2, '0')}
              </p>
              <p className="text-sm font-bold text-gray-800">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Q&A */}
      <section>
        <SectionHeading title="이장/개장 Q&A" />
        <div className="space-y-4">
          {faqs.map((f) => (
            <div
              key={f.q}
              className="border border-gray-200 rounded-xl p-5 sm:p-6"
            >
              <p className="font-bold mb-2" style={{ color: ACCENT }}>
                Q. {f.q}
              </p>
              <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 장지 유형 */}
      <section>
        <div
          className="rounded-2xl p-6 sm:p-8 mb-6"
          style={{ backgroundColor: ACCENT_BG }}
        >
          <p className="font-bold mb-2" style={{ color: ACCENT }}>
            아직 장지가 결정되지 않으셨다면
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            예담라이프를 통해 &ldquo;장지 상담 서비스&rdquo;를 신청하세요. 상담
            및 현장 답사까지 전문 장지 상담사가 함께하여 고인을 편안히 모실
            장지를 신중히 결정하실 수 있도록 도움을 받으실 수 있으며, 봉안당,
            자연장, 수목장, 해양장, 매장 등 모든 유형의 장지에 대한 상담을
            받으실 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {sites.map((s) => (
            <div
              key={s.name}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="aspect-4/3 bg-gray-50">
                <img
                  src={s.src}
                  alt={s.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 text-center">
                <p className="font-bold text-gray-900">{s.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── 4. 장제급여 ──
function BenefitContent() {
  return (
    <div className="space-y-16 sm:space-y-20">
      <section>
        <SectionHeading title="장제급여란?" />
        <p className="text-[15px] text-gray-700 leading-relaxed">
          국민기초생활보장법 제14조로 생계급여, 주거급여, 의료급여 중 하나
          이상의 급여를 받는 수급권자가 사망한 경우 사체의 검안, 운반, 화장,
          또는 매장 그 밖의 장제조치에 지급됩니다.
        </p>
      </section>

      <section>
        <SectionHeading title="대상" />
        <p className="text-[15px] text-gray-700 leading-relaxed mb-2">
          위의 세 가지 급여 중 하나 이상의 지원을 받고 있는 기초생활수급자
          본인이 사망하여 장례를 치른 후에 장제급여를 신청할 수 있습니다.
          수급권자가 아닌 가족이 사망한 경우에는 해당되지 않습니다.
        </p>
        <p className="text-[15px] text-gray-700 leading-relaxed">
          단, 직계 가족뿐만이 아니라 장례비용을 실제 지불한 당사자도 장제급여를
          신청·지급받을 수 있습니다.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-xl p-6 sm:p-7">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: ACCENT_BG }}
            >
              <MapPin className="w-6 h-6" style={{ color: ACCENT }} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">신청장소</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              사망자의 주민등록지상 주민센터에 방문신청
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 sm:p-7">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: ACCENT_BG }}
            >
              <FileText className="w-6 h-6" style={{ color: ACCENT }} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">필요서류</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              사망진단서(시체검안서), 신청자의 신분증 및 통장 사본, 장례식 비용
              영수증(필수), 장제급여신청서(행복복지센터 비치)
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-1 text-sm text-gray-500">
          <li>
            ※ 장제급여는 현장에서 바로 수령할 수 없으며, 신청한 계좌로
            입금됩니다.
          </li>
          <li>
            ※ 장제급여 신청에 대한 정확한 안내가 필요하신 경우 사망자의
            주민등록지상 행정복지센터에 전화 문의하시면 됩니다.
          </li>
        </ul>
      </section>

      <NoticeBox
        title="TIP"
        items={[
          '사망신고, 안심상속 원스톱서비스, 장제급여를 한꺼번에 접수하는 것을 추천드립니다.',
          '위의 세 가지를 동시에 진행하기 위해서는 사망자의 주민등록지상의 행정복지센터를 방문하여 접수하시는 것을 추천드립니다.',
        ]}
      />
    </div>
  );
}
