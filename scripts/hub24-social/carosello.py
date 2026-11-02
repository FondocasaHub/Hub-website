"""Carosello Instagram/Facebook di un numero di HUB 24 (stile ufficiale FC Punto Hub).

Slide 1080x1440 (3:4, non tagliate in griglia se caricate con l'icona delle due frecce): navy #0A1628, oro #C9A84C,
bianco #FCFDFD, font Jost, logo HUB in alto, piedino ufficiale in basso, numero di slide in alto a destra.
I testi stanno in un file JSON (vedi esempio in scripts/hub24-social/caroselli/), con slide di tipo:
  gancio   {kicker, titolo, sub}                       titolo: <b>...</b> per le parole in oro
  dato     {etichetta, numero, titolo, testo, nota}    numero grande in oro (es. "21% → 10%")
  lista    {etichetta, titolo, voci: [[chi, testo], ...]}
  chiusura {kicker, titolo, sub}                       mostra la copertina del numero + fascia iscrizione
Uso:
  python3 scripts/hub24-social/carosello.py public/hub24/AAAA-MM-GG.html testi.json --out cartella/
Produce HUB24_nN_CAROSELLO_01_di_05_1080x1440.png ... (N preso dal JSON, campo "numero").
"""
import argparse, asyncio, json, pathlib, shutil, tempfile
from playwright.async_api import async_playwright

QUI = pathlib.Path(__file__).resolve().parent

BASE = """<html><head><meta charset="utf-8"><link rel="stylesheet" href="jost.css"><style>
body{width:1080px;height:1440px}
.logo{top:52px;height:118px}
.n{position:absolute;right:64px;top:70px;font-weight:600;font-size:26px;letter-spacing:.12em;color:#C9A84C}
.box{position:absolute;left:96px;right:96px;top:230px;bottom:250px;display:flex;flex-direction:column;justify-content:center}
.lab{font-weight:600;font-size:28px;letter-spacing:.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:26px}
.kick{font-size:28px;align-self:flex-start;margin-bottom:34px}
h1{text-wrap:balance}
.g h1{font-size:100px;line-height:1.0}
.g .sub{font-size:40px;margin-top:34px;max-width:860px}
.num{font-weight:800;font-size:150px;overflow:hidden;line-height:1;color:#C9A84C;letter-spacing:-.02em;white-space:nowrap}
.d h1{font-size:62px;line-height:1.08;margin-top:30px}
.txt{font-size:36px;line-height:1.38;margin-top:28px;opacity:.94}
.txt b{color:#C9A84C;font-weight:700}
.nota{font-size:23px;line-height:1.35;margin-top:34px;color:#FCFDFD;opacity:.6}
.l h1{font-size:66px;line-height:1.05;margin-bottom:34px}
.voce{border-top:2px solid rgba(201,168,76,.45);padding:24px 0}
.voce:last-child{border-bottom:2px solid rgba(201,168,76,.45)}
.voce strong{display:block;font-weight:700;font-size:30px;letter-spacing:.12em;text-transform:uppercase;color:#C9A84C;margin-bottom:6px}
.voce span{font-size:34px;line-height:1.32}
.scorri{position:absolute;right:96px;bottom:250px;font-weight:600;font-size:30px;letter-spacing:.1em;color:#C9A84C}
.ch{position:absolute;left:96px;right:96px;top:220px;text-align:center}
.ch .kick{margin:0 auto 26px}
.ch h1{font-size:76px;line-height:1.02}
.ch .sub{font-size:34px;margin-top:20px}
.paper{width:640px;left:220px;top:640px;transform:rotate(-2deg)}
.cta{top:1110px;padding:24px 60px 22px}
.cta strong{font-size:46px}.cta span{font-size:31px}
.pied{bottom:52px;width:880px}
</style></head><body><div class="c">
<img class="logo" src="logo-hub-bianco.png"><span class="n">{n}</span>
{corpo}
<img class="pied" src="piedino.png">
</div></body></html>"""


def corpo(s, ultimo):
    t = s["tipo"]
    freccia = "" if ultimo else '<div class="scorri">Scorri →</div>'
    if t == "gancio":
        return f'<div class="box g"><span class="kick">{s["kicker"]}</span><h1>{s["titolo"]}</h1><p class="sub">{s.get("sub","")}</p></div>{freccia}'
    if t == "dato":
        nota = f'<p class="nota">{s["nota"]}</p>' if s.get("nota") else ""
        return (f'<div class="box d"><div class="lab">{s["etichetta"]}</div><div class="num">{s["numero"]}</div>'
                f'<h1>{s["titolo"]}</h1><p class="txt">{s["testo"]}</p>{nota}</div>{freccia}')
    if t == "lista":
        voci = "".join(f'<div class="voce"><strong>{a}</strong><span>{b}</span></div>' for a, b in s["voci"])
        nota = f'<p class="nota">{s["nota"]}</p>' if s.get("nota") else ""
        return f'<div class="box l"><div class="lab">{s["etichetta"]}</div><h1>{s["titolo"]}</h1>{voci}{nota}</div>{freccia}'
    if t == "chiusura":
        return (f'<div class="ch"><span class="kick">{s["kicker"]}</span><h1>{s["titolo"]}</h1><p class="sub">{s.get("sub","")}</p></div>'
                '<div class="paper"><img src="cover.png"></div>'
                '<div class="cta"><strong>Ricevilo gratis ogni domenica</strong><span>Iscriviti su fondocasahub.com/hub24</span></div>')
    raise SystemExit(f"tipo di slide sconosciuto: {t}")


async def main(a):
    spec = json.loads(pathlib.Path(a.testi).read_text(encoding="utf-8"))
    out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
    tmp = pathlib.Path(tempfile.mkdtemp())
    for f in ("jost.css", "logo-hub-bianco.png", "piedino.png"):
        shutil.copy(QUI / f, tmp / f)
    slide = spec["slide"]; tot = len(slide)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1180, "height": 1600}, device_scale_factor=2)
        await pg.goto(pathlib.Path(a.html).resolve().as_uri(), wait_until="networkidle")
        await pg.add_style_tag(content=".nav{position:static!important}")
        await pg.evaluate("document.fonts.ready")
        h = await pg.evaluate("Math.min(700, document.querySelector('#prima .lead .deck')?.getBoundingClientRect().bottom || 660)")
        await pg.screenshot(path=str(tmp / "cover.png"), clip={"x": 0, "y": 0, "width": 1180, "height": h + 10})
        for i, s in enumerate(slide, 1):
            html = BASE.replace("{n}", f"{i:02d} / {tot:02d}").replace("{corpo}", corpo(s, i == tot))
            f = tmp / f"s{i}.html"; f.write_text(html, encoding="utf-8")
            pg2 = await b.new_page(viewport={"width": 1080, "height": 1440})
            await pg2.goto(f.as_uri(), wait_until="networkidle")
            await pg2.evaluate("document.fonts.ready")
            # il numero grande si rimpicciolisce finche' non sta in una riga
            await pg2.evaluate("""(() => {const n=document.querySelector('.num'); if(!n) return;
              let fs=150; while(n.scrollWidth > n.clientWidth && fs > 60){fs-=4; n.style.fontSize=fs+'px';}})()""")
            fuori = await pg2.evaluate("""(() => {const b=document.querySelector('.box,.ch'); if(!b) return false;
              const r=b.getBoundingClientRect(); return b.scrollHeight > b.clientHeight + 2 || r.bottom > 1190;})()""")
            if fuori:
                print(f"ATTENZIONE testo troppo lungo nella slide {i}: accorcialo")
            nome = out / f"HUB24_n{spec['numero']}_CAROSELLO_{i:02d}_di_{tot:02d}_1080x1440.png"
            await pg2.screenshot(path=str(nome))
            await pg2.close()
            print("creato", nome)
        await b.close()


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("html"); ap.add_argument("testi"); ap.add_argument("--out", default="out")
    asyncio.run(main(ap.parse_args()))
