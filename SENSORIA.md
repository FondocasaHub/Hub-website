# Sensoria × Hub-website — briefing per Nico e per il suo Claude

> **Come usarlo.** Salva questo file come `SENSORIA.md` alla radice di `FondocasaHub/Hub-website`. Se hai un
> `CLAUDE.md`, aggiungi una riga: «Per `public/immobili/`, l'Area agenti lato marketing e tutto quello che arriva da
> Sensoria, leggi `SENSORIA.md`». Poi chiedi al tuo Claude di fare la sezione 7, un punto alla volta.
> Versione del 09/11/2026. Domande: Jgio, giovanni@sensoriaspace.com.

## 1. Chi è Sensoria e cosa fa per FC
Sensoria è l'agenzia che cura il marketing di FCpuntoHUB (soci Jgio, Tiziano e Francesco). Per ogni immobile che FC
acquisisce prepara copione e storyboard, segue lo shooting, monta i video per Instagram e TikTok, prepara le foto, fa
il **sito dell'immobile** e porta i contatti agli agenti di FC.

Quasi tutto lo fa una **pipeline automatica** su un server di Sensoria:
- **n8n** (`https://n8n.sensoriaspace.com`): i flussi da FC 0 a FC 6;
- una **dashboard interna** (`https://app.sensoriaspace.com`, riservata a Sensoria) dove Jgio dà gli ok;
- un **lavoratore** che monta i video.

La parte di intelligenza artificiale la chiamiamo **Claude** o «automazione».

Parole usate qui:
- **agente**: sempre una persona di FC (agente immobiliare), mai l'automazione;
- **SH-NN**: codice dell'immobile nella pipeline (`SH-4`, `SH-07`), lo stesso sul Drive, nei video e nel sito;
- **slug**: nome della cartella del sito, `SH-NN_via-zona` (es. `SH-4_de-matha-poggioreale`).

## 2. Il percorso di un immobile
1. L'agente compila **«Ingaggio Marketing»** nell'Area agenti. La funzione `notifica-marketing` manda l'email a
   marketinghub@ e, dopo la sezione 7, anche in copia a giovanni@sensoriaspace.com.
2. **FC 1** legge l'email: dati del modulo, allegati, email dell'agente. Assegna il codice SH, crea la cartella su
   Drive SENSORIA e mette l'immobile nella dashboard.
3. **FC 2** scrive copione e storyboard; una seconda lettura di Claude li controlla. Jgio li approva nella dashboard.
4. **FC 3** manda all'agente il PDF di copione e storyboard. **FC 4** legge la risposta e corregge i dati.
5. Si fa lo **shooting**: il videomaker lascia note e vocali in una pagina della dashboard.
6. Il girato va sul Drive. Il server sceglie le prese, Claude propone la regia (**FC 5**), Jgio approva, il server monta.
   Jgio dà l'ok finale sul video.
7. Le foto vengono ripulite, se serve (**FC 6**). Si costruisce il **sito dell'immobile**, che arriva su Hub-website
   (sezione 3).
8. I contatti lasciati sul sito arrivano a n8n e da lì a FC. Questo flusso è ancora da costruire: WhatsApp e Vendilo
   sono da decidere con te.

## 3. Cosa tocca Hub-website: le pagine degli immobili
### 3.1 File
| Percorso | Cos'è | Chi lo scrive |
|---|---|---|
| `public/immobili/<slug>/` | Sito di un immobile: `index.html`, `assets/`, `img/`, `video/`, `frames/`. Statico, nessun React | Il generatore di Sensoria. **Non modificarlo a mano**: si rigenera e le modifiche si perderebbero. Le correzioni chiedile a Jgio |
| `public/immobili/index.json` | Elenco `[{codice, slug, titolo, zona, prezzo, foto, data, stato}]`, il più nuovo in cima. `prezzo: null` = «su richiesta», `stato: "venduto"` = in fondo | Sensoria |
| `public/immobili/index.html` e `_elenco/` | Pagina «Immobili», fatta come `public/hub24/index.html`. Le schede sono già nell'HTML, perché `robots.txt` blocca i `.json` e Google non le leggerebbe | Sensoria |
| `public/sitemap.xml` | Una riga per `/immobili` e una per ogni immobile | Sensoria aggiunge, non cancella le altre righe |
| `vercel.json` | Solo le aggiunte elencate in 3.2, con la formattazione originale | Sensoria lo propone, tu lo approvi |

`/immobile/:token` (singolare, il report privato per la proprietà) **non si tocca**. È un'altra cosa, con un nome vicino.

### 3.2 Aggiunte a `vercel.json`
- `rewrites`: `/immobili` → `/immobili/index.html` e `/immobili/:slug` → `/immobili/:slug/index.html`, **prima** della
  rotta `/(.*)` → `/api/not-found`. Ogni sito ha `<base href="/immobili/<slug>/">`, quindi si apre anche senza la barra
  finale.
- `headers`: cache di un giorno per `/immobili/:slug/(img|video|frames|assets)/:path*`.
- CSP: `https://n8n.sensoriaspace.com` in `connect-src`, perché il modulo dei contatti scrive lì. Oggi la CSP è
  `Report-Only`; senza questa voce il modulo si bloccherebbe il giorno in cui la rendete obbligatoria.
- **Nessun `noindex`** su `/immobili`: le pagine si indicizzano (decisione di Jgio del 09/11).

### 3.3 Come arrivano
- Dal server di Sensoria, con una **deploy key** con scrittura su questo repository (sezione 7, A2).
- Il server spinge **solo rami `immobili/<slug>`**, mai `main`. Vercel ne fa l'anteprima.
- La pull request la apre Jgio con l'account GitHub `xj546rkjjb-sys` e **la unisci tu**. Un commit per immobile:
  `Immobili: SH-NN`.
- Ogni sito pesa **al massimo circa 6 MB**: il repository pesa già 88 MB. Il generatore rifiuta file sopra i 50 MB.

### 3.4 Tracciamento e privacy
- Ogni sito ha lo **stesso Google Tag Manager della home** (`GTM-NBFS2FNQ`), con Consent Mode v2 prima di GTM, il tag
  Google Ads `AW-18237592158` e il **banner Iubenda** della home. I link alla privacy sono `/privacy` e `/cookie`.
  Nessun altro script esterno; le mappe usano le tessere di OpenStreetMap.
- Quando un contatto parte, il modulo mette sul `dataLayer`
  `{event: 'lead_immobile', immobile, tipo, categoria, temperatura, stato}` e manda `gtag('event','generate_lead')`.
  **Mai nome o telefono.** Se ci date l'etichetta di una conversione Ads «Lead immobili», parte anche quella.
- Oggi il tag «Lead» di Meta nel contenitore scatta solo dai moduli di `/comincia`. Per contare i contatti degli
  immobili serve il passo 7, E1.

### 3.5 Il modulo dei contatti
`POST` (`application/x-www-form-urlencoded`) a un webhook di n8n su `https://n8n.sensoriaspace.com/webhook/...`.
L'indirizzo esatto lo mettiamo noi quando il flusso dei contatti è pronto: fino ad allora il modulo non invia.

Cosa contiene:
- i campi `nome`, `telefono`, `quando`, `vendere`, `entro_vendita`, `mutuo` e la privacy;
- i campi nascosti `codice`, `immobile`, `titolo_pagina`, `stato`, `utm_*`;
- i valori calcolati `categoria`, `temperatura`, `compravendita`, `oggetto`, `fonte`, `pagina`, `inviato_il`.

Il webhook risponde `200` con CORS aperto all'origine del sito.

## 4. L'Area agenti, lato marketing
### 4.1 Richieste di shooting (FC 1)
FC 1 dipende dal formato dell'email di `supabase/functions/notifica-marketing/index.ts`:
- l'**oggetto** `Ingaggio Marketing n. <id> - <codice_annuncio> - <indirizzo> (<agente_nome>)`;
- la **tabella delle 7 sezioni**, con le stesse etichette di `SEZIONI`;
- il **Reply-To** con l'email dell'agente;
- gli **allegati come link firmati**, validi 7 giorni: FC 1 li scarica appena arriva l'email.

**Se cambi l'oggetto, le etichette o il modo degli allegati, avvisa Jgio prima**, così adattiamo FC 1.
Un indirizzo che comincia con `[PROVA]` finisce nell'oggetto: FC 1 lo tratta come prova e non scrive a nessun agente.

### 4.2 Sensoria nell'Area agenti
Nel codice esiste già il **gestore marketing** (`AreaApp.jsx`: ruolo `staff` + reparto `marketing`). Vede tutte le
richieste e ne cambia lo stato: `ricevuta` → `in lavorazione` → `completata` / `respinta`.
- Jgio entra con `giovanni@sensoriaspace.com` con quel ruolo (sezione 7, B1).
- Più avanti chiederemo un secondo utente staff/marketing, solo per l'automazione. Aggiornerà lo stato delle richieste
  passando dalle regole RLS come un utente qualsiasi, **senza chiavi di servizio**.

### 4.3 Nuove funzioni per il reparto marketing
Le proponiamo con pull request:
- il codice in `src/area-agenti/`;
- l'SQL in `supabase/area-agenti-*.sql`, come fate già voi;
- le funzioni in `supabase/functions/`.

**Tu** unisci, lanci l'SQL su Supabase e ripubblichi le funzioni. Sensoria non chiede l'accesso al progetto Supabase né
le sue chiavi.

## 5. Confini e sicurezza
- Sensoria non scrive mai su `main` e non tocca file fuori da quelli della sezione 3. Le eccezioni passano da una pull
  request che approvi tu.
- La chiave privata della deploy key resta solo sul server di Sensoria. Per toglierci l'accesso basta cancellarla in
  Settings → Deploy keys.
- Nessun dato personale dei contatti nel `dataLayer`, negli URL o nel repository.
- I dati delle pagine (prezzo, metri, piano…) vengono dal modulo d'ingaggio e dalle risposte dell'agente, e li
  approva Jgio prima della pubblicazione.

## 6. Cosa resta a voi
- Unire le pull request di Sensoria. Se un giorno vorrete l'unione automatica per i soli rami `immobili/*`, decidiamo
  insieme.
- GTM, Google Ads, Meta e Iubenda restano vostri: Sensoria li legge, non li configura.
- Supabase resta vostro, compresi SQL e deploy delle funzioni.

## 7. Cosa ti chiediamo, in ordine
**A. GitHub**
1. Aggiungi `xj546rkjjb-sys` come collaboratore di Hub-website.
2. In Settings → Deploy keys aggiungi questa chiave, con titolo «sensoria-server» e la spunta su «Allow write access»:
   `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIeZgqdZPLflDTDepBcaMocqf8oAH9Cw1DEMLnbMtpT5 sensoria-server -> FondocasaHub/Hub-website`

**B. Area agenti**
1. Invita `giovanni@sensoriaspace.com` con ruolo `staff` e reparto `marketing`.

**C. Richieste**
1. In `notifica-marketing/index.ts` scrivi `cc: [COPIA, "giovanni@sensoriaspace.com"]`.
2. **Ripubblica la funzione su Supabase** (`supabase functions deploy notifica-marketing`): il push su GitHub non basta.
3. Manda una richiesta di prova con indirizzo `[PROVA] Via Prova 1` e dillo a Jgio.

**D. Sito**
1. Quando arriva la prima pull request (un ramo `immobili/<slug>`, probabilmente de Matha), controlla `vercel.json` e
   l'anteprima di Vercel, poi unisci.

**E. Tracciamento**
1. In GTM aggiungi al tag «Lead» di Meta un'attivazione sull'evento personalizzato `lead_immobile`. In GA4 segna
   `generate_lead` come evento chiave.
2. Se volete contare i contatti in Google Ads, crea una conversione «Lead immobili» e manda l'etichetta (`AW-…/…`) a Jgio.
3. Nella home, `index.html` righe 205–207: la conversione «Prenotazione appuntamento» parte **a ogni caricamento della
   pagina**. Controlla se è voluto, perché così le conversioni risultano gonfiate.
4. Verifica che l'informativa Iubenda copra anche i moduli dei contatti degli immobili: i dati passano da Sensoria e
   arrivano a FC.

**F. Domande (rispondi a Jgio)**
1. Le anteprime dei rami su Vercel sono protette dal login di Vercel? Se sì, come le vediamo?
2. Chi gestisce l'API di WhatsApp sul numero dello store (081 1865 3202), e con quale fornitore?
3. Possiamo usare l'API di Vendilo per creare la scheda di un contatto?
4. Va bene tenere nel repository siti fino a circa 6 MB l'uno?
