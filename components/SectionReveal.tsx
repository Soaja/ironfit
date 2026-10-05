"use client";

import { useEffect } from "react";

// Scroll reveal for a section: heading lines rise out of a mask (.sr-line),
// [data-sr="fade"] blocks fade up, panels (.panel) enter with a stagger.
// GSAP is only fetched when the section approaches the viewport, so it costs
// nothing on initial load. Without JS / with reduced motion nothing is hidden.
// It also flags the section with data-near="true" at that moment, so CSS can
// defer below-the-fold assets (e.g. the WOD marker font).
export default function SectionReveal({ target }: { target: string }) {
  useEffect(() => {
    const section = document.getElementById(target);
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cleanup = () => {};
    let cancelled = false;

    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        section.dataset.near = "true";
        if (reduced) return;
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          const lines = section.querySelectorAll(".sr-line-inner");
          const fades = section.querySelectorAll('[data-sr="fade"]');
          const panels = section.querySelectorAll(".panel");
          const header = section.querySelector("header");

          gsap
            .timeline({ scrollTrigger: { trigger: header, start: "top 82%", once: true } })
            .from(fades[0] ?? [], { opacity: 0, y: 12, duration: 0.5, ease: "power3.out" }, 0)
            .from(lines, { yPercent: 110, duration: 0.8, ease: "power4.out", stagger: 0.08 }, 0.05)
            .from(Array.from(fades).slice(1), { opacity: 0, y: 16, duration: 0.6, ease: "power3.out" }, 0.25);

          if (panels.length) {
            gsap.from(panels, {
              opacity: 0,
              y: 48,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.07,
              clearProps: "transform,opacity",
              scrollTrigger: { trigger: section.querySelector(".panels"), start: "top 85%", once: true },
            });
          }

          // Parallax (desktop): [data-speed] elements drift at their own rate
          // across the section's scroll. speed 0.1 = ±10% of the viewport height.
          if (window.matchMedia("(min-width: 1024px)").matches) {
            section.querySelectorAll<HTMLElement>("[data-speed]").forEach((el) => {
              const speed = Number(el.dataset.speed) || 0;
              gsap.fromTo(
                el,
                { y: () => speed * window.innerHeight },
                {
                  y: () => -speed * window.innerHeight,
                  ease: "none",
                  scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
                },
              );
            });
          }
        }, section);
        cleanup = () => ctx.revert();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(section);

    return () => {
      cancelled = true;
      io.disconnect();
      cleanup();
    };
  }, [target]);

  return null;
}
