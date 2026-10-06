"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { nutritionPage, whatsappHref } from "@/data/gym";
import { WhatsAppIcon } from "../Icons";

const GOALS = nutritionPage.goals;

// Goal picker (tabs pattern). Every panel is in the server HTML; tabs only
// toggle `hidden`. The WhatsApp CTA carries the chosen goal.
export default function NutritionGoals() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent) => {
    const next = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: GOALS.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const i = (next + GOALS.length) % GOALS.length;
    setActive(i);
    tabs.current[i]?.focus();
  };

  return (
    <div className="goals">
      <div role="tablist" aria-label="Obiettivo" className="goals-tabs" onKeyDown={onKey}>
        {GOALS.map((g, i) => (
          <button
            key={g.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`goal-tab-${g.id}`}
            aria-selected={i === active}
            aria-controls={`goal-panel-${g.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className="goals-tab"
          >
            <span className="text-[11px] font-semibold tracking-[0.18em] text-white/45">0{i + 1}</span>
            <span className="block font-display text-[clamp(22px,2.4vw,30px)] font-extrabold uppercase leading-none">{g.label}</span>
          </button>
        ))}
      </div>

      {GOALS.map((g, i) => (
        <div
          key={g.id}
          role="tabpanel"
          id={`goal-panel-${g.id}`}
          aria-labelledby={`goal-tab-${g.id}`}
          hidden={i !== active}
          tabIndex={0}
          className="goals-panel"
        >
          <div>
            <h3 className="font-display text-[clamp(34px,4.6vw,64px)] font-extrabold uppercase leading-[0.92]">
              {g.title.replace(/\.$/, "")}
              <span className="text-[var(--accent)]">.</span>
            </h3>
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-white/75">{g.text}</p>
            <a
              href={whatsappHref(`Ciao! Vorrei una consulenza nutrizionale a IRONFIT. Il mio obiettivo: ${g.label.toLowerCase()}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary mt-8"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Parliamone su WhatsApp
            </a>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">Su cosa lavoriamo</p>
            <ul className="mt-4 grid gap-3">
              {g.focus.map((f, n) => (
                <li key={f} className="goals-focus">
                  <span className="goals-focus-n" aria-hidden="true">
                    {n + 1}
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
