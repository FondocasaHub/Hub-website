# Fonti: i dati grezzi

Tutto quello che c'è qui (tranne `esempio/` e questo file) **resta fuori da Git**: contiene dati personali.
I CSV possono avere `,` o `;` come separatore (gli export di Excel italiano usano `;`). Prima riga = intestazioni.
Numeri con o senza punti delle migliaia: `285000`, `285.000`, `€ 285.000` vanno bene.

## `annunci/AAAA-MM-GG.csv` – fotografia del lunedì
Una riga per annuncio per portale. La stessa cartella si usa per i competitor e per i nostri annunci
(agenzia `fondocasa-hub`).

| colonna | obbligatoria | esempio |
|---|---|---|
| data | sì | 2026-10-26 |
| agenzia | sì | tempocasa-vomero (codici in `_config/competitor.md`) |
| portale | sì | immobiliare.it |
| id_annuncio | sì | rif. dell'agenzia o id del portale |
| via | sì | Via Anton Giulio Barrili |
| civico | no | 12 |
| zona | no | Vomero |
| mq | sì | 95 |
| prezzo | sì | 420000 |
| prezzo_iniziale | no | 450000 (primo prezzo visto: serve per i ribassi) |
| locali | no | 4 |
| piano | no | 3 |
| classe_energetica | no | G |
| stato | sì | online / sotto offerta / venduto |
| primo_avvistamento | no | 2026-07-14 (per i giorni online) |
| titolo | no | testo del titolo |
| descrizione | no | testo dell'annuncio (per le parole vietate) |
| link | no | URL |

Come si fa la fotografia: da AgentPricing (export) oppure dalla pagina di ogni agenzia sui portali.
Dal Mac Claude può aiutare a compilarla dalle pagine aperte nel browser.

## `euromq/<via>.csv` – compravenduti (Euro Metro Quadro)
Nome file = via in minuscolo con trattini: `via-anton-giulio-barrili.csv`.
Colonne: `data_atto, via, civico, mq, prezzo` (opzionali: `piano, tipologia`).

## `vendilo/attivita.csv` – export attività di Vendilo
Colonne: `data, agente, tipo, provvigione` dove `tipo` è uno tra
`telefonata, appuntamento, valutazione, incarico, vendita`. `provvigione` solo sulle vendite.
**Da verificare** con il primo export reale: se Vendilo usa nomi diversi, si adegua la mappa in
`_strumenti/obiettivo.mjs` (costante `TIPI`).

## `vendilo/provvigioni.csv` – per il cruscotto finanziario
Colonne: `data, agente, team, immobile, stato, importo, probabilita` con `stato` tra
`incassata, maturata, prevista`.

## `professionisti/<zona>.csv`
Colonne libere tra: `nome, categoria, studio, indirizzo, telefono, email, sito, fonte`.

## `riunioni/AAAA-MM-GG <tipo>.txt` – trascrizioni delle registrazioni (da Drive)

## `contratti/` – PDF di incarichi e proposte per il controllo dei dati societari
