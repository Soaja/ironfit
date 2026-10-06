"use client";

import { useEffect, useRef, useState } from "react";
import { BREATH_PHASES, breathAt, type BreathState } from "@/lib/breath";

const PHASE_MS = 4000;
const CYCLES = 4;

// "Respira con noi": box breathing guided by light. Each side of the square
// (open corners, like the ceiling LED strips) lights up during its phase while
// the core grows on the inhale and shrinks on the exhale. Timestamp-driven.
// Reduced motion: no growth/drawing, only the text guide.
export default function BoxBreathing() {
  const [state, setState] = useState<BreathState | null>(null); // null = not started
  const [announce, setAnnounce] = useState("");
  const start = useRef(0);
  const running = state !== null && !state.done;

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const tick = () => {
      const s = breathAt(performance.now() - start.current, PHASE_MS, CYCLES);
      setState((prev) =>
        prev && !prev.done && !s.done && prev.phase === s.phase && prev.secondsLeft === s.secondsLeft && prev.cycle === s.cycle
          ? prev
          : s,
      );
      if (s.done) setAnnounce("Fatto. Quattro cicli completati.");
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const begin = () => {
    start.current = performance.now();
    setAnnounce("Iniziamo. Segui la luce: quattro secondi per fase.");
    setState(breathAt(0, PHASE_MS, CYCLES));
  };
  const stop = () => {
    setState(null);
    setAnnounce("Esercizio interrotto.");
  };

  const phase = running ? state.phase : -1;
  // core scale: grows on inhale (0), stays (1), shrinks on exhale (2), stays (3)
  const scale = !running ? 0.62 : phase === 0 ? 0.62 + 0.38 * state.progress : phase === 1 ? 1 : phase === 2 ? 1 - 0.38 * state.progress : 0.62;

  // square with open corners (gap at each corner)
  const g = 12;
  const sides: [number, number, number, number][] = [
    [g, 0, 200 - g, 0], // top    · inspira
    [200, g, 200, 200 - g], // right  · trattieni
    [200 - g, 200, g, 200], // bottom · espira
    [0, 200 - g, 0, g], // left   · trattieni
  ];

  return (
    <div className="breath" data-running={running}>
      <div className="breath-stage" aria-hidden="true">
        <svg viewBox="-20 -20 240 240" className="breath-svg">
          {sides.map(([x1, y1, x2, y2], i) => {
            const lit = running ? (i < phase ? 1 : i === phase ? state.progress : 0) : 0;
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} className="breath-track" />
                <line x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} className="breath-lit" style={{ strokeDashoffset: 1 - lit }} />
              </g>
            );
          })}
        </svg>
        <div className="breath-core" style={{ transform: `scale(${scale})` }} />
        <div className="breath-label">
          {running ? (
            <>
              <span className="font-display text-[clamp(34px,6vw,52px)] font-extrabold uppercase leading-none">{state.label}</span>
              <span className="mt-2 font-display text-2xl font-bold tabular-nums text-white/70">{state.secondsLeft}</span>
            </>
          ) : state?.done ? (
            <span className="font-display text-[clamp(30px,5vw,44px)] font-extrabold uppercase leading-none">
              Fatto<span className="text-[var(--accent)]">.</span>
            </span>
          ) : (
            <span className="font-display text-[clamp(26px,4vw,36px)] font-extrabold uppercase leading-none text-white/85">4 · 4 · 4 · 4</span>
          )}
        </div>
      </div>

      <div className="breath-side">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BREATH_PHASES.map((label, i) => (
            <li key={i} className="breath-step" data-active={phase === i}>
              <span className="text-[11px] font-semibold tracking-[0.18em] text-white/50">0{i + 1}</span>
              <span className="mt-1 block font-semibold">{label}</span>
              <span className="text-sm text-white/55">4 secondi</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-white/70">
          {running ? `Ciclo ${state.cycle} di ${CYCLES}` : state?.done ? "Come ti senti? Immagina un'ora intera così." : `${CYCLES} cicli, circa un minuto. Mettiti comodo.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {running ? (
            <button type="button" className="btn btn-ghost" onClick={stop}>
              Interrompi
            </button>
          ) : (
            <button type="button" className="btn btn-accent" onClick={begin}>
              {state?.done ? "Ricomincia" : "Inizia"}
            </button>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </div>
    </div>
  );
}
