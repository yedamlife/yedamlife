'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Phone, MapPin, Mail, Building2, AlertCircle } from 'lucide-react';
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
  { id: 'iso', label: 'ISO 9001' },
  { id: 'mission', label: '사회적기업' },
  { id: 'ci', label: '상표등록증' },
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
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('from') || null;
  const mapRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('greeting');

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

  // 해시(#iso 등)로 진입 시 해당 섹션으로 스크롤
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const scrollToHash = () => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection(hash);
      }
    };
    const t = setTimeout(scrollToHash, 150);
    return () => clearTimeout(t);
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
        html, body { scrollbar-width: none; -ms-overflow-style: none; overflow-x: clip; scroll-padding-top: 96px; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
        section[id] { scroll-margin-top: 96px; }
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
        {/* 헤더는 root layout의 GlobalHeader에서 전역 렌더링 */}

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

            {/* 인사말 본문 */}
            <div className="max-w-4xl mx-auto space-y-10 text-[15px] sm:text-base text-gray-700 leading-[1.9] text-center md:text-left">
              {/* 첫 단락 + 대표 사진 (PC에서 신문처럼 좌측 플로팅) */}
              <div className="md:clear-both after:content-[''] after:block after:clear-both">
                <img
                  src={`${SUPABASE_BASE}/ceo_profile3.jpeg`}
                  alt="예담라이프 대표"
                  className="w-52 h-52 sm:w-72 sm:h-72 mx-auto md:mx-0 md:float-left md:mr-8 object-cover rounded-2xl mb-6 md:mb-4"
                />
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 text-center md:text-left">
                  준비 없던 장례 길잡이별, 후불제상조 예담라이프
                </h3>
                <p className="md:text-justify">
                  갑작스러운 이별 앞에서, 가장 먼저 달려가는 후불제 상조입니다.
                  어느 날 갑자기 찾아온 이별, 뭐부터 해야 할지 모르겠고 어디로
                  연락해야 하는지조차 막막하실 겁니다.
                </p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 mt-6">
                  그 마음, 저희가 압니다.
                </p>
                <p className="mt-4 md:text-justify">
                  가입 절차도, 선불 납입도, 복잡한 서류도 필요 없습니다.
                  전화 한 통이면 전문 장례지도사가 365일 24시간 달려가고,
                  비용은 장례 후 이용하신 만큼만 정산합니다.
                </p>
                <p className="mt-4 md:text-justify">
                  남은 가족의 짐은 저희가 덜겠습니다. 고인과의 마지막
                  시간에만 온전히 집중하세요.
                </p>
              </div>

              <div>
                <p className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  &ldquo;상조 가입에 둘게 없는데...&rdquo;
                </p>
                <p>
                  아무것도 준비되어 있지 않아도 괜찮습니다.{'  '}
                  예담라이프는 사전 가입이 필요 없는 후불제 상조입니다.
                  {'  '}장례가 필요한 바로 그 시점에 연락 주시면,
                  {'  '}365일 24시간, 전국 어디든 전문장례지도사가
                  출동합니다.
                </p>
              </div>

              <div>
                <p className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  &ldquo;장례비용이 얼마나 드는지도 모르겠어요.&rdquo;
                </p>
                <p>
                  장례 후 정산합니다.
                  {'  '}
                  월 납입금 0원. 가입비 0원.
                  {'  '}
                  수년간 매달 돈을 넣어두실 필요 없습니다.
                  {'  '}
                  이용하신 서비스에 대해서만 정산하면 됩니다.
                </p>
              </div>

              <div>
                <p className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  &ldquo;아는 것도 없고, 도와줄 사람도 없는데 혼자 할 수
                  있을까요?&rdquo;
                </p>
                <p>
                  그럴수록, 더욱 도움이 필요합니다.
                  {'  '}
                  10년 이상 경력의 전문 장례지도사가 처음부터 끝까지 책임지고
                  도와드립니다.
                  {'  '}
                  담당 장례지도사가 고객 상황에 맞춰 꼭 필요한 요소만 선별하여
                  장례를 설계하고,
                  {'  '}전 과정을 빠짐없이 진행합니다.
                </p>
              </div>

              <p>
                ISO 9001 품질인증을 받은 유일한 후불제 상조로서,
                {'  '}
                국제 기준에 따른 품격있는 서비스를 약속드립니다.
              </p>

              <div>
                <p className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  &ldquo;장례 기간 동안 제가 뭘 준비 해야 하는 건지.&rdquo;
                </p>
                <p>
                  아무것도 하지 않으셔도 됩니다.
                  {'  '}
                  유족이 해야 할 일은 단 하나,
                  {'  '}
                  고인과의 마지막 시간에 집중하는 것입니다.
                  {'  '}
                  나머지 모든 절차는 예담라이프가
                  {'  '}
                  상주의 마음으로, 예를 다해 모시겠습니다.
                </p>
              </div>

              {/* 예를 담다 섹션 */}
              <div
                className="mt-12 sm:mt-16 border-t-2 pt-10 sm:pt-12"
                style={{ borderColor: BRAND_COLOR }}
              >
                <h4
                  className="text-lg sm:text-xl font-bold mb-4"
                  style={{ color: BRAND_COLOR }}
                >
                  예를 담다. 예담
                </h4>
                <p>
                  예담라이프는 서울특별시 지정 예비사회적기업으로
                  {'  '}
                  이윤보다 사람을 먼저 생각하며 수익금의 일부를 어려운 이웃에게
                  기부합니다.
                  {'  '}
                  고인의 마지막 가시는 길에 예를 담고,
                  {'  '}
                  남은 가족에게는 위로를 전하는 것
                  {'  '}
                  그것이 예담라이프의 시작이자, 존재의 이유입니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* 2. ISO 9001 품질인증                          */}
        {/* ══════════════════════════════════════════ */}
        <section id="iso" className="py-16 sm:py-24 overflow-hidden bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                ISO 9001 품질인증
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Home</span>
                <span>›</span>
                <span>회사소개</span>
                <span>›</span>
                <span className="text-gray-700">ISO 9001</span>
              </div>
            </div>

            {/* ISO 소개 */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="flex items-center justify-center p-6 sm:p-10">
                  <img
                    src={`${SUPABASE_BASE}/iso_mark.png`}
                    alt="ISO 9001 마크"
                    className="w-full max-w-[320px]"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-center">
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    ISO 소개
                  </h4>
                  <p className="text-sm text-gray-400 mb-4">
                    International Organization for Standardization
                  </p>
                  <div className="w-10 h-0.5 bg-gray-300 mb-4" />
                  <p className="text-sm text-gray-600 leading-relaxed">
                    ISO는 전 세계적으로 통용되는 국제 표준을 개발하고 출판하는
                    비정부기구입니다. 1947년에 설립되어 스위스 제네바에 본부를
                    두고 있으며, 전 세계 160여 개국이 회원으로 참여하고
                    있습니다. ISO는 상품, 서비스, 기술의 국제적 교환을 촉진하며
                    품질, 안전, 효율성을 높이기 위한 표준을 제공합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* ISO 9001이란? */}
            <div className="mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                ISO 9001이란?
              </h3>
              <div
                className="w-10 h-0.5 mb-6"
                style={{ backgroundColor: BRAND_COLOR }}
              />
              <div className="text-sm sm:text-base text-gray-600 leading-relaxed space-y-1">
                <p>
                  국제표준화기구(ISO)에서 제정한 품질경영시스템(QMS)에 대한 국제
                  규격으로,
                </p>
                <p>
                  제품과 서비스의 품질을 보증하는데 사용되는 품질경영
                  체계입니다.
                </p>
                <p>
                  ISO 9001 인증은 제품 및 서비스를 생산하고 제공하는 과정에서
                  품질경영시스템을 평가하여 인증하는 제도입니다.
                </p>
              </div>
            </div>

            {/* 품질경영시스템 다이어그램 */}
            <div className="flex justify-center">
              <img
                src={`${SUPABASE_BASE}/iso_diagram.png`}
                alt="품질경영시스템의 지속적 개선 다이어그램"
                className="w-full max-w-[700px]"
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* 3. 사회적기업                                */}
        {/* ══════════════════════════════════════════ */}
        <section
          id="mission"
          className="py-16 sm:py-24 overflow-hidden bg-white"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                서울시 예비사회적기업
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Home</span>
                <span>›</span>
                <span>회사소개</span>
                <span>›</span>
                <span className="text-gray-700">사회적기업</span>
              </div>
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
        {/* 3. 상표등록증                               */}
        {/* ══════════════════════════════════════════ */}
        <section id="ci" className="py-16 sm:py-24 overflow-hidden bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                상표등록증
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Home</span>
                <span>›</span>
                <span>회사소개</span>
                <span>›</span>
                <span className="text-gray-700">상표등록증</span>
              </div>
            </div>

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

        <YedamFooter />
      </div>
    </>
  );
}
