"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type TouchEvent } from "react";
import { coachName, contact, gym, LEVEL_LABEL, schedule, whatsappHref, type GymClass } from "@/data/gym";
import { addressOneLine } from "@/lib/contact";
import { useGymClock } from "@/hooks/useGymClock";
import { bookingMessage, buildIcs, dayName, hoursForDay, toMinutes } from "@/lib/schedule";
import { WhatsAppIcon } from "./Icons";

// Weekly class calendar.
// - Filters: toggle buttons (aria-pressed), mirrored in the URL (#orari?corso=yoga).
// - ≥1024px: a real <table> (days × hours), blocks positioned by start/end.
// - <1024px: day tabs (tabs pattern) + that day's class cards, swipe to change day.
// Every class of every day is in the server HTML; filters/tabs only hide visually.

const DAYS = [1, 2, 3, 4, 5, 6, 7];
const ROW_H = 88; // px per hour in the desktop grid (fits time, name, category, level)
const HEAD_H = 48; // px, desktop header row
const firstHour = Math.min(...schedule.classes.map((c) => Math.floor(toMinutes(c.start) / 60)));
const lastHour = Math.max(...schedule.classes.map((c) => Math.ceil(toMinutes(c.end) / 60)));
const HOURS = Array.from({ length: lastHour - firstHour }, (_, i) => firstHour + i);
const CATEGORY = Object.fromEntries(schedule.categories.map((c) => [c.id, c]));

const byStart = (a: GymClass, b: GymClass) => toMinutes(a.start) - toMinutes(b.start);
const classesOn = (day: number) => schedule.classes.filter((c) => c.day === day).sort(byStart);
const catStyle = (c: GymClass) => ({ "--cat": CATEGORY[c.category]?.color } as CSSProperties);

function ClassMeta({ c }: { c: GymClass }) {
  const coach = coachName(c.coach);
  return (
    <>
      {coach && <span className="tt-meta">con {coach}</span>}
      {c.level && <span className="tt-meta">{LEVEL_LABEL[c.level]}</span>}
    </>
  );
}

function emptyText(day: number, isToday: boolean, filterLabel?: string) {
  const the = dayName(day) === "domenica" ? "la domenica" : `il ${dayName(day)}`;
  // Honest copy: don't say "la sala è aperta" on a day it's closed.
  if (!hoursForDay(gym.openingHours, day).length) return `Nessun corso: ${the} la palestra è chiusa.`;
  const when = isToday ? "oggi" : the;
  return filterLabel
    ? `Nessun corso di ${filterLabel} ${when}. La sala è aperta: vieni ad allenarti.`
    : `Nessun corso ${when}, la sala è aperta: vieni ad allenarti.`;
}

export default function Timetable() {
  const clock = useGymClock();
  const today = clock?.z.day ?? 0;
  const [filter, setFilter] = useState<string>("tutti");
  const [picked, setPicked] = useState<number | null>(null); // user-selected day (mobile)
  const day = picked ?? (today || 1);
  const [open, setOpen] = useState<GymClass | null>(null);
  const [anim, setAnim] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // #orari?corso=yoga -> filter (shared links, back/forward).
  useEffect(() => {
    const read = (initial: boolean) => {
      const m = window.location.hash.match(/^#orari\?corso=([\w-]+)/);
      if (m && CATEGORY[m[1]]) {
        setFilter(m[1]);
        // "#orari?corso=…" matches no element id, so scroll to the section ourselves;
        // re-align once neighbouring sections have rendered at their real height
        // (they use content-visibility: auto).
        if (initial) {
          const go = () => document.getElementById("orari")?.scrollIntoView({ behavior: "instant" });
          go();
          window.setTimeout(go, 350);
        }
      }
    };
    read(true);
    const onHash = () => read(false);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const chooseFilter = (id: string) => {
    setFilter(id);
    setAnim((n) => n + 1);
    history.replaceState(null, "", id === "tutti" ? "#orari" : `#orari?corso=${id}`);
  };

  // Keep the selected day tab visible inside the strip (never scrolls the page).
  useEffect(() => {
    const list = tabsRef.current;
    const tab = list?.querySelector<HTMLElement>(`[data-day="${day}"]`);
    if (list && tab) list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
  }, [day]);

  const selectDay = (d: number, focus = false) => {
    setPicked(d);
    setAnim((n) => n + 1);
    if (focus) tabsRef.current?.querySelector<HTMLElement>(`[data-day="${d}"]`)?.focus();
  };

  const onTabKey = (e: KeyboardEvent) => {
    const idx = DAYS.indexOf(day);
    const go = { ArrowRight: idx + 1, ArrowLeft: idx - 1, Home: 0, End: DAYS.length - 1 }[e.key];
    if (go === undefined) return;
    e.preventDefault();
    selectDay(DAYS[(go + DAYS.length) % DAYS.length], true);
  };

  const onTouchStart = (e: TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return; // vertical scroll, not a swipe
    const idx = DAYS.indexOf(day) + (dx < 0 ? 1 : -1);
    if (idx >= 0 && idx < DAYS.length) selectDay(DAYS[idx]);
  };

  // Details sheet (native <dialog>: modal focus trap + Escape for free).
  const openSheet = (c: GymClass, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setOpen(c);
  };
  useEffect(() => {
    if (open && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  }, [open]);
  const closeSheet = useCallback(() => dialogRef.current?.close(), []);
  const onDialogClose = () => {
    setOpen(null);
    triggerRef.current?.focus(); // back to the class that opened it
  };

  const downloadIcs = (c: GymClass) => {
    const ics = buildIcs({
      uid: `${c.id}@${new URL(gym.url).host}`,
      name: c.name,
      day: c.day,
      start: c.start,
      end: c.end,
      location: `IRONFIT, ${addressOneLine(contact.address)}`,
      description: [CATEGORY[c.category]?.label, c.level && LEVEL_LABEL[c.level], c.note, gym.url].filter(Boolean).join("\n"),
      now: new Date(),
    });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `ironfit-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${dayName(c.day)}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const matches = (c: GymClass) => filter === "tutti" || c.category === filter;
  const filterLabel = filter === "tutti" ? undefined : CATEGORY[filter]?.label;
  const nowLine =
    clock && today && clock.z.minutes >= firstHour * 60 && clock.z.minutes <= lastHour * 60
      ? HEAD_H + ((clock.z.minutes - firstHour * 60) / 60) * ROW_H
      : null;

  return (
    <div className="tt" style={{ "--row-h": `${ROW_H}px`, "--head-h": `${HEAD_H}px` } as CSSProperties}>
      {/* Filters */}
      <div role="group" aria-label="Filtra per corso" className="flex flex-wrap gap-2">
        {[{ id: "tutti", label: "Tutti", color: "" }, ...schedule.categories].map((cat) => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={filter === cat.id}
            onClick={() => chooseFilter(cat.id)}
            className="tt-chip"
            style={cat.color ? ({ "--cat": cat.color } as CSSProperties) : undefined}
          >
            {cat.color && <span aria-hidden="true" className="tt-dot" />}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Desktop: weekly grid as a real table */}
      <div className="tt-grid-wrap relative mt-8 hidden lg:block">
        <table className="tt-table">
          <caption className="sr-only">Calendario settimanale dei corsi di IRONFIT a Ribera, da lunedì a domenica</caption>
          <thead>
            <tr>
              <th scope="col" className="tt-time-col">
                <span className="sr-only">Ora</span>
              </th>
              {DAYS.map((d) => (
                <th key={d} scope="col" data-today={d === today} className="tt-day">
                  {dayName(d)}
                  {d === today && <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.14em] text-iron-red">Oggi</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((h) => (
              <tr key={h}>
                <th scope="row" className="tt-hour">{`${String(h).padStart(2, "0")}:00`}</th>
                {DAYS.map((d) => (
                  <td key={d} data-today={d === today}>
                    {schedule.classes
                      .filter((c) => c.day === d && Math.floor(toMinutes(c.start) / 60) === h)
                      .map((c) => {
                        const top = ((toMinutes(c.start) % 60) / 60) * ROW_H;
                        const height = ((toMinutes(c.end) - toMinutes(c.start)) / 60) * ROW_H;
                        const on = matches(c);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            className="tt-block"
                            data-dim={!on}
                            data-short={toMinutes(c.end) - toMinutes(c.start) < 60}
                            inert={!on}
                            style={{ ...catStyle(c), top: top + 2, height: height - 4 }}
                            onClick={(e) => openSheet(c, e.currentTarget)}
                          >
                            <span className="tt-time">
                              {c.start}–{c.end}
                            </span>
                            <span className="tt-name">{c.name}</span>
                            <span className="tt-cat">{CATEGORY[c.category]?.label}</span>
                            <ClassMeta c={c} />
                          </button>
                        );
                      })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {nowLine !== null && (
          <div
            aria-hidden="true"
            className="tt-now"
            style={{ top: nowLine, "--col": today - 1 } as CSSProperties}
          />
        )}
      </div>

      {/* Mobile/tablet: day tabs + list */}
      <div className="mt-6 lg:hidden">
        <div ref={tabsRef} role="tablist" aria-label="Giorni della settimana" className="tt-tabs" onKeyDown={onTabKey}>
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              id={`tt-tab-${d}`}
              data-day={d}
              aria-selected={d === day}
              aria-controls={`tt-panel-${d}`}
              tabIndex={d === day ? 0 : -1}
              onClick={() => selectDay(d)}
              className="tt-tab"
            >
              <span className="capitalize">{dayName(d)}</span>
              {d === today && <span className="tt-tab-today">Oggi</span>}
            </button>
          ))}
        </div>

        <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className="mt-4">
          {DAYS.map((d) => {
            const list = classesOn(d);
            const visible = list.filter(matches);
            return (
              <div key={d} role="tabpanel" id={`tt-panel-${d}`} aria-labelledby={`tt-tab-${d}`} hidden={d !== day} tabIndex={0} className="tt-panel">
                <ul key={anim} className="tt-list">
                  {list.map((c) => (
                    <li key={c.id} hidden={!matches(c)}>
                      <button type="button" className="tt-card" style={catStyle(c)} onClick={(e) => openSheet(c, e.currentTarget)}>
                        <span className="tt-card-time">
                          {c.start}
                          <span className="block text-xs font-medium text-white/50">{c.end}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="tt-cat">{CATEGORY[c.category]?.label}</span>
                          <span className="tt-name">{c.name}</span>
                          <span className="flex flex-wrap gap-x-3">
                            <ClassMeta c={c} />
                          </span>
                        </span>
                        <span aria-hidden="true" className="text-white/40">›</span>
                      </button>
                    </li>
                  ))}
                </ul>
                {visible.length === 0 && <p className="tt-empty">{emptyText(d, d === today, list.length ? filterLabel : undefined)}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Details: popover on desktop, bottom sheet on mobile */}
      <dialog
        ref={dialogRef}
        className="tt-sheet"
        aria-labelledby="tt-sheet-title"
        onClose={onDialogClose}
        onClick={(e) => e.target === e.currentTarget && closeSheet()}
      >
        {open && (
          <div className="tt-sheet-body" style={catStyle(open)}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                  <span aria-hidden="true" className="tt-dot" />
                  {CATEGORY[open.category]?.label}
                </p>
                <h3 id="tt-sheet-title" className="mt-2 font-display text-[34px] font-extrabold uppercase leading-none">
                  {open.name}
                </h3>
              </div>
              <button type="button" onClick={closeSheet} className="tt-close" aria-label="Chiudi">
                ✕
              </button>
            </div>
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-[15px]">
              <dt className="text-white/55">Quando</dt>
              <dd className="font-semibold capitalize">
                {dayName(open.day)}, {open.start}–{open.end}
              </dd>
              {coachName(open.coach) && (
                <>
                  <dt className="text-white/55">Coach</dt>
                  <dd className="font-semibold">{coachName(open.coach)}</dd>
                </>
              )}
              {open.level && (
                <>
                  <dt className="text-white/55">Livello</dt>
                  <dd className="font-semibold">{LEVEL_LABEL[open.level]}</dd>
                </>
              )}
            </dl>
            {open.note && <p className="mt-4 text-white/75">{open.note}</p>}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <a
                href={whatsappHref(bookingMessage(open.name, open.day, open.start))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex-1"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Prenota su WhatsApp
              </a>
              <button type="button" className="btn btn-ghost flex-1" onClick={() => downloadIcs(open)}>
                Aggiungi al calendario
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
