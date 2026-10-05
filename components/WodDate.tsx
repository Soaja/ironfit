"use client";

import { useSyncExternalStore } from "react";
import { gym } from "@/data/gym";

const format = () =>
  new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: gym.timeZone }).format(
    new Date(),
  );
const noop = () => () => {};

// Today's date in Italian ("lunedì 5 ottobre"), Europe/Rome. Empty on the
// server (a prerendered date would be stale), filled right after hydration.
export default function WodDate({ className }: { className?: string }) {
  const text = useSyncExternalStore(noop, format, () => "");
  return (
    <span className={className} suppressHydrationWarning>
      {text}
    </span>
  );
}
