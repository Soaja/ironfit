// Box breathing ("respirazione quadrata"): 4 phases of equal length.
// Pure timing so the UI can be driven by timestamps (no drift) and tested.

export const BREATH_PHASES = ["Inspira", "Trattieni", "Espira", "Trattieni"] as const;

export type BreathState =
  | { done: false; phase: number; label: (typeof BREATH_PHASES)[number]; secondsLeft: number; cycle: number; progress: number }
  | { done: true; cycle: number };

/** State `elapsedMs` after start, with `phaseMs` per phase and `cycles` total. */
export function breathAt(elapsedMs: number, phaseMs = 4000, cycles = 4): BreathState {
  const t = Math.max(0, elapsedMs);
  const total = phaseMs * BREATH_PHASES.length * cycles;
  if (t >= total) return { done: true, cycle: cycles };
  const step = Math.floor(t / phaseMs);
  const phase = step % BREATH_PHASES.length;
  const into = t - step * phaseMs;
  return {
    done: false,
    phase,
    label: BREATH_PHASES[phase],
    secondsLeft: Math.ceil((phaseMs - into) / 1000),
    cycle: Math.floor(step / BREATH_PHASES.length) + 1,
    progress: into / phaseMs,
  };
}
