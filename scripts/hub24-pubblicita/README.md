# Pagina pubblicitaria di HUB 24

Regola di Nico (01/11/2026): quando nel PDF restano spazi vuoti si inserisce sempre una mezza pagina
pubblicitaria, alternando a rotazione FC Group Holding S.p.A. → FondoCasa network → WeUnit S.p.A. →
Henia Insurance Broker, sempre con i loghi ufficiali (mai loghi ricostruiti o scritti a testo).

- `marchi.json`: ordine di rotazione e testi di ogni marchio. Un marchio con `"pronto": false` viene saltato
  finché Nico non fornisce logo ufficiale e testi (`manca` dice cosa serve).
- `loghi/`: loghi ufficiali in versione per fondo scuro (PNG trasparente).
  - `weunit.png`: wunit.it bianco e arancio (dal logo ufficiale fornito da Nico).
  - `weunit-consulenti.png`: versione "Consulenti del credito".
  - `fondocasa.png`, `henia.png`: ritagliati dal piedino ufficiale (`scripts/hub24-social/piedino.png`).
- `stile.css`: stile della mezza pagina (navy, oro, cornice).

Uso:

    python3 scripts/hub24-pubblicita/inserisci.py public/hub24/AAAA-MM-GG.html --numero N
    python3 scripts/hub24-pubblicita/inserisci.py public/hub24/AAAA-MM-GG.html --numero N --senza-box   # WeUnit fuori stagione Voucher
    python3 scripts/hub24-pubblicita/inserisci.py public/hub24/AAAA-MM-GG.html --rimuovi

Lo script sostituisce l'eventuale pubblicità già presente (anche quella copiata dal numero precedente),
quindi va eseguito prima di rigenerare il PDF.
