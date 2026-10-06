"use client";

import { gym } from "@/data/gym";
import { useGymClock } from "@/hooks/useGymClock";
import { DAY_NAMES, hoursForDay } from "@/lib/schedule";

// Orari sala: lunedì → domenica, today highlighted (client), closed days dimmed.
export default function OpeningWeek() {
  const today = useGymClock()?.z.day ?? 0;

  return (
    <ul className="opening-week" aria-label="Orari della sala, settimana">
      {DAY_NAMES.map((name, i) => {
        const day = i + 1;
        const slots = hoursForDay(gym.openingHours, day);
        const isToday = day === today;
        return (
          <li key={name} className="opening-day" data-today={isToday} aria-current={isToday ? "date" : undefined}>
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold capitalize text-white/90">{name}</span>
              {isToday && <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-iron-red">Oggi</span>}
            </span>
            {slots.length ? (
              <span className="mt-1.5 block font-display text-lg font-bold tabular-nums tracking-[0.02em] text-white">
                {slots.map((s) => `${s.opens}–${s.closes}`).join(" · ")}
              </span>
            ) : (
              <span className="mt-1.5 block font-display text-lg font-bold uppercase tracking-[0.04em] text-white/40">Chiuso</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
