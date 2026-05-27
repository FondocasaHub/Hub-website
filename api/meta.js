// Vercel Serverless Function — inietta meta tag corretti per ogni route React
// Chiamata da vercel.json come beforeFiles rewrite

const PAGE_META = {
  '/': {
    title: 'HUB | Agenzia Immobiliare, Mutui e Assicurazioni a Napoli',
    desc: 'HUB Napoli: agenzia immobiliare, mediazione creditizia e consulenza assicurativa integrata. 26 anni al Vomero, Posillipo, Chiaia e tutta Napoli.',
    canonical: 'https://www.fondocasahub.com/'
  },
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

module.exports = async (req, res) => {
  const path = req.url.split('?')[0];
  const meta = PAGE_META[path] || PAGE_META['/'];

  // Leggi index.html dal filesystem
  const fs = require('fs');
  const fsPath = require('path').join(process.cwd(), 'dist', 'index.html');

  let html;
  try {
    html = fs.readFileSync(fsPath, 'utf8');
  } catch {
    res.status(500).send('index.html not found');
    return;
  }

  // Sostituisci title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${meta.title}</title>`
  );

  // Sostituisci meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${meta.desc}"`
  );

  // Sostituisci canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${meta.canonical}"`
  );

  // Sostituisci og:title
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${meta.title}"`
  );

  // Sostituisci og:description
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${meta.desc}"`
  );

  // Sostituisci og:url
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${meta.canonical}"`
  );

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(html);
};
