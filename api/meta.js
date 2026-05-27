// Vercel Serverless Function — inietta meta tag SEO corretti per ogni route React
// Legge dist/index.html (incluso nel bundle via includeFiles in vercel.json)

const fs = require('fs');
const path = require('path');

const PAGE_META = {
  '/chi-siamo': {
    title: 'Chi Siamo | HUB Napoli – Fondocasa, WeUnit, Henia',
    desc: 'Scopri il team di HUB Napoli: 26 anni di esperienza immobiliare, creditizia e assicurativa al Vomero. FC Punto Hub Srl – professionisti della casa a Napoli.',
    canonical: 'https://www.fondocasahub.com/chi-siamo'
  },
  '/il-nostro-metodo': {
    title: 'Il Metodo dei 7 Pilastri | HUB Agenzia Immobiliare Napoli',
    desc: 'Il metodo HUB in 7 pilastri per vendere o comprare casa a Napoli senza sorprese. Due diligence, marketing dedicato, mutuo e assicurazione integrati.',
    canonical: 'https://www.fondocasahub.com/il-nostro-metodo'
  },
  '/contatti': {
    title: 'Contatti | HUB Napoli – Via Pietro Mascagni 35, Vomero',
    desc: 'Contatta HUB Napoli: Via Pietro Mascagni 35, Vomero. Tel. 081 18653202. Aperto lun-ven 9-19, sab 9-13. Richiedi una valutazione gratuita.',
    canonical: 'https://www.fondocasahub.com/contatti'
  },
  '/comincia': {
    title: 'Comincia da Qui | HUB – Valutazione Gratuita Immobile Napoli',
    desc: 'Richiedi una valutazione gratuita del tuo immobile a Napoli. HUB ti risponde entro 24h con una stima precisa basata sul mercato locale.',
    canonical: 'https://www.fondocasahub.com/comincia'
  },
  '/lavora-con-noi': {
    title: 'Lavora con Noi | HUB Napoli – Agenti Immobiliari',
    desc: 'Unisciti al team HUB Napoli. Cerchiamo agenti immobiliari, consulenti creditizi e assicurativi con passione per il cliente. Candidati ora.',
    canonical: 'https://www.fondocasahub.com/lavora-con-noi'
  },
  '/vomero': {
    title: 'Agenzia Immobiliare Vomero Napoli | HUB – Compravendita e Mutui',
    desc: 'HUB è la tua agenzia immobiliare di riferimento al Vomero di Napoli. Compravendita, mutui e assicurazioni. Via Pietro Mascagni 35 – da 26 anni nel quartiere.',
    canonical: 'https://www.fondocasahub.com/vomero'
  },
  '/posillipo': {
    title: 'Agenzia Immobiliare Posillipo Napoli | HUB',
    desc: 'Compra o vendi casa a Posillipo con HUB. Esperienza, conoscenza del mercato locale e servizio integrato immobiliare-mutuo-assicurazione a Napoli.',
    canonical: 'https://www.fondocasahub.com/posillipo'
  },
  '/chiaia': {
    title: 'Agenzia Immobiliare Chiaia Napoli | HUB',
    desc: 'HUB segue compravendite immobiliari nel quartiere Chiaia di Napoli. Contattaci per una valutazione gratuita del tuo immobile a Chiaia.',
    canonical: 'https://www.fondocasahub.com/chiaia'
  },
  '/centro-storico': {
    title: 'Agenzia Immobiliare Centro Storico Napoli | HUB',
    desc: 'Acquista o vendi casa nel Centro Storico di Napoli con HUB. Consulenza immobiliare, mediazione creditizia e assicurazioni nella Napoli UNESCO.',
    canonical: 'https://www.fondocasahub.com/centro-storico'
  },
  '/blog': {
    title: 'Blog Immobiliare Napoli | Consigli su Casa, Mutui, Mercato – HUB',
    desc: 'Articoli e guide pratiche sul mercato immobiliare di Napoli: come vendere casa, ottenere un mutuo, scegliere il quartiere e molto altro da HUB.',
    canonical: 'https://www.fondocasahub.com/blog'
  }
};

// Legge il template HTML dal dist/ incluso nel bundle della funzione
let templateHtml = null;
function getTemplate() {
  if (templateHtml) return templateHtml;
  // Vercel include il file in process.cwd()/dist/index.html grazie a includeFiles
  const candidates = [
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(__dirname, '..', 'dist', 'index.html'),
    path.join(__dirname, 'dist', 'index.html'),
  ];
  for (const p of candidates) {
    try {
      templateHtml = fs.readFileSync(p, 'utf8');
      console.log('[meta.js] Template loaded from:', p);
      return templateHtml;
    } catch (_) { /* try next */ }
  }
  throw new Error('Template index.html not found in any candidate path');
}

module.exports = async (req, res) => {
  const urlPath = req.url.split('?')[0];
  const meta = PAGE_META[urlPath];

  if (!meta) {
    res.writeHead(302, { Location: '/' });
    res.end();
    return;
  }

  try {
    const html = getTemplate();

    const modified = html
      .replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`)
      .replace(/(<meta name="description" content=")[^"]*(")/g, `$1${meta.desc}$2`)
      .replace(/(<link rel="canonical" href=")[^"]*(")/g, `$1${meta.canonical}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/g, `$1${meta.title}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/g, `$1${meta.desc}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/g, `$1${meta.canonical}$2`)
      .replace(/(<meta property="twitter:url" content=")[^"]*(")/g, `$1${meta.canonical}$2`)
      .replace(/(<meta property="twitter:title" content=")[^"]*(")/g, `$1${meta.title}$2`)
      .replace(/(<meta property="twitter:description" content=")[^"]*(")/g, `$1${meta.desc}$2`);

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      'X-Meta-Injected': 'true'
    });
    res.end(modified);

  } catch (err) {
    console.error('[meta.js] Error:', err.message);
    // Fallback: serve index.html statico senza modifiche
    res.writeHead(302, { Location: '/' });
    res.end();
  }
};
