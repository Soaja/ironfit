"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { navLinks, trialHref } from "@/data/gym";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";

const SCROLLED_AT = 80;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Compact + blurred after 80px; hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > SCROLLED_AT);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 240);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Mark the nav link of the section currently in view.
  useEffect(() => {
    const sections = navLinks
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        className="site-header"
        data-scrolled={scrolled || menuOpen}
        data-hidden={hidden && !menuOpen}
      >
        <div className="header-bg" aria-hidden="true" />
        <div className="header-inner relative flex h-full items-center justify-between gap-6 px-[var(--gutter)]">
          <Link href="/" className="header-logo shrink-0" aria-label="IRONFIT, palestra a Ribera: torna alla home">
            <Logo />
          </Link>

          <nav aria-label="Principale" className="hidden lg:block">
            <ul className="flex items-center gap-8 xl:gap-10">
              {navLinks.map(({ id, label }) => (
                <li key={id}>
                  <a
                    href={`/#${id}`}
                    className="nav-link"
                    aria-current={activeId === id ? "location" : undefined}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a href={trialHref} className="btn btn-primary hidden sm:inline-flex">
              Prova gratuita
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="relative h-12 w-12 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Chiudi il menu" : "Apri il menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="burger-bar" />
              <span className="burger-bar" />
              <span className="burger-bar" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        activeId={activeId}
        toggleRef={toggleRef}
        onClose={closeMenu}
      />
    </>
  );
}
