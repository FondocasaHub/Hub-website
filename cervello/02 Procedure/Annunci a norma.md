---
tipo: procedura
aggiornato: 2026-10-23
responsabile: Marketing
versione: 1
---
# Annunci a norma: modello unico

## Regole
1. **Classe energetica e indice di prestazione energetica** sempre presenti (obbligo per gli annunci di
   vendita e locazione, D.Lgs. 192/2005). Senza APE l'annuncio non esce.
2. **Stesso prezzo su ogni portale** e sul sito. Un ribasso si fa su tutti i portali lo stesso giorno, da Getrix.
3. **Niente parole enfatiche o non verificabili**: "occasione", "affare", "imperdibile", "unico", "svendo"
   (elenco in `_config/parametri.json`, controllato da `contraddizioni`).
4. Superficie dichiarata come "superficie commerciale" e calcolata con i coefficienti della scheda valutazione.
5. Piano, ascensore, stato, spese condominiali mensili, anno di costruzione se noto.
6. Foto reali e recenti, planimetria senza misure se non verificate.
7. Rif. annuncio = codice Vendilo.

## Modello

```
TITOLO: [Tipologia] [n] locali – [Via], [Zona] – [mq] mq
PREZZO: € [prezzo]
CLASSE ENERGETICA: [A4…G] – IPE [valore] kWh/m²anno
SUPERFICIE COMMERCIALE: [mq] mq | PIANO: [n] di [n] | ASCENSORE: [sì/no]
SPESE CONDOMINIALI: € [x]/mese | STATO: [da ristrutturare / buono / ristrutturato]

[3 righe: dove si trova e cosa c'è vicino – metro, scuole, servizi]
[3 righe: com'è la casa, ambiente per ambiente]
[1 riga: dotazioni – riscaldamento, infissi, esposizione]

Rif. [codice Vendilo] – FondoCasa Hub, Via Pietro Mascagni 35, Napoli – 081 18653202
```
