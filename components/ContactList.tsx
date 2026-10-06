"use client";

import { useRef, useState, type ReactNode } from "react";
import { contact, gym, isPlaceholder, telHref, whatsappHref } from "@/data/gym";
import { addressOneLine, mailtoUrl } from "@/lib/contact";
import { CopyIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./Icons";
import NapAddress from "./NapAddress";

type Row = { key: string; label: string; icon: ReactNode; copy: string; content: ReactNode };

// Contact rows with a copy button each ("Copiato!" toast). Values are shown
// even while they are placeholders, so missing data is obvious before launch.
export default function ContactList() {
  const [toast, setToast] = useState("");
  const timer = useRef(0);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast(`${label} copiato!`);
    } catch {
      setToast("Copia non riuscita");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(""), 1800);
  };

  const mail = mailtoUrl(contact.email);
  const rows: Row[] = [
    {
      key: "address",
      label: "Indirizzo",
      icon: <PinIcon className="h-5 w-5" />,
      copy: `${gym.name}, ${addressOneLine(contact.address)}`,
      content: <NapAddress className="text-white/85" />,
    },
    {
      key: "phone",
      label: "Telefono",
      icon: <PhoneIcon className="h-5 w-5" />,
      copy: contact.phone,
      content: <a href={telHref()} className="contact-link">{contact.phone}</a>,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: <WhatsAppIcon className="h-5 w-5" />,
      copy: contact.whatsapp,
      content: (
        <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="contact-link">
          Scrivici su WhatsApp
        </a>
      ),
    },
    {
      key: "email",
      label: "Email",
      icon: <MailIcon className="h-5 w-5" />,
      copy: contact.email,
      content: mail ? <a href={mail} className="contact-link">{contact.email}</a> : <span className="text-white/85">{contact.email}</span>,
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: <InstagramIcon className="h-5 w-5" />,
      copy: contact.instagram,
      content: isPlaceholder(contact.instagram) ? (
        <span className="text-white/85">{contact.instagram}</span>
      ) : (
        <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="contact-link">
          {contact.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")}
        </a>
      ),
    },
  ];

  return (
    <div className="relative">
      <ul className="contact-list">
        {rows.map((r) => (
          <li key={r.key} className="contact-row">
            <span className="contact-icon" aria-hidden="true">
              {r.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{r.label}</p>
              <div className="mt-1 text-[16px] leading-snug">{r.content}</div>
            </div>
            <button type="button" className="contact-copy" onClick={() => copy(r.copy, r.label)} aria-label={`Copia ${r.label.toLowerCase()}`}>
              <CopyIcon className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <p role="status" className={`contact-toast ${toast ? "is-visible" : ""}`}>
        {toast}
      </p>
    </div>
  );
}
