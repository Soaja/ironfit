import QuizPanel from "./QuizPanel";
import SectionReveal from "./SectionReveal";

// "Trova il tuo percorso": 3 questions -> service + trainer -> WhatsApp.
// Nothing leaves the browser except the WhatsApp link the user clicks.
export default function Percorso() {
  return (
    <section id="percorso" aria-labelledby="percorso-title" className="relative overflow-clip bg-iron-black px-[var(--gutter)] py-24 lg:py-32">
      <div className="hero-grain" aria-hidden="true" />
      <header className="relative mx-auto max-w-[760px] text-center">
        <p data-sr="fade" className="mx-auto mb-5 flex w-fit items-center gap-3 text-[12px] font-semibold uppercase leading-none tracking-[0.22em] text-white/70 sm:text-[13px]">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-iron-red" />
          30 secondi
        </p>
        <h2 id="percorso-title" className="font-display text-[clamp(48px,8vw,104px)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em]">
          <span className="sr-line">
            <span className="sr-line-inner">
              Trova il tuo percorso<span className="text-iron-red">.</span>
            </span>
          </span>
        </h2>
        <p data-sr="fade" className="mx-auto mt-6 max-w-[46ch] text-lg leading-relaxed text-white/75">
          Tre domande e ti diciamo da dove partire. Senza impegno.
        </p>
      </header>

      <div className="relative mx-auto mt-12 max-w-[760px] lg:mt-16">
        <QuizPanel />
      </div>

      <SectionReveal target="percorso" />
    </section>
  );
}
