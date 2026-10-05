"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Mounts its children (e.g. a below-the-fold next/image) only when they get
// within `margin` of the viewport. Native lazy-loading starts ~1250px out, which
// on phones means during the initial load, competing with the hero (LCP).
// Before that, a <noscript> copy keeps the image for no-JS clients.
export default function NearMount({
  children,
  className,
  margin = "600px",
}: {
  children: ReactNode;
  className?: string;
  margin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: `${margin} ${margin}` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return (
    <div ref={ref} className={className}>
      {near ? children : <noscript>{children}</noscript>}
    </div>
  );
}
