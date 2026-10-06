import { schedule } from "@/data/gym";
import NextClassCard from "./NextClassCard";
import OpeningWeek from "./OpeningWeek";
import OpenStatus from "./OpenStatus";
import SectionReveal from "./SectionReveal";
import Timetable from "./Timetable";

export default function Orari() {
  return (
    <section id="orari" aria-labelledby="orari-title" className="relative overflow-clip bg-[#0d0d0d] py-24 lg:py-32">
      <div className="hero-grain" aria-hidden="true" />

      <header className="relative grid gap-8 px-[var(--gutter)] lg:grid-cols-[minmax(0,1fr)_minmax(0,56ch)] lg:items-end lg:gap-16">
        <div>
          {/* The eyebrow is part of the H2 so the heading itself says "Orari". */}
          <h2 id="orari-title" className="font-display text-[clamp(48px,8vw,112px)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em]">
            <span
              data-sr="fade"
              className="mb-5 flex w-fit items-center gap-3 font-sans text-[12px] font-semibold uppercase leading-none tracking-[0.22em] text-white/70 sm:text-[13px]"
            >
              <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-iron-red" />
              Orari · Palestra a Ribera
            </span>
            <span className="sr-only"> — </span>
            <span className="sr-line">
              <span className="sr-line-inner">Scegli quando.</span>
            </span>{" "}
            <span className="sr-line">
              <span className="sr-line-inner">
                Noi ci siamo<span className="text-iron-red">.</span>
              </span>
            </span>
          </h2>
        </div>
        <div className="lg:pb-2">
          <p data-sr="fade" className="max-w-[56ch] text-lg leading-relaxed text-white/75">
            La sala è aperta tutti i giorni con orario continuato. Consulta i corsi della settimana e prenota il tuo
            posto su WhatsApp.
          </p>
          {schedule.isExample && (
            <p className="mt-4 inline-flex items-center gap-2 border border-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
              Orari indicativi · in aggiornamento
            </p>
          )}
        </div>
      </header>

      <div className="relative mt-12 px-[var(--gutter)]">
        <NextClassCard />
      </div>

      {/* Part 1: orari sala */}
      <div className="relative mt-14 px-[var(--gutter)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="font-display text-2xl font-extrabold uppercase tracking-[0.02em]">Orari sala</h3>
          <OpenStatus asLink={false} />
        </div>
        <div className="mt-5">
          <OpeningWeek />
        </div>
      </div>

      {/* Part 2: calendario corsi */}
      <div className="relative mt-16 px-[var(--gutter)]">
        <h3 className="mb-5 font-display text-2xl font-extrabold uppercase tracking-[0.02em]">Calendario corsi</h3>
        <Timetable />
      </div>

      <SectionReveal target="orari" />
    </section>
  );
}
