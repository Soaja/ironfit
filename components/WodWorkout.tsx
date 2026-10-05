"use client";

import { useEffect, useRef, useState } from "react";
import { gym, type WodLevel } from "@/data/gym";
import { movementLine, WOD_LEVELS, wodShareText } from "@/lib/wod";

// Level toggle + movement list + share. Server-rendered with the Scaled level
// (what crawlers and no-JS visitors see); the toggle only swaps text.
export default function WodWorkout() {
  const [level, setLevel] = useState<WodLevel>("scaled");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const share = async () => {
    const url = `${gym.url}/#functional`;
    const text = wodShareText(gym.wod, level, url);
    try {
      if (navigator.share) {
        await navigator.share({ title: "WOD del giorno — IRONFIT", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setToast("Copiato!");
    } catch (e) {
      if ((e as DOMException)?.name === "AbortError") return; // user closed the share sheet
      setToast("Impossibile condividere");
    }
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  };

  return (
    <div>
      <div role="group" aria-label="Livello" className="wod-levels">
        {WOD_LEVELS.map((l) => (
          <button key={l.id} type="button" aria-pressed={level === l.id} onClick={() => setLevel(l.id)}>
            {l.label}
          </button>
        ))}
      </div>

      <ol key={level} className="wod-list" aria-label={`Esercizi, livello ${WOD_LEVELS.find((l) => l.id === level)!.label}`}>
        {gym.wod.movements.map((mv) => {
          const { main, sub } = movementLine(mv[level], mv.name);
          return (
            <li key={mv.name}>
              <span className="wod-line">{main}</span>
              {sub && <span className="wod-sub">{sub}</span>}
            </li>
          );
        })}
      </ol>

      <div className="relative mt-5 flex items-center">
        <button type="button" onClick={share} className="wod-share">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
          </svg>
          Condividi il WOD
        </button>
        <span role="status" className={`wod-toast ${toast ? "is-visible" : ""}`}>
          {toast}
        </span>
      </div>
    </div>
  );
}
