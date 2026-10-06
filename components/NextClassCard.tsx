"use client";

import type { CSSProperties } from "react";
import { gym, isPlaceholder, schedule, team, whatsappHref } from "@/data/gym";
import { useGymClock } from "@/hooks/useGymClock";
import { bookingMessage, dayName, formatUntil, nextClass } from "@/lib/schedule";
import { WhatsAppIcon } from "./Icons";

export function coachName(id?: string) {
  const name = team.find((t) => t.id === id)?.name;
  return name && !isPlaceholder(name) ? name : undefined;
}

// "Prossima lezione": computed from now (Europe/Rome), refreshed every minute.
// Server renders a neutral line; the client fills it in after hydration.
export default function NextClassCard() {
  const clock = useGymClock();
  const next = clock ? nextClass(clock.now, schedule.classes, gym.timeZone) : null;
  const cat = next && schedule.categories.find((c) => c.id === next.cls.category);
  const coach = next && coachName(next.cls.coach);

  return (
    <div className="next-class" style={cat ? ({ "--cat": cat.color } as CSSProperties) : undefined}>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">Prossima lezione</p>
        {next ? (
          <p className="mt-1.5 font-display text-[clamp(22px,3vw,30px)] font-extrabold uppercase leading-[1.05]">
            {/* countdown is visual only; the rest reads as plain text */}
            <span aria-hidden="true" className="text-[var(--cat)]">
              {formatUntil(next.minutesUntil, next.dayOffset, next.cls.day, next.cls.start)} ·{" "}
            </span>
            <span>
              {next.cls.name} · <span className="sr-only">{dayName(next.cls.day)} alle </span>
              {next.cls.start}
              {coach && <> con {coach}</>}
            </span>
          </p>
        ) : (
          <p className="mt-1.5 font-display text-[clamp(22px,3vw,30px)] font-extrabold uppercase leading-[1.05] text-white/85">
            Consulta il calendario dei corsi
          </p>
        )}
      </div>
      {next && (
        <a
          href={whatsappHref(bookingMessage(next.cls.name, next.cls.day, next.cls.start))}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary shrink-0"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Prenota il posto
        </a>
      )}
    </div>
  );
}
