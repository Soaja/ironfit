"use client";

import { useEffect } from "react";

// "Accendi le luci": the ceiling LEDs draw on, flicker like fluorescent tubes,
// the room brightens, then the copy enters. Total ≤ 2.2s.
// The start state comes from CSS (html[data-intro="full"]), set before first
// paint by the inline script in app/layout.tsx, so nothing flashes.
// This component only ever touches opacity / transform / filter.

const DESKTOP_PARALLAX = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

function imageReady(img: HTMLImageElement | null, timeoutMs: number) {
  if (!img) return Promise.resolve();
  const loaded = img.complete ? Promise.resolve() : new Promise((r) => img.addEventListener("load", r, { once: true }));
  const decoded = loaded.then(() => img.decode().catch(() => undefined));
  return Promise.race([decoded, new Promise((r) => setTimeout(r, timeoutMs))]);
}

export default function HeroIntro() {
  // LED stroke widths are in SVG user units: publish units-per-CSS-px so the
  // core is exactly 1.5px and the bloom 6px at any stage size.
  useEffect(() => {
    const stage = document.querySelector<HTMLElement>("#hero [data-hero-stage]");
    if (!stage) return;
    const ro = new ResizeObserver(() => {
      if (stage.offsetWidth) stage.style.setProperty("--led-k", String(2560 / stage.offsetWidth));
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const hero = document.getElementById("hero");
    if (!hero) return;

    const playIntro = root.dataset.intro === "full";
    const parallax = window.matchMedia(DESKTOP_PARALLAX).matches;
    if (!playIntro && !parallax) return;

    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      // ScrollTrigger is only fetched where the parallax runs (desktop).
      const [{ gsap }, scrollTrigger] = await Promise.all([
        import("gsap"),
        parallax ? import("gsap/ScrollTrigger") : null,
      ]);
      if (cancelled) return;
      if (scrollTrigger) gsap.registerPlugin(scrollTrigger.ScrollTrigger);

      const q = <T extends Element = HTMLElement>(sel: string) => Array.from(hero.querySelectorAll<T>(sel));
      const stage = hero.querySelector<HTMLElement>("[data-hero-stage]");
      const img = hero.querySelector<HTMLImageElement>(".hero-img");
      const ctx = gsap.context(() => {});
      cleanup = () => ctx.revert();

      if (scrollTrigger && stage) {
        ctx.add(() => {
          gsap.fromTo(
            stage,
            { yPercent: 0, scale: 1.06 },
            {
              yPercent: 12,
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
            },
          );
        });
      }

      // The image must be on screen before the lights come on.
      if (playIntro) await imageReady(img, 1200);
      // The safety timeout in layout.tsx may have already revealed everything.
      if (cancelled || !playIntro || root.dataset.intro !== "full") return;

      ctx.add(() => {
        const lines = q<SVGLineElement>(".led-line");
        const group = hero.querySelector(".led-group");
        const bloom = hero.querySelector(".led-bloom-group");
        const dim = hero.querySelector(".hero-dim");
        const reveal = (name: string) => q(`[data-reveal="${name}"]`);

        // Take over the CSS start state with inline values, then release the CSS.
        gsap.set(lines, { strokeDashoffset: 1 });
        gsap.set(group, { opacity: 1 });
        gsap.set(bloom, { opacity: 0 });
        gsap.set(img, { filter: "brightness(0.2)" });
        gsap.set(dim, { opacity: 0.55 });
        gsap.set(q("[data-reveal]"), { opacity: 0 });
        // y: 0 drops the px offset GSAP parses from the CSS translateY(110%).
        gsap.set(q(".hero-line-inner"), { y: 0, yPercent: 110 });
        root.dataset.intro = "playing";

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            root.dataset.intro = "done";
            // Hand back to the stylesheet; only clear what we set (next/image owns
            // other inline styles on the <img>).
            gsap.set(lines, { clearProps: "strokeDashoffset" });
            gsap.set(img, { clearProps: "filter" });
            gsap.set([group, bloom, dim], { clearProps: "opacity" });
            gsap.set([...q("[data-reveal]"), ...q(".hero-line-inner")], { clearProps: "opacity,transform" });
          },
        });

        // 1. Pen-like draw of the 8 ceiling strips (0 → ~1.0s)
        tl.to(lines, { strokeDashoffset: 0, duration: 0.42, ease: "power2.inOut", stagger: 0.085 }, 0);

        // 2. Fluorescent flicker: two quick blips, light spills into the room
        tl.to(group, {
          keyframes: [
            { opacity: 0.15, duration: 0.05 },
            { opacity: 1, duration: 0.06 },
            { opacity: 0.25, duration: 0.05 },
            { opacity: 1, duration: 0.08 },
          ],
          ease: "none",
        }, 1.02);
        tl.to(img, {
          keyframes: [
            { filter: "brightness(0.5)", duration: 0.05 },
            { filter: "brightness(0.22)", duration: 0.06 },
            { filter: "brightness(0.6)", duration: 0.05 },
            { filter: "brightness(0.35)", duration: 0.08 },
          ],
          ease: "none",
        }, 1.02);

        // 3. Lights on
        tl.to(img, { filter: "brightness(1)", duration: 0.65, ease: "power2.out" }, 1.26);
        tl.to(dim, { opacity: 0, duration: 0.65, ease: "power2.out" }, 1.26);
        // Settle into the "lit" state: core eases down a touch, bloom comes up.
        tl.to(group, { opacity: 0.9, duration: 0.7, ease: "power1.inOut" }, 1.5);
        tl.to(bloom, { opacity: 1, duration: 0.7, ease: "power1.out" }, 1.26);

        // 4. Copy enters
        tl.fromTo(reveal("eyebrow"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, 1.3);
        tl.to(q(".hero-line-inner"), { yPercent: 0, duration: 0.62, ease: "power4.out", stagger: 0.08 }, 1.36);
        tl.fromTo(reveal("sub"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45 }, 1.55);
        tl.fromTo(reveal("cta"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06 }, 1.65);
        tl.fromTo(reveal("pill"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 1.75);
        tl.fromTo(reveal("proof"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 1.8);
        tl.fromTo(reveal("marquee"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, 1.8);
      });
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return null;
}
