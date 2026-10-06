"use client";

import { useSyncExternalStore } from "react";
import { gym } from "@/data/gym";
import { nowInZone, type ZonedNow } from "@/lib/schedule";

// Shared minute-resolution clock in the gym's timezone.
// Server / hydration snapshot = null, so server HTML stays neutral and never
// mismatches; the client fills in right after hydration and every minute.
type Clock = { now: Date; z: ZonedNow };

let cache: { minute: number; value: Clock } | null = null;

function getSnapshot(): Clock {
  const minute = Math.floor(Date.now() / 60_000);
  if (!cache || cache.minute !== minute) {
    const now = new Date();
    cache = { minute, value: { now, z: nowInZone(now, gym.timeZone) } };
  }
  return cache.value; // same object within a minute (stable for React)
}

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 15_000); // catches the minute change within 15s
  const onVisible = () => document.visibilityState === "visible" && onChange();
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

export function useGymClock(): Clock | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
