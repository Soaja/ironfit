import type { Metadata } from "next";
import Link from "next/link";
import FinalCta from "@/components/FinalCta";
import BoxBreathing from "@/components/sub/BoxBreathing";
import SubHero from "@/components/sub/SubHero";
import SubPageShell from "@/components/sub/SubPageShell";
import SubSection from "@/components/sub/SubSection";
import YogaClasses from "@/components/sub/YogaClasses";
import { schedule, services, whatsappHref, yogaPage } from "@/data/gym";

const YOGA = "#5FBFA3"; // same sage as the yoga category in the timetable
const description = services.find((s) => s.id === "yoga")!.description;

export const metadata: Metadata = {
  title: "Yoga a Ribera | IRONFIT – Mobilità, respiro, equilibrio",
  description: `Yoga a Ribera da IRONFIT. ${description} Orari e prenotazione su WhatsApp.`.slice(0, 155),
  alternates: { canonical: "/yoga" },
  openGraph: { url: "/yoga", title: "Yoga a Ribera | IRONFIT", description },
};

export default function YogaPage() {
  return (
    <SubPageShell accent={YOGA}>
      <SubHero
        word="Yoga"
        eyebrow="Yoga a Ribera · IRONFIT"
        lines={["Respira.", "Poi spingi più forte."]}
        text={description}
        whatsapp={{ href: whatsappHref(yogaPage.whatsappMessage), label: "Prova una lezione" }}
        secondary={{ href: "#orari-yoga", label: "Vedi gli orari" }}
      />

      <SubSection
        id="perche"
        eyebrow="Perché lo yoga"
        title={["Lo yoga che serve", "a chi si allena."]}
        intro="Non è l'opposto della sala pesi: è quello che la rende sostenibile. Più mobilità, più controllo, recupero migliore."
        className="bg-iron-black"
      >
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {yogaPage.benefits.map((b, i) => (
            <li key={b.title} className="sub-card">
              <span className="sub-card-n" aria-hidden="true">
                0{i + 1}
              </span>
              <h3 className="mt-10 font-display text-[32px] font-extrabold uppercase leading-none">{b.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/70">{b.text}</p>
            </li>
          ))}
        </ul>
      </SubSection>

      <SubSection
        id="respira"
        eyebrow="Prova adesso · 1 minuto"
        title={["Respira con noi."]}
        intro="Respirazione quadrata: quattro fasi da quattro secondi. Segui la luce sul quadrato, come le strisce LED della nostra sala."
        className="sub-calm"
      >
        <BoxBreathing />
      </SubSection>

      <SubSection
        id="orari-yoga"
        eyebrow="Orari · Yogalates e Pilates"
        title={["Trova il tuo", "momento."]}
        intro="Yogalates e Pilates: scegli una lezione e prenota il posto su WhatsApp, ti rispondiamo noi."
        aside={
          schedule.isExample ? (
            <p className="mt-4 inline-flex border border-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
              Orari indicativi · in aggiornamento
            </p>
          ) : null
        }
        className="bg-iron-black"
      >
        <YogaClasses />
        <Link href="/#orari?corso=yogalates" className="panel-link mt-8 inline-flex">
          Calendario completo dei corsi <span aria-hidden="true">→</span>
        </Link>
      </SubSection>

      <SubSection id="per-chi" eyebrow="Per chi è" title={["Per chi è."]} className="sub-calm">
        <ul className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
          {yogaPage.audience.map((a) => (
            <li key={a.title} className="bg-[#0e1211] p-7 lg:p-9">
              <h3 className="font-display text-[26px] font-extrabold uppercase leading-none">{a.title}</h3>
              <p className="mt-3 text-white/70">{a.text}</p>
            </li>
          ))}
        </ul>
      </SubSection>

      <FinalCta
        title="Stendi il tappetino."
        text="Scrivici e ti diciamo quando iniziare. Ti aspettiamo in sala, al tuo ritmo."
        whatsappMessage={yogaPage.whatsappMessage}
        whatsappLabel="Prenota una lezione"
      />
    </SubPageShell>
  );
}
