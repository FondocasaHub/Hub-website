# Il Cervello di FondoCasa Hub

Base di conoscenza dell'agenzia FC Punto Hub (Napoli, Vomero). Si apre con **Obsidian**
(File → Apri cartella come vault → `cervello/`) e si interroga con **Claude Code** aperto
in questa cartella: le istruzioni operative per Claude sono in `CLAUDE.md`.

Punto di partenza: [[00 Cruscotto]].

## Come è organizzato

| Cartella | Cosa contiene | Punti del progetto |
|---|---|---|
| `01 Agenzia` | Metodo, zone di Napoli, competitor, strumenti, agenda | 8, 18 |
| `02 Procedure` | Valutazione, presa d'incarico, offerte multiple, rinnovo, annunci a norma | 9, 16 |
| `03 Onboarding` | Percorso del nuovo agente e copioni | 8 |
| `04 Acquisizione` | Scaduti del lunedì, appuntamenti preparati, analisi per via, professionisti, lettere | 1–5 |
| `05 Team` | Schede agenti, brief di coaching, verbali delle riunioni | 6, 7, 10 |
| `06 Numeri` | Obiettivo, cruscotto finanziario, attività della ricerca | 10–12 |
| `07 Marketing` | Contenuti settimanali, guide per proprietari, pagine di zona | 15–18 |
| `08 Decisioni` | Registro delle decisioni e domande libere salvate | 19, 20 |
| `09 Controlli` | Contraddizioni e controllo del venerdì (lint) | 13, 14 |
| `_fonti` | Dati grezzi importati (annunci, export Vendilo, euromq, riunioni) | — |
| `_modelli` | Modelli di nota (usali con il plugin Templater o copia-incolla) | — |
| `_strumenti` | Script Node.js che fanno i conti (nessuna dipendenza da installare) | — |
| `_config` | Parametri: obiettivi, tassi di conversione, zone, competitor | — |

## Comandi (da dare a Claude dentro questa cartella)

| Scrivi | Ottieni |
|---|---|
| `scaduti` | Lista degli annunci spariti senza "venduto" (proprietari da chiamare) |
| `prepara [immobile]` | Scheda per l'appuntamento di valutazione |
| `analisi via [nome via]` | Prezzi richiesti €/mq e compravenduti della via |
| `lettera via [nome via]` | Testo per il porta a porta con i dati reali della via |
| `professionisti [zona]` | Censimento notai/avvocati/amministratori pronto per Vendilo |
| `brief [agente]` | Brief di coaching da 20 minuti |
| `riunione [file]` | Decisioni, compiti e scadenze estratti dal verbale/trascrizione |
| `obiettivo` | Dove siamo rispetto a 50 incarichi / 40 vendite / provvigioni |
| `contraddizioni` | Prezzi diversi tra portali, APE mancante, parole vietate |
| `lint` | Controllo del venerdì |
| `contenuto settimana` | Testo del video "segnali dell'agenzia" dai numeri della settimana |
| `guida [zona]` | Guida/newsletter "quanto vale casa tua a [zona]" |
| `domanda: …` | Risposta con fonti, salvata in `08 Decisioni/Domande` |

## Script (si possono lanciare anche senza Claude)

```bash
cd cervello
node _strumenti/scaduti.mjs _fonti/annunci/2026-10-19.csv _fonti/annunci/2026-10-26.csv
node _strumenti/via.mjs "_fonti/annunci/2026-10-26.csv" "Via Anton Giulio Barrili"
node _strumenti/contraddizioni.mjs _fonti/annunci/2026-10-26.csv
node _strumenti/obiettivo.mjs _fonti/vendilo/attivita.csv
node _strumenti/professionisti.mjs _fonti/professionisti/vomero.csv
node _strumenti/lint.mjs
```

Ogni script stampa il risultato e, con `--salva`, scrive la nota Markdown nella cartella giusta.
Per provarli subito ci sono dati **inventati** in `_fonti/esempio/` (vedi `_fonti/README.md`).

## Privacy

I dati personali (proprietari, telefoni, export Vendilo) restano in `_fonti/` e **non vanno su Git**:
il `.gitignore` di questa cartella li esclude. Su Git vanno solo metodo, procedure, modelli e script.
