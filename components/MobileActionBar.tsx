"use client";

import { useEffect, useState } from "react";
import { telHref, trialHref, whatsappHref } from "@/data/gym";
import { PhoneIcon, WhatsAppIcon } from "./Icons";

// Mobile (<1024px) bottom bar: Chiama · WhatsApp · Prova gratuita.
// Hidden while the hero CTAs or the footer contacts are on screen, and while
// the mobile menu or any dialog (lightbox, class details) is open.
export default function MobileActionBar() {
  const [heroCtaVisible, setHeroCtaVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    const heroCta = document.querySelector('#hero [data-reveal="cta"]')?.parentElement ?? null;
    const footer = document.getElementById("footer-contatti");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === heroCta) setHeroCtaVisible(e.isIntersecting);
        if (e.target === footer) setFooterVisible(e.isIntersecting);
      }
    });
    if (heroCta) io.observe(heroCta);
    else requestAnimationFrame(() => setHeroCtaVisible(false)); // pages without a hero (privacy, cookie)
    if (footer) io.observe(footer);

    const check = () =>
      setOverlayOpen(!!document.querySelector('#mobile-menu[data-open="true"], dialog[open]'));
    const mo = new MutationObserver(check);
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open", "data-open"] });
    check();
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  const shown = !heroCtaVisible && !footerVisible && !overlayOpen;

  return (
    <nav aria-label="Azioni rapide" className="mbar lg:hidden" data-shown={shown} inert={!shown}>
      <a href={telHref()} className="mbar-btn">
        <PhoneIcon className="h-5 w-5" />
        Chiama
      </a>
      <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="mbar-btn">
        <WhatsAppIcon className="h-5 w-5" />
        WhatsApp
      </a>
      <a href={trialHref} className="mbar-btn mbar-primary">
        Prova gratuita
      </a>
    </nav>
  );
}
