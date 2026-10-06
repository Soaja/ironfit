import type { ReactNode } from "react";
import { WhatsAppIcon } from "../Icons";
import { LED_SEGMENTS } from "../LedLines";

type Props = {
  /** giant outlined background word */
  word: string;
  /** eyebrow, part of the H1 (keyword for SEO, e.g. "Yoga a Ribera") */
  eyebrow: string;
  lines: [string, string];
  text: string;
  whatsapp: { href: string; label: string };
  secondary: { href: string; label: string };
  children?: ReactNode;
};

// Hero for service pages: no photo — type, light and the ceiling LED polygon,
// which "breathes" (slow opacity/scale) in the page's accent colour.
export default function SubHero({ word, eyebrow, lines, text, whatsapp, secondary, children }: Props) {
  return (
    <section id="hero" aria-labelledby="sub-title" className="sub-hero relative overflow-clip">
      <div className="sub-hero-glow" aria-hidden="true" />
      {/* size from word length: the outline spans ~75vw whatever the word */}
      <span className="sub-hero-word" aria-hidden="true" style={{ fontSize: `clamp(120px, ${(75 / (word.length * 0.55)).toFixed(1)}vw, 560px)` }}>
        {word}
      </span>
      <svg className="sub-hero-led" viewBox="900 60 760 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {LED_SEGMENTS.slice(0, 4).map(([x1, y1, x2, y2]) => (
          <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} />
        ))}
      </svg>
      <div className="hero-grain" aria-hidden="true" />

      <div className="relative flex min-h-[inherit] flex-col justify-end px-[var(--gutter)] pb-[clamp(56px,9svh,110px)] pt-[calc(var(--header-h)+48px)]">
        <h1 id="sub-title" className="hero-title max-w-[14ch]">
          <span className="mb-5 flex w-fit items-center gap-3 font-sans text-[12px] font-semibold uppercase leading-none tracking-[0.22em] text-white/75 sm:text-[13px]">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-[var(--accent)]" />
            {eyebrow}
          </span>
          <span className="sr-only"> — </span>
          <span className="sub-line">{lines[0]}</span>{" "}
          <span className="sub-line">
            {lines[1].replace(/\.$/, "")}
            {lines[1].endsWith(".") && <span className="text-[var(--accent)]">.</span>}
          </span>
        </h1>
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-white/80 sm:text-xl">{text}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href={whatsapp.href} target="_blank" rel="noopener noreferrer" data-reveal="cta" className="btn btn-primary">
            <WhatsAppIcon className="h-5 w-5" />
            {whatsapp.label}
          </a>
          <a href={secondary.href} data-reveal="cta" className="btn btn-ghost">
            {secondary.label}
          </a>
        </div>
        {children}
      </div>
    </section>
  );
}
