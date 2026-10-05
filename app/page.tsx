import Header from "@/components/Header";
import Hero from "@/components/Hero";
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
        <Services />
        <PlaceholderSections />
      </main>
    </>
  );
}
