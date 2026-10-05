// Framework-free workout timer. Time comes from an injected clock, so it is
// drift-free (everything derives from timestamps, not from counting ticks),
// correct after the tab sleeps in the background, and testable with a fake clock.

export type TimerFormat = "FOR TIME" | "AMRAP" | "EMOM";
export type TimerPhase = "idle" | "countdown" | "running" | "paused" | "finished";
export type TimerEvent = "countdown" | "start" | "pause" | "resume" | "minute" | "finish" | "reset";

export type TimerConfig = {
  format: TimerFormat;
  /** AMRAP/EMOM duration; optional time cap for FOR TIME */
  minutes?: number;
  /** EMOM: number of minutes/rounds (falls back to `minutes`) */
  rounds?: number;
  countdownMs?: number;
};

export type TimerSnapshot = {
  phase: TimerPhase;
  /** work time elapsed (excludes the countdown and pauses) */
  elapsedMs: number;
  /** what the display shows: count-up, remaining, or seconds left in the minute */
  displayMs: number;
  /** remaining countdown before start */
  countdownMs: number;
  /** EMOM current round (1-based) and total */
  round?: number;
  totalRounds?: number;
};

const MINUTE = 60_000;

export function createWorkoutTimer(
  config: TimerConfig,
  now: () => number,
  emit: (event: TimerEvent) => void = () => {},
) {
  const countdownTotal = config.countdownMs ?? 10_000;
  const emomRounds = config.format === "EMOM" ? (config.rounds ?? config.minutes ?? 10) : undefined;
  const limitMs =
    config.format === "EMOM"
      ? emomRounds! * MINUTE
      : config.minutes
        ? config.minutes * MINUTE
        : undefined; // FOR TIME without a cap counts up until paused/reset

  let phase: TimerPhase = "idle";
  let accumulated = 0; // work ms banked before the current run segment
  let segmentStart = 0; // clock time when the current run segment began
  let countdownEnd = 0;
  let lastMinute = 0;

  const elapsedAt = (t: number) => (phase === "running" ? accumulated + (t - segmentStart) : accumulated);

  /** Advance state to the clock's current time; fires events for any transitions. */
  function tick() {
    const t = now();
    if (phase === "countdown" && t >= countdownEnd) {
      phase = "running";
      segmentStart = countdownEnd; // exact start, even if this tick is late
      emit("start");
    }
    if (phase !== "running") return;
    const elapsed = elapsedAt(t);
    if (limitMs !== undefined && elapsed >= limitMs) {
      accumulated = limitMs;
      phase = "finished";
      emit("finish");
      return;
    }
    if (config.format === "EMOM") {
      const minute = Math.floor(elapsed / MINUTE);
      if (minute > lastMinute) {
        lastMinute = minute;
        emit("minute"); // once per boundary crossed (coalesced after a background sleep)
      }
    }
  }

  return {
    start() {
      tick();
      if (phase === "idle") {
        phase = "countdown";
        countdownEnd = now() + countdownTotal;
        emit("countdown");
      } else if (phase === "paused") {
        phase = "running";
        segmentStart = now();
        emit("resume");
      }
    },
    pause() {
      tick();
      if (phase === "running") {
        accumulated = elapsedAt(now());
        phase = "paused";
        emit("pause");
      } else if (phase === "countdown") {
        phase = "idle"; // pausing a countdown just cancels it
        emit("reset");
      }
    },
    reset() {
      phase = "idle";
      accumulated = 0;
      lastMinute = 0;
      emit("reset");
    },
    tick,
    snapshot(): TimerSnapshot {
      tick();
      const t = now();
      const elapsedMs = Math.max(0, elapsedAt(t));
      const countdownMs = phase === "countdown" ? Math.max(0, countdownEnd - t) : 0;
      let displayMs = elapsedMs;
      if (config.format === "AMRAP" && limitMs !== undefined) displayMs = Math.max(0, limitMs - elapsedMs);
      if (config.format === "EMOM") displayMs = phase === "finished" ? 0 : MINUTE - (elapsedMs % MINUTE);
      if (phase === "idle") displayMs = config.format === "FOR TIME" ? 0 : config.format === "AMRAP" ? (limitMs ?? 0) : MINUTE;
      return {
        phase,
        elapsedMs,
        displayMs,
        countdownMs,
        ...(config.format === "EMOM"
          ? { round: Math.min(Math.floor(elapsedMs / MINUTE) + 1, emomRounds!), totalRounds: emomRounds }
          : {}),
      };
    },
  };
}

/** "mm:ss" for the display (minutes may exceed 59). */
export function formatClock(ms: number, roundUp = false) {
  const total = roundUp ? Math.ceil(ms / 1000) : Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
