---
tipo: numeri
aggiornato: 2026-10-23
responsabile: Broker
---
# Obiettivo dell'anno

Parametri in `_config/parametri.json`: **50 incarichi, 40 vendite, 1.200.000 € di provvigioni**
(coerente con il piano compensi: circa 410.000 € l'anno per team).

## Cosa serve a settimana
Calcolato da `node _strumenti/obiettivo.mjs` con i tassi di conversione dei parametri:

<!-- obiettivo:inizio -->
Non ancora calcolato: lancia `obiettivo` con l'export di Vendilo in `_fonti/vendilo/attivita.csv`.
<!-- obiettivo:fine -->

## Come leggere
- **Ritmo**: quanto avremmo dovuto fare a oggi se l'anno fosse lineare.
- **Scarto**: fatto − ritmo. Negativo = siamo indietro.
- **Serve a settimana da oggi**: (obiettivo − fatto) / settimane rimaste.
- I tassi di conversione iniziali sono stime: dopo 3 mesi si sostituiscono con quelli veri di Vendilo
  (lo script li calcola e li mostra nella colonna "tasso reale").
