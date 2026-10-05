import Image from "next/image";
import { functionalPhotos, functionalService, gym, whatsappHref } from "@/data/gym";
import FxSticky from "./FxSticky";
import { WhatsAppIcon } from "./Icons";
import { LED_SEGMENTS } from "./LedLines";
import NearMount from "./NearMount";
import SectionReveal from "./SectionReveal";
import WodCard from "./WodCard";

const [room, mirror, rowers, rings, bikes] = functionalPhotos;

// Desktop collage: varied sizes, slight overlaps, per-image parallax speed
// (data-speed, handled by SectionReveal). `sizes` = rendered width.
const COLLAGE = [
  { photo: room, cls: "fx-tile w-full", ratio: "aspect-[3/2]", sizes: "(min-width: 1024px) 52vw, 100vw", speed: -0.04, led: true },
  { photo: mirror, cls: "fx-tile ml-auto -mt-[16%] w-[46%] z-10", ratio: "aspect-square", sizes: "24vw", speed: 0.1 },
  { photo: rowers, cls: "fx-tile -mt-[12%] w-[80%]", ratio: "aspect-[3/2]", sizes: "42vw", speed: -0.02 },
  { photo: rings, cls: "fx-tile ml-auto -mt-[18%] w-[50%] z-10", ratio: "aspect-[4/5]", sizes: "26vw", speed: 0.12 },
  { photo: bikes, cls: "fx-tile -mt-[10%] ml-[4%] w-[84%]", ratio: "aspect-[3/2]", sizes: "44vw", speed: 0.03 },
];

// The amber LED polygon (from the real ceiling) drawn across a photo corner.
function AmberLed() {
  return (
    <svg className="fx-led" viewBox="900 60 760 250" aria-hidden="true" focusable="false">
      {LED_SEGMENTS.slice(0, 4).map(([x1, y1, x2, y2]) => (
        <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} />
      ))}
    </svg>
  );
}

export default function Functional() {
  const equipment = functionalService.details!.equipment;

  return (
    <section id="functional" aria-labelledby="functional-title" className="fx-section relative overflow-clip">
      <div className="hero-grain" aria-hidden="true" />

      <div className="relative grid gap-14 px-[var(--gutter)] py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:py-32 xl:gap-24">
        <FxSticky>
          <div className="flex flex-col">
            <header className="order-1">
              <h2 id="functional-title" className="font-display text-[clamp(44px,4.4vw,84px)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em]">
                <span
                  data-sr="fade"
                  className="mb-5 flex w-fit items-center gap-3 font-sans text-[12px] font-semibold uppercase leading-none tracking-[0.22em] text-white/70 sm:text-[13px]"
                >
                  <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-iron-amber" />
                  Functional training · Ribera
                </span>
                <span className="sr-only"> — </span>
                <span className="sr-line">
                  <span className="sr-line-inner">Non è una lezione.</span>
                </span>{" "}
                <span className="sr-line">
                  <span className="sr-line-inner">
                    È una sfida<span className="text-iron-red">.</span>
                  </span>
                </span>
              </h2>
              <p data-sr="fade" className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-white/75">
                Allenamenti di gruppo ad alta intensità, guidati da un coach, sempre diversi. Bilancieri Eleiko,
                vogatori Concept2, rig e kettlebell: tutto quello che serve per diventare più forte, più veloce e più
                resistente. Ogni livello è benvenuto: il coach adatta ogni esercizio a te.
              </p>
            </header>

            {/* Mobile/tablet: one large photo right after the intro. */}
            <figure className="order-2 mt-8 lg:hidden">
              <div className="fx-tile relative aspect-[3/2] w-full">
                <NearMount className="absolute inset-0">
                  <Image src={room.src} alt={room.alt} fill sizes="100vw" className="object-cover" />
                </NearMount>
                <AmberLed />
              </div>
            </figure>

            <ul aria-label="Attrezzatura" className="order-4 mt-8 flex flex-wrap gap-2 lg:order-2 lg:mt-7">
              {equipment.map((item) => (
                <li key={item} className="fx-chip">
                  {item}
                </li>
              ))}
            </ul>

            <WodCard className="order-3 mt-8" />

            <div className="order-5 mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 lg:order-4">
              <a href={whatsappHref(gym.functionalMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <WhatsAppIcon className="h-5 w-5" />
                Prova una lezione gratuita
              </a>
              <a href="#orari" className="panel-link">
                Vedi gli orari
                <span aria-hidden="true" className="btn-arrow inline-block">
                  →
                </span>
              </a>
            </div>
          </div>
        </FxSticky>

        {/* Desktop collage */}
        <div className="relative hidden lg:block">
          {COLLAGE.map(({ photo, cls, ratio, sizes, speed, led }) => (
            <figure key={photo.id} data-speed={speed} className={`relative ${cls}`}>
              <div className={`relative ${ratio} overflow-hidden rounded-[2px]`}>
                <NearMount className="absolute inset-0">
                  <Image src={photo.src} alt={photo.alt} fill sizes={sizes} className="object-cover" />
                </NearMount>
              </div>
              {led && <AmberLed />}
            </figure>
          ))}
        </div>
      </div>

      {/* Mobile/tablet: swipe strip with the remaining photos. */}
      <ul aria-label="Foto dell'area functional" className="fx-strip -mt-10 pb-24 lg:hidden">
        {[mirror, rowers, rings, bikes].map((photo) => (
          <li key={photo.id} className="fx-strip-item">
            <div className="fx-tile relative aspect-[4/3] w-full">
              <NearMount className="absolute inset-0">
                <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 640px) 60vw, 80vw" className="object-cover" />
              </NearMount>
            </div>
          </li>
        ))}
      </ul>

      <SectionReveal target="functional" />
    </section>
  );
}
