// scripts/prerender-ssr-pages.mjs
// Vero prerender (SSR) per le pagine standalone SEO (landing di quartiere,
// strumento di valutazione, ecc.): a differenza di postbuild.js (che
// sostituisce solo title/meta/canonical via regex su una copia di
// dist/index.html), questo script renderizza davvero ciascun componente
// React a stringa — H1, sezioni, form, footer — e inietta anche i tag
// <head> gestiti da react-helmet-async (title, meta, canonical, og/twitter)
// e il JSON-LD specifico della pagina. Il file statico generato in dist/
// contiene quindi contenuto reale, non solo un <div id="root"> vuoto in
// attesa del bundle JS.
//
// Esegue con esbuild (già dipendenza di Vite) per bundlare
// scripts/ssr-pages-entry.jsx in un modulo CJS eseguibile da Node, senza
// dover passare da una build SSR completa di Vite.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const distDir = path.join(__dirname, '..', 'dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('[prerender-ssr-pages] ERRORE: dist/index.html non trovato. Esegui prima "vite build".');
  process.exit(1);
}

// Slug -> tipi JSON-LD attesi nel proprio blocco pagina (usato solo per la
// validazione del report finale, non incide sul rendering).
export const SSR_PAGES = [
  { slug: 'agenzia-immobiliare-vomero-napoli', expectTypes: ['RealEstateAgent', 'FAQPage'] },
  { slug: 'agenzia-immobiliare-arenella-napoli', expectTypes: ['RealEstateAgent', 'FAQPage'] },
  { slug: 'agenzia-immobiliare-chiaia-napoli', expectTypes: ['RealEstateAgent', 'FAQPage'] },
  { slug: 'agenzia-immobiliare-posillipo-napoli', expectTypes: ['RealEstateAgent', 'FAQPage'] },
  { slug: 'agenzia-immobiliare-fuorigrotta-napoli', expectTypes: ['RealEstateAgent', 'FAQPage'] },
  { slug: 'agenzia-immobiliare-colli-aminei-napoli', expectTypes: ['RealEstateAgent', 'FAQPage'] },
  { slug: 'valuta-il-tuo-immobile', expectTypes: ['Service', 'BreadcrumbList'] },
];

function bundleEntry() {
  const outfile = path.join(__dirname, '.ssr-pages-entry.cjs');
  esbuild.buildSync({
    entryPoints: [path.join(__dirname, 'ssr-pages-entry.jsx')],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node18',
    jsx: 'automatic',
    // React/ReactDOM/react-helmet-async devono girare nello stesso Node
    // process che li usa: le lasciamo esterne e le risolve require() dal
    // node_modules del progetto invece di bundlarle.
    external: ['react', 'react-dom', 'react-dom/server', 'react-helmet-async'],
    logLevel: 'silent',
  });
  return outfile;
}

function stripExistingSeoTags(html, { stripGlobalFaqPage }) {
  let out = html
    .replace(/\s*<title>[^<]*<\/title>/, '')
    .replace(/\s*<meta name="title"[^>]*\/>/, '')
    .replace(/\s*<meta name="description"[^>]*\/>/, '')
    .replace(/\s*<meta name="robots"[^>]*\/>/, '')
    .replace(/\s*<link rel="canonical"[^>]*\/>/, '')
    .replace(/\s*<meta property="og:[^"]*"[^>]*\/>/g, '')
    .replace(/\s*<meta property="twitter:[^"]*"[^>]*\/>/g, '')
    .replace(/\s*<meta name="twitter:[^"]*"[^>]*\/>/g, '');

  if (stripGlobalFaqPage) {
    // Il FAQPage globale (domande generiche sul sito) non deve comparire
    // insieme al FAQPage specifico della pagina sulla stessa URL — Google
    // Rich Results considera ambiguo avere due entità FAQPage sulla stessa
    // pagina. Lo rimuoviamo solo quando la pagina ha già il proprio FAQPage.
    out = out.replace(/\s*<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "FAQPage"[\s\S]*?<\/script>/, '');
  }
  return out;
}

function injectContent(html, contentHtml) {
  return html.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root">${contentHtml}</div>`
  );
}

function main() {
  const entryFile = bundleEntry();
  const { renderSsrPage } = require(entryFile);

  const template = fs.readFileSync(templatePath, 'utf8');
  const report = [];

  for (const { slug, expectTypes } of SSR_PAGES) {
    const { contentHtml, title, meta, link, script } = renderSsrPage(slug);
    const pageOwnFaqPage = /"@type"\s*:\s*"FAQPage"/.test(script);

    let html = stripExistingSeoTags(template, { stripGlobalFaqPage: pageOwnFaqPage });
    // Inserisce i tag Helmet (title/meta/link) subito prima di </head>,
    // e il JSON-LD della pagina subito dopo (rimane comunque dentro <head>).
    html = html.replace('</head>', `${title}\n${meta}\n${link}\n</head>`);
    html = html.replace('</head>', `${script}\n</head>`);
    html = injectContent(html, contentHtml);

    const outPath = path.join(distDir, `${slug}.html`);
    fs.writeFileSync(outPath, html, 'utf8');

    // Validazione strutturale minima: H1 presente, meta description non
    // vuota, ogni @type atteso presente tra i blocchi JSON-LD, JSON valido.
    const hasH1 = /<h1[^>]*>.*?<\/h1>/s.test(contentHtml);
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/);
    const hasDesc = !!descMatch && descMatch[1].trim().length > 0;
    const ldJsonBlocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map(m => m[1]);
    const foundTypes = new Set();
    const jsonErrors = [];
    for (const block of ldJsonBlocks) {
      try {
        const parsed = JSON.parse(block);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
          types.forEach(t => foundTypes.add(t));
          if (types.includes('FAQPage')) {
            if (!Array.isArray(item.mainEntity) || item.mainEntity.length === 0) {
              jsonErrors.push('FAQPage.mainEntity è vuoto o mancante');
            } else {
              item.mainEntity.forEach((q, i) => {
                if (!q.name) jsonErrors.push(`FAQPage.mainEntity[${i}] senza "name"`);
                if (!q.acceptedAnswer || !q.acceptedAnswer.text) jsonErrors.push(`FAQPage.mainEntity[${i}] senza "acceptedAnswer.text"`);
              });
            }
          }
        }
      } catch (e) {
        jsonErrors.push(`JSON-LD non valido: ${e.message}`);
      }
    }
    const missingTypes = expectTypes.filter(t => !foundTypes.has(t));

    report.push({
      slug,
      hasH1,
      hasDesc,
      ldJsonCount: ldJsonBlocks.length,
      missingTypes,
      jsonErrors,
    });
  }

  fs.unlinkSync(entryFile);

  console.log('\n[prerender-ssr-pages] Report validazione:\n');
  let anyError = false;
  for (const r of report) {
    const ok = r.hasH1 && r.hasDesc && r.missingTypes.length === 0 && r.jsonErrors.length === 0;
    const status = ok ? '✓' : '✗';
    if (!ok) anyError = true;
    console.log(`${status} dist/${r.slug}.html — H1:${r.hasH1} desc:${r.hasDesc} ld+json:${r.ldJsonCount} tipi:${[...new Set(r.missingTypes)].length ? 'mancano ' + r.missingTypes.join(',') : 'ok'}`);
    if (r.jsonErrors.length) {
      r.jsonErrors.forEach(e => console.log(`   ⚠️  ${e}`));
    }
  }
  console.log(`\n[prerender-ssr-pages] Generati ${report.length} file HTML con contenuto reale + JSON-LD in dist/`);
  if (anyError) {
    console.error('\n[prerender-ssr-pages] ATTENZIONE: una o più pagine hanno fallito la validazione (vedi sopra).');
    process.exit(1);
  }
}

main();
