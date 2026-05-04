export const RELIGION_CODE: Record<string, string> = {
  무교: 'N',
  기독교: 'P',
  천주교: 'C',
  불교: 'B',
  기타: 'O',
};

export function religionCode(religion: string | null | undefined): string {
  if (!religion) return 'N';
  return RELIGION_CODE[religion] ?? 'O';
}

export function membershipNoFull(
  membershipNo: string | null | undefined,
  religion: string | null | undefined,
): string {
  if (!membershipNo) return '';
  return `${membershipNo}-${religionCode(religion)}`;
}

/**
 * KST 기준 yyyymmdd + 일별순번(3자리) 조합.
 * 예: 2026-05-04 의 1번째 신청 → "20260504001"
 */
export function buildDailyCode(isoTimestamp: string, dailySequence: number): string {
  const ymd = formatKstYmd(isoTimestamp);
  const seq = String(Math.max(1, Math.min(999, dailySequence))).padStart(3, '0');
  return `${ymd}${seq}`;
}

export function formatKstYmd(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kst = new Date(date.getTime() + kstOffsetMs);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kst.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * KST 하루의 [start, end] UTC ISO 경계.
 */
export function getKstDayBoundsUtc(isoTimestamp: string): { start: string; end: string } {
  const date = new Date(isoTimestamp);
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kst = new Date(date.getTime() + kstOffsetMs);
  const y = kst.getUTCFullYear();
  const m = kst.getUTCMonth();
  const d = kst.getUTCDate();
  const startUtc = new Date(Date.UTC(y, m, d, 0, 0, 0) - kstOffsetMs);
  const endUtc = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - kstOffsetMs);
  return { start: startUtc.toISOString(), end: endUtc.toISOString() };
}

/**
 * 회원증에 표시되는 최종 코드.
 * `YD{yyyymmdd}{seq:3}-{종교코드}`
 * 예: YD20260504001-P
 */
export function buildCertificateCode(
  isoTimestamp: string,
  dailySequence: number,
  religion: string | null | undefined,
): string {
  return `YD${buildDailyCode(isoTimestamp, dailySequence)}-${religionCode(religion)}`;
}
