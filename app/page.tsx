import { Suspense } from "react";
import Header from "@/components/Header";
import Functional from "@/components/Functional";
import Hero from "@/components/Hero";
import Percorso from "@/components/Percorso";
import Team from "@/components/Team";
import PlaceholderSections from "@/components/PlaceholderSections";
import Services from "@/components/Services";
import TrustBar from "@/components/TrustBar";

export default function Home() {
  return (
    <>
      <a href="#contenuto" className="skip-link">
        Salta al contenuto
      </a>
      <Header />
      <main id="contenuto" tabIndex={-1} className="outline-none">
        <Hero />
        <TrustBar />
        {/* Below-the-fold sections in their own Suspense boundaries: nothing
            suspends (the HTML is identical), but React hydrates each boundary
            as a separate unit and yields in between, so hydration is split
            into short tasks instead of one long one (lower TBT). */}
        <Suspense>
          <Services />
        </Suspense>
        <Suspense>
          <Functional />
        </Suspense>
        <Suspense>
          <Team />
        </Suspense>
        <Suspense>
          <Percorso />
        </Suspense>
        <PlaceholderSections />
      </main>
    </>
  );
}
