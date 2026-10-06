import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { legal } from "@/data/gym";

export const metadata: Metadata = {
  title: "Cookie Policy | IRONFIT Ribera",
  alternates: { canonical: "/cookie" },
  // noindex until the real text replaces the placeholder (legal.pagesReady)
  robots: legal.pagesReady ? { index: true, follow: true } : { index: false, follow: true },
};

export default function Page() {
  return <LegalPage title="Cookie Policy" />;
}
