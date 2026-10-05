import Image from "next/image";
import { isPlaceholder, team, trainerWhatsappHref, type Trainer } from "@/data/gym";
import FlipCard from "./FlipCard";
import { InstagramIcon } from "./Icons";
import { LED_SEGMENTS } from "./LedLines";
import SectionReveal from "./SectionReveal";
import SnapCarousel from "./SnapCarousel";

// Images here are plain lazy server images: this section sits >5000px down on
// phones, beyond Chrome's lazy-load distance, so nothing loads early and there
// is no client wrapper to hydrate.
// Card image widths: 5 per row ≥1280 (~18vw), 3 per row ≥1024 (~30vw), 78vw cards below.
const CARD_SIZES = "(min-width: 1280px) 18vw, (min-width: 1024px) 30vw, 78vw";

function alt(t: Trainer) {
  return `${t.name}, personal trainer di IRONFIT a Ribera`;
}

function Front({ t }: { t: Trainer }) {
  return (
    <>
      <Image src={t.portrait.src} alt={alt(t)} fill sizes={CARD_SIZES} className="tcard-img object-cover" style={{ objectPosition: t.portrait.focus }} />
      <div className="tcard-shade" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-display text-[28px] font-extrabold uppercase leading-none tracking-[0.01em]">{t.name}</h3>
        <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white/85">
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-iron-red" />
          {t.role}
        </p>
        <p className="mt-1 truncate text-sm text-white/60">{t.specialty}</p>
      </div>
      <span className="tcard-line" aria-hidden="true" />
    </>
  );
}

function Back({ t }: { t: Trainer }) {
  return (
    <>
      {t.actionPhoto ? (
        <>
          <Image
            src={t.actionPhoto.src}
            alt=""
            fill
            sizes={CARD_SIZES}
            className="object-cover brightness-[0.35]"
            style={{ objectPosition: t.actionPhoto.focus }}
          />
          <div className="tcard-shade" aria-hidden="true" />
        </>
      ) : (
        <svg className="tcard-led" viewBox="900 60 760 250" aria-hidden="true" focusable="false">
          {LED_SEGMENTS.slice(0, 4).map(([x1, y1, x2, y2]) => (
            <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </svg>
      )}
      <div className="relative flex h-full flex-col justify-end gap-4 p-5">
        <p className="font-display text-lg font-extrabold uppercase leading-none tracking-[0.02em] text-white/90">{t.name}</p>
        <p className="text-sm leading-relaxed text-white/85">{t.bio}</p>
        <ul aria-label="Certificazioni" className="flex flex-wrap gap-1.5">
          {t.certifications.map((c) => (
            <li key={c} className="border border-white/25 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/85">
              {c}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a href={trainerWhatsappHref(t)} target="_blank" rel="noopener noreferrer" className="btn btn-primary tcard-link min-h-11 flex-1 px-3 text-sm">
            Allenati con {t.name}
          </a>
          {t.instagram && !isPlaceholder(t.instagram) && (
            <a href={t.instagram} target="_blank" rel="noopener noreferrer" aria-label={`Instagram di ${t.name}`} className="tcard-link btn btn-ghost min-h-11 w-11 px-0">
              <InstagramIcon className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </>
  );
}

export default function Team() {
  return (
    <section id="team" aria-labelledby="team-title" className="relative overflow-clip bg-iron-black py-24 lg:py-32">
      <div className="hero-grain" aria-hidden="true" />

      <header className="relative mb-12 grid gap-8 px-[var(--gutter)] lg:mb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,56ch)] lg:items-end lg:gap-16">
        <div>
          <p data-sr="fade" className="mb-5 flex w-fit items-center gap-3 text-[12px] font-semibold uppercase leading-none tracking-[0.22em] text-white/70 sm:text-[13px]">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-iron-red" />
            Il team · Personal trainer a Ribera
          </p>
          <h2 id="team-title" className="font-display text-[clamp(48px,8vw,112px)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em]">
            <span className="sr-line">
              <span className="sr-line-inner">Persone, prima</span>
            </span>{" "}
            <span className="sr-line">
              <span className="sr-line-inner">
                che trainer<span className="text-iron-red">.</span>
              </span>
            </span>
          </h2>
        </div>
        <p data-sr="fade" className="max-w-[56ch] text-lg leading-relaxed text-white/75 lg:pb-2">
          Ti conoscono per nome, correggono ogni ripetizione e non ti lasciano mollare. Il nostro team è il motivo per
          cui la gente resta.
        </p>
      </header>

      <figure className="team-banner relative mx-[var(--gutter)] aspect-[4/3] overflow-hidden rounded-[2px] lg:aspect-[21/9]">
        <div data-speed="0.04" className="absolute inset-x-0 -bottom-[8%] -top-[8%]">
          <Image
            src="/images/team/group.jpg"
            alt="Il team di personal trainer di IRONFIT a Ribera, in posa nella sala con le magliette IRONFIT"
            fill
            sizes="100vw"
            className="team-banner-img object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-iron-black/85 via-iron-black/10 to-transparent" aria-hidden="true" />
        <figcaption className="absolute bottom-0 left-0 flex items-center gap-3 p-5 font-display text-lg font-bold uppercase tracking-[0.12em] text-white/90 lg:p-8 lg:text-xl">
          <span aria-hidden="true" className="h-2 w-2 bg-iron-red" />
          Il team IRONFIT
        </figcaption>
      </figure>

      <div className="relative mt-10 lg:mt-14">
        <SnapCarousel label="Personal trainer" count={team.length} className="tcards">
          {team.map((t) => (
            <FlipCard key={t.id} label={`${t.name}: bio e contatti`} front={<Front t={t} />} back={<Back t={t} />} />
          ))}
        </SnapCarousel>
      </div>

      <SectionReveal target="team" />
    </section>
  );
}
