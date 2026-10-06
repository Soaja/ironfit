# TODO — IRONFIT Ribera

Tutti i valori si inseriscono in `data/gym.ts` (unica fonte di verità).

## Dati da chiedere al cliente

### Contatti
- [ ] Indirizzo: via e numero civico (`contact.address.street` = `[VIA E NUMERO]`)
- [ ] Coordinate GPS (`[LAT]`, `[LNG]`) e link Google Maps (`[LINK GOOGLE MAPS]`)
- [ ] Telefono (`[TELEFONO]`)
- [ ] Numero WhatsApp, formato 39… (`[NUMERO WHATSAPP, formato 39...]`)
- [ ] Email (`[EMAIL]`) — anche come `CONTACT_TO_EMAIL` per il form
- [ ] Instagram (`[INSTAGRAM]`), Facebook (`[FACEBOOK]`, opzionale)

### Team (5 trainer)
- [ ] Nome (`[NOME]`), ruolo (`[RUOLO]`), specialità (`[SPECIALITÀ]`)
- [ ] Bio max 160 caratteri (`[BIO, max 160 caratteri]`)
- [ ] Certificazioni (`[CERTIFICAZIONE]`), Instagram personale (`[INSTAGRAM]`)
- [ ] Conferma dei tag del quiz per ogni trainer (attualmente provvisori)

### Orari
- [ ] Orari di apertura reali della sala (`gym.openingHours`, commento `[ORARI DA CONFERMARE]`)
- [ ] Calendario corsi reale (foto o lista) → sostituire `schedule.classes`, poi `isExample: false`
- [ ] WOD del giorno: chi lo aggiorna e come (oggi a mano in `gym.wod`)

### Numeri (trust bar)
- [ ] Metri quadri (`[MQ]`), numero trainer, numero macchinari Panatta, giorni di apertura (`[N]`)

### FAQ (`[DA CONFERMARE]`)
- [ ] Certificato medico: serve? quale?
- [ ] Abbonamento solo corsi (solo yoga / solo functional)?
- [ ] Consulenza nutrizione: modalità e costi
- [ ] Parcheggio vicino alla palestra?

### Recensioni
- [ ] Valutazione e numero recensioni Google (`googleRating`, `googleCount`; ora non impostati)
- [ ] Link "lascia una recensione" (`[LINK RECENSIONI GOOGLE]`)
- [ ] Eventuali recensioni da citare (testo reale, con consenso)

### Legale
- [ ] Ragione sociale (`[RAGIONE SOCIALE]`) e P.IVA (`[P.IVA]`)
- [ ] Testi Privacy Policy e Cookie Policy (servizio professionale, es. iubenda) → poi `legal.pagesReady = true`
- [ ] Link crediti OSTOIA&CO (`[URL OSTOIA]`)

### Prezzi (sezione rimossa per scelta)
- [ ] Fascia di prezzo solo per JSON-LD (`[FASCIA DI PREZZO]`), opzionale

### Pagine /yoga e /nutrizione
- [ ] Approvare i testi editoriali (benefici yoga, "per chi è", obiettivi e focus nutrizione) in `yogaPage` / `nutritionPage`
- [ ] Confermare il percorso nutrizione (3 passi) → `nutritionPage.stepsConfirmed = true`
- [ ] Chi segue la nutrizione (nome/qualifica del professionista)? Oggi non mostrato
- [ ] Foto reali di una lezione di yoga (le pagine oggi sono solo tipografiche)

## Prossimi passi tecnici
1. Completare le pagine legali appena arriva il testo.
2. QA completo: Lighthouse mobile su build di produzione, tutti i breakpoint (375/768/1024/1440/1920), accessibilità (tastiera, screen reader), validazione SEO/JSON-LD (Rich Results Test).
3. Deploy su Vercel.
4. Collegare il DNS di ironfitribera.it.
5. Variabili Resend su Vercel: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (dominio verificato); inviare un messaggio di prova.
6. Google Search Console: verificare il dominio e inviare `/sitemap.xml`.
7. Collegare il Google Business Profile (link mappe, recensioni, `hasMap`).

## Problemi noti
- Lighthouse mobile Performance ~83–88 (Accessibility/Best Practices/SEO 100): il limite è il runtime Next/React (~120 KB gz). Da rimisurare in produzione su Vercel.
- Rate limit del form in memoria: per istanza, si azzera ai riavvii (ok per un sito piccolo; valutare Turnstile/Upstash se arriva spam).
- Calendario corsi di esempio visibile con etichetta "Orari indicativi · in aggiornamento".
- FAQ: animazione di altezza (eccezione voluta alla regola transform/opacity).
- Galleria filtrata con numero dispari di foto può lasciare una cella vuota in fondo.
- Ritratti del team non gradati (il grade nero/rosso rende la pelle grigia).
- Il WOD e la sua data vanno aggiornati a mano.
- `.verify/` contiene script di test locali non versionati; alcuni puntano ancora a localhost:3100 (usare `BASE=http://localhost:3000/`).
