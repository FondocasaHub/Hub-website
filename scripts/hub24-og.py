"""Anteprima per la condivisione del link di un numero di HUB 24 (WhatsApp, Facebook, LinkedIn, iMessage...).

Crea public/hub24/AAAA-MM-GG-og.jpg (1200x630, stesso stile di og-hub24.jpg) con numero, data, titolo d'apertura
e copertina del numero, e inserisce nel <head> del numero i meta Open Graph / Twitter che la richiamano.
Va eseguito dopo aver scritto il numero e aggiornato index.json (legge titolo e sommario da li').

Se il numero e' l'ultimo di index.json aggiorna anche l'anteprima della pagina iscrizioni (og-hub24.jpg) con la sua
copertina e cambia in public/hub24/index.html solo l'indirizzo dell'immagine (?v=versione), nient'altro.

Uso: python3 scripts/hub24-og.py public/hub24/AAAA-MM-GG.html
"""
import asyncio, base64, hashlib, html, json, pathlib, re, sys
from playwright.async_api import async_playwright

SITO = "https://www.fondocasahub.com/hub24/"
MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"]

TPL = """<html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Libre+Caslon+Text:ital,wght@0,700;1,400&family=IBM+Plex+Sans+Condensed:wght@500;600&display=swap">
<style>*{{margin:0;box-sizing:border-box}}
body{{width:1200px;height:630px;overflow:hidden;background:radial-gradient(ellipse at 70% 40%,#14294a 0%,#0A1628 65%);color:#FCFDFD;position:relative}}
.k{{position:absolute;left:64px;top:46px;font-family:'IBM Plex Sans Condensed';font-weight:600;font-size:24px;letter-spacing:.14em;text-transform:uppercase;color:#C9A84C;border:2px solid #C9A84C;padding:9px 16px}}
h1{{position:absolute;left:60px;top:112px;font-family:'Libre Caslon Display';font-weight:400;font-size:128px;line-height:1}}
h1 b{{color:#C9A84C;font-weight:400}}
.t{{position:absolute;left:64px;top:262px;width:590px;font-family:'Libre Caslon Text';font-style:italic;font-size:{fs}px;line-height:1.22;color:#F5E1CF;text-wrap:balance}}
.cta{{position:absolute;left:64px;bottom:56px;background:#C9A84C;color:#0A1628;font-family:'Libre Caslon Text';font-weight:700;font-size:30px;padding:16px 26px}}
.p{{position:absolute;right:46px;top:50%;width:448px;transform:translateY(-50%) rotate(-2deg);box-shadow:0 18px 44px rgba(0,0,0,.55)}}
.p img{{width:100%;display:block}}
</style></head><body>
<span class="k">{kicker}</span><h1>HUB <b>24</b></h1><p class="t">{titolo}</p>
<div class="p"><img src="{cover}"></div><div class="cta">Leggi gratis su fondocasahub.com/hub24</div>
</body></html>"""


TPL_ISCRIZIONE = TPL.replace('<p class="t">{titolo}</p>', '<p class="t" style="font-size:40px;width:560px">Casa, mutui, affitti e mercato di Napoli nella tua email.</p>') \
    .replace("Leggi gratis su fondocasahub.com/hub24", "Iscriviti su fondocasahub.com/hub24")


async def main(src):
    src = pathlib.Path(src).resolve()
    data = src.stem
    voci = json.loads((src.parent / "index.json").read_text(encoding="utf-8"))
    voce = next((v for v in voci if v["file"] == src.name), None)
    if not voce:
        sys.exit(f"{src.name} non e' in index.json: aggiungi prima la voce")
    a, m, g = data.split("-")
    data_lunga = f"{int(g)} {MESI[int(m) - 1]} {a}"
    out = src.parent / f"{data}-og.jpg"
    tmp = src.parent / f".{data}-cover.png"
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1180, "height": 1400}, device_scale_factor=1.5)
        await pg.goto(src.as_uri(), wait_until="networkidle")
        await pg.add_style_tag(content=".nav{position:static!important}")
        await pg.evaluate("document.fonts.ready")
        h = await pg.evaluate("Math.min(820, document.querySelector('#prima .lead .deck')?.getBoundingClientRect().bottom + 160 || 800)")
        await pg.screenshot(path=str(tmp), clip={"x": 0, "y": 0, "width": 1180, "height": h})
        titolo = voce["titolo"]
        fs = 38 if len(titolo) <= 60 else 33 if len(titolo) <= 80 else 29
        markup = TPL.format(kicker=f"Numero {voce['numero']} · {data_lunga}", titolo=html.escape(titolo), fs=fs, cover="data:image/png;base64," + base64.b64encode(tmp.read_bytes()).decode())
        pg2 = await b.new_page(viewport={"width": 1200, "height": 630})
        await pg2.set_content(markup, wait_until="networkidle")
        await pg2.evaluate("document.fonts.ready")
        await pg2.screenshot(path=str(out), type="jpeg", quality=88)
        ultimo = voci[0]["file"] == src.name
        if ultimo:
            # anteprima della pagina iscrizioni (fondocasahub.com/hub24) con la copertina del numero in uscita
            markup = TPL_ISCRIZIONE.format(kicker="Gratis · ogni domenica", titolo="", fs=40,
                                           cover="data:image/png;base64," + base64.b64encode(tmp.read_bytes()).decode())
            await pg2.set_content(markup, wait_until="networkidle")
            await pg2.evaluate("document.fonts.ready")
            await pg2.screenshot(path=str(src.parent / "og-hub24.jpg"), type="jpeg", quality=88)
        await b.close()
    tmp.unlink(missing_ok=True)

    # versione dell'immagine nell'indirizzo: se l'immagine cambia, cambia l'indirizzo e i social non usano quella in cache
    ver = lambda f: hashlib.md5(f.read_bytes()).hexdigest()[:8]
    titolo_og = html.escape(f"HUB 24 n. {voce['numero']} · {voce['titolo']}", quote=True)
    descr = html.escape(voce.get("sommario") or "Casa, mutui, affitti e mercato di Napoli. Ogni domenica, gratis.", quote=True)
    meta = f'''<!-- og:inizio -->
<meta name="description" content="{descr}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="FondoCasa Hub">
<meta property="og:locale" content="it_IT">
<meta property="og:title" content="{titolo_og}">
<meta property="og:description" content="{descr}">
<meta property="og:url" content="{SITO}{src.name}">
<meta property="og:image" content="{SITO}{out.name}?v={ver(out)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{SITO}{out.name}?v={ver(out)}">
<!-- og:fine -->
'''
    s = src.read_text(encoding="utf-8")
    s = re.sub(r"<!-- og:inizio -->.*?<!-- og:fine -->\n?", "", s, flags=re.S)
    s = s.replace("<title>", meta + "<title>", 1)
    s = re.sub(r"<title>.*?</title>", f"<title>{titolo_og}</title>", s, count=1, flags=re.S)
    src.write_text(s, encoding="utf-8")
    print("creato", out, "e aggiornati i meta di", src.name)
    if ultimo:
        # cambia l'indirizzo dell'immagine (?v=versione) cosi' WhatsApp/Facebook/LinkedIn non mostrano quella vecchia in cache
        pag = src.parent / "index.html"
        t = pag.read_text(encoding="utf-8")
        t2 = re.sub(r'(content="https://www\.fondocasahub\.com/hub24/og-hub24\.jpg)(\?[nv]=[0-9a-f]+)?"', rf'\1?v={ver(src.parent / "og-hub24.jpg")}"', t)
        pag.write_text(t2, encoding="utf-8")
        print("aggiornata anteprima della pagina iscrizioni: og-hub24.jpg?v=%s" % ver(src.parent / "og-hub24.jpg"))


asyncio.run(main(sys.argv[1]))
