"use client";

import { useEffect, useRef } from "react";

// The final value is server-rendered (crawlers and no-JS see it). On the
// client, numeric values reset to 0 and count up when they enter the viewport.
// Non-numeric values (data placeholders) are left untouched.
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const target = Number(value.replace(/[.\s]/g, ""));
    if (!el || !Number.isFinite(target) || value.trim() === "") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const format = (n: number) => Math.round(n).toLocaleString("it-IT");
    el.textContent = format(0);
    let frame = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1400;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          el.textContent = format(target * (1 - (1 - t) ** 3));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = value;
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
