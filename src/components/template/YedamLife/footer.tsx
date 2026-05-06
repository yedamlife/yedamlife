'use client';

import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { ProposalModal } from './proposal-modal';
import { CONTACT_PHONE, CONTACT_TEL_HREF } from '@/constants/contact';

const SUPABASE_BASE =
  'https://aipfebcrgjythjywzgqp.supabase.co/storage/v1/object/public/yedamlife';

export function YedamFooter() {
  const [footerModal, setFooterModal] = useState<'privacy' | 'terms' | null>(
    null,
  );
  const [showProposalModal, setShowProposalModal] = useState(false);

  return (
    <>
      <footer className="py-6 overflow-hidden bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-5 -my-1.5">
            <img
              src={`${SUPABASE_BASE}/main_logo.png`}
              alt="예담라이프"
              className="h-[100px] sm:h-[120px] w-auto object-contain my-[-10px]"
            />
            <img
              src={`${SUPABASE_BASE}/main_logo_v2.png`}
              alt="예담라이프 로고"
              className="h-[75px] sm:h-[90px] w-auto object-contain my-[-10px]"
            />
            <img
              src={`${SUPABASE_BASE}/footer_isomark2.png`}
              alt="ISO 9001 품질경영시스템 인증"
              className="h-[75px] sm:h-[90px] w-auto object-contain my-[-10px]"
            />
          </div>

          <div className="text-sm text-gray-500 leading-relaxed mb-4 space-y-1">
            <p>
              상호 : 예담라이프 주식회사 / 대표자 : 신선철 / 사업자등록번호 :
              262-88-02680 / 통신판매업신고번호 : 제2023-서울강서-2849호
            </p>
            <p>
              주소 : 서울시 강서구 화곡로 416 가양역 더스카이밸리5차 607, 608호
              예담라이프(주)
            </p>
            <p>
              TEL :{' '}
              <a href={CONTACT_TEL_HREF} className="hover:underline">
                {CONTACT_PHONE}
              </a>{' '}
              / Email : sun8227@hanmail.net
            </p>
          </div>

          <button
            onClick={() => setShowProposalModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-full cursor-pointer hover:bg-gray-200 transition-colors mb-4 bg-white text-gray-700 border border-gray-300"
          >
            예담라이프 회사 소개서 / 기업상조 제안서
            <Download className="w-4 h-4" />
          </button>

          <div className="border-t border-gray-300 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setFooterModal('privacy')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer font-medium"
              >
                개인정보처리방침
              </button>
              <button
                onClick={() => setFooterModal('terms')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer font-medium"
              >
                이용약관
              </button>
            </div>
            <p className="text-xs text-gray-400 tracking-wider">
              COPYRIGHT &copy; 2023 예담라이프 ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </footer>

      {/* 개인정보처리방침 / 이용약관 모달 */}
      {footerModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50"
          onClick={() => setFooterModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">
                {footerModal === 'privacy' ? '개인정보처리방침' : '이용약관'}
              </h3>
              <button
                onClick={() => setFooterModal(null)}
                className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-6 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {footerModal === 'privacy' ? (
                <>
                  <p className="font-bold text-gray-900 mb-4">
                    개인정보처리방침
                  </p>
                  <p>
                    예담라이프 주식회사(이하 &quot;회사&quot;)는
                    개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을
                    보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할
                    수 있도록 다음과 같은 처리방침을 두고 있습니다.
                  </p>
                  <p className="font-bold text-gray-800 mt-6 mb-2">
                    1. 개인정보의 수집 및 이용 목적
                  </p>
                  <p>
                    회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고
                    있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
                    이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한
                    조치를 이행할 예정입니다.
                  </p>
                  <p>- 상담 신청 및 서비스 문의 처리</p>
                  <p>- 장례 서비스 안내 및 상담 연락</p>
                  <p>- 멤버십 가입 및 관리</p>
                  <p className="font-bold text-gray-800 mt-6 mb-2">
                    2. 수집하는 개인정보 항목
                  </p>
                  <p>- 필수항목 : 이름, 연락처, 지역</p>
                  <p>- 선택항목 : 상담 희망 시간, 관심 상품</p>
                  <p className="font-bold text-gray-800 mt-6 mb-2">
                    3. 개인정보의 보유 및 이용 기간
                  </p>
                  <p>
                    이용자의 개인정보는 수집·이용 목적이 달성된 후에는 해당
                    정보를 지체 없이 파기합니다. 단, 관련 법령에 의하여 보존할
                    필요가 있는 경우 일정 기간 동안 보관합니다.
                  </p>
                  <p className="font-bold text-gray-800 mt-6 mb-2">
                    4. 개인정보처리 위탁
                  </p>
                  <p>
                    회사는 원활한 개인정보 업무처리를 위하여 개인정보 처리업무를
                    위탁하지 않습니다.
                  </p>
                  <p className="font-bold text-gray-800 mt-6 mb-2">
                    5. 개인정보의 파기
                  </p>
                  <p>
                    회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
                    불필요하게 되었을 때에는 지체 없이 해당 개인정보를
                    파기합니다.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-gray-900 mb-4">이용약관</p>
                  <p className="font-bold text-gray-800 mt-4 mb-2">
                    제1조 (목적)
                  </p>
                  <p>
                    이 약관은 예담라이프 주식회사(이하 &quot;회사&quot;)가
                    제공하는 장례 관련 서비스(이하 &quot;서비스&quot;)의
                    이용조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.
                  </p>
                  <p className="font-bold text-gray-800 mt-6 mb-2">
                    제2조 (서비스의 내용)
                  </p>
                  <p>회사가 제공하는 서비스는 다음과 같습니다.</p>
                  <p>- 후불제 장례 서비스 안내 및 상담</p>
                  <p>- 멤버십 가입 및 관리</p>
                  <p>- 장례 관련 정보 제공</p>
                  <p className="font-bold text-gray-800 mt-6 mb-2">
                    제3조 (이용자의 의무)
                  </p>
                  <p>
                    이용자는 서비스 이용 시 허위 정보를 제공하여서는 안 되며,
                    타인의 정보를 도용하여서는 안 됩니다.
                  </p>
                  <p className="font-bold text-gray-800 mt-6 mb-2">
                    제4조 (면책조항)
                  </p>
                  <p>
                    회사는 천재지변 또는 이에 준하는 불가항력으로 인하여
                    서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이
                    면제됩니다.
                  </p>
                  <p className="font-bold text-gray-800 mt-6 mb-2">
                    제5조 (분쟁해결)
                  </p>
                  <p>
                    서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 이용자는
                    분쟁의 해결을 위해 성실히 협의합니다.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <ProposalModal
        open={showProposalModal}
        onClose={() => setShowProposalModal(false)}
      />
    </>
  );
}
