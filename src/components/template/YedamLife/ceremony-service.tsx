'use client';

import {
  Phone,
  Headphones,
  Heart,
  Sparkles,
  Star,
  CheckCircle2,
  Users,
  Clock,
  Shield,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { BRAND_COLOR, BRAND_COLOR_LIGHT } from './constants';
import { FaqItem } from './components';

export function CeremonyService({ googleFormUrl }: { googleFormUrl: string }) {
  return (
    <>
      {/* Tab 3: 예담의전 히어로 */}
      <section id="sec-ceremony-hero" className="overflow-hidden">
        <div
          className="relative overflow-hidden"
          style={{ backgroundColor: '#1a1a2e' }}
        >
          <div className="relative z-10 py-20 sm:py-28 lg:py-36 px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-white/70 text-base sm:text-lg font-medium mb-5 tracking-wide">
                장례의전 · 추모의전 · VIP의전
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug mb-3 drop-shadow-md">
                격식과 품위를 갖춘
              </h1>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug mb-8 drop-shadow-md">
                전문 의전 서비스
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={googleFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-gray-900 text-base font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
                >
                  <Headphones className="w-5 h-5" />
                  의전 상담
                </a>
                <a
                  href="tel:1660-0000"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/15 text-white text-base font-bold rounded-xl border border-white/30 hover:bg-white/25 transition-colors backdrop-blur-sm cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  전화 상담
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ Tab 3: 예담의전 ══════════════ */}
      <section
        id="sec-ceremony-products"
        className="py-14 sm:py-20 overflow-hidden"
        style={{ backgroundColor: '#f7f7f7' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold mb-2 text-gray-500">
              의전 서비스 상품
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-gray-900">
              상황에 맞는 의전을 선택하세요
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                title: '장례의전',
                subtitle: '격식 있는 장례를 위한 전문 의전',
                icon: Heart,
                features: [
                  '장례 전 과정 의전 관리',
                  '빈소 의전 도우미 배치',
                  '조문객 안내·접객',
                  '화환·조화 관리',
                ],
              },
              {
                title: '추모의전',
                subtitle: '고인을 기리는 특별한 추모 행사',
                icon: Sparkles,
                features: [
                  '추모식 기획·진행',
                  '추모 영상 제작',
                  '헌화·묵념 의전',
                  '추모 공간 연출',
                ],
              },
              {
                title: 'VIP의전',
                subtitle: '최상의 예우를 위한 프리미엄 의전',
                icon: Star,
                features: [
                  '수석 의전관 전담',
                  '프리미엄 리무진 운구',
                  'VIP 빈소 풀세팅',
                  '의전 도우미 다수 배치',
                  '가족 전용 케어 서비스',
                  '미디어 대응 지원',
                ],
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <div className="h-40 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <Icon
                        className="w-10 h-10 mx-auto mb-2"
                        style={{ color: BRAND_COLOR, opacity: 0.4 }}
                      />
                      <span className="text-lg font-bold text-gray-900">
                        {item.title}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      {item.subtitle}
                    </p>
                    <ul className="space-y-2 mb-5">
                      {item.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle2
                            className="w-4 h-4 mt-0.5 shrink-0"
                            style={{ color: BRAND_COLOR }}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={googleFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      상세 상담받기
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="sec-ceremony-why" className="py-16 sm:py-24 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold mb-2 text-gray-500">
              예담의전만의 차별점
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-gray-900">
              왜 예담의전을 선택해야 할까요?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Users,
                title: '전문 의전 인력',
                desc: '엄격한 교육을 이수한 전문 의전 인력이 품격 있는 서비스를 제공합니다.',
              },
              {
                icon: Clock,
                title: '24시간 즉시 출동',
                desc: '긴급한 상황에서도 365일 24시간 즉시 출동하여 의전을 시작합니다.',
              },
              {
                icon: Shield,
                title: '체계적인 매뉴얼',
                desc: '수천 건의 경험을 바탕으로 완성된 체계적인 의전 매뉴얼로 진행합니다.',
              },
              {
                icon: Heart,
                title: '유가족 맞춤 케어',
                desc: '유가족의 종교, 전통, 요청에 맞춘 세심한 맞춤 의전을 제공합니다.',
              },
              {
                icon: Sparkles,
                title: '프리미엄 시설',
                desc: 'VIP 빈소, 프리미엄 장비, 고급 차량 등 최상의 시설을 갖추고 있습니다.',
              },
              {
                icon: FileText,
                title: '투명한 비용',
                desc: '사전 견적을 통해 추가 비용 없이 투명하게 운영합니다.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: BRAND_COLOR_LIGHT }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: BRAND_COLOR }}
                    />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="sec-ceremony-faq"
        className="py-16 sm:py-24 overflow-hidden"
        style={{ backgroundColor: '#f7f7f7' }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold mb-2 text-gray-500">
              자주 묻는 질문
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              의전 서비스 관련 궁금한 점
            </h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: '의전 서비스는 장례 전체에 포함되나요?',
                a: '의전 서비스는 별도로 신청하실 수 있으며, 상조 서비스와 함께 이용하시면 할인 혜택이 적용됩니다.',
              },
              {
                q: 'VIP의전은 어떤 점이 다른가요?',
                a: 'VIP의전은 수석 의전관 전담, 프리미엄 리무진, VIP 빈소 풀세팅, 다수 의전 도우미 배치 등 최상급 서비스를 제공합니다.',
              },
              {
                q: '종교별 맞춤 의전이 가능한가요?',
                a: '네, 불교, 기독교, 천주교, 원불교 등 종교별 의전 절차에 맞춰 진행합니다.',
              },
              {
                q: '추모의전은 장례 이후에도 이용할 수 있나요?',
                a: '네, 49재, 1주기, 추모식 등 장례 이후 추모 행사도 기획·진행해 드립니다.',
              },
            ].map((item, idx) => (
              <FaqItem key={idx} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
