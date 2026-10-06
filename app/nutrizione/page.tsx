import type { Metadata } from "next";
import FinalCta from "@/components/FinalCta";
import NutritionGoals from "@/components/sub/NutritionGoals";
import SubHero from "@/components/sub/SubHero";
import SubPageShell from "@/components/sub/SubPageShell";
import SubSection from "@/components/sub/SubSection";
import { gym, nutritionPage, services, whatsappHref } from "@/data/gym";

const description = services.find((s) => s.id === "nutrizione")!.description;

export const metadata: Metadata = {
  title: "Nutrizione a Ribera | IRONFIT – Piano alimentare su misura",
  description: `Consulenza nutrizionale a Ribera da IRONFIT. ${description} Prenota su WhatsApp.`.slice(0, 155),
  alternates: { canonical: "/nutrizione" },
  openGraph: { url: "/nutrizione", title: "Nutrizione a Ribera | IRONFIT", description },
};

const LINKS = [
  { href: "/#servizi", label: "Sala pesi", text: "Il tuo programma, ai tuoi orari." },
  { href: "/#functional", label: "Functional", text: "Lezioni di gruppo, intense e mai uguali." },
  { href: "/#team", label: "Personal trainer", text: "Uno a uno, con obiettivi misurabili." },
];

export default function NutrizionePage() {
  return (
    <SubPageShell accent="#D7192A">
      <SubHero
        word="Nutrizione"
        eyebrow="Nutrizione a Ribera · IRONFIT"
        lines={["Allenati bene.", "Mangia meglio."]}
        text={description}
        whatsapp={{ href: whatsappHref(gym.nutritionMessage), label: "Prenota una consulenza" }}
        secondary={{ href: "#obiettivo", label: "Scegli il tuo obiettivo" }}
      />

      <SubSection
        id="obiettivo"
        eyebrow="Il tuo obiettivo"
        title={["Un piano,", "non una dieta."]}
        intro="Diete copiate e regole a caso non durano. Partiamo da cosa vuoi ottenere e da come vivi davvero."
        className="bg-iron-black"
      >
        <NutritionGoals />
      </SubSection>

      <SubSection
        id="come-funziona"
        eyebrow="Come funziona"
        title={["Tre passi,", "zero complicazioni."]}
        aside={
          nutritionPage.stepsConfirmed ? null : (
            <p className="mt-4 inline-flex border border-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
              Percorso indicativo · in aggiornamento
            </p>
          )
        }
        className="sub-warm"
      >
        <ol className="steps">
          {nutritionPage.steps.map((s, i) => (
            <li key={s.title} className="step">
              <span className="step-n" aria-hidden="true">
                0{i + 1}
              </span>
              <h3 className="mt-6 font-display text-[clamp(28px,2.8vw,38px)] font-extrabold uppercase leading-none">{s.title}</h3>
              <p className="mt-3 max-w-[34ch] text-white/70">{s.text}</p>
            </li>
          ))}
        </ol>
      </SubSection>

      <SubSection
        id="insieme"
        eyebrow="Alimentazione + allenamento"
        title={["Funziona meglio", "insieme."]}
        intro="Il piano alimentare rende di più quando l'allenamento è seguito. Scegli come allenarti, al resto pensiamo insieme."
        className="bg-iron-black"
      >
        <ul className="grid gap-3 md:grid-cols-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="sub-link-card">
                <span className="block font-display text-[30px] font-extrabold uppercase leading-none">{l.label}</span>
                <span className="mt-2 block text-white/65">{l.text}</span>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                  Scopri{" "}
                  <span aria-hidden="true" className="btn-arrow inline-block">
                    →
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </SubSection>

      <FinalCta
        title="Il primo passo è una chiacchierata."
        text="Raccontaci il tuo obiettivo: ti spieghiamo come lavoriamo e da dove partire."
        whatsappMessage={gym.nutritionMessage}
        whatsappLabel="Prenota una consulenza"
      />
    </SubPageShell>
  );
}
