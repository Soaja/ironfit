import Image from "next/image";
import heroImage from "@/public/images/hero/hero-2560.jpg";
import { gym, trialHref, whatsappHref } from "@/data/gym";
import HeroIntro from "./HeroIntro";
import { ArrowRight, WhatsAppIcon } from "./Icons";
import LedLines from "./LedLines";
import Marquee from "./Marquee";
import OpenStatus from "./OpenStatus";

export default function Hero() {
  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      {/* Photo + LED overlay share one 4:3 stage so they always crop identically. */}
      <div className="hero-media">
        <div className="hero-stage" data-hero-stage>
          <Image
            src={heroImage}
            alt={gym.images.heroAlt}
            fill
            preload
            fetchPriority="high"
            quality={80}
            placeholder="blur"
            // Desktop: rendered stage width (cover × --zoom from globals.css).
            // Portrait phones: the stage is ~134vh wide but only ~37% of it is
            // visible, under overlays; 80vh caps the download (LCP) while
            // still giving ~1.8 px per CSS px on DPR-3 phones.
            sizes="(min-width: 1024px) and (max-aspect-ratio: 4/3) 174vh, (min-width: 1024px) 130vw, (max-aspect-ratio: 4/3) 80vh, 100vw"
            className="hero-img"
          />
          <LedLines />
        </div>
      </div>

      <div className="hero-dim" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />

      <div className="relative z-10 flex h-full items-end justify-between gap-10 px-[var(--gutter)] pb-[calc(var(--marquee-h)+clamp(28px,4.5svh,44px))] pt-[calc(var(--header-h)+16px)] lg:pb-[calc(var(--marquee-h)+clamp(40px,6svh,64px))]">
        <div className="max-w-[760px]">
          <h1 id="hero-title" className="hero-title">
            <span
              data-reveal="eyebrow"
              className="mb-4 flex w-fit items-center gap-3 font-sans text-[12px] font-semibold uppercase leading-none tracking-[0.22em] text-white/75 [text-shadow:0_1px_10px_rgb(10_10_10/0.6)] sm:text-[13px] lg:mb-6"
            >
              <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-iron-red" />
              Palestra a Ribera · Agrigento
            </span>
            <span className="sr-only"> — </span>
            <span className="hero-line">
              <span className="hero-line-inner">Allenati</span>
            </span>{" "}
            <span className="hero-line">
              <span className="hero-line-inner">
                sul serio<span className="text-iron-red">.</span>
              </span>
            </span>
          </h1>

          <p
            data-reveal="sub"
            className="mt-5 max-w-[46ch] text-lg leading-relaxed text-white/80 sm:text-xl lg:mt-7"
          >
            Macchinari Panatta, area functional e trainer che ti seguono davvero. Dal primo
            allenamento al tuo record.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:mt-9">
            <a href={trialHref} data-reveal="cta" className="btn btn-primary">
              Prenota la prova gratuita
              <ArrowRight className="btn-arrow h-5 w-5" />
            </a>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              data-reveal="cta"
              className="btn btn-ghost"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Scrivici su WhatsApp
            </a>
          </div>

          <div data-reveal="pill" className="mt-6 lg:mt-7">
            <OpenStatus />
          </div>
        </div>

        {/* Desktop social proof. Values come from gym.ts — never invented. */}
        <div
          data-reveal="proof"
          className="relative hidden shrink-0 border border-white/10 bg-iron-black/50 py-3.5 pl-5 pr-6 backdrop-blur-md lg:block"
        >
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-iron-red" />
          <p className="text-[15px] font-semibold leading-tight text-white">
            <span aria-hidden="true" className="mr-1.5 text-iron-red">★</span>
            {gym.reviews.rating} su Google
          </p>
          <p className="mt-1 text-sm leading-tight text-white/70">{gym.reviews.count} recensioni</p>
        </div>
      </div>

      <Marquee className="absolute inset-x-0 bottom-0 z-10" />

      <HeroIntro />
    </section>
  );
}
