"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createWorkoutTimer, type TimerConfig, type TimerEvent, type TimerSnapshot } from "@/lib/workoutTimer";

type Options = {
  /** beep at start and at each EMOM minute */
  sound: boolean;
  /** called for state changes only (start, pause, finish...), e.g. for aria-live */
  onEvent?: (event: TimerEvent) => void;
};

const BEEPS: Partial<Record<TimerEvent, [freq: number, ms: number]>> = {
  start: [1040, 320],
  minute: [880, 200],
  finish: [660, 600],
};

// React binding for lib/workoutTimer: rAF while visible (re-rendering only when
// the shown second changes), a 1s interval as a background fallback, beeps via
// Web Audio, and a screen Wake Lock while the timer runs.
export function useWorkoutTimer(config: TimerConfig, { sound, onEvent }: Options) {
  const audioRef = useRef<AudioContext | null>(null);

  // The timer reports events on its own EventTarget; an effect listens with the
  // latest `sound` / `onEvent`, so nothing stale is captured at creation time.
  const [{ timer, events }] = useState(() => {
    const events = new EventTarget();
    const timer = createWorkoutTimer(config, () => performance.now(), (e) =>
      events.dispatchEvent(new CustomEvent<TimerEvent>("timer", { detail: e })),
    );
    return { timer, events };
  });
  const [snap, setSnap] = useState<TimerSnapshot>(() => timer.snapshot());

  const beep = useCallback((freq: number, ms: number) => {
    try {
      const ctx = (audioRef.current ??= new AudioContext());
      void ctx.resume();
      if (!freq) return; // unlock only
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + ms / 1000 + 0.02);
    } catch {
      /* audio unavailable: stay silent */
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const event = (e as CustomEvent<TimerEvent>).detail;
      const tone = BEEPS[event];
      if (sound && tone) beep(...tone);
      onEvent?.(event);
    };
    events.addEventListener("timer", handler);
    return () => events.removeEventListener("timer", handler);
  }, [events, sound, onEvent, beep]);

  const active = snap.phase === "countdown" || snap.phase === "running";

  // Render loop: only commit when the visible second or phase changes.
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let last = "";
    const update = () => {
      const s = timer.snapshot();
      const key = `${s.phase}|${Math.floor(s.displayMs / 1000)}|${Math.ceil(s.countdownMs / 1000)}|${s.round}`;
      if (key !== last) {
        last = key;
        setSnap(s);
      }
    };
    const loop = () => {
      update();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    // rAF stops in background tabs; this keeps events (finish, EMOM minute) flowing.
    const interval = window.setInterval(update, 1000);
    const onVisible = () => document.visibilityState === "visible" && update();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [active, timer]);

  // Keep the screen awake while running (silently skipped where unsupported).
  useEffect(() => {
    if (!active) return;
    let lock: WakeLockSentinel | null = null;
    let released = false;
    const acquire = async () => {
      try {
        if (!released && document.visibilityState === "visible" && "wakeLock" in navigator) {
          lock = await navigator.wakeLock.request("screen");
        }
      } catch {
        /* denied or unsupported */
      }
    };
    void acquire();
    const onVisible = () => void acquire(); // the lock is dropped when the tab is hidden
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release().catch(() => {});
    };
  }, [active]);

  const start = useCallback(() => {
    // Unlock audio inside the user gesture so later beeps are allowed.
    if (sound) beep(0, 0);
    timer.start();
    setSnap(timer.snapshot());
  }, [beep, sound, timer]);
  const pause = useCallback(() => {
    timer.pause();
    setSnap(timer.snapshot());
  }, [timer]);
  const reset = useCallback(() => {
    timer.reset();
    setSnap(timer.snapshot());
  }, [timer]);

  /** Call from a click (e.g. the sound toggle) so beeps are allowed later. */
  const unlockAudio = useCallback(() => beep(0, 0), [beep]);

  return { snap, start, pause, reset, unlockAudio };
}
