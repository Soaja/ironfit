@AGENTS.md

# IRONFIT Ribera — istruzioni per le prossime sessioni

Landing page per IRONFIT, palestra a Ribera (AG, Sicilia). Dominio: https://ironfitribera.it.
**Tutto il testo del sito è in italiano.** Le risposte all'utente possono essere in serbo/inglese.
Vedi anche `TODO.md` (dati mancanti, prossimi passi, problemi noti).

## Stack e comandi
- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4 · GSAP (solo import dinamico) · Resend.
- Next 16 ha API diverse dal training: leggi `node_modules/next/dist/docs/` prima di usare API nuove.
- `npm run dev` (localhost:3000) · `npm run build` · `npm test` (node --test su `lib/*.test.ts`) · `npx eslint .`
- Script immagini (originali mai toccati): `node scripts/prepare-images.mjs` (hero, servizi, functional), `node scripts/prepare-gallery.mjs` (galleria).
- Shell: Windows; PowerShell 5.1 rompe i messaggi di commit con virgolette → usa `git commit -F file`.
- `.verify/` (gitignored) = script Playwright e screenshot di verifica.

## Struttura
- `data/gym.ts` — **unica fonte di verità**: `contact`, `legal`, `credits`, `gym` (orari, WOD, stats, reviews), `services`, `team`, `quiz`, `schedule`, `gallery`, `faq`, `navLinks`.
- `lib/` — funzioni pure testate: `schedule.ts` (orari, Europe/Rome via Intl, .ics, next class, summarizeHours), `contact.ts` (link, NAP, validazione form, rate limit, email), `recommend.ts` (quiz), `content.ts` (FAQ link, stelle, JSON-LD FAQ), `workoutTimer.ts`, `wod.ts`.
- `app/page.tsx` — ordine sezioni. `app/layout.tsx` — font, metadata, JSON-LD ExerciseGym + FAQPage, script intro.
- `app/api/contact/route.ts` — form → Resend. `app/privacy`, `app/cookie` — pagine legali (shell).
- `app/yoga`, `app/nutrizione` — pagine servizio: `components/sub/` (SubPageShell con `--accent`, SubHero, SubSection) + contenuti in `yogaPage` / `nutritionPage` (gym.ts).
- `components/` — una sezione per file (Hero, Services, Functional, Team, Percorso, Orari, Galleria, Recensioni, Faq, FinalCta, Contatti, Footer, MobileActionBar…). Client solo dove serve interazione.
- `components/LedLines.tsx` — coordinate `LED_SEGMENTS` tracciate sulle vere strisce LED del soffitto (master 2560×1920).

## Brand
- Colori: nero #0A0A0A, rosso #D7192A, bianco, grigi #1A1A1A / #6B6B6B / #E8E8E8. **Ambra #F28C28 solo in Functional/WOD** (e categoria functional negli orari). Categorie orari: Crosstraining #F28C28, Pilates #B39DDB, Yogalates #5FBFA3, Boxe #D7192A.
- Font: Barlow Condensed 800 maiuscolo (display) · Inter 400/500/600 (testo) · Permanent Marker solo nella card WOD (caricato tardi).
- Motivo: poligono aperto di strisce LED (dal soffitto reale), grana `.hero-grain`, punto finale rosso nei titoli (glifo ".", non un cerchio).
- Tono: diretto, sicuro, un po' sfacciato ("Allenati sul serio.").
- Pattern sezione: eyebrow con quadratino rosso → H2 display con linee `.sr-line` (reveal da `SectionReveal`) → testo white/75.

## Regole (non negoziabili)
- `gym.ts` è l'unica fonte: nessun valore di contatto/business duplicato nei componenti.
- **Mai inventare** fatti, prezzi, recensioni, rating, nomi, certificazioni o testi legali. Placeholder sempre tra `[PARENTESI]`; policy da verificare con `[DA CONFERMARE]`.
- JSON-LD e link (`tel:`, `wa.me`, `mailto:`, social, sameAs, aggregateRating, employee, FAQ) devono **saltare i placeholder** (`isPlaceholder`, `hasRealRating`, `faqJsonLd`).
- Tutto il testo è server-rendered (anche il contenuto nascosto: niente rendering condizionale per SEO). Il sito deve funzionare e mostrare tutto senza JS.
- **Niente `<Suspense>` attorno alle sezioni** in `page.tsx` (nel prerender statico rende le sezioni invisibili senza JS).
- Animare solo transform/opacity/clip-path (eccezione documentata: altezza FAQ). Rispettare `prefers-reduced-motion`.
- GSAP solo con `import()` dinamico dentro effetti client. Niente nuove librerie senza motivo.
- Nessun segreto nel codice o nei commit (`.env*` ignorati, solo `.env.example`).
- Il form contatti **non deve mai simulare il successo**: successo solo su 2xx da Resend; altrimenti fallback WhatsApp.
- Immagini sotto la piega: lazy + `sizes` corretti; non devono competere con l'LCP dell'hero.
- Link di navigazione come `/#sezione` (funzionano anche da /privacy e /cookie).

## Verifica predefinita (versione leggera)
- Usa il dev server già avviato (localhost:3000), non avviarne un secondo.
- Screenshot Playwright solo a 375×812 e 1440×900, stato finale.
- Max 2 iterazioni di fix; niente Lighthouse salvo richiesta; `npm test` per la logica pura; un solo `npm run build` alla fine.
- Commit alla fine con messaggio chiaro; mai `git push` senza chiedere.

## Stato sezioni
| Sezione | Stato | Note |
|---|---|---|
| Header | ✅ | hide-on-scroll, menu mobile con focus trap |
| Hero | ✅ | intro "Accendi le luci", LED tracciati, status aperto/chiuso |
| Trust bar | ✅ | numeri placeholder (count-up solo con numeri reali) |
| Servizi | ✅ | pannelli desktop / carousel mobile |
| Functional + WOD | ✅ | timer 7 segmenti, WOD in gym.ts (aggiornare a mano) |
| Team | ✅ | flip card, dati trainer placeholder |
| Quiz "Trova il tuo percorso" | ✅ | `lib/recommend.ts`, 48 combinazioni testate |
| Orari | ✅ | calendario reale dal PDF "IRONFIT CORSI" (31 lezioni lun–ven: Crosstraining, Pilates, Yogalates, Boxe) |
| Galleria | ✅ | 15 foto, lightbox |
| Recensioni | ✅ | stato vuoto (solo CTA) finché non ci sono dati reali |
| FAQ | ✅ | 4 risposte `[DA CONFERMARE]` escluse dal JSON-LD |
| CTA band | ✅ | |
| Contatti | ✅ | form Resend (richiede env vars), mappa click-to-load |
| Footer | ✅ | |
| Mobile sticky bar | ✅ | |
| /privacy | 🟡 | shell con placeholder testo, noindex (`legal.pagesReady`) |
| /cookie | 🟡 | come /privacy |
| /yoga | ✅ | accento salvia #5FBFA3, "Respira con noi" (box breathing, `lib/breath.ts`), lezioni Yogalates + Pilates da `schedule` |
| /nutrizione | ✅ | accento rosso, selettore obiettivi (tabs), 3 passi "indicativo" (`nutritionPage.stepsConfirmed`) |

**Prezzi: rimossa per scelta del cliente** (nessuna sezione, nessun link). Non ricrearla.
