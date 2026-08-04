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
    title: 'Team Immobiliare Vomero Napoli | FondoCasa Hub',
    desc: 'Scopri il team FondoCasa Hub: 26 anni di esperienza tra immobiliare, mutui e assicurazioni al Vomero di Napoli. Contattaci per un servizio su misura.',
    canonical: 'https://www.fondocasahub.com/chi-siamo'
  },
  'il-nostro-metodo': {
    title: 'Metodo dei 7 Pilastri per Vendere Casa | FondoCasa Hub',
    desc: 'Vendi casa senza sorprese con il Metodo dei 7 Pilastri: due diligence, marketing dedicato e gestione di mutuo e assicurazione. Scopri come funziona.',
    canonical: 'https://www.fondocasahub.com/il-nostro-metodo'
  },
  'contatti': {
    title: 'Contatti Agenzia Immobiliare Vomero | FondoCasa Hub',
    desc: 'Vieni in Via Pietro Mascagni 35 al Vomero o scrivici: rispondiamo entro 24 ore. Aperti lun-ven 9-19, sab 9-13. Richiedi una consulenza gratuita.',
    canonical: 'https://www.fondocasahub.com/contatti'
  },
  'comincia': {
    title: 'Valutazione Gratuita Immobile Napoli | FondoCasa Hub',
    desc: 'Richiedi la valutazione gratuita del tuo immobile a Napoli: analisi di mercato precisa e risposta entro 24 ore dal team FondoCasa Hub. Inizia subito.',
    canonical: 'https://www.fondocasahub.com/comincia'
  },
  'lavora-con-noi': {
    title: 'Lavora con Noi: Agenti Immobiliari Napoli | FondoCasa Hub',
    desc: 'Cerchi lavoro nel settore immobiliare a Napoli? Candidati come agente, consulente creditizio o assicurativo nel team FondoCasa Hub. Posizioni aperte.',
    canonical: 'https://www.fondocasahub.com/lavora-con-noi'
  },
  'privacy': {
    title: 'Informativa sulla Privacy | FondoCasa Hub',
    desc: "Scopri come FondoCasa Hub tratta i tuoi dati personali nel rispetto del GDPR: raccolta, uso e conservazione delle informazioni. Leggi l'informativa completa.",
    canonical: 'https://www.fondocasahub.com/privacy'
  },
  'cookie': {
    title: 'Cookie Policy del Sito | FondoCasa Hub',
    desc: 'Informazioni sui cookie tecnici e di terze parti utilizzati dal sito fondocasahub.com e su come gestire le tue preferenze. Consulta i dettagli completi.',
    canonical: 'https://www.fondocasahub.com/cookie'
  },
  'note-legali': {
    title: 'Note Legali e Dati Societari | FondoCasa Hub',
    desc: "Informazioni societarie, condizioni d'uso e avvertenze legali di FC Punto Hub Srl, titolare del sito FondoCasa Hub. Consulta tutti i dettagli societari.",
    canonical: 'https://www.fondocasahub.com/note-legali'
  },
  'vomero': {
    title: 'Agenzia Immobiliare Vomero Napoli | FondoCasa Hub',
    desc: 'Compra o vendi casa al Vomero con FondoCasa Hub: 26 anni di esperienza nel quartiere, valutazioni gratuite e consulenza su mutuo e assicurazione. Contattaci.',
    canonical: 'https://www.fondocasahub.com/vomero'
  },
  'posillipo': {
    title: 'Agenzia Immobiliare Posillipo Napoli | FondoCasa Hub',
    desc: 'Vuoi comprare o vendere casa a Posillipo? FondoCasa Hub conosce il mercato locale e offre valutazioni gratuite con consulenza su mutuo e assicurazione.',
    canonical: 'https://www.fondocasahub.com/posillipo'
  },
  'chiaia': {
    title: 'Agenzia Immobiliare Chiaia Napoli | FondoCasa Hub',
    desc: 'FondoCasa Hub segue compravendite immobiliari a Chiaia, Napoli: valutazione gratuita del tuo immobile e assistenza fino al rogito. Richiedi una consulenza.',
    canonical: 'https://www.fondocasahub.com/chiaia'
  },
  'centro-storico': {
    title: 'Agenzia Immobiliare Centro Storico Napoli | FondoCasa Hub',
    desc: 'Acquista o vendi casa nel Centro Storico di Napoli con FondoCasa Hub: consulenza immobiliare, mutuo e assicurazione integrati. Richiedi info gratuite.',
    canonical: 'https://www.fondocasahub.com/centro-storico'
  },
  'blog': {
    title: 'Blog Immobiliare Napoli | FondoCasa Hub',
    desc: 'Guide pratiche su casa, mutui e mercato immobiliare a Napoli: consigli per vendere, comprare o scegliere il quartiere giusto. Leggi gli articoli del blog.',
    canonical: 'https://www.fondocasahub.com/blog'
  },
  'vendi-casa-vomero': {
    title: 'Vendi Casa al Vomero Napoli | FondoCasa Hub',
    desc: 'Vuoi vendere casa al Vomero? FondoCasa Hub offre valutazione gratuita e un piano di marketing dedicato, con 26 anni di esperienza nel quartiere. Contattaci.',
    canonical: 'https://www.fondocasahub.com/vendi-casa-vomero'
  },
  'consulente-mutuo-napoli': {
    title: 'Consulente Mutuo Napoli | FondoCasa Hub',
    desc: 'Confronta il mutuo migliore a Napoli con WeUnit (OAM M28): consulenza gratuita tra 6 banche partner per mutuo prima casa o surroga. Richiedi informazioni.',
    canonical: 'https://www.fondocasahub.com/consulente-mutuo-napoli'
  },
  'costruttori': {
    title: 'Vendi Immobili in Costruzione in Italia | FondoCasa Hub',
    desc: 'Vendi appartamenti in costruzione in tutta Italia senza anticipo: FondoCasa Hub gestisce marketing, prequalifica acquirenti e rogito. Consulenza gratuita.',
    canonical: 'https://www.fondocasahub.com/costruttori'
  },
  'zero-vincoli-60': {
    title: 'Zero Vincoli 60: Vendi Casa in 60 Giorni | FondoCasa Hub',
    desc: "Vendi casa a Napoli in 60 giorni con l'incarico esclusivo Zero Vincoli 60: nessuna penale, massima libertà. Oltre 3.200 famiglie assistite. Scopri di più.",
    canonical: 'https://www.fondocasahub.com/zero-vincoli-60'
  },
  'blog-come-vendere-casa-napoli-guida-completa': {
    title: 'Come Vendere Casa a Napoli: Guida Completa | FondoCasa Hub',
    desc: 'Guida completa per vendere casa a Napoli: preparazione, annuncio, gestione delle visite e chiusura della trattativa. I consigli pratici di FondoCasa Hub.',
    canonical: 'https://www.fondocasahub.com/blog/come-vendere-casa-napoli-guida-completa'
  },
  'blog-tasse-costi-vendita-casa-napoli-2026': {
    title: 'Tasse e Costi per Vendere Casa a Napoli 2026 | FondoCasa Hub',
    desc: "Plusvalenza, imposta di registro, agenzia e notaio: scopri quanto costa davvero vendere casa a Napoli nel 2026 e quanto ti resta in tasca. Leggi l'analisi.",
    canonical: 'https://www.fondocasahub.com/blog/tasse-costi-vendita-casa-napoli-2026'
  },
  'blog-trovare-agente-immobiliare-napoli': {
    title: 'Come Trovare un Agente Immobiliare a Napoli | FondoCasa Hub',
    desc: 'Quali domande fare e cosa controllare per scegliere un agente immobiliare serio a Napoli. La guida di FondoCasa Hub per non sbagliare la scelta giusta.',
    canonical: 'https://www.fondocasahub.com/blog/trovare-agente-immobiliare-napoli'
  },
  'blog-documenti-vendita-immobile-napoli': {
    title: 'Documenti per Vendere Casa a Napoli | FondoCasa Hub',
    desc: "La checklist completa dei documenti necessari per vendere un immobile a Napoli, dal rogito all'APE. Scopri come prepararli con la guida di FondoCasa Hub.",
    canonical: 'https://www.fondocasahub.com/blog/documenti-vendita-immobile-napoli'
  },
  'blog-tassi-bce-giugno-2026-mutui': {
    title: "Tassi BCE 2026: Effetto sui Mutui a Napoli | FondoCasa Hub",
    desc: "Come l'aumento dei tassi BCE di giugno 2026 impatta le rate dei mutui a Napoli. Analisi e consigli pratici del team FondoCasa Hub per orientarti meglio.",
    canonical: 'https://www.fondocasahub.com/blog/tassi-bce-giugno-2026-mutui'
  },
  'blog-prezzi-case-napoli-2026': {
    title: 'Prezzi delle Case a Napoli nel 2026 | FondoCasa Hub',
    desc: 'Analisi aggiornata dei prezzi al metro quadro per quartiere a Napoli: Vomero, Chiaia, Posillipo e non solo. Scopri i valori di mercato con FondoCasa Hub.',
    canonical: 'https://www.fondocasahub.com/blog/prezzi-case-napoli-2026'
  },
  'blog-valutazione-immobile-napoli': {
    title: 'Come si Valuta un Immobile a Napoli | FondoCasa Hub',
    desc: "Comparativo di mercato, stato dell'immobile e altri criteri: scopri come viene calcolato il valore di una casa a Napoli con la guida di FondoCasa Hub.",
    canonical: 'https://www.fondocasahub.com/blog/valutazione-immobile-napoli'
  },
  'blog-acquisto-prima-casa-napoli-guida': {
    title: 'Comprare la Prima Casa a Napoli: Guida 2026 | FondoCasa Hub',
    desc: 'Dalla ricerca al rogito: tutto quello che devi sapere per comprare la prima casa a Napoli. La guida passo dopo passo di FondoCasa Hub per non sbagliare.',
    canonical: 'https://www.fondocasahub.com/blog/acquisto-prima-casa-napoli-guida'
  },
  'blog-agenzia-immobiliare-napoli-come-scegliere': {
    title: "Scegliere l'Agenzia Immobiliare a Napoli | FondoCasa Hub",
    desc: "I 7 criteri per scegliere l'agenzia immobiliare giusta a Napoli: esperienza, trasparenza e servizi integrati. Scopri come valutarli con FondoCasa Hub.",
    canonical: 'https://www.fondocasahub.com/blog/agenzia-immobiliare-napoli-come-scegliere'
  },
  'blog-come-vendere-casa-napoli': {
    title: 'Vendere Casa a Napoli: la Guida Pratica | FondoCasa Hub',
    desc: 'Documentazione, valutazione, marketing e negoziazione: gli aspetti pratici per vendere casa a Napoli spiegati passo dopo passo dal team FondoCasa Hub.',
    canonical: 'https://www.fondocasahub.com/blog/come-vendere-casa-napoli'
  },
  'blog-mutuo-prima-casa-napoli': {
    title: 'Mutuo Prima Casa a Napoli: la Guida | FondoCasa Hub',
    desc: 'Tassi, requisiti e documenti per ottenere il mutuo prima casa a Napoli. La guida aggiornata di WeUnit e FondoCasa Hub per scegliere la banca giusta.',
    canonical: 'https://www.fondocasahub.com/blog/mutuo-prima-casa-napoli'
  },
  'blog-migliori-quartieri-abitare-napoli': {
    title: 'Migliori Quartieri dove Abitare a Napoli | FondoCasa Hub',
    desc: 'Vomero, Posillipo, Chiaia o Centro Storico? Confronto tra i quartieri di Napoli per qualità della vita. Scopri quale scegliere con la guida di FondoCasa Hub.',
    canonical: 'https://www.fondocasahub.com/blog/migliori-quartieri-abitare-napoli'
  },
  'blog-vendere-casa-senza-agenzia-napoli': {
    title: 'Vendere Casa senza Agenzia a Napoli | FondoCasa Hub',
    desc: "Vendita privata o tramite agenzia? Costi, rischi e opportunità per chi vuole vendere casa a Napoli senza intermediari. Leggi l'analisi di FondoCasa Hub.",
    canonical: 'https://www.fondocasahub.com/blog/vendere-casa-senza-agenzia-napoli'
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
