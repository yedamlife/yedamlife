'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

// ── CountUp 애니메이션 ──
export function CountUp({
  end,
  suffix = '',
  duration = 2000,
  className,
}: {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) setHasStarted(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return (
    <div ref={ref} className={className}>
      {end >= 1000 ? count.toLocaleString() : String(count)}
      {suffix}
    </div>
  );
}

// ── FAQ 아코디언 ──
export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm sm:text-base font-semibold pr-4 text-gray-900">
          {question}
        </span>
        <ChevronRight
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-4">
          <p className="text-sm text-gray-500 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

// ── 티커 컴포넌트 ──
export function Ticker<T>({
  data,
  renderItem,
  interval = 3000,
}: {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  interval?: number;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % data.length);
    }, interval);
    return () => clearInterval(timer);
  }, [data.length, interval]);

  return (
    <div className="relative h-6 overflow-hidden">
      {data.map((item, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center transition-all duration-500 ease-in-out"
          style={{
            transform: `translateY(${(i - idx) * 100}%)`,
            opacity: i === idx ? 1 : 0,
          }}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
