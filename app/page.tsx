import Header from "@/components/Header";
import Functional from "@/components/Functional";
import Hero from "@/components/Hero";
import Orari from "@/components/Orari";
import Percorso from "@/components/Percorso";
import Team from "@/components/Team";
import PlaceholderSections from "@/components/PlaceholderSections";
import Services from "@/components/Services";
import TrustBar from "@/components/TrustBar";

// No <Suspense> around sections: in the static prerender Next streams every
// Suspense boundary out of order (hidden <div id="S:…"> + inline swap script),
// which leaves the content invisible without JavaScript.
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
        <Services />
        <Functional />
        <Team />
        <Percorso />
        <Orari />
        <PlaceholderSections />
      </main>
    </>
  );
}
