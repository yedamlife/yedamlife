// 상품 ID → 한글 표기 매핑
// 알림톡 본문에 노출되는 라벨이라 무빈소 여부까지 명시

const PRODUCT_LABELS: Record<string, string> = {
  // 후불제 상조 (gf)
  'yedam-1': '예담 1호 (무빈소)',
  'yedam-2': '예담 2호',
  'yedam-3': '예담 3호',
  'yedam-4': '예담 4호',
  // 기업 상조 (cf)
  'corp-1': '기업 1호',
  'corp-2': '기업 2호',
};

export function productLabel(id: string | null | undefined): string {
  if (!id) return '-';
  return PRODUCT_LABELS[id] ?? id;
}
