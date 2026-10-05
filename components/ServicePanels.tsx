"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { services } from "@/data/gym";
import { ArrowRight } from "./Icons";
import ServiceTypeArt from "./ServiceTypeArt";

// ≥1024px: expanding panels (hover, focus or click). Below: scroll-snap carousel
// with every card fully visible. Same DOM for both, so each service has exactly
// one <article>/<h3> and all copy is always in the HTML.
const DESKTOP = "(min-width: 1024px)";

const subscribeDesktop = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const noopSubscribe = () => () => {};

export default function ServicePanels() {
  const [active, setActive] = useState(0);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(1 / services.length);
  // Server snapshot = false: SSR and hydration render the same markup.
  const isDesktop = useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP).matches, () => false);
  const armed = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const scroller = useRef<HTMLUListElement>(null);
  // Panel photos mount only when the row is ~600px from the viewport. Native
  // lazy-loading starts ~1250px out, which on phones means during the initial
  // load, competing with the hero (LCP). No-JS clients get the <noscript> copy.
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Carousel position -> progress bar + "01 / 06".
  useEffect(() => {
    const el = scroller.current;
    if (!el || isDesktop) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = el.scrollWidth - el.clientWidth;
      const ratio = max > 0 ? el.scrollLeft / max : 0;
      const card = el.firstElementChild as HTMLElement | null;
      const step = card ? card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0") : 1;
      setCurrent(Math.min(services.length - 1, Math.round(el.scrollLeft / step)));
      setProgress(1 / services.length + ratio * (1 - 1 / services.length));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [isDesktop]);

  return (
    <div className="services-panels" data-armed={armed}>
      <ul ref={scroller} className="panels">
        {services.map((s, i) => {
          const isActive = isDesktop ? i === active : true;
          const lit = isDesktop ? i === active : i === current;
          const titleId = `servizio-${s.id}`;
          const bodyId = `servizio-${s.id}-testo`;
          return (
            <li
              key={s.id}
              className="panel"
              data-active={isDesktop ? i === active : i === 0 && !armed}
              data-lit={lit}
              style={{ "--i": i } as CSSProperties}
              onPointerEnter={(e) => {
                if (isDesktop && e.pointerType === "mouse") setActive(i);
              }}
            >
              <article aria-labelledby={titleId} className="panel-card">
                <div className="panel-media">
                  {s.kind === "photo" && !near && (
                    <noscript>
                      {/* eslint-disable-next-line @next/next/no-img-element -- no-JS fallback only */}
                      <img src={s.image.src} alt={s.image.alt} className="panel-img absolute inset-0 h-full w-full" />
                    </noscript>
                  )}
                  {s.kind === "photo" ? (
                    near && <Image
                      src={s.image.src}
                      alt={s.image.alt}
                      fill
                      quality={80}
                      // Rendered (cover) width: landscape photos are height-bound in
                      // both the 620px panel (~930px) and the 480px card (~720px);
                      // portrait ones follow the box width (~46vw / 85vw).
                      sizes={
                        s.image.portrait
                          ? "(min-width: 1024px) 46vw, 85vw"
                          : "(min-width: 1024px) 940px, 720px"
                      }
                      className="panel-img"
                    />
                  ) : (
                    <ServiceTypeArt name={s.name} tint={s.tint} />
                  )}
                </div>
                <div className="panel-shade" aria-hidden="true" />

                <span className="panel-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="panel-vtitle" aria-hidden="true">
                  {s.name}
                </span>

                <div className="panel-content">
                  <h3 id={titleId} className="panel-title">
                    <button
                      type="button"
                      className="panel-trigger"
                      aria-expanded={isActive}
                      aria-controls={bodyId}
                      onFocus={() => isDesktop && setActive(i)}
                      onClick={() => isDesktop && setActive(i)}
                    >
                      {s.name}
                    </button>
                  </h3>
                  <div id={bodyId} className="panel-body" inert={isDesktop && !isActive}>
                    <p className="max-w-[44ch] text-[15px] leading-relaxed text-white/80 lg:text-base">
                      {s.description}
                    </p>
                    <a
                      href={s.cta.href}
                      {...(s.cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="panel-link"
                    >
                      {s.cta.label}
                      <ArrowRight className="btn-arrow h-4 w-4" />
                    </a>
                  </div>
                </div>
                <span className="panel-line" aria-hidden="true" />
              </article>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-center gap-5 px-[var(--gutter)] lg:hidden" aria-hidden="true">
        <div className="h-0.5 flex-1 bg-white/10">
          <div
            className="h-full origin-left bg-iron-red transition-transform duration-150"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
        <span className="font-display text-lg font-bold tracking-[0.06em] text-white/80 tabular-nums">
          {String(current + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
