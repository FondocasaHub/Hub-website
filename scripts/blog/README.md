# Blog settimanale da HUB 24

Ogni martedì un articolo nuovo sul blog (fondocasahub.com/blog), scritto partendo dalla notizia più
importante dell'ultimo numero di HUB 24 e riscritto per chi compra, vende, affitta o chiede un mutuo a Napoli.
Lo prepara un'attività programmata; va online solo dopo l'"ok" di Nico.

## File

- `copertina.py`: copertina 1200x630 nello stile FC Punto Hub (navy, oro, Jost, logo HUB, piedino ufficiale).
  È anche l'immagine di condivisione (og:image).
- `aggiungi-articolo.mjs`: aggiunge l'articolo in tutti i 7 punti necessari (BlogPage.jsx, postbuild.js,
  prerender-ssr-pages.mjs, ssr-pages-entry.jsx, vercel.json, sitemap.xml, llms.txt) da un file JSON.
  I campi sono descritti in testa allo script.
- `articoli/AAAA-MM-GG-<slug>.json`: i testi di ogni articolo pubblicato (archivio).

## Procedura

```bash
python3 scripts/blog/copertina.py --categoria "Mutui & Credito" --titolo "..." --out public/images/blog/<slug>.jpg
node scripts/blog/aggiungi-articolo.mjs scripts/blog/articoli/AAAA-MM-GG-<slug>.json
npm run build        # postbuild + prerender: la riga di blog-<slug>.html deve avere ✓
```

## Regole di contenuto (SEO e GEO)

- Una sola notizia, un solo intento di ricerca. Titolo con la parola chiave e "Napoli" quando ha senso.
- Primo paragrafo = risposta diretta in 2-3 frasi ("In breve"), citabile da Google e dalle IA.
- 600-900 parole, h2 con domande reali, numeri con data e fonte, un paragrafo "Cosa significa per chi
  vende / compra / affitta a Napoli" con dati di Napoli o del Vomero.
- 3-5 FAQ con risposte autonome di 1-3 frasi (diventano FAQPage JSON-LD).
- Fonti autorevoli con link (Agenzia Entrate, Banca d'Italia, BCE, Istat, Sole 24 Ore, ANSA, idealista...).
- 2-3 link interni (es. /valuta-il-tuo-immobile, /consulente-mutuo-napoli, /agenzia-immobiliare-vomero-napoli,
  /zero-vincoli-60, /hub24) e la chiusura con invito a iscriversi a HUB 24.
- Testo originale: non copiare frasi dal numero di HUB 24 né dalle fonti (le pagine di HUB 24 sono noindex).
- Mai informazioni interne (obiettivi, KPI, compensi, Vendilo, Area Agenti) né dati di clienti.
- Zero Vincoli 60: non garantisce la vendita e l'agenzia non compra l'immobile; garantisce il recesso
  senza penali. Polizze: Henia Broker, RUI B000533295.
