import { type SVGProps } from 'react';

export function HeadstoneIcon({
  strokeWidth = 1.9,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* 묘비(헤드스톤): 둥근 윗부분 + 십자 */}
      <path d="M6 21V11a6 6 0 0 1 12 0v10" />
      <path d="M5 21h14" />
      <path d="M12 7v5" />
      <path d="M10 9h4" />
    </svg>
  );
}
