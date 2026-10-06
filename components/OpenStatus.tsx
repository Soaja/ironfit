"use client";

import { useEffect, useState } from "react";
import { gym } from "@/data/gym";
import { openStatus, type OpenStatus as Status } from "@/lib/schedule";

// Live open/closed pill. The logic lives in lib/schedule.ts (shared with the
// Orari section); this only renders it. `asLink` = jump to #orari (hero).
export default function OpenStatus({ asLink = true }: { asLink?: boolean }) {
  // Server and first client render share this neutral state (no hydration mismatch).
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    const tick = () => setStatus(openStatus(new Date(), gym.openingHours, gym.timeZone));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const Tag = asLink ? "a" : "p";
  return (
    <Tag
      {...(asLink ? { href: "#orari" } : {})}
      className="inline-flex min-h-10 items-center gap-2.5 rounded-full border border-white/15 bg-iron-black/55 px-4 text-sm font-medium text-white/85 backdrop-blur-md transition-colors hover:border-white/35"
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 rounded-full ${
          status?.open ? "status-dot-live bg-[#22C55E]" : "bg-iron-500"
        }`}
      />
      <span>{status?.label ?? "Orari di apertura"}</span>
    </Tag>
  );
}
