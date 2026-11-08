"""Copertina 1200x630 per un articolo del blog di fondocasahub.com (anche immagine di condivisione og:image).

Stile fisso FC Punto Hub: navy #0A1628, oro #C9A84C, bianco #FCFDFD, font Jost, logo HUB ufficiale
e piedino ufficiale (Fondocasa · wunit.it · Henia), gli stessi delle immagini social di HUB 24.

Uso:
  python3 scripts/blog/copertina.py --categoria "Mutui & Credito" \
      --titolo "Bonus casa al 50% anche nel 2027: cosa cambia a Napoli" \
      --out public/images/blog/bonus-casa-2027.jpg
Stampa "ATTENZIONE" se il titolo non entra: in quel caso accorcialo (max ~80 caratteri).
"""
import argparse, asyncio, html, pathlib, shutil, tempfile
from playwright.async_api import async_playwright

QUI = pathlib.Path(__file__).resolve().parent
SOCIAL = QUI.parent / "hub24-social"

PAGINA = """<html><head><meta charset="utf-8"><link rel="stylesheet" href="jost.css"><style>
body{{width:1200px;height:630px}}
.logo{{position:absolute;left:64px;top:52px;height:120px;transform:none}}
.zona{{position:absolute;left:250px;right:64px;top:56px;bottom:120px;display:flex;flex-direction:column;justify-content:center}}
.kick{{align-self:flex-start;font-size:20px;padding:6px 14px}}
h1{{font-size:{fs}px;line-height:1.04;margin-top:22px;text-wrap:balance;letter-spacing:-.01em}}
.firma{{margin-top:22px;font-size:22px;font-weight:500;color:#C9A84C;letter-spacing:.06em}}
.riga{{position:absolute;left:64px;right:64px;bottom:92px;height:2px;background:#C9A84C;opacity:.5}}
.pied{{position:absolute;left:50%;transform:translateX(-50%);bottom:34px;width:760px}}
</style></head><body><div class="c">
<img class="logo" src="logo-hub-bianco.png">
<div class="zona"><span class="kick">{categoria}</span><h1>{titolo}</h1><div class="firma">Blog HUB · Napoli Vomero</div></div>
<div class="riga"></div>
<img class="pied" src="piedino.png">
</div></body></html>"""


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--categoria", required=True)
    ap.add_argument("--titolo", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    out = pathlib.Path(a.out).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        for f in ("jost.css", "logo-hub-bianco.png", "piedino.png"):
            shutil.copy(SOCIAL / f, tmp / f)
        async with async_playwright() as p:
            b = await p.chromium.launch()
            pg = await b.new_page(viewport={"width": 1200, "height": 630})
            # riduce il corpo del titolo finché la zona di testo non entra nello spazio disponibile
            for fs in (68, 62, 56, 50, 46):
                (tmp / "c.html").write_text(PAGINA.format(fs=fs, categoria=html.escape(a.categoria), titolo=html.escape(a.titolo)), "utf-8")
                await pg.goto((tmp / "c.html").as_uri())
                await pg.evaluate("document.fonts.ready")
                await pg.wait_for_timeout(300)
                trabocca = await pg.evaluate("""() => { const z = document.querySelector('.zona');
                    return z.scrollHeight > z.clientHeight + 2; }""")
                if not trabocca:
                    break
            if trabocca:
                print("ATTENZIONE titolo troppo lungo per la copertina: accorcialo")
            png = tmp / "c.png"
            await pg.screenshot(path=str(png))
            await b.close()
        from PIL import Image
        Image.open(png).convert("RGB").save(out, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"copertina: {out} (corpo titolo {fs}px)")


asyncio.run(main())
