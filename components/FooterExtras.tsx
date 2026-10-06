"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { LED_SEGMENTS } from "./LedLines";

const noop = () => () => {};

/** Year for the copyright line: build year in the HTML, real year after hydration. */
export function CurrentYear({ buildYear }: { buildYear: number }) {
  const year = useSyncExternalStore(noop, () => new Date().getFullYear(), () => buildYear);
  return <>{year}</>;
}

/** LED polygon that draws itself when the footer wordmark scrolls into view. */
export function FooterLed() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.armed = "true";
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.lit = "true";
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <svg ref={ref} className="footer-led" viewBox="900 60 760 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {LED_SEGMENTS.slice(0, 4).map(([x1, y1, x2, y2]) => (
        <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} />
      ))}
    </svg>
  );
}
