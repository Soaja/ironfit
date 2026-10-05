import SectionReveal from "./SectionReveal";
import ServicePanels from "./ServicePanels";

export default function Services() {
  return (
    <section id="servizi" aria-labelledby="servizi-title" className="relative overflow-hidden bg-iron-black py-24 lg:py-32">
      <div className="hero-grain" aria-hidden="true" />

      <header className="relative mb-12 grid gap-8 px-[var(--gutter)] lg:mb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,56ch)] lg:items-end lg:gap-16">
        <div>
          <p
            data-sr="fade"
            className="mb-5 flex items-center gap-3 text-[12px] font-semibold uppercase leading-none tracking-[0.22em] text-white/70 sm:text-[13px]"
          >
            <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-iron-red" />
            Servizi · Palestra a Ribera
          </p>
          <h2
            id="servizi-title"
            className="font-display text-[clamp(48px,8vw,112px)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em]"
          >
            <span className="sr-line">
              <span className="sr-line-inner">Un posto.</span>
            </span>{" "}
            <span className="sr-line">
              <span className="sr-line-inner">
                Ogni obiettivo<span className="text-iron-red">.</span>
              </span>
            </span>
          </h2>
        </div>
        <p data-sr="fade" className="max-w-[56ch] text-lg leading-relaxed text-white/75 lg:pb-2">
          Che tu voglia diventare più forte, perdere peso o semplicemente stare meglio, a IRONFIT
          trovi gli strumenti e le persone giuste.
        </p>
      </header>

      <div className="relative">
        <ServicePanels />
      </div>

      <SectionReveal target="servizi" />
    </section>
  );
}
