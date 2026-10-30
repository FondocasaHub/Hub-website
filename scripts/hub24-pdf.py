"""Genera il PDF A4 di un numero di HUB 24.
Uso: python3 scripts/hub24-pdf.py public/hub24/AAAA-MM-GG.html public/hub24/AAAA-MM-GG.pdf
"""
import asyncio, sys, pathlib
from playwright.async_api import async_playwright
PRINT_CSS = """
.nav{position:static!important}
body::before{display:none}
article,.box,.tk,tr,aside{break-inside:avoid}
html,body{background:#F5E1CF!important}
.page-label{break-after:avoid}
#economia,#credito,#mattone,#tech,#prima{break-inside:avoid}
.hub-band .grid > article,.hub-band aside{break-inside:avoid}
footer{break-inside:avoid}
html{scroll-behavior:auto}
"""
async def main(src, out):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width":1180,"height":1600}, color_scheme="light")
        await pg.goto(pathlib.Path(src).resolve().as_uri(), wait_until="networkidle")
        await pg.add_style_tag(content=PRINT_CSS)
        await pg.emulate_media(media="screen", color_scheme="light")
        await pg.evaluate("document.fonts.ready")
        await pg.pdf(path=out, format="A4", print_background=True, scale=0.72,
                     margin={"top":"8mm","bottom":"8mm","left":"6mm","right":"6mm"})
        await b.close()
asyncio.run(main(sys.argv[1], sys.argv[2]))
