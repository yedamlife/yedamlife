'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
const SON_HIGHLIGHT = '#fde68a'; // 파스텔 옐로우

type ModalKind = 'son-eopneun-nal' | '49je' | null;

export function FuneralGuideModals() {
  const [open, setOpen] = useState<ModalKind>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail === 'son-eopneun-nal' || detail === '49je') {
        setOpen(detail);
      }
    };
    window.addEventListener('open-funeral-guide-modal', handler);
    return () =>
      window.removeEventListener('open-funeral-guide-modal', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={() => setOpen(null)}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900">
            {open === 'son-eopneun-nal' ? '달력정보' : '49재 계산'}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {open === 'son-eopneun-nal' && <SonEopneunNal />}
          {open === '49je' && <Sasipgujae />}
        </div>
      </div>
    </div>
  );
}

// ── 공용 캘린더 헤더 (한국어 + 드롭다운) ──
const YEAR_RANGE = 30; // 현재 기준 ±30년
function CalendarHeader({
  month,
  setMonth,
}: {
  month: Date;
  setMonth: (d: Date) => void;
}) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const now = new Date();
  const years: number[] = [];
  for (let y = now.getFullYear() - YEAR_RANGE; y <= now.getFullYear() + YEAR_RANGE; y++) {
    years.push(y);
  }
  const months = Array.from({ length: 12 }, (_, i) => i);

  const go = (offset: number) => {
    const d = new Date(month);
    d.setMonth(d.getMonth() + offset);
    setMonth(d);
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mb-2">
      <button
        type="button"
        onClick={() => go(-1)}
        className="size-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label="이전 달"
      >
        <ChevronLeft className="w-4 h-4 text-gray-700" />
      </button>

      <Select
        value={String(year)}
        onValueChange={(v) => {
          const d = new Date(month);
          d.setFullYear(Number(v));
          setMonth(d);
        }}
      >
        <SelectTrigger
          size="sm"
          className="border-0 shadow-none px-2 py-1 text-base font-bold text-gray-900 hover:bg-gray-100 cursor-pointer w-auto gap-1"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72 z-200">
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}년
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(m)}
        onValueChange={(v) => {
          const d = new Date(month);
          d.setMonth(Number(v));
          setMonth(d);
        }}
      >
        <SelectTrigger
          size="sm"
          className="border-0 shadow-none px-2 py-1 text-base font-bold text-gray-900 hover:bg-gray-100 cursor-pointer w-auto gap-1"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-200">
          {months.map((i) => (
            <SelectItem key={i} value={String(i)}>
              {i + 1}월
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="button"
        onClick={() => go(1)}
        className="size-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label="다음 달"
      >
        <ChevronRight className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );
}

// ── 손없는 날 캘린더 ──
function SonEopneunNal() {
  const [month, setMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const sonEopneunDays = useSonEopneunDays(month);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end gap-2 text-xs text-gray-600">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ backgroundColor: SON_HIGHLIGHT }}
        />
        <span>: 손없는날</span>
      </div>

      <CalendarHeader month={month} setMonth={setMonth} />

      <Calendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        modifiers={{ sonEopneun: sonEopneunDays }}
        modifiersStyles={{
          sonEopneun: { backgroundColor: SON_HIGHLIGHT },
        }}
        modifiersClassNames={{
          sonEopneun: 'text-gray-900 rounded-md font-bold',
        }}
        components={{
          DayButton: ({ day, modifiers, ...props }) => {
            const lunar = formatLunar(day.date);
            return (
              <button
                {...props}
                className="relative size-full min-h-[56px] flex flex-col items-center justify-center gap-0.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <span
                  className={`text-sm ${
                    modifiers.outside ? 'text-gray-300' : 'text-gray-900'
                  } ${day.date.getDay() === 0 ? 'text-red-500' : ''} ${
                    day.date.getDay() === 6 ? 'text-blue-500' : ''
                  }`}
                >
                  {day.date.getDate()}
                </span>
                <span className="text-[10px] text-gray-400">{lunar}</span>
              </button>
            );
          },
        }}
        className="w-full"
        classNames={{
          months: 'w-full',
          month: 'w-full flex flex-col gap-3',
          month_caption: 'hidden',
          nav: 'hidden',
          month_grid: 'w-full',
          weekdays: 'grid grid-cols-7 mb-1',
          weekday: 'text-xs font-semibold text-gray-500 text-center py-2',
          week: 'grid grid-cols-7',
          day: 'aspect-square',
        }}
      />

      <p className="text-[13px] text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
        ※ 손 없는 날은 사람의 활동을 방해하고 해코지한다는 악귀나 악신이
        돌아다니지 않아 인간에게 해를 끼치지 않는 길한 날을 의미합니다. 음력
        끝자리가 9와 0인 날이 손 없는 날에 해당합니다.
      </p>
    </div>
  );
}

// ── 49재 계산기 ──
function Sasipgujae() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [month, setMonth] = useState<Date>(() => new Date());

  const results = date
    ? [
        { label: '초재일', offset: 6 },
        { label: '2재일', offset: 13 },
        { label: '3재일', offset: 20 },
        { label: '4재일', offset: 27 },
        { label: '5재일', offset: 34 },
        { label: '6재일', offset: 41 },
        { label: '49재일', offset: 48, highlight: true },
      ].map((r) => ({
        label: r.label,
        date: addDays(date, r.offset),
        highlight: r.highlight,
      }))
    : [];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-bold text-gray-900 mb-2">
          돌아가신 날(양력)
        </p>
        <div className="border border-gray-200 rounded-xl p-3">
          <CalendarHeader month={month} setMonth={setMonth} />
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={month}
            onMonthChange={setMonth}
            className="w-full"
            classNames={{
              months: 'w-full',
              month: 'w-full flex flex-col gap-3',
              month_caption: 'hidden',
              nav: 'hidden',
              month_grid: 'w-full',
              weekdays: 'grid grid-cols-7 mb-1',
              weekday:
                'text-xs font-semibold text-gray-500 text-center py-2',
              week: 'grid grid-cols-7',
              day: 'aspect-square p-0',
              day_button:
                'size-full inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-gray-100 transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
              selected:
                'bg-[#4a5a2b] text-white hover:bg-[#4a5a2b] rounded-md [&_button]:bg-[#4a5a2b] [&_button]:text-white [&_button]:hover:bg-[#4a5a2b]',
              today: 'font-bold text-[#4a5a2b]',
            }}
          />
        </div>
      </div>

      {date ? (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-xs text-gray-500 mb-0.5">돌아가신 날</p>
            <p className="text-sm font-bold text-gray-900">
              {formatKDate(date)}
            </p>
          </div>
          <ul className="divide-y divide-gray-100">
            {results.map((r) => (
              <li
                key={r.label}
                className={`flex items-center justify-between px-4 py-3 ${
                  r.highlight ? 'bg-[#f5f7f0]' : ''
                }`}
              >
                <span
                  className={`text-sm ${
                    r.highlight
                      ? 'font-extrabold text-[#4a5a2b]'
                      : 'font-semibold text-gray-700'
                  }`}
                >
                  {r.label}
                </span>
                <span
                  className={`text-sm ${
                    r.highlight
                      ? 'font-extrabold text-[#4a5a2b]'
                      : 'font-semibold text-gray-900'
                  }`}
                >
                  {formatKDate(r.date)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          돌아가신 날을 선택하면 49재 일정이 표시됩니다.
        </p>
      )}

      <p className="text-[13px] text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
        ※ 49재는 돌아가신 날을 포함하여 매 7일마다 7회 재를 지내며, 현대에는
        마지막 49재만 지내는 경우가 많습니다.
      </p>
    </div>
  );
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatKDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}년 ${m}월 ${d}일`;
}

// ── 음력 변환 (Intl chinese calendar 사용) ──
function getLunar(date: Date): { month: number; day: number; leap: boolean } {
  const fmt = new Intl.DateTimeFormat('en-u-ca-chinese', {
    month: 'numeric',
    day: 'numeric',
  });
  const parts = fmt.formatToParts(date);
  let monthStr = '';
  let dayStr = '';
  for (const p of parts) {
    if (p.type === 'month') monthStr = p.value;
    if (p.type === 'day') dayStr = p.value;
  }
  const leap = monthStr.includes('bis');
  const month = parseInt(monthStr.replace(/\D/g, ''), 10);
  const day = parseInt(dayStr, 10);
  return { month, day, leap };
}

function formatLunar(date: Date): string {
  try {
    const { month, day, leap } = getLunar(date);
    return `${leap ? '윤' : '음'}${month}.${day}`;
  } catch {
    return '';
  }
}

function useSonEopneunDays(monthAnchor: Date): Date[] {
  const days: Date[] = [];
  const start = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  start.setDate(start.getDate() - 7);
  const end = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0);
  end.setDate(end.getDate() + 7);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    try {
      const { day } = getLunar(d);
      const last = day % 10;
      if (last === 9 || last === 0) days.push(new Date(d));
    } catch {
      // skip
    }
  }
  return days;
}
