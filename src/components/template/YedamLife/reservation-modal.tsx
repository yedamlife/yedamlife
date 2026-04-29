'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Search, CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BRAND_COLOR, BRAND_COLOR_LIGHT } from './constants';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ── 가격 계산 (지역 × 장법 × 인원) ──
const PRICE_TABLE: Record<
  '수도권' | '비수도권',
  Record<'cremation' | 'burial', Record<2 | 4 | 6 | 8, number>>
> = {
  수도권: {
    cremation: { 2: 240_000, 4: 450_000, 6: 720_000, 8: 960_000 },
    burial: { 2: 300_000, 4: 600_000, 6: 800_000, 8: 1_200_000 },
  },
  비수도권: {
    cremation: { 2: 300_000, 4: 550_000, 6: 900_000, 8: 1_200_000 },
    burial: { 2: 360_000, 4: 720_000, 6: 1_000_000, 8: 1_440_000 },
  },
};

const METRO_KEYWORDS = ['서울', '경기', '인천'];
const isMetroAddress = (addr: string) => {
  if (!addr) return false;
  const sido = addr.trim().split(/\s+/)[0] ?? '';
  return METRO_KEYWORDS.some((k) => sido.startsWith(k));
};

const GUARD_SURCHARGE_PER_PERSON = 20_000;

const PEOPLE_OPTIONS = ['2', '4', '6', '8'];
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0'),
);
const MINUTE_OPTIONS = ['00', '10', '20', '30', '40', '50'];

interface ReservationForm {
  writerName: string;
  writerPhone: string;
  deceasedName: string;
  deceasedGender: string;
  funeralHall: string;
  funeralHallAddress: string;
  roomName: string;
  departureDate: string;
  departureHour: string;
  departureMinute: string;
  funeralMethod: string;
  destinationAddress: string;
  destinationDetail: string;
  clothing: string;
  people: string;
}

const INITIAL_FORM: ReservationForm = {
  writerName: '',
  writerPhone: '',
  deceasedName: '',
  deceasedGender: '',
  funeralHall: '',
  funeralHallAddress: '',
  roomName: '',
  departureDate: '',
  departureHour: '',
  departureMinute: '',
  funeralMethod: '',
  destinationAddress: '',
  destinationDetail: '',
  clothing: '',
  people: '',
};

interface ReservationDefaults {
  funeralMethod?: 'cremation' | 'burial';
  people?: '2' | '4' | '6' | '8';
  region?: '수도권' | '비수도권';
}

interface ReservationModalProps {
  open: boolean;
  onClose: () => void;
  defaults?: ReservationDefaults;
}

export function ReservationModal({
  open,
  onClose,
  defaults,
}: ReservationModalProps) {
  const [form, setForm] = useState<ReservationForm>(INITIAL_FORM);
  const [showPostcode, setShowPostcode] = useState(false);
  const postcodeRef = useRef<HTMLDivElement>(null);
  const postcodeTargetRef = useRef<'funeralHall' | 'destination'>('funeralHall');

  useEffect(() => {
    if (open) {
      setForm({
        ...INITIAL_FORM,
        funeralMethod: defaults?.funeralMethod ?? '',
        people: defaults?.people ?? '',
      });
      setShowPostcode(false);
    }
  }, [open, defaults]);

  // body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const update = useCallback(
    <K extends keyof ReservationForm>(key: K, value: ReservationForm[K]) =>
      setForm((p) => ({ ...p, [key]: value })),
    [],
  );

  const openDaumSearch = (target: 'funeralHall' | 'destination') => {
    postcodeTargetRef.current = target;

    const run = () => {
      const daum = (window as unknown as Record<string, unknown>).daum as
        | {
            Postcode: new (opts: {
              oncomplete: (data: {
                address: string;
                buildingName: string;
              }) => void;
              onclose: () => void;
              width: string;
              height: string;
            }) => { embed: (el: HTMLElement) => void };
          }
        | undefined;

      if (!daum?.Postcode || !postcodeRef.current) return;

      postcodeRef.current.innerHTML = '';
      setShowPostcode(true);

      new daum.Postcode({
        width: '100%',
        height: '100%',
        oncomplete: (data) => {
          const addr = data.buildingName
            ? `${data.address} (${data.buildingName})`
            : data.address;
          if (postcodeTargetRef.current === 'funeralHall') {
            update('funeralHallAddress', addr);
          } else {
            update('destinationAddress', addr);
          }
          setShowPostcode(false);
        },
        onclose: () => {
          setShowPostcode(false);
        },
      }).embed(postcodeRef.current);
    };

    // 스크립트가 이미 로드되어 있으면 바로 실행
    if ((window as unknown as Record<string, unknown>).daum) {
      run();
      return;
    }

    // 동적으로 스크립트 로드
    const script = document.createElement('script');
    script.src =
      '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.onload = run;
    document.head.appendChild(script);
  };

  // 적용 지역: 장례식장 주소가 있으면 주소 기준, 없으면 카드에서 전달된 default
  const region: '수도권' | '비수도권' = form.funeralHallAddress
    ? isMetroAddress(form.funeralHallAddress)
      ? '수도권'
      : '비수도권'
    : (defaults?.region ?? '비수도권');

  // 가격 계산: 지역 × 장법 × 인원 + 의장대 가산금
  const price = (() => {
    if (!form.people || !form.funeralMethod) return 0;
    const peopleNum = Number(form.people) as 2 | 4 | 6 | 8;
    if (![2, 4, 6, 8].includes(peopleNum)) return 0;
    const method = form.funeralMethod as 'cremation' | 'burial';
    if (method !== 'cremation' && method !== 'burial') return 0;
    const base = PRICE_TABLE[region][method][peopleNum] ?? 0;
    const surcharge =
      form.clothing === 'guard' ? peopleNum * GUARD_SURCHARGE_PER_PERSON : 0;
    return base + surcharge;
  })();

  const [submitting, setSubmitting] = useState(false);

  const fieldRefs = useRef<Partial<Record<keyof ReservationForm, HTMLElement | null>>>({});
  const setFieldRef = useCallback(
    (key: keyof ReservationForm) => (el: HTMLElement | null) => {
      fieldRefs.current[key] = el;
    },
    [],
  );

  const handleSubmit = async () => {
    const required: { key: keyof ReservationForm; label: string }[] = [
      { key: 'writerName', label: '작성자명' },
      { key: 'writerPhone', label: '작성자 연락처' },
      { key: 'deceasedName', label: '고인명' },
      { key: 'funeralHall', label: '장례식장명' },
      { key: 'departureDate', label: '발인 날짜' },
      { key: 'funeralMethod', label: '장례 방법' },
      { key: 'clothing', label: '복장' },
      { key: 'people', label: '운구 인원' },
    ];
    const firstMissing = required.find((r) => !form[r.key].trim());
    if (firstMissing) {
      toast.warning(`${firstMissing.label}을(를) 입력해주세요.`);
      const el = fieldRefs.current[firstMissing.key];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusable =
          el.tagName === 'INPUT' || el.tagName === 'BUTTON' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA'
            ? (el as HTMLElement)
            : el.querySelector<HTMLElement>('input, button, [tabindex]');
        focusable?.focus({ preventScroll: true });
      }
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/funeral-escort/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writer_name: form.writerName,
          writer_phone: form.writerPhone,
          deceased_name: form.deceasedName,
          deceased_gender: form.deceasedGender,
          funeral_hall: form.funeralHall,
          funeral_hall_address: form.funeralHallAddress,
          room_name: form.roomName,
          departure_date: form.departureDate,
          departure_hour: form.departureHour,
          departure_minute: form.departureMinute,
          funeral_method: form.funeralMethod,
          destination_address: form.destinationAddress,
          destination_detail: form.destinationDetail,
          clothing: form.clothing,
          people: Number(form.people),
          price,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('예약 신청이 완료되었습니다.\n담당자가 빠르게 연락드리겠습니다.');
        onClose();
      } else {
        toast.error(result.message || '오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch {
      toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const labelClass = 'block text-sm font-semibold text-gray-800 mb-1.5';
  const requiredMark = <span className="text-red-500">*</span>;
  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5a2b]/30 transition-all bg-gray-50 focus:bg-white';

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ backgroundColor: '#f3f4f6' }}
        >
          <span className="font-bold text-sm text-gray-800">
            예담운구의전 간편예약
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/5 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 본문 (스크롤) */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* ── 작성자정보 ── */}
          <div>
            <h3 className={labelClass}>
              작성자정보 {requiredMark}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                ref={setFieldRef('writerName')}
                type="text"
                placeholder="홍길동"
                value={form.writerName}
                onChange={(e) => update('writerName', e.target.value)}
                className={inputClass}
              />
              <input
                ref={setFieldRef('writerPhone')}
                type="tel"
                placeholder="-를 제외한 숫자만 입력해주세요"
                value={form.writerPhone}
                onChange={(e) => update('writerPhone', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* ── 고인정보 ── */}
          <div>
            <h3 className={labelClass}>
              고인정보 {requiredMark}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                ref={setFieldRef('deceasedName')}
                type="text"
                placeholder="고인명"
                value={form.deceasedName}
                onChange={(e) => update('deceasedName', e.target.value)}
                className={inputClass}
              />
              <Select
                value={form.deceasedGender}
                onValueChange={(v) => update('deceasedGender', v)}
              >
                <SelectTrigger className="h-auto px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-sm">
                  <SelectValue placeholder="성별" />
                </SelectTrigger>
                <SelectContent className="z-200">
                  <SelectItem value="male">남성</SelectItem>
                  <SelectItem value="female">여성</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── 장례식장 정보 ── */}
          <div>
            <h3 className={labelClass}>
              장례식장 정보 {requiredMark}
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => openDaumSearch('funeralHall')}
                  className="shrink-0 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer hover:opacity-90 transition-colors"
                  style={{ backgroundColor: BRAND_COLOR_LIGHT, color: BRAND_COLOR }}
                >
                  장례식장 검색
                </button>
                <input
                  ref={setFieldRef('funeralHall')}
                  type="text"
                  placeholder="장례식장명을 입력해주세요"
                  value={form.funeralHall}
                  onChange={(e) => update('funeralHall', e.target.value)}
                  className={inputClass}
                />
              </div>
              <input
                type="text"
                placeholder="주소"
                value={form.funeralHallAddress}
                readOnly
                className={`${inputClass} cursor-default`}
              />
              <input
                type="text"
                placeholder="호실명을 입력해주세요"
                value={form.roomName}
                onChange={(e) => update('roomName', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* ── 발인 일자 ── */}
          <div>
            <h3 className={labelClass}>
              발인 일자 {requiredMark}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    ref={setFieldRef('departureDate')}
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <span
                      className={
                        form.departureDate ? 'text-gray-900' : 'text-gray-400'
                      }
                    >
                      {form.departureDate
                        ? format(new Date(form.departureDate), 'yyyy. MM. dd.', {
                            locale: ko,
                          })
                        : '날짜 선택'}
                    </span>
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-200" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      form.departureDate
                        ? new Date(form.departureDate)
                        : undefined
                    }
                    onSelect={(date) =>
                      update(
                        'departureDate',
                        date ? format(date, 'yyyy-MM-dd') : '',
                      )
                    }
                    locale={ko}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-2">
                <Select
                  value={form.departureHour}
                  onValueChange={(v) => update('departureHour', v)}
                >
                  <SelectTrigger className="h-auto px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-sm flex-1">
                    <SelectValue placeholder="시" />
                  </SelectTrigger>
                  <SelectContent className="z-200 max-h-48">
                    {HOUR_OPTIONS.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}시
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-gray-400">:</span>
                <Select
                  value={form.departureMinute}
                  onValueChange={(v) => update('departureMinute', v)}
                >
                  <SelectTrigger className="h-auto px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-sm flex-1">
                    <SelectValue placeholder="분" />
                  </SelectTrigger>
                  <SelectContent className="z-200 max-h-48">
                    {MINUTE_OPTIONS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}분
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            </div>
          </div>

          {/* ── 장례 방법 ── */}
          <div>
            <h3 className={labelClass}>
              장례 방법 {requiredMark}
            </h3>
            <Select
              value={form.funeralMethod}
              onValueChange={(v) => update('funeralMethod', v)}
            >
              <SelectTrigger
                ref={setFieldRef('funeralMethod')}
                className="h-auto px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-sm"
              >
                <SelectValue placeholder="장례 방법 선택" />
              </SelectTrigger>
              <SelectContent className="z-200">
                <SelectItem value="cremation">화장</SelectItem>
                <SelectItem value="burial">매장</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── 화장지/매장지 주소 ── */}
          <div>
            <h3 className={labelClass}>
              {form.funeralMethod === 'burial' ? '매장지' : '화장지'} 주소
              {requiredMark}
            </h3>
            <div className="flex gap-3 mb-3">
              <button
                type="button"
                onClick={() => openDaumSearch('destination')}
                className="shrink-0 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer hover:opacity-90 transition-colors"
                style={{ backgroundColor: BRAND_COLOR_LIGHT, color: BRAND_COLOR }}
              >
                검색
              </button>
              <input
                type="text"
                placeholder="주소 검색"
                value={form.destinationAddress}
                readOnly
                className={`${inputClass} cursor-default`}
              />
            </div>
            <input
              type="text"
              placeholder="나머지 주소를 입력해주세요"
              value={form.destinationDetail}
              onChange={(e) => update('destinationDetail', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* ── 복장 & 인원 ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className={labelClass}>
                복장 선택{requiredMark}
              </h3>
              <Select
                value={form.clothing}
                onValueChange={(v) => update('clothing', v)}
              >
                <SelectTrigger
                  ref={setFieldRef('clothing')}
                  className="h-auto px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-sm"
                >
                  <SelectValue placeholder="복장 선택" />
                </SelectTrigger>
                <SelectContent className="z-200">
                  <SelectItem value="suit">정장</SelectItem>
                  <SelectItem value="guard">
                    의장대 (+2만원/인)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <h3 className={labelClass}>
                운구필요인원 {requiredMark}
              </h3>
              <Select
                value={form.people}
                onValueChange={(v) => update('people', v)}
              >
                <SelectTrigger
                  ref={setFieldRef('people')}
                  className="h-auto px-4 py-3 rounded-xl border-gray-200 bg-gray-50 text-sm"
                >
                  <SelectValue placeholder="인원 선택" />
                </SelectTrigger>
                <SelectContent className="z-200">
                  {PEOPLE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}명
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

        {/* 하단 (고정) */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 space-y-3">
          <div className="flex items-center justify-end gap-2">
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{
                backgroundColor: BRAND_COLOR_LIGHT,
                color: BRAND_COLOR,
              }}
            >
              {region}
            </span>
            <span className="text-2xl font-extrabold text-gray-900">
              {price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">원</span>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-all"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            신청하기
          </button>
        </div>
      </div>

      {/* 주소 검색 팝업 (모달 위에 띄움) */}
      <div
        className="fixed inset-0 z-200 flex items-center justify-center bg-black/40"
        style={{ display: showPostcode ? 'flex' : 'none' }}
        onClick={() => setShowPostcode(false)}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col"
          style={{ height: '500px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-3 flex items-center justify-between border-b border-gray-200 shrink-0">
            <span className="font-bold text-sm text-gray-800">주소 검색</span>
            <button
              onClick={() => setShowPostcode(false)}
              className="p-1 hover:bg-black/5 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div ref={postcodeRef} className="flex-1" />
        </div>
      </div>
    </div>
  );
}
