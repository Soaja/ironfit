"use client";

import { useEffect } from "react";

// Scroll reveal for a section: heading lines rise out of a mask (.sr-line),
// [data-sr="fade"] blocks fade up, panels (.panel) enter with a stagger.
// GSAP is only fetched when the section approaches the viewport, so it costs
// nothing on initial load. Without JS / with reduced motion nothing is hidden.
export default function SectionReveal({ target }: { target: string }) {
  useEffect(() => {
    const section = document.getElementById(target);
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup = () => {};
    let cancelled = false;

    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
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

          gsap.from(panels, {
            opacity: 0,
            y: 48,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.07,
            clearProps: "transform,opacity",
            scrollTrigger: { trigger: section.querySelector(".panels"), start: "top 85%", once: true },
          });
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
