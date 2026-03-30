/**
 * 색상 유틸리티 함수
 * 배경색 밝기 기반 대비 색상 계산
 */

/**
 * HEX → RGB 변환
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * HEX 색상의 상대적 밝기 계산 (0-1)
 * WCAG 명도 공식 사용
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 배경색이 밝은지 판단 (밝으면 true)
 */
export function isLightBackground(hex: string): boolean {
  return getLuminance(hex) > 0.5;
}

/**
 * 배경색에 대비되는 텍스트 색상 반환
 */
export function getContrastTextColor(
  backgroundColor: string,
  darkColor = '#1a1a1a',
  lightColor = '#ffffff'
): string {
  return isLightBackground(backgroundColor) ? darkColor : lightColor;
}

/**
 * 브랜드 컬러 프리셋에 어울리는 Footer 배경색 반환
 * 밝은 배경 → 어두운 Footer (#1a1a1a)
 * 어두운 배경 → 밝은 Footer (#ffffff)
 */
export function getFooterBackgroundColor(presetBackground: string): string {
  return isLightBackground(presetBackground) ? '#1a1a1a' : '#ffffff';
}

/**
 * Footer 배경색에 맞는 텍스트 색상 반환
 */
export function getFooterTextColor(footerBackground: string): string {
  return isLightBackground(footerBackground) ? '#1a1a1a' : '#ffffff';
}
