'use client';

import {
  Phone,
  Shield,
  CheckCircle2,
  Headphones,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { BRAND_COLOR } from './constants';
import { FaqItem } from './components';

export function EstateCleanup({ googleFormUrl }: { googleFormUrl: string }) {
  return (
    <>
      <section id="sec-cleanup-hero" className="overflow-hidden">
        <div
          className="relative overflow-hidden"
          style={{ backgroundColor: '#2c3e50' }}
        >
          <div className="relative z-10 py-20 sm:py-28 lg:py-36 px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-white/70 text-base sm:text-lg font-medium mb-5 tracking-wide">
                유품정리 · 특수청소 · 공간복원
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug mb-3 drop-shadow-md">
                고인의 마지막 공간을
              </h1>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug mb-8 drop-shadow-md">
                정성껏 정리해 드립니다
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={googleFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-gray-900 text-base font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
                >
                  <Headphones className="w-5 h-5" />
                  유품정리 상담
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

      <section
        id="sec-cleanup-products"
        className="py-14 sm:py-20 overflow-hidden"
        style={{ backgroundColor: '#f7f7f7' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold mb-2 text-gray-500">
              서비스 상품
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-gray-900">
              상황에 맞는 최적의 서비스를 선택하세요
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                title: '기본 정리',
                subtitle: '소규모 공간의 기본적인 유품정리',
                features: [
                  '원룸·소형 평수 대상',
                  '생활용품 분류 및 처리',
                  '기본 청소 포함',
                  '유품 목록 작성',
                ],
                badge: '소규모',
              },
              {
                title: '전체 정리',
                subtitle: '중·대형 공간의 전반적인 유품정리',
                features: [
                  '아파트·주택 전체 정리',
                  '귀중품·유품 분류 보관',
                  '가전·가구 처리',
                  '특수 청소 포함',
                  '폐기물 처리 대행',
                ],
                badge: '인기',
              },
              {
                title: '특수 정리',
                subtitle: '특수 상황에 대응하는 전문 정리',
                features: [
                  '고독사·특수현장 전문',
                  '방역·소독 처리',
                  '악취 제거 서비스',
                  '바이오 클리닝',
                  '원상복구 지원',
                  '보험 서류 대행',
                ],
                badge: '전문',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="h-40 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <Shield
                      className="w-10 h-10 mx-auto mb-2"
                      style={{ color: BRAND_COLOR, opacity: 0.4 }}
                    />
                    <span className="text-lg font-bold text-gray-900">
                      {item.title}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-bold text-gray-900">
                      {item.title}
                    </h3>
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full text-gray-600 bg-gray-100">
                      {item.badge}
                    </span>
                  </div>
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
            ))}
          </div>
        </div>
      </section>

      <section id="sec-cleanup-process" className="py-16 sm:py-24 overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold mb-2 text-gray-500">
              진행 절차
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-gray-900">
              체계적인 4단계 프로세스
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {[
              {
                step: '01',
                title: '현장 상담',
                desc: '현장 방문 후\n규모와 상태를 파악합니다',
                icon: Headphones,
              },
              {
                step: '02',
                title: '유품 분류',
                desc: '보존·기증·폐기 물품을\n세심하게 분류합니다',
                icon: FileText,
              },
              {
                step: '03',
                title: '정리 진행',
                desc: '전문 인력이 체계적으로\n공간을 정리합니다',
                icon: Shield,
              },
              {
                step: '04',
                title: '완료 보고',
                desc: '정리 완료 후\n결과를 보고드립니다',
                icon: CheckCircle2,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center p-4 sm:p-6">
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <span className="text-xs font-bold tracking-wider text-gray-400">
                    STEP {item.step}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold mt-2 mb-2 text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="sec-cleanup-faq"
        className="py-16 sm:py-24 overflow-hidden"
        style={{ backgroundColor: '#f7f7f7' }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold mb-2 text-gray-500">
              자주 묻는 질문
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              유품정리 관련 궁금한 점
            </h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: '유품정리는 얼마나 걸리나요?',
                a: '공간 규모와 상태에 따라 다르지만, 원룸 기준 1일, 아파트 전체 정리는 2~3일 정도 소요됩니다.',
              },
              {
                q: '귀중품이나 중요 서류는 어떻게 처리하나요?',
                a: '유품 분류 단계에서 귀중품, 중요 서류, 사진 등은 별도 보관하여 유가족에게 전달해 드립니다.',
              },
              {
                q: '폐기물 처리도 해주시나요?',
                a: '네, 가전·가구·생활용품 등 폐기물 처리를 포함하여 진행합니다.',
              },
              {
                q: '비용은 어떻게 산정되나요?',
                a: '현장 방문 상담 후 공간 규모, 물량, 특수 작업 여부를 고려하여 견적을 안내드립니다.',
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
