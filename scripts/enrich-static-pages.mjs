/*
 * Arricchisce a build-time le pagine statiche che arrivano da public/ (generate
 * fuori da React) e che altrimenti resterebbero senza dati strutturati:
 *
 *   - /immobili/SH-*   -> JSON-LD RealEstateListing + immobile + BreadcrumbList
 *   - /immobili        -> JSON-LD CollectionPage/ItemList + BreadcrumbList
 *   - /hub24           -> ultimo numero + archivio gia' scritti nell'HTML
 *                         (la pagina li riempie via fetch: un crawler che non
 *                         esegue JS vedeva solo "Caricamento…")
 *
 * Ogni dato arriva dai file della pagina (index.json, dati.js, title, meta
 * description, og:image): niente e' inventato. Se un dato manca, quel campo
 * viene omesso. Lo script e' idempotente (salta le pagine che hanno gia' un
 * JSON-LD) e non fa mai fallire il build: gli errori sono solo avvisi.
 *
 * Le uscite di HUB 24 hanno "noindex" per scelta: qui non vengono toccate ne'
 * aggiunte alla sitemap.
 */
import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve("dist");
const SITE = "https://www.fondocasahub.com";
const PHONE = "+3908118653202";

const log = (...a) => console.log("[enrich]", ...a);
const warn = (...a) => console.warn("[enrich] ATTENZIONE:", ...a);
const exists = (p) => fs.existsSync(p);
const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, s) => fs.writeFileSync(p, s);
const unesc = (s) =>
  s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ldTag = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
const hasLd = (html) => /application\/ld\+json/.test(html);
const addToHead = (html, tag) => html.replace("</head>", `${tag}\n</head>`);
const pick = (html, re) => {
  const m = html.match(re);
  return m ? unesc(m[1]).trim() : null;
};

const WORDS = { un: 1, uno: 1, una: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6 };
const toNum = (t) => (/^\d+$/.test(t) ? Number(t) : WORDS[t.toLowerCase()] ?? null);
const NAPOLI_QUARTIERI = new Set([
  "napoli", "vomero", "arenella", "chiaia", "posillipo", "fuorigrotta", "soccavo", "bagnoli", "pianura",
  "poggioreale", "miano", "secondigliano", "scampia", "ponticelli", "barra", "san giovanni a teduccio",
  "mergellina", "colli aminei", "capodimonte", "stella", "san carlo all'arena", "mercato", "pendino",
]);
const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const dataIT = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MESI[m - 1]} ${y}`;
};

const organization = {
  "@type": "Organization",
  name: "FondoCasa Hub",
  url: SITE,
  telephone: PHONE,
};

function propertyFromText(text) {
  const t = text.toLowerCase();
  if (/capannone|magazzin|negozio|ufficio|terreno|locale commerciale/.test(t)) return "Place";
  if (/\bvilla\b|schiera|villetta|casa indipendente/.test(t)) return "SingleFamilyResidence";
  return "Apartment";
}

function enrichListing(dir, slug, entry) {
  const file = path.join(dir, slug, "index.html");
  let html = read(file);
  if (hasLd(html)) return false;

  const url = `${SITE}/immobili/${slug}/`;
  const title = pick(html, /<title>([\s\S]*?)<\/title>/);
  const desc = pick(html, /<meta name="description" content="([^"]*)"/);
  const ogTitle = pick(html, /<meta property="og:title" content="([^"]*)"/) || title;
  const image = pick(html, /<meta property="og:image" content="([^"]*)"/);

  let dati = null;
  const datiFile = path.join(dir, slug, "assets", "dati.js");
  if (exists(datiFile)) {
    const m = read(datiFile).match(/window\.DATI\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
    if (m) dati = JSON.parse(m[1]);
  }

  const zona = (entry?.zona || "").split("·")[0].trim();
  const locality = NAPOLI_QUARTIERI.has(zona.toLowerCase()) ? "Napoli" : zona || "Napoli";
  const street = (title || "").match(/^((?:Via|Viale|Corso|Piazza|Largo|Vico)\s[^,·]+?)\s*(?:,|·|$)/i)?.[1] || null;

  const address = {
    "@type": "PostalAddress",
    ...(street ? { streetAddress: street } : {}),
    addressLocality: locality,
    addressRegion: "NA",
    addressCountry: "IT",
  };

  const text = `${entry?.titolo || ""} ${ogTitle || ""} ${desc || ""}`;
  const type = propertyFromText(text);
  const property = {
    "@type": type,
    "@id": `${url}#immobile`,
    name: entry?.titolo || ogTitle,
    address,
    ...(dati?.posizione?.lat != null
      ? { geo: { "@type": "GeoCoordinates", latitude: dati.posizione.lat, longitude: dati.posizione.lon } }
      : {}),
    ...(image ? { image } : {}),
  };

  if (type !== "Place" && desc) {
    const size = desc.match(/(oltre\s+)?(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:m²|mq)/i);
    if (size) {
      const value = Number(size[2].replace(/\./g, ""));
      property.floorSize = {
        "@type": "QuantitativeValue",
        unitCode: "MTK",
        ...(size[1] ? { minValue: value } : { value }),
      };
    }
    const bed = desc.match(/(\d+|un|uno|due|tre|quattro|cinque|sei)\s+camer[ae]/i);
    if (bed && toNum(bed[1])) property.numberOfBedrooms = toNum(bed[1]);
    const bath = desc.match(/(\d+|un|uno|due|tre|quattro)\s+bagn[oi]/i);
    if (bath && toNum(bath[1])) property.numberOfBathroomsTotal = toNum(bath[1]);
    const rooms = desc.match(/(\d+|un|uno|due|tre|quattro|cinque|sei)\s+locali/i);
    if (rooms && toNum(rooms[1])) property.numberOfRooms = toNum(rooms[1]);
  }

  const availability =
    entry?.stato === "disponibile" ? "https://schema.org/InStock" : entry?.stato === "venduto" ? "https://schema.org/SoldOut" : null;
  const listing = {
    "@type": "RealEstateListing",
    "@id": `${url}#annuncio`,
    url,
    name: ogTitle,
    ...(desc ? { description: desc } : {}),
    inLanguage: "it-IT",
    ...(image ? { image } : {}),
    ...(entry?.data ? { datePosted: entry.data } : {}),
    about: { "@id": `${url}#immobile` },
    publisher: organization,
    ...(typeof entry?.prezzo === "number"
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: entry.prezzo,
            priceCurrency: "EUR",
            ...(availability ? { availability } : {}),
          },
        }
      : {}),
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Immobili", item: `${SITE}/immobili` },
      { "@type": "ListItem", position: 3, name: entry?.titolo || ogTitle, item: url },
    ],
  };

  html = addToHead(html, ldTag({ "@context": "https://schema.org", "@graph": [listing, property, breadcrumb] }));
  write(file, html);
  return true;
}

function enrichImmobili() {
  const dir = path.join(DIST, "immobili");
  const jsonFile = path.join(dir, "index.json");
  if (!exists(jsonFile)) return log("immobili: index.json assente, salto");
  const entries = JSON.parse(read(jsonFile));
  const bySlug = Object.fromEntries(entries.map((e) => [e.slug, e]));
  let n = 0;
  for (const slug of fs.readdirSync(dir)) {
    if (!/^SH-/.test(slug) || !exists(path.join(dir, slug, "index.html"))) continue;
    try {
      if (enrichListing(dir, slug, bySlug[slug])) n++;
    } catch (e) {
      warn(`immobili/${slug}:`, e.message);
    }
  }
  log(`immobili: JSON-LD aggiunto a ${n} schede`);

  const indexFile = path.join(dir, "index.html");
  if (exists(indexFile)) {
    let html = read(indexFile);
    if (!hasLd(html)) {
      const list = entries.filter((e) => e.stato !== "venduto");
      const name = pick(html, /<title>([\s\S]*?)<\/title>/) || "Immobili in vendita a Napoli e provincia";
      const desc = pick(html, /<meta name="description" content="([^"]*)"/);
      const page = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            "@id": `${SITE}/immobili#pagina`,
            url: `${SITE}/immobili`,
            name,
            ...(desc ? { description: desc } : {}),
            inLanguage: "it-IT",
            publisher: organization,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: list.length,
              itemListElement: list.map((e, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${SITE}/immobili/${e.slug}/`,
                name: e.titolo,
              })),
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
              { "@type": "ListItem", position: 2, name: "Immobili", item: `${SITE}/immobili` },
            ],
          },
        ],
      };
      write(indexFile, addToHead(html, ldTag(page)));
      log("immobili: JSON-LD aggiunto all'indice");
    }
  }
}

function enrichHub24() {
  const dir = path.join(DIST, "hub24");
  const indexFile = path.join(dir, "index.html");
  const jsonFile = path.join(dir, "index.json");
  if (!exists(indexFile) || !exists(jsonFile)) return log("hub24: file assenti, salto");
  let html = read(indexFile);
  if (!html.includes("<p>Caricamento…</p>")) return log("hub24: gia' pre-renderizzato, salto");
  const list = JSON.parse(read(jsonFile)).sort((a, b) => (a.data < b.data ? 1 : -1));
  const n = list[0];
  if (!n) return;

  const ultimo =
    `<div><p class="data">${dataIT(n.data)}</p><h3>${esc(n.titolo)}</h3><p>${esc(n.sommario || "")}</p></div>` +
    `<div class="azioni"><a class="bt pieno" href="/hub24/${esc(n.file)}">Leggi online</a>` +
    (n.pdf ? `<a class="bt" href="/hub24/${esc(n.pdf)}" target="_blank" rel="noopener">Scarica il PDF</a>` : "") +
    `</div>`;
  html = html
    .replace('<span id="ultimo-n"></span>', `<span id="ultimo-n">Numero ${n.numero}</span>`)
    .replace('<div class="ultimo" id="ultimo"><p>Caricamento…</p></div>', `<div class="ultimo" id="ultimo">${ultimo}</div>`);

  if (list.length > 1) {
    const righe = list
      .map(
        (x) =>
          `<tr><td class="n">N. ${x.numero}</td><td>${esc(x.titolo)}<br><small>${dataIT(x.data)}</small></td>` +
          `<td class="l"><a href="/hub24/${esc(x.file)}">Leggi</a>` +
          (x.pdf ? `<a href="/hub24/${esc(x.pdf)}" target="_blank" rel="noopener">PDF</a>` : "") +
          `</td></tr>`
      )
      .join("");
    html = html
      .replace('<section id="archivio" hidden>', '<section id="archivio">')
      .replace('<tbody id="righe"></tbody>', `<tbody id="righe">${righe}</tbody>`);
  }
  write(indexFile, html);
  log(`hub24: pre-renderizzati ultimo numero (n. ${n.numero}) e archivio (${list.length} uscite)`);
}

for (const [name, fn] of [["immobili", enrichImmobili], ["hub24", enrichHub24]]) {
  try {
    fn();
  } catch (e) {
    warn(`${name}:`, e.message);
  }
}
