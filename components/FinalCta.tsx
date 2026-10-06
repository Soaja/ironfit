import { telHref, whatsappHref } from "@/data/gym";
import { PhoneIcon, WhatsAppIcon } from "./Icons";
import { LED_SEGMENTS } from "./LedLines";
import SectionReveal from "./SectionReveal";

type Props = {
  title?: string;
  text?: string;
  whatsappMessage?: string;
  whatsappLabel?: string;
};

// Red closing band. The headline drifts horizontally on scroll (desktop, via
// SectionReveal [data-speed-x]); reduced motion keeps it still. Defaults =
// homepage copy; service pages pass their own.
export default function FinalCta({
  title = "La prima prova è gratis.",
  text = "Vieni a conoscerci, ti mostriamo la palestra e ti alleni con noi. Nessun impegno.",
  whatsappMessage,
  whatsappLabel = "Prenota su WhatsApp",
}: Props) {
  return (
    <section id="prova" aria-labelledby="prova-title" className="final-cta relative overflow-clip bg-iron-red py-20 lg:py-28">
      <svg className="final-cta-led" viewBox="900 60 760 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {LED_SEGMENTS.slice(0, 4).map(([x1, y1, x2, y2]) => (
          <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </svg>
      <div className="hero-grain" aria-hidden="true" />

      <div className="relative px-[var(--gutter)]">
        <h2
          id="prova-title"
          data-speed-x="0.03"
          className="font-display text-[clamp(56px,11.5vw,184px)] font-extrabold uppercase leading-[0.86] tracking-[-0.01em] text-white"
        >
          {title}
        </h2>
        <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-white/90 sm:text-xl">{text}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href={whatsappHref(whatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-black">
            <WhatsAppIcon className="h-5 w-5" />
            {whatsappLabel}
          </a>
          <a href={telHref()} className="btn btn-outline-white">
            <PhoneIcon className="h-5 w-5" />
            Chiamaci
          </a>
        </div>
      </div>
      <SectionReveal target="prova" />
    </section>
  );
}
