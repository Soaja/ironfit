import type { ReactNode } from "react";
import SectionReveal from "../SectionReveal";

// Section with the site's header pattern: eyebrow (accent square) → H2 in
// display type (line reveal) → optional intro. Same look as the homepage.
export default function SubSection({
  id,
  eyebrow,
  title,
  intro,
  aside,
  className = "",
  children,
}: {
  id: string;
  eyebrow: string;
  /** one or two lines; a final "." is rendered in the accent colour */
  title: [string] | [string, string];
  intro?: ReactNode;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const dot = (s: string) =>
    s.endsWith(".") ? (
      <>
        {s.slice(0, -1)}
        <span className="text-[var(--accent)]">.</span>
      </>
    ) : (
      s
    );

  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative overflow-clip py-24 lg:py-32 ${className}`}>
      <div className="hero-grain" aria-hidden="true" />
      <header className="relative mb-12 grid gap-8 px-[var(--gutter)] lg:mb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,52ch)] lg:items-end lg:gap-16">
        <div>
          <p data-sr="fade" className="mb-5 flex w-fit items-center gap-3 text-[12px] font-semibold uppercase leading-none tracking-[0.22em] text-white/70 sm:text-[13px]">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-[var(--accent)]" />
            {eyebrow}
          </p>
          <h2 id={`${id}-title`} className="font-display text-[clamp(44px,7.4vw,104px)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em]">
            {title.map((line, i) => (
              <span key={i}>
                {i > 0 && " "}
                <span className="sr-line">
                  <span className="sr-line-inner">{i === title.length - 1 ? dot(line) : line}</span>
                </span>
              </span>
            ))}
          </h2>
        </div>
        {(intro || aside) && (
          <div className="lg:pb-2">
            {intro && (
              <p data-sr="fade" className="max-w-[52ch] text-lg leading-relaxed text-white/75">
                {intro}
              </p>
            )}
            {aside}
          </div>
        )}
      </header>
      <div className="relative px-[var(--gutter)]">{children}</div>
      <SectionReveal target={id} />
    </section>
  );
}
