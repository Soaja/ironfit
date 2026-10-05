"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { quiz, services, team, whatsappHref, type QuizIcon } from "@/data/gym";
import { recommend, type QuizAnswers } from "@/lib/recommend";
import { ArrowRight, WhatsAppIcon } from "./Icons";
import QuizIconSvg from "./QuizIcons";

type Key = keyof QuizAnswers;
const KEYS: Key[] = ["goal", "experience", "preference"];
const TOTAL = quiz.questions.length;
const ARROWS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

// LED outline around the panel, drawn in px from the measured size so the
// stroke stays 1.5px. Four strips with gaps at the corners, like the ceiling.
function LedFrame({ progress }: { progress: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const pad = 10;
  const p = (x: number, y: number) => [(-pad + x * (w + 2 * pad)).toFixed(1), (-pad + y * (h + 2 * pad)).toFixed(1)];
  const segments = [
    [p(0.03, 0.012), p(0.965, 0)],
    [p(0.995, 0.03), p(0.985, 0.965)],
    [p(0.96, 1), p(0.035, 0.988)],
    [p(0, 0.955), p(0.01, 0.05)],
  ];

  return (
    <svg ref={ref} className="quiz-led" width={w + 2 * pad} height={h + 2 * pad} viewBox={`${-pad} ${-pad} ${w + 2 * pad} ${h + 2 * pad}`} aria-hidden="true" focusable="false">
      {w > 0 &&
        segments.map(([[x1, y1], [x2, y2]], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            pathLength={1}
            style={{ strokeDashoffset: 1 - Math.min(1, Math.max(0, progress * 4 - i)) }}
          />
        ))}
    </svg>
  );
}

export default function QuizPanel() {
  const [step, setStep] = useState(0); // 0..2 = questions, 3 = result
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [started, setStarted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fromArrow = useRef(false);
  const advanceTimer = useRef(0);
  const firstRender = useRef(true);

  const done = step >= TOTAL;
  const result = done ? recommend(answers as QuizAnswers, { services, team, copy: quiz }) : null;

  // Move focus to the new question / result heading (not on first render).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: false });
  }, [step]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  // Announced on every step change, derived from current state (never stale).
  const live = !started
    ? ""
    : result
      ? `Risultato: ${result.service.name} con ${result.trainer.name}`
      : `Domanda ${step + 1} di ${TOTAL}: ${quiz.questions[step].title}`;

  const goTo = (next: number) => {
    window.clearTimeout(advanceTimer.current);
    setStarted(true);
    setStep(next);
  };

  const choose = (key: Key, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    // Arrow keys only move the selection; mouse/touch/Space choose and advance.
    if (fromArrow.current) {
      fromArrow.current = false;
      return;
    }
    const next = step + 1;
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => goTo(next), 250);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (ARROWS.has(e.key)) fromArrow.current = true;
    if (e.key === "Enter") {
      e.preventDefault();
      if (answers[KEYS[step]]) goTo(step + 1);
    }
  };

  const restart = () => {
    setAnswers({});
    goTo(0);
  };

  const progress = done ? 1 : (step + 1) / TOTAL;

  return (
    <div className="quiz-panel">
      <LedFrame progress={progress} />

      <div className="flex items-center gap-4">
        <span className="font-display text-lg font-bold tabular-nums tracking-[0.06em] text-white/85">
          {String(Math.min(step + 1, TOTAL)).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </span>
        <div className="h-0.5 flex-1 bg-white/10" aria-hidden="true">
          <div className="h-full origin-left bg-iron-red transition-transform duration-500" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {live}
      </p>

      {!done ? (
        <form onSubmit={(e) => e.preventDefault()} className="mt-7">
          {quiz.questions.map((q, qi) =>
            qi === step ? (
              <fieldset key={q.id} onKeyDown={onKeyDown} className="quiz-step">
                <legend className="w-full">
                  <h3 ref={headingRef} tabIndex={-1} className="font-display text-[clamp(30px,4.6vw,44px)] font-extrabold uppercase leading-[0.95] outline-none">
                    {q.title}
                  </h3>
                </legend>
                <p className="sr-only">Usa le frecce per scegliere e Invio per continuare.</p>
                <div className={`mt-6 grid gap-3 ${q.options.length === 4 ? "sm:grid-cols-2" : ""}`}>
                  {q.options.map((o) => (
                    <label key={o.value} className="quiz-option">
                      <input
                        type="radio"
                        name={q.id}
                        value={o.value}
                        checked={answers[KEYS[qi]] === o.value}
                        onChange={() => choose(KEYS[qi], o.value)}
                        className="sr-only"
                      />
                      <QuizIconSvg name={o.icon as QuizIcon} className="h-6 w-6 shrink-0 text-iron-red" />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null,
          )}
          {step > 0 && (
            <button type="button" onClick={() => goTo(step - 1)} className="quiz-back">
              <span aria-hidden="true">←</span> Indietro
            </button>
          )}
        </form>
      ) : (
        result && (
          <div className="quiz-step mt-7">
            <h3 ref={headingRef} tabIndex={-1} className="font-display text-[clamp(30px,4.6vw,48px)] font-extrabold uppercase leading-[0.95] outline-none">
              Il tuo punto di partenza: <span className="text-iron-red">{result.service.name}</span>
            </h3>
            <p className="mt-4 max-w-[58ch] leading-relaxed text-white/80">
              {result.explanation[0]} {result.explanation[1]}
            </p>

            <div className="mt-6 flex items-center gap-4 border border-white/10 bg-white/[0.03] p-3 pr-5">
              <div className="relative h-[100px] w-[80px] shrink-0 overflow-hidden">
                <Image
                  src={result.trainer.portrait.src}
                  alt={`${result.trainer.name}, personal trainer di IRONFIT a Ribera`}
                  fill
                  sizes="160px"
                  // zoom toward the face: the portraits are full-body studio shots
                  className="origin-[50%_14%] scale-[1.9] object-cover"
                  style={{ objectPosition: result.trainer.portrait.focus }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Il tuo trainer</p>
                <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-none">{result.trainer.name}</p>
                <p className="mt-1.5 truncate text-sm text-white/70">{result.trainer.specialty}</p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a href={whatsappHref(result.message)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <WhatsAppIcon className="h-5 w-5" />
                Prenota la prova gratuita su WhatsApp
                <ArrowRight className="btn-arrow h-4 w-4" />
              </a>
              <button type="button" onClick={restart} className="btn btn-ghost">
                Rifai il test
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
