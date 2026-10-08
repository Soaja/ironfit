// Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { gym, schedule, team } from "../data/gym.ts";
import {
  bookingMessage,
  buildIcs,
  formatUntil,
  hoursForDay,
  nextClass,
  nextDateForDay,
  nowInZone,
  openStatus,
  toMinutes,
} from "./schedule.ts";

const TZ = "Europe/Rome";
// 2026-10-05 is a Monday; Rome is on CEST (UTC+2) until 25 Oct 2026.
const MON_1815 = new Date("2026-10-05T16:15:00Z");
const MON_2230 = new Date("2026-10-05T20:30:00Z");
const SAT_1300 = new Date("2026-10-10T11:00:00Z");
const SUN_1200 = new Date("2026-10-11T10:00:00Z");
// Winter time (CET, UTC+1): Monday 7 Dec 2026, 07:30 in Rome
const MON_WINTER_0730 = new Date("2026-12-07T06:30:00Z");

test("nowInZone follows Europe/Rome, not the machine clock (summer and winter time)", () => {
  assert.deepEqual(nowInZone(MON_1815, TZ), { day: 1, minutes: 18 * 60 + 15, year: 2026, month: 10, date: 5 });
  assert.deepEqual(nowInZone(MON_WINTER_0730, TZ), { day: 1, minutes: 7 * 60 + 30, year: 2026, month: 12, date: 7 });
  assert.equal(nowInZone(SUN_1200, TZ).day, 7);
});

test("openStatus (shared with the hero pill)", () => {
  assert.deepEqual(openStatus(MON_1815, gym.openingHours, TZ), { open: true, label: "Aperto ora · chiude alle 22:00" });
  assert.deepEqual(openStatus(MON_2230, gym.openingHours, TZ), { open: false, label: "Chiuso · apre domani alle 07:00" });
  assert.deepEqual(openStatus(SUN_1200, gym.openingHours, TZ), { open: false, label: "Chiuso · apre domani alle 07:00" });
  const early = new Date("2026-10-06T04:00:00Z"); // Tue 06:00
  assert.deepEqual(openStatus(early, gym.openingHours, TZ), { open: false, label: "Chiuso · apre alle 07:00" });
});

test("hoursForDay", () => {
  assert.deepEqual(hoursForDay(gym.openingHours, 1), [{ opens: "07:00", closes: "22:00" }]);
  assert.deepEqual(hoursForDay(gym.openingHours, 7), []);
});

test("nextClass: later today, tomorrow, after the weekend, and wrap to next week", () => {
  // Mon 18:15: Crosstraining 18:00 already started -> next is 19:00
  let n = nextClass(MON_1815, schedule.classes, TZ)!;
  assert.equal(n.cls.id, "lun-cross-1900");
  assert.equal(n.minutesUntil, 45);
  assert.equal(formatUntil(n.minutesUntil, n.dayOffset, n.cls.day, n.cls.start), "Tra 45 min");

  n = nextClass(MON_2230, schedule.classes, TZ)!;
  assert.equal(n.cls.id, "mar-yogalates");
  assert.equal(formatUntil(n.minutesUntil, n.dayOffset, n.cls.day, n.cls.start), "Domani alle 08:30");

  // Saturday has no classes on the sheet -> Monday 09:30
  n = nextClass(SAT_1300, schedule.classes, TZ)!;
  assert.equal(n.cls.id, "lun-cross-0930");
  assert.equal(n.dayOffset, 2);
  assert.equal(formatUntil(n.minutesUntil, n.dayOffset, n.cls.day, n.cls.start), "Lunedì alle 09:30");

  // only one class, already started today -> same day next week
  const only = [{ id: "x", day: 1, start: "07:00", end: "08:00" }];
  n = nextClass(new Date("2026-10-05T06:00:00Z"), only, TZ)!; // Mon 08:00
  assert.equal(n.dayOffset, 7);
  assert.equal(n.minutesUntil, 7 * 1440 - 60);
  assert.equal(nextClass(MON_1815, [], TZ), null);
});

test("schedule matches the gym sheet: 31 classes, Mon–Fri, nothing on weekends", () => {
  assert.equal(schedule.classes.length, 31);
  assert.ok(schedule.classes.every((c) => c.day >= 1 && c.day <= 5));
  const count = (cat: string) => schedule.classes.filter((c) => c.category === cat).length;
  assert.deepEqual([count("crosstraining"), count("pilates"), count("yogalates"), count("boxe")], [15, 11, 2, 3]);
});

test("formatUntil", () => {
  assert.equal(formatUntil(125, 0, 1, "20:00"), "Tra 2 h 5 min");
  assert.equal(formatUntil(120, 0, 1, "20:00"), "Tra 2 h");
  assert.equal(formatUntil(0, 0, 1, "20:00"), "Tra 1 min");
});

test("bookingMessage", () => {
  assert.equal(bookingMessage("Yoga", 3, "18:00"), "Ciao! Vorrei prenotare Yoga di mercoledì alle 18:00 a IRONFIT.");
});

test("nextDateForDay crosses month/year boundaries", () => {
  assert.deepEqual(nextDateForDay(MON_1815, 1, TZ), { year: 2026, month: 10, date: 5 });
  assert.deepEqual(nextDateForDay(MON_1815, 7, TZ), { year: 2026, month: 10, date: 11 });
  assert.deepEqual(nextDateForDay(new Date("2026-12-30T10:00:00Z"), 1, TZ), { year: 2027, month: 1, date: 4 });
});

test("buildIcs: weekly recurring event in Europe/Rome", () => {
  const ics = buildIcs({
    uid: "lun-fx-pm@ironfitribera.it",
    name: "Functional",
    day: 1,
    start: "18:30",
    end: "19:30",
    location: "IRONFIT, Via Roma 1, Ribera",
    description: "Riga 1\nRiga 2; ok",
    now: MON_1815,
  });
  assert.ok(ics.includes("\r\n") && !/[^\r]\n/.test(ics), "CRLF line endings");
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0"));
  assert.ok(ics.includes("BEGIN:VTIMEZONE\r\nTZID:Europe/Rome"));
  assert.ok(ics.includes("DTSTART;TZID=Europe/Rome:20261005T183000"));
  assert.ok(ics.includes("DTEND;TZID=Europe/Rome:20261005T193000"));
  assert.ok(ics.includes("RRULE:FREQ=WEEKLY;BYDAY=MO"));
  assert.ok(ics.includes("DTSTAMP:20261005T161500Z"));
  assert.ok(ics.includes("LOCATION:IRONFIT\\, Via Roma 1\\, Ribera"), "commas escaped");
  assert.ok(ics.includes("DESCRIPTION:Riga 1\\nRiga 2\\; ok"), "newline and semicolon escaped");
  assert.ok(ics.trimEnd().endsWith("END:VCALENDAR"));
});

test("schedule data is valid", () => {
  const cats = new Set(schedule.categories.map((c) => c.id));
  const coaches = new Set(team.map((t) => t.id));
  const ids = new Set<string>();
  for (const c of schedule.classes) {
    assert.ok(c.day >= 1 && c.day <= 7, `${c.id} day`);
    assert.ok(/^\d\d:\d\d$/.test(c.start) && /^\d\d:\d\d$/.test(c.end), `${c.id} time format`);
    assert.ok(toMinutes(c.end) > toMinutes(c.start), `${c.id} ends after it starts`);
    assert.ok(cats.has(c.category), `${c.id} category`);
    assert.ok(!c.coach || coaches.has(c.coach), `${c.id} coach exists`);
    assert.ok(!ids.has(c.id), `${c.id} unique`);
    ids.add(c.id);
  }
  // same day, same category: no overlaps
  for (const a of schedule.classes)
    for (const b of schedule.classes)
      if (a !== b && a.day === b.day)
        assert.ok(toMinutes(a.end) <= toMinutes(b.start) || toMinutes(b.end) <= toMinutes(a.start), `${a.id} overlaps ${b.id}`);
});

test("summarizeHours groups consecutive days", async () => {
  const { summarizeHours } = await import("./schedule.ts");
  assert.deepEqual(summarizeHours(gym.openingHours), [
    { days: "Lun–Sab", hours: "07:00–22:00" },
    { days: "Dom", hours: "Chiuso" },
  ]);
  assert.deepEqual(
    summarizeHours([
      { days: ["Mo", "We"], opens: "07:00", closes: "13:00" },
      { days: ["Mo", "We"], opens: "15:00", closes: "21:00" },
      { days: ["Tu"], opens: "09:00", closes: "21:00" },
    ]),
    [
      { days: "Lun", hours: "07:00–13:00, 15:00–21:00" },
      { days: "Mar", hours: "09:00–21:00" },
      { days: "Mer", hours: "07:00–13:00, 15:00–21:00" },
      { days: "Gio–Dom", hours: "Chiuso" },
    ],
  );
});
