"use client";

import { useState, type FormEvent } from "react";
import { whatsappHref } from "@/data/gym";
import { contactWhatsappText, INTERESTS, LIMITS, validateContact, type FieldErrors } from "@/lib/contact";
import { WhatsAppIcon } from "./Icons";

type Status = "idle" | "sending" | "sent" | "error";

// Success is shown only after a 2xx from /api/contact (= email accepted by
// Resend). Anything else -> error with a WhatsApp fallback carrying the text.
export default function ContactForm() {
  const [values, setValues] = useState({ name: "", contact: "", interest: "Prova gratuita", message: "", privacy: false, website: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMsg, setServerMsg] = useState("");

  const check = (v = values) => {
    const r = validateContact(v);
    return r.ok ? {} : r.errors;
  };
  const set = <K extends keyof typeof values>(k: K, v: (typeof values)[K]) => {
    const next = { ...values, [k]: v };
    setValues(next);
    if (touched[k] || status === "error") setErrors(check(next));
  };
  const blur = (k: string) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(check());
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = check();
    setErrors(errs);
    setTouched({ name: true, contact: true, interest: true, message: true, privacy: true });
    if (Object.keys(errs).length) {
      document.getElementById(`cf-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setStatus("sending");
    setServerMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        setStatus("sent");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { message?: string; fields?: FieldErrors };
      if (res.status === 422 && data.fields) {
        // Field problems: show them inline, no fallback needed.
        setErrors(data.fields);
        setStatus("idle");
        return;
      }
      setServerMsg(res.status === 429 ? data.message ?? "" : "");
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const err = (k: keyof FieldErrors) => (touched[k] || status === "error" ? errors[k] : undefined);
  const fieldProps = (k: keyof FieldErrors) => ({
    id: `cf-${k}`,
    "aria-invalid": err(k) ? true : undefined,
    "aria-describedby": err(k) ? `cf-${k}-err` : undefined,
    onBlur: () => blur(k),
  });
  const errorText = (k: keyof FieldErrors) =>
    err(k) ? (
      <p id={`cf-${k}-err`} className="cf-error">
        {err(k)}
      </p>
    ) : null;

  if (status === "sent") {
    return (
      <div className="cf-panel" role="status">
        <p className="font-display text-[clamp(30px,4vw,44px)] font-extrabold uppercase leading-none">
          Grazie<span className="text-iron-red">!</span>
        </p>
        <p className="mt-3 text-lg text-white/80">Grazie! Ti rispondiamo entro 24 ore.</p>
      </div>
    );
  }

  return (
    <form className="cf-panel" onSubmit={submit} noValidate aria-describedby="cf-intro">
      <p id="cf-intro" className="mb-6 text-white/70">
        Preferisci scriverci? Compila il modulo, ti ricontattiamo noi.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="cf-label">
            Nome
          </label>
          <input {...fieldProps("name")} className="cf-input" autoComplete="name" maxLength={LIMITS.name} value={values.name} onChange={(e) => set("name", e.target.value)} required />
          {errorText("name")}
        </div>
        <div>
          <label htmlFor="cf-contact" className="cf-label">
            Telefono o email
          </label>
          <input {...fieldProps("contact")} className="cf-input" autoComplete="on" maxLength={LIMITS.contact} value={values.contact} onChange={(e) => set("contact", e.target.value)} required />
          {errorText("contact")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="cf-interest" className="cf-label">
            Ti interessa
          </label>
          <select {...fieldProps("interest")} className="cf-input" value={values.interest} onChange={(e) => set("interest", e.target.value)}>
            {INTERESTS.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
          {errorText("interest")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="cf-message" className="cf-label">
            Messaggio <span className="font-normal text-white/50">(facoltativo)</span>
          </label>
          <textarea {...fieldProps("message")} className="cf-input min-h-32 py-3" maxLength={LIMITS.message} value={values.message} onChange={(e) => set("message", e.target.value)} />
          {errorText("message")}
        </div>
        {/* Honeypot: hidden from people, tempting for bots */}
        <div className="cf-hp" aria-hidden="true">
          <label htmlFor="cf-website">Sito web</label>
          <input id="cf-website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set("website", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 text-[15px] text-white/80">
            <input
              {...fieldProps("privacy")}
              type="checkbox"
              className="cf-check"
              checked={values.privacy}
              onChange={(e) => set("privacy", e.target.checked)}
              required
            />
            <span>
              Ho letto l&apos;
              <a href="/privacy" className="faq-link" target="_blank">
                informativa privacy
              </a>
            </span>
          </label>
          {errorText("privacy")}
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary min-w-48" disabled={status === "sending"} aria-busy={status === "sending"}>
          {status === "sending" ? (
            <>
              <span className="cf-spinner" aria-hidden="true" />
              Invio in corso…
            </>
          ) : (
            "Invia il messaggio"
          )}
        </button>
      </div>

      <div aria-live="assertive">
        {status === "error" && (
          <div className="cf-fail">
            <p className="font-semibold">{serverMsg || "Non siamo riusciti a inviare il messaggio. Scrivici su WhatsApp"}</p>
            {serverMsg && <p className="mt-1 text-white/75">Oppure scrivici su WhatsApp:</p>}
            <a href={whatsappHref(contactWhatsappText(values))} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4">
              <WhatsAppIcon className="h-5 w-5" />
              Scrivici su WhatsApp
            </a>
          </div>
        )}
      </div>
    </form>
  );
}
