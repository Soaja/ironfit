"use client";

import { useEffect, useState } from "react";
import { gym, type DayCode } from "@/data/gym";

const DAYS: DayCode[] = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAY_NAMES_IT = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];

type Status = { open: boolean; label: string } | null;

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// Current weekday + minutes in the gym's timezone, regardless of the visitor's clock.
function nowInGymTz(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: gym.timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = DAYS.indexOf(get("weekday").slice(0, 2) as DayCode);
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

function slotsFor(day: number) {
  return gym.openingHours
    .filter((s) => (s.days as readonly DayCode[]).includes(DAYS[day]))
    .map((s) => ({ opens: s.opens, closes: s.closes }))
    .sort((a, b) => toMinutes(a.opens) - toMinutes(b.opens));
}

export function computeStatus(date: Date): Status {
  const { day, minutes } = nowInGymTz(date);
  if (day < 0) return null;

  const today = slotsFor(day);
  const current = today.find((s) => minutes >= toMinutes(s.opens) && minutes < toMinutes(s.closes));
  if (current) return { open: true, label: `Aperto ora · chiude alle ${current.closes}` };

  const laterToday = today.find((s) => minutes < toMinutes(s.opens));
  if (laterToday) return { open: false, label: `Chiuso · apre alle ${laterToday.opens}` };

  for (let offset = 1; offset <= 7; offset++) {
    const d = (day + offset) % 7;
    const [first] = slotsFor(d);
    if (first) {
      const when = offset === 1 ? "domani" : DAY_NAMES_IT[d];
      return { open: false, label: `Chiuso · apre ${when} alle ${first.opens}` };
    }
  }
  return null;
}

export default function OpenStatus() {
  // Server and first client render share this neutral state (no hydration mismatch).
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    const tick = () => setStatus(computeStatus(new Date()));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <a
      href="#orari"
      className="inline-flex min-h-10 items-center gap-2.5 rounded-full border border-white/15 bg-iron-black/55 px-4 text-sm font-medium text-white/85 backdrop-blur-md transition-colors hover:border-white/35"
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 rounded-full ${
          status?.open ? "status-dot-live bg-[#22C55E]" : "bg-iron-500"
        }`}
      />
      <span>{status?.label ?? "Orari di apertura"}</span>
    </a>
  );
}
