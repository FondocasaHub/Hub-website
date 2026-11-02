"""Inserisce (o sostituisce) la mezza pagina pubblicitaria in un numero di HUB 24.

Rotazione fissa indicata da Nico: FC Group Holding -> FondoCasa -> WeUnit -> Henia (vedi marchi.json).
Il marchio del numero N e' ordine[N % 4]; se non e' "pronto" si passa al successivo pronto.

Uso:
  python3 scripts/hub24-pubblicita/inserisci.py public/hub24/AAAA-MM-GG.html --numero N [--marchio weunit] [--senza-box]
  python3 scripts/hub24-pubblicita/inserisci.py public/hub24/AAAA-MM-GG.html --rimuovi
La sezione va subito prima del <footer>; il logo e' incorporato (data URI) cosi' il file resta autosufficiente.
"""
import argparse, base64, html, json, pathlib, re, sys
from PIL import Image

QUI = pathlib.Path(__file__).resolve().parent
INIZIO_CSS, FINE_CSS = "/* adv:inizio */", "/* adv:fine */"
RE_SEZ = re.compile(r'\n?<section class="wrap adv" id="pubblicita".*?</section>\n', re.S)
CONTATTI = "Via Pietro Mascagni 35, Napoli · 081 18653202 · WhatsApp 392 457 9047"


def scegli(cfg, numero, forzato):
    if forzato:
        if not cfg["marchi"][forzato].get("pronto"):
            sys.exit(f"Il marchio {forzato} non e' pronto: {cfg['marchi'][forzato].get('manca')}")
        return forzato
    # pagina scelta da Nico per un numero preciso (campo "forzati": {"N": "marchio"}); se non e' pronta si torna alla rotazione
    f = cfg.get("forzati", {}).get(str(numero))
    if f:
        if cfg["marchi"].get(f, {}).get("pronto"):
            return f
        print(f"NOTA: per il numero {numero} era prevista la pagina {cfg['marchi'].get(f, {}).get('nome', f)} ma non e' pronta "
              f"({cfg['marchi'].get(f, {}).get('manca')}): uso la rotazione normale")
    ordine = cfg["ordine"]
    for k in range(len(ordine)):
        chiave = ordine[(numero + k) % len(ordine)]
        if cfg["marchi"][chiave].get("pronto"):
            if k:
                salt = ordine[numero % len(ordine)]
                print(f"NOTA: toccava a {cfg['marchi'][salt]['nome']} ma non e' pronto ({cfg['marchi'][salt].get('manca')}): uso {cfg['marchi'][chiave]['nome']}")
            return chiave
    sys.exit("Nessun marchio pronto in marchi.json")


def logo_uri(percorso):
    p = QUI / percorso
    w, h = Image.open(p).size
    return "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode(), w, h


def sezione(m, senza_box):
    uri, w, h = logo_uri(m["logo"])
    numeri = ""
    if m.get("numeri"):
        numeri = '    <div class="adv-nums">\n' + "".join(
            f'      <div><strong>{html.escape(a)}</strong><span>{html.escape(b)}</span></div>\n' for a, b in m["numeri"]) + "    </div>\n"
    punti = "".join(f"        <li>{html.escape(p)}</li>\n" for p in m.get("punti", []))
    box = m.get("box") if not senza_box else None
    box_html = (f'      <div class="adv-voucher">\n        <h3>{html.escape(box["titolo"])}</h3>\n'
                f'        <p>{html.escape(box["testo"])}</p>\n      </div>\n') if box else ""
    return f'''<section class="wrap adv" id="pubblicita" aria-label="Messaggio pubblicitario {html.escape(m['nome'])}">
  <p class="adv-tag">Messaggio pubblicitario</p>
  <div class="adv-box">
    <div class="adv-brand"><span class="adv-logo"><img src="{uri}" alt="{html.escape(m['logo_alt'])}" width="{w}" height="{h}" style="--h:{m.get('logo_h', 50)}px"></span><em>{html.escape(m['tagline'])}</em></div>
    <h2>{m['titolo']}</h2>
    <p class="adv-deck">{html.escape(m['deck'])}</p>
{numeri}    <div class="adv-cols{'' if box else ' solo'}">
      <ul>
{punti}      </ul>
{box_html}    </div>
    <div class="adv-cta"><strong>{html.escape(m['cta_titolo'])}</strong><span>{CONTATTI}</span></div>
    <p class="adv-legal">{html.escape(m['legale'])}</p>
  </div>
</section>
'''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file")
    ap.add_argument("--numero", type=int)
    ap.add_argument("--marchio")
    ap.add_argument("--senza-box", action="store_true", help="ometti il riquadro (es. Voucher Mutuo non attivo)")
    ap.add_argument("--rimuovi", action="store_true")
    a = ap.parse_args()
    f = pathlib.Path(a.file)
    s = f.read_text(encoding="utf-8")
    # togli eventuale pubblicita' precedente (sezione + stile)
    s = RE_SEZ.sub("\n", s)
    s = re.sub(re.escape(INIZIO_CSS) + r".*?" + re.escape(FINE_CSS) + r"\n?", "", s, flags=re.S)
    s = re.sub(r"\n/\* Mezza pagina pubblicitaria \*/.*?(?=</style>)", "\n", s, flags=re.S)
    if a.rimuovi:
        f.write_text(s, encoding="utf-8"); print("pubblicita' rimossa"); return
    if a.numero is None and not a.marchio:
        sys.exit("Serve --numero (o --marchio)")
    cfg = json.loads((QUI / "marchi.json").read_text(encoding="utf-8"))
    chiave = scegli(cfg, a.numero or 0, a.marchio)
    m = cfg["marchi"][chiave]
    css = INIZIO_CSS + "\n" + (QUI / "stile.css").read_text(encoding="utf-8") + FINE_CSS + "\n"
    i = s.rindex("</style>")
    s = s[:i] + css + s[i:]
    j = s.index("<footer")
    s = s[:j] + sezione(m, a.senza_box) + "\n" + s[j:]
    f.write_text(s, encoding="utf-8")
    print(f"pubblicita' inserita: {m['nome']}")


if __name__ == "__main__":
    main()
