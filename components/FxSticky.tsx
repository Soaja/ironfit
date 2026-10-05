"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Desktop sticky column that may be taller than the viewport: it scrolls until
// its bottom is visible, then stays pinned (top = min(offset, vh - height)).
export default function FxSticky({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const offset = 92; // compact header + breathing room
      const top = Math.min(offset, window.innerHeight - el.offsetHeight - 24);
      el.style.setProperty("--fx-sticky-top", `${Math.round(top)}px`);
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    update();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={ref} className={`fx-sticky ${className}`}>
      {children}
    </div>
  );
}
