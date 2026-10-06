import { contact, isPlaceholder } from "@/data/gym";
import GalleryGrid from "./GalleryGrid";
import { InstagramIcon } from "./Icons";
import SectionReveal from "./SectionReveal";

export default function Galleria() {
  const ig = contact.instagram;
  return (
    <section id="galleria" aria-labelledby="galleria-title" className="relative overflow-clip bg-iron-black py-24 lg:py-32">
      <div className="hero-grain" aria-hidden="true" />
      <header className="relative mb-10 px-[var(--gutter)] lg:mb-12">
        <p data-sr="fade" className="mb-5 flex w-fit items-center gap-3 text-[12px] font-semibold uppercase leading-none tracking-[0.22em] text-white/70 sm:text-[13px]">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-iron-red" />
          Galleria · IRONFIT Ribera
        </p>
        <h2 id="galleria-title" className="font-display text-[clamp(48px,8vw,112px)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em]">
          <span className="sr-line">
            <span className="sr-line-inner">Entra, dai</span>
          </span>{" "}
          <span className="sr-line">
            <span className="sr-line-inner">
              un&apos;occhiata<span className="text-iron-red">.</span>
            </span>
          </span>
        </h2>
      </header>

      <div className="relative px-[var(--gutter)]">
        <GalleryGrid />
        <a
          href={ig}
          {...(isPlaceholder(ig) ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          className="panel-link mt-10 inline-flex"
        >
          <InstagramIcon className="h-5 w-5 text-iron-red" />
          Seguici su Instagram per vedere di più
        </a>
      </div>

      <SectionReveal target="galleria" />
    </section>
  );
}
