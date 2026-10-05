// Run: node --test lib/workoutTimer.test.ts   (Node >= 22.6 strips TS types natively)
import assert from "node:assert/strict";
import { test } from "node:test";
import { createWorkoutTimer, formatClock, type TimerEvent } from "./workoutTimer.ts";

// Fake clock: time only moves when the test says so.
function fakeClock() {
  let t = 1_000_000;
  return { now: () => t, advance: (ms: number) => (t += ms) };
}

function setup(config: Parameters<typeof createWorkoutTimer>[0]) {
  const clock = fakeClock();
  const events: TimerEvent[] = [];
  const timer = createWorkoutTimer({ countdownMs: 10_000, ...config }, clock.now, (e) => events.push(e));
  return { clock, events, timer };
}

test("FOR TIME: 10s countdown, then counts up", () => {
  const { clock, events, timer } = setup({ format: "FOR TIME" });
  assert.equal(timer.snapshot().displayMs, 0);
  timer.start();
  assert.equal(timer.snapshot().phase, "countdown");
  clock.advance(3_000);
  assert.equal(timer.snapshot().countdownMs, 7_000);
  clock.advance(7_000);
  assert.equal(timer.snapshot().phase, "running");
  clock.advance(83_000);
  assert.equal(timer.snapshot().displayMs, 83_000);
  assert.equal(formatClock(timer.snapshot().displayMs), "01:23");
  assert.deepEqual(events, ["countdown", "start"]);
});

test("FOR TIME with a time cap finishes at the cap", () => {
  const { clock, events, timer } = setup({ format: "FOR TIME", minutes: 12 });
  timer.start();
  clock.advance(10_000 + 12 * 60_000 + 5_000);
  const s = timer.snapshot();
  assert.equal(s.phase, "finished");
  assert.equal(s.elapsedMs, 12 * 60_000);
  assert.equal(events.at(-1), "finish");
});

test("AMRAP counts down from minutes and finishes at zero", () => {
  const { clock, events, timer } = setup({ format: "AMRAP", minutes: 15 });
  assert.equal(timer.snapshot().displayMs, 15 * 60_000);
  timer.start();
  clock.advance(10_000);
  clock.advance(60_000);
  assert.equal(timer.snapshot().displayMs, 14 * 60_000);
  clock.advance(14 * 60_000);
  assert.equal(timer.snapshot().phase, "finished");
  assert.equal(timer.snapshot().displayMs, 0);
  assert.deepEqual(events, ["countdown", "start", "finish"]);
});

test("EMOM: per-minute countdown, round counter and one beep event per minute", () => {
  const { clock, events, timer } = setup({ format: "EMOM", rounds: 3 });
  timer.start();
  clock.advance(10_000);
  let s = timer.snapshot();
  assert.equal(s.round, 1);
  assert.equal(s.totalRounds, 3);
  assert.equal(s.displayMs, 60_000);
  clock.advance(45_000);
  assert.equal(timer.snapshot().displayMs, 15_000);
  clock.advance(15_000);
  s = timer.snapshot();
  assert.equal(s.round, 2);
  assert.equal(s.displayMs, 60_000);
  clock.advance(60_000);
  assert.equal(timer.snapshot().round, 3);
  clock.advance(60_000);
  assert.equal(timer.snapshot().phase, "finished");
  assert.deepEqual(events, ["countdown", "start", "minute", "minute", "finish"]);
});

test("pause/resume excludes paused time (no drift)", () => {
  const { clock, events, timer } = setup({ format: "FOR TIME" });
  timer.start();
  clock.advance(10_000 + 30_000);
  timer.pause();
  assert.equal(timer.snapshot().phase, "paused");
  clock.advance(5 * 60_000); // long pause
  assert.equal(timer.snapshot().elapsedMs, 30_000);
  timer.start(); // resume
  clock.advance(20_000);
  assert.equal(timer.snapshot().elapsedMs, 50_000);
  assert.deepEqual(events, ["countdown", "start", "pause", "resume"]);
});

test("background tab: no ticks for a long time, state is still exact", () => {
  const { clock, events, timer } = setup({ format: "EMOM", rounds: 10 });
  timer.start();
  clock.advance(10_000 + 3 * 60_000 + 12_000); // no tick() during this time
  const s = timer.snapshot();
  assert.equal(s.round, 4);
  assert.equal(s.displayMs, 48_000);
  assert.deepEqual(events, ["countdown", "start", "minute"]); // coalesced
});

test("start event uses the exact countdown end even if the tick is late", () => {
  const { clock, timer } = setup({ format: "FOR TIME" });
  timer.start();
  clock.advance(10_000 + 2_500); // first tick arrives 2.5s late
  assert.equal(timer.snapshot().elapsedMs, 2_500);
});

test("reset returns to idle and clears time; pause during countdown cancels it", () => {
  const { clock, events, timer } = setup({ format: "AMRAP", minutes: 10 });
  timer.start();
  clock.advance(10_000 + 90_000);
  timer.reset();
  let s = timer.snapshot();
  assert.equal(s.phase, "idle");
  assert.equal(s.elapsedMs, 0);
  assert.equal(s.displayMs, 10 * 60_000);
  timer.start();
  clock.advance(4_000);
  timer.pause();
  s = timer.snapshot();
  assert.equal(s.phase, "idle");
  assert.deepEqual(events.slice(-3), ["reset", "countdown", "reset"]);
});

test("formatClock", () => {
  assert.equal(formatClock(0), "00:00");
  assert.equal(formatClock(59_999), "00:59");
  assert.equal(formatClock(59_001, true), "01:00");
  assert.equal(formatClock(75 * 60_000), "75:00");
});
