import { coachName, LEVEL_LABEL, schedule, whatsappHref } from "@/data/gym";
import { bookingMessage, dayName, toMinutes } from "@/lib/schedule";
import { WhatsAppIcon } from "../Icons";

// Yoga classes from the same schedule as the homepage calendar (gym.ts).
export default function YogaClasses() {
  const classes = schedule.classes
    .filter((c) => c.category === "yoga")
    .sort((a, b) => a.day - b.day || toMinutes(a.start) - toMinutes(b.start));

  if (!classes.length) {
    return <p className="tt-empty">Il calendario dello yoga è in aggiornamento: scrivici per sapere quando.</p>;
  }

  return (
    <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {classes.map((c) => {
        const coach = coachName(c.coach);
        return (
          <li key={c.id} className="yoga-class">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{dayName(c.day)}</p>
            <p className="mt-3 font-display text-[44px] font-extrabold leading-none tabular-nums">{c.start}</p>
            <p className="mt-1 text-sm text-white/55">fino alle {c.end}</p>
            <p className="mt-4 text-[15px] text-white/80">
              {c.level ? LEVEL_LABEL[c.level] : "Yoga"}
              {coach && <> · con {coach}</>}
            </p>
            <a
              href={whatsappHref(bookingMessage(c.name, c.day, c.start))}
              target="_blank"
              rel="noopener noreferrer"
              className="panel-link mt-4 inline-flex"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Prenota il posto
            </a>
          </li>
        );
      })}
    </ul>
  );
}
