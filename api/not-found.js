// Vercel Serverless Function — pagina 404 reale per le route non riconosciute.
//
// Perché esiste: prima di questa funzione, qualunque URL inesistente veniva
// gestito dal rewrite di fallback in vercel.json ("/(.*)" -> "/index.html"),
// che risponde sempre con status 200 (è così che funzionano i rewrite: non
// possono cambiare lo status code). Il risultato era un "soft 404": Google e
// gli altri crawler ricevevano una pagina 200 con il contenuto della home al
// posto di un vero errore, con il rischio di indicizzare URL inesistenti o
// refusi e sprecare budget di scansione.
//
// Questa funzione viene raggiunta solo dagli URL che NON hanno già un
// rewrite esplicito in vercel.json (tutte le pagine reali del sito — home,
// /grazie, quartieri, blog, servizi — sono instradate prima di arrivare
// qui). Risponde quindi con un vero status 404 e una pagina "non trovata"
// autonoma, senza dipendere dal bundle JS dell'app React né da file
// generati in fase di build.
//
// Nota tecnica: il progetto ha "type": "module" in package.json, quindi
// questo file usa export/import ESM (non require/module.exports). La
// funzione gemella api/meta.js usa invece la sintassi CommonJS e in
// produzione risponde con errore 500 (FUNCTION_INVOCATION_FAILED) — molto
// probabilmente proprio per questo disallineamento. Per non ereditare lo
// stesso problema, e per non dipendere da api/template.html (che nella
// pipeline di build attuale resta un placeholder mai popolato), questa
// funzione è scritta in ESM ed è completamente autosufficiente.

const PAGE = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pagina non trovata | FondoCasa Hub</title>
  <meta name="description" content="La pagina che cerchi non esiste o è stata spostata. Torna alla home di FondoCasa Hub, agenzia immobiliare al Vomero di Napoli." />
  <meta name="robots" content="noindex, follow" />
  <link rel="canonical" href="https://www.fondocasahub.com/" />
  <link rel="icon" type="image/png" href="/favicon.png">
  <style>
    body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; background:#F7F5F0; color:#1f2a24; }
    main { max-width:640px; margin:14vh auto; padding:0 24px; text-align:center; }
    h1 { font-size:2.1rem; margin-bottom:.5rem; color:#2E5339; }
    p { color:#4a4a4a; font-size:1.05rem; line-height:1.5; margin-bottom:2rem; }
    a.cta { display:inline-block; background:#2E5339; color:#fff; text-decoration:none; padding:.85rem 1.75rem; border-radius:6px; font-weight:600; }
    a.cta:hover { background:#24422d; }
  </style>
</head>
<body>
  <main>
    <h1>404 — Pagina non trovata</h1>
    <p>La pagina che cerchi non esiste o è stata spostata. Trovi tutti i servizi e i quartieri seguiti da FondoCasa Hub dalla home.</p>
    <a class="cta" href="/">Torna alla home</a>
  </main>
</body>
</html>`;

export default async function handler(req, res) {
  res.writeHead(404, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=0, must-revalidate",
  });
  res.end(PAGE);
}
