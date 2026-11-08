#!/usr/bin/env node
// Aggiunge un articolo al blog di fondocasahub.com in TUTTI i punti necessari, partendo da un file JSON.
//
// Uso:  node scripts/blog/aggiungi-articolo.mjs scripts/blog/articoli/AAAA-MM-GG-<slug>.json
//
// Campi del JSON (obbligatori salvo indicazione):
//   slug           es. "bonus-casa-2027-cosa-cambia-napoli" (minuscole, numeri e trattini)
//   title          titolo H1 dell'articolo
//   metaTitle      <title> della pagina, max 60 caratteri
//   excerpt        anteprima/description, 120-160 caratteri
//   date           AAAA-MM-GG
//   publishedAt    AAAA-MM-GGTHH:MM:SS+01:00
//   category       es. "Mutui & Credito", "Mercato Napoli", "Fisco & Casa", "Vendere Casa", "Comprare Casa"
//   readTime       es. "4 min"
//   image          https://www.fondocasahub.com/images/blog/<file>.jpg (copertina 1200x630, vedi copertina.py)
//   imageAlt       testo alternativo della copertina
//   keywords       parole chiave separate da virgola
//   luoghi         (facoltativo) es. ["Napoli", "Vomero"]  → contentLocation nel JSON-LD
//   content        HTML dell'articolo (solo p, h2, h3, ul, ol, li, strong, a)
//   faq            (consigliato) [{ "q": "...", "a": "..." }]  → sezione visibile + FAQPage JSON-LD
//   fonti          (consigliato) [{ "titolo": "...", "url": "https://..." }]
//   llms           descrizione di una riga per public/llms.txt
//
// Modifica: src/pages/BlogPage.jsx, scripts/postbuild.js, scripts/prerender-ssr-pages.mjs,
// scripts/ssr-pages-entry.jsx, vercel.json, public/sitemap.xml, public/llms.txt.
// Non tocca nulla se lo slug esiste già. Dopo: npx vite build (deve passare senza ✗).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const file = process.argv[2];
if (!file) { console.error("Uso: node scripts/blog/aggiungi-articolo.mjs <articolo.json>"); process.exit(1); }
const a = JSON.parse(fs.readFileSync(file, "utf8"));

// ---------- controlli ----------
const errori = [];
const obbl = ["slug", "title", "metaTitle", "excerpt", "date", "publishedAt", "category", "readTime", "image", "imageAlt", "keywords", "content", "llms"];
for (const k of obbl) if (!a[k] || !String(a[k]).trim()) errori.push(`manca "${k}"`);
if (a.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.slug)) errori.push("slug non valido (solo minuscole, numeri, trattini)");
if (a.date && !/^\d{4}-\d{2}-\d{2}$/.test(a.date)) errori.push("date non nel formato AAAA-MM-GG");
if (a.metaTitle && a.metaTitle.length > 65) errori.push(`metaTitle troppo lungo (${a.metaTitle.length} > 65)`);
if (a.excerpt && (a.excerpt.length < 110 || a.excerpt.length > 165)) errori.push(`excerpt di ${a.excerpt.length} caratteri (serve 110-165)`);
if (a.image && !a.image.startsWith("https://www.fondocasahub.com/images/blog/")) errori.push("image deve stare in https://www.fondocasahub.com/images/blog/");
if (a.image && !fs.existsSync(path.join(ROOT, "public", a.image.replace("https://www.fondocasahub.com/", "")))) errori.push(`copertina non trovata in public/: ${a.image}`);
if (a.content && !/<h2>/.test(a.content)) errori.push("content senza nessun <h2>");
if (a.faq && (!Array.isArray(a.faq) || a.faq.some((f) => !f.q || !f.a))) errori.push("faq deve essere [{q, a}]");
if (a.fonti && (!Array.isArray(a.fonti) || a.fonti.some((f) => !f.titolo || !/^https?:\/\//.test(f.url || "")))) errori.push("fonti deve essere [{titolo, url}]");
for (const k of ["title", "metaTitle", "excerpt", "imageAlt", "llms"]) if (a[k] && /["`]|\$\{/.test(a[k])) errori.push(`"${k}" non deve contenere virgolette doppie, backtick o \${`);
if (errori.length) { console.error("ERRORI:\n - " + errori.join("\n - ")); process.exit(1); }

const leggi = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const scrivi = (p, s) => fs.writeFileSync(path.join(ROOT, p), s, "utf8");
const pageSlug = `blog-${a.slug}`;
const url = `https://www.fondocasahub.com/blog/${a.slug}`;
const esc1 = (s) => String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");

// Inserisce `testo` subito dopo l'ULTIMA riga che soddisfa `re` (dentro il blocco che parte da `inizio`)
function dopoUltima(src, re, testo, inizio = 0, fine = src.length) {
  const righe = src.slice(inizio, fine).split("\n");
  let idx = -1;
  righe.forEach((r, i) => { if (re.test(r)) idx = i; });
  if (idx < 0) throw new Error(`ancora non trovata: ${re}`);
  righe.splice(idx + 1, 0, testo);
  return src.slice(0, inizio) + righe.join("\n") + src.slice(fine);
}

// ---------- 1. BlogPage.jsx ----------
let blog = leggi("src/pages/BlogPage.jsx");
if (blog.includes(`slug: ${JSON.stringify(a.slug)}`) || blog.includes(`slug: "${a.slug}"`)) {
  console.error(`Lo slug "${a.slug}" esiste già nel blog: niente da fare.`); process.exit(1);
}
const campi = ["slug", "title", "excerpt", "date", "publishedAt", "category", "readTime", "image", "imageAlt", "keywords", "luoghi", "content", "faq", "fonti"];
const obj = "  {\n" + campi.filter((k) => a[k] !== undefined)
  .map((k) => `    ${k}: ${JSON.stringify(a[k], null, 2).replace(/\n/g, "\n    ")},`).join("\n") + "\n  },";
const ancora = "export const ARTICLES = [\n";
if (!blog.includes(ancora)) throw new Error("ARTICLES non trovato in BlogPage.jsx");
blog = blog.replace(ancora, ancora + obj + "\n");
scrivi("src/pages/BlogPage.jsx", blog);

// ---------- 2. postbuild.js (title, description, canonical, og:image) ----------
let pb = leggi("scripts/postbuild.js");
const pmStart = pb.indexOf("const PAGE_META = {");
const pmEnd = pb.indexOf("\n};", pmStart);
if (pmStart < 0 || pmEnd < 0) throw new Error("PAGE_META non trovato in postbuild.js");
const voce = `,\n  '${pageSlug}': {\n    title: '${esc1(a.metaTitle)}',\n    desc: '${esc1(a.excerpt)}',\n    canonical: '${url}',\n    image: '${a.image}',\n    imageAlt: '${esc1(a.imageAlt)}'\n  }`;
const corpoPM = pb.slice(pmStart, pmEnd).replace(/\s*$/, "");
if (!corpoPM.endsWith("}")) throw new Error("struttura di PAGE_META inattesa");
pb = pb.slice(0, pmStart) + corpoPM + voce + pb.slice(pmEnd);
scrivi("scripts/postbuild.js", pb);

// ---------- 3. prerender-ssr-pages.mjs ----------
let pr = leggi("scripts/prerender-ssr-pages.mjs");
const tipi = a.faq && a.faq.length ? "['BlogPosting', 'FAQPage']" : "['BlogPosting']";
pr = dopoUltima(pr, /^\s*\{ slug: 'blog-[^']+', contentOnly: true/, `  { slug: '${pageSlug}', contentOnly: true, expectTypes: ${tipi} },`);
pr = pr.replace(/(\/\/ Blog: l'elenco e i )(\d+)( articoli)/, (_, p1, n, p3) => `${p1}${Number(n) + 1}${p3}`);
scrivi("scripts/prerender-ssr-pages.mjs", pr);

// ---------- 4. ssr-pages-entry.jsx (3 elenchi) ----------
let se = leggi("scripts/ssr-pages-entry.jsx");
const blocco = (nome, chiusura) => {
  const i = se.indexOf(nome);
  const f = i < 0 ? -1 : se.indexOf(chiusura, i);
  if (i < 0 || f < 0) throw new Error(`${nome} non trovato in ssr-pages-entry.jsx`);
  return [i, f];
};
let [i1, f1] = blocco("const PAGES = {", "\n};");
se = dopoUltima(se, /^\s*"blog-[^"]+": BlogPage,/, `  "${pageSlug}": BlogPage,`, i1, f1);
let [i2, f2] = blocco("const CON_FOOTER", "\n]);");
se = dopoUltima(se, /^\s*'blog-[^']+',/, `  '${pageSlug}',`, i2, f2);
let [i3, f3] = blocco("const PAGE_PROPS = {", "\n};");
se = dopoUltima(se, /^\s*"blog-[^"]+": \{ navigate: noop/, `  "${pageSlug}": { navigate: noop, colors: COLORS, initialSlug: "${a.slug}" },`, i3, f3);
scrivi("scripts/ssr-pages-entry.jsx", se);

// ---------- 5. vercel.json (rewrite) ----------
let vj = leggi("vercel.json");
const ultimo = [...vj.matchAll(/"destination": "\/blog-[^"]+\.html"\n(\s*)\}/g)].pop();
if (!ultimo) throw new Error("rewrite del blog non trovate in vercel.json");
const ins = ultimo.index + ultimo[0].length;
const ind = ultimo[1];
vj = vj.slice(0, ins) + `,\n${ind}{\n${ind}  "source": "/blog/${a.slug}",\n${ind}  "destination": "/${pageSlug}.html"\n${ind}}` + vj.slice(ins);
JSON.parse(vj); // deve restare JSON valido
scrivi("vercel.json", vj);

// ---------- 6. sitemap.xml ----------
let sm = leggi("public/sitemap.xml");
if (!sm.includes("<!-- Blog Articles -->")) throw new Error("<!-- Blog Articles --> non trovato nella sitemap");
sm = sm.replace("<!-- Blog Articles -->", `<!-- Blog Articles -->\n  <url>\n    <loc>${url}</loc>\n    <lastmod>${a.date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
sm = sm.replace(/(<loc>https:\/\/www\.fondocasahub\.com\/blog<\/loc>\s*<lastmod>)[^<]*(<\/lastmod>)/, `$1${a.date}$2`);
scrivi("public/sitemap.xml", sm);

// ---------- 7. llms.txt ----------
let ll = leggi("public/llms.txt");
ll = dopoUltima(ll, /^- \[Blog\]\(https:\/\/www\.fondocasahub\.com\/blog\)/, `- [${a.title}](${url}): ${a.llms}`);
scrivi("public/llms.txt", ll);

console.log(`OK: articolo "${a.slug}" aggiunto in 7 file. Ora: npx vite build (controlla che ${pageSlug}.html abbia ✓).`);
