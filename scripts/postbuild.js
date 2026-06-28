// scripts/postbuild.js  (ES Module — package.json ha "type": "module")
// Genera un file HTML statico per ogni route SEO con i meta tag corretti.
// Viene eseguito automaticamente dopo "npm run build" (script postbuild).
// Vercel serve questi file staticamente dal CDN — nessuna Lambda necessaria.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PAGE_META = {
  'chi-siamo': {
    title: 'Chi Siamo | HUB Napoli – Fondocasa, WeUnit, Henia',
    desc: 'Scopri il team di HUB Napoli: 26 anni di esperienza immobiliare, creditizia e assicurativa al Vomero. FC Punto Hub Srl – professionisti della casa a Napoli.',
    canonical: 'https://www.fondocasahub.com/chi-siamo'
  },
  'il-nostro-metodo': {
    title: 'Il Metodo dei 7 Pilastri | HUB Agenzia Immobiliare Napoli',
    desc: 'Il metodo HUB in 7 pilastri per vendere o comprare casa a Napoli senza sorprese. Due diligence, marketing dedicato, mutuo e assicurazione integrati.',
    canonical: 'https://www.fondocasahub.com/il-nostro-metodo'
  },
  'contatti': {
    title: 'Contatti | HUB Napoli – Via Pietro Mascagni 35, Vomero',
    desc: 'Contatta HUB Napoli: Via Pietro Mascagni 35, Vomero. Tel. 081 18653202. Aperto lun-ven 9-19, sab 9-13. Richiedi una valutazione gratuita.',
    canonical: 'https://www.fondocasahub.com/contatti'
  },
  'comincia': {
    title: 'Comincia da Qui | HUB – Valutazione Gratuita Immobile Napoli',
    desc: 'Richiedi una valutazione gratuita del tuo immobile a Napoli. HUB ti risponde entro 24h con una stima precisa basata sul mercato locale.',
    canonical: 'https://www.fondocasahub.com/comincia'
  },
  'lavora-con-noi': {
    title: 'Lavora con Noi | HUB Napoli – Agenti Immobiliari',
    desc: 'Unisciti al team HUB Napoli. Cerchiamo agenti immobiliari, consulenti creditizi e assicurativi con passione per il cliente. Candidati ora.',
    canonical: 'https://www.fondocasahub.com/lavora-con-noi'
  },
  'vomero': {
    title: 'Agenzia Immobiliare Vomero Napoli | HUB – Compravendita e Mutui',
    desc: 'HUB è la tua agenzia immobiliare di riferimento al Vomero di Napoli. Compravendita, mutui e assicurazioni. Via Pietro Mascagni 35 – da 26 anni nel quartiere.',
    canonical: 'https://www.fondocasahub.com/vomero'
  },
  'posillipo': {
    title: 'Agenzia Immobiliare Posillipo Napoli | HUB',
    desc: 'Compra o vendi casa a Posillipo con HUB. Esperienza, conoscenza del mercato locale e servizio integrato immobiliare-mutuo-assicurazione a Napoli.',
    canonical: 'https://www.fondocasahub.com/posillipo'
  },
  'chiaia': {
    title: 'Agenzia Immobiliare Chiaia Napoli | HUB',
    desc: 'HUB segue compravendite immobiliari nel quartiere Chiaia di Napoli. Contattaci per una valutazione gratuita del tuo immobile a Chiaia.',
    canonical: 'https://www.fondocasahub.com/chiaia'
  },
  'centro-storico': {
    title: 'Agenzia Immobiliare Centro Storico Napoli | HUB',
    desc: 'Acquista o vendi casa nel Centro Storico di Napoli con HUB. Consulenza immobiliare, mediazione creditizia e assicurazioni nella Napoli UNESCO.',
    canonical: 'https://www.fondocasahub.com/centro-storico'
  },
  'blog': {
    title: 'Blog Immobiliare Napoli | Consigli su Casa, Mutui, Mercato – HUB',
    desc: 'Articoli e guide pratiche sul mercato immobiliare di Napoli: come vendere casa, ottenere un mutuo, scegliere il quartiere e molto altro da HUB.',
    canonical: 'https://www.fondocasahub.com/blog'
  },
  'vendi-casa-vomero': {
    title: 'Vendi Casa al Vomero Napoli | Valutazione Gratuita | FondoCasa Hub',
    desc: 'Vuoi vendere casa al Vomero a Napoli? FondoCasa Hub offre valutazione gratuita, piano marketing dedicato e oltre 26 anni di esperienza. Contattaci ora.',
    canonical: 'https://www.fondocasahub.com/vendi-casa-vomero'
  },
  'consulente-mutuo-napoli': {
    title: 'Consulente Mutuo Napoli | WeUnit - Mediazione Creditizia OAM M28',
    desc: 'Cerchi un consulente mutuo a Napoli? WeUnit (OAM M28) ti affianca nella scelta del mutuo migliore tra 6 banche partner. Consulenza gratuita. Contattaci.',
    canonical: 'https://www.fondocasahub.com/consulente-mutuo-napoli'
  },
  'costruttori': {
    title: 'Vendi Immobili in Costruzione in Tutta Italia | FondoCasa Hub – Divisione Cantieri',
    desc: 'Vendi immobili in costruzione in tutta Italia senza anticipo e senza rischio. FondoCasa Hub – Divisione Cantieri opera su grandi cantieri in ogni regione: marketing avanzato, prequalifica acquirenti e gestione fino al rogito. Metodo ZERCOSS. Consulenza gratuita.',
    canonical: 'https://www.fondocasahub.com/costruttori'
  }
};

const distDir = path.join(__dirname, '..', 'dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('[postbuild] ERRORE: dist/index.html non trovato.');
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');
let count = 0;

for (const [slug, meta] of Object.entries(PAGE_META)) {
  const html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/g, `$1${meta.desc}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/g, `$1${meta.canonical}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/g, `$1${meta.title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/g, `$1${meta.desc}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/g, `$1${meta.canonical}$2`)
    .replace(/(<meta property="twitter:url" content=")[^"]*(")/g, `$1${meta.canonical}$2`)
    .replace(/(<meta property="twitter:title" content=")[^"]*(")/g, `$1${meta.title}$2`)
    .replace(/(<meta property="twitter:description" content=")[^"]*(")/g, `$1${meta.desc}$2`);

  const outPath = path.join(distDir, `${slug}.html`);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`[postbuild] ✓ dist/${slug}.html — ${meta.title}`);
  count++;
}

console.log(`[postbuild] Generati ${count} file HTML statici in dist/`);
