// Time logic for opening hours and the class schedule. Pure functions only:
// no React, no date library — Intl.DateTimeFormat with an explicit timeZone,
// so results follow the gym's clock (Europe/Rome), never the visitor's.
import type { DayCode, OpeningHours } from "../data/gym";

/** Day numbers are 1 = lunedì … 7 = domenica. */
export const DAY_NAMES = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"] as const;
export const DAY_SHORT = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"] as const;
const DAY_CODES: DayCode[] = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const ICS_DAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

export const dayName = (day: number) => DAY_NAMES[day - 1];
export const dayCodeOf = (day: number) => DAY_CODES[day - 1];

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export type ZonedNow = { day: number; minutes: number; year: number; month: number; date: number };

/** Weekday (1-7), minutes since midnight and calendar date in `timeZone`. */
export function nowInZone(now: Date, timeZone: string): ZonedNow {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = DAY_CODES.indexOf(get("weekday").slice(0, 2) as DayCode) + 1;
  return {
    day,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    year: Number(get("year")),
    month: Number(get("month")),
    date: Number(get("day")),
  };
}

/** Opening slots for a weekday, sorted. */
export function hoursForDay(openingHours: readonly OpeningHours[], day: number) {
  const code = dayCodeOf(day);
  return openingHours
    .filter((s) => (s.days as readonly DayCode[]).includes(code))
    .map((s) => ({ opens: s.opens, closes: s.closes }))
    .sort((a, b) => toMinutes(a.opens) - toMinutes(b.opens));
}

export type OpenStatus = { open: boolean; label: string } | null;

/** "Aperto ora · chiude alle 22:00" / "Chiuso · apre domani alle 07:00" */
export function openStatus(now: Date, openingHours: readonly OpeningHours[], timeZone: string): OpenStatus {
  const { day, minutes } = nowInZone(now, timeZone);
  if (day < 1) return null;

  const today = hoursForDay(openingHours, day);
  const current = today.find((s) => minutes >= toMinutes(s.opens) && minutes < toMinutes(s.closes));
  if (current) return { open: true, label: `Aperto ora · chiude alle ${current.closes}` };

  const laterToday = today.find((s) => minutes < toMinutes(s.opens));
  if (laterToday) return { open: false, label: `Chiuso · apre alle ${laterToday.opens}` };

  for (let offset = 1; offset <= 7; offset++) {
    const d = ((day - 1 + offset) % 7) + 1;
    const [first] = hoursForDay(openingHours, d);
    if (first) {
      const when = offset === 1 ? "domani" : dayName(d);
      return { open: false, label: `Chiuso · apre ${when} alle ${first.opens}` };
    }
  }
  return null;
}

export type ClassLike = { day: number; start: string; end: string };

/** Next class that starts after `now` (Europe/Rome), searching one full week. */
export function nextClass<T extends ClassLike>(now: Date, classes: readonly T[], timeZone: string) {
  const { day, minutes } = nowInZone(now, timeZone);
  let best: { cls: T; minutesUntil: number; dayOffset: number } | null = null;
  for (const cls of classes) {
    let dayOffset = (cls.day - day + 7) % 7;
    if (dayOffset === 0 && toMinutes(cls.start) <= minutes) dayOffset = 7; // already started today -> next week
    const minutesUntil = dayOffset * 1440 + toMinutes(cls.start) - minutes;
    if (!best || minutesUntil < best.minutesUntil) best = { cls, minutesUntil, dayOffset };
  }
  return best;
}

/** "Tra 45 min", "Tra 2 h 15 min", "Domani alle 07:00", "Mercoledì alle 18:30" */
export function formatUntil(minutesUntil: number, dayOffset: number, day: number, start: string) {
  if (dayOffset === 0) {
    if (minutesUntil < 60) return `Tra ${Math.max(1, minutesUntil)} min`;
    const h = Math.floor(minutesUntil / 60);
    const m = minutesUntil % 60;
    return `Tra ${h} h${m ? ` ${m} min` : ""}`;
  }
  if (dayOffset === 1) return `Domani alle ${start}`;
  return `${capitalize(dayName(day))} alle ${start}`;
}

/** Prefilled WhatsApp text for booking a class. */
export function bookingMessage(name: string, day: number, start: string) {
  return `Ciao! Vorrei prenotare ${name} di ${dayName(day)} alle ${start} a IRONFIT.`;
}

/** Calendar date (in timeZone) of the next `day` on or after today. */
export function nextDateForDay(now: Date, day: number, timeZone: string) {
  const z = nowInZone(now, timeZone);
  const offset = (day - z.day + 7) % 7;
  // Date-only arithmetic in UTC is safe: no DST, no local clock.
  const d = new Date(Date.UTC(z.year, z.month - 1, z.date + offset));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, date: d.getUTCDate() };
}

const pad = (n: number) => String(n).padStart(2, "0");
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/**
 * Weekly-recurring .ics event (RRULE FREQ=WEEKLY) in Europe/Rome, with the
 * VTIMEZONE block so every calendar app gets DST right.
 */
export function buildIcs(opts: {
  uid: string;
  name: string;
  day: number;
  start: string;
  end: string;
  location: string;
  description?: string;
  now: Date;
  timeZone?: string;
}) {
  const tz = opts.timeZone ?? "Europe/Rome";
  const { year, month, date } = nextDateForDay(opts.now, opts.day, tz);
  const ymd = `${year}${pad(month)}${pad(date)}`;
  const hm = (t: string) => t.replace(":", "") + "00";
  const s = opts.now;
  const stamp = `${s.getUTCFullYear()}${pad(s.getUTCMonth() + 1)}${pad(s.getUTCDate())}T${pad(s.getUTCHours())}${pad(s.getUTCMinutes())}${pad(s.getUTCSeconds())}Z`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IRONFIT Ribera//Orari corsi//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    `TZID:${tz}`,
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${tz}:${ymd}T${hm(opts.start)}`,
    `DTEND;TZID=${tz}:${ymd}T${hm(opts.end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${ICS_DAYS[opts.day - 1]}`,
    `SUMMARY:${icsText(`${opts.name} · IRONFIT`)}`,
    `LOCATION:${icsText(opts.location)}`,
    ...(opts.description ? [`DESCRIPTION:${icsText(opts.description)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}
