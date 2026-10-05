"use client";

import { useState } from "react";
import { gym } from "@/data/gym";
import { useWorkoutTimer } from "@/hooks/useWorkoutTimer";
import { formatClock, type TimerEvent } from "@/lib/workoutTimer";
import SevenSegment from "./SevenSegment";

const ANNOUNCE: Partial<Record<TimerEvent, string>> = {
  countdown: "Conto alla rovescia: si parte tra 10 secondi",
  start: "Via! Timer avviato",
  pause: "Timer in pausa",
  resume: "Timer ripreso",
  finish: "Tempo! Allenamento finito",
  reset: "Timer azzerato",
};

const MODE_LABEL = { "FOR TIME": "For time · conta in avanti", AMRAP: "AMRAP · conto alla rovescia", EMOM: "EMOM · ogni minuto" };

export default function WodTimer() {
  const { format, minutes, rounds } = gym.wod;
  const [sound, setSound] = useState(false);
  const [message, setMessage] = useState("");
  const { snap, start, pause, reset, unlockAudio } = useWorkoutTimer(
    { format, minutes, rounds: format === "EMOM" ? rounds : undefined },
    { sound, onEvent: (e) => ANNOUNCE[e] && setMessage(ANNOUNCE[e]!) },
  );

  const counting = snap.phase === "countdown";
  const running = snap.phase === "running";
  const shown = counting ? formatClock(snap.countdownMs, true) : formatClock(snap.displayMs, format !== "FOR TIME");

  const status = {
    idle: "Pronto",
    countdown: `Si parte tra ${Math.ceil(snap.countdownMs / 1000)}`,
    running: "In corso",
    paused: "In pausa",
    finished: "Finito!",
  }[snap.phase];

  return (
    <div className="wod-timer" data-phase={snap.phase}>
      <div className="flex items-end justify-between gap-4">
        <div role="timer" aria-label={`Timer ${shown}`} className={`seven-seg-wrap ${counting ? "is-countdown" : ""}`}>
          <SevenSegment value={shown} blinkColon={running} />
        </div>
        <div className="pb-1 text-right">
          <p className="font-display text-sm font-bold uppercase tracking-[0.12em] text-white/85">{status}</p>
          <p className="mt-0.5 text-xs text-white/50">
            {snap.round ? `Round ${snap.round}/${snap.totalRounds}` : MODE_LABEL[format]}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* One toggle (Start → Pausa → Riprendi) so keyboard focus never jumps. */}
        <button
          type="button"
          className={`btn wod-btn min-w-[7.5rem] ${running || counting ? "btn-ghost" : "btn-primary"}`}
          onClick={running || counting ? pause : start}
          disabled={snap.phase === "finished"}
        >
          {running || counting ? "Pausa" : snap.phase === "paused" ? "Riprendi" : "Start"}
        </button>
        <button type="button" className="btn btn-ghost wod-btn" onClick={reset} disabled={snap.phase === "idle"}>
          Reset
        </button>
        <button
          type="button"
          className="btn btn-ghost wod-btn ml-auto !px-3 sm:!px-[1.1rem]"
          aria-pressed={sound}
          aria-label="Suono"
          onClick={() => {
            if (!sound) unlockAudio();
            setSound(!sound);
          }}
          title={sound ? "Disattiva il suono" : "Attiva il suono"}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 9h4l5-4v14l-5-4H4z" strokeLinejoin="round" />
            {sound ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" /> : <path d="m17 9 5 6m0-6-5 6" strokeLinecap="round" />}
          </svg>
          <span className="hidden sm:inline">Suono</span>
        </button>
      </div>

      {/* State changes only (not every second). */}
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
