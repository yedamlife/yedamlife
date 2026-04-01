'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Phone,
  MapPin,
  Mail,
  Building2,
  AlertCircle,
  MessageCircle,
  Plus,
  Download,
} from 'lucide-react';
import { YedamHeader } from '@/components/template/YedamLife/header';
import { YedamFooter } from '@/components/template/YedamLife/footer';
import {
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
  BRAND_COLOR_PREMIUM,
} from '@/components/template/YedamLife/constants';

const SUPABASE_BASE =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife';

const scrollSpySections = [
  { id: 'greeting', label: '인사말' },
  { id: 'mission', label: '미션/비전' },
  { id: 'ci', label: '사명/CI' },
  { id: 'branches', label: '전국본부현황' },
  { id: 'location', label: '오시는길' },
];

export default function AboutPage() {
  return (
    <Suspense>
      <AboutPageContent />
    </Suspense>
  );
}

function AboutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('from') || null;
  const mapRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('greeting');
  const [isFabOpen, setIsFabOpen] = useState(false);

  // 스크롤 스파이
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );

    const timer = setTimeout(() => {
      for (const sec of scrollSpySections) {
        const el = document.getElementById(sec.id);
        if (el) observer.observe(el);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // 카카오 지도 퍼가기 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js';
    script.charset = 'UTF-8';
    document.head.appendChild(script);

    let attempts = 0;
    const maxAttempts = 50;
    const timer = setInterval(() => {
      attempts++;
      const w = window as unknown as Record<string, unknown>;
      const d = w.daum as Record<string, Record<string, unknown>> | undefined;
      if (d?.roughmap?.Lander && mapRef.current) {
        clearInterval(timer);
        const Lander = d.roughmap.Lander as new (
          opts: Record<string, string>,
        ) => { render: () => void };
        new Lander({
          timestamp: '1774538241431',
          key: 'kzo7xzodtdx',
          mapWidth: '640',
          mapHeight: '360',
        }).render();
      }
      if (attempts >= maxAttempts) clearInterval(timer);
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        html, body { scrollbar-width: none; -ms-overflow-style: none; overflow-x: clip; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
        .root_daum_roughmap { width: 100% !important; }
        .root_daum_roughmap .wrap_map { width: 100% !important; height: 360px !important; }
        @media (max-width: 640px) {
          .root_daum_roughmap .wrap_map { height: 280px !important; }
        }
      `}</style>

      <div
        className="min-h-screen bg-white"
        style={{ fontFamily: 'Pretendard, sans-serif' }}
      >
        {/* ── 공통 헤더 ── */}
        <YedamHeader
          activeCategoryIdx={-1}
          onCategoryChange={(idx) => {
            router.push(`/?tab=${idx}`);
          }}
        />

        {/* ══════════════════════════════════════════ */}
        {/* 1. 인사말                                   */}
        {/* ══════════════════════════════════════════ */}
        <section
          id="greeting"
          className="py-16 sm:py-24 overflow-hidden bg-white"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="mb-12 sm:mb-16">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                인사말
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Home</span>
                <span>›</span>
                <span>회사소개</span>
                <span>›</span>
                <span className="text-gray-700">인사말</span>
              </div>
            </div>

            <div className="text-center mb-16 sm:mb-20">
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                예담라이프는 누구나 한 번쯤 겪게 되는 고인과의 이별 시간에
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                <span style={{ color: BRAND_COLOR_PREMIUM }}>禮(예)</span>를
                담아 진심으로 모십니다.
              </p>
            </div>

            <div className="space-y-16 sm:space-y-24">
              {/* 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white">
                  <img
                    src={`${SUPABASE_BASE}/gt_img01.png`}
                    alt="고인을 위한 정성"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    고인을 평안한 안식처로 안내하겠습니다.
                  </h3>
                  <div
                    className="w-10 h-0.5 mb-4"
                    style={{ backgroundColor: BRAND_COLOR_PREMIUM }}
                  />
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    고인이 가시는 길에 후회와 여한이 없이, 평안의 향기가 가득한
                    세상에서 행복하시길 바라는 마음을 담아 가시는 길을 정성으로
                    닦아 드립니다. 장례 기간 동안 근심 없이 보내실 수 있도록
                    고인에 대한 禮를 갖춰 장례예식에 담고 있습니다.
                  </p>
                </div>
              </div>

              {/* 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="order-2 md:order-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    유족의 치유와 안정이 되어 드리겠습니다.
                  </h3>
                  <div
                    className="w-10 h-0.5 mb-4"
                    style={{ backgroundColor: BRAND_COLOR_PREMIUM }}
                  />
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    한 세대의 마감과 다음 세대의 계승이라는 역사적 사명인
                    &ldquo;喪吏(예사)&rdquo; 책임자로서 불안하고 당황한 유가족의
                    마음을 누구보다 깊이 헤아려 드리겠습니다. 갑작스러운 이별
                    때문에 황망하고 슬픈 마음을 다스리기에도 바쁜 3일의 장례,
                    유족이 고인과의 이별에만 온전히 집중할 수 있도록
                    예담라이프가 곁을 든든히 지키겠습니다.
                  </p>
                </div>
                <div className="order-1 md:order-2 aspect-[4/3] rounded-2xl overflow-hidden bg-white">
                  <img
                    src={`${SUPABASE_BASE}/gt_img02.png`}
                    alt="유족 케어"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white">
                  <img
                    src={`${SUPABASE_BASE}/gt_img03.png`}
                    alt="전문 장례지도사"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    풍부하고 넓은 경험으로 책임지겠습니다.
                  </h3>
                  <div
                    className="w-10 h-0.5 mb-4"
                    style={{ backgroundColor: BRAND_COLOR_PREMIUM }}
                  />
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    풍부하고 넓은 경험과 지식으로 정성을 담아 장례 예식을 진행해
                    드릴 것을 약속해 드리며, 10년 이상의 경력을 가진 전문
                    장례지도사가 직접 고인의 마지막 수의를 입혀 드립니다.
                  </p>
                </div>
              </div>

              {/* 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="order-2 md:order-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    상주의 마음으로 끝까지 함께하겠습니다.
                  </h3>
                  <div
                    className="w-10 h-0.5 mb-4"
                    style={{ backgroundColor: BRAND_COLOR_PREMIUM }}
                  />
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    내 가족이라는 마음으로 슬픔을 나누고 위로를 전달하겠습니다.
                    사랑하는 이의 마지막 가시는 길이 세상에서 가장 아름답고
                    숭고한 시간이 될 수 있도록 예를 담아 모시겠습니다.
                  </p>
                </div>
                <div className="order-1 md:order-2 aspect-[4/3] rounded-2xl overflow-hidden bg-white">
                  <img
                    src={`${SUPABASE_BASE}/gt_img04.png`}
                    alt="정성 담은 장례"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* 2. 미션/비전                                */}
        {/* ══════════════════════════════════════════ */}
        <section
          id="mission"
          className="py-16 sm:py-24 overflow-hidden bg-white"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                미션/비전
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Home</span>
                <span>›</span>
                <span>회사소개</span>
                <span>›</span>
                <span className="text-gray-700">미션/비전</span>
              </div>
            </div>

            <div className="text-center mb-16">
              <p className="text-sm font-medium text-gray-500 mb-2">
                신뢰와 믿음을 주는 예비사회적기업
              </p>
              <h3
                className="text-2xl sm:text-3xl font-extrabold mb-3"
                style={{ color: BRAND_COLOR_PREMIUM }}
              >
                고객 중심의 맞춤 장례 설계
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                감동과 신뢰를 주는 인생 라이프 스타일
                <br />
                진심으로 禮를 담아 감동을 전해드리는 예담라이프 주식회사
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 sm:p-12 text-center mb-16">
              <p className="text-sm text-gray-400 mb-2">
                &ldquo; 비전선언문 &rdquo;
              </p>
              <p className="text-lg font-bold text-gray-900 mb-6">
                예담라이프는
              </p>
              <div className="space-y-2 text-sm sm:text-base text-gray-700 leading-relaxed">
                <p>하나, 대한민국 대표 후불제 상조기업을 지향한다.</p>
                <p>
                  하나, 고객 중심 경영이념으로 고품질 경제성을 갖춘 상조서비스를
                  제공한다.
                </p>
                <p>
                  하나, 취약계층 고용의 지속적인 일자리제공과 지역사회에 나눔과
                  봉사를 실천한다.
                </p>
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <img
                src={`${SUPABASE_BASE}/vision_img0715.png`}
                alt="미션 · 경영이념 · 비전"
                className="w-full max-w-[800px]"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-6 sm:p-8">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                    사회적기업이란?
                  </h4>
                  <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                    <p>
                      사회적기업이란 영리기업과 비영리기업의 중간 형태로, 사회적
                      목적을 우선적으로 추구하면서 재화·서비스의 생산·판매 등
                      영업활동을 수행하는 기업(조직)을 말합니다.
                    </p>
                    <p>
                      「사회적기업 육성법」을 따라 고용노동부 장관의 인증을 받은
                      기업으로 정의됩니다.
                    </p>
                    <p className="text-xs text-gray-400">
                      ※ 예비사회적기업은 사회적기업의 전 단계로서 광역자치단체장
                      지정
                    </p>
                    <div
                      className="mt-4 p-4 rounded-xl"
                      style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                    >
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        후불제 상조기업 예담라이프 주식회사는
                      </p>
                      <p className="text-sm text-gray-600">
                        2023년 11월 3일 서울특별시장으로부터 일자리제공형
                        예비사회적기업으로 지정받았습니다.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center p-4 sm:p-6">
                  <img
                    src={`${SUPABASE_BASE}/yedam_social.jpg`}
                    alt="서울시 예비사회적기업 지정서"
                    className="w-full max-w-[320px] rounded-xl shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* 3. 사명/CI                                 */}
        {/* ══════════════════════════════════════════ */}
        <section id="ci" className="py-16 sm:py-24 overflow-hidden bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                사명/CI
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Home</span>
                <span>›</span>
                <span>회사소개</span>
                <span>›</span>
                <span className="text-gray-700">사명/CI</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 mb-12">
              <img
                src={`${SUPABASE_BASE}/logotype02.jpg`}
                alt="예담라이프 로고"
                className="h-32 sm:h-40 w-auto object-contain"
              />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                  <span style={{ color: BRAND_COLOR_PREMIUM }}>禮(예)</span>를
                  담아 모시는 예담라이프
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  &ldquo;갑자기 찾아온 헤어짐의 아픔과 슬픔을 3일이라는 짧은
                  기간
                  <br className="hidden sm:block" />
                  고인에 대한 禮를 장례예식에 담습니다&rdquo;
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 mb-12" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">심볼마크</p>
                <div className="aspect-5/3 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <img
                    src={`${SUPABASE_BASE}/logotype01.jpg`}
                    alt="심볼마크"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">로고타입</p>
                <div className="aspect-5/3 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <img
                    src={`${SUPABASE_BASE}/logotype02.jpg`}
                    alt="로고타입"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">응용타입</p>
                <div className="aspect-5/3 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <img
                    src={`${SUPABASE_BASE}/logotype03.jpg`}
                    alt="응용타입"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <p className="text-sm font-bold text-gray-900 mb-3">전용색상</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
              <div>
                <div className="aspect-5/3 bg-black rounded-xl flex items-center justify-center mb-3">
                  <img
                    src={`${SUPABASE_BASE}/logotype_white.png`}
                    alt="GENTLE BLACK"
                    className="h-10 sm:h-12 w-auto object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-gray-900">GENTLE BLACK</p>
                <p className="text-xs text-gray-400">
                  C : 75 M : 68 Y : 67 K : 90
                </p>
                <p className="text-xs text-gray-400">#000000</p>
              </div>
              <div>
                <div className="aspect-5/3 bg-white rounded-xl flex items-center justify-center border border-gray-200 mb-3">
                  <img
                    src={`${SUPABASE_BASE}/logotype_gry.png`}
                    alt="PURE WHITE"
                    className="h-10 sm:h-12 w-auto object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-gray-900">PURE WHITE</p>
                <p className="text-xs text-gray-400">C : 0 M : 0 Y : 0 K : 0</p>
                <p className="text-xs text-gray-400">#FFFFFF</p>
              </div>
              <div>
                <div
                  className="aspect-5/3 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: '#E7CA7B' }}
                >
                  <img
                    src={`${SUPABASE_BASE}/logotype_white.png`}
                    alt="ANTIQUE GOLD"
                    className="h-10 sm:h-12 w-auto object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-gray-900">ANTIQUE GOLD</p>
                <p className="text-xs text-gray-400">
                  C : 10 M : 18 Y : 61 K : 0
                </p>
                <p className="text-xs text-gray-400">#E7CA7B</p>
              </div>
            </div>

            <p className="text-sm font-bold text-gray-900 mb-3">상표등록증</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="aspect-3/4 rounded-xl overflow-hidden border border-gray-100 mb-3">
                  <img
                    src={`${SUPABASE_BASE}/cert_reg_01.png`}
                    alt="상표등록증 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-bold text-gray-900">
                  제 45류 장례업등 10건 / 제 35류 수의 소매업등 10건
                </p>
                <p className="text-xs text-gray-400">
                  제 40-2310744 호 / 제 40-2310740 호
                </p>
              </div>
              <div>
                <div className="aspect-3/4 rounded-xl overflow-hidden border border-gray-100 mb-3">
                  <img
                    src={`${SUPABASE_BASE}/cert_reg_02.png`}
                    alt="상표등록증 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-bold text-gray-900">
                  제 45류 장례업등 10건
                </p>
                <p className="text-xs text-gray-400">제 40-2310738 호</p>
              </div>
              <div>
                <div className="aspect-3/4 rounded-xl overflow-hidden border border-gray-100 mb-3">
                  <img
                    src={`${SUPABASE_BASE}/cert_reg_03.png`}
                    alt="상표등록증 3"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-bold text-gray-900">
                  제 35류 수의(壽衣) 소매업등 10건
                </p>
                <p className="text-xs text-gray-400">제 40-2310737 호</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* 4. 전국본부현황                              */}
        {/* ══════════════════════════════════════════ */}
        <section
          id="branches"
          className="py-16 sm:py-24 overflow-hidden bg-white"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                전국본부현황
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Home</span>
                <span>›</span>
                <span>회사소개</span>
                <span>›</span>
                <span className="text-gray-700">전국본부현황</span>
              </div>
            </div>

            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-3">
                <AlertCircle className="w-8 h-8" style={{ color: '#c0392b' }} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                365일 24시간 긴급출동서비스
              </h3>
              <p className="text-sm text-gray-500">전국 네트워크를 통해</p>
              <p
                className="text-sm font-bold"
                style={{ color: BRAND_COLOR_PREMIUM }}
              >
                365일 24시간 어디서나 서비스가 가능합니다!
              </p>
            </div>

            <div className="flex justify-center">
              <img
                src={`${SUPABASE_BASE}/all_map.jpg`}
                alt="전국 본부 현황 지도"
                className="w-full max-w-[800px]"
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* 5. 오시는길                                 */}
        {/* ══════════════════════════════════════════ */}
        <section
          id="location"
          className="py-16 sm:py-24 overflow-hidden bg-white"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                오시는길
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Home</span>
                <span>›</span>
                <span>회사소개</span>
                <span>›</span>
                <span className="text-gray-700">오시는길</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div
                ref={mapRef}
                id="daumRoughmapContainer1774538241431"
                className="root_daum_roughmap root_daum_roughmap_landing w-full"
              />

              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Building2
                    className="w-5 h-5"
                    style={{ color: BRAND_COLOR }}
                  />
                  <h3 className="text-lg font-bold text-gray-900">
                    주소 및 연락처
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        주소
                      </p>
                      <p className="text-sm text-gray-900">
                        서울시 강서구 화곡로 416 가양역 더스카이밸리5차 607,
                        608호 예담라이프(주)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        대표전화
                      </p>
                      <a
                        href="tel:1660-0959"
                        className="text-sm font-bold text-gray-900 hover:opacity-80 cursor-pointer"
                      >
                        1660-0959
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        이메일
                      </p>
                      <p className="text-sm text-gray-900">
                        sun8227@hanmail.net
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href="https://map.kakao.com/link/to/예담라이프,37.5613,126.8518"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  카카오맵 길찾기
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── 우측 플로팅 스크롤 스파이 ── */}
        <nav className="fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-40">
          <div
            className="flex flex-col gap-0 rounded-2xl py-2 md:py-3 px-1.5 md:px-2"
            style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              boxShadow:
                '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {scrollSpySections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    document
                      .getElementById(sec.id)
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group relative flex items-center gap-2.5 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: isActive
                      ? BRAND_COLOR_LIGHT
                      : 'transparent',
                  }}
                >
                  <span
                    className="shrink-0 rounded-full transition-all duration-300"
                    style={{
                      width: isActive ? '8px' : '6px',
                      height: isActive ? '8px' : '6px',
                      backgroundColor: isActive ? BRAND_COLOR : '#d1d5db',
                    }}
                  />
                  <span
                    className="hidden md:inline text-[13px] font-medium whitespace-nowrap transition-colors duration-200"
                    style={{
                      color: isActive ? BRAND_COLOR : '#9ca3af',
                    }}
                  >
                    {sec.label}
                  </span>
                  <span
                    className="md:hidden absolute right-full mr-2 text-[11px] font-semibold whitespace-nowrap rounded-md px-2 py-1 opacity-0 group-active:opacity-100 transition-opacity duration-150 pointer-events-none"
                    style={{
                      backgroundColor: BRAND_COLOR,
                      color: '#fff',
                    }}
                  >
                    {sec.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── 플로팅 채팅 FAB ── */}
        <div className="fixed right-4 bottom-6 z-50 flex flex-col items-end gap-2">
          <div
            className={`flex flex-col items-end gap-2 transition-all duration-300 ${
              isFabOpen
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            <a
              href="tel:1660-0959"
              className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-full bg-white shadow-lg border border-gray-200 cursor-pointer"
            >
              <span className="text-xs font-bold text-gray-700">
                24시 긴급출동
              </span>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-gray-700" />
              </div>
            </a>
            <a
              href="https://pf.kakao.com/_예담라이프"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-full bg-[#FEE500] shadow-lg cursor-pointer"
            >
              <span className="text-xs font-bold text-[#3C1E1E]">
                카카오 상담
              </span>
              <div className="w-10 h-10 rounded-full bg-[#F5DC00] flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E">
                  <path d="M12 3C6.48 3 2 6.54 2 10.86c0 2.78 1.86 5.22 4.65 6.6l-.95 3.53c-.08.3.25.55.52.39l4.2-2.8c.51.07 1.04.1 1.58.1 5.52 0 10-3.54 10-7.86S17.52 3 12 3z" />
                </svg>
              </div>
            </a>
            <a
              href={`${SUPABASE_BASE}/yedam_company_proposal.zip`}
              download="예담라이프회사소개서_기업상조제안서.zip"
              className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-full bg-white shadow-lg border border-gray-200 cursor-pointer"
            >
              <span className="text-xs font-bold text-gray-700">
                기업상조 제안서
              </span>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Download className="w-5 h-5 text-gray-700" />
              </div>
            </a>
          </div>

          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center cursor-pointer transition-all duration-300"
            style={{
              backgroundColor: '#333',
              color: '#fff',
              transform: isFabOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            }}
          >
            {isFabOpen ? (
              <Plus className="w-6 h-6" />
            ) : (
              <MessageCircle className="w-6 h-6" />
            )}
          </button>
        </div>

        <YedamFooter />
      </div>
    </>
  );
}
