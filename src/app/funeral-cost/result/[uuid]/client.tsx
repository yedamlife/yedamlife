'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FuneralCostModal } from '@/components/template/YedamLife/funeral-cost-modal';

interface InputJson {
  funeralType?: '3day' | 'nobinso';
  sido?: string;
  gungu?: string;
  facilityCd?: string;
  selectedSize?: string;
  guestCount?: number;
  checkedFeeIndexes?: number[];
}

interface Props {
  data: {
    uuid: string;
    name: string;
    funeralType: '3day' | 'nobinso';
    mode: 'live' | 'snapshot';
    inputJson?: Record<string, unknown>;
    resultJson?: Record<string, unknown>;
  };
}

/**
 * 결과 URL 진입 시 — 기존 FuneralCostModal 의 URL 쿼리 파라미터 복원 로직을 활용해
 * 6단계(결과 화면) 으로 자동 이동시킨다. inputJson(또는 resultJson 의 uiSnapshot) 에서
 * 핵심 키들을 fc_* 쿼리 파라미터로 변환해 URL 에 주입한 뒤 모달을 isOpen=true 로 렌더.
 *
 * sangjo 선택 상태(unselectedSangjoKeys / sangjoQuantities / flowerDecor / ritual)는
 * 현재 모달의 URL 복원 범위 밖이라 첫 진입 시 기본값이 적용된다(추후 확장).
 */
export function FuneralCostResultClient({ data }: Props) {
  const router = useRouter();
  const [paramsReady, setParamsReady] = useState(false);
  const injectedRef = useRef(false);

  useEffect(() => {
    if (injectedRef.current) return;
    // 이미 fc_* 쿼리가 있으면 (재진입 등) 재주입 금지 — router.replace 가 서버 컴포넌트 재실행을 트리거해 무한 루프 발생
    if (typeof window !== 'undefined' && window.location.search.includes('fc_type')) {
      injectedRef.current = true;
      setParamsReady(true);
      return;
    }

    // resultJson 의 uiSnapshot 또는 inputJson 에서 fc_* 파라미터 구성
    const ui =
      ((data.resultJson?.uiSnapshot as InputJson | undefined) ?? null) ??
      (data.inputJson as InputJson | undefined) ??
      null;

    const params = new URLSearchParams();
    params.set('fc_type', data.funeralType);
    if (ui?.sido) params.set('fc_sido', ui.sido);
    if (ui?.gungu) params.set('fc_gungu', ui.gungu);
    if (ui?.facilityCd) params.set('fc_hall', ui.facilityCd);
    if (ui?.selectedSize) params.set('fc_size', ui.selectedSize);
    if (typeof ui?.guestCount === 'number')
      params.set('fc_guests', String(ui.guestCount));
    if (Array.isArray(ui?.checkedFeeIndexes) && ui.checkedFeeIndexes.length > 0)
      params.set('fc_checked', ui.checkedFeeIndexes.join(','));

    const qs = params.toString();
    injectedRef.current = true;
    if (qs) {
      // useSearchParams() 훅이 감지하도록 router.replace 사용
      router.replace(`${window.location.pathname}?${qs}`, { scroll: false });
    }
    setParamsReady(true);
  }, [data, router]);

  if (!paramsReady) return null;

  return (
    <FuneralCostModal
      isOpen
      onClose={() => router.push('/')}
      initialEstimateUuid={data.uuid}
    />
  );
}
