import { coachName, LEVEL_LABEL, schedule, whatsappHref } from "@/data/gym";
import { bookingMessage, dayName, toMinutes } from "@/lib/schedule";
import { WhatsAppIcon } from "../Icons";

// Mind-body classes (Yogalates + Pilates) from the same schedule as the
// homepage calendar (gym.ts), grouped by day. The gym's sheet has no plain
// "Yoga" class.
const CATEGORIES = ["yogalates", "pilates"];

export default function YogaClasses() {
  const classes = schedule.classes
    .filter((c) => CATEGORIES.includes(c.category))
    .sort((a, b) => a.day - b.day || toMinutes(a.start) - toMinutes(b.start));
  const days = [...new Set(classes.map((c) => c.day))];
  const color = (cat: string) => schedule.categories.find((c) => c.id === cat)?.color;

  if (!classes.length) {
    return <p className="tt-empty">Il calendario è in aggiornamento: scrivici per sapere quando.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {days.map((day) => (
        <li key={day} className="yoga-day">
          <h3 className="font-display text-[28px] font-extrabold uppercase leading-none">{dayName(day)}</h3>
          <ul className="mt-5 grid gap-2">
            {classes
              .filter((c) => c.day === day)
              .map((c) => {
                const coach = coachName(c.coach);
                return (
                  <li key={c.id}>
                    <a
                      href={whatsappHref(bookingMessage(c.name, c.day, c.start))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="yoga-slot"
                      style={{ borderLeftColor: color(c.category) }}
                      aria-label={`Prenota ${c.name} di ${dayName(c.day)} alle ${c.start} su WhatsApp`}
                    >
                      <span className="font-display text-[26px] font-extrabold leading-none tabular-nums">{c.start}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold" style={{ color: color(c.category) }}>
                          {c.name}
                        </span>
                        <span className="block text-xs text-white/55">
                          fino alle {c.end}
                          {c.level && <> · {LEVEL_LABEL[c.level]}</>}
                          {coach && <> · con {coach}</>}
                        </span>
                      </span>
                      <WhatsAppIcon className="h-4 w-4 shrink-0 text-white/50" />
                    </a>
                  </li>
                );
              })}
          </ul>
        </li>
      ))}
    </ul>
  );
}
