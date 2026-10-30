"""Genera post Instagram/Facebook/LinkedIn (1080x1440, 3:4) e storia (1080x1920) di un numero di HUB 24.

Stile fisso FC Punto Hub: navy #0A1628, oro #C9A84C, bianco #FCFDFD, font Jost (titoli Jost Bold/ExtraBold),
logo HUB ufficiale in alto e piedino ufficiale (Fondocasa · wunit.it · Henia) in basso.

Uso:
  python3 scripts/hub24-social/genera.py public/hub24/AAAA-MM-GG.html --numero N \
      --kicker "Numero N · in uscita oggi" --titolo "Titolo d'apertura" --out cartella/
Produce: HUB24_nN_post_1080x1440.png e HUB24_nN_storia_1080x1920.png
"""
import argparse, asyncio, html, pathlib, shutil, tempfile
from playwright.async_api import async_playwright

QUI = pathlib.Path(__file__).resolve().parent

POST = """<html><head><meta charset="utf-8"><link rel="stylesheet" href="jost.css"><style>
body{{width:1080px;height:1440px}}
.logo{{top:56px;height:150px}}
.txt{{position:absolute;left:80px;right:80px;top:250px;text-align:center}}
h1{{font-size:{fs}px;margin-top:24px}}
.sub{{font-size:36px;margin:18px auto 0;max-width:880px}}
.paper{{width:740px;left:170px;top:{ptop}px;transform:rotate(-2deg)}}
.cta{{top:1150px;padding:26px 60px 24px}}
.cta strong{{font-size:48px}}.cta span{{font-size:32px}}
.pied{{bottom:56px;width:900px}}
</style></head><body><div class="c">
<img class="logo" src="logo-hub-bianco.png">
<div class="txt"><span class="kick">{kicker}</span><h1>{titolo}</h1><p class="sub">{sub}</p></div>
<div class="paper"><img src="cover.png"></div>
<div class="cta"><strong>{cta}</strong><span>Iscriviti su fondocasahub.com/hub24</span></div>
<img class="pied" src="piedino.png">
</div><script>
// adatta la copertina allo spazio libero tra testo e fascia CTA: mai sovrapposta, sempre intera
window.adatta = () => {{
  const t = document.querySelector('.txt').getBoundingClientRect();
  const c = document.querySelector('.cta').getBoundingClientRect();
  const box = document.querySelector('.paper'), img = box.querySelector('img');
  const ratio = img.naturalHeight / img.naturalWidth;
  const spazio = c.top - t.bottom - 70;               // margine sopra e sotto
  const maxW = parseFloat(getComputedStyle(box).width);
  const w = Math.max(320, Math.min(maxW, spazio / ratio));
  box.style.width = w + 'px';
  box.style.left = ((document.body.clientWidth - w) / 2) + 'px';
  box.style.top = (t.bottom + (spazio - w * ratio) / 2 + 35) + 'px';
}};
</script></body></html>"""

STORIA = """<html><head><meta charset="utf-8"><link rel="stylesheet" href="jost.css"><style>
body{{width:1080px;height:1920px}}
.logo{{top:220px;height:140px}}
.txt{{position:absolute;left:80px;right:80px;top:390px;text-align:center}}
h1{{font-size:{fs}px;margin-top:26px}}
.sub{{font-size:42px;margin:22px auto 0;max-width:880px}}
.paper{{width:800px;left:140px;top:{ptop}px;transform:rotate(-2deg)}}
.cta{{top:1400px;padding:32px 60px 30px}}
.cta strong{{font-size:56px}}.cta span{{font-size:38px}}
.pied{{top:1650px;width:860px}}
</style></head><body><div class="c">
<img class="logo" src="logo-hub-bianco.png">
<div class="txt"><span class="kick">{kicker}</span><h1>{titolo}</h1><p class="sub">{sub}</p></div>
<div class="paper"><img src="cover.png"></div>
<div class="cta"><strong>{cta}</strong><span>Iscriviti su fondocasahub.com/hub24</span></div>
<img class="pied" src="piedino.png">
</div><script>
// adatta la copertina allo spazio libero tra testo e fascia CTA: mai sovrapposta, sempre intera
window.adatta = () => {{
  const t = document.querySelector('.txt').getBoundingClientRect();
  const c = document.querySelector('.cta').getBoundingClientRect();
  const box = document.querySelector('.paper'), img = box.querySelector('img');
  const ratio = img.naturalHeight / img.naturalWidth;
  const spazio = c.top - t.bottom - 70;               // margine sopra e sotto
  const maxW = parseFloat(getComputedStyle(box).width);
  const w = Math.max(320, Math.min(maxW, spazio / ratio));
  box.style.width = w + 'px';
  box.style.left = ((document.body.clientWidth - w) / 2) + 'px';
  box.style.top = (t.bottom + (spazio - w * ratio) / 2 + 35) + 'px';
}};
</script></body></html>"""


async def main(a):
    out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
    tmp = pathlib.Path(tempfile.mkdtemp())
    for f in ("jost.css", "logo-hub-bianco.png", "piedino.png"):
        shutil.copy(QUI / f, tmp / f)
    lungo = len(a.titolo)
    # titolo più lungo = carattere più piccolo, così non va mai a capo oltre 3 righe
    fs_post = 112 if lungo <= 14 else 84 if lungo <= 40 else 64
    fs_story = 132 if lungo <= 14 else 96 if lungo <= 40 else 74
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1180, "height": 1600}, device_scale_factor=2)
        await pg.goto(pathlib.Path(a.html).resolve().as_uri(), wait_until="networkidle")
        await pg.add_style_tag(content=".nav{position:static!important}")
        await pg.evaluate("document.fonts.ready")
        # prima pagina del giornale fino al titolo d'apertura
        h = await pg.evaluate("Math.min(700, document.querySelector('#prima .lead .deck')?.getBoundingClientRect().bottom || 660)")
        await pg.screenshot(path=str(tmp / "cover.png"), clip={"x": 0, "y": 0, "width": 1180, "height": h + 10})
        valori = dict(kicker=html.escape(a.kicker), titolo=html.escape(a.titolo), sub=html.escape(a.sub), cta=html.escape(a.cta))
        jobs = [
            (POST.format(fs=fs_post, ptop=650 if lungo <= 40 else 700, **valori), 1080, 1440, f"HUB24_n{a.numero}_post_1080x1440.png"),
            (STORIA.format(fs=fs_story, ptop=900 if lungo <= 40 else 950, **valori), 1080, 1920, f"HUB24_n{a.numero}_storia_1080x1920.png"),
        ]
        for markup, w, hh, nome in jobs:
            f = tmp / (nome + ".html"); f.write_text(markup, encoding="utf-8")
            pg2 = await b.new_page(viewport={"width": w, "height": hh})
            await pg2.goto(f.as_uri(), wait_until="networkidle")
            await pg2.evaluate("document.fonts.ready")
            await pg2.evaluate("Promise.all([...document.images].map(i => i.decode())).then(() => window.adatta())")
            # controllo: nessun blocco di testo deve sovrapporsi alla copertina o alla fascia CTA
            sovrap = await pg2.evaluate("""(() => {const r=s=>document.querySelector(s).getBoundingClientRect();
              const t=r('.txt'), p=r('.paper'), c=r('.cta'), d=r('.pied');
              return {testo_su_giornale: t.bottom > p.top, giornale_su_cta: p.bottom > c.top + 4, cta_su_piedino: c.bottom > d.top};})()""")
            if any(sovrap.values()):
                print("ATTENZIONE sovrapposizione in", nome, sovrap)
            await pg2.screenshot(path=str(out / nome))
            print("creato", out / nome)
        await b.close()


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("html"); ap.add_argument("--numero", required=True)
    ap.add_argument("--kicker", default="Nuovo numero · gratis ogni domenica")
    ap.add_argument("--titolo", required=True)
    ap.add_argument("--sub", default="Casa, mutui, affitti e mercato di Napoli nel settimanale dell'Hub.")
    ap.add_argument("--cta", default="Ricevilo gratis ogni domenica")
    ap.add_argument("--out", default="out")
    asyncio.run(main(ap.parse_args()))
