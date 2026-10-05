"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Horizontal scroll-snap list (mobile/tablet) with a red progress bar.
// On desktop the same <ul> is laid out by CSS (`className`); the bar hides.
export default function SnapCarousel({
  children,
  className = "",
  label,
  count,
}: {
  children: ReactNode;
  className?: string;
  label: string;
  count: number;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(1 / count);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = el.scrollWidth - el.clientWidth;
      const ratio = max > 0 ? el.scrollLeft / max : 0;
      setProgress(1 / count + ratio * (1 - 1 / count));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [count]);

  return (
    <div>
      <ul ref={ref} aria-label={label} className={className}>
        {children}
      </ul>
      <div className="mt-6 h-0.5 bg-white/10 px-0 lg:hidden mx-[var(--gutter)]" aria-hidden="true">
        <div className="h-full origin-left bg-iron-red transition-transform duration-150" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
}
