import { gym } from "@/data/gym";
import { summarizeHours } from "@/lib/schedule";
import ContactForm from "./ContactForm";
import ContactList from "./ContactList";
import MapFacade from "./MapFacade";
import MapsButtons from "./MapsButtons";
import OpenStatus from "./OpenStatus";
import SectionReveal from "./SectionReveal";

export default function Contatti() {
  return (
    <section id="contatti" aria-labelledby="contatti-title" className="relative overflow-clip bg-iron-black py-24 lg:py-32">
      <div className="hero-grain" aria-hidden="true" />
      <header className="relative mb-12 px-[var(--gutter)] lg:mb-16">
        <p data-sr="fade" className="mb-5 flex w-fit items-center gap-3 text-[12px] font-semibold uppercase leading-none tracking-[0.22em] text-white/70 sm:text-[13px]">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-iron-red" />
          Contatti · Dove siamo
        </p>
        <h2 id="contatti-title" className="font-display text-[clamp(48px,8vw,112px)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em]">
          <span className="sr-line">
            <span className="sr-line-inner">Vieni a trovarci</span>
          </span>{" "}
          <span className="sr-line">
            <span className="sr-line-inner">
              a Ribera<span className="text-iron-red">.</span>
            </span>
          </span>
        </h2>
      </header>

      <div className="relative grid gap-12 px-[var(--gutter)] lg:grid-cols-2 lg:gap-16">
        <div>
          <ContactList />

          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl font-extrabold uppercase tracking-[0.02em]">Orari</h3>
              <OpenStatus asLink={false} />
            </div>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-[15px]">
              {summarizeHours(gym.openingHours).map((g) => (
                <div key={g.days} className="contents">
                  <dt className="text-white/60">{g.days}</dt>
                  <dd className={g.hours === "Chiuso" ? "text-white/40" : "font-semibold tabular-nums"}>{g.hours}</dd>
                </div>
              ))}
            </dl>
            <a href="#orari" className="panel-link mt-2 inline-flex text-sm">
              Corsi e orari completi
            </a>
          </div>

          <div className="mt-8">
            <MapsButtons />
          </div>
        </div>

        <MapFacade />
      </div>

      <div className="relative mt-16 px-[var(--gutter)] lg:mt-20">
        <h3 className="mb-6 font-display text-[clamp(28px,3vw,40px)] font-extrabold uppercase leading-none">Scrivici un messaggio</h3>
        <ContactForm />
      </div>

      <SectionReveal target="contatti" />
    </section>
  );
}
